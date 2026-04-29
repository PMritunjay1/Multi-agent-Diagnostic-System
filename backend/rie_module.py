import re
import logging
from backend.models import RIEOutput
from backend.utils.llm_client import llm_client

logger = logging.getLogger("RIE_Module")

# Simple dictionary for deterministic extraction (Tier 1)
SYMPTOM_KEYWORDS = [
    "pain", "sweating", "anxiety", "hyperventilation", "nausea",
    "headache", "fever", "stiffness", "wheezing", "shortness of breath",
    "crackles", "swelling", "blood", "weight loss", "confusion", "memory loss",
    "cough", "fatigue", "palpitations", "blurred vision", "cramps", "diarrhea"
]
HISTORY_KEYWORDS = [
    "smoker", "hypertension", "diabetic", "asthma", "obese",
    "cardiac history", "allergy", "alcohol", "autoimmune"
]
RISK_KEYWORDS = [
    "hypertension", "smoker", "obese", "alcohol", "elderly"
]

class RIEModule:
    def __init__(self, threshold: int = 2):
        self.threshold = threshold

    def _deterministic_extract(self, text: str, dictionary: list) -> list:
        # Case insensitive exact-ish substring search
        text_lower = text.lower()
        extracted = []
        for kw in dictionary:
            if kw in text_lower:
                extracted.append(kw)
        return extracted

    async def _fallback_llm_extract(self, text: str, history: str) -> RIEOutput:
        logger.warning(f"Low extraction density in Tier 1. Triggering LLM Fallback (Tier 2).")
        system_prompt = """You are a highly deterministic Medical Data Extractor.
Extract the symptoms, medical history, risk factors, and key findings from the raw text. Ensure NO hallucination."""
        user_content = f"Patient Text: {text}\nHistory: {history}"
        
        response = await llm_client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            response_format=RIEOutput,
            temperature=0.0
        )
        return response.choices[0].message.parsed

    async def run(self, patient_text: str, history: str) -> RIEOutput:
        # Tier 1 extraction
        combined_text = patient_text + " " + history
        symptoms = self._deterministic_extract(combined_text, SYMPTOM_KEYWORDS)
        med_history = self._deterministic_extract(history, HISTORY_KEYWORDS)
        risks = self._deterministic_extract(combined_text, RISK_KEYWORDS)
        
        total_extracted = len(symptoms) + len(med_history) + len(risks)
        
        # Tier 2 Fallback
        if total_extracted < self.threshold:
            return await self._fallback_llm_extract(patient_text, history)
            
        return RIEOutput(
            symptoms=symptoms,
            medical_history=med_history,
            risk_factors=risks,
            key_findings=[]
        )
