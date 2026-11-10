#!/usr/bin/env node
/**
 * 动效三模式审计（正常 / prefers-reduced-motion / ?shot=1）
 *
 * 用 chrome-headless-shell + CDP 断言动效契约（docs/01-设计系统.md §8）：
 *   - 页面入场交错（--i、38ms 步长、上限 8）
 *   - 路由离场时长 = --dur-exit，且与 CSS 过渡一致
 *   - 路由切换清理 SA.timers / SA.timeouts（toast 例外）
 *   - ?shot=1 关闭动画并跳过序列
 *   - prefers-reduced-motion 下 token、延迟、序列等待归零
 *   - 侧栏折叠宽度可插值（@property --sidebar-w）
 *   - 队列暂停停表 / 恢复重启
 *   - 无未捕获异常
 *
 * 用法：node scripts/motion-audit.mjs
 * 浏览器：Playwright 缓存里的 chrome-headless-shell，或 SA_CHROME_BIN 指定。
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { mkdtempSync, rmSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const APP = "file://" + path.join(ROOT, "app.html");

function findChrome() {
  if (process.env.SA_CHROME_BIN) return process.env.SA_CHROME_BIN;
  const cache = path.join(process.env.HOME || "", "Library/Caches/ms-playwright");
  if (existsSync(cache)) {
    const dirs = readdirSync(cache)
      .filter((d) => d.startsWith("chromium_headless_shell-"))
      .sort()
      .reverse();
    for (const d of dirs) {
      for (const sub of ["chrome-headless-shell-mac-arm64", "chrome-headless-shell-mac-x64", "chrome-headless-shell-linux64"]) {
        const p = path.join(cache, d, sub, "chrome-headless-shell");
        if (existsSync(p)) return p;
      }
    }
  }
  throw new Error("未找到 chrome-headless-shell：设置 SA_CHROME_BIN 或运行 npx playwright install chromium");
}

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.addEventListener("message", (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error("CDP timeout: " + method));
        }
      }, 20000);
    });
  }
  async eval(expression) {
    const r = await this.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) {
      throw new Error((r.exceptionDetails.text || "") + " " + (r.exceptionDetails.exception?.description || ""));
    }
    return r.result.value;
  }
}

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? "  " + detail : ""}`);
}

async function main() {
  const bin = findChrome();
  const profile = mkdtempSync(path.join(tmpdir(), "sa-motion-"));
  const port = 9400 + Math.floor(Math.random() * 200);
  const chrome = spawn(
    bin,
    [
      "--no-sandbox",
      "--disable-gpu",
      "--hide-scrollbars",
      "--disable-crash-reporter",
      "--disable-breakpad",
      "--user-data-dir=" + profile,
      "--remote-debugging-port=" + port,
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "ignore"] }
  );

  const cleanup = () => {
    try { chrome.kill("SIGKILL"); } catch {}
    try { rmSync(profile, { recursive: true, force: true }); } catch {}
  };
  process.on("exit", cleanup);

  let list = null;
  for (let i = 0; i < 120; i++) {
    try {
      list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      if (list && list.length) break;
    } catch {}
    await sleep(100);
  }
  const page = list && list.find((t) => t.type === "page");
  if (!page) throw new Error("Chrome 未暴露 page target");

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  const cdp = new CDP(ws);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");

  const errors = [];
  ws.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    if (msg.method === "Runtime.exceptionThrown") {
      const d = msg.params.exceptionDetails;
      errors.push(d.text + " " + (d.exception?.description || ""));
    }
  });

  async function load(url) {
    await cdp.send("Page.navigate", { url });
    for (let i = 0; i < 160; i++) {
      try {
        const ok = await cdp.eval(
          "document.readyState === 'complete' && !!window.SA && !!SA.screens && Object.keys(SA.screens).length > 0"
        );
        if (ok) break;
      } catch {}
      await sleep(50);
    }
    await sleep(150);
  }
  const setReducedMotion = (reduce) =>
    cdp.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: reduce ? "reduce" : "no-preference" }],
    });

  /* ---------- 1. 正常模式：交错入场 ---------- */
  await load(APP + "#/home");
  const stagger = await cdp.eval(`(() => {
    const page = document.querySelector(".view > .page");
    return [...page.children].map((el) => ({
      i: el.style.getPropertyValue("--i"),
      delay: getComputedStyle(el).animationDelay,
      name: getComputedStyle(el).animationName,
    }));
  })()`);
  check("正常：注入 --i 且按序", stagger.every((s, k) => s.i === String(Math.min(k, 8))), "n=" + stagger.length);
  check("正常：步长 = 38ms", stagger[2] && stagger[2].delay === "0.076s", "3rd=" + (stagger[2] || {}).delay);
  check("正常：页面入场动画 sa-rise", stagger.length > 0 && stagger.every((s) => s.name === "sa-rise"));

  const capCheck = await cdp.eval(`(async () => {
    location.hash = "#/admin?tab=groups";
    return new Promise((r) => setTimeout(() => {
      const page = document.querySelector(".view > .page");
      const max = Math.max(-1, ...[...page.children].map((el) => Number(el.style.getPropertyValue("--i") || -1)));
      r(max);
    }, 500));
  })()`);
  check("正常：交错上限 = 8", capCheck <= 8, "max --i = " + capCheck);

  /* ---------- 2. 路由离场时长 ---------- */
  await load(APP + "#/home");
  const leave = await cdp.eval(`(async () => {
    const view = document.getElementById("view");
    let sample = null;
    const mo = new MutationObserver(() => {
      if (view.classList.contains("is-leaving") && !sample) {
        const child = view.firstElementChild;
        if (child) {
          const cs = getComputedStyle(child);
          sample = { dur: cs.transitionDuration, prop: cs.transitionProperty, anim: cs.animationName };
        }
      }
    });
    mo.observe(view, { attributes: true, attributeFilter: ["class"] });
    location.hash = "#/demands";
    await new Promise((r) => setTimeout(r, 50));
    mo.disconnect();
    return sample;
  })()`);
  check(
    "离场：过渡 = --dur-exit 且复位 animation",
    leave && leave.dur === "0.12s, 0.12s" && leave.anim === "none",
    JSON.stringify(leave)
  );

  /* ---------- 3. 计时器清理 ---------- */
  await load(APP + "#/ops/queue?view=it");
  const before = await cdp.eval("SA.timers.length + ':' + SA.timeouts.length");
  await cdp.eval("location.hash = '#/home'");
  await sleep(400);
  const after = await cdp.eval("SA.timers.length + ':' + SA.timeouts.length");
  check("路由切换清空计时器", after === "0:0", `${before} → ${after}`);

  /* ---------- 4. 队列暂停停表 / 恢复 ---------- */
  await load(APP + "#/ops/queue?view=it");
  const pause = await cdp.eval(`(async () => {
    const btn = document.querySelector("[data-action='pause-queue']");
    const feed = document.querySelector("#event-feed");
    if (!btn || !feed) return { skipped: true };
    const n0 = feed.children.length;
    const running = SA.timers.length;
    btn.click();
    await new Promise((r) => setTimeout(r, 120));
    const pausedTimers = SA.timers.length;
    await new Promise((r) => setTimeout(r, 4000));
    const pausedRows = feed.children.length;
    btn.click();
    await new Promise((r) => setTimeout(r, 120));
    const resumedTimers = SA.timers.length;
    await new Promise((r) => setTimeout(r, 4000));
    return { running, pausedTimers, pausedRows, n0, resumedTimers, resumedRows: feed.children.length };
  })()`);
  check(
    "队列暂停：计时器停表且事件流冻结",
    pause.skipped || (pause.running === 2 && pause.pausedTimers === 0 && pause.pausedRows === pause.n0),
    JSON.stringify(pause)
  );
  check(
    "队列恢复：计时器重启且事件流继续",
    pause.skipped || (pause.resumedTimers === 2 && pause.resumedRows > pause.pausedRows),
    JSON.stringify(pause)
  );

  /* ---------- 5. toast 不随路由清理 ---------- */
  await load(APP + "#/home");
  await cdp.eval("SA.toast('motion audit')");
  await cdp.eval("location.hash = '#/demands'");
  await sleep(300);
  const toastAlive = await cdp.eval("!!document.querySelector('.toast')");
  await sleep(3200);
  const toastGone = await cdp.eval("!document.querySelector('.toast')");
  check("toast 跨路由存活并自动消失", toastAlive && toastGone, `alive=${toastAlive} gone=${toastGone}`);

  /* ---------- 6. tab 下划线最终态 ---------- */
  await load(APP + "#/admin?tab=integrations");
  const tabUnderline = await cdp.eval(`(() => {
    const tab = document.querySelector(".tabs .tab.is-active");
    if (!tab) return "no-tab";
    return getComputedStyle(tab, "::after").transform;
  })()`);
  check("tab 下划线最终 scaleX(1)", tabUnderline === "matrix(1, 0, 0, 1, 0, 0)", tabUnderline);

  /* ---------- 7. shot 模式 ---------- */
  await load(APP + "?shot=1#/home");
  const shot = await cdp.eval(`(() => {
    const page = document.querySelector(".view > .page");
    const first = page && page.firstElementChild;
    return {
      cls: document.documentElement.className,
      anim: first ? getComputedStyle(first).animationName : "none",
      i: page && page.children[1] ? page.children[1].style.getPropertyValue("--i") : "",
    };
  })()`);
  check("shot：shot-mode 且无动画", shot.cls.includes("shot-mode") && shot.anim === "none");
  check("shot：跳过 --i 注入", shot.i === "" || shot.i === "none", "i=" + shot.i);

  /* ---------- 8. reduced-motion ---------- */
  await setReducedMotion(true);
  await load(APP + "#/home");
  const rm = await cdp.eval(`(() => {
    const page = document.querySelector(".view > .page");
    const first = page.firstElementChild;
    const token = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    return {
      flag: SA.isReducedMotion(),
      dur3: SA.dur("--dur-3"),
      token: token("--dur-3"),
      stagger: token("--stagger"),
      delay: getComputedStyle(first).animationDelay,
      i: page.children[1] ? page.children[1].style.getPropertyValue("--i") : "",
    };
  })()`);
  check("reduced：SA.isReducedMotion()", rm.flag === true);
  check("reduced：token 与 stagger 归零", rm.token === "0ms" && rm.stagger === "0ms", JSON.stringify({ token: rm.token, stagger: rm.stagger }));
  check("reduced：入场延迟 = 0", rm.delay === "0s", "delay=" + rm.delay);
  check("reduced：跳过 --i 注入", rm.i === "" || rm.i === "none", "i=" + rm.i);
  const seqMs = await cdp.eval(`(async () => {
    const t = performance.now();
    await new Promise((r) => SA.sequence(r, 900));
    return Math.round(performance.now() - t);
  })()`);
  check("reduced：序列等待压缩 ≤ 120ms", seqMs <= 120, seqMs + "ms");
  await setReducedMotion(false);

  /* ---------- 9. 侧栏折叠可插值 ---------- */
  await load(APP + "#/home");
  const collapse = await cdp.eval(`(async () => {
    const app = document.getElementById("app");
    app.classList.add("is-collapsed");
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const mid = getComputedStyle(app).getPropertyValue("--sidebar-w").trim();
    await new Promise((r) => setTimeout(r, 600));
    const end = getComputedStyle(app).getPropertyValue("--sidebar-w").trim();
    return { mid, end };
  })()`);
  const midPx = parseFloat(collapse.mid);
  check("@property --sidebar-w 可过渡", midPx > 72 && midPx < 232, JSON.stringify(collapse));

  /* ---------- 10. 无 JS 异常 ---------- */
  check("无未捕获异常", errors.length === 0, errors.slice(0, 2).join(" | "));

  const failed = results.filter((r) => !r.ok);
  console.log(`\n结果：${results.length - failed.length}/${results.length} 通过`);
  ws.close();
  cleanup();
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error("AUDIT FAILED:", e.message || e);
  process.exit(2);
});
