export const BANNER_RETRY_LIMIT = 3;
export const BANNER_RETRY_MS = 1500;

export type BannerPhase = 'loading' | 'shown' | 'hidden';

export type BannerEvent =
  | 'loaded'
  | 'failed'
  | 'interstitial-opened'
  | 'interstitial-closed'
  | 'foreground';

export type BannerState = {
  phase: BannerPhase;
  fails: number;
  generation: number;
  paused: boolean;
};

export const initialBanner: BannerState = {
  phase: 'loading',
  fails: 0,
  generation: 0,
  paused: false,
};

export function reduceBanner(state: BannerState, event: BannerEvent): BannerState {
  switch (event) {
    case 'loaded':
      return { ...state, phase: 'shown', fails: 0 };
    case 'failed':
      if (state.paused) return state;
      {
        const fails = state.fails + 1;
        if (fails < BANNER_RETRY_LIMIT) {
          return { ...state, fails, phase: 'loading' };
        }
        return { ...state, fails, phase: 'hidden' };
      }
    case 'interstitial-opened':
      return { ...state, paused: true };
    case 'interstitial-closed':
      return {
        ...state,
        paused: false,
        fails: 0,
        phase: 'loading',
        generation: state.generation + 1,
      };
    case 'foreground':
      if (state.paused || state.phase === 'hidden') {
        return {
          ...state,
          paused: false,
          fails: 0,
          phase: 'loading',
          generation: state.generation + 1,
        };
      }
      return state;
  }
}

export function bannerCollapsed(state: BannerState): boolean {
  return state.phase === 'hidden';
}

export function bannerRetry(failCount: number): 'retry' | 'give-up' {
  return failCount < BANNER_RETRY_LIMIT ? 'retry' : 'give-up';
}
