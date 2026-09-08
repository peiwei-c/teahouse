export function greeting(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function tableReadyLine(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return 'Morning table is ready.';
  if (hour < 17) return 'The afternoon table is ready.';
  return 'The evening table is ready.';
}
