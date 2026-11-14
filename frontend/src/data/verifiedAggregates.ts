// Verified aggregate data from NASA PSI source tables
// These are documented totals, NOT derived from the 40-row sample fixture

export const VERIFIED_AGGREGATES = {
  flex: {
    investigationId: 'PSI-69' as const,
    name: 'FLEX' as const,
    sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-69',
    totalSourceRows: 274,
    domain: 'Liquid-fuel droplet combustion in microgravity',
    outcomes: {
      extinction: 186,
      disruption: 61,
      completion: 27,
    },
    fuels: {
      methanol: 157,
      heptane: 117,
    },
    sourceColumns: 15,
  },
  bass: {
    investigationId: 'PSI-25' as const,
    name: 'BASS-II' as const,
    sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-25',
    totalSourceRows: 129,
    domain: 'Solid-material combustion in microgravity',
    distinctMaterialDescriptions: 51,
    sourceColumns: 17,
  },
  combined: {
    totalSourceRows: 403,
    investigationCount: 2,
    loadedSampleCount: 40,
    flexSampleCount: 25,
    bassSampleCount: 15,
  },
} as const;

export const FLEX_END_CATEGORIES = ['Extinction', 'Disruption', 'Completion'] as const;
