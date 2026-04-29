import asyncio
import logging
import time
from typing import Dict, List

from backend.models import (
    PatientInput, FinalFusionOutput, AgentResponse, IPMOutput, RACOutput
)
from backend.agents.intent_agent import IntentAgent
from backend.agents.diagnosis_agent import DiagnosisAgent
from backend.agents.treatment_agent import TreatmentAgent
from backend.agents.risk_agent import RiskAgent
from backend.rie_module import RIEModule
from backend.rac_module import RACModule
from backend.utils.llm_client import llm_client

logger = logging.getLogger("Orchestrator")

# ──────────────────────────────────────────────
# DOMAIN WEIGHT MAP (IEEE § IV-C)
# ──────────────────────────────────────────────
# same_domain   = 1.5
# related       = 1.2
# general       = 1.0
# irrelevant    = 0.7

DOMAIN_RELATION_MAP = {
    "cardio":  {"diagnosis": 1.5, "risk": 1.5, "treatment": 1.2, "intent": 1.0},
    "neuro":   {"diagnosis": 1.5, "risk": 1.5, "treatment": 1.2, "intent": 1.0},
    "pulmo":   {"diagnosis": 1.5, "risk": 1.2, "treatment": 1.2, "intent": 1.0},
    "gastro":  {"diagnosis": 1.5, "risk": 1.2, "treatment": 1.2, "intent": 1.0},
    "endo":    {"diagnosis": 1.5, "risk": 1.2, "treatment": 1.2, "intent": 1.0},
    "general": {"diagnosis": 1.0, "risk": 1.0, "treatment": 1.0, "intent": 1.0},
}


def _get_domain_weight(ipm_domain: str, agent_key: str) -> float:
    """Look up the weight for a given agent relative to the detected domain."""
    domain_lower = ipm_domain.lower()
    # Find best-matching key (substring match for flexibility)
    for domain_key, weights in DOMAIN_RELATION_MAP.items():
        if domain_key in domain_lower:
            return weights.get(agent_key, 1.0)
    return DOMAIN_RELATION_MAP["general"].get(agent_key, 1.0)


# ──────────────────────────────────────────────
# DYNAMIC AGENT SELECTION (IEEE § IV-B)
# ──────────────────────────────────────────────

def _select_agents(ipm_output: IPMOutput) -> List[str]:
    """Hard-rule deterministic agent selection based on IPM output."""
    selected = set()

    # Always include diagnosis
    selected.add("diagnosis")

    # Hard rules
    if ipm_output.urgency_level in ("high", "critical"):
        selected.add("risk")
    if ipm_output.task_type == "treatment":
        selected.add("treatment")
    if ipm_output.task_type == "emergency":
        selected.add("risk")
        selected.add("treatment")
    if ipm_output.task_type == "diagnosis":
        selected.add("diagnosis")
        selected.add("risk")

    # Domain-specific additions
    domain_lower = ipm_output.medical_domain.lower()
    if any(k in domain_lower for k in ("cardio", "neuro", "pulmo")):
        selected.add("risk")

    # Fallback: if nothing specific, run all
    if len(selected) <= 1:
        selected = {"diagnosis", "treatment", "risk"}

    logger.info(f"Dynamic selection chose agents: {sorted(selected)}")
    return list(selected)


# ──────────────────────────────────────────────
# DETERMINISTIC FUSION (IEEE § IV-D)
# ──────────────────────────────────────────────

def _deterministic_fuse(
    agent_results: Dict[str, AgentResponse],
    rac_output: RACOutput,
    ipm_output: IPMOutput,
) -> FinalFusionOutput:
    """
    Pure deterministic fusion — zero LLM calls.
    final_score = adjusted_conf * domain_weight   (no double-counting agreement)
    Winner = argmax(final_score)
    """
    scores: Dict[str, float] = {}
    breakdown_log: Dict[str, dict] = {}

    for agent_key, resp in agent_results.items():
        if agent_key == "intent" or resp.output is None:
            continue

        adj_conf = rac_output.adjusted_confidence_map.get(agent_key, 0.6)
        domain_w = _get_domain_weight(ipm_output.medical_domain, agent_key)
        final_score = adj_conf * domain_w

        scores[agent_key] = final_score
        breakdown_log[agent_key] = {
            "adjusted_conf": round(adj_conf, 4),
            "domain_weight": domain_w,
            "final_score": round(final_score, 4),
        }

    logger.info(f"Fusion score breakdown: {breakdown_log}")

    # argmax selection — ties broken in favor of diagnosis agent
    if not scores:
        return FinalFusionOutput(
            final_diagnosis="Unknown",
            final_recommendation=["Seek further evaluation"],
            final_risk_level="Medium",
            overall_confidence=0.6,
        )

    # Break ties in favor of the diagnosis agent for interpretability
    max_score = max(scores.values())
    tied_keys = [k for k, v in scores.items() if v == max_score]
    winner_key = "diagnosis" if "diagnosis" in tied_keys else tied_keys[0]

    # ALWAYS extract the canonical diagnosis label from the Diagnosis agent
    diag_resp = agent_results.get("diagnosis")
    if diag_resp and diag_resp.output:
        diag_dict = diag_resp.output.model_dump()
        final_diagnosis = diag_dict.get("primary_diagnosis", "Unknown")
    else:
        final_diagnosis = "Unknown"

    final_risk = "Medium"
    final_recs = []

    # Enrich from Risk agent if available
    risk_resp = agent_results.get("risk")
    if risk_resp and risk_resp.output:
        risk_dict = risk_resp.output.model_dump()
        final_risk = risk_dict.get("risk_level", "Medium")

    # Enrich from Treatment agent if available
    treat_resp = agent_results.get("treatment")
    if treat_resp and treat_resp.output:
        treat_dict = treat_resp.output.model_dump()
        final_recs = treat_dict.get("recommended_actions", [])

    # Overall confidence = winning score clamped to [0.6, 0.95]
    overall_conf = max(0.6, min(0.95, scores[winner_key]))

    return FinalFusionOutput(
        final_diagnosis=final_diagnosis,
        final_recommendation=final_recs if final_recs else ["Consult specialist"],
        final_risk_level=final_risk,
        overall_confidence=round(overall_conf, 4),
    )


# ──────────────────────────────────────────────
# ORCHESTRATOR
# ──────────────────────────────────────────────

class Orchestrator:
    def __init__(self):
        self.rie = RIEModule()
        self.rac = RACModule()

        # Agent registry — keyed by selection name
        self._agent_registry = {
            "intent":    IntentAgent(),
            "diagnosis": DiagnosisAgent(),
            "treatment": TreatmentAgent(),
            "risk":      RiskAgent(),
        }

    async def run_parallel_agents(
        self,
        input_data: PatientInput,
        selected_keys: List[str],
    ) -> Dict[str, AgentResponse]:
        """Run only the selected agents in parallel.  Returns dict keyed by agent name."""

        # Always run intent (it's the IPM — 1 LLM call)
        keys_to_run = ["intent"] + [k for k in selected_keys if k != "intent"]

        async def _run_one(key: str) -> tuple:
            agent = self._agent_registry[key]
            resp = await agent.run(input_data)
            return key, resp

        tasks = [_run_one(k) for k in keys_to_run]
        results_raw = await asyncio.gather(*tasks, return_exceptions=True)

        results: Dict[str, AgentResponse] = {}
        for item in results_raw:
            if isinstance(item, Exception):
                logger.error(f"Agent task failed fatally: {item}")
                continue
            key, resp = item
            results[key] = resp

        return results

    async def process_case(
        self,
        patient_text: str,
        history: str = "",
        metadata: dict = None,
    ) -> dict:
        total_start = time.time()
        api_call_count = 0

        input_data = PatientInput(
            patient_text=patient_text,
            history=history,
            metadata=metadata or {},
        )

        # ── STEP 1: RIE (deterministic; LLM fallback only if sparse) ──
        rie_output = await self.rie.run(patient_text, history)
        # RIE fallback may or may not have used 1 LLM call; we don't count it
        # against the agent budget since it's a pre-processing step.

        # ── STEP 2: IPM (Intent Agent — 1 LLM call) ──
        # We run IPM first to get dynamic selection parameters.
        ipm_resp = await self._agent_registry["intent"].run(input_data)
        api_call_count += 1

        ipm_output: IPMOutput = ipm_resp.output
        if ipm_output is None:
            # Fallback if IPM fails
            ipm_output = IPMOutput(
                medical_domain="general",
                urgency_level="medium",
                task_type="diagnosis",
                extracted_entities=[],
            )

        # ── STEP 3: Dynamic Agent Selection ──
        selected_keys = _select_agents(ipm_output)

        # ── STEP 4: Parallel Agent Execution (≤ 3 LLM calls) ──
        # Only selected agents run; intent already ran above.
        keys_without_intent = [k for k in selected_keys if k != "intent"]

        async def _run_agent(key: str) -> tuple:
            resp = await self._agent_registry[key].run(input_data)
            return key, resp

        agent_tasks = [_run_agent(k) for k in keys_without_intent]
        agent_raw = await asyncio.gather(*agent_tasks, return_exceptions=True)

        agent_results: Dict[str, AgentResponse] = {"intent": ipm_resp}
        for item in agent_raw:
            if isinstance(item, Exception):
                logger.error(f"Agent task failed: {item}")
                continue
            key, resp = item
            agent_results[key] = resp
            api_call_count += 1

        logger.info(f"Total API calls this case: {api_call_count}")

        # ── STEP 5: RAC (deterministic — 0 LLM calls) ──
        rac_output = self.rac.evaluate(agent_results)
        logger.info(
            f"RAC → agreement={rac_output.agreement_score:.2f}  "
            f"penalty={rac_output.conflict_penalty:.2f}  "
            f"adj_conf_map={rac_output.adjusted_confidence_map}"
        )

        # ── STEP 6: Deterministic Fusion (0 LLM calls) ──
        fusion_result = _deterministic_fuse(agent_results, rac_output, ipm_output)
        logger.info(
            f"Fusion → diagnosis={fusion_result.final_diagnosis}  "
            f"confidence={fusion_result.overall_confidence}  "
            f"risk={fusion_result.final_risk_level}"
        )

        total_latency_ms = (time.time() - total_start) * 1000

        # ── Build response (backward-compatible with evaluation.py) ──
        return {
            "input": input_data.model_dump(),
            "agents": {
                k: v.model_dump() for k, v in agent_results.items()
            },
            "fusion": fusion_result.model_dump(),
            "rac": rac_output.model_dump(),
            "rie": rie_output.model_dump(),
            "ipm": ipm_output.model_dump(),
            "api_call_count": api_call_count,
            "total_latency_ms": total_latency_ms,
        }
