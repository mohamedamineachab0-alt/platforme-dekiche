"use client";

import { Bot, User as UserIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "assistant",
  content: "مرحباً بك! أنا مساعدك الذكي. يمكنك سؤالي عن أي درس لم تفهمه في الرياضيات، الفيزياء، أو العلوم.\n\nكيف يمكنني مساعدتك اليوم؟"
};

export default function StudentAITutorPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI LLM Response delay
    setTimeout(() => {
      let aiContent = "أحسنت في طرح هذا السؤال! هل يمكنك توضيح النقطة التي تواجه فيها صعوبة بالضبط لنتمكن من التركيز عليها؟";
      
      const lowerInput = text.toLowerCase();
      if (lowerInput.includes("طالس") || lowerInput.includes("هندسة")) {
        aiContent = "نظرية طالس (Thales's theorem) تُستخدم في الهندسة لمعرفة أطوال الأضلاع في مثلثات متشابهة تنتج عن مستقيم يقطع ضلعين ويوازي الضلع الثالث.\n\nالقاعدة الأساسية هي:\nإذا كان لدينا مثلث ABC ومستقيم (d) يوازي (BC) ويقطع (AB) في M و(AC) في N، فإن:\nAM/AB = AN/AC = MN/BC\n\nهل تريدني أن أعطيك تمريناً تطبيقياً على هذه النظرية؟";
      } else if (lowerInput.includes("dna") || lowerInput.includes("علوم")) {
        aiContent = "حمض الـ DNA (الحمض النووي الريبوزي منقوص الأكسجين) هو المادة الوراثية الموجودة في خلايا الكائنات الحية.\n\nيحمل الـ DNA المعلومات الوراثية التي تحدد صفات الكائن الحي، مثل لون العينين أو فصيلة الدم. يتكون من شريطين ملتفين حول بعضهما البعض في شكل لولب مزدوج.\n\nهل لديك سؤال محدد حول تركيبه؟";
      } else if (lowerInput.includes("سرعة") || lowerInput.includes("فيزياء")) {
        aiContent = "السرعة المتوسطة (v) تحسب بقسمة المسافة المقطوعة (d) على الزمن المستغرق (t).\n\nالقانون هو: v = d / t\nحيث:\nv: السرعة (متر/ثانية)\nd: المسافة (متر)\nt: الزمن (ثانية)\n\nهل تريد حل تمرين حول حساب السرعة؟";
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiContent,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#6D28D9]/10 text-[#6D28D9] rounded-2xl relative shadow-sm">
            <Bot className="w-8 h-8" />
            {/* Removed the Sparkles icon as requested */}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">الأستاذ الذكي AI</h2>
            <p className="text-slate-500 text-sm">مساعدك الشخصي متاح 24/7 للإجابة عن أسئلتك</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-md border border-gray-100 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6D28D9]/5 rounded-full blur-3xl -mr-20 -mt-20 opacity-70 pointer-events-none" />
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 relative z-10 custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
                msg.role === 'assistant' 
                  ? 'bg-gradient-to-br from-[#6D28D9] to-purple-600 shadow-[#6D28D9]/20 border-purple-400/20' 
                  : 'bg-gray-100 border-gray-200'
              }`}>
                {msg.role === 'assistant' ? (
                  <Bot className="w-6 h-6 text-white" />
                ) : (
                  <UserIcon className="w-6 h-6 text-slate-500" />
                )}
              </div>
              
              <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-sm font-extrabold ${msg.role === 'assistant' ? 'text-[#6D28D9]' : 'text-slate-700'}`}>
                    {msg.role === 'assistant' ? 'الأستاذ الذكي' : 'أنت'}
                  </span>
                </div>
                <div className={`px-6 py-4 rounded-3xl shadow-sm text-[15px] leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'assistant' 
                    ? 'bg-white border border-[#6D28D9]/20 text-slate-800 rounded-tr-sm' 
                    : 'bg-[#6D28D9] text-white rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>

            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6D28D9] to-purple-600 flex items-center justify-center shrink-0 shadow-sm border border-purple-400/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col items-start max-w-[85%]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-extrabold text-[#6D28D9]">الأستاذ الذكي</span>
                </div>
                <div className="px-6 py-5 rounded-3xl rounded-tr-sm bg-white border border-[#6D28D9]/20 shadow-sm flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#6D28D9]/60 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-[#6D28D9]/60 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-[#6D28D9]/60 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Recommended Questions (only show if empty chat or initial) */}
        {messages.length === 1 && !isLoading && (
          <div className="px-6 md:px-8 pb-4 flex gap-2 flex-wrap relative z-10">
            <button onClick={() => handleSend("شرح نظرية طالس")} className="text-xs font-bold bg-white border border-gray-200 text-slate-600 px-4 py-2.5 rounded-full hover:bg-[#6D28D9]/5 hover:border-[#6D28D9]/30 hover:text-[#6D28D9] transition-all shadow-sm">
              شرح نظرية طالس
            </button>
            <button onClick={() => handleSend("ما هو الـ DNA؟")} className="text-xs font-bold bg-white border border-gray-200 text-slate-600 px-4 py-2.5 rounded-full hover:bg-[#6D28D9]/5 hover:border-[#6D28D9]/30 hover:text-[#6D28D9] transition-all shadow-sm">
              ما هو الـ DNA؟
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-white border-t border-gray-100 relative z-10 shrink-0">
          <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-gray-50/50 rounded-2xl p-2 border border-gray-200 shadow-inner focus-within:border-[#6D28D9] focus-within:ring-4 focus-within:ring-[#6D28D9]/10 transition-all focus-within:bg-white">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اطرح سؤالك هنا بصيغة واضحة..." 
              className="flex-1 bg-transparent border-none focus:outline-none px-4 text-[15px] font-medium text-slate-700 placeholder-gray-400"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-[#6D28D9] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#5b21b6] hover:shadow-lg hover:shadow-[#6D28D9]/20 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إرسال
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
