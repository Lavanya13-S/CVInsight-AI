import { useMemo, useState } from 'react';
import { ScanSearch, Loader2, Info, CheckCircle2, AlertCircle, FolderOpen } from 'lucide-react';
import type { JobConfig, JobProfile } from '@/types';
import { useToast } from '@/context/ToastContext';

interface Props {
  jobConfig: JobConfig | null;
  jobProfiles: JobProfile[];
  activeJobProfileId: string;
  selectedCandidateIds: string[];
  onSelectJobProfile: (id: string) => void;
  onScreen: () => void;
  onScreenAll: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onManageJobProfiles: () => void;
  screeningStatus: 'idle' | 'in-progress' | 'success' | 'error';
  screeningMessage: string;
}

export default function ScreeningControls({
  jobConfig,
  jobProfiles,
  activeJobProfileId,
  selectedCandidateIds,
  onSelectJobProfile,
  onScreen,
  onScreenAll,
  onSelectAll,
  onClearSelection,
  onManageJobProfiles,
  screeningStatus,
  screeningMessage,
}: Props) {
  const { showToast } = useToast();
  const [processing, setProcessing] = useState(false);

  const canScreen = Boolean(jobConfig?.jobTitle.trim()) && jobProfiles.length > 0 && selectedCandidateIds.length > 0;

  const selectedProfile = useMemo(
    () => jobProfiles.find((profile) => profile.id === activeJobProfileId) ?? null,
    [activeJobProfileId, jobProfiles]
  );

  const statusMessage = !jobProfiles.length
    ? 'Create and save a job profile before screening candidates.'
    : !jobConfig?.jobTitle.trim()
      ? 'Select an existing saved job profile before screening candidates.'
      : selectedCandidateIds.length === 0
        ? 'Candidates are ready. Select a job profile and run screening to generate rankings.'
        : `Ready to screen ${selectedCandidateIds.length} selected candidate${selectedCandidateIds.length > 1 ? 's' : ''}.`;

  const handleScreen = async () => {
    if (!jobProfiles.length) {
      showToast('Create or select a job profile before screening candidates.', 'error');
      return;
    }
    if (!jobConfig?.jobTitle.trim()) {
      showToast('Select a saved job profile before screening candidates.', 'error');
      return;
    }
    if (selectedCandidateIds.length === 0) {
      showToast('Select one or more candidates before screening.', 'error');
      return;
    }

    setProcessing(true);
    try {
      await Promise.resolve(onScreen());
      showToast(
        `Screening complete. ${selectedCandidateIds.length} candidate${selectedCandidateIds.length > 1 ? 's' : ''} evaluated.`,
        'success'
      );
    } catch (error) {
      showToast('Screening failed. Please check the job configuration and try again.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-50">
          <ScanSearch className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h3 className="section-title">Screening Controls</h3>
          <p className="section-subtitle">
            Rule-Based Screening — select candidates and run them against a saved job profile.
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-brand-50 border border-brand-100 px-4 py-3 mb-4 flex items-start gap-2">
        <Info className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
        <div className="text-sm text-brand-800">
          <p className="font-semibold mb-1">Rule-Based Screening</p>
          <p className="text-xs text-brand-700">
            Weighting: Required Skills (60%) · Preferred Skills (20%) · Experience Match (20%). No AI model is used.
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <FolderOpen className="h-4 w-4 text-slate-500" />
            <p className="text-xs text-slate-500 font-semibold uppercase">Saved Job Profile</p>
          </div>
          <div className="relative">
            <select
              value={activeJobProfileId}
              onChange={(e) => onSelectJobProfile(e.target.value)}
              className="select-field"
            >
              <option value="">Select a saved job profile...</option>
              {jobProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.jobTitle}{profile.isActive ? ' (Active)' : ''}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-500 mt-2">Create or select a job profile before screening candidates.</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-500 font-semibold uppercase">Selected Candidates</p>
          <div className="flex items-center gap-1.5 mt-2">
            <CheckCircle2 className="w-4 h-4 text-accent-500" />
            <span className="text-sm font-medium text-slate-700">
              {selectedCandidateIds.length} selected
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 mb-4">
        <p className="text-sm font-semibold text-slate-700 mb-1">Next step</p>
        <p className="text-sm text-slate-600">{screeningMessage || statusMessage}</p>
      </div>

      {!canScreen && (
        <div className="rounded-lg bg-warning-50 border border-warning-100 px-4 py-3 mb-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-warning-600 mt-0.5 shrink-0" />
          <p className="text-sm text-warning-700">
            {statusMessage}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleScreen}
          disabled={!canScreen || processing}
          className="btn-primary flex-1"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Screening selected candidates...
            </>
          ) : (
            <>
              <ScanSearch className="w-4 h-4" />
              Screen Selected Candidates
            </>
          )}
        </button>
        <button onClick={onClearSelection} className="btn-secondary">
          Clear Selection
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <button onClick={onSelectAll} className="btn-ghost text-brand-700">
          Select All
        </button>
        <button onClick={onScreenAll} className="btn-ghost text-brand-700">
          Screen All Candidates
        </button>
        <button onClick={onManageJobProfiles} className="btn-ghost text-brand-700">
          Manage Job Profiles
        </button>
      </div>

      {screeningStatus === 'success' && (
        <div className="mt-3 rounded-lg border border-accent-100 bg-accent-50 px-4 py-3 text-sm text-accent-800">
          Screening completed successfully. Ranked results are shown below.
        </div>
      )}

      {screeningStatus === 'error' && (
        <div className="mt-3 rounded-lg border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-800">
          {screeningMessage || 'Screening failed. Please check the job configuration and try again.'}
        </div>
      )}
    </div>
  );
}
