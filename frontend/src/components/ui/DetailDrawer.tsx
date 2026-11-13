import React from 'react';
import { X, ExternalLink, GitCompare, Eye, AlertCircle } from 'lucide-react';
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

  const handleGoToCompare = () => {
    if (onSelectForCompare) {
      onSelectForCompare(experiment.id);
    }
    navigate(`/comparison?idA=${experiment.id}`);
  };

  const handleGoToVisual = () => {
    navigate('/visualization');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div
        className="w-full max-w-lg bg-[#0A1220] border-l border-[#213047] h-full overflow-y-auto p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
      >
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
        <div className="flex-1 py-6 space-y-6">
          {/* Metadata Section */}
          <div className="bg-[#0F1A2C] rounded-xl p-4 border border-[#213047]">
            <h4 className="text-xs uppercase font-mono tracking-wider text-ignis-orange mb-3">
              Chamber Environment & Conditions
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
                  note={`Source fraction: ${experiment.oxygenMoleFraction ?? 'null'}`}
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
                    label="Burning Rate (Original Field)"
                    value={formatBurningRate(experiment.burningRateOriginal)}
                    note="Warning: Physical unit not verified in PSI source schema"
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
                  label="Air Display (Raw Readout)"
                  value={experiment.airDisplayRaw || '—'}
                  note="Chamber fan indicator, not linear velocity"
                />
                <MetricValue
                  label="Chamber Fan Display"
                  value={experiment.fanDisplayRaw || '—'}
                />
              </div>
            )}
          </div>

          {/* Scientific Disclaimer Note */}
          <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/40 text-xs text-cyan-200/90 flex gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-cyan-400 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">NASA PSI Provenance</span>
              This record is directly excerpted from verified NASA Physical Sciences Informatics (PSI) archives. Values are reproduced without synthetic alteration.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#213047] space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleGoToCompare} className="btn-primary text-xs py-2.5">
              <GitCompare size={14} />
              <span>Add to Compare</span>
            </button>
            <button onClick={handleGoToVisual} className="btn-secondary text-xs py-2.5">
              <Eye size={14} />
              <span>Visualize</span>
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
