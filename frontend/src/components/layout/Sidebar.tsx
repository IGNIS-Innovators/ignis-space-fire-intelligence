import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Flame,
  LayoutDashboard,
  Search,
  ChartNoAxesCombined,
  GitCompareArrows,
  BrainCircuit,
  FlaskConical,
  UploadCloud,
  Settings,
  HelpCircle,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { name: 'Mission Control', path: '/', icon: LayoutDashboard },
  { name: 'Experiment Explorer', path: '/research', icon: Search },
  { name: 'Visualization', path: '/visualization', icon: ChartNoAxesCombined },
  { name: 'Compare Experiments', path: '/comparison', icon: GitCompareArrows },
  { name: 'AI Insights', path: '/insights', icon: BrainCircuit },
  { name: 'Predictive Lab', path: '/predictive-lab', icon: FlaskConical, isNew: true },
  { name: 'Submit Experiment', path: '/submit-experiment', icon: UploadCloud },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#070B15] border-r border-[#213047] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-[#213047]/70">
            <NavLink to="/" onClick={onClose} className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(255,100,28,0.5)]">
                <Flame size={20} className="text-white fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-wider text-white font-mono group-hover:text-ignis-orange transition-colors">
                  IGNIS
                </span>
                <span className="text-[9px] tracking-widest text-cyan-400 font-mono uppercase -mt-1 font-semibold">
                  Space Fire Intelligence
                </span>
              </div>
            </NavLink>
            <button
              onClick={onClose}
              className="p-1 rounded text-gray-400 hover:text-white lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Section Label */}
          <div className="px-5 pt-5 pb-2">
            <span className="text-[10px] font-mono tracking-wider text-gray-500 uppercase">
              Research Workspace
            </span>
          </div>

          {/* Nav List */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500/20 to-orange-500/5 text-white font-semibold border-l-4 border-ignis-orange shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                        : 'text-ignis-muted hover:text-white hover:bg-slate-900/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </div>
                  {item.isNew && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      PREVIEW
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#213047]/70 space-y-3 bg-[#050810]/50">
          <div className="space-y-1">
            <NavLink
              to="/settings"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
                  isActive ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'
                }`
              }
            >
              <Settings size={15} />
              <span>Settings</span>
            </NavLink>
            <NavLink
              to="/help"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
                  isActive ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'
                }`
              }
            >
              <HelpCircle size={15} />
              <span>Help & Support</span>
            </NavLink>
          </div>

          {/* NASA Space Apps Badge */}
          <div className="p-3 rounded-xl bg-[#09111E] border border-[#213047] flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center font-bold text-xs text-blue-400 font-mono">
              N
            </div>
            <div>
              <div className="text-[11px] font-bold text-white font-mono leading-tight">
                NASA Space Apps
              </div>
              <div className="text-[9px] text-gray-400 font-mono">
                Microgravity Combustion
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
