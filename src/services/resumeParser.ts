import * as pdfjsLib from 'pdfjs-dist';
import type { ParsedFile } from '@/types';
import { cleanExtractedText, extractCandidateFromText } from './resumeExtraction';

// Use the worker bundled by Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

function lineKey(y: number): string {
  return Math.round(y * 10).toString();
}

function groupPdfTextByLine(items: Array<{ str?: string; transform?: number[] }>): string {
  const lines = new Map<string, Array<{ x: number; text: string }>>();

  for (const item of items) {
    const text = (item.str ?? '').trim();
    if (!text) continue;
    const transform = item.transform ?? [];
    const x = transform[4] ?? 0;
    const y = transform[5] ?? 0;
    const key = lineKey(y);
    const line = lines.get(key) ?? [];
    line.push({ x, text });
    lines.set(key, line);
  }

  return [...lines.entries()]
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([, line]) =>
      line
        .sort((a, b) => a.x - b.x)
        .map((part) => part.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter(Boolean)
    .join('\n');
}

async function parsePdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = groupPdfTextByLine(
      content.items as Array<{ str?: string; transform?: number[] }>
    );
    pages.push(pageText);
  }

  return pages.join('\n').trim();
}

async function parseDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

function parseTxt(file: File): Promise<string> {
  return file.text();
}

export async function parseResume(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'pdf') return parsePdf(file);
  if (ext === 'docx') return parseDocx(file);
  if (ext === 'txt') return parseTxt(file);
  throw new Error(`Unsupported file type: .${ext}. Use PDF, DOCX, or TXT.`);
}

export async function parseResumes(files: File[]): Promise<ParsedFile[]> {
  const results: ParsedFile[] = [];
  for (const file of files) {
    if (file.size === 0) {
      results.push({ fileName: file.name, text: '', rawText: '' });
      continue;
    }
    try {
      const rawText = await parseResume(file);
      results.push({
        fileName: file.name,
        text: cleanExtractedText(rawText),
        rawText,
      });
    } catch {
      results.push({ fileName: file.name, text: '', rawText: '' });
    }
  }
  return results;
}

export { extractCandidateFromText };
export { cleanExtractedText } from './resumeExtraction';
