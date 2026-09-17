import { useEffect, useState } from 'react';
import { Briefcase, Save, Trash2, FolderOpen } from 'lucide-react';
import type { JobConfig, JobProfile } from '@/types';
import { ROLE_CATEGORIES, EMPTY_JOB_CONFIG } from '@/types';
import { useToast } from '@/context/ToastContext';
import SkillTagInput from './SkillTagInput';

interface Props {
  jobConfig: JobConfig | null;
  onSave: (config: JobConfig) => void;
  savedProfiles?: JobProfile[];
  onLoadProfile?: (id: string) => void;
}

export default function JobConfiguration({ jobConfig, onSave, savedProfiles = [], onLoadProfile }: Props) {
  const { showToast } = useToast();
  const [config, setConfig] = useState<JobConfig>(jobConfig ?? { ...EMPTY_JOB_CONFIG });

  useEffect(() => {
    setConfig(jobConfig ?? { ...EMPTY_JOB_CONFIG });
  }, [jobConfig]);

  const handleSave = () => {
    if (!config.jobTitle.trim()) {
      showToast('Please enter a job title before saving.', 'error');
      return;
    }
    if (!config.jobDescription.trim()) {
      showToast('Please enter a job description before saving.', 'error');
      return;
    }
    if (config.requiredSkills.length === 0) {
      showToast('Please add at least one required skill.', 'error');
      return;
    }
    onSave(config);
    showToast('Job profile saved successfully.', 'success');
  };

  const handleClear = () => {
    setConfig({ ...EMPTY_JOB_CONFIG });
    showToast('Job configuration cleared.', 'info');
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-50">
          <Briefcase className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h3 className="section-title">Job Configuration</h3>
          <p className="section-subtitle">
            Define and save the role requirements before screening candidates.
          </p>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-brand-100 bg-brand-50/50 p-4 text-sm text-brand-800">
        Save a job profile here first, then use Candidate Management to screen selected candidates.
      </div>

      {savedProfiles.length > 0 && onLoadProfile && (
        <div className="mb-5 rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
          <label className="label-text flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Load Saved Job Profile
          </label>
          <div className="mt-2">
            <select
              className="select-field"
              value=""
              onChange={(event) => event.target.value && onLoadProfile(event.target.value)}
            >
              <option value="">Select a saved profile...</option>
              {savedProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.jobTitle}{profile.isActive ? ' (Active)' : ''}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Saved profiles remain available after refreshing this browser.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label-text">Job Title *</label>
          <input
            type="text"
            value={config.jobTitle}
            onChange={(event) => setConfig({ ...config, jobTitle: event.target.value })}
            placeholder="e.g. Senior Backend Developer"
            className="input-field"
          />
        </div>

        <div>
          <label className="label-text">Role Category *</label>
          <select
            value={config.roleCategory}
            onChange={(event) => setConfig({ ...config, roleCategory: event.target.value })}
            className="select-field"
          >
            <option value="">Select a category</option>
            {ROLE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="label-text">Job Description *</label>
          <textarea
            value={config.jobDescription}
            onChange={(event) => setConfig({ ...config, jobDescription: event.target.value })}
            placeholder="Describe the role, responsibilities, and expectations..."
            rows={3}
            className="input-field resize-none"
          />
        </div>

        <div className="md:col-span-2">
          <SkillTagInput
            label="Required Skills *"
            placeholder="Type a required skill and press Enter"
            tags={config.requiredSkills}
            onChange={(tags) => setConfig({ ...config, requiredSkills: tags })}
          />
        </div>

        <div className="md:col-span-2">
          <SkillTagInput
            label="Preferred Skills"
            placeholder="Type a preferred skill and press Enter"
            tags={config.preferredSkills}
            onChange={(tags) => setConfig({ ...config, preferredSkills: tags })}
          />
        </div>

        <div>
          <label className="label-text">Minimum Years of Experience</label>
          <input
            type="number"
            min={0}
            value={config.minExperience || ''}
            onChange={(event) => setConfig({ ...config, minExperience: parseInt(event.target.value) || 0 })}
            placeholder="0"
            className="input-field"
          />
        </div>

        <div>
          <label className="label-text">Maximum Years of Experience</label>
          <input
            type="number"
            min={0}
            value={config.maxExperience || ''}
            onChange={(event) => setConfig({ ...config, maxExperience: parseInt(event.target.value) || 0 })}
            placeholder="0 = no limit"
            className="input-field"
          />
        </div>

        <div className="md:col-span-2">
          <label className="label-text">Education Requirements</label>
          <input
            type="text"
            value={config.educationRequirements}
            onChange={(event) => setConfig({ ...config, educationRequirements: event.target.value })}
            placeholder="e.g. Bachelor's degree in Computer Science or equivalent"
            className="input-field"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button onClick={handleSave} className="btn-primary">
          <Save className="w-4 h-4" />
          Save Job Configuration
        </button>
        <button onClick={handleClear} className="btn-secondary">
          <Trash2 className="w-4 h-4" />
          Clear Configuration
        </button>
      </div>
    </div>
  );
}
