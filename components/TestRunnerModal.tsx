import React from 'react';
import { TestResult } from '../utils/testRunner';
import { CalibrationBucket } from '../utils/researchEvaluation';

interface TestRunnerModalProps {
  onClose: () => void;
  results: { 
      metrics: TestResult[]; 
      accuracy: number;
      calibration?: CalibrationBucket[];
      ablation?: any;
      nlpAggregate?: { bleu: number, rouge: number, bert: number, gleu: number };
  } | null;
}

const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ onClose, results }) => {
  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex justify-center p-4 sm:p-8 transition-all overflow-y-auto items-start">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl my-4 sm:my-8 overflow-hidden flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">IEEE Research Suite</h2>
            <p className="text-sm text-slate-500">Executing benchmark dataset and verifying multi-agent collaboration accuracy.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 bg-slate-50/50">
          {!results ? (
             <div className="h-64 flex flex-col items-center justify-center space-y-4">
                 <div className="relative w-16 h-16">
                     <div className="absolute inset-0 border-4 border-[var(--c-primary)] rounded-full border-t-transparent animate-spin"></div>
                 </div>
                 <h3 className="text-lg font-bold text-slate-700 animate-pulse">Running Parallel Batch Execution...</h3>
                 <p className="text-sm text-slate-500 text-center max-w-sm">Please wait while the AI diagnostic agents evaluate multi-dataset clinical cases.</p>
             </div>
          ) : (
            <div className="space-y-8">
              
              {/* Top Meta Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <h3 className="text-sm font-bold text-slate-500 uppercase">Top-1 Accuracy</h3>
                    <div className="text-4xl font-extrabold text-[var(--c-primary)] mt-2">
                    {Number((results.metrics.filter(m => m.isCorrect).length / results.metrics.length) * 100).toFixed(2)}%
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <h3 className="text-sm font-bold text-slate-500 uppercase">Top-3 Accuracy</h3>
                    <div className="text-4xl font-extrabold text-indigo-500 mt-2">
                    {Number((results.metrics.filter(m => (m as any).top3Match).length / results.metrics.length) * 100).toFixed(2)}%
                    </div>
                  </div>
                  
                  {results.ablation && (
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                        <h3 className="text-sm font-bold text-slate-500 uppercase">Ablation Effect ({results.ablation.disabledModules[0]})</h3>
                        <div className="text-4xl font-extrabold text-red-500 mt-2">
                        -{results.ablation.delta.toFixed(2)}%
                        </div>
                      </div>
                  )}

                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <h3 className="text-sm font-bold text-slate-500 uppercase">Average Latency</h3>
                    <div className="text-4xl font-extrabold text-amber-500 mt-2">
                    {(results.metrics.reduce((acc, curr) => acc + curr.latencyMs, 0) / results.metrics.length).toFixed(0)} ms
                    </div>
                  </div>
              </div>

              {/* Advanced NLP Metrics */}
              {results.nlpAggregate && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--c-primary)] opacity-5 blur-3xl rounded-full"></div>
                       <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                           Linguistic Semantic Precision
                           <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Heuristic Validation</span>
                       </h3>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
                               <p className="text-xs font-bold text-slate-500 uppercase">BLEU Score</p>
                               <p className="text-xl font-black text-slate-800 mt-1">{results.nlpAggregate.bleu.toFixed(3)}</p>
                           </div>
                           <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
                               <p className="text-xs font-bold text-slate-500 uppercase">ROUGE-L</p>
                               <p className="text-xl font-black text-slate-800 mt-1">{results.nlpAggregate.rouge.toFixed(3)}</p>
                           </div>
                           <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
                               <p className="text-xs font-bold text-slate-500 uppercase">BERTScore</p>
                               <p className="text-xl font-black text-slate-800 mt-1">{results.nlpAggregate.bert.toFixed(3)}</p>
                           </div>
                           <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-center">
                               <p className="text-xs font-bold text-slate-500 uppercase">GLEU</p>
                               <p className="text-xl font-black text-slate-800 mt-1">{results.nlpAggregate.gleu.toFixed(3)}</p>
                           </div>
                       </div>
                  </div>
              )}

              {/* Calibration Table */}
              {results.calibration && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                          <h3 className="font-bold text-slate-800">Confidence Calibration Analysis</h3>
                          <p className="text-xs text-slate-500">Checking if high-confidence predictions correlate linearly with high correctness.</p>
                      </div>
                      <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase">
                                  <tr>
                                      <th className="px-6 py-3">Confidence Bucket</th>
                                      <th className="px-6 py-3">Case Count</th>
                                      <th className="px-6 py-3">Expected Avg (%)</th>
                                      <th className="px-6 py-3">Actual Accuracy (%)</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {results.calibration.map((bin) => (
                                      <tr key={bin.binRange} className="hover:bg-slate-50">
                                          <td className="px-6 py-4 font-medium text-slate-900">{bin.binRange}</td>
                                          <td className="px-6 py-4">{bin.caseCount}</td>
                                          <td className="px-6 py-4 text-blue-600">{bin.expectedAccuracyAvg.toFixed(1)}%</td>
                                          <td className="px-6 py-4 text-green-600 font-bold">{bin.actualAccuracy.toFixed(1)}%</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}
              
              {/* Detailed Metrics */}
              <div>
                  <h3 className="font-bold text-lg text-slate-800 mb-4">Case-by-Case Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.metrics.map((metric, i) => (
                      <div key={i} className={`p-4 rounded-xl border ${metric.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                          <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-slate-800 text-sm">Test {metric.id}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-400">{metric.latencyMs} ms | Conf: {metric.confidence}% | BERT: {(metric.nlpScores?.bert || 0).toFixed(2)} | BLEU: {(metric.nlpScores?.bleu || 0).toFixed(2)}</span>
                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${(metric as any).exactMatch ? 'bg-indigo-600 text-white' : metric.isCorrect ? 'bg-green-500 text-white' : (metric as any).top3Match ? 'bg-amber-400 text-slate-900' : 'bg-red-500 text-white'}`}>
                                    {(metric as any).exactMatch ? 'EXACT' : metric.isCorrect ? 'TOP-1' : (metric as any).top3Match ? 'TOP-3' : 'FAIL'}
                                </span>
                              </div>
                          </div>
                          <div className="text-xs space-y-1">
                              <p><span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wide inline-block w-16">Expected:</span> <span className="text-slate-700">{metric.expected}</span></p>
                              <p><span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wide inline-block w-16">Actual:</span> <span className={`${metric.isCorrect ? 'text-green-700' : 'text-red-700'}`}>{metric.output}</span></p>
                          </div>
                      </div>
                  ))}
                  </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestRunnerModal;
