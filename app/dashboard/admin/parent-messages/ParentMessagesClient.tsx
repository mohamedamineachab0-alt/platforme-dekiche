"use client";

import { useState } from "react";
import { MessageSquare, User, Calendar, CheckCircle, Clock } from "lucide-react";
import { closeParentTicket } from "@/actions/admin-parents";

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
  parent: {
    fullName: string;
    phoneNumber: string;
  };
};

export function ParentMessagesClient({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleClose = async (id: string) => {
    setLoadingId(id);
    const res = await closeParentTicket(id);
    if (res.success) {
      setTickets(tickets.map(t => t.id === id ? { ...t, status: "CLOSED" } : t));
    }
    setLoadingId(null);
  };

  const openTickets = tickets.filter(t => t.status !== "CLOSED");
  const closedTickets = tickets.filter(t => t.status === "CLOSED");

  return (
    <div className="space-y-8 font-arabic" dir="rtl">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 font-bold text-sm mb-1">الرسائل الجديدة (المفتوحة)</p>
            <p className="text-3xl font-black text-amber-600">{openTickets.length}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
            <Clock className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 font-bold text-sm mb-1">الرسائل المغلقة</p>
            <p className="text-3xl font-black text-emerald-600">{closedTickets.length}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-900">صندوق الوارد ({tickets.length})</h2>

        {tickets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="font-black text-xl text-slate-700">لا توجد رسائل حالياً</h3>
            <p className="text-slate-500 font-medium mt-2">صندوق الوارد فارغ. لم يقم أي ولي بإرسال رسائل للإدارة.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className={`bg-white rounded-2xl border p-6 transition-shadow shadow-sm hover:shadow-md ${
                  ticket.status === "CLOSED" ? "border-slate-100 opacity-70" : "border-sky-100 border-l-4 border-l-sky-500"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  {/* Left Side: Parent Info & Message */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{ticket.parent.fullName}</h4>
                        <p className="text-xs font-mono text-slate-500" dir="ltr">{ticket.parent.phoneNumber}</p>
                      </div>
                      <div className="mr-4 flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(ticket.createdAt).toLocaleDateString("ar-DZ")} - {new Date(ticket.createdAt).toLocaleTimeString("ar-DZ")}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <h5 className="font-black text-sm text-slate-900 mb-2 flex items-center gap-2">
                        الموضوع: {ticket.subject}
                      </h5>
                      <p className="text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                        {ticket.message}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Actions */}
                  <div className="flex flex-row md:flex-col items-center justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 md:border-r border-slate-100 md:pr-6 md:w-48">
                    {ticket.status === "CLOSED" ? (
                      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 font-bold text-sm w-full justify-center">
                        <CheckCircle className="w-4 h-4" />
                        مغلقة
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 font-bold text-sm w-full justify-center">
                          <Clock className="w-4 h-4" />
                          قيد الانتظار
                        </div>
                        <button
                          onClick={() => handleClose(ticket.id)}
                          disabled={loadingId === ticket.id}
                          className="w-full text-center text-sky-600 hover:text-white border border-sky-200 hover:bg-sky-600 font-bold py-2 px-4 rounded-xl transition-colors text-sm disabled:opacity-50"
                        >
                          {loadingId === ticket.id ? "جاري الإغلاق..." : "تحديد كـ مقروءة ومغلقة"}
                        </button>
                      </>
                    )}
                  </div>
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
