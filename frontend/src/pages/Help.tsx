import React from 'react';
import { HelpCircle, ExternalLink, ShieldAlert, BookOpen, Layers } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { VERIFIED_AGGREGATES } from '../data/verifiedAggregates';

export const Help: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl font-sans">
      <PageHeader
        eyebrow="DOCUMENTATION"
        title="Help & Scientific Reference"
        subtitle="A guide to NASA Physical Sciences Informatics combustion datasets, physical definitions, and system limitations."
      />

      <div className="space-y-6">
        {/* Core Principles Section */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-base font-bold text-white font-mono flex items-center gap-2 mb-3">
            <BookOpen size={18} className="text-ignis-orange" />
            <span>What is IGNIS?</span>
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            IGNIS is an evidence-oriented research intelligence dashboard built for the NASA Space Apps Challenge. Its purpose is to enable scientists, engineers, and mission designers to explore, visualize, and compare microgravity combustion experiments stored in the NASA Physical Sciences Informatics (PSI) repository.
          </p>
        </div>

        {/* Investigations in Scope */}
        <div className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <Layers size={18} className="text-ignis-cyan" />
            <span>NASA PSI Investigations in Scope</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-[#091222] border border-[#213047] space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-ignis-orange text-sm">FLEX (PSI-69)</strong>
                <a
                  href={VERIFIED_AGGREGATES.flex.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>PSI Link</span>
                  <ExternalLink size={11} />
                </a>
              </div>
              <p className="text-gray-300 font-sans text-xs">
                Flame Extinction Experiment. Investigates isolated hydrocarbon droplet combustion in reduced gravity without natural buoyant convection.
              </p>
              <div className="text-[11px] text-gray-400 pt-1 border-t border-[#1C2C44]">
                • Total Documented Rows: <strong>274</strong><br />
                • Fuels: Methanol (157), Heptane (117)<br />
                • Endings: Extinction (186), Disruption (61), Completion (27)
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#091222] border border-[#213047] space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-ignis-cyan text-sm">BASS-II (PSI-25)</strong>
                <a
                  href={VERIFIED_AGGREGATES.bass.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>PSI Link</span>
                  <ExternalLink size={11} />
                </a>
              </div>
              <p className="text-gray-300 font-sans text-xs">
                Burning and Suppression of Solids. Examines low-velocity forced airflow extinction limits for solid materials in microgravity flow ducts.
              </p>
              <div className="text-[11px] text-gray-400 pt-1 border-t border-[#1C2C44]">
                • Total Documented Rows: <strong>129</strong><br />
                • Distinct Materials: <strong>51</strong> descriptions (PMMA, cotton, etc.)<br />
                • Flow displays are chamber fan readouts, not linear flow velocity.
              </div>
            </div>
          </div>
        </div>

        {/* Scientific Integrity Disclaimers */}
        <div className="glass-panel rounded-2xl p-6 border-amber-500/30 bg-amber-950/10 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-mono font-bold text-sm">
            <ShieldAlert size={18} />
            <span>Scientific Rules & Honest Prototype Principles</span>
          </div>

          <ul className="space-y-2 text-gray-300 list-disc list-inside leading-relaxed">
            <li>
              <strong>Zero Falsified Data:</strong> No synthetic NASA sensor logs, fake temperatures, or fabricated time series are displayed.
            </li>
            <li>
              <strong>Oxygen Normalization:</strong> FLEX reports oxygen mole fraction (e.g. 0.21 = 21.0%), while BASS-II reports calibrated percentage directly.
            </li>
            <li>
              <strong>Cross-Investigation Incompatibility:</strong> FLEX (droplet) and BASS-II (solid) measure different physics and are explicitly blocked from erroneous side-by-side delta calculation.
            </li>
            <li>
              <strong>3D Visualizations are Conceptual:</strong> All 3D scenes are real-time artistic/conceptual models, not measured physical CFD simulations.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
