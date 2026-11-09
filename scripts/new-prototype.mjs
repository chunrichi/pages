#!/usr/bin/env node
/**
 * Scaffold a new prototype from prototypes/_template/ and register it.
 * Usage: npm run new -- my-prototype "我的原型"
 */
import {
  cpSync,
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templateDir = path.join(root, "prototypes", "_template");
const registryPath = path.join(root, "data", "prototypes.js");

const args = process.argv.slice(2);
const slug = (args[0] || "").trim();
const title = (args.slice(1).join(" ") || "").trim();

if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error("用法：npm run new -- <slug> [标题]");
  console.error("slug 只能包含小写字母、数字和连字符，例如：checkout-redesign");
  process.exit(1);
}

if (!existsSync(templateDir)) {
  console.error("找不到 prototypes/_template/，无法创建。");
  process.exit(1);
}

const targetDir = path.join(root, "prototypes", slug);
if (existsSync(targetDir)) {
  console.error(`prototypes/${slug}/ 已存在。`);
  process.exit(1);
}

function walk(dir, output = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, output);
    else output.push(full);
  }
  return output;
}

function slugToTitle(value) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function today() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
}

const finalTitle = title || slugToTitle(slug);

cpSync(templateDir, targetDir, { recursive: true });

const replacements = {
  __TITLE__: finalTitle,
  __SLUG__: slug,
  __DATE__: today()
};

for (const file of walk(targetDir)) {
  if (!/\.(html?|md|svg|css|js)$/i.test(file)) continue;
  let content = readFileSync(file, "utf8");
  for (const [token, value] of Object.entries(replacements)) {
    content = content.split(token).join(value);
  }
  writeFileSync(file, content);
}

/* register the new prototype before the end marker */
const registry = readFileSync(registryPath, "utf8");
const marker = "    // @registry:end";
if (!registry.includes(marker)) {
  console.error("data/prototypes.js 缺少 // @registry:end 标记，无法自动登记。");
  console.error(`原型文件已经创建在 prototypes/${slug}/，请手动登记。`);
  process.exit(1);
}

const palette = ["#2d5be3", "#0b8f7c", "#b06a05", "#6657d8", "#c53f3f", "#1d825a"];
const accent = palette[slug.length % palette.length];

const entry = {
  slug,
  title: finalTitle,
  summary: "在这里写一句话介绍这个原型。",
  category: "未分类",
  status: "进行中",
  accent,
  cover: "cover.svg",
  updated: today(),
  tags: [],
  entries: [{ label: "原型", path: "index.html" }]
};

const entryBlock = JSON.stringify(entry, null, 2)
  .split("\n")
  .map((line) => "    " + line)
  .join("\n");

const markerIndex = registry.indexOf(marker);
const before = registry.slice(0, markerIndex).replace(/\s+$/, "");
const after = registry.slice(markerIndex + marker.length);
const needsComma = !/[,[]$/.test(before);
const nextRegistry =
  before +
  (needsComma ? "," : "") +
  "\n" +
  entryBlock +
  ",\n    // @registry:end" +
  after;
writeFileSync(registryPath, nextRegistry);

console.log(`
✓ 已创建 prototypes/${slug}/
✓ 已登记到 data/prototypes.js
✓ title: ${finalTitle}

下一步：
  1. 把 prototypes/${slug}/index.html 换成你的原型（保持相对路径）
  2. 用真实界面截图替换 cover.svg（推荐 1440×900）
  3. npm run validate
  4. npm run dev  →  http://localhost:4173/prototypes/${slug}/
`);

const validation = spawnSync(process.execPath, [path.join(root, "scripts", "validate.mjs")], {
  stdio: "inherit"
});
process.exit(validation.status || 0);
