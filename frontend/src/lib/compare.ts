import {
  Experiment,
  ComparisonViewModel,
  NumericDelta,
  isFlexExperiment,
  isBassExperiment,
} from '../types/experiment';

function computeDelta(
  field: string,
  label: string,
  unit: string,
  valA: number | null,
  valB: number | null,
  note?: string
): NumericDelta {
  let delta: number | null = null;
  let deltaPercent: number | null = null;

  if (valA !== null && valB !== null && !isNaN(valA) && !isNaN(valB)) {
    delta = valB - valA;
    if (valA !== 0) {
      deltaPercent = (delta / valA) * 100;
    }
  }

  return {
    field,
    label,
    unit,
    valA,
    valB,
    delta,
    deltaPercent,
    note,
  };
}

export function compareExperimentsLocal(
  expA: Experiment,
  expB: Experiment
): ComparisonViewModel {
  if (isFlexExperiment(expA) && isFlexExperiment(expB)) {
    const numericDeltas: NumericDelta[] = [
      computeDelta(
        'oxygenMoleFraction',
        'Oxygen (Mole Fraction)',
        'mole frac',
        expA.oxygenMoleFraction,
        expB.oxygenMoleFraction
      ),
      computeDelta(
        'ambientPressureMmHg',
        'Ambient Pressure',
        'mmHg',
        expA.ambientPressureMmHg,
        expB.ambientPressureMmHg
      ),
      computeDelta(
        'initialDropletDiameterMm',
        'Initial Droplet Diameter',
        'mm',
        expA.initialDropletDiameterMm,
        expB.initialDropletDiameterMm
      ),
      computeDelta(
        'burnTimeSeconds',
        'Burn Duration',
        's',
        expA.burnTimeSeconds,
        expB.burnTimeSeconds
      ),
      computeDelta(
        'burningRateOriginal',
        'Burning Rate Constant',
        'mm²/s',
        expA.burningRateOriginal,
        expB.burningRateOriginal,
        'Original PSI field'
      ),
    ];

    const qualitativeDifferences = [
      {
        property: 'Fuel Compound',
        valueA: expA.fuel,
        valueB: expB.fuel,
      },
      {
        property: 'Test Outcome',
        valueA: expA.testEnd || '—',
        valueB: expB.testEnd || '—',
      },
    ];

    return {
      experimentA: expA,
      experimentB: expB,
      isCompatible: true,
      compatibilityReason:
        'Both experiments belong to the NASA FLEX (PSI-69) investigation evaluating microgravity droplet combustion.',
      numericDeltas,
      qualitativeDifferences,
      dataSource: 'local',
    };
  }

  if (isBassExperiment(expA) && isBassExperiment(expB)) {
    const numericDeltas: NumericDelta[] = [
      computeDelta(
        'initialOxygenPercent',
        'Initial Oxygen Percentage',
        '%',
        expA.initialOxygenPercent,
        expB.initialOxygenPercent
      ),
    ];

    const qualitativeDifferences = [
      {
        property: 'Solid Material',
        valueA: expA.material,
        valueB: expB.material,
      },
      {
        property: 'Chamber Air Flow Readout',
        valueA: expA.airDisplayRaw || '—',
        valueB: expB.airDisplayRaw || '—',
      },
      {
        property: 'Fan Display Readout',
        valueA: expA.fanDisplayRaw || '—',
        valueB: expB.fanDisplayRaw || '—',
      },
    ];

    return {
      experimentA: expA,
      experimentB: expB,
      isCompatible: true,
      compatibilityReason:
        'Both experiments belong to the NASA BASS-II (PSI-25) investigation evaluating solid material flammability in microgravity.',
      numericDeltas,
      qualitativeDifferences,
      dataSource: 'local',
    };
  }

  return {
    experimentA: expA,
    experimentB: expB,
    isCompatible: false,
    compatibilityReason:
      'Cannot directly compare liquid droplet combustion (FLEX / PSI-69) with solid material combustion (BASS-II / PSI-25) due to fundamentally different physical regimes and boundary conditions.',
    numericDeltas: [],
    qualitativeDifferences: [
      {
        property: 'Investigation Domain',
        valueA: `${expA.investigation} (${expA.investigationId})`,
        valueB: `${expB.investigation} (${expB.investigationId})`,
      },
    ],
    dataSource: 'local',
  };
}
