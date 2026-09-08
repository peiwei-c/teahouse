export function formatClearTime(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(hours === 1 ? '1 hour' : `${hours} hours`);
  if (minutes > 0) parts.push(minutes === 1 ? '1 minute' : `${minutes} minutes`);
  if (seconds > 0 || parts.length === 0) {
    parts.push(seconds === 1 ? '1 second' : `${seconds} seconds`);
  }
  return parts.join(' ');
}
