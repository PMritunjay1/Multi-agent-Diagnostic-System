import { SpecialistReport } from "../types";

export const calculateConfidence = (
  reports: Record<string, SpecialistReport>,
  matchedType?: 'exact' | 'synonym' | 'fuzzy' | 'fail'
): number => {
  const completed = Object.values(reports).filter(
    (r) => r.status === "complete" && r.analysis
  );

  // 4. Clamp confidence realistically (60-95%)
  if (completed.length === 0) return 0.6;

  // Track possible alternative diagnoses internally
  let allDifferentials = new Set<string>();
  
  if (completed.length === 1) {
    const internalConf = completed[0].analysis?.confidenceScore;
    let singleConf = internalConf !== undefined ? (internalConf / 100) : 0.75;
    
    const list = completed[0].analysis?.potentialConditions || [];
    list.forEach(c => allDifferentials.add(c.toLowerCase().trim()));
    singleConf = applyConfidencePenalties(singleConf, allDifferentials, matchedType);
    return clampConfidence(singleConf);
  }

  let matchCount = 0;
  let totalPairs = 0;

  for (let i = 0; i < completed.length; i++) {
    const listA = completed[i].analysis?.potentialConditions || [];
    listA.forEach(c => allDifferentials.add(c.toLowerCase().trim()));

    for (let j = i + 1; j < completed.length; j++) {
      const listB = completed[j].analysis?.potentialConditions || [];
      
      const overlap = listA.filter(c => 
          listB.some(b => b.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(b.toLowerCase()))
      );
      
      if (overlap.length > 0) matchCount++;
      totalPairs++;
    }
  }

  const baseConfidence = 0.70;
  // Adjust base on overlap/conflict
  const agreementRatio = totalPairs > 0 ? matchCount / totalPairs : 1.0;
  let confidence = baseConfidence + (agreementRatio * 0.25);

  confidence = applyConfidencePenalties(confidence, allDifferentials, matchedType);
  
  const finalConfidence = clampConfidence(confidence);
  console.log(`[Eval] Diagnostics Conf: ${(finalConfidence * 100).toFixed(1)}% | Ambiguity: ${allDifferentials.size} differentials`);
  
  return finalConfidence;
};

const applyConfidencePenalties = (conf: number, differentials: Set<string>, matchType?: string): number => {
    let result = conf;
    // Reduce overconfidence by penalizing ambiguity
    // If multiple possible diagnoses -> reduce confidence by 10-25%
    const possibleDiagnosesCount = differentials.size;
    if (possibleDiagnosesCount > 1) {
        // Base penalty is 10% for 2 diagnoses, scaling up to 25%
        const penalty = Math.min(0.25, 0.10 + ((possibleDiagnosesCount - 2) * 0.05));
        result -= penalty;
    }

    // If semantic match instead of exact -> reduce confidence slightly
    if (matchType === 'synonym') {
        result -= 0.05;
    } else if (matchType === 'fuzzy') {
        result -= 0.08;
    }
    
    return result;
}

const clampConfidence = (confidence: number): number => {
    return Math.min(0.95, Math.max(0.60, confidence));
}