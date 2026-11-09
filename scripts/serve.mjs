#!/usr/bin/env node
/**
 * Zero-dependency local preview server.
 * Usage: npm run dev  (or: node scripts/serve.mjs --port 4174)
 */
import http from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8"
};

function flag(name, fallback) {
  const index = process.argv.indexOf(name);
  return index > -1 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

const port = Number(flag("--port", process.env.PORT || 4173));
const host = flag("--host", "127.0.0.1");
const rootWithSep = root + path.sep;

function notFound(res) {
  res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
  res.end(`<!doctype html>
<html lang="zh-CN"><meta charset="utf-8"><title>404 · 原型展厅</title>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#f7f7f3;color:#101216;font-family:-apple-system,'PingFang SC',sans-serif">
  <main style="text-align:center">
    <p style="font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:.14em;color:#8a8e96">404 / NOT FOUND</p>
    <h1 style="font-size:28px;letter-spacing:-.03em;margin:12px 0 8px">这里没有展品</h1>
    <p style="color:#50545c;font-size:13px;margin-bottom:24px">检查路径，或回到展厅。</p>
    <a href="/" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#101216;color:#fff;text-decoration:none;font-size:13px">回到展厅</a>
  </main>
</body></html>`);
}

const server = http.createServer(async (req, res) => {
  try {
    const rawUrl = (req.url || "/").replace(/^\/{2,}/, "/");
    const url = new URL(rawUrl, `http://${req.headers.host || "localhost"}`);
    let pathname;

    try {
      pathname = decodeURIComponent(url.pathname).replace(/\/{2,}/g, "/");
    } catch {
      res.writeHead(400).end("Bad request");
      return;
    }

    let filePath = path.join(root, pathname);

    if (filePath !== root && !filePath.startsWith(rootWithSep)) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    let info = await stat(filePath).catch(() => null);
    if (info && info.isDirectory()) {
      filePath = path.join(filePath, "index.html");
      info = await stat(filePath).catch(() => null);
    }

    if (!info || !info.isFile()) {
      notFound(res);
      return;
    }

    res.writeHead(200, {
      "Content-Type": mime[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    });

    if (req.method === "HEAD") {
      res.end();
      return;
    }

    createReadStream(filePath).on("error", () => res.end()).pipe(res);
  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Internal server error\n" + error.message);
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`\n端口 ${port} 已被占用。换一个：node scripts/serve.mjs --port 4174\n`);
  } else {
    console.error(error);
  }
  process.exit(1);
});

server.listen(port, host, () => {
  console.log(`
  ${"\x1b[1m"}AI Space · 原型展厅${"\x1b[0m"}
  ${"\x1b[2m"}local${"\x1b[0m"}  http://${host}:${port}/
  ${"\x1b[2m"}tip${"\x1b[0m"}    修改文件后刷新即可，无需构建
`);
});
