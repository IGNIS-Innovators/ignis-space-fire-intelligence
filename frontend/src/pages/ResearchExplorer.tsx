import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { ExperimentFilters } from '../components/research/ExperimentFilters';
import { ExperimentCard } from '../components/research/ExperimentCard';
import { DetailDrawer } from '../components/ui/DetailDrawer';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { dataSource } from '../services/dataSource';
import { searchExperiments } from '../lib/search';
import { Experiment } from '../types/experiment';

export const ResearchExplorer: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);

  // Filters state
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [investigation, setInvestigation] = useState<'ALL' | 'PSI-69' | 'PSI-25'>('ALL');
  const [fuelOrMaterial, setFuelOrMaterial] = useState('ALL');
  const [testEnd, setTestEnd] = useState('ALL');

  useEffect(() => {
    dataSource.listExperiments().then((data) => {
      setExperiments(data);
      setLoading(false);
    });
  }, []);

  // Update query if URL param changes
  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam !== null) {
      setQuery(qParam);
    }
  }, [searchParams]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val) {
      setSearchParams({ q: val });
    } else {
      setSearchParams({});
    }
  };

  const handleReset = () => {
    setQuery('');
    setInvestigation('ALL');
    setFuelOrMaterial('ALL');
    setTestEnd('ALL');
    setSearchParams({});
  };

  const filteredExperiments = useMemo(() => {
    return searchExperiments(
      experiments,
      query,
      investigation,
      fuelOrMaterial,
      testEnd
    );
  }, [experiments, query, investigation, fuelOrMaterial, testEnd]);

  const handleCompare = (exp: Experiment) => {
    navigate(`/comparison?idA=${exp.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="EXPLORER / 02"
        title="Research Explorer"
        subtitle="Discover verified NASA Physical Sciences Informatics (PSI) microgravity combustion studies and recorded experiment parameters."
      />

      {/* Search & Filter Header Panel */}
      <div className="glass-panel rounded-2xl p-5">
        <ExperimentFilters
          searchQuery={query}
          onSearchChange={handleQueryChange}
          selectedInvestigation={investigation}
          onInvestigationChange={setInvestigation}
          selectedFuelOrMaterial={fuelOrMaterial}
          onFuelOrMaterialChange={setFuelOrMaterial}
          selectedTestEnd={testEnd}
          onTestEndChange={setTestEnd}
          onReset={handleReset}
          totalCount={experiments.length}
          filteredCount={filteredExperiments.length}
        />
      </div>

      {/* Grid of Experiment Cards */}
      {loading ? (
        <LoadingSkeleton count={6} height="h-64" />
      ) : filteredExperiments.length === 0 ? (
        <EmptyState
          title="No matching NASA experiments found"
          description="No experiments match your search criteria. Try clearing filters or searching for 'Methanol', 'Heptane', 'PMMA', or 'Extinction'."
          actionText="Reset Filters"
          onAction={handleReset}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperiments.map((exp) => (
            <ExperimentCard
              key={exp.id}
              experiment={exp}
              onViewDetails={setSelectedExperiment}
              onCompare={handleCompare}
            />
          ))}
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
