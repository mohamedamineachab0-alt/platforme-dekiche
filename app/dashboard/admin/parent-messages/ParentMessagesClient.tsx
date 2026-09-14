"use client";

import { useState } from "react";
import {
  MessageSquare,
  User,
  Calendar,
  CheckCircle,
  Clock,
  Send,
  GraduationCap,
  Phone,
} from "lucide-react";
import { closeParentTicket, replyToParentTicket } from "@/actions/admin-parents";

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  adminReply: string | null;
  createdAt: string;
  parent: {
    fullName: string;
    phoneNumber: string;
    parentLinks: {
      student: {
        fullName: string;
      };
    }[];
  };
};

export function ParentMessagesClient({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [replyContents, setReplyContents] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const handleClose = async (id: string) => {
    setError(null);
    setBusyId(id);
    const res = await closeParentTicket(id);
    if (res.success) {
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status: "CLOSED" } : t)));
    } else {
      setError(res.error || "تعذر إغلاق الرسالة");
    }
    setBusyId(null);
  };

  const handleReplySubmit = async (id: string) => {
    const content = replyContents[id] || "";
    if (!content.trim()) return;

    setError(null);
    setBusyId(id);
    const res = await replyToParentTicket(id, content);
    if (res.success) {
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: "ANSWERED", adminReply: content } : t))
      );
      setReplyContents((prev) => ({ ...prev, [id]: "" }));
    } else {
      setError(res.error || "حدث خطأ أثناء الرد");
    }
    setBusyId(null);
  };

  const openTickets = tickets.filter((t) => t.status === "OPEN");
  const answeredTickets = tickets.filter((t) => t.status === "ANSWERED");
  const closedTickets = tickets.filter((t) => t.status === "CLOSED");

  const stats = [
    { label: "جديدة", value: openTickets.length, icon: Clock, tone: "text-[#6D28D9]" },
    { label: "تم الرد", value: answeredTickets.length, icon: Send, tone: "text-emerald-600" },
    { label: "مغلقة", value: closedTickets.length, icon: CheckCircle, tone: "text-[#6B6480]" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between rounded-[24px] border border-[#EDE9FE] bg-white p-5 shadow-[0_10px_28px_rgba(30,27,75,0.05)]"
          >
            <div>
              <p className="text-xs font-bold text-[#6B6480]">{stat.label}</p>
              <p className={`mt-1 text-3xl font-black ${stat.tone}`}>{stat.value}</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F3EFFF] text-[#6D28D9]">
              <stat.icon className="h-5 w-5" />
            </span>
          </div>
        ))}
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        <h2 className="text-lg font-black text-[#1E1B4B]">
          صندوق الرسائل ({tickets.length})
        </h2>

        {tickets.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#EDE9FE] bg-white px-6 py-16 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-[#C4B5FD]" />
            <h3 className="mt-4 text-xl font-black text-[#1E1B4B]">الصندوق فارغ</h3>
            <p className="mt-2 text-sm font-medium text-[#6B6480]">
              لا توجد رسائل حالياً من أولياء الأمور.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {tickets.map((ticket) => {
              const busy = busyId === ticket.id;
              const studentNames =
                ticket.parent.parentLinks?.map((l) => l.student.fullName).join("، ") ||
                "غير متوفر";

              return (
                <article
                  key={ticket.id}
                  className="flex h-full flex-col overflow-hidden rounded-[28px] border border-[#EDE9FE] bg-white shadow-[0_12px_36px_rgba(30,27,75,0.06)]"
                >
                  <div className="flex flex-col gap-4 border-b border-[#EDE9FE] bg-[#F7F5FF] p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#6D28D9]">
                          <User className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-[11px] font-bold text-[#6B6480]">الولي</p>
                          <h4 className="font-black text-[#1E1B4B]">{ticket.parent.fullName}</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#6D28D9]">
                          <GraduationCap className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-[11px] font-bold text-[#6B6480]">الأبناء</p>
                          <h4 className="text-sm font-black text-[#1E1B4B]">{studentNames}</h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#6B6480]">
                        <Phone className="h-3.5 w-3.5" />
                        <span dir="ltr">{ticket.parent.phoneNumber}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                      {ticket.status === "OPEN" ? (
                        <span className="rounded-full bg-[#6D28D9] px-3 py-1 text-xs font-black text-white">
                          جديدة
                        </span>
                      ) : null}
                      {ticket.status === "ANSWERED" ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                          تم الرد
                        </span>
                      ) : null}
                      {ticket.status === "CLOSED" ? (
                        <span className="rounded-full bg-[#EDE9FE] px-3 py-1 text-xs font-black text-[#6B6480]">
                          مغلقة
                        </span>
                      ) : null}
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#6B6480]">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(ticket.createdAt).toLocaleDateString("ar-DZ")}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 p-5">
                    <h5 className="text-lg font-black text-[#1E1B4B]">{ticket.subject}</h5>
                    <div className="rounded-2xl border border-[#EDE9FE] bg-[#F7F5FF] p-4">
                      <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-[#1E1B4B]">
                        {ticket.message}
                      </p>
                    </div>

                    {ticket.adminReply ? (
                      <div className="rounded-2xl border border-[#DDD6FE] bg-[#F3EFFF] p-4">
                        <p className="mb-2 text-[11px] font-black text-[#6D28D9]">رد الإدارة</p>
                        <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-[#1E1B4B]">
                          {ticket.adminReply}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {ticket.status === "OPEN" ? (
                    <div className="space-y-3 border-t border-[#EDE9FE] p-5">
                      <textarea
                        placeholder="اكتب الرد هنا..."
                        rows={3}
                        className="w-full resize-none rounded-2xl border border-[#EDE9FE] bg-[#F7F5FF] p-4 text-sm font-medium text-[#1E1B4B] outline-none transition focus:border-[#6D28D9] focus:bg-white focus:ring-2 focus:ring-[#6D28D9]/20"
                        value={replyContents[ticket.id] || ""}
                        onChange={(e) =>
                          setReplyContents({ ...replyContents, [ticket.id]: e.target.value })
                        }
                      />
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleReplySubmit(ticket.id)}
                          disabled={busy || !replyContents[ticket.id]?.trim()}
                          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#6D28D9] py-3 text-sm font-black text-white transition hover:bg-[#5B21B6] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Send className="h-4 w-4" />
                          {busy ? "جاري الإرسال..." : "إرسال الرد"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleClose(ticket.id)}
                          disabled={busy}
                          title="إغلاق بدون رد"
                          className="inline-flex items-center justify-center rounded-full border border-[#EDE9FE] bg-white px-4 py-3 text-[#6B6480] transition hover:border-[#6D28D9] hover:text-[#6D28D9] disabled:opacity-60"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
