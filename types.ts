export enum MedicalSpecialty {
  Cardiologist = 'Cardiologist',
  Psychologist = 'Psychologist',
  Pulmonologist = 'Pulmonologist',
  Neurologist = 'Neurologist',
  Endocrinologist = 'Endocrinologist',
  Immunologist = 'Immunologist',
  Gastroenterologist = 'Gastroenterologist',
  Nephrologist = 'Nephrologist',
  Hematologist = 'Hematologist',
  Oncologist = 'Oncologist',
  Radiologist = 'Radiologist',
}

/* ---------------- NEW TYPES ---------------- */

export interface StructuredCase {
  patientSummary: string;
  symptoms: string[];
  vitalSigns: string[];
  labResults: string[];
  imagingFindings: string[];
  riskFactors: string[];
  possibleIntents?: string[];
}

export interface MedicalIntent {
  primaryIntent: string;
  secondaryIntents: string[];
}

/* ------------------------------------------ */

export interface Agent {
  name: MedicalSpecialty;
  description: string;
}

export interface PreDiagnosis {
  initialImpression: string;
  recommendedSpecialists: MedicalSpecialty[];
  confidence: number;
}

export interface SpecialistAnalysis {
  summary: string;
  keyFindings: string[];
  potentialConditions: string[];
  recommendations: string[];
  differential_risks?: string[];
  confidenceScore: number;
}

export interface SpecialistReport {
  specialty: MedicalSpecialty;
  analysis: SpecialistAnalysis | null;
  status: 'pending' | 'loading' | 'complete' | 'error';
}

/* ---------------- UPDATED FINAL REPORT ---------------- */

export interface FinalDiagnosisDetails {
  final_diagnosis: string;
  clinical_explanation: string;
  criticalIssues?: string[];
  recommendedActions?: string[];
  differentials: string[];
  confidence: number;
  latency_ms?: number;
}

export interface FinalReport {
  summary: string;
  details?: FinalDiagnosisDetails;
  confidence: number;
  status: 'pending' | 'loading' | 'complete' | 'error';
}

/* ---------------- PIPELINE OUTPUT ---------------- */

export interface RefinedReport {
  resolutions: string[];
  unifiedInsights: string[];
}

export interface PipelineResult {
  structuredCase: StructuredCase;
  intent: MedicalIntent;
  preDiagnosis: PreDiagnosis;
  specialistReports: Record<string, SpecialistAnalysis>;
  refinedReports: RefinedReport; 
  finalDiagnosis: FinalDiagnosisDetails; 
  executionTime?: number;
}

/* ------------------------------------------ */

export interface PatientHistory {
  pastDiagnoses: string;
  chronicConditions: string;
  allergies: string;
  currentMedications: string;
  familyHistory: string;
  lifestyleFactors: string;
}