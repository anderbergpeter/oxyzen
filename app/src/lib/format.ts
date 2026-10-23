const months = [
  'jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
];
const weekdays = ['sön', 'mån', 'tis', 'ons', 'tors', 'fre', 'lör'];

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export function formatDateLong(iso: string): string {
  const d = new Date(iso);
  return `${weekdays[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatPressure(ata: number): string {
  return `${ata.toFixed(1).replace('.', ',')} ATA`;
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function relativeDay(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((startOf(now) - startOf(d)) / 86400000);
  if (diff === 0) return 'Idag';
  if (diff === 1) return 'Igår';
  if (diff < 7) return `${diff} dagar sedan`;
  return formatDate(iso);
}
