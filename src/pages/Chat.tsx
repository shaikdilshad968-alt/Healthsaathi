import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Info, Sparkles } from 'lucide-react';
import { useApp, useActiveProfile } from '@/context/AppContext';
import { formatDate } from '@/lib/utils';

const DEMO_RESPONSES: Record<string, string> = {
  default: "I'm HealthSaathi in demo mode. 🌟 In the full version, I'd use your actual health records and the Gemini AI to give personalised answers. For now, here's some general information: please consult your doctor for medical decisions. How else can I help?",
  haemoglobin: "Your haemoglobin (Hb 10.8 g/dL) is below normal for women (12–16 g/dL). This mild anaemia can cause fatigue and breathlessness. Your iron supplement should help — re-test in December as planned. Eat iron-rich foods: palak, rajma, dates, til. Take iron with Vitamin C (lemon water) for better absorption.",
  thyroid: "Great news — your latest thyroid test (October 2026) shows TSH at 3.8 µIU/mL, which is well within the normal range (0.5–5.0). Your hypothyroidism appears well-controlled. Continue your current management and consult your doctor for any dose adjustments.",
  diet: "For your goals (weight loss, vegetarian, Hb improvement), focus on: 🥬 Iron-rich: palak, rajma, til, dates. 🌾 Protein: dal, paneer, curd, sprouts. 🍊 Vitamin C with iron meals. 🫙 Limit tea/coffee around meals (reduces iron absorption). Your nutrition target is ~1680 kcal and 63g protein/day.",
  symptoms: "I hear you. Please describe your symptom in the Symptom Guidance page for a structured assessment. If you have chest pain, difficulty breathing, or severe symptoms, please seek emergency medical care immediately.",
  bmi: "Your BMI is 24.1 — in the healthy range (18.5–24.9). 🎉 Your weight has reduced from 65 kg to 63 kg over this year, which is a positive, steady trend. Focus on sustaining healthy habits rather than rapid weight loss.",
};

function getResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.includes('haemoglobin') || q.includes('hemoglobin') || q.includes('anaemia') || q.includes('anemia') || q.includes('iron')) return DEMO_RESPONSES.haemoglobin;
  if (q.includes('thyroid') || q.includes('tsh') || q.includes('hypothyroid')) return DEMO_RESPONSES.thyroid;
  if (q.includes('diet') || q.includes('food') || q.includes('eat') || q.includes('nutrition') || q.includes('meal')) return DEMO_RESPONSES.diet;
  if (q.includes('symptom') || q.includes('pain') || q.includes('tired') || q.includes('fatigue') || q.includes('fever')) return DEMO_RESPONSES.symptoms;
  if (q.includes('bmi') || q.includes('weight')) return DEMO_RESPONSES.bmi;
  return DEMO_RESPONSES.default;
}

export default function Chat() {
  const { chatMessages, addChatMessage } = useApp();
  const profile = useActiveProfile();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, isTyping]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: input, timestamp: new Date().toISOString() };
    addChatMessage(userMsg);
    setInput('');
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    setIsTyping(false);
    addChatMessage({
      id: (Date.now() + 1).toString(),
      role: 'ai',
      content: getResponse(userMsg.content),
      timestamp: new Date().toISOString(),
      is_demo: true,
    });
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Header */}
      <div className="card p-4 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-teal flex items-center justify-center">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm">HealthSaathi AI Chat</p>
          <p className="text-xs text-slate-400">Context-aware · Profile: {profile?.name} · DEMO MODE</p>
        </div>
        <div className="ml-auto">
          <span className="badge-teal">Demo</span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 px-4 py-2.5 bg-amber-50 border border-amber-100 rounded-xl mb-4 text-xs text-amber-800">
        <Info size={13} className="flex-shrink-0 mt-0.5" />
        <span><strong>Disclaimer:</strong> HealthSaathi provides general health information only, not medical advice. Always consult a qualified healthcare professional for medical decisions. In demo mode, responses are pre-written and not from a live AI.</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3 pr-1 pb-2">
        {chatMessages.length === 0 && !isTyping && (
          <div className="flex h-full min-h-48 flex-col items-center justify-center px-5 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Sparkles size={20} />
            </div>
            <h2 className="text-base font-bold text-slate-800">A fresh chat for {profile?.name.split(' ')[0]}</h2>
            <p className="mt-1 max-w-sm text-sm text-slate-500">Start a conversation about your health, reports, or nutrition. Your chat stays with this profile on this browser.</p>
          </div>
        )}
        {chatMessages.map(msg => (
          <div key={msg.id} className={`flex items-end gap-2 ${ msg.role === 'user' ? 'flex-row-reverse' : 'flex-row' }`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${ msg.role === 'user' ? 'bg-slate-200' : 'bg-gradient-teal' }`}>
              {msg.role === 'user' ? <User size={12} className="text-slate-600" /> : <Bot size={12} className="text-white" />}
            </div>
            <div className="max-w-[78%]">
              {msg.is_demo && msg.role === 'ai' && (
                <p className="text-[9px] text-slate-400 mb-0.5 ml-1">DEMO RESPONSE</p>
              )}
              <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{msg.content}</p>
              </div>
              <p className={`text-[9px] mt-0.5 text-slate-400 ${ msg.role === 'user' ? 'text-right mr-1' : 'ml-1' }`}>
                {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-teal flex items-center justify-center">
              <Bot size={12} className="text-white" />
            </div>
            <div className="chat-bubble-ai">
              <div className="flex gap-1 items-center h-4">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <input
          className="input flex-1"
          placeholder="Ask about your health, reports, nutrition..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
        />
        <button className="btn-primary px-3" onClick={send} disabled={!input.trim() || isTyping}>
          <Send size={15} />
        </button>
      </div>

      {/* Suggested queries */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {['What does my CBC report say?', 'How is my thyroid?', 'What should I eat?', 'My BMI status'].map(q => (
          <button key={q} className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors" onClick={() => setInput(q)}>{q}</button>
        ))}
      </div>
    </div>
  );
}
