import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

const noteSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  description: z.string().default(''),
  slug: z.string(),
  topic: z.string().optional(),
  format: z.enum(['note', 'article']).default('note'),
  visible: z.boolean().default(true),
});

const lifeSubcategories = {
  '健康与身体': ['体态与运动', '健康习惯', '急救常识', '人际心理'],
  '饮食与厨房': ['厨房常识', '家常菜谱', '饮品调制', '食材选购'],
  '美食探店': ['城市探店', '全国合集', '美食评论', '网红探店'],
  '居家实用': ['清洁妙招', '家居安全', '网络通讯', '家具选购'],
  '学习': ['学习计划'],
  '素材': ['速查对照', '省钱速查'],
} as const;

const lifeCategories = Object.keys(lifeSubcategories) as [
  keyof typeof lifeSubcategories,
  ...(keyof typeof lifeSubcategories)[]
];
const lifeSubcategoryValues = Object.values(lifeSubcategories).flat() as [string, ...string[]];

const lifeSchema = noteSchema.extend({
  category: z.enum(lifeCategories),
  subcategory: z.enum(lifeSubcategoryValues),
}).superRefine((data, ctx) => {
  const allowed = lifeSubcategories[data.category] as readonly string[];
  if (!allowed.includes(data.subcategory as never)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['subcategory'],
      message: `二级分类"${data.subcategory}"不属于一级分类"${data.category}"的合法二级`,
    });
  }
});

const lifeCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/life' }),
  schema: lifeSchema,
});

const hotelSubcategories = {
  '酒店': ['品牌分析', '入住体验', '会员体系', '产业观察'],
  '餐饮连锁': ['品牌分析', '经营模式', '食品安全', '产业观察'],
  '物流': ['快递服务', '大件物流', '跨境转运', '产业观察'],
  '零售': ['线下零售', '电商平台', '新零售模式', '产业观察'],
} as const;

const hotelCategories = Object.keys(hotelSubcategories) as [
  keyof typeof hotelSubcategories,
  ...(keyof typeof hotelSubcategories)[]
];
const hotelSubcategoryValues = Object.values(hotelSubcategories).flat() as [string, ...string[]];

const hotelSchema = noteSchema.extend({
  category: z.enum(hotelCategories),
  subcategory: z.enum(hotelSubcategoryValues),
}).superRefine((data, ctx) => {
  const allowed = hotelSubcategories[data.category] as readonly string[];
  if (!allowed.includes(data.subcategory as never)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['subcategory'],
      message: `二级分类"${data.subcategory}"不属于一级分类"${data.category}"的合法二级`,
    });
  }
});

const hotelCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/hotel' }),
  schema: hotelSchema,
});

const aiSubcategories = {
  '模型': ['基础概念', '能力评估', '模型选型', '行业进展'],
  '工具': ['编程助手', '框架与协议', '调试排错', '效能研究'],
  '工作流': ['自动化平台', '流程设计', '集成方案', '最佳实践'],
  'Agent': ['架构设计', '工具调用', '记忆与状态', '评测方法'],
  '产业判断': ['算力与硬件', '商业模式', '投资与并购', '市场格局'],
} as const;

const aiCategories = Object.keys(aiSubcategories) as [
  keyof typeof aiSubcategories,
  ...(keyof typeof aiSubcategories)[]
];
const aiSubcategoryValues = Object.values(aiSubcategories).flat() as [string, ...string[]];

const aiSchema = noteSchema.extend({
  category: z.enum(aiCategories),
  subcategory: z.enum(aiSubcategoryValues),
}).superRefine((data, ctx) => {
  const allowed = aiSubcategories[data.category] as readonly string[];
  if (!allowed.includes(data.subcategory as never)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['subcategory'],
      message: `二级分类"${data.subcategory}"不属于一级分类"${data.category}"的合法二级`,
    });
  }
});

const aiCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/ai' }),
  schema: aiSchema,
});

const autoSubcategories = {
  '汽车': ['产业观察', '车型选购', '用车常识', '智能驾驶'],
  '手机': ['系统设置', '应用技巧', '故障排查', '产业观察'],
} as const;

const autoCategories = Object.keys(autoSubcategories) as [
  keyof typeof autoSubcategories,
  ...(keyof typeof autoSubcategories)[]
];
const autoSubcategoryValues = Object.values(autoSubcategories).flat() as [string, ...string[]];

const autoSchema = noteSchema.extend({
  category: z.enum(autoCategories),
  subcategory: z.enum(autoSubcategoryValues),
}).superRefine((data, ctx) => {
  const allowed = autoSubcategories[data.category] as readonly string[];
  if (!allowed.includes(data.subcategory as never)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['subcategory'],
      message: `二级分类"${data.subcategory}"不属于一级分类"${data.category}"的合法二级`,
    });
  }
});

const autoCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/auto' }),
  schema: autoSchema,
});

const biologySubcategories = {
  '宠物养护': ['行为问题', '健康医疗', '选购指南', '日常观察'],
  '动物知识': ['基础概念', '行为生态', '物种科普', '保护保育'],
  '植物科普': ['基础概念', '物种科普', '园艺养护', '入侵与生态'],
} as const;

const biologyCategories = Object.keys(biologySubcategories) as [
  keyof typeof biologySubcategories,
  ...(keyof typeof biologySubcategories)[]
];
const biologySubcategoryValues = Object.values(biologySubcategories).flat() as [string, ...string[]];

const biologySchema = noteSchema.extend({
  category: z.enum(biologyCategories),
  subcategory: z.enum(biologySubcategoryValues),
}).superRefine((data, ctx) => {
  const allowed = biologySubcategories[data.category] as readonly string[];
  if (!allowed.includes(data.subcategory as never)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['subcategory'],
      message: `二级分类"${data.subcategory}"不属于一级分类"${data.category}"的合法二级`,
    });
  }
});

const biologyCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/biology' }),
  schema: biologySchema,
});

const financeSubcategories = {
  '个人财务': ['资金安全', '预算管理', '消费决策', '信用借贷'],
  '投资理财': ['基础概念', '投资工具', '风险管理', '资产配置'],
  '宏观经济': ['基础概念', '经济现象', '政策制度', '经济史'],
} as const;

const financeCategories = Object.keys(financeSubcategories) as [
  keyof typeof financeSubcategories,
  ...(keyof typeof financeSubcategories)[]
];
const financeSubcategoryValues = Object.values(financeSubcategories).flat() as [string, ...string[]];

const financeSchema = noteSchema.extend({
  category: z.enum(financeCategories),
  subcategory: z.enum(financeSubcategoryValues),
}).superRefine((data, ctx) => {
  const allowed = financeSubcategories[data.category] as readonly string[];
  if (!allowed.includes(data.subcategory as never)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['subcategory'],
      message: `二级分类"${data.subcategory}"不属于一级分类"${data.category}"的合法二级`,
    });
  }
});

const financeCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/finance' }),
  schema: financeSchema,
});

const humanitiesSubcategories = {
  '城市观察': ['观察方法', '单一城市', '城市对比', '城市专题'],
  '国家与文明': ['国别研究', '跨国对比', '文明圈', '国际关系'],
  '宗教与信仰': ['世界宗教', '民间信仰', '宗教思想', '信仰与社会'],
  '制度与政治': ['政治体制', '经济制度', '法律体系', '政策演化'],
  '历史与社会': ['历史事件', '社会变迁', '文化现象', '时代精神'],
  '人与社会': ['心理与认知', '人际关系', '人口与族群', '人生阶段'],
} as const;

const humanitiesCategories = Object.keys(humanitiesSubcategories) as [
  keyof typeof humanitiesSubcategories,
  ...(keyof typeof humanitiesSubcategories)[]
];
const humanitiesSubcategoryValues = Object.values(humanitiesSubcategories).flat() as [string, ...string[]];

const humanitiesSchema = noteSchema.extend({
  category: z.enum(humanitiesCategories),
  subcategory: z.enum(humanitiesSubcategoryValues),
}).superRefine((data, ctx) => {
  const allowed = humanitiesSubcategories[data.category] as readonly string[];
  if (!allowed.includes(data.subcategory as never)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['subcategory'],
      message: `二级分类"${data.subcategory}"不属于一级分类"${data.category}"的合法二级`,
    });
  }
});

const humanitiesCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/humanities' }),
  schema: humanitiesSchema,
});

export const collections = {
  life: lifeCollection,
  hotel: hotelCollection,
  ai: aiCollection,
  auto: autoCollection,
  biology: biologyCollection,
  finance: financeCollection,
  humanities: humanitiesCollection,
};
