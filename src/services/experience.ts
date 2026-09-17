import type { ExperienceCategory } from '@/types';

export interface ExperienceExtraction {
  yearsExperience: number;
  internshipMonths: number;
  fullTimeExperienceMonths: number;
  experienceCategory: ExperienceCategory;
  explanation: string;
}

const INTERNSHIP_RE = /\b(internship|intern)\b/i;
const EDUCATION_RE = /\b(education|academic|qualification|school|college|university|degree|b\.e|b\.tech|bachelor|master|class\s*(x|xi|xii|10|12))\b/i;
const EXPERIENCE_HEADER_RE = /\b(experience|work history|employment|professional experience|work experience)\b/i;
const DATE_RANGE_RE = /(20\d{2})\s*[-–—/]\s*(20\d{2}|present|current)/gi;
const MONTH_DATE_RANGE_RE = /(?:0?[1-9]|1[0-2])\s*[/.-]\s*(20\d{2})\s*[-–—]\s*(?:0?[1-9]|1[0-2])\s*[/.-]\s*(20\d{2}|present|current)/gi;

function monthsBetween(start: number, end: number): number {
  return Math.max(0, (end - start) * 12);
}

export function extractExperience(text: string): ExperienceExtraction {
  const currentYear = new Date().getFullYear();
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  let inExperienceSection = false;
  let fullTimeMonths = 0;
  let internshipMonths = 0;
  let explicitYears: number | null = null;

  for (const line of lines) {
    if (EXPERIENCE_HEADER_RE.test(line)) {
      inExperienceSection = true;
    }
    if (inExperienceSection && EDUCATION_RE.test(line) && !EXPERIENCE_HEADER_RE.test(line)) {
      inExperienceSection = false;
    }

    const explicit = line.match(/(\d+)\+?\s*(?:years|yrs)\s*(?:of)?\s*(?:full[- ]?time\s+)?experience/i);
    if (explicit && !EDUCATION_RE.test(line)) {
      explicitYears = Math.max(explicitYears ?? 0, Number(explicit[1]));
    }

    const ranges = [...line.matchAll(DATE_RANGE_RE)];
    const monthRanges = [...line.matchAll(MONTH_DATE_RANGE_RE)];
    if (inExperienceSection && !EDUCATION_RE.test(line)) {
      for (const match of ranges) {
        const start = Number(match[1]);
        const end = match[2].toLowerCase() === 'present' || match[2].toLowerCase() === 'current' ? currentYear : Number(match[2]);
        const months = monthsBetween(start, Math.min(end, currentYear));
        if (INTERNSHIP_RE.test(line)) internshipMonths += months; else fullTimeMonths += months;
      }
      for (const match of monthRanges) {
        const start = Number(match[1]);
        const end = match[2].toLowerCase() === 'present' || match[2].toLowerCase() === 'current' ? currentYear : Number(match[2]);
        const months = monthsBetween(start, Math.min(end, currentYear));
        if (INTERNSHIP_RE.test(line)) internshipMonths += months; else fullTimeMonths += months;
      }
    }
  }

  // PDF text extraction can flatten a resume into one long line. If that happens,
  // recover internship date ranges only when an internship keyword is nearby.
  if (internshipMonths === 0 && /\b(internship|intern)\b/i.test(text)) {
    for (const match of text.matchAll(MONTH_DATE_RANGE_RE)) {
      const startIndex = match.index ?? 0;
      const nearby = text.slice(Math.max(0, startIndex - 140), startIndex + match[0].length + 20);
      if (INTERNSHIP_RE.test(nearby)) {
        const start = Number(match[1]);
        const end = match[2].toLowerCase() === 'present' || match[2].toLowerCase() === 'current' ? currentYear : Number(match[2]);
        internshipMonths += monthsBetween(start, Math.min(end, currentYear));
      }
    }
  }

  // An explicit number is used only when it appears in a work-related context.
  if (explicitYears !== null && fullTimeMonths === 0 && /\b(full[- ]?time|professional|work)\b/i.test(text)) {
    fullTimeMonths = explicitYears * 12;
  }

  const yearsExperience = Math.round((fullTimeMonths / 12) * 10) / 10;
  let experienceCategory: ExperienceCategory;
  if (fullTimeMonths > 0) {
    experienceCategory = yearsExperience < 2 ? 'Entry-Level Professional' : 'Experienced Professional';
  } else if (internshipMonths > 0) {
    experienceCategory = 'Fresher or Internship Only';
  } else if (text.trim()) {
    experienceCategory = 'Fresher';
  } else {
    experienceCategory = 'Experience not clearly specified';
  }

  const explanation = fullTimeMonths > 0
    ? `${yearsExperience} years of full-time professional experience detected.`
    : internshipMonths > 0
      ? `0 years of full-time experience detected. Internship experience is listed separately (${Math.round(internshipMonths / 4.345)} month(s)).`
      : '0 years of full-time experience detected. Education and academic dates were ignored.';

  return {
    yearsExperience,
    internshipMonths: Math.round(internshipMonths),
    fullTimeExperienceMonths: Math.round(fullTimeMonths),
    experienceCategory,
    explanation,
  };
}
