import { useState, useRef, type DragEvent } from 'react';
import {
  UploadCloud,
  FileText,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import type { Candidate } from '@/types';
import { useToast } from '@/context/ToastContext';
import { generateId } from '@/services/id';
import {
  parseResumes,
  extractCandidateFromText,
} from '@/services/resumeParser';

interface Props {
  onAdd: (candidate: Candidate) => boolean;
  onCandidatesAdded?: (candidateIds: string[]) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED = ['.pdf', '.docx', '.txt'];

function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function buildResumeFingerprint(file: File, text: string): string {
  const parts = [
    normalizeText(file.name),
    normalizeText(text).slice(0, 5000),
  ];
  return parts.join('::');
}

export default function ResumeUploader({ onAdd, onCandidatesAdded }: Props) {
  const { showToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);
  const [processingTotal, setProcessingTotal] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '');
    if (!ACCEPTED.includes(ext)) {
      return `${file.name}: unsupported format. Use PDF, DOCX, or TXT.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: file exceeds 10 MB limit.`;
    }
    return null;
  };

  const handleFiles = (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    const valid: File[] = [];
    const errors: string[] = [];

    for (const f of arr) {
      const err = validateFile(f);
      if (err) errors.push(err);
      else valid.push(f);
    }

    if (errors.length > 0) {
      showToast(errors[0], 'error');
    }

    setFiles((prev) => {
      return [...prev, ...valid];
    });
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    if (files.length === 0) {
      showToast('Please select at least one resume to process.', 'error');
      return;
    }

    setProcessing(true);
    setProcessingIndex(0);
    setProcessingTotal(files.length);
    setResults([]);
    try {
      const parsed = await parseResumes(files);
      let added = 0;
      let failed = 0;
      const addedCandidateIds: string[] = [];

      for (let index = 0; index < parsed.length; index += 1) {
        setProcessingIndex(index + 1);
        const p = parsed[index];
        const sourceFile = files[index];
        if (!p.text.trim()) {
          failed++;
          setResults((prev) => [...prev, `${p.fileName}: failed — empty or unreadable resume.`]);
          continue;
        }
        const extracted = extractCandidateFromText(p.text, p.fileName, p.rawText ?? p.text);
        const fingerprint = buildResumeFingerprint(sourceFile ?? new File([], p.fileName), p.rawText ?? p.text);
        const candidate: Candidate = {
          id: generateId(),
          name: extracted.name || p.fileName.replace(/\.\w+$/, ''),
          email: extracted.email,
          phone: extracted.phone,
          location: extracted.location,
          linkedinUrl: extracted.linkedinUrl,
          githubUrl: extracted.githubUrl,
          professionalSummary: extracted.professionalSummary,
          resumeText: p.rawText ?? p.text,
          yearsExperience: extracted.yearsExperience,
          experienceCategory: extracted.experienceCategory,
          internshipMonths: extracted.internshipMonths,
          fullTimeExperienceMonths: extracted.fullTimeExperienceMonths,
          experienceOverridden: false,
          experienceSource: 'auto',
          experienceExplanation: extracted.experienceExplanation,
          education: extracted.educationDisplay,
          educationEntries: extracted.educationEntries,
          skills: extracted.skills,
          skillDetails: extracted.skillDetails,
          projects: [],
          certifications: [],
          achievements: extracted.achievements,
          workExperience: extracted.workExperience,
          internshipExperience: extracted.internshipExperience,
          source: 'uploaded',
          fileName: p.fileName,
          resumeFingerprint: fingerprint,
          status: 'Ready for Screening',
          screeningResult: null,
          screeningHistory: [],
          latestScreenedAt: '',
          latestScreenedJobProfileId: '',
          latestScreenedJobProfileTitle: '',
          resumeProfile: extracted.resumeProfile,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const accepted = onAdd(candidate);
        if (accepted) {
          added++;
          addedCandidateIds.push(candidate.id);
          setResults((prev) => [...prev, `${p.fileName}: added successfully.`]);
        } else {
          failed++;
          setResults((prev) => [...prev, `${p.fileName}: skipped — duplicate resume detected.`]);
        }
      }

      if (added > 0) {
        showToast(
          `${added} candidate${added > 1 ? 's' : ''} added successfully.`,
          'success'
        );
      }
      if (failed > 0) {
        showToast(
          `${failed} file${failed > 1 ? 's' : ''} could not be parsed.`,
          'error'
        );
      }
      if (addedCandidateIds.length > 0) {
        onCandidatesAdded?.(addedCandidateIds);
      }
      setFiles([]);
    } catch {
      showToast('Failed to process resumes. Please try again.', 'error');
    } finally {
      setProcessing(false);
      setProcessingIndex(null);
      setProcessingTotal(0);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-50">
          <UploadCloud className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h3 className="section-title">Resume Upload</h3>
          <p className="section-subtitle">
            Drag and drop resumes to extract candidate info automatically.
          </p>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 px-6 py-10 text-center ${
          dragActive
            ? 'border-brand-500 bg-brand-50'
            : 'border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-brand-50/50'
        }`}
      >
        <UploadCloud
          className={`w-10 h-10 mx-auto mb-3 transition-colors ${
            dragActive ? 'text-brand-500' : 'text-slate-400'
          }`}
        />
        <p className="text-sm font-semibold text-slate-700">
          Drag and drop resumes here
        </p>
        <p className="text-sm text-slate-500 mt-0.5">or click to browse</p>
        <p className="text-xs text-slate-400 mt-3">
          Supported formats: PDF, DOCX, TXT · Maximum file size: 10 MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {processing && processingIndex !== null && (
        <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/50 p-4">
          <div className="flex items-center justify-between gap-3 text-sm text-brand-800">
            <span className="font-semibold">Processing resumes...</span>
            <span>{processingIndex} of {processingTotal}</span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-brand-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-600 transition-all duration-300"
              style={{ width: `${processingTotal > 0 ? Math.round((processingIndex / processingTotal) * 100) : 0}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-brand-700">Each file is processed independently so one failure will not remove successful candidates.</p>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5"
            >
              <FileText className="w-4 h-4 text-brand-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-slate-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={() => removeFile(i)}
                className="text-slate-400 hover:text-danger-600 transition-colors"
                disabled={processing}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            onClick={processFiles}
            disabled={processing}
            className="btn-primary w-full mt-2"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing resumes...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Process {files.length} Resume{files.length > 1 ? 's' : ''}
              </>
            )}
          </button>

          {results.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 space-y-1">
              {results.map((result, index) => (
                <p key={`${result}-${index}`}>{result}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
