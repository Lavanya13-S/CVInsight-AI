import { useMemo, useState } from 'react';
import {
  Trophy,
  Search,
  Eye,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import type { Candidate, JobProfile } from '@/types';

interface Props {
  screenedCandidates: Candidate[];
  candidates: Candidate[];
  activeJobProfile: JobProfile | null;
  screeningStatus?: 'idle' | 'in-progress' | 'success' | 'error';
  screeningMessage?: string;
  onView: (candidate: Candidate) => void;
}

type SortKey = 'overallScore' | 'requiredSkillsMatch' | 'experienceMatch';
type ScoreFilter = 'all' | 'high' | 'medium' | 'low';

export default function RankingTable({
  screenedCandidates,
  candidates,
  activeJobProfile,
  screeningStatus = 'idle',
  screeningMessage = '',
  onView,
}: Props) {
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('overallScore');

  const screened = useMemo(
    () => [...screenedCandidates].sort((a, b) => (b.screeningResult?.overallScore ?? 0) - (a.screeningResult?.overallScore ?? 0)),
    [screenedCandidates]
  );

  const filtered = useMemo(() => {
    let result = screened;

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(query) ||
          candidate.email.toLowerCase().includes(query)
      );
    }

    if (skillFilter.trim()) {
      const query = skillFilter.toLowerCase();
      result = result.filter((candidate) =>
        candidate.skills.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    if (scoreFilter !== 'all') {
      result = result.filter((candidate) => {
        const score = candidate.screeningResult?.overallScore ?? 0;
        if (scoreFilter === 'high') return score >= 75;
        if (scoreFilter === 'medium') return score >= 50 && score < 75;
        return score < 50;
      });
    }

    return [...result].sort((a, b) => {
      const aVal = a.screeningResult?.[sortKey] ?? 0;
      const bVal = b.screeningResult?.[sortKey] ?? 0;
      return bVal - aVal;
    });
  }, [screened, search, skillFilter, scoreFilter, sortKey]);

  if (candidates.length === 0) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-warning-50">
            <Trophy className="w-5 h-5 text-warning-600" />
          </div>
          <div>
            <h3 className="section-title">Candidate Ranking</h3>
            <p className="section-subtitle">No candidates added yet.</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <Trophy className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-700">
            No candidates added yet. Upload a resume or add a candidate manually to begin.
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Add candidates first, then run screening against a saved job profile.
          </p>
        </div>
      </div>
    );
  }

  if (!activeJobProfile) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-warning-50">
            <Trophy className="w-5 h-5 text-warning-600" />
          </div>
          <div>
            <h3 className="section-title">Candidate Ranking</h3>
            <p className="section-subtitle">
              Select a job profile to view rankings.
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <AlertCircle className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-700">
            Candidates are ready for screening. Select a job profile and run screening to generate rankings.
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Use the screening controls in Candidate Management to continue.
          </p>
          <a href="#candidate-management" className="btn-secondary mt-4 inline-flex">
            Go to Screening Controls
          </a>
        </div>
      </div>
    );
  }

  if (screened.length === 0) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-warning-50">
            <Trophy className="w-5 h-5 text-warning-600" />
          </div>
          <div>
            <h3 className="section-title">Candidate Ranking</h3>
            <p className="section-subtitle">
              Rankings appear after screening is executed.
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <Sparkles className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-700">
            Candidates are ready for screening. Select a job profile and run screening to generate rankings.
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Use the screening controls in Candidate Management to start the evaluation.
          </p>
          <a href="#candidate-management" className="btn-secondary mt-4 inline-flex">
            Go to Screening Controls
          </a>
        </div>
      </div>
    );
  }

  const recColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Strong Match':
        return 'bg-accent-50 text-accent-700';
      case 'Moderate Match':
        return 'bg-brand-50 text-brand-700';
      case 'Weak Match':
        return 'bg-warning-50 text-warning-700';
      default:
        return 'bg-danger-50 text-danger-700';
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 75) return 'text-accent-600';
    if (score >= 50) return 'text-brand-600';
    if (score >= 25) return 'text-warning-600';
    return 'text-danger-600';
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-warning-50">
          <Trophy className="w-5 h-5 text-warning-600" />
        </div>
        <div>
          <h3 className="section-title">Candidate Ranking</h3>
          <p className="section-subtitle">
            Rule-Based Screening results for {activeJobProfile.jobTitle}
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-brand-50 border border-brand-100 px-4 py-3 mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-800">Job Profile</p>
          <p className="text-sm text-brand-700">{activeJobProfile.jobTitle}</p>
        </div>
        <span className="text-xs text-brand-700">
          Screening completed at {new Date(screened[0]?.screeningResult?.screenedAt ?? Date.now()).toLocaleString()}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="input-field pl-9"
          />
        </div>
        <input
          type="text"
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          placeholder="Filter by skill"
          className="input-field"
        />
        <select
          value={scoreFilter}
          onChange={(e) => setScoreFilter(e.target.value as ScoreFilter)}
          className="input-field"
        >
          <option value="all">All Scores</option>
          <option value="high">High (75+)</option>
          <option value="medium">Medium (50–74)</option>
          <option value="low">Low (&lt;50)</option>
        </select>
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="input-field pl-9"
          >
            <option value="overallScore">Sort: Overall Score</option>
            <option value="requiredSkillsMatch">Sort: Required Skills</option>
            <option value="experienceMatch">Sort: Experience Match</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full min-w-[1024px]">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-3">Rank</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-3">Candidate</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-3">Score</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-3">Required</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-3">Preferred</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-3">Experience</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-3">Matched Required</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-3">Missing Required</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-3">Status</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((candidate, index) => {
              const result = candidate.screeningResult!;
              return (
                <tr key={candidate.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      {index < 3 && (
                        <Trophy
                          className={`w-4 h-4 ${index === 0 ? 'text-warning-500' : index === 1 ? 'text-slate-400' : 'text-amber-700'}`}
                        />
                      )}
                      <span className="font-bold text-slate-700">{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div>
                      <p className="font-medium text-slate-800">{candidate.name}</p>
                      <p className="text-xs text-slate-400">{candidate.email}</p>
                      <p className="text-xs text-slate-500 mt-1">{candidate.experienceCategory}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`text-lg font-bold ${scoreColor(result.overallScore)}`}>
                      {result.overallScore}
                    </span>
                    <span className="text-sm text-slate-400">/100</span>
                    <p className="text-[11px] text-slate-400 mt-1">Rule-Based Screening</p>
                  </td>
                  <td className="px-3 py-3 text-center text-sm font-medium text-slate-600">
                    {result.requiredSkillsMatch}%
                  </td>
                  <td className="px-3 py-3 text-center text-sm font-medium text-slate-600">
                    {result.preferredSkillsMatch}%
                  </td>
                  <td className="px-3 py-3 text-center text-sm font-medium text-slate-600">
                    {result.experienceMatch}%
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(result.matchedRequiredSkills ?? result.matchedSkills).slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="badge bg-accent-50 text-accent-700">
                          <CheckCircle2 className="w-3 h-3 mr-0.5" />
                          {skill}
                        </span>
                      ))}
                      {(result.matchedRequiredSkills ?? result.matchedSkills).length > 3 && (
                        <span className="badge bg-slate-100 text-slate-500">+{(result.matchedRequiredSkills ?? result.matchedSkills).length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(result.missingRequiredSkills ?? result.missingSkills).length === 0 ? (
                        <span className="text-xs text-accent-600 font-medium">None</span>
                      ) : (
                        (result.missingRequiredSkills ?? result.missingSkills).slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="badge bg-danger-50 text-danger-700">
                            <XCircle className="w-3 h-3 mr-0.5" />
                            {skill}
                          </span>
                        ))
                      )}
                      {(result.missingRequiredSkills ?? result.missingSkills).length > 3 && (
                        <span className="badge bg-slate-100 text-slate-500">+{(result.missingRequiredSkills ?? result.missingSkills).length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`badge ${recColor(result.recommendation)}`}>{result.recommendation}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <button
                      onClick={() => onView(candidate)}
                      className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="View profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500">No screened candidates match the current filters.</p>
        </div>
      )}

      {screeningStatus === 'success' && (
        <div className="mt-4 rounded-xl border border-accent-100 bg-accent-50 px-4 py-3 text-sm text-accent-800">
          Screening completed successfully. Ranked results are shown below.
        </div>
      )}

      {screeningStatus === 'error' && (
        <div className="mt-4 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-800">
          {screeningMessage || 'Screening failed. Please check the job configuration and try again.'}
        </div>
      )}
    </div>
  );
}
