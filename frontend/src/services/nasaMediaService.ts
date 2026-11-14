import manifest from '../data/nasa_media_manifest.json';

export type VerificationLevel =
  | 'verified_trial_media'
  | 'verified_session_media'
  | 'representative_investigation_media'
  | 'illustrative_fallback';

export interface NasaMediaAsset {
  assetId: string;
  investigation: 'FLEX' | 'BASS-II';
  investigationId: 'PSI-69' | 'PSI-25';
  title: string;
  caption: string;
  assetType: string;
  imageUrl: string;
  sourcePage: string;
  sourceTitle: string;
  associatedExperimentId: string | null;
  sessionDate?: string;
  sessionNote?: string;
  verificationLevel: VerificationLevel;
  attribution: string;
  license: string;
}

const assets = manifest.assets as NasaMediaAsset[];

const flexAssets = assets.filter(a => a.investigationId === 'PSI-69');
const bassAssets = assets.filter(a => a.investigationId === 'PSI-25');

/** Deterministic integer hash of a string — used to distribute images across cards. */
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Returns a NASA-verified media asset for the given investigation and experiment ID,
 * or null if none are available.
 *
 * FLEX cards rotate deterministically through three SVS-11640 images.
 * BASS-II cards rotate deterministically through three verified NASA photographs.
 * No mapping ever claims a specific trial ID without explicit source evidence.
 */
export function getMediaForExperiment(
  investigationId: 'PSI-69' | 'PSI-25',
  experimentId: string
): NasaMediaAsset | null {
  if (investigationId === 'PSI-69' && flexAssets.length > 0) {
    return flexAssets[hashId(experimentId) % flexAssets.length];
  }
  if (investigationId === 'PSI-25' && bassAssets.length > 0) {
    return bassAssets[hashId(experimentId) % bassAssets.length];
  }
  return null;
}

/** Human-readable label for a verification level. */
export function verificationLabel(level: VerificationLevel): string {
  switch (level) {
    case 'verified_trial_media':
      return 'Verified Trial Media';
    case 'verified_session_media':
      return 'NASA Flight Session Media';
    case 'representative_investigation_media':
      return 'NASA Representative Investigation Media';
    case 'illustrative_fallback':
      return 'Scientific Illustration';
  }
}

/** Short badge label for card thumbnails. */
export function verificationBadgeLabel(level: VerificationLevel, investigationId: string): string {
  switch (level) {
    case 'verified_session_media':
      return 'NASA Session · Feb 26, 2016';
    case 'representative_investigation_media':
      return investigationId === 'PSI-69' ? 'NASA FLEX-2 SVS 11640' : 'NASA Representative · MSG';
    case 'verified_trial_media':
      return 'NASA Verified Trial';
    case 'illustrative_fallback':
      return 'Scientific Illustration';
  }
}

/** Tailwind dot color class for verification level badges. */
export function verificationDotColor(level: VerificationLevel): string {
  switch (level) {
    case 'verified_trial_media':
      return 'bg-emerald-400';
    case 'verified_session_media':
      return 'bg-green-400';
    case 'representative_investigation_media':
      return 'bg-cyan-400';
    case 'illustrative_fallback':
      return 'bg-gray-500';
  }
}

export const MANIFEST_NOTICE: string = manifest.provenanceNotice;
