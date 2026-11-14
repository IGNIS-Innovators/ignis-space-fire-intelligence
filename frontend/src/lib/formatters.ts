/**
 * Scientific data formatters for NASA microgravity combustion datasets.
 * Handles null/undefined values gracefully by returning an em dash ('—').
 */

export function formatOxygen(value: number | null | undefined, isPercent: boolean = false): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  const pct = isPercent ? value : value * 100;
  return `${pct.toFixed(1)}%`;
}

export function formatPressure(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  return `${value.toFixed(1)} mmHg`;
}

export function formatDiameter(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  return `${value.toFixed(2)} mm`;
}

export function formatBurnTime(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  return `${value.toFixed(1)} s`;
}

export function formatBurningRate(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  return `${value.toFixed(3)} mm²/s`;
}

