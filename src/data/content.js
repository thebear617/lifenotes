export function categoryForEntry(entry) {
  return entry.data.topic || entry.data.category || '未分类';
}

export function compareEntriesByDateDesc(a, b) {
  const dateA = a.data.date?.getTime() ?? Number.NEGATIVE_INFINITY;
  const dateB = b.data.date?.getTime() ?? Number.NEGATIVE_INFINITY;
  return dateB - dateA || a.data.title.localeCompare(b.data.title, 'zh-CN');
}
