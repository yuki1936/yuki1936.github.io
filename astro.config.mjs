import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://yuki1936.github.io",
  output: "static",
  redirects: {
    "/tools/dns": "/tools/dns-lookup/",
    "/tools/json": "/tools/json-viewer/",
    "/tools/image": "/tools/image-processor/",
    "/tools/blurhash": "/tools/blurhash-tool/",
    "/tools/convert": "/tools/markup-converter/",
  },
});
