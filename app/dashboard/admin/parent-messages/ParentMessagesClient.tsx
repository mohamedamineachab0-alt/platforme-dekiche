"use client";

import { useState } from "react";
import { MessageSquare, User, Calendar, CheckCircle, Clock, Send, GraduationCap } from "lucide-react";
import { closeParentTicket, replyToParentTicket } from "@/actions/admin-parents";

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  adminReply: string | null;
  createdAt: Date;
  parent: {
    fullName: string;
    phoneNumber: string;
    parentLinks: {
      student: {
        fullName: string;
      }
    }[];
  };
};

export function ParentMessagesClient({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyContents, setReplyContents] = useState<{ [key: string]: string }>({});

  const handleClose = async (id: string) => {
    setReplyingId(id); // Use replyingId for loading state of close as well
    const res = await closeParentTicket(id);
    if (res.success) {
      setTickets(tickets.map(t => t.id === id ? { ...t, status: "CLOSED" } : t));
    }
    setReplyingId(null);
  };

  const handleReplySubmit = async (id: string) => {
    const content = replyContents[id] || "";
    if (!content.trim()) return;

    setReplyingId(id);
    const res = await replyToParentTicket(id, content);
    if (res.success) {
      setTickets(tickets.map(t => t.id === id ? { ...t, status: "ANSWERED", adminReply: content } : t));
    } else {
      alert(res.error || "حدث خطأ");
    }
    setReplyingId(null);
  };

  const openTickets = tickets.filter(t => t.status === "OPEN");
  const answeredTickets = tickets.filter(t => t.status === "ANSWERED");
  const closedTickets = tickets.filter(t => t.status === "CLOSED");

  return (
    <div className="relative font-arabic" dir="rtl">
      
      {/* Neo-Brutalism Graph Paper Background */}
      <div 
        className="fixed inset-0 z-[-1] pointer-events-none opacity-20 bg-white"
        style={{
          backgroundImage: `
            linear-gradient(to right, #9333ea 1px, transparent 1px),
            linear-gradient(to bottom, #9333ea 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      ></div>

      <div className="space-y-12 pb-12">
        {/* Stats Row Neo-Brutalist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border-black border-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 rounded-none flex items-center justify-between">
            <div>
              <p className="text-black font-black text-sm mb-1 uppercase tracking-wider">جديدة (مفتوحة)</p>
              <p className="text-4xl font-black text-purple-600">{openTickets.length}</p>
            </div>
            <Clock className="w-10 h-10 text-black" />
          </div>
          
          <div className="bg-white border-black border-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 rounded-none flex items-center justify-between">
            <div>
              <p className="text-black font-black text-sm mb-1 uppercase tracking-wider">تم الرد</p>
              <p className="text-4xl font-black text-green-500">{answeredTickets.length}</p>
            </div>
            <Send className="w-10 h-10 text-black" />
          </div>

          <div className="bg-white border-black border-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 rounded-none flex items-center justify-between">
            <div>
              <p className="text-black font-black text-sm mb-1 uppercase tracking-wider">مغلقة</p>
              <p className="text-4xl font-black text-black">{closedTickets.length}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-black" />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-black text-black bg-purple-200 inline-block px-4 py-2 border-black border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            صندوق الرسائل ({tickets.length})
          </h2>

          {tickets.length === 0 ? (
            <div className="text-center py-20 bg-white border-black border-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <MessageSquare className="w-20 h-20 text-purple-600 mx-auto mb-4 stroke-[1.5]" />
              <h3 className="font-black text-3xl text-black uppercase">الصندوق فارغ</h3>
              <p className="text-black font-bold mt-2 text-lg">لا توجد رسائل حالياً من أولياء الأمور.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {tickets.map((ticket) => {
                const isReplying = replyingId === ticket.id;
                const studentNames = ticket.parent.parentLinks?.map(l => l.student.fullName).join("، ") || "غير متوفر";

                return (
                  <div 
                    key={ticket.id} 
                    className="bg-white border-black border-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full transition-transform hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {/* Card Header */}
                    <div className="p-6 border-b-2 border-black bg-purple-50 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-200 border-black border-2 flex items-center justify-center shrink-0">
                            <User className="w-6 h-6 text-black" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-purple-600 uppercase mb-0.5">اسم الولي</p>
                            <h4 className="font-black text-black text-lg leading-none">{ticket.parent.fullName}</h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white border-black border-2 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-black" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-purple-600 uppercase mb-0.5">اسم الابن</p>
                            <h4 className="font-black text-black text-base leading-none">{studentNames}</h4>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {ticket.status === "OPEN" && (
                          <span className="bg-purple-600 text-white font-black px-3 py-1 border-black border-2 text-sm uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            جديدة
                          </span>
                        )}
                        {ticket.status === "ANSWERED" && (
                          <span className="bg-green-400 text-black font-black px-3 py-1 border-black border-2 text-sm uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            تم الرد
                          </span>
                        )}
                        {ticket.status === "CLOSED" && (
                          <span className="bg-slate-200 text-slate-500 font-black px-3 py-1 border-slate-400 border-2 text-sm uppercase">
                            مغلقة
                          </span>
                        )}
                        
                        <div className="flex items-center gap-1.5 text-xs font-bold text-black bg-white px-2 py-1 border-black border-2">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(ticket.createdAt).toLocaleDateString("ar-DZ")}
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex-1 bg-white">
                      <h5 className="font-black text-xl text-black mb-4">
                        {ticket.subject}
                      </h5>
                      <div className="p-4 bg-slate-50 border-black border-2 shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)]">
                        <p className="text-black font-bold leading-relaxed whitespace-pre-wrap">
                          {ticket.message}
                        </p>
                      </div>

                      {ticket.adminReply && (
                        <div className="mt-4 p-4 bg-purple-100 border-black border-2 relative">
                          <span className="absolute -top-3 right-4 bg-black text-white px-2 py-0.5 text-xs font-black uppercase">رد الإدارة</span>
                          <p className="text-black font-bold leading-relaxed whitespace-pre-wrap pt-2">
                            {ticket.adminReply}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Card Footer (Reply Section) */}
                    {ticket.status === "OPEN" && (
                      <div className="p-6 border-t-2 border-black bg-white space-y-4">
                        <textarea
                          placeholder="اكتب الرد هنا..."
                          rows={3}
                          className="w-full p-4 border-black border-2 font-bold text-black focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow resize-none bg-yellow-50"
                          value={replyContents[ticket.id] || ""}
                          onChange={(e) => setReplyContents({ ...replyContents, [ticket.id]: e.target.value })}
                        />
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleReplySubmit(ticket.id)}
                            disabled={isReplying || !replyContents[ticket.id]?.trim()}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-black py-3 px-4 border-black border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:hover:translate-y-0 uppercase tracking-wider flex items-center justify-center gap-2"
                          >
                            {isReplying ? "جاري الإرسال..." : (
                              <>
                                <Send className="w-5 h-5" />
                                إرسال الرد
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleClose(ticket.id)}
                            disabled={isReplying}
                            className="bg-white hover:bg-slate-100 text-black font-black py-3 px-4 border-black border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] transition-all disabled:opacity-50 uppercase"
                            title="إغلاق بدون رد"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
