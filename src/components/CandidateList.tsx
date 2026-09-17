import { useEffect, useState } from 'react';
import {
  Users,
  Eye,
  Pencil,
  Trash2,
  XCircle,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Upload,
  CheckCircle2,
  Clock,
  ScanSearch,
  Sparkles,
  UserCheck,
  FolderOpen,
} from 'lucide-react';
import type { Candidate, JobProfile } from '@/types';
import { useToast } from '@/context/ToastContext';

interface Props {
  candidates: Candidate[];
  selectedCandidateIds: string[];
  onToggleSelect: (candidateId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onSelectJobProfile: (id: string) => void;
  jobProfiles: JobProfile[];
  activeJobProfileId: string;
  onScreenSelected: () => Promise<void>;
  onScreenAll: () => Promise<void>;
  onManageJobProfiles: () => void;
  onView: (candidate: Candidate) => void;
  onEdit: (candidate: Candidate) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  highlightedCandidateIds?: string[];
}

function SourceBadge({ source }: { source: 'manual' | 'uploaded' }) {
  return source === 'uploaded' ? (
    <span className="badge bg-brand-50 text-brand-700">
      <Upload className="w-3 h-3 mr-1" />
      Uploaded
    </span>
  ) : (
    <span className="badge bg-accent-50 text-accent-700">
      <Sparkles className="w-3 h-3 mr-1" />
      Manual
    </span>
  );
}

function StatusBadge({ candidate }: { candidate: Candidate }) {
  const status = candidate.status ?? 'Ready for Screening';
  const colorMap: Record<string, string> = {
    Uploaded: 'bg-slate-100 text-slate-600',
    'Ready for Screening': 'bg-brand-50 text-brand-700',
    'Screening in Progress': 'bg-brand-50 text-brand-700',
    'Screening Failed': 'bg-danger-50 text-danger-700',
    Screened: 'bg-accent-50 text-accent-700',
    Shortlisted: 'bg-emerald-50 text-emerald-700',
    Rejected: 'bg-danger-50 text-danger-700',
    Reviewed: 'bg-warning-50 text-warning-700',
  };

  const labelMap: Record<string, string> = {
    Uploaded: 'Not Screened',
    'Ready for Screening': 'Not Screened',
    'Screening in Progress': 'Screening',
    'Screening Failed': 'Screening Failed',
    Screened: 'Screened',
    Shortlisted: 'Screened',
    Rejected: 'Screened',
    Reviewed: 'Screened',
  };

  const iconMap: Record<string, JSX.Element> = {
    Uploaded: <Clock className="w-3 h-3 mr-1" />,
    'Ready for Screening': <Clock className="w-3 h-3 mr-1" />,
    'Screening in Progress': <Clock className="w-3 h-3 mr-1 animate-pulse" />,
    'Screening Failed': <XCircle className="w-3 h-3 mr-1" />,
    Screened: <CheckCircle2 className="w-3 h-3 mr-1" />,
    Shortlisted: <CheckCircle2 className="w-3 h-3 mr-1" />,
    Rejected: <XCircle className="w-3 h-3 mr-1" />,
    Reviewed: <CheckCircle2 className="w-3 h-3 mr-1" />,
  };

  return (
    <span className={`badge ${colorMap[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {iconMap[status] ?? <Clock className="w-3 h-3 mr-1" />}
      {labelMap[status] ?? status}
    </span>
  );
}

function ExperienceBadge({ candidate }: { candidate: Candidate }) {
  const label = candidate.experienceCategory || 'Experience not clearly specified';
  return (
    <span className="badge bg-amber-50 text-amber-700">
      <UserCheck className="w-3 h-3 mr-1" />
      {label}
    </span>
  );
}

export default function CandidateList({
  candidates,
  selectedCandidateIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onSelectJobProfile,
  jobProfiles,
  activeJobProfileId,
  onScreenSelected,
  onScreenAll,
  onManageJobProfiles,
  onView,
  onEdit,
  onDelete,
  onClearAll,
  highlightedCandidateIds = [],
}: Props) {
  const { showToast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (highlightedCandidateIds.length === 0) return;
    const latestId = highlightedCandidateIds[highlightedCandidateIds.length - 1];
    const element = document.getElementById(`candidate-${latestId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedCandidateIds]);

  const handleClearAll = () => {
    onClearAll();
    setShowConfirm(false);
    showToast('All candidates have been removed.', 'info');
  };

  const selectedCount = selectedCandidateIds.length;
  const allSelected = candidates.length > 0 && selectedCount === candidates.length;
  const hasJobProfile = activeJobProfileId.trim() !== '';
  const selectedReason = !hasJobProfile
    ? 'Create and save a job profile before screening.'
    : selectedCount === 0
      ? 'Select one or more candidates to begin screening.'
      : 'Ready to screen the selected candidates.';

  if (candidates.length === 0) {
    return (
      <div className="card p-6" id="candidate-management">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100">
            <Users className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <h3 className="section-title">Candidate Management</h3>
            <p className="section-subtitle">View, edit, and manage all candidates in your session.</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-700">
            No candidates added yet.
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Upload your first resume to begin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6" id="candidate-management">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100">
            <Users className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <h3 className="section-title">Candidate Management</h3>
            <p className="section-subtitle">{candidates.length} candidate{candidates.length > 1 ? 's' : ''} in this session.</p>
          </div>
        </div>
        <button onClick={() => setShowConfirm(true)} className="btn-danger">
          <Trash2 className="w-4 h-4" />
          Clear All Candidates
        </button>
      </div>

      <div className="sticky top-16 z-10 -mx-6 mb-5 border-y border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedCount} of {candidates.length} candidates selected
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Select one or more candidates to run screening.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={onSelectAll} className="btn-secondary text-sm">
                  Select All
                </button>
                <button onClick={onClearSelection} className="btn-secondary text-sm">
                  Clear Selection
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div>
                <label className="label-text flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Choose job profile
                </label>
                <div className="mt-2">
                  <select
                    value={activeJobProfileId}
                    onChange={(event) => onSelectJobProfile(event.target.value)}
                    className="select-field"
                  >
                    <option value="">Select a saved profile...</option>
                    {jobProfiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.jobTitle}{profile.isActive ? ' (Active)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={onScreenSelected}
                  disabled={!hasJobProfile || selectedCount === 0}
                  className="btn-primary whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <ScanSearch className="w-4 h-4" />
                  Screen Selected Candidates
                </button>
                <button
                  onClick={onScreenAll}
                  disabled={!hasJobProfile || candidates.length === 0}
                  className="btn-secondary whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Screen All Candidates
                </button>
                <button onClick={onManageJobProfiles} className="btn-ghost whitespace-nowrap justify-start text-brand-700">
                  Manage Job Profiles
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {selectedCount > 0
                ? `${selectedCount} candidate${selectedCount > 1 ? 's' : ''} selected. ${allSelected ? 'All candidates are selected.' : ''}`
                : 'Select one or more candidates to begin screening.'}
            </p>
            <p className="mt-1 text-xs text-brand-700">{selectedReason}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {candidates.map((candidate) => {
          const selected = selectedCandidateIds.includes(candidate.id);
          const skillPreview = (candidate.skillDetails ?? []).slice(0, 10);
          const education = candidate.educationEntries?.[0];
          const educationLabel = education
            ? [education.degree, education.field].filter(Boolean).join('. ')
            : candidate.education || 'Not specified';
          const highlighted = highlightedCandidateIds.includes(candidate.id);

          return (
            <article
              key={candidate.id}
              id={`candidate-${candidate.id}`}
              className={`rounded-2xl border bg-white p-4 transition-all ${selected ? 'border-brand-300 shadow-card-hover' : 'border-slate-200 hover:shadow-card-hover'} ${highlighted ? 'ring-2 ring-brand-200' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => onToggleSelect(candidate.id)}
                    className={`mt-1 flex h-5 w-5 items-center justify-center rounded border ${selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white text-transparent'}`}
                    aria-label={selected ? 'Deselect candidate' : 'Select candidate for screening'}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="flex items-center justify-center w-11 h-11 rounded-full bg-brand-100 text-brand-700 text-sm font-bold shrink-0">
                    {candidate.name
                      .split(' ')
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase() || '?'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate">{candidate.name}</h4>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500">
                          {candidate.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5" />
                              <span className="truncate">{candidate.email}</span>
                            </span>
                          )}
                          {candidate.phone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{candidate.phone}</span>
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{candidate.location || 'Not specified'}</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onView(candidate)}
                          className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(candidate)}
                          className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Edit candidate"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            onDelete(candidate.id);
                            showToast('Candidate removed.', 'info');
                          }}
                          className="p-2 text-slate-500 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                          title="Delete candidate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <SourceBadge source={candidate.source} />
                      <StatusBadge candidate={candidate} />
                      <ExperienceBadge candidate={candidate} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Experience</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {candidate.yearsExperience} years of full-time experience
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{candidate.experienceExplanation || 'Not specified'}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Education</p>
                  <p className="mt-1 font-medium text-slate-800 line-clamp-2">
                    {educationLabel}
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Top Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {skillPreview.length > 0 ? (
                    skillPreview.map((skill, index) => (
                      <span key={`${skill.normalizedName}-${index}`} className="badge bg-slate-100 text-slate-700">
                        {skill.displayName}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">Not specified</span>
                  )}
                  {candidate.skillDetails && candidate.skillDetails.length > 10 && (
                    <span className="badge bg-slate-100 text-slate-500">+{candidate.skillDetails.length - 10}</span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span>ID: {candidate.id.slice(0, 10)}…</span>
                  {candidate.latestScreenedAt && <span>Screened: {new Date(candidate.latestScreenedAt).toLocaleDateString()}</span>}
                </div>
                <button
                  type="button"
                  onClick={() => onToggleSelect(candidate.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-brand-200 px-3 py-1 text-brand-700 hover:bg-brand-50"
                >
                  <ScanSearch className="h-3.5 w-3.5" />
                  {selected ? 'Selected for screening' : 'Select for screening'}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => onView(candidate)} className="btn-secondary text-xs px-3 py-2">View details</button>
                <button onClick={() => onEdit(candidate)} className="btn-secondary text-xs px-3 py-2">Edit candidate</button>
                <button
                  onClick={() => {
                    onDelete(candidate.id);
                    showToast('Candidate removed.', 'info');
                  }}
                  className="btn-secondary text-xs px-3 py-2 text-danger-700 border-danger-200 hover:bg-danger-50"
                >
                  Delete candidate
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {showConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="card p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-danger-50">
                <XCircle className="w-5 h-5 text-danger-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Clear All Candidates?</h3>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              This will remove all {candidates.length} candidate{candidates.length > 1 ? 's' : ''} from the current session. This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button onClick={handleClearAll} className="btn-danger flex-1">
                Yes, Clear All
              </button>
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
