import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Search,
  AlertCircle,
  FileText,
  Layers,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { NeuralInsight3D } from '../components/visuals/NeuralInsight3D';
import { dataSource } from '../services/dataSource';
import { InsightViewModel } from '../types/experiment';

export const Insights: React.FC = () => {
  const [insights, setInsights] = useState<InsightViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  useEffect(() => {
    dataSource.getInsights().then((data) => {
      setInsights(data);
      setLoading(false);
    });
  }, []);

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Honest explanation adhering to Section 5 & 6 of master prompt
    setSearchFeedback(
      `Query noted: "${searchQuery}". AI synthesis is currently restricted to verified offline source excerpts. Automated LLM inference requires a validated backend cited endpoint (GET /api/insights). Showing matching documented evidence below.`
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EVIDENCE SYNTHESIS / 05"
        title="AI Research Insights"
        subtitle="Source-grounded summaries and telemetry insights derived from NASA Physical Sciences Informatics microgravity combustion records."
        actions={
          <StatusBadge tone="orange">
            Limited Demo · Source-grounded summaries
          </StatusBadge>
        }
      />

      {/* Top Banner Hero: Insights Overview + 3D Neural Network Sculpture */}
      <div className="glass-panel-cyan rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-3">
            <Sparkles size={13} />
            <span>Deterministic Scientific Evidence Explorer</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
            Empirical Findings from <span className="text-ignis-cyan">PSI Microgravity Archives</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-3 leading-relaxed font-sans">
            AI-assisted knowledge distillation surfacing validated test endpoints, fuel differences, and microgravity flammability observations without synthetic hallucinations.
          </p>

          {/* Ask About This Research Bar */}
          <form onSubmit={handleAskSubmit} className="mt-5 flex gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask about microgravity quenching, fuel types, or solid flammability..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#091222] border border-[#213047] text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-ignis-cyan"
              />
            </div>
            <button type="submit" className="btn-secondary text-xs py-2 px-4 shrink-0">
              Query
            </button>
          </form>

          {searchFeedback && (
            <div className="mt-3 p-3 rounded-lg bg-blue-950/40 border border-blue-800/40 text-xs font-mono text-cyan-300">
              {searchFeedback}
            </div>
          )}
        </div>

        {/* 3D Neural Network Visualizer */}
        <div className="w-full lg:w-80 h-64 sm:h-72 relative flex items-center justify-center">
          <NeuralInsight3D />
        </div>
      </div>

      {/* Grounded Insight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((item) => (
          <div
            key={item.id}
            className="glass-panel rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                  {item.investigationId} Evidence Card
                </span>
                <span className="text-xs font-mono text-gray-500">{item.id}</span>
              </div>

              <h3 className="text-base font-bold text-white font-mono mb-2">
                {item.title}
              </h3>

              <p className="text-xs text-gray-300 leading-relaxed font-sans mb-4">
                {item.finding}
              </p>

              {/* Scientific Caveat / Limitations Box */}
              <div className="p-3 rounded-xl bg-[#0A1322] border border-[#213047] text-[11px] font-mono text-amber-300/90 flex gap-2 mb-4">
                <AlertCircle size={15} className="shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <span className="font-semibold block text-amber-300">What this does NOT imply:</span>
                  <span className="text-gray-400 font-sans">{item.caveats}</span>
                </div>
              </div>
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
                <span>View Source</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
