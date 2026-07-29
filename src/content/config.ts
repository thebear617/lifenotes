import { defineCollection, z } from 'astro:content';

const noteSchema = z.object({
  title: z.string(),
  date: z.coerce.date().nullable().default(null),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  description: z.string().default(''),
  slug: z.string().optional(),
  topic: z.string().optional(),
  format: z.enum(['note', 'article']).default('note'),
  visible: z.boolean().default(true),
});

const lifeCollection = defineCollection({
  type: 'content',
  schema: noteSchema,
});

const hotelCollection = defineCollection({
  type: 'content',
  schema: noteSchema,
});

const aiCollection = defineCollection({ type: 'content', schema: noteSchema });
const autoCollection = defineCollection({ type: 'content', schema: noteSchema });
const biologyCollection = defineCollection({ type: 'content', schema: noteSchema });
const financeCollection = defineCollection({ type: 'content', schema: noteSchema });
const historyCollection = defineCollection({ type: 'content', schema: noteSchema });

export const collections = {
  life: lifeCollection,
  hotel: hotelCollection,
  ai: aiCollection,
  auto: autoCollection,
  biology: biologyCollection,
  finance: financeCollection,
  history: historyCollection,
};
