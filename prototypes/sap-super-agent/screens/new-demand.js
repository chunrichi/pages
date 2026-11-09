/* ============================================================
   Screen · New demand wizard (AI clarification + knowledge + Teams)
   ============================================================ */
(function () {
  const SA = window.SA;
  const ic = window.ic;

  const STEP_LABELS = ["需求信息", "AI 澄清", "确认提交"];

  function stepper(active) {
    return `
    <div class="wizard-steps">
      ${STEP_LABELS.map(
        (label, i) => `
        <div class="wizard-step ${i === active ? "is-current" : i < active ? "is-done" : ""}" data-step-indicator="${i}">
          <span class="wizard-step__num">${i < active ? ic("check") : "0" + (i + 1)}</span>
          <span class="wizard-step__meta">
            <span class="wizard-step__label">${label}</span>
            <span class="wizard-step__sub">${["描述需求、指派负责人", "AI + 知识库生成问题", "确认并通知 Team"][i]}</span>
          </span>
          ${i < 2 ? '<span class="wizard-step__line"></span>' : ""}
        </div>`
      ).join("")}
    </div>`;
  }

  function knowledge(mini) {
    const items = [
      { title: "PDO-2024-118 · 采购申请预算校验", meta: "历史需求 · 相似度 92%", tone: "teal" },
      { title: "财务主数据规范 v3.2 · 预算科目", meta: "规范文档 · 相关章节 3 节", tone: "blue" },
      { title: "MM 采购审批流设计说明", meta: "知识库 · 2026-08 更新", tone: "violet" },
      { title: "预算校验接口 RE-204 · 幂等规则", meta: "接口文档 · 2 处引用", tone: "amber" },
    ];
    return `
      <div class="knowledge-list ${mini ? "knowledge-list--mini" : ""}">
        ${items
          .map(
            (k) => `
          <div class="knowledge-item">
            <span class="knowledge-item__icon knowledge-item__icon--${k.tone}">${ic("file-text")}</span>
            <span class="knowledge-item__main">
              <span class="knowledge-item__title">${k.title}</span>
              <span class="knowledge-item__meta">${k.meta}</span>
            </span>
            <span class="knowledge-item__pin">${ic("bookmark")}</span>
          </div>`
          )
          .join("")}
      </div>`;
  }

  SA.register("new-demand", {
    title: "新建需求",
    render() {
      return `
      <div class="page page-new-demand">
        <div class="page-head">
          <div class="page-head__main">
            <a class="back-link" href="#/demands">${ic("arrow-left")} 需求列表</a>
            <div class="eyebrow" style="margin-top:6px">NEW DEMAND · 新建需求</div>
            <div class="page-head__title">
              <h1>把一个想法，变成可交付的需求</h1>
            </div>
            <p class="page-head__desc">描述问题与期望，AI 会结合知识库完成澄清，你确认后再通知负责人。</p>
          </div>
          <div class="page-head__actions">
            <span class="save-status">${ic("check")} 草稿已自动保存</span>
            <a class="btn btn--ghost" href="#/demands">取消</a>
          </div>
        </div>

        <div class="wizard">
          ${stepper(0)}

          <div class="wizard-body">
            <div class="wizard-main card">
              <!-- STEP 1 -->
              <section class="wizard-panel" data-panel="0">
                <div class="wizard-panel__head">
                  <h2>需求信息</h2>
                  <span class="sm">带 <span class="req">*</span> 为必填 · 支持 Markdown</span>
                </div>
                <div class="wizard-panel__body">
                  <div class="field">
                    <label class="field__label" for="nd-title">需求标题 <span class="req">*</span></label>
                    <input class="input input--lg" id="nd-title" value="采购申请审批流增加部门预算校验" />
                  </div>

                  <div class="field">
                    <label class="field__label" for="nd-desc">需求描述 <span class="req">*</span></label>
                    <textarea class="textarea" id="nd-desc" rows="5">采购申请提交时，需要按申请部门和费用科目校验预算余额。超预算时进入部门负责人审批，而不是直接生成采购订单。

目前 PDO 流程中没有统一的校验点，预算数据分散在 BW 报表里，人工核对耗时且容易遗漏。</textarea>
                    <div class="field__hint row gap-2"><span class="mono">1,284 / 8,000</span><span class="dot-sep"></span><span>可以粘贴 SAP 截图、错误信息或现有流程说明</span></div>
                  </div>

                  <div class="form-grid">
                    <div class="field">
                      <span class="field__label">优先级</span>
                      <div class="segmented seg-choice" data-choice="priority">
                        <button class="is-active">高</button>
                        <button>中</button>
                        <button>低</button>
                      </div>
                    </div>
                    <div class="field">
                      <label class="field__label" for="nd-due">期望上线</label>
                      <input class="input" id="nd-due" type="date" value="2026-11-18" />
                    </div>
                    <div class="field">
                      <label class="field__label" for="nd-jira">关联 JIRA</label>
                      <select class="select" id="nd-jira">
                        <option>SAP-1187 · 预算校验（自动匹配）</option>
                        <option>不关联 JIRA</option>
                      </select>
                    </div>
                    <div class="field">
                      <label class="field__label" for="nd-type">需求类型</label>
                      <select class="select" id="nd-type">
                        <option>流程优化</option>
                        <option>报表 / 分析</option>
                        <option>接口集成</option>
                        <option>合规 / 审计</option>
                      </select>
                    </div>
                  </div>

                  <div class="field">
                    <span class="field__label">负责人 <span class="sm">（可多选，通知会 @ 他们）</span></span>
                    <div class="owner-picker" id="owner-picker">
                      <div class="owner-picker__selected" id="owner-selected">
                        <span class="owner-chip" data-owner="林桦"><span class="avatar avatar--sm" data-tone="teal">林</span>林桦<span class="owner-chip__role">需求顾问</span><button class="owner-chip__x" aria-label="移除">${ic("x")}</button></span>
                        <span class="owner-chip" data-owner="陈曦"><span class="avatar avatar--sm" data-tone="ink">陈</span>陈曦<span class="owner-chip__role">业务</span><button class="owner-chip__x" aria-label="移除">${ic("x")}</button></span>
                        <button class="owner-picker__add" data-action="owner-picker">${ic("plus")} 添加负责人</button>
                      </div>
                      <div class="owner-picker__menu" id="owner-menu" hidden>
                        <div class="menu-label">财务共享组 · 12 人</div>
                        <button class="owner-option" data-add-owner="周予"><span class="avatar avatar--sm" data-tone="blue">周</span><span class="grow"><b>周予</b><em>SAP IT · ABAP</em></span>${ic("plus")}</button>
                        <button class="owner-option" data-add-owner="沈珂"><span class="avatar avatar--sm" data-tone="violet">沈</span><span class="grow"><b>沈珂</b><em>SAP IT · 前端 / 集成</em></span>${ic("plus")}</button>
                        <button class="owner-option" data-add-owner="顾遥"><span class="avatar avatar--sm" data-tone="amber">顾</span><span class="grow"><b>顾遥</b><em>测试</em></span>${ic("plus")}</button>
                        <button class="owner-option" data-add-owner="王栎"><span class="avatar avatar--sm" data-tone="rose">王</span><span class="grow"><b>王栎</b><em>Basis / ChaRM</em></span>${ic("plus")}</button>
                      </div>
                    </div>
                  </div>

                  <div class="field">
                    <span class="field__label">附件 <span class="sm">（原型 / 截图 / 现有流程文档）</span></span>
                    <div class="dropzone" data-action="add-file">
                      <span class="dropzone__icon">${ic("upload")}</span>
                      <span class="grow">
                        <span class="dropzone__title">拖拽文件到此处，或点击选择</span>
                        <span class="dropzone__hint">支持 PDF、PPTX、XLSX、PNG，单个文件不超过 20MB</span>
                      </span>
                      <span class="btn btn--sm">选择文件</span>
                    </div>
                    <div class="file-list" id="file-list">
                      <div class="file-row">
                        <span class="file-row__icon">PDF</span>
                        <span class="file-row__meta"><span class="file-row__name">预算校验现状流程.pdf</span><span class="file-row__size">1.8 MB · 已上传</span></span>
                        <span class="pill pill--green"><span class="dot"></span>就绪</span>
                        <button class="icon-btn icon-btn--sm" data-action="remove-file" aria-label="移除">${ic("x")}</button>
                      </div>
                      <div class="file-row">
                        <span class="file-row__icon">PNG</span>
                        <span class="file-row__meta"><span class="file-row__name">BW-预算余额截图.png</span><span class="file-row__size">640 KB · 已上传</span></span>
                        <span class="pill pill--green"><span class="dot"></span>就绪</span>
                        <button class="icon-btn icon-btn--sm" data-action="remove-file" aria-label="移除">${ic("x")}</button>
                      </div>
                    </div>
                  </div>

                  <div class="field">
                    <span class="field__label">AI 澄清使用哪些知识库</span>
                    <div class="chip-select">
                      <button class="chip is-active">${ic("check")} PDO 历史需求</button>
                      <button class="chip is-active">${ic("check")} SAP 开发规范</button>
                      <button class="chip is-active">${ic("check")} 财务月结 SOP</button>
                      <button class="chip">${ic("plus")} 主数据规则</button>
                    </div>
                  </div>
                </div>
                <div class="wizard-foot">
                  <span class="sm">下一步：AI 结合 4 篇知识库文档，生成澄清问题。</span>
                  <span class="grow"></span>
                  <button class="btn btn--ghost" data-action="save-draft">保存草稿</button>
                  <button class="btn btn--primary" data-step-go="1">开始 AI 澄清 ${ic("arrow-right")}</button>
                </div>
              </section>

              <!-- STEP 2 -->
              <section class="wizard-panel" data-panel="1" hidden>
                <div class="wizard-panel__head">
                  <div class="row gap-2">
                    <span class="ai-avatar">${ic("sparkles")}</span>
                    <div>
                      <h2>AI 澄清</h2>
                      <span class="sm">已检索 4 篇知识库 · 发现 3 个需要确认的点</span>
                    </div>
                  </div>
                  <span class="pill pill--teal"><span class="dot"></span>置信度 86%</span>
                </div>
                <div class="wizard-panel__body">
                  <div class="ai-trace">
                    <span class="ai-trace__step is-done">${ic("search")} 检索知识库</span>
                    <span class="ai-trace__arrow">${ic("chevron-right")}</span>
                    <span class="ai-trace__step is-done">${ic("brain")} 需求理解</span>
                    <span class="ai-trace__arrow">${ic("chevron-right")}</span>
                    <span class="ai-trace__step is-done">${ic("message")} 生成澄清问题</span>
                    <span class="ai-trace__arrow">${ic("chevron-right")}</span>
                    <span class="ai-trace__step is-active">${ic("clipboard")} 等待你确认</span>
                  </div>

                  <div class="chat clarify-chat">
                    <div class="msg">
                      <span class="msg__avatar">${ic("sparkles")}</span>
                      <div class="msg__bubble">
                        <p>我已经读完了你的描述和 2 个附件。结合 <strong>PDO-2024-118</strong> 与 <strong>财务主数据规范 v3.2</strong>，初步理解如下：</p>
                        <p>在采购申请的保存校验中新增「部门预算余额」检查；超预算时阻止直接生成采购订单，转交部门负责人审批。预算数据来自 BW 的 <code>ZBW_BUDGET</code> 汇总视图。</p>
                        <p>有 3 个地方会影响实现方案，想和你确认：</p>
                        <div class="clarify-questions">
                          <div class="clarify-q is-answered">
                            <span class="clarify-q__n">01</span>
                            <span class="clarify-q__main"><b>预算不足时是拦截，还是允许提交但升级审批？</b><span class="clarify-q__answer">${ic("check")} 允许提交，进入部门负责人审批</span></span>
                          </div>
                          <div class="clarify-q is-answered">
                            <span class="clarify-q__n">02</span>
                            <span class="clarify-q__main"><b>预算口径按「部门」还是「部门 + 费用科目」？</b><span class="clarify-q__answer">${ic("check")} 按部门和费用科目组合校验</span></span>
                          </div>
                          <div class="clarify-q">
                            <span class="clarify-q__n">03</span>
                            <span class="clarify-q__main"><b>超预算审批人如何确定？是否沿用采购申请的现有审批人？</b><span class="clarify-q__options"><button class="chip chip--option is-active">沿用现有审批人</button><button class="chip chip--option">按预算负责人</button><button class="chip chip--option">手动指定</button></span></span>
                          </div>
                        </div>
                        <div class="msg__meta">Super Agent · deepseek-v4 · 引用 4 篇知识库 · 12:04</div>
                      </div>
                    </div>
                    <div class="msg msg--user">
                      <span class="msg__avatar">陈</span>
                      <div class="msg__bubble"><p>超预算审批人沿用现有采购申请审批人；预算口径按部门和费用科目组合，科目取费用类科目。</p><div class="msg__meta">12:06</div></div>
                    </div>
                    <div class="msg msg--ai" id="ai-followup">
                      <span class="msg__avatar">${ic("sparkles")}</span>
                      <div class="msg__bubble">
                        <p>明白了。已更新澄清结论：</p>
                        <ul class="clarify-summary">
                          <li>校验点：采购申请保存时，按「部门 + 费用类科目」实时汇总预算占用。</li>
                          <li>超预算：允许保存，提交后进入现有采购申请审批链，审批人不变。</li>
                          <li>数据源：BW <code>ZBW_BUDGET</code> 汇总视图，T+1 更新，允许 4 小时缓存。</li>
                        </ul>
                        <p>我补充了一个边界情况：<strong>预算数据缺失时的处理</strong>。建议按「不阻断、记录警告并进入审批」处理，你可以在右侧确认。</p>
                        <div class="msg__meta">Super Agent · 12:07</div>
                      </div>
                    </div>
                  </div>

                  <div class="clarify-input">
                    <input class="input" placeholder="继续补充说明，或直接确认…" />
                    <button class="btn btn--primary" data-action="clarify-send">${ic("send")}</button>
                  </div>
                </div>
                <div class="wizard-foot">
                  <button class="btn btn--ghost" data-step-go="0">${ic("arrow-left")} 上一步</button>
                  <span class="sm">澄清结果会写入需求分析文档 v1</span>
                  <span class="grow"></span>
                  <button class="btn" data-action="re-clarify">${ic("refresh")} 重新生成</button>
                  <button class="btn btn--primary" data-step-go="2">确认澄清 ${ic("arrow-right")}</button>
                </div>
              </section>

              <!-- STEP 3 -->
              <section class="wizard-panel" data-panel="2" hidden>
                <div class="wizard-panel__head">
                  <h2>确认提交</h2>
                  <span class="sm">提交后会自动创建需求、生成分析文档并通知负责人</span>
                </div>
                <div class="wizard-panel__body">
                  <div class="review-card">
                    <div class="review-card__head">
                      <span class="mono">R-2048</span>
                      <span class="pill pill--amber"><span class="dot"></span>待提交</span>
                    </div>
                    <h3>采购申请审批流增加部门预算校验</h3>
                    <p class="sm">采购申请提交时按申请部门和费用科目校验预算余额，超预算时进入部门负责人审批，而不是直接生成采购订单。</p>
                    <div class="review-meta">
                      <span>${ic("user")} 林桦、陈曦</span>
                      <span>${ic("flag")} 高优先级</span>
                      <span>${ic("calendar")} 期望 11-18 上线</span>
                      <span>${ic("paperclip")} 2 个附件</span>
                      <span>${ic("database")} 4 篇知识库引用</span>
                    </div>
                  </div>

                  <div class="confirm-grid">
                    <div class="teams-preview">
                      <div class="teams-preview__head">
                        <span class="teams-preview__icon">${ic("slack")}</span>
                        <span><b>Microsoft Teams</b><em>#fin-sap-it · 通知预览</em></span>
                        <span class="grow"></span>
                        <span class="pill pill--green"><span class="dot"></span>已连接</span>
                      </div>
                      <div class="teams-preview__msg">
                        <div class="teams-preview__msg-head"><span class="teams-preview__bot">SA</span><b>Super Agent</b><span class="mono">12:08</span></div>
                        <p><b>新需求待澄清确认</b></p>
                        <p>R-2048 采购申请审批流增加部门预算校验<br />优先级：高 · 期望上线：11-18</p>
                        <p>@林桦 @陈曦 请在 AI 澄清后确认需求分析。</p>
                        <div class="teams-preview__btn">打开需求</div>
                      </div>
                    </div>

                    <div class="submit-facts">
                      <div class="submit-fact"><span class="submit-fact__k">${ic("layers")} 所属小组</span><span class="submit-fact__v">财务共享组 FIN-SH</span></div>
                      <div class="submit-fact"><span class="submit-fact__k">${ic("workflow")} 使用模板</span><span class="submit-fact__v">PDO 六阶段 · v4</span></div>
                      <div class="submit-fact"><span class="submit-fact__k">${ic("git-commit")} 首个门禁</span><span class="submit-fact__v">G1 需求顾问确认</span></div>
                      <div class="submit-fact"><span class="submit-fact__k">${ic("send")} 通知时机</span><span class="submit-fact__v">提交后立即发送 Teams</span></div>
                      <div class="submit-fact"><span class="submit-fact__k">${ic("activity")} 预计耗时</span><span class="submit-fact__v">1–2 分钟生成分析文档</span></div>
                    </div>
                  </div>

                  <div class="callout callout--blue">
                    ${ic("info")}
                    <span>提交后会写入 SAP 需求系统并触发 <code>demand.submitted</code> 事件；Teams 通知走 hook 队列，可在「队列与事件」查看每次投递。</span>
                  </div>
                </div>
                <div class="wizard-foot">
                  <button class="btn btn--ghost" data-step-go="1">${ic("arrow-left")} 上一步</button>
                  <span class="grow"></span>
                  <button class="btn btn--primary btn--lg" data-action="submit-demand">确认并提交需求 ${ic("arrow-right")}</button>
                </div>
              </section>
            </div>

            <aside class="wizard-aside">
              <div class="aside-panel" data-aside="0">
                <div class="aside-card">
                  <div class="aside-card__head">${ic("sparkles")} AI 会做什么</div>
                  <div class="aside-checklist">
                    <div><span class="aside-check">1</span><span><b>检索历史需求</b><em>找出相似方案与已知约束</em></span></div>
                    <div><span class="aside-check">2</span><span><b>生成澄清问题</b><em>针对方案影响点逐条提问</em></span></div>
                    <div><span class="aside-check">3</span><span><b>起草需求分析</b><em>确认后生成 v1 并进入 G1</em></span></div>
                    <div><span class="aside-check">4</span><span><b>通知负责人</b><em>Teams @ 负责人并附深链</em></span></div>
                  </div>
                </div>
                <div class="aside-card">
                  <div class="aside-card__head">${ic("database")} 相似历史需求 <span class="tag">4</span></div>
                  ${knowledge(true)}
                </div>
                <div class="aside-hint">${ic("lock")} 附件与描述仅当前小组可见，不会用于模型训练。</div>
              </div>

              <div class="aside-panel" data-aside="1" hidden>
                <div class="aside-card aside-card--teal">
                  <div class="aside-card__head">${ic("check-circle")} 澄清结果</div>
                  <div class="confidence">
                    <span class="confidence__num">86<span>%</span></span>
                    <span class="confidence__main"><b>可以进入设计</b><em>1 个边界情况待确认</em></span>
                  </div>
                  <div class="aside-kv">
                    <div><span>校验口径</span><b>部门 + 费用类科目</b></div>
                    <div><span>超预算处理</span><b>允许提交 · 升级审批</b></div>
                    <div><span>数据源</span><b>BW ZBW_BUDGET · T+1</b></div>
                    <div><span>未决项</span><b>预算数据缺失时告警</b></div>
                  </div>
                  <button class="btn btn--sm btn--block" data-action="confirm-edge">${ic("check")} 接受建议：不阻断</button>
                </div>
                <div class="aside-card">
                  <div class="aside-card__head">${ic("database")} 引用来源 <span class="tag">4</span></div>
                  ${knowledge(true)}
                </div>
                <div class="aside-hint">${ic("info")} AI 输出会带上引用编号，可在评审时逐条核对。</div>
              </div>

              <div class="aside-panel" data-aside="2" hidden>
                <div class="aside-card">
                  <div class="aside-card__head">${ic("route")} 提交后会怎样</div>
                  <div class="mini-timeline">
                    <div class="mini-timeline__item is-done"><span></span><b>需求创建</b><em>写入 SAP · R-2048</em></div>
                    <div class="mini-timeline__item is-active"><span></span><b>AI 需求分析</b><em>生成文档 v1 · 约 60s</em></div>
                    <div class="mini-timeline__item"><span></span><b>G1 门禁</b><em>林桦确认为负责人</em></div>
                    <div class="mini-timeline__item"><span></span><b>通知负责人</b><em>Teams + 站内通知</em></div>
                  </div>
                </div>
                <div class="aside-card">
                  <div class="aside-card__head">${ic("slack")} 通知订阅者</div>
                  <div class="subscriber-row"><span class="avatar avatar--sm" data-tone="teal">林</span><span><b>林桦</b><em>需求顾问 · 被 @</em></span></div>
                  <div class="subscriber-row"><span class="avatar avatar--sm" data-tone="ink">陈</span><span><b>陈曦</b><em>业务方 · 被 @</em></span></div>
                  <div class="subscriber-row"><span class="avatar avatar--sm" data-tone="slate">组</span><span><b>财务共享组</b><em>频道订阅 · #fin-sap-it</em></span></div>
                </div>
                <div class="aside-hint">${ic("shield")} 提交动作会写入不可变事件日志，可追溯。</div>
              </div>
            </aside>
          </div>
        </div>
      </div>`;
    },
    after(ctx, root) {
      let step = 0;
      const panels = root.querySelectorAll("[data-panel]");
      const asides = root.querySelectorAll("[data-aside]");
      function goStep(n) {
        step = Math.max(0, Math.min(2, n));
        panels.forEach((p) => (p.hidden = Number(p.dataset.panel) !== step));
        asides.forEach((a) => (a.hidden = Number(a.dataset.aside) !== step));
        root.querySelectorAll("[data-step-indicator]").forEach((ind, i) => {
          ind.classList.toggle("is-current", i === step);
          ind.classList.toggle("is-done", i < step);
          const num = ind.querySelector(".wizard-step__num");
          num.innerHTML = i < step ? ic("check") : "0" + (i + 1);
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (step === 1) maybeAnimateChat();
      }
      const startStep = Number(ctx.query.get("step") || 0);
      if (startStep > 0) goStep(startStep);
      function maybeAnimateChat() {
        if (SA.isShot) return;
        const follow = root.querySelector("#ai-followup");
        if (follow && !follow.dataset.shown) {
          follow.dataset.shown = "1";
          follow.style.opacity = "0";
          setTimeout(() => {
            follow.style.transition = "opacity .5s ease, transform .5s ease";
            follow.style.transform = "translateY(6px)";
            follow.style.opacity = "1";
            follow.style.transform = "none";
          }, 320);
        }
      }
      root.querySelectorAll("[data-step-go]").forEach((btn) => {
        btn.addEventListener("click", () => goStep(Number(btn.dataset.stepGo)));
      });
      root.querySelectorAll("[data-choice] button").forEach((btn) => {
        btn.addEventListener("click", () => {
          btn.parentElement.querySelectorAll("button").forEach((b) => b.classList.remove("is-active"));
          btn.classList.add("is-active");
        });
      });
      root.querySelectorAll(".chip-select .chip").forEach((chip) => {
        chip.addEventListener("click", () => chip.classList.toggle("is-active"));
      });
      // owner picker
      const picker = root.querySelector("#owner-picker");
      const menu = root.querySelector("#owner-menu");
      picker.querySelector("[data-action='owner-picker']").addEventListener("click", (e) => {
        e.stopPropagation();
        menu.hidden = !menu.hidden;
      });
      root.addEventListener("click", (e) => {
        if (!e.target.closest("#owner-picker")) menu.hidden = true;
      });
      menu.querySelectorAll("[data-add-owner]").forEach((opt) => {
        opt.addEventListener("click", () => {
          const name = opt.dataset.addOwner;
          if (root.querySelector('[data-owner="' + name + '"]')) {
            SA.toast(name + " 已在负责人列表中");
            return;
          }
          const chip = document.createElement("span");
          chip.className = "owner-chip";
          chip.dataset.owner = name;
          chip.innerHTML =
            '<span class="avatar avatar--sm" data-tone="blue">' +
            name[0] +
            "</span>" +
            name +
            '<span class="owner-chip__role">SAP IT</span><button class="owner-chip__x" aria-label="移除">' +
            ic("x") +
            "</button>";
          root.querySelector("#owner-selected").insertBefore(chip, root.querySelector(".owner-picker__add"));
          menu.hidden = true;
          SA.toast("已添加负责人 " + name);
        });
      });
      root.querySelector("#owner-selected").addEventListener("click", (e) => {
        const x = e.target.closest(".owner-chip__x");
        if (x) x.closest(".owner-chip").remove();
      });
      // files
      root.querySelector("[data-action='add-file']").addEventListener("click", () => {
        SA.toast("演示：已选择 1 个文件并完成上传", { icon: "upload" });
      });
      root.querySelectorAll("[data-action='remove-file']").forEach((b) => {
        b.addEventListener("click", () => b.closest(".file-row").remove());
      });
      // clarify
      root.querySelector("[data-action='clarify-send']").addEventListener("click", () => {
        SA.toast("已发送给 AI，正在更新澄清结果", { icon: "sparkles" });
      });
      root.querySelectorAll(".chip--option").forEach((c) => {
        c.addEventListener("click", () => {
          c.parentElement.querySelectorAll(".chip--option").forEach((x) => x.classList.remove("is-active"));
          c.classList.add("is-active");
        });
      });
      root.querySelector("[data-action='re-clarify']").addEventListener("click", (e) => {
        const btn = e.currentTarget;
        btn.classList.add("is-loading");
        setTimeout(() => {
          btn.classList.remove("is-loading");
          SA.toast("已重新生成 3 个澄清问题", { icon: "sparkles" });
        }, 1100);
      });
      root.querySelector("[data-action='confirm-edge']").addEventListener("click", (e) => {
        e.currentTarget.outerHTML = '<div class="pill pill--green" style="width:100%;justify-content:center;height:30px">' + "已接受建议 · 不阻断" + "</div>";
      });
      root.querySelector("[data-action='save-draft']").addEventListener("click", () => {
        SA.toast("草稿已保存");
      });
      // submit
      root.querySelector("[data-action='submit-demand']").addEventListener("click", () => {
        const btn = root.querySelector("[data-action='submit-demand']");
        btn.classList.add("is-loading");
        setTimeout(() => {
          btn.classList.remove("is-loading");
          SA.modal({
            title: "需求已提交",
            desc: "R-2048 已写入 SAP 需求系统，AI 正在生成需求分析文档。",
            body:
              '<div class="submit-success">' +
              '<div class="submit-success__row"><span class="submit-success__icon">' + ic("check") + "</span><span><b>需求已创建</b><em>R-2048 · 财务共享组</em></span><span class=\"pill pill--green\"><span class=\"dot\"></span>完成</span></div>" +
              '<div class="submit-success__row"><span class="submit-success__icon submit-success__icon--teal">' + ic("sparkles") + "</span><span><b>AI 正在生成需求分析</b><em>预计 60 秒 · 完成后进入 G1</em></span><span class=\"pill pill--teal pill--live\"><span class=\"dot\"></span>运行中</span></div>" +
              '<div class="submit-success__row"><span class="submit-success__icon submit-success__icon--blue">' + ic("send") + "</span><span><b>Teams 通知已入队</b><em>#fin-sap-it · @林桦 @陈曦</em></span><span class=\"pill pill--blue\"><span class=\"dot\"></span>待投递</span></div>" +
              "</div>",
            wide: true,
            actions: [
              { label: "留在当前页", variant: "ghost" },
              { label: "查看需求", variant: "primary", onClick: () => SA.go("#/demands/R-2041") },
            ],
          });
        }, 1200);
      });
    },
  });
})();
