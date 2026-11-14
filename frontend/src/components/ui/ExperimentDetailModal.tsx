import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ExternalLink,
  GitCompare,
  Eye,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  Image as ImageIcon,
  Flame,
  Layers,
  Thermometer,
  Wind,
} from 'lucide-react';
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

interface ExperimentDetailModalProps {
  experiment: Experiment | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectForCompare?: (id: string) => void;
}

export const ExperimentDetailModal: React.FC<ExperimentDetailModalProps> = ({
  experiment,
  isOpen,
  onClose,
  onSelectForCompare,
}) => {
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  const [imgError, setImgError] = useState(false);

  // Focus management and keyboard accessibility
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;
      // Prevent background body scrolling while modal is open
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Focus the modal container for keyboard trap
      modalRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
        previouslyFocusedElementRef.current?.focus?.();
      };
    }
  }, [isOpen, onClose]);

  // Reset image error state whenever viewed experiment changes
  useEffect(() => {
    setImgError(false);
  }, [experiment?.id]);

  if (!isOpen || !experiment) return null;

  const isFlex = isFlexExperiment(experiment);
  const isBass = isBassExperiment(experiment);

  const media = getMediaForExperiment(
    experiment.investigationId as 'PSI-69' | 'PSI-25',
    experiment.id
  );

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

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-experiment-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl max-h-[90vh] bg-[#070D18] border border-[#213550] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden outline-none animate-in zoom-in-95 duration-200"
      >
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-[#213550]/80 bg-[#091222] flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <StatusBadge tone={isFlex ? 'orange' : 'cyan'}>
                {experiment.investigation} ({experiment.investigationId})
              </StatusBadge>
              <span className="text-xs font-mono text-cyan-300/80 bg-[#0E1A2E] px-2 py-0.5 rounded border border-[#1A3050]">
                Record: {experiment.id}
              </span>
              {experiment.apparatus && (
                <span className="hidden sm:inline-block text-[11px] font-mono text-gray-400 bg-black/40 px-2 py-0.5 rounded border border-gray-800">
                  {experiment.apparatus}
                </span>
              )}
            </div>
            <h2
              id="modal-experiment-title"
              className="text-lg sm:text-xl font-bold text-white font-mono tracking-tight flex items-center gap-2"
            >
              <Flame
                size={18}
                className={isFlex ? 'text-ignis-orange' : 'text-ignis-cyan'}
              />
              <span>
                Test {experiment.testIdentifier} —{' '}
                {isFlex ? experiment.fuel : experiment.material}
              </span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
              {isFlex
                ? 'NASA CIR/MDCA Microgravity Droplet Combustion Trial'
                : 'NASA MSG Forced Convection Solid Flame Spread & Suppression Study'}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-xl text-gray-400 hover:text-white bg-[#0E1A2E] hover:bg-[#152744] border border-[#213550] transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs font-mono">
          {/* NASA Scientific Media Section (When Available) */}
          {media && !imgError && (
            <div className="bg-[#0B1526] rounded-xl p-4 border border-[#213550] overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon size={15} className="text-cyan-400" />
                  <h4 className="text-xs uppercase font-mono tracking-wider text-white">
                    NASA Scientific Imagery & Provenance
                  </h4>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-gray-300 bg-black/60 px-2 py-0.5 rounded border border-gray-700/60">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${verificationDotColor(
                      media.verificationLevel
                    )}`}
                  />
                  {verificationLabel(media.verificationLevel)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="relative rounded-lg overflow-hidden border border-[#213047] bg-black/60 aspect-video flex items-center justify-center">
                  <img
                    src={media.imageUrl}
                    alt={media.title}
                    loading="lazy"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2 text-xs">
                  <h5 className="font-semibold text-gray-200 font-mono text-[13px]">
                    {media.title}
                  </h5>
                  <p className="text-gray-400 italic text-[11px] leading-relaxed">
                    "{media.caption}"
                  </p>
                  {media.sessionNote && (
                    <div className="p-2.5 rounded bg-amber-950/30 border border-amber-800/40 text-amber-200/90 text-[11px] font-sans">
                      <span className="font-semibold text-amber-300 font-mono block mb-0.5">
                        Flight Session Verification:
                      </span>
                      {media.sessionNote}
                    </div>
                  )}
                  <div className="pt-2 border-t border-[#213047]/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-gray-400">
                    <span className="truncate max-w-[240px]">{media.attribution}</span>
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
            </div>
          )}

          {/* Mission & Apparatus Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0B1526] rounded-xl p-4 border border-[#213047]">
            <div>
              <span className="text-[10px] text-gray-400 uppercase block mb-0.5">
                Principal Investigator
              </span>
              <span className="text-white font-semibold block truncate">
                {experiment.pi || 'NASA Science Team'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase block mb-0.5">
                Flight Apparatus
              </span>
              <span className="text-cyan-300 font-semibold block truncate">
                {experiment.apparatus || (isFlex ? 'CIR / MDCA' : 'MSG Duct')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase block mb-0.5">
                Experiment Date / GMT
              </span>
              <span className="text-gray-300 block">
                {experiment.date || 'Historical Archive'}
              </span>
            </div>
          </div>

          {/* Chamber Environment & Physical Measurements */}
          <div className="bg-[#0F1A2C] rounded-xl p-5 border border-[#213047]">
            <div className="flex items-center gap-2 mb-4">
              <Thermometer size={16} className="text-ignis-orange" />
              <h4 className="text-xs uppercase font-mono tracking-wider text-ignis-orange">
                Chamber Environment & Validated Sensor Measurements
              </h4>
            </div>

            {isFlex && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MetricValue
                  label="Fuel Compound"
                  value={experiment.fuel}
                  highlight
                />
                <MetricValue
                  label="Initial Oxygen (Mole Frac)"
                  value={formatOxygen(experiment.oxygenMoleFraction, false)}
                  note={`Source: ${
                    experiment.oxygenMoleFraction !== null
                      ? experiment.oxygenMoleFraction.toFixed(3)
                      : 'null'
                  }`}
                />
                <MetricValue
                  label="Chamber Pressure"
                  value={formatPressure(experiment.ambientPressureMmHg)}
                />
                <MetricValue
                  label="Initial Droplet Diam"
                  value={formatDiameter(experiment.initialDropletDiameterMm)}
                />
                <MetricValue
                  label="Total Burn Time"
                  value={formatBurnTime(experiment.burnTimeSeconds)}
                />
                <MetricValue
                  label="Termination Outcome"
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="col-span-1 sm:col-span-3">
                  <MetricValue
                    label="Solid Fuel Specimen"
                    value={experiment.material}
                    highlight
                  />
                </div>
                <MetricValue
                  label="Initial Oxygen %"
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
              <ShieldAlert
                size={15}
                className={activeFlags.length > 0 ? 'text-amber-400' : 'text-emerald-400'}
              />
              <h4 className="text-xs uppercase font-mono tracking-wider text-white">
                NASA Data Quality & Anomaly Flags
              </h4>
            </div>

            {activeFlags.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {activeFlags.map(([flagName]) => (
                  <div
                    key={flagName}
                    className="p-2 rounded bg-amber-950/40 border border-amber-800/40 text-amber-300 text-[11px] flex items-center gap-2"
                  >
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
              <span className="font-semibold block mb-0.5 font-mono">
                NASA PSI Provenance Notice
              </span>
              This record is ingested directly from verified NASA Physical Sciences
              Informatics archives ({experiment.investigationId}). Missing values are
              preserved as null.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#213550]/80 bg-[#091222] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <a
            href={experiment.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-mono text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30 rounded-lg border border-cyan-800/40 transition-colors"
          >
            <span>Open NASA PSI Repository</span>
            <ExternalLink size={13} />
          </a>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              onClick={handleGoToCompare}
              className="flex-1 sm:flex-none btn-primary text-xs py-2 px-4 flex items-center justify-center gap-1.5"
            >
              <GitCompare size={14} />
              <span>Compare Test</span>
            </button>
            <button
              onClick={handleGoToVisual}
              className="flex-1 sm:flex-none btn-secondary text-xs py-2 px-4 flex items-center justify-center gap-1.5"
            >
              <Eye size={14} />
              <span>Simulate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
