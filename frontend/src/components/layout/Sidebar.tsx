import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  BarChart3,
  GitCompareArrows,
  BrainCircuit,
  FlaskConical,
  Settings,
  HelpCircle,
  UploadCloud,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// Exactly the six primary modules
const primaryNavItems = [
  { name: 'Mission Control', path: '/', icon: LayoutDashboard },
  { name: 'Experiment Explorer', path: '/research', icon: Search },
  { name: 'Data Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Compare Experiments', path: '/comparison', icon: GitCompareArrows },
  { name: 'Predictive Lab', path: '/predictive-lab', icon: FlaskConical },
  { name: 'AI Insights', path: '/insights', icon: BrainCircuit },
];

const secondaryNavItems = [
  { name: 'Submit Data', path: '/submit-experiment', icon: UploadCloud, badge: 'PREVIEW' },
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Help & Provenance', path: '/help', icon: HelpCircle },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
        />
      )}

      <aside
        aria-label="Primary Research Navigation"
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#070D1B]/95 backdrop-blur-xl border-r border-[#1E3252] flex flex-col justify-between transition-all duration-300 ease-in-out motion-reduce:transition-none lg:overflow-visible ${
          isCollapsed ? 'lg:w-[72px]' : 'lg:w-64'
        } w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div>
          <div
            className={`border-b border-[#1E3252]/70 relative overflow-hidden transition-all duration-300 ${
              isCollapsed
                ? 'lg:py-3 lg:px-2 lg:flex-col lg:gap-2 h-16 lg:h-auto px-5 flex items-center justify-between'
                : 'h-16 px-4 flex items-center justify-between'
            }`}
          >
            {/* Brand Logo & Title */}
            <div className="relative group flex items-center">
              <NavLink
                to="/"
                onClick={onClose}
                className="flex items-center gap-3 group relative z-10"
                aria-label="IGNIS Home"
              >
                <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-[#FF6B35]/50 shadow-[0_0_18px_rgba(255,107,53,0.45)] group-hover:border-[#FF8A50] group-hover:shadow-[0_0_24px_rgba(255,107,53,0.65)] transition-all duration-300 shrink-0 bg-black flex items-center justify-center">
                  <img
                    src="/assets/ignis-blackhole-emblem.jpg"
                    alt="IGNIS Cosmic Icon"
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>

                <div
                  className={`flex flex-col whitespace-nowrap overflow-hidden transition-opacity duration-200 ${
                    isCollapsed ? 'lg:hidden' : 'flex'
                  }`}
                >
                  <span className="font-extrabold text-lg tracking-wider text-white font-mono group-hover:text-ignis-orange transition-colors">
                    IGNIS
                  </span>
                  <span className="text-[9px] tracking-widest text-[#40C9FF] font-mono uppercase -mt-1 font-semibold">
                    Space Fire Intelligence
                  </span>
                </div>
              </NavLink>

              {/* Tooltip on collapsed desktop for brand */}
              {isCollapsed && (
                <div
                  role="tooltip"
                  className="pointer-events-none absolute left-full ml-3.5 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 hidden lg:flex items-center px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-white bg-[#0B1528] border border-[#1E3252] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md whitespace-nowrap"
                >
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#0B1528] border-l border-b border-[#1E3252] rotate-45" />
                  <span>IGNIS · Space Fire Intelligence</span>
                </div>
              )}
            </div>

            {/* Desktop Toggle Button (Clearly visible next to IGNIS branding) */}
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
              aria-expanded={!isCollapsed}
              title={isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
              className={`hidden lg:flex items-center justify-center rounded-lg text-gray-400 hover:text-white bg-[#0B1528]/80 hover:bg-[#15233D] border border-[#1E3252] hover:border-[#40C9FF]/50 transition-all z-10 ${
                isCollapsed ? 'w-8 h-7 mt-0.5' : 'p-2'
              }`}
            >
              {isCollapsed ? (
                <PanelLeftOpen size={16} className="text-[#40C9FF]" />
              ) : (
                <PanelLeftClose size={16} className="text-gray-400 hover:text-[#40C9FF]" />
              )}
            </button>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-slate-800 lg:hidden relative z-10"
            >
              <X size={20} />
            </button>
          </div>

          {/* Section Divider / Label */}
          <div
            className={`transition-all duration-300 ${
              isCollapsed ? 'lg:px-2 lg:pt-3 lg:pb-2 lg:flex lg:justify-center px-5 pt-5 pb-2' : 'px-5 pt-5 pb-2'
            }`}
          >
            <span
              className={`text-[10px] font-mono tracking-wider text-gray-500 uppercase ${
                isCollapsed ? 'lg:hidden' : 'block'
              }`}
            >
              Core Research Modules
            </span>
            {isCollapsed && (
              <div className="hidden lg:block w-7 h-[1px] bg-[#1E3252]" />
            )}
          </div>

          {/* Primary Nav List (Exactly 5 Core Modules) */}
          <nav className={`space-y-1 transition-all duration-300 ${isCollapsed ? 'lg:px-2 px-3' : 'px-3'}`}>
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.path} className="relative group">
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center rounded-xl text-xs font-mono transition-all duration-150 ${
                        isCollapsed
                          ? 'lg:w-11 lg:h-11 lg:mx-auto lg:p-0 lg:justify-center justify-between px-3 py-2.5'
                          : 'justify-between px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500/20 to-orange-500/5 text-white font-semibold border-l-4 border-ignis-orange shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                          : 'text-ignis-muted hover:text-white hover:bg-slate-900/60'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className="shrink-0" />
                      <span className={isCollapsed ? 'lg:hidden' : ''}>{item.name}</span>
                    </div>
                  </NavLink>

                  {/* Tooltip on collapsed desktop */}
                  {isCollapsed && (
                    <div
                      role="tooltip"
                      className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 hidden lg:flex items-center px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-white bg-[#0B1528] border border-[#1E3252] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md whitespace-nowrap"
                    >
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#0B1528] border-l border-b border-[#1E3252] rotate-45" />
                      <span>{item.name}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer — Secondary Utilities */}
        <div
          className={`border-t border-[#213047]/70 bg-[#050810]/50 transition-all duration-300 ${
            isCollapsed ? 'lg:p-2 p-4 space-y-2' : 'p-4 space-y-3'
          }`}
        >
          <div className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.path} className="relative group">
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center rounded-lg text-xs font-mono transition-colors ${
                        isCollapsed
                          ? 'lg:w-10 lg:h-9 lg:mx-auto lg:p-0 lg:justify-center gap-3 px-3 py-1.5'
                          : 'gap-3 px-3 py-1.5'
                      } ${
                        isActive
                          ? 'text-white font-semibold bg-slate-800/40'
                          : 'text-gray-400 hover:text-white hover:bg-slate-900/40'
                      }`
                    }
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className={isCollapsed ? 'lg:hidden' : ''}>{item.name}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded bg-slate-800 text-gray-400 border border-slate-700 ml-auto ${
                          isCollapsed ? 'lg:hidden' : 'block'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>

                  {/* Tooltip on collapsed desktop */}
                  {isCollapsed && (
                    <div
                      role="tooltip"
                      className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium text-white bg-[#0B1528] border border-[#1E3252] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md whitespace-nowrap"
                    >
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#0B1528] border-l border-b border-[#1E3252] rotate-45" />
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* NASA Space Apps Badge */}
          <div className="relative group">
            <div
              className={`rounded-xl bg-[#09111E] border border-[#213047] flex items-center transition-all duration-300 ${
                isCollapsed
                  ? 'lg:w-10 lg:h-10 lg:p-0 lg:mx-auto lg:justify-center p-3 gap-2.5'
                  : 'p-3 gap-2.5'
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center font-bold text-xs text-blue-400 font-mono shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.25)]">
                N
              </div>
              <div className={isCollapsed ? 'lg:hidden' : 'block'}>
                <div className="text-[11px] font-bold text-white font-mono leading-tight whitespace-nowrap">
                  NASA Space Apps
                </div>
                <div className="text-[9px] text-gray-400 font-mono whitespace-nowrap">
                  Microgravity Combustion
                </div>
              </div>
            </div>

            {/* Tooltip on collapsed desktop for NASA badge */}
            {isCollapsed && (
              <div
                role="tooltip"
                className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 hidden lg:flex flex-col px-3 py-1.5 rounded-lg text-xs font-mono text-white bg-[#0B1528] border border-[#1E3252] shadow-[0_4px_24px_rgba(0,0,0,0.7)] backdrop-blur-md whitespace-nowrap"
              >
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#0B1528] border-l border-b border-[#1E3252] rotate-45" />
                <span className="font-bold text-[#40C9FF]">NASA Space Apps</span>
                <span className="text-[10px] text-gray-300">Microgravity Combustion</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
