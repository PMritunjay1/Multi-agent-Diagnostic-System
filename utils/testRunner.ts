import { TEST_CASES } from "../data/testCases";
import { runMedicalAnalysisPipeline } from "../services/geminiService";
import { evaluateAccuracy, calculateBERTScore, calculateBLEUScore } from "./evaluation";

export interface TestResult {
  id: string | number;
  expected: string;
  output: string;
  isCorrect: boolean;
  latencyMs: number;
  confidence: number;
  nlpScores?: {
    bert?: number;
    bleu?: number;
    rouge?: number;
    gleu?: number;
  };
  exactMatch?: boolean;
  top3Match?: boolean;
}

export const runTests = async () => {
  let correct = 0;
  const metrics: TestResult[] = [];

  for (const test of TEST_CASES) {

    const result = await runMedicalAnalysisPipeline(
      test.report,
      {
        pastDiagnoses: "",
        chronicConditions: test.history,
        allergies: "",
        currentMedications: "",
        familyHistory: "",
        lifestyleFactors: ""
      },
      null
    );

    const diag = result.finalDiagnosis as any;
    const outputString = typeof diag === 'string' ? diag : (diag?.final_diagnosis || "Unknown");
    
    const differentials = typeof diag === 'object' && Array.isArray(diag.differentials) 
        ? diag.differentials 
        : [];
        
    // Construct predictions array placing primary first
    const predictions = [outputString, ...differentials];

    const evalResult = evaluateAccuracy(predictions, test.expected);
    
    // Evaluate NLP scores against primary prediction
    const bertScore = calculateBERTScore(outputString, test.expected);
    const bleuScore = calculateBLEUScore(outputString, test.expected);

    if (evalResult.isCorrect) correct++;

    metrics.push({
      id: test.id,
      expected: test.expected,
      output: outputString,
      isCorrect: evalResult.isCorrect,
      latencyMs: result.executionTime || 0,
      confidence: typeof diag === 'object' ? (diag.confidence || 0) : 0,
      exactMatch: evalResult.matchType === 'exact',
      top3Match: evalResult.top3Match,
      nlpScores: {
          bert: bertScore,
          bleu: bleuScore
      }
    });
  }

  const accuracy = (correct / TEST_CASES.length) * 100;

  console.log("\nFinal Accuracy:", accuracy);

  return { metrics, accuracy };
};