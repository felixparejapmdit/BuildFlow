export function formatRelativeTime(isoDateString: string): string {
  try {
    const timestamp = new Date(isoDateString).getTime();
    if (isNaN(timestamp)) return 'Recently';

    const now = Date.now();
    const diffSec = Math.floor((now - timestamp) / 1000);

    if (diffSec < 45) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

    return new Date(isoDateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Recently';
  }
}

export function isProjectStale(isoDateString: string, status: string): boolean {
  if (status === 'completed') return false;
  const timestamp = new Date(isoDateString).getTime();
  const diffHours = (Date.now() - timestamp) / (1000 * 3600);

  // Stale if awaiting feedback > 48h, or active with no updates > 24h
  if (status === 'awaiting_feedback' && diffHours > 48) return true;
  if (status === 'active' && diffHours > 24) return true;
  return false;
}
