import React, { useState, useEffect } from 'react';
import { Menu, Search, User, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dataSource } from '../../services/dataSource';
import { HealthViewModel } from '../../types/experiment';

interface TopBarProps {
  onOpenSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSidebar }) => {
  const navigate = useNavigate();
  const [health, setHealth] = useState<HealthViewModel | null>(null);

  useEffect(() => {
    dataSource.getHealth().then(setHealth).catch(() => null);
  }, []);

  const handleGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = (e.target as HTMLInputElement).value;
      if (val.trim()) {
        navigate(`/research?q=${encodeURIComponent(val)}`);
      }
    }
  };

  const isHealthy = health?.status === 'healthy';

  return (
    <header className="h-16 px-4 lg:px-8 border-b border-[#1E3252]/80 bg-[#070D1B]/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between gap-4">
      {/* Left Mobile Menu Toggle + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#9FB0C8]">
          <span>NASA PSI</span>
          <span className="text-gray-600">/</span>
          <span className="text-[#40C9FF] font-medium">IGNIS Space Fire Intelligence</span>
        </div>
      </div>

      {/* Center Search Input with Shortcut hint */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search experiments, fuels, materials (Enter)..."
            onKeyDown={handleGlobalSearch}
            className="w-full pl-9 pr-12 py-1.5 rounded-lg bg-[#0F1827] border border-[#213047] text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-ignis-orange focus:ring-1 focus:ring-ignis-orange"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/40 text-gray-400 border border-gray-700">
            ↵
          </kbd>
        </div>
      </div>

      {/* Right User Actions & Status */}
      <div className="flex items-center gap-3">
        {/* Dynamic Live Health / Provenance Indicator */}
        <div
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border ${isHealthy
            ? 'bg-[#0B1A28] border-emerald-500/40 text-emerald-300'
            : 'bg-[#151520] border-amber-500/40 text-amber-300'
            }`}
        >
          {isHealthy ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE API (Port 8000)</span>
            </>
          ) : (
            <>
              <Database size={13} className="text-amber-400" />
              <span>OFFLINE / FIXTURE</span>
            </>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#213047]/80">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600/80 to-blue-500/80 border border-cyan-400/40 flex items-center justify-center text-white shadow-[0_0_12px_rgba(54,184,255,0.35)]">
            <User size={15} className="text-cyan-100" />
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-white leading-tight font-mono">
              Research Station
            </span>
            <span className="text-[10px] text-gray-400 font-mono leading-tight">
              Space Apps 2026
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
