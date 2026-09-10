import {
  bannerCollapsed,
  bannerRetry,
  initialBanner,
  reduceBanner,
  type BannerEvent,
  type BannerState,
} from '../banner';

function play(events: BannerEvent[], start: BannerState = initialBanner): BannerState {
  return events.reduce(reduceBanner, start);
}

describe('banner slot', () => {
  it('keeps the bar open while an ad is loading or showing', () => {
    expect(bannerCollapsed(initialBanner)).toBe(false);
    expect(bannerCollapsed(play(['loaded']))).toBe(false);
  });

  it('collapses only after standalone load has given up', () => {
    const hidden = play(['failed', 'failed', 'failed']);
    expect(bannerCollapsed(hidden)).toBe(true);
  });

  it('retries a few times before giving up', () => {
    expect(bannerRetry(1)).toBe('retry');
    expect(bannerRetry(2)).toBe('retry');
    expect(bannerRetry(3)).toBe('give-up');
  });

  it('brings the banner back after an interstitial, even if the banner failed while it was up', () => {
    const afterAd = play([
      'loaded',
      'interstitial-opened',
      'failed',
      'failed',
      'failed',
      'interstitial-closed',
    ]);
    expect(afterAd.phase).toBe('loading');
    expect(afterAd.generation).toBe(1);
    expect(bannerCollapsed(afterAd)).toBe(false);
  });

  it('does not count interstitial teardown as a give-up', () => {
    const duringAd = play(['loaded', 'interstitial-opened', 'failed', 'failed', 'failed']);
    expect(duringAd.phase).toBe('shown');
    expect(duringAd.fails).toBe(0);
  });

  it('remounts when the app comes back if the interstitial close was missed', () => {
    const afterResume = play(['loaded', 'interstitial-opened', 'foreground']);
    expect(afterResume.paused).toBe(false);
    expect(afterResume.phase).toBe('loading');
    expect(afterResume.generation).toBe(1);
  });
});
