import React from 'react';
import { MathRenderer } from '@/components/MathRenderer';

/**
 * Normalizes LaTeX delimiters, repairs escaped control chars,
 * and auto-wraps standalone mathematical formulas into $...$
 */
export function normalizeMathString(str: string): string {
  if (!str || typeof str !== 'string') return '';
  let s = str.trim();

  // Repair JSON escaped control characters if eaten during transit
  s = s
    .replace(/\x0c/g, '\\f')
    .replace(/\x08/g, '\\b')
    .replace(/\x09/g, '\\t')
    .replace(/\x0d/g, '\\r');

  // Convert standard LaTeX \[...\] and \(...\) to $ delimiters
  s = s.replace(/\\\[([\s\S]+?)\\\]/g, '$$$$$1$$$$');
  s = s.replace(/\\\(([\s\S]+?)\\\)/g, '$$$1$$');

  // If the entire string is a formula or naked LaTeX without $
  if (!s.includes('$')) {
    // Check if it contains LaTeX backslash commands
    if (
      /\\(?:frac|sqrt|lim|int|sum|vec|alpha|beta|gamma|lambda|tau|theta|Delta|pi|infty|times|le|ge|neq|approx|in|cup|cap|cdot|mathrm|text|to|partial)\b/.test(
        s
      )
    ) {
      return `$${s}$`;
    }
    // Check if it is a mathematical expression without Arabic text
    const hasArabic = /[\u0600-\u06FF]/.test(s);
    if (
      !hasArabic &&
      (/[=+\-*/^_{}\\]/.test(s) ||
        /^(?:[-+]?\d+(?:\.\d+)?|[a-zA-Z]|f\(x\)|g\(x\)|u_n|v_n|z|\w+\s*=\s*.*)$/.test(s))
    ) {
      return `$${s}$`;
    }
  }

  return s;
}

export function RichMathText({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  if (!text) return null;

  const normalized = normalizeMathString(text);

  // Split text by display math ($$...$$) or inline math ($...$)
  const parts = normalized.split(/(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
          const math = part.slice(2, -2).trim();
          return <MathRenderer key={i} math={math} block={true} />;
        }
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const math = part.slice(1, -1).trim();
          return <MathRenderer key={i} math={math} block={false} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

export const MathPreview: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  return (
    <div className="text-sm text-slate-700 bg-sky-50/60 border border-sky-100 rounded-lg p-2.5 leading-relaxed min-h-[1.5rem] mt-1.5" dir="rtl">
      <div className="flex items-center gap-1.5 text-xs text-sky-600 font-bold mb-1">
        <span>معاينة الصيغة الرياضية (KaTeX):</span>
      </div>
      <RichMathText text={text} />
    </div>
  );
};
