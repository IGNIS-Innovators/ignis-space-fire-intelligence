import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Database,
  Layers,
  FlaskRound as Flask,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  ExternalLink,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { OutcomesChart } from '../components/charts/OutcomesChart';
import { FlameHero3D } from '../components/visuals/FlameHero3D';
import { dataSource } from '../services/dataSource';
import { OverviewViewModel, InsightViewModel } from '../types/experiment';
import { VERIFIED_AGGREGATES } from '../data/verifiedAggregates';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<OverviewViewModel | null>(null);
  const [insights, setInsights] = useState<InsightViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, insightsData] = await Promise.all([
        dataSource.getOverview(),
        dataSource.getInsights().catch(() => []),
      ]);
      setOverview(overviewData);
      setInsights(insightsData.slice(0, 3));
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to the IGNIS scientific backend on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isDemo = overview?.dataSource === 'fixture';

  return (
    <div className="space-y-8">
      {/* Live Data / Demo Mode Provenance Banner */}
      {isDemo ? (
        <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-bold">DEMO DATA — Sample records</span>
            <span className="text-gray-400">· Backend offline. Displaying verified 40-record sample fixture.</span>
          </div>
          <button
            onClick={loadData}
            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 flex items-center gap-1"
          >
            <RotateCcw size={12} />
            <span>Retry Backend API</span>
          </button>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-400" />
            <div>
              <span className="font-bold block">Backend Connection Error</span>
              <span className="text-gray-300 font-sans">{error}</span>
            </div>
          </div>
          <button
            onClick={loadData}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
          >
            <RotateCcw size={12} />
            <span>Retry</span>
          </button>
        </div>
      ) : (
        <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-bold">LIVE FASTAPI BACKEND CONNECTED</span>
            <span className="text-gray-400">· 403 Authentic NASA Physical Sciences Informatics (PSI) Records Indexed</span>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">Port 8000 · Verified PSI-69 & PSI-25</span>
        </div>
      )}

      {/* Hero Banner Section */}
      <div className="relative rounded-2xl glass-panel-glow overflow-hidden p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Hero Text */}
        <div className="flex-1 z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-orange-500/10 text-orange-400 border border-orange-500/30 mb-4">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            NASA Physical Sciences Informatics
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Welcome to <span className="text-ignis-orange drop-shadow-[0_0_20px_rgba(255,100,28,0.6)]">IGNIS</span>
            <br />
            <span className="text-2xl sm:text-3xl text-gray-200 font-light">
              Space Fire Intelligence
            </span>
          </h1>
          <p className="text-sm sm:text-base text-ignis-muted mt-4 leading-relaxed font-sans">
            Explore, analyze, and compare microgravity combustion investigations from NASA's Physical Sciences Informatics (PSI) repository with source-linked evidence and validated predictive modeling.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/research')}
              className="btn-primary text-sm px-5 py-3 rounded-xl shadow-glow-orange flex items-center gap-2"
            >
              <span>Explore Research ({overview?.totalSourceRows ?? 403} Trials)</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/predictive-lab')}
              className="btn-secondary text-sm px-5 py-3 rounded-xl flex items-center gap-2"
            >
              <span>Predictive Lab →</span>
            </button>
          </div>
        </div>

        {/* Right 3D Animated Flame Hero */}
        <div className="w-full lg:w-[480px] h-64 sm:h-80 lg:h-96 relative flex items-center justify-center">
          <FlameHero3D />
        </div>
      </div>

      {/* 4 KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Database}
          label="Total NASA Experiments"
          value={overview?.totalSourceRows ?? 403}
          subtext="Authentic NASA PSI records"
          tone="orange"
          onClick={() => navigate('/research')}
        />
        <StatCard
          icon={Layers}
          label="NASA Investigations"
          value={overview?.investigationCount ?? 2}
          subtext="FLEX (PSI-69) & BASS-II (PSI-25)"
          tone="cyan"
          onClick={() => navigate('/research')}
        />
        <StatCard
          icon={Flask}
          label="Total Indexed Records"
          value={overview?.loadedSampleCount ?? 403}
          subtext="274 FLEX + 129 BASS-II trials"
          tone="green"
          onClick={() => navigate('/research')}
        />
        <StatCard
          icon={TrendingUp}
          label="FLEX End Categories"
          value="3"
          subtext="Extinction, Disruption, Completion"
          tone="neutral"
          onClick={() => navigate('/research')}
        />
      </div>

      {/* 3 Panels Row: Research Overview (Chart) + Combustion Overview + Latest Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel 1: Research Overview (Outcomes Chart) */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Flame size={17} className="text-ignis-orange" />
                <span>Research Overview</span>
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                PSI-69
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Verified distribution of 274 microgravity droplet combustion endings.
            </p>
          </div>
          <OutcomesChart
            height={200}
            outcomes={overview?.flexOutcomes}
            total={overview?.totalSourceRows}
          />
        </div>

        {/* Panel 2: Combustion Overview (Microgravity Physics Summary) */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Layers size={17} className="text-ignis-cyan" />
                <span>Combustion Overview</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                Microgravity
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Fundamental combustion transport regimes under absent buoyancy:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#091322] border border-[#213047]">
                <strong className="text-ignis-orange block mb-0.5 font-mono">
                  FLEX (Flame Extinction Experiment)
                </strong>
                <p className="text-gray-300">
                  Liquid fuel droplets (Methanol & Heptane) burn spherically with slow diffusion flames, resulting in 67.9% radiative extinction.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#091322] border border-[#213047]">
                <strong className="text-ignis-cyan block mb-0.5 font-mono">
                  BASS-II (Burning and Suppression)
                </strong>
                <p className="text-gray-300">
                  Solid fuel specimens (PMMA films & cotton blends) subject to low-velocity airflow in narrow flow channels.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/research')}
            className="w-full mt-4 btn-secondary text-xs py-2 flex items-center justify-center gap-2"
          >
            <span>Browse All 403 Experiments</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Panel 3: Latest Evidence / Research Highlights */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <FileCheck2 size={17} className="text-ignis-green" />
                <span>Latest Scientific Evidence</span>
              </h3>
              <a
                href={VERIFIED_AGGREGATES.flex.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>View PSI</span>
                <ExternalLink size={10} />
              </a>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Evidence-based findings derived directly from authentic NASA experiments:
            </p>

            <div className="space-y-2.5">
              {insights.length > 0 ? (
                insights.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate('/insights')}
                    className="p-3 rounded-xl bg-[#091322] border border-[#213047] hover:border-cyan-500/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-1">
                      <span>{item.title}</span>
                      <span className="text-gray-500 text-[10px]">{item.id}</span>
                    </div>
                    <p className="text-xs text-gray-200 line-clamp-2">
                      {item.finding}
                    </p>
                  </div>
                ))
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-[#091322] border border-[#213047]">
                    <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-1">
                      <span>FLEX Fuel Totals</span>
                      <span className="text-gray-500">Documented</span>
                    </div>
                    <p className="text-xs text-gray-200">
                      157 Methanol and 117 Heptane tests recorded across 15 parameters.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#091322] border border-[#213047]">
                    <div className="flex items-center justify-between text-[11px] font-mono text-orange-400 mb-1">
                      <span>BASS-II Scope</span>
                      <span className="text-gray-500">Documented</span>
                    </div>
                    <p className="text-xs text-gray-200">
                      129 recorded source rows with 51 distinct material descriptions.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/insights')}
            className="w-full mt-4 btn-secondary text-xs py-2 flex items-center justify-center gap-2"
          >
            <span>Explore AI Insights ({insights.length > 0 ? '5 Available' : 'Explore'})</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
