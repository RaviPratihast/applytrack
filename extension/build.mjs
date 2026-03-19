import * as esbuild from "esbuild";
import { readdirSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const distDir = join(process.cwd(), "dist");
const watch = process.argv.includes("--watch");
if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });

const contentCtx = await esbuild.context({
  entryPoints: ["src/content.ts"],
  bundle: true,
  format: "iife",
  outfile: join(distDir, "content.js"),
  target: "chrome90",
  sourcemap: false,
  minify: false,
});

const backgroundCtx = await esbuild.context({
  entryPoints: ["src/background.ts"],
  bundle: true,
  format: "esm",
  outfile: join(distDir, "background.js"),
  target: "chrome90",
  sourcemap: false,
  minify: false,
});

if (watch) {
  await Promise.all([contentCtx.watch(), backgroundCtx.watch()]);
  console.log("Watching src/... (reload extension in Chrome after changes)");
} else {
  await contentCtx.rebuild();
  await backgroundCtx.rebuild();
  await contentCtx.dispose();
  await backgroundCtx.dispose();
  const files = readdirSync(distDir);
  if (!files.includes("content.js") || !files.includes("background.js")) {
    console.error("content.js or background.js missing");
    process.exit(1);
  }
  console.log("Extension bundled: dist/content.js, dist/background.js");
}
