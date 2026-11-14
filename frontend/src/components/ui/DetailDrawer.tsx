import React, { useState } from 'react';
import { X, ExternalLink, GitCompare, Eye, AlertCircle, ShieldAlert, CheckCircle2, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Experiment, isFlexExperiment, isBassExperiment } from '../../types/experiment';
import { StatusBadge } from './StatusBadge';
import { MetricValue } from './MetricValue';
import {
  formatOxygen,
  formatPressure,
  formatDiameter,
  formatBurnTime,
  formatBurningRate,
} from '../../lib/formatters';
import {
  getMediaForExperiment,
  verificationLabel,
  verificationDotColor,
} from '../../services/nasaMediaService';

interface DetailDrawerProps {
  experiment: Experiment | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectForCompare?: (id: string) => void;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  experiment,
  isOpen,
  onClose,
  onSelectForCompare,
}) => {
  const navigate = useNavigate();

  if (!isOpen || !experiment) return null;

  const isFlex = isFlexExperiment(experiment);
  const isBass = isBassExperiment(experiment);

  const [imgError, setImgError] = useState(false);
  const media = getMediaForExperiment(experiment.investigationId as 'PSI-69' | 'PSI-25', experiment.id);

  const handleGoToCompare = () => {
    if (onSelectForCompare) {
      onSelectForCompare(experiment.id);
    }
    navigate(`/comparison?idA=${experiment.id}`);
  };

  const handleGoToVisual = () => {
    navigate('/predictive-lab');
  };

  const flags = experiment.dataQualityFlags || {};
  const activeFlags = Object.entries(flags).filter(([_, val]) => Boolean(val));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div
        className="w-full max-w-xl bg-[#0A1220] border-l border-[#213047] h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200"
      >
        <div>
          {/* Top Header */}
          <div className="flex items-start justify-between pb-4 border-b border-[#213047]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <StatusBadge tone={isFlex ? 'orange' : 'cyan'}>
                  {experiment.investigation} ({experiment.investigationId})
                </StatusBadge>
                <span className="text-xs font-mono text-gray-400">
                  Record ID: {experiment.id}
                </span>
              </div>
              <h2 className="text-xl font-bold text-ignis-text font-mono">
                Test {experiment.testIdentifier}
              </h2>
              <p className="text-xs text-ignis-muted mt-0.5">
                {isFlex ? `Liquid Fuel Droplet Combustion — ${experiment.fuel}` : `Solid Combustion Specimen — ${experiment.material}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Body */}
          <div className="py-6 space-y-5">
            {/* NASA Scientific Media & Provenance */}
            {media && !imgError && (
              <div className="bg-[#0B1526] rounded-xl p-4 border border-[#213047] overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Image size={15} className="text-cyan-400" />
                    <h4 className="text-xs uppercase font-mono tracking-wider text-white">
                      NASA Scientific Imagery & Provenance
                    </h4>
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-mono text-gray-300 bg-black/50 px-2 py-0.5 rounded border border-gray-700/50">
                    <span className={`w-1.5 h-1.5 rounded-full ${verificationDotColor(media.verificationLevel)}`} />
                    {verificationLabel(media.verificationLevel)}
                  </span>
                </div>

                <div className="relative rounded-lg overflow-hidden border border-[#213047]/80 bg-black/40 mb-3 aspect-video flex items-center justify-center">
                  <img
                    src={media.imageUrl}
                    alt={media.title}
                    loading="lazy"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-2 text-xs">
                  <h5 className="font-semibold text-gray-200 font-mono text-[13px]">{media.title}</h5>
                  <p className="text-gray-400 italic text-[11px] leading-relaxed">
                    "{media.caption}"
                  </p>

                  {media.sessionNote && (
                    <div className="p-2.5 rounded bg-amber-950/30 border border-amber-800/40 text-amber-200/90 text-[11px] font-sans">
                      <span className="font-semibold text-amber-300 font-mono block mb-0.5">Flight Session Verification:</span>
                      {media.sessionNote}
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#213047]/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-gray-400">
                    <span>{media.attribution}</span>
                    <a
                      href={media.sourcePage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <span>Open NASA Source</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Mission & Apparatus Metadata */}
            <div className="bg-[#0B1526] rounded-xl p-4 border border-[#213047] text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Principal Investigator:</span>
                <span className="text-white font-semibold">{experiment.pi || 'NASA Science Team'}</span>
              </div>
              {experiment.date && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Experiment Date:</span>
                  <span className="text-white">{experiment.date}</span>
                </div>
              )}
              {experiment.apparatus && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Flight Apparatus:</span>
                  <span className="text-cyan-300">{experiment.apparatus}</span>
                </div>
              )}
            </div>

            {/* Chamber Environment & Conditions */}
            <div className="bg-[#0F1A2C] rounded-xl p-4 border border-[#213047]">
              <h4 className="text-xs uppercase font-mono tracking-wider text-ignis-orange mb-3">
                Chamber Environment & Measurements
              </h4>

              {isFlex && (
                <div className="grid grid-cols-2 gap-4">
                  <MetricValue
                    label="Fuel Compound"
                    value={experiment.fuel}
                    highlight
                  />
                  <MetricValue
                    label="Initial Oxygen (Mole Fraction)"
                    value={formatOxygen(experiment.oxygenMoleFraction, false)}
                    note={`Source fraction: ${experiment.oxygenMoleFraction !== null ? experiment.oxygenMoleFraction.toFixed(3) : 'null'}`}
                  />
                  <MetricValue
                    label="Chamber Pressure"
                    value={formatPressure(experiment.ambientPressureMmHg)}
                  />
                  <MetricValue
                    label="Initial Droplet Diameter"
                    value={formatDiameter(experiment.initialDropletDiameterMm)}
                  />
                  <MetricValue
                    label="Total Burn Time"
                    value={formatBurnTime(experiment.burnTimeSeconds)}
                  />
                  <MetricValue
                    label="Test Termination Outcome"
                    value={experiment.testEnd || '—'}
                    highlight={experiment.testEnd === 'Extinction'}
                  />
                  <div className="col-span-2">
                    <MetricValue
                      label="Burning Rate Constant K"
                      value={formatBurningRate(experiment.burningRateOriginal)}
                      note="d²-law quasi-steady regression rate constant (mm²/s)"
                    />
                  </div>
                </div>
              )}

              {isBass && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <MetricValue
                      label="Solid Material Description"
                      value={experiment.material}
                      highlight
                    />
                  </div>
                  <MetricValue
                    label="Initial Oxygen Percentage"
                    value={formatOxygen(experiment.initialOxygenPercent, true)}
                  />
                  <MetricValue
                    label="Air Flow Readout"
                    value={experiment.airDisplayRaw || '—'}
                    note="Chamber fan indicator, not linear velocity"
                  />
                  <MetricValue
                    label="Chamber Fan Readout"
                    value={experiment.fanDisplayRaw || '—'}
                  />
                </div>
              )}
            </div>

            {/* Data Quality & Anomaly Flags */}
            <div className="bg-[#0B1526] rounded-xl p-4 border border-[#213047]">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert size={15} className={activeFlags.length > 0 ? 'text-amber-400' : 'text-emerald-400'} />
                <h4 className="text-xs uppercase font-mono tracking-wider text-white">
                  NASA Data Quality & Anomaly Flags
                </h4>
              </div>

              {activeFlags.length > 0 ? (
                <div className="space-y-1.5 font-mono text-xs">
                  {activeFlags.map(([flagName]) => (
                    <div key={flagName} className="p-2 rounded bg-amber-950/40 border border-amber-800/40 text-amber-300 text-[11px] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>{flagName.replace(/^flag_/, '').replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 py-1">
                  <CheckCircle2 size={14} />
                  <span>No data quality anomalies flagged for this trial.</span>
                </div>
              )}
            </div>

            {/* Scientific Provenance Note */}
            <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/40 text-xs text-cyan-200/90 flex gap-2.5 font-sans">
              <AlertCircle size={18} className="shrink-0 text-cyan-400 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5 font-mono">NASA PSI Provenance</span>
                This record is directly ingested from verified NASA Physical Sciences Informatics archives ({experiment.investigationId}). Missing values are preserved as null.
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#213047] space-y-2">
          <div className="grid grid-cols-2 gap-2 font-mono">
            <button onClick={handleGoToCompare} className="btn-primary text-xs py-2.5 flex items-center justify-center gap-1.5">
              <GitCompare size={14} />
              <span>Compare Test</span>
            </button>
            <button onClick={handleGoToVisual} className="btn-secondary text-xs py-2.5 flex items-center justify-center gap-1.5">
              <Eye size={14} />
              <span>Simulate</span>
            </button>
          </div>

          <a
            href={experiment.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded-lg border border-cyan-800/40 transition-colors"
          >
            <span>Open NASA PSI Repository Record</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
};
