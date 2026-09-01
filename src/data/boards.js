// 第一阶段的导航事实源；第二阶段再改为从内容集合自动生成。
const boards = [
  { id: 'ai', name: 'AI产业', icon: '🤖', desc: '模型、工具、工作流、Agent 与 AI 产业判断', subtitle: '模型 · 工具 · 工作流 · Agent 与产业判断', accent: '#7048e8' },
  { id: 'biology', name: '动植物', icon: '🌿', desc: '宠物养护、动物知识与植物科普', subtitle: '宠物 · 动物 · 植物', accent: '#0b7285' },
  { id: 'humanities', name: '社会人文', icon: '🏛️', desc: '城市、国家、人与社会、宗教与制度的多维观察', subtitle: '城市 · 国家文明 · 人与社会 · 宗教 · 制度 · 历史社会', accent: '#9c36b5' },
  { id: 'auto', name: '数码出行', icon: '🚗', desc: '汽车（含智能驾驶）与手机使用的产业与使用科普', subtitle: '汽车 · 手机使用', accent: '#0ca678' },
  { id: 'life', name: '生活美食', icon: '🍚', desc: '健康、厨房、外食、居家、校园与日常速查的生活常识', subtitle: '健康 · 厨房 · 外食 · 居家 · 校园 · 速查', accent: '#f08c00' },
  { id: 'hotel', name: '服务业', icon: '🧳', desc: '酒店、餐饮连锁、物流、零售等服务业科普', subtitle: '酒店 · 餐饮连锁 · 物流 · 零售', accent: '#ae3ec9' },
  { id: 'finance', name: '金融经济', icon: '💰', desc: '个人财务、投资理财与宏观经济常识', subtitle: '个人财务 · 投资 · 宏观经济', accent: '#2f9e44' },
];

export default boards;
