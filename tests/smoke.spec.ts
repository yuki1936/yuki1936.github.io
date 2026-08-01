import { expect, test } from "@playwright/test";
import path from "node:path";

const pages = [
  "/",
  "/articles/",
  "/articles/life/",
  "/articles/tech/",
  "/tools/",
  "/tools/dns/",
  "/tools/json/",
  "/tools/image/",
  "/tools/convert/",
  "/about/",
];

test("pages render without horizontal overflow", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const pathname of pages) {
    await page.goto(pathname);
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.scrollWidth, pathname).toBeLessThanOrEqual(dimensions.clientWidth);
  }
  expect(runtimeErrors).toEqual([]);
});

test("DNS query returns records", async ({ page }) => {
  await page.goto("/tools/dns/");
  await page.locator("#dns-name").fill("example.com");
  await page.getByRole("button", { name: "查询" }).click();
  await expect(page.locator("#dns-status")).toContainText("NOERROR");
  await expect(page.locator("#dns-results tr")).not.toHaveCount(0);
});

test("JSON viewer renders a tree and generates Rust and Go types", async ({ page }) => {
  await page.goto("/tools/json/");
  await page.locator("#json-input").fill(
    '{"name":"neri","active":true,"items":[{"id":1,"label":"one"},{"id":2}]}',
  );
  await page.getByRole("button", { name: "解析", exact: true }).click();
  await expect(page.locator("#json-tree")).toContainText("name");
  await expect(page.locator("#json-status")).toHaveText("JSON 有效");

  await page.getByRole("tab", { name: "Rust" }).click();
  await expect(page.locator("#rust-output")).toContainText("pub struct Root");
  await expect(page.locator("#rust-output")).toContainText("Option<String>");

  await page.getByRole("tab", { name: "Go", exact: true }).click();
  await expect(page.locator("#go-output")).toContainText("type Root struct");
  await expect(page.locator("#go-output")).toContainText('json:"items"');
});

test("image tool creates a local output", async ({ page }) => {
  await page.goto("/tools/image/");
  await page.locator("#image-input").setInputFiles(path.resolve("public/avatar.jpg"));
  await expect(page.locator("#image-workspace")).toBeVisible();
  await page.getByRole("button", { name: "生成图片" }).click();
  await expect(page.locator("#output-panel")).toBeVisible();
  await expect(page.locator("#download-image")).toHaveAttribute("download", /processed\.webp$/);
});

test("document converter runs the Rust Wasm format matrix", async ({ page }) => {
  await page.goto("/tools/convert/");
  await expect(page.locator("#convert-status")).toHaveText("转换器已就绪", {
    timeout: 15_000,
  });

  const cases = [
    ["markdown", "html", "# Hello", "<h1>Hello</h1>"],
    ["html", "markdown", "<h1>Hello</h1>", "# Hello"],
    ["typst", "latex", "= Hello", "\\section{Hello}"],
    ["latex", "typst", "\\section{Hello}", "= Hello"],
  ] as const;

  for (const [from, to, source, expected] of cases) {
    await page.locator("#source-format").selectOption(from);
    await page.locator("#target-format").selectOption(to);
    await page.locator("#document-input").fill(source);
    await page.getByRole("button", { name: "转换", exact: true }).click();
    await expect
      .poll(() => page.locator("#document-output").inputValue())
      .toContain(expected);
  }
});

test("visual snapshots", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.screenshot({ path: "artifacts/home-desktop.png", fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/tools/");
  await page.screenshot({ path: "artifacts/tools-mobile.png", fullPage: true });

  const sample = '{"name":"neri","active":true,"languages":["Rust","Python","Go","TypeScript"],"profile":{"location":"China","public":true}}';
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/tools/json/");
  await page.locator("#json-input").fill(sample);
  await page.getByRole("button", { name: "解析", exact: true }).click();
  await page.screenshot({ path: "artifacts/json-viewer-desktop.png", fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "artifacts/json-viewer-mobile.png", fullPage: true });
});
