// 第一阶段的导航事实源；第二阶段再改为从内容集合自动生成。
const boards = [
  { id: 'humanities', name: '人文与自然', icon: '🌍', desc: '从空间、社会、文化到自然：观察与理解世界的视角', subtitle: '城市 · 社会 · 人文 · 自然', accent: '#9c36b5' },
  { id: 'industry', name: '工业', icon: '🏭', desc: '第二产业观察：采矿、制造、电力燃气水与建筑', subtitle: '采矿 · 制造 · 电力燃气水 · 建筑', accent: '#0ca678' },
  { id: 'life', name: '生活与美食', icon: '🍚', desc: '健康、厨房、外食、居家、校园、家庭财务与日常速查', subtitle: '健康 · 厨房 · 外食 · 居家 · 校园 · 家庭财务', accent: '#f08c00' },
  { id: 'service', name: '服务业', icon: '🧳', desc: '酒店住宿与宏观经济等服务产业观察', subtitle: '酒店 · 宏观经济', accent: '#ae3ec9' },
  { id: 'notes', name: '随笔', icon: '📓', desc: '随想与草稿箱：未整理想法与摘录的中转站', subtitle: '随想 · 草稿箱', accent: '#868e96' },
];

export default boards;
