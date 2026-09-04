export function categoryForEntry(entry) {
  return entry.data.category || '未分类';
}

function normalizeDateValue(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return String(value || '');
}

const DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/;

export function dateTimestamp(value) {
  const match = DATE_TIME_PATTERN.exec(normalizeDateValue(value).trim());
  if (!match) return 0;
  const [, year, month, day, hour = '00', minute = '00'] = match;
  const timestamp = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function formatDate(value) {
  const normalized = normalizeDateValue(value).trim();
  const match = DATE_TIME_PATTERN.exec(normalized);
  if (!match) return normalized ? normalized : '未标注日期';
  const [, year, month, day, hour, minute] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(date.getTime())) return normalized;
  const formatted = date.toLocaleDateString('zh-CN');
  return hour !== undefined ? `${formatted} ${hour}:${minute}` : formatted;
}

export function compareEntriesByDateDesc(a, b) {
  const dateA = dateTimestamp(a.data.updated || a.data.date);
  const dateB = dateTimestamp(b.data.updated || b.data.date);
  return dateB - dateA || a.data.title.localeCompare(b.data.title, 'zh-CN');
}
