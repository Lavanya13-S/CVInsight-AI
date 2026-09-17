import type { Candidate, JobConfig, JobProfile, ScreeningResult } from '@/types';
import { normalizeSkillsForMatching } from './skillCatalog';

function normalizeSkills(skills: string[]): string[] {
  return normalizeSkillsForMatching(skills);
}

function calcRequiredMatch(candidateSkills: string[], required: string[]) {
  if (required.length === 0) return 100;
  const matched = required.filter((r) =>
    candidateSkills.some(
      (c) => c === r || c.includes(r) || r.includes(c)
    )
  );
  return Math.round((matched.length / required.length) * 100);
}

function calcPreferredMatch(candidateSkills: string[], preferred: string[]) {
  if (preferred.length === 0) return 100;
  const matched = preferred.filter((p) =>
    candidateSkills.some(
      (c) => c === p || c.includes(p) || p.includes(c)
    )
  );
  return Math.round((matched.length / preferred.length) * 100);
}

function calcExperienceMatch(
  years: number,
  min: number,
  max: number
): number {
  if (min === 0 && max === 0) return 100;
  if (years >= min && (max === 0 || years <= max)) return 100;
  if (years < min) {
    return Math.round((years / min) * 100);
  }
  // years > max
  const overshoot = years - max;
  return Math.max(0, 100 - overshoot * 10);
}

function getRecommendation(score: number): ScreeningResult['recommendation'] {
  if (score >= 75) return 'Strong Match';
  if (score >= 50) return 'Moderate Match';
  if (score >= 25) return 'Weak Match';
  return 'No Match';
}

export function screenCandidate(
  candidate: Candidate,
  job: JobConfig
): ScreeningResult {
  const candidateSkills = normalizeSkills(candidate.skills);
  const required = normalizeSkills(job.requiredSkills);
  const preferred = normalizeSkills(job.preferredSkills);

  const reqMatched = required.filter((r) =>
    candidateSkills.some((c) => c === r || c.includes(r) || r.includes(c))
  );
  const prefMatched = preferred.filter((p) =>
    candidateSkills.some((c) => c === p || c.includes(p) || p.includes(c))
  );

  const requiredSkillsMatch = calcRequiredMatch(candidateSkills, required);
  const preferredSkillsMatch = calcPreferredMatch(candidateSkills, preferred);
  const experienceMatch = calcExperienceMatch(
    candidate.yearsExperience,
    job.minExperience,
    job.maxExperience
  );

  const overallScore = Math.round(
    requiredSkillsMatch * 0.6 +
      preferredSkillsMatch * 0.2 +
      experienceMatch * 0.2
  );

  const missingSkills = required.filter(
    (r) => !candidateSkills.some((c) => c === r || c.includes(r) || r.includes(c))
  );

  const explanationParts: string[] = [];
  explanationParts.push(
    `Required skills match: ${requiredSkillsMatch}% (${reqMatched.length}/${required.length} matched).`
  );
  explanationParts.push(
    `Preferred skills match: ${preferredSkillsMatch}% (${prefMatched.length}/${preferred.length} matched).`
  );
  explanationParts.push(
    `Experience match: ${experienceMatch}% (candidate has ${candidate.yearsExperience} years, job requires ${job.minExperience}–${job.maxExperience} years).`
  );

  if (missingSkills.length > 0) {
    explanationParts.push(
      `Missing required skills: ${missingSkills.join(', ')}.`
    );
  } else if (required.length > 0) {
    explanationParts.push('All required skills are present.');
  }

  return {
    overallScore,
    requiredSkillsMatch,
    preferredSkillsMatch,
    experienceMatch,
    requiredSkillScore: requiredSkillsMatch,
    preferredSkillScore: preferredSkillsMatch,
    experienceScore: experienceMatch,
    matchedRequiredSkills: reqMatched,
    missingRequiredSkills: missingSkills,
    matchedPreferredSkills: prefMatched,
    missingPreferredSkills: preferred.filter(
      (p) => !candidateSkills.some((c) => c === p || c.includes(p) || p.includes(c))
    ),
    matchedSkills: [...reqMatched, ...prefMatched],
    missingSkills,
    explanation: explanationParts.join(' '),
    experienceCategory: candidate.experienceCategory,
    experienceExplanation: candidate.experienceExplanation,
    scoringModel: 'Rule-Based Screening',
    recommendation: getRecommendation(overallScore),
    candidateId: candidate.id,
    candidateName: candidate.name,
  };
}

export function screenCandidates(
  candidates: Candidate[],
  job: JobConfig
): Candidate[] {
  return candidates.map((c) => ({
    ...c,
    screeningResult: screenCandidate(c, job),
  }));
}

export function screenSelectedCandidates(
  candidates: Candidate[],
  jobProfile: JobProfile,
  selectedCandidateIds: string[]
): Candidate[] {
  const selected = new Set(selectedCandidateIds);
  return candidates.map((candidate) => {
    if (!selected.has(candidate.id)) return candidate;
    const result = {
      ...screenCandidate(candidate, jobProfile),
      jobProfileId: jobProfile.id,
      jobProfileTitle: jobProfile.jobTitle,
      screenedAt: new Date().toISOString(),
    } satisfies ScreeningResult;

    return {
      ...candidate,
      screeningResult: result,
      screeningHistory: [...(candidate.screeningHistory ?? []), result],
      status: 'Screened',
      latestScreenedAt: result.screenedAt,
      latestScreenedJobProfileId: jobProfile.id,
      latestScreenedJobProfileTitle: jobProfile.jobTitle,
    };
  });
}
