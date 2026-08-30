const contentPathSegments = {
  life: {
    '健康与身体': { directory: 'health-and-body', subcategories: { '体态与运动': 'posture-and-exercise', '健康习惯': 'health-habits', '急救常识': 'first-aid', '人际心理': 'interpersonal-psychology' } },
    '饮食与厨房': { directory: 'food-and-kitchen', subcategories: { '厨房常识': 'kitchen-basics', '家常菜谱': 'home-cooking', '饮品调制': 'drinks', '食材选购': 'ingredient-shopping' } },
    '美食探店': { directory: 'food-discovery', subcategories: { '城市探店': 'city-guides', '全国合集': 'nationwide-collection', '美食评论': 'restaurant-reviews', '网红探店': 'viral-food-spots' } },
    '居家实用': { directory: 'home', subcategories: { '清洁妙招': 'cleaning-tips', '家居安全': 'home-safety', '网络通讯': 'internet-communications', '家具选购': 'furniture-shopping' } },
    '学习': { directory: 'learning', subcategories: { '学习计划': 'study-plan' } },
    '素材': { directory: 'materials', subcategories: { '速查对照': 'quick-reference', '省钱速查': 'saving-tips' } },
  },
  hotel: {
    '酒店': { directory: 'hotels', subcategories: { '品牌分析': 'brand-analysis', '入住体验': 'stay-experience', '会员体系': 'membership-programs', '产业观察': 'industry-observation' } },
    '餐饮连锁': { directory: 'restaurant-chains', subcategories: { '品牌分析': 'brand-analysis', '经营模式': 'business-models', '食品安全': 'food-safety', '产业观察': 'industry-observation' } },
    '物流': { directory: 'logistics', subcategories: { '快递服务': 'courier-services', '大件物流': 'bulky-logistics', '跨境转运': 'cross-border-forwarding', '产业观察': 'industry-observation' } },
    '零售': { directory: 'retail', subcategories: { '线下零售': 'offline-retail', '电商平台': 'e-commerce-platforms', '新零售模式': 'new-retail-models', '产业观察': 'industry-observation' } },
  },
  ai: {
    '模型': { directory: 'models', subcategories: { '基础概念': 'fundamentals', '能力评估': 'capability-evaluation', '模型选型': 'model-selection', '行业进展': 'industry-progress' } },
    '工具': { directory: 'tools', subcategories: { '编程助手': 'coding-assistants', '框架与协议': 'frameworks-and-protocols', '调试排错': 'debugging', '效能研究': 'efficiency-research' } },
    '工作流': { directory: 'workflows', subcategories: { '自动化平台': 'automation-platforms', '流程设计': 'process-design', '集成方案': 'integration-solutions', '最佳实践': 'best-practices' } },
    'Agent': { directory: 'Agent', subcategories: { '架构设计': 'architecture-design', '工具调用': 'tool-calling', '记忆与状态': 'memory-and-state', '评测方法': 'evaluation-methods' } },
    '产业判断': { directory: 'industry-judgment', subcategories: { '算力与硬件': 'compute-and-hardware', '商业模式': 'business-models', '投资与并购': 'investment-and-ma', '市场格局': 'market-landscape' } },
  },
  auto: {
    '汽车': { directory: 'cars', subcategories: { '产业观察': 'industry-observation', '车型选购': 'model-selection', '用车常识': 'car-usage', '智能驾驶': 'autonomous-driving' } },
    '手机': { directory: 'phones', subcategories: { '系统设置': 'system-settings', '应用技巧': 'app-tips', '故障排查': 'troubleshooting', '产业观察': 'industry-observation' } },
  },
  biology: {
    '宠物养护': { directory: 'pet-care', subcategories: { '行为问题': 'behavior-issues', '健康医疗': 'health-medical', '选购指南': 'buying-guide', '日常观察': 'daily-observation' } },
    '动物知识': { directory: 'animals', subcategories: { '基础概念': 'fundamentals', '行为生态': 'behavior-and-ecology', '物种科普': 'species-science', '保护保育': 'conservation' } },
    '植物科普': { directory: 'plants', subcategories: { '基础概念': 'fundamentals', '物种科普': 'species-science', '园艺养护': 'gardening', '入侵与生态': 'invasion-and-ecology' } },
  },
  finance: {
    '个人财务': { directory: 'personal-finance', subcategories: { '资金安全': 'financial-safety', '预算管理': 'budget-management', '消费决策': 'spending-decisions', '信用借贷': 'credit-and-lending' } },
    '投资理财': { directory: 'investment', subcategories: { '基础概念': 'fundamentals', '投资工具': 'investment-tools', '风险管理': 'risk-management', '资产配置': 'asset-allocation' } },
    '宏观经济': { directory: 'macroeconomics', subcategories: { '基础概念': 'fundamentals', '经济现象': 'economic-phenomena', '政策制度': 'policy-and-institutions', '经济史': 'economic-history' } },
  },
  humanities: {
    '城市观察': { directory: 'city-observation', subcategories: { '观察方法': 'observation-methods', '单一城市': 'single-city', '城市对比': 'city-comparisons', '城市专题': 'city-topics' } },
    '国家与文明': { directory: 'country-and-civilization', subcategories: { '国别研究': 'country-studies', '跨国对比': 'cross-country-comparisons', '文明圈': 'civilization-spheres', '国际关系': 'international-relations' } },
    '宗教与信仰': { directory: 'religion-and-belief', subcategories: { '世界宗教': 'world-religions', '民间信仰': 'folk-beliefs', '宗教思想': 'religious-thought', '信仰与社会': 'belief-and-society' } },
    '制度与政治': { directory: 'institutions-and-politics', subcategories: { '政治体制': 'political-systems', '经济制度': 'economic-systems', '法律体系': 'legal-systems', '政策演化': 'policy-evolution' } },
    '历史与社会': { directory: 'history-and-society', subcategories: { '历史事件': 'historical-events', '社会变迁': 'social-change', '文化现象': 'cultural-phenomena', '时代精神': 'zeitgeist' } },
    '人与社会': { directory: 'people-and-society', subcategories: { '心理与认知': 'psychology-and-cognition', '人际关系': 'interpersonal-relationships', '人口与族群': 'population-and-ethnicity', '人生阶段': 'life-stages' } },
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
