export const INTERSTITIAL_EVERY_N_LEVELS = 5;

export function shouldShowInterstitial(clearedLevel: number): boolean {
  return clearedLevel > 0 && clearedLevel % INTERSTITIAL_EVERY_N_LEVELS === 0;
}
