/**
 * BuildFlow Dynamic Color Engine
 * Maps text labels, system categories, roles, and status to vibrant, curated VIP color tokens.
 */

export interface IconColorStyle {
  color: string;
  bg: string;
  border: string;
}

// Curated 12-color VIP harmonious palette
const PALETTE: IconColorStyle[] = [
  { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.14)', border: 'rgba(59, 130, 246, 0.28)' }, // Blue
  { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.14)', border: 'rgba(245, 158, 11, 0.28)' }, // Amber
  { color: '#10b981', bg: 'rgba(16, 185, 129, 0.14)', border: 'rgba(16, 185, 129, 0.28)' }, // Emerald
  { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.14)', border: 'rgba(139, 92, 246, 0.28)' }, // Purple
  { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.14)', border: 'rgba(239, 68, 68, 0.28)' },   // Red
  { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.14)', border: 'rgba(6, 182, 212, 0.28)' },   // Cyan
  { color: '#f97316', bg: 'rgba(249, 115, 22, 0.14)', border: 'rgba(249, 115, 22, 0.28)' }, // Orange
  { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.14)', border: 'rgba(99, 102, 241, 0.28)' }, // Indigo
  { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.14)', border: 'rgba(236, 72, 153, 0.28)' }, // Pink
  { color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.14)', border: 'rgba(20, 184, 166, 0.28)' }, // Teal
  { color: '#eab308', bg: 'rgba(234, 179, 8, 0.14)', border: 'rgba(234, 179, 8, 0.28)' },   // Yellow
  { color: '#84cc16', bg: 'rgba(132, 204, 22, 0.14)', border: 'rgba(132, 204, 22, 0.28)' }, // Lime
];

/**
 * Deterministically generates an icon color style for any text label.
 */
export function getIconColorForText(text: string): IconColorStyle {
  if (!text) return PALETTE[0];

  const lower = text.toLowerCase().trim();

  // 1. Navigation & System Tabs
  if (lower.includes('queue') || lower === 'projects' || lower === 'home') {
    return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.14)', border: 'rgba(59, 130, 246, 0.28)' }; // Blue
  }
  if (lower.includes('manager') || lower === 'projects_table') {
    return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.14)', border: 'rgba(245, 158, 11, 0.28)' }; // Amber
  }
  if (lower.includes('crew') || lower === 'manpower' || lower.includes('allocator')) {
    return { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.14)', border: 'rgba(6, 182, 212, 0.28)' }; // Cyan
  }
  if (lower.includes('propert') || lower.includes('estate') || lower.includes('building')) {
    return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.14)', border: 'rgba(59, 130, 246, 0.28)' }; // Blue
  }
  if (lower.includes('zone') || lower.includes('area') || lower.includes('room')) {
    return { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.14)', border: 'rgba(99, 102, 241, 0.28)' }; // Indigo
  }
  if (lower.includes('categor')) {
    return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.14)', border: 'rgba(245, 158, 11, 0.28)' }; // Amber
  }
  if (lower.includes('priorit')) {
    return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.14)', border: 'rgba(239, 68, 68, 0.28)' }; // Red
  }
  if (lower.includes('roster') || lower.includes('worker') || lower.includes('employee') || lower.includes('team')) {
    return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.14)', border: 'rgba(16, 185, 129, 0.28)' }; // Emerald
  }
  if (lower.includes('trade') || lower.includes('specialt')) {
    return { color: '#f97316', bg: 'rgba(249, 115, 22, 0.14)', border: 'rgba(249, 115, 22, 0.28)' }; // Orange
  }
  if (lower.includes('approval') || lower.includes('rule') || lower.includes('gate') || lower.includes('checklist')) {
    return { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.14)', border: 'rgba(34, 197, 94, 0.28)' }; // Green
  }
  if (lower.includes('user') || lower.includes('admin') || lower.includes('account')) {
    return { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.14)', border: 'rgba(139, 92, 246, 0.28)' }; // Purple
  }
  if (lower.includes('snapshot') || lower.includes('backup') || lower.includes('restore') || lower.includes('vault')) {
    return { color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.14)', border: 'rgba(14, 165, 233, 0.28)' }; // Sky
  }
  if (lower.includes('report') || lower.includes('digest')) {
    return { color: '#a855f7', bg: 'rgba(168, 85, 247, 0.14)', border: 'rgba(168, 85, 247, 0.28)' }; // Violet
  }
  if (lower.includes('stale') || lower.includes('alert') || lower.includes('radar')) {
    return { color: '#eab308', bg: 'rgba(234, 179, 8, 0.14)', border: 'rgba(234, 179, 8, 0.28)' }; // Amber-yellow
  }
  if (lower.includes('sample') || lower.includes('seed')) {
    return { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.14)', border: 'rgba(99, 102, 241, 0.28)' }; // Indigo
  }
  if (lower.includes('logout') || lower.includes('sign out') || lower.includes('lock') || lower.includes('delete') || lower.includes('trash')) {
    return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.14)', border: 'rgba(239, 68, 68, 0.28)' }; // Red
  }

  // 2. Project Categories
  if (lower.includes('renovation') || lower.includes('remodel')) {
    return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.14)', border: 'rgba(245, 158, 11, 0.28)' }; // Amber
  }
  if (lower.includes('ground') && lower.includes('struct') || lower.includes('construction') || lower.includes('build')) {
    return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.14)', border: 'rgba(59, 130, 246, 0.28)' }; // Blue
  }
  if (lower.includes('preventive') || lower.includes('maintenance') || lower.includes('repair')) {
    return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.14)', border: 'rgba(16, 185, 129, 0.28)' }; // Emerald
  }
  if (lower.includes('proposal') || lower.includes('design') || lower.includes('architect')) {
    return { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.14)', border: 'rgba(139, 92, 246, 0.28)' }; // Purple
  }
  if (lower.includes('interior') || lower.includes('fit-out') || lower.includes('luxury')) {
    return { color: '#ec4899', bg: 'rgba(236, 72, 153, 0.14)', border: 'rgba(236, 72, 153, 0.28)' }; // Pink
  }
  if (lower.includes('exterior') || lower.includes('infrastructure') || lower.includes('landscape')) {
    return { color: '#84cc16', bg: 'rgba(132, 204, 22, 0.14)', border: 'rgba(132, 204, 22, 0.28)' }; // Lime
  }

  // 3. User Roles
  if (lower.includes('admin') || lower.includes('super')) {
    return { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.14)', border: 'rgba(139, 92, 246, 0.28)' }; // Violet
  }
  if (lower.includes('supervisor')) {
    return { color: '#2563eb', bg: 'rgba(37, 99, 235, 0.14)', border: 'rgba(37, 99, 235, 0.28)' }; // Blue
  }
  if (lower.includes('lead')) {
    return { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.14)', border: 'rgba(6, 182, 212, 0.28)' }; // Cyan
  }
  if (lower.includes('vip') || lower.includes('representative')) {
    return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.14)', border: 'rgba(245, 158, 11, 0.28)' }; // Amber
  }
  if (lower.includes('inspector') || lower.includes('qa') || lower.includes('audit')) {
    return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.14)', border: 'rgba(16, 185, 129, 0.28)' }; // Green
  }

  // 4. Priorities
  if (lower.includes('urgent') || lower.includes('critical')) {
    return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.14)', border: 'rgba(239, 68, 68, 0.28)' }; // Red
  }
  if (lower.includes('high')) {
    return { color: '#f97316', bg: 'rgba(249, 115, 22, 0.14)', border: 'rgba(249, 115, 22, 0.28)' }; // Orange
  }
  if (lower.includes('normal') || lower.includes('medium')) {
    return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.14)', border: 'rgba(59, 130, 246, 0.28)' }; // Blue
  }
  if (lower.includes('low')) {
    return { color: '#64748b', bg: 'rgba(100, 116, 139, 0.14)', border: 'rgba(100, 116, 139, 0.28)' }; // Slate
  }

  // 5. Trades
  if (lower.includes('carpent')) {
    return { color: '#f97316', bg: 'rgba(249, 115, 22, 0.14)', border: 'rgba(249, 115, 22, 0.28)' }; // Orange
  }
  if (lower.includes('electr')) {
    return { color: '#eab308', bg: 'rgba(234, 179, 8, 0.14)', border: 'rgba(234, 179, 8, 0.28)' }; // Yellow
  }
  if (lower.includes('plumb')) {
    return { color: '#0284c7', bg: 'rgba(2, 132, 199, 0.14)', border: 'rgba(2, 132, 199, 0.28)' }; // Sky
  }
  if (lower.includes('mason')) {
    return { color: '#78716c', bg: 'rgba(120, 113, 108, 0.14)', border: 'rgba(120, 113, 108, 0.28)' }; // Stone
  }
  if (lower.includes('paint')) {
    return { color: '#9333ea', bg: 'rgba(147, 51, 234, 0.14)', border: 'rgba(147, 51, 234, 0.28)' }; // Purple
  }
  if (lower.includes('hvac')) {
    return { color: '#0d9488', bg: 'rgba(13, 148, 136, 0.14)', border: 'rgba(13, 148, 136, 0.28)' }; // Teal
  }

  // Deterministic Hash for arbitrary or user-created names
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}
