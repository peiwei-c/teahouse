export function preloadInterstitial(): void {}

export async function showInterstitial(): Promise<void> {}

export function watchInterstitial(_listener: (life: 'opened' | 'closed') => void): () => void {
  return () => {};
}
