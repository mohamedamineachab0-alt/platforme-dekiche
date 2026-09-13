"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Download,
  Languages,
  Loader2,
  Send,
  User,
} from "lucide-react";
import { toPng } from "html-to-image";
import { IconBot, IconCards, IconMapPin } from "@/components/landing/PlayIcons";
import { MathRenderer } from "@/components/MathRenderer";

type ChatMessage = { role: "user" | "assistant"; content: string };

type MindMapNode = {
  title: string;
  children?: MindMapNode[];
};

type LessonAiToolsProps = {
  lessonId: string;
  lessonTitle: string;
  subjectTitle: string;
  description?: string | null;
  materialTitles: string[];
  studentName?: string;
  studentLevel?: string;
  studentStream?: string;
  studentPoints?: number;
  studentMistakes?: string;
};

function RichNodeTitle({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          return <MathRenderer key={i} math={part.slice(1, -1)} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function RichTextBlock({ text }: { text: string }) {
  return (
    <div className="space-y-2.5 text-[13px] sm:text-sm md:text-base font-medium leading-relaxed text-[#1E1B4B] break-words">
      {text.split("\n").map((line, lineIdx) => (
        <p key={lineIdx} className={line.trim() ? "whitespace-pre-wrap" : "h-2"}>
          <RichNodeTitle text={line} />
        </p>
      ))}
    </div>
  );
}

function MindMapBranch({
  node,
  depth = 0,
  dir = "rtl",
}: {
  node: MindMapNode;
  depth?: number;
  dir?: "rtl" | "ltr";
}) {
  const isRoot = depth === 0;
  const children = node.children || [];

  return (
    <div className={`flex flex-col items-center ${isRoot ? "gap-4" : "gap-2.5"} w-full`} dir={dir}>
      <div
        className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl font-bold text-center shadow-sm border max-w-full break-words ${
          isRoot
            ? "bg-[#6D28D9] text-white border-[#5B21B6] text-sm sm:text-base"
            : depth === 1
              ? "bg-[#6D28D9] text-white border-[#5B21B6] text-xs sm:text-sm"
              : "bg-white text-[#1E1B4B] border-[#EDE9FE] text-[11px] sm:text-xs"
        }`}
      >
        <RichNodeTitle text={node.title} />
      </div>

      {children.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 sm:gap-4 w-full">
          {children.map((child, idx) => (
            <div
              key={`${child.title}-${idx}`}
              className="flex flex-col items-center w-full sm:w-auto sm:min-w-[120px] sm:max-w-[200px]"
            >
              <div className="w-px h-3 bg-[#A8B4D6] hidden sm:block" />
              <MindMapBranch node={child} depth={depth + 1} dir={dir} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function LessonAiTools({
  lessonId,
  lessonTitle,
  subjectTitle,
  description,
  materialTitles,
  studentName,
  studentLevel,
  studentStream,
  studentPoints,
  studentMistakes,
}: LessonAiToolsProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const [tree, setTree] = useState<MindMapNode | null>(null);
  const [mapLang, setMapLang] = useState<"rtl" | "ltr">("rtl");
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [downloadingMap, setDownloadingMap] = useState(false);

  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLang, setSummaryLang] = useState<"rtl" | "ltr">("rtl");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatLoading]);

  async function handleChatSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || chatLoading) return;

    const prompt = input.trim();
    setInput("");
    setChatLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);

    try {
      const res = await fetch("/api/lesson-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          messages,
          prompt,
          studentName,
          studentLevel,
          studentStream,
          studentPoints,
          studentMistakes,
          lessonTitle,
          subjectTitle,
          description,
          materialTitles,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الاتصال");

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err?.message || "حدث خطأ أثناء الاتصال بالمساعد الذكي",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  async function generateMindMap() {
    setMapLoading(true);
    setMapError(null);
    try {
      const res = await fetch("/api/lesson-mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, studentLevel, studentStream }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل إنشاء الخريطة");
      setTree(data.tree);
      setMapLang(data.language && data.language !== "ar" ? "ltr" : "rtl");
    } catch (err: any) {
      setMapError(err?.message || "تعذر إنشاء الخريطة الذهنية");
      setTree(null);
    } finally {
      setMapLoading(false);
    }
  }

  async function generateSummary() {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const res = await fetch("/api/lesson-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, studentLevel, studentStream }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل إنشاء التلخيص");
      setSummary(data.summary);
      setSummaryLang(data.language && data.language !== "ar" ? "ltr" : "rtl");
    } catch (err: any) {
      setSummaryError(err?.message || "تعذر إنشاء تلخيص الدرس");
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }

  async function translateSummaryToArabic() {
    if (!summary || translating) return;
    setTranslating(true);
    setSummaryError(null);
    try {
      const res = await fetch("/api/lesson-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          mode: "translate",
          text: summary,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الترجمة");
      setSummary(data.summary);
      setSummaryLang("rtl");
    } catch (err: any) {
      setSummaryError(err?.message || "تعذر ترجمة التلخيص");
    } finally {
      setTranslating(false);
    }
  }

  async function downloadSummaryPdf() {
    if (!summaryRef.current || !summary) return;
    setPdfLoading(true);
    setSummaryError(null);
    try {
      const dataUrl = await toPng(summaryRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        cacheBust: true,
      });

      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("فشل تحميل الصورة"));
        img.src = dataUrl;
      });

      const imgHeight = (img.height * usableWidth) / img.width;
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(dataUrl, "PNG", margin, position, usableWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        position = margin - (imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", margin, position, usableWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      const safeName =
        lessonTitle.replace(/[^\u0600-\u06FFa-zA-Z0-9-_ ]/g, "").trim() || "درس";
      pdf.save(`تلخيص-${safeName}.pdf`);
    } catch (err) {
      console.error(err);
      setSummaryError("حدث خطأ أثناء تحميل ملف PDF");
    } finally {
      setPdfLoading(false);
    }
  }

  async function downloadMindMap() {
    if (!mapRef.current || !tree) return;
    setDownloadingMap(true);
    try {
      const dataUrl = await toPng(mapRef.current, {
        backgroundColor: "#F7F5FF",
        pixelRatio: 2,
        cacheBust: true,
      });
      const safeName =
        lessonTitle.replace(/[^\u0600-\u06FFa-zA-Z0-9-_ ]/g, "").trim() || "درس";
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `خريطة-${safeName}.png`;
      link.click();
    } catch (err) {
      console.error(err);
      setMapError("حدث خطأ أثناء تحميل الصورة");
    } finally {
      setDownloadingMap(false);
    }
  }

  const actions = [
    {
      key: "chat",
      title: "اسأل عن الدرس",
      desc: "اطرح سؤالاً عن مفاهيم هذا الدرس",
      icon: <IconBot size="xs" />,
      btn: chatOpen ? "إخفاء المحادثة" : "ابدأ السؤال",
      onClick: () => setChatOpen((v) => !v),
      loading: false,
      className: "bg-[#6D28D9] text-white",
    },
    {
      key: "summary",
      title: "تلخيص الدرس",
      desc: "تلخيص منظم للمراجعة السريعة",
      icon: <IconCards size="xs" />,
      btn: summaryLoading
        ? "جاري التلخيص..."
        : summary
          ? "إعادة التلخيص"
          : "تلخيص الدرس",
      onClick: generateSummary,
      loading: summaryLoading,
      className: "bg-[#6D28D9] text-white",
    },
    {
      key: "map",
      title: "خريطة ذهنية",
      desc: "خريطة بصرية + تحميل صورة",
      icon: <IconMapPin size="xs" />,
      btn: mapLoading
        ? "جاري التوليد..."
        : tree
          ? "إعادة التوليد"
          : "توليد الخريطة",
      onClick: generateMindMap,
      loading: mapLoading,
      className: "bg-[#6D28D9] text-white",
    },
  ] as const;

  return (
    <section
      className="space-y-4 sm:space-y-5 pt-2 w-full min-w-0"
      dir="rtl"
      style={{ fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}
    >
      <div className="px-1">
        <h2 className="text-lg sm:text-xl font-black text-[#1E1B4B]">أدوات الدرس</h2>
        <p className="text-xs sm:text-sm font-medium text-[#6B6480] mt-0.5">
          اسأل، لخّص، أو أنشئ خريطة ذهنية لهذا الدرس
        </p>
      </div>

      {/* Compact action list — mobile-first */}
      <div className="space-y-2.5 sm:space-y-3">
        {actions.map((action) => (
          <div
            key={action.key}
            className="bg-white rounded-2xl border border-[#EDE9FE] shadow-sm p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 min-w-0"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="shrink-0">{action.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-[#1E1B4B] text-sm truncate">
                  {action.title}
                </h3>
                <p className="text-[11px] font-medium text-[#6B6480] mt-0.5 line-clamp-2">
                  {action.desc}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={action.onClick}
              disabled={action.loading}
              className={`w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 font-black text-xs sm:text-sm px-3 sm:px-4 py-2.5 rounded-xl disabled:opacity-60 whitespace-nowrap ${action.className}`}
            >
              {action.loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {action.btn}
            </button>
          </div>
        ))}
      </div>

      {/* Chat */}
      {chatOpen && (
        <div className="bg-white rounded-2xl sm:rounded-[28px] border border-[#EDE9FE] shadow-sm overflow-hidden flex flex-col h-[min(70vh,480px)] min-w-0">
          <div className="px-4 py-3 border-b border-[#EDE9FE] bg-[#F7F5FF] flex items-center gap-2.5 min-w-0">
            <IconBot size="xs" />
            <div className="min-w-0">
              <p className="font-black text-[#1E1B4B] text-xs sm:text-sm truncate">
                مساعد: {lessonTitle}
              </p>
              <p className="text-[11px] font-medium text-[#6B6480] truncate">{subjectTitle}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 space-y-3 bg-[#F7F5FF]/50">
            {messages.length === 0 && (
              <div className="text-center py-8 px-3">
                <p className="font-bold text-[#1E1B4B] text-sm">اسأل عن هذا الدرس</p>
                <p className="text-xs text-[#6B6480] mt-1.5 font-medium leading-relaxed">
                  مثال: ما الفكرة الأساسية؟ أو أهم نقاط المراجعة
                </p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 max-w-[92%] min-w-0 ${
                  msg.role === "user" ? "mr-auto flex-row-reverse" : "ml-auto"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex shrink-0 items-center justify-center ${
                    msg.role === "user"
                      ? "bg-white border border-[#EDE9FE]"
                      : "bg-[#6D28D9]"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-3.5 h-3.5 text-[#6B6480]" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                <div
                  className={`px-3 py-2.5 rounded-2xl text-[13px] sm:text-sm font-medium leading-relaxed whitespace-pre-wrap break-words min-w-0 ${
                    msg.role === "user"
                      ? "bg-white border border-[#EDE9FE] text-[#1E1B4B] rounded-tl-md"
                      : "bg-[#6D28D9] text-white rounded-tr-md"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex gap-2 items-center text-[#6B6480] text-xs font-bold">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6D28D9]" />
                جاري الرد...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleChatSubmit}
            className="p-2.5 sm:p-3 border-t border-[#EDE9FE] bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={chatLoading}
              placeholder="اكتب سؤالك..."
              className="flex-1 min-w-0 px-3 py-2.5 bg-[#F7F5FF] border border-[#EDE9FE] rounded-xl text-[#1E1B4B] font-bold text-sm placeholder:text-[#A8B4D6] focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 disabled:opacity-50"
              dir="rtl"
            />
            <button
              type="submit"
              disabled={chatLoading || !input.trim()}
              className="bg-[#6D28D9] hover:bg-[#5B21B6] disabled:opacity-40 text-white font-black p-2.5 rounded-xl shrink-0"
              aria-label="إرسال"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Summary */}
      {(summary || summaryError) && (
        <div className="bg-white rounded-2xl sm:rounded-[28px] border border-[#EDE9FE] shadow-sm p-4 sm:p-6 space-y-3 sm:space-y-4 min-w-0">
          <div className="space-y-3">
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-[#1E1B4B]">تلخيص الدرس</h3>
              <p className="text-xs sm:text-sm text-[#6B6480] font-medium truncate">{lessonTitle}</p>
            </div>

            {summary && (
              <div className={`grid gap-2 ${summaryLang !== "rtl" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                <button
                  type="button"
                  onClick={downloadSummaryPdf}
                  disabled={pdfLoading}
                  className="inline-flex w-full items-center justify-center gap-2 bg-[#6D28D9] hover:bg-[#5B21B6] disabled:opacity-50 text-white font-black px-3 py-2.5 rounded-xl text-xs sm:text-sm"
                >
                  {pdfLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  تحميل PDF
                </button>
                {summaryLang !== "rtl" && (
                  <button
                    type="button"
                    onClick={translateSummaryToArabic}
                    disabled={translating}
                    className="inline-flex w-full items-center justify-center gap-2 bg-[#6D28D9] hover:bg-[#5B21B6] disabled:opacity-50 text-white font-black px-3 py-2.5 rounded-xl text-xs sm:text-sm"
                  >
                    {translating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Languages className="w-4 h-4" />
                    )}
                    ترجمة للعربية
                  </button>
                )}
              </div>
            )}
          </div>

          {summaryError && (
            <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 font-bold text-xs sm:text-sm">
              {summaryError}
            </p>
          )}

          {summary && (
            <div
              ref={summaryRef}
              className="rounded-xl sm:rounded-2xl bg-[#F7F5FF] border border-[#EDE9FE] p-3.5 sm:p-5 overflow-x-auto"
              dir={summaryLang}
            >
              <div className="mb-3 pb-2 border-b border-[#EDE9FE]">
                <p className="font-black text-[#1E1B4B] text-sm">{lessonTitle}</p>
                <p className="text-[11px] font-medium text-[#6B6480]">{subjectTitle} • منصة دقيش</p>
              </div>
              <RichTextBlock text={summary} />
            </div>
          )}
        </div>
      )}

      {/* Mind map */}
      {(tree || mapError) && (
        <div className="bg-white rounded-2xl sm:rounded-[28px] border border-[#EDE9FE] shadow-sm p-4 sm:p-6 space-y-3 sm:space-y-4 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-[#1E1B4B]">الخريطة الذهنية</h3>
              <p className="text-xs sm:text-sm text-[#6B6480] font-medium truncate">{lessonTitle}</p>
            </div>
            {tree && (
              <button
                type="button"
                onClick={downloadMindMap}
                disabled={downloadingMap}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-[#6D28D9] hover:bg-[#5B21B6] disabled:opacity-50 text-white font-black px-3 py-2.5 rounded-xl text-xs sm:text-sm"
              >
                {downloadingMap ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                تحميل الصورة
              </button>
            )}
          </div>

          {mapError && (
            <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 font-bold text-xs sm:text-sm">
              {mapError}
            </p>
          )}

          {tree && (
            <div
              ref={mapRef}
              className="overflow-x-auto rounded-xl sm:rounded-2xl bg-[#F7F5FF] border border-[#EDE9FE] p-3 sm:p-6"
              dir={mapLang}
            >
              <MindMapBranch node={tree} dir={mapLang} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
