import React, { useState } from 'react';
import { Settings as SettingsIcon, Monitor, Cpu, Database, Save, Check } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';

export const Settings: React.FC = () => {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [chartAnimations, setChartAnimations] = useState(true);
  const [dataMode, setDataMode] = useState<'auto' | 'mock' | 'api'>('auto');
  const [apiBaseUrl, setApiBaseUrl] = useState('http://localhost:8000');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        eyebrow="CONFIGURATION"
        title="Settings & Workspace Preferences"
        subtitle="Manage 3D rendering performance, accessibility options, and backend API connection parameters."
      />

      <div className="glass-panel rounded-2xl p-6 space-y-6 font-mono text-xs">
        {/* Visual & 3D Settings */}
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Monitor size={16} className="text-ignis-cyan" />
            <span>Rendering & Accessibility</span>
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#091222] border border-[#213047]">
              <div>
                <span className="font-bold text-white block">Reduce 3D Motion</span>
                <span className="text-gray-400 font-sans text-xs">
                  Substitutes WebGL canvases with procedural high-contrast static vector graphics.
                </span>
              </div>
              <input
                type="checkbox"
                checked={reduceMotion}
                onChange={(e) => setReduceMotion(e.target.checked)}
                className="w-4 h-4 accent-ignis-orange cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#091222] border border-[#213047]">
              <div>
                <span className="font-bold text-white block">2D Chart Transitions</span>
                <span className="text-gray-400 font-sans text-xs">
                  Smooth interpolation transitions when switching between scientific metrics.
                </span>
              </div>
              <input
                type="checkbox"
                checked={chartAnimations}
                onChange={(e) => setChartAnimations(e.target.checked)}
                className="w-4 h-4 accent-ignis-orange cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Backend & Data Mode Settings */}
        <div className="pt-4 border-t border-[#213047]">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Database size={16} className="text-ignis-orange" />
            <span>Data Ingestion & Backend Mode</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-gray-400 block mb-1.5 uppercase text-[11px]">
                Active Data Mode (VITE_DATA_MODE)
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'auto', label: 'Auto (Recommended)', desc: 'Try FastAPI backend, fallback to local NASA fixture' },
                  { id: 'mock', label: 'Offline Fixture', desc: 'Strictly use local 40-record NASA sample JSON' },
                  { id: 'api', label: 'Live Backend API', desc: 'Direct HTTP calls to Laptop 1 backend' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setDataMode(mode.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      dataMode === mode.id
                        ? 'bg-ignis-surface-2 border-ignis-orange shadow-[0_0_12px_rgba(255,100,28,0.25)]'
                        : 'bg-[#091222] border-[#213047] hover:border-gray-500'
                    }`}
                  >
                    <span className="font-bold text-white block">{mode.label}</span>
                    <span className="text-[10px] text-gray-400 font-sans mt-1 block">
                      {mode.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-400 block mb-1.5 uppercase text-[11px]">
                FastAPI Backend URL (VITE_API_BASE_URL)
              </label>
              <input
                type="text"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                placeholder="http://localhost:8000 or http://192.168.1.X:8000"
                className="w-full bg-[#091222] border border-[#213047] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-ignis-orange"
              />
              <span className="text-[10px] text-gray-500 mt-1 block font-sans">
                For two-laptop development over LAN, enter Laptop 1's local IP address and port 8000.
              </span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#213047] flex justify-end">
          <button
            onClick={handleSave}
            className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
          >
            {saved ? <Check size={14} /> : <Save size={14} />}
            <span>{saved ? 'Preferences Saved' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
