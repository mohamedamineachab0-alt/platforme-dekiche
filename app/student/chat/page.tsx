import { MessageCircle, Send, Users } from "lucide-react";
import Image from "next/image";

const MOCK_MESSAGES = [
  { id: 1, sender: "ياسين كريم", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yacine", time: "10:30 ص", content: "السلام عليكم، هل بدأ الأستاذ شرح درس الدوال؟", isMe: false },
  { id: 2, sender: "فاطمة الزهراء", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima", time: "10:32 ص", content: "وعليكم السلام، نعم بدأ للتو في الجزء الثاني.", isMe: false },
  { id: 3, sender: "أنت", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amin", time: "10:35 ص", content: "شكراً فاطمة، سألتحق الآن.", isMe: true },
];

export default function StudentChatPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-50 text-green-600 rounded-2xl shadow-sm">
            <MessageCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">دردشة القسم</h2>
            <p className="text-slate-500 text-sm">تواصل مع زملائك في قسم الرابعة متوسط</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm text-sm font-bold text-slate-600">
          <Users className="w-4 h-4 text-green-500" />
          32 متصل
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-md border border-gray-100 flex flex-col overflow-hidden relative">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar bg-slate-50/30">
          <div className="text-center text-xs font-bold text-gray-400 bg-white border border-gray-100 py-1.5 px-4 rounded-full mx-auto w-max mb-8 shadow-sm">اليوم</div>
          
          {MOCK_MESSAGES.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-white overflow-hidden border-2 border-white shadow-sm shrink-0">
                <Image src={msg.avatar} alt={msg.sender} width={40} height={40} />
              </div>
              <div className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                <div className={`flex items-center gap-2 mb-1.5 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                  <span className="text-xs font-bold text-slate-600">{msg.sender}</span>
                  <span className="text-[10px] font-semibold text-gray-400">{msg.time}</span>
                </div>
                <div className={`px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
                  msg.isMe 
                    ? 'bg-[#6D28D9] text-white rounded-2xl rounded-tr-sm' 
                    : 'bg-white text-slate-700 rounded-2xl rounded-tl-sm border border-gray-100'
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Input Area strictly bounded at the bottom */}
        <div className="p-4 md:p-6 bg-white border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-3 bg-gray-50/50 rounded-2xl p-2 border border-gray-200 shadow-inner focus-within:border-[#6D28D9] focus-within:ring-4 focus-within:ring-[#6D28D9]/10 transition-all focus-within:bg-white">
            <input 
              type="text" 
              placeholder="اكتب رسالتك هنا..." 
              className="flex-1 bg-transparent border-none focus:outline-none px-4 text-[15px] font-medium text-slate-700 placeholder-gray-400"
            />
            <button className="bg-[#6D28D9] text-white p-3.5 rounded-xl hover:bg-[#5b21b6] transition-colors shadow-md shadow-[#6D28D9]/20 flex items-center justify-center group">
              <Send className="w-5 h-5 rtl:-ml-1 rtl:rotate-180 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
