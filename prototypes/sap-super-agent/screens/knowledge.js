/* ============================================================
   Screen · Knowledge base (sources, index, retrieval test)
   ============================================================ */
(function () {
  const SA = window.SA;
  const ic = window.ic;

  const SOURCES = [
    { id: "pdo", name: "PDO 历史需求", type: "内部系统", docs: 84, status: "已索引", tone: "green", updated: "今天 08:12", icon: "layers" },
    { id: "spec", name: "SAP 开发规范", type: "Confluence", docs: 26, status: "已索引", tone: "green", updated: "昨天 17:40", icon: "book-open" },
    { id: "sop", name: "财务月结 SOP", type: "SharePoint", docs: 12, status: "已索引", tone: "green", updated: "11-08", icon: "file-text" },
    { id: "if", name: "接口与集成文档", type: "Confluence", docs: 19, status: "索引中 62%", tone: "teal", updated: "正在同步", icon: "plug" },
    { id: "master", name: "主数据规则", type: "SAP 表", docs: 6, status: "待同步", tone: "amber", updated: "11-05", icon: "database" },
  ];

  const DOCS = [
    { title: "PDO-2024-118 · 采购申请预算校验", source: "PDO 历史需求", type: "需求", chunks: 42, hits: 18, updated: "2026-03-12", tone: "teal" },
    { title: "财务主数据规范 v3.2 · 预算科目", source: "SAP 开发规范", type: "规范", chunks: 28, hits: 26, updated: "2026-08-01", tone: "blue" },
    { title: "MM 采购审批流设计说明", source: "SAP 开发规范", type: "设计", chunks: 19, hits: 12, updated: "2026-08-18", tone: "violet" },
    { title: "预算校验接口 RE-204 · 幂等规则", source: "接口与集成文档", type: "接口", chunks: 12, hits: 9, updated: "2026-10-02", tone: "amber" },
    { title: "月结任务失败重跑操作手册", source: "财务月结 SOP", type: "SOP", chunks: 16, hits: 7, updated: "2026-09-20", tone: "blue" },
  ];

  SA.register("knowledge", {
    title: "知识库",
    render() {
      const readOnly = SA.isReadOnly();
      return `
      <div class="page page-knowledge">
        <div class="page-head">
          <div class="page-head__main">
            <div class="eyebrow">KNOWLEDGE · 检索增强</div>
            <div class="page-head__title"><h1>知识库</h1><span class="pill pill--teal pill--lg">RAG</span></div>
            <p class="page-head__desc">AI 澄清、文档生成与评审引用都来自这里。索引状态、引用热度与检索质量都可观测。</p>
          </div>
          ${
            readOnly
              ? ""
              : `<div class="page-head__actions">
            <button class="btn">${ic("refresh")} 重建索引</button>
            <button class="btn btn--primary">${ic("upload")} 上传文档</button>
          </div>`
          }
        </div>

        ${readOnly ? SA.readOnlyBar("业务方可以检索知识库，来源与索引由 SAP IT 维护。") : ""}

        <section class="metric-strip metric-strip--4">
          <div class="metric"><span>文档总数</span><b>147</b><em>5 个来源</em></div>
          <div class="metric"><span>已索引</span><b>128</b><em class="teal">96% 完成</em></div>
          <div class="metric"><span>本周引用</span><b>142</b><em>AI 生成引用</em></div>
          <div class="metric"><span>检索命中率</span><b>92<span class="metric__unit">%</span></b><em>nDCG@5 · 0.86</em></div>
        </section>

        <div class="kb-layout">
          <aside class="kb-sources card">
            <div class="card-head"><h3>知识来源</h3>${readOnly ? "" : '<button class="icon-btn icon-btn--sm">' + ic("plus") + "</button>"}</div>
            <div class="kb-source-list">
              ${SOURCES.map(
                (s) => `
                <div class="kb-source ${s.tone === "amber" ? "is-warn" : ""}">
                  <span class="kb-source__icon kb-source__icon--${s.tone}">${ic(s.icon)}</span>
                  <span class="kb-source__main"><b>${s.name}</b><em>${s.type} · ${s.docs} 篇 · ${s.updated}</em></span>
                  <span class="kb-source__status kb-source__status--${s.tone}">${s.status}</span>
                </div>`
              ).join("")}
            </div>
            <div class="kb-source-foot">${ic("info")} 索引中来源会分片入库，失败分片会在队列中重试。</div>
          </aside>

          <section class="kb-docs card">
            <div class="card-head">
              <h3>文档</h3>
              <div class="row gap-2">
                <div class="segmented kb-filter"><button class="is-active">全部</button><button>需求</button><button>规范</button><button>接口</button></div>
                <div class="search"><span data-icon="search"></span><input class="input" placeholder="搜索文档…" /></div>
              </div>
            </div>
            <div class="table-wrap">
              <table class="table kb-table">
                <thead><tr><th>文档</th><th>来源</th><th>分片</th><th>引用</th><th>更新时间</th><th></th></tr></thead>
                <tbody>
                  ${DOCS.map(
                    (d) => `
                    <tr>
                      <td><div class="kb-doc-title"><span class="kb-doc-type kb-doc-type--${d.tone}">${d.type}</span>${d.title}</div></td>
                      <td><span class="sm">${d.source}</span></td>
                      <td><span class="mono sm">${d.chunks}</span></td>
                      <td><span class="kb-hits"><i style="width:${Math.min(100, d.hits * 4)}%"></i><em class="mono">${d.hits}</em></span></td>
                      <td><span class="sm mono" style="color:var(--ink-4)">${d.updated}</span></td>
                      <td><button class="icon-btn icon-btn--sm">${ic("external")}</button></td>
                    </tr>`
                  ).join("")}
                </tbody>
              </table>
            </div>
          </section>

          <aside class="kb-test card">
            <div class="card-head"><h3>${ic("sparkles")} 检索测试</h3><span class="pill pill--teal">live</span></div>
            <div class="kb-test__body">
              <div class="kb-test__query">
                <span class="mono">Q</span>
                <input class="input" id="kb-query" value="预算校验失败时如何处理" />
                <button class="icon-btn" data-action="kb-search" aria-label="检索">${ic("arrow-right")}</button>
              </div>
              <div class="kb-test__meta">检索模式：混合检索 · top 4 · 阈值 0.72</div>
              <div class="kb-results">
                <div class="kb-result">
                  <div class="kb-result__head"><span class="kb-result__rank">01</span><span class="kb-result__title">财务主数据规范 v3.2 · 预算科目</span><span class="kb-result__score mono">0.94</span></div>
                  <div class="kb-result__bar"><i style="width:94%"></i></div>
                  <p>预算科目未配置时，回退到部门级预算并在界面提示「科目级预算未配置」…</p>
                  <span class="kb-result__cite">SAP 开发规范 · chunk 14</span>
                </div>
                <div class="kb-result">
                  <div class="kb-result__head"><span class="kb-result__rank">02</span><span class="kb-result__title">PDO-2024-118 · 采购申请预算校验</span><span class="kb-result__score mono">0.88</span></div>
                  <div class="kb-result__bar"><i style="width:88%"></i></div>
                  <p>BW 视图返回空时，记录警告并允许提交…</p>
                  <span class="kb-result__cite">PDO 历史需求 · chunk 07</span>
                </div>
                <div class="kb-result">
                  <div class="kb-result__head"><span class="kb-result__rank">03</span><span class="kb-result__title">预算校验接口 RE-204 · 幂等规则</span><span class="kb-result__score mono">0.81</span></div>
                  <div class="kb-result__bar"><i style="width:81%"></i></div>
                  <p>失败重试需复用幂等键，避免重复占用预算…</p>
                  <span class="kb-result__cite">接口与集成文档 · chunk 03</span>
                </div>
              </div>
              <div class="kb-test__foot">${ic("info")} 检索测试不会写入事件日志，可直接用于调参。</div>
            </div>
          </aside>
        </div>
      </div>`;
    },
    after(ctx, root) {
      root.querySelectorAll(".kb-filter button").forEach((b) => {
        b.addEventListener("click", () => {
          root.querySelectorAll(".kb-filter button").forEach((x) => x.classList.remove("is-active"));
          b.classList.add("is-active");
        });
      });
      root.querySelector("[data-action='kb-search']").addEventListener("click", (e) => {
        const btn = e.currentTarget;
        btn.classList.add("is-loading");
        SA.sequence(() => {
          btn.classList.remove("is-loading");
          root.querySelectorAll(".kb-result__score").forEach((s) => {
            s.textContent = (0.78 + Math.random() * 0.18).toFixed(2);
          });
          const results = root.querySelector(".kb-results");
          if (results && !SA.isShot) {
            results.classList.remove("anim-fade");
            void results.offsetWidth;
            results.classList.add("anim-fade");
          }
          SA.toast("检索完成，命中 3 个分片", { icon: "search" });
        }, 700);
      });
    },
  });
})();
