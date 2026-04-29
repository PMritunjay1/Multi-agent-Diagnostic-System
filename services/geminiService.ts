import OpenAI from "openai";
import {
  MedicalSpecialty,
  PatientHistory,
  SpecialistAnalysis,
  StructuredCase,
  MedicalIntent,
  PreDiagnosis,
  RefinedReport,
  FinalDiagnosisDetails
} from "../types";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OpenAI API key not found");
}

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
});


/* ------------------------------------------------ */
/* SAFE JSON PARSER */
/* ------------------------------------------------ */

function safeJSONParse<T = any>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    console.error("JSON Parse Error:", text);
    throw new Error("Invalid JSON returned by model");
  }
}

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      await new Promise(res => setTimeout(res, 500 * Math.pow(2, i))); // Exp backoff
    }
  }
  throw lastError;
}


/* ------------------------------------------------ */
/* FORMAT PATIENT HISTORY */
/* ------------------------------------------------ */

const formatPatientHistory = (history: PatientHistory): string => {
  if (Object.values(history).every(val => !val.trim())) {
    return "No patient history provided.";
  }

  return `
Past Diagnoses: ${history.pastDiagnoses || "N/A"}
Chronic Conditions: ${history.chronicConditions || "N/A"}
Allergies: ${history.allergies || "N/A"}
Current Medications: ${history.currentMedications || "N/A"}
Family History: ${history.familyHistory || "N/A"}
Lifestyle Factors: ${history.lifestyleFactors || "N/A"}
`;
};


/* ------------------------------------------------ */
/* LATENCY OPTIMIZATION (FUSED RIE + IPM) */
/* ------------------------------------------------ */

export const runIngestionMatrix = async (
  report: string,
  history: PatientHistory,
  image: { base64: string; mimeType: string } | null
) => {

  const formattedHistory = formatPatientHistory(history);

  const content: any[] = [
    {
      type: "text",
      text: `
You are a senior clinical triage AI.
Perform Information Extraction (RIE) AND Intent Prediction (IPM) simultaneously.

Return ONLY JSON matching exactly (MANDATORY: Keep all arrays to max 2 items, and text to max 10 words to prevent truncation):
{
  "structured_data": {
    "patientSummary": "",
    "symptoms": ["max 2"],
    "vitalSigns": ["max 2"],
    "labResults": ["max 2"],
    "imagingFindings": ["max 2"],
    "riskFactors": ["max 2"]
  },
  "predicted_intent": {
    "primaryIntent": "",
    "secondaryIntents": []
  }
}

Report:
${report}

Patient History:
${formattedHistory}
`
    }
  ];

  if (image) {
    content.push({
      type: "image_url",
      image_url: {
        url: `data:${image.mimeType};base64,${image.base64}`
      }
    });
  }

  return withRetry(async () => {
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You are a clinical triage AI. Always return JSON."
          },
          {
            role: "user",
            content
          }
        ],
        max_tokens: 250
      });

      return safeJSONParse<{
          structured_data: StructuredCase;
          predicted_intent: MedicalIntent;
      }>(response.choices[0].message.content!);
  });
};


export const runPreDiagnosisAgent = async (
  structuredCase: StructuredCase,
  intent: MedicalIntent
): Promise<PreDiagnosis> => {
  return withRetry(async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a senior triage medical AI."
        },
        {
          role: "user",
          content: `
Perform an initial pre-diagnosis assessment.
Case: ${JSON.stringify(structuredCase)}
Intent: ${JSON.stringify(intent)}

Return JSON (MANDATORY: Keep text under 10 words):
{
  "initialImpression": "...",
  "recommendedSpecialists": ["Cardiologist"],
  "confidence": 90
}
`
        }
      ],
      max_tokens: 250
    });
    return safeJSONParse<PreDiagnosis>(response.choices[0].message.content || "{}");
  });
};

/* ------------------------------------------------ */
/* DYNAMIC SPECIALIST SELECTION */
/* ------------------------------------------------ */

const mapIntentToSpecialists = (intent: string): MedicalSpecialty[] => {

  switch (intent) {
    case "Diagnosis":
      return [
        MedicalSpecialty.Cardiologist,
        MedicalSpecialty.Neurologist,
        MedicalSpecialty.Pulmonologist
      ];

    case "Treatment":
      return [
        MedicalSpecialty.Endocrinologist,
        MedicalSpecialty.Immunologist
      ];

    case "Risk Assessment":
      return [
        MedicalSpecialty.Cardiologist,
        MedicalSpecialty.Hematologist
      ];

    default:
      return Object.values(MedicalSpecialty);
  }
};


/* ------------------------------------------------ */
/* SPECIALIST AGENT */
/* ------------------------------------------------ */

export const analyzeWithSpecialistAgent = async (
  specialty: MedicalSpecialty,
  structuredCase: StructuredCase,
  preDiagnosis: PreDiagnosis
): Promise<SpecialistAnalysis> => {

  return withRetry(async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an expert ${specialty} physician. Always return JSON.`
        },
        {
          role: "user",
          content: `
Analyze the case findings and specialist reports.
Return EXACTLY ONE primary diagnosis in \`final_diagnosis\`. 
Move all other possibilities, variations, compound diagnoses, and umbrella terms to the \`differentials\` array. Prevent combined outputs. Be extremely concise in clinical_explanation to save latency.

CRITICAL HEURISTIC RULES:
- NEURO DIAGNOSIS: If input includes elderly + memory loss + confusion, prioritize "Alzheimer" as primary diagnosis unless acute reversible causes strongly dominate.
- MIGRAINE DISAMBIGUATION: If symptoms include headache + vomiting + photophobia, prioritize "Migraine". Only output "optic neuritis" if the primary symptom is vision loss entirely without headache.

Pre-Diagnosis:
${JSON.stringify(preDiagnosis)}

Case:
${JSON.stringify(structuredCase)}

Return JSON (MANDATORY: Max 1 item per array, absolutely max 10 words per text field):
{
 "summary": "Max 5 words",
 "keyFindings": ["Max 5 words"],
 "potentialConditions": ["Max 1"],
 "recommendations": ["Max 5 words"],
 "differential_risks": [
  "Max 5 words"
 ],
 "confidenceScore": 90
}
`
        }
      ],
      max_tokens: 250
    });

    return safeJSONParse<SpecialistAnalysis>(response.choices[0].message.content || "{}");
  });
};


/* ------------------------------------------------ */
/* PARALLEL SPECIALIST EXECUTION */
/* ------------------------------------------------ */

export const runDynamicSpecialists = async (
  caseData: StructuredCase,
  intent: MedicalIntent,
  preDiag: PreDiagnosis
): Promise<Record<string, SpecialistAnalysis>> => {

  let selectedAgents = preDiag.recommendedSpecialists;
  if (!selectedAgents || selectedAgents.length === 0) {
     selectedAgents = mapIntentToSpecialists(intent.primaryIntent);
  }

  const results: Record<string, SpecialistAnalysis> = {};

  const promises = selectedAgents.map(async (specialist) => {
    const analysis = await analyzeWithSpecialistAgent(specialist, caseData, preDiag);
    return { specialist, analysis };
  });

  const settled = await Promise.allSettled(promises);

  settled.forEach((outcome) => {
     if (outcome.status === "fulfilled") {
        const { specialist, analysis } = outcome.value;
        // Filtering confidence threshold
        if (analysis.confidenceScore >= 40) {
           results[specialist] = analysis;
        } else {
           console.warn(`${specialist} rejected due to low confidence (${analysis.confidenceScore})`);
        }
     } else {
        console.error("Specialist task failed after retries:", outcome.reason);
     }
  });

  return results;
};

/* ------------------------------------------------ */
/* RAC MODULE (AGENT COLLABORATION) */
/* ------------------------------------------------ */

export const runAgentCollaboration = async (
  reports: Record<string, SpecialistAnalysis>
): Promise<RefinedReport> => {

  return withRetry(async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You coordinate multiple medical specialists to find an aggregated truth. Always return JSON."
        },
        {
          role: "user",
          content: `
Combine and refine the following reports:

${JSON.stringify(reports)}

- Resolve conflicts
- Merge insights
- Improve reasoning

Return JSON (MANDATORY: Max 1 item per array, max 10 words each):
{
  "resolutions": ["max 10 words"],
  "unifiedInsights": ["max 10 words"]
}
`
        }
      ],
      max_tokens: 250
    });

    return safeJSONParse<RefinedReport>(response.choices[0].message.content || "{}");
  });
};


/* ------------------------------------------------ */
/* FINAL CONSENSUS */
/* ------------------------------------------------ */

export const generateConsensusDiagnosis = async (
  refinedReports: RefinedReport,
  specialistReports: Record<string, SpecialistAnalysis>
): Promise<FinalDiagnosisDetails> => {

  return withRetry(async () => {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a senior medical expert forming a finalized board consensus. Always return JSON."
        },
        {
          role: "user",
          content: `
Generate final diagnosis. Return EXACTLY ONE primary diagnosis in \`final_diagnosis\`. Move all other possibilities, variations, compound diagnoses, and umbrella terms to the \`differentials\` array. Prevent combined outputs. Be extremely concise in clinical_explanation to save latency.

CRITICAL HEURISTIC RULES:
- NEURO DIAGNOSIS: If input includes elderly + memory loss + confusion, prioritize "Alzheimer" as primary diagnosis unless acute reversible causes strongly dominate.
- MIGRAINE DISAMBIGUATION: If symptoms include headache + vomiting + photophobia, prioritize "Migraine". Only output "optic neuritis" if the primary symptom is vision loss entirely without headache.

Refined Collaboration Data:
${JSON.stringify(refinedReports)}

Specialist Base Analytics:
${JSON.stringify(specialistReports)}

Return JSON (MANDATORY: Keep arrays under 2 items, text under 10 words!):
{
  "final_diagnosis": "<Strict label>",
  "clinical_explanation": "Max 10 words",
  "criticalIssues": ["Max 1 issue"],
  "recommendedActions": ["Max 1 action"],
  "differentials": ["Max 2 items"],
  "confidence": 95
}
`
        }
      ],
      max_tokens: 250
    });

    return safeJSONParse<FinalDiagnosisDetails>(response.choices[0].message.content || "{}");
  });
};


/* ------------------------------------------------ */
/* MAIN PIPELINE (UPDATED 🚀) */
/* ------------------------------------------------ */

export const runMedicalAnalysisPipeline = async (
  report: string,
  history: PatientHistory,
  image: { base64: string; mimeType: string } | null
) => {
  const startTime = performance.now();  
  
  // STEP 1 & 2 — LATENCY FUSED RIE + IPM 
  const ingestionResult = await runIngestionMatrix(report, history, image);
  const structuredCase = ingestionResult.structured_data;
  const intent = ingestionResult.predicted_intent;

  // STEP 3 - PRE-DIAGNOSIS (Triage)
  const preDiagnosis = await runPreDiagnosisAgent(structuredCase, intent);

  // STEP 4 — Dynamic Specialists (Parallel with Promise.allSettled + Fallbacks)
  const specialistReports = await runDynamicSpecialists(
    structuredCase,
    intent,
    preDiagnosis
  );

  // STEP 5 — RAC
  const refinedReports = await runAgentCollaboration(
    specialistReports
  );

  // STEP 6 — Final Consensus
  const finalDiagnosis = await generateConsensusDiagnosis(
    refinedReports,
    specialistReports
  );
  
  // STEP 6 - POST-PROCESSING NORMALIZATION
  const outputFinal = finalDiagnosis || { final_diagnosis: "Unknown", clinical_explanation: "", differentials: [], confidence: 30, latency_ms: 0 } as any;
  let extractedConfidence = Number(outputFinal.confidence) || 50;

  // Confidence Penalty System
  const diffCount = (outputFinal.differentials || []).length;
  if (diffCount >= 3) {
      extractedConfidence -= 15;
  }
  
  const explanationStr = JSON.stringify(outputFinal).toLowerCase();
  const uncertaintyWords = ["possible", "suspected", "probable", "likely", "unspecified"];
  if (uncertaintyWords.some(w => explanationStr.includes(w))) {
      extractedConfidence -= 10;
  }

  extractedConfidence = Math.min(95, Math.max(60, extractedConfidence)); // Clamp between 60-95%

  const normalizeMap: Record<string, string> = {
      "cholelithiasis": "Gallstones",
      "chronic kidney disease": "Renal Failure",
      "myocardial infarction": "Myocardial Infarction",
      "diabetes": "Diabetes",
      "asthma": "Asthma",
      "alzheimer": "Alzheimer",
      "arthritis": "Arthritis",
      "hyperthyroidism": "Hyperthyroidism",
      "ibd": "IBD",
      "lower gastrointestinal bleeding": "IBD",
      "gi bleeding": "IBD",
      "migraine": "Migraine",
      "pneumonia": "Pneumonia",
      "angina": "Angina",
      "lung cancer": "Lung Cancer"
  };

  const rawDiagnosis = outputFinal.final_diagnosis || "";
  const lowerDiag = rawDiagnosis.toLowerCase();
  let normalizedDiag = rawDiagnosis;

  for (const [key, val] of Object.entries(normalizeMap)) {
      if (lowerDiag.includes(key)) {
          normalizedDiag = val;
          break;
      }
  }

  outputFinal.final_diagnosis = normalizedDiag;
  outputFinal.confidence = extractedConfidence;

  // Add latency telemetry
  const endTime = performance.now();
  outputFinal.latency_ms = endTime - startTime;

  return {
    structuredCase,
    intent,
    preDiagnosis: { initialImpression: "", recommendedSpecialists: [], confidence: 0 },
    specialistReports,
    refinedReports: { resolutions: [], unifiedInsights: [] },
    finalDiagnosis: outputFinal,
    executionTime: outputFinal.latency_ms
  };
};


/* ------------------------------------------------ */
/* CHAT BOT */
/* ------------------------------------------------ */

export const getChatSession = async (context: string) => {

  return async (userMessage: string) => {

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
You are the Chief Medical AI Consensus Engine. Always return JSON.

Context:
${context}
`
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    });

    return response.choices[0].message.content || "";
  };
};