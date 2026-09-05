import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  math: string;
  block?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ math, block = false }) => {
  const html = useMemo(() => {
    if (!math || typeof math !== 'string') return '';
    try {
      // Clean and sanitize common LaTeX escaping issues
      let cleanMath = math
        .replace(/\\x0c/g, '\\f')
        .replace(/\\x08/g, '\\b')
        .replace(/\\x09/g, '\\t')
        .trim();

      return katex.renderToString(cleanMath, {
        displayMode: block,
        throwOnError: false,
        strict: false,
        trust: true,
        output: 'htmlAndMathml',
      });
    } catch (error) {
      console.warn('KaTeX rendering warning:', error);
      return null;
    }
  }, [math, block]);

  if (!html) {
    return <span className="font-mono text-sm text-sky-600 font-semibold" dir="ltr">{math}</span>;
  }

  return (
    <span
      dir="ltr"
      className={`inline-block align-middle ${block ? 'my-2 w-full text-center' : 'mx-1'}`}
      style={{ direction: 'ltr' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
