import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { Candidate } from '@/types';
import { useToast } from '@/context/ToastContext';
import SkillTagInput from './SkillTagInput';

interface Props {
  candidate: Candidate | null;
  onClose: () => void;
  onSave: (candidate: Candidate) => void;
}

export default function EditCandidateModal({
  candidate,
  onClose,
  onSave,
}: Props) {
  const { showToast } = useToast();
  const [form, setForm] = useState<Candidate | null>(candidate);

  useEffect(() => {
    setForm(candidate);
  }, [candidate]);

  if (!candidate || !form) return null;

  const handleSave = () => {
    if (!form.name.trim()) {
      showToast('Candidate name is required.', 'error');
      return;
    }
    if (!form.email.trim()) {
      showToast('Email address is required.', 'error');
      return;
    }
    onSave(form);
    showToast(`Candidate "${form.name}" updated.`, 'success');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="card p-6 max-w-2xl w-full my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-slate-900">Edit Candidate</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text">Years of Experience</label>
            <input
              type="number"
              min={0}
              value={form.yearsExperience || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  yearsExperience: parseInt(e.target.value) || 0,
                })
              }
              className="input-field"
            />
          </div>
          <div className="md:col-span-2">
            <label className="label-text">Education</label>
            <input
              type="text"
              value={form.education}
              onChange={(e) =>
                setForm({ ...form, education: e.target.value })
              }
              className="input-field"
            />
          </div>
          <div className="md:col-span-2">
            <SkillTagInput
              label="Skills"
              tags={form.skills}
              onChange={(skills) => setForm({ ...form, skills })}
            />
          </div>
          <div className="md:col-span-2">
            <SkillTagInput
              label="Projects"
              tags={form.projects}
              onChange={(projects) => setForm({ ...form, projects })}
            />
          </div>
          <div className="md:col-span-2">
            <SkillTagInput
              label="Certifications"
              tags={form.certifications}
              onChange={(certifications) =>
                setForm({ ...form, certifications })
              }
            />
          </div>
          <div className="md:col-span-2">
            <label className="label-text">
              Resume Text / Profile Summary
            </label>
            <textarea
              value={form.resumeText}
              onChange={(e) =>
                setForm({ ...form, resumeText: e.target.value })
              }
              rows={3}
              className="input-field resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button onClick={handleSave} className="btn-primary">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
