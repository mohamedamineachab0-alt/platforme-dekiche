import React from 'react';
import { MathRenderer } from '@/components/MathRenderer';

export function RichMathText({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  if (!text) return null;

  // Split text by display math ($$...$$) or inline math ($...$)
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$[^\$]+?\$)/g);

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
    <div className="text-sm text-slate-600 leading-relaxed min-h-[1.5rem] mt-1" dir="rtl">
      <RichMathText text={text} />
    </div>
  );
};
