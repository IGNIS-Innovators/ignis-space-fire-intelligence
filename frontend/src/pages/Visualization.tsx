import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  PieChart,
  ScatterChart as ScatterIcon,
  Wind,
  Layers,
  Box,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { OutcomesChart } from '../components/charts/OutcomesChart';
import { FuelChart } from '../components/charts/FuelChart';
import { BurnTimeScatter } from '../components/charts/BurnTimeScatter';
import { OxygenChart } from '../components/charts/OxygenChart';
import { MaterialOxygenView } from '../components/charts/MaterialOxygenView';
import { ConceptFlameLab3D } from '../components/visuals/ConceptFlameLab3D';
import { dataSource } from '../services/dataSource';
import { Experiment } from '../types/experiment';

type ChartType = 'outcomes' | 'fuels' | 'burnTime' | 'oxygen' | 'bassMaterials';

export const Visualization: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedChart, setSelectedChart] = useState<ChartType>('outcomes');
  const [viewMode, setViewMode] = useState<'split' | '3d-only' | 'charts-only'>('split');

  // Interactive 3D chamber preview parameters
  const [previewO2, setPreviewO2] = useState(21);
  const [previewDiameter, setPreviewDiameter] = useState(2.0);

  useEffect(() => {
    dataSource.listExperiments().then(setExperiments);
  }, []);

  const chartOptions = [
    { id: 'outcomes', label: 'Test Outcomes', icon: BarChart2, scope: 'FLEX (274 records)' },
    { id: 'fuels', label: 'Fuel Distribution', icon: PieChart, scope: 'FLEX (274 records)' },
    { id: 'burnTime', label: 'Burn Duration Scatter', icon: ScatterIcon, scope: 'Sample rows only' },
    { id: 'oxygen', label: 'Oxygen Mole Fraction', icon: Wind, scope: 'Sample rows only' },
    { id: 'bassMaterials', label: 'Solid Specimen Matrix', icon: Layers, scope: 'BASS-II (15 rows)' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="ANALYTICS / 03"
        title="Interactive Visualization"
        subtitle="Explore verified NASA microgravity combustion distributions and examine 3D chamber geometry."
        actions={
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0B1424] border border-[#213047] font-mono text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'split' ? 'bg-ignis-orange text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('charts-only')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'charts-only' ? 'bg-ignis-orange text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              2D Charts
            </button>
            <button
              onClick={() => setViewMode('3d-only')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === '3d-only' ? 'bg-ignis-orange text-white font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              3D Concept View
            </button>
          </div>
        }
      />

      {/* Main Visualizer Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 2D Charts Panel */}
        {viewMode !== '3d-only' && (
          <div
            className={`glass-panel rounded-2xl p-6 flex flex-col justify-between ${
              viewMode === 'charts-only' ? 'lg:col-span-12' : 'lg:col-span-7'
            }`}
          >
            <div>
              {/* Chart Selector Tabs */}
              <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-[#213047]">
                {chartOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedChart === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedChart(opt.id as ChartType)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono transition-all ${
                        isSelected
                          ? 'bg-ignis-surface-2 text-white border border-ignis-orange font-semibold shadow-[0_0_12px_rgba(255,100,28,0.25)]'
                          : 'bg-[#09111E] text-gray-400 hover:text-white border border-[#213047]'
                      }`}
                    >
                      <Icon size={14} className={isSelected ? 'text-ignis-orange' : 'text-gray-500'} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Chart Content Area */}
              <div className="min-h-[340px]">
                {selectedChart === 'outcomes' && <OutcomesChart height={340} />}
                {selectedChart === 'fuels' && <FuelChart height={340} />}
                {selectedChart === 'burnTime' && (
                  <BurnTimeScatter experiments={experiments} height={340} />
                )}
                {selectedChart === 'oxygen' && (
                  <OxygenChart experiments={experiments} height={340} />
                )}
                {selectedChart === 'bassMaterials' && (
                  <MaterialOxygenView experiments={experiments} />
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1C2C44] text-[11px] font-mono text-gray-400 flex items-center justify-between">
              <span>Scientific Data Integrity: Verified NASA PSI Sources</span>
              <span className="text-cyan-400">Zero Fabricated Curves</span>
            </div>
          </div>
        )}

        {/* Right 3D Combustion Chamber Visualizer */}
        {viewMode !== 'charts-only' && (
          <div
            className={`glass-panel rounded-2xl p-6 flex flex-col justify-between ${
              viewMode === '3d-only' ? 'lg:col-span-12 h-[680px]' : 'lg:col-span-5 h-[560px] lg:h-auto'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Box size={18} className="text-ignis-cyan" />
                  <h3 className="text-base font-bold text-white font-mono">
                    Chamber 3D Geometry
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                  Interactive R3F
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Drag to rotate microgravity combustion chamber; scroll to zoom.
              </p>
            </div>

            {/* 3D Scene */}
            <div className="relative flex-1 w-full min-h-[300px] rounded-xl overflow-hidden bg-[#070D1A] border border-[#213047]">
              <ConceptFlameLab3D
                oxygenLevel={previewO2}
                dropletDiameter={previewDiameter}
                interactive
              />
            </div>

            {/* Chamber Parameter Sliders (artistic visual adjustment) */}
            <div className="mt-4 pt-4 border-t border-[#213047] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-300">
                  <Sliders size={13} className="text-ignis-orange" />
                  <span>Artistic Flame Scale</span>
                </span>
                <span className="text-ignis-orange font-semibold">{previewDiameter.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.5"
                step="0.1"
                value={previewDiameter}
                onChange={(e) => setPreviewDiameter(parseFloat(e.target.value))}
                className="w-full accent-ignis-orange bg-slate-800"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-gray-300">Flame Chemiluminescence Accent</span>
                <span className="text-ignis-cyan font-semibold">{previewO2}% O₂</span>
              </div>
              <input
                type="range"
                min="15"
                max="40"
                step="1"
                value={previewO2}
                onChange={(e) => setPreviewO2(parseInt(e.target.value, 10))}
                className="w-full accent-ignis-cyan bg-slate-800"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
