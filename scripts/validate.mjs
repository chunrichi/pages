#!/usr/bin/env node
/**
 * Validate the prototype gallery before publishing.
 * - parses data/prototypes.js
 * - checks registry fields, duplicate slugs, file existence
 * - flags absolute paths that would break project-level GitHub Pages
 * Exit code 1 when there is a real error.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (text) => (useColor ? `\x1b[${code}m${text}\x1b[0m` : text);
const red = paint(31);
const green = paint(32);
const yellow = paint(33);
const dim = paint(2);
const bold = paint(1);

const errors = [];
const warnings = [];
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const accentPattern = /^#[0-9a-f]{6}$/i;

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function relativePath(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    fail(`${label} 不能为空`);
    return false;
  }
  if (value.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(value) || value.includes("..")) {
    fail(`${label} 必须是原型目录内的相对路径，不能是「${value}」`);
    return false;
  }
  return true;
}

function localFile(baseDir, value) {
  return path.join(baseDir, String(value).split("#")[0].split("?")[0]);
}

function checkFile(baseDir, value, label) {
  if (!relativePath(value, label)) return;
  const file = localFile(baseDir, value);
  if (!existsSync(file) || !statSync(file).isFile()) {
    fail(`${label} 指向的文件不存在：${path.relative(root, file)}`);
  }
}

function pngSize(file) {
  if (path.extname(file).toLowerCase() !== ".png") return null;
  try {
    const buffer = readFileSync(file).subarray(0, 24);
    if (buffer.toString("hex", 0, 8) !== "89504e470d0a1a0a") return null;
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  } catch {
    return null;
  }
}

function walk(dir, output = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, output);
    } else if (/\.(html?|css|js|mjs)$/i.test(entry.name)) {
      output.push(full);
    }
  }
  return output;
}

/* ---------- load registry ---------------------------------- */
const registryPath = path.join(root, "data/prototypes.js");
if (!existsSync(registryPath)) {
  console.error(red("✗ 找不到 data/prototypes.js"));
  process.exit(1);
}

let showcase;
try {
  const source = readFileSync(registryPath, "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { filename: "data/prototypes.js" });
  showcase = sandbox.window.SHOWCASE;
} catch (error) {
  console.error(red("✗ data/prototypes.js 解析失败"));
  console.error(dim(error.message));
  process.exit(1);
}

if (!showcase || !Array.isArray(showcase.prototypes)) {
  console.error(red("✗ window.SHOWCASE.prototypes 必须是一个数组"));
  process.exit(1);
}

const prototypes = showcase.prototypes;
const site = showcase.site || {};

/* ---------- site fields ------------------------------------ */
if (typeof site.name !== "string" || !site.name.trim()) {
  warn("site.name 为空，品牌名会回退到 AI Space");
}
if (site.github && !/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(site.github)) {
  warn(`site.github 格式看起来不对：${site.github}`);
}

/* ---------- prototypes ------------------------------------- */
const seenSlugs = new Set();
const seenTitles = new Set();
const prototypeRoot = path.join(root, "prototypes");
let entryCount = 0;
let featuredCount = 0;

if (!prototypes.length) {
  warn("还没有登记任何原型");
}

for (const [index, prototype] of prototypes.entries()) {
  const label = `prototypes[${index}]`;
  if (!prototype || typeof prototype !== "object") {
    fail(`${label} 不是对象`);
    continue;
  }

  if (typeof prototype.slug !== "string" || !slugPattern.test(prototype.slug)) {
    fail(`${label}.slug 只能包含小写字母、数字和连字符：${prototype.slug}`);
    continue;
  }

  if (seenSlugs.has(prototype.slug)) {
    fail(`slug 重复：${prototype.slug}`);
  }
  seenSlugs.add(prototype.slug);

  if (typeof prototype.title !== "string" || !prototype.title.trim()) {
    fail(`${prototype.slug}.title 不能为空`);
  } else if (seenTitles.has(prototype.title)) {
    warn(`标题重复：${prototype.title}`);
  } else {
    seenTitles.add(prototype.title);
  }

  if (typeof prototype.summary !== "string" || !prototype.summary.trim()) {
    warn(`${prototype.slug}.summary 为空，卡片会缺少介绍`);
  }

  if (typeof prototype.category !== "string" || !prototype.category.trim()) {
    warn(`${prototype.slug}.category 为空，会显示为「原型」`);
  }

  if (prototype.updated && !datePattern.test(prototype.updated)) {
    fail(`${prototype.slug}.updated 需要是 YYYY-MM-DD：${prototype.updated}`);
  }

  if (prototype.accent && !accentPattern.test(prototype.accent)) {
    fail(`${prototype.slug}.accent 需要是 6 位十六进制颜色：${prototype.accent}`);
  }

  if (prototype.featured) featuredCount += 1;

  const dir = path.join(prototypeRoot, prototype.slug);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    fail(`${prototype.slug} 的目录不存在：prototypes/${prototype.slug}/`);
    continue;
  }

  if (prototype.cover) {
    checkFile(dir, prototype.cover, `${prototype.slug}.cover`);
    const coverFile = localFile(dir, prototype.cover);
    const size = pngSize(coverFile);
    if (size) {
      const ratio = size.width / size.height;
      if (size.width < 800) {
        warn(`${prototype.slug}.cover 宽度只有 ${size.width}px，建议 ≥1440px`);
      }
      if (Math.abs(ratio - 1.6) > 0.12) {
        warn(`${prototype.slug}.cover 比例 ${ratio.toFixed(2)}，展台最佳比例是 16:10（1.6）`);
      }
    }
  } else {
    warn(`${prototype.slug}.cover 为空，展台会显示占位图`);
  }

  if (prototype.screens) {
    if (!Array.isArray(prototype.screens)) {
      fail(`${prototype.slug}.screens 必须是数组`);
    } else {
      prototype.screens.forEach((screen, screenIndex) => {
        checkFile(dir, screen, `${prototype.slug}.screens[${screenIndex}]`);
      });
    }
  }

  if (!Array.isArray(prototype.entries) || !prototype.entries.length) {
    fail(`${prototype.slug}.entries 至少需要一个入口`);
  } else {
    const entryLabels = new Set();
    prototype.entries.forEach((entry, entryIndex) => {
      const entryLabel = `${prototype.slug}.entries[${entryIndex}]`;
      if (!entry || typeof entry !== "object") {
        fail(`${entryLabel} 不是对象`);
        return;
      }
      if (typeof entry.label !== "string" || !entry.label.trim()) {
        fail(`${entryLabel}.label 不能为空`);
      } else if (entryLabels.has(entry.label)) {
        warn(`${prototype.slug} 的入口名称重复：${entry.label}`);
      } else {
        entryLabels.add(entry.label);
      }
      if (relativePath(entry.path, `${entryLabel}.path`)) {
        entryCount += 1;
        const file = localFile(dir, entry.path);
        if (!existsSync(file)) {
          fail(`${entryLabel}.path 指向的文件不存在：prototypes/${prototype.slug}/${entry.path}`);
        }
      }
    });
  }
}

if (featuredCount > 1) {
  fail(`featured 只能有一个，现在有 ${featuredCount} 个`);
}

/* ---------- orphan folders --------------------------------- */
if (existsSync(prototypeRoot)) {
  const dirs = readdirSync(prototypeRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  for (const dir of dirs) {
    if (dir !== "_template" && !seenSlugs.has(dir)) {
      warn(`prototypes/${dir}/ 还没有登记到 data/prototypes.js`);
    }
  }

  if (!dirs.includes("_template")) {
    warn("缺少 prototypes/_template/，npm run new 将无法工作");
  }
}

/* ---------- absolute paths (project Pages) ----------------- */
const absoluteRefPattern = /(?:href|src)\s*=\s*["']\/(?!\/)/;
const cssUrlPattern = /url\(\s*["']?\/(?!\/)/;
let absoluteWarnings = 0;

for (const file of walk(root)) {
  const relative = path.relative(root, file);
  if (relative.startsWith("scripts/") || relative.startsWith(".github/")) continue;
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (absoluteRefPattern.test(content) || cssUrlPattern.test(content)) {
    absoluteWarnings += 1;
    if (absoluteWarnings <= 8) {
      warn(`发现根路径引用，项目级 Pages 下会失效：${relative}`);
    }
  }
}
if (absoluteWarnings > 8) {
  warn(`另有 ${absoluteWarnings - 8} 个文件存在根路径引用`);
}

/* ---------- publishing files ------------------------------- */
if (!existsSync(path.join(root, ".nojekyll"))) {
  warn("缺少 .nojekyll（如果改成从分支根目录发布，一定要有它）");
}
if (!existsSync(path.join(root, ".github/workflows/deploy.yml"))) {
  warn("缺少 .github/workflows/deploy.yml，GitHub Actions 不会自动部署");
}

/* ---------- report ---------------------------------------- */
console.log(`${bold("AI Space · 原型展厅校验")}`);
console.log(
  dim(
    `${prototypes.length} 个原型 · ${entryCount} 个入口 · ${errors.length} 个错误 · ${warnings.length} 个提醒`
  )
);

for (const message of warnings) {
  console.log(`${yellow("!")} ${message}`);
}
for (const message of errors) {
  console.log(`${red("✗")} ${message}`);
}

if (errors.length) {
  console.log(`\n${red("校验未通过")} — 修掉错误后再发布。`);
  process.exit(1);
}

console.log(`\n${green("✓ 校验通过")} — 可以直接预览或发布。`);
