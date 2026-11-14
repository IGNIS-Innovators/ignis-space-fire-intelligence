import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { FilterChips } from '../ui/FilterChips';

interface ExperimentFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedInvestigation: 'ALL' | 'PSI-69' | 'PSI-25';
  onInvestigationChange: (inv: 'ALL' | 'PSI-69' | 'PSI-25') => void;
  selectedFuelOrMaterial: string;
  onFuelOrMaterialChange: (val: string) => void;
  selectedTestEnd: string;
  onTestEndChange: (val: string) => void;
  onReset: () => void;
  totalCount: number;
  filteredCount: number;
  flexCount?: number;
  bassCount?: number;
}

export const ExperimentFilters: React.FC<ExperimentFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedInvestigation,
  onInvestigationChange,
  selectedFuelOrMaterial,
  onFuelOrMaterialChange,
  selectedTestEnd,
  onTestEndChange,
  onReset,
  totalCount,
  filteredCount,
  flexCount = 274,
  bassCount = 129,
}) => {
  const investigationOptions = [
    { id: 'ALL', label: 'All Datasets', count: totalCount },
    { id: 'PSI-69', label: 'FLEX (Droplets)', count: flexCount },
    { id: 'PSI-25', label: 'BASS-II (Solids)', count: bassCount },
  ];

  return (
    <div className="space-y-4">
      {/* Top Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search all 403 NASA trials by ID, fuel, material, PI, or run number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ignis-surface-2 border border-[#213047] text-ignis-text text-sm placeholder-gray-500 focus:outline-none focus:border-ignis-orange focus:ring-1 focus:ring-ignis-orange transition-all font-mono"
          />
        </div>

        <button
          onClick={onReset}
          title="Reset all filters"
          className="btn-secondary text-xs py-2.5 px-3.5 shrink-0 flex items-center gap-1.5"
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>

      {/* Investigation Filter Chips + Sub-filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <FilterChips
          options={investigationOptions}
          selectedId={selectedInvestigation}
          onSelect={(id) => onInvestigationChange(id as any)}
        />

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {selectedInvestigation !== 'PSI-25' && (
            <select
              value={selectedFuelOrMaterial}
              onChange={(e) => onFuelOrMaterialChange(e.target.value)}
              className="bg-ignis-surface-2 border border-[#213047] rounded-lg px-2.5 py-1.5 text-gray-300 focus:outline-none focus:border-ignis-orange"
            >
              <option value="ALL">All Fuels & Materials</option>
              <option value="Methanol">Methanol</option>
              <option value="Heptane">Heptane</option>
              <option value="PMMA">PMMA</option>
              <option value="SIBAL">SIBAL</option>
              <option value="Nomex">Nomex</option>
              <option value="Wax">Wax</option>
            </select>
          )}

          {selectedInvestigation === 'PSI-69' && (
            <select
              value={selectedTestEnd}
              onChange={(e) => onTestEndChange(e.target.value)}
              className="bg-ignis-surface-2 border border-[#213047] rounded-lg px-2.5 py-1.5 text-gray-300 focus:outline-none focus:border-ignis-orange"
            >
              <option value="ALL">All Outcomes</option>
              <option value="Extinction">Extinction</option>
              <option value="Disruption">Disruption</option>
              <option value="Completion">Completion</option>
            </select>
          )}

          <span className="text-[11px] text-gray-400 pl-2">
            Showing <strong className="text-white">{filteredCount}</strong> of {totalCount} records
          </span>
        </div>
      </div>
    </div>
  );
};
