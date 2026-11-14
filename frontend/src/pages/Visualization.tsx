import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  PieChart,
  ScatterChart as ScatterIcon,
  Wind,
  Layers,
  Box,
  Sliders,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Flame,
  Activity,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { BivariateScatterChart } from '../components/charts/BivariateScatterChart';
import { DistributionHistogram } from '../components/charts/DistributionHistogram';
import { CategoryBreakdownChart } from '../components/charts/CategoryBreakdownChart';
import { ConceptFlameLab3D } from '../components/visuals/ConceptFlameLab3D';
import { dataSource } from '../services/dataSource';
import { AnalyticsViewModel } from '../types/analytics';

type ChartId =
  | 'flex_o2_br'
  | 'flex_p_br'
  | 'flex_d_br'
  | 'flex_burn_time'
  | 'flex_outcomes'
  | 'flex_fuels'
  | 'bass_materials'
  | 'bass_o2_dist'
  | 'bass_o2_delta'
  | 'bass_co_products'
  | 'bass_geometry';

export const Visualization: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsViewModel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [investigationFilter, setInvestigationFilter] = useState<'ALL' | 'FLEX' | 'BASS-II'>('ALL');
  const [fuelFilter, setFuelFilter] = useState<string>('ALL');

  // Selected chart & view mode
  const [selectedChart, setSelectedChart] = useState<ChartId>('flex_o2_br');
  const [viewMode, setViewMode] = useState<'split' | 'charts-only' | '3d-only'>('split');

  // Interactive 3D chamber preview parameters
  const [previewO2, setPreviewO2] = useState(21);
  const [previewDiameter, setPreviewDiameter] = useState(2.0);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dataSource.getAnalytics(
        investigationFilter === 'ALL' ? undefined : investigationFilter,
        fuelFilter === 'ALL' ? undefined : fuelFilter
      );
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to load scientific analytics:', err);
      setError(err?.message || 'Failed to connect to analytics repository.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [investigationFilter, fuelFilter]);

  // Adjust active chart if current selection becomes irrelevant due to investigation filter
  useEffect(() => {
    if (investigationFilter === 'BASS-II' && selectedChart.startsWith('flex_')) {
      setSelectedChart('bass_materials');
    } else if (investigationFilter === 'FLEX' && selectedChart.startsWith('bass_')) {
      setSelectedChart('flex_o2_br');
    }
  }, [investigationFilter]);

  const flexOptions: Array<{ id: ChartId; label: string; icon: any; regime: string }> = [
    { id: 'flex_o2_br', label: 'O₂ vs Burning Rate (K)', icon: ScatterIcon, regime: 'd²-law kinetics' },
    { id: 'flex_p_br', label: 'Pressure vs Burning Rate', icon: Wind, regime: 'CIR 40–300 kPa' },
    { id: 'flex_d_br', label: 'Diameter (d₀) vs Burning Rate', icon: Activity, regime: '1.0–4.0 mm droplets' },
    { id: 'flex_burn_time', label: 'Burn Duration Distribution', icon: BarChart2, regime: 'Histogram (tb)' },
    { id: 'flex_outcomes', label: 'Test Termination Modes', icon: PieChart, regime: 'Extinction/Disruption' },
    { id: 'flex_fuels', label: 'Fuel Distribution', icon: Flame, regime: 'Methanol & Heptane' },
  ];

  const bassOptions: Array<{ id: ChartId; label: string; icon: any; regime: string }> = [
    { id: 'bass_materials', label: 'Solid Fuel Materials', icon: Layers, regime: 'PMMA, SIBAL, Nomex' },
    { id: 'bass_o2_dist', label: 'Calibrated Initial O₂', icon: Wind, regime: 'Histogram (% vol)' },
    { id: 'bass_o2_delta', label: 'Oxygen Depletion (ΔO₂)', icon: ScatterIcon, regime: 'Initial vs Final O₂' },
    { id: 'bass_co_products', label: 'Combustion Products (CO/CO₂)', icon: Activity, regime: 'Effluent concentrations' },
    { id: 'bass_geometry', label: 'Specimen Geometries', icon: Box, regime: 'Flat sheet vs Rod' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SCIENTIFIC ANALYTICS / 03"
        title="Data Analytics"
        subtitle="Empirical transport physics, bivariate correlations, and statistical distributions across 403 authenticated NASA microgravity trials."
        actions={
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0B1528] border border-[#1E3252] font-mono text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'split'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold shadow-[0_0_12px_rgba(255,107,53,0.35)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('charts-only')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'charts-only'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold shadow-[0_0_12px_rgba(255,107,53,0.35)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              2D Charts
            </button>
            <button
              onClick={() => setViewMode('3d-only')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === '3d-only'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold shadow-[0_0_12px_rgba(255,107,53,0.35)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              3D Chamber Preview
            </button>
          </div>
        }
      />

      {/* Global Filters & Provenance Banner */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border border-[#1E3252] bg-[#070D1B]/85 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400 mr-1">
            <Filter size={14} className="text-[#40C9FF]" />
            <span>Investigation:</span>
          </div>

          <div className="inline-flex rounded-xl bg-[#09111E] p-1 border border-[#1E3252] font-mono text-xs">
            <button
              onClick={() => setInvestigationFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                investigationFilter === 'ALL'
                  ? 'bg-[#15233D] text-[#40C9FF] font-semibold border border-cyan-500/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All (403)
            </button>
            <button
              onClick={() => setInvestigationFilter('FLEX')}
              className={`px-3 py-1 rounded-lg transition-all ${
                investigationFilter === 'FLEX'
                  ? 'bg-cyan-950/60 text-[#40C9FF] font-semibold border border-cyan-500/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              FLEX (274)
            </button>
            <button
              onClick={() => setInvestigationFilter('BASS-II')}
              className={`px-3 py-1 rounded-lg transition-all ${
                investigationFilter === 'BASS-II'
                  ? 'bg-orange-950/60 text-ignis-orange font-semibold border border-orange-500/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              BASS-II (129)
            </button>
          </div>

          {/* Fuel / Material Filter */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#1E3252]">
            <span className="text-xs font-mono text-gray-400">Fuel:</span>
            <select
              value={fuelFilter}
              onChange={(e) => setFuelFilter(e.target.value)}
              className="bg-[#09111E] border border-[#1E3252] text-xs font-mono text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#40C9FF]"
            >
              <option value="ALL">All Materials</option>
              {investigationFilter !== 'BASS-II' && (
                <optgroup label="FLEX Liquid Fuels">
                  <option value="Methanol">Methanol</option>
                  <option value="Heptane">Heptane</option>
                </optgroup>
              )}
              {investigationFilter !== 'FLEX' && (
                <optgroup label="BASS-II Solid Materials">
                  <option value="PMMA">PMMA</option>
                  <option value="SIBAL">SIBAL</option>
                  <option value="Nomex">Nomex</option>
                  <option value="Wax">Wax</option>
                </optgroup>
              )}
            </select>
          </div>
        </div>

        {/* Provenance Badge */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#9FB0C8]">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0B1528] border border-emerald-500/30 text-emerald-300">
            <CheckCircle2 size={13} className="text-emerald-400" />
            NASA PSI Authenticated
          </span>
          <span className="hidden sm:inline text-gray-500">·</span>
          <span className="hidden sm:inline text-gray-400">Zero Synthetic Curves</span>
        </div>
      </div>

      {/* Main Analytics Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 2D Analytics Panel */}
        {viewMode !== '3d-only' && (
          <div
            className={`glass-panel rounded-2xl p-5 sm:p-6 flex flex-col justify-between border border-[#1E3252] bg-[#070D1B]/90 backdrop-blur-xl ${
              viewMode === 'charts-only' ? 'lg:col-span-12' : 'lg:col-span-7'
            }`}
          >
            <div>
              {/* Chart Selector Tabs Grouped by Investigation */}
              <div className="space-y-3 mb-6 pb-4 border-b border-[#1E3252]/80">
                {/* FLEX Tabs */}
                {investigationFilter !== 'BASS-II' && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-mono tracking-wider text-[#40C9FF] uppercase font-bold">
                        FLEX Liquid Droplet Dynamics (PSI-69)
                      </span>
                      <span className="w-8 h-[1px] bg-cyan-900/60" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {flexOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = selectedChart === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setSelectedChart(opt.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                              isSelected
                                ? 'bg-[#0F1E38] text-white border border-[#40C9FF] font-semibold shadow-[0_0_12px_rgba(64,201,255,0.25)]'
                                : 'bg-[#09111E] text-gray-400 hover:text-white border border-[#1E3252]'
                            }`}
                          >
                            <Icon size={14} className={isSelected ? 'text-[#40C9FF]' : 'text-gray-500'} />
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* BASS-II Tabs */}
                {investigationFilter !== 'FLEX' && (
                  <div className={investigationFilter === 'ALL' ? 'pt-2' : ''}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-mono tracking-wider text-ignis-orange uppercase font-bold">
                        BASS-II Solid Flame Spread (PSI-25)
                      </span>
                      <span className="w-8 h-[1px] bg-orange-900/60" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {bassOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = selectedChart === opt.id;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => setSelectedChart(opt.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                              isSelected
                                ? 'bg-[#1A1528] text-white border border-ignis-orange font-semibold shadow-[0_0_12px_rgba(255,107,53,0.25)]'
                                : 'bg-[#09111E] text-gray-400 hover:text-white border border-[#1E3252]'
                            }`}
                          >
                            <Icon size={14} className={isSelected ? 'text-ignis-orange' : 'text-gray-500'} />
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Chart Content Area */}
              <div className="min-h-[380px] flex flex-col justify-center">
                {loading ? (
                  <div className="py-24 text-center font-mono space-y-3">
                    <div className="w-8 h-8 mx-auto border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <div className="text-xs text-[#9FB0C8]">Loading authentic NASA telemetry distributions...</div>
                  </div>
                ) : error ? (
                  <div className="p-6 rounded-xl bg-red-950/30 border border-red-800 text-center font-mono text-xs text-red-300 space-y-2">
                    <AlertTriangle size={24} className="mx-auto text-red-400" />
                    <p className="font-bold">Error Loading Scientific Analytics</p>
                    <p className="text-gray-400">{error}</p>
                    <button
                      onClick={fetchAnalytics}
                      className="mt-2 px-3 py-1 rounded bg-red-900/50 hover:bg-red-800 text-white"
                    >
                      Retry Connection
                    </button>
                  </div>
                ) : analytics ? (
                  <>
                    {/* FLEX Charts */}
                    {selectedChart === 'flex_o2_br' && analytics.flex && (
                      <BivariateScatterChart data={analytics.flex.o2_vs_burning_rate} height={360} />
                    )}
                    {selectedChart === 'flex_p_br' && analytics.flex && (
                      <BivariateScatterChart data={analytics.flex.pressure_vs_burning_rate} height={360} />
                    )}
                    {selectedChart === 'flex_d_br' && analytics.flex && (
                      <BivariateScatterChart data={analytics.flex.diameter_vs_burning_rate} height={360} />
                    )}
                    {selectedChart === 'flex_burn_time' && analytics.flex && (
                      <DistributionHistogram data={analytics.flex.burn_time_distribution} height={360} />
                    )}
                    {selectedChart === 'flex_outcomes' && analytics.flex && (
                      <CategoryBreakdownChart data={analytics.flex.outcomes} height={360} layout="horizontal" />
                    )}
                    {selectedChart === 'flex_fuels' && analytics.flex && (
                      <CategoryBreakdownChart data={analytics.flex.fuels} height={360} layout="vertical" />
                    )}

                    {/* BASS-II Charts */}
                    {selectedChart === 'bass_materials' && analytics.bass && (
                      <CategoryBreakdownChart data={analytics.bass.material_distribution} height={360} layout="vertical" />
                    )}
                    {selectedChart === 'bass_o2_dist' && analytics.bass && (
                      <DistributionHistogram data={analytics.bass.initial_o2_distribution} height={360} />
                    )}
                    {selectedChart === 'bass_o2_delta' && analytics.bass && (
                      <BivariateScatterChart data={analytics.bass.o2_consumption_scatter} height={360} />
                    )}
                    {selectedChart === 'bass_co_products' && analytics.bass && (
                      <BivariateScatterChart data={analytics.bass.combustion_products_scatter} height={360} />
                    )}
                    {selectedChart === 'bass_geometry' && analytics.bass && (
                      <CategoryBreakdownChart data={analytics.bass.geometry_distribution} height={360} layout="horizontal" />
                    )}
                  </>
                ) : (
                  <div className="py-20 text-center text-xs font-mono text-gray-500">
                    No analytics data available for selected filter combination.
                  </div>
                )}
              </div>
            </div>

            {/* Scientific Notice Footer */}
            <div className="mt-6 pt-4 border-t border-[#1E3252]/80 text-[11px] font-mono text-gray-400 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[#9FB0C8]">
                Regime Distinction: FLEX (quiescent droplet) vs BASS-II (forced duct flow)
              </span>
              <span className="text-[#40C9FF]">
                Full repository: {analytics?.total_records_analyzed ?? 403} authenticated records
              </span>
            </div>
          </div>
        )}

        {/* Right 3D Combustion Chamber Visualizer */}
        {viewMode !== 'charts-only' && (
          <div
            className={`glass-panel rounded-2xl p-5 sm:p-6 flex flex-col justify-between border border-[#1E3252] bg-[#070D1B]/90 backdrop-blur-xl ${
              viewMode === '3d-only' ? 'lg:col-span-12 h-[680px]' : 'lg:col-span-5 h-[560px] lg:h-auto'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Box size={18} className="text-[#40C9FF]" />
                  <h3 className="text-base font-bold text-white font-mono">
                    Combustion Chamber 3D
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                  Interactive R3F
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Drag to rotate microgravity chamber geometry; scroll to zoom in/out.
              </p>
            </div>

            {/* 3D Scene */}
            <div className="relative flex-1 w-full min-h-[300px] rounded-xl overflow-hidden bg-[#030712] border border-[#1E3252]">
              <ConceptFlameLab3D
                oxygenLevel={previewO2}
                dropletDiameter={previewDiameter}
                interactive
              />
            </div>

            {/* Chamber Parameter Sliders */}
            <div className="mt-4 pt-4 border-t border-[#1E3252] space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-gray-300">
                  <Sliders size={13} className="text-ignis-orange" />
                  <span>Interactive Droplet Diameter</span>
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
                <span className="text-gray-300">Chamber Oxygen Mole Fraction</span>
                <span className="text-[#40C9FF] font-semibold">{previewO2}% O₂</span>
              </div>
              <input
                type="range"
                min="15"
                max="40"
                step="1"
                value={previewO2}
                onChange={(e) => setPreviewO2(parseInt(e.target.value, 10))}
                className="w-full accent-[#40C9FF] bg-slate-800"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
