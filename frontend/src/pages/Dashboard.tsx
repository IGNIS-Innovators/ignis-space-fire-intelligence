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
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { OutcomesChart } from '../components/charts/OutcomesChart';
import { FlameHero3D } from '../components/visuals/FlameHero3D';
import { dataSource } from '../services/dataSource';
import { OverviewViewModel } from '../types/experiment';
import { VERIFIED_AGGREGATES } from '../data/verifiedAggregates';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<OverviewViewModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataSource.getOverview().then((data) => {
      setOverview(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
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
            Explore, analyze, and compare microgravity combustion investigations from NASA's Physical Sciences Informatics (PSI) repository with source-linked evidence.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/research')}
              className="btn-primary text-sm px-5 py-3 rounded-xl shadow-glow-orange flex items-center gap-2"
            >
              <span>Explore Research</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/visualization')}
              className="btn-secondary text-sm px-5 py-3 rounded-xl flex items-center gap-2"
            >
              <span>View 3D Lab</span>
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
          label="Source Table Rows"
          value={overview?.totalSourceRows ?? 403}
          subtext="Documented NASA PSI records"
          tone="orange"
          onClick={() => navigate('/research')}
        />
        <StatCard
          icon={Layers}
          label="PSI Investigations"
          value={overview?.investigationCount ?? 2}
          subtext="FLEX (PSI-69) & BASS-II (PSI-25)"
          tone="cyan"
          onClick={() => navigate('/research')}
        />
        <StatCard
          icon={Flask}
          label="Loaded Sample Records"
          value={overview?.loadedSampleCount ?? 40}
          subtext="25 FLEX + 15 BASS-II excerpts"
          tone="green"
          onClick={() => navigate('/research')}
        />
        <StatCard
          icon={TrendingUp}
          label="FLEX End Categories"
          value="3"
          subtext="Extinction, Disruption, Completion"
          tone="neutral"
          onClick={() => navigate('/visualization')}
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
          <OutcomesChart height={200} />
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
              Fundamental combustion physics under absent buoyancy:
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
            onClick={() => navigate('/visualization')}
            className="w-full mt-4 btn-secondary text-xs py-2 flex items-center justify-center gap-2"
          >
            <span>Open Interactive Visualizer</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Panel 3: Latest Evidence / Research Highlights */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <FileCheck2 size={17} className="text-ignis-green" />
                <span>Latest Evidence</span>
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
              Deterministic source facts verified against NASA PSI tables:
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-[#091322] border border-[#213047] hover:border-cyan-500/40 transition-colors">
                <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-1">
                  <span>FLEX Fuel Totals</span>
                  <span className="text-gray-500">Documented</span>
                </div>
                <p className="text-xs text-gray-200">
                  157 Methanol and 117 Heptane tests recorded across 15 parameters.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#091322] border border-[#213047] hover:border-orange-500/40 transition-colors">
                <div className="flex items-center justify-between text-[11px] font-mono text-orange-400 mb-1">
                  <span>BASS-II Scope</span>
                  <span className="text-gray-500">Documented</span>
                </div>
                <p className="text-xs text-gray-200">
                  129 recorded source rows with 51 distinct material descriptions.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#091322] border border-[#213047]">
                <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 mb-1">
                  <span>Sample Ingestion</span>
                  <span className="text-gray-500">Local Fixture</span>
                </div>
                <p className="text-xs text-gray-200">
                  40 real source records loaded locally (25 droplet, 15 solid).
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/insights')}
            className="w-full mt-4 btn-secondary text-xs py-2 flex items-center justify-center gap-2"
          >
            <span>Explore AI Insights</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
