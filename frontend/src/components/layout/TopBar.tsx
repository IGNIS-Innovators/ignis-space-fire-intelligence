import React from 'react';
import { Menu, Search, Bell, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  onOpenSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSidebar }) => {
  const navigate = useNavigate();

  const handleGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = (e.target as HTMLInputElement).value;
      if (val.trim()) {
        navigate(`/research?q=${encodeURIComponent(val)}`);
      }
    }
  };

  return (
    <header className="h-16 px-4 lg:px-8 border-b border-[#213047] bg-[#070B15]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4">
      {/* Left Mobile Menu Toggle + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-gray-400">
          <span>NASA PSI</span>
          <span className="text-gray-600">/</span>
          <span className="text-cyan-400 font-medium">IGNIS Intelligence System</span>
        </div>
      </div>

      {/* Center Search Input with Shortcut hint */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search experiments, fuels, materials..."
            onKeyDown={handleGlobalSearch}
            className="w-full pl-9 pr-12 py-1.5 rounded-lg bg-[#0F1827] border border-[#213047] text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-ignis-orange focus:ring-1 focus:ring-ignis-orange"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/40 text-gray-400 border border-gray-700">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Right User Actions & Avatar (matching reference) */}
      <div className="flex items-center gap-3">
        {/* Offline / Provenance Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono bg-[#0B1526] border border-[#213047] text-cyan-300">
          <Database size={13} className="text-cyan-400" />
          <span>PSI Data Feed</span>
        </div>

        {/* Notifications */}
        <button
          title="Notifications"
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800/80 transition-colors relative"
        >
          <Bell size={17} />
          <span className="w-1.5 h-1.5 rounded-full bg-ignis-orange absolute top-1.5 right-1.5 ring-2 ring-[#070B15]" />
        </button>

        {/* Researcher Avatar — exact name from screenshot reference */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#213047]/80">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-400 flex items-center justify-center font-bold text-xs text-white font-mono shadow-[0_0_10px_rgba(54,184,255,0.4)]">
            MM
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-white leading-tight">
              Mohammed Magdy
            </span>
            <span className="text-[10px] text-gray-400 font-mono leading-tight">
              Researcher
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
