import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';

export interface ExportImageOptions {
  element: HTMLElement;
  filename: string;
  backgroundColor?: string;
  pixelRatio?: number;
}

export interface ExportImageResult {
  dataUrl: string;
  blob: Blob;
  filename: string;
}

/**
 * Robust image export supporting dual engines:
 * 1. Primary: html2canvas with live DOM traversal & CORS support
 * 2. Fallback: html-to-image with skipFonts to avoid CSSStyleSheet security errors
 */
export async function captureElementToImage(
  options: ExportImageOptions
): Promise<ExportImageResult> {
  const { element, filename, backgroundColor = '#ffffff', pixelRatio = 2 } = options;

  // Let DOM layout and fonts settle
  try {
    if ('fonts' in document) {
      await (document as any).fonts.ready;
    }
  } catch {
    // Ignore font loading errors
  }
  await new Promise((r) => setTimeout(r, 120));

  let dataUrl: string | null = null;
  let blob: Blob | null = null;

  // Attempt Engine 1: html2canvas
  try {
    const canvas = await html2canvas(element, {
      scale: pixelRatio,
      useCORS: true,
      allowTaint: true,
      backgroundColor: backgroundColor,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    dataUrl = canvas.toDataURL('image/png');
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  } catch (canvasErr) {
    console.warn('html2canvas capture failed, trying html-to-image fallback:', canvasErr);
  }

  // Attempt Engine 2: html-to-image (with skipFonts to avoid SecurityError)
  if (!dataUrl) {
    try {
      dataUrl = await toPng(element, {
        pixelRatio: pixelRatio,
        backgroundColor: backgroundColor,
        cacheBust: true,
        skipFonts: true, // Prevents DOMException on cross-origin stylesheets
        fontEmbedCSS: '',
      });

      // Convert dataUrl to blob
      const res = await fetch(dataUrl);
      blob = await res.blob();
    } catch (toImgErr) {
      console.error('html-to-image fallback failed as well:', toImgErr);
      throw new Error('长图渲染失败，请检查浏览器权限或减小导出区域后重试。');
    }
  }

  if (!dataUrl || !blob) {
    throw new Error('未能生成长图数据，请重试。');
  }

  return {
    dataUrl,
    blob,
    filename,
  };
}

/**
 * Triggers file download from blob or dataUrl
 */
export function downloadImageFile(dataUrl: string, filename: string): boolean {
  try {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 500);
    return true;
  } catch (err) {
    console.error('Download trigger failed:', err);
    return false;
  }
}
