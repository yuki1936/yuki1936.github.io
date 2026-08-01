import type { CollectionEntry } from "astro:content";

export type Article = CollectionEntry<"articles">;
export type ArticleCategory = "life" | "tech";

export const categoryMeta = {
  life: {
    label: "日常",
    description: "生活片段、回忆与一些没有明确归属的想法。",
  },
  tech: {
    label: "技术",
    description: "开发记录、问题分析与技术实践。",
  },
} satisfies Record<ArticleCategory, { label: string; description: string }>;

export function getArticleCategory(article: Article): ArticleCategory {
  return article.id.startsWith("tech/") ? "tech" : "life";
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
