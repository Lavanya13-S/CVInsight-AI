import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import type { Candidate } from '@/types';
import { useToast } from '@/context/ToastContext';
import { generateId } from '@/services/id';
import { getSkillDisplayName, normalizeSkillName } from '@/services/skillCatalog';
import SkillTagInput from './SkillTagInput';

interface Props {
  onAdd: (candidate: Candidate) => boolean;
}

export default function ManualCandidateForm({ onAdd }: Props) {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [resumeText, setResumeText] = useState('');

  const normalizedSkills = skills.map((skill) => getSkillDisplayName(normalizeSkillName(skill)));

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setYearsExperience('');
    setEducation('');
    setSkills([]);
    setProjects([]);
    setCertifications([]);
    setResumeText('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Candidate name is required.', 'error');
      return;
    }
    if (!email.trim()) {
      showToast('Email address is required.', 'error');
      return;
    }

    const candidate: Candidate = {
      id: generateId(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: '',
      linkedinUrl: '',
      githubUrl: '',
      professionalSummary: resumeText.trim() || 'Not specified',
      resumeText: resumeText.trim(),
      yearsExperience: parseFloat(yearsExperience) || 0,
      experienceCategory: (parseFloat(yearsExperience) || 0) > 0 ? 'Entry-Level Professional' : 'Fresher',
      internshipMonths: 0,
      fullTimeExperienceMonths: Math.round((parseFloat(yearsExperience) || 0) * 12),
      experienceOverridden: yearsExperience.trim() !== '',
      experienceSource: yearsExperience.trim() !== '' ? 'manual' : 'auto',
      experienceExplanation: yearsExperience.trim() !== '' ? 'Experience entered manually by the user.' : 'No professional experience entered; treated as fresher.',
      education: education.trim(),
      educationEntries: [],
      skills: normalizedSkills,
      skillDetails: normalizedSkills.map((skill) => ({
        displayName: skill,
        normalizedName: normalizeSkillName(skill),
        category: 'Manual Entry',
      })),
      projects,
      certifications,
      achievements: [],
      workExperience: [],
      internshipExperience: [],
      source: 'manual',
      fileName: '',
      status: 'Ready for Screening',
      screeningResult: null,
      screeningHistory: [],
      latestScreenedAt: '',
      latestScreenedJobProfileId: '',
      latestScreenedJobProfileTitle: '',
      resumeProfile: {
        fullName: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        location: '',
        linkedinUrl: '',
        githubUrl: '',
        professionalSummary: resumeText.trim() || 'Not specified',
        education: [],
        skills: normalizedSkills.map((skill) => ({
          displayName: skill,
          normalizedName: normalizeSkillName(skill),
          category: 'Manual Entry',
        })),
        workExperience: [],
        internshipExperience: [],
        projects,
        certifications,
        achievements: [],
        rawText: resumeText.trim(),
        cleanedText: resumeText.trim(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const accepted = onAdd(candidate);
    if (accepted) {
      showToast(`Candidate "${name}" added successfully.`, 'success');
    }
    resetForm();
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent-50">
          <UserPlus className="w-5 h-5 text-accent-600" />
        </div>
        <div>
          <h3 className="section-title">Add Candidate Manually</h3>
          <p className="section-subtitle">
            Enter candidate details by hand. All fields start empty.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="label-text">Candidate Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Smith"
              className="input-field"
            />
          </div>

          {/* Email */}
          <div>
            <label className="label-text">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. jane@example.com"
              className="input-field"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="label-text">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 555-0100"
              className="input-field"
            />
          </div>

          {/* Years of Experience */}
          <div>
            <label className="label-text">Years of Experience</label>
            <input
              type="number"
              min={0}
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              placeholder="e.g. 5"
              className="input-field"
            />
          </div>

          {/* Education */}
          <div className="md:col-span-2">
            <label className="label-text">Education</label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. M.S. in Computer Science"
              className="input-field"
            />
          </div>

          {/* Skills */}
          <div className="md:col-span-2">
            <SkillTagInput
              label="Skills"
              tags={skills}
              onChange={setSkills}
            />
          </div>

          {/* Projects */}
          <div className="md:col-span-2">
            <SkillTagInput
              label="Projects"
              placeholder="Type a project name and press Enter"
              tags={projects}
              onChange={setProjects}
            />
          </div>

          {/* Certifications */}
          <div className="md:col-span-2">
            <SkillTagInput
              label="Certifications"
              placeholder="Type a certification and press Enter"
              tags={certifications}
              onChange={setCertifications}
            />
          </div>

          {/* Resume Text / Profile Summary */}
          <div className="md:col-span-2">
            <label className="label-text">
              Resume Text or Profile Summary
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste resume text or write a brief profile summary..."
              rows={3}
              className="input-field resize-none"
            />
          </div>
        </div>

        <button type="submit" className="btn-primary">
          <UserPlus className="w-4 h-4" />
          Add Candidate
        </button>
      </form>
    </div>
  );
}
