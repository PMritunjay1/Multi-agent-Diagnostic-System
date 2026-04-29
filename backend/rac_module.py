import logging
from typing import Dict, Any
from backend.models import RACOutput, AgentResponse

logger = logging.getLogger("RAC_Module")

class RACModule:
    def __init__(self):
        pass

    def _calculate_agreement(self, agent_results: Dict[str, dict]) -> float:
        # Extract the primary diagnosis string if available
        diag_output = agent_results.get("diagnosis", {})
        if not diag_output:
            return 1.0 # If no diagnosis, default agreement

        primary_diagnosis = diag_output.get("primary_diagnosis", "").lower()
        if not primary_diagnosis:
            return 1.0

        # Create a set of keywords from the primary diagnosis
        diag_keywords = set(primary_diagnosis.replace(",", "").split())

        total_agents = len(agent_results)
        agreeing_agents = 1 # Diagnosis agrees with itself

        for agent_name, output_dict in agent_results.items():
            if agent_name == "diagnosis":
                continue
            
            # Substring/keyword presence proxy for agreement
            output_str = str(output_dict).lower()
            overlap = any(kw in output_str for kw in diag_keywords if len(kw) > 3)
            
            if overlap:
                agreeing_agents += 1
                
        return agreeing_agents / total_agents

    def evaluate(self, agent_results: Dict[str, AgentResponse]) -> RACOutput:
        """
        Mathematically evaluates agreement and scales confidences securely.
        """
        # Convert Pydantic objects to dicts for processing
        parsed_results = {}
        for name, resp in agent_results.items():
            if resp.output:
                parsed_results[name] = resp.output.model_dump()
        
        # 1. Agreement Score
        agreement_score = self._calculate_agreement(parsed_results)
        
        # 2. Conflict Penalty
        conflict_penalty = 1.0 - agreement_score
        
        # 3. Adjusted Confidence
        adjusted_conf_map = {}
        for name, resp in agent_results.items():
            if not resp.output:
                continue
                
            base_conf = 0.0
            if "confidence" in resp.output.model_fields:
                base_conf = getattr(resp.output, "confidence", 0.0)
            else:
                # If agent doesn't natively output confidence, assume 0.8 as a baseline
                base_conf = 0.8

            adjusted_conf = base_conf * agreement_score * (1.0 - (conflict_penalty * 0.5))
            
            # Penalize generic diagnoses natively from RAC
            output_str = str(resp.output.model_dump()).lower()
            generic_terms = ["unspecified", "syndrome", "unknown", "idiopathic"]
            if any(gt in output_str for gt in generic_terms):
                adjusted_conf -= 0.15
                
            # Clamp between 0.6 and 0.95 natively
            adjusted_conf = max(0.6, min(0.95, adjusted_conf))
            adjusted_conf_map[name] = adjusted_conf
            
        logger.info(f"RAC computed agreement: {agreement_score:.2f}, penalty: {conflict_penalty:.2f}")

        return RACOutput(
            agreement_score=agreement_score,
            conflict_penalty=conflict_penalty,
            adjusted_confidence_map=adjusted_conf_map
        )
