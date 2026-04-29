from backend.agents.base_agent import BaseAgent
from backend.models import IPMOutput

class IntentAgent(BaseAgent):
    def __init__(self):
        # Setting domain for IPM isn't strictly necessary since it identifies it, but good practice.
        super().__init__(name="IntentAgent", response_model=IPMOutput)
        self.domain = "general"

    def _get_system_prompt(self) -> str:
        return """You are the specialized Intent Processing Module (IPM).
Your task is to analyze the patient report and determine:
1. The medical_domain (e.g., 'cardio', 'neuro', 'general'). MUST output a string.
2. The urgency_level: 'low', 'medium', 'high', or 'critical'.
3. The task_type: 'diagnosis', 'treatment', 'emergency', or 'general'.
4. Key extracted medical entities.

Return ONLY the structured format requested.
"""
