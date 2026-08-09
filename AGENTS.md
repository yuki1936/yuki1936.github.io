# Repository Guidelines

## Project

This is a statically generated personal blog and browser-tool site built with
Astro, TypeScript, Markdown/MDX, and plain CSS. GitHub Pages hosts the generated
site. Keep all production behavior compatible with Astro's static output.

## Commands

- Install dependencies: `npm ci`
- Start the development server: `npm run dev`
- Type-check: `npm run check`
- Build for production: `npm run build`
- Run end-to-end tests: start the development server, then run
  `npx playwright test`

The Playwright DNS test requires network access.

## Architecture

- `src/pages/`: Astro routes and page-specific browser wiring
- `src/components/`: shared Astro components
- `src/layouts/BaseLayout.astro`: global document layout
- `src/styles/global.css`: design tokens and shared UI styles
- `src/content/articles/`: Markdown and MDX articles
- `src/lib/articles.ts`: article categories, slugs, dates, and sorting
- `src/lib/`: reusable logic that does not depend on the DOM
- `src/workers/`: Web Workers
- `public/wasm/markweft/`: generated markweft WebAssembly assets
- `tests/smoke.spec.ts`: Playwright functional and visual coverage

## Implementation Rules

- Preserve Astro static output. Do not introduce server-only runtime features.
- Prefer Astro components and plain TypeScript. Do not add React, Vue, Svelte,
  Tailwind, or another UI framework unless explicitly requested.
- Reuse the colors, spacing, widths, controls, and typography defined in
  `src/styles/global.css`.
- Preserve the restrained dark visual style and existing responsive behavior.
- Use Lucide icons through `@lucide/astro`.
- Keep browser tools local-first. User files and JSON must not be uploaded. DNS
  lookup is the intentional network-backed exception.
- Move reusable computation into `src/lib/`; keep DOM wiring in the page.
- Avoid unrelated refactors, especially when editing the larger tool pages.
- Preserve unrelated working-tree changes.

## Articles

Article frontmatter is validated by `src/content.config.ts`:

- `title`: required string
- `description`: optional string
- `published`: required date
- `updated`: optional date
- `draft`: optional boolean, defaults to `false`

Articles must live under a known category directory. Current categories are
`life` and `tech`. When adding a category, update `categoryMeta` in
`src/lib/articles.ts`. Use `templates/article.md.example` when creating an
article. Draft articles must not appear in generated article lists or routes.

## WebAssembly

Do not manually edit files in `public/wasm/markweft/`. Regenerate them with
`scripts/update-markweft-wasm.sh`. The script expects the `markweft-rs`
repository at `../../markweft-rs`, or at the path specified by
`MARKWEFT_RS_DIR`.

## Verification

- Always run `npm run build` after code or content-schema changes.
- For tool changes, run the relevant Playwright test.
- Add new public pages to the `pages` array in `tests/smoke.spec.ts`.
- Check both 1440px desktop and 390px mobile layouts for visual changes.
