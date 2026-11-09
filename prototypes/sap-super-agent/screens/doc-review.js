/* ============================================================
   Screen · Document review (annotation + gate decision)
   ============================================================ */
(function () {
  const SA = window.SA;
  const ic = window.ic;

  const MD_SOURCE = [
    "# 采购申请审批流增加部门预算校验",
    "",
    "> R-2041 · 功能设计 · PDO 阶段 02 · v2",
    "> 负责人：林桦 · 评审时限：2026-11-08 18:00",
    "",
    "## 01 需求背景",
    "采购申请提交时，预算数据分散在 BW 报表与 Excel 台账中，采购员需要人工核对部门预算余额，存在遗漏与重复占用。",
    "",
    "## 02 方案概述",
    "- 在采购申请保存时触发预算校验，提交时再次确认余额未变化。",
    "- 校验口径为申请部门 + 费用类科目；数据来自 BW `ZBW_BUDGET` 汇总视图。",
    "- 超预算时允许保存与提交，但进入现有审批链。",
    "",
    "## 03 校验时序",
    "| 步骤 | 触发 | 行为 | 失败处理 |",
    "| --- | --- | --- | --- |",
    "| 01 | 保存采购申请 | 读取预算余额 | 记录警告，允许保存 |",
    "| 02 | 汇总申请金额 | 与预算比对 | 提示重试，不落库 |",
    "| 03 | 提交审批 | 附加审批原因 | 走既有审批异常 |",
    "",
    "## 04 数据来源与缓存",
    "预算余额通过 RFC 从 BW `ZBW_BUDGET` 读取。服务端缓存 4 小时；提交审批前强制刷新。缓存失效时回退到最近一次成功快照，并在界面标记数据时间。",
    "",
    "## 05 审批人推导与边界场景",
    "超预算申请沿用采购申请现有的审批链与批准人，不新增审批角色。预算数据缺失时记录警告，不阻断提交。",
    "",
    "## 06 验收标准映射",
    "- AC-01 提交时展示部门预算余额与占用额度",
    "- AC-02 超预算时阻止直接生成采购订单",
    "- AC-03 校验结果写入审批日志",
    "- AC-04 预算数据缺失时告警",
    "",
    "<!-- 本文由 Super Agent 生成；Markdown 为当前唯一文档格式，修改会生成新版本 -->",
  ].join("\n");

  SA.register("doc-review", {
    title: "文档评审",
    render(ctx) {
      const docKeys = {
        "requirement-analysis": { title: "需求分析文档", status: "已通过", tone: "green", version: "v3" },
        "functional-design": { title: "功能设计说明", status: "待确认", tone: "amber", version: "v2" },
        "tech-design": { title: "技术设计说明", status: "生成中", tone: "teal", version: "v1 草稿" },
      };
      const doc = docKeys[ctx.params.doc] || docKeys["functional-design"];
      return `
      <div class="page page-review">
        <div class="review-top">
          <div class="review-top__left">
            <a class="back-link" href="#/demands/R-2041">${ic("arrow-left")} R-2041 采购申请审批流增加部门预算校验</a>
            <div class="review-title-row">
              <h1>${doc.title}</h1>
              <span class="tag tag--mono" id="doc-version">${doc.version}</span>
              <span class="tag tag--mono">Markdown</span>
              <span class="pill pill--${doc.tone}"><span class="dot"></span>${doc.status}</span>
            </div>
            <div class="review-meta">
              <span class="user-line"><span class="avatar avatar--sm" data-tone="teal">林</span>林桦 · 需求顾问</span>
              <span class="meta-sep"></span>
              <span>AI 生成 · 人工修订 2 次</span>
              <span class="meta-sep"></span>
              <span class="mono">09:18 更新</span>
              <span class="meta-sep"></span>
              <span>${ic("git-commit")} G1 需求顾问确认</span>
            </div>
          </div>
          <div class="review-top__actions">
            <div class="segmented review-version">
              <button id="doc-version-btn">${ic("git-branch")} 版本 v2 ${ic("chevron-down")}</button>
            </div>
            <button class="btn" data-action="toggle-diff">${ic("columns")} 对比 v1</button>
            <button class="btn btn--ai" data-action="ai-regen">${ic("sparkles")} 交给 AI 生成新版本 <span class="regen-count" id="regen-count">2</span></button>
            <span class="review-top__sep"></span>
            <button class="btn btn--danger" data-action="reject">驳回</button>
            <button class="btn btn--primary" data-action="approve">${ic("check")} 通过 G1</button>
          </div>
        </div>

        <div class="review-layout">
          <!-- outline -->
          <aside class="review-outline card">
            <div class="review-outline__head">
              <span>文档目录</span>
              <span class="mono">6 节</span>
            </div>
            <nav class="outline-list">
              <a href="#sec-1" class="is-active" data-outline>01 需求背景</a>
              <a href="#sec-2" data-outline>02 方案概述</a>
              <a href="#sec-3" data-outline>03 校验时序</a>
              <a href="#sec-4" data-outline>04 数据来源</a>
              <a href="#sec-5" data-outline>05 边界场景</a>
              <a href="#sec-6" data-outline>06 验收映射</a>
            </nav>
            <div class="review-outline__foot">
              <div><span>批注</span><b>3</b></div>
              <div><span>未决</span><b class="amber">2</b></div>
              <div><span>引用</span><b>4</b></div>
            </div>
            <div class="outline-versions">
              <div class="outline-versions__head">版本历史</div>
              <div class="outline-version"><span class="mono">v2</span><span>当前 · 今天 09:18</span></div>
              <div class="outline-version"><span class="mono">v1</span><span>昨天 16:42</span></div>
            </div>
          </aside>

          <!-- document -->
          <article class="review-doc card" id="review-doc">
            <div class="doc-viewbar">
              <span class="doc-viewbar__format">${ic("file-text")} Markdown</span>
              <div class="segmented doc-view-seg">
                <button class="is-active" data-doc-view="preview">预览</button>
                <button data-doc-view="source">源码</button>
              </div>
              <span class="grow"></span>
              <span class="doc-viewbar__hint">渲染后只读 · 修改或 AI 重生成都会产生新版本</span>
              <button class="btn btn--sm btn--ghost" data-action="download-md">${ic("download")} 下载 .md</button>
            </div>
            <div class="ai-regen-banner" id="ai-regen-banner" hidden>
              <span class="ai-regen-banner__icon">${ic("sparkles")}</span>
              <span class="grow"><b>AI 已根据批注生成 v3</b><em>原 v2 保留；新版本基于 3 条批注修改，请重新确认。</em></span>
              <span class="pill pill--teal">Markdown</span>
            </div>
            <div class="doc-paper doc">
              <div class="doc-paper__kicker">R-2041 · 功能设计 · PDO 阶段 02</div>
              <h1>采购申请审批流增加部门预算校验</h1>
              <p class="doc-lead">在采购申请保存与提交链路中增加部门预算校验，预算不足时允许提交但进入现有审批链。本文定义校验时序、数据来源、审批人推导与异常处理。</p>

              <div class="doc-statusbar">
                <span>${ic("user")} 负责人 林桦</span>
                <span>${ic("clock")} 评审时限 11-08 18:00</span>
                <span>${ic("database")} 4 处知识引用</span>
                <span class="grow"></span>
                <span class="live-dot">G1 待确认</span>
              </div>

              <h2 id="sec-1">01 需求背景</h2>
              <p>采购申请提交时，预算数据分散在 BW 报表与 Excel 台账中，采购员需要人工核对部门预算余额，存在遗漏与重复占用。财务共享组希望在 SAP 内完成统一的校验与提示，并将超预算申请转入既有审批链。</p>
              <h2 id="sec-2">02 方案概述</h2>
              <p class="doc-diff-note">与 v1 相比：新增「数据缓存策略」「边界场景」「验收标准映射」，调整超预算审批路径。</p>
              <ul>
                <li>在采购申请<strong>保存</strong>时触发预算校验，提交时再次确认余额未变化。</li>
                <li>校验口径为<strong>申请部门 + 费用类科目</strong>；预算数据来自 BW <code>ZBW_BUDGET</code> 汇总视图。</li>
                <li>超预算时<strong>允许保存与提交</strong>，但生成审批提醒并进入现有采购申请审批链。</li>
                <li>预算数据缺失时记录警告，不阻断提交。</li>
              </ul>

              <h2 id="sec-3">03 校验时序</h2>
              <table>
                <thead><tr><th>步骤</th><th>触发</th><th>行为</th><th>失败处理</th></tr></thead>
                <tbody>
                  <tr><td><span class="mono">01</span></td><td>保存采购申请</td><td>读取部门 + 科目预算余额</td><td>记录警告，允许保存</td></tr>
                  <tr><td><span class="mono">02</span></td><td>汇总申请金额</td><td>与预算余额比对，计算占用率</td><td>提示重试，不落库</td></tr>
                  <tr><td><span class="mono">03</span></td><td>提交审批</td><td>超预算时附加审批原因</td><td>走既有审批异常</td></tr>
                </tbody>
              </table>

              <h2 id="sec-4">04 数据来源与缓存</h2>
              <p>预算余额通过 RFC 从 BW <code>ZBW_BUDGET</code> 读取，按会计年度、部门、费用类科目汇总。为避免每次保存都直连 BW，服务端缓存 <strong>4 小时</strong>；<span class="diff-add">提交审批前 <strong>强制刷新</strong>一次，保证决策数据的时效性。</span><span class="annotation" data-annotation="2">缓存失效时回退到最近一次成功快照，并在界面标记数据时间。<span class="annotation__pin">2</span></span></p>
              <blockquote>BW 视图为 T+1 更新，缓存时间窗需要与财务月结窗口兼容；月结最后一天默认关闭缓存。</blockquote>

              <h2 id="sec-5">05 审批人推导与边界场景</h2>
              <p>超预算申请沿用采购申请现有的审批链与批准人，<span class="annotation" data-annotation="1"><span class="diff-add">不新增审批角色，也不改变现有审批顺序</span><span class="diff-del">新增预算审批角色</span><span class="annotation__pin">1</span></span>。当预算数据缺失、金额为 0 或跨年度时，按下方规则处理：</p>
              <table>
                <thead><tr><th>场景</th><th>处理</th><th>是否阻断</th></tr></thead>
                <tbody>
                  <tr><td>BW 无返回</td><td>记录警告，界面提示数据缺失</td><td><span class="pill pill--green">否</span></td></tr>
                  <tr><td>预算余额为 0</td><td>按超预算处理，进入审批链</td><td><span class="pill pill--green">否</span></td></tr>
                  <tr><td>跨年度申请</td><td>按申请日期所属年度预算校验</td><td><span class="pill pill--green">否</span></td></tr>
                  <tr><td>预算科目未配置</td><td>回退到部门级预算并提示</td><td><span class="pill pill--amber">警告</span></td></tr>
                </tbody>
              </table>
              <p>需要在设计评审中确认的未决问题：<span class="annotation is-active" data-annotation="3">预算数据缺失时是否只记录警告、不阻断提交？<span class="annotation__pin">3</span></span> 目前方案为「不阻断，记录警告」。</p>

              <h2 id="sec-6">06 验收标准映射</h2>
              <ul class="doc-mapping">
                <li><span class="mono">AC-01</span>提交时展示部门预算余额与占用额度 <span class="tag tag--teal">已覆盖</span></li>
                <li><span class="mono">AC-02</span>超预算时阻止直接生成采购订单 <span class="tag tag--teal">已覆盖</span></li>
                <li><span class="mono">AC-03</span>校验结果写入审批日志 <span class="tag tag--teal">已覆盖</span></li>
                <li><span class="mono">AC-04</span>预算数据缺失时告警 <span class="tag tag--amber">待确认</span></li>
              </ul>

              <div class="doc-signature">
                <span>本文由 Super Agent 基于需求与 4 篇知识库生成，林桦修订。</span>
                <span class="mono">content sha256: 9f2c…41d</span>
              </div>
            </div>

            <div class="doc-source" id="doc-source" hidden>
              <div class="doc-source__head"><span>Markdown 源码</span><span class="mono">functional-design.md · v2</span></div>
              <pre id="doc-source-pre"></pre>
            </div>

            <div class="gate-bar">
              <div class="gate-bar__head">
                <span class="gate-bar__title">${ic("git-commit")} G1 · 需求顾问确认</span>
                <span class="pill pill--amber"><span class="dot"></span>2/3 检查通过</span>
              </div>
              <div class="gate-checks">
                <span class="gate-check is-ok">${ic("check")} 验收标准覆盖 4/4</span>
                <span class="gate-check is-ok">${ic("check")} 上游引用版本一致</span>
                <span class="gate-check is-warn">${ic("alert-circle")} 1 个未决问题待确认</span>
              </div>
              <textarea class="textarea gate-comment" rows="2" placeholder="审批意见（可选）…"></textarea>
              <div class="gate-bar__foot">
                <span class="sm">通过后进入技术设计阶段，并通知负责人与开发。</span>
                <span class="grow"></span>
                <button class="btn btn--danger" data-action="reject">驳回并退回</button>
                <button class="btn btn--primary" data-action="approve">${ic("check")} 通过并推进</button>
              </div>
            </div>
          </article>

          <!-- annotations -->
          <aside class="review-annot card">
            <div class="annot-head">
              <span>批注 <span class="mono">3</span></span>
              <div class="segmented annot-seg">
                <button class="is-active">全部</button>
                <button>未解决</button>
              </div>
            </div>

            <div class="annot-list">
              <div class="annot-card is-resolved" data-annot-card="1">
                <div class="annot-card__head">
                  <span class="avatar avatar--sm" data-tone="teal">林</span>
                  <span class="grow"><b>林桦</b><em>需求顾问 · 09:26</em></span>
                  <span class="annot-card__n">1</span>
                </div>
                <div class="annot-card__quote">“不新增审批角色，也不改变现有审批顺序”</div>
                <div class="annot-card__text">沿用现有批准人即可，但要在提交页展示「超预算」标记，方便审批人识别。</div>
                <div class="annot-card__actions">
                  <button class="annot-action is-done">${ic("check")} 已处理</button>
                  <button class="annot-action" data-action="reply">回复</button>
                </div>
              </div>

              <div class="annot-card is-unresolved" data-annot-card="2">
                <div class="annot-card__head">
                  <span class="avatar avatar--sm" data-tone="blue">周</span>
                  <span class="grow"><b>周予</b><em>SAP IT · 09:31</em></span>
                  <span class="annot-card__n">2</span>
                </div>
                <div class="annot-card__quote">“缓存失效时回退到最近一次成功快照，并在界面标记数据时间”</div>
                <div class="annot-card__text">建议补充过期快照的最大可接受时长（比如 24h），超过则直接提示重试，不用旧数据做审批决策。</div>
                <div class="annot-card__actions">
                  <button class="annot-action" data-action="resolve-annot">${ic("check")} 标记解决</button>
                  <button class="annot-action" data-action="reply">回复</button>
                </div>
              </div>

              <div class="annot-card is-unresolved is-active" data-annot-card="3">
                <div class="annot-card__head">
                  <span class="avatar avatar--sm" data-tone="ink">陈</span>
                  <span class="grow"><b>陈曦</b><em>业务方 · 09:38</em></span>
                  <span class="annot-card__n">3</span>
                </div>
                <div class="annot-card__quote">“预算数据缺失时是否只记录警告、不阻断提交？”</div>
                <div class="annot-card__text">确认：预算数据缺失时不阻断，记录警告即可；但要在申请单上留下可追溯的记录，方便财务事后核查。</div>
                <div class="annot-card__actions">
                  <button class="annot-action" data-action="resolve-annot">${ic("check")} 标记解决</button>
                  <button class="annot-action" data-action="reply">回复</button>
                </div>
              </div>

              <div class="annot-ai">
                <div class="annot-ai__head">${ic("sparkles")} AI 建议</div>
                <p>根据周予与陈曦的批注，建议在「04 数据来源与缓存」补充：<b>快照过期上限 24h</b>、<b>缺失时记录审计字段</b>。需要我直接生成 v3 修订吗？</p>
                <div class="annot-ai__actions">
                  <button class="btn btn--sm" data-action="apply-ai">应用建议</button>
                  <button class="btn btn--sm btn--ghost" data-action="dismiss-ai">忽略</button>
                </div>
              </div>
            </div>

            <div class="annot-input">
              <div class="annot-input__row">
                <span class="avatar avatar--sm" data-tone="ink">陈</span>
                <input class="input" id="annot-field" placeholder="选中文字后添加批注，或 @AI 提问…" />
                <button class="icon-btn" data-action="add-annot" aria-label="发送">${ic("send")}</button>
              </div>
              <div class="annot-input__hint">${ic("info")} 批注会保留在版本历史中，通过门禁后仍可追溯。</div>
            </div>
          </aside>
        </div>
      </div>`;
    },
    after(ctx, root) {
      // markdown source
      const mdPre = root.querySelector("#doc-source-pre");
      if (mdPre) mdPre.textContent = MD_SOURCE;
      const regenBtn = root.querySelector("[data-action='ai-regen']");
      const regenCount = root.querySelector("#regen-count");
      function unresolved() {
        return Array.from(root.querySelectorAll(".annot-card.is-unresolved"));
      }
      function updateRegenCount() {
        const n = unresolved().length;
        if (regenCount) regenCount.textContent = String(n);
        if (regenBtn) {
          regenBtn.disabled = n === 0;
          if (n === 0 && !regenBtn.dataset.done) regenBtn.classList.add("is-disabled");
          else regenBtn.classList.remove("is-disabled");
        }
      }
      root.querySelectorAll("[data-doc-view]").forEach((btn) => {
        btn.addEventListener("click", () => {
          root.querySelectorAll("[data-doc-view]").forEach((b) => b.classList.toggle("is-active", b === btn));
          const isSource = btn.dataset.docView === "source";
          const paper = root.querySelector(".doc-paper");
          const source = root.querySelector("#doc-source");
          if (paper) paper.hidden = isSource;
          if (source) source.hidden = !isSource;
        });
      });
      const download = root.querySelector("[data-action='download-md']");
      if (download) {
        download.addEventListener("click", () => SA.toast("已开始下载 functional-design-v2.md", { icon: "download" }));
      }
      function openRegen() {
        const cards = unresolved();
        if (!cards.length) {
          SA.toast("没有待处理批注，可直接通过门禁");
          return;
        }
        const list = cards.map((c) => {
          const quote = c.querySelector(".annot-card__quote");
          const text = c.querySelector(".annot-card__text");
          return '<div class="regen-item"><b>' + (quote ? quote.textContent.trim() : "批注") + "</b><em>" + (text ? text.textContent.trim() : "") + "</em></div>";
        }).join("");
        SA.modal({
          title: "交给 AI 生成新版本",
          desc: "把未解决的批注作为修订指令，AI 会基于当前 Markdown 生成新版本。原版本保留且可追溯。",
          wide: true,
          body:
            '<div class="regen-summary">' + ic("sparkles") + '<span>将处理 <b>' + cards.length + " 条未解决批注</b>，生成 v3 Markdown 文档；不会覆盖 v2。</span></div>" +
            '<div class="regen-list">' + list + "</div>" +
            '<div class="callout callout--blue" style="margin-top:12px">' + ic("info") + "<span>生成后仍需要在文档评审中确认；AI 不会直接通过门禁。</span></div>",
          actions: [
            { label: "取消", variant: "ghost" },
            {
              label: "生成 v3",
              variant: "primary",
              onClick: () => {
                regenBtn.classList.add("is-loading");
                setTimeout(() => {
                  regenBtn.classList.remove("is-loading");
                  regenBtn.dataset.done = "1";
                  regenBtn.innerHTML = ic("check") + " 已生成 v3";
                  regenBtn.classList.add("is-done");
                  root.querySelector("#doc-version").textContent = "v3";
                  const vbtn = root.querySelector("#doc-version-btn");
                  if (vbtn) vbtn.innerHTML = ic("git-branch") + " 版本 v3 " + ic("chevron-down");
                  const versions = root.querySelector(".outline-versions");
                  if (versions && !versions.querySelector('[data-v3]')) {
                    const row = document.createElement("div");
                    row.className = "outline-version";
                    row.dataset.v3 = "1";
                    row.innerHTML = '<span class="mono">v3</span><span>AI 根据批注生成 · 刚刚</span>';
                    const head = versions.querySelector(".outline-versions__head");
                    if (head) head.after(row);
                  }
                  const banner = root.querySelector("#ai-regen-banner");
                  if (banner) banner.hidden = false;
                  unresolved().forEach((c) => {
                    c.classList.add("is-resolved");
                    c.classList.remove("is-unresolved");
                    const n = c.querySelector(".annot-card__n");
                    if (n) n.textContent = "✓";
                  });
                  if (regenCount) regenCount.textContent = "0";
                  if (regenBtn) {
                    regenBtn.disabled = true;
                    regenBtn.classList.add("is-disabled");
                  }
                  SA.toast("AI 已根据批注生成 v3（Markdown）", { icon: "sparkles" });
                }, 1400);
              },
            },
          ],
        });
      }
      if (regenBtn) regenBtn.addEventListener("click", openRegen);
      // markdown source / scroll etc.
      // outline scroll spy
      root.querySelectorAll("[data-outline]").forEach((a) => {
        a.addEventListener("click", (e) => {
          e.preventDefault();
          const target = document.querySelector(a.getAttribute("href"));
          if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
          root.querySelectorAll("[data-outline]").forEach((x) => x.classList.toggle("is-active", x === a));
        });
      });
      // annotation pins
      function focusAnnot(n) {
        root.querySelectorAll("[data-annot-card]").forEach((c) => {
          c.classList.toggle("is-active", c.dataset.annotCard === n);
        });
        root.querySelectorAll(".annotation").forEach((a) => {
          a.classList.toggle("is-active", a.dataset.annotation === n);
        });
        const card = root.querySelector('[data-annot-card="' + n + '"]');
        if (card) card.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      root.querySelectorAll(".annotation").forEach((a) => {
        a.addEventListener("click", () => focusAnnot(a.dataset.annotation));
      });
      root.querySelectorAll("[data-annot-card]").forEach((card) => {
        card.addEventListener("click", (e) => {
          if (e.target.closest("button")) return;
          focusAnnot(card.dataset.annotCard);
        });
      });
      // resolve
      root.querySelectorAll("[data-action='resolve-annot']").forEach((b) => {
        b.addEventListener("click", () => {
          const card = b.closest(".annot-card");
          card.classList.remove("is-unresolved");
          card.classList.add("is-resolved");
          b.innerHTML = ic("check") + " 已解决";
          SA.toast("批注已标记为解决");
          updateAnnotCount();
          if (typeof updateRegenCount === "function") updateRegenCount();
        });
      });
      root.querySelectorAll("[data-action='reply']").forEach((b) => {
        b.addEventListener("click", () => {
          document.getElementById("annot-field").focus();
        });
      });
      function updateAnnotCount() {
        const rest = root.querySelectorAll(".annot-card.is-unresolved").length;
        const el = root.querySelector(".annot-head .mono");
        if (el) el.textContent = rest;
        const unresolved = root.querySelector(".annot-head .annot-seg button:last-child");
        if (unresolved) unresolved.textContent = "未解决 " + rest;
      }
      // add annotation
      const field = root.querySelector("#annot-field");
      function addAnnot() {
        const text = field.value.trim();
        if (!text) {
          SA.toast("先写下批注内容");
          return;
        }
        const list = root.querySelector(".annot-list");
        const ai = list.querySelector(".annot-ai");
        const card = document.createElement("div");
        card.className = "annot-card is-unresolved";
        card.dataset.annotCard = "new";
        card.innerHTML =
          '<div class="annot-card__head"><span class="avatar avatar--sm" data-tone="ink">陈</span><span class="grow"><b>陈曦</b><em>业务方 · 刚刚</em></span><span class="annot-card__n">新</span></div>' +
          '<div class="annot-card__text">' +
          SA.h(text) +
          '</div><div class="annot-card__actions"><button class="annot-action" data-action="resolve-annot">' +
          ic("check") +
          ' 标记解决</button></div>';
        list.insertBefore(card, ai);
        field.value = "";
        SA.toast("批注已添加");
        updateAnnotCount();
        if (typeof updateRegenCount === "function") updateRegenCount();
        card.querySelector("[data-action='resolve-annot']").addEventListener("click", (e) => {
          card.classList.add("is-resolved");
          e.currentTarget.innerHTML = ic("check") + " 已解决";
          updateAnnotCount();
        });
      }
      root.querySelector("[data-action='add-annot']").addEventListener("click", addAnnot);
      field.addEventListener("keydown", (e) => {
        if (e.key === "Enter") addAnnot();
      });
      // diff toggle
      root.querySelector("[data-action='toggle-diff']").addEventListener("click", (e) => {
        const doc = root.querySelector("#review-doc");
        const on = doc.classList.toggle("is-diff");
        e.currentTarget.classList.toggle("is-active", on);
        SA.toast(on ? "已显示与 v1 的差异" : "已隐藏差异");
      });
      // AI suggestion
      root.querySelector("[data-action='apply-ai']").addEventListener("click", () => {
        SA.toast("已生成 v3 修订，刷新审阅视图", { icon: "sparkles" });
      });
      root.querySelector("[data-action='dismiss-ai']").addEventListener("click", (e) => {
        e.currentTarget.closest(".annot-ai").remove();
      });
      // gate decisions
      function decide(approve) {
        SA.modal({
          title: approve ? "通过 G1 门禁" : "驳回并退回",
          desc: approve
            ? "通过后阶段进入技术设计，文档标记为已批准，并通知负责人。"
            : "驳回会生成新的修订版本，当前版本保留在历史中。",
          body: approve
            ? '<div class="confirm-list">' +
              '<div class="confirm-row"><span class="ok">' + ic("check") + '</span>验收标准覆盖 4/4</div>' +
              '<div class="confirm-row"><span class="ok">' + ic("check") + '</span>上游引用版本一致</div>' +
              '<div class="confirm-row"><span class="warn">' + ic("alert-circle") + '</span>1 个未决问题（已接受建议）</div>' +
              "</div>"
            : '<div class="field"><span class="field__label">驳回原因</span><textarea class="textarea" rows="3" placeholder="说明需要修改的内容…"></textarea></div>',
          actions: [
            { label: "取消", variant: "ghost" },
            {
              label: approve ? "确认通过" : "确认驳回",
              variant: approve ? "primary" : "danger",
              onClick: () => {
                SA.toast(approve ? "G1 已通过，进入技术设计" : "已驳回，等待修订");
                setTimeout(() => SA.go("#/demands/R-2041"), 400);
              },
            },
          ],
        });
      }
      root.querySelectorAll("[data-action='approve']").forEach((b) => b.addEventListener("click", () => decide(true)));
      if (ctx.query && ctx.query.get("md") === "source") {
        const srcBtn = root.querySelector("[data-doc-view='source']");
        if (srcBtn) srcBtn.click();
      }
      if (ctx.query && ctx.query.get("regen") === "1") {
        setTimeout(() => { if (regenBtn) regenBtn.click(); }, 120);
      }
      root.querySelectorAll("[data-action='reject']").forEach((b) => b.addEventListener("click", () => decide(false)));
      // segmented annot tabs
      root.querySelectorAll(".annot-seg button").forEach((b) => {
        b.addEventListener("click", () => {
          root.querySelectorAll(".annot-seg button").forEach((x) => x.classList.remove("is-active"));
          b.classList.add("is-active");
          root.querySelectorAll(".annot-card").forEach((c) => {
            c.hidden = b === b.parentElement.lastElementChild && !c.classList.contains("is-unresolved");
          });
        });
      });
    },
  });
})();
