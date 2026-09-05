/**
 * Robust server-side PDF processing:
 * 1. Extract digital text (via pdfjs-dist legacy / pdf-parse).
 * 2. Extract embedded scanned photos / handwritten pages (via JPEG stream scanning).
 * 3. File type sniffing by magic bytes (immune to missing/wrong browser MIME types).
 */

export function detectBufferType(
  buffer: Buffer,
  fileName: string = ""
): "pdf" | "image" | "docx" | "unknown" {
  if (!buffer || buffer.length < 4) return "unknown";

  // PDF: %PDF (0x25 0x50 0x44 0x46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return "pdf";
  }

  // JPEG: 0xFF 0xD8 0xFF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image";
  }

  // PNG: 0x89 0x50 0x4E 0x47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return "image";
  }

  // GIF: GIF8
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return "image";
  }

  // WebP: RIFF ... WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image";
  }

  // DOCX / ZIP: PK\x03\x04
  if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
    if (fileName.toLowerCase().endsWith(".docx") || fileName.toLowerCase().endsWith(".doc")) {
      return "docx";
    }
  }

  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".png") ||
    lower.endsWith(".webp")
  )
    return "image";
  if (lower.endsWith(".docx") || lower.endsWith(".doc")) return "docx";

  return "unknown";
}

export function extractJpegsFromPdf(pdfBuffer: Buffer, maxImages: number = 8): Buffer[] {
  const images: Buffer[] = [];
  const startMarker = Buffer.from([0xff, 0xd8, 0xff]);
  const endMarker = Buffer.from([0xff, 0xd9]);

  let pos = 0;
  while (pos < pdfBuffer.length && images.length < maxImages) {
    const startIdx = pdfBuffer.indexOf(startMarker, pos);
    if (startIdx === -1) break;
    const endIdx = pdfBuffer.indexOf(endMarker, startIdx + 3);
    if (endIdx === -1) break;

    const jpegBuf = pdfBuffer.subarray(startIdx, endIdx + 2);
    // Filter out tiny icons / thumbnails (under 5KB)
    if (jpegBuf.length > 5 * 1024) {
      images.push(jpegBuf);
    }
    pos = endIdx + 2;
  }
  return images;
}

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // Ensure polyfills for Mozilla pdfjs-dist
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
  if (!globalThis.ImageData) globalThis.ImageData = class ImageData {} as any;
  if (!globalThis.Path2D) globalThis.Path2D = class Path2D {} as any;

  try {
    // Try legacy pdfjs-dist first (official Node-safe build)
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
    const doc = await loadingTask.promise;
    let fullText = "";
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((it: any) => it.str || "").filter(Boolean);
      if (strings.length > 0) {
        fullText += `--- صفحة ${i} ---\n` + strings.join(" ") + "\n\n";
      }
    }
    if (fullText.trim()) {
      return fullText.trim();
    }
  } catch (pdfjsErr) {
    // Fallback to pdf-parse
  }

  try {
    const pdfModule = require("pdf-parse");
    if (pdfModule.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        return (result?.text || "").trim();
      } finally {
        if (typeof parser.destroy === "function") await parser.destroy().catch(() => {});
      }
    }
    if (typeof pdfModule === "function") {
      const data = await pdfModule(buffer);
      return (data?.text || "").trim();
    }
  } catch (err: any) {
    console.error("extractTextFromPdf error:", err?.message || err);
  }

  return "";
}

export async function processPdfForAi(
  buffer: Buffer,
  fileName: string = "document.pdf"
): Promise<{ text: string; images: Buffer[] }> {
  const text = await extractTextFromPdf(buffer);
  const images = extractJpegsFromPdf(buffer);
  return { text, images };
}
