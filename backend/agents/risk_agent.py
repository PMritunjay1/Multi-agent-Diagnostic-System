from backend.agents.base_agent import BaseAgent
from backend.models import RiskOutput

class RiskAgent(BaseAgent):
    def __init__(self, domain: str = "general"):
        super().__init__(name="RiskAgent", response_model=RiskOutput, domain=domain)

    def _get_system_prompt(self) -> str:
        return """You are a Critical Care Risk Assessor.
Your task is to evaluate the patient case for immediate life-threatening conditions, chronic risk factors, and differential risks.
1. Assign a risk_level: "Low", "Medium", "High", or "Critical".
2. List any critical flags (e.g., impending airway compromise, suspected myocardial infarction, high sepsis risk).
3. Provide a brief explanation for why this risk level was assigned.

Always index heavily on safety and triage urgency.
"""
