import {
  X,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  GraduationCap,
  Award,
  FolderGit2,
  FileText,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  BadgeCheck,
  ScanSearch,
  User,
  FileBadge,
} from 'lucide-react';
import type { Candidate } from '@/types';

interface Props {
  candidate: Candidate | null;
  onClose: () => void;
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof User; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-brand-600" />
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      </div>
      {children}
    </section>
  );
}

function EmptyValue({ value }: { value: string | undefined | null }) {
  return <span className="text-slate-400">{value && value.trim() ? value : 'Not specified'}</span>;
}

export default function CandidateDetailModal({ candidate, onClose }: Props) {
  if (!candidate) return null;

  const result = candidate.screeningResult;
  const profile = candidate.resumeProfile;
  const educationEntries = candidate.educationEntries ?? profile?.education ?? [];
  const skills = candidate.skillDetails ?? profile?.skills ?? [];
  const workExperience = candidate.workExperience ?? profile?.workExperience ?? [];
  const internshipExperience = candidate.internshipExperience ?? profile?.internshipExperience ?? [];
  const projects = candidate.projects?.length ? candidate.projects : profile?.projects ?? [];
  const certifications = candidate.certifications?.length ? candidate.certifications : profile?.certifications ?? [];
  const achievements = candidate.achievements?.length ? candidate.achievements : profile?.achievements ?? [];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="card max-h-[92vh] w-full max-w-5xl overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
              {(candidate.name || candidate.email || '?')
                .split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">{candidate.name}</h3>
              <p className="text-sm text-slate-500">{candidate.status ?? 'Ready for Screening'}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`badge ${candidate.source === 'uploaded' ? 'bg-brand-50 text-brand-700' : 'bg-accent-50 text-accent-700'}`}>
                  {candidate.source === 'uploaded' ? <Upload className="mr-1 h-3 w-3" /> : <FileText className="mr-1 h-3 w-3" />}
                  {candidate.source === 'uploaded' ? 'Uploaded' : 'Manual'}
                </span>
                <span className="badge bg-brand-50 text-brand-700">
                  <Clock className="mr-1 h-3 w-3" />
                  {candidate.experienceCategory || 'Experience not clearly specified'}
                </span>
                {result ? (
                  <span className="badge bg-accent-50 text-accent-700">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    {result.recommendation}
                  </span>
                ) : (
                  <span className="badge bg-slate-100 text-slate-500">
                    <ScanSearch className="mr-1 h-3 w-3" />
                    Not screened
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Section title="Personal Information" icon={User}>
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /><EmptyValue value={candidate.email} /></div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /><EmptyValue value={candidate.phone} /></div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /><EmptyValue value={candidate.location} /></div>
              <div className="flex items-center gap-2"><Linkedin className="h-4 w-4 text-slate-400" /><EmptyValue value={candidate.linkedinUrl} /></div>
              <div className="flex items-center gap-2"><Github className="h-4 w-4 text-slate-400" /><EmptyValue value={candidate.githubUrl} /></div>
            </div>
          </Section>

          <Section title="Professional Summary" icon={FileBadge}>
            <p className="text-sm leading-6 text-slate-700">
              <EmptyValue value={candidate.professionalSummary ?? profile?.professionalSummary} />
            </p>
          </Section>

          <Section title="Experience" icon={Clock}>
            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Full-time experience</p>
                <p className="mt-1 font-medium text-slate-800">{candidate.yearsExperience} years</p>
                <p className="text-xs text-slate-500 mt-1">{candidate.experienceExplanation || 'Not specified'}</p>
              </div>
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Internship experience</p>
                <p className="mt-1 font-medium text-slate-800">{candidate.internshipMonths ? `${candidate.internshipMonths} month(s)` : 'Not specified'}</p>
              </div>
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Experience category</p>
                <p className="mt-1 font-medium text-slate-800">{candidate.experienceCategory || 'Experience not clearly specified'}</p>
              </div>
            </div>
          </Section>

          <Section title="Education" icon={GraduationCap}>
            {educationEntries.length > 0 ? (
              <div className="space-y-3">
                {educationEntries.map((entry, index) => (
                  <div key={`${entry.degree}-${index}`} className="rounded-xl bg-white p-3">
                    <p className="font-semibold text-slate-900">{entry.degree || 'Not specified'}</p>
                    <p className="text-sm text-slate-600">{entry.field || 'Not specified'}</p>
                    <p className="text-xs text-slate-500 mt-1">{entry.institution || 'Not specified'}</p>
                    <p className="text-xs text-slate-500">{entry.duration || 'Not specified'}</p>
                    <p className="text-xs text-slate-500">CGPA: {entry.cgpa || 'Not specified'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyValue value={null} />
            )}
          </Section>

          <Section title="Skills" icon={BadgeCheck}>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span key={`${skill.normalizedName}-${index}`} className="badge bg-slate-100 text-slate-700">
                    {skill.displayName}
                  </span>
                ))}
              </div>
            ) : (
              <EmptyValue value={null} />
            )}
          </Section>

          <Section title="Projects" icon={FolderGit2}>
            {projects.length > 0 ? (
              <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
                {projects.map((project, index) => <li key={`${project}-${index}`}>{project}</li>)}
              </ul>
            ) : (
              <EmptyValue value={null} />
            )}
          </Section>

          <Section title="Certifications" icon={Award}>
            {certifications.length > 0 ? (
              <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
                {certifications.map((certification, index) => <li key={`${certification}-${index}`}>{certification}</li>)}
              </ul>
            ) : (
              <EmptyValue value={null} />
            )}
          </Section>

          <Section title="Achievements" icon={BadgeCheck}>
            {achievements.length > 0 ? (
              <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
                {achievements.map((achievement, index) => <li key={`${achievement}-${index}`}>{achievement}</li>)}
              </ul>
            ) : (
              <EmptyValue value={null} />
            )}
          </Section>

          <Section title="Resume File Information" icon={FileText}>
            <div className="space-y-2 text-sm text-slate-700">
              <p><span className="font-medium text-slate-900">File:</span> <EmptyValue value={candidate.fileName} /></p>
              <p><span className="font-medium text-slate-900">Source:</span> {candidate.source === 'uploaded' ? 'Uploaded resume' : 'Manual entry'}</p>
              <p><span className="font-medium text-slate-900">Created:</span> {candidate.createdAt ? new Date(candidate.createdAt).toLocaleString() : 'Not specified'}</p>
              <p><span className="font-medium text-slate-900">Updated:</span> {candidate.updatedAt ? new Date(candidate.updatedAt).toLocaleString() : 'Not specified'}</p>
            </div>
          </Section>

          <Section title="Screening History" icon={ScanSearch}>
            {candidate.screeningHistory && candidate.screeningHistory.length > 0 ? (
              <div className="space-y-3">
                {candidate.screeningHistory.slice().reverse().map((history, index) => (
                  <div key={`${history.screenedAt ?? index}-${index}`} className="rounded-xl bg-white p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-900">{history.jobProfileTitle || 'Not specified'}</span>
                      <span className="badge bg-accent-50 text-accent-700">{history.overallScore}/100</span>
                    </div>
                    <p className="mt-1 text-slate-600">{history.explanation}</p>
                    <p className="mt-1 text-xs text-slate-500">{history.screenedAt ? new Date(history.screenedAt).toLocaleString() : 'Not specified'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyValue value={null} />
            )}
          </Section>
        </div>

        {result && (
          <section className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <ScanSearch className="h-4 w-4 text-brand-600" />
              <h4 className="text-sm font-semibold text-slate-900">Screening Results</h4>
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-xl bg-white p-3 text-center">
                <p className="text-2xl font-bold text-brand-600">{result.overallScore}</p>
                <p className="text-xs text-slate-500">Overall score</p>
              </div>
              <div className="rounded-xl bg-white p-3 text-center">
                <p className="text-2xl font-bold text-slate-700">{result.requiredSkillsMatch}%</p>
                <p className="text-xs text-slate-500">Required skill score</p>
              </div>
              <div className="rounded-xl bg-white p-3 text-center">
                <p className="text-2xl font-bold text-slate-700">{result.preferredSkillsMatch}%</p>
                <p className="text-xs text-slate-500">Preferred skill score</p>
              </div>
              <div className="rounded-xl bg-white p-3 text-center">
                <p className="text-2xl font-bold text-slate-700">{result.experienceMatch}%</p>
                <p className="text-xs text-slate-500">Experience score</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm text-slate-700">
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Matched required skills</p>
                <p>{(result.matchedRequiredSkills ?? result.matchedSkills).join(', ') || 'Not specified'}</p>
              </div>
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Missing required skills</p>
                <p>{(result.missingRequiredSkills ?? result.missingSkills).join(', ') || 'Not specified'}</p>
              </div>
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Matched preferred skills</p>
                <p>{(result.matchedPreferredSkills ?? []).join(', ') || 'Not specified'}</p>
              </div>
              <div className="rounded-xl bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Missing preferred skills</p>
                <p>{(result.missingPreferredSkills ?? []).join(', ') || 'Not specified'}</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-white p-3 text-sm text-slate-700">
              <p><span className="font-medium text-slate-900">Experience category:</span> {result.experienceCategory || candidate.experienceCategory}</p>
              <p className="mt-1"><span className="font-medium text-slate-900">Experience explanation:</span> {result.experienceExplanation || candidate.experienceExplanation}</p>
              <p className="mt-1"><span className="font-medium text-slate-900">Job profile used:</span> {result.jobProfileTitle || candidate.latestScreenedJobProfileTitle || 'Not specified'}</p>
              <p className="mt-1"><span className="font-medium text-slate-900">Screened at:</span> {result.screenedAt ? new Date(result.screenedAt).toLocaleString() : 'Not specified'}</p>
              <p className="mt-1"><span className="font-medium text-slate-900">Model:</span> {result.scoringModel || 'Rule-Based Screening'}</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
