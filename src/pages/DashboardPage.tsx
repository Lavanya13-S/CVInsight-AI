import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Candidate, JobConfig, JobProfile, ScreeningResult } from '@/types';
import { storage } from '@/services/storage';
import { extractExperience } from '@/services/experience';
import { parseSkillsForDisplay } from '@/services/skillCatalog';
import { screenSelectedCandidates } from '@/services/screening';
import { useToast } from '@/context/ToastContext';
import Header from '@/components/Header';
import JobConfiguration from '@/components/JobConfiguration';
import ManualCandidateForm from '@/components/ManualCandidateForm';
import ResumeUploader from '@/components/ResumeUploader';
import CandidateList from '@/components/CandidateList';
import RankingTable from '@/components/RankingTable';
import CandidateComparison from '@/components/CandidateComparison';
import CandidateDetailModal from '@/components/CandidateDetailModal';
import EditCandidateModal from '@/components/EditCandidateModal';

function profileToConfig(profile: JobProfile): JobConfig {
  const { id: _id, status: _status, isActive: _isActive, createdAt: _createdAt, updatedAt: _updatedAt, ...config } = profile;
  return config;
}

function fallbackSkillDetails(skills: string[]) {
  return skills.map((skill) => ({
    displayName: skill,
    normalizedName: skill.toLowerCase(),
    category: 'Uncategorized',
  }));
}

function hydrateCandidate(candidate: Candidate): Candidate {
  const inferredExperience = candidate.source === 'uploaded' && candidate.resumeText && !candidate.experienceOverridden
    ? extractExperience(candidate.resumeText)
    : null;

  const educationEntries = candidate.educationEntries ?? [];
  const resumeProfile = candidate.resumeProfile ?? {
    fullName: candidate.name,
    email: candidate.email,
    phone: candidate.phone,
    location: candidate.location ?? 'Not specified',
    linkedinUrl: candidate.linkedinUrl ?? '',
    githubUrl: candidate.githubUrl ?? '',
    professionalSummary: candidate.professionalSummary ?? 'Not specified',
    education: educationEntries,
    skills: candidate.skillDetails ?? fallbackSkillDetails(candidate.skills ?? []),
    workExperience: candidate.workExperience ?? [],
    internshipExperience: candidate.internshipExperience ?? [],
    projects: candidate.projects ?? [],
    certifications: candidate.certifications ?? [],
    achievements: candidate.achievements ?? [],
    rawText: candidate.resumeText ?? '',
    cleanedText: candidate.resumeText ?? '',
  };

  return {
    ...candidate,
    location: candidate.location ?? 'Not specified',
    linkedinUrl: candidate.linkedinUrl ?? '',
    githubUrl: candidate.githubUrl ?? '',
    professionalSummary: candidate.professionalSummary ?? resumeProfile.professionalSummary ?? 'Not specified',
    yearsExperience: inferredExperience ? inferredExperience.yearsExperience : candidate.yearsExperience ?? 0,
    internshipMonths: inferredExperience ? inferredExperience.internshipMonths : candidate.internshipMonths ?? 0,
    fullTimeExperienceMonths: inferredExperience ? inferredExperience.fullTimeExperienceMonths : candidate.fullTimeExperienceMonths ?? Math.round((candidate.yearsExperience ?? 0) * 12),
    experienceCategory: inferredExperience ? inferredExperience.experienceCategory : candidate.experienceCategory ?? ((candidate.yearsExperience ?? 0) > 0 ? 'Entry-Level Professional' : 'Fresher'),
    experienceExplanation: inferredExperience ? inferredExperience.explanation : candidate.experienceExplanation ?? 'Legacy candidate record.',
    educationEntries,
    skillDetails: candidate.skillDetails ?? fallbackSkillDetails(candidate.skills ?? []),
    skills: parseSkillsForDisplay((candidate.skills ?? []).join(',')),
    achievements: candidate.achievements ?? [],
    workExperience: candidate.workExperience ?? [],
    internshipExperience: candidate.internshipExperience ?? [],
    status: candidate.status ?? 'Ready for Screening',
    screeningHistory: candidate.screeningHistory ?? (candidate.screeningResult ? [candidate.screeningResult] : []),
    latestScreenedAt: candidate.latestScreenedAt ?? candidate.screeningResult?.screenedAt ?? '',
    latestScreenedJobProfileId: candidate.latestScreenedJobProfileId ?? candidate.screeningResult?.jobProfileId ?? '',
    latestScreenedJobProfileTitle: candidate.latestScreenedJobProfileTitle ?? candidate.screeningResult?.jobProfileTitle ?? '',
    resumeProfile,
  };
}

function buildProfileResultMap(candidates: Candidate[], profileId: string): Record<string, ScreeningResult> {
  return candidates.reduce<Record<string, ScreeningResult>>((accumulator, candidate) => {
    const result = candidate.screeningHistory?.find((item) => item.jobProfileId === profileId) ?? candidate.screeningResult ?? null;
    if (result && (result.jobProfileId === profileId || !result.jobProfileId)) {
      accumulator[candidate.id] = {
        ...result,
        jobProfileId: result.jobProfileId ?? profileId,
      };
    }
    return accumulator;
  }, {});
}

export default function DashboardPage() {
  const { showToast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>(() => storage.getCandidates().map(hydrateCandidate));
  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>(() => storage.getJobProfiles());
  const [jobConfig, setJobConfig] = useState<JobConfig | null>(() => storage.getJobConfig());
  const [activeJobProfileId, setActiveJobProfileId] = useState<string>(() => storage.getActiveJobProfileId());
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [recentCandidateIds, setRecentCandidateIds] = useState<string[]>([]);
  const [screeningStatus, setScreeningStatus] = useState<'idle' | 'in-progress' | 'success' | 'error'>('idle');
  const [screeningMessage, setScreeningMessage] = useState('');
  const [detailCandidate, setDetailCandidate] = useState<Candidate | null>(null);
  const [editCandidate, setEditCandidate] = useState<Candidate | null>(null);
  const candidatesRef = useRef(candidates);

  const activeProfile = useMemo(() => {
    if (activeJobProfileId) {
      return jobProfiles.find((profile) => profile.id === activeJobProfileId) ?? null;
    }
    return jobProfiles.find((profile) => profile.isActive) ?? null;
  }, [activeJobProfileId, jobProfiles]);

  const activeProfileId = activeProfile?.id ?? activeJobProfileId;

  useEffect(() => {
    candidatesRef.current = candidates;
  }, [candidates]);

  useEffect(() => {
    if (recentCandidateIds.length === 0) return;
    const timeout = window.setTimeout(() => setRecentCandidateIds([]), 5000);
    return () => window.clearTimeout(timeout);
  }, [recentCandidateIds]);

  useEffect(() => {
    storage.setCandidates(candidates);
  }, [candidates]);

  useEffect(() => {
    storage.setJobProfiles(jobProfiles);
  }, [jobProfiles]);

  useEffect(() => {
    if (jobConfig) {
      storage.setJobConfig(jobConfig);
    }
  }, [jobConfig]);

  useEffect(() => {
    if (activeProfileId) {
      storage.setActiveJobProfileId(activeProfileId);
    } else {
      storage.clearActiveJobProfileId();
    }
  }, [activeProfileId]);

  useEffect(() => {
    if (!activeProfileId) {
      setCandidates((prev) =>
        prev.map((candidate) => ({
          ...candidate,
          screeningResult: null,
          status: candidate.status === 'Screened' ? 'Ready for Screening' : candidate.status ?? 'Ready for Screening',
        }))
      );
      return;
    }

    const profileResults = storage.getScreeningResultsForProfile(activeProfileId);
    setCandidates((prev) =>
      prev.map((candidate) => {
        const result = profileResults[candidate.id] ?? null;
        return {
          ...candidate,
          screeningResult: result,
          status: result ? 'Screened' : 'Ready for Screening',
          latestScreenedAt: result?.screenedAt ?? candidate.latestScreenedAt ?? '',
          latestScreenedJobProfileId: result?.jobProfileId ?? candidate.latestScreenedJobProfileId ?? '',
          latestScreenedJobProfileTitle: result?.jobProfileTitle ?? candidate.latestScreenedJobProfileTitle ?? '',
          screeningHistory: candidate.screeningHistory ?? (result ? [result] : []),
        };
      })
    );
  }, [activeProfileId]);

  useEffect(() => {
    if (activeProfile) {
      setJobConfig(profileToConfig(activeProfile));
    }
  }, [activeProfile?.id]);

  useEffect(() => {
    if (!activeProfile) return;
    const profileResults = buildProfileResultMap(candidates, activeProfile.id);
    if (Object.keys(profileResults).length > 0) {
      storage.setScreeningResultsForProfile(activeProfile.id, profileResults);
    }
  }, [activeProfile?.id, candidates]);

  const addCandidate = useCallback((candidate: Candidate) => {
    let accepted = true;
    setCandidates((prev) => {
      const duplicate = prev.some(
        (existing) =>
          (candidate.resumeFingerprint && existing.resumeFingerprint === candidate.resumeFingerprint) ||
          (
            candidate.email.trim() !== '' &&
            existing.email.trim().toLowerCase() === candidate.email.trim().toLowerCase() &&
            candidate.fileName.trim() !== '' &&
            existing.fileName.trim().toLowerCase() === candidate.fileName.trim().toLowerCase()
          )
      );
      if (duplicate) {
        accepted = false;
        showToast(
          candidate.fileName
            ? `${candidate.fileName}: skipped because an identical resume was already added.`
            : `${candidate.name}: skipped because an identical resume was already added.`,
          'error'
        );
        return prev;
      }
      setRecentCandidateIds((prev) => [...prev.filter((id) => id !== candidate.id), candidate.id]);
      return [...prev, hydrateCandidate(candidate)];
    });
    return accepted;
  }, []);

  const deleteCandidate = useCallback((id: string) => {
    setCandidates((prev) => prev.filter((candidate) => candidate.id !== id));
    setSelectedCandidateIds((prev) => prev.filter((candidateId) => candidateId !== id));
    setRecentCandidateIds((prev) => prev.filter((candidateId) => candidateId !== id));
  }, []);

  const clearAllCandidates = useCallback(() => {
    setCandidates([]);
    setSelectedCandidateIds([]);
    setRecentCandidateIds([]);
    storage.clearScreeningResults();
    setScreeningStatus('idle');
    setScreeningMessage('');
  }, []);

  const updateCandidate = useCallback((updated: Candidate) => {
    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === updated.id
          ? hydrateCandidate({ ...updated, updatedAt: new Date().toISOString() })
          : candidate
      )
    );
  }, []);

  const toggleCandidateSelection = useCallback((candidateId: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  }, []);

  const saveJobConfig = useCallback((config: JobConfig) => {
    const now = new Date().toISOString();
    const existing = jobProfiles.find(
      (profile) => profile.jobTitle.trim().toLowerCase() === config.jobTitle.trim().toLowerCase()
    );
    const profile: JobProfile = {
      ...config,
      id: existing?.id ?? `job_${Date.now()}`,
      status: 'active',
      isActive: true,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    setJobProfiles((prev) => [
      ...prev.filter((item) => item.id !== profile.id).map((item) => ({ ...item, isActive: false })),
      profile,
    ]);
    setJobConfig(config);
    setActiveJobProfileId(profile.id);
    setScreeningStatus('idle');
    setScreeningMessage('');
  }, [jobProfiles]);

  const loadJobProfile = useCallback((id: string) => {
    const profile = jobProfiles.find((item) => item.id === id);
    if (!profile) return;
    const config = profileToConfig(profile);
    setJobConfig(config);
    setActiveJobProfileId(profile.id);
    setJobProfiles((prev) => prev.map((item) => ({ ...item, isActive: item.id === id })));
    setScreeningStatus('idle');
    setScreeningMessage('');
  }, [jobProfiles]);

  const runScreening = useCallback(async (candidateIds: string[]) => {
    if (!activeProfile) {
      setScreeningStatus('error');
      setScreeningMessage('Create or save a job profile before screening.');
      showToast('Create or save a job profile before screening.', 'error');
      throw new Error('No active job profile selected.');
    }
    if (candidateIds.length === 0) {
      setScreeningStatus('error');
      setScreeningMessage('Select one or more candidates to begin screening.');
      showToast('Select one or more candidates to begin screening.', 'error');
      throw new Error('No candidates selected.');
    }

    setScreeningStatus('in-progress');
    setScreeningMessage(`Screening ${candidateIds.length} candidate${candidateIds.length > 1 ? 's' : ''}...`);
    setCandidates((prev) => prev.map((candidate) => (candidateIds.includes(candidate.id) ? { ...candidate, status: 'Screening in Progress' } : candidate)));

    try {
      const screened = screenSelectedCandidates(candidatesRef.current, activeProfile, candidateIds);
      const screenedMap = new Map(screened.map((candidate) => [candidate.id, candidate]));

      setCandidates((prev) =>
        prev.map((candidate) => screenedMap.get(candidate.id) ?? candidate)
      );

      const resultPayload = screened.reduce<Record<string, ScreeningResult>>((accumulator, candidate) => {
        if (candidateIds.includes(candidate.id) && candidate.screeningResult) {
          accumulator[candidate.id] = candidate.screeningResult;
        }
        return accumulator;
      }, {});

      storage.setScreeningResultsForProfile(activeProfile.id, {
        ...storage.getScreeningResultsForProfile(activeProfile.id),
        ...resultPayload,
      });

      setSelectedCandidateIds([]);
      setScreeningStatus('success');
      setScreeningMessage(`Screening completed. Results are available below.`);
      showToast(`Screening complete. ${candidateIds.length} candidate${candidateIds.length > 1 ? 's' : ''} evaluated.`, 'success');
    } catch (error) {
      setCandidates((prev) =>
        prev.map((candidate) =>
          candidateIds.includes(candidate.id)
            ? { ...candidate, status: 'Screening Failed' }
            : candidate
        )
      );
      setScreeningStatus('error');
      setScreeningMessage('Screening failed. Please check the job profile and try again.');
      showToast('Screening failed. Please check the job profile and try again.', 'error');
      throw error;
    }
  }, [activeProfile, showToast]);

  const screenSelected = useCallback(() => runScreening(selectedCandidateIds), [runScreening, selectedCandidateIds]);

  const screenAll = useCallback(() => runScreening(candidatesRef.current.map((candidate) => candidate.id)), [runScreening]);

  const selectAllCandidates = useCallback(() => {
    setSelectedCandidateIds(candidatesRef.current.map((candidate) => candidate.id));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCandidateIds([]);
  }, []);

  const manageJobProfiles = useCallback(() => {
    const element = document.querySelector('[data-job-config-panel]');
    if (element instanceof HTMLElement) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const activeResults = activeProfile ? storage.getScreeningResultsForProfile(activeProfile.id) : {};
  const screenedCandidates = activeProfile
    ? candidates.filter((candidate) => Boolean(activeResults[candidate.id]))
    : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <section data-job-config-panel>
          <JobConfiguration
            jobConfig={jobConfig}
            onSave={saveJobConfig}
            savedProfiles={jobProfiles}
            onLoadProfile={loadJobProfile}
          />
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Candidate Intake</h2>
            <p className="text-sm text-slate-500 mt-1">
              Add candidates manually or upload multiple resumes. Every successful upload appends to the existing candidate list.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ManualCandidateForm onAdd={addCandidate} />
            <ResumeUploader onAdd={addCandidate} onCandidatesAdded={setRecentCandidateIds} />
          </div>
        </section>

        <section>
          <CandidateList
            candidates={candidates}
            selectedCandidateIds={selectedCandidateIds}
            onToggleSelect={toggleCandidateSelection}
            onSelectAll={selectAllCandidates}
            onClearSelection={clearSelection}
            onSelectJobProfile={loadJobProfile}
            jobProfiles={jobProfiles}
            activeJobProfileId={activeProfile?.id ?? ''}
            onScreenSelected={screenSelected}
            onScreenAll={screenAll}
            onManageJobProfiles={manageJobProfiles}
            onView={setDetailCandidate}
            onEdit={setEditCandidate}
            onDelete={deleteCandidate}
            onClearAll={clearAllCandidates}
            highlightedCandidateIds={recentCandidateIds}
          />
        </section>

        <section>
          <RankingTable
            screenedCandidates={screenedCandidates}
            candidates={candidates}
            activeJobProfile={activeProfile}
            screeningStatus={screeningStatus}
            screeningMessage={screeningMessage}
            onView={setDetailCandidate}
          />
        </section>
        <CandidateComparison candidates={candidates} />
      </main>

      <CandidateDetailModal
        candidate={detailCandidate}
        onClose={() => setDetailCandidate(null)}
      />
      <EditCandidateModal
        candidate={editCandidate}
        onClose={() => setEditCandidate(null)}
        onSave={updateCandidate}
      />
    </div>
  );
}
