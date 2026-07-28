// 第一阶段的导航事实源；第二阶段再改为从内容集合自动生成。
const boards = [
  { id: 'ai', name: 'AI产业', icon: '🤖', desc: 'AI 产业链上下游事实与判断', subtitle: '模型 · 工具 · 工作流 · Agent 与产业判断', accent: '#7048e8' },
  { id: 'biology', name: '动植物', icon: '🌿', desc: '动物与植物的基础科普与宠物养护', subtitle: '植物科普 · 动物知识 · 宠物养护', accent: '#0b7285' },
  { id: 'history', name: '社会人文', icon: '🏛️', desc: '历史、社会与政治的常识脉络', subtitle: '历史 · 社会 · 政治', accent: '#9c36b5' },
  { id: 'auto', name: '数码出行', icon: '🚗', desc: '汽车 / 手机 / 智能驾驶 / 使用技巧产业科普', subtitle: '汽车 · 智能驾驶 · 手机使用与产业', accent: '#0ca678' },
  { id: 'life', name: '生活美食', icon: '🍚', desc: '过日子用得上的生活常识与煮饭做菜心得', subtitle: '厨房常识 · 清洁 · 急救 · 菜谱 · 探店', accent: '#f08c00' },
  { id: 'hotel', name: '服务业', icon: '🧳', desc: '酒店 / 餐饮连锁 / 物流 / 零售等服务业科普', subtitle: '酒店 · 餐饮连锁 · 物流 · 零售', accent: '#ae3ec9' },
  { id: 'finance', name: '金融经济', icon: '💰', desc: '理财与宏观经济的常识梳理', subtitle: '理财常识 · 宏观经济脉络', accent: '#2f9e44' },
];

export default boards;
