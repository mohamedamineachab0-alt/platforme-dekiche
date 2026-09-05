/**
 * Robust server-side PDF text extraction compatible with pdf-parse v1 and v2
 * Provides necessary Node.js polyfills for Mozilla pdfjs-dist (DOMMatrix, ImageData, Path2D)
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // Ensure polyfills for canvas/DOM in Node environment
  if (!globalThis.DOMMatrix) {
    globalThis.DOMMatrix = class DOMMatrix {
      a = 1;
      b = 0;
      c = 0;
      d = 1;
      e = 0;
      f = 0;
    } as any;
  }
  if (!globalThis.ImageData) {
    globalThis.ImageData = class ImageData {} as any;
  }
  if (!globalThis.Path2D) {
    globalThis.Path2D = class Path2D {} as any;
  }

  try {
    const pdfModule = require("pdf-parse");

    // v2 API: class PDFParse
    if (pdfModule.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        return (result?.text || "").trim();
      } finally {
        if (typeof parser.destroy === "function") {
          await parser.destroy().catch(() => {});
        }
      }
    }

    // v1 API fallback: function(buffer)
    if (typeof pdfModule === "function") {
      const data = await pdfModule(buffer);
      return (data?.text || "").trim();
    }

    return "";
  } catch (error: any) {
    console.error("extractTextFromPdf error:", error?.message || error);
    return "";
  }
}
