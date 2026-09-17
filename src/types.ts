export interface User {
  email: string;
  name: string;
}

export type ExperienceCategory =
  | 'Fresher'
  | 'Fresher or Internship Only'
  | 'Internship Experience'
  | 'Entry-Level Professional'
  | 'Experienced Professional'
  | 'Experience not clearly specified';

export type CandidateStatus =
  | 'Uploaded'
  | 'Ready for Screening'
  | 'Screening in Progress'
  | 'Screening Failed'
  | 'Screened'
  | 'Shortlisted'
  | 'Rejected'
  | 'Reviewed';

export type ExperienceSource = 'auto' | 'manual';

export interface ResumeSkill {
  displayName: string;
  normalizedName: string;
  category: string;
}

export interface ResumeEducationEntry {
  degree: string;
  field: string;
  institution: string;
  duration: string;
  cgpa: string;
  rawText: string;
}

export interface ResumeExperienceEntry {
  title: string;
  organization: string;
  duration: string;
  type: 'full-time' | 'internship' | 'project';
  location: string;
  summary: string;
  rawText: string;
}

export interface StructuredResumeProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  professionalSummary: string;
  education: ResumeEducationEntry[];
  skills: ResumeSkill[];
  workExperience: ResumeExperienceEntry[];
  internshipExperience: ResumeExperienceEntry[];
  projects: string[];
  certifications: string[];
  achievements: string[];
  rawText: string;
  cleanedText: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  professionalSummary?: string;
  resumeText: string;
  yearsExperience: number;
  experienceCategory: ExperienceCategory;
  internshipMonths: number;
  fullTimeExperienceMonths: number;
  experienceOverridden: boolean;
  experienceSource: ExperienceSource;
  experienceExplanation: string;
  education: string;
  educationEntries?: ResumeEducationEntry[];
  skills: string[];
  skillDetails?: ResumeSkill[];
  projects: string[];
  certifications: string[];
  achievements?: string[];
  workExperience?: ResumeExperienceEntry[];
  internshipExperience?: ResumeExperienceEntry[];
  source: 'manual' | 'uploaded';
  fileName: string;
  resumeFingerprint?: string;
  status?: CandidateStatus;
  screeningResult: ScreeningResult | null;
  screeningHistory?: ScreeningResult[];
  latestScreenedAt?: string;
  latestScreenedJobProfileId?: string;
  latestScreenedJobProfileTitle?: string;
  resumeProfile?: StructuredResumeProfile;
  createdAt: string;
  updatedAt: string;
}

export interface JobConfig {
  jobTitle: string;
  jobDescription: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperience: number;
  maxExperience: number;
  educationRequirements: string;
  roleCategory: string;
}

export interface JobProfile extends JobConfig {
  id: string;
  status: 'active' | 'archived';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScreeningResult {
  overallScore: number;
  requiredSkillsMatch: number;
  preferredSkillsMatch: number;
  experienceMatch: number;
  requiredSkillScore?: number;
  preferredSkillScore?: number;
  experienceScore?: number;
  matchedRequiredSkills?: string[];
  missingRequiredSkills?: string[];
  matchedPreferredSkills?: string[];
  missingPreferredSkills?: string[];
  matchedSkills: string[];
  missingSkills: string[];
  explanation: string;
  experienceCategory?: string;
  experienceExplanation?: string;
  scoringModel?: 'Rule-Based Screening';
  recommendation: 'Strong Match' | 'Moderate Match' | 'Weak Match' | 'No Match';
  candidateId?: string;
  candidateName?: string;
  jobProfileId?: string;
  jobProfileTitle?: string;
  screenedAt?: string;
}

export interface ParsedFile {
  fileName: string;
  text: string;
  rawText?: string;
}

export const ROLE_CATEGORIES = [
  'Backend Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'Data/AI Engineer',
  'DevOps Engineer',
  'General Software Engineer',
] as const;

export const EMPTY_JOB_CONFIG: JobConfig = {
  jobTitle: '',
  jobDescription: '',
  requiredSkills: [],
  preferredSkills: [],
  minExperience: 0,
  maxExperience: 0,
  educationRequirements: '',
  roleCategory: '',
};

export const EXPERIENCE_CATEGORIES: ExperienceCategory[] = [
  'Fresher',
  'Fresher or Internship Only',
  'Internship Experience',
  'Entry-Level Professional',
  'Experienced Professional',
  'Experience not clearly specified',
];
