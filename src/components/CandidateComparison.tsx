import { useState, useMemo } from 'react';
import { GitCompare, Lock, Info } from 'lucide-react';
import type { Candidate } from '@/types';

interface Props {
  candidates: Candidate[];
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 75
      ? 'bg-accent-500'
      : value >= 50
        ? 'bg-brand-500'
        : value >= 25
          ? 'bg-warning-500'
          : 'bg-danger-500';
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-slate-700">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function CandidateCard({
  candidate,
  label,
}: {
  candidate: Candidate;
  label: string;
}) {
  const r = candidate.screeningResult;
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="badge bg-brand-50 text-brand-700 font-bold">
          {label}
        </span>
        {r && (
          <span
            className={`badge ${
              r.recommendation === 'Strong Match'
                ? 'bg-accent-50 text-accent-700'
                : r.recommendation === 'Moderate Match'
                  ? 'bg-brand-50 text-brand-700'
                  : r.recommendation === 'Weak Match'
                    ? 'bg-warning-50 text-warning-700'
                    : 'bg-danger-50 text-danger-700'
            }`}
          >
            {r.recommendation}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-100 text-brand-700 text-base font-bold shrink-0">
          {candidate.name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || '?'}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-800 truncate">{candidate.name}</p>
          <p className="text-xs text-slate-500 truncate">
            {candidate.email}
          </p>
        </div>
      </div>

      {/* Scores */}
      {r ? (
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">
              Overall Score
            </span>
            <span className="text-2xl font-bold text-brand-600">
              {r.overallScore}
              <span className="text-sm text-slate-400">/100</span>
            </span>
          </div>
          <ScoreBar label="Required Skills Match" value={r.requiredSkillsMatch} />
          <ScoreBar label="Preferred Skills Match" value={r.preferredSkillsMatch} />
          <ScoreBar label="Experience Match" value={r.experienceMatch} />
        </div>
      ) : (
        <div className="text-center py-4 mb-4">
          <p className="text-sm text-slate-400">Not screened yet</p>
        </div>
      )}

      {/* Info Grid */}
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Experience
            </p>
            <p className="text-slate-700 font-medium">
              {candidate.yearsExperience} years
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Education
            </p>
            <p className="text-slate-700 font-medium">
              {candidate.education || '—'}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-400 font-semibold uppercase mb-1">
            Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.length > 0 ? (
              candidate.skills.map((s, i) => (
                <span key={i} className="badge bg-slate-100 text-slate-600">
                  {s}
                </span>
              ))
            ) : (
              <span className="text-slate-400">No skills listed</span>
            )}
          </div>
        </div>

        {r && (
          <>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase mb-1">
                Matched Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {r.matchedSkills.length > 0 ? (
                  r.matchedSkills.map((s, i) => (
                    <span
                      key={i}
                      className="badge bg-accent-50 text-accent-700"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400">None</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase mb-1">
                Missing Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {r.missingSkills.length > 0 ? (
                  r.missingSkills.map((s, i) => (
                    <span
                      key={i}
                      className="badge bg-danger-50 text-danger-700"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-accent-600">None — all matched</span>
                )}
              </div>
            </div>
          </>
        )}

        {candidate.projects.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase mb-1">
              Projects
            </p>
            <div className="flex flex-wrap gap-1.5">
              {candidate.projects.map((p, i) => (
                <span key={i} className="badge bg-slate-100 text-slate-600">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {candidate.certifications.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase mb-1">
              Certifications
            </p>
            <div className="flex flex-wrap gap-1.5">
              {candidate.certifications.map((c, i) => (
                <span key={i} className="badge bg-slate-100 text-slate-600">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {r && (
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase mb-1">
              Screening Explanation
            </p>
            <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 rounded-lg p-3">
              {r.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CandidateComparison({ candidates }: Props) {
  const [selectedA, setSelectedA] = useState<string>('');
  const [selectedB, setSelectedB] = useState<string>('');
  const [error, setError] = useState('');

  const candidateA = useMemo(
    () => candidates.find((c) => c.id === selectedA) ?? null,
    [candidates, selectedA]
  );
  const candidateB = useMemo(
    () => candidates.find((c) => c.id === selectedB) ?? null,
    [candidates, selectedB]
  );

  if (candidates.length < 2) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-50">
            <GitCompare className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h3 className="section-title">Candidate Comparison</h3>
            <p className="section-subtitle">
              Compare two candidates side by side.
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <Lock className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-700">
            Add at least two candidates to compare them.
          </p>
          <p className="text-sm text-slate-500 mt-1">
            You currently have {candidates.length} candidate
            {candidates.length !== 1 ? 's' : ''}. Add more to enable comparison.
          </p>
        </div>
      </div>
    );
  }

  const handleSelectA = (id: string) => {
    if (id === selectedB) {
      setError('Candidate A and Candidate B must be different.');
      return;
    }
    setError('');
    setSelectedA(id);
  };

  const handleSelectB = (id: string) => {
    if (id === selectedA) {
      setError('Candidate A and Candidate B must be different.');
      return;
    }
    setError('');
    setSelectedB(id);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-50">
          <GitCompare className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h3 className="section-title">Candidate Comparison</h3>
          <p className="section-subtitle">
            Select two different candidates to compare side by side.
          </p>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="label-text">Candidate A</label>
          <select
            value={selectedA}
            onChange={(e) => handleSelectA(e.target.value)}
            className="input-field"
          >
            <option value="">Select Candidate A</option>
            {candidates
              .filter((c) => c.id !== selectedB)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="label-text">Candidate B</label>
          <select
            value={selectedB}
            onChange={(e) => handleSelectB(e.target.value)}
            className="input-field"
          >
            <option value="">Select Candidate B</option>
            {candidates
              .filter((c) => c.id !== selectedA)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-danger-50 border border-danger-200 px-4 py-3 text-sm text-danger-700 mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Comparison Cards */}
      {candidateA && candidateB ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CandidateCard candidate={candidateA} label="Candidate A" />
          <CandidateCard candidate={candidateB} label="Candidate B" />
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500">
            Select both candidates to view the comparison.
          </p>
        </div>
      )}
    </div>
  );
}
