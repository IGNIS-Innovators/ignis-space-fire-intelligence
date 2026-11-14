import { Experiment, isFlexExperiment, isBassExperiment } from '../types/experiment';

/**
 * Filters NASA combustion experiment records by search query, investigation,
 * fuel/material, and termination outcome.
 */
export function searchExperiments(
  experiments: Experiment[],
  query: string,
  investigation: 'ALL' | 'PSI-69' | 'PSI-25' | string,
  fuelOrMaterial: string,
  testEnd: string
): Experiment[] {
  const normalizedQuery = query.trim().toLowerCase();

  return experiments.filter((exp) => {
    // 1. Investigation Filter
    if (investigation !== 'ALL' && exp.investigationId !== investigation) {
      return false;
    }

    // 2. Fuel / Material Filter
    if (fuelOrMaterial !== 'ALL') {
      if (isFlexExperiment(exp)) {
        if (exp.fuel.toLowerCase() !== fuelOrMaterial.toLowerCase()) {
          return false;
        }
      } else if (isBassExperiment(exp)) {
        if (!exp.material.toLowerCase().includes(fuelOrMaterial.toLowerCase())) {
          return false;
        }
      }
    }

    // 3. Test End / Outcome Filter (applies to FLEX)
    if (testEnd !== 'ALL') {
      if (isFlexExperiment(exp)) {
        if (!exp.testEnd || exp.testEnd.toLowerCase() !== testEnd.toLowerCase()) {
          return false;
        }
      } else {
        return false;
      }
    }

    // 4. Free-text Search
    if (normalizedQuery) {
      const matchId = exp.id.toLowerCase().includes(normalizedQuery);
      const matchTestId = exp.testIdentifier.toLowerCase().includes(normalizedQuery);
      const matchInvestigation =
        exp.investigation.toLowerCase().includes(normalizedQuery) ||
        exp.investigationId.toLowerCase().includes(normalizedQuery);

      let matchDomain = false;
      if (isFlexExperiment(exp)) {
        const matchFuel = exp.fuel.toLowerCase().includes(normalizedQuery);
        const matchEnd = (exp.testEnd || '').toLowerCase().includes(normalizedQuery);
        matchDomain = matchFuel || matchEnd;
      } else if (isBassExperiment(exp)) {
        matchDomain = exp.material.toLowerCase().includes(normalizedQuery);
      }

      if (!matchId && !matchTestId && !matchInvestigation && !matchDomain) {
        return false;
      }
    }

    return true;
  });
}

