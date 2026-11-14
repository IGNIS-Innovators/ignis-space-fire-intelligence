import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Sparkles,
  ExternalLink,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
  Tag,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { NeuralInsight3D } from '../components/visuals/NeuralInsight3D';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { dataSource } from '../services/dataSource';
import { InsightViewModel } from '../types/experiment';

export const Insights: React.FC = () => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<InsightViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('ALL');

  const fetchInsights = async (cat?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await dataSource.getInsights(cat !== 'ALL' ? cat : undefined);
      setInsights(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load scientific insights from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights(category);
  }, [category]);

  const categoryOptions = [
    { id: 'ALL', label: 'All Topics' },
    { id: 'oxidizer', label: 'Oxidizer Dynamics' },
    { id: 'diluent', label: 'Diluent Transport' },
    { id: 'soot', label: 'Fuel & Soot Physics' },
    { id: 'solid', label: 'Solid Flame Spread' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EVIDENCE SYNTHESIS / 05"
        title="AI Scientific Insights"
        subtitle="Source-grounded summaries, Pearson correlation analyses, and telemetry findings derived from 403 authentic NASA PSI combustion trials."
        actions={
          <StatusBadge tone="cyan">
            Deterministic Synthesis · Zero Fabricated Claims
          </StatusBadge>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchInsights(category)}
            className="btn-secondary text-xs px-3 py-1 flex items-center gap-1"
          >
            <RotateCcw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Top Banner Hero */}
      <div className="glass-panel-cyan rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-3">
            <Sparkles size={13} />
            <span>Multivariate Correlation & Regression Distillation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
            Empirical Findings from <span className="text-ignis-cyan">PSI Microgravity Archives</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-3 leading-relaxed font-sans">
            AI-assisted knowledge distillation surfacing validated test endpoints, inert diluent thermodynamics, and microgravity flammability observations strictly grounded in authentic NASA sensor records.
          </p>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-5">
            {categoryOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setCategory(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                  category === opt.id
                    ? 'bg-ignis-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(54,184,255,0.4)]'
                    : 'bg-[#091222] text-gray-400 hover:text-white border border-[#213047]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Neural Network Sculpture */}
        <div className="w-full lg:w-80 h-64 sm:h-72 relative flex items-center justify-center">
          <NeuralInsight3D />
        </div>
      </div>

      {/* Grounded Insight Cards Grid */}
      {loading ? (
        <LoadingSkeleton count={4} height="h-64" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((item) => (
            <div
              key={item.id}
              className="glass-panel rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider bg-cyan-950/50 px-2.5 py-0.5 rounded border border-cyan-800/40">
                    {item.category || item.investigationId}
                  </span>
                  <span className="text-xs font-mono text-gray-500 font-bold">{item.id}</span>
                </div>

                <h3 className="text-base font-bold text-white font-mono mb-2">
                  {item.title}
                </h3>

                <p className="text-xs text-gray-300 leading-relaxed font-sans mb-4">
                  {item.finding}
                </p>

                {/* Statistical Evidence Box */}
                {item.evidenceSummary && (
                  <div className="p-3.5 rounded-xl bg-[#081220] border border-cyan-500/25 text-xs text-cyan-200/95 space-y-1.5 mb-3.5">
                    <div className="flex items-center gap-1.5 text-cyan-300 font-mono font-bold text-[11px] uppercase tracking-wider">
                      <TrendingUp size={13} />
                      <span>Empirical Evidence Proof</span>
                    </div>
                    <p className="font-sans text-[11px] text-gray-300 leading-relaxed">
                      {item.evidenceSummary}
                    </p>
                    {item.statisticalBasis && (
                      <div className="text-[10px] font-mono text-cyan-400 pt-1 border-t border-[#162740]">
                        {item.statisticalBasis}
                      </div>
                    )}
                  </div>
                )}

                {/* Spacecraft Safety Implication Box */}
                {item.scientificImplication && (
                  <div className="p-3 rounded-xl bg-[#0A1322] border border-amber-500/30 text-[11px] text-amber-200/90 flex gap-2 mb-4">
                    <ShieldCheck size={16} className="shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <span className="font-semibold block text-amber-300 font-mono text-[10px] uppercase">
                        Spaceflight Safety Relevance
                      </span>
                      <p className="text-gray-400 font-sans">{item.scientificImplication}</p>
                    </div>
                  </div>
                )}

                {/* Supporting Experiment IDs */}
                {item.supportingExperimentIds && item.supportingExperimentIds.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                      <Tag size={11} />
                      <span>Supporting NASA Trials (Click to Explore)</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.supportingExperimentIds.slice(0, 8).map((expId) => (
                        <button
                          key={expId}
                          onClick={() => navigate(`/research?q=${encodeURIComponent(expId)}`)}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0D1829] hover:bg-cyan-950/60 text-cyan-300 border border-[#213047] hover:border-cyan-500/40 transition-colors"
                        >
                          {expId}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#213047] flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400 truncate max-w-[200px]">
                  {item.source}
                </span>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                >
                  <span>NASA PSI Archive</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
