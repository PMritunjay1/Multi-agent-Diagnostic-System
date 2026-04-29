import React, { useState, useCallback, useMemo } from 'react';
import { PatientHistory } from '../types';

interface ReportInputProps {
  onSubmit: (reportText: string, history: PatientHistory, image: { base64: string; mimeType: string } | null) => void;
  isLoading: boolean;
}

const HISTORY_LABELS: Record<keyof PatientHistory, string> = {
    pastDiagnoses: 'Past Diagnoses',
    chronicConditions: 'Chronic Conditions',
    allergies: 'Allergies',
    currentMedications: 'Current Medications',
    familyHistory: 'Family History',
    lifestyleFactors: 'Lifestyle Factors',
};

async function compressImage(file: File): Promise<{ base64: string; mimeType: string; preview: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const img = new Image();
    reader.onload = (e) => { img.src = e.target?.result as string; };
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 1000;
      const scale = Math.min(1, MAX_WIDTH / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
      resolve({
        base64: compressedDataUrl.split(",")[1],
        mimeType: "image/jpeg",
        preview: compressedDataUrl
      });
    };
    reader.readAsDataURL(file);
  });
}

const ReportInput: React.FC<ReportInputProps> = ({ onSubmit, isLoading }) => {
  const [step, setStep] = useState<number>(1);
  const [error, setError] = useState('');
  
  // Advanced State
  const [patientData, setPatientData] = useState({ age: '', gender: 'Male', hr: '', bp: '', temp: '', spo2: '' });
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState<PatientHistory>({ pastDiagnoses: '', chronicConditions: '', allergies: '', currentMedications: '', familyHistory: '', lifestyleFactors: '' });
  
  // Multimodal State
  const [fileName, setFileName] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageForApi, setImageForApi] = useState<{ base64: string; mimeType: string } | null>(null);
  
  // Simulated Extracted NLP Chips
  const nlpChips = useMemo(() => {
      if (!notes) return [];
      const keywords = ['pain', 'fever', 'cough', 'hypertension', 'nausea', 'fracture', 'shortness', 'dizzy'];
      return keywords.filter(k => notes.toLowerCase().includes(k));
  }, [notes]);

  const handleNext = () => {
      if (step === 1 && !patientData.age) {
          setError('Please provide at least the patient age.');
          return;
      }
      if (step === 2 && !notes && !imageForApi) {
          setError('Please provide clinical notes or upload a scan.');
          return;
      }
      setError('');
      setStep(prev => prev + 1);
  };

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError('File too large (Max 5MB).');
    setError(''); setFileName(file.name);
    try {
      if (file.type.startsWith('image/')) {
        const compressed = await compressImage(file);
        setImageForApi({ base64: compressed.base64, mimeType: compressed.mimeType });
        setImagePreview(compressed.preview);
      } else if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => setNotes(e.target?.result as string);
        reader.readAsText(file);
      } else { setError('Unsupported format. (.txt, .jpg, .png)'); }
    } catch { setError('Error handling file.'); }
    event.target.value = '';
  }, []);

  const buildSynthesizedReport = () => {
      return `[PATIENT DEMOGRAPHICS]\nAge: ${patientData.age}\nGender: ${patientData.gender}\n\n[VITALS]\nHR: ${patientData.hr || 'N/A'}\nBP: ${patientData.bp || 'N/A'}\nTemp: ${patientData.temp || 'N/A'}\nSpO2: ${patientData.spo2 || 'N/A'}\n\n[CLINICAL NOTES]\n${notes}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(buildSynthesizedReport(), history, imageForApi);
  };

  const downloadJSON = (e: React.MouseEvent) => {
      e.preventDefault();
      const payload = {
          demographics: patientData,
          clinical_notes: notes,
          extracted_entities: nlpChips,
          history: history,
          multimodal_present: !!imageForApi
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Clinical_Case_Export_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
  };

  const CheckIcon = () => <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      
      {/* Stepper Header */}
      <div className="mb-10 w-full relative before:absolute before:top-1/2 before:w-full before:h-1 before:bg-slate-200">
          <div className="relative flex justify-between">
              {[1, 2, 3, 4].map((num) => (
                  <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-colors ${step >= num ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-200 text-slate-400'}`}>
                      {step > num ? <CheckIcon /> : num}
                  </div>
              ))}
          </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.05)] border border-slate-200 overflow-hidden">
          
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                  <h2 className="text-2xl font-black text-slate-800">Clinical Data Ingestion</h2>
                  <p className="text-slate-500 text-sm mt-1">Multi-Agent RIE Preprocessing Pipeline</p>
              </div>
              <button onClick={downloadJSON} className="text-xs font-bold text-blue-600 uppercase tracking-widest px-4 py-2 border border-blue-200 rounded-full hover:bg-blue-50 transition-colors">
                  [↓] Export Case JSON
              </button>
          </div>

          <div className="p-10 min-h-[400px]">
              
              {/* STEP 1: PATIENT CONTEXT & INGESTION */}
              {step === 1 && (
                 <div className="animate-slideInBottom space-y-8">
                     <h3 className="text-lg font-bold text-slate-700 uppercase tracking-widest border-b pb-2">1. AI Ingestion & Patient Context</h3>
                     
                     <div className="space-y-4">
                         <label className="block text-xs font-bold text-slate-500 uppercase">Vision Agent Input (Upload Report/Scan for Auto-Extraction)</label>
                         <label htmlFor="file-upload" className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors">
                            <span className="text-sm font-bold text-slate-600">{fileName ? fileName : 'Upload DICOM/PNG/JPG'}</span>
                            <span className="text-xs text-slate-400 mt-2 text-center px-4">Radiology Agent will extract relevant data from this report automatically.</span>
                            <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,text/plain" />
                         </label>
                         {imagePreview && <img src={imagePreview} className="w-48 h-48 object-cover rounded-xl border border-slate-200 shadow-sm" alt="scan" />}
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                             <label className="block text-xs font-bold text-slate-500 uppercase">Age</label>
                             <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={patientData.age} onChange={e => setPatientData({...patientData, age: e.target.value})} placeholder="e.g. 45" />
                         </div>
                         <div className="space-y-4">
                             <label className="block text-xs font-bold text-slate-500 uppercase">Gender</label>
                             <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={patientData.gender} onChange={e => setPatientData({...patientData, gender: e.target.value})}>
                                 <option>Male</option><option>Female</option><option>Other</option>
                             </select>
                         </div>
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                         <div>
                             <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Heart Rate (bpm)</label>
                             <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={patientData.hr} onChange={e => setPatientData({...patientData, hr: e.target.value})} placeholder="72" />
                         </div>
                         <div>
                             <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Blood Pressure</label>
                             <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={patientData.bp} onChange={e => setPatientData({...patientData, bp: e.target.value})} placeholder="120/80" />
                         </div>
                         <div>
                             <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Temp (°C)</label>
                             <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={patientData.temp} onChange={e => setPatientData({...patientData, temp: e.target.value})} placeholder="37.0" />
                         </div>
                         <div>
                             <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">SpO2 (%)</label>
                             <input type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value={patientData.spo2} onChange={e => setPatientData({...patientData, spo2: e.target.value})} placeholder="98" />
                         </div>
                     </div>
                 </div>
              )}

              {/* STEP 2: CLINICAL NOTES */}
              {step === 2 && (
                 <div className="animate-slideInBottom space-y-8">
                     <h3 className="text-lg font-bold text-slate-700 uppercase tracking-widest border-b pb-2">2. Clinical Notes</h3>
                     <div className="space-y-4">
                         <label className="block text-xs font-bold text-slate-500 uppercase">Physician Notes</label>
                         <textarea rows={8} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Enter detailed symptoms, onset, and presentation..." />
                         
                         {nlpChips.length > 0 && (
                             <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                 <p className="text-[10px] font-bold text-blue-400 uppercase mb-2">Real-time NLP Extraction</p>
                                 <div className="flex flex-wrap gap-2">
                                     {nlpChips.map(chip => <span key={chip} className="px-2 py-1 bg-white text-blue-600 text-xs font-bold rounded shadow-sm border border-blue-100">{chip}</span>)}
                                 </div>
                             </div>
                         )}
                     </div>
                 </div>
              )}

              {/* STEP 3: PATIENT HISTORY */}
              {step === 3 && (
                 <div className="animate-slideInBottom space-y-8">
                     <h3 className="text-lg font-bold text-slate-700 uppercase tracking-widest border-b pb-2">3. Historical Epidemiology</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {Object.keys(history).map(key => (
                             <div key={key}>
                                 <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">{HISTORY_LABELS[key as keyof PatientHistory]}</label>
                                 <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Enter findings..." value={history[key as keyof PatientHistory]} onChange={e => setHistory({...history, [key]: e.target.value})} />
                             </div>
                         ))}
                     </div>
                 </div>
              )}

               {/* STEP 4: REVIEW & SUBMIT */}
               {step === 4 && (
                 <div className="animate-slideInBottom space-y-8">
                     <h3 className="text-lg font-bold text-slate-700 uppercase tracking-widest border-b pb-2 flex items-center justify-between">
                         4. Validation Gate & Preflight
                         {(!notes || !patientData.age) && <span className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full">Warning: Low Confidence Input</span>}
                     </h3>
                     
                     <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                         <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 blur-2xl"></div>
                         <button onClick={handleSubmit} disabled={isLoading} className={`w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                isLoading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl hover:scale-[1.02]'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing Multi-Agent Flow...
                </>
              ) : (
                <>
                  Analyze Clinical Case
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
                     </div>
                 </div>
              )}

          </div>

          {/* FOOTER ACTIONS */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <div>
                  {error && <span className="text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded text-left border border-red-100">{error}</span>}
              </div>
              <div className="flex gap-4">
                  {step > 1 && <button onClick={() => {setError(''); setStep(s => s - 1)}} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors">BACK</button>}
                  {step < 4 && (
                      <button onClick={handleNext} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">PROCEED TO NEXT</button>
                  )}
              </div>
          </div>

      </div>
    </div>
  );
};

export default ReportInput;