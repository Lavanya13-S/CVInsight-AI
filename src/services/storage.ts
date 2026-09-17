import type { Candidate, JobConfig, JobProfile, ScreeningResult, User } from '@/types';

const KEYS = {
  auth: 'cvinsight_auth',
  candidates: 'cvinsight_candidates',
  jobConfig: 'cvinsight_job_config',
  jobProfiles: 'cvinsight_job_profiles',
  activeJobProfileId: 'cvinsight_active_job_profile_id',
  screeningResultsByProfile: 'cvinsight_screening_results_by_profile',
  screeningResultsLegacy: 'cvinsight_screening_results',
} as const;

function normalizeCandidateRecord(candidate: Candidate): Candidate {
  return {
    ...candidate,
    location: candidate.location ?? 'Not specified',
    linkedinUrl: candidate.linkedinUrl ?? '',
    githubUrl: candidate.githubUrl ?? '',
    professionalSummary: candidate.professionalSummary ?? 'Not specified',
    educationEntries: candidate.educationEntries ?? [],
    skillDetails: candidate.skillDetails ?? [],
    achievements: candidate.achievements ?? [],
    workExperience: candidate.workExperience ?? [],
    internshipExperience: candidate.internshipExperience ?? [],
    status: candidate.status ?? 'Ready for Screening',
    screeningHistory: candidate.screeningHistory ?? [],
    latestScreenedAt: candidate.latestScreenedAt ?? '',
    latestScreenedJobProfileId: candidate.latestScreenedJobProfileId ?? '',
    latestScreenedJobProfileTitle: candidate.latestScreenedJobProfileTitle ?? '',
    resumeProfile: candidate.resumeProfile,
  };
}

// localStorage is intentionally used for persistence across browser sessions and restarts.
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key) ?? sessionStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch { return fallback; }
}
function write<T>(key: string, value: T): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}
function remove(key: string): void { localStorage.removeItem(key); sessionStorage.removeItem(key); }

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key) ?? sessionStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export const storage = {
  getAuth: (): User | null => read<User | null>(KEYS.auth, null),
  setAuth: (u: User) => write(KEYS.auth, u),
  clearAuth: () => remove(KEYS.auth),
  getCandidates: (): Candidate[] => {
    try {
      const raw = localStorage.getItem(KEYS.candidates) ?? sessionStorage.getItem(KEYS.candidates);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((candidate) => normalizeCandidateRecord(candidate as Candidate));
      if (parsed && typeof parsed === 'object' && 'id' in parsed) {
        return [normalizeCandidateRecord(parsed as Candidate)];
      }
      return [];
    } catch {
      return [];
    }
  },
  setCandidates: (c: Candidate[]) => write(KEYS.candidates, c.map(normalizeCandidateRecord)),
  getJobConfig: (): JobConfig | null => read<JobConfig | null>(KEYS.jobConfig, null),
  setJobConfig: (j: JobConfig) => write(KEYS.jobConfig, j),
  clearJobConfig: () => remove(KEYS.jobConfig),
  getJobProfiles: (): JobProfile[] => read<JobProfile[]>(KEYS.jobProfiles, []),
  setJobProfiles: (profiles: JobProfile[]) => write(KEYS.jobProfiles, profiles),
  getActiveJobProfileId: (): string => read<string>(KEYS.activeJobProfileId, ''),
  setActiveJobProfileId: (id: string) => write(KEYS.activeJobProfileId, id),
  clearActiveJobProfileId: () => remove(KEYS.activeJobProfileId),
  getScreeningResultsByProfile: (): Record<string, Record<string, ScreeningResult>> => {
    const profileResults = readJson<Record<string, Record<string, ScreeningResult>>>(KEYS.screeningResultsByProfile, {});
    if (Object.keys(profileResults).length > 0) return profileResults;

    const legacyResults = readJson<Record<string, ScreeningResult>>(KEYS.screeningResultsLegacy, {});
    if (Object.keys(legacyResults).length === 0) return {};

    return { legacy: legacyResults };
  },
  getScreeningResultsForProfile: (profileId: string): Record<string, ScreeningResult> => {
    const all = storage.getScreeningResultsByProfile();
    return all[profileId] ?? {};
  },
  setScreeningResultsForProfile: (profileId: string, results: Record<string, ScreeningResult>) => {
    const all = storage.getScreeningResultsByProfile();
    all[profileId] = results;
    writeJson(KEYS.screeningResultsByProfile, all);
    writeJson(KEYS.screeningResultsLegacy, results);
  },
  clearScreeningResults: () => {
    remove(KEYS.screeningResultsByProfile);
    remove(KEYS.screeningResultsLegacy);
  },
};
