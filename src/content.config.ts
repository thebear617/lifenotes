import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import boardCategories from './data/board-categories.js';

function normalizeDateValue(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return value;
}

const dateString = z.preprocess(normalizeDateValue, z.string());
const updatedAtString = z.preprocess(
  normalizeDateValue,
  z.string().regex(/^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2})?$/, 'updated 必须使用 YYYY-MM-DD 或 YYYY-MM-DD HH:mm'),
);

const commonNoteSchema = z.object({
  title: z.string(),
  date: dateString,
  updated: updatedAtString.optional(),
  category: z.string(),
  subcategory: z.string(),
  description: z.string().default(''),
  slug: z.string(),
});

type CategoryMap = Record<string, readonly string[]>;

function createBoardSchema(categories: CategoryMap) {
  const categoryValues = Object.keys(categories) as [string, ...string[]];
  const subcategoryValues = Object.values(categories).flat() as [string, ...string[]];

  return commonNoteSchema.extend({
    category: z.enum(categoryValues),
    subcategory: z.enum(subcategoryValues),
  }).superRefine((data, ctx) => {
    const allowed = categories[data.category] || [];
    if (!allowed.includes(data.subcategory)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['subcategory'],
        message: `二级分类"${data.subcategory}"不属于一级分类"${data.category}"的合法二级`,
      });
    }
  }).transform((data) => ({
    ...data,
    updated: data.updated || data.date,
  }));
}

function createBoardCollection(base: string, categories: CategoryMap) {
  return defineCollection({
    loader: glob({ pattern: '**/*.md', base }),
    schema: createBoardSchema(categories),
  });
}

export const collections = {
  life: createBoardCollection('./src/content/life', boardCategories.life),
  hotel: createBoardCollection('./src/content/hotel', boardCategories.hotel),
  ai: createBoardCollection('./src/content/ai', boardCategories.ai),
  auto: createBoardCollection('./src/content/auto', boardCategories.auto),
  biology: createBoardCollection('./src/content/biology', boardCategories.biology),
  finance: createBoardCollection('./src/content/finance', boardCategories.finance),
  humanities: createBoardCollection('./src/content/humanities', boardCategories.humanities),
};
