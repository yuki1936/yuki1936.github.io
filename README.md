# yuki1936.github.io

Personal articles and browser tools, built as a static Astro site.

## Development

```sh
npm install
npm run dev
```

The production build is written to `dist/`:

```sh
npm run build
npm run preview
```

## Writing

Articles live in one of two directories:

```text
src/content/articles/life/   日常、回忆与随笔
src/content/articles/tech/   技术文章
```

Copy `templates/article.md.example` into the appropriate directory and
rename it. The directory determines the category, and the file name determines
the URL.

```yaml
---
title: 文章标题
description: 一句话摘要
published: 2026-08-01
updated: 2026-08-02 # optional
draft: false
---
```

Draft articles are excluded from production pages.

## Deployment

Pushes to `main` are built and deployed by `.github/workflows/deploy.yml`.
In the repository settings, set **Pages > Build and deployment > Source** to
**GitHub Actions**.
