"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BookOpenCheck,
  Clock3,
  LineChart,
  ShieldCheck,
} from "lucide-react";

type SubjectProgress = {
  subjectId: string;
  subjectTitle: string;
  completedLessons: number;
  totalLessons: number;
  completionPercent: number;
};

type TimelineItem = {
  id: string;
  type: "watch" | "lesson" | "quiz";
  title: string;
  subtitle: string;
  at: string;
};

type LmsStats = {
  watchTime: { hours: number; minutes: number; totalSeconds: number };
  completedLessonsTotal: number;
  subjectProgress: SubjectProgress[];
  averageQuizScore: number | null;
  timeline: TimelineItem[];
  parentSummary: {
    watchHours: number;
    watchMinutes: number;
    completedLessons: number;
    averageQuizScore: number | null;
    efficiencyNote: string;
  };
  hasAnyData: boolean;
};

const TITLE = "لوحة الحصيلة الدراسية";
const WATCH_LABEL = "ساعات المشاهدة الفعلية";
const LESSONS_LABEL = "الدروس المنجزة بالكامل";
const CHART_TITLE = "نسبة التقدم لكل مادة";
const PARENT_TITLE = "متابعة الولي";
const PARENT_DESC = "تقرير دقيق لنشاط التلميذ ونتائج الاختبارات الرسمية";
const TIMELINE_TITLE = "النشاطات الأخيرة";
const EMPTY = "شاهد الدروس لتبدأ إحصائياتك بالظهور";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, duration: 0.32, ease: "easeOut" as const },
  }),
};

const BAR_COLORS = ["#4C1D95", "#5B21B6", "#6D28D9", "#7C3AED", "#A78BFA"];

function formatClock(hours: number, minutes: number) {
  if (hours <= 0 && minutes <= 0) return "0 ساعة";
  if (hours <= 0) return `${minutes} دقيقة`;
  if (minutes <= 0) return `${hours} ساعة`;
  return `${hours} ساعة و ${minutes} دقيقة`;
}

function formatDay(iso: string) {
  try {
    const d = new Date(iso);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const hour = String(d.getHours()).padStart(2, "0");
    const minute = String(d.getMinutes()).padStart(2, "0");
    return `${day} ${month} الساعة ${hour} ${minute}`;
  } catch {
    return "";
  }
}

function ChartIllustration() {
  return (
    <svg viewBox="0 0 360 160" className="h-40 w-full text-[#6D28D9]/80" aria-hidden>
      <defs>
        <linearGradient id="lmsBarFillPurple" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#5B21B6" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {[28, 56, 84, 112, 140, 168, 196, 224, 252, 280, 308, 336].map((x) => (
        <line key={x} x1={x} y1={20} x2={x} y2={140} stroke="#EDE9FE" strokeWidth="1" />
      ))}
      {[40, 70, 100, 130].map((y) => (
        <line key={y} x1={24} y1={y} x2={348} y2={y} stroke="#EDE9FE" strokeWidth="1" />
      ))}
      {[
        [48, 88],
        [96, 54],
        [144, 72],
        [192, 36],
        [240, 62],
        [288, 48],
      ].map(([x, h], i) => (
        <rect
          key={i}
          x={x}
          y={140 - h}
          width={28}
          height={h}
          rx={6}
          fill="url(#lmsBarFillPurple)"
        />
      ))}
      <path
        d="M48 108 C96 92 120 70 144 82 C180 98 200 50 240 58 C268 64 288 44 316 40"
        fill="none"
        stroke="#6D28D9"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EfficiencyRing({ score }: { score: number | null }) {
  const value = score == null ? 0 : Math.max(0, Math.min(100, Math.round((score / 20) * 100)));
  const data = [
    { name: "score", value: Math.max(value, 0.01) },
    { name: "rest", value: Math.max(100 - value, 0.01) },
  ];

  return (
    <div className="relative mx-auto h-28 w-28">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={34}
            outerRadius={46}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            <Cell fill="#A78BFA" />
            <Cell fill="#1E1B4B" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-lg font-black text-white">
          {score == null ? "0" : score}
        </p>
        <p className="text-[10px] font-bold text-slate-400">من 20</p>
      </div>
    </div>
  );
}

export function MainStudyDashboard({ studentId }: { studentId?: string }) {
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<LmsStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const qs = studentId ? `?studentId=${encodeURIComponent(studentId)}` : "";
    fetch(`/api/lms-stats${qs}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "تعذر التحميل");
        if (!cancelled) setStats(data as LmsStats);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "تعذر التحميل");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const chartData =
    stats?.subjectProgress.map((row) => ({
      name: row.subjectTitle.slice(0, 10),
      fullName: row.subjectTitle,
      value: row.completionPercent,
      completed: row.completedLessons,
      total: row.totalLessons,
    })) ?? [];

  const totalLessonsAcross = chartData.reduce((sum, row) => sum + row.total, 0);
  const overallPercent =
    totalLessonsAcross > 0
      ? Math.round(
          (chartData.reduce((sum, row) => sum + row.completed, 0) / totalLessonsAcross) * 100
        )
      : 0;

  return (
    <div className="space-y-5 font-sans text-[#1E1B4B]" dir="rtl">
      <motion.header
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[28px] border border-[#EDE9FE] bg-gradient-to-l from-[#F7F5FF] via-white to-[#EDE9FE]/80 p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-xl bg-[#6D28D9] px-3 py-1.5 text-[11px] font-black text-white">
              <LineChart className="h-3.5 w-3.5" />
              تقرير الأداء الدراسي
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#1E1B4B] sm:text-3xl">
              {TITLE}
            </h1>
            <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-[#6B6480]">
              قياس دقيق لوقت المشاهدة وإنجاز الدروس ونتائج الاختبارات الرسمية
            </p>
          </div>
          <div className="rounded-2xl border border-[#EDE9FE] bg-white px-4 py-3 text-center shadow-sm">
            <p className="text-[10px] font-black text-[#6B6480]">نسبة الإنجاز العامة</p>
            <p className="mt-1 text-2xl font-black text-[#5B21B6]">{overallPercent} من 100</p>
          </div>
        </div>
      </motion.header>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-40 animate-pulse rounded-[24px] bg-[#F3EFFF] ${i > 2 ? "md:col-span-2" : ""}`}
            />
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="rounded-[20px] border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </p>
      ) : null}

      {!loading && stats ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial={reduce ? false : "hidden"}
            animate="show"
            className="relative overflow-hidden rounded-[24px] border border-[#5B21B6]/25 bg-[#6D28D9] p-5 text-white shadow-[0_16px_40px_rgba(109,40,217,0.22)] xl:col-span-2"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black text-[#DDD6FE]">{WATCH_LABEL}</p>
                <p className="mt-3 text-3xl font-black tabular-nums sm:text-4xl">
                  {formatClock(stats.watchTime.hours, stats.watchTime.minutes)}
                </p>
                <p className="mt-2 text-xs font-bold text-[#C4B5FD]/90">
                  {stats.watchTime.totalSeconds} ثانية مشاهدة مسجلة
                </p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <Clock3 className="h-6 w-6 text-[#DDD6FE]" />
              </span>
            </div>
          </motion.div>

          <motion.div
            custom={1}
            variants={fadeUp}
            initial={reduce ? false : "hidden"}
            animate="show"
            className="rounded-[24px] border border-[#EDE9FE] bg-white p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black text-[#6B6480]">{LESSONS_LABEL}</p>
                <p className="mt-3 text-3xl font-black tabular-nums text-[#1E1B4B]">
                  {stats.completedLessonsTotal}
                </p>
                <p className="mt-2 text-xs font-bold text-[#A8B4D6]">
                  من أصل {totalLessonsAcross} درسا منشورا
                </p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3EFFF] text-[#6D28D9]">
                <BookOpenCheck className="h-5 w-5" />
              </span>
            </div>
          </motion.div>

          <motion.div
            custom={2}
            variants={fadeUp}
            initial={reduce ? false : "hidden"}
            animate="show"
            className="rounded-[24px] border border-[#EDE9FE] bg-white p-5"
          >
            <p className="text-xs font-black text-[#6B6480]">متوسط نتائج الاختبارات الرسمية</p>
            <p className="mt-3 text-3xl font-black tabular-nums text-[#1E1B4B]">
              {stats.averageQuizScore == null
                ? "غير متوفر"
                : `${stats.averageQuizScore} من 20`}
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F3EFFF]">
              <div
                className="h-full rounded-full bg-[#6D28D9] transition-all"
                style={{
                  width: `${
                    stats.averageQuizScore == null
                      ? 0
                      : Math.min(100, (stats.averageQuizScore / 20) * 100)
                  }%`,
                }}
              />
            </div>
          </motion.div>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial={reduce ? false : "hidden"}
            animate="show"
            className="rounded-[24px] border border-[#EDE9FE] bg-white p-5 shadow-[0_10px_30px_rgba(109,40,217,0.05)] md:col-span-2 xl:col-span-3"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#6D28D9]" />
                <h2 className="text-sm font-black text-[#1E1B4B] sm:text-base">{CHART_TITLE}</h2>
              </div>
              <span className="rounded-lg bg-[#F3EFFF] px-2.5 py-1 text-[10px] font-black text-[#5B21B6]">
                {chartData.length} مادة
              </span>
            </div>

            {chartData.length === 0 ? (
              <div className="space-y-3">
                <ChartIllustration />
                <p className="text-center text-sm font-bold text-[#6B6480]">{EMPTY}</p>
              </div>
            ) : (
              <div className="h-64 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EDE9FE" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#6B6480", fontSize: 11, fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "#A8B4D6", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(109,40,217,0.06)" }}
                      contentStyle={{
                        borderRadius: 14,
                        border: "1px solid #EDE9FE",
                        fontWeight: 700,
                        direction: "rtl",
                      }}
                      formatter={(value) => [`${value} من 100`, "التقدم"]}
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.fullName || ""
                      }
                    />
                    <Bar dataKey="value" radius={[8, 8, 3, 3]} maxBarSize={40}>
                      {chartData.map((_, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={BAR_COLORS[index % BAR_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          <motion.div
            custom={4}
            variants={fadeUp}
            initial={reduce ? false : "hidden"}
            animate="show"
            className="rounded-[24px] border border-[#1E1B4B] bg-[#1E1B4B] p-5 text-white md:col-span-2 xl:col-span-1"
          >
            <div className="mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#C4B5FD]" />
              <h2 className="text-base font-black">{PARENT_TITLE}</h2>
            </div>
            <p className="text-xs font-medium leading-6 text-[#C4B5FD]/90">{PARENT_DESC}</p>
            <div className="mt-4">
              <EfficiencyRing score={stats.parentSummary.averageQuizScore} />
            </div>
            <div className="mt-3 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm font-bold">
              <p>
                المشاهدة{" "}
                {formatClock(
                  stats.parentSummary.watchHours,
                  stats.parentSummary.watchMinutes
                )}
              </p>
              <p>الدروس المنجزة {stats.parentSummary.completedLessons}</p>
              <p>
                متوسط الاختبارات{" "}
                {stats.parentSummary.averageQuizScore == null
                  ? "غير متوفر"
                  : `${stats.parentSummary.averageQuizScore} من 20`}
              </p>
            </div>
            <p className="mt-3 text-[11px] font-medium leading-5 text-[#DDD6FE]/90">
              {stats.parentSummary.efficiencyNote}
            </p>
          </motion.div>

          <motion.div
            custom={5}
            variants={fadeUp}
            initial={reduce ? false : "hidden"}
            animate="show"
            className="rounded-[24px] border border-[#EDE9FE] bg-white p-5 md:col-span-2 xl:col-span-4"
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-base font-black text-[#1E1B4B]">{TIMELINE_TITLE}</h2>
              <span className="text-[10px] font-black text-[#A8B4D6]">آخر 5 نشاطات</span>
            </div>

            {stats.timeline.length === 0 ? (
              <div className="grid gap-4 sm:grid-cols-[1.1fr_1fr] sm:items-center">
                <ChartIllustration />
                <div className="rounded-2xl border border-dashed border-[#EDE9FE] bg-[#F7F5FF] px-4 py-6 text-center">
                  <p className="text-sm font-black text-[#1E1B4B]">{EMPTY}</p>
                  <p className="mt-2 text-xs font-medium leading-6 text-[#6B6480]">
                    ستظهر هنا مشاهدات الدروس وإتمام الوحدات ونتائج الاختبارات الرسمية فور تسجيل النشاط
                  </p>
                </div>
              </div>
            ) : (
              <ol className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {stats.timeline.map((item, index) => (
                  <li
                    key={item.id}
                    className="relative rounded-2xl border border-[#EDE9FE] bg-[#F7F5FF]/80 p-3"
                  >
                    <span className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-[#6D28D9] text-[11px] font-black text-white">
                      {index + 1}
                    </span>
                    <p className="text-sm font-black text-[#1E1B4B] line-clamp-2">{item.title}</p>
                    <p className="mt-1 text-xs font-bold text-[#6B6480] line-clamp-2">
                      {item.subtitle}
                    </p>
                    <p className="mt-2 text-[11px] font-medium text-[#5B21B6]">
                      {formatDay(item.at)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}
