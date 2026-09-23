/**
 * Helper utilities for robust, timezone-safe date formatting and conversion
 * Specifically avoiding day-shift issues in Colombian and Western timezones.
 */

/**
 * Returns a friendly, formal Spanish string for a date (e.g., "Sábado, 26 de Septiembre de 2026")
 */
export function formatFriendlySpanishDate(dateStr?: string): string {
  if (!dateStr) return '';
  const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.trim();
  const parts = clean.split('-').map(Number);
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return dateStr;
  }
  const [year, month, day] = parts;
  // Use noon UTC to prevent any daylight saving or timezone boundary shift
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  if (isNaN(d.getTime())) return dateStr;

  const dayName = d.toLocaleDateString('es-ES', { weekday: 'long', timeZone: 'UTC' });
  const monthName = d.toLocaleDateString('es-ES', { month: 'long', timeZone: 'UTC' });
  const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  return `${capitalizedDay}, ${day} de ${capitalizedMonth} de ${year}`;
}

/**
 * Safely extracts "YYYY-MM-DD" from any date string, timestamp, or ISO string.
 */
export function getDateOnlyString(dateVal?: string | number | Date | null): string {
  if (!dateVal) return '';
  if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();
    if (trimmed.includes('T')) {
      return trimmed.split('T')[0];
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    // Attempt parsing
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return '';
  }
  if (typeof dateVal === 'number' || dateVal instanceof Date) {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  }
  return '';
}

/**
 * Builds a timezone-safe ISO string with Colombian standard offset (-05:00).
 * Matches RBC standard seed and prevents day shifts when rendered across any client.
 */
export function buildSafeEventDateIso(dateOnlyStr: string, timeStr?: string): string {
  if (!dateOnlyStr) return '';
  const cleanDate = getDateOnlyString(dateOnlyStr);
  if (!cleanDate) return '';

  let hours = 19;
  let minutes = 0;
  if (timeStr) {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const ampm = match[3]?.toUpperCase();
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        hours = h;
        minutes = m;
      }
    }
  }
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  return `${cleanDate}T${hh}:${mm}:00.000-05:00`;
}
