// 常识笔记瀑布流封面（cover）
// 全部由 HTML + CSS 生成，不依赖任何图片资源，也不需要在 frontmatter 里加字段。

// 五套主配色 + 一套兜底墨色：低饱和浅底 + 深灰文字 + 一块亮色
const THEMES = {
  purple: { bg: '#ECE6F7', ink: '#3A3448', accent: '#F7C948', quote: 'rgba(122, 96, 178, .20)' },
  yellow: { bg: '#FBEED0', ink: '#4A3B22', accent: '#FF9A3C', quote: 'rgba(197, 149, 53, .22)' },
  blue: { bg: '#E1ECF7', ink: '#2C3E50', accent: '#4A90D9', quote: 'rgba(74, 144, 217, .20)' },
  green: { bg: '#E4F1E4', ink: '#2F4032', accent: '#3FA96B', quote: 'rgba(63, 169, 107, .20)' },
  red: { bg: '#FBE4E0', ink: '#4A2F2A', accent: '#E4572E', quote: 'rgba(228, 87, 46, .18)' },
  gray: { bg: '#EFECE7', ink: '#3A3A3A', accent: '#C2410C', quote: 'rgba(120, 113, 108, .20)' },
};

// 一级分类 → 配色。新增一级分类时来补一行；
// 漏掉的分类会走标题 hash 兜底，同一分类仍然固定同色。
const CATEGORY_THEMES = {
  // 生活与美食
  出行: 'yellow',
  居家: 'green',
  校园: 'blue',
  财务: 'purple',
  // 服务业
  酒店: 'yellow',
  宏观经济: 'blue',
  '信息与AI产业': 'purple',
  // 人文与自然
  空间与城市: 'red',
  人与社会: 'yellow',
  文化与语言: 'purple',
  自然与生态: 'green',
  // 工业
  采矿: 'red',
  制造: 'blue',
  电力燃气水: 'gray',
  建筑: 'red',
  // 随笔
  随想: 'green',
  草稿箱: 'gray',
};

const THEME_KEYS = Object.keys(THEMES);

// 封面比例：以 3:4 为主，穿插方形与 4:5，制造瀑布流错落感
const COVER_RATIOS = ['3 / 4', '3 / 4', '1 / 1', '3 / 4', '4 / 5', '3 / 4'];

// FNV-1a：同一输入永远得到同一结果，保证每次构建后封面稳定不变
export function stableHash(value) {
  let hash = 2166136261;
  for (const char of String(value ?? '')) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function coverTheme(category) {
  const key = CATEGORY_THEMES[category] || THEME_KEYS[stableHash(category) % THEME_KEYS.length];
  return THEMES[key];
}

export function coverRatio(seed) {
  return COVER_RATIOS[stableHash(seed) % COVER_RATIOS.length];
}

// 标题命名规范是 `{二级分类}：{正文}`，正好拆成封面上的一小一大两行
export function coverTitleParts(title, subcategory) {
  const raw = String(title || '').trim();
  const separator = raw.indexOf('：');
  if (separator > 0 && separator < raw.length - 1) {
    return { lead: raw.slice(0, separator), main: raw.slice(separator + 1) };
  }
  return { lead: String(subcategory || '').trim(), main: raw };
}
