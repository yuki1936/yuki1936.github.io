import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { getArticleCategory, getArticleSlug, sortArticles } from "../lib/articles";

export async function GET(context: APIContext) {
  const articles = sortArticles(
    await getCollection("articles", ({ data }) => !data.draft),
  );
  return rss({
    title: "neri",
    description: "yuki1936 的文章、回忆与日常工具。",
    site: context.site ?? "https://yuki1936.com",
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.published,
      link: `/articles/${getArticleSlug(article)}/`,
      categories: [getArticleCategory(article)],
    })),
    customData: "<language>zh-CN</language>",
  });
}
