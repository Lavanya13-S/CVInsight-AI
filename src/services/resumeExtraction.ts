import type {
  ExperienceCategory,
  ResumeEducationEntry,
  ResumeExperienceEntry,
  ResumeSkill,
  StructuredResumeProfile,
} from '@/types';
import { extractExperience } from './experience';
import {
  extractStructuredSkills,
  parseSkillsForDisplay,
  getSkillDisplayName,
} from './skillCatalog';

const SECTION_HEADINGS: Array<{ key: keyof SectionBuckets; patterns: RegExp[] }> = [
  { key: 'summary', patterns: [/^summary$/i, /^professional summary$/i, /^profile$/i, /^about$/i, /^objective$/i] },
  { key: 'education', patterns: [/^education$/i, /^academic background$/i, /^academics$/i] },
  { key: 'experience', patterns: [/^experience$/i, /^work experience$/i, /^professional experience$/i, /^employment$/i, /^work history$/i] },
  { key: 'internship', patterns: [/^internship$/i, /^internships$/i, /^internship experience$/i] },
  { key: 'skills', patterns: [/^skills$/i, /^technical skills$/i, /^core skills$/i] },
  { key: 'projects', patterns: [/^projects$/i, /^project$/i] },
  { key: 'certifications', patterns: [/^certifications$/i, /^certificates$/i, /^certificates & certifications$/i] },
  { key: 'achievements', patterns: [/^achievements$/i, /^accomplishments$/i, /^honors$/i, /^awards$/i] },
];

type SectionBuckets = {
  summary: string[];
  education: string[];
  experience: string[];
  internship: string[];
  skills: string[];
  projects: string[];
  certifications: string[];
  achievements: string[];
};

export interface ResumeExtractionInput {
  fileName: string;
  rawText: string;
  cleanedText: string;
}

export interface ExtractedCandidateProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  professionalSummary: string;
  educationEntries: ResumeEducationEntry[];
  educationDisplay: string;
  skillDetails: ResumeSkill[];
  skills: string[];
  workExperience: ResumeExperienceEntry[];
  internshipExperience: ResumeExperienceEntry[];
  projects: string[];
  certifications: string[];
  achievements: string[];
  yearsExperience: number;
  internshipMonths: number;
  fullTimeExperienceMonths: number;
  experienceCategory: ExperienceCategory;
  experienceExplanation: string;
  resumeProfile: StructuredResumeProfile;
}

function normalizeWhitespace(text: string): string {
  return text
    .normalize('NFKC')
    .replace(/\u00a0/g, ' ')
    .replace(/[\t\f\v]+/g, ' ')
    .replace(/[ \u200b]+/g, ' ')
    .replace(/[–—]/g, ' - ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

function cleanLine(line: string): string {
  let value = line.trim();
  if (!value) return '';
  value = value.replace(/\s+/g, ' ');
  value = value.replace(/\s+([,.;:!?])/g, '$1');
  value = value.replace(/([,.;:!?])(\S)/g, '$1 $2');
  value = value.replace(/\s*\|\s*/g, ' | ');
  value = value.replace(/\s*\/\s*/g, '/');
  value = value.replace(/\s*[-–—]\s*/g, ' - ');
  value = value.replace(/\s+\)/g, ')').replace(/\(\s+/g, '(');
  return value.replace(/\s{2,}/g, ' ').trim();
}

export function cleanExtractedText(raw: string): string {
  const lines = normalizeWhitespace(raw)
    .split('\n')
    .map(cleanLine)
    .filter((line) => line.length > 0);

  const cleaned: string[] = [];
  for (const line of lines) {
    const previous = cleaned[cleaned.length - 1];
    if (previous && /-\s*$/.test(previous) && /^[a-z]/.test(line)) {
      cleaned[cleaned.length - 1] = previous.replace(/-\s*$/, '') + line;
      continue;
    }
    cleaned.push(line);
  }

  return cleaned.join('\n').trim();
}

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((part) => {
      if (!part) return part;
      if (/^(\d{4}|[0-9]+\/[0-9]+)$/.test(part)) return part;
      if (/^[A-Z]+$/.test(part) && part.length <= 3) return part;
      return part[0].toUpperCase() + part.slice(1);
    })
    .join(' ')
    .replace(/\bAnd\b/g, 'and');
}

function normalizeDegreeDisplay(raw: string): string {
  const value = raw.trim().toLowerCase();
  const matches: Array<[RegExp, string]> = [
    [/\b(b\. ?e\.?|be)\b/i, 'B.E.'],
    [/\b(b\. ?tech|btech)\b/i, 'B.Tech'],
    [/\b(m\. ?e\.?|me)\b/i, 'M.E.'],
    [/\b(m\. ?tech|mtech)\b/i, 'M.Tech'],
    [/\b(mca)\b/i, 'MCA'],
    [/\b(mba)\b/i, 'MBA'],
    [/\b(b\. ?sc\.?|bsc)\b/i, 'B.Sc.'],
    [/\b(m\. ?sc\.?|msc)\b/i, 'M.Sc.'],
    [/\b(ph\. ?d\.?|phd)\b/i, 'Ph.D.'],
    [/\b(diploma)\b/i, 'Diploma'],
    [/\b(class\s*xii|xii|12th)\b/i, 'Class XII'],
    [/\b(class\s*x|\bx\b|10th)\b/i, 'Class X'],
  ];
  for (const [pattern, replacement] of matches) {
    if (pattern.test(value)) return replacement;
  }
  return titleCase(raw.trim());
}

function looksLikeContactLine(line: string): boolean {
  return /@|linkedin\.com|github\.com|\+?\d[\d\s().-]{7,}/i.test(line);
}

function formatName(raw: string): string {
  const cleaned = raw.replace(/[^\w.\-\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';
  if (/^[A-Z\s.\-']+$/.test(cleaned)) {
    return cleaned
      .toLowerCase()
      .split(' ')
      .map((part) => {
        if (!part) return part;
        if (part.length === 1) return part.toUpperCase();
        return part[0].toUpperCase() + part.slice(1);
      })
      .join(' ')
      .replace(/\bS\b$/, 'S');
  }
  return cleaned
    .split(' ')
    .map((part) => (part.length === 1 ? part.toUpperCase() : part[0].toUpperCase() + part.slice(1).toLowerCase()))
    .join(' ');
}

function extractName(lines: string[], fileName: string): string {
  for (const line of lines.slice(0, 12)) {
    if (!line || looksLikeContactLine(line) || /resume|curriculum vitae|profile/i.test(line)) continue;
    const words = line.split(/\s+/);
    if (words.length > 5) continue;
    const candidate = formatName(line);
    if (candidate.length >= 2) return candidate;
  }

  return fileName
    .replace(/\.(pdf|docx|txt)$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractEmail(text: string): string {
  return text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] ?? '';
}

function extractPhone(text: string): string {
  return text.match(/(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}(?:[\s.-]?\d{2,4})?/)?.[0]?.trim() ?? '';
}

function extractLink(text: string, pattern: RegExp): string {
  return text.match(pattern)?.[0] ?? '';
}

function extractLocation(lines: string[], text: string): string {
  const keywordMatch = text.match(/(?:location|based in|address)\s*[:\-]\s*([^\n]+)/i);
  if (keywordMatch?.[1]) return keywordMatch[1].trim();

  for (const line of lines.slice(0, 8)) {
    if (looksLikeContactLine(line)) continue;
    if (/\b(?:india|usa|uk|remote|hyderabad|chennai|bangalore|bengaluru|mumbai|delhi|pune|coimbatore|salem|tiruchirappalli|tirunelveli|madurai)\b/i.test(line)) {
      return titleCase(line.replace(/\s*\|\s*/g, ', '));
    }
  }

  return 'Not specified';
}

function isHeading(line: string): boolean {
  return SECTION_HEADINGS.some(({ patterns }) => patterns.some((pattern) => pattern.test(line))) || (/^[A-Z][A-Z\s/&-]{2,}$/.test(line) && line.length <= 40);
}

function sectionKeyForLine(line: string): keyof SectionBuckets | null {
  const match = SECTION_HEADINGS.find(({ patterns }) => patterns.some((pattern) => pattern.test(line)));
  return match?.key ?? null;
}

function bucketSections(lines: string[]): SectionBuckets {
  const buckets: SectionBuckets = {
    summary: [],
    education: [],
    experience: [],
    internship: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
  };

  let current: keyof SectionBuckets | null = null;
  for (const line of lines) {
    const section = sectionKeyForLine(line);
    if (section) {
      current = section;
      continue;
    }
    if (current) {
      buckets[current].push(line);
    }
  }

  return buckets;
}

function joinSectionLines(lines: string[]): string {
  return lines.join('\n').trim();
}

function extractSummary(lines: string[], buckets: SectionBuckets): string {
  const summarySection = joinSectionLines(buckets.summary);
  if (summarySection) return summarySection;

  const fallback: string[] = [];
  for (const line of lines.slice(0, 8)) {
    if (looksLikeContactLine(line) || isHeading(line)) continue;
    fallback.push(line);
    if (fallback.length >= 2) break;
  }
  return fallback.join(' ').trim();
}

function splitIntoBlocks(lines: string[]): string[][] {
  const blocks: string[][] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (!line.trim()) {
      if (current.length > 0) {
        blocks.push(current);
        current = [];
      }
      continue;
    }
    if (/^(?:[-*•]| B7)/.test(line) || /^[0-9]+[.)]/.test(line)) {
      if (current.length > 0) {
        blocks.push(current);
        current = [];
      }
      current.push(line);
      continue;
    }
    current.push(line);
  }
  if (current.length > 0) blocks.push(current);
  return blocks;
}

function extractFieldFromBlock(block: string): string {
  const stripped = block
    .replace(/\b(b\. ?e\.?|be|b\. ?tech|btech|m\. ?e\.?|me|m\. ?tech|mtech|mca|mba|b\. ?sc\.?|bsc|m\. ?sc\.?|msc|ph\. ?d\.?|phd|diploma|class\s*xii|xii|12th|class\s*x|\bx\b|10th)\b/ig, ' ')
    .replace(/\b(CGPA|GPA|Percentage|Score)\b[^\n]*/ig, ' ')
    .replace(/\b(20\d{2})\s*[-–—]\s*(20\d{2}|present|current)\b/ig, ' ')
    .replace(/[•|·]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return titleCase(stripped).replace(/\s{2,}/g, ' ').trim();
}

function extractEducationEntries(lines: string[], buckets: SectionBuckets): ResumeEducationEntry[] {
  const sectionText = joinSectionLines(buckets.education);
  if (!sectionText) return [];

  const blocks = splitIntoBlocks(buckets.education.length > 0 ? buckets.education : lines).map((block) => block.join(' '));
  const entries: ResumeEducationEntry[] = [];

  for (const block of blocks) {
    const rawText = block.trim();
    if (!rawText) continue;
    const degreeMatch = rawText.match(/\b(b\. ?e\.?|be|b\. ?tech|btech|m\. ?e\.?|me|m\. ?tech|mtech|mca|mba|b\. ?sc\.?|bsc|m\. ?sc\.?|msc|ph\. ?d\.?|phd|diploma|12th|xii|class\s*xii|10th|class\s*x)\b/i);
    const degree = degreeMatch ? normalizeDegreeDisplay(degreeMatch[0]) : 'Not specified';
    const duration = rawText.match(/\b(20\d{2})\s*[-–—]\s*(20\d{2}|present|current)\b/i)?.[0] ?? '';
    const cgpa = rawText.match(/\b(?:CGPA|GPA|Percentage|Score)\b[^\d]*(\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?)/i)?.[1] ?? '';
    const institutionMatch = rawText.match(/(?:at|in|from|,\s*)([^\n]*?(?:college|university|institute|school|academy)[^\n,;]*)/i);
    const institution = institutionMatch?.[1] ? titleCase(institutionMatch[1].replace(/\s+/g, ' ').trim()) : 'Not specified';
    const field = extractFieldFromBlock(rawText).replace(/\b(At|From|In)\b$/i, '').trim() || 'Not specified';

    if (degree !== 'Not specified' || institution !== 'Not specified' || field !== 'Not specified') {
      entries.push({
        degree,
        field,
        institution,
        duration: duration || 'Not specified',
        cgpa: cgpa ? cgpa : 'Not specified',
        rawText,
      });
    }
  }

  return entries;
}

function extractListItems(sectionLines: string[]): string[] {
  const text = joinSectionLines(sectionLines);
  if (!text) return [];
  const items = text
    .split(/\n|\r|;|\u2022|\u25CF|\u25CB|\u25AA|\u25B8|\|/)
    .map((part) => part.replace(/^[-*•·\s]+/, '').trim())
    .filter(Boolean);
  return [...new Set(items.map((item) => titleCase(item)))];
}

function extractExperienceEntries(sectionLines: string[], type: 'full-time' | 'internship'): ResumeExperienceEntry[] {
  const text = joinSectionLines(sectionLines);
  if (!text) return [];
  const entries: ResumeExperienceEntry[] = [];
  const blocks = splitIntoBlocks(sectionLines).map((block) => block.join(' '));

  for (const block of blocks) {
    const rawText = block.trim();
    if (!rawText) continue;
    const lower = rawText.toLowerCase();
    const isInternship = /\bintern(ship|)\b/.test(lower);
    if (type === 'internship' && !isInternship) continue;
    if (type === 'full-time' && isInternship) continue;
    const duration = rawText.match(/\b(20\d{2}(?:\s*[-–—]\s*20\d{2}|\s*[-–—]\s*present|\s*[-–—]\s*current)?|\d{1,2}\s*[/.-]\s*20\d{2}\s*[-–—]\s*\d{1,2}\s*[/.-]\s*20\d{2})\b/i)?.[0] ?? 'Not specified';
    const title = titleCase(rawText.split(/\s*[-–—|@]\s*/)[0].trim()) || (type === 'internship' ? 'Internship' : 'Experience');
    const organization = rawText.match(/(?:at|@)\s*([^,|\n]+?)(?:\s*[-–—]\s*|$)/i)?.[1]?.trim() ?? 'Not specified';
    entries.push({
      title,
      organization: titleCase(organization),
      duration,
      type,
      location: 'Not specified',
      summary: rawText,
      rawText,
    });
  }

  return entries;
}

function inferExperienceCategory(yearsExperience: number, internshipMonths: number, text: string): ExperienceCategory {
  if (yearsExperience > 0) {
    return yearsExperience < 2 ? 'Entry-Level Professional' : 'Experienced Professional';
  }
  if (internshipMonths > 0) {
    return 'Fresher or Internship Only';
  }
  if (text.trim()) {
    return 'Fresher';
  }
  return 'Experience not clearly specified';
}

function buildExperienceExplanation(yearsExperience: number, internshipMonths: number, rawText: string): string {
  if (yearsExperience > 0) {
    return `${yearsExperience} years of full-time professional experience detected.`;
  }
  if (internshipMonths > 0) {
    const months = Math.max(1, Math.round(internshipMonths));
    return `0 years of full-time experience detected. Internship experience is listed separately (${months} month(s)).`;
  }
  if (rawText.trim()) {
    return '0 years of full-time experience detected. Education and academic dates were ignored.';
  }
  return 'Experience not clearly specified';
}

export function extractCandidateFromText(
  text: string,
  fileName: string,
  rawText = text
): ExtractedCandidateProfile {
  const lines = cleanExtractedText(text).split('\n').map((line) => line.trim()).filter(Boolean);
  const buckets = bucketSections(lines);
  const email = extractEmail(text);
  const phone = extractPhone(text);
  const location = extractLocation(lines, text);
  const linkedinUrl = extractLink(text, /https?:\/\/(?:www\.)?linkedin\.com\/[^\s)]+/i);
  const githubUrl = extractLink(text, /https?:\/\/(?:www\.)?github\.com\/[^\s)]+/i);
  const name = extractName(lines, fileName);
  const professionalSummary = extractSummary(lines, buckets) || 'Not specified';
  const educationEntries = extractEducationEntries(lines, buckets);
  const educationDisplay = educationEntries.length > 0
    ? `${educationEntries[0].degree}${educationEntries[0].field && educationEntries[0].field !== 'Not specified' ? `. ${educationEntries[0].field}` : ''}`.replace(/\.\s*\./g, '.').trim()
    : 'Not specified';
  const skillsSectionText = joinSectionLines(buckets.skills);
  const skillDetails = extractStructuredSkills(skillsSectionText || text);
  const skills = skillDetails.map((skill) => skill.displayName);
  const workExperience = extractExperienceEntries(buckets.experience, 'full-time');
  const internshipExperience = [
    ...extractExperienceEntries(buckets.internship, 'internship'),
    ...extractExperienceEntries(buckets.experience, 'internship'),
  ];
  const projects = extractListItems(buckets.projects);
  const certifications = extractListItems(buckets.certifications);
  const achievements = extractListItems(buckets.achievements);
  const experience = extractExperience(text);

  const resumeProfile: StructuredResumeProfile = {
    fullName: name,
    email,
    phone,
    location,
    linkedinUrl,
    githubUrl,
    professionalSummary,
    education: educationEntries,
    skills: skillDetails,
    workExperience,
    internshipExperience,
    projects,
    certifications,
    achievements,
    rawText,
    cleanedText: cleanExtractedText(text),
  };

  return {
    name,
    email,
    phone,
    location,
    linkedinUrl,
    githubUrl,
    professionalSummary,
    educationEntries,
    educationDisplay,
    skillDetails,
    skills,
    workExperience,
    internshipExperience,
    projects,
    certifications,
    achievements,
    yearsExperience: experience.yearsExperience,
    internshipMonths: experience.internshipMonths,
    fullTimeExperienceMonths: experience.fullTimeExperienceMonths,
    experienceCategory: inferExperienceCategory(experience.yearsExperience, experience.internshipMonths, text),
    experienceExplanation: buildExperienceExplanation(experience.yearsExperience, experience.internshipMonths, text),
    resumeProfile,
  };
}

export function buildFallbackSummary(profile: StructuredResumeProfile): string {
  if (profile.professionalSummary && profile.professionalSummary !== 'Not specified') return profile.professionalSummary;
  const parts = [profile.fullName, profile.location, profile.education[0]?.rawText ?? ''].filter(Boolean);
  return parts.join(' • ').trim() || 'Not specified';
}

export function displayEducationLabel(entry: ResumeEducationEntry): string {
  const segments = [entry.degree, entry.field, entry.institution].filter((segment) => segment && segment !== 'Not specified');
  return segments.join('. ').replace(/\.\s*\./g, '.').trim() || 'Not specified';
}

export function displaySkillChips(text: string): string[] {
  return parseSkillsForDisplay(text);
}

export function displaySkillLabel(skill: ResumeSkill): string {
  return skill.displayName || getSkillDisplayName(skill.normalizedName);
}
