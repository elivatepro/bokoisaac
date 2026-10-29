import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { DATA_SOURCES, notionLoader } from './lib/notion';

// Field names on the left match the Notion property names exactly; each schema renames them to camelCase.
const text = z.string().nullish().transform((v) => v ?? '');
const list = z.array(z.string()).nullish().transform((v) => v ?? []);
const num = z.number().nullish();
const flag = z.boolean().nullish().transform(Boolean);
const date = z.string().nullish().transform((v) => (v ? new Date(v) : null));

const blog = defineCollection({
  loader: notionLoader(DATA_SOURCES.blog),
  schema: z
    .object({
      id: z.string(),
      Title: text,
      Slug: text,
      Status: z.string().nullish(),
      Published: date,
      Excerpt: text,
      Tags: list,
      Cover: list,
      'Reading time': num,
      Featured: flag,
      'SEO description': text,
      Updated: z.string(),
    })
    .transform((d) => ({
      id: d.id,
      title: d.Title,
      slug: d.Slug,
      status: d.Status ?? 'Draft',
      published: d.Published,
      excerpt: d.Excerpt,
      tags: d.Tags,
      cover: d.Cover[0] ?? null,
      readingTime: d['Reading time'] ?? null,
      featured: d.Featured,
      seoDescription: d['SEO description'] || d.Excerpt,
      updated: new Date(d.Updated),
    })),
});

const lab = defineCollection({
  loader: notionLoader(DATA_SOURCES.lab),
  schema: z
    .object({
      id: z.string(),
      Name: text,
      Slug: text,
      Status: z.string().nullish(),
      Date: date,
      Summary: text,
      Type: z.string().nullish(),
      Stack: list,
      Cover: list,
      'Live URL': z.string().nullish(),
      'Repo URL': z.string().nullish(),
      Featured: flag,
      Order: num,
    })
    .transform((d) => ({
      id: d.id,
      name: d.Name,
      slug: d.Slug,
      status: d.Status ?? 'Draft',
      date: d.Date,
      summary: d.Summary,
      type: d.Type ?? null,
      stack: d.Stack,
      cover: d.Cover[0] ?? null,
      liveUrl: d['Live URL'] ?? null,
      repoUrl: d['Repo URL'] ?? null,
      featured: d.Featured,
      order: d.Order ?? 999,
    })),
});

const reviews = defineCollection({
  loader: notionLoader(DATA_SOURCES.reviews),
  schema: z
    .object({
      id: z.string(),
      Name: text,
      Role: text,
      Company: text,
      Quote: text,
      Rating: num,
      Photo: list,
      Service: z.string().nullish(),
      Date: date,
      Link: z.string().nullish(),
      Featured: flag,
      Published: flag,
      Order: num,
    })
    .transform((d) => ({
      id: d.id,
      name: d.Name,
      role: d.Role,
      company: d.Company,
      quote: d.Quote,
      rating: d.Rating ?? null,
      photo: d.Photo[0] ?? null,
      service: d.Service ?? null,
      date: d.Date,
      link: d.Link ?? null,
      featured: d.Featured,
      published: d.Published,
      order: d.Order ?? 999,
    })),
});

const faqs = defineCollection({
  loader: notionLoader(DATA_SOURCES.faqs),
  schema: z
    .object({ id: z.string(), Question: text, Answer: text, Category: z.string().nullish(), Order: num, Published: flag })
    .transform((d) => ({
      id: d.id,
      question: d.Question,
      answer: d.Answer,
      category: d.Category ?? null,
      order: d.Order ?? 999,
      published: d.Published,
    })),
});

const services = defineCollection({
  loader: notionLoader(DATA_SOURCES.services),
  schema: z
    .object({
      id: z.string(),
      Name: text,
      Slug: text,
      'Price from': num,
      'Price unit': z.enum(['project', 'month', 'hour']).nullish(),
      Summary: text,
      Timeline: text,
      Includes: text,
      Order: num,
      Published: flag,
    })
    .transform((d) => ({
      id: d.id,
      name: d.Name,
      slug: d.Slug,
      priceFrom: d['Price from'] ?? null,
      priceUnit: d['Price unit'] ?? 'project',
      summary: d.Summary,
      timeline: d.Timeline,
      includes: d.Includes.split('\n').map((s) => s.trim()).filter(Boolean),
      order: d.Order ?? 999,
      published: d.Published,
    })),
});

const now = defineCollection({
  loader: notionLoader(DATA_SOURCES.now),
  schema: z
    .object({ id: z.string(), Item: text, Section: z.string().nullish(), Detail: text, Link: z.string().nullish(), Updated: date, Order: num, Show: flag })
    .transform((d) => ({
      id: d.id,
      item: d.Item,
      section: d.Section ?? null,
      detail: d.Detail,
      link: d.Link ?? null,
      updated: d.Updated,
      order: d.Order ?? 999,
      show: d.Show,
    })),
});

const stack = defineCollection({
  loader: notionLoader(DATA_SOURCES.stack),
  schema: z
    .object({
      id: z.string(),
      Name: text,
      Page: list,
      Category: z.string().nullish(),
      Description: text,
      Link: z.string().nullish(),
      Logo: list,
      Order: num,
      Show: flag,
    })
    .transform((d) => ({
      id: d.id,
      name: d.Name,
      pages: d.Page,
      category: d.Category ?? null,
      description: d.Description,
      link: d.Link ?? null,
      logo: d.Logo[0] ?? null,
      order: d.Order ?? 999,
      show: d.Show,
    })),
});

const comments = defineCollection({
  loader: notionLoader(DATA_SOURCES.comments),
  schema: z
    .object({
      id: z.string(),
      Name: text,
      Comment: text,
      Email: z.string().nullish(),
      Post: list,
      Approved: flag,
      Reply: text,
      'Reply date': date,
      Received: z.string(),
    })
    .transform((d) => ({
      id: d.id,
      name: d.Name,
      comment: d.Comment,
      postId: d.Post[0] ?? null,
      approved: d.Approved,
      reply: d.Reply || null,
      replyDate: d['Reply date'],
      received: new Date(d.Received),
    })),
});

export const collections = { blog, lab, reviews, faqs, services, now, stack, comments };
