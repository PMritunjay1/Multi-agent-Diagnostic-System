from backend.agents.base_agent import BaseAgent
from backend.models import TreatmentOutput

class TreatmentAgent(BaseAgent):
    def __init__(self, domain: str = "general"):
        super().__init__(name="TreatmentAgent", response_model=TreatmentOutput, domain=domain)

    def _get_system_prompt(self) -> str:
        return """You are a Medical Treatment & Triage Specialist.
Your task is to formulate a concrete action plan and suggest treatments based on the raw patient findings, regardless of the exact final diagnosis.
1. Suggest specific recommended actions or lifestyle modifications.
2. List generic classes or specific medications that might be indicated.
3. Recommend an appropriate specialist for follow-up (e.g., Cardiologist, Neurologist), if necessary.

Keep the recommendations practical and concise.
"""
