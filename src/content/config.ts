import { defineCollection, z } from 'astro:content';

const noteSchema = z.object({
  title: z.string(),
  date: z.coerce.date().nullable().default(null),
  order: z.number(),
  category: z.string(),
  source: z.string().default(''),
  sourceUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
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

const phoneCollection = defineCollection({
  type: 'content',
  schema: noteSchema,
});

const aiCollection = defineCollection({ type: 'content', schema: noteSchema });
const autoCollection = defineCollection({ type: 'content', schema: noteSchema });
const biologyCollection = defineCollection({ type: 'content', schema: noteSchema });
const financeCollection = defineCollection({ type: 'content', schema: noteSchema });
const foodCollection = defineCollection({ type: 'content', schema: noteSchema });
const petCollection = defineCollection({ type: 'content', schema: noteSchema });

export const collections = {
  life: lifeCollection,
  hotel: hotelCollection,
  phone: phoneCollection,
  ai: aiCollection,
  auto: autoCollection,
  biology: biologyCollection,
  finance: financeCollection,
  food: foodCollection,
  pet: petCollection,
};
