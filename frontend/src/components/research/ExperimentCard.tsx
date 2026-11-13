import React from 'react';
import { Eye, Flame, ArrowUpRight } from 'lucide-react';
import { Experiment, isFlexExperiment, isBassExperiment } from '../../types/experiment';
import { StatusBadge } from '../ui/StatusBadge';
import { formatOxygen, formatPressure, formatDiameter, formatBurnTime } from '../../lib/formatters';

interface ExperimentCardProps {
  experiment: Experiment;
  onViewDetails: (exp: Experiment) => void;
  onCompare?: (exp: Experiment) => void;
}

export const ExperimentCard: React.FC<ExperimentCardProps> = ({
  experiment,
  onViewDetails,
  onCompare,
}) => {
  const isFlex = isFlexExperiment(experiment);
  const isBass = isBassExperiment(experiment);

  const title = isFlex
    ? `FLEX Test ${experiment.testIdentifier} — ${experiment.fuel}`
    : `BASS-II Test ${experiment.testIdentifier} — ${experiment.material.slice(0, 24)}...`;

  const flameGradient = isFlex
    ? 'from-orange-500/20 via-amber-500/10 to-transparent'
    : 'from-cyan-500/20 via-blue-500/10 to-transparent';

  const flameGlow = isFlex ? 'bg-orange-500' : 'bg-cyan-500';

  return (
    <div className="glass-panel rounded-xl overflow-hidden flex flex-col justify-between hover:border-ignis-border-light hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all duration-200 group">
      {/* Visual Header / Microgravity Flame Thumbnail */}
      <div className={`relative h-28 w-full bg-gradient-to-t ${flameGradient} bg-[#0A1322] flex items-center justify-center overflow-hidden border-b border-[#213047]/60`}>
        {/* Subtle radial glow */}
        <div className={`w-20 h-20 rounded-full ${flameGlow} opacity-20 blur-xl group-hover:scale-125 transition-transform duration-500`} />

        {/* Central Flame Silhouette Symbol */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <div className={`w-12 h-12 rounded-full border border-dashed ${isFlex ? 'border-orange-500/40' : 'border-cyan-500/40'} animate-spin`} style={{ animationDuration: '30s' }} />
            <Flame
              size={24}
              className={`absolute ${isFlex ? 'text-ignis-orange' : 'text-ignis-cyan'} drop-shadow-[0_0_10px_rgba(255,100,28,0.8)]`}
            />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-gray-400 mt-1 uppercase">
            {isFlex ? 'Droplet Combustion' : 'Solid Flammability'}
          </span>
        </div>

        {/* Investigation Badge */}
        <div className="absolute top-2.5 left-2.5">
          <StatusBadge tone={isFlex ? 'orange' : 'cyan'}>
            {experiment.investigation}
          </StatusBadge>
        </div>

        {/* NASA Provenance pill */}
        <div className="absolute top-2.5 right-2.5">
          <span className="text-[10px] font-mono text-gray-400 bg-black/40 px-2 py-0.5 rounded border border-gray-700/40">
            {experiment.investigationId}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-ignis-text group-hover:text-ignis-orange transition-colors font-mono line-clamp-1">
            {title}
          </h3>
          <p className="text-xs text-ignis-muted mt-1 line-clamp-1">
            {isFlex ? `Fuel: ${experiment.fuel} · End: ${experiment.testEnd || '—'}` : `Material: ${experiment.material}`}
          </p>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-[#213047]/60 text-xs font-mono">
            {isFlex && (
              <>
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase">Oxygen</span>
                  <span className="font-semibold text-gray-300">
                    {formatOxygen(experiment.oxygenMoleFraction, false)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase">Pressure</span>
                  <span className="font-semibold text-gray-300">
                    {formatPressure(experiment.ambientPressureMmHg)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase">Diameter</span>
                  <span className="font-semibold text-gray-300">
                    {formatDiameter(experiment.initialDropletDiameterMm)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase">Burn Time</span>
                  <span className="font-semibold text-gray-300">
                    {formatBurnTime(experiment.burnTimeSeconds)}
                  </span>
                </div>
              </>
            )}

            {isBass && (
              <>
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase">Initial O₂</span>
                  <span className="font-semibold text-gray-300">
                    {formatOxygen(experiment.initialOxygenPercent, true)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase">Airflow</span>
                  <span className="font-semibold text-gray-300">
                    {experiment.airDisplayRaw || '—'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-gray-500 block uppercase">Fan Display</span>
                  <span className="font-semibold text-gray-300 truncate block">
                    {experiment.fanDisplayRaw || '—'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="mt-4 pt-3 border-t border-[#213047]/60 flex items-center justify-between gap-2">
          <button
            onClick={() => onViewDetails(experiment)}
            className="flex-1 py-1.5 px-3 rounded-lg bg-ignis-surface-2 hover:bg-[#16273D] text-xs font-mono text-cyan-300 hover:text-white border border-[#213047] hover:border-cyan-500/50 transition-colors flex items-center justify-center gap-1.5"
          >
            <Eye size={13} />
            <span>View Details</span>
          </button>
          {onCompare && (
            <button
              onClick={() => onCompare(experiment)}
              title="Add to comparison"
              className="p-1.5 rounded-lg bg-ignis-surface-2 hover:bg-orange-500/20 text-gray-400 hover:text-orange-400 border border-[#213047] hover:border-orange-500/50 transition-colors"
            >
              <ArrowUpRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
