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
  slug: z.string().optional(),
  topic: z.string().optional(),
  format: z.enum(['note', 'article']).default('note'),
  visible: z.boolean().default(true),
});

const lifeCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/life' }),
  schema: noteSchema,
});

const hotelCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/hotel' }),
  schema: noteSchema,
});

const aiCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/ai' }),
  schema: noteSchema,
});

const autoCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/auto' }),
  schema: noteSchema,
});

const biologyCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/biology' }),
  schema: noteSchema,
});

const financeCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/finance' }),
  schema: noteSchema,
});

const historyCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/history' }),
  schema: noteSchema,
});

export const collections = {
  life: lifeCollection,
  hotel: hotelCollection,
  ai: aiCollection,
  auto: autoCollection,
  biology: biologyCollection,
  finance: financeCollection,
  history: historyCollection,
};
