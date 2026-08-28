export function categoryForEntry(entry) {
  return entry.data.category || '未分类';
}

function normalizeDateValue(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return String(value || '');
}

export function dateTimestamp(value) {
  const normalized = normalizeDateValue(value);
  if (!normalized) return 0;
  const timestamp = Date.parse(`${normalized}T00:00:00`);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function formatDate(value) {
  const normalized = normalizeDateValue(value);
  if (!normalized) return '未标注日期';
  const date = new Date(`${normalized}T00:00:00`);
  return Number.isNaN(date.getTime()) ? normalized : date.toLocaleDateString('zh-CN');
}

export function compareEntriesByDateDesc(a, b) {
  const dateA = dateTimestamp(a.data.updated || a.data.date);
  const dateB = dateTimestamp(b.data.updated || b.data.date);
  return dateB - dateA || a.data.title.localeCompare(b.data.title, 'zh-CN');
}
