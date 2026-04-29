from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal

class RIEOutput(BaseModel):
    symptoms: List[str] = Field(default_factory=list, description="Extracted symptoms.")
    medical_history: List[str] = Field(default_factory=list, description="Extracted past medical history.")
    risk_factors: List[str] = Field(default_factory=list, description="Extracted risk factors.")
    key_findings: List[str] = Field(default_factory=list, description="Other key clinical findings.")

class IPMOutput(BaseModel):
    medical_domain: str = Field(..., description="E.g., Cardiology, Neurology, General, etc.")
    urgency_level: Literal["low", "medium", "high", "critical"] = Field(..., description="Urgency of the case.")
    task_type: Literal["diagnosis", "treatment", "emergency", "general"] = Field(..., description="Action required.")
    extracted_entities: List[str] = Field(default_factory=list, description="Key extracted entities from intent fallback.")

class RACOutput(BaseModel):
    agreement_score: float = Field(..., description="Ratio of agreement.")
    conflict_penalty: float = Field(..., description="Penalty applied due to conflict.")
    adjusted_confidence_map: Dict[str, float] = Field(..., description="Adjusted confidence per agent.")

class PatientInput(BaseModel):
    patient_text: str = Field(..., description="The main clinical report or narrative.")
    history: str = Field(..., description="Patient medical history and background.")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Optional metadata like age, sex, etc.")

class IntentOutput(BaseModel):
    primary_intent: str = Field(..., description="The main intent of the clinical text.")
    secondary_intents: List[str] = Field(default_factory=list, description="Other intents detected.")
    extracted_entities: List[str] = Field(default_factory=list, description="Key extracted medical entities.")

class DiagnosisOutput(BaseModel):
    primary_diagnosis: str = Field(..., description="The single most likely primary diagnosis.")
    differential_diagnoses: List[str] = Field(..., description="List of possible differential diagnoses.")
    confidence: float = Field(..., description="Confidence score from 0.0 to 1.0.")

class TreatmentOutput(BaseModel):
    recommended_actions: List[str] = Field(..., description="Concrete steps or actions to take.")
    medications: List[str] = Field(..., description="Suggested medications.")
    specialist_referral: Optional[str] = Field(None, description="Recommended specialist for follow-up.")

class RiskOutput(BaseModel):
    risk_level: str = Field(..., description="Criticality of the case (e.g., Low, Medium, High, Critical).")
    critical_flags: List[str] = Field(default_factory=list, description="Specific life-threatening or severe flags.")
    explanation: str = Field(..., description="Detailed explanation of the risk assessment.")

class FinalFusionOutput(BaseModel):
    final_diagnosis: str
    final_recommendation: List[str]
    final_risk_level: str
    overall_confidence: float

class AgentResponse(BaseModel):
    output: Any
    latency_ms: float
    error: Optional[str] = None
