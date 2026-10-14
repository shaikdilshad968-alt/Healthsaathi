import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import type { ReportObservation } from '@/types';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

async function recognizeImage(image: File | HTMLCanvasElement) {
  const worker = await createWorker('eng');
  try {
    const { data } = await worker.recognize(image);
    return data.text;
  } finally {
    await worker.terminate();
  }
}

function getPageText(items: unknown[]) {
  const lines = new Map<number, Array<{ x: number; text: string }>>();

  for (const item of items) {
    if (!item || typeof item !== 'object' || !('str' in item) || !('transform' in item)) continue;
    const text = item.str;
    const transform = item.transform;
    if (typeof text !== 'string' || !text.trim() || !Array.isArray(transform)) continue;
    const y = Math.round(Number(transform[5]) / 3) * 3;
    const line = lines.get(y) ?? [];
    line.push({ x: Number(transform[4]), text: text.trim() });
    lines.set(y, line);
  }

  return [...lines.entries()]
    .sort(([firstY], [secondY]) => secondY - firstY)
    .map(([, line]) => line.sort((a, b) => a.x - b.x).map(item => item.text).join(' '))
    .join('\n');
}

export async function extractReportText(file: File) {
  if (!file.type.includes('pdf')) return recognizeImage(file);

  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  const pdf = await loadingTask.promise;
  const pages: string[] = [];
  let ocrWorker: Awaited<ReturnType<typeof createWorker>> | null = null;

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.6 });
      const pageText = getPageText((await page.getTextContent()).items);

      if (pageText.replace(/\s/g, '').length >= 20) {
        pages.push(pageText);
        continue;
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext('2d');
      if (!context) continue;

      await page.render({ canvas, canvasContext: context, viewport }).promise;
      ocrWorker ??= await createWorker('eng');
      const { data } = await ocrWorker.recognize(canvas);
      pages.push(data.text);
    }
  } finally {
    await ocrWorker?.terminate();
    await loadingTask.destroy();
  }

  return pages.join('\n\n');
}

export function inferReportType(text: string) {
  if (/blood\s*pressure|\b(?:bp|systolic|diastolic)\b/i.test(text)) return 'Blood Pressure';
  if (/\b(?:cbc|haemoglobin|hemoglobin|platelets|rbc count)\b/i.test(text)) return 'CBC';
  if (/\b(?:lipid profile|cholesterol|triglycerides|\bldl\b|\bhdl\b)\b/i.test(text)) return 'Lipid Panel';
  if (/\b(?:thyroid|\btsh\b|\bt3\b|\bt4\b)\b/i.test(text)) return 'Thyroid';
  return 'Other';
}

export function inferReportDate(text: string) {
  const months = 'Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?';
  const dayFirst = text.match(new RegExp(`\\b(\\d{1,2})[\\s/-]+(${months})[\\s,/-]+(20\\d{2})\\b`, 'i'));
  if (dayFirst) {
    const [, day, monthName, year] = dayFirst;
    const month = new Date(`${monthName} 1, 2000`).getMonth() + 1;
    return `${year}-${String(month).padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const monthFirst = text.match(new RegExp(`\\b(${months})[\\s/-]+(\\d{1,2}),?[\\s/-]+(20\\d{2})\\b`, 'i'));
  if (monthFirst) {
    const [, monthName, day, year] = monthFirst;
    const month = new Date(`${monthName} 1, 2000`).getMonth() + 1;
    return `${year}-${String(month).padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const isoDate = text.match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  if (isoDate) {
    const [, year, month, day] = isoDate;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const localDate = text.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})\b/);
  if (localDate) {
    const [, day, month, year] = localDate;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return '';
}

export function parseReportObservations(text: string): ReportObservation[] {
  const observations: ReportObservation[] = [];
  const bloodPressure = text.match(/(?:blood\s*pressure|\bbp\b)\s*[:=]?\s*(\d{2,3})\s*\/\s*(\d{2,3})/i);

  if (bloodPressure) {
    observations.push(
      { test_name: 'Systolic blood pressure', value: bloodPressure[1], unit: 'mmHg' },
      { test_name: 'Diastolic blood pressure', value: bloodPressure[2], unit: 'mmHg' },
    );
  } else {
    const systolic = text.match(/(?:systolic|\bsys\b)\D{0,12}(\d{2,3})/i)?.[1];
    const diastolic = text.match(/(?:diastolic|\bdia\b)\D{0,12}(\d{2,3})/i)?.[1];
    if (systolic) observations.push({ test_name: 'Systolic blood pressure', value: systolic, unit: 'mmHg' });
    if (diastolic) observations.push({ test_name: 'Diastolic blood pressure', value: diastolic, unit: 'mmHg' });
  }

  for (const line of text.split(/\r?\n/)) {
    if (/blood\s*pressure|\bbp\b|\bsystolic\b|\bdiastolic\b/i.test(line)) continue;
    const match = line.trim().match(/^(.{2,55}?)\s*[:=]?\s+([\d,]+(?:\.\d+)?)\s*([a-zA-Zµμ%][a-zA-Z0-9µμ/%^.-]*)?/);
    if (!match) continue;

    const testName = match[1].replace(/[|:=-]+$/g, '').trim();
    if (!/[a-zA-Z]/.test(testName) || /\b(report|patient|date|page|sample|reference|normal range|result|collected)\b/i.test(testName)) continue;
    const referenceRange = line.match(/(?:^|\s)((?:<=|>=|≤|≥|<|>)\s*[\d,]+(?:\.\d+)?|[\d,]+(?:\.\d+)?\s*[-–—]\s*[\d,]+(?:\.\d+)?)(?=\s|$)/)?.[1]?.trim();

    observations.push({
      test_name: testName,
      value: match[2].replace(/,/g, ''),
      unit: match[3] ?? '',
      ref_range: referenceRange,
    });
  }

  return observations.filter((observation, index, all) =>
    all.findIndex(item => item.test_name.toLowerCase() === observation.test_name.toLowerCase()) === index
  );
}