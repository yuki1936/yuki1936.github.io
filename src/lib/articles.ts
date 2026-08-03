import type { CollectionEntry } from "astro:content";

export type Article = CollectionEntry<"articles">;

export const categoryMeta = {
  life: {
    label: "日常",
    description: "生活片段、回忆与一些没有明确归属的想法。",
  },
  tech: {
    label: "技术",
    description: "开发记录、问题分析与技术实践。",
  },
} as const satisfies Record<string, { label: string; description: string }>;

export type ArticleCategory = keyof typeof categoryMeta;

export function isArticleCategory(value: string): value is ArticleCategory {
  return Object.prototype.hasOwnProperty.call(categoryMeta, value);
}

export function getArticleCategory(article: Article): ArticleCategory {
  const [category] = article.id.split("/");
  if (category && isArticleCategory(category)) return category;

  throw new Error(
    `Unknown article category "${category || "(empty)"}" in "${article.id}". Add it to categoryMeta.`,
  );
}

export function getArticleSlug(article: Article): string {
  return article.id.replace(/\.(md|mdx)$/, "");
}

export function sortArticles(articles: Article[]): Article[] {
  return [...articles].sort(
    (left, right) => right.data.published.valueOf() - left.data.published.valueOf(),
  );
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
