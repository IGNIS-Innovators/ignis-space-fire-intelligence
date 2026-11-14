import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, RotateCcw, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { ExperimentFilters } from '../components/research/ExperimentFilters';
import { ExperimentCard } from '../components/research/ExperimentCard';
import { DetailDrawer } from '../components/ui/DetailDrawer';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { dataSource } from '../services/dataSource';
import { Experiment, PaginationMeta } from '../types/experiment';

export const ResearchExplorer: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 403,
    page: 1,
    pageSize: 20,
    totalPages: 21,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);

  // Filters state
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [investigation, setInvestigation] = useState<'ALL' | 'PSI-69' | 'PSI-25'>('ALL');
  const [fuelOrMaterial, setFuelOrMaterial] = useState('ALL');
  const [testEnd, setTestEnd] = useState('ALL');
  const [page, setPage] = useState(1);

  // Update query if URL param changes
  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam !== null && qParam !== query) {
      setQuery(qParam);
      setPage(1);
    }
  }, [searchParams]);

  const fetchExperiments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dataSource.listExperiments({
        page,
        pageSize: 20,
        investigation: investigation !== 'ALL' ? investigation : undefined,
        fuel: fuelOrMaterial !== 'ALL' ? fuelOrMaterial : undefined,
        q: query.trim() || undefined,
      });

      // If testEnd is selected in client, we can filter within current set if needed,
      // but backend list handles investigation & fuel directly
      let list = res.experiments;
      if (testEnd !== 'ALL') {
        list = list.filter((e) => 'testEnd' in e && e.testEnd === testEnd);
      }

      setExperiments(list);
      setPagination(res.pagination);
    } catch (err: any) {
      setError(err?.message || 'Failed to retrieve NASA experiments from backend.');
    } finally {
      setLoading(false);
    }
  }, [page, investigation, fuelOrMaterial, query, testEnd]);

  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setPage(1);
    if (val) {
      setSearchParams({ q: val });
    } else {
      setSearchParams({});
    }
  };

  const handleInvestigationChange = (inv: 'ALL' | 'PSI-69' | 'PSI-25') => {
    setInvestigation(inv);
    setFuelOrMaterial('ALL');
    setTestEnd('ALL');
    setPage(1);
  };

  const handleFuelChange = (val: string) => {
    setFuelOrMaterial(val);
    setPage(1);
  };

  const handleTestEndChange = (val: string) => {
    setTestEnd(val);
    setPage(1);
  };

  const handleReset = () => {
    setQuery('');
    setInvestigation('ALL');
    setFuelOrMaterial('ALL');
    setTestEnd('ALL');
    setPage(1);
    setSearchParams({});
  };

  const handleViewDetails = async (exp: Experiment) => {
    // Fetch full verified details from single-experiment endpoint
    try {
      const detail = await dataSource.getExperiment(exp.id);
      setSelectedExperiment(detail);
    } catch {
      // Fallback to shallow record if detail endpoint unavailable
      setSelectedExperiment(exp);
    }
  };

  const handleCompare = (exp: Experiment) => {
    navigate(`/comparison?idA=${exp.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EXPLORER / 02"
        title="Experiment Explorer"
        subtitle="Discover verified NASA Physical Sciences Informatics (PSI) microgravity combustion studies across all 403 documented trials."
      />

      {/* Error state alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-400 shrink-0" />
            <div>
              <span className="font-bold block">Backend Query Failed</span>
              <span className="text-gray-300 font-sans">{error}</span>
            </div>
          </div>
          <button
            onClick={fetchExperiments}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 shrink-0"
          >
            <RotateCcw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Search & Filter Header Panel */}
      <div className="glass-panel rounded-2xl p-5">
        <ExperimentFilters
          searchQuery={query}
          onSearchChange={handleQueryChange}
          selectedInvestigation={investigation}
          onInvestigationChange={handleInvestigationChange}
          selectedFuelOrMaterial={fuelOrMaterial}
          onFuelOrMaterialChange={handleFuelChange}
          selectedTestEnd={testEnd}
          onTestEndChange={handleTestEndChange}
          onReset={handleReset}
          totalCount={pagination.total}
          filteredCount={experiments.length}
          flexCount={274}
          bassCount={129}
        />
      </div>

      {/* Grid of Experiment Cards */}
      {loading ? (
        <LoadingSkeleton count={6} height="h-64" />
      ) : experiments.length === 0 ? (
        <EmptyState
          title="No matching NASA experiments found"
          description="No experiments match your search criteria. Try clearing filters or searching for 'Methanol', 'Heptane', 'PMMA', 'SIBAL', or 'Extinction'."
          actionText="Reset Filters"
          onAction={handleReset}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiments.map((exp) => (
            <ExperimentCard
              key={exp.id}
              experiment={exp}
              onViewDetails={handleViewDetails}
              onCompare={handleCompare}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && pagination.totalPages > 1 && (
        <div className="glass-panel rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="text-gray-400">
            Page <strong className="text-white">{pagination.page}</strong> of{' '}
            <strong className="text-white">{pagination.totalPages}</strong> ·{' '}
            <span>{pagination.total} total NASA trials indexed</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1 || loading}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>

            {/* Quick page pills */}
            <div className="hidden md:flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (pagination.page > 3 && pagination.totalPages > 5) {
                  pageNum = pagination.page - 2 + i;
                  if (pageNum > pagination.totalPages) {
                    pageNum = pagination.totalPages - 4 + i;
                  }
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-mono transition-colors ${
                      pagination.page === pageNum
                        ? 'bg-ignis-orange text-white font-bold'
                        : 'bg-[#0D1829] text-gray-400 hover:text-white border border-[#213047]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page >= pagination.totalPages || loading}
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Slide-out detail drawer */}
      <DetailDrawer
        experiment={selectedExperiment}
        isOpen={Boolean(selectedExperiment)}
        onClose={() => setSelectedExperiment(null)}
        onSelectForCompare={(id) => navigate(`/comparison?idA=${id}`)}
      />
    </div>
  );
};
