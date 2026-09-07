const contentPathSegments = {
  life: {
    '美食': { directory: 'food', subcategories: { '厨房常识': 'kitchen', '家常菜谱': 'recipes', '探店清单': 'eats' } },
    '校园与学习': { directory: 'campus', subcategories: { '校园指南': 'guide', '学习计划': 'study' } },
    '财务': { directory: 'finance', subcategories: { '预算管理': 'budget', '省钱速查': 'saving' } },
    '居家与健康': { directory: 'home', subcategories: { '健康': 'health', '居家': 'household' } },
    '生活速查': { directory: 'reference', subcategories: { '速查对照': 'cheatsheet' } },
  },
  service: {
    '酒店': { directory: 'hotels', subcategories: { '品牌分析': 'brand-analysis' } },
    '宏观经济': { directory: 'macroeconomics', subcategories: { '经济现象': 'economic-phenomena' } },
    '信息与AI产业': { directory: 'info-ai', subcategories: { 'AI 产业': 'ai-industry' } },
  },
  industry: {
    '采矿': { directory: 'mining', subcategories: {} },
    '制造': { directory: 'manufacturing', subcategories: { '汽车': 'cars', '数码产品': 'phones' } },
    '电力燃气水': { directory: 'utilities', subcategories: {} },
    '建筑': { directory: 'construction', subcategories: {} },
  },
  humanities: {
    '空间与城市': { directory: 'city-observation', subcategories: { '城市': 'observation-methods' } },
    '人与社会': { directory: 'people-and-society', subcategories: { '人生': 'life-stages' } },
    '文化与语言': { directory: 'language-and-writing', subcategories: { '文字': 'classical-accumulation' } },
    '自然与生态': { directory: 'nature-and-ecology', subcategories: { '植物': 'invasion-and-ecology' } },
  },
  notes: {
    '随想': { directory: 'reflections', subcategories: { '建站规则': 'site-rules' } },
    '草稿箱': { directory: 'drafts', subcategories: { '未整理': 'unsorted' } },
  },
};

export function articleFilenameFromTitle(value) {
  const normalized = String(value || '')
    .trim()
    .replaceAll('\0', '')
    .replaceAll('/', '／')
    .replaceAll('\\', '＼')
    .replace(/\.md$/i, '')
    .trim();
  return normalized && normalized !== '.' && normalized !== '..' ? `${normalized}.md` : null;
}

export function contentDirectoryFor(board, category, subcategory) {
  const categoryConfig = contentPathSegments[board]?.[category];
  const subcategoryDirectory = categoryConfig?.subcategories?.[subcategory];
  if (!categoryConfig || !subcategoryDirectory) return null;
  return `${board}/${categoryConfig.directory}/${subcategoryDirectory}`;
}

export function canonicalArticlePath(board, category, subcategory, title) {
  const directory = contentDirectoryFor(board, category, subcategory);
  if (!directory) return null;
  const normalizedFilename = articleFilenameFromTitle(title);
  if (!normalizedFilename) return null;
  return `${directory}/${normalizedFilename}`;
}

export default contentPathSegments;
