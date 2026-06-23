export function getMondayOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return toDateStr(d);
}

export function addWeeks(weekStart: string, n: number): string {
  const [y, m, day] = weekStart.split('-').map(Number);
  const d = new Date(y, m - 1, day);
  d.setDate(d.getDate() + n * 7);
  return toDateStr(d);
}

export function toDateStr(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatWeekLabel(weekStart: string): string {
  const start = new Date(weekStart + 'T00:00:00');
  const end = new Date(weekStart + 'T00:00:00');
  end.setDate(end.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
}

export function getWeekStartsInMonth(year: number, month: number): string[] {
  const result: string[] = [];
  const d = new Date(year, month - 1, 1);
  while (d.getMonth() === month - 1) {
    const monday = getMondayOfWeek(d);
    if (!result.includes(monday)) result.push(monday);
    d.setDate(d.getDate() + 7);
  }
  return result;
}
