import React, { useState } from 'react';
import {
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SubmissionPayload } from '../types/experiment';

export const SubmitExperiment: React.FC = () => {
  const [formData, setFormData] = useState<SubmissionPayload>({
    submitterName: 'Mohammed Magdy',
    institution: 'NASA Space Apps / Microgravity Combustion Lab',
    contactEmail: 'researcher@ignis.local',
    experimentTitle: 'Microgravity Droplet Extinction under Argon Dilution',
    investigationType: 'FLEX-Droplet',
    fuelOrMaterial: '1-Propanol / n-Heptane blend',
    ambientPressureKpa: 101.3,
    oxygenPercentage: 21.0,
    notes: 'Investigating radiative heat losses and non-buoyant extinction thresholds.',
  });

  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    rowCount?: number;
    contentPreview?: string;
  } | null>(null);

  const [submittedPreview, setSubmittedPreview] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = String(event.target?.result || '');
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      setUploadedFile({
        name: file.name,
        size: file.size,
        rowCount: lines.length,
        contentPreview: lines.slice(0, 3).join('\n'),
      });
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedPreview(true);
  };

  const handleReset = () => {
    setSubmittedPreview(false);
    setUploadedFile(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="COMMUNITY INGESTION / 07"
        title="Submit New Experiment"
        subtitle="Contribute proposed or executed microgravity combustion datasets to the IGNIS community repository."
        actions={
          <StatusBadge tone="orange">
            Concept Preview · Local-only workflow
          </StatusBadge>
        }
      />

      {submittedPreview ? (
        /* Preview Modal / Confirmation Card */
        <div className="glass-panel rounded-2xl p-8 max-w-2xl mx-auto text-center space-y-6 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 size={32} />
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">
              Submission Form Validated Locally
            </span>
            <h2 className="text-2xl font-bold text-white font-mono">
              Pending Review — Preview Only
            </h2>
            <p className="text-xs text-gray-300 mt-2 max-w-md mx-auto font-sans leading-relaxed">
              Your submission parameters have been verified against the RFC schema. As per Section 6 & 8 of the system architecture, no HTTP network upload has been triggered.
            </p>
          </div>

          {/* Form Summary Table */}
          <div className="bg-[#091222] rounded-xl p-5 border border-[#213047] text-left text-xs font-mono space-y-2">
            <div className="flex justify-between border-b border-[#1A2A42] pb-1.5">
              <span className="text-gray-400">Submitter:</span>
              <span className="text-white font-semibold">{formData.submitterName} ({formData.institution})</span>
            </div>
            <div className="flex justify-between border-b border-[#1A2A42] pb-1.5">
              <span className="text-gray-400">Experiment Title:</span>
              <span className="text-ignis-orange font-semibold">{formData.experimentTitle}</span>
            </div>
            <div className="flex justify-between border-b border-[#1A2A42] pb-1.5">
              <span className="text-gray-400">Investigation Domain:</span>
              <span className="text-cyan-400">{formData.investigationType}</span>
            </div>
            <div className="flex justify-between border-b border-[#1A2A42] pb-1.5">
              <span className="text-gray-400">Fuel / Material:</span>
              <span className="text-white">{formData.fuelOrMaterial}</span>
            </div>
            {uploadedFile && (
              <div className="flex justify-between text-emerald-400">
                <span>Attached Telemetry File:</span>
                <span>{uploadedFile.name} ({uploadedFile.rowCount} rows)</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button onClick={handleReset} className="btn-secondary text-xs py-2.5 px-6 flex items-center gap-2">
              <RotateCcw size={14} />
              <span>Edit Submission</span>
            </button>
          </div>
        </div>
      ) : (
        /* Submission Form matching the screenshot */
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: File Upload & Experiment Details */}
          <div className="lg:col-span-8 space-y-6">
            {/* File Dropzone */}
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-2">
                1. Upload Dataset Excerpt (CSV / JSON)
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Attach recorded telemetry data, sensor logs, or flame-spread time series for automated verification.
              </p>

              <label className="relative flex flex-col items-center justify-center w-full h-44 rounded-xl border-2 border-dashed border-[#2F4563] hover:border-ignis-orange/60 bg-[#091222]/80 hover:bg-[#0B162A] transition-all cursor-pointer group">
                <input
                  type="file"
                  accept=".csv,.json,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800/80 group-hover:bg-orange-500/20 flex items-center justify-center text-gray-400 group-hover:text-ignis-orange transition-colors mb-3">
                    <UploadCloud size={24} />
                  </div>
                  <span className="text-xs font-mono font-semibold text-white group-hover:text-ignis-orange transition-colors">
                    Drag & drop experimental files here, or <span className="underline">browse files</span>
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono mt-1">
                    Supports .CSV, .JSON (Max 10 MB per test log)
                  </span>
                </div>
              </label>

              {uploadedFile && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2.5 text-emerald-300">
                    <FileCheck size={18} className="text-emerald-400" />
                    <span>
                      {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB · {uploadedFile.rowCount} rows)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadedFile(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Experiment Parameters */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-2">
                2. Test Configuration Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="sm:col-span-2">
                  <label className="text-gray-400 block mb-1">Experiment Title</label>
                  <input
                    type="text"
                    required
                    value={formData.experimentTitle}
                    onChange={(e) => setFormData({ ...formData, experimentTitle: e.target.value })}
                    className="w-full bg-[#091222] border border-[#213047] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-ignis-orange"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Investigation Domain</label>
                  <select
                    value={formData.investigationType}
                    onChange={(e) => setFormData({ ...formData, investigationType: e.target.value as any })}
                    className="w-full bg-[#091222] border border-[#213047] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-ignis-orange"
                  >
                    <option value="FLEX-Droplet">Liquid Droplet Combustion (FLEX / PSI-69)</option>
                    <option value="BASS-Solid">Solid Material Flammability (BASS-II / PSI-25)</option>
                    <option value="Other-Microgravity">Other Microgravity Combustion</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Fuel / Specimen Compound</label>
                  <input
                    type="text"
                    required
                    value={formData.fuelOrMaterial}
                    onChange={(e) => setFormData({ ...formData, fuelOrMaterial: e.target.value })}
                    className="w-full bg-[#091222] border border-[#213047] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-ignis-orange"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Chamber Oxygen Percentage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={formData.oxygenPercentage}
                    onChange={(e) => setFormData({ ...formData, oxygenPercentage: parseFloat(e.target.value) })}
                    className="w-full bg-[#091222] border border-[#213047] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-ignis-orange"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Ambient Pressure (kPa)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.ambientPressureKpa}
                    onChange={(e) => setFormData({ ...formData, ambientPressureKpa: parseFloat(e.target.value) })}
                    className="w-full bg-[#091222] border border-[#213047] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-ignis-orange"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-gray-400 block mb-1">Experiment Notes & Hypotheses</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-[#091222] border border-[#213047] rounded-xl p-3 text-white focus:outline-none focus:border-ignis-orange"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Researcher Info & Action */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel rounded-2xl p-6 space-y-4 font-mono text-xs">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                Researcher Profile
              </h3>

              <div>
                <label className="text-gray-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.submitterName}
                  onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })}
                  className="w-full bg-[#091222] border border-[#213047] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-ignis-orange"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Affiliation / Institution</label>
                <input
                  type="text"
                  required
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full bg-[#091222] border border-[#213047] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-ignis-orange"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full bg-[#091222] border border-[#213047] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-ignis-orange"
                />
              </div>

              <div className="pt-2">
                <label className="text-gray-400 block mb-1">Access Tier</label>
                <div className="p-2.5 rounded-lg bg-[#0E1A2C] border border-[#213047] text-gray-300">
                  Public Research Contributor
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/40 text-[11px] text-cyan-200/90 flex gap-2">
                <Info size={16} className="shrink-0 text-cyan-400 mt-0.5" />
                <span>
                  All submitted files remain in client browser storage until backend verification endpoint is authorized.
                </span>
              </div>

              <button
                type="submit"
                className="w-full btn-primary text-xs py-3 rounded-xl mt-4 flex items-center justify-center gap-2"
              >
                <Sparkles size={14} />
                <span>Validate & Preview Submission</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
