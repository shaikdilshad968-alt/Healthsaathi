import { useState } from 'react';
import { Activity, AlertTriangle, ChevronRight, Shield, Clock } from 'lucide-react';

const EMERGENCY_SIGNS = [
  'Chest pain or pressure',
  'Difficulty breathing or shortness of breath at rest',
  'Sudden weakness or numbness in face/arm/leg',
  'Sudden severe headache',
  'Fainting or loss of consciousness',
  'Coughing or vomiting blood',
  'High fever (>104°F / 40°C) with stiff neck or rash',
];

const SYMPTOMS_LIST = [
  'Fatigue / tiredness', 'Headache', 'Fever', 'Cough', 'Shortness of breath',
  'Nausea / vomiting', 'Stomach pain', 'Joint pain', 'Skin rash', 'Dizziness',
  'Chest discomfort', 'Back pain', 'Sore throat', 'Loss of appetite',
  'Irregular heartbeat', 'Swelling in legs',
];

type Step = 'emergency_check' | 'symptom_select' | 'details' | 'result';

interface SymptomData {
  symptom: string;
  duration: string;
  severity: number;
  associated: string[];
  notes: string;
}

export default function Symptoms() {
  const [step, setStep] = useState<Step>('emergency_check');
  const [data, setData] = useState<Partial<SymptomData>>({});
  const [emergencyCleared, setEmergencyCleared] = useState(false);

  const GUIDANCE: Record<string, string> = {
    'Fatigue / tiredness': 'Fatigue can have many causes including anaemia (as in your health profile), hypothyroidism, poor sleep, dehydration, or nutritional deficiencies. Given your low haemoglobin, this symptom is consistent with mild anaemia. Ensure adequate iron intake and rest. If fatigue is severe or worsening, consult your doctor.',
    'Headache': 'Headaches can be tension-type (stress, dehydration, poor posture) or related to blood pressure, anaemia, or other conditions. Ensure 2–2.5 L water intake, adequate sleep, and manage stress. If headaches are frequent, severe, or accompanied by vision changes, please see a doctor.',
    'Fever': 'Fever suggests the body is fighting an infection. Monitor temperature. Stay hydrated. If fever exceeds 39°C, persists beyond 3 days, or is accompanied by severe symptoms, seek medical care promptly.',
    default: 'Based on your described symptoms and health context, general self-care measures include adequate rest, hydration, and monitoring. If symptoms persist for more than 3–5 days, worsen significantly, or you are concerned, please consult a qualified healthcare provider. This is general information only — not a diagnosis.',
  };

  const getGuidance = (symptom: string) => GUIDANCE[symptom] || GUIDANCE.default;

  if (step === 'emergency_check') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="section-title text-xl">Symptom Guidance</h1>
          <p className="section-sub">General educational guidance — not a medical diagnosis</p>
        </div>

        <div className="card p-5 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-red-500" />
            <p className="font-bold text-red-700">Emergency Warning Signs</p>
          </div>
          <p className="text-sm text-red-700 mb-3 font-medium">If you have ANY of these symptoms, call emergency services (108 in India) immediately:</p>
          <div className="space-y-1.5 mb-5">
            {EMERGENCY_SIGNS.map(s => (
              <div key={s} className="flex items-start gap-2 text-sm text-red-700">
                <span className="text-red-500 mt-0.5">⚠️</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="btn-danger flex-1" onClick={() => window.open('tel:108')}>
              Call 108 (Emergency)
            </button>
            <button className="btn-secondary flex-1" onClick={() => { setEmergencyCleared(true); setStep('symptom_select'); }}>
              None of these — Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'symptom_select') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title text-xl">Select Symptom</h1>
            <p className="section-sub">Step 1 of 3 — What are you experiencing?</p>
          </div>
          <div className="flex gap-1">
            {['symptom_select','details','result'].map((s,i) => (
              <div key={s} className={`w-6 h-1.5 rounded-full ${step === s ? 'bg-teal-500' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SYMPTOMS_LIST.map(s => (
            <button
              key={s}
              className={`px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-all ${ data.symptom === s ? 'bg-teal-500 text-white border-teal-500' : 'bg-white border-slate-200 text-slate-700 hover:border-teal-200 hover:bg-teal-50' }`}
              onClick={() => {
                setData(p => ({ ...p, symptom: s }));
                setStep('details');
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <div>
          <label className="label">Or describe in your own words</label>
          <input
            className="input"
            placeholder="e.g. Pain in lower back when sitting..."
            value={data.symptom || ''}
            onChange={e => setData(p => ({ ...p, symptom: e.target.value }))}
          />
        </div>

        <button className="btn-primary" onClick={() => setStep('details')} disabled={!data.symptom}>
          Next <ChevronRight size={14} />
        </button>
      </div>
    );
  }

  if (step === 'details') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="section-title text-xl">More Details</h1>
          <p className="section-sub">Step 2 of 3 — About your {data.symptom}</p>
        </div>

        <div className="card p-5 space-y-4">
          <div>
            <label className="label">How long have you had this symptom?</label>
            <select className="input" value={data.duration || ''} onChange={e => setData(p => ({ ...p, duration: e.target.value }))}>
              <option value="">Select duration</option>
              <option value="Today">Today only</option>
              <option value="2–3 days">2–3 days</option>
              <option value="4–7 days">4–7 days</option>
              <option value="1–2 weeks">1–2 weeks</option>
              <option value="More than 2 weeks">More than 2 weeks</option>
            </select>
          </div>

          <div>
            <label className="label">Severity (1 = mild, 5 = severe)</label>
            <div className="flex gap-2 mt-1">
              {[1,2,3,4,5].map(n => (
                <button
                  key={n}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${ data.severity === n ? 'bg-teal-500 text-white border-teal-500' : 'bg-white border-slate-200 text-slate-600 hover:border-teal-200' }`}
                  onClick={() => setData(p => ({ ...p, severity: n }))}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
              <span>Mild</span><span>Moderate</span><span>Severe</span>
            </div>
          </div>

          <div>
            <label className="label">Additional notes (optional)</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="e.g. Gets worse in the morning, no fever..."
              value={data.notes || ''}
              onChange={e => setData(p => ({ ...p, notes: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setStep('symptom_select')}>Back</button>
          <button className="btn-primary flex-1" onClick={() => setStep('result')} disabled={!data.duration || !data.severity}>
            Get Guidance <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // Result
  const isHighSeverity = (data.severity ?? 0) >= 4;
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="section-title text-xl">Symptom Guidance</h1>
        <p className="section-sub">Educational information — not a medical diagnosis</p>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
            <Activity size={16} className="text-teal-500" />
          </div>
          <div>
            <p className="font-bold text-slate-800">{data.symptom}</p>
            <p className="text-xs text-slate-400">{data.duration} · Severity {data.severity}/5</p>
          </div>
        </div>

        {isHighSeverity && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 mb-4 text-sm text-amber-800">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <span>You reported severity {data.severity}/5. Please consider seeking medical attention soon if symptoms are worsening or have not improved.</span>
          </div>
        )}

        <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed mb-4">
          <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-wide mb-2">General Information (Demo)</p>
          {getGuidance(data.symptom ?? '')}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600">Suggested Next Steps:</p>
          {[
            'Monitor your symptoms for 24–48 hours',
            'Stay well-hydrated (2–2.5 L water)',
            'Get adequate rest and sleep',
            isHighSeverity ? 'Consult a doctor soon — severity is high' : 'See a doctor if symptoms worsen or last more than 5 days',
            'Do not self-medicate without professional guidance',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="text-teal-500 font-bold flex-shrink-0">{i+1}.</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-800">
        <Shield size={13} className="flex-shrink-0 mt-0.5" />
        <span><strong>Important:</strong> This is general educational information only. HealthSaathi does not diagnose medical conditions. If you are unwell, please consult a qualified healthcare professional.</span>
      </div>

      <div className="flex gap-2">
        <button className="btn-secondary" onClick={() => { setStep('emergency_check'); setData({}); }}>
          Start Over
        </button>
      </div>
    </div>
  );
}
