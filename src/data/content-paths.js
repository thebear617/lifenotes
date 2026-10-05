import boardCategories from './board-categories.js';

const contentPathSegments = {
  life: {
    '出行': { directory: 'travel', subcategories: { '探店': 'eats', '社交': 'social', '省钱': 'saving' } },
    '居家': { directory: 'home', subcategories: { '厨房': 'kitchen', '安全与清洁': 'household', '健康': 'health', '日常速查': 'cheatsheet' } },
    '校园': { directory: 'campus', subcategories: { '学校政策': 'guide', '学习计划': 'study', '升学就业': 'career' } },
    '财务': { directory: 'finance', subcategories: { '个人财务': 'budget' } },
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

/* ---------- 分类配置一致性校验 ---------- */
// 分类信息分散在两个文件里：
//   · board-categories.js —— 一级/二级枚举，供 content.config.ts 的 schema 与 CMS 分类下拉使用
//   · content-paths.js（本文件）—— 「分类 → 目录名」映射，供 CMS 生成与校验文件路径
// 两者必须一一对应。只改前者时，CMS 会算不出文件路径（表现为路径框空白、
// 保存时报「文件路径无法从领域、分类、子分类和标题生成」），排查起来很绕。
// 这里在模块加载时就断言，任何一边多、少或拼写不一致都立刻抛错。
function taxonomyFromCategories(categories) {
  const map = new Map();
  for (const [board, categoryMap] of Object.entries(categories)) {
    const boardMap = new Map();
    for (const [category, subcategories] of Object.entries(categoryMap)) {
      boardMap.set(category, new Set(subcategories));
    }
    map.set(board, boardMap);
  }
  return map;
}

const declaredTaxonomy = taxonomyFromCategories(boardCategories);
const mappedTaxonomy = taxonomyFromCategories(
  Object.fromEntries(
    Object.entries(contentPathSegments).map(([board, categoryMap]) => [
      board,
      Object.fromEntries(
        Object.entries(categoryMap).map(([category, config]) => [category, Object.keys(config.subcategories || {})]),
      ),
    ]),
  ),
);

const taxonomyProblems = [];
for (const board of new Set([...declaredTaxonomy.keys(), ...mappedTaxonomy.keys()])) {
  const declared = declaredTaxonomy.get(board);
  const mapped = mappedTaxonomy.get(board);
  if (!declared) {
    taxonomyProblems.push(`${board}：content-paths.js 有，board-categories.js 没有`);
    continue;
  }
  if (!mapped) {
    taxonomyProblems.push(`${board}：board-categories.js 有，content-paths.js 没有`);
    continue;
  }

  for (const category of new Set([...declared.keys(), ...mapped.keys()])) {
    const declaredSubs = declared.get(category);
    const mappedSubs = mapped.get(category);
    if (!declaredSubs) {
      taxonomyProblems.push(`${board} / ${category}：content-paths.js 有，board-categories.js 没有`);
      continue;
    }
    if (!mappedSubs) {
      taxonomyProblems.push(`${board} / ${category}：board-categories.js 有，content-paths.js 没有（缺目录映射）`);
      continue;
    }

    for (const sub of new Set([...declaredSubs, ...mappedSubs])) {
      if (!declaredSubs.has(sub)) {
        taxonomyProblems.push(`${board} / ${category} / ${sub}：content-paths.js 有，board-categories.js 没有`);
      } else if (!mappedSubs.has(sub)) {
        taxonomyProblems.push(`${board} / ${category} / ${sub}：board-categories.js 有，content-paths.js 没有（缺目录映射）`);
      }
    }
  }
}

if (taxonomyProblems.length) {
  throw new Error(
    `分类配置未同步（board-categories.js ↔ content-paths.js），共 ${taxonomyProblems.length} 处：\n`
    + taxonomyProblems.map((item) => `  · ${item}`).join('\n')
    + '\n修复：给 content-paths.js 补上对应的 directory / subcategories 映射（或反之），改完重启 dev server。',
  );
}

export default contentPathSegments;
