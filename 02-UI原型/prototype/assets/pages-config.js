/* ============================================================
   管理控制台页面注册表（配置驱动，console.html?page=xxx）
   通用列表页走 schema 渲染；特殊页（向导/编辑器/树表）走自定义 render
   ============================================================ */
window.PAGES = {

  /* ---------- 控制台首页：运营总览看板（单页 · UIUX 6.4 核心指标 + UI-C-17 门户运营） ---------- */
  dashboard: {
    crumb: ["总览", "运营总览看板"],
    render() { return renderDashboardBody(); },
    after() { aaInjectStyle(); }
  },

  /* ---------- UI-C-01 账号管理 ---------- */
  accounts: {
    crumb: ["身份与权限", "账号管理"],
    filters: [
      { label: "关键字", type: "input", ph: "用户名 / 姓名 / 工号 / 手机号" },
      { label: "状态", type: "select", opts: ["启用", "停用", "锁定"] },
      { label: "部门", type: "input", ph: "组织树选择（OrgTreeSelect）" },
      { label: "创建时间", type: "input", ph: "开始日期 ~ 结束日期" }
    ],
    toolbar: [{ text: "＋ 新建账号", primary: true, action: "newAccount()" }, { text: "导出 CSV", action: "toastExport()" }],
    cols: [
      { k: "username", t: "账号" }, { k: "name", t: "姓名" }, { k: "employeeNo", t: "工号" }, { k: "org", t: "部门" },
      { k: "status", t: "状态", render: v => statusTag(v, { "启用": "success", "停用": "info", "锁定": "danger" }) },
      { k: "lastLogin", t: "最近登录", render: v => relTimeHtml(v) }, { k: "created", t: "创建时间" },
      { t: "操作", ops: row => [
        { text: "详情", action: `acctDetail(${row.id})` },
        { text: "重置密码", action: `resetPwd('${row.username}','${row.name}')` },
        ...(row.status === "启用" ? [{ text: "停用", cls: "danger", action: `highRisk('停用账号','账号 <b>${row.username}</b>（${row.name}）停用后将无法登录所有接入系统，待办将转交其上级。','${row.username}','已停用账号 ${row.username}（写审计日志）')` }]
          : [{ text: "启用", action: `msg('success','账号已启用（写审计日志）')` }]),
        { text: "强制下线", action: `highRisk('强制下线','将强制下线账号 <b>${row.username}</b> 的全部会话（当前 2 个活跃会话）。','${row.username}','已强制下线 ${row.username} 全部会话（写审计日志）')` }
      ]}
    ],
    rows: () => MOCK.accounts,
    rowKey: "id"
  },

  /* ---------- UI-C-04 在线会话 ---------- */
  sessions: {
    crumb: ["身份与权限", "在线会话管理"],
    filters: [{ label: "账号", type: "input", ph: "用户名 / 姓名" }],
    toolbar: [{ text: "批量强制下线", action: "sessBatchKick()" }],
    cols: [
      { k: "id", t: "会话 jti", render: v => `<span class="mono">${v}</span>` },
      { k: "account", t: "账号" }, { k: "name", t: "姓名" }, { k: "loginTime", t: "登录时间" },
      { k: "lastActive", t: "最近活动" }, { k: "ip", t: "IP" }, { k: "device", t: "终端" },
      { t: "操作", ops: row => row.self
        ? [`<span class="tag tag-primary">本机</span>`]
        : [{ text: "强制下线", cls: "danger", action: `highRisk('强制下线会话','将强制下线 <b>${row.name}</b> 的会话 ${row.id}（${row.device}）。','${row.id}','会话 ${row.id} 已强制下线（写审计日志）')` }]}
    ],
    rows: () => MOCK.sessions, rowKey: "id",
    note: "自动刷新 60s · jti 与 JWT 绑定，下线即令牌失效（B1-F07）"
  },

  /* ---------- UI-C-05 权限申请登记（V1.0 线上登记 + 线下审批） ---------- */
  "perm-applies": {
    crumb: ["身份与权限", "权限申请登记"],
    filters: [{ label: "状态", type: "select", opts: ["待处理", "已开通", "已拒绝"] }, { label: "申请人", type: "input", ph: "姓名 / 工号" }],
    toolbar: [{ text: "＋ 代客登记", primary: true, action: "paProxyRegister()" }],
    cols: [
      { k: "no", t: "申请单号" }, { k: "who", t: "申请人" }, { k: "what", t: "申请权限" }, { k: "reason", t: "理由" },
      { k: "term", t: "期限" },
      { k: "status", t: "状态", render: v => statusTag(v, { "待处理": "warning", "已开通": "success", "已拒绝": "danger" }) },
      { k: "time", t: "申请时间" },
      { t: "操作", ops: row => row.status === "待处理"
        ? [{ text: "标记开通", action: `msg('success','已开通并通知申请人（写审计日志）')` }, { text: "拒绝", cls: "danger", action: `paReject('${row.no}','${row.who}')` }]
        : [{ text: "详情", action: `paDetail('${row.no}')` }]}
    ],
    rows: () => [
      { no: "PA-2026-0012", who: "李四 · EMP-2021-0102", what: "md:employee:edit（人员编辑）", reason: "HR 异动维护需要", term: "长期", status: "待处理", time: "09-22 09:30" },
      { no: "PA-2026-0011", who: "赵工 · EMP-2022-0233", what: "portal:layout:list（布局查看）", reason: "协助配置研发角色首页", term: "30 天", status: "已开通", time: "09-20 14:00" },
      { no: "PA-2026-0010", who: "陈晨 · EMP-2023-0311", what: "system:account:create", reason: "—", term: "—", status: "已拒绝", time: "09-18 11:20" }
    ], rowKey: "no"
  },

  /* ---------- UI-C-09 同步日志 ---------- */
  "sync-logs": {
    crumb: ["主数据", "同步日志"],
    filters: [{ label: "时间范围", type: "input", ph: "今天 / 近7日 / 自定义" }, { label: "结果", type: "select", opts: ["成功", "部分失败", "失败"] }],
    stats: () => `<div class="stat-cards" style="grid-template-columns:repeat(3,1fr)">
      <div class="stat-card"><div class="lb">近 7 日同步次数</div><div class="vl">7</div></div>
      <div class="stat-card alert"><div class="lb">近 7 日失败</div><div class="vl">2<small>超阈值(1) · 已触发告警</small></div></div>
      <div class="stat-card"><div class="lb">平均耗时</div><div class="vl">39<small>s</small></div></div></div>
    <div class="readonly-banner" style="background:var(--bmp-color-danger-light);border-color:var(--bmp-color-danger-light);color:var(--bmp-color-danger-dark)">⚠ 近 7 日同步失败 2 次，超过阈值 1 次：09-19 全量同步失败（HR 网关超时）、09-21 部分失败（2 条字段异常），请及时处理</div>`,
    cols: [
      { k: "time", t: "同步时间" }, { k: "source", t: "来源" },
      { k: "type", t: "类型", render: v => `<span class="tag tag-info">${v}</span>` },
      { k: "result", t: "结果", render: v => statusTag(v, { "成功": "success", "部分失败": "warning", "失败": "danger" }) },
      { k: "stat", t: "统计" }, { k: "cost", t: "耗时" },
      { t: "操作", ops: row => [{ text: "详情", action: `syncLogDetail('${row.time}','${row.result}')` }] }
    ],
    rows: () => MOCK.syncLogs, rowKey: "time"
  },

  /* ---------- UI-C-10 应用管理（侧栏 portal-apps · 仅应用目录） ---------- */
  "portal-apps": {
    crumb: ["门户运营", "应用管理"],
    render() {
      window._portalTab = "apps";
      return `<div class="list-toolbar"><div class="left">
          <button class="btn btn-primary" onclick="portalAppNew()">＋ 上架应用</button>
          <a class="btn btn-sm" href="console.html?page=workflow-defs" title="C1-F01-8 · 唯一发布入口">流程定义 → 发布到应用中心</a>
          <select class="select" style="width:120px" id="paAppKindFilter" onchange="portalAppsKindFilter(this.value)">
            <option value="">类型：全部</option><option value="external">外链</option><option value="workflow">流程</option>
          </select>
        </div><div class="right">外链上架前校验 URL；流程类绑定 defKey + 业务域（A1-F01-3）</div></div>
        <div class="table-wrap"><table class="tbl" id="pa-apps-table"><tr><th>应用</th><th>类型</th><th>业务域/分组</th><th>入口</th><th>可见角色</th><th>本月使用</th><th>状态</th><th>操作</th></tr>
        ${portalAppsTableRowsHtml(window._paAppKindFilter || "")}</table></div>
        <div class="fs-12 text-secondary mt-3">ℹ 外链接入走「<b>集成与网关 → 注册申请</b>」；<b>流程应用</b>在「<a href="console.html?page=workflow-defs"><b>流程定义管理 → 发布到应用中心</b></a>」写入（<span class="mono">kind=workflow</span>，不要求 I1）；本页<b>只读展示</b>已发布流程。卡片 / 嵌入 / 意图见「<a href="console.html?page=portal-components"><b>首页组件管理</b></a>」。员工点击流程应用为<b>站内发起</b>；外链仍<b>新标签页 SSO</b>（决议 #5）。</div>`;
    }
  },

  /* ---------- UI-C-10 首页组件管理（侧栏 portal-components · 卡片 / 嵌入 / 意图 · 决议 #5b） ----------
     嵌入 iframe 域名校验用本文件 _portalWhitelist 原型常量；生产随 I1 应用注册，无独立白名单 Tab。 */
  "portal-components": {
    crumb: ["门户运营", "首页组件管理"],
    after() {
      const params = new URLSearchParams(location.search);
      let tab = params.get("tab") || window._portalTab || "cards";
      if (["cards", "embeds", "intents"].indexOf(tab) < 0) tab = "cards";
      window._portalTab = tab;
      if (tab === "intents") portalRerenderIntents(document.getElementById("pa-intents-table"));
      document.querySelectorAll("#pageRoot .tabs .tab").forEach(t => {
        const m = (t.getAttribute("onclick") || "").match(/portalTab\(this,'([^']+)'\)/);
        t.classList.toggle("active", m && m[1] === tab);
      });
      ["pa-cards", "pa-embeds", "pa-intents"].forEach(x => {
        const n = document.getElementById(x); if (n) n.classList.toggle("hidden", x !== "pa-" + tab);
      });
    },
    render() {
      const urlTab = new URLSearchParams(location.search).get("tab");
      if (urlTab && ["cards", "embeds", "intents"].indexOf(urlTab) >= 0) {
        window._portalTab = urlTab;
      }
      let active = window._portalTab || "cards";
      if (active === "apps" || ["cards", "embeds", "intents"].indexOf(active) < 0) active = "cards";
      window._portalTab = active;
      const cls = id => active === id ? "" : "hidden";
      return `<div class="tabs mb-4">
        <div class="tab ${active === "cards" ? "active" : ""}" onclick="portalTab(this,'cards')">卡片管理（card manifest 注册表）</div>
        <div class="tab ${active === "embeds" ? "active" : ""}" onclick="portalTab(this,'embeds')">嵌入页面卡片</div>
        <div class="tab ${active === "intents" ? "active" : ""}" onclick="portalTab(this,'intents')">意图项配置</div>
      </div>

      <div id="pa-cards" class="${cls("cards")}">
        <div class="readonly-banner">ℹ 卡片来自前端 <b>card manifest 注册表</b>（cards/registry.ts）：新卡片 = 前端注册 manifest + 发布组件版本，<b>零平台改造</b>自动出现在布局编辑器物料面板（UIUX 8.3）</div>
        <div class="table-wrap"><table class="tbl"><tr><th>cardId</th><th>名称</th><th>数据接口</th><th>最小栅格</th><th>版本</th><th>状态</th></tr>
        ${MOCK.cardManifest.map(c => `<tr><td class="mono">${c.cardId}</td><td>${c.name}</td><td class="mono">${c.dataApi}</td><td>${c.minGrid}</td><td>1.0.${Math.floor(Math.random() * 9)}</td><td>${c.cardId === "birthday" ? statusTag("V1.5 上架", { "V1.5 上架": "info" }) : statusTag("已注册", { "已注册": "success" })}</td></tr>`).join("")}
        </table></div>
      </div>

      <div id="pa-intents" class="${cls("intents")}">
        <div class="readonly-banner">🎯 <b>A1-F02-7（V1.5 方案 A）</b>：维护首页「意图流 / ⌘K」快捷项。员工端读取 <span class="mono">GET /v1/portal/intents</span>；保存后约 5 分钟内生效（原型：即时写 <span class="mono">localStorage:bmp_portal_intents</span>）。</div>
        <div class="list-toolbar">
          <div class="left"><button class="btn btn-primary btn-sm" onclick="portalIntentAdd()">＋ 新增意图项</button></div>
          <div class="right"><button class="btn btn-sm" onclick="portalIntentReset()">恢复默认 7 项</button></div>
        </div>
        <div class="table-wrap"><table class="tbl" id="pa-intents-table">
          <tr><th>排序</th><th>图标</th><th>名称</th><th>说明</th><th>类型</th><th>跳转链接</th><th>启用</th><th>操作</th></tr>
          ${portalIntentsRowsHtml()}
        </table></div>
      </div>

      <div id="pa-embeds" class="${cls("embeds")}">
        <div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
          🔗 <b>页面驻留（决议 #5b）</b>：允许把已登记页面<b>受控内嵌</b>到首页三栏（大屏 / 驾驶舱 / 报表）。四条约束：
          <b>① 必须走域名白名单</b>（未登记域名禁止嵌入）&nbsp;·&nbsp;
          <b>② 必须有降级</b>（加载失败 / 超时 / 被拒 → 显示标题 + 「在新标签页打开」，不留白屏）&nbsp;·&nbsp;
          <b>③ 必须有加载态</b>（骨架 loading，不给用户看空白）&nbsp;·&nbsp;
          <b>④ 不改变 #5</b>（应用<b>图标点击</b>仍走新标签页）。会话经 <span class="mono">/v1/auth/ticket/exchange</span> 一次性 ticket 换取，不共享 Cookie、无会话冲突。
        </div>
        <div class="list-toolbar">
          <div class="left">
            <button class="btn btn-primary" onclick="portalEmbedAdd('')">＋ 添加嵌入页面</button>
            <span class="fs-12 text-secondary">当前 ${window._portalEmbeds.length} 张嵌入卡片 · 域名校验随 I1 应用注册（原型 ${_portalWhitelist.length} 个常量 host）</span>
          </div>
          <div class="right">嵌入页面为<b>多实例</b>：cardId 采用 <span class="mono">embed:&lt;id&gt;</span> 唯一标识</div>
        </div>
        <div class="table-wrap"><table class="tbl" id="pa-embeds-table">
          <tr><th>卡片标题</th><th>目标 URL</th><th>所属栏位</th><th>高度</th><th>可见角色</th><th>域名白名单</th><th>状态</th><th>操作</th></tr>
          ${portalEmbedsRowsHtml()}
        </table></div>
        <div class="fs-12 text-secondary mt-3">ℹ 卡片标题 / 目标 URL / 栏位 / 高度与前端 <span class="mono">layoutTemplateV2.cards[].params</span> 同构；「所属栏位」左/中/右对应三栏，中栏弹性自适应（大屏建议放中栏）。</div>
      </div>`;
    }
  },

  /* ---------- UI-C-12 公告管理（含 Banner 展示增强） ---------- */
  "notices-admin": {
    crumb: ["门户运营", "公告管理"],
    toolbar: [
      { text: "＋ 新建公告", primary: true, action: "noticeNew()" },
      { text: "Banner 设置规范", action: "bannerSpec()" }
    ],
    stats: () => `<div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
      📢 当前 Banner 展示中 <b>${bannerCount()}</b> 条 · 规范：<b>无展示中的公告时首页不显示 Banner 区域（不占位）</b>；<b>置顶</b>公告优先于普通公告，同级别内按「Banner 优先级」升序展示。
    </div>`,
    cols: [
      { k: "title", t: "标题", render: (v, r) => (r.top ? '<b class="text-primary">📢 </b>' : "") + v },
      { k: "dept", t: "发布部门" }, { k: "time", t: "发布时间" },
      { t: "已读统计", ops: r => [`<button class="btn-text" onclick="noticeReadDetail(${r.id})"><span class="fs-13 text-secondary">326/512</span></button>`] },
      { t: "Banner 展示", ops: r => {
        const c = bannerGet(r.id);
        return [statusTag(c.show ? "Banner 展示中" : "不在 Banner", { "Banner 展示中": "primary", "不在 Banner": "info" })];
      } },
      { t: "Banner 时段", ops: r => {
        const c = bannerGet(r.id);
        return [`<span class="fs-12 ${c.show && c.from && c.to ? "text-secondary mono" : "text-secondary"}">${c.show && c.from && c.to ? c.from + " ~ " + c.to : "—"}</span>`];
      } },
      { t: "状态", ops: r => [statusTag(r.top ? "已置顶" : "已发布", { "已置顶": "primary", "已发布": "success" })] },
      { t: "操作", ops: r => [
        { text: "Banner 设置", action: `bannerOpen(${r.id})` },
        { text: "编辑", action: `noticeEdit(${r.id})` },
        { text: "撤回", cls: "danger", action: "highRisk('撤回公告','撤回后全员将不可见该公告，已读记录保留。','撤回','公告已撤回（写审计日志）')" }
      ]}
    ],
    rows: () => MOCK.notices, rowKey: "id"
  },

  /* ---------- UI-C-14 审计日志检索（简化列表，详情抽屉含 diff） ---------- */
  audit: {
    crumb: ["审计中心", "审计日志检索"],
    filters: [
      { label: "时间范围", type: "input", ph: "今天 / 近7日 / 近30日 / 自定义" },
      { label: "操作人", type: "input", ph: "EmployeeSelect（姓名/工号搜索）" },
      { label: "操作类型", type: "select", opts: ["登录", "权限变更", "数据变更", "高危操作"] },
      { label: "trace_id", type: "input", ph: "精确查询，如 tr-9f21a3c" }
    ],
    quickTags: [{ text: "🔥 仅看高危操作", action: "msg('info','筛选已应用：type=高危操作（原型演示）')" }, { text: "今日登录失败", action: "msg('info','筛选已应用（原型演示）')" }],
    toolbar: [{ text: "导出 CSV（异步）", action: "msg('success','导出任务已创建，完成后将收到站内信通知（≤10000 条）')" }],
    cols: [
      { k: "time", t: "时间", render: v => `<span class="mono">${v}</span>` },
      { k: "user", t: "操作人" },
      { k: "type", t: "类型", render: v => statusTag(v, { "高危操作": "danger", "权限变更": "warning", "数据变更": "primary", "登录": "info" }) },
      { k: "desc", t: "描述" }, { k: "ip", t: "来源 IP" },
      { k: "result", t: "结果", render: v => statusTag(v, { "成功": "success", "失败": "danger" }) },
      { t: "操作", ops: row => [{ text: "详情", action: `auditDetail('${row.traceId}','${row.type}')` }] }
    ],
    rows: () => MOCK.auditLogs, rowKey: "traceId",
    note: "月分区存储 · 检索 P95 < 3s · 全链路 trace_id 可复制用于链路排查"
  },

  /* ---------- UI-C-15 网关路由管理 ---------- */
  gateway: {
    crumb: ["集成与网关", "网关路由管理"],
    toolbar: [{ text: "＋ 新建路由", primary: true, action: "gwRouteNew()" }],
    cols: [
      { k: "prefix", t: "路径前缀", render: v => `<span class="mono">${v}</span>` },
      { k: "target", t: "目标服务", render: v => `<span class="mono">${v}</span>` },
      { t: "状态", ops: row => [`<span class="switch ${row.enabled ? "on" : ""}" style="position:relative;width:40px;height:22px;background:${row.enabled ? "var(--bmp-color-success)" : "var(--bmp-border-strong)"};border-radius:11px;display:inline-block;cursor:pointer" onclick="gwToggle(${row.enabled},'${row.prefix}')"></span>`] },
      { k: "qps", t: "限流 QPS" },
      { k: "gray", t: "灰度规则" },
      { t: "接入模式", ops: row => [row.legacy ? `<span class="tag tag-warning">LegacyAuthFilter</span>` : `<span class="tag tag-info">标准 JWT</span>`] },
      { t: "操作", ops: row => [
        { text: "测试", action: `msg('success','探测 ${row.prefix}：200 OK · ${60 + row.qps % 90}ms')` },
        { text: "编辑", action: `gwRouteEdit('${row.prefix}','${row.target}',${row.qps},'${row.gray}')` },
        { text: "日志", action: "location.href='console.html?page=audit'" }
      ]}
    ],
    rows: () => MOCK.gwRoutes, rowKey: "prefix",
    note: "E1 最小集（V1.0）：路由 + 鉴权 + LegacyAuthFilter；限流/熔断/灰度完整能力 V1.5"
  },

  /* ---------- UI-C-16 应用注册域（合并「申请中/已通过」为 app-register；旧 key 由 console.js 重定向） ---------- */
  "app-register": {
    crumb: ["集成与网关", "应用注册"],
    render: () => igRenderAppRegisterPage()
  },
  "app-register-apply": {
    crumb: ["集成与网关", "应用注册"],
    render: () => igRenderAppRegisterPage("apply")
  },
  "app-register-approved": {
    crumb: ["集成与网关", "应用注册"],
    render: () => igRenderAppRegisterPage("approved")
  },
  /* V1.5 不提供独立页：由 console.js deprecatedPageRedirect 归一化至 app-register */
  "app-register-mapping": {
    crumb: ["集成与网关", "应用注册"],
    render: () => {
      location.replace("console.html?page=app-register&orgMappingNote=1");
      return '<div class="state-box"><div class="txt">正在跳转至应用注册…</div></div>';
    }
  },
  "app-register-events": {
    crumb: ["集成与网关", "事件订阅运维"],
    render: () => igRenderEventsPage(),
    /* 深链 ?tab=outbox | event-monitor 别名由 console.js 归一化 */
    after() {
      const params = new URLSearchParams(location.search);
      const raw = params.get("tab") || window._igEvTab || "subs";
      const tab = raw === "outbox" || raw === "monitor" || raw === "stream" ? "outbox" : "subs";
      window._igEvTab = tab;
      if (tab === "outbox") igEvEventsTab(null, "outbox");
    }
  },
  "app-register-guide": {
    crumb: ["集成与网关", "接入文档"],
    render: () => igRenderGuideTab()
  },

  /* ---------- 中台能力目录（Open API / 事件 · 供注册申请勾选） ---------- */
  "platform-capabilities": {
    crumb: ["集成与网关", "中台能力目录"],
    render() {
      const t = window._platTab || "apis";
      const cls = id => t === id ? "" : "hidden";
      return `<div class="readonly-banner">📚 维护中台对外开放的 <b>API</b> 与 <b>事件</b> 目录；接入方在「注册申请」中按需勾选。权限仍留在各业务系统，<b>不做 J2-F05 在线权限迁移</b>。</div>
      <div class="readonly-banner" style="background:var(--bmp-color-info-light)">🔭 <b>中台能力观测 · 三条链（只读入口，勿混用）</b>：
        ① <a href="console.html?page=audit">审计中心</a>（E2 · <span class="mono">POST /audit/log</span> 合规留痕）；
        ② <a href="console.html?page=app-register-events&tab=outbox">事件流排查</a>（J3 · <span class="mono">event_outbox</span> 集成排障）；
        ③ <a href="console.html?page=dashboard">运营总览看板</a>（A1 · 门户行为埋点产品分析）。</div>
      <div class="tabs mb-4" data-tabgroup="plat">
        <div class="tab ${t === "apis" ? "active" : ""}" onclick="platTab(this,'apis')">Open API</div>
        <div class="tab ${t === "events" ? "active" : ""}" onclick="platTab(this,'events')">领域事件</div>
        <div class="tab ${t === "policy" ? "active" : ""}" onclick="platTab(this,'policy')">回调域名校验</div>
      </div>
      <div id="plat-apis" data-tabpanel="apis" class="${cls("apis")}">
        <div class="list-toolbar"><div class="left"><button class="btn btn-primary btn-sm" onclick="platApiEdit('')">＋ 发布 API</button></div>
          <div class="right"><a class="btn btn-sm" href="console.html?page=app-register">← 应用注册</a></div></div>
        <div class="table-wrap"><table class="tbl"><tr><th>方法</th><th>路径</th><th>名称</th><th>scope</th><th>版本</th><th>状态</th><th>操作</th></tr>
        ${MOCK.platformApis.map(a => `<tr><td class="mono">${a.method}</td><td class="mono">${a.path}</td><td>${a.name}</td><td class="mono">${a.scope}</td><td>${a.version}</td>
          <td>${statusTag(a.status, { "已发布": "success", "草稿": "warning" })}</td>
          <td class="ops"><button class="btn-text" onclick="platApiEdit('${a.id}')">编辑</button></td></tr>`).join("")}
        </table></div>
      </div>
      <div id="plat-events" data-tabpanel="events" class="${cls("events")}">
        <div class="list-toolbar"><div class="left"><button class="btn btn-primary btn-sm" onclick="platEventEdit('')">＋ 发布事件</button></div></div>
        <div class="table-wrap"><table class="tbl"><tr><th>事件码</th><th>名称</th><th>Topic</th><th>投递方式</th><th>状态</th><th>操作</th></tr>
        ${MOCK.platformEvents.map(e => `<tr><td class="mono">${e.code}</td><td>${e.name}</td><td class="mono">${e.topic}</td><td>${e.delivery}</td>
          <td>${statusTag(e.status, { "已发布": "success" })}</td>
          <td class="ops"><button class="btn-text" onclick="platEventEdit('${e.id}')">编辑</button></td></tr>`).join("")}
        </table></div>
      </div>
      <div id="plat-policy" data-tabpanel="policy" class="${cls("policy")}">
        <div class="readonly-banner" style="background:var(--bmp-color-info-light)">回调域名在<b>注册申请</b>中按应用填写；平台侧统一校验：<b>仅 https</b>、拒 IP / 内网网段（SSRF 防护）。全局参考白名单如下（运维兜底）。</div>
        <div class="table-wrap"><table class="tbl"><tr><th>域名</th><th>用途</th><th>登记时间</th></tr>
        ${MOCK.callbackWhitelist.map(w => `<tr><td class="mono">${w.domain}</td><td>${w.use || w.func}</td><td class="mono">${w.time}</td></tr>`).join("")}
        </table></div>
      </div>`;
    }
  },

};

/* 书签 alias：与 dashboard 同渲染（console.js 亦会 redirect，保留 key 供深链/校验） */
PAGES["app-analytics"] = {
  crumb: ["总览", "运营总览看板"],
  render() { return renderDashboardBody(); },
  after() { aaInjectStyle(); }
};

/* 通用渲染辅助 */
function statusTag(v, map) { return `<span class="tag tag-${map[v] || "info"}">${v}</span>`; }
function swTab(el, id) {
  el.parentElement.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  ["pa-apps", "pa-cards", "pa-embeds", "ig-apps", "ig-events", "msg-tpl", "msg-channel", "msg-record"].forEach(x => { const n = document.getElementById(x); if (n) n.classList.add("hidden"); });
  document.getElementById(id).classList.remove("hidden");
}
/* UI-C-16 集成页 Tab 切换（应用注册 / 事件订阅 / 回调域名白名单）
   —— 语义别名：委托通用 portalTab（按 [data-tabgroup] 切换），仅供 UI-C-16 与 QA 调用 */
function igTab(el, id) {
  if (el && el.closest) {
    portalTab(el, id);
    return;
  }
  /* 无 el（探针/程序调用）时：按 id 直接切换面板 + 高亮 */
  window._igTab = id;
  const group = document.querySelector('[data-tabgroup="ig"]');
  if (group) {
    group.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.getAttribute("onclick") === "portalTab(this,'" + id + "')"));
    /* 面板为 Tab 条兄弟节点，须在公共父容器内查找 */
    const scope = group.parentElement || group;
    scope.querySelectorAll("[data-tabpanel]").forEach(n => n.classList.toggle("hidden", n.dataset.tabpanel !== id));
  } else {
    ["ig-apps", "ig-events", "ig-callback-whitelist"].forEach(x => { const n = document.getElementById(x); if (n) n.classList.add("hidden"); });
    const host = document.getElementById("ig-" + id); if (host) host.classList.remove("hidden");
  }
}
function toastExport() { msg("success", "导出任务已创建（异步），完成后站内信通知"); }

/* ============================================================
   门户运营 · 嵌入页面卡片（决议 #5b）
   ------------------------------------------------------------
   数据来源：本页局部定义（不改 assets/mock.js）。
   嵌入 host 校验：_portalWhitelist 原型常量（与 home-v2 EMBED_WHITELIST_HOSTS 一致）；生产读 I1 应用注册，无 portal-apps 白名单 Tab。
   嵌入页面卡片与前端 layoutTemplateV2.cards[]（cardId: "embed:<id>" + params）同构。
   ============================================================ */

/* 域名白名单：{ host 域名, system 来源系统, use 用途, time 登记时间, by 登记人 } */
var _portalWhitelist = [
  { host: "dashboard.lubon.local", system: "经营驾驶舱", use: "领导视角经营大屏（首页中栏驻留）", time: "2026-09-10", by: "周总" },
  { host: "bi.lubon.local", system: "BI 报表平台", use: "部门数据看板 / 自助报表", time: "2026-09-10", by: "周总" },
  { host: "bi.lubon.internal", system: "BI 报表平台（内网）", use: "服务健康度 / 内部指标看板", time: "2026-09-12", by: "李工" },
  { host: "crm.lubon.local", system: "CRM", use: "商机漏斗 / 客户 360 快照", time: "2026-09-12", by: "李工" },
  { host: "oa.lubon.local", system: "OA", use: "待办 / 公文流转概览", time: "2026-09-13", by: "王管理员" },
  { host: "hr.lubon.local", system: "HR 系统", use: "组织人员概览（只读）", time: "2026-09-13", by: "王管理员" },
  { host: "report.lubon.local", system: "报表中心", use: "经营日报 / 周报大屏", time: "2026-09-15", by: "周总" },
  { host: "portal.lubon.local", system: "门户（子站）", use: "门户子站页面驻留", time: "2026-09-15", by: "周总" }
];

/* 嵌入页面卡片：{ cardId, title, url, col, height, roles, status }；域名须在白名单内 */
var _portalEmbeds = [
  { cardId: "embed:dashboard-1", title: "经营驾驶舱（领导视角）", url: "https://dashboard.lubon.local/ceo", col: "center", height: 360, roles: ["系统管理员", "超级管理员"], status: "已启用" },
  { cardId: "embed:dept-board-1", title: "部门数据看板", url: "https://bi.lubon.local/dept", col: "right", height: 220, roles: ["系统管理员"], status: "已启用" },
  { cardId: "embed:service-health-1", title: "服务健康度看板", url: "https://bi.lubon.internal/service-health", col: "center", height: 340, roles: ["研发中心"], status: "草稿" }
];

/* 用于「添加嵌入页面」的下拉来源：已注册应用 → 自动带出 URL（手动填亦可） */
var _portalEmbedSources = [
  { name: "经营驾驶舱", host: "dashboard.lubon.local", url: "https://dashboard.lubon.local/ceo" },
  { name: "BI 报表平台", host: "bi.lubon.local", url: "https://bi.lubon.local/report" },
  { name: "CRM", host: "crm.lubon.local", url: "https://crm.lubon.local/overview" },
  { name: "OA", host: "oa.lubon.local", url: "https://oa.lubon.local/todo" },
  { name: "HR 系统", host: "hr.lubon.local", url: "https://hr.lubon.local/org" },
  { name: "报表中心", host: "report.lubon.local", url: "https://report.lubon.local/daily" }
];

/* 从 URL 提取 host（协议 + 域名），与前端 EMBED_WHITELIST_HOSTS 匹配口径一致 */
function portalHostOf(url) {
  const m = String(url || "").match(/^https?:\/\/([^\/\?#]+)/i);
  return m ? m[1].toLowerCase() : "";
}
/* host 是否在白名单内 */
function portalHostAllowed(host) {
  return _portalWhitelist.some(w => w.host.toLowerCase() === String(host || "").toLowerCase());
}
/* 栏位标签 */
var PORTAL_COL_LABEL = { left: "左栏", center: "中栏", right: "右栏" };

/* ---------- 意图项配置（A1-F02-7 · 方案 A） ---------- */
function portalIntentJumpLabel(it) {
  const u = String(it.jumpUrl || "").trim();
  if (!u) return "—";
  const jt = MOCK.inferIntentJumpType ? MOCK.inferIntentJumpType(u, it.jumpType) : (it.jumpType || "internal");
  const tip = jt === "external" ? "外链·新标签" : jt === "cmd" ? "cmd" : "站内";
  const short = u.length > 36 ? u.slice(0, 34) + "…" : u;
  return `<span class="mono fs-12" title="${escHtmlAttr(u)}">${escHtmlAttr(short)}</span><div class="fs-11 text-secondary">${tip}</div>`;
}
function escHtmlAttr(s) {
  return String(s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
function portalIntentsRowsHtml() {
  return MOCK.getPortalIntents().sort((a, b) => (a.order || 0) - (b.order || 0)).map(it => {
    const kindLabel = it.kind === "form" ? "表单/流程" : it.kind === "sso" ? "SSO 跳转" : "站内";
    return `<tr data-key="${it.key}">
      <td class="mono">${it.order != null ? it.order : "—"}</td>
      <td style="font-size:18px">${it.icon || "·"}</td>
      <td><b>${it.name}</b><div class="fs-12 text-secondary mono">${it.key}</div></td>
      <td class="fs-13">${it.sub || "—"}</td>
      <td><span class="tag tag-info">${kindLabel}</span></td>
      <td>${portalIntentJumpLabel(it)}</td>
      <td>${it.enabled !== false ? statusTag("启用", { "启用": "success" }) : statusTag("停用", { "停用": "warning" })}</td>
      <td class="ops">
        <button class="btn-text" onclick="portalIntentEdit('${it.key}')">编辑</button>
        <button class="btn-text" onclick="portalIntentToggle('${it.key}')">${it.enabled !== false ? "停用" : "启用"}</button>
        <button class="btn-text" onclick="portalIntentMove('${it.key}',-1)">↑</button>
        <button class="btn-text" onclick="portalIntentMove('${it.key}',1)">↓</button>
      </td>
    </tr>`;
  }).join("");
}
function portalRerenderIntents(table) {
  if (!table) return;
  table.innerHTML = "<tr><th>排序</th><th>图标</th><th>名称</th><th>说明</th><th>类型</th><th>跳转链接</th><th>启用</th><th>操作</th></tr>" + portalIntentsRowsHtml();
}
function portalIntentPersist(list) {
  MOCK.savePortalIntents(list);
  portalRerenderPage();
  msg("success", "意图项已保存，员工端首页/⌘K 将读取最新配置");
}
function portalIntentToggle(key) {
  const list = MOCK.getPortalIntents();
  const it = list.find(x => x.key === key); if (!it) return;
  it.enabled = it.enabled === false;
  portalIntentPersist(list);
}
function portalIntentMove(key, dir) {
  const list = MOCK.getPortalIntents().sort((a, b) => (a.order || 0) - (b.order || 0));
  const i = list.findIndex(x => x.key === key);
  if (i < 0) return;
  const j = i + dir;
  if (j < 0 || j >= list.length) return;
  const o = list[i].order; list[i].order = list[j].order; list[j].order = o;
  portalIntentPersist(list);
}
function portalIntentReset() {
  highRisk("恢复默认意图项", "将覆盖当前全部意图配置为系统预置 7 项。", "恢复", "已恢复默认意图项", () => {
    localStorage.removeItem("bmp_portal_intents");
    portalRerenderPage();
    msg("success", "已恢复默认 7 项意图");
  });
}
function portalIntentEdit(key) {
  const list = MOCK.getPortalIntents();
  const it = list.find(x => x.key === key) || { key: "", icon: "✨", name: "", sub: "", kind: "form", bizType: "launch_approval", jumpUrl: "", jumpType: "cmd", enabled: true, order: list.length + 1 };
  const jt = MOCK.inferIntentJumpType ? MOCK.inferIntentJumpType(it.jumpUrl, it.jumpType) : (it.jumpType || "cmd");
  showDrawer(it.key ? "编辑意图项" : "新增意图项", `
    <div class="field"><label>key（唯一）</label><input class="input mono" id="piKey" value="${it.key}" ${it.key ? "readonly" : ""}></div>
    <div class="field"><label>图标</label><input class="input" id="piIcon" value="${it.icon || ""}"></div>
    <div class="field"><label>名称</label><input class="input" id="piName" value="${it.name || ""}"></div>
    <div class="field"><label>说明</label><input class="input" id="piSub" value="${it.sub || ""}"></div>
    <div class="field"><label>类型</label><select class="select" id="piKind"><option value="form" ${it.kind === "form" ? "selected" : ""}>表单/流程</option><option value="sso" ${it.kind === "sso" ? "selected" : ""}>SSO 跳转</option></select></div>
    <div class="field"><label>跳转链接</label><input class="input mono" id="piJumpUrl" value="${escHtmlAttr(it.jumpUrl || "")}" placeholder="https://… 或 approval.html、/portal/…"></div>
    <div class="field"><label>打开方式</label><select class="select" id="piJumpType">
      <option value="external" ${jt === "external" ? "selected" : ""}>外链 · 新标签页（https）</option>
      <option value="internal" ${jt === "internal" ? "selected" : ""}>站内 · 当前页跳转</option>
      <option value="cmd" ${jt === "cmd" ? "selected" : ""}>无链接 · 走表单/cmd 兜底</option>
    </select></div>
    <div class="tip fs-12 text-secondary mb-2">校验：仅允许 <span class="mono">https://</span> 或站内路径；留空且选「无链接」时保留原有意图表单/SSO 演示行为。</div>
    <div class="field"><label>排序</label><input class="input" type="number" id="piOrder" value="${it.order != null ? it.order : 1}"></div>
    <button class="btn btn-primary mt-3" onclick="portalIntentSave('${key || ""}')">保存</button>`);
}
function portalIntentAdd() { portalIntentEdit(""); }
function portalIntentSave(oldKey) {
  const list = MOCK.getPortalIntents();
  const key = (document.getElementById("piKey").value || "").trim();
  const name = (document.getElementById("piName").value || "").trim();
  if (!key || !name) { msg("error", "请填写 key 与名称"); return; }
  const jumpUrlRaw = (document.getElementById("piJumpUrl").value || "").trim();
  const jumpType = (document.getElementById("piJumpType").value || "cmd").trim();
  if (jumpUrlRaw) {
    const chk = MOCK.validateIntentJumpUrl(jumpUrlRaw);
    if (!chk.ok) { msg("error", chk.msg); return; }
  } else if (jumpType !== "cmd") {
    msg("error", "已选择外链/站内打开方式时请填写跳转链接，或改为「无链接 · 走表单/cmd 兜底」");
    return;
  }
  const prev = list.find(x => x.key === (oldKey || key)) || {};
  const row = {
    key, icon: document.getElementById("piIcon").value.trim() || "✨", name,
    sub: document.getElementById("piSub").value.trim(), kind: document.getElementById("piKind").value,
    jumpUrl: jumpUrlRaw, jumpType: jumpType,
    order: parseInt(document.getElementById("piOrder").value, 10) || 1, enabled: true,
    bizType: prev.bizType || key, app: prev.app || name
  };
  const idx = list.findIndex(x => x.key === (oldKey || key));
  if (idx >= 0) list[idx] = { ...list[idx], ...row, key: oldKey || key };
  else list.push(row);
  MOCK.savePortalIntents(list);
  closeDrawer && closeDrawer();
  portalRerenderPage();
  msg("success", "意图项已保存");
}

/* Tab 切换：portal-components 页签切换时保留当前结构（无需重渲染整页） */
function portalTab(el, tab) {
  window._portalTab = tab;
  el.parentElement.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  /* 通用分组切换：若 Tab 位于 [data-tabgroup] 内，则按其 [data-tabpanel] 切换面板（供 UI-C-16 回调白名单复用） */
  const group = el.closest ? el.closest("[data-tabgroup]") : null;
  if (group) {
    /* 面板为 Tab 条的兄弟节点（同在页根下），故在公共父容器内按 [data-tabpanel] 切换 */
    const scope = group.parentElement || group;
    scope.querySelectorAll("[data-tabpanel]").forEach(n => n.classList.toggle("hidden", n.dataset.tabpanel !== tab));
    if (group.dataset.tabgroup === "ig") window._igTab = tab; /* UI-C-16 页内状态 */
  } else {
    ["pa-cards", "pa-embeds", "pa-intents"].forEach(x => {
      const n = document.getElementById(x); if (n) n.classList.add("hidden");
    });
    const host = document.getElementById("pa-" + tab); if (host) host.classList.remove("hidden");
  }
  if (tab === "intents") {
    const tb = document.getElementById("pa-intents-table");
    if (tb) portalRerenderIntents(tb);
  }
  // 切换时刷新对应表体（数据可能已变更）
  if (tab === "embeds") {
    const tb = document.getElementById("pa-embeds-table");
    if (tb) portalRerenderEmbeds(tb);
  }
  /* 同步地址栏与侧栏高亮（首页组件管理菜单） */
  try {
    const u = new URL(location.href);
    u.searchParams.set("page", "portal-components");
    u.searchParams.set("tab", tab);
    history.replaceState(null, "", u.pathname + "?" + u.searchParams.toString());
    if (typeof renderMenu === "function") renderMenu();
  } catch (e) { /* 原型环境无 history 时忽略 */ }
}

/* 嵌入卡片表格行 HTML */
function portalEmbedsRowsHtml() {
  if (!_portalEmbeds.length) {
    return `<tr><td colspan="8"><div class="empty-tip"><div class="big">🗂</div>暂无嵌入页面卡片，点击「＋ 添加嵌入页面」开始</div></td></tr>`;
  }
  return _portalEmbeds.map(e => {
    const host = portalHostOf(e.url);
    const ok = portalHostAllowed(host);
    return `<tr>
      <td><b>${e.title}</b><div class="fs-12 text-secondary mono">${e.cardId}</div></td>
      <td class="mono fs-13" style="max-width:280px;word-break:break-all">${e.url}</td>
      <td><span class="tag tag-info">${PORTAL_COL_LABEL[e.col] || e.col}</span></td>
      <td class="mono">${e.height} px</td>
      <td>${(e.roles || []).map(r => `<span class="tag tag-primary" style="margin:0 4px 2px 0">${r}</span>`).join("") || "—"}</td>
      <td>${ok ? '<span class="tag tag-success">✓ 在白名单</span>' : '<span class="tag tag-danger">✗ 不在白名单</span>'}</td>
      <td>${statusTag(e.status, { "已启用": "success", "草稿": "warning", "已停用": "info" })}</td>
      <td class="ops">
        <button class="btn-text" onclick="portalEmbedAdd('${e.cardId}')">编辑</button>
        <button class="btn-text" onclick="portalEmbedPreview('${e.cardId}')">预览</button>
        <button class="btn-text ${e.status === "已启用" ? "danger" : ""}" onclick="portalEmbedToggle('${e.cardId}')">${e.status === "已启用" ? "停用" : "启用"}</button>
        <button class="btn-text danger" onclick="portalEmbedRemove('${e.cardId}')">移除</button>
      </td>
    </tr>`;
  }).join("");
}
/* 预览嵌入页面：模拟运行时的加载态 → 就绪 / 降级（决议 #5b 约束 ②③④） */
function portalEmbedPreview(cardId) {
  const e = _portalEmbeds.find(x => x.cardId === cardId); if (!e) return;
  const host = portalHostOf(e.url);
  const allowed = portalHostAllowed(host);
  showDrawer("嵌入页面预览 · " + e.title, `
    <div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
      🔗 运行时按决议 #5b：先经 <span class="mono">/v1/auth/ticket/exchange</span> 换取一次性令牌，再在 <b>&lt;iframe sandbox&gt;</b> 内加载；
      加载中显示<b>骨架 loading</b>（约束 ③），8s 超时 / 被拒 / 失败 → <b>降级卡</b>（约束 ②）。
    </div>
    <div class="field"><label>目标 URL</label><div class="card fs-13 mono" style="word-break:break-all">${e.url}</div></div>
    <div class="field" style="display:flex;gap:16px">
      <div><span class="fs-12 text-secondary">所属栏位</span><div><span class="tag tag-info">${PORTAL_COL_LABEL[e.col] || e.col}</span></div></div>
      <div><span class="fs-12 text-secondary">内嵌高度</span><div class="mono">${e.height} px</div></div>
      <div><span class="fs-12 text-secondary">域名白名单</span><div>${allowed ? '<span class="tag tag-success">✓ 允许</span>' : '<span class="tag tag-danger">✗ 禁止</span>'}</div></div>
    </div>
    <div class="field"><label>渲染效果（模拟）</label>
      ${allowed
        ? `<div style="height:${Math.max(180, e.height)}px;border:1px solid rgba(0,0,0,.1);border-radius:8px;overflow:hidden;background:#fff">
             <div style="height:28px;background:#f6f5f4;border-bottom:1px solid rgba(0,0,0,.1);display:flex;align-items:center;padding:0 10px;gap:8px;font-size:12px;color:var(--bmp-text-secondary)">
               <span>${e.title}</span><span style="margin-left:auto;color:var(--bmp-color-primary);cursor:pointer">↗ 在新标签页打开</span>
             </div>
             <div style="height:calc(100% - 28px);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;color:var(--bmp-text-secondary);background:repeating-linear-gradient(45deg,#f8f7f6,#f8f7f6 10px,#f2f1ef 10px,#f2f1ef 20px)">
               <div style="font-size:30px">🖥</div><div class="fs-13">模拟内嵌内容区（真实环境为 iframe 渲染目标页）</div>
             </div>
           </div>
           <div class="fs-12 text-secondary mt-2">✅ 白名单内 → 正常内嵌；应用<i>图标点击</i>仍走新标签页（不改 #5，约束 ④）。</div>`
        : `<div style="border:1px dashed var(--bmp-color-danger);border-radius:8px;padding:24px;text-align:center">
             <div style="font-size:30px">🚫</div>
             <div class="fs-14 mt-2" style="color:var(--bmp-text-title)"><b>${e.title}</b></div>
             <div class="fs-13 text-secondary mt-2">域名 ${host} 不在白名单，禁止内嵌</div>
             <button class="btn btn-primary mt-3" onclick="msg('info','模拟：在新标签页打开 ' + '${e.url}')">↗ 在新标签页打开</button>
           </div>`}
    </div>`);
}
function portalRerenderEmbeds(tbody) {
  // 重建表体：保留表头行（第一行），替换其余行
  const table = tbody.closest("table");
  const trs = Array.from(table.querySelectorAll("tr"));
  trs.slice(1).forEach(t => t.remove());
  table.insertAdjacentHTML("beforeend", portalEmbedsRowsHtml());
}

/** 整体重渲染门户运营页（portal-apps 或 portal-components，保持当前上下文） */
function portalRerenderPage() {
  const root = document.getElementById("pageRoot");
  if (!root) return;
  let pageKey = "portal-apps";
  try {
    const p = new URLSearchParams(location.search).get("page");
    if (p === "portal-components") pageKey = "portal-components";
    else if (p === "portal-apps") pageKey = "portal-apps";
    else if (window._portalTab && ["cards", "embeds", "intents"].indexOf(window._portalTab) >= 0) pageKey = "portal-components";
  } catch (e) { /* 忽略 */ }
  if (window.PAGES[pageKey]) root.innerHTML = PAGES[pageKey].render();
}

/* ============ 操作：添加 / 编辑嵌入页面（白名单校验） ============ */
function portalEmbedAdd(cardId) {
  const editing = !!cardId && _portalEmbeds.some(e => e.cardId === cardId);
  const e = editing ? _portalEmbeds.find(x => x.cardId === cardId) : null;
  const cur = e || { cardId: "", title: "", url: "", col: "center", height: 320, roles: [] };
  showDrawer(editing ? "编辑嵌入页面卡片" : "添加嵌入页面", `
    <div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
      🔗 嵌入页面用于<b>页面驻留</b>（决议 #5b）：把已登记页面受控内嵌到首页三栏。<b>URL 域名须命中 I1 应用注册 / 原型允许 host</b>，否则将被拒收。
    </div>
    <div class="field"><label>从已注册应用选择（自动带出 URL）</label>
      <select class="select" onchange="portalEmbedPick(this.value)" id="peSource">
        <option value="">— 手动填写 URL —</option>
        ${_portalEmbedSources.map((s, i) => `<option value="${i}">${s.name}（${s.host}）</option>`).join("")}
      </select></div>
    <div class="field"><label><span class="req">*</span>卡片标题</label>
      <input class="input" id="peTitle" value="${layEsc(cur.title)}" placeholder="如：经营驾驶舱（领导视角）"></div>
    <div class="field"><label><span class="req">*</span>目标 URL</label>
      <input class="input mono" id="peUrl" value="${layEsc(cur.url)}" placeholder="https://dashboard.lubon.local/ceo">
      <div class="tip" id="peHostTip">${cur.url ? portalHostHintHtml(cur.url) : "填写后自动校验域名是否在白名单内"}</div></div>
    <div class="field" style="display:flex;gap:12px">
      <div style="flex:1"><label>所属栏位</label>
        <select class="select" id="peCol">
          <option value="left" ${cur.col === "left" ? "selected" : ""}>左栏</option>
          <option value="center" ${cur.col === "center" ? "selected" : ""}>中栏（大屏建议）</option>
          <option value="right" ${cur.col === "right" ? "selected" : ""}>右栏</option>
        </select></div>
      <div style="flex:1"><label>高度（px）</label>
        <input class="input" id="peHeight" type="number" min="120" step="20" value="${cur.height || 320}"></div>
    </div>
    <div class="field"><label>可见角色</label>
      <input class="input" id="peRoles" value="${(cur.roles || []).join("、")}" placeholder="如：系统管理员、研发中心（留空=全员）">
      <div class="tip">多个角色以「、」或「,」分隔；留空表示全员可见</div></div>
    <div class="readonly-banner" style="background:var(--bmp-color-warning-light);border-color:var(--bmp-border);color:var(--bmp-color-warning-dark)">
      ⚠ 落地约束：加载失败 / 超时（8s）/ 被目标页拒绝（X-Frame-Options）→ 显示<b>标题 + 「在新标签页打开」降级卡</b>，不留白屏；加载中显示<b>骨架 loading</b>；应用<i>图标点击</i>仍走<b>新标签页</b>（不改 #5）。
    </div>
    <div class="flex gap-2 mt-4">
      <button class="btn btn-primary" onclick="portalEmbedSave('${editing ? cardId : ""}')">${editing ? "保存修改" : "添加嵌入页"}</button>
      <button class="btn" onclick="closeDrawer('d-generic')">取消</button>
    </div>`);
}
function portalHostHintHtml(url) {
  const host = portalHostOf(url);
  if (!host) return '<span class="text-warning">⚠ 无法识别域名，请填写完整 URL（含 https://）</span>';
  return portalHostAllowed(host)
    ? `<span class="text-success">✓ 域名 ${host} 已在白名单内，允许嵌入</span>`
    : `<span class="text-danger">✗ 域名 ${host} 未登记（请在 I1 应用注册维护 domain_whitelist）</span>`;
}
function portalEmbedPick(idx) {
  const s = _portalEmbedSources[idx];
  if (!s) return;
  document.getElementById("peUrl").value = s.url;
  if (!document.getElementById("peTitle").value) document.getElementById("peTitle").value = s.name;
  const tip = document.getElementById("peHostTip"); if (tip) tip.innerHTML = portalHostHintHtml(s.url);
}
function portalEmbedSave(cardId) {
  const title = layVal("peTitle").trim();
  const url = layVal("peUrl").trim();
  const col = layVal("peCol") || "center";
  const height = parseInt(layVal("peHeight"), 10) || 320;
  const roles = layVal("peRoles").split(/[、,，]/).map(s => s.trim()).filter(Boolean);
  if (!title) { msg("error", "请填写卡片标题"); return; }
  if (!url) { msg("error", "请填写目标 URL"); return; }
  const host = portalHostOf(url);
  if (!host) { msg("error", "URL 格式不正确，请填写完整地址（含 https://）"); return; }
  if (!portalHostAllowed(host)) {
    msg("error", `域名 ${host} 未登记，须在 I1 应用注册 domain_whitelist 中维护后才能嵌入`);
    const tip = document.getElementById("peHostTip"); if (tip) tip.innerHTML = portalHostHintHtml(url);
    return;
  }
  const editing = !!cardId && _portalEmbeds.some(e => e.cardId === cardId);
  if (editing) {
    const e = _portalEmbeds.find(x => x.cardId === cardId);
    e.title = title; e.url = url; e.col = col; e.height = height; e.roles = roles;
    msg("success", `嵌入卡片「${title}」已更新`);
  } else {
    const slug = (title.toLowerCase().match(/[a-z0-9]+/g) || []).join("-") || "page";
    let n = 1; while (_portalEmbeds.some(e => e.cardId === `embed:${slug}-${n}`)) n++;
    const newId = `embed:${slug}-${n}`;
    _portalEmbeds.push({ cardId: newId, title, url, col, height, roles, status: "已启用" });
    msg("success", `已添加嵌入卡片「${title}」（cardId=${newId}）`);
  }
  closeDrawer("d-generic");
  window._portalTab = "embeds";
  portalRerenderPage();
}
function portalEmbedToggle(cardId) {
  const e = _portalEmbeds.find(x => x.cardId === cardId); if (!e) return;
  e.status = e.status === "已启用" ? "已停用" : "已启用";
  msg("success", `嵌入卡片「${e.title}」已${e.status === "已启用" ? "启用" : "停用"}（写审计日志）`);
  portalRerenderPage();
}
function portalEmbedRemove(cardId) {
  const e = _portalEmbeds.find(x => x.cardId === cardId); if (!e) return;
  _portalEmbeds = _portalEmbeds.filter(x => x.cardId !== cardId);
  msg("success", `嵌入卡片「${e.title}」已移除（写审计日志）`);
  portalRerenderPage();
}

/* ============================================================
   特殊页（非通用列表范式）
   ============================================================ */

/* ---------- UI-C-02 角色管理（左列表右详情） ---------- */
PAGES.roles = {
  crumb: ["身份与权限", "角色管理"],
  render() {
    return `<div class="split-layout" style="grid-template-columns:300px 1fr">
      <div class="card" style="padding:8px">
        <button class="btn btn-primary btn-sm" style="width:100%;margin-bottom:8px" onclick="roleNew()">＋ 新建角色</button>
        <div id="roleList">${MOCK.roles.map((r, i) => `
          <div class="node ${i === 0 ? "" : ""}" style="padding:9px 10px;border-radius:4px;cursor:pointer;display:flex;align-items:center;gap:6px" data-i="${i}" onclick="selectRole(${i})">
            <b class="fs-13">${r.name}</b><span class="mono fs-12 text-secondary">${r.code}</span>
            <span class="cnt" style="margin-left:auto" class="fs-12 text-secondary">${r.members} 人</span>
            ${r.source === "系统预置" ? '<span class="tag tag-info">预置</span>' : '<span class="tag tag-primary">自建</span>'}
          </div>`).join("")}</div>
      </div>
      <div class="card" id="roleDetail"></div>
    </div>`;
  },
  after() { selectRole(0); }
};
function selectRole(i) {
  document.querySelectorAll("#roleList [data-i]").forEach(n => n.style.background = n.dataset.i == i ? "var(--bmp-color-primary-light)" : "");
  const r = MOCK.roles[i];
  const preset = r.source === "系统预置";
  document.getElementById("roleDetail").innerHTML = `
    <div class="card-head"><h3>${r.name} <span class="mono fs-12 text-secondary">${r.code}</span></h3>
      <span>${preset ? '<span class="tag tag-info">系统预置 · 禁止删除</span>' : `<button class="btn btn-sm text-danger" style="border:none" onclick="highRisk('删除角色','删除后 ${r.members} 名成员将失去该角色权限。','${r.name}','角色已删除（写审计日志）')">删除角色</button>`}</span></div>
    <div class="tabs mb-4">
      <div class="tab active" onclick="roleTab(this,'basic',${i})">基本信息</div>
      <div class="tab" onclick="roleTab(this,'perm',${i})">权限配置</div>
      <div class="tab" onclick="roleTab(this,'member',${i})">成员管理（${r.members}）</div>
    </div>
    <div id="rolePane"></div>`;
  roleTab(document.querySelector("#roleDetail .tab"), "basic", i);
}
function roleTab(el, tab, i) {
  el.parentElement.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  const r = MOCK.roles[i], pane = document.getElementById("rolePane");
  if (tab === "basic") {
    pane.innerHTML = `<dl class="desc-grid" style="max-width:520px">
      <dt>角色名称</dt><dd>${r.name}</dd><dt>角色编码</dt><dd class="mono">${r.code}${r.source === "系统预置" ? "（预置角色只读）" : ""}</dd>
      <dt>来源</dt><dd>${r.source}</dd><dt>成员数</dt><dd>${r.members}</dd>
      <dt>描述</dt><dd><input class="input" style="max-width:320px" value="${r.name}默认描述" ${r.source === "系统预置" ? "" : ""}></dd></dl>
      <div class="mt-4"><button class="btn btn-primary" onclick="msg('success','角色信息已保存')">保存</button></div>`;
  } else if (tab === "perm") {
    window._rolePermRoleIdx = i;
    if (!window._rolePermChecked) {
      window._rolePermChecked = new Set((MOCK.permissionsFlat || []).filter(p => p.roleRefs >= 2).map(p => p.code));
    }
    pane.innerHTML = `<div class="readonly-banner">ℹ 权限保存后立即生效，在线用户将在<b>下次请求</b>时应用新权限（缓存失效策略）</div>
    <div class="tabs mb-3" style="border:none">
      <div class="tab active" style="padding:4px 0" onclick="rolePermTab(this,'menu')">菜单权限</div>
      <div class="tab" style="padding:4px 0;margin-left:20px" onclick="rolePermTab(this,'api')">API / 分域权限点</div>
    </div>
    <div id="rolePermPane"></div>
    <div class="mt-4"><button class="btn btn-primary" onclick="msg('success','权限已保存，在线用户下次请求生效（写审计日志）')">保存权限配置</button></div>`;
    const innerMenuTab = document.querySelector("#rolePane .tabs .tab");
    if (innerMenuTab) rolePermTab(innerMenuTab, "menu");
  } else {
    pane.innerHTML = `<div class="list-toolbar"><div class="left">
      <button class="btn btn-sm btn-primary" onclick="roleAddMember('${r.name}')">＋ 添加成员</button>
      <button class="btn btn-sm" onclick="msg('warning','请先勾选成员')">批量移除</button></div></div>
    <div class="table-wrap"><table class="tbl"><tr><th style="width:32px"><input type="checkbox" style="accent-color:var(--bmp-color-primary)"></th><th>姓名</th><th>工号</th><th>部门</th><th>加入时间</th><th>操作</th></tr>
    ${MOCK.employees.filter(e => e.status === "在职").slice(0, 4).map(e => `<tr><td><input type="checkbox" style="accent-color:var(--bmp-color-primary)"></td><td>${e.name}</td><td class="mono">${e.no}</td><td>${e.org}</td><td>2026-08-01</td><td class="ops"><button class="btn-text danger" onclick="msg('success','已移除成员（写审计日志）')">移除</button></td></tr>`).join("")}
    </table></div>`;
  }
}

/* ---------- UI-C-03 权限点管理（左树：业务域→应用 / 右表） ---------- */

/** 接入系统展示名（门户外链 + 流程应用 + platform） */
function permAppDisplayName(appCode) {
  if (appCode === "platform") return "业务中台 platform";
  const ext = (MOCK.apps || []).find(a => a.appCode === appCode);
  if (ext) return `${ext.icon || ""} ${ext.name} · ${appCode}`.trim();
  const wf = (MOCK.portalWorkflowApps || []).find(a => a.appCode === appCode);
  if (wf) return `${wf.icon || ""} ${wf.name} · ${appCode}`.trim();
  return appCode;
}

/** 外链应用默认业务域（无扁平行时仍可在左树展示） */
function permDefaultAppDomain(appCode) {
  const map = { crm: "SALES", oa: "PROCUREMENT", recruit: "HR", expense: "GENERAL", okr: "GENERAL", pm: "GENERAL", wiki: "GENERAL", bi: "IT" };
  return map[appCode] || "GENERAL";
}

/** 构建 biz_domain → app_code 列表（来自 permissionsFlat + 门户种子） */
function permDomainAppIndex() {
  const byDom = {};
  const touch = (dom, appCode) => {
    if (!dom || !appCode) return;
    if (!byDom[dom]) byDom[dom] = new Map();
    byDom[dom].set(appCode, permAppDisplayName(appCode));
  };
  (MOCK.permissionsFlat || []).forEach(p => touch(p.bizDomain, p.appCode));
  (MOCK.portalWorkflowApps || []).forEach(w => touch(w.bizDomain, w.appCode));
  (MOCK.apps || []).forEach(a => touch(permDefaultAppDomain(a.appCode), a.appCode));
  touch("GENERAL", "platform");
  touch("IT", "platform");
  return byDom;
}

/** 业务域分支展开状态（sessionStorage，默认全部展开） */
function permTreeExpandedMap() {
  try {
    const raw = sessionStorage.getItem("permTreeExpanded");
    if (raw) return JSON.parse(raw);
  } catch (_) { /* ignore */ }
  return null;
}

function permTreeSaveExpanded(map) {
  try { sessionStorage.setItem("permTreeExpanded", JSON.stringify(map)); } catch (_) { /* ignore */ }
}

function permTreeBranchExpanded(domKey, kw, domHit, hasApps) {
  if (kw) return !!(domHit || hasApps);
  const map = permTreeExpandedMap();
  if (map && Object.prototype.hasOwnProperty.call(map, domKey)) return !!map[domKey];
  return true;
}

function permToggleDomainBranch(ev, domainCode) {
  ev.stopPropagation();
  const domKey = "dom:" + domainCode;
  let map = permTreeExpandedMap();
  if (!map) {
    map = {};
    (MOCK.bizDomains || []).forEach(d => { map["dom:" + d.code] = true; });
  }
  const open = permTreeBranchExpanded(domKey, "", false, true);
  map[domKey] = !open;
  permTreeSaveExpanded(map);
  permTreeSearchRefresh();
}

function permDomainAppTreeHtml() {
  const idx = permDomainAppIndex();
  const kwEl = document.getElementById("permTreeSearch");
  const kw = (kwEl && kwEl.value.trim().toLowerCase()) || "";
  const sel = window._permTreeSel || { kind: "all", domain: "", app: "" };
  const nodeActive = key => {
    if (sel.kind === "all" && key === "all") return true;
    if (sel.kind === "domain" && key === "dom:" + sel.domain) return true;
    if (sel.kind === "app" && key === "app:" + sel.domain + ":" + sel.app) return true;
    return false;
  };
  const domains = (MOCK.bizDomains || []).slice();
  let html = `<div class="node ${nodeActive("all") ? "active" : ""}" data-perm-node="all" onclick="permSelectNode('all','','')"><span class="tree-label">📂 全部权限点</span></div>`;
  domains.forEach(d => {
    const apps = idx[d.code] ? [...idx[d.code].entries()].sort((a, b) => a[0].localeCompare(b[0])) : [];
    const domHit = kw && (d.label.toLowerCase().includes(kw) || d.code.toLowerCase().includes(kw));
    const appRows = apps.filter(([code, label]) => {
      if (!kw) return true;
      return domHit || code.toLowerCase().includes(kw) || label.toLowerCase().includes(kw);
    });
    if (kw && !domHit && !appRows.length) return;
    const domKey = "dom:" + d.code;
    const expanded = permTreeBranchExpanded(domKey, kw, domHit, appRows.length > 0);
    const chev = expanded ? "▼" : "▶";
    html += `<div class="tree-branch">
      <div class="node tree-parent ${nodeActive(domKey) ? "active" : ""}" data-perm-node="${domKey}">
        <button type="button" class="tree-toggle" title="${expanded ? "收起" : "展开"}" onclick="permToggleDomainBranch(event,'${d.code}')">${chev}</button>
        <span class="tree-label" onclick="permSelectNode('domain','${d.code}','')">${d.label} <span class="mono fs-12 text-secondary">${d.code}</span></span>
        <span class="cnt">${appRows.length}</span>
      </div>
      <div class="children${expanded ? "" : " collapsed"}">${appRows.map(([code, label]) => {
        const appKey = "app:" + d.code + ":" + code;
        return `<div class="node tree-leaf ${nodeActive(appKey) ? "active" : ""}" data-perm-node="${appKey}"
          onclick="permSelectNode('app','${d.code}','${code}')"><span class="tree-label">${label}</span></div>`;
      }).join("")}</div>
    </div>`;
  });
  return html;
}

function permSelectNode(kind, domain, app) {
  if (kind === "app" && domain) {
    let map = permTreeExpandedMap();
    if (!map) map = {};
    map["dom:" + domain] = true;
    permTreeSaveExpanded(map);
  }
  window._permTreeSel = { kind, domain: domain || "", app: app || "" };
  window._permFilterDomain = kind === "all" ? "" : (domain || "");
  window._permFilterApp = kind === "app" ? (app || "") : "";
  permApplyFilters();
  const box = document.getElementById("permDomainAppTree");
  if (box && kind === "app" && domain) {
    box.innerHTML = permDomainAppTreeHtml();
    permHighlightTree();
  }
}

function permHighlightTree() {
  const sel = window._permTreeSel || { kind: "all", domain: "", app: "" };
  document.querySelectorAll("#permDomainAppTree [data-perm-node]").forEach(n => {
    const k = n.dataset.permNode;
    let on = false;
    if (sel.kind === "all" && k === "all") on = true;
    else if (sel.kind === "domain" && k === "dom:" + sel.domain) on = true;
    else if (sel.kind === "app" && k === "app:" + sel.domain + ":" + sel.app) on = true;
    n.classList.toggle("active", on);
  });
}

function permAppSelectOptions(domainPref) {
  const idx = permDomainAppIndex();
  const codes = new Set();
  if (domainPref && idx[domainPref]) idx[domainPref].forEach((_, c) => codes.add(c));
  else Object.values(idx).forEach(m => m.forEach((_, c) => codes.add(c)));
  return [...codes].sort().map(c => c + " · " + permAppDisplayName(c).replace(/ · [^·]+$/, "").trim());
}

PAGES.permissions = {
  crumb: ["身份与权限", "权限点管理"],
  render() {
    window._permFilterApp = window._permFilterApp || "";
    window._permFilterDomain = window._permFilterDomain || "";
    if (!window._permTreeSel) {
      window._permTreeSel = window._permFilterApp || window._permFilterDomain
        ? { kind: window._permFilterApp ? "app" : "domain", domain: window._permFilterDomain || "GENERAL", app: window._permFilterApp || "" }
        : { kind: "all", domain: "", app: "" };
    }
    return `<div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
      🧭 <b>B2-F02-1</b>：左侧按<b>业务域（biz_domain）</b> → <b>接入系统（app_code）</b>浏览；点击节点筛选右侧权限点；新建须指定业务域与所属系统。
    </div>
    <div class="split-layout mt-3" style="grid-template-columns:280px 1fr">
      <div class="tree-panel">
        <input class="input tree-search" id="permTreeSearch" placeholder="搜索业务域 / app_code…" oninput="permTreeSearchRefresh()">
        <div class="tree" id="permDomainAppTree">${permDomainAppTreeHtml()}</div>
      </div>
      <div>
        <div class="list-toolbar"><div class="left"><button class="btn btn-primary" onclick="permNew()">＋ 新建权限点</button></div>
        <div class="right" style="display:flex;gap:8px;align-items:center">
          <input class="input" id="permFilterKw" placeholder="编码 / 描述…" style="width:200px" oninput="permApplyFilters()">
          <button class="btn btn-sm" onclick="permResetFilters()">重置</button>
          <span class="fs-12 text-secondary" id="permFilterSummary">${permFilterSummaryText()}</span></div></div>
        <div class="table-wrap"><table class="tbl" id="permFlatTable">
        <tr><th>权限编码</th><th>类型</th><th>app_code</th><th>业务域</th><th>api_pattern</th><th>描述</th><th>引用角色</th><th>操作</th></tr>
        ${permFlatRowsHtml()}
        </table></div>
        <div class="fs-12 text-secondary mt-2">api_pattern 支持通配符 * · 高危 api 变更二次确认 + E2（B2-F02）· 流程发起权限 <span class="mono">workflow:instance:start:{defKey}</span> 随 C1-F01-8 自动注册</div>
      </div>
    </div>`;
  }
};

function permTreeSearchRefresh() {
  const box = document.getElementById("permDomainAppTree");
  if (box) box.innerHTML = permDomainAppTreeHtml();
  permHighlightTree();
}

function permFilterSummaryText() {
  const parts = [];
  const sel = window._permTreeSel || {};
  if (sel.kind === "domain" && sel.domain) parts.push("业务域=" + MOCK.bizDomainLabel(sel.domain));
  else if (sel.kind === "app" && sel.app) {
    parts.push("系统=" + sel.app);
    if (sel.domain) parts.push("业务域=" + MOCK.bizDomainLabel(sel.domain));
  }
  const kw = (document.getElementById("permFilterKw") && document.getElementById("permFilterKw").value.trim()) || "";
  if (kw) parts.push("关键字=" + kw);
  return parts.length ? "筛选：" + parts.join(" · ") : "当前：全部权限点";
}

function permFilteredRows() {
  const app = window._permFilterApp || "";
  const dom = window._permFilterDomain || "";
  const kwEl = document.getElementById("permFilterKw");
  const kw = (kwEl && kwEl.value.trim().toLowerCase()) || "";
  return (MOCK.permissionsFlat || []).filter(p => {
    if (app && p.appCode !== app) return false;
    if (dom && p.bizDomain !== dom) return false;
    if (kw && !(p.code.toLowerCase().includes(kw) || (p.desc || "").toLowerCase().includes(kw) || (p.apiPattern || "").toLowerCase().includes(kw))) return false;
    return true;
  });
}

function permFlatRowsHtml() {
  const rows = permFilteredRows();
  const typeTag = t => `<span class="tag tag-${t === "menu" ? "info" : t === "button" ? "primary" : "warning"}">${t}</span>`;
  if (!rows.length) {
    return `<tr><td colspan="8" class="text-secondary">无匹配权限点，请调整左侧树或关键字</td></tr>`;
  }
  return rows.map(p => {
    const esc = (p.desc || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    return `<tr>
    <td class="mono">${p.code}</td><td>${typeTag(p.type)}</td>
    <td class="mono">${p.appCode}</td><td>${MOCK.bizDomainLabel(p.bizDomain)}</td>
    <td class="mono">${p.apiPattern}</td><td>${p.desc}</td><td>${p.roleRefs} 个角色</td>
    <td class="ops"><button class="btn-text" onclick="permEdit('${p.code}','${p.type}','${p.appCode}','${p.bizDomain}','${p.apiPattern}','${esc}')">编辑</button><button class="btn-text danger" onclick="permDelete('${p.code}',${p.roleRefs})">删除</button></td>
  </tr>`;
  }).join("");
}

function permApplyFilters() {
  const tbody = document.getElementById("permFlatTable");
  if (tbody) {
    tbody.innerHTML = `<tr><th>权限编码</th><th>类型</th><th>app_code</th><th>业务域</th><th>api_pattern</th><th>描述</th><th>引用角色</th><th>操作</th></tr>` + permFlatRowsHtml();
  }
  const sum = document.getElementById("permFilterSummary");
  if (sum) sum.textContent = permFilterSummaryText();
  permHighlightTree();
}

function permResetFilters() {
  window._permFilterApp = "";
  window._permFilterDomain = "";
  window._permTreeSel = { kind: "all", domain: "", app: "" };
  const kwEl = document.getElementById("permFilterKw");
  const treeKw = document.getElementById("permTreeSearch");
  if (kwEl) kwEl.value = "";
  if (treeKw) treeKw.value = "";
  permTreeSearchRefresh();
  permApplyFilters();
}

/* ---------- 组织树递归渲染（UI-C-06/07 共用） ---------- */
function orgTreeHtml(node, depth = 0, kw = "") {
  const hit = kw && node.name.includes(kw);
  const self = `<div class="node ${node.disabled ? "disabled-node" : ""}" onclick="selectOrg(${node.id},'${node.name}',${node.count},${!!node.disabled})" data-oid="${node.id}">
    ${node.children ? "▾" : "・"} ${hit ? `<mark style="background:var(--bmp-color-warning-light)">${node.name}</mark>` : node.name}
    <span class="cnt">${node.count} 人</span></div>`;
  const kids = node.children ? `<div class="children">${node.children.map(c => orgTreeHtml(c, depth + 1, kw)).join("")}</div>` : "";
  return self + kids;
}

/* ---------- UI-C-06 组织管理（左树右表 + 只读横幅） ---------- */
PAGES.orgs = {
  crumb: ["主数据", "组织管理"],
  render() {
    return `<div class="split-layout">
      <div class="tree-panel">
        <input class="input tree-search" placeholder="搜索组织，回车定位…" onkeydown="if(event.key==='Enter')msg('info','已定位到匹配节点并高亮')">
        <div class="tree" id="orgTree">${orgTreeHtml(MOCK.orgTree)}</div>
      </div>
      <div>
        <div class="readonly-banner">🔒 数据由 <b>HR 系统</b>每日 02:00 全量同步（单一权威源，F1-F03），组织字段只读；如需修改请在源系统操作 <a href="console.html?page=sync-source">[查看权威源配置]</a></div>
        <div class="card mb-3" id="orgDetail">
          <div class="card-head"><h3>麓邦集团</h3><span class="fs-12 text-secondary">org_code: LUBON-ROOT · path: /0/1/ · 生效期：2020-01-01 ~ 长期</span></div>
          <dl class="desc-grid" style="grid-template-columns:90px 1fr 90px 1fr">
            <dt>组织名称</dt><dd><input class="input" value="麓邦集团" disabled></dd><dt>组织编码</dt><dd class="mono">LUBON-ROOT</dd>
            <dt>上级组织</dt><dd>—（根节点）</dd><dt>在职人数</dt><dd>512</dd>
            <dt>负责人</dt><dd>周总</dd><dt>状态</dt><dd><span class="tag tag-success">正常</span></dd>
          </dl>
          <div class="mt-3 fs-12 text-secondary">停用校验规则：无下级组织且无在职人员方可停用，否则阻断并列出原因（T2-05 验收）· 物化路径面包屑含生效期标识：当前/未来/历史</div>
        </div>
        <div class="list-toolbar"><div class="left"><b class="fs-13">下级组织（5）</b></div><div class="right"><button class="btn btn-sm" disabled title="权威源同步模式下不可用">＋ 新增下级（只读）</button></div></div>
        <div class="table-wrap"><table class="tbl"><tr><th>组织名称</th><th>编码</th><th>人数</th><th>负责人</th><th>状态</th><th>操作</th></tr>
        ${MOCK.orgTree.children.map(o => `<tr><td>${o.name}</td><td class="mono">LUBON-${String(o.id).padStart(3, "0")}</td><td>${o.count}</td><td>—</td>
          <td>${o.disabled ? '<span class="tag tag-info">已停用</span>' : '<span class="tag tag-success">正常</span>'}</td>
          <td class="ops"><button class="btn-text" onclick="msg('info','只读模式：详情抽屉展示组织信息+变更记录时间线')">详情</button>
          ${o.disabled ? "" : `<button class="btn-text danger" onclick="msg('error','无法停用：存在下级组织 2 个、在职人员 ${o.count} 人（阻断原因列表）')">停用</button>`}</td></tr>`).join("")}
        </table></div>
      </div>
    </div>`;
  }
};
function selectOrg(id, name, count, disabled) {
  document.querySelectorAll("#orgTree .node").forEach(n => n.classList.toggle("active", n.dataset.oid == id));
  document.querySelector("#orgDetail h3").textContent = name + (disabled ? "（已停用）" : "");
  msg("info", `已选中组织：${name}（${count} 人）· 右侧详情与人员列表联动刷新`);
}

/* ---------- UI-C-07 人员管理（左树右表 + 详情抽屉）· D14 维护账号 + 自建维护模式 ---------- */
PAGES.employees = {
  crumb: ["主数据", "人员管理"],
  render() {
    /* A7 默认态反转：custom 源下默认开放编辑（横幅为「自建维护模式」）；连接器源只读（保留规则） */
    const readonly = window._empConnectorSource === true;
    const banner = readonly
      ? `<div class="readonly-banner">🔒 人员数据由 <b>连接器源</b>同步，只读；异常数据请在源系统修正 <a href="console.html?page=sync-logs">[同步日志]</a></div>`
      : `<div class="readonly-banner" style="background:var(--bmp-color-success-light);border-color:var(--bmp-color-success-light);color:var(--bmp-color-success-dark)">✏️ <b>当前为自建维护模式（custom 源），数据由中台维护</b>；字段可编辑，变更产生 <span class="mono">md.*</span> 事件并分发至各系统（F1-F04）。</div>`;
    return `<div class="split-layout">
      <div class="tree-panel">
        <input class="input tree-search" placeholder="搜索组织…">
        <div class="tree" id="empTree">${orgTreeHtml(MOCK.orgTree)}</div>
      </div>
      <div>
        ${banner}
        <div class="filter-bar" style="grid-template-columns:repeat(4,1fr)">
          <div class="field"><label>关键字</label><input class="input" placeholder="姓名 / 工号"></div>
          <div class="field"><label>任职状态</label><select class="select"><option>在职（默认）</option><option>离职</option><option>全部</option></select></div>
          <div class="field"><label>账号类型</label><select class="select"><option>全部</option><option>正式</option><option>外包</option><option>维护</option></select></div>
          <div class="f-ops"><button class="btn btn-primary" onclick="msg('info','筛选已应用')">查询</button><button class="btn">重置</button></div>
        </div>
        <div class="list-toolbar"><div class="left"><button class="btn btn-primary" ${readonly ? "disabled" : ""} onclick="empNewPerson()">＋ 新增人员</button>
          <span class="fs-12 text-secondary">共 512 人 · 维护账号以 <span class="mono">employee_type=3</span> 标识</span></div>
          <div class="right">${readonly ? "连接器源：只读，请在源系统操作" : "自建维护：中台可编辑"}</div></div>
        <div class="table-wrap"><table class="tbl"><tr><th>工号</th><th>姓名</th><th>部门</th><th>岗位</th><th>直属上级</th><th>状态</th><th>账号类型</th><th>同步来源</th><th>中台账号</th><th>操作</th></tr>
        ${MOCK.employees.map(e => `<tr style="${e.status === "离职" ? "opacity:.55" : ""}">
          <td class="mono">${e.no}</td><td><b>${e.name}</b></td><td>${e.org}</td><td>${e.post}</td><td>${e.leader}</td>
          <td>${statusTag(e.status, { "在职": "success", "离职": "info" })}</td>
          <td>${acctTypeTag(e.empType)}</td>
          <td><span class="tag tag-info">${e.source}</span></td>
          <td>${e.account ? '<span class="tag tag-success">已开通</span>' : '<span class="tag tag-warning">未开通</span>'}</td>
          <td class="ops"><button class="btn-text" onclick="empDetail('${e.no}')">详情</button>${!e.account && e.status === "在职" && !readonly ? `<button class="btn-text" onclick="empOpenAccount('${e.no}')">开通账号</button>` : ""}</td>
        </tr>`).join("")}
        </table></div>
        <div class="pagination">共 512 人<span class="pg active">1</span><span class="pg">2</span><span class="pg">3</span><span class="pg">…</span><span class="pg">52</span></div>
      </div>
    </div>`;
  }
};
/* 账号类型标签（D14）：正式=中性 / 外包=info / 维护=warning */
function acctTypeTag(t) {
  const m = { "正式": "acct-type-formal", "外包": "acct-type-outsrc", "维护": "acct-type-mnt" };
  const v = t || "正式";
  return `<span class="acct-type ${m[v] || "acct-type-formal"}">${v === "维护" ? "维护账号" : v}</span>`;
}
/* ---- D14 · 新增人员抽屉（自建维护模式下中台可写；维护账号走 empType=维护）----
   复用 CM.openDrawer（字段 >8 走抽屉范式）；工号/账号类型联动校验；
   custom 源下变更将产生 md.employee.created 事件并分发（F1-F04）。 */
function empNewPerson() {
  if (window._empConnectorSource === true) { msg("warning", "连接器源为只读，请在源系统新增人员"); return; }
  const orgs = ["数字化中心/平台研发组", "研发中心/前端组", "研发中心/后端组", "销售部/华北大区", "销售部/华东大区", "人力资源部"];
  CM.openDrawer({
    id: "cm-emp-new",
    title: "新增人员（自建维护模式）",
    width: 720,
    submitText: "创建人员",
    body: '<div class="readonly-banner" style="background:var(--bmp-color-success-light);border-color:var(--bmp-color-success-light);color:var(--bmp-color-success-dark)">✏️ 当前为<b>自建维护模式（custom 源）</b>：创建成功后将产生 <span class="mono">md.employee.created</span> 事件并分发各系统（F1-F04）；变更全程留痕（F1-F01）。</div>',
    fields: [
      { name: "name", label: "姓名", type: "text", required: true, placeholder: "如：张三" },
      { name: "no", label: "工号", type: "text", required: true, placeholder: "如：EMP-2026-0001 / MNT-001",
        tip: "维护账号用 MNT-{流水} 前缀（D14）；正式/外包用 EMP-{年}-{流水}",
        validators: [(v) => {
          const s = String(v || "").trim();
          if (!s) return "工号为必填项";
          if (!/^(EMP|MNT)-\d/.test(s)) return "工号须以 EMP- 或 MNT- 开头";
          if (MOCK.employees.some(e => e.no === s)) return "该工号已存在";
          return null;
        }] },
      { name: "empType", label: "账号类型", type: "select", required: true, value: "正式", options: ["正式", "外包", "维护"],
        tip: "维护账号不对应钉钉 userid，登录走「账号密码 + MFA」" },
      { name: "org", label: "组织", type: "select", required: true, options: orgs },
      { name: "post", label: "岗位", type: "text", required: true, placeholder: "如：前端工程师" },
      { name: "mobile", label: "手机号", type: "text", placeholder: "选填", validators: [(v) => (!v || /^1\d{10}$/.test(String(v)) ? null : "手机号格式不正确")] }
    ],
    onSubmit: (values) => {
      if (values.empType === "维护" && values.no.indexOf("MNT-") !== 0) { msg("error", "维护账号工号须以 MNT- 开头"); return; }
      if (values.empType !== "维护" && values.no.indexOf("EMP-") !== 0) { msg("error", "正式/外包人员工号须以 EMP- 开头"); return; }
      CM.close("cm-emp-new");
      msg("success", `人员「${values.name}」（${values.no}，${values.empType}）已创建并产生 md.employee.created 事件（写审计日志）`);
      route();
    }
  });
}
function empDetail(no) {
  const e = MOCK.employees.find(x => x.no === no);
  const mnt = e.empType === "维护";
  showDrawer("人员详情 · " + e.name, `
    <dl class="desc-grid"><dt>工号</dt><dd class="mono">${e.no}</dd><dt>姓名</dt><dd>${e.name}</dd>
    <dt>部门</dt><dd>${e.org}</dd><dt>岗位</dt><dd>${e.post}</dd><dt>直属上级</dt><dd>${e.leader}</dd>
    <dt>任职状态</dt><dd>${statusTag(e.status, { "在职": "success", "离职": "info" })}</dd><dt>账号类型</dt><dd>${acctTypeTag(e.empType)}${mnt ? '<span class="fs-12 text-secondary" style="margin-left:8px">（非普通员工 · 登录走「账号密码 + MFA」）</span>' : ""}</dd><dt>同步来源</dt><dd>${e.source}</dd>
    <dt>中台账号</dt><dd>${e.account ? "zhangsan 已绑定" : `<span class="text-warning">未开通</span> <button class="btn btn-sm" style="margin-left:8px" onclick="msg('info','联动新建账号弹窗')">开通账号</button>`}</dd></dl>
    ${mnt ? '<div class="readonly-banner mt-3" style="background:var(--bmp-color-warning-light);border-color:var(--bmp-color-warning-light);color:var(--bmp-color-warning-dark)">⚠ 维护账号：工号前缀 <span class="mono">MNT-{流水}</span>；<b>不对应钉钉 userid</b>，登录走「账号密码 + MFA」；停用需校验「无未完结任务」。</div>' : ""}
    <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:20px 0 12px">变更记录（倒序）</h4>
    <div class="timeline">
      <div class="t-item"><b>部门异动</b>：研发中心 → ${e.org}<div class="t-time">09-20 02:00 · 来源：${e.source}（md.employee.transferred 事件已发布）</div></div>
      <div class="t-item"><b>岗位变更</b>：工程师 → ${e.post}<div class="t-time">09-01 02:00 · 来源：${e.source}</div></div>
      <div class="t-item"><b>入职登记</b><div class="t-time">2020-03-16 · 来源：${e.source}（md.employee.created）</div></div>
    </div>`);
}

/* ---------- UI-C-08 权威源配置向导（3 步 · D12：custom 自建维护为默认） ----------
   改造要点：① 步骤 1 默认选中「自建维护」，连接器三卡保留但标注「本环境不启用」；
   ② 步骤 2 在 custom 下换「维护说明卡」（不适用字段映射）；
   ③ 步骤 3 在 custom 下换「模板下载 + 批量导入 + 校验报告」，与「连接测试门禁」解耦 → 改为「导入门禁」；
   ④ 启用文案反转（custom 下「中台可编辑，变更产生 md.* 事件」，不再「现有手工数据将被覆盖」）。
   连接器路径（hr/dt/wc）保留原三步逻辑。 */
PAGES["sync-source"] = {
  crumb: ["主数据", "权威源配置向导"],
  render() {
    return `<div class="card" style="max-width:960px">
      <div class="steps" id="wizSteps">
        <div class="step active" data-s="1"><span class="n">1</span><span class="t">选择来源</span></div><div class="line"></div>
        <div class="step" data-s="2"><span class="n">2</span><span class="t">字段映射与同步策略</span></div><div class="line"></div>
        <div class="step" data-s="3"><span class="n">3</span><span class="t">验证与启用</span></div>
      </div>
      <div id="wizBody"></div>
      <div class="flex justify-between mt-4" style="border-top:1px solid var(--bmp-border);padding-top:16px">
        <span><button class="btn" id="wizPrev" onclick="wizGo(-1)" disabled>上一步</button> <button class="btn" onclick="msg('success','草稿已保存（支持保存草稿 · T2-07 验收）')">保存草稿</button></span>
        <button class="btn btn-primary" id="wizNext" onclick="wizGo(1)">下一步</button>
      </div>
    </div>`;
  },
  after() { wizStep = 1; wizSource = "self"; wizTestPassed = false; wizImportPassed = false; renderWiz(); }
};
let wizStep = 1, wizSource = "self", wizTestPassed = false, wizImportPassed = false;
function wizGo(d) {
  const n = wizStep + d;
  if (n < 1 || n > 3) return;
  if (wizStep === 1 && d > 0 && !wizSource) { msg("error", "请先选择权威源类型"); return; }
  /* 步骤 2 必映射校验（仅连接器源）：custom 走维护说明卡，不适用 */
  if (wizStep === 2 && d > 0 && wizSource !== "self") {
    const missing = wizMissingRequiredMappings();
    if (missing.length) { msg("error", "必映射字段未映射：" + missing.map(m => m.label).join("、") + "，请先选择源字段（必映射项不可忽略）"); return; }
  }
  wizStep = n;
  if (wizStep !== 3) { wizTestPassed = false; wizImportPassed = false; } /* 离开步骤 3 重置门禁 */
  renderWiz();
}
/* 收集步骤 2 未映射的必映射字段（返回 [{key,label}]） */
const WIZ_REQ_FIELDS = [{ key: "emp_name", label: "姓名" }, { key: "emp_no", label: "工号" }, { key: "dept_path", label: "部门" }];
function wizMissingRequiredMappings() {
  const missing = [];
  WIZ_REQ_FIELDS.forEach(f => {
    const sel = document.querySelector('[data-map="' + f.key + '"]');
    if (!sel || !sel.value) missing.push(f);
  });
  return missing;
}
function renderWiz() {
  const self = wizSource === "self";
  /* 步骤标题按来源分流 */
  const titles = self ? ["选择来源", "维护说明", "初始数据导入"] : ["选择来源", "字段映射与同步策略", "验证与启用"];
  document.querySelectorAll("#wizSteps .step").forEach(s => {
    const sn = +s.dataset.s;
    s.className = "step" + (sn === wizStep ? " active" : sn < wizStep ? " done" : "");
    s.querySelector(".n").textContent = sn < wizStep ? "✓" : sn;
    s.querySelector(".t").textContent = titles[sn - 1];
  });
  document.getElementById("wizPrev").disabled = wizStep === 1;
  document.getElementById("wizNext").textContent = wizStep === 3 ? "启用权威源" : "下一步";
  /* 步骤 3 门禁：custom = 导入门禁（校验报告完成）；连接器 = 连接测试门禁 */
  document.getElementById("wizNext").onclick = wizStep === 3
    ? () => {
        if (self) { if (wizImportPassed) enableSource(); else msg("warning", "请先完成「批量导入」并生成「校验报告」后再启用权威源"); }
        else { if (wizTestPassed) enableSource(); else msg("warning", "请先完成「连接测试」并通过后再启用权威源"); }
      }
    : () => wizGo(1);
  const body = document.getElementById("wizBody");
  if (wizStep === 1) {
    body.innerHTML = `<p class="text-secondary mb-4">选择组织人员主数据的唯一写入源（单一权威源，ADR-03）：本环境<b>默认「自建维护」</b>（custom 源）。</p>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
    ${[["self", "🛠", "自建维护", "中台录入（无源系统）", false], ["hr", "🏢", "HR 系统", "connector-hr-generic", true], ["dt", "💬", "钉钉", "connector-dingtalk", true], ["wc", "🟢", "企业微信", "connector-wecom", true]].map(([k, ic, nm, ds, off]) => `
      <div onclick="wizSource='${k}';renderWiz()" style="border:2px solid ${wizSource === k ? "var(--bmp-color-primary)" : "var(--bmp-border)"};border-radius:8px;padding:18px 12px;text-align:center;cursor:pointer;background:${wizSource === k ? "var(--bmp-color-primary-light)" : "var(--bmp-bg-card)"}">
        <div style="font-size:26px">${ic}</div><b class="mt-2" style="display:block">${nm}</b><span class="fs-12 text-secondary">${ds}</span>
        ${!off ? '<div class="mt-2"><span class="tag tag-primary">默认（本环境启用）</span></div>' : '<div class="mt-2"><span class="tag tag-warning">本环境不启用</span></div>'}
      </div>`).join("")}</div>
    ${self
      ? `<div class="readonly-banner mt-4" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">🛠 「自建维护」= 数据中台自维护（custom 源）：不接连接器、<b>不建立持续同步</b>，变更经 <b>F1-F01 留痕</b> + <b>F1-F04 事件分发</b>。初始数据走下一步「批量导入」。</div>`
      : `<div class="mt-4 field" style="max-width:480px"><label>接口地址</label><input class="input mono" value="https://hr.lubon.internal/api/v2"><div class="tip">凭证配置在下一步（加密存储，Nacos 配置中心）· 本环境不启用</div></div>`}`;
  } else if (wizStep === 2) {
    if (self) {
      body.innerHTML = `<div class="guide-card">
        <div class="gc-head">🛠 维护说明（custom 自建源）</div>
        <ul style="line-height:2">
          <li>数据由<b>业务中台自维护</b>，不依赖外部连接器；<b>字段映射不适用</b>。</li>
          <li>组织 / 人员变更经 <b>F1-F01</b> 记录变更留痕，并产生 <b>md.*</b> 事件（<b>F1-F04</b>）分发至各系统。</li>
          <li>维护账号（D14）以 <span class="mono">employee_type=3</span> 标记，登录走「账号密码 + MFA」。</li>
        </ul>
        <div class="flex gap-2 mt-2">
          <a class="btn btn-sm" href="console.html?page=orgs">去组织维护</a>
          <a class="btn btn-sm" href="console.html?page=employees">去人员维护</a>
          <button class="btn btn-sm" onclick="msg('info','已复制「维护说明」要点（原型演示）')">复制要点</button>
        </div>
      </div>`;
    } else {
      body.innerHTML = `<h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin-bottom:12px">字段映射（红星为必映射）</h4>
      <div class="mapping-row fs-12 text-secondary" style="font-weight:600"><span>源字段</span><span></span><span>中台字段（md_employee）</span><span>必映射</span></div>
      ${[["emp_name", "name 姓名", 1], ["emp_no", "employee_no 工号", 1], ["dept_path", "org_id 部门（按 path 匹配）", 1], ["position", "post 岗位", 0], ["mobile", "mobile 手机号", 0], ["hire_date", "entry_date 入职日期", 0], ["leave_date", "leave_date 离职日期", 0]].map(([s, t, req]) => `
        <div class="mapping-row"><select class="select" data-map="${s}" data-req="${req}"><option value="${s}" selected>${s}</option>${req ? "" : '<option value="">（忽略）</option>'}</select><span style="text-align:center">→</span><span class="fs-13">${req ? '<span class="text-danger">*</span> ' : ""}${t}</span><span>${req ? '<span class="tag tag-danger">必填</span>' : '<span class="tag tag-info">可选</span>'}</span></div>`).join("")}
      <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:20px 0 12px">同步策略</h4>
      <div class="flex gap-4">
        <div class="field" style="flex:1"><label>同步频率</label><select class="select"><option selected>每日 02:00 全量 + 每小时增量</option><option>仅每日全量</option><option>实时回调（源系统 Webhook）</option></select></div>
        <div class="field" style="flex:1"><label>冲突规则</label><select class="select"><option selected>源覆盖（权威源优先）</option><option>人工确认（进异常队列）</option></select></div>
      </div>`;
    }
  } else {
    if (self) {
      const r = MOCK.importReport;
      body.innerHTML = `<h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin-bottom:12px">初始数据导入</h4>
      <div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">📥 状态机：<b>待导入 → 导入中 → 校验完成 → 可启用</b>；<b>未导入成功不得启用</b>（门禁）。首次导入钉钉组织建议「一次性批导」，<b>不建立持续同步</b>（避免双源）。</div>
      <div class="card mb-3" style="padding:14px">
        <b>① 模板下载</b>
        <div class="flex gap-3 mt-2" style="align-items:center">
          <label><input type="radio" name="cm-tpl" checked> 组织模板</label>
          <label><input type="radio" name="cm-tpl"> 岗位模板</label>
          <label><input type="radio" name="cm-tpl"> 人员模板</label>
          <button class="btn btn-sm" onclick="igDownloadTemplate()">下载</button>
        </div>
        <div class="fs-12 text-secondary mt-2">含字段说明 + 必填红星：<span class="text-danger">*</span>姓名 / <span class="text-danger">*</span>工号 / <span class="text-danger">*</span>部门。</div>
      </div>
      <div class="card mb-3" style="padding:14px">
        <b>② 批量导入</b>
        <div class="flex gap-2 mt-2" style="align-items:center">
          <button class="btn btn-sm btn-primary" onclick="wizImport()">选择文件</button>
          <span class="fs-12 text-secondary">支持 xlsx / csv，≥1000 条/次</span>
        </div>
        <div class="fs-12 text-secondary mt-2">ⓘ 字段级错误<b>不入库</b>、成功行照常入库、幂等可重传（按 <span class="mono">employee_no/org_code</span> upsert，已人工修改字段不覆盖）。</div>
      </div>
      <div class="card" style="padding:14px" id="cm-import-report">
        <b>③ 校验报告</b>
        <div class="flex gap-3 mt-2" id="cm-import-stat"><span class="fs-13 text-secondary">尚未导入，暂无校验报告</span></div>
        <div class="table-wrap mt-2" id="cm-import-table"></div>
        <div class="mt-2"><button class="btn btn-sm" onclick="permExport('fail')">导出 CSV</button></div>
      </div>`;
    } else {
      body.innerHTML = `<h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin-bottom:12px">连接测试</h4>
      <button class="btn btn-sm mb-3" onclick="runTest()">▶ 发起连接测试</button>
      <div class="log-stream" id="testLog">等待测试…</div>
      <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:20px 0 12px">试拉取预览（前 10 条）</h4>
      <div class="table-wrap"><table class="tbl"><tr><th>工号</th><th>姓名</th><th>部门（映射后）</th><th>岗位</th><th>校验</th></tr>
      ${MOCK.employees.slice(0, 5).map(e => `<tr><td class="mono">${e.no}</td><td>${e.name}</td><td>${e.org}</td><td>${e.post}</td><td>${e.name === "陈晨" ? '<span class="tag tag-warning">leave_date 格式待确认</span>' : '<span class="tag tag-success">通过</span>'}</td></tr>`).join("")}
      </table></div>`;
    }
  }
}
/* 模板下载（custom 步骤 3 ①） */
function igDownloadTemplate() {
  const name = "org-template.xlsx";
  try {
    const csv = "\ufeff姓名,工号,部门,岗位,入职日期\n*, *, *, ,\n张三,EMP-2026-0001,研发中心/前端组,前端工程师,2026-10-01";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
    msg("success", "模板 " + name + " 已下载（含字段说明 + 必填红星）");
  } catch (e) { msg("info", "模板下载降级（原型演示）：org-template.xlsx"); }
}
/* 批量导入（custom 步骤 3 ②③）：状态机 待导入→导入中→校验完成；成功行入库、失败行不入库、幂等 */
function wizImport() {
  wizImportPassed = false;
  const stat = document.getElementById("cm-import-stat");
  const tb = document.getElementById("cm-import-table");
  if (stat) stat.innerHTML = '<span class="fs-13 text-secondary">导入中…（解析文件 → 字段级校验 → 落库）</span>';
  setTimeout(() => {
    const r = MOCK.importReport;
    if (stat) stat.innerHTML = `<span class="tag tag-success">✅ 成功 ${r.success.toLocaleString()}</span> <span class="tag tag-warning">⚠️ 警告 ${r.warn}</span> <span class="tag tag-danger">❌ 失败 ${r.fail}</span> <span class="fs-12 text-secondary">（失败行不入库，可重传）</span>`;
    if (tb) tb.innerHTML = '<table class="tbl"><tr><th>行号</th><th>字段</th><th>源数据</th><th>错误原因</th></tr>' +
      r.rows.map(x => `<tr><td class="mono">${x.row}</td><td>${x.field}</td><td class="mono">${x.src}</td><td>${x.reason}</td></tr>`).join("") + '</table>';
    wizImportPassed = true; /* 校验完成 → 可启用（导入门禁） */
    msg("success", "导入完成并生成校验报告，可启用权威源");
  }, 900);
}
function runTest() {
  const log = document.getElementById("testLog");
  wizTestPassed = false; /* 重跑测试先置未通过 */
  const lines = ["[10:32:01] 解析配置… OK", "[10:32:01] TCP 连接 hr.lubon.internal:443… OK (23ms)", "[10:32:02] OAuth2 client_credentials 获取 token… OK", "[10:32:02] GET /api/v2/departments?page=1… 200 OK (186ms)", "[10:32:03] GET /api/v2/employees?page=1… 200 OK (204ms)", "[10:32:03] 字段映射校验：7/7 通过，1 条警告（leave_date 格式）", "[10:32:03] ✅ 连接测试通过，可启用"];
  log.innerHTML = ""; lines.forEach((l, i) => setTimeout(() => {
    log.innerHTML += l + "<br>"; log.scrollTop = log.scrollHeight;
    if (i === lines.length - 1) wizTestPassed = true; /* 测试末行 → 门禁放行 */
  }, i * 280));
}
function enableSource() {
  if (wizSource === "self") {
    /* 文案反转（A6）：custom 下不再「现有手工数据将被覆盖」 */
    highRisk("启用权威源（自建维护）",
      "启用后中台侧组织人员字段<b>可编辑</b>，变更将产生 <b>md.*</b> 事件并分发至各系统（F1-F04）。初始数据已批量导入；本模式<b>不建立持续同步</b>。切换权威源需 super_admin 权限（F1-F03 高危规则）。",
      "启用权威源",
      "权威源已启用：组织/人员页已切换为「自建维护模式」（可编辑）；变更将产生 md.* 事件并分发各系统",
      () => { location.href = "console.html?page=employees"; });
  } else {
    highRisk("启用权威源",
      "启用后中台组织人员数据将以所选<b>连接器源</b>为准，现有手工数据将被首次全量同步覆盖（不可逆）。切换权威源需 super_admin 权限（F1-F03 高危规则）。",
      "启用权威源",
      "权威源已启用：首次全量同步任务已创建（可在同步日志查看进度）；组织/人员页已切换为只读模式",
      () => { location.href = "console.html?page=sync-logs"; });
  }
}

/* ---------- UI-C-11 布局模板管理（布局引擎后台，A1-F02 / UIUX 8.3 / #5b） ----------
   本次升级：① 模板列表支持「多角色 + 布局版本」；② 编辑器升级为 v2 三栏（左/中/右）；
   ③ 物料面板新增「嵌入页面卡片（embed:<id>）」；④ 新增「按角色预览」；⑤ 角色绑定机制说明。
   —— 结构对齐前端 home-v2.html 的 MOCK.layoutTemplateV2（version 2 + cols + cards[col]）。 */

/* 栏位标签 */
const LAY_COL_LABEL = { left: "左栏", center: "中栏", right: "右栏" };
/* 栏宽档位（与前端 COL_TIERS 一致；中栏为弹性自适应，无档位） */
const LAY_TIER_LABEL = { s: "窄", m: "中", l: "宽" };
/* 嵌入页面白名单（决议 #5b：仅允许已注册域名；此处为原型预置白名单，真实环境读应用注册） */
/* 嵌入白名单：与前端 home-v2.html 的 EMBED_ALLOW 严格一致（8 个内网域名，.local 域） */
const LAY_ALLOW_DOMAINS = ["dashboard.lubon.local", "bi.lubon.local", "bi.lubon.internal",
  "crm.lubon.local", "oa.lubon.local", "hr.lubon.local", "report.lubon.local", "portal.lubon.local"];

/* v1 遗留 cardId（保住老用户 bmp_user_override 不失配；与前端 layoutTemplateV2.legacy 同构） */
const LAY_V1_LEGACY = [
  { cardId: "todo-list", name: "待办卡片", visible: false },
  { cardId: "notice-msg", name: "消息/公告", visible: false },
  { cardId: "birthday", name: "员工生日卡", visible: false },
  { cardId: "data-metrics", name: "数据指标卡", visible: false },
  { cardId: "frequent-apps", name: "常用应用", visible: false },
  { cardId: "quick-stats", name: "一览", visible: false }
];

/* v2 三栏物料（首页 v2 区块；console 页不加载 home-v2.html 的 manifest 注册脚本，故此处补齐） */
const LAY_V2_MATERIALS = [
  { cardId: "ai-brief", name: "今日简报（规则引擎）" },
  { cardId: "intent-stream", name: "意图流" },
  { cardId: "all-apps", name: "全部应用" },
  { cardId: "urgency-stream", name: "紧迫度时间轴" },
  { cardId: "my-subscriptions", name: "我的订阅" },
  { cardId: "watch-list", name: "关注对象动态" },
  { cardId: "quick-stats", name: "快捷统计" }
];

/* 角色模板库（预置，「按角色配模板」肉眼可见；管理层首页含「经营驾驶舱」嵌入卡片） */
const LAY_TEMPLATES = [
  {
    id: "tpl-employee", name: "普通员工首页",
    roles: [{ name: "普通员工", members: 486 }],
    version: 2, status: "已发布", updated: "09-20 10:00",
    cols: { left: "m", right: "m" },
    cards: [
      { cardId: "ai-brief", name: "今日简报", col: "left", order: 1, visible: true },
      { cardId: "intent-stream", name: "意图流", col: "left", order: 2, visible: true },
      { cardId: "all-apps", name: "全部应用", col: "left", order: 3, visible: false },
      { cardId: "urgency-stream", name: "紧迫度时间轴", col: "center", order: 1, visible: true },
      { cardId: "my-subscriptions", name: "我的订阅", col: "right", order: 1, visible: true },
      { cardId: "watch-list", name: "关注对象动态", col: "right", order: 2, visible: false }
    ],
    legacy: LAY_V1_LEGACY
  },
  {
    id: "tpl-manager", name: "管理层首页",
    roles: [{ name: "系统管理员", members: 4 }, { name: "超级管理员", members: 2 }],
    version: 2, status: "已发布", updated: "09-18 09:00",
    cols: { left: "m", right: "m" },
    cards: [
      /* 【决议 #5b】嵌入页面卡片：cardId / params 与前端 home-v2.html 的 layoutTemplateV2 严格对齐 */
      { cardId: "embed:dashboard-1", name: "经营驾驶舱", col: "center", order: 1, visible: true,
        params: { url: "https://dashboard.lubon.local/ceo", title: "经营驾驶舱（领导视角）", height: 360, icon: "🖥", demo: "cockpit", type: "embed-page" } },
      { cardId: "urgency-stream", name: "紧迫度时间轴", col: "center", order: 2, visible: true },
      { cardId: "ai-brief", name: "今日简报", col: "left", order: 1, visible: true },
      { cardId: "intent-stream", name: "意图流", col: "left", order: 2, visible: true },
      { cardId: "my-subscriptions", name: "我的订阅", col: "right", order: 1, visible: true },
      { cardId: "embed:dept-board-1", name: "部门数据看板", col: "right", order: 2, visible: true,
        params: { url: "https://bi.lubon.local/dept", title: "部门数据看板", height: 220, icon: "📊", demo: "dept", type: "embed-page" } },
      { cardId: "watch-list", name: "关注对象动态", col: "right", order: 3, visible: false }
    ],
    legacy: LAY_V1_LEGACY
  },
  {
    id: "tpl-rd", name: "研发角色首页",
    roles: [{ name: "研发中心", members: 180 }],
    version: 2, status: "草稿", updated: "09-21 16:30",
    cols: { left: "m", right: "s" },
    cards: [
      { cardId: "embed:service-health-1", name: "服务健康度看板", col: "center", order: 1, visible: true,
        params: { title: "服务健康度看板", url: "https://bi.lubon.local/service-health", height: 340, icon: "🩺", demo: "health", type: "embed-page" } },
      { cardId: "ai-brief", name: "今日简报", col: "left", order: 1, visible: true },
      { cardId: "intent-stream", name: "意图流", col: "left", order: 2, visible: true },
      { cardId: "watch-list", name: "关注对象动态", col: "right", order: 1, visible: false }
    ],
    legacy: LAY_V1_LEGACY
  }
];

/* 供「按角色预览」使用的角色清单（模板角色 ∪ MOCK.roles，去重） */
function layRoleOptions() {
  const map = new Map();
  LAY_TEMPLATES.forEach(t => t.roles.forEach(r => { if (!map.has(r.name)) map.set(r.name, r.members); }));
  (MOCK.roles || []).forEach(r => { if (!map.has(r.name)) map.set(r.name, r.members); });
  return Array.from(map, ([name, members]) => ({ name, members }));
}
/* 角色 → 命中模板（无专属模板时回退到默认员工首页） */
function layTemplateForRole(roleName) {
  return LAY_TEMPLATES.find(t => t.roles.some(r => r.name === roleName)) || LAY_TEMPLATES[0];
}
function layRoleTemplateNames(roleName) {
  const t = layTemplateForRole(roleName);
  return { tpl: t, isOwn: t.roles.some(r => r.name === roleName) };
}

/* 编辑器样式（自注入，零外链、不改 console.html） */
const LAY_CSS = `
.lay-cols3 { display:grid; grid-template-columns:1fr 1.4fr 1fr; gap:12px; align-items:start; }
.lay-col { background:var(--bmp-bg-page); border:1px dashed var(--bmp-border-strong); border-radius:var(--bmp-radius-sm); padding:8px; min-height:140px; }
.lay-col-head { display:flex; align-items:center; gap:6px; margin-bottom:8px; font-size:12px; color:var(--bmp-text-secondary); }
.lay-col-body { display:flex; flex-direction:column; gap:8px; }
.lay-tier { border:1px solid var(--bmp-border-strong); background:var(--bmp-bg-card); border-radius:3px; font-size:11px; padding:1px 6px; cursor:pointer; color:var(--bmp-text-secondary); margin-left:2px; }
.lay-tier.on { border-color:var(--bmp-color-primary); color:var(--bmp-color-primary); background:var(--bmp-color-primary-light); }
.ec-card.embed { border-style:solid; border-color:var(--bmp-color-primary); }
.lay-embed-flag { display:inline-block; background:var(--bmp-color-primary); color:#fff; font-size:10px; line-height:1; border-radius:3px; padding:2px 5px; margin-right:4px; vertical-align:middle; }
.lay-hidden-flag { margin-top:6px; font-size:11px; color:var(--bmp-text-placeholder); }
.ec-card.hidden-card { opacity:.55; }
.material-panel .m-item.embed-item { border-color:var(--bmp-color-primary); color:var(--bmp-color-primary); font-weight:600; background:var(--bmp-color-primary-light); }
.lay-preview { display:grid; grid-template-columns:1fr 1.4fr 1fr; gap:10px; align-items:start; }
.lay-preview .lay-col { min-height:80px; }
.lay-wire { background:var(--bmp-bg-card); border:1px solid var(--bmp-border); border-radius:var(--bmp-radius-sm); padding:6px 8px; font-size:12px; cursor:default; }
.lay-wire.embed { border-color:var(--bmp-color-primary); color:var(--bmp-color-primary); font-weight:600; }
.lay-wire.empty { color:var(--bmp-text-placeholder); border-style:dashed; }
`;
function layInjectStyle() {
  if (document.getElementById("lay-style")) return;
  const s = document.createElement("style");
  s.id = "lay-style"; s.textContent = LAY_CSS;
  document.head.appendChild(s);
}

PAGES.layouts = {
  crumb: ["门户运营", "布局模板管理"],
  render() {
    const total = t => t.cards.filter(c => c.visible).length;
    return `
    <div class="readonly-banner mb-4" style="line-height:1.85">
      📦 <b>首页「卡片栏目」分两类配置：</b>
      ① <b>内置卡片类型</b>（待办、简报等）在「<a href="console.html?page=portal-components&tab=cards"><b>门户运营 → 首页组件管理 · 卡片</b></a>」查看 card manifest（前端注册后自动进右侧物料面板）；
      ② <b>某栏目放哪些卡、左/中/右栏</b>在本页模板编辑器拖拽编排；
      ③ <b>内嵌 iframe 页面卡片</b>在「<a href="console.html?page=portal-components&tab=embeds"><b>嵌入页面卡片</b></a>」登记 URL（须域名白名单）；
      ④ <b>角色默认「我的订阅 / 我要做什么」</b>在「<a href="console.html?page=portal-role-defaults"><b>角色订阅与意图</b></a>」配置（与 <span class="mono">LAY_TEMPLATES</span> 角色对齐）；
      ⑤ <b>演示用 AI 助手 FAB</b>（非 V1.5 产品必交付）在「<a href="console.html?page=portal-ai-assistant"><b>首页 AI 助手（演示）</b></a>」开关与文案。
    </div>
    <div class="list-toolbar">
      <div class="left"><b class="fs-13">首页布局模板</b><span class="tag tag-info">template_json 驱动</span>
        <span class="tag tag-primary">v2 三栏</span></div>
      <div class="right">
        <button class="btn btn-sm" onclick="layPreviewRoles()">👁 按角色预览</button>
        <button class="btn btn-sm btn-primary" onclick="layNewTemplate()">＋ 新建模板</button>
      </div>
    </div>
    <div class="table-wrap mb-4"><table class="tbl">
      <tr><th>模板名称</th><th>适用角色</th><th>布局版本</th><th>卡片数</th><th>状态</th><th>更新时间</th><th>操作</th></tr>
      ${LAY_TEMPLATES.map(t => `<tr data-tpl="${t.id}">
        <td><b>${t.name}</b>${t.roles.some(r => r.name === "系统管理员") || t.roles.some(r => r.name === "超级管理员") ? ' <span class="tag tag-danger">含嵌入卡片</span>' : ''}</td>
        <td>${t.roles.map(r => `<span class="tag tag-primary" style="margin:0 4px 2px 0">${r.name}</span>`).join("")}
          <div class="fs-12 text-secondary">合计 ${t.roles.reduce((s, r) => s + r.members, 0)} 人</div></td>
        <td><span class="tag tag-info">v${t.version} 三栏</span></td>
        <td>${total(t)}${t.cards.length !== total(t) ? `<span class="fs-12 text-secondary">（共 ${t.cards.length}，含隐藏）</span>` : ""}</td>
        <td>${statusTag(t.status, { "已发布": "success", "草稿": "warning" })}</td>
        <td>${t.updated}</td>
        <td class="ops">
          <button class="btn-text" onclick="layLoadTemplate('${t.id}')">编辑</button>
          <button class="btn-text" onclick="layPreviewRoles('${t.roles[0].name}')">按角色预览</button>
          ${t.status === "草稿" ? `<button class="btn-text" onclick="layPublish('${t.id}')">发布</button>` : ""}
        </td>
      </tr>`).join("")}
    </table></div>

    <div class="card mb-4">
      <div class="card-head"><h3>角色绑定与生效机制</h3></div>
      <div class="fs-13 text-secondary" style="line-height:1.9">
        ① <b>模板绑定角色</b> → 该角色用户<b>首次登录即用此模板</b>（无个人覆盖时按角色模板渲染）；
        ② 用户仍可<b>个人微调</b>：写入 <span class="mono">user_override_json</span>，运行时与模板深合并；
        ③ 微调仅可改 <b>order / visible / col</b>，<b>cardId 集合不可增删</b>（决议 #6）；
        ④ 模板升级（v1 单画布 → v2 三栏）时打开即自动迁移 <span class="mono">grid</span> → <span class="mono">col</span>，cardId 集合不变，老用户覆盖不失配。
      </div>
    </div>

    <div class="card">
      <div class="card-head"><h3>模板编辑器 · <span id="layTplName">普通员工首页</span>（v2 三栏 · 所见即所得）</h3>
        <div class="flex gap-2">
          <button class="btn btn-sm" onclick="layViewJson()">查看 template_json</button>
          <button class="btn btn-sm" onclick="layPreviewRoles()">按角色预览</button>
          <button class="btn btn-sm" onclick="layRestoreDefault()">恢复默认</button>
          <button class="btn btn-sm btn-primary" onclick="laySave()">保存</button>
        </div></div>
      <div class="readonly-banner">📐 右侧物料面板读取前端 <b>card manifest 注册表</b>（cards/registry.ts）——新卡片 = 注册 manifest + 发布组件，<b>零平台改造</b>自动出现在此（UIUX 8.3）。
        v2 为<b>三栏结构</b>：卡片宽度由<b>栏位</b>决定，左/右栏可选「栏宽档位（窄/中/宽）」，中栏弹性自适应；<b>不再使用 v1 的 24 栅格</b>。嵌入页面卡片可单独设置高度。</div>
      <div style="display:grid;grid-template-columns:1fr 280px;gap:16px;align-items:start">
        <div class="editor-canvas"><div id="layCanvas" class="lay-cols3"></div></div>
        <div class="material-panel">
          <div class="fs-13 fw-600 mb-3" style="color:var(--bmp-text-title)">卡片物料（点击添加到中栏）</div>
          <div class="m-item embed-item" onclick="layOpenEmbed('')">＋ 嵌入页面（自定义 URL）
            <div class="d" style="color:var(--bmp-color-primary)">embed:&lt;id&gt; · 大屏 / 驾驶舱 / 报表</div></div>
          ${layMaterials().map(c => `<div class="m-item" onclick="layAddCard('${c.cardId}','${c.name}')">＋ ${c.name}<div class="d mono">${c.cardId}</div></div>`).join("")}
        </div>
      </div>
    </div>`;
  },
  after() {
    layInjectStyle();
    layLoadTemplate(LAY_TEMPLATES[0].id);
  }
};

/* ---------- UI-C-10 扩展：角色默认 · 订阅与意图（A1-F02 · 原型 localStorage） ----------
   v2：左栏角色列表（LAY_TEMPLATES / portalRoleBindings）+ 右栏 Tab「我的订阅 / 我要做什么」
   选中态：window._portalRolePick（兼容 _prdRoleId）；深链 ?page=portal-role-defaults&role=tpl-employee
   ---------- */
/** 角色目录：与布局模板 id 对齐，供左栏渲染 */
function prdRoleCatalog() {
  const bindMap = {};
  (MOCK.portalRoleBindings || []).forEach(b => { bindMap[b.roleId] = b; });
  return LAY_TEMPLATES.map(t => {
    const b = bindMap[t.id];
    const members = (t.roles || []).reduce((s, r) => s + (r.members || 0), 0);
    const roleNames = (t.roles || []).map(r => r.name).join("、");
    return {
      roleId: t.id,
      tplName: t.name,
      label: b ? b.label : t.name,
      roleNames,
      members,
      status: t.status || "—"
    };
  });
}

function prdRoleIdValid(roleId) {
  return !!roleId && LAY_TEMPLATES.some(t => t.id === roleId);
}

/** 从 URL 恢复选中角色；无 role 参数时不默认选中（右栏空态） */
function prdInitRolePickFromUrl() {
  const fromUrl = new URLSearchParams(location.search).get("role");
  if (fromUrl) window._portalRolePick = prdRoleIdValid(fromUrl) ? fromUrl : null;
  else window._portalRolePick = null;
  window._prdRoleId = window._portalRolePick;
}

function prdSyncRoleUrl(roleId) {
  try {
    const u = new URL(location.href);
    u.searchParams.set("page", "portal-role-defaults");
    if (roleId) u.searchParams.set("role", roleId);
    else u.searchParams.delete("role");
    history.replaceState(null, "", u.pathname + "?" + u.searchParams.toString());
  } catch (e) { /* 原型降级：无 history API 时仅内存态 */ }
}

function prdRerenderPage() {
  const root = document.getElementById("pageRoot");
  if (root && PAGES["portal-role-defaults"]) root.innerHTML = PAGES["portal-role-defaults"].render();
}

function prdRoleListHtml(selectedId) {
  return prdRoleCatalog().map(r => {
    const active = r.roleId === selectedId ? " active" : "";
    return `<div class="node${active}" data-rid="${r.roleId}" onclick="prdOnRolePick('${r.roleId}')">
      <span>🎭 ${r.tplName}</span>
      <span class="cnt">${r.members || 0} 人</span>
    </div>
    <div class="fs-12 text-secondary mb-2" style="padding:0 10px 8px;line-height:1.5">
      <span class="mono">${r.roleId}</span><br>${r.roleNames || r.label}
    </div>`;
  }).join("");
}

function prdRoleEmptyRightHtml() {
  return `<div class="card" style="min-height:420px;display:flex;align-items:center;justify-content:center;text-align:center;padding:32px">
    <div>
      <div style="font-size:48px;margin-bottom:12px;opacity:.85">🎭</div>
      <h3 style="margin:0 0 8px;color:var(--bmp-text-title)">请从左侧选择角色</h3>
      <p class="fs-13 text-secondary" style="max-width:360px;margin:0 auto;line-height:1.75">
        选中后与 <span class="mono">LAY_TEMPLATES</span> 对齐的模板角色，可配置该角色首页「我的订阅」与「我要做什么」的默认项与可选范围。
      </p>
      <p class="fs-12 text-secondary mt-3">也可通过深链打开，例如
        <a href="console.html?page=portal-role-defaults&role=tpl-employee" class="mono">?role=tpl-employee</a>
      </p>
    </div>
  </div>`;
}

function prdRoleConfigHtml(rid) {
  const defs = MOCK.getRoleDefaults(rid);
  const apps = MOCK.getPortalCatalogApps();
  const intents = MOCK.getPortalCatalogIntents().sort((a, b) => (a.order || 0) - (b.order || 0));
  const appSet = new Set(defs.subscriptionAppIds || []);
  const intentSet = new Set(defs.intentIds || []);
  const meta = prdRoleCatalog().find(r => r.roleId === rid);
  const sec = window._portalRoleSection || "subs";
  const cls = id => (sec === id ? "" : "hidden");
  return `
    <div class="list-toolbar">
      <div class="left"><b class="fs-13">${meta ? meta.tplName : rid}</b>
        <span class="fs-12 text-secondary mono">${rid}</span></div>
      <div class="right"><button class="btn btn-sm btn-primary" onclick="prdSaveRoleDefaults()">保存本角色</button></div>
    </div>
    <div class="tabs mb-3">
      <div class="tab ${sec === "subs" ? "active" : ""}" onclick="prdRoleSectionTab(this,'subs')">我的订阅</div>
      <div class="tab ${sec === "intents" ? "active" : ""}" onclick="prdRoleSectionTab(this,'intents')">我要做什么</div>
    </div>
    <div id="prd-sec-subs" class="${cls("subs")}">
      <p class="fs-13 text-secondary mb-3">从应用中心目录勾选；员工仅能在此范围内订阅（个人设置与首页管理弹窗均校验）。</p>
      <div id="prdAppsBox" class="ck-list">${apps.map(a => `
        <label class="ck-item" style="cursor:pointer">
          <input type="checkbox" class="prd-app-cb" value="${a.name.replace(/"/g, "&quot;")}" ${appSet.has(a.name) ? "checked" : ""}>
          <span>${a.icon} <b>${a.name}</b></span>
          <span class="fs-12 text-secondary">${a.group}</span>
        </label>`).join("")}
      </div>
    </div>
    <div id="prd-sec-intents" class="${cls("intents")}">
      <p class="fs-13 text-secondary mb-3">来自意图注册表（启用项）；员工意图流 / ⌘K 仅展示选中项（无个人覆盖时用本默认）。</p>
      <div id="prdIntentsBox" class="ck-list">${intents.map(it => `
        <label class="ck-item" style="cursor:pointer">
          <input type="checkbox" class="prd-intent-cb" value="${it.key}" ${intentSet.has(it.key) ? "checked" : ""}>
          <span>${it.icon} <b>${it.name}</b></span>
          <span class="fs-12 text-secondary mono">${it.key}</span>
        </label>`).join("")}
      </div>
    </div>
    <div class="fs-12 text-secondary mt-3">持久化：<span class="mono">localStorage:portal_role_defaults_${rid}</span> · 变更后员工刷新首页生效（已有个性化 key 的用户不受影响，直至「恢复角色默认」）。</div>`;
}

/* ---------- 门户运营 · 首页 AI 助手（原型演示，产品 V1.5 默认关闭） ---------- */
PAGES["portal-ai-assistant"] = {
  crumb: ["门户运营", "首页 AI 助手（演示）"],
  render() {
    const c = MOCK.getPortalAiConfig();
    return `
    <div class="readonly-banner mb-4" style="line-height:1.85">
      ✨ <b>演示用 AI 助手</b>：仅用于原型展示 B7 浮层交互；<b>产品 V1.5（方案 A）</b>仍以 <b>规则简报 + ⌘K / 意图项</b> 为主，助手为<b>可配置演示项</b>（默认建议关闭）。
      员工端读取 <span class="mono">localStorage:bmp_portal_ai_config</span>；真实链路经 <b>E1</b> 路由 <span class="mono">/ai/**</span>（见下方链接）。
    </div>
    <div class="card" style="max-width:720px;padding:20px 22px">
      <div class="field mb-3">
        <label class="fs-13" style="font-weight:600">启用首页 FAB</label>
        <label class="ck-item" style="margin-top:8px;cursor:pointer">
          <input type="checkbox" id="paiEnabled" ${c.enabled !== false ? "checked" : ""}>
          <span>员工端显示右下角 AI 助手浮层（关闭后仅保留 ⌘K / 意图流 / 规则简报）</span>
        </label>
      </div>
      <div class="field mb-3">
        <label class="fs-13" style="font-weight:600">AI 服务可用（演示降级）</label>
        <label class="ck-item" style="margin-top:8px;cursor:pointer">
          <input type="checkbox" id="paiAvailable" ${c.aiAvailable !== false ? "checked" : ""}>
          <span>关闭后对话面板展示「不可用」提示（不发送 mock 回复）</span>
        </label>
      </div>
      <div class="field mb-3">
        <label class="fs-13" style="font-weight:600">欢迎语</label>
        <textarea class="input" id="paiWelcome" rows="3" style="width:100%;min-height:72px">${escHtml(c.welcomeText || "")}</textarea>
      </div>
      <div class="field mb-3">
        <label class="fs-13" style="font-weight:600">输入框占位符</label>
        <input class="input" id="paiPlaceholder" style="width:100%" value="${escHtml(c.inputPlaceholder || "")}">
      </div>
      <div class="field mb-3">
        <label class="fs-13" style="font-weight:600">模型路由标签（演示）</label>
        <input class="input" id="paiRoute" style="width:100%" value="${escHtml(c.modelRouteLabel || "模型路由 V2")}">
      </div>
      <div class="field mb-3">
        <label class="fs-13" style="font-weight:600">不可用提示文案</label>
        <textarea class="input" id="paiUnavail" rows="2" style="width:100%">${escHtml(c.unavailableMessage || "")}</textarea>
      </div>
      <div class="field mb-4">
        <label class="fs-13" style="font-weight:600">E1 / AI 平台入口（原型链接）</label>
        <input class="input" id="paiE1" style="width:100%" value="${escHtml(c.e1RouteLink || "console.html?page=gateway")}">
        <div class="fs-12 text-secondary mt-2">${escHtml(c.e1RouteHint || "")} · 网关页可查看 <span class="mono">/ai/**</span> 路由行。</div>
      </div>
      <div class="list-toolbar" style="margin:0">
        <div class="left">
          <button class="btn btn-primary" onclick="portalAiSave()">保存并通知员工端</button>
          <button class="btn btn-sm" onclick="portalAiReset()">恢复演示默认</button>
        </div>
        <div class="right">
          <a class="btn-text" href="../home-v2.html" target="_blank">预览 PC 首页 →</a>
        </div>
      </div>
    </div>`;
  }
};

function escHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

function portalAiSave() {
  const cfg = {
    enabled: !!document.getElementById("paiEnabled").checked,
    aiAvailable: !!document.getElementById("paiAvailable").checked,
    welcomeText: document.getElementById("paiWelcome").value.trim(),
    inputPlaceholder: document.getElementById("paiPlaceholder").value.trim(),
    modelRouteLabel: document.getElementById("paiRoute").value.trim() || "模型路由 V2",
    unavailableMessage: document.getElementById("paiUnavail").value.trim(),
    e1RouteLink: document.getElementById("paiE1").value.trim()
  };
  MOCK.savePortalAiConfig(cfg);
  msg("success", "已保存 · 刷新 home-v2 即可看到 FAB / 文案变更");
}

function portalAiReset() {
  localStorage.removeItem("bmp_portal_ai_config");
  try { window.dispatchEvent(new CustomEvent("bmp:portal-ai-config-updated")); } catch (e) {}
  msg("info", "已恢复 mock 默认（V1.5 产品默认关闭 FAB，演示需手动开启）");
  const root = document.getElementById("pageRoot");
  if (root && PAGES["portal-ai-assistant"]) root.innerHTML = PAGES["portal-ai-assistant"].render();
}

PAGES["portal-role-defaults"] = {
  crumb: ["门户运营", "角色订阅与意图"],
  render() {
    prdInitRolePickFromUrl();
    const rid = window._portalRolePick || null;
    return `
    <div class="readonly-banner mb-4" style="line-height:1.85">
      🎭 <b>角色默认 · 订阅与意图</b>：左侧选择角色，右侧配置首页「<b>我的订阅</b>」与「<b>我要做什么</b>」的<b>默认项与可选范围</b>（原型：同一多选集合）。
      应用目录见「<a href="console.html?page=portal-apps"><b>应用管理</b></a>」；快捷入口见「<a href="console.html?page=portal-components&tab=intents"><b>意图项配置</b></a>」。
      员工「个人设置」可覆盖（<span class="mono">bmp_my_subscriptions</span> / <span class="mono">bmp_user_intents</span>），<b>个人优先于角色默认</b>。
    </div>
    <div class="split-layout" style="grid-template-columns:240px 1fr">
      <div class="tree-panel">
        <div class="fs-12 text-secondary mb-2" style="font-weight:600;color:var(--bmp-text-title)">布局模板角色</div>
        <input class="input tree-search" placeholder="筛选角色名…" oninput="prdFilterRoleList(this.value)">
        <div class="tree" id="prdRoleTree">${prdRoleListHtml(rid)}</div>
        <div class="fs-12 text-secondary mt-3">与「<a href="console.html?page=layouts"><b>布局模板管理</b></a>」适用角色一致。</div>
      </div>
      <div id="prdRoleRight">${rid ? prdRoleConfigHtml(rid) : prdRoleEmptyRightHtml()}</div>
    </div>`;
  },
  after() { /* 选中态在 render 内 prdInitRolePickFromUrl 已同步 */ }
};

function prdFilterRoleList(kw) {
  const q = (kw || "").trim();
  document.querySelectorAll("#prdRoleTree .node").forEach(n => {
    const rid = n.dataset.rid || "";
    const meta = prdRoleCatalog().find(r => r.roleId === rid);
    const hay = [rid, meta && meta.tplName, meta && meta.label, meta && meta.roleNames].join(" ");
    const hit = !q || hay.indexOf(q) >= 0;
    n.style.display = hit ? "" : "none";
    const hint = n.nextElementSibling;
    if (hint && hint.classList.contains("text-secondary")) hint.style.display = hit ? "" : "none";
  });
}

function prdOnRolePick(roleId) {
  if (!prdRoleIdValid(roleId)) return;
  window._portalRolePick = roleId;
  window._prdRoleId = roleId;
  prdSyncRoleUrl(roleId);
  prdRerenderPage();
}

function prdRoleSectionTab(el, tab) {
  window._portalRoleSection = tab;
  document.querySelectorAll("#prdRoleRight .tabs .tab").forEach(t => t.classList.remove("active"));
  if (el) el.classList.add("active");
  ["subs", "intents"].forEach(id => {
    const n = document.getElementById("prd-sec-" + id);
    if (n) n.classList.toggle("hidden", id !== tab);
  });
}

/** @deprecated 保留旧下拉回调名，内部转发至左栏选择 */
function prdOnRoleChange(roleId) {
  prdOnRolePick(roleId);
}

function prdSaveRoleDefaults() {
  const roleId = window._portalRolePick || window._prdRoleId;
  if (!roleId) {
    msg("warning", "请先在左侧选择角色");
    return;
  }
  const subscriptionAppIds = Array.from(document.querySelectorAll(".prd-app-cb:checked")).map(el => el.value);
  const intentIds = Array.from(document.querySelectorAll(".prd-intent-cb:checked")).map(el => el.value);
  MOCK.saveRoleDefaults(roleId, { subscriptionAppIds, intentIds });
  msg("success", "已保存角色「" + roleId + "」的订阅与意图默认（" + subscriptionAppIds.length + " 应用 · " + intentIds.length + " 意图）");
}

/* 物料 = MOCK.cardManifest + v2 区块（去重，排除已单独提供的嵌入项） */
function layMaterials() {
  const seen = new Set();
  const out = [];
  (MOCK.cardManifest || []).concat(LAY_V2_MATERIALS).forEach(c => {
    if (seen.has(c.cardId)) return;
    seen.add(c.cardId); out.push({ cardId: c.cardId, name: c.name });
  });
  return out;
}

/* 布局模板持久化（原型模拟 portal_layout.template_json） */
const LAY_STORAGE_PREFIX = "portal_layout_template_";
function layStoredTemplate(id) {
  try {
    const raw = localStorage.getItem(LAY_STORAGE_PREFIX + id);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { return null; }
}

/* ============ 模板加载 / 渲染 ============ */
function layLoadTemplate(id) {
  const src = LAY_TEMPLATES.find(t => t.id === id) || LAY_TEMPLATES[0];
  const tpl = JSON.parse(JSON.stringify(src));
  const saved = layStoredTemplate(id);
  if (saved) {
    if (saved.cols) tpl.cols = saved.cols;
    if (Array.isArray(saved.cards)) tpl.cards = saved.cards;
    if (saved.version) tpl.version = saved.version;
  }
  window._layTpl = tpl;
  window._layTplId = src.id;
  const nmEl = document.getElementById("layTplName");
  if (nmEl) nmEl.textContent = src.name;
  layRender();
}
function layRender() {
  const t = window._layTpl; if (!t) return;
  const host = document.getElementById("layCanvas"); if (!host) return;
  host.innerHTML = ["left", "center", "right"].map(col => {
    const cards = layColCards(col, t);
    const tier = col === "center"
      ? '<span class="fs-12 text-secondary">栏宽：弹性自适应</span>'
      : `<span class="fs-12 text-secondary">栏宽</span>` + ["s", "m", "l"].map(x => `<button class="lay-tier ${t.cols[col] === x ? "on" : ""}" title="${LAY_TIER_LABEL[x]}栏" onclick="laySetTier('${col}','${x}')">${LAY_TIER_LABEL[x]}</button>`).join("");
    return `<div class="lay-col" data-col="${col}">
      <div class="lay-col-head"><b>${LAY_COL_LABEL[col]}</b><span>${cards.length} 张</span><span style="margin-left:auto">${tier}</span></div>
      <div class="lay-col-body">${cards.map(c => layCardHtml(c)).join("") || '<div class="lay-wire empty">拖入 / 点击左侧物料添加</div>'}</div>
    </div>`;
  }).join("");
}
function layCardHtml(c) {
  const isEmbed = c.cardId.indexOf("embed:") === 0;
  const url = (c.params && c.params.url) || "";
  const h = (c.params && c.params.height) || 320;
  return `<div class="ec-card ${isEmbed ? "embed" : ""} ${c.visible ? "" : "hidden-card"}">
    <div class="ops">
      <button title="上移" onclick="layMove('${c.cardId}',-1)">↑</button>
      <button title="下移" onclick="layMove('${c.cardId}',1)">↓</button>
      <button title="移到左栏" onclick="layMoveToCol('${c.cardId}','left')">◀</button>
      <button title="移到中栏" onclick="layMoveToCol('${c.cardId}','center')">▣</button>
      <button title="移到右栏" onclick="layMoveToCol('${c.cardId}','right')">▶</button>
      <button title="${c.visible ? "隐藏" : "显示"}" onclick="layToggle('${c.cardId}')">${c.visible ? "👁" : "🚫"}</button>
      ${isEmbed ? `<button title="编辑 URL/标题/高度" onclick="layOpenEmbed('${c.cardId}')">✎</button>` : ""}
      <button title="移除" onclick="layRemove('${c.cardId}')">✕</button>
    </div>
    <div class="nm">${isEmbed ? '<span class="lay-embed-flag">嵌入</span>' : ""}${c.name}</div>
    <div class="gid mono">${isEmbed ? layEsc(url) : c.cardId + " · " + LAY_COL_LABEL[c.col]}</div>
    ${isEmbed
      ? `<div style="margin-top:8px;height:38px;background:repeating-linear-gradient(45deg,var(--surface),var(--surface) 8px,var(--surface-hover) 8px,var(--surface-hover) 16px);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--bmp-text-secondary)">${h}px 内嵌区域（运行时走 ticket 交换）</div>`
      : `<div style="margin-top:10px;height:34px;background:var(--bmp-color-info-light);border-radius:4px"></div>`}
    ${c.visible ? "" : '<div class="lay-hidden-flag">已隐藏（用户可自行显示）</div>'}
  </div>`;
}
function layColCards(col, t) {
  const tpl = t || window._layTpl;
  return tpl.cards.filter(c => c.col === col).sort((a, b) => a.order - b.order);
}
function layFind(id) { return window._layTpl.cards.find(c => c.cardId === id); }
function layNextOrder(col, t) {
  const tpl = t || window._layTpl;
  return Math.max(0, ...tpl.cards.filter(c => c.col === col).map(c => c.order)) + 1;
}
function layEsc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

/* ============ 卡片编辑操作（栏内 / 跨栏 / 显隐 / 移除） ============ */
function layMove(id, dir) {
  const c = layFind(id); if (!c) return;
  const col = layColCards(c.col);
  const i = col.findIndex(x => x.cardId === id), j = i + dir;
  if (j < 0 || j >= col.length) return;
  [col[i].order, col[j].order] = [col[j].order, col[i].order];
  layRender();
}
function layMoveToCol(id, col) {
  const c = layFind(id); if (!c || c.col === col) return;
  c.col = col; c.order = layNextOrder(col);
  layRender(); msg("success", `「${c.name}」已移到「${LAY_COL_LABEL[col]}」`);
}
function layToggle(id) { const c = layFind(id); if (!c) return; c.visible = !c.visible; layRender(); }
function layRemove(id) {
  const c = layFind(id); if (!c) return;
  window._layTpl.cards = window._layTpl.cards.filter(x => x.cardId !== id);
  layRender(); msg("success", `卡片「${c.name}」已从模板移除（保存后生效）`);
}
function laySetTier(col, tier) {
  if (col === "center") return;
  window._layTpl.cols[col] = tier;
  layRender(); msg("info", `${LAY_COL_LABEL[col]}宽度调整为「${LAY_TIER_LABEL[tier]}」`);
}
function layAddCard(cardId, name) {
  if (window._layTpl.cards.some(c => c.cardId === cardId)) { msg("warning", "该卡片已在模板中"); return; }
  window._layTpl.cards.push({ cardId, name, col: "center", order: layNextOrder("center"), visible: true });
  layRender(); msg("success", `已添加「${name}」到中栏（可拖动到其它栏）`);
}

/* ============ 嵌入页面卡片（物料 + 编辑） ============ */
function layOpenEmbed(cardId) {
  const editing = cardId && cardId.indexOf("embed:") === 0;
  const c = editing ? layFind(cardId) : null;
  const p = (c && c.params) || { title: "", url: "", height: 320, col: "center" };
  const curCol = c ? c.col : "center";
  showDrawer(editing ? "编辑嵌入页面卡片" : "添加嵌入页面卡片", `
    <div class="field"><label><span class="req">*</span>页面标题</label>
      <input class="input" id="embTitle" value="${layEsc(p.title)}" placeholder="如：经营驾驶舱"></div>
    <div class="field"><label><span class="req">*</span>页面 URL</label>
      <input class="input mono" id="embUrl" value="${layEsc(p.url)}" placeholder="https://bi.lubon.internal/dashboard">
      <div class="tip">⚠ 仅允许嵌入「应用注册」白名单内的域名；未登记域名将提示管理员先上架（决议 #5b）</div></div>
    <div class="field"><label>高度（px）</label>
      <input class="input" id="embHeight" type="number" min="120" step="20" value="${p.height || 320}"></div>
    <div class="field"><label>建议栏位</label>
      <select class="select" id="embCol">
        <option value="left" ${curCol === "left" ? "selected" : ""}>左栏</option>
        <option value="center" ${curCol !== "left" && curCol !== "right" ? "selected" : ""}>中栏（大屏建议）</option>
        <option value="right" ${curCol === "right" ? "selected" : ""}>右栏</option>
      </select></div>
    <div class="readonly-banner">🔗 命名约定：cardId 采用 <b>embed:&lt;id&gt;</b>（如 <span class="mono">embed:dashboard-1</span>），与前端 <b>layoutTemplateV2</b> 一致；
      一个模板可含多个嵌入页面（<b>多实例</b>，cardId 唯一以保证 applyOverride 精确命中）。落地约束：白名单 + 加载态 + 失败降级 + 不改 #5。</div>
    <div class="flex gap-2 mt-4">
      <button class="btn btn-primary" onclick="laySaveEmbed('${editing ? cardId : ""}')">${editing ? "保存修改" : "添加卡片"}</button>
      <button class="btn" onclick="closeDrawer('d-generic')">取消</button>
    </div>`);
}
function layVal(id) { const el = document.getElementById(id); return el ? el.value : ""; }
function laySaveEmbed(cardId) {
  const title = layVal("embTitle").trim(), url = layVal("embUrl").trim();
  const height = parseInt(layVal("embHeight"), 10) || 320;
  const col = layVal("embCol") || "center";
  if (!title) { msg("error", "请填写页面标题"); return; }
  if (!url) { msg("error", "请填写页面 URL"); return; }
  const dom = (url.match(/^https?:\/\/([^\/]+)/i) || [])[1] || "";
  if (dom && LAY_ALLOW_DOMAINS.indexOf(dom) < 0) {
    msg("warning", `域名 ${dom} 未在「应用注册」中登记，需管理员先上架（原型仍允许添加）`);
  }
  if (cardId && cardId.indexOf("embed:") === 0) {
    const c = layFind(cardId); if (!c) return;
    c.name = title; c.params = { title, url, height, type: "embed-page" };
    if (col !== c.col) { c.col = col; c.order = layNextOrder(col); }
    msg("success", `嵌入卡片「${title}」已更新`);
  } else {
    if (!window._layTpl._embedSeq) window._layTpl._embedSeq = countEmbeds();
    window._layTpl._embedSeq += 1;
    const slug = (title.toLowerCase().match(/[a-z0-9]+/g) || []).join("-") || "page";
    const cardIdNew = `embed:${slug}-${window._layTpl._embedSeq}`;
    window._layTpl.cards.push({ cardId: cardIdNew, name: title, col, order: layNextOrder(col), visible: true,
      params: { title, url, height, type: "embed-page" } });
    msg("success", `已添加嵌入卡片「${title}」（cardId=${cardIdNew}）`);
  }
  closeDrawer("d-generic");
  layRender();
}
function countEmbeds() {
  return window._layTpl.cards.filter(c => c.cardId.indexOf("embed:") === 0).length;
}

/* ============ 查看 template_json（与前端 v2 同构） ============ */
function layViewJson(overrideTpl) {
  const t = overrideTpl || window._layTpl;
  const json = {
    version: 2,
    cols: { left: t.cols.left, right: t.cols.right },
    cards: t.cards.map(c => {
      const base = { cardId: c.cardId, name: c.name, col: c.col, order: c.order, visible: c.visible };
      if (c.params) base.params = c.params; // 嵌入页面卡片：多实例靠唯一 cardId + params 区分
      return base;
    }),
    legacy: (t.legacy || []).map(x => ({ cardId: x.cardId, name: x.name, visible: x.visible }))
  };
  const text = JSON.stringify(json, null, 2);
  showDrawer("template_json（保存时生成 · v2 三栏）", `<pre class="diff-box" style="height:auto;max-height:56vh">${text.replace(/</g, "&lt;")}</pre>
    <div class="fs-12 text-secondary mt-2" style="line-height:1.8">该 JSON 存入 <span class="mono">portal_layout.template_json</span>；用户个人微调写入 <span class="mono">user_override_json</span>，运行时深合并——
      可覆盖 <b>order / visible / col</b>，<b>cardId 集合不可增删</b>（决议 #6 / UIUX 8.3）。
      嵌入页面卡片以 <span class="mono">cardId: "embed:&lt;id&gt;"</span> 标识（多实例唯一），<span class="mono">params</span> 携带 url / title / height。</div>`);
}

/* ============ 保存 / 恢复默认 / 发布 ============ */
function laySave() {
  const t = window._layTpl;
  const payload = {
    version: 2,
    cols: { left: t.cols.left, right: t.cols.right },
    cards: t.cards.map(c => {
      const base = { cardId: c.cardId, name: c.name, col: c.col, order: c.order, visible: c.visible };
      if (c.params) base.params = c.params;
      return base;
    })
  };
  try {
    localStorage.setItem(LAY_STORAGE_PREFIX + window._layTplId, JSON.stringify(payload));
  } catch (e) { /* 原型降级 */ }
  const idx = LAY_TEMPLATES.findIndex(x => x.id === window._layTplId);
  if (idx >= 0) {
    LAY_TEMPLATES[idx].cards = JSON.parse(JSON.stringify(t.cards));
    LAY_TEMPLATES[idx].cols = JSON.parse(JSON.stringify(t.cols));
  }
  msg("success", `模板「${t.name}」已保存至 localStorage（${LAY_STORAGE_PREFIX}${window._layTplId}），员工首页将读取 tpl-employee`);
  layViewJson();
}
function layRestoreDefault() {
  const src = LAY_TEMPLATES.find(x => x.id === window._layTplId) || LAY_TEMPLATES[0];
  window._layTpl = JSON.parse(JSON.stringify(src));
  layRender();
  msg("info", "已恢复为角色默认模板（清空用户级覆盖 user_override_json）");
}
function layPublish(id) {
  const t = LAY_TEMPLATES.find(x => x.id === id); if (!t) return;
  const affected = t.roles.reduce((s, r) => s + r.members, 0);
  highRisk("发布模板",
    `发布后绑定该角色（${t.roles.map(r => r.name).join(" / ")}）的 <b>${affected}</b> 名用户首页将立即生效；` +
    `用户已有的个人微调（user_override）保留。含嵌入卡片时，运行时按决议 #5b 走白名单 + ticket 交换内嵌。`,
    "发布",
    `模板「${t.name}」已发布，影响 ${affected} 名用户（写审计日志）`);
}

/* ============ 按角色预览（让「按角色配模板」价值可视化） ============ */
function layPreviewRoles(presetRole) {
  const opts = layRoleOptions();
  showDrawer("按角色预览首页结构", `
    <div class="fs-13 text-secondary mb-3" style="line-height:1.8">选择角色，查看该角色<b>首次登录</b>看到的首页<b>三栏结构</b>；
      含<b>嵌入页面卡片</b>的项以 <span class="tag tag-primary">▣ 嵌入</span> 特别标注。</div>
    <div class="field"><label>角色</label>
      <select class="select" id="prevRole" onchange="layRenderRolePreview()">
        ${opts.map(r => `<option value="${r.name}" ${presetRole === r.name ? "selected" : ""}>${r.name}（${r.members} 人）</option>`).join("")}
      </select></div>
    <div id="prevBox" class="mt-3"></div>
    <div class="readonly-banner mt-3" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
      🔗 模板绑定角色 → 该角色用户首次登录即用此模板；用户仍可个人微调（user_override_json 叠加，cardId 集合不可增删）。</div>`);
  layRenderRolePreview();
}
function layRenderRolePreview() {
  const sel = document.getElementById("prevRole"); if (!sel) return;
  const role = sel.value;
  const { tpl, isOwn } = layRoleTemplateNames(role);
  const box = document.getElementById("prevBox");
  const cols = ["left", "center", "right"].map(col => {
    const cards = layColCards(col, tpl).filter(c => c.visible);
    return `<div class="lay-col"><div class="lay-col-head"><b>${LAY_COL_LABEL[col]}</b></div>
      <div class="lay-col-body">${cards.map(c => {
        const isEmbed = c.cardId.indexOf("embed:") === 0;
        return `<div class="lay-wire ${isEmbed ? "embed" : ""}">${isEmbed ? "▣ 嵌入 · " : ""}${c.name}</div>`;
      }).join("") || '<div class="lay-wire empty">（空）</div>'}</div></div>`;
  }).join("");
  box.innerHTML = `<div class="fs-13 mb-3">角色「<b>${role}</b>」→ 命中模板「<b>${tpl.name}</b>」${isOwn ? '<span class="tag tag-success" style="margin-left:6px">专属模板</span>' : '<span class="tag tag-warning" style="margin-left:6px">无专属模板，回退默认</span>'}</div>
    <div class="lay-preview">${cols}</div>
    <div class="fs-12 text-secondary mt-2">ℹ 线框为结构预览（非前端真实渲染）；「管理层首页」含「经营驾驶舱」嵌入卡片，普通员工首页不含。</div>`;
}

/* ---------- UI-C-13 消息管理（模板 / 渠道 / 记录，D1-F01~F05） ---------- */
PAGES.msg = {
  crumb: ["消息管理", "模板 / 渠道 / 记录"],
  render() {
    return `<div class="tabs mb-4">
      <div class="tab active" onclick="swTab(this,'msg-tpl')">消息模板</div>
      <div class="tab" onclick="swTab(this,'msg-channel')">渠道管理</div>
      <div class="tab" onclick="swTab(this,'msg-record')">发送记录</div>
    </div>

    <div id="msg-tpl">
      <div class="list-toolbar"><div class="left"><button class="btn btn-primary" onclick="msgTplNew()">＋ 新建模板</button></div>
        <div class="right">审核流（D1-F04）：草稿 → 提交审核 → 消息管理员通过/驳回</div></div>
      <div class="table-wrap mb-4"><table class="tbl">
        <tr><th>模板编码</th><th>名称</th><th>渠道</th><th>状态</th><th>更新时间</th><th>操作</th></tr>
        ${MOCK.msgTemplates.map(t => `<tr>
          <td class="mono">${t.code}</td><td><b>${t.name}</b></td>
          <td>${t.channels.map(c => `<span class="tag ${c === "钉钉" ? "tag-primary" : c === "企业微信" ? "tag-success" : "tag-info"}" style="margin-right:4px">${c}</span>`).join("")}</td>
          <td>${statusTag(t.status, { "已启用": "success", "待审核": "warning", "草稿": "info", "停用": "danger" })}</td>
          <td>${t.updated}</td>
          <td class="ops">
            <button class="btn-text" onclick="editTpl('${t.code}','${t.name}')">编辑</button>
            ${t.status === "待审核" ? `<button class="btn-text" onclick="highRisk('审核通过模板','通过后模板「${t.name}」将立即启用并可被业务系统调用下发。','通过','模板 ${t.code} 审核通过并启用（写审计日志）')">审核</button>` : ""}
            <button class="btn-text" onclick="msgTplTest('${t.code}','${t.name}')">测试</button>
          </td></tr>`).join("")}
      </table></div>

      <div class="card">
        <div class="card-head"><h3>模板编辑器 · <span class="mono fs-13 text-secondary">TPL_TODO_URGENT</span> 紧急待办提醒</h3>
          <button class="btn btn-sm btn-primary" onclick="msg('success','模板已保存并提交审核（状态→待审核，写审计日志）')">保存并提交审核</button></div>
        <div class="tpl-editor">
          <div>
            <div class="field"><label><span class="req">*</span>消息标题</label><input class="input" value="【待办提醒】您有一条紧急待办"></div>
            <div class="field"><label><span class="req">*</span>消息内容（支持变量）</label>
              <textarea class="input" rows="4">{{name}}，您有一条来自 {{source}} 的紧急待办：{{title}}，将于 {{deadline}} 到期，请及时处理。</textarea></div>
            <div class="field"><label>变量插入（点击插入占位符）</label>
              <div>${["{{name}}", "{{source}}", "{{title}}", "{{deadline}}", "{{jumpUrl}}"].map(v => `<span class="var-chip" onclick="msg('success','已插入变量 ${v}（光标位置）')">${v}</span>`).join("")}</div></div>
            <div class="field"><label>跳转链接（待办点击落地）</label><input class="input mono" value="{{jumpUrl}}"><div class="tip">移动端钉钉卡片点击 → 容器内免登直达；PC → 新标签页打开源系统（决议 #5）</div></div>
          </div>
          <div class="tpl-preview">
            <div class="fs-12 text-secondary mb-2">实时预览 · 钉钉工作通知卡片</div>
            <div class="dt-card-preview">
              <div class="hd">🔔 待办提醒 · 麓邦业务中台</div>
              <div class="bd"><b>【待办提醒】您有一条紧急待办</b><br>张三，您有一条来自 CRM 的紧急待办：【合同审批】华宇科技采购合同，将于 3 小时后到期，请及时处理。<br><span style="color:var(--bmp-color-dingtalk)">去处理 ›</span></div>
            </div>
            <div class="fs-12 text-secondary mt-4 mb-2">站内信样式</div>
            <div style="background:var(--bmp-bg-card);border-radius:8px;padding:12px;box-shadow:var(--bmp-shadow-1);font-size:13px"><b>【待办提醒】您有一条紧急待办</b><div class="text-secondary mt-2">张三，您有一条来自 CRM 的紧急待办…</div></div>
          </div>
        </div>
      </div>
    </div>

    <div id="msg-channel" class="hidden">
      <div class="readonly-banner">ℹ 渠道由 <b>连接器</b>（connector-*）实现；新增渠道 = 部署连接器 + 在此配置凭证（Nacos 加密存储），无需改平台代码（J2 连接器框架）</div>
      <div class="table-wrap"><table class="tbl">
        <tr><th>渠道</th><th>连接器</th><th>状态</th><th>最近测试</th><th>结果</th><th>操作</th></tr>
        ${MOCK.msgChannels.map(c => `<tr>
          <td><b>${c.name}</b></td><td class="mono">${c.connector}</td>
          <td>${statusTag(c.status, { "已连接": "success", "未配置": "info" })}</td><td>${c.lastTest}</td><td>${c.result}</td>
          <td class="ops">${c.status === "已连接" ? `<button class="btn-text" onclick="msg('success','渠道连通性测试：200 OK · ${80 + Math.floor(Math.random() * 80)}ms')">测试</button><button class="btn-text" onclick="msgChannelConfig('${c.connector}','${c.name}')">配置</button>` : `<button class="btn-text" onclick="msgConnectorWizard('${c.connector}','${c.name}')">去配置</button>`}</td>
        </tr>`).join("")}
      </table></div>
    </div>

    <div id="msg-record" class="hidden">
      <div class="filter-bar" style="grid-template-columns:repeat(4,1fr)">
        <div class="field"><label>时间范围</label><input class="input" placeholder="今天 / 近7日"></div>
        <div class="field"><label>渠道</label><select class="select"><option>全部</option><option>钉钉</option><option>企业微信</option><option>站内信</option></select></div>
        <div class="field"><label>状态</label><select class="select"><option>全部</option><option>成功</option><option>失败</option></select></div>
        <div class="f-ops"><button class="btn btn-primary" onclick="msg('info','查询已应用')">查询</button></div>
      </div>
      <div class="table-wrap"><table class="tbl">
        <tr><th>发送时间</th><th>模板</th><th>接收人</th><th>渠道</th><th>状态</th><th>msgId（24h 去重键）</th><th>操作</th></tr>
        ${MOCK.msgRecords.map(r => `<tr>
          <td class="mono">${r.time}</td><td class="mono">${r.tpl}</td><td>${r.receiver}</td><td>${r.channel}</td>
          <td>${statusTag(r.status, { "成功": "success", "失败": "danger" })}</td><td class="mono">${r.msgId}</td>
          <td class="ops"><button class="btn-text" onclick="msgRecDetail('${r.msgId}','${r.status}','${r.err || ""}')">详情</button>${r.status === "失败" ? `<button class="btn-text" onclick="msg('success','已重新下发（msgKey 去重，24h 内同键幂等）')">重发</button>` : ""}</td>
        </tr>`).join("")}
      </table></div>
      <div class="fs-12 text-secondary mt-3">ℹ msgKey 24h 去重：同一业务键重复调用 /msg/send 只下发一次（幂等）· 失败自动重试 3 次后告警</div>
    </div>`;
  }
};

/* ---------- D2 文件服务 · V1.5 管理台（元数据 / 下载审计 / 上传策略占位） ---------- */
PAGES["file-admin"] = {
  crumb: ["主数据", "文件管理", "文件元数据"],
  after() {
    const params = new URLSearchParams(location.search);
    const raw = params.get("tab") || window._fileAdminTab || "objects";
    const tab = ["objects", "audit", "policy"].indexOf(raw) >= 0 ? raw : "objects";
    fileAdminTab(null, tab);
  },
  render() {
    const params = new URLSearchParams(location.search);
    const raw = params.get("tab") || window._fileAdminTab || "objects";
    const tab = ["objects", "audit", "policy"].indexOf(raw) >= 0 ? raw : "objects";
    window._fileAdminTab = tab;
    const act = id => tab === id ? "active" : "";
    const hid = id => tab === id ? "" : "hidden";
    const pol = MOCK.fileUploadPolicySample || {};
    return `<div class="readonly-banner" style="background:var(--bmp-color-warning-light);border-color:var(--bmp-color-warning-light);color:var(--bmp-color-warning-dark)">
      📎 <b>D2 文件服务 · V1.5 原型</b>：业务系统经 <span class="mono">POST /v1/file/upload</span> 存 <span class="mono">fileId</span>，不得直连 OSS；管理台<b>只读治理视图</b>（在线预览 D2-F02 / 版本 D2-F03 / 迁移 D2-F06 后续迭代）。
      Open API 见 <a href="console.html?page=platform-capabilities">中台能力目录</a> · 合规留痕见 <a href="console.html?page=audit">审计中心</a>（经 <span class="mono">trace_id</span> 关联）。
    </div>
    <div class="tabs mb-4" data-tabgroup="d2-file">
      <div class="tab ${act("objects")}" onclick="fileAdminTab(this,'objects')">文件元数据</div>
      <div class="tab ${act("audit")}" onclick="fileAdminTab(this,'audit')">下载审计</div>
      <div class="tab ${act("policy")}" onclick="fileAdminTab(this,'policy')">上传与安全策略</div>
    </div>
    <div data-tabpanel="objects" class="${hid("objects")}">
      <div class="filter-bar" style="grid-template-columns:repeat(4,1fr)">
        <div class="field"><label>fileId / 文件名</label><input class="input" placeholder="模糊搜索"></div>
        <div class="field"><label>来源系统</label><select class="select"><option>全部</option><option>WF</option><option>CRM</option><option>HR</option></select></div>
        <div class="field"><label>状态</label><select class="select"><option>全部</option><option>可用</option><option>已删除</option></select></div>
        <div class="f-ops"><button class="btn btn-primary" onclick="msg('info','查询已应用（原型 mock）')">查询</button></div>
      </div>
      <div class="table-wrap"><table class="tbl">
        <tr><th>fileId</th><th>文件名</th><th>MIME</th><th>业务应用</th><th>system_code</th><th>大小</th><th>上传人</th><th>状态</th><th>上传时间</th><th>下载次数</th><th>操作</th></tr>
        ${(MOCK.fileAdminSamples || []).map(f => `<tr>
          <td class="mono">${f.fileId}</td><td>${f.fileName}</td><td class="mono fs-12">${(f.mimeType || "—").split("/").pop()}</td>
          <td>${f.bizApp}</td><td class="mono">${f.systemCode}</td><td>${f.size}</td><td>${f.uploader || "—"}</td>
          <td>${statusTag(f.status, { "可用": "success", "已删除": "danger" })}</td>
          <td class="mono">${f.uploadedAt}</td><td>${f.downloadCount}</td>
          <td class="ops"><button class="btn-text" onclick="fileAdminMetaDetail('${f.fileId}')">详情</button></td>
        </tr>`).join("")}
      </table></div>
      <div class="fs-12 text-secondary mt-3">ℹ 表 <span class="mono">file_object</span>（bmp_file）；物理对象在 OSS/MinIO，<span class="mono">storage_key</span> 不对业务暴露。</div>
    </div>
    <div data-tabpanel="audit" class="${hid("audit")}">
      <div class="filter-bar" style="grid-template-columns:repeat(4,1fr)">
        <div class="field"><label>时间范围</label><input class="input" placeholder="今天 / 近7日"></div>
        <div class="field"><label>动作</label><select class="select"><option>全部</option><option>下载</option><option>预览</option><option>取 URL</option></select></div>
        <div class="field"><label>trace_id</label><input class="input mono" placeholder="精确检索"></div>
        <div class="f-ops"><button class="btn btn-primary" onclick="msg('info','查询已应用')">查询</button></div>
      </div>
      <div class="table-wrap"><table class="tbl">
        <tr><th>时间</th><th>动作</th><th>fileId</th><th>文件名</th><th>操作人/服务</th><th>system_code</th><th>IP</th><th>URL 有效期</th><th>结果</th><th>trace_id</th><th>操作</th></tr>
        ${(MOCK.fileDownloadAuditSamples || []).map(r => `<tr>
          <td class="mono">${r.time}</td><td>${r.action}</td><td class="mono">${r.fileId}</td><td>${r.fileName}</td>
          <td>${r.operator}</td><td class="mono">${r.systemCode}</td><td class="mono">${r.clientIp}</td>
          <td>${r.urlTtlMin ? r.urlTtlMin + " 分钟" : "—"}</td>
          <td>${statusTag(r.result, { "成功": "success", "拒绝": "danger" })}</td>
          <td class="mono">${r.traceId}</td>
          <td class="ops"><button class="btn-text" onclick="location.href='console.html?page=audit'">审计检索</button></td>
        </tr>`).join("")}
      </table></div>
      <div class="fs-12 text-secondary mt-3">ℹ 取 URL / 下载 / 预览行为经 E2-F01 异步写入 <span class="mono">audit_operation_log</span>；本 Tab 为 D2 运维视图，与 UI-C-14 互补。</div>
    </div>
    <div data-tabpanel="policy" class="${hid("policy")}">
      <div class="readonly-banner">🛡 <b>V1.5 占位</b>：策略项对应 D2-F04（水印/防盗链）与 D2-F05（文件 ACL）；V1.0 仅接口侧硬限制（类型白名单 + ≤2GB）。保存按钮演示写审计，不落库。</div>
      <div class="card">
        <div class="card-head"><h3>全局上传与安全策略（平台级）</h3>
          <button class="btn btn-sm btn-primary" onclick="highRisk('发布文件安全策略','变更将影响全平台上传校验与临时 URL 签名参数，需二次确认。','发布','策略已发布（写 audit_operation_log · 原型演示）')">发布策略</button></div>
        <dl class="desc-grid">
          <dt>单文件大小上限</dt><dd>≤ ${pol.maxSizeGb || 2} GB（D2-F01）</dd>
          <dt>临时 URL 默认有效期</dt><dd>${pol.urlTtlMinutes || 30} 分钟（D2-F04 防盗链）</dd>
          <dt>类型白名单</dt><dd>${(pol.typeWhitelist || []).join(" · ")}</dd>
          <dt>下载叠加水印</dt><dd>${pol.watermarkOnDownload ? "开启（用户 + 时间，不可关闭）" : "关闭"}</dd>
          <dt>预览叠加水印</dt><dd>${pol.watermarkOnPreview ? "开启（D2-F02 强依赖 D2-F04）" : "关闭"}</dd>
          <dt>病毒扫描</dt><dd>${pol.virusScan || "—"}</dd>
          <dt>文件权限默认模式</dt><dd>${pol.aclMode || "—"}</dd>
        </dl>
      </div>
      <div class="fs-12 text-secondary mt-3">ℹ 存量迁移工具（D2-F06）与版本链（D2-F03）不在本 Tab，后续独立入口或向导接入。</div>
    </div>`;
  }
};
/** D2 文件服务 Tab 切换（深链 ?page=file-admin&tab=audit|policy|objects） */
function fileAdminTab(el, tab) {
  window._fileAdminTab = tab;
  if (el && el.closest) portalTab(el, tab);
  else {
    const group = document.querySelector('[data-tabgroup="d2-file"]');
    if (group) {
      group.querySelectorAll(".tab").forEach(t => {
        const on = (t.getAttribute("onclick") || "").indexOf("'" + tab + "'") >= 0;
        t.classList.toggle("active", on);
      });
      const scope = group.parentElement || group;
      scope.querySelectorAll("[data-tabpanel]").forEach(n => n.classList.toggle("hidden", n.dataset.tabpanel !== tab));
    }
  }
  const labels = { objects: "文件元数据", audit: "下载审计", policy: "上传与安全策略" };
  if (typeof renderBreadcrumb === "function") renderBreadcrumb(["主数据", "文件管理", labels[tab] || "文件元数据"]);
  const url = "console.html?page=file-admin" + (tab && tab !== "objects" ? "&tab=" + tab : "");
  if (history.replaceState) history.replaceState(null, "", url);
}
function fileAdminMetaDetail(fileId) {
  const f = (MOCK.fileAdminSamples || []).find(x => x.fileId === fileId);
  if (!f) { msg("info", "未找到 " + fileId); return; }
  showDrawer("文件元数据 · " + fileId, `
    <dl class="desc-grid">
      <dt>fileId</dt><dd class="mono">${f.fileId}</dd>
      <dt>文件名</dt><dd>${f.fileName}</dd>
      <dt>MIME</dt><dd class="mono">${f.mimeType || "—"}</dd>
      <dt>sha256</dt><dd class="mono">${f.sha256 || "—"}</dd>
      <dt>业务应用</dt><dd>${f.bizApp} · <span class="mono">${f.systemCode}</span></dd>
      <dt>上传人</dt><dd>${f.uploader || "—"}</dd>
      <dt>状态</dt><dd>${f.status}</dd>
      <dt>上传时间</dt><dd class="mono">${f.uploadedAt}</dd>
    </dl>
    <div class="readonly-banner mt-4">预览 / 版本 / ACL 属 V1.5+；取 URL 请走 Open API（B2-F05 鉴权后返回 30 分钟签名链）。</div>`);
}

function editTpl(code, name) { msg("info", `已载入模板 ${code}「${name}」到下方编辑器`); }
function msgRecDetail(msgId, status, err) {
  showDrawer("发送记录详情 · " + msgId, `
    <dl class="desc-grid">
      <dt>msgId</dt><dd class="mono">${msgId}</dd>
      <dt>状态</dt><dd>${statusTag(status, { "成功": "success", "失败": "danger" })}</dd>
      ${err ? `<dt>失败原因</dt><dd class="text-danger">${err}</dd>` : ""}
    </dl>
    ${status === "失败" ? `<div class="readonly-banner mt-4" style="background:var(--bmp-color-danger-light);border-color:var(--bmp-color-danger-light);color:var(--bmp-color-danger-dark)">⚠ 下发失败：${err}。系统已自动重试 3 次仍失败，可人工重发或检查渠道配置。</div>
      <div class="flex gap-2 mt-4"><button class="btn btn-primary" onclick="msg('success','已重新下发（写审计日志）')">人工重发</button><button class="btn" onclick="location.href='console.html?page=msg'">检查渠道</button></div>`
    : `<div class="state-box"><div class="illus">✅</div><div class="txt">消息已成功下发并被接收方确认</div></div>`}`);
}

/* ============================================================
   流程与表单模块（工作流引擎 C1/C2/C3）—— UI-WF-01 ~ UI-WF-05
   数据命名空间：MOCK.workflow（见 assets/mock.js）
   ============================================================ */

/* ---------- UI-WF-01 流程定义管理（C1-F01-1~F01-4） ---------- */
PAGES["workflow-defs"] = {
  crumb: ["流程与表单", "流程定义管理"],
  render() {
    const defTypeTag = t => `<span class="tag ${t === "TEMPLATE" ? "tag-primary" : "tag-info"}">${t}</span>`;
    const stMap = { "草稿": "info", "已发布": "success", "停用": "warning" };
    const rows = MOCK.workflow.defs.map(d => {
      const canDelete = d.instances === 0;
      return `<tr>
        <td class="mono" data-ck="defKey">${d.defKey}</td>
        <td data-ck="name"><b>${d.name}</b></td>
        <td class="mono" data-ck="version">v${d.version}</td>
        <td data-ck="defType">${defTypeTag(d.defType)}</td>
        <td data-ck="nodeCount">${d.nodeCount}</td>
        <td data-ck="status">${statusTag(d.status, stMap)}</td>
        <td data-ck="instances">${d.instances}</td>
        <td class="mono" data-ck="updated">${d.updated}</td>
        <td class="ops" data-ck="__ops">
          ${d.status === "已发布" ? `<button class="btn-text" onclick="wfStartInstance('${d.defKey}','${d.name}',${d.version})">发起</button>` : ""}
          ${d.status === "已发布" ? `<button class="btn-text" onclick="wfPublishToPortal('${d.defKey}','${d.name.replace(/'/g, "\\'")}')">发布到应用中心</button>` : `<button class="btn-text" disabled title="须先发布 defKey+version">发布到应用中心</button>`}
          ${d.status === "草稿" ? `<button class="btn-text" onclick="wfEditDraft('${d.defKey}',${d.version})">编辑</button>` : ""}
          ${d.status === "草稿" ? `<button class="btn-text" onclick="wfPublish('${d.uid}','${d.defKey}',${d.version})">发布</button>` : ""}
          ${d.status === "已发布" ? `<button class="btn-text danger" onclick="wfToggleStatus('${d.uid}','${d.defKey}',${d.version},'已发布')">停用</button>` : ""}
          ${d.status === "停用" ? `<button class="btn-text" onclick="wfToggleStatus('${d.uid}','${d.defKey}',${d.version},'停用')">重新启用</button>` : ""}
          <button class="btn-text" onclick="wfDefVersions('${d.defKey}','${d.name}')">查看版本</button>
          <button class="btn-text danger" ${canDelete ? "" : `disabled title="存在运行/历史实例，不可删除"`} onclick="wfDelete('${d.uid}','${d.defKey}',${d.version},${d.instances})">删除</button>
        </td>
      </tr>`;
    }).join("");
    return `
      <div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
        🧭 <b>状态机</b>：草稿 → 已发布 → 停用（↔ 重新启用）。<b>已发布不可回退为草稿</b>；如需修改须<b>新建版本</b>（运行实例按发起版本执行，新版本仅对新实例生效，C1-F01-3）。
      </div>
      <div class="list-toolbar">
        <div class="left">
          <button class="btn btn-primary" onclick="wfNewDef()">＋ 新建审批流（配置向导）</button>          
          <span class="fs-12 text-secondary">共 ${MOCK.workflow.defs.length} 个流程定义版本</span>
        </div>
        <div class="right"><button class="btn btn-sm" onclick="openColSettings()">⚙ 列设置</button></div>
      </div>
      <div class="table-wrap"><table class="tbl">
        <tr><th data-ck="defKey">defKey</th><th data-ck="name">名称</th><th data-ck="version">版本</th><th data-ck="defType">配置方式</th><th data-ck="nodeCount">节点数</th><th data-ck="status">状态</th><th data-ck="instances">已发起实例</th><th data-ck="updated">更新时间</th><th>操作</th></tr>
        ${rows}
      </table></div>
      <div class="pagination">共 ${MOCK.workflow.defs.length} 条<span class="pg active">1</span></div>
      <div class="fs-12 text-secondary mt-3">ℹ UK(<b>defKey</b>, <b>version</b>) 全局唯一 · 删除保护：仅当无任何运行/历史实例时允许物理删除（C1-F01-4）· 停用后不可发起新实例，运行中实例不受影响</div>`;
  }
};

/* ---------- 入口「＋ 新建审批流」：先选配置方式，再进入向导（配置方式上移至入口） ---------- */
function wfNewDef() {
  showDrawer("新建审批流 · 选择配置方式", `
    <div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
      🧭 先选择配置方式，再进入 4 步向导（① 发起表单 → ② 节点与审批人 → ③ 路由条件 → ④ 校验与发布）。
    </div>
    <div class="wf-mode-switch mt-3">
      <div class="wf-mode" onclick="wfNewDefGo('TEMPLATE')">
        <div class="ic">🧩</div><b>模板化配置</b><div class="fs-12 text-secondary">从预置审批模板中选择（含「空白模板」从零开始），填写节点与审批人维度</div>
      </div>
      <div class="wf-mode" onclick="wfNewDefGo('JSON')">
        <div class="ic">{ }</div><b>JSON 流程定义</b><div class="fs-12 text-secondary">提交结构化 JSON（formSchema + 节点数组 + 路由条件）</div>
      </div>
    </div>`);
}
function wfNewDefGo(mode) {
  closeDrawer("d-generic");
  location.href = "console.html?page=workflow-designer&mode=" + mode;
}

/* ---------- 流程定义行内「发起」：按 formSchema 渲染填报页（内联抽屉）→ 提交模拟发起 ---------- */
/* ---------- C1-F01-8：发布到应用中心（portal_app.kind=workflow） ---------- */
function wfPublishToPortal(defKey, name) {
  const domOpts = (MOCK.bizDomains || []).map(d => d.code + " · " + d.label);
  CM.openDrawer({
    id: "cm-wf-portal-publish",
    title: "发布到应用中心 · " + name,
    width: 640,
    body: '<div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">写入 <span class="mono">portal_app.kind=workflow</span>，绑定 <span class="mono">defKey</span> + <span class="mono">biz_domain</span>；自动注册 <span class="mono">workflow:instance:start:' + defKey + '</span>（若不存在）。</div>',
    fields: [
      { name: "displayName", label: "应用展示名", type: "text", required: true, value: name },
      { name: "bizDomain", label: "业务域", type: "select", required: true, value: "GENERAL", options: domOpts.length ? domOpts : ["GENERAL · 通用"] },
      { name: "icon", label: "图标", type: "text", value: "📝" },
      { name: "toAppCenter", label: "上架应用中心", type: "checkbox", checkboxText: "立即对员工可见（scope 默认全员，原型）", value: true }
    ],
    submitText: "发布",
    onSubmit: (values) => {
      const bizRaw = String(values.bizDomain || "GENERAL");
      const bizDomain = bizRaw.split(" · ")[0].trim();
      const r = MOCK.publishWorkflowToPortal({
        defKey,
        name: values.displayName || name,
        bizDomain,
        icon: values.icon || "📝"
      });
      CM.close("cm-wf-portal-publish");
      if (!r.ok) { msg("error", "发布失败：" + (r.reason || "未知")); return; }
      msg("success", "流程「" + (values.displayName || name) + "」已发布到应用中心（写 E2 审计 · 原型 localStorage）");
      route();
    }
  });
}

function portalAppsTableRowsHtml(kindFilter) {
  const list = MOCK.getPortalCatalogApps ? MOCK.getPortalCatalogApps() : MOCK.apps;
  return list.filter(a => !kindFilter || a.kind === kindFilter || (!a.kind && kindFilter === "external")).map(a => {
    const isWf = a.kind === "workflow";
    const typeTag = isWf ? `<span class="tag tag-primary">流程</span>` : `<span class="tag tag-info">外链</span>`;
    const entry = isWf
      ? `<span class="mono">defKey=${a.defKey}</span>`
      : `<span class="mono">https://app.lubon.com/${(a.appCode || a.name.split(" ")[0]).toLowerCase()}</span>`;
    const grp = isWf ? MOCK.bizDomainLabel(a.bizDomain) + " / " + (a.group || "") : a.group;
    const ops = isWf
      ? `<button class="btn-text" onclick="msg('info','defKey=${a.defKey} 只读绑定；修改请至流程定义重新发布')">详情</button><a class="btn-text" href="console.html?page=workflow-defs">重新发布</a>`
      : `<button class="btn-text" onclick="portalAppDetail('${a.name}')">详情</button><button class="btn-text" onclick="msg('info','连通性测试：200 OK · 86ms')">测试</button><button class="btn-text" onclick="portalAppEdit('${a.name}','${a.group}','${a.icon}','${a.color}')">编辑</button><button class="btn-text danger" onclick="highRisk('下架应用','下架后全员将不再展示该入口。','${a.name}','应用已下架（写审计日志）')">下架</button>`;
    return `<tr data-kind="${isWf ? "workflow" : "external"}">
      <td><span style="display:inline-flex;align-items:center;gap:8px"><span style="width:26px;height:26px;border-radius:6px;background:${a.color};color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:13px">${a.icon}</span><b>${a.name}</b></span></td>
      <td>${typeTag}</td><td>${grp}</td><td>${entry}</td><td>全员</td><td>${(a.freq || 1) * 26} 次</td>
      <td>${statusTag(a.status || "已上架", { "已上架": "success", "已下架": "info" })}</td><td class="ops">${ops}</td></tr>`;
  }).join("");
}

function portalAppsKindFilter(val) {
  window._paAppKindFilter = val;
  const tbody = document.getElementById("pa-apps-table");
  if (tbody) {
    tbody.innerHTML = `<tr><th>应用</th><th>类型</th><th>业务域/分组</th><th>入口</th><th>可见角色</th><th>本月使用</th><th>状态</th><th>操作</th></tr>` + portalAppsTableRowsHtml(val);
  }
}

function portalRerenderAppsTab() {
  const tbody = document.getElementById("pa-apps-table");
  if (tbody) {
    tbody.innerHTML = `<tr><th>应用</th><th>类型</th><th>业务域/分组</th><th>入口</th><th>可见角色</th><th>本月使用</th><th>状态</th><th>操作</th></tr>` + portalAppsTableRowsHtml(window._paAppKindFilter || "");
  }
}

function wfStartInstance(defKey, name, version) {
  const launch = MOCK.getWorkflowLaunchConfig ? MOCK.getWorkflowLaunchConfig(defKey) : { launchMode: "form" };
  if (launch.launchMode === "external") {
    const bizKey = "BMP:" + defKey + ":DRAFT-" + Date.now();
    showDrawer(`发起流程 · ${name} v${version}`, `
      <div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
        🔗 本流程为<b>第三方页面填报</b>：不在中台填写 formSchema，发起时新标签打开业务系统填报页（可经 E1 SSO 免登）。中台仍走 C1 节点与待办；表单数据在业务系统，实例仅关联 <span class="mono">bizKey</span>。
      </div>
      <dl class="desc-grid mt-3">
        <dt>填报地址</dt><dd class="mono fs-12">${wfEsc(launch.fillUrl || "—")}</dd>
        <dt>演示 bizKey</dt><dd class="mono fs-12">${wfEsc(bizKey)}</dd>
      </dl>
      <div class="flex gap-2 mt-4" style="border-top:1px solid var(--bmp-border);padding-top:14px">
        <button class="btn btn-primary" onclick="wfStartExternalGo('${defKey}','${wfEsc(bizKey)}')">前往第三方填报</button>
        <button class="btn" onclick="closeDrawer('d-generic')">取消</button>
      </div>
      <div class="fs-12 text-secondary mt-2">ℹ 提交后由业务系统回调 <span class="mono">POST /v1/workflow/callback</span> 推进实例；占位符 <span class="mono">{bizKey}</span> / <span class="mono">{defKey}</span> 将在跳转时替换。</div>`);
    return;
  }
  const schema = (MOCK.workflow.formSchemas || {})[defKey] || null;
  const sample = (MOCK.workflow.formDataSamples || {})[defKey] || {};
  const body = schema
    ? `<div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
         📝 按流程定义 <b>${wfEsc(schema.title || name)}</b>（formSchema v${schema.schemaVersion}）渲染填写表单。提交后按 schema 校验并生成实例。
       </div>
       ${wfRenderFormReadonly(schema, sample, "edit")}`
    : `<div class="readonly-banner" style="background:var(--bmp-color-warning-light);border-color:var(--bmp-color-warning-light);color:var(--bmp-color-warning-dark)">
         ⚠ 该流程未配置发起表单（formSchema），为<b>自由表单模式</b>：表单由业务系统自带并通过接口直传。
       </div>`;
  showDrawer(`发起流程 · ${name} v${version}`, `
    ${body}
    <div class="flex gap-2 mt-4" style="border-top:1px solid var(--bmp-border);padding-top:14px">
      <button class="btn btn-primary" onclick="wfSubmitInstance('${defKey}','${wfEsc(name)}')">提交发起</button>
      <button class="btn" onclick="closeDrawer('d-generic')">取消</button>
    </div>
    <div class="fs-12 text-secondary mt-2">ℹ 提交将调用 <span class="mono">POST /v1/workflow/instance</span>（formData 由本表单产出），按 schema 校验通过后生成实例并推送首个待办；失败返回 7008 + 字段级 errors。</div>`);
}
function wfCollectFillValues(defKey) {
  // 采集抽屉内填写控件的值（原生控件）
  const schema = (MOCK.workflow.formSchemas || {})[defKey];
  if (!schema) return null;
  const body = document.getElementById("dBody");
  const out = {};
  schema.fields.forEach(f => {
    const el = body && body.querySelector(`[data-fk="${f.key}"]`);
    if (!el) return;
    if (f.type === "multiselect") {
      out[f.key] = Array.from(body.querySelectorAll(`[data-fk="${f.key}"] input[type=checkbox]:checked`)).map(x => x.value);
    } else if (f.type === "attachment") {
      out[f.key] = String(el.value || "").split(",").map(s => s.trim()).filter(Boolean);
    } else if (f.type === "number" || f.type === "amount") {
      out[f.key] = el.value === "" ? null : Number(el.value);
    } else {
      out[f.key] = el.value;
    }
  });
  return out;
}
function wfStartExternalGo(defKey, bizKey) {
  if (MOCK.openWorkflowFillUrl && MOCK.openWorkflowFillUrl(defKey, { bizKey })) {
    closeDrawer("d-generic");
  } else {
    msg("error", "填报地址无效，请在流程配置向导步骤 1 配置 http(s) 的 fillUrl");
  }
}
function wfSubmitInstance(defKey, name) {
  const schema = (MOCK.workflow.formSchemas || {})[defKey] || null;
  if (!schema) { closeDrawer("d-generic"); msg("success", `已发起「${name}」（自由表单模式，formData 由业务系统直传）`); return; }
  const values = wfCollectFillValues(defKey);
  const errors = wfValidateForm(schema, values);
  const body = document.getElementById("dBody");
  if (errors.length) {
    // 定位并标红对应字段
    errors.forEach(e => {
      const wrap = body && body.querySelector(`[data-field="${e.key}"]`);
      if (wrap) wrap.classList.add("has-error");
    });
    msg("error", `发起失败：${errors[0].message}（7008 表单校验失败）`);
    return;
  }
  closeDrawer("d-generic");
  msg("success", `发起成功：已按「${name}」表单生成流程实例（写 formData + 生成首个待办）`);
}

/* 编辑草稿（保留原入口语义） */
function wfEditDraft(defKey, version) {
  location.href = "console.html?page=workflow-designer";
}
PAGES["workflow-designer"] = {
  crumb: ["流程与表单", "流程配置向导"],
  render() {
    return `<div class="list-toolbar mb-3"><div class="left"><span class="fs-12 text-secondary">由「流程定义管理 → ＋ 新建审批流」进入</span></div><div class="right"><a class="btn btn-sm" href="console.html?page=workflow-defs">← 流程定义管理</a></div></div>
      <div class="card" style="max-width:1000px">
      <div class="steps" id="wfdSteps">
        <div class="step active" data-s="1"><span class="n">1</span><span class="t">发起表单</span></div><div class="line"></div>
        <div class="step" data-s="2"><span class="n">2</span><span class="t">节点与审批人</span></div><div class="line"></div>
        <div class="step" data-s="3"><span class="n">3</span><span class="t">路由条件</span></div><div class="line"></div>
        <div class="step" data-s="4"><span class="n">4</span><span class="t">校验与发布</span></div>
      </div>
      <div id="wfdBody"></div>
      <div class="flex justify-between mt-4" style="border-top:1px solid var(--bmp-border);padding-top:16px">
        <span>
          <button class="btn" id="wfdPrev" onclick="wfdGo(-1)" disabled>上一步</button>
          <button class="btn" onclick="wfdSaveDraft()">保存草稿</button>
        </span>
        <button class="btn btn-primary" id="wfdNext" onclick="wfdGo(1)">下一步</button>
      </div>
    </div>`;
  },
  after() {
    wfdInit();
    // 配置方式已在入口「＋ 新建审批流」处选择，经 URL 传入
    const m = new URLSearchParams(location.search).get("mode");
    if (m === "JSON") wfdState.mode = "JSON";
    wfdRender();
  }
};

let wfdState = null;
function wfdInit() {
  wfdState = {
    step: 1,
    mode: "TEMPLATE",
    template: "TPL_AMOUNT_2",
    json: wfdExampleJson(),
    /* 发起表单定义（与 nodes/routes/graph 并存；字段 key 直接作为条件分支变量） */
    formSchema: wfdDefaultFormSchema(),
    selectedField: null,           // 步骤 1 设计器当前选中的字段下标
    nodes: [
      { name: "部门负责人审批", assigneeType: "组织", signMode: "单人" },
      { name: "分管领导审批", assigneeType: "岗位", signMode: "单人" }
    ],
    routes: [
      { cond: "amount > 50000", target: "分管领导审批", isDefault: false },
      { cond: "（其他情况）", target: "部门负责人审批", isDefault: true }
    ],
    validatePass: true,
    /* 步骤 1 发起方式：form=中台 formSchema · external=第三方 fillUrl/viewUrl */
    launchMode: "form",
    fillUrl: "",
    viewUrl: "",
    /* 既有加固：新增 DAG 画布视图相关状态（向后兼容，默认列表视图） */
    view: "list",                 // "list" | "canvas"
    graph: null,                  // { nodes:[{id,type,name,x,y,assigneeType,signMode}], edges:[{id,from,to,cond,isDefault}] }
    canvas: { tx: 0, ty: 0, k: 1, selectedNode: null, selectedEdge: null, drag: null, link: null, pan: null, needFit: false, listening: false, showFormCard: true }
  };
  /* 恢复向导草稿中的发起方式（原型 localStorage） */
  const draftLaunch = MOCK.getWorkflowLaunchConfig && MOCK.getWorkflowLaunchConfig("contract_approval");
  if (draftLaunch && draftLaunch.launchMode === "external") {
    wfdState.launchMode = "external";
    wfdState.fillUrl = draftLaunch.fillUrl || "";
    wfdState.viewUrl = draftLaunch.viewUrl || "";
  }
}
/* 默认发起表单（与客户确认的示例字段一致） */
function wfdDefaultFormSchema() {
  return {
    schemaVersion: 1,
    title: "合同审批单",
    fields: [
      { key: "contractName", label: "合同名称", type: "text", required: true, placeholder: "请输入合同名称", help: "", defaultValue: "", sort: 1, maxLength: 64, options: [] },
      { key: "amount", label: "合同金额", type: "amount", required: true, placeholder: "请输入合同金额", help: "含税金额，单位：元", defaultValue: null, sort: 2, maxLength: null, options: [] },
      { key: "contractType", label: "合同类型", type: "select", required: true, placeholder: "请选择合同类型", help: "", defaultValue: "", sort: 3, maxLength: null, options: [
        { label: "采购合同", value: "purchase" }, { label: "服务合同", value: "service" } ] },
      { key: "payTerms", label: "付款条件", type: "textarea", required: false, placeholder: "如：验收后 30 天电汇", help: "", defaultValue: "", sort: 4, maxLength: 500, options: [] },
      { key: "attachment", label: "合同扫描件", type: "attachment", required: false, placeholder: "", help: "附件存文件服务，仅记录 fileId", defaultValue: [], sort: 5, maxLength: null, options: [] }
    ]
  };
}
function wfdExampleJson() {
  return `{
  "defKey": "contract_approval",
  "name": "合同审批流",
  "formSchema": {
    "schemaVersion": 1,
    "title": "合同审批单",
    "fields": [
      { "key": "contractName", "label": "合同名称", "type": "text", "required": true, "sort": 1 },
      { "key": "amount", "label": "合同金额", "type": "amount", "required": true, "sort": 2 },
      { "key": "contractType", "label": "合同类型", "type": "select", "required": true, "sort": 3,
        "options": [ { "label": "采购合同", "value": "purchase" }, { "label": "服务合同", "value": "service" } ] },
      { "key": "payTerms", "label": "付款条件", "type": "textarea", "required": false, "sort": 4 },
      { "key": "attachment", "label": "合同扫描件", "type": "attachment", "required": false, "sort": 5 }
    ]
  },
  "variables": ["contractName", "amount", "contractType"],
  "nodes": [
    { "key": "start", "type": "START" },
    { "key": "n1", "type": "APPROVAL", "name": "部门负责人审批", "assignee": { "dimension": "ORG" }, "signMode": "SINGLE" },
    { "key": "g1", "type": "GATEWAY", "branches": [
        { "expr": "amount > 50000", "target": "n2" },
        { "default": true, "target": "n1" } ] },
    { "key": "n2", "type": "APPROVAL", "name": "分管领导审批", "assignee": { "dimension": "POSITION" }, "signMode": "SINGLE" },
    { "key": "end", "type": "END" }
  ]
}`;
}
function wfdGo(d) {
  const n = wfdState.step + d;
  if (n < 1 || n > 4) return;
  if (wfdState.step === 1 && d > 0) {
    const fe = wfdState.launchMode === "external" ? wfdValidateLaunch() : wfdValidateForm();
    if (fe.length) {
      msg("error", `发起配置校验未通过：${fe[0].message}${fe[0].rule ? "（" + fe[0].rule + "）" : ""}`);
      return;
    }
  }
  if (wfdState.step === 2 && d > 0 && wfdState.nodes.length === 0) { msg("error", "至少需配置 1 个审批节点"); return; }
  // 离开画布视图前，把图模型回写为列表模型，保证步骤 4 的 8 条硬校验继续可用
  if (wfdState.view === "canvas" && (wfdState.step === 2 || wfdState.step === 3)) wfdSyncToList();
  wfdState.step = n;
  wfdRender();
}
function wfdRender() {
  const st = wfdState;
  document.querySelectorAll("#wfdSteps .step").forEach(s => {
    const sn = +s.dataset.s;
    s.className = "step" + (sn === st.step ? " active" : sn < st.step ? " done" : "");
    s.querySelector(".n").textContent = sn < st.step ? "✓" : sn;
  });
  document.getElementById("wfdPrev").disabled = st.step === 1;
  const next = document.getElementById("wfdNext");
  const launchReady = st.launchMode !== "external" || wfdValidateLaunch().length === 0;
  const formReady = st.launchMode === "external" || wfdValidateForm().length === 0;
  if (st.step < 4) { next.textContent = "下一步"; next.disabled = false; next.className = "btn btn-primary"; next.onclick = () => wfdGo(1); }
  else {
    const canPub = st.validatePass && launchReady && formReady;
    next.textContent = canPub ? "校验并发布" : "校验未通过，不可发布";
    next.disabled = !canPub;
    next.className = "btn btn-primary";
    next.onclick = wfdPublishClick;
  }
  const body = document.getElementById("wfdBody");
  if (st.step === 1) body.innerHTML = wfdStep1();
  else if (st.step === 2) body.innerHTML = wfdStep2();
  else if (st.step === 3) body.innerHTML = wfdStep3();
  else body.innerHTML = wfdStep4();
  // 步骤 2/3 若处于画布视图，innerHTML 插入后需要绑定事件并绘制 SVG
  if ((st.step === 2 || st.step === 3) && st.view === "canvas") wfdCanvasAfter();
}

function wfdStep1() {
  const st = wfdState;
  /* 步骤 1 顶部：发起方式（默认中台表单；易忽略的 secondary 按钮已改为分段切换 + 外部 URL 紧接其下） */
  const launchHeader = `
    <div class="wfd-launch-header">
      <div>
        <div class="wfd-launch-kicker">步骤 1 · 发起方式</div>
        <div class="wfd-launch-h">${st.launchMode === "external" ? "外部应用页面" : "中台表单"}</div>
        <p class="text-secondary fs-12 mb-0" style="max-width:520px">${
          st.launchMode === "external"
            ? "填写下方两个外部地址即可；无需配置 formSchema 字段列表。"
            : "在中台配置发起表单（formSchema）；字段 key 用于步骤 3 条件分支。"
        }</p>
      </div>
      <div class="wfd-launch-segment" role="tablist" aria-label="发起方式">
        <button type="button" class="${st.launchMode === "form" ? "active" : ""}" role="tab" aria-selected="${st.launchMode === "form"}" onclick="wfdSetLaunchMode('form')">中台表单</button>
        <button type="button" class="${st.launchMode === "external" ? "active" : ""}" role="tab" aria-selected="${st.launchMode === "external"}" onclick="wfdSetLaunchMode('external')">外部应用页面</button>
      </div>
    </div>`;
  const externalBlock = st.launchMode === "external" ? wfdExternalLaunchEditor() : "";
  // 配置方式（模板 / JSON）放在发起方式之后，避免挤占首屏
  const modeBar = `
    <div class="wf-form-modebar">
      <span>配置方式：<b>${st.mode === "TEMPLATE" ? "模板化配置" : "JSON 流程定义"}</b> · ${
        st.mode === "TEMPLATE" ? "已选模板 " + (MOCK.workflow.approvalTemplates.find(t => t.code === st.template) || {}).name : "结构化 JSON 定义"
      } <span class="fs-12">（在入口「＋ 新建审批流」处选择，可在此切换）</span></span>
      <span class="flex gap-2">
        <button class="btn btn-sm ${st.mode === "TEMPLATE" ? "btn-primary" : ""}" onclick="wfdSetMode('TEMPLATE')">模板化</button>
        <button class="btn btn-sm ${st.mode === "JSON" ? "btn-primary" : ""}" onclick="wfdSetMode('JSON')">JSON</button>
      </span>
    </div>`;
  const formBlock = st.launchMode === "form"
    ? `<h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:18px 0 10px">发起表单定义（formSchema）</h4>
    <p class="text-secondary mb-3">配置流程发起时展示的填写表单：<b>左字段列表</b>（增删 + 上下移排序）+ <b>右属性面板</b>（编辑选中字段）。字段 <b>key</b> 直接作为条件分支变量（步骤 3 使用）。</p>
    ${wfdFormEditor()}`
    : "";
  return `
    ${launchHeader}
    ${externalBlock}
    ${modeBar}
    ${st.mode === "JSON" ? wfdStep1Json() : wfdStep1Template()}
    ${formBlock}`;
}
function wfdSetLaunchMode(mode) {
  wfdState.launchMode = mode === "external" ? "external" : "form";
  wfdRender();
}
function wfdExternalLaunchEditor() {
  const st = wfdState;
  const issues = wfdValidateLaunch();
  const issueBar = issues.length
    ? `<div class="readonly-banner mt-2" style="background:var(--bmp-color-danger-light);border-color:var(--bmp-color-danger);color:var(--bmp-color-danger)">⚠ ${issues.map(x => wfEsc(x.message)).join("；")}</div>`
    : `<div class="readonly-banner mt-2" style="background:var(--bmp-color-success-light);border-color:var(--bmp-color-success);color:var(--bmp-color-success)">✅ 第三方地址校验通过（http(s) URL）</div>`;
  return `
    <div class="wfd-external-url-panel">
    <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:0 0 10px">外部应用地址</h4>
    <p class="text-secondary mb-3">发起时新标签打开<b>外部应用填写页面</b>；审批人 / 发起人在中台「在业务系统查看」打开<b>外部应用查看页面</b>。仍走 C1 节点与 A4 待办；表单数据在业务系统，中台保存 fillUrl / viewUrl 与实例关联。</p>
    <div class="field"><label><span class="req">*</span>外部应用填写页面</label>
      <input class="input mono" placeholder="https://app.example.com/fill?sso=1&bizKey={bizKey}" value="${wfEsc(st.fillUrl || "")}" onchange="wfdState.fillUrl=this.value;wfdRender()">
      <div class="tip">对应 fillUrl · 须为 http(s)；支持占位符 <span class="mono">{bizKey}</span>、<span class="mono">{defKey}</span>；经 E1 网关 SSO 免登（原型演示）。</div></div>
    <div class="field"><label><span class="req">*</span>外部应用查看页面</label>
      <input class="input mono" placeholder="https://app.example.com/view?bizKey={bizKey}" value="${wfEsc(st.viewUrl || "")}" onchange="wfdState.viewUrl=this.value;wfdRender()">
      <div class="tip">对应 viewUrl · 审批详情 / 我发起 主操作「在业务系统查看」打开此地址。</div></div>
    ${issueBar}
    <div class="readonly-banner mt-3" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
      ℹ 外部应用页面模式下<b>不要求</b>配置 formSchema 字段；步骤 4 发布校验在地址合法时跳过表单字段规则。条件分支若无表单变量，可仅走默认分支或固定节点。
    </div>
    </div>`;
}
function wfdValidateLaunch() {
  const issues = [];
  const fill = String(wfdState.fillUrl || "").trim();
  const view = String(wfdState.viewUrl || "").trim();
  if (!fill) issues.push({ rule: "FILL_URL_REQUIRED", message: "外部应用填写页面不能为空" });
  else if (!MOCK.isWorkflowHttpUrl(fill)) issues.push({ rule: "FILL_URL_INVALID", message: "外部应用填写页面须为合法的 http(s) URL" });
  if (!view) issues.push({ rule: "VIEW_URL_REQUIRED", message: "外部应用查看页面不能为空" });
  else if (!MOCK.isWorkflowHttpUrl(view)) issues.push({ rule: "VIEW_URL_INVALID", message: "外部应用查看页面须为合法的 http(s) URL" });
  return issues;
}
function wfdSaveDraft() {
  const defKey = "contract_approval";
  if (MOCK.saveWorkflowLaunchDraft) {
    MOCK.saveWorkflowLaunchDraft(defKey, {
      launchMode: wfdState.launchMode,
      fillUrl: wfdState.fillUrl,
      viewUrl: wfdState.viewUrl
    });
  }
  msg("success", "草稿已保存（含发起方式 · status=草稿 · C1-F01-5）");
}
/* 步骤 1 子块：模板化配置（预置模板） */
function wfdStep1Template() {
  const st = wfdState;
  const tplCards = MOCK.workflow.approvalTemplates.map(t => {
    const isBlank = t.code === "TPL_BLANK";
    const tags = (t.nodes && t.nodes.length)
      ? t.nodes.map(n => `<span class="tag tag-info">${n.name}</span>`).join("")
      : `<span class="tag tag-info">无预置节点 · 从零配置</span>`;
    return `
    <div class="wf-tpl-card ${isBlank ? "blank" : ""} ${st.template === t.code ? "sel" : ""}"
         onclick="wfdPickTpl('${t.code}')">
      ${isBlank ? `<span class="wf-tpl-badge">＋ 新建</span>` : ""}
      <div class="nm">${isBlank ? `<span class="wf-tpl-plus">＋</span>` : ""}${t.name}</div>
      <div class="ds">${t.desc}</div>
      <div class="tags">${tags}</div>
    </div>`;
  }).join("");
  return `
    <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:8px 0 10px">预置审批模板（产品内核预置，不可删除）</h4>
    <div class="wf-tpl-grid">${tplCards}</div>
    <div class="field mt-4" style="max-width:320px"><label>流程 defKey（唯一键）</label><input class="input mono" value="contract_approval_v3" placeholder="小写字母 / 下划线"></div>`;
}
/* 步骤 1 子块：JSON 流程定义 */
function wfdStep1Json() {
  const st = wfdState;
  return `
    <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:8px 0 10px">JSON 流程定义</h4>
    <div class="flex gap-2 mb-3">
      <button class="btn btn-sm" onclick="wfdFillJson()">示例 JSON</button>
      <span class="fs-12 text-secondary">符合定义规范：节点 key 唯一 · 条件表达式仅支持受限白名单语法 · 必须有默认分支</span>
    </div>
    <textarea class="input mono" id="wfdJson" style="height:240px" onchange="wfdState.json=this.value">${st.json}</textarea>`;
}
function wfdSetMode(m) { wfdState.mode = m; wfdRender(); }
function wfdFillJson() {
  const ta = document.getElementById("wfdJson");
  if (ta) { ta.value = wfdExampleJson(); wfdState.json = ta.value; msg("info", "已填充示例 JSON（含开始/结束节点、条件网关与默认分支）"); }
}

/* ============================================================
   发起表单设计器（步骤 1）：左字段列表（增删 + 上下移排序）+ 右属性面板
   字段类型 9 种；key 即条件分支变量；纯原生 DOM
   ============================================================ */
function wfdFormFields() { return (wfdState.formSchema && wfdState.formSchema.fields) || []; }
function wfdFormSort() { return wfdFormFields().slice().sort((a, b) => (a.sort || 0) - (b.sort || 0)); }
function wfdFormReindex() {
  // 重排 sort：按当前数组顺序赋 1..n，保证 sort 连续便于展示
  wfdFormFields().forEach((f, i) => f.sort = i + 1);
}
function wfdFormEditor() {
  const st = wfdState;
  const fields = wfdFormFields();
  const rows = fields.map((f, i) => `
    <div class="wf-form-field-item ${st.selectedField === i ? "sel" : ""}" onclick="wfdFormSelectField(${i})">
      <span class="handle">⋮⋮</span>
      <span class="seq">${i + 1}</span>
      <span class="info">
        <span class="nm">${wfEsc(f.label || "（未命名）")} <span class="mono">(${wfEsc(f.key || "—")})</span></span>
        <span class="meta">${wfFieldTypeLabel(f.type)}${f.required ? " · 必填" : ""}${(f.type === "select" || f.type === "multiselect") ? " · " + (f.options || []).length + " 选项" : ""}</span>
      </span>
      <span class="ops">
        <button title="上移" ${i === 0 ? "disabled" : ""} onclick="event.stopPropagation();wfdFormMoveField(${i},-1)">↑</button>
        <button title="下移" ${i === fields.length - 1 ? "disabled" : ""} onclick="event.stopPropagation();wfdFormMoveField(${i},1)">↓</button>
        <button title="删除" onclick="event.stopPropagation();wfdFormDelField(${i})">✕</button>
      </span>
    </div>`).join("");
  const listEmpty = `<div class="state-box" style="padding:24px 0"><div class="illus">🧾</div><div class="txt">暂无字段，请点击「＋ 添加字段」</div></div>`;
  const issues = wfdValidateForm();
  const issueBar = issues.length
    ? `<div class="readonly-banner mt-2" style="background:var(--bmp-color-danger-light);border-color:var(--bmp-color-danger);color:var(--bmp-color-danger)">⚠ 表单定义存在 ${issues.length} 个问题：${issues.map(x => wfEsc(x.message)).join("；")}</div>`
    : `<div class="readonly-banner mt-2" style="background:var(--bmp-color-success-light);border-color:var(--bmp-color-success);color:var(--bmp-color-success)">✅ 表单定义校验通过（字段 key 唯一、标签非空、选项类字段选项完整）</div>`;
  return `
    <div class="wf-form-design">
      <div class="wf-form-list">
        <div class="wf-form-list-head">
          <b>字段列表（${fields.length}）</b>
          <button class="btn btn-sm btn-primary" onclick="wfdFormAddField()">＋ 添加字段</button>
        </div>
        <div class="wf-form-title-row">
          <label>表单标题</label>
          <input class="input" value="${wfEsc(st.formSchema.title || "")}" onchange="wfdState.formSchema.title=this.value;wfdRender()">
        </div>
        ${fields.length ? rows : listEmpty}
        <div class="fs-12 text-secondary mt-3">ℹ 字段 <b>key</b> 直接作为条件分支变量（步骤 3 可用变量由本表派生）；V1.0 共 <b>9</b> 类字段，不含联动/显隐/拖拽布局（V1.5）。</div>
      </div>
      <div class="wf-form-props">${wfdFormPropPanel()}</div>
    </div>
    ${issueBar}`;
}
function wfdFormPropPanel() {
  const st = wfdState;
  const i = st.selectedField;
  const f = (i != null) ? wfdFormFields()[i] : null;
  if (!f) {
    return `<h5 class="p-title">字段属性</h5>
      <div class="fs-12 text-secondary" style="line-height:1.9">请在左侧选择一个字段进行编辑，或点击「＋ 添加字段」。<br><br>· 字段类型（9 类）：单行文本 / 多行文本 / 数字 / 金额 / 日期 / 日期时间 / 下拉单选 / 多选 / 附件<br>· 选项类字段（下拉单选 / 多选）需至少配置 1 个选项<br>· key 全局唯一且符合 <span class="mono">^[a-zA-Z_][a-zA-Z0-9_]*$</span></div>`;
  }
  const typeOpts = wfFieldTypes().map(t => `<option value="${t.value}" ${t.value === f.type ? "selected" : ""}>${t.label}</option>`).join("");
  const isOption = f.type === "select" || f.type === "multiselect";
  const optionsHtml = isOption ? `
    <div class="field" style="margin-top:10px"><label>选项（label = value）</label>
      ${(f.options || []).map((o, oi) => `
        <div class="wf-form-opt-row">
          <input class="input" value="${wfEsc(o.label)}" placeholder="显示名" onchange="wfdFormPatchOption(${i},${oi},'label',this.value)">
          <input class="input mono" value="${wfEsc(o.value)}" placeholder="值" onchange="wfdFormPatchOption(${i},${oi},'value',this.value)">
          <button title="删除选项" onclick="wfdFormDelOption(${i},${oi})">✕</button>
        </div>`).join("") || `<div class="fs-12 text-secondary" style="margin-bottom:6px">暂无选项，请添加</div>`}
      <button class="btn btn-sm" onclick="wfdFormAddOption(${i})">＋ 添加选项</button>
    </div>` : "";
  const dup = wfdFormFields().some((x, xi) => xi !== i && x.key === f.key);
  return `
    <h5 class="p-title">字段属性 · ${wfEsc(f.label || "未命名")}</h5>
    <div class="field"><label><span class="req">*</span>字段标签</label>
      <input class="input" value="${wfEsc(f.label)}" onchange="wfdFormPatchField(${i},'label',this.value)"></div>
    <div class="field ${dup ? "has-error" : ""}"><label><span class="req">*</span>变量 key（唯一 · 作条件变量）</label>
      <input class="input mono" value="${wfEsc(f.key)}" onchange="wfdFormPatchField(${i},'key',this.value)">
      <div class="err-msg">key 重复：已被其它字段使用</div></div>
    <div class="field"><label><span class="req">*</span>字段类型</label>
      <select class="select" onchange="wfdFormPatchField(${i},'type',this.value)">${typeOpts}</select>
      <div class="tip">共 9 类；切换到「下拉单选 / 多选」需配置选项</div></div>
    <div class="field"><label>占位提示</label>
      <input class="input" value="${wfEsc(f.placeholder || "")}" onchange="wfdFormPatchField(${i},'placeholder',this.value)"></div>
    <div class="field"><label>帮助说明</label>
      <input class="input" value="${wfEsc(f.help || "")}" onchange="wfdFormPatchField(${i},'help',this.value)"></div>
    <label class="flex items-center gap-2 fs-13" style="margin:10px 0;cursor:pointer">
      <input type="checkbox" ${f.required ? "checked" : ""} onchange="wfdFormPatchField(${i},'required',this.checked)"> 必填（发起校验项）
    </label>
    ${optionsHtml}`;
}
function wfdFormAddField() {
  const fields = wfdFormFields();
  const sort = fields.reduce((m, f) => Math.max(m, f.sort || 0), 0) + 1;
  fields.push({ key: "field" + (fields.length + 1), label: "新字段", type: "text", required: false, placeholder: "", help: "", defaultValue: "", sort, maxLength: null, options: [] });
  wfdFormReindex();
  wfdState.selectedField = fields.length - 1;
  wfdRender();
  msg("success", "已添加字段（默认「单行文本」），请在右侧编辑属性");
}
function wfdFormDelField(i) {
  const fields = wfdFormFields();
  if (!fields[i]) return;
  if (!confirm(`确认删除字段「${fields[i].label}」？`)) return;
  fields.splice(i, 1);
  wfdFormReindex();
  if (wfdState.selectedField != null && wfdState.selectedField >= fields.length) wfdState.selectedField = fields.length - 1;
  wfdRender();
  msg("success", "字段已删除");
}
function wfdFormMoveField(i, dir) {
  const fields = wfdFormFields();
  const j = i + dir;
  if (j < 0 || j >= fields.length) return;
  const tmp = fields[i]; fields[i] = fields[j]; fields[j] = tmp;
  wfdFormReindex();
  wfdState.selectedField = j;
  wfdRender();
}
function wfdFormSelectField(i) { wfdState.selectedField = i; wfdRender(); }
function wfdFormPatchField(i, k, v) {
  const f = wfdFormFields()[i];
  if (!f) return;
  if (k === "key") {
    const t = String(v).trim();
    if (t && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(t)) { msg("error", "key 只能由字母 / 数字 / 下划线组成，且不能以数字开头"); wfdRender(); return; }
    f.key = t;
  } else if (k === "required") {
    f.required = !!v;
  } else {
    f[k] = v;
  }
  wfdRender();
}
function wfdFormPatchOption(i, oi, k, v) {
  const f = wfdFormFields()[i];
  if (!f || !f.options || !f.options[oi]) return;
  f.options[oi][k] = v;
  wfdRender();
}
function wfdFormAddOption(i) {
  const f = wfdFormFields()[i];
  if (!f) return;
  f.options = f.options || [];
  f.options.push({ label: "新选项" + (f.options.length + 1), value: "opt" + (f.options.length + 1) });
  wfdRender();
}
function wfdFormDelOption(i, oi) {
  const f = wfdFormFields()[i];
  if (!f || !f.options) return;
  f.options.splice(oi, 1);
  wfdRender();
}
/* 纯函数：表单定义校验（key 唯一/合法、label 非空、选项类字段必有 options） */
function wfdValidateForm() {
  const issues = [];
  const fields = wfdFormFields();
  const seen = {};
  fields.forEach((f, i) => {
    const label = f.label || `第 ${i + 1} 个字段`;
    if (!String(f.label || "").trim()) issues.push({ key: f.key, rule: "LABEL_REQUIRED", message: `${label}：字段标签不能为空` });
    const k = String(f.key || "").trim();
    if (!k) issues.push({ key: f.key, rule: "KEY_REQUIRED", message: `${label}：变量 key 不能为空` });
    else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(k)) issues.push({ key: f.key, rule: "KEY_INVALID", message: `${label}：变量 key「${k}」不合法` });
    if (k && seen[k] != null) issues.push({ key: f.key, rule: "KEY_DUP", message: `变量 key「${k}」重复（与第 ${seen[k] + 1} 个字段冲突）` });
    else if (k) seen[k] = i;
    if ((f.type === "select" || f.type === "multiselect") && (!f.options || !f.options.length)) issues.push({ key: f.key, rule: "OPTIONS_REQUIRED", message: `${label}：选项类字段至少需 1 个选项` });
  });
  return issues;
}
/* 步骤 3 可用变量：来自 formSchema.fields（label 显示中文名，值用 key） */
function wfdFormVariableOptions() {
  return wfdFormSort().map(f => ({ key: f.key, label: f.label }));
}
/* 步骤 4 / 步骤 1 共用的表单预览（只读渲染） */
function wfdFormPreviewHtml() {
  return wfRenderFormReadonly(wfdState.formSchema, {}, "readonly");
}
/* 落点②：画布点 START 节点 → 属性面板「配置发起表单」入口，切到步骤 1 表单设计器 */
function wfdGotoFormEditor() {
  wfdState.view = "list";
  wfdState.step = 1;
  wfdRender();
  msg("info", "已切换到步骤 1「发起表单」设计器");
}
function wfdPickTpl(code) {
  wfdState.template = code;
  const t = MOCK.workflow.approvalTemplates.find(x => x.code === code);
  const isBlank = !!t && (!t.nodes || t.nodes.length === 0);
  if (t) {
    // 空白模板：清空节点与路由，从零配置；其它模板：带入预置节点
    wfdState.nodes = (t.nodes || []).map(n => ({ name: n.name, assigneeType: n.assigneeType, signMode: n.signMode }));
    if (isBlank) wfdState.routes = [];
  }
  wfdInvalidateGraph();
  wfdRender();
  if (isBlank) {
    msg("info", "已选择空白模板：节点为空，请从零添加节点");
  } else {
    msg("success", `已选中模板「${t ? t.name : code}」并带入 ${t && t.nodes ? t.nodes.length : 0} 个节点`);
  }
}

function wfdStep2() {
  const banner = wfdViewSwitch("2", "配置审批节点：节点名、审批人维度（组织 / 岗位 / 指定人 / 上级）、签署方式（单人 / 会签ALL / 或签OR）。按顺序逐级流转。");
  if (wfdState.view === "canvas") return banner + wfdCanvasShell();
  const nodes = wfdState.nodes.map((n, i) => `
    <div class="wf-node-row">
      <span class="seq">${i + 1}</span>
      <input class="input" value="${n.name}" placeholder="节点名称" onchange="wfdSetNode(${i},'name',this.value)">
      <select class="select" onchange="wfdSetNode(${i},'assigneeType',this.value)">
        ${["组织", "岗位", "指定人", "上级"].map(o => `<option ${o === n.assigneeType ? "selected" : ""}>${o}</option>`).join("")}
      </select>
      <select class="select" onchange="wfdSetNode(${i},'signMode',this.value)">
        ${["单人", "会签ALL", "或签OR"].map(o => `<option ${o === n.signMode ? "selected" : ""}>${o}</option>`).join("")}
      </select>
      <button class="btn btn-sm" onclick="wfdDelNode(${i})">删除</button>
    </div>`).join("");
  return `
    ${banner}
    <p class="text-secondary mb-4">配置审批节点：节点名、审批人维度（组织 / 岗位 / 指定人 / 上级）、签署方式（单人 / 会签ALL / 或签OR）。按顺序逐级流转。</p>
    <div class="wf-node-head fs-12 text-secondary">
      <span class="seq">#</span><span>节点名称</span><span>审批人维度</span><span>签署方式</span><span></span>
    </div>
    ${nodes || `<div class="state-box"><div class="illus">📭</div><div class="txt">暂无节点，请点击下方「＋ 添加节点」开始从零配置</div></div>`}
    <button class="btn btn-sm mt-3" onclick="wfdAddNode()">＋ 添加节点</button>
    <div class="fs-12 text-secondary mt-3">ℹ 审批人解析顺序：节点指定人 → 岗位/角色 → 组织矩阵；签署方式：单人=单审批人，会签ALL=全部同意才通过，或签OR=任一同意即通过（C1-F03-3/4）</div>`;
}
function wfdSetNode(i, k, v) { if (wfdState.nodes[i]) wfdState.nodes[i][k] = v; wfdInvalidateGraph(); }
function wfdAddNode() { wfdState.nodes.push({ name: "新审批节点", assigneeType: "组织", signMode: "单人" }); wfdInvalidateGraph(); wfdRender(); }
function wfdDelNode(i) { wfdState.nodes.splice(i, 1); wfdInvalidateGraph(); wfdRender(); }

function wfdStep3() {
  const banner = wfdViewSwitch("3", "配置条件分支路由：条件表达式 + 目标节点。变量从表单字段下拉选择；条件分支必须有默认分支（否则发布校验不通过 · C1-F03-2）。");
  if (wfdState.view === "canvas") return banner + wfdCanvasShell();
  const nodeOpts = wfdState.nodes.map(n => n.name);
  const rows = wfdState.routes.map((r, i) => `
    <div class="wf-route-row">
      <input class="input mono" value="${r.cond}" placeholder="amount > 50000" onchange="wfdSetRoute(${i},'cond',this.value)">
      <span style="text-align:center;color:var(--bmp-text-placeholder)">→</span>
      <select class="select" onchange="wfdSetRoute(${i},'target',this.value)">
        ${nodeOpts.map(o => `<option ${o === r.target ? "selected" : ""}>${o}</option>`).join("")}
      </select>
      ${r.isDefault ? `<span class="tag tag-success">默认分支</span>` : `<button class="btn btn-sm" onclick="wfdSetDefault(${i})">设为默认</button>`}
      <button class="btn btn-sm" ${r.isDefault ? "disabled" : ""} onclick="wfdDelRoute(${i})">删除</button>
    </div>`).join("");
  const hasDefault = wfdState.routes.some(r => r.isDefault);
  return `
    ${banner}
    <p class="text-secondary mb-4">配置条件分支路由：条件表达式 + 目标节点。变量从表单字段下拉选择；<b>条件分支必须有默认分支</b>（否则发布校验不通过 · C1-F03-2）。</p>
    <div class="wf-route-head fs-12 text-secondary"><span>条件表达式</span><span></span><span>目标节点</span><span>默认</span><span></span></div>
    ${rows || `<div class="state-box"><div class="illus">🔀</div><div class="txt">暂无条件分支，可点击下方「＋ 添加条件分支」为流程配置路由条件</div></div>`}
    <div class="flex gap-2 mt-3">
      <button class="btn btn-sm" onclick="wfdAddRoute()">＋ 添加条件分支</button>
      <span class="field" style="display:inline-flex;align-items:center;gap:6px;margin:0">
        <label style="margin:0" class="fs-12 text-secondary">可用变量（来自表单字段）：</label>
        <select class="select" style="width:200px" onchange="wfdInsertVar(this.value)">
          <option value="">— 选择字段变量 —</option>
          ${wfdFormVariableOptions().map(v => `<option value="${wfEsc(v.key)}">${wfEsc(v.label)}（${wfEsc(v.key)}）</option>`).join("")}
        </select>
      </span>
    </div>
    <div class="readonly-banner mt-3" style="background:${hasDefault ? "var(--bmp-color-success-light)" : "var(--bmp-color-danger-light)"};border-color:${hasDefault ? "var(--bmp-color-success)" : "var(--bmp-color-danger)"};color:${hasDefault ? "var(--bmp-color-success)" : "var(--bmp-color-danger)"}">
      ${hasDefault ? "✅ 已配置默认分支，无命中时走默认分支，避免无分支死锁" : "⚠ 缺少默认分支：条件无命中时将导致流程死锁，发布校验将不通过（规则 3）"}
    </div>`;
}
function wfdSetRoute(i, k, v) { if (wfdState.routes[i]) wfdState.routes[i][k] = v; wfdInvalidateGraph(); }
function wfdSetDefault(i) { wfdState.routes.forEach((r, j) => r.isDefault = (j === i)); wfdState.routes[i].cond = "（其他情况）"; wfdInvalidateGraph(); wfdRender(); msg("info", "已设为默认分支（default=true）"); }
function wfdAddRoute() { wfdState.routes.push({ cond: "amount <= 50000", target: wfdState.nodes[0] ? wfdState.nodes[0].name : "部门负责人审批", isDefault: false }); wfdInvalidateGraph(); wfdRender(); }
function wfdDelRoute(i) { wfdState.routes.splice(i, 1); wfdInvalidateGraph(); wfdRender(); }
/* 步骤 3：从表单字段变量插入条件表达式（新建一条含该变量的分支） */
function wfdInsertVar(key) {
  if (!key) return;
  const f = wfdFormFields().find(x => x.key === key);
  if (!f) return;
  if (!wfdState.routes.length) {
    wfdState.routes.push({ cond: `${key} > 0`, target: wfdState.nodes[0] ? wfdState.nodes[0].name : "部门负责人审批", isDefault: false });
    msg("info", `已用表单字段「${f.label}」新建条件分支：${key} > 0`);
  } else {
    const last = wfdState.routes[wfdState.routes.length - 1];
    last.cond = (last.cond ? last.cond + " && " : "") + `${key} > 0`;
    msg("info", `已将表单字段「${f.label}」追加到表达式（${key} > 0）`);
  }
  wfdInvalidateGraph();
  wfdRender();
}

function wfdStep4() {
  const st = wfdState;
  const rules = st.validatePass ? MOCK.workflow.validateRules : MOCK.workflow.validateRulesFailed;
  const failCount = rules.filter(r => !r.pass).length;
  const ruleRows = rules.map(r => `
    <div class="wf-check-item ${r.pass ? "ok" : "fail"}">
      <span class="seq">${r.seq}</span>
      <span class="ic">${r.pass ? "✅" : "❌"}</span>
      <span class="nm">${r.name}</span>
      <span class="dt fs-12">${r.detail}</span>
    </div>`).join("");
  const pv = MOCK.workflow.parsePreview;
  const pvRows = pv.results.map(r => `
    <div class="wf-parse-item ${r.ok ? "" : "warn"}">
      <span class="nm">${r.node}</span>
      <span class="rs">${r.resolved}</span>
      <span class="by fs-12 text-secondary">${r.by}</span>
      ${r.ok ? `<span class="tag tag-success">解析成功</span>` : `<span class="tag tag-warning">兜底告警</span>`}
    </div>`).join("");
  return `
    <div class="flex justify-between items-center mb-3">
      <p class="text-secondary" style="margin:0">发布前校验（3.8.2 · 8 条 P0 规则，缺一不可）</p>
      <button class="btn btn-sm" onclick="wfdToggleValidate()">切换演示态：${st.validatePass ? "校验通过 → 演示不通过" : "校验不通过 → 演示通过"}</button>
    </div>
    ${wfdStep4CanvasSummary()}
    <div class="wf-check-list">${ruleRows}</div>
    <div class="readonly-banner mt-3" style="background:${st.validatePass ? "var(--bmp-color-success-light)" : "var(--bmp-color-danger-light)"};border-color:${st.validatePass ? "var(--bmp-color-success)" : "var(--bmp-color-danger)"};color:${st.validatePass ? "var(--bmp-color-success)" : "var(--bmp-color-danger)"}">
      ${st.validatePass ? "✅ 8 条规则全部通过，「发布」按钮可用" : `❌ ${failCount} 条规则未通过，发布被拒绝，请返回对应步骤修正（校验拦截率 100%）`}
    </div>

    ${st.launchMode === "external" ? `
    <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:20px 0 10px">发起方式预览（外部应用页面）</h4>
    <p class="text-secondary mb-3" style="font-size:13px">未配置 formSchema 字段；发起跳转外部应用填写页面，查看跳转外部应用查看页面（发布校验：两 URL 均为 http(s) 即通过表单字段规则）。</p>
    <dl class="desc-grid">
      <dt>发起方式</dt><dd><span class="tag tag-info">外部应用页面</span></dd>
      <dt>外部应用填写页面</dt><dd class="mono fs-12">${wfEsc(st.fillUrl || "—")}</dd>
      <dt>外部应用查看页面</dt><dd class="mono fs-12">${wfEsc(st.viewUrl || "—")}</dd>
    </dl>
    ${wfdValidateLaunch().length
      ? `<div class="readonly-banner mt-2" style="background:var(--bmp-color-danger-light);border-color:var(--bmp-color-danger);color:var(--bmp-color-danger)">⚠ 地址未通过校验，不可发布</div>`
      : `<div class="readonly-banner mt-2" style="background:var(--bmp-color-success-light);border-color:var(--bmp-color-success);color:var(--bmp-color-success)">✅ 外部应用发起配置校验通过（跳过 formSchema 字段条数校验）</div>`}
    ` : `
    <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:20px 0 10px">发起表单预览（formSchema · 只读）</h4>
    <p class="text-secondary mb-3" style="font-size:13px">发起流程时按以下表单渲染填写页；审批每一步均可查看同一份表单数据（标签来自定义，值来自实例）。</p>
    ${wfdFormPreviewHtml()}
    <div class="fs-12 text-secondary mt-2">ℹ 字段 <b>key</b> 即条件分支变量（步骤 3 的可用变量即来自本表单）；共 ${wfdFormFields().length} 个字段。</div>`}

    <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:20px 0 10px">审批人解析预览（模拟发起人试算）</h4>
    <div class="field" style="max-width:420px"><label>模拟发起人</label>
      <input class="input" value="${pv.initiator}" onchange="msg('info','已按新发起人重新试算审批人解析（原型演示）')"></div>
    <div class="wf-parse-list">${pvRows}</div>
    <div class="fs-12 text-secondary mt-2">ℹ 解析失败自动回退至兜底审批人（流程管理员）并触发解析失败告警（C1-F02-3）；解析成功率 ≥99.5%，P95 <200ms</div>

    <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:20px 0 10px">流程定义状态机</h4>
    <div class="wf-state-machine">
      <div class="sm-box draft">草稿<div class="sm-sub">新建 · 编辑参数</div></div>
      <div class="sm-arrow">── 校验通过 + 发布 ──▶</div>
      <div class="sm-box pub">已发布<div class="sm-sub">可发起新实例</div></div>
      <div class="sm-arrow">── 停用 ──▶</div>
      <div class="sm-box stop">停用<div class="sm-sub">不可发起新实例</div></div>
    </div>
    <div class="wf-sm-note">
      <span class="tag tag-danger">禁止</span> 已发布 → 草稿（不可修改、不可回退，如需修改须新建 version） ·
      <span class="tag tag-success">允许</span> 停用 → 已发布（重新启用，需重新校验） ·
      运行实例按<b>发起版本</b>执行
    </div>

    <div class="readonly-banner mt-3" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
      📌 发布为 <b>defKey + version</b>（本次为 contract_approval_v3）；运行实例按<b>发起时版本</b>执行，新版本仅对新实例生效（C1-F01-3）
    </div>`;
}
function wfdToggleValidate() { wfdState.validatePass = !wfdState.validatePass; wfdRender(); }
function wfdPublishClick() {
  if (wfdState.launchMode === "external" && wfdValidateLaunch().length) {
    msg("error", "第三方地址未通过校验，不可发布");
    return;
  }
  wfdSaveDraft();
  const extNote = wfdState.launchMode === "external"
    ? "发起方式为<b>第三方页面</b>（fillUrl/viewUrl），无 formSchema 字段。"
    : "发起方式为<b>中台表单</b>（formSchema）。";
  highRisk("发布流程定义",
    `将发布流程定义 <b>contract_approval</b> 的 <b>v3</b>。发布前 8 条校验已通过；${extNote}发布后状态变为「已发布」，` +
    `可被业务系统发起调用，运行实例按发起版本执行（C1-F01-3）。`,
    "contract_approval_v3",
    "流程定义 contract_approval v3 已发布（写审计日志）",
    () => { location.href = "console.html?page=workflow-defs"; });
}

/* ============================================================
   UI-WF-02 增量：真交互 DAG 可视化配置画布（纯手写 SVG，零第三方库）
   - 双视图（列表 / 画布）切换，数据双向同步
   - 物料拖入、节点拖拽、锚点连线、选中编辑、删除、重命名、自动布局、缩放平移
   - 实时图语义校验（Kahn 禁环 / 单入度 / 默认分支 / 孤立节点 / START-END）
   规则单一事实源：画布内 = 软门禁即时反馈，步骤 4 = 硬门禁阻断发布（同一套规则）
   ============================================================ */
const WFD_DIM = { START: { w: 104, h: 46 }, END: { w: 104, h: 46 }, APPROVAL: { w: 160, h: 58 }, GATEWAY: { w: 92, h: 92 } };
/* 画布上「发起表单」字段卡的尺寸（挂在 START 节点左侧，直接展示 formSchema 字段） */
const WFD_FORM_CARD = { w: 216, h: 30, headH: 34, gapX: 132, gapY: 8 };
let wfdKbBound = false;

function wfdDim(t) { return WFD_DIM[t] || WFD_DIM.APPROVAL; }
function wfdTypeLabel(t) { return { START: "开始", APPROVAL: "审批", GATEWAY: "网关", END: "结束" }[t] || t; }
function wfdEsc(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function wfdTrunc(s, n) { s = String(s == null ? "" : s); return s.length > n ? s.slice(0, n - 1) + "…" : s; }
function wfdUid(prefix) {
  const c = wfdState.canvas;
  c.seq = (c.seq || 0) + 1;
  return prefix + "_" + Date.now().toString(36) + "_" + c.seq;
}
function wfdGraph() {
  if (!wfdState.graph) wfdState.graph = wfdBuildGraphFromList();
  return wfdState.graph;
}
function wfdInvalidateGraph() { wfdState.graph = null; }

/* ---------- 视图切换 ---------- */
function wfdViewSwitch(step, tip) {
  const st = wfdState;
  return `
    <div class="flex items-center gap-3 mb-3" style="flex-wrap:wrap">
      <div class="wf-view-switch">
        <button class="${st.view === "list" ? "active" : ""}" onclick="wfdSetView('list')">☰ 列表</button>
        <button class="${st.view === "canvas" ? "active" : ""}" onclick="wfdSetView('canvas')">⬡ 画布</button>
      </div>
      <span class="fs-12 text-secondary">${st.view === "canvas"
        ? "画布视图：拖入物料生成节点 · 拖动节点移动 · 从节点右侧圆点拖拽连线；列表与画布数据实时双向同步。"
        : tip}</span>
    </div>`;
}
function wfdSetView(v) {
  if (wfdState.view === v) return;
  if (v === "canvas") {
    if (!wfdState.graph) wfdState.graph = wfdBuildGraphFromList();
    wfdState.canvas.needFit = true;
    wfdState.view = "canvas";
    wfdRender();
    msg("info", "已切到画布视图：可拖拽物料、连线并查看实时校验");
  } else {
    wfdSyncToList();               // 离开画布 → 回写列表模型，保证步骤 4 硬校验可用
    wfdState.view = "list";
    wfdRender();
    msg("info", "已切回列表视图（画布配置已同步到列表）");
  }
}

/* ---------- 列表模型 ↔ 图模型 双向同步 ---------- */
function wfdSyncToList() {
  const g = wfdGraph();
  const approvals = g.nodes.filter(n => n.type === "APPROVAL").slice().sort((a, b) => (a.x - b.x) || (a.y - b.y));
  wfdState.nodes = approvals.map(n => ({ name: n.name, assigneeType: n.assigneeType || "组织", signMode: n.signMode || "单人" }));
  const gwIds = g.nodes.filter(n => n.type === "GATEWAY").map(n => n.id);
  const routes = [];
  g.edges.forEach(e => {
    if (gwIds.indexOf(e.from) >= 0) {
      const t = g.nodes.find(n => n.id === e.to);
      routes.push({ cond: e.cond || (e.isDefault ? "（其他情况）" : ""), target: t ? t.name : "—", isDefault: !!e.isDefault });
    }
  });
  wfdState.routes = routes;
}
function wfdBuildGraphFromList() {
  const g = { nodes: [], edges: [] };
  const Y = 170;
  let eidx = 1;
  const link = (from, to, cond, isDefault) => g.edges.push({ id: "e" + (eidx++), from, to, cond: cond || "", isDefault: !!isDefault });
  g.nodes.push({ id: "start", type: "START", name: "开始", x: 40, y: Y });
  const approvals = (wfdState.nodes || []).filter(Boolean);
  let prev = "start", x = 260;
  approvals.forEach((n, i) => {
    const id = "n" + (i + 1);
    g.nodes.push({ id, type: "APPROVAL", name: n.name || ("审批节点" + (i + 1)), x, y: Y, assigneeType: n.assigneeType || "组织", signMode: n.signMode || "单人" });
    link(prev, id);
    prev = id; x += 230;
  });
  const routes = (wfdState.routes || []).filter(Boolean);
  if (routes.length) {
    const gwId = "g1";
    g.nodes.push({ id: gwId, type: "GATEWAY", name: "条件网关", x, y: Y });
    link(prev, gwId);
    prev = gwId; x += 230;
    g.nodes.push({ id: "end1", type: "END", name: "结束", x, y: Y });
    routes.forEach(r => link(gwId, "end1", r.cond, r.isDefault));
  } else {
    g.nodes.push({ id: "end1", type: "END", name: "结束", x, y: Y });
    link(prev, "end1");
  }
  return g;
}

/* ---------- 画布外壳（三栏） ---------- */
function wfdCanvasShell() {
  const g = wfdGraph();
  const hasStart = g.nodes.some(n => n.type === "START");
  const hasEnd = g.nodes.some(n => n.type === "END");
  const pal = (type, label, hint, disabled) => `
    <div class="wf-canvas-palette-item ${disabled ? "disabled" : ""}"
      ${disabled ? `title="已存在，不允许重复"` : `draggable="true" ondragstart="wfdPaletteDrag(event,'${type}')" onclick="wfdAddNodeAt('${type}',null)"`}>
      <span class="lbl">${label}</span><span class="hint">${hint}</span>
    </div>`;
  return `
    <div class="wf-canvas-wrap">
      <div class="wf-canvas-palette">
        <h5 class="wf-canvas-ptitle">节点物料（拖入画布）</h5>
        ${pal("APPROVAL", "▭ 审批节点", "审批人处理")}
        ${pal("GATEWAY", "◇ 条件网关", "条件分支")}
        ${pal("START", "▶ 开始", "仅 1 个", hasStart)}
        ${pal("END", "⏹ 结束", "仅 1 个", hasEnd)}
        <div class="fs-12 text-secondary mt-3" style="line-height:1.7">拖拽或点击物料 → 在画布生成节点。开始 / 结束各限 1 个。V1.0 不提供并行网关（不支持并行汇聚）。</div>
      </div>
      <div class="wf-canvas-stage" ondragover="wfdDragOver(event)" ondrop="wfdDrop(event)">
        <div class="wf-canvas-toolbar">
          <button class="btn btn-sm" onclick="wfdAutoLayout()">⚙ 自动布局</button>
          <button class="btn btn-sm" onclick="wfdZoom(1.2)">放大 ＋</button>
          <button class="btn btn-sm" onclick="wfdZoom(1/1.2)">缩小 －</button>
          <button class="btn btn-sm" onclick="wfdFit()">⤢ 适应画布</button>
          <button class="btn btn-sm" onclick="wfdDeleteSelected()">🗑 删除选中</button>
          <button class="btn btn-sm" onclick="wfdToggleFormCard()" id="wfdFormCardBtn">📝 隐藏发起表单</button>
          <button class="btn btn-sm" onclick="wfdShowJson()">{ } 查看定义 JSON</button>
          <span class="fs-12 text-secondary" id="wfdZoomLabel" style="margin-left:auto">缩放 100%</span>
        </div>
        <svg class="wf-canvas-svg" id="wfdSvg"></svg>
      </div>
      <div class="wf-canvas-props" id="wfdProps"></div>
    </div>
    <div class="wf-canvas-validate" id="wfdValidate"></div>
    <div class="fs-12 text-secondary mt-2">ℹ 画布内为<b>软门禁实时校验</b>（防建造非法图）；步骤 4「校验与发布」的 <b>8 条硬校验</b>为发布门禁，二者<b>共用同一套规则</b>。红色=阻断项，黄色=警告项。</div>`;
}
function wfdCanvasAfter() {
  wfdDrawCanvas();
  if (wfdState.canvas.needFit) { wfdState.canvas.needFit = false; wfdFit(); }
  if (!wfdKbBound) {
    wfdKbBound = true;
    document.addEventListener("keydown", wfdKeyHandler);
  }
}
function wfdKeyHandler(e) {
  if (!wfdState || wfdState.view !== "canvas") return;
  if (wfdState.step !== 2 && wfdState.step !== 3) return;
  if (!document.getElementById("wfdSvg")) return;
  const tag = (e.target && e.target.tagName) || "";
  if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA" || (e.target && e.target.isContentEditable)) return;
  if (e.key === "Delete" || e.key === "Backspace") { wfdDeleteSelected(); e.preventDefault(); }
}

/* ---------- 坐标 / 几何 ---------- */
function wfdToWorld(clientX, clientY) {
  const svg = document.getElementById("wfdSvg");
  const c = wfdState.canvas;
  const r = svg ? svg.getBoundingClientRect() : { left: 0, top: 0 };
  return { x: (clientX - r.left - c.tx) / c.k, y: (clientY - r.top - c.ty) / c.k };
}
function wfdEdgePath(s, t) {
  const sd = wfdDim(s.type), td = wfdDim(t.type);
  const x1 = s.x + sd.w, y1 = s.y + sd.h / 2;
  const x2 = t.x, y2 = t.y + td.h / 2;
  const dx = Math.max(40, Math.abs(x2 - x1) * 0.5);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}
function wfdEdgeLabelPos(s, t) {
  const sd = wfdDim(s.type), td = wfdDim(t.type);
  const x1 = s.x + sd.w, y1 = s.y + sd.h / 2;
  const x2 = t.x, y2 = t.y + td.h / 2;
  return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 6 };
}
function wfdHitNode(g, x, y) {
  for (let i = g.nodes.length - 1; i >= 0; i--) {
    const n = g.nodes[i], d = wfdDim(n.type);
    if (x >= n.x && x <= n.x + d.w && y >= n.y && y <= n.y + d.h) return n;
  }
  return null;
}

/* ---------- 绘制 ---------- */
function wfdDrawCanvas() {
  const svg = document.getElementById("wfdSvg");
  if (!svg) return;
  const g = wfdGraph();
  const c = wfdState.canvas;
  const val = wfdValidateGraph();
  const nodeById = {}; g.nodes.forEach(n => nodeById[n.id] = n);

  const edges = g.edges.map(e => {
    const s = nodeById[e.from], t = nodeById[e.to];
    if (!s || !t) return "";
    const path = wfdEdgePath(s, t);
    const sel = c.selectedEdge === e.id;
    const bad = val.edgeState[e.id] === "bad";
    const cls = "wf-canvas-edge" + (e.isDefault ? " default" : "") + (sel ? " sel" : "") + (bad ? " bad" : "");
    const arrow = sel ? "wfdArrowSel" : (bad ? "wfdArrowBad" : "wfdArrow");
    const lp = wfdEdgeLabelPos(s, t);
    return `
      <path class="wf-canvas-edge-hit" data-edge-hit="${e.id}" d="${path}"></path>
      <path class="${cls}" d="${path}" marker-end="url(#${arrow})" data-edge="${e.id}"></path>
      ${e.cond ? `<text class="wf-canvas-edge-label" x="${lp.x}" y="${lp.y}" text-anchor="middle">${wfdEsc(wfdTrunc(e.cond, 16))}</text>` : ""}
      ${e.isDefault ? `<text class="wf-canvas-edge-label def" x="${lp.x}" y="${lp.y + 12}" text-anchor="middle">默认</text>` : ""}`;
  }).join("");

  const nodes = g.nodes.map(n => {
    const d = wfdDim(n.type);
    const cx = n.x + d.w / 2, cy = n.y + d.h / 2;
    const sel = c.selectedNode === n.id;
    const flash = c.flash === n.id;
    const state = val.nodeState[n.id] || "";
    const cls = "wf-canvas-node " + n.type.toLowerCase()
      + (sel ? " sel" : "") + (flash || state === "bad" ? " bad" : "") + (state === "warn" ? " warn" : "");
    let shape = "";
    if (n.type === "GATEWAY") {
      shape = `<polygon class="shape" points="${cx},${cy - d.h / 2} ${cx + d.w / 2},${cy} ${cx},${cy + d.h / 2} ${cx - d.w / 2},${cy}"></polygon>`;
    } else {
      const rx = (n.type === "START" || n.type === "END") ? d.h / 2 : 8;
      shape = `<rect class="shape" x="${n.x}" y="${n.y}" width="${d.w}" height="${d.h}" rx="${rx}"></rect>`;
    }
    const name = wfdTrunc(n.name || wfdTypeLabel(n.type), n.type === "GATEWAY" ? 7 : 10);
    const anchor = n.type === "END" ? "" : `<circle class="wf-canvas-anchor" cx="${n.x + d.w}" cy="${cy}" r="6" data-anchor="${n.id}"></circle>`;
    return `<g class="${cls}" data-node="${n.id}">
      ${shape}
      <text class="nt" x="${cx}" y="${cy - (n.type === "GATEWAY" ? 0 : -2)}">${wfdEsc(name)}</text>
      <text class="tt" x="${cx}" y="${cy + (n.type === "GATEWAY" ? 18 : 15)}">${wfdTypeLabel(n.type)}</text>
      ${anchor}</g>`;
  }).join("");

  const temp = c.link
    ? `<path class="wf-canvas-temp-link" d="M ${c.link.x1} ${c.link.y1} L ${c.link.x2} ${c.link.y2}"></path>`
    : "";

  /* ---------- 「发起表单」字段卡：挂在 START 节点左侧，直接可见 formSchema 字段 ---------- */
  const formCard = wfdFormCardSvg(g, nodeById);

  svg.innerHTML = `
    <defs>
      <pattern id="wfdGrid" width="22" height="22" patternUnits="userSpaceOnUse">
        <path class="wf-canvas-grid-line" d="M 22 0 L 0 0 0 22"></path>
      </pattern>
      <marker id="wfdArrow" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path class="wf-canvas-arrow" d="M0,0 L0,6 L9,3 z"></path></marker>
      <marker id="wfdArrowSel" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path class="wf-canvas-arrow sel" d="M0,0 L0,6 L9,3 z"></path></marker>
      <marker id="wfdArrowBad" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path class="wf-canvas-arrow bad" d="M0,0 L0,6 L9,3 z"></path></marker>
    </defs>
    <g transform="translate(${c.tx},${c.ty}) scale(${c.k})">
      <rect x="-4000" y="-4000" width="12000" height="12000" fill="url(#wfdGrid)"></rect>
      ${edges}
      ${formCard}
      ${nodes}
      ${temp}
    </g>`;
  wfdBindCanvas();
  wfdUpdateZoomLabel();
  wfdRenderPropertyPanel();
  wfdRenderValidation();
}

/* 计算「发起表单」卡的几何位置（优先挂 START 左侧；左侧空间不足时改挂下方） */
function wfdFormCardGeom(g) {
  const start = g.nodes.find(n => n.type === "START");
  if (!start) return null;
  const sd = wfdDim("START");
  const fields = wfdFormSort();
  const bodyH = Math.max(WFD_FORM_CARD.h, fields.length * WFD_FORM_CARD.h + (fields.length ? WFD_FORM_CARD.gapY * (fields.length - 1) : WFD_FORM_CARD.h));
  const w = WFD_FORM_CARD.w, h = WFD_FORM_CARD.headH + 10 + bodyH;
  const hasLeftRoom = (start.x - WFD_FORM_CARD.gapX - w) > -60;
  const place = hasLeftRoom ? "left" : "below";
  let x, y;
  if (place === "left") {
    x = start.x - WFD_FORM_CARD.gapX - w;
    y = start.y + sd.h / 2 - h / 2;
  } else {
    // 下方挂载：左缘与 START 左缘对齐，避免左溢出；垂直留出箭头间距
    x = start.x;
    y = start.y + sd.h + 56;
  }
  return { x, y, w, h, start, sd, fields, bodyH, place };
}

/* 渲染「发起表单」字段卡 SVG（含与 START 的虚线连接） */
function wfdFormCardSvg(g, nodeById) {
  const c = wfdState.canvas;
  if (!c.showFormCard) return "";
  const geom = wfdFormCardGeom(g);
  if (!geom) return "";
  const { x, y, w, h, start, sd, fields, place } = geom;
  // 连接线：左侧挂载从卡片右缘连到 START 左缘；下方挂载从卡片上缘连到 START 下缘
  let linkPath;
  if (place === "left") {
    const anchorX = x + w, anchorY = y + h / 2;
    const startX = start.x, startY = start.y + sd.h / 2;
    linkPath = `M ${anchorX} ${anchorY} C ${anchorX + 46} ${anchorY}, ${startX - 46} ${startY}, ${startX} ${startY}`;
  } else {
    const anchorX = x + w / 2, anchorY = y;
    const startX = start.x + sd.w / 2, startY = start.y + sd.h;
    linkPath = `M ${anchorX} ${anchorY} C ${anchorX} ${anchorY - 22}, ${startX} ${startY + 22}, ${startX} ${startY}`;
  }
  const link = `<path class="wf-formcard-link" d="${linkPath}" marker-end="url(#wfdArrow)"></path>`;
  const head = `
    <g class="wf-formcard-head" data-formcard="1">
      <rect class="head" x="${x}" y="${y}" width="${w}" height="${WFD_FORM_CARD.headH}" rx="8"></rect>
      <text class="ht" x="${x + 12}" y="${y + WFD_FORM_CARD.headH / 2}">📝 发起表单</text>
      <text class="hc" x="${x + w - 12}" y="${y + WFD_FORM_CARD.headH / 2}" text-anchor="end">${fields.length} 字段</text>
    </g>`;
  if (!fields.length) {
    const emptyY = y + WFD_FORM_CARD.headH + 6;
    return `${link}${head}
      <g class="wf-formcard" data-formcard="1">
        <rect class="body" x="${x}" y="${y + WFD_FORM_CARD.headH}" width="${w}" height="${h - WFD_FORM_CARD.headH}" rx="8"></rect>
        <text class="fe" x="${x + w / 2}" y="${emptyY + 20}" text-anchor="middle">暂无字段，点击「配置发起表单」添加</text>
      </g>`;
  }
  const rows = fields.map((f, i) => {
    const ry = y + WFD_FORM_CARD.headH + 8 + i * (WFD_FORM_CARD.h + WFD_FORM_CARD.gapY);
    const req = f.required ? `<text class="fr" x="${x + 12}" y="${ry + WFD_FORM_CARD.h / 2}">*</text>` : "";
    const labelX = x + (f.required ? 24 : 12);
    const typeLabel = (typeof wfFieldTypeLabel === "function" ? wfFieldTypeLabel(f.type) : f.type);
    return `<g class="wf-formcard-row" data-formcard="1" data-formfield="${wfdEsc(f.key)}">
      <rect class="row" x="${x + 8}" y="${ry}" width="${w - 16}" height="${WFD_FORM_CARD.h}" rx="5"></rect>
      ${req}
      <text class="fl" x="${labelX}" y="${ry + WFD_FORM_CARD.h / 2}">${wfdEsc(wfdTrunc(f.label || f.key, 9))}</text>
      <text class="ft" x="${x + w - 12}" y="${ry + WFD_FORM_CARD.h / 2}" text-anchor="end">${wfdEsc(typeLabel)}</text>
    </g>`;
  }).join("");
  return `${link}${head}
    <g class="wf-formcard" data-formcard="1">
      <rect class="body" x="${x}" y="${y + WFD_FORM_CARD.headH}" width="${w}" height="${h - WFD_FORM_CARD.headH}" rx="8"></rect>
      ${rows}
    </g>`;
}

/* ---------- 事件绑定 ---------- */
function wfdBindCanvas() {
  const svg = document.getElementById("wfdSvg");
  if (!svg) return;
  svg.querySelectorAll("[data-node]").forEach(elm => {
    const id = elm.getAttribute("data-node");
    elm.addEventListener("mousedown", e => wfdNodeDown(e, id));
    elm.addEventListener("dblclick", e => { e.stopPropagation(); wfdRenameNode(id); });
  });
  svg.querySelectorAll("[data-anchor]").forEach(elm => {
    elm.addEventListener("mousedown", e => wfdLinkDown(e, elm.getAttribute("data-anchor")));
  });
  svg.querySelectorAll("[data-edge-hit]").forEach(elm => {
    elm.addEventListener("mousedown", e => { e.stopPropagation(); wfdSelectEdge(elm.getAttribute("data-edge-hit")); });
  });
  svg.querySelectorAll("[data-formcard]").forEach(elm => {
    elm.addEventListener("mousedown", e => { e.stopPropagation(); });
    elm.addEventListener("click", e => { e.stopPropagation(); wfdGotoFormEditor(); });
  });
  svg.onmousedown = wfdSvgDown;
  if (!svg._wheelBound) { svg._wheelBound = true; svg.addEventListener("wheel", wfdWheel, { passive: false }); }
}

/* ---------- 节点拖拽 ---------- */
function wfdNodeDown(e, id) {
  if (wfdState.canvas.link) return;
  e.stopPropagation();
  const g = wfdGraph();
  const n = g.nodes.find(x => x.id === id);
  if (!n) return;
  const c = wfdState.canvas;
  c.selectedNode = id;
  c.selectedEdge = null;
  const p = wfdToWorld(e.clientX, e.clientY);
  c.drag = { id, offX: p.x - n.x, offY: p.y - n.y };
  document.addEventListener("mousemove", wfdNodeMove);
  document.addEventListener("mouseup", wfdNodeUp);
  wfdDrawCanvas();
  e.preventDefault();
}
function wfdNodeMove(e) {
  const c = wfdState.canvas;
  if (!c.drag) return;
  const g = wfdGraph();
  const n = g.nodes.find(x => x.id === c.drag.id);
  if (!n) return;
  const p = wfdToWorld(e.clientX, e.clientY);
  n.x = Math.round(p.x - c.drag.offX);
  n.y = Math.round(p.y - c.drag.offY);
  wfdDrawCanvas();
  e.preventDefault();
}
function wfdNodeUp() {
  wfdState.canvas.drag = null;
  document.removeEventListener("mousemove", wfdNodeMove);
  document.removeEventListener("mouseup", wfdNodeUp);
  wfdSyncToList();
  wfdRenderPropertyPanel();
}

/* ---------- 空白平移 / 取消选中 ---------- */
function wfdSvgDown(e) {
  const c = wfdState.canvas;
  c.selectedNode = null;
  c.selectedEdge = null;
  c.pan = { sx: e.clientX, sy: e.clientY, otx: c.tx, oty: c.ty };
  document.addEventListener("mousemove", wfdPanMove);
  document.addEventListener("mouseup", wfdPanUp);
  wfdDrawCanvas();
  e.preventDefault();
}
function wfdPanMove(e) {
  const c = wfdState.canvas;
  if (!c.pan) return;
  c.tx = c.pan.otx + (e.clientX - c.pan.sx);
  c.ty = c.pan.oty + (e.clientY - c.pan.sy);
  wfdDrawCanvas();
}
function wfdPanUp() {
  wfdState.canvas.pan = null;
  document.removeEventListener("mousemove", wfdPanMove);
  document.removeEventListener("mouseup", wfdPanUp);
}

/* ---------- 锚点连线 ---------- */
function wfdLinkDown(e, fromId) {
  e.stopPropagation();
  e.preventDefault();
  const g = wfdGraph();
  const n = g.nodes.find(x => x.id === fromId);
  if (!n) return;
  if (n.type === "END") { msg("error", "END 节点不能有出边（流程终点）"); return; }
  const d = wfdDim(n.type);
  wfdState.canvas.link = { from: fromId, x1: n.x + d.w, y1: n.y + d.h / 2, x2: n.x + d.w, y2: n.y + d.h / 2 };
  document.addEventListener("mousemove", wfdLinkMove);
  document.addEventListener("mouseup", wfdLinkUp);
  wfdDrawCanvas();
}
function wfdLinkMove(e) {
  const c = wfdState.canvas;
  if (!c.link) return;
  const p = wfdToWorld(e.clientX, e.clientY);
  c.link.x2 = p.x; c.link.y2 = p.y;
  wfdDrawCanvas();
  e.preventDefault();
}
function wfdLinkUp(e) {
  const c = wfdState.canvas;
  if (!c.link) return;
  const from = c.link.from;
  c.link = null;
  document.removeEventListener("mousemove", wfdLinkMove);
  document.removeEventListener("mouseup", wfdLinkUp);
  const p = wfdToWorld(e.clientX, e.clientY);
  const target = wfdHitNode(wfdGraph(), p.x, p.y);
  if (target) wfdTryConnect(from, target.id);
  else wfdDrawCanvas();
}
function wfdTryConnect(from, to) {
  const g = wfdGraph();
  const fn = g.nodes.find(n => n.id === from), tn = g.nodes.find(n => n.id === to);
  if (!fn || !tn) return;
  const reject = m => { msg("error", m); wfdFlashBad(from); wfdDrawCanvas(); };
  if (from === to) return reject("禁止自连接（节点不能连到自身）");
  if (fn.type === "END") return reject("END 节点不能有出边（流程终点）");
  if (tn.type === "START") return reject("不能连接到 START 节点（流程起点）");
  if (g.edges.some(e => e.from === from && e.to === to)) return reject("已存在相同的连线");
  const inDeg = g.edges.filter(e => e.to === to).length;
  if (inDeg >= 1) {
    if (tn.type === "APPROVAL") return reject("V1.0 不支持并行汇聚（审批节点入边最多 1 条），请改用条件分支");
    if (tn.type === "GATEWAY") return reject("GATEWAY 节点入边只允许 1 条");
    return reject("V1.0 不支持并行汇聚（目标节点入边最多 1 条）");
  }
  if (wfdReachable(g, to, from)) return reject("不允许形成环路（有向无环图）");
  g.edges.push({ id: wfdUid("e"), from, to, cond: "", isDefault: false });
  wfdState.canvas.selectedNode = null;
  wfdState.canvas.selectedEdge = null;
  wfdSyncToList();
  wfdDrawCanvas();
  msg("success", "已建立连线（可在右侧编辑条件 / 设为默认分支）");
}
function wfdFlashBad(id) {
  const c = wfdState.canvas;
  c.flash = id;
  setTimeout(() => { if (c.flash === id) { c.flash = null; wfdDrawCanvas(); } }, 600);
}

/* ---------- 选中 ---------- */
function wfdSelectNode(id) { wfdState.canvas.selectedNode = id; wfdState.canvas.selectedEdge = null; wfdDrawCanvas(); }
function wfdSelectEdge(id) { wfdState.canvas.selectedEdge = id; wfdState.canvas.selectedNode = null; wfdDrawCanvas(); }

/* ---------- 增删改 ---------- */
function wfdDefaultName(type, n) {
  return { START: "开始", END: "结束", GATEWAY: "条件网关" + (n > 1 ? n : ""), APPROVAL: "审批节点" + n }[type] || "节点";
}
function wfdPaletteDrag(e, type) {
  e.dataTransfer.setData("text/plain", type);
  e.dataTransfer.effectAllowed = "copy";
}
function wfdDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }
function wfdDrop(e) {
  e.preventDefault();
  const type = e.dataTransfer.getData("text/plain") || "APPROVAL";
  wfdAddNodeAt(type, wfdToWorld(e.clientX, e.clientY));
}
function wfdAddNodeAt(type, p) {
  const g = wfdGraph();
  if (type === "START" && g.nodes.some(n => n.type === "START")) { msg("error", "开始节点已存在（流程必须有且仅有 1 个 START）"); return; }
  if (type === "END" && g.nodes.some(n => n.type === "END")) { msg("error", "结束节点已存在（流程必须有且仅有 1 个 END）"); return; }
  const d = wfdDim(type);
  const x = p ? Math.round(p.x - d.w / 2) : Math.round(300 + (g.nodes.length % 3) * 60);
  const y = p ? Math.round(p.y - d.h / 2) : Math.round(120 + (g.nodes.length % 4) * 70);
  const count = g.nodes.filter(n => n.type === type).length + 1;
  const node = {
    id: wfdUid(type.toLowerCase()), type, name: wfdDefaultName(type, count), x, y,
    assigneeType: type === "APPROVAL" ? "组织" : "", signMode: type === "APPROVAL" ? "单人" : ""
  };
  g.nodes.push(node);
  wfdState.canvas.selectedNode = node.id;
  wfdState.canvas.selectedEdge = null;
  wfdSyncToList();
  wfdDrawCanvas();
  msg("success", `已添加${wfdTypeLabel(type)}节点「${node.name}」`);
}
function wfdDeleteSelected() {
  const c = wfdState.canvas, g = wfdGraph();
  if (c.selectedEdge) {
    g.edges = g.edges.filter(e => e.id !== c.selectedEdge);
    c.selectedEdge = null;
    wfdSyncToList(); wfdDrawCanvas();
    msg("success", "已删除选中的连线");
    return;
  }
  if (c.selectedNode) {
    const n = g.nodes.find(x => x.id === c.selectedNode);
    if (!n) { c.selectedNode = null; wfdDrawCanvas(); return; }
    if (n.type === "START" || n.type === "END") { msg("error", `${wfdTypeLabel(n.type)}节点为流程必需节点，不可删除`); return; }
    const removed = g.edges.filter(e => e.from === n.id || e.to === n.id).length;
    g.edges = g.edges.filter(e => e.from !== n.id && e.to !== n.id);
    g.nodes = g.nodes.filter(x => x.id !== c.selectedNode);
    c.selectedNode = null;
    wfdSyncToList(); wfdDrawCanvas();
    msg("success", `已删除节点「${n.name}」及其 ${removed} 条关联边`);
    return;
  }
  msg("info", "请先选中一个节点或连线");
}
function wfdRenameNode(id) {
  const g = wfdGraph();
  const n = g.nodes.find(x => x.id === id);
  if (!n) return;
  const nv = prompt("重命名节点", n.name);
  if (nv == null) return;
  const t = nv.trim();
  if (!t) { msg("error", "节点名不能为空"); return; }
  n.name = t;
  wfdSyncToList(); wfdDrawCanvas();
  msg("success", "节点已重命名");
}
function wfdPatchNode(id, k, v) {
  const g = wfdGraph(), n = g.nodes.find(x => x.id === id);
  if (!n) return;
  n[k] = v;
  if (k === "name" && !String(v).trim()) msg("error", "节点名不能为空");
  wfdSyncToList(); wfdDrawCanvas();
}
function wfdPatchEdge(id, k, v) {
  const g = wfdGraph(), e = g.edges.find(x => x.id === id);
  if (!e) return;
  e[k] = v;
  wfdSyncToList(); wfdDrawCanvas();
}
function wfdPatchEdgeDefault(id, checked) {
  const g = wfdGraph(), e = g.edges.find(x => x.id === id);
  if (!e) return;
  if (checked) {
    g.edges.filter(x => x.from === e.from).forEach(x => x.isDefault = false);
    e.isDefault = true;
    if (!e.cond) e.cond = "（其他情况）";
    msg("info", "已设为默认分支（同一网关仅 1 条）");
  } else { e.isDefault = false; }
  wfdSyncToList(); wfdDrawCanvas();
}

/* ---------- 自动布局 / 缩放平移 ---------- */
function wfdAutoLayout() {
  const g = wfdGraph();
  if (!g.nodes.length) return;
  const indeg = {}; g.nodes.forEach(n => indeg[n.id] = 0);
  g.edges.forEach(e => { if (indeg[e.to] != null) indeg[e.to]++; });
  const layer = {}; g.nodes.forEach(n => layer[n.id] = 0);
  const adj = {}; g.edges.forEach(e => (adj[e.from] = adj[e.from] || []).push(e.to));
  const indeg2 = Object.assign({}, indeg);
  const q = g.nodes.filter(n => indeg[n.id] === 0).map(n => n.id);
  while (q.length) {
    const cur = q.shift();
    (adj[cur] || []).forEach(x => { layer[x] = Math.max(layer[x], layer[cur] + 1); indeg2[x]--; if (indeg2[x] === 0) q.push(x); });
  }
  const byLayer = {};
  g.nodes.forEach(n => { const L = layer[n.id] || 0; (byLayer[L] = byLayer[L] || []).push(n); });
  const LAY_X = 230, ROW_H = 130, X0 = 60, Y0 = 60;
  Object.keys(byLayer).forEach(L => {
    byLayer[L].forEach((n, i) => {
      n.x = X0 + L * LAY_X;
      n.y = Y0 + i * ROW_H;
    });
  });
  wfdSyncToList();
  wfdDrawCanvas();
  wfdFit();
  msg("success", "已按拓扑层级从左到右自动布局");
}
function wfdZoom(f) {
  const c = wfdState.canvas;
  const svg = document.getElementById("wfdSvg");
  const r = svg ? svg.getBoundingClientRect() : { width: 600, height: 460 };
  const mx = r.width / 2, my = r.height / 2;
  const nk = Math.min(2.5, Math.max(0.4, c.k * f));
  c.tx = mx - (mx - c.tx) * (nk / c.k);
  c.ty = my - (my - c.ty) * (nk / c.k);
  c.k = nk;
  wfdDrawCanvas();
}
function wfdWheel(e) {
  e.preventDefault();
  const c = wfdState.canvas;
  const svg = document.getElementById("wfdSvg");
  const r = svg.getBoundingClientRect();
  const mx = e.clientX - r.left, my = e.clientY - r.top;
  const nk = Math.min(2.5, Math.max(0.4, c.k * (e.deltaY < 0 ? 1.1 : 1 / 1.1)));
  c.tx = mx - (mx - c.tx) * (nk / c.k);
  c.ty = my - (my - c.ty) * (nk / c.k);
  c.k = nk;
  wfdDrawCanvas();
}
function wfdFit() {
  const svg = document.getElementById("wfdSvg");
  if (!svg) return;
  const g = wfdGraph();
  const c = wfdState.canvas;
  const r = svg.getBoundingClientRect();
  const W = r.width || 600, H = r.height || 460;
  if (!g.nodes.length) { c.tx = 20; c.ty = 20; c.k = 1; wfdDrawCanvas(); return; }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  g.nodes.forEach(n => {
    const d = wfdDim(n.type);
    minX = Math.min(minX, n.x); minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + d.w); maxY = Math.max(maxY, n.y + d.h);
  });
  // 把「发起表单」字段卡纳入可视范围，避免适应画布后被裁掉
  const fg = c.showFormCard ? wfdFormCardGeom(g) : null;
  if (fg) {
    minX = Math.min(minX, fg.x); minY = Math.min(minY, fg.y);
    maxX = Math.max(maxX, fg.x + fg.w); maxY = Math.max(maxY, fg.y + fg.h);
  }
  const pad = 44;
  const k = Math.min(2.5, Math.max(0.4, Math.min((W - pad * 2) / Math.max(1, maxX - minX), (H - pad * 2) / Math.max(1, maxY - minY))));
  c.k = k;
  c.tx = (W - (maxX - minX) * k) / 2 - minX * k;
  c.ty = (H - (maxY - minY) * k) / 2 - minY * k;
  wfdDrawCanvas();
}

/* 切换「发起表单」字段卡显隐 */
function wfdToggleFormCard() {
  const c = wfdState.canvas;
  c.showFormCard = !c.showFormCard;
  const btn = document.getElementById("wfdFormCardBtn");
  if (btn) btn.textContent = c.showFormCard ? "📝 隐藏发起表单" : "📝 显示发起表单";
  wfdDrawCanvas();
}
function wfdUpdateZoomLabel() {
  const el = document.getElementById("wfdZoomLabel");
  if (el) el.textContent = "缩放 " + Math.round(wfdState.canvas.k * 100) + "%";
}

/* ---------- 图语义校验（软门禁，与步骤 4 硬校验同一套规则） ---------- */
function wfdKahnCycle(nodes, edges) {
  const indeg = {}; nodes.forEach(n => indeg[n.id] = 0);
  edges.forEach(e => { if (indeg[e.to] != null) indeg[e.to]++; });
  const adj = {}; edges.forEach(e => (adj[e.from] = adj[e.from] || []).push(e.to));
  const q = nodes.filter(n => indeg[n.id] === 0).map(n => n.id);
  let cnt = 0;
  while (q.length) {
    const cur = q.shift();
    cnt++;
    (adj[cur] || []).forEach(x => { indeg[x]--; if (indeg[x] === 0) q.push(x); });
  }
  return cnt < nodes.length; // true=存在环
}
function wfdReachable(g, from, to) {
  if (from === to) return true;
  const adj = {};
  g.edges.forEach(e => (adj[e.from] = adj[e.from] || []).push(e.to));
  const seen = {}, q = [from];
  while (q.length) {
    const cur = q.shift();
    if (cur === to) return true;
    if (seen[cur]) continue;
    seen[cur] = 1;
    (adj[cur] || []).forEach(x => q.push(x));
  }
  return false;
}
function wfdValidateGraph() {
  const g = wfdGraph();
  const nodeState = {}, edgeState = {}, blockers = [], warnings = [];
  const starts = g.nodes.filter(n => n.type === "START");
  const ends = g.nodes.filter(n => n.type === "END");
  if (starts.length !== 1) {
    blockers.push(starts.length === 0 ? "缺少开始节点（START）：流程必须有且仅有 1 个开始节点" : `开始节点（START）只能有 1 个，当前 ${starts.length} 个`);
    starts.forEach(n => nodeState[n.id] = "bad");
  }
  if (ends.length !== 1) {
    blockers.push(ends.length === 0 ? "缺少结束节点（END）：流程必须有且仅有 1 个结束节点" : `结束节点（END）只能有 1 个，当前 ${ends.length} 个`);
    ends.forEach(n => nodeState[n.id] = "bad");
  }
  // 规则 8：流程至少包含 1 个审批节点（空白模板未添加节点时触发；预置模板有审批节点不触发）
  const approvalNodes = g.nodes.filter(n => n.type === "APPROVAL");
  if (approvalNodes.length === 0) blockers.push("流程至少需要 1 个审批节点");
  if (wfdKahnCycle(g.nodes, g.edges)) blockers.push("存在环路：流程必须是有向无环图（DAG）");
  g.nodes.forEach(n => {
    if (n.type === "APPROVAL" || n.type === "GATEWAY") {
      const inDeg = g.edges.filter(e => e.to === n.id).length;
      if (inDeg > 1) { blockers.push(`「${n.name}」：V1.0 不支持并行汇聚，入边最多 1 条（当前 ${inDeg} 条）`); nodeState[n.id] = "bad"; }
    }
  });
  g.nodes.filter(n => n.type === "GATEWAY").forEach(gn => {
    const outs = g.edges.filter(e => e.from === gn.id);
    const defs = outs.filter(e => e.isDefault);
    if (outs.length >= 1 && defs.length === 0) { warnings.push(`「${gn.name}」：条件分支缺少默认分支，存在死锁风险`); nodeState[gn.id] = "bad"; }
    if (defs.length > 1) { warnings.push(`「${gn.name}」：默认分支只能有 1 条（当前 ${defs.length} 条）`); nodeState[gn.id] = "bad"; defs.forEach(e => edgeState[e.id] = "bad"); }
  });
  const start = starts[0];
  const reachable = {};
  if (start) {
    const q = [start.id];
    while (q.length) {
      const cur = q.shift();
      if (reachable[cur]) continue;
      reachable[cur] = 1;
      g.edges.filter(e => e.from === cur).forEach(e => q.push(e.to));
    }
  }
  g.nodes.forEach(n => {
    const inDeg = g.edges.filter(e => e.to === n.id).length;
    const outDeg = g.edges.filter(e => e.from === n.id).length;
    if (inDeg === 0 && outDeg === 0) { warnings.push(`孤立节点「${n.name}」：未接入流程`); nodeState[n.id] = nodeState[n.id] === "bad" ? "bad" : "warn"; }
    else if (start && n.id !== start.id && !reachable[n.id]) { warnings.push(`不可达节点「${n.name}」：从开始节点无法到达`); nodeState[n.id] = nodeState[n.id] === "bad" ? "bad" : "warn"; }
  });
  if (start && ends.length && !reachable[ends[0].id]) warnings.push("断头流程：从 START 无法到达 END");
  return { blockers, warnings, nodeState, edgeState };
}

/* ---------- 校验提示区 / 属性面板渲染 ---------- */
function wfdRenderValidation() {
  const el = document.getElementById("wfdValidate");
  if (!el) return;
  const val = wfdValidateGraph();
  const g = wfdGraph();
  const ok = val.blockers.length === 0;
  const item = (level, text) => `<div class="wf-canvas-vitem ${level}"><span class="dot"></span><span>${wfdEsc(text)}</span></div>`;
  let list = "";
  val.blockers.forEach(t => { list += item("error", t); });
  val.warnings.forEach(t => { list += item("warn", t); });
  if (!list) list = `<div class="wf-canvas-vitem ok"><span class="dot"></span><span>未发现阻断项或警告，画布结构合法</span></div>`;
  el.innerHTML = `
    <div class="wf-canvas-stats">
      <span class="wf-canvas-chip">节点 <b>${g.nodes.length}</b></span>
      <span class="wf-canvas-chip">连线 <b>${g.edges.length}</b></span>
      <span class="wf-canvas-chip ${ok ? "ok" : "err"}">画布校验：${ok ? "通过" : "存在 " + val.blockers.length + " 条阻断项"}</span>
      ${val.warnings.length ? `<span class="wf-canvas-chip warn">警告 ${val.warnings.length} 条</span>` : ""}
    </div>
    <div class="wf-canvas-vlist">${list}</div>`;
}
function wfdRenderPropertyPanel() {
  const el = document.getElementById("wfdProps");
  if (!el) return;
  const c = wfdState.canvas, g = wfdGraph();
  if (c.selectedNode) {
    const n = g.nodes.find(x => x.id === c.selectedNode);
    if (!n) { c.selectedNode = null; el.innerHTML = wfdPropEmpty(g); return; }
    const isAppr = n.type === "APPROVAL";
    const inDeg = g.edges.filter(e => e.to === n.id).length;
    const outDeg = g.edges.filter(e => e.from === n.id).length;
    el.innerHTML = `
      <h5 class="wf-canvas-ptitle">节点属性 · ${wfdTypeLabel(n.type)}</h5>
      <div class="field"><label>节点名称</label><input class="input" value="${wfdEsc(n.name)}" onchange="wfdPatchNode('${n.id}','name',this.value)"></div>
      ${isAppr ? `
      <div class="field"><label>审批人维度</label><select class="select" onchange="wfdPatchNode('${n.id}','assigneeType',this.value)">
        ${["组织", "岗位", "指定人", "上级"].map(o => `<option ${o === n.assigneeType ? "selected" : ""}>${o}</option>`).join("")}</select></div>
      <div class="field"><label>签署方式</label><select class="select" onchange="wfdPatchNode('${n.id}','signMode',this.value)">
        ${["单人", "会签ALL", "或签OR"].map(o => `<option ${o === n.signMode ? "selected" : ""}>${o}</option>`).join("")}</select></div>` : `<div class="fs-12 text-secondary">${n.type === "GATEWAY" ? "条件网关：出边携带条件表达式，须恰有 1 条默认分支。" : "流程" + wfdTypeLabel(n.type) + "节点。"}</div>`}
      <div class="fs-12 text-secondary mt-2">入边 ${inDeg} · 出边 ${outDeg}</div>
      ${n.type === "START" ? `<div class="readonly-banner mt-3" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">📝 开始节点承载<b>发起表单</b>（formSchema）：流程发起时按此渲染填写页。</div>
        <div class="flex gap-2 mt-2"><button class="btn btn-sm btn-primary" onclick="wfdGotoFormEditor()">配置发起表单（${wfdFormFields().length} 字段）</button></div>` : ""}
      <div class="flex gap-2 mt-3">
        <button class="btn btn-sm" onclick="wfdRenameNode('${n.id}')">重命名</button>
        ${(n.type === "START" || n.type === "END") ? "" : `<button class="btn btn-sm" onclick="wfdDeleteSelected()">删除</button>`}
      </div>`;
    return;
  }
  if (c.selectedEdge) {
    const e = g.edges.find(x => x.id === c.selectedEdge);
    if (!e) { c.selectedEdge = null; el.innerHTML = wfdPropEmpty(g); return; }
    const from = g.nodes.find(n => n.id === e.from), to = g.nodes.find(n => n.id === e.to);
    el.innerHTML = `
      <h5 class="wf-canvas-ptitle">连线属性</h5>
      <div class="fs-12 text-secondary mb-2">${from ? wfdEsc(from.name) : "?"} → ${to ? wfdEsc(to.name) : "?"}</div>
      <div class="field"><label>条件表达式</label><input class="input mono" value="${wfdEsc(e.cond || "")}" placeholder="amount > 50000" onchange="wfdPatchEdge('${e.id}','cond',this.value)"></div>
      <label class="flex items-center gap-2 fs-13" style="margin:10px 0;cursor:pointer">
        <input type="checkbox" ${e.isDefault ? "checked" : ""} onchange="wfdPatchEdgeDefault('${e.id}',this.checked)"> 设为默认分支
      </label>
      <div class="fs-12 text-secondary">默认分支：同一网关恰有 1 条；条件无命中时走此分支，避免死锁。</div>
      <div class="flex gap-2 mt-3"><button class="btn btn-sm" onclick="wfdDeleteSelected()">删除连线</button></div>`;
    return;
  }
  el.innerHTML = wfdPropEmpty(g);
}
function wfdPropEmpty(g) {
  const val = wfdValidateGraph();
  return `<h5 class="wf-canvas-ptitle">画布统计</h5>
    <div class="wf-canvas-stat2">
      <div><b>${g.nodes.length}</b><span>节点</span></div>
      <div><b>${g.edges.length}</b><span>连线</span></div>
    </div>
    <div class="fs-12 mt-2 ${val.blockers.length ? "text-danger" : "text-success"}">${val.blockers.length ? "存在 " + val.blockers.length + " 条阻断项" : "画布校验通过"}</div>
    <div class="fs-12 text-secondary mt-3" style="line-height:1.8">· 单击节点 / 连线进行编辑<br>· 双击节点重命名<br>· 从节点右侧圆点拖拽连线<br>· 空白处拖拽平移，滚轮缩放<br>· 选中后按 Delete 删除</div>`;
}

/* ---------- 产出预览：定义 JSON ---------- */
function wfdGraphJson() {
  const g = wfdGraph();
  const nodes = g.nodes.map(n => {
    const o = { key: n.id, type: n.type, name: n.name, position: { x: n.x, y: n.y } };
    if (n.type === "APPROVAL") { o.assignee = { dimension: n.assigneeType || "组织" }; o.signMode = n.signMode || "单人"; }
    return o;
  });
  const edges = g.edges.map(e => {
    const t = g.nodes.find(n => n.id === e.to);
    const o = { id: e.id, from: e.from, to: e.to, toName: t ? t.name : "—" };
    if (e.cond) o.cond = e.cond;
    if (e.isDefault) o.isDefault = true;
    return o;
  });
  // 变量收敛：由 formSchema.fields[].key 派生（替代裸 variables；供步骤 3 条件表达式校验）
  const variables = wfdFormFields().map(f => f.key).filter(Boolean);
  const base = { defKey: "contract_approval", name: "合同审批流", version: 3, launchMode: wfdState.launchMode || "form", variables, nodes, edges };
  if (wfdState.launchMode === "external") {
    base.fillUrl = wfdState.fillUrl || "";
    base.viewUrl = wfdState.viewUrl || "";
  } else {
    base.formSchema = wfdState.formSchema;
  }
  return base;
}
function wfdShowJson() {
  const json = JSON.stringify(wfdGraphJson(), null, 2);
  showDrawer("画布定义 JSON（FlowGraphDef）", `
    <div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
      🧩 <b>画布所见 = JSON 定义</b>：<code>nodes</code>（type / name / assignee / signMode / position）+ <code>edges</code>（from / to / cond / isDefault）+ <code>formSchema</code>（发起表单定义）。<code>variables</code> 由 <code>formSchema.fields[].key</code> 派生。修改画布后关闭并重新打开本面板即可看到同步结果；该定义可转译为 BPMN 2.0 XML。
    </div>
    <pre class="wf-canvas-json">${wfdEsc(json)}</pre>`);
}

/* ---------- 步骤 4：画布校验汇总行（不改动既有规则编号与语义） ---------- */
function wfdStep4CanvasSummary() {
  if (!wfdState.graph) return "";
  const val = wfdValidateGraph();
  const ok = val.blockers.length === 0;
  const color = ok ? "success" : "danger";
  return `<div class="readonly-banner mb-3" style="background:var(--bmp-color-${color}-light);border-color:var(--bmp-color-${color});color:var(--bmp-color-${color})">
    ⬡ 画布校验（软门禁）：${ok ? "无阻断项" : `存在 ${val.blockers.length} 条阻断项 —— ${wfdEsc(val.blockers[0])}`}${val.warnings.length ? `；${val.warnings.length} 条警告` : ""}。以下 8 条为<b>发布硬校验</b>（规则编号与语义不变）。
  </div>`;
}

/* ---------- UI-WF-03 审批矩阵管理（C1-F02-1~F02-3） ---------- */
PAGES["workflow-matrix"] = {
  crumb: ["流程与表单", "审批矩阵管理"],
  stats() {
    return `<div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
      ⚖ 矩阵变更<b>不影响运行实例</b>（C1-F02）· 审批人解析顺序：<b>节点指定人 → 岗位/角色 → 组织矩阵</b> · 解析失败回退<b>兜底审批人</b>并触发解析失败告警（C1-F02-3）
    </div>`;
  },
  filters: [
    { label: "维度", type: "select", opts: ["组织", "岗位", "金额"] },
    { label: "状态", type: "select", opts: ["启用", "停用"] },
    { label: "关键词", ph: "规则编码 / 名称" }
  ],
  toolbar: [{ text: "＋ 新建规则", primary: true, action: "wfMatrixNew()" }],
  rowKey: "code",
  rows: () => MOCK.workflow.matrixRules,
  cols: [
    { t: "规则编码", k: "code", render: v => `<span class="mono">${v}</span>` },
    { t: "规则名称", k: "name", render: v => `<b>${v}</b>` },
    { t: "维度", k: "dimension", render: v => `<span class="tag tag-primary">${v}</span>` },
    { t: "匹配条件", k: "match" },
    { t: "解析规则", k: "resolver" },
    { t: "优先级", k: "priority" },
    { t: "状态", k: "status", render: v => statusTag(v, { "启用": "success", "停用": "info" }) },
    { t: "操作", ops: r => [`<button class="btn-text" onclick="wfMatrixEdit('${r.code}')">编辑规则</button>`] }
  ],
  note: "规则按 priority 升序匹配，命中即停；同一维度可配多条；规则保存即生效（不影响运行实例）"
};

/* ---------- UI-WF-04 流程实例监控（C1-F07 / C1-F08） ---------- */
PAGES["workflow-instances"] = {
  crumb: ["流程与表单", "流程实例监控"],
  filters: [
    { label: "来源系统", type: "select", opts: ["中台", "CRM", "OA", "招聘系统"] },
    { label: "状态", type: "select", opts: ["运行中", "已通过", "已驳回", "已撤回", "已终止"] },
    { label: "发起时间", ph: "yyyy-MM-dd ~ yyyy-MM-dd" },
    { label: "业务键 bizKey", ph: "sourceSystem:bizType:bizId" }
  ],
  rowKey: "instanceId",
  rows: () => MOCK.workflow.instances,
  cols: [
    { t: "实例 ID", k: "instanceId", render: v => `<span class="mono">${v}</span>` },
    { t: "bizKey", k: "bizKey", render: v => `<span class="mono">${v}</span>` },
    { t: "来源系统", k: "sourceSystem", render: v => `<span class="tag tag-info">${v}</span>` },
    { t: "标题", k: "title" },
    { t: "当前节点", k: "currentNode" },
    { t: "状态", k: "status", render: v => statusTag({ RUNNING: "运行中", APPROVED: "已通过", REJECTED: "已驳回", WITHDRAWN: "已撤回", TERMINATED: "已终止" }[v], { "运行中": "warning", "已通过": "success", "已驳回": "danger", "已撤回": "info", "已终止": "danger" }) },
    { t: "发起人", k: "initiator" },
    { t: "发起时间", k: "startTime", render: v => `<span class="mono">${v}</span>` },
    { t: "耗时", k: "duration" },
    { t: "操作", ops: r => [
      `<button class="btn-text" onclick="wfInstanceDetail('${r.instanceId}')">详情</button>`,
      (r.status === "RUNNING" ? `<button class="btn-text danger" onclick="wfTerminate('${r.instanceId}')">终止</button>` : "")
    ] }
  ],
  note: "实例 bizKey 全局唯一（幂等键）· 状态枚举 {RUNNING, APPROVED, REJECTED, WITHDRAWN, TERMINATED} · 审批留痕仅追加不可篡改（C1-F08）"
};

/* ---------- UI-WF-05 委托代理管理（C1-F04-1/F04-2） ---------- */
PAGES["workflow-delegate"] = {
  crumb: ["流程与表单", "委托代理管理"],
  stats() {
    return `<div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
      🔁 代理期内委托人收到的新任务<b>自动路由至代理人</b>，记录实际处理人（proxy_flag）；委托人与代理人均可见；<b>到期自动失效</b>（C1-F04）
    </div>`;
  },
  filters: [
    { label: "状态", type: "select", opts: ["生效中", "已失效"] },
    { label: "关键词", ph: "委托人 / 代理人" }
  ],
  toolbar: [{ text: "＋ 新建委托", primary: true, action: "wfNewDelegate()" }],
  rowKey: "id",
  rows: () => MOCK.workflow.delegates,
  cols: [
    { t: "委托编号", k: "id", render: v => `<span class="mono">${v}</span>` },
    { t: "委托人", k: "principal" },
    { t: "代理人", k: "delegate" },
    { t: "代理期", k: "startTime", render: (v, r) => `<span class="mono">${r.startTime} ~ ${r.endTime}</span>` },
    { t: "事由", k: "reason" },
    { t: "状态", k: "status", render: v => statusTag(v, { "生效中": "success", "已失效": "info" }) },
    { t: "操作", ops: r => [
      `<button class="btn-text" onclick="wfDelegateDetail('${r.id}')">详情</button>`,
      (r.status === "生效中" ? `<button class="btn-text danger" onclick="wfEndDelegate('${r.id}','${r.principal}','${r.delegate}')">终止委托</button>` : "")
    ] }
  ],
  note: "起止时间必填 · 代理期内原审批人任务全部路由至代理人 · 停用即时生效（C1-F04-1）"
};

/* ============================================================
   UI-C-12 公告管理 · Banner 展示增强
   页面内局部维护 bannerConfig 映射（不改动 mock.js）：
     bannerConfig[noticeId] = { show:boolean, from:string, to:string, priority:number }
   说明：置顶（MOCK.notices.top）优先于普通公告；同级别内按 priority 升序展示。
   ============================================================ */
function defaultBannerConfig() {
  return {
    1: { show: true, from: "2026-09-22", to: "2026-10-07", priority: 1 },
    2: { show: true, from: "2026-09-20", to: "2026-09-30", priority: 5 },
    3: { show: false, from: "", to: "", priority: 10 }
  };
}
var bannerConfig = defaultBannerConfig();

/* 取某公告的 Banner 配置（无则就地初始化一条关闭态记录并返回） */
function bannerGet(id) {
  if (!bannerConfig[id]) bannerConfig[id] = { show: false, from: "", to: "", priority: 10 };
  return bannerConfig[id];
}

/* 统计"Banner 展示中"的公告数（供顶部统计与规范说明使用） */
function bannerCount() {
  return MOCK.notices.filter(n => bannerGet(n.id).show).length;
}

/* Banner 展示优先级排序：置顶优先，其次按 priority 升序、发布时间新者优先 */
function bannerSorted() {
  return MOCK.notices.slice().sort((a, b) => {
    if (!!a.top !== !!b.top) return a.top ? -1 : 1;
    const pa = bannerGet(a.id).priority, pb = bannerGet(b.id).priority;
    if (pa !== pb) return pa - pb;
    return String(b.time).localeCompare(String(a.time));
  });
}

/* 顶部工具栏入口：Banner 设置规范说明抽屉 */
function bannerSpec() {
  const list = bannerSorted();
  showDrawer("Banner 设置规范", `
    <div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
      📢 首页 Banner <b>有已发布且未过期的公告才显示</b>；<b>无则不占位</b>（不渲染空横条）。当前展示中 <b>${bannerCount()}</b> 条。
    </div>
    <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:20px 0 12px">展示优先级规则</h4>
    <div class="card fs-13 text-secondary" style="line-height:2">
      ① <b style="color:var(--bmp-text-title)">置顶（top）优先</b>于普通公告；<br>
      ② 同级别内按「<b style="color:var(--bmp-text-title)">Banner 优先级</b>」升序（数值越小越靠前）；<br>
      ③ 优先级相同时，<b style="color:var(--bmp-text-title)">发布时间较新者</b>在前；<br>
      ④ 仅「是否在 Banner 展示」为开、且当前时间落在展示时段内的公告进入 Banner 轮播。
    </div>
    <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:20px 0 12px">当前排序预览</h4>
    <div class="table-wrap"><table class="tbl">
      <tr><th>顺序</th><th>标题</th><th>置顶</th><th>Banner</th><th>优先级</th><th>时段</th></tr>
      ${list.map((n, i) => {
        const c = bannerGet(n.id);
        return `<tr>
          <td>${i + 1}</td>
          <td>${n.title}</td>
          <td>${n.top ? '<span class="tag tag-primary">置顶</span>' : '<span class="fs-12 text-secondary">—</span>'}</td>
          <td>${statusTag(c.show ? "展示中" : "未展示", { "展示中": "primary", "未展示": "info" })}</td>
          <td class="mono">${c.priority}</td>
          <td class="mono fs-12">${c.from && c.to ? c.from + " ~ " + c.to : "—"}</td>
        </tr>`;
      }).join("")}
    </table></div>`);
}

/* 行内操作：Banner 设置抽屉（开关 / 时段 / 优先级 / 预览） */
function bannerOpen(id) {
  const n = MOCK.notices.find(x => x.id === id);
  if (!n) return;
  const c = bannerGet(id);
  showDrawer("Banner 设置 · 公告 #" + id, `
    <div class="field">
      <label>公告标题</label>
      <div class="card fs-13" style="color:var(--bmp-text-title)">${n.top ? '<span class="tag tag-primary" style="margin-right:6px">置顶</span>' : ""}${n.title}</div>
    </div>
    <div class="field">
      <label>是否在 Banner 展示</label>
      <div class="flex items-center gap-3">
        <span id="bnSwitch" onclick="bannerToggle(${id})" style="position:relative;width:40px;height:22px;border-radius:11px;display:inline-block;cursor:pointer;transition:background .18s;background:${c.show ? "var(--bmp-color-primary)" : "var(--bmp-border-strong)"}">
          <span id="bnKnob" style="position:absolute;top:2px;left:${c.show ? "20px" : "2px"};width:18px;height:18px;background:#fff;border-radius:50%;box-shadow:var(--bmp-shadow-1);transition:left .18s"></span>
        </span>
        <span class="fs-13 text-secondary" id="bnSwitchLabel">${c.show ? "开启：首页 Banner 轮播将展示该公告" : "关闭：不在首页 Banner 展示"}</span>
      </div>
      <div class="tip">关闭后该公告仅出现在「消息中心」，不进入首页顶部 Banner</div>
    </div>
    <div class="field" style="display:flex;gap:12px">
      <div style="flex:1"><label><span class="req">*</span>展示开始</label><input class="input" type="date" id="bnFrom" value="${c.from || ""}"></div>
      <div style="flex:1"><label><span class="req">*</span>展示结束</label><input class="input" type="date" id="bnTo" value="${c.to || ""}"></div>
    </div>
    <div class="field">
      <label>Banner 优先级</label>
      <input class="input" type="number" id="bnPriority" value="${c.priority}" min="1">
      <div class="tip">数值越小越靠前；<b>置顶公告优先于普通公告</b>，同级别内按本优先级排序，相同则新发布者靠前</div>
    </div>

    <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:20px 0 12px">Banner 预览（首页顶部效果 · Notion 风格）</h4>
    <div id="bnPreviewWrap">${bannerPreviewHtml(n, c)}</div>

    <div class="flex gap-2 mt-4">
      <button class="btn btn-primary" onclick="bannerSave(${id})">保存设置</button>
      <button class="btn" onclick="closeDrawer('d-generic')">取消</button>
    </div>`);
}

/* Banner 预览 HTML（Notion 暖白 + 细边框 + 麓邦红强调） */
function bannerPreviewHtml(n, c) {
  if (!c.show) {
    return `<div class="fs-13 text-secondary" style="padding:14px 16px;border:1px dashed var(--bmp-border-strong);border-radius:8px;background:#f6f5f4;text-align:center">
      （该公告未开启 Banner 展示，首页不显示此条）</div>`;
  }
  const type = n.top ? "紧急" : "通知";
  // 紧急 → 品牌红（UIUX §2.1 第 3 条逐字点名「Banner 紧急标签」）；通知 → 主色
  const tagBg = n.top ? "var(--bmp-color-primary-light)" : "var(--bmp-color-primary-light)";
  const tagFg = n.top ? "var(--accent)" : "var(--bmp-color-primary)";
  return `<div style="background:#f6f5f4;border:1px solid rgba(0,0,0,.1);border-radius:8px;padding:12px 16px;display:flex;align-items:center;gap:12px">
    <span style="flex:none;font-size:16px">📢</span>
    <span style="flex:none;font-size:12px;font-weight:600;padding:2px 8px;border-radius:9999px;background:${tagBg};color:${tagFg}">${type}</span>
    <span style="flex:1;min-width:0;font-size:14px;color:rgba(0,0,0,.95);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${n.title}</span>
    <span style="flex:none;font-size:12px;color:#a39e98">${n.time}</span>
    <span style="flex:none;font-size:13px;font-weight:600;color:var(--bmp-color-primary);cursor:pointer">查看详情 →</span>
  </div>
  <div class="fs-12 text-secondary mt-2">🔎 预览为首页顶部 Banner 单条样式；多条时循环轮播（${c.from || "—"} ~ ${c.to || "—"}）</div>`;
}

/* 抽屉内切换开关（即时更新预览） */
function bannerToggle(id) {
  const c = bannerGet(id);
  c.show = !c.show;
  const sw = document.getElementById("bnSwitch");
  const knob = document.getElementById("bnKnob");
  const lb = document.getElementById("bnSwitchLabel");
  if (sw) sw.style.background = c.show ? "var(--bmp-color-primary)" : "var(--bmp-border-strong)";
  if (knob) knob.style.left = c.show ? "20px" : "2px";
  if (lb) lb.textContent = c.show ? "开启：首页 Banner 轮播将展示该公告" : "关闭：不在首页 Banner 展示";
  const n = MOCK.notices.find(x => x.id === id);
  const wrap = document.getElementById("bnPreviewWrap");
  if (n && wrap) wrap.innerHTML = bannerPreviewHtml(n, c);
}

/* 抽屉内保存：写回 bannerConfig 并刷新列表统计 */
function bannerSave(id) {
  const c = bannerGet(id);
  const from = (document.getElementById("bnFrom") || {}).value || "";
  const to = (document.getElementById("bnTo") || {}).value || "";
  const priority = parseInt((document.getElementById("bnPriority") || {}).value, 10);
  if (c.show && (!from || !to)) { msg("error", "开启 Banner 展示时，展示起止时间必填"); return; }
  if (c.show && from && to && from > to) { msg("error", "展示结束时间不能早于开始时间"); return; }
  c.from = from; c.to = to;
  c.priority = isNaN(priority) ? 10 : priority;
  bannerConfig[id] = c;
  closeDrawer("d-generic");
  document.getElementById("pageRoot").innerHTML = renderListPage(PAGES["notices-admin"]);
  msg("success", `公告 #${id} 的 Banner 设置已保存（Banner 展示中 ${bannerCount()} 条）`);
}

/* ============================================================
   应用运营看板（UI-C-17 · A1-F09 · V1.5，与 A1-F05 埋点同批）
   ------------------------------------------------------------
   数据来源：行为埋点 POST /v1/portal/behavior（A1-F05）按日聚合。
   ★ 与 E2 审计日志严格分离：审计=合规留痕（≥6 个月不可篡改）；
     本看板=产品分析（可聚合、会过期、仅统计）。
   ★ 仅统计「应用级行为聚合」，不做跨人画像、不展示员工个人明细。
   数据全部在 pages-config.js 内局部定义（不改 assets/mock.js）。
   零依赖：趋势图 = 内联 SVG 折线 + 面积；分布 = 纯 CSS 横向进度条。
   ============================================================ */

/* 看板数据（局部定义，原型演示值） */
var _APP_ANALYTICS = {
  kpi: { totalApps: 12, activeApps: 11, calls: 288200, callsMom: 9.4, abnormal: 2 },
  /* 近 30 天每日调用量（单位：次） */
  trend: [
    8200, 8450, 9100, 9800, 10200, 7600, 5200,
    9600, 10100, 10400, 9900, 10600, 7200, 5100,
    10900, 11200, 10800, 11500, 11900, 7800, 5600,
    12100, 11700, 12400, 12800, 13100, 8200, 5900,
    12600, 12200
  ],
  /* 活跃应用排名（近 30 天） */
  ranking: [
    { name: "CRM 客户管理", group: "业务系统", calls: 58200, mom: 6.2, users: 412 },
    { name: "OA 办公", group: "业务系统", calls: 51400, mom: -4.1, users: 486 },
    { name: "招聘系统", group: "业务系统", calls: 34600, mom: 12.8, users: 178 },
    { name: "费用报销", group: "业务系统", calls: 28100, mom: 3.4, users: 391 },
    { name: "目标管理", group: "业务系统", calls: 22400, mom: -2.2, users: 246 },
    { name: "项目管理", group: "业务系统", calls: 19800, mom: -38.5, users: 132 },
    { name: "知识库", group: "协作平台", calls: 15200, mom: 9.1, users: 308 },
    { name: "数据报表", group: "协作平台", calls: 9600, mom: -41.7, users: 97 }
  ],
  /* 中台能力使用分布：pct = 启用应用数 / 接入应用总数（覆盖率） */
  capabilities: [
    { name: "SSO 单点登录", icon: "🔐", apps: 12, calls: 120400, pct: 100 },
    { name: "权限校验", icon: "🔑", apps: 11, calls: 84200, pct: 92 },
    { name: "待办推送", icon: "✅", apps: 9, calls: 38600, pct: 75 },
    { name: "消息推送", icon: "✉", apps: 8, calls: 21400, pct: 67 },
    { name: "文件服务", icon: "📎", apps: 5, calls: 9800, pct: 42 },
    { name: "工作流引擎", icon: "🧭", apps: 4, calls: 13200, pct: 33 },
    { name: "通知 Banner", icon: "📢", apps: 1, calls: 600, pct: 8 }
  ],
  /* 异常告警：环比下降 > 30% 触发 */
  alerts: [
    { app: "数据报表", reason: "近 7 天调用量环比下降，疑似接入异常（埋点上报中断）", mom: -41.7, level: "danger" },
    { app: "项目管理", reason: "近 7 天调用量环比下降，疑似接入异常（用户活跃流失）", mom: -38.5, level: "danger" },
    { app: "OA 办公", reason: "调用量小幅波动，观察中", mom: -4.1, level: "warning" }
  ]
};

/* 环比标签：运营指标用语义色表达好坏（升=success 绿，降=danger 红） */
function aaMom(v) {
  const up = v >= 0;
  const color = up ? "var(--bmp-color-success)" : "var(--bmp-color-danger)";
  return `<span style="color:${color};font-weight:600">${up ? "▲" : "▼"} ${Math.abs(v).toFixed(1)}%</span>`;
}
function aaSum(arr) { return arr.reduce((s, v) => s + v, 0); }

/* 趋势图：内联 SVG 折线 + 面积（零依赖，Token 着色） */
function aaTrendSvg(arr) {
  const w = 660, h = 150, pad = 12;
  const max = Math.max.apply(null, arr) * 1.15;
  const n = arr.length;
  const x = i => pad + (w - pad * 2) * (i / (n - 1));
  const y = v => h - pad - (h - pad * 2) * (v / max);
  const pts = arr.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
  const area = `${pts.join(" ")} ${x(n - 1).toFixed(1)},${h} ${x(0).toFixed(1)},${h}`;
  // 4 条水平网格线
  const grids = [0.25, 0.5, 0.75, 1].map(f => {
    const gy = (h - pad - (h - pad * 2) * f).toFixed(1);
    return `<line x1="${pad}" y1="${gy}" x2="${w - pad}" y2="${gy}" stroke="var(--line-color)" stroke-width="1"/>`;
  }).join("");
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="display:block;width:100%;height:${h}px">
    <defs><linearGradient id="aa-trend-g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--accent)" stop-opacity=".22"/>
      <stop offset="1" stop-color="var(--accent)" stop-opacity="0"/>
    </linearGradient></defs>
    ${grids}
    <polygon points="${area}" fill="url(#aa-trend-g)"/>
    <polyline points="${pts.join(" ")}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>`;
}

/* 无数据态：埋点未就绪 / 数据不足时的明确引导（不留空白图表） */
/** 运营总览看板 · 单页（平台运维 KPI + 门户运营图表，无 Tab / 无长 Checklist） */
function renderDashboardBody() {
  const empty = !!window._aaEmpty;
  const d = _APP_ANALYTICS;
  const kpi = d.kpi;

  /* 运营总览 · 单行 5 KPI（UI-C-17 / UIUX 6.4 核心指标） */
  const stats = `<div class="stat-cards" style="grid-template-columns:repeat(5,minmax(0,1fr))">
    <div class="stat-card"><div class="lb">接入应用</div><div class="vl">${empty ? "—" : kpi.totalApps}<small>个（含协作平台）</small></div></div>
    <div class="stat-card"><div class="lb">近 30 天活跃应用</div><div class="vl">${empty ? "—" : kpi.activeApps}<small>个（有行为上报）</small></div></div>
    <div class="stat-card"><div class="lb">在线会话</div><div class="vl">128<small>峰值 342（今日 09:30）</small></div></div>
    <div class="stat-card"><div class="lb">本月中台能力调用</div><div class="vl">${empty ? "—" : kpi.calls.toLocaleString()}<small>次</small></div></div>
    <div class="stat-card"><div class="lb">今日待办推送</div><div class="vl">1,024<small>成功率 99.8%</small></div></div>
  </div>`;

  return `${stats}${renderAppAnalyticsOpsSection(empty, d)}`;
}

/** UI-C-17 · A1-F09 门户运营图表区（指标卡由 renderDashboardBody 统一展示） */
function renderAppAnalyticsOpsSection(empty, d) {
  d = d || _APP_ANALYTICS;
  const momTag = aaMom(d.kpi.callsMom);

  const toolbar = `<div class="list-toolbar mb-3">
    <div class="left">
      <span class="fs-12 text-secondary">门户运营 · 近 30 天 · 行为埋点 <span class="mono">POST /v1/portal/behavior</span>（≠ E2 审计）</span>
    </div>
    <div class="right">
      <button class="btn btn-sm ${empty ? "btn-primary" : ""}" onclick="aaToggleEmpty()">${empty ? "恢复有数据" : "模拟无数据态"}</button>
      <button class="btn btn-sm" onclick="aaMetricSettings()">口径设置</button>
    </div>
  </div>`;

  const trendBody = empty ? aaEmptyBlock() : `
    ${aaTrendSvg(d.trend)}
    <div class="flex gap-4 mt-3" style="align-items:center;flex-wrap:wrap">
      <span class="fs-13">近 30 天总量 <b>${aaSum(d.trend).toLocaleString()}</b> 次</span>
      <span class="fs-13">环比 ${momTag}</span>
      <span class="fs-12 text-secondary">峰值 <b>${Math.max.apply(null, d.trend).toLocaleString()}</b> 次 · 谷值 <b>${Math.min.apply(null, d.trend).toLocaleString()}</b> 次 · 单位：次/日（全量接入应用合计）</span>
    </div>`;

  const rankBody = empty ? aaEmptyBlock() : `<div class="table-wrap"><table class="tbl">
    <tr><th>#</th><th>应用</th><th>分组</th><th>近 30 天调用量</th><th>环比</th><th>使用人数</th></tr>
    ${d.ranking.map((r, i) => `<tr>
      <td>${i + 1}</td>
      <td><b>${r.name}</b></td>
      <td>${r.group}</td>
      <td><div class="aa-rank"><span class="mono" style="min-width:64px">${r.calls.toLocaleString()}</span><span class="aa-bar"><span class="aa-bar-fill" style="width:${(r.calls / d.ranking[0].calls * 100).toFixed(1)}%"></span></span></div></td>
      <td>${aaMom(r.mom)}</td>
      <td>${r.users}</td>
    </tr>`).join("")}
  </table></div>`;

  const capBody = empty ? aaEmptyBlock() : `<div class="aa-caps">
    ${d.capabilities.map(c => `<div class="aa-cap">
      <div class="aa-cap-ic">${c.icon}</div>
      <div class="aa-cap-nm"><b>${c.name}</b><div class="fs-12 text-secondary">启用应用 ${c.apps} 个 · 调用量 ${c.calls.toLocaleString()}</div></div>
      <div class="aa-cap-bar"><span class="aa-bar"><span class="aa-bar-fill" style="width:${c.pct}%"></span></span></div>
      <div class="aa-cap-pct">${c.pct}%</div>
    </div>`).join("")}
    <div class="fs-12 text-secondary mt-2">ℹ 占比 = 该能力<b>已启用应用数 / 接入应用总数</b>（覆盖率）；调用量按该能力的埋点事件累计。</div>
  </div>`;

  const alertBody = empty ? aaEmptyBlock() : (d.alerts.length ? `<div class="aa-alerts">
    ${d.alerts.map(a => `<div class="aa-alert ${a.level}">
      <div class="aa-alert-main"><b>${a.app}</b> <span class="fs-13 text-secondary">${a.reason}</span></div>
      <div class="aa-alert-r">${aaMom(a.mom)} ${statusTag(a.level === "danger" ? "疑似接入异常" : "观察中", { "疑似接入异常": "danger", "观察中": "warning" })}</div>
    </div>`).join("")}
  </div>` : `<div class="state-box"><div class="illus">✅</div><div class="txt">暂无调用量异常下降的应用</div></div>`);

  return `${toolbar}
    <div class="card mb-4"><div class="card-head"><h3>应用调用量趋势（近 30 天）</h3><div class="fs-12 text-secondary">内联 SVG · 零依赖</div></div>${trendBody}</div>
    <div class="card mb-4"><div class="card-head"><h3>活跃应用排名（近 30 天）</h3></div>${rankBody}</div>
    <div class="card mb-4"><div class="card-head"><h3>中台能力使用分布</h3><div class="fs-12 text-secondary">覆盖率 · 全部 7 项中台能力</div></div>${capBody}</div>
    <div class="card"><div class="card-head"><h3>异常告警</h3><div class="fs-12 text-secondary">阈值：环比下降 &gt; 30%</div></div>${alertBody}</div>`;
}

function aaEmptyBlock() {
  return `<div class="aa-empty">
    <div class="aa-empty-ic">📉</div>
    <div class="aa-empty-tt">行为埋点尚未开启，看板数据将在埋点上线后 24 小时内出现</div>
    <div class="aa-empty-desc">
      本看板数据来自行为埋点 <span class="mono">POST /v1/portal/behavior</span>（A1-F05）。当前环境未上报任何埋点事件，
      因此暂无可展示的调用量、排名与能力分布 —— <b>这是「尚未产生数据」的正常状态，不是空白页</b>。
    </div>
    <div class="flex gap-2 mt-3" style="justify-content:center">
      <button class="btn btn-primary" onclick="msg('info','跳转「埋点配置」（A1-F05）：开启行为上报 / 校验 SDK 接入（原型演示）')">查看埋点配置</button>
      <button class="btn" onclick="msg('info','已重新检测数据源：仍无上报（原型演示）')">重新检测</button>
    </div>
  </div>`;
}

/* 演示开关：切换「模拟无数据态」（验收硬要求 ⑤） */
function aaToggleEmpty() {
  window._aaEmpty = !window._aaEmpty;
  const root = document.getElementById("pageRoot");
  if (root && PAGES.dashboard) {
    root.innerHTML = PAGES.dashboard.render();
    if (PAGES.dashboard.after) PAGES.dashboard.after();
  }
  msg("info", window._aaEmpty ? "已切换为「无数据态」演示（显示引导而非空白图表）" : "已恢复为有数据态");
}

/* 看板样式（自注入，零外链、不改 console.html） */
var AA_CSS = `
.aa-rank { display:flex; align-items:center; gap:10px; }
.aa-bar { flex:1; min-width:80px; height:8px; border-radius:9999px; background:var(--surface-hover); overflow:hidden; display:inline-block; }
.aa-bar-fill { display:block; height:100%; border-radius:9999px; background:var(--accent); }
.aa-caps { display:flex; flex-direction:column; gap:12px; }
.aa-cap { display:grid; grid-template-columns:36px 1fr 2fr 56px; gap:12px; align-items:center; }
.aa-cap-ic { width:36px; height:36px; border-radius:8px; background:var(--surface); display:flex; align-items:center; justify-content:center; font-size:18px; }
.aa-cap-nm { min-width:0; }
.aa-cap-bar { display:flex; align-items:center; }
.aa-cap-pct { text-align:right; font-weight:600; color:var(--bmp-text-title); font-size:13px; }
.aa-alerts { display:flex; flex-direction:column; gap:10px; }
.aa-alert { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:12px 14px; border-radius:8px; border:1px solid var(--bmp-border); background:var(--bmp-bg-card); }
.aa-alert.danger { background:var(--bmp-color-danger-light); border-color:var(--bmp-color-danger); }
.aa-alert.warning { background:var(--bmp-color-warning-light); border-color:var(--bmp-color-warning); }
.aa-alert-main { min-width:0; }
.aa-alert-r { display:flex; align-items:center; gap:8px; white-space:nowrap; }
.aa-empty { text-align:center; padding:40px 24px; }
.aa-empty-ic { font-size:44px; opacity:.7; }
.aa-empty-tt { font-size:15px; font-weight:600; color:var(--bmp-text-title); margin-top:10px; }
.aa-empty-desc { font-size:13px; color:var(--bmp-text-secondary); max-width:560px; margin:8px auto 0; line-height:1.8; }
.aa-cap-list { display:flex; flex-direction:column; gap:10px; }
.aa-step { display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:8px; border:1px solid var(--bmp-border); background:var(--bmp-bg-card); margin-bottom:10px; }
.aa-step.done { background:var(--bmp-color-success-light); border-color:var(--bmp-color-success); }
.aa-step.warn { background:var(--bmp-color-warning-light); border-color:var(--bmp-color-warning); }
.aa-step-n { width:26px; height:26px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:13px; color:#fff; flex-shrink:0; background:var(--bmp-border-strong); }
.aa-step.done .aa-step-n { background:var(--bmp-color-success); }
.aa-step.warn .aa-step-n { background:var(--bmp-color-warning); }
.aa-step-nm { flex:1; color:var(--bmp-text-title); }
`;
function aaInjectStyle() {
  if (document.getElementById("aa-style")) return;
  const s = document.createElement("style");
  s.id = "aa-style"; s.textContent = AA_CSS;
  document.head.appendChild(s);
}

/* ============================================================
   UI-C-10 应用详情：能力使用总览（B1）+ 接入状态视图（B2）
   ------------------------------------------------------------
   放置方式：作为「应用管理」Tab 行内操作「详情」打开的抽屉区块。
   理由：能力使用与接入状态是「单个应用」的属性，天然属于应用详情语境；
   四 Tab 已是「应用 / 卡片 / 嵌入页面 / 白名单」四类对象的管理视图，
   再加一层「能力使用」Tab 会与「应用」Tab 的粒度错位（Tab=对象类型，
   能力使用=某应用的属性），故选择详情抽屉，也避免破坏既有四 Tab 结构。
   ============================================================ */

/* 能力清单：CRM 采用规格给定示例值；其余应用按 freq 确定性派生（原型演示） */
var _PORTAL_APP_CAPS = {
  "CRM 客户管理": [
    { name: "SSO 单点登录", icon: "🔐", on: true, usage: 1284, unit: "次", since: "2026-08-15" },
    { name: "权限校验", icon: "🔑", on: true, usage: 3420, unit: "次", since: "2026-08-15" },
    { name: "待办推送", icon: "✅", on: true, usage: 486, unit: "条", since: "2026-09-01" },
    { name: "消息推送", icon: "✉", on: true, usage: 212, unit: "条", since: "2026-09-01" },
    { name: "文件服务", icon: "📎", on: false, usage: 0, unit: "", since: "—" },
    { name: "工作流引擎", icon: "🧭", on: true, usage: 38, unit: "个实例", since: "2026-09-20" },
    { name: "通知 Banner", icon: "📢", on: false, usage: 0, unit: "", since: "—" }
  ]
};
/* 能力使用数据生成：优先规格示例，否则按 freq 派生 */
function portalAppCapsFor(app) {
  if (_PORTAL_APP_CAPS[app.name]) return _PORTAL_APP_CAPS[app.name];
  const f = app.freq; // 3 ~ 32
  const since = { "SSO 单点登录": "2026-08-15", "权限校验": "2026-08-15", "待办推送": "2026-09-01", "消息推送": "2026-09-01", "文件服务": "2026-09-10", "工作流引擎": "2026-09-20", "通知 Banner": "2026-09-21" };
  return [
    { name: "SSO 单点登录", icon: "🔐", on: true, usage: f * 40 + 30, unit: "次", since: since["SSO 单点登录"] },
    { name: "权限校验", icon: "🔑", on: true, usage: f * 107 + 12, unit: "次", since: since["权限校验"] },
    { name: "待办推送", icon: "✅", on: f >= 7, usage: f * 15 + 6, unit: "条", since: since["待办推送"] },
    { name: "消息推送", icon: "✉", on: f >= 5, usage: f * 7 + 2, unit: "条", since: since["消息推送"] },
    { name: "文件服务", icon: "📎", on: f >= 12, usage: f * 4 + 1, unit: "次", since: since["文件服务"] },
    { name: "工作流引擎", icon: "🧭", on: f >= 9, usage: Math.max(1, Math.round(f * 1.2)), unit: "个实例", since: since["工作流引擎"] },
    { name: "通知 Banner", icon: "📢", on: f >= 20, usage: f * 2, unit: "次", since: since["通知 Banner"] }
  ];
}
/* 七步接入 Checklist 完成态：由能力启用情况推导（复用既有数据口径） */
function portalAppSteps(caps) {
  const on = n => (caps.find(c => c.name === n) || {}).on;
  const msgOn = on("消息推送");
  const fileOn = on("文件服务");
  const permOn = on("权限校验");
  const todoOn = on("待办推送");
  const wfOn = on("工作流引擎");
  return [
    { n: 1, name: "应用注册与接入评审（5 步申请 → 审批）", done: true, page: "app-register" },
    { n: 2, name: "SSO 接入（OIDC / 网关适配）", done: true, page: "app-register-guide" },
    { n: 3, name: "组织人员对齐键 + 只读缓存（B3 事件）", done: true, page: "employees" },
    { n: 4, name: "权限判定切换 + 存量 RBAC 离线导入", done: permOn, partial: !permOn, page: "permissions" },
    { n: 5, name: "待办推送接入（A4 /todo/push）", done: todoOn, partial: false, page: "app-register-events" },
    { n: 6, name: "消息 / 文件能力联调（D1 / D2）", done: msgOn && fileOn, partial: msgOn && !fileOn, page: "msg" },
    { n: 7, name: "审计日志上报 + 停建/下线清单", done: wfOn && permOn && todoOn, partial: permOn && todoOn && !wfOn, page: "audit" }
  ];
}
/* 应用详情抽屉：能力使用总览 + 接入状态 */
function portalAppDetail(appName) {
  aaInjectStyle();
  const app = MOCK.apps.find(a => a.name === appName) || MOCK.apps[0];
  const caps = portalAppCapsFor(app);
  const onCount = caps.filter(c => c.on).length;
  const steps = portalAppSteps(caps);
  const doneCount = steps.filter(s => s.done).length;

  const capRows = caps.map(c => `<tr>
    <td>${c.icon} ${c.name}</td>
    <td>${c.on ? '<span class="tag tag-success">✓ 已启用</span>' : '<span class="tag tag-info">○ 未接入</span>'}</td>
    <td class="mono">${c.on ? c.usage.toLocaleString() + " " + c.unit : "—"}</td>
    <td class="mono">${c.since}</td>
  </tr>`).join("");

  const stepHtml = steps.map(s => {
    const st = s.done ? "done" : (s.partial ? "warn" : "todo");
    const ic = s.done ? "✓" : (s.partial ? "!" : s.n);
    const tag = s.done ? '<span class="tag tag-success">已完成</span>'
      : (s.partial ? '<span class="tag tag-warning">部分完成</span>' : '<span class="tag tag-danger">未完成</span>');
    return `<div class="aa-step ${st}">
      <span class="aa-step-n">${ic}</span>
      <span class="aa-step-nm">${s.n}. ${s.name}</span>
      ${tag}
      ${!s.done ? `<a class="btn btn-sm" href="console.html?page=${s.page}${s.regTab ? "&tab=" + s.regTab : ""}">去配置 →</a>` : ""}
    </div>`;
  }).join("");

  showDrawer("应用详情 · " + app.name, `
    <dl class="desc-grid">
      <dt>应用</dt><dd><span style="display:inline-flex;align-items:center;gap:8px"><span style="width:26px;height:26px;border-radius:6px;background:${app.color};color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:13px">${app.icon}</span><b>${app.name}</b></span></dd>
      <dt>分组</dt><dd>${app.group}</dd>
      <dt>本月使用</dt><dd>${app.freq * 26} 次</dd>
      <dt>接入状态</dt><dd>${doneCount} / ${steps.length} 步完成${doneCount < steps.length ? ' <span class="tag tag-warning">接入未收尾</span>' : ' <span class="tag tag-success">已接入</span>'}</dd>
    </dl>

    <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:20px 0 12px">① 能力使用总览
      <span class="fs-12 text-secondary" style="font-weight:400">（近 30 天 · 已启用 ${onCount} / ${caps.length} 项）</span></h4>
    <div class="table-wrap"><table class="tbl">
      <tr><th>中台能力</th><th>是否启用</th><th>使用量（近 30 天）</th><th>首次接入时间</th></tr>
      ${capRows}
    </table></div>
    <div class="fs-12 text-secondary mt-2">ℹ 使用量来自行为埋点聚合（<span class="mono">POST /v1/portal/behavior</span>）；「未接入」表示该应用尚未调用该中台能力。</div>

    <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:20px 0 12px">② 接入就绪度（对齐 §4.6 七步 Checklist 关键里程碑）</h4>
    ${stepHtml}
    <div class="readonly-banner mt-4" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
      🧩 本区块为<b>配置就绪度摘要</b>（非七步逐步展开）；里程碑与 PRD §4.6 一致。未完成项可点「去配置 →」跳转独立菜单页（如 <span class="mono">app-register</span>）。与「能力使用量」互补（前者=是否接好，后者=是否在用）。
    </div>`);
}

/* ============================================================
   T02 · 身份与权限域二级形态（统一走 window.CM）
   ------------------------------------------------------------
   覆盖：accounts 分配角色抽屉 / sessions 批量强制下线 /
        perm-applies 代客登记·拒绝原因·详情 / roles 新建角色·添加成员·API 权限点 /
        permissions 新建·编辑·删除阻断原因列表 / employees 开通账号联动。
   约定：弹窗字段 ≤8 用 Dialog，长配置用 Drawer；高危统一走 highRisk；
        零硬编码色值；DOM id 前缀 cm-。
   ============================================================ */

/* ---- accounts 分配角色抽屉（多选角色 + 保存即生效） ---- */
function assignRole(username, name) {
  const roles = MOCK.roles.map(r => ({ value: r.code, label: r.name + "（" + r.members + " 人）" }));
  CM.openDrawer({
    id: "cm-assign-role",
    title: "分配角色 · " + name,
    width: 560,
    body: '<div class="fs-13 text-secondary mb-3">勾选该账号需绑定的角色（支持多角色，权限叠加）；保存后<b>下次请求生效</b>。</div>',
    fields: roles.map((r, i) => ({ name: "role_" + r.value, label: r.label, type: "checkbox", checkboxText: r.label, value: r.value === "employee" })),
    submitText: "保存角色",
    onSubmit: (values) => {
      const picked = Object.keys(values).filter(k => values[k]);
      CM.close("cm-assign-role");
      msg("success", `已为 ${username} 分配 ${picked.length} 个角色，在线用户下次请求生效（写审计日志）`);
    }
  });
}

/* ---- sessions 批量强制下线（勾选 + 高危确认） ---- */
function sessBatchKick() {
  const rows = MOCK.sessions.filter(s => !s.self);
  CM.openDrawer({
    id: "cm-sess-batch",
    title: "批量强制下线",
    width: 560,
    submitText: "强制下线所选会话",
    danger: true,
    body: '<div class="fs-13 text-secondary mb-3">勾选需要强制下线的会话；下线即令牌（jti）失效，用户需重新登录。</div>' +
      '<div class="table-wrap"><table class="tbl"><tr><th style="width:36px">选择</th><th>姓名</th><th>设备</th><th>最近活动</th></tr>' +
      rows.map(s => `<tr><td><input type="checkbox" data-name="kick_${s.id}" style="accent-color:var(--accent)"></td><td>${s.name}</td><td>${s.device}</td><td>${s.lastActive}</td></tr>`).join("") +
      "</table></div>",
    onSubmit: (values) => {
      const picked = rows.filter(s => values["kick_" + s.id]).map(s => s.id);
      if (!picked.length) { msg("warning", "请至少勾选 1 个会话"); return; }
      const names = rows.filter(s => values["kick_" + s.id]).map(s => s.name).join("、");
      CM.close("cm-sess-batch");
      highRisk("批量强制下线",
        `将强制下线 <b>${picked.length}</b> 个会话（${names}）。下线后这些令牌（jti）立即失效，用户需重新登录。`,
        "强制下线",
        `已强制下线 ${picked.length} 个会话（写审计日志）`);
    }
  });
}

/* ---- perm-applies 代客登记弹窗 ---- */
function paProxyRegister() {
  CM.openDialog({
    id: "cm-pa-proxy",
    title: "代客登记权限申请",
    width: 560,
    body: '<div class="fs-13 text-secondary mb-3">V1.0 为「线上登记 + 线下审批」口径（B2-F04）；V1.5 接入 B4 工作流后转线上审批。</div>',
    fields: [
      { name: "applicant", label: "申请人", type: "text", required: true, placeholder: "姓名 / 工号（EmployeeSelect）", tip: "代他人登记时填写实际申请人" },
      { name: "perm", label: "申请权限点", type: "select", required: true, options: ["md:employee:edit（人员编辑）", "portal:layout:list（布局查看）", "system:account:create（新建账号）"] },
      { name: "reason", label: "申请理由", type: "textarea", rows: 3, required: true, placeholder: "请说明业务场景与必要性（≥10 字）", validators: [(v) => (String(v || "").trim().length >= 10 ? null : "理由需不少于 10 个字")] },
      { name: "term", label: "期限", type: "select", options: ["30 天", "90 天", "长期"] }
    ],
    submitText: "提交登记",
    onSubmit: () => {
      CM.close("cm-pa-proxy");
      msg("success", "权限申请已登记（待线下审批，写审计日志）");
      route();
    }
  });
}

/* ---- perm-applies 拒绝原因抽屉（意见必填） ---- */
function paReject(no, who) {
  CM.openDrawer({
    id: "cm-pa-reject",
    title: "拒绝申请 · " + no,
    width: 540,
    submitText: "确认拒绝",
    danger: true,
    body: '<div class="fs-13 text-secondary mb-3">申请人：' + who + '。拒绝后申请人将收到通知，请填写具体原因（≥10 字）。</div>',
    fields: [{
      name: "reason", label: "拒绝原因", type: "textarea", rows: 4, required: true,
      placeholder: "如：该权限与申请人岗位职责不符，请联系其上级确认",
      validators: [(v) => (String(v || "").trim().length >= 10 ? null : "拒绝原因需不少于 10 个字")]
    }],
    onSubmit: () => {
      CM.close("cm-pa-reject");
      msg("success", `申请 ${no} 已拒绝并通知申请人（写审计日志）`);
      route();
    }
  });
}

/* ---- perm-applies 详情抽屉 ---- */
function paDetail(no) {
  CM.openDrawer({
    id: "cm-pa-detail",
    title: "申请详情 · " + no,
    width: 560,
    submitText: false,
    body: `<dl class="desc-grid">
      <dt>申请单号</dt><dd class="mono">${no}</dd>
      <dt>申请人</dt><dd>李四 · EMP-2021-0102</dd>
      <dt>申请权限</dt><dd class="mono">md:employee:edit（人员编辑）</dd>
      <dt>期限</dt><dd>长期</dd>
      <dt>审批链</dt><dd>申请人 → 直属上级 → 系统管理员</dd>
    </dl>
    <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:20px 0 12px">处理时间线</h4>
    <div class="timeline">
      <div class="t-item"><b>提交申请</b><div class="t-time">09-22 09:30 · 李四</div></div>
      <div class="t-item"><b>上级审批通过</b><div class="t-time">09-22 10:10 · 钱经理</div></div>
      <div class="t-item"><b>待管理员开通</b><div class="t-time">当前节点 · 系统管理员</div></div>
    </div>
    <div class="readonly-banner mt-4" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
      ℹ 审批留痕仅追加、不可篡改；开通动作写审计日志（B2-F04）
    </div>`
  });
}

/* ---- roles 新建角色弹窗 ---- */
function roleNew() {
  CM.openDialog({
    id: "cm-role-new",
    title: "新建角色",
    width: 520,
    fields: [
      { name: "name", label: "角色名称", type: "text", required: true, placeholder: "如：数据管理员" },
      { name: "code", label: "角色编码", type: "text", required: true, placeholder: "小写字母/下划线，全局唯一", validators: [(v) => (/^[a-z][a-z0-9_]*$/.test(String(v || "")) ? null : "编码须为小写字母开头、仅含小写字母/数字/下划线")] },
      { name: "source", label: "来源", type: "select", options: ["自建", "系统预置"], tip: "系统预置角色不可删除" },
      { name: "desc", label: "角色描述", type: "textarea", rows: 2, placeholder: "选填：职责范围说明" }
    ],
    submitText: "创建角色",
    onSubmit: () => {
      CM.close("cm-role-new");
      msg("success", "角色已创建，请前往「权限配置」为其分配权限点（写审计日志）");
    }
  });
}

/* ---- roles 添加成员抽屉（EmployeeSelect 多选） ---- */
function roleAddMember(roleName) {
  const emps = MOCK.employees.filter(e => e.status === "在职");
  CM.openDrawer({
    id: "cm-role-addmember",
    title: "添加成员 · " + roleName,
    width: 620,
    submitText: "添加到角色",
    body: '<div class="fs-13 text-secondary mb-3">EmployeeSelect：搜索姓名 / 工号，勾选后加入角色；权限保存后在线用户下次请求生效。</div>' +
      '<input class="input mb-3" placeholder="搜索姓名 / 工号 / 拼音…" oninput="cmFilterMemberRows(this)">' +
      '<div class="table-wrap"><table class="tbl" id="cm-member-table"><tr><th style="width:36px">选择</th><th>姓名</th><th>工号</th><th>部门</th></tr>' +
      emps.map(e => `<tr data-m="${(e.name + e.no).toLowerCase()}"><td><input type="checkbox" data-name="m_${e.no}" style="accent-color:var(--accent)"></td><td>${e.name}</td><td class="mono">${e.no}</td><td>${e.org}</td></tr>`).join("") +
      "</table></div>",
    onSubmit: (values) => {
      const picked = Object.keys(values).filter(k => values[k]).length;
      if (!picked) { msg("warning", "请至少勾选 1 名成员"); return; }
      CM.close("cm-role-addmember");
      msg("success", `已向「${roleName}」添加 ${picked} 名成员（写审计日志）`);
    }
  });
}
/* 成员搜索就地过滤（供 roleAddMember 使用） */
function cmFilterMemberRows(input) {
  const kw = (input.value || "").trim().toLowerCase();
  const table = document.getElementById("cm-member-table");
  if (!table) return;
  [...table.querySelectorAll("tr")].forEach(tr => {
    if (tr.querySelector("th")) return;
    tr.style.display = (!kw || (tr.dataset.m || "").includes(kw)) ? "" : "none";
  });
}

/** 角色权限 Tab · 与 UI-C-03 同源：业务域 → app_code → permissionsFlat */
function rolePermFilteredFlat() {
  const app = window._rolePermFilterApp || "";
  const dom = window._rolePermFilterDomain || "";
  const kwEl = document.getElementById("rolePermTreeSearch");
  const kw = (kwEl && kwEl.value.trim().toLowerCase()) || "";
  return (MOCK.permissionsFlat || []).filter(p => {
    if (app && p.appCode !== app) return false;
    if (dom && p.bizDomain !== dom) return false;
    if (kw && !(p.code.toLowerCase().includes(kw) || (p.desc || "").toLowerCase().includes(kw) || p.appCode.toLowerCase().includes(kw))) return false;
    return true;
  });
}

function rolePermDomainAppTreeHtml() {
  const idx = permDomainAppIndex();
  const kwEl = document.getElementById("rolePermTreeSearch");
  const kw = (kwEl && kwEl.value.trim().toLowerCase()) || "";
  const sel = window._rolePermTreeSel || { kind: "all", domain: "", app: "" };
  const nodeActive = key => {
    if (sel.kind === "all" && key === "all") return true;
    if (sel.kind === "domain" && key === "dom:" + sel.domain) return true;
    if (sel.kind === "app" && key === "app:" + sel.domain + ":" + sel.app) return true;
    return false;
  };
  let html = `<div class="node ${nodeActive("all") ? "active" : ""}" data-rperm-node="all" onclick="rolePermSelectNode('all','','')"><span class="tree-label">📂 全部权限点</span></div>`;
  (MOCK.bizDomains || []).forEach(d => {
    const apps = idx[d.code] ? [...idx[d.code].entries()].sort((a, b) => a[0].localeCompare(b[0])) : [];
    const domHit = kw && (d.label.toLowerCase().includes(kw) || d.code.toLowerCase().includes(kw));
    const appRows = apps.filter(([code, label]) => !kw || domHit || code.toLowerCase().includes(kw) || label.toLowerCase().includes(kw));
    if (kw && !domHit && !appRows.length) return;
    const domKey = "dom:" + d.code;
    const expanded = permTreeBranchExpanded(domKey, kw, domHit, appRows.length > 0);
    html += `<div class="tree-branch"><div class="node tree-parent ${nodeActive(domKey) ? "active" : ""}" data-rperm-node="${domKey}">
      <button type="button" class="tree-toggle" onclick="permToggleDomainBranch(event,'${d.code}')">${expanded ? "▼" : "▶"}</button>
      <span class="tree-label" onclick="rolePermSelectNode('domain','${d.code}','')">${d.label} <span class="mono fs-12 text-secondary">${d.code}</span></span></div>
      <div class="children${expanded ? "" : " collapsed"}">${appRows.map(([code, label]) => {
        const appKey = "app:" + d.code + ":" + code;
        return `<div class="node tree-leaf ${nodeActive(appKey) ? "active" : ""}" data-rperm-node="${appKey}" onclick="rolePermSelectNode('app','${d.code}','${code}')"><span class="tree-label">${label}</span></div>`;
      }).join("")}</div></div>`;
  });
  return html;
}

function rolePermTreeSearchRefresh() {
  const box = document.getElementById("rolePermDomainAppTree");
  if (box) box.innerHTML = rolePermDomainAppTreeHtml();
  rolePermHighlightTree();
  const list = document.getElementById("rolePermChecklist");
  if (list) list.innerHTML = rolePermChecklistHtml();
}

function rolePermSelectNode(kind, domain, app) {
  window._rolePermTreeSel = { kind, domain: domain || "", app: app || "" };
  window._rolePermFilterDomain = kind === "all" ? "" : (domain || "");
  window._rolePermFilterApp = kind === "app" ? (app || "") : "";
  rolePermTreeSearchRefresh();
}

function rolePermHighlightTree() {
  const sel = window._rolePermTreeSel || { kind: "all", domain: "", app: "" };
  document.querySelectorAll("#rolePermDomainAppTree [data-rperm-node]").forEach(n => {
    const k = n.dataset.rpermNode;
    let on = false;
    if (sel.kind === "all" && k === "all") on = true;
    else if (sel.kind === "domain" && k === "dom:" + sel.domain) on = true;
    else if (sel.kind === "app" && k === "app:" + sel.domain + ":" + sel.app) on = true;
    n.classList.toggle("active", on);
  });
}

function rolePermChecklistHtml() {
  const checked = window._rolePermChecked || new Set();
  const rows = rolePermFilteredFlat();
  if (!rows.length) return `<div class="fs-13 text-secondary" style="padding:8px">无匹配权限点。左侧选择业务域 / 接入系统，或调整搜索关键字。</div>`;
  return rows.map(p => {
    const on = checked.has(p.code) ? "checked" : "";
    return `<label class="fs-13" style="display:flex;gap:8px;align-items:flex-start;padding:6px 0;border-bottom:1px solid var(--bmp-border)">
      <input type="checkbox" ${on} style="margin-top:3px;accent-color:var(--bmp-color-primary)" onchange="rolePermToggleCode('${p.code}', this.checked)">
      <span><span class="mono">${p.code}</span> <span class="tag tag-${p.type === "menu" ? "info" : p.type === "button" ? "primary" : "warning"}" style="height:18px">${p.type}</span>
      <div class="fs-12 text-secondary">${p.desc} · ${p.appCode} / ${MOCK.bizDomainLabel(p.bizDomain)}</div></span></label>`;
  }).join("");
}

function rolePermToggleCode(code, on) {
  if (!window._rolePermChecked) window._rolePermChecked = new Set();
  if (on) window._rolePermChecked.add(code); else window._rolePermChecked.delete(code);
}

function rolePermMenuHtml() {
  return `<div style="max-height:360px;overflow:auto;border:1px solid var(--bmp-border);border-radius:4px;padding:12px">
    ${MOCK.permTree.map(m => `<div style="margin-bottom:10px">
      <label style="font-weight:600;display:flex;gap:6px;align-items:center"><input type="checkbox" checked style="accent-color:var(--bmp-color-primary)"> ${m.name}</label>
      ${m.children.map(c => `<div style="margin:6px 0 6px 22px">
        <label style="display:flex;gap:6px;align-items:center;font-size:13px"><input type="checkbox" checked style="accent-color:var(--bmp-color-primary)"> ${c.name}</label>
      </div>`).join("")}
    </div>`).join("")}</div>`;
}

function rolePermApiPaneHtml() {
  window._rolePermFilterApp = window._rolePermFilterApp || "";
  window._rolePermFilterDomain = window._rolePermFilterDomain || "";
  if (!window._rolePermTreeSel) window._rolePermTreeSel = { kind: "all", domain: "", app: "" };
  return `<div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
    🧭 与 <a href="console.html?page=permissions">UI-C-03 权限点管理</a> 同一分域模型（<span class="mono">permissionsFlat</span>）；含 <span class="mono">workflow:instance:start:*</span> 等流程发起权限。
  </div>
  <div class="split-layout mt-3" style="grid-template-columns:240px 1fr;gap:12px">
    <div class="tree-panel"><input class="input tree-search" id="rolePermTreeSearch" placeholder="搜索业务域 / app_code…" oninput="rolePermTreeSearchRefresh()">
      <div class="tree" id="rolePermDomainAppTree">${rolePermDomainAppTreeHtml()}</div></div>
    <div id="rolePermChecklist" style="max-height:360px;overflow:auto;border:1px solid var(--bmp-border);border-radius:4px;padding:8px 12px">${rolePermChecklistHtml()}</div>
  </div>`;
}

/* ---- roles 权限 Tab 切换：菜单权限 / API 权限点 ---- */
function rolePermTab(el, kind) {
  el.parentElement.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  const pane = document.getElementById("rolePermPane");
  if (!pane) return;
  if (kind === "menu") {
    pane.innerHTML = rolePermMenuHtml();
    return;
  }
  pane.innerHTML = rolePermApiPaneHtml();
  rolePermHighlightTree();
}

/* ---- permissions 新建权限点弹窗（编码唯一校验 + 业务域/系统） ---- */
function permNew() {
  const existing = (MOCK.permissionsFlat || []).map(p => p.code);
  const domOpts = (MOCK.bizDomains || []).map(d => d.code + " · " + d.label);
  const sel = window._permTreeSel || {};
  const defDom = sel.domain || "GENERAL · 通用";
  const defAppRaw = sel.app ? sel.app + " · " + permAppDisplayName(sel.app) : "platform · 业务中台 platform";
  CM.openDialog({
    id: "cm-perm-new",
    title: "新建权限点",
    width: 560,
    fields: [
      { name: "bizDomain", label: "业务域", type: "select", required: true, value: defDom.includes(" · ") ? defDom : "GENERAL · 通用", options: domOpts.length ? domOpts : ["GENERAL · 通用"],
        tip: "与 portal_app.biz_domain / B2-F02-1 对齐" },
      { name: "appCode", label: "所属系统 app_code", type: "select", required: true, value: defAppRaw, options: permAppSelectOptions(sel.domain || "") },
      { name: "code", label: "权限编码", type: "text", required: true, placeholder: "如：system:account:export", tip: "格式 module:resource:action，全局唯一",
        validators: [(v) => (/^[a-z][a-z0-9]*(:[a-z0-9]+)+$/.test(String(v || "")) ? (existing.includes(v) ? "该权限编码已存在" : null) : "编码格式应为 module:resource:action")] },
      { name: "type", label: "类型", type: "select", required: true, options: ["menu", "button", "api"] },
      { name: "pattern", label: "api_pattern", type: "text", placeholder: "如：GET /v1/accounts（支持通配符 *）" },
      { name: "desc", label: "描述", type: "text", placeholder: "权限点用途说明" }
    ],
    submitText: "创建权限点",
    onSubmit: (values) => {
      const bizDomain = String(values.bizDomain || "GENERAL").split(" · ")[0].trim();
      const appCode = String(values.appCode || "platform").split(" · ")[0].trim();
      CM.close("cm-perm-new");
      msg("success", `权限点已创建（${appCode} / ${MOCK.bizDomainLabel(bizDomain)} · 写审计日志）`);
    }
  });
}

/* ---- permissions 编辑权限点弹窗（预填 + 业务域/系统） ---- */
function permEdit(code, type, appCode, bizDomain, pattern, desc) {
  const domOpts = (MOCK.bizDomains || []).map(d => d.code + " · " + d.label);
  const domVal = bizDomain + " · " + MOCK.bizDomainLabel(bizDomain);
  const appVal = appCode + " · " + permAppDisplayName(appCode);
  CM.openDialog({
    id: "cm-perm-edit",
    title: "编辑权限点 · " + code,
    width: 560,
    fields: [
      { name: "bizDomain", label: "业务域", type: "select", required: true, value: domVal, options: domOpts },
      { name: "appCode", label: "所属系统 app_code", type: "select", required: true, value: appVal, options: permAppSelectOptions(bizDomain) },
      { name: "code", label: "权限编码", type: "text", value: code, tip: "编码创建后不可修改", validators: [] },
      { name: "type", label: "类型", type: "select", value: type, options: ["menu", "button", "api"] },
      { name: "pattern", label: "api_pattern", type: "text", value: pattern },
      { name: "desc", label: "描述", type: "text", value: desc }
    ],
    submitText: "保存",
    onSubmit: () => {
      CM.close("cm-perm-edit");
      msg("success", "权限点已保存（写审计日志）");
    }
  });
}

/* ---- permissions 删除 → 阻断原因结构化列表 ---- */
function permDelete(code, refCount) {
  if (!refCount) { msg("success", "权限点 " + code + " 已删除（写审计日志）"); return; }
  CM.openDrawer({
    id: "cm-perm-block",
    title: "无法删除 · 阻断原因",
    width: 560,
    submitText: false,
    body: `<div class="readonly-banner" style="background:var(--bmp-color-danger-light);border-color:var(--bmp-color-danger-light);color:var(--bmp-color-danger-dark)">
      ⚠ 权限点 <span class="mono">${code}</span> 被 <b>${refCount}</b> 个角色引用，删除被阻断。请先解除引用后再删除（§3.3 阻断原因列表）。
    </div>
    <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:20px 0 12px">引用该权限点的角色</h4>
    <div class="table-wrap"><table class="tbl"><tr><th>角色名称</th><th>角色编码</th><th>成员数</th><th>操作</th></tr>
    ${MOCK.roles.slice(0, refCount).map(r => `<tr><td>${r.name}</td><td class="mono">${r.code}</td><td>${r.members}</td><td class="ops"><button class="btn-text" onclick="CM.close('cm-perm-block');roleAddMember('${r.name}')">去解除引用</button></td></tr>`).join("")}
    </table></div>`
  });
}

/* ---- employees 开通账号 → 联动 newAccount（工号预填） ---- */
function empOpenAccount(no) {
  const e = MOCK.employees.find(x => x.no === no);
  if (typeof newAccount === "function") {
    newAccount();
    const fb = document.getElementById("formBody");
    if (fb) fb.insertAdjacentHTML("afterbegin",
      `<div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">🔗 联动「${e ? e.name : no}」（工号 ${no}）开通中台账号，工号已自动带入锚点。</div>`);
    const anchor = fb && fb.querySelector("input.input");
    if (anchor) anchor.value = (e ? e.name : "") + " · " + no;
  } else {
    msg("info", "新建账号入口不可用");
  }
}

/* ============================================================
   T03 · 门户运营域二级形态（统一走 window.CM）
   ------------------------------------------------------------
   覆盖：portal-apps 上架/编辑应用（含 URL 连通性校验）/ notices-admin 新建·编辑公告·
        已读明细 / layouts 新建模板 / app-analytics 口径设置。
   ============================================================ */

/* ---- portal-apps 上架应用抽屉（含 URL 连通性校验提示） ---- */
function portalAppNew() {
  CM.openDrawer({
    id: "cm-app-new",
    title: "上架应用",
    width: 640,
    body: '<div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">🧩 上架前将自动<b>校验入口 URL 连通性</b>（T3-09 验收）：不可达则阻断上架。</div>',
    fields: [
      { name: "name", label: "应用名称", type: "text", required: true, placeholder: "如：合同管理系统" },
      { name: "icon", label: "图标（emoji 或文字）", type: "text", placeholder: "如：📄", value: "🧩" },
      { name: "group", label: "分组", type: "select", required: true, options: ["办公协同", "业务系统", "数据服务", "管理后台"] },
      { name: "url", label: "入口 URL", type: "text", required: true, placeholder: "https://app.lubon.com/xxx",
        validators: [(v) => (cmIsHttpsUrl(v) ? null : "必须为 https:// 开头的合法 URL")] },
      { name: "roles", label: "可见角色", type: "select", options: ["全员", "系统管理员", "普通员工", "消息管理员"] }
    ],
    submitText: "校验并上架",
    onSubmit: (values) => {
      CM.close("cm-app-new");
      msg("success", `连通性校验通过（200 OK · ${60 + (values.name || "").length * 3}ms），应用「${values.name}」已上架（写审计日志）`);
      route();
    }
  });
}

/* ---- portal-apps 编辑应用抽屉（复用上架范式，预填） ---- */
function portalAppEdit(name, group, icon, color) {
  CM.openDrawer({
    id: "cm-app-edit",
    title: "编辑应用 · " + name,
    width: 640,
    fields: [
      { name: "name", label: "应用名称", type: "text", required: true, value: name },
      { name: "icon", label: "图标", type: "text", value: icon },
      { name: "group", label: "分组", type: "select", value: group, options: ["办公协同", "业务系统", "数据服务", "管理后台", group] },
      { name: "url", label: "入口 URL", type: "text", required: true, value: "https://app.lubon.com/" + name.split(" ")[0].toLowerCase(),
        validators: [(v) => (cmIsHttpsUrl(v) ? null : "必须为 https:// 开头的合法 URL")] },
      { name: "roles", label: "可见角色", type: "select", options: ["全员", "系统管理员", "普通员工", "消息管理员"] }
    ],
    submitText: "保存并校验",
    onSubmit: () => {
      CM.close("cm-app-edit");
      msg("success", `应用「${name}」已保存，入口 URL 连通性校验通过（写审计日志）`);
      route();
    }
  });
}

/* ---- notices-admin 新建公告抽屉（富文本 + 定时发布 + 置顶） ---- */
function noticeNew() {
  CM.openDrawer({
    id: "cm-notice-new",
    title: "新建公告",
    width: 680,
    body: '<div class="fs-13 text-secondary mb-3">支持富文本正文；可设「定时发布」与「置顶」；无展示中公告时首页不显示 Banner 区域。</div>',
    fields: [
      { name: "title", label: "公告标题", type: "text", required: true, placeholder: "请输入公告标题" },
      { name: "body", label: "正文（富文本）", type: "textarea", rows: 6, required: true, placeholder: "支持加粗/列表/链接；此处为原型纯文本占位", tip: "生产环境为富文本编辑器（工具栏：加粗/斜体/列表/链接/图片）" },
      { name: "dept", label: "发布部门", type: "select", required: true, options: ["数字化中心", "人力资源部", "行政部", "总裁办"] },
      { name: "publish", label: "发布方式", type: "select", options: ["立即发布", "定时发布"] },
      { name: "top", label: "置顶", type: "checkbox", checkboxText: "置顶（优先于普通公告展示）" }
    ],
    submitText: "发布公告",
    onSubmit: () => {
      CM.close("cm-notice-new");
      msg("success", "公告已发布（写审计日志）；已读回执将自动上报");
      route();
    }
  });
}

/* ---- notices-admin 编辑公告抽屉（预填） ---- */
function noticeEdit(id) {
  const n = (MOCK.notices || []).find(x => x.id === id) || { title: "", body: "", dept: "数字化中心", top: false };
  CM.openDrawer({
    id: "cm-notice-edit",
    title: "编辑公告 · " + (n.title || ""),
    width: 680,
    fields: [
      { name: "title", label: "公告标题", type: "text", required: true, value: n.title || "" },
      { name: "body", label: "正文（富文本）", type: "textarea", rows: 6, required: true, value: n.body || "" },
      { name: "dept", label: "发布部门", type: "select", value: n.dept || "数字化中心", options: ["数字化中心", "人力资源部", "行政部", "总裁办"] },
      { name: "publish", label: "发布方式", type: "select", options: ["立即发布", "定时发布"] },
      { name: "top", label: "置顶", type: "checkbox", checkboxText: "置顶（优先于普通公告展示）", value: !!n.top }
    ],
    submitText: "保存修改",
    onSubmit: () => {
      CM.close("cm-notice-edit");
      msg("success", "公告已保存（写审计日志）");
      route();
    }
  });
}

/* ---- notices-admin 已读明细抽屉 ---- */
function noticeReadDetail(id) {
  const n = (MOCK.notices || []).find(x => x.id === id) || { title: "公告" };
  const emps = MOCK.employees || [];
  CM.openDrawer({
    id: "cm-notice-read",
    title: "已读明细 · " + (n.title || ""),
    width: 620,
    submitText: false,
    body: `<div class="stat-cards" style="grid-template-columns:repeat(3,1fr);margin-bottom:12px">
      <div class="stat-card"><div class="lb">应读人数</div><div class="vl">512</div></div>
      <div class="stat-card"><div class="lb">已读</div><div class="vl">326</div></div>
      <div class="stat-card"><div class="lb">未读</div><div class="vl">186</div></div>
    </div>
    <div class="table-wrap"><table class="tbl"><tr><th>姓名</th><th>工号</th><th>部门</th><th>阅读时间</th><th>状态</th></tr>
    ${emps.map((e, i) => `<tr><td>${e.name}</td><td class="mono">${e.no}</td><td>${e.org}</td><td class="mono">${i < 3 ? "09-22 10:0" + (i + 1) : "—"}</td><td>${i < 3 ? statusTag("已读", { "已读": "success" }) : statusTag("未读", { "未读": "info" })}</td></tr>`).join("")}
    </table></div>`
  });
}

/* ---- layouts 新建模板弹窗（名称 + 适用角色多选 + 布局版本） ---- */
function layNewTemplate() {
  CM.openDialog({
    id: "cm-lay-new",
    title: "新建布局模板",
    width: 560,
    fields: [
      { name: "name", label: "模板名称", type: "text", required: true, placeholder: "如：研发角色首页" },
      { name: "roles", label: "适用角色（可多选）", type: "select", required: true, options: ["普通员工", "系统管理员", "消息管理员", "审计员"], tip: "原型单选演示；生产环境为多选" },
      { name: "version", label: "布局版本", type: "select", options: ["v2 三栏（推荐）", "v1 单画布"] }
    ],
    submitText: "创建模板",
    onSubmit: () => {
      CM.close("cm-lay-new");
      msg("success", "模板已创建（草稿），请在下方编辑器中配置三栏卡片后发布");
      route();
    }
  });
}

/* ---- app-analytics 口径设置弹窗（数据窗口 + 环比基准） ---- */
function aaMetricSettings() {
  CM.openDialog({
    id: "cm-aa-metric",
    title: "看板口径设置",
    width: 520,
    fields: [
      { name: "window", label: "数据窗口", type: "select", options: ["近 7 天", "近 30 天", "近 90 天"], value: "近 30 天" },
      { name: "baseline", label: "环比基准", type: "select", options: ["上一周期", "去年同期", "上月"] },
      { name: "agg", label: "聚合粒度", type: "select", options: ["按日", "按周"] }
    ],
    submitText: "应用口径",
    onSubmit: (values) => {
      CM.close("cm-aa-metric");
      msg("success", `看板口径已更新：数据窗口=${values.window}，环比基准=${values.baseline}（原型演示）`);
    }
  });
}

/* ---- URL 连通性前置校验（https 合法性，供上架/编辑应用复用） ---- */
function cmIsHttpsUrl(v) {
  const s = String(v == null ? "" : v).trim();
  if (s.indexOf("https://") !== 0) return false;
  const rest = s.slice(8);
  return rest.length > 0 && rest.indexOf(" ") === -1 && rest.indexOf(".") !== -1;
}

/* ============================================================
   T04 · 集成 / 消息 / 主数据域二级形态（统一走 window.CM）
   ------------------------------------------------------------
   覆盖：gateway 新建/编辑路由·启停高危 / integration 注册向导（抽屉内）+ secret 重置高危 +
        scope 面板 + 回调域名白名单 / msg 新建模板·发送测试·渠道配置（抽屉内向导）+连接器向导 /
        sync-source 向导修复（步骤 2 必映射阻断 / 步骤 3 测试门禁 / keyword 收紧）已在向导内实现。
   约定：向导一律 container="drawer"（渲染进 #d-generic），不跳独立页；高危走 highRisk。
   ============================================================ */

/* ---- gateway 新建路由弹窗（保存前高危确认） ---- */
function gwRouteNew() {
  CM.openDialog({
    id: "cm-gw-new",
    title: "新建网关路由",
    width: 600,
    body: '<div class="fs-13 text-secondary mb-3">E1 最小集（V1.0）：路由 + 鉴权 + LegacyAuthFilter；限流/熔断/灰度完整能力 V1.5。保存前将触发高危确认（写审计）。</div>',
    fields: [
      { name: "prefix", label: "路径前缀", type: "text", required: true, placeholder: "如：/crm/**", validators: [(v) => (String(v || "").indexOf("/") === 0 ? null : "路径前缀需以 / 开头")] },
      { name: "target", label: "目标服务", type: "text", required: true, placeholder: "如：http://10.0.3.11:8080" },
      { name: "qps", label: "限流 QPS", type: "number", value: 200 },
      { name: "timeout", label: "超时（ms）", type: "number", value: 3000 },
      { name: "gray", label: "灰度规则", type: "text", placeholder: "如：按部门：数字化中心 100%（选填）" }
    ],
    submitText: "保存路由",
    onSubmit: (values) => {
      CM.close("cm-gw-new");
      highRisk("新增网关路由",
        `将新增路由 <b>${values.prefix}</b> → ${values.target}（限流 ${values.qps} QPS）。路由变更即时生效并写审计。`,
        values.prefix,
        `路由 ${values.prefix} 已新增（写审计日志）`);
    }
  });
}

/* ---- gateway 编辑路由弹窗（预填 + 变更高危确认） ---- */
function gwRouteEdit(prefix, target, qps, gray) {
  CM.openDialog({
    id: "cm-gw-edit",
    title: "编辑路由 · " + prefix,
    width: 600,
    fields: [
      { name: "prefix", label: "路径前缀", type: "text", value: prefix, tip: "路径前缀创建后不可修改" },
      { name: "target", label: "目标服务", type: "text", required: true, value: target },
      { name: "qps", label: "限流 QPS", type: "number", value: qps },
      { name: "timeout", label: "超时（ms）", type: "number", value: 3000 },
      { name: "gray", label: "灰度规则", type: "text", value: gray || "" }
    ],
    submitText: "保存变更",
    onSubmit: () => {
      CM.close("cm-gw-edit");
      highRisk("变更网关路由",
        `将变更路由 <b>${prefix}</b> 的目标/限流配置。变更即时生效，可能影响该前缀下的全部调用，请谨慎操作。`,
        prefix,
        `路由 ${prefix} 已变更（写审计日志）`);
    }
  });
}

/* ---- gateway 启停：停用走高危，启用即时生效 ---- */
function gwToggle(enabled, prefix) {
  if (enabled) {
    highRisk("停用网关路由",
      `将停用路由 <b>${prefix}</b>。停用后该前缀下的流量将返回 503，请确认已完成下线通知。`,
      prefix,
      `路由 ${prefix} 已停用（写审计日志）`);
  } else {
    msg("success", `路由 ${prefix} 已启用（即时生效，写审计日志）`);
  }
}

/* ---- 注册申请 · 列表 Tab ---- */
function igAppStatusTag(st) {
  const map = { "待审批": "warning", "已通过": "success", "已驳回": "danger", "草稿": "info" };
  return statusTag(st, map);
}
/** 应用注册合并页：子 Tab「申请中 / 已通过」（PRD UI-C-16 · 2026-10-20 简化） */
function igAppRegisterSubTab() {
  const params = new URLSearchParams(location.search);
  if (params.get("page") === "app-register") return params.get("tab") || window._appRegTab || "apply";
  if (params.get("page") === "app-register-approved") return "approved";
  return "apply";
}
function igAppRegisterTabSwitch(tab) {
  window._appRegTab = tab;
  location.href = "console.html?page=app-register&tab=" + tab;
}
/** 旧书签 app-register-mapping / integration&tab=mapping 跳转说明（V1.5 无独立菜单） */
function igAppRegisterOrgMappingNoteBanner() {
  const params = new URLSearchParams(location.search);
  if (params.get("orgMappingNote") !== "1") return "";
  return `<div class="readonly-banner" style="background:var(--bmp-color-warning-light);border-color:var(--bmp-color-warning-light);color:var(--bmp-color-warning-dark)">
    📌 V1.5 控制台<b>不提供</b>「组织编码例外」独立页。改造期 5 套存量若仍持非钉钉部门编码，由<b>实施/连接器</b>离线批量导入 <span class="mono">sys_org_mapping</span>（<span class="mono">B3-F03</span>）；全钉钉标识应用无需对照表。账号例外仍在 <a href="console.html?page=employees">人员管理 → 账号映射</a>。
  </div>`;
}
/** 旧书签 integration&tab=perm-migration → V1.5 离线 RBAC 导入说明（非 J2-F05 在线 Tab） */
function igAppRegisterPermMigrationNoteBanner() {
  const params = new URLSearchParams(location.search);
  if (params.get("permMigrationNote") !== "1") return "";
  return `<div class="readonly-banner" style="background:var(--bmp-color-warning-light);border-color:var(--bmp-color-warning-light);color:var(--bmp-color-warning-dark)">
    📌 V1.5 <b>不交付</b> J2-F05 在线「权限迁移」Tab。七步 Checklist 第 4 步：经审批后<b>离线导出/脚本导入</b> <span class="mono">sys_user_role</span> / <span class="mono">sys_role_permission</span>，切换 <span class="mono">GET /v1/perm/check</span>。实施 Runbook 见 <a href="console.html?page=permissions">权限点管理</a> · PRD §10.4 #4。
  </div>`;
}
function igRenderAppRegisterPage(forcedTab) {
  const tab = forcedTab || igAppRegisterSubTab();
  window._appRegTab = tab;
  const applyCls = tab === "apply" ? "active" : "";
  const apprCls = tab === "approved" ? "active" : "";
  return `${igAppRegisterOrgMappingNoteBanner()}${igAppRegisterPermMigrationNoteBanner()}<div class="readonly-banner" style="background:var(--bmp-color-info-light)">
    <b>默认契约</b>：中台对外组织/人员 API 与事件 payload 使用 <span class="mono">dingtalk_userid</span> / <span class="mono">dingtalk_dept_id</span>（或关联 <span class="mono">md_org</span>）；
    应用上报待办/消息/日志等须使用同一套标识。<b>数据权限仍在各业务系统</b>。
    <a href="console.html?page=platform-capabilities">中台能力目录 →</a>
    · <a href="console.html?page=app-register-guide"><b>接入文档（J1-F04）</b></a>（侧栏无独立项，书签 <span class="mono">?page=app-register-guide</span> 仍有效）
  </div>
  <div class="tabs mb-4" data-tabgroup="app-reg">
    <div class="tab ${applyCls}" onclick="igAppRegisterTabSwitch('apply')">申请中</div>
    <div class="tab ${apprCls}" onclick="igAppRegisterTabSwitch('approved')">已通过</div>
  </div>
  ${tab === "approved" ? igRenderRegisteredTab(true) : igRenderApplicationsTab(true)}`;
}
function igRenderRegisteredTab(embedded) {
  const head = embedded ? "" : `<div class="readonly-banner">✅ 审批通过的应用写入 <span class="mono">gov_app_register</span>；凭证与《完整接入说明》在申请详情中一次性交付。新建申请请至 <a href="console.html?page=app-register">应用注册 · 申请中</a>。</div>`;
  return `${head}
  <div class="table-wrap"><table class="tbl"><tr><th>应用名称</th><th>client_id</th><th>授权 scope</th><th>状态</th><th>注册时间</th><th>操作</th></tr>
  ${MOCK.regApps.map(a => `<tr>
    <td><b>${a.name}</b></td><td class="mono">${a.clientId}</td>
    <td>${a.scopes.map(s => `<span class="tag tag-info" style="margin-right:4px">${s}</span>`).join("")}</td>
    <td>${statusTag(a.status, { "已启用": "success", "待启用": "warning" })}</td><td>${a.created}</td>
    <td class="ops"><button class="btn-text" onclick="igResetSecret('${a.clientId}','${a.name}')">重置 secret</button><button class="btn-text" onclick="igEditScope('${a.clientId}','${a.name}')">编辑 scope</button></td>
  </tr>`).join("")}</table></div>`;
}
/** J3-F05 · 事件订阅运维：订阅配置 + Outbox 事件流排查（双 Tab） */
function igRenderEventsPage() {
  const params = new URLSearchParams(location.search);
  const raw = params.get("tab") || window._igEvTab || "subs";
  const tab = raw === "outbox" || raw === "monitor" || raw === "stream" ? "outbox" : "subs";
  window._igEvTab = tab;
  const subsCls = tab === "subs" ? "active" : "";
  const outCls = tab === "outbox" ? "active" : "";
  const panelHidden = id => (tab === id ? "" : "hidden");
  return `<div class="tabs mb-4" data-tabgroup="ig-ev">
    <div class="tab ${subsCls}" onclick="igEvEventsTab(this,'subs')">订阅与投递</div>
    <div class="tab ${outCls}" onclick="igEvEventsTab(this,'outbox')">事件流排查</div>
  </div>
  <div data-tabpanel="subs" class="${panelHidden("subs")}">${igRenderEventsSubsPanel()}</div>
  <div data-tabpanel="outbox" class="${panelHidden("outbox")}">${igRenderEventOutboxPanel()}</div>`;
}
function igEvEventsTab(el, tab) {
  window._igEvTab = tab;
  if (el && el.closest) {
    portalTab(el, tab);
  } else {
    const group = document.querySelector('[data-tabgroup="ig-ev"]');
    if (group) {
      group.querySelectorAll(".tab").forEach(t => {
        const on = t.getAttribute("onclick") === "igEvEventsTab(this,'" + tab + "')";
        t.classList.toggle("active", on);
      });
      const scope = group.parentElement || group;
      scope.querySelectorAll("[data-tabpanel]").forEach(n => n.classList.toggle("hidden", n.dataset.tabpanel !== tab));
    }
  }
  const url = "console.html?page=app-register-events" + (tab === "outbox" ? "&tab=outbox" : "");
  if (history.replaceState) history.replaceState(null, "", url);
}
function igRenderEventsSubsPanel() {
  /* 三条观测链说明（J3 集成排障 vs E2 审计 vs 门户 watch-list，见规格简报「中台能力与管理端观测面」） */
  return `<div class="readonly-banner">ℹ <b>领域事件（J3）</b>：本页查订阅投递 / 死信 / 重放（集成排障）；事件码目录见 <a href="console.html?page=platform-capabilities">中台能力目录 · 领域事件</a>；应用勾选订阅见 <a href="console.html?page=app-register">应用注册</a>。</div>
  <div class="readonly-banner" style="background:var(--bmp-color-warning-light);border-color:var(--bmp-color-warning-light);color:var(--bmp-color-warning-dark)">
    ⚠ <b>勿与以下混淆</b>：① <b>审计上报</b>（<code>POST /audit/log</code>）→ <a href="console.html?page=audit">审计中心</a>（合规留痕，非业务 Feed）；② 员工首页「关注动态」(<span class="mono">watch-list</span>) V1.5 <b>无</b>后台 feed 运营；③ 门户点击统计 → <a href="console.html?page=dashboard">运营总览看板</a>（埋点，不进 audit）。
  </div>
  <div class="readonly-banner fs-13">Outbox 至少一次 · <span class="mono">eventId</span> 幂等 · 3 次重试后死信 · 流程类见 <span class="mono">wf.*</span> 事件 · 单条 Outbox 明细见 Tab「<b>事件流排查</b>」</div>
  <div class="table-wrap"><table class="tbl"><tr><th>Topic</th><th>事件</th><th>订阅方</th><th>类型</th><th>状态</th><th>操作</th></tr>
  ${MOCK.eventSubs.map(s => `<tr>
    <td class="mono">${s.topic}</td><td class="mono">${s.event}</td><td>${s.subscriber}</td><td>${s.type}</td>
    <td>${s.status.includes("死信") ? `<span class="tag tag-danger">${s.status}</span>` : statusTag("正常", { "正常": "success" })}</td>
    <td class="ops">
      <button class="btn-text" onclick="msg('success','投递测试已发送：Header 含 X-BMP-Signature: HMAC-SHA256(&lt;secret&gt;, body)，订阅方返回 200')">投递测试</button>
      ${s.status.includes("死信") ? `<button class="btn-text danger" onclick="highRisk('人工重放死信','将重放 2 条死信事件至订阅方（md.org.changed → 招聘系统 Webhook）。订阅方需保证 event_id 幂等。','重放','死信已重放（写审计日志）')">重放死信(2)</button>` : ""}
    </td>
  </tr>`).join("")}</table></div>`;
}
/** J3-F05 · event_outbox 样例列表（筛选 + 详情抽屉 + 死信重放 mock） */
function igEvOutboxFilterDefaults() {
  return { app: "全部", eventType: "全部", status: "全部" };
}
function igEvOutboxRows() {
  const f = { ...igEvOutboxFilterDefaults(), ...(window._igEvOutboxFilter || {}) };
  return (MOCK.eventOutboxSample || []).filter(r => {
    if (f.app !== "全部" && r.systemCode !== f.app) return false;
    if (f.eventType !== "全部" && r.eventType !== f.eventType) return false;
    if (f.status !== "全部" && r.publishStatus !== f.status) return false;
    return true;
  });
}
function igEvOutboxSetFilter(key, val) {
  window._igEvOutboxFilter = { ...igEvOutboxFilterDefaults(), ...(window._igEvOutboxFilter || {}), [key]: val };
  route();
}
function igEvOutboxStatusTag(st) {
  const map = { "已投递": "success", "待投递": "info", "投递中": "warning", "投递失败": "danger", "死信": "danger" };
  return statusTag(st, map);
}
function igRenderEventOutboxPanel() {
  const f = { ...igEvOutboxFilterDefaults(), ...(window._igEvOutboxFilter || {}) };
  const apps = ["全部", ...new Set((MOCK.eventOutboxSample || []).map(r => r.systemCode))];
  const types = ["全部", ...new Set((MOCK.eventOutboxSample || []).map(r => r.eventType))];
  const statuses = ["全部", "待投递", "投递中", "已投递", "投递失败", "死信"];
  const rows = igEvOutboxRows();
  const sel = (opts, cur, key) => `<select class="select select-sm" onchange="igEvOutboxSetFilter('${key}', this.value)">${opts.map(o => `<option value="${o}" ${o === cur ? "selected" : ""}>${o}</option>`).join("")}</select>`;
  return `<div class="readonly-banner fs-13">🔍 按 <span class="mono">event_outbox</span> 排查跨应用领域事件投递（与 E2 审计、A1 埋点<b>分存</b>）。Payload 仅展示脱敏摘要。</div>
  <div class="list-toolbar mb-2">
    <div class="left fs-13 flex gap-2" style="flex-wrap:wrap;align-items:center">
      <span>应用 system_code ${sel(apps, f.app, "app")}</span>
      <span>事件类型 ${sel(types, f.eventType, "eventType")}</span>
      <span>投递状态 ${sel(statuses, f.status, "status")}</span>
      <button type="button" class="btn btn-sm" onclick="window._igEvOutboxFilter=igEvOutboxFilterDefaults();route()">重置</button>
    </div>
    <div class="right fs-12 text-secondary">共 ${rows.length} 条（mock）</div>
  </div>
  <div class="table-wrap"><table class="tbl"><tr><th>eventId</th><th>事件类型</th><th>来源应用</th><th>发生时间</th><th>投递状态</th><th>订阅方</th><th>重试</th><th>Payload（脱敏）</th><th>操作</th></tr>
  ${rows.length ? rows.map(r => `<tr>
    <td class="mono">${r.eventId}</td><td class="mono">${r.eventType}</td>
    <td>${r.sourceApp}<div class="fs-12 text-secondary mono">${r.systemCode}</div></td>
    <td class="mono">${r.occurredAt}</td>
    <td>${r.deadLetter ? `<span class="tag tag-danger">死信</span>` : igEvOutboxStatusTag(r.publishStatus)}</td>
    <td>${r.subscriber}</td><td>${r.retryCount}</td>
    <td class="mono fs-12">${r.payloadSummary}</td>
    <td class="ops">
      <button class="btn-text" onclick="igEvOutboxDetail('${r.eventId}')">详情</button>
      ${r.deadLetter ? `<button class="btn-text danger" onclick="igEvOutboxReplay('${r.eventId}')">重放</button>` : ""}
    </td>
  </tr>`).join("") : `<tr><td colspan="9"><div class="state-box"><div class="txt">无匹配事件（调整筛选条件）</div></div></td></tr>`}
  </table></div>`;
}
function igEvOutboxDetail(eventId) {
  const row = (MOCK.eventOutboxSample || []).find(x => x.eventId === eventId);
  if (!row) return;
  CM.openDrawer({
    id: "cm-ev-outbox",
    title: "Outbox 事件 · " + eventId,
    width: 680,
    submitText: "关闭",
    body: `<dl class="desc-grid">
      <dt>eventId</dt><dd class="mono">${row.eventId}</dd>
      <dt>eventType</dt><dd class="mono">${row.eventType}</dd>
      <dt>来源</dt><dd>${row.sourceApp} · <span class="mono">${row.systemCode}</span></dd>
      <dt>occurredAt</dt><dd class="mono">${row.occurredAt}</dd>
      <dt>投递状态</dt><dd>${row.deadLetter ? "死信（DLQ）" : row.publishStatus}</dd>
      <dt>订阅方</dt><dd>${row.subscriber}</dd>
      <dt>retryCount</dt><dd>${row.retryCount}</dd>
      <dt>payloadSummary</dt><dd class="mono fs-13">${row.payloadSummary}</dd>
    </dl>
    <div class="readonly-banner mt-3 fs-13">完整 Payload 仅存集成侧日志；合规操作留痕见 <a href="console.html?page=audit">审计中心</a>。</div>`,
    onSubmit: () => { CM.close("cm-ev-outbox"); }
  });
}
function igEvOutboxReplay(eventId) {
  const row = (MOCK.eventOutboxSample || []).find(x => x.eventId === eventId);
  if (!row || !row.deadLetter) return;
  highRisk(
    "重放 Outbox 死信",
    `将重放事件 ${eventId}（${row.eventType}）至「${row.subscriber}」。订阅方须按 eventId 幂等处理。`,
    "重放",
    `事件 ${eventId} 已提交重放队列（写 audit_operation_log · mock）`
  );
}
function igRenderApplicationsTab(embedded) {
  const list = MOCK.getRegApplications();
  const head = embedded ? "" : `<div class="readonly-banner" style="background:var(--bmp-color-info-light)">
    <b>5 步向导</b>：应用信息 → 钉钉对齐键（默认）→ 勾选 API/事件 → 回调域名 → 提交审批。
    通过后一次性交付 <b>client 凭证 + 《完整接入说明》</b>。<b>不含 J2-F05 权限迁移</b>。
    <a href="console.html?page=platform-capabilities">中台能力目录 →</a>
  </div>`;
  return `${head}
  <div class="list-toolbar">
    <div class="left"><button class="btn btn-primary" onclick="igApplyRegisterWizard()">＋ 新建注册申请</button></div>
    <div class="right fs-12 text-secondary">能力清单来自「中台能力目录」· 审批人：集成管理员</div>
  </div>
  <div class="table-wrap"><table class="tbl"><tr><th>申请单号</th><th>应用</th><th>client_id</th><th>API</th><th>事件</th><th>钉钉对齐键</th><th>状态</th><th>提交时间</th><th>操作</th></tr>
  ${list.map(a => `<tr>
    <td class="mono">${a.id}</td><td><b>${a.appName}</b><div class="fs-12 text-secondary">${a.owner}</div></td>
    <td class="mono">${a.clientId}</td>
    <td>${(a.apis || []).length} 项</td><td>${(a.events || []).length} 项</td>
    <td><span class="fs-12">${igPersonOrgKeyLabel(a.personKey, a.orgKey)}</span></td>
    <td>${igAppStatusTag(a.status)}</td><td class="mono">${a.submitted || "—"}</td>
    <td class="ops">
      <button class="btn-text" onclick="igAppApplyDetail('${a.id}')">详情</button>
      ${a.status === "待审批" ? `<button class="btn-text" onclick="igApproveApplication('${a.id}')">审批通过</button><button class="btn-text danger" onclick="igRejectApplication('${a.id}')">驳回</button>` : ""}
      ${a.status === "已通过" ? `<button class="btn-text" onclick="igShowIntegrationPack('${a.id}')">接入说明</button>` : ""}
    </td>
  </tr>`).join("")}
  </table></div>`;
}
function igRenderMappingTab() {
  const tierFilter = window._igMapTierFilter || "need_mapping";
  const tierOpts = [
    { v: "need_mapping", l: "过渡 + Legacy（需对照）" },
    { v: "standard", l: "标准档（无需对照）" },
    { v: "all", l: "全部 system_code" },
    { v: "legacy", l: "仅 Legacy 档应用" }
  ];
  return `<div class="readonly-banner" style="background:var(--bmp-color-warning-light);border-color:var(--bmp-color-warning-light);color:var(--bmp-color-warning-dark)">
    📌 <b>仅当应用仍使用非钉钉部门编码时维护</b>（改造期可选能力，非主路径）。已全量使用 <span class="mono">dingtalk_dept_id</span> / <span class="mono">dingtalk_userid</span> 的应用<b>无需</b>本页。
  </div>
  <div class="readonly-banner">👥 <b>账号例外</b>：<a href="console.html?page=employees">人员管理 → 账号映射</a>（<span class="mono">sys_account_mapping</span>，Legacy 档为主）。<br>
  🏢 <b>组织对照</b>：下方 <span class="mono">sys_org_mapping</span> + 批量导入 / 前缀规则（≤20 条）；未命中入<b>例外队列</b>，不静默丢弃。</div>
  <div class="list-toolbar mb-2">
    <div class="left fs-13">视图筛选：
      ${tierOpts.map(o => `<button type="button" class="btn btn-sm ${tierFilter === o.v ? "btn-primary" : ""}" onclick="igMapTierFilter('${o.v}')">${o.l}</button>`).join(" ")}
    </div>
  </div>
  ${igRenderOrgMapTab(tierFilter)}`;
}
function igMapTierFilter(v) {
  window._igMapTierFilter = v;
  route();
}
function igOrgMapBulkImport() {
  /* 过渡档 mock：批量导入后标记待审批申请的 orgBulkDone，便于演示审批放行 */
  const list = MOCK.getRegApplications();
  let n = 0;
  list.forEach(a => {
    if (a.status === "待审批" && a.integrationTier === "transition") {
      a.orgBulkDone = true;
      a.orgBulkImportDone = true;
      n++;
    }
  });
  if (n) MOCK.saveRegApplications(list);
  msg("success", "原型演示：已选择 Excel 模板，解析 128 行组织对照（成功 120 / 待仲裁 8），写入 sys_org_mapping" +
    (n ? `；已标记 ${n} 条过渡档申请「一次性对照已完成」` : "") + "并刷新完成度");
  route();
}
function igOrgMapPrefixRules() {
  CM.openDrawer({
    id: "cm-org-prefix-rules",
    title: "前缀 / 默认归属规则（≤20 条 · 过渡档）",
    width: 640,
    submitText: "保存规则",
    body: `<div class="readonly-banner fs-13">过渡档组织对齐：优先一次性导入；无法覆盖的源组织用<b>前缀匹配</b>或<b>默认归属</b>（本原型最多展示 20 条规则）。</div>
      <div class="table-wrap mt-3"><table class="tbl"><tr><th>system_code</th><th>类型</th><th>规则</th><th>→ md_org</th></tr>
        <tr><td>CRM</td><td>前缀</td><td class="mono">D100-02*</td><td>销售部/华东大区</td></tr>
        <tr><td>REC</td><td>默认归属</td><td class="mono">*</td><td>未分类组织</td></tr>
      </table></div>`,
    onSubmit: () => { CM.close("cm-org-prefix-rules"); msg("success", "前缀/默认规则已保存（写审计日志）"); route(); }
  });
}
function platTab(el, tab) {
  window._platTab = tab;
  portalTab(el, tab);
}
function platApiEdit(id) {
  const row = (MOCK.platformApis || []).find(x => x.id === id) || { method: "GET", path: "/v1/", name: "", scope: "profile", version: "v1.0", status: "草稿" };
  CM.openDrawer({
    id: "cm-plat-api",
    title: id ? "编辑 Open API" : "发布 Open API",
    width: 640,
    submitText: "保存",
    fields: [
      { name: "method", label: "HTTP 方法", type: "select", value: row.method, options: ["GET", "POST", "PUT", "DELETE"] },
      { name: "path", label: "路径", type: "text", required: true, value: row.path },
      { name: "name", label: "名称", type: "text", required: true, value: row.name },
      { name: "scope", label: "OAuth scope", type: "text", value: row.scope },
      { name: "version", label: "版本", type: "text", value: row.version }
    ],
    onSubmit: () => { CM.close("cm-plat-api"); msg("success", "API 目录已保存（写审计日志）"); route(); }
  });
}
function platEventEdit(id) {
  const row = (MOCK.platformEvents || []).find(x => x.id === id) || { code: "biz.example", name: "", topic: "bmp-events-biz", delivery: "Webhook(HMAC)", status: "草稿" };
  CM.openDrawer({
    id: "cm-plat-ev",
    title: id ? "编辑领域事件" : "发布领域事件",
    width: 640,
    submitText: "保存",
    fields: [
      { name: "code", label: "事件码", type: "text", required: true, value: row.code },
      { name: "name", label: "名称", type: "text", required: true, value: row.name },
      { name: "topic", label: "Topic", type: "text", value: row.topic },
      { name: "delivery", label: "投递方式", type: "text", value: row.delivery }
    ],
    onSubmit: () => { CM.close("cm-plat-ev"); msg("success", "事件目录已保存（写审计日志）"); route(); }
  });
}
function igScopesFromApiIds(apiIds) {
  const scopes = new Set();
  (apiIds || []).forEach(id => {
    const api = (MOCK.platformApis || []).find(x => x.id === id);
    if (api && api.scope && api.scope !== "—") scopes.add(api.scope);
  });
  return [...scopes];
}
/** 接入三档文案（与 PRD B3-F03 / I1-F01 对齐；标准档不依赖 sys_org_mapping 全量维护） */
const IG_INTEGRATION_TIER = {
  standard: { label: "标准档", hint: "应用本地存对齐键（dingtalk_userid + md_org_id 或 dingtalk_dept_id），经事件/API 同步，无需组织对照表。" },
  transition: { label: "过渡档", hint: "人员：工号 + SSO 绑定；组织：一次性批量导入或 ≤20 条前缀/默认规则，其余走例外队列。" },
  legacy: { label: "Legacy 档", hint: "短期 sys_org_mapping + 账号例外（5 套存量改造）；须规划 sunset 至标准档。" }
};
const IG_PERSON_KEY = {
  dingtalk_userid: "钉钉 userid（dingtalk_userid）",
  employee_no: "工号（employee_no）",
  legacy_login: "存量登录名（legacy_login）"
};
const IG_ORG_KEY = {
  md_org_id: "中台组织 ID（md_org_id）",
  dingtalk_dept_id: "钉钉部门 ID（dingtalk_dept_id）",
  legacy_dept_code: "存量部门编码（legacy_dept_code）"
};
function igTierTag(tier) {
  const t = IG_INTEGRATION_TIER[tier] || { label: tier || "—" };
  const cls = tier === "standard" ? "tag-success" : tier === "transition" ? "tag-warning" : "tag-danger";
  return `<span class="tag ${cls}">${t.label}</span>`;
}
function igPersonOrgKeyLabel(personKey, orgKey) {
  return `${IG_PERSON_KEY[personKey] || personKey || "—"} · ${IG_ORG_KEY[orgKey] || orgKey || "—"}`;
}
/** 审批门禁（V1.5 原型）：仅标准钉钉对齐路径，不因组织对照 / orgBulkDone 拦截 */
function igApproveBlockReason(a) {
  if (!a) return "申请不存在";
  return null;
}
function igApplyRegisterWizard() {
  CM.openWizard({
    id: "cm-ig-apply",
    container: "drawer",
    title: "新建注册申请",
    width: 760,
    submitText: "提交审批",
    steps: [
      {
        title: "应用信息",
        fields: [
          { name: "appName", label: "应用名称", type: "text", required: true },
          { name: "clientId", label: "client_id（建议）", type: "text", required: true, validators: [(v) => (String(v || "").trim().length >= 3 ? null : "至少 3 个字符")] },
          { name: "systemCode", label: "源系统编码 system_code", type: "text", required: true, placeholder: "如 CRM / EXP" },
          { name: "owner", label: "负责人", type: "text", required: true },
          { name: "entryUrl", label: "应用入口 URL", type: "text", required: true, placeholder: "https://..." }
        ],
        render: () => '<div class="fs-12 text-secondary">审批通过后 client_id 不可改；入口 URL 用于工作台 SSO 跳转（决议 #5 新标签页）。</div>'
      },
      {
        title: "钉钉对齐键（默认）",
        fields: [
          { name: "personKey", label: "人员对齐键 personKey", type: "select", required: true, value: "dingtalk_userid",
            options: [
              { value: "dingtalk_userid", label: "dingtalk_userid（默认）" },
              { value: "employee_no", label: "employee_no（工号 + SSO 绑定，可选）" }
            ] },
          { name: "orgKey", label: "组织对齐键 orgKey", type: "select", required: true, value: "dingtalk_dept_id",
            options: [
              { value: "dingtalk_dept_id", label: "dingtalk_dept_id（默认）" },
              { value: "md_org_id", label: "md_org_id（与中台 md_org 关联键）" }
            ] }
        ],
        render: () => `<div class="readonly-banner"><b>标准路径</b>：${IG_INTEGRATION_TIER.standard.hint}</div>
          <div class="readonly-banner fs-13 mt-2" style="margin-top:8px">主路径：<b>不在此步配置数据库或 schema 发现</b>；改造期非钉钉组织编码由<b>实施/连接器</b>离线导入 <span class="mono">sys_org_mapping</span>（B3-F03），控制台 V1.5 无独立维护页。</div>
          <div class="fs-12 text-secondary mt-2">不做权限迁移（J2-F05 在线采集已废止）；仅登记与中台主数据的对齐方式。</div>`
      },
      {
        title: "API 与事件",
        render: () => {
          const apis = MOCK.platformApis || [], evs = MOCK.platformEvents || [];
          return '<div class="fs-13 text-secondary mb-2">从「中台能力目录」勾选（最小授权）。</div>' +
            '<div class="fw-600 fs-13 mb-2">Open API</div><div class="wf-form-checks">' +
            apis.map(a => `<label><input type="checkbox" data-ig-api="${a.id}" style="accent-color:var(--accent)"> <span class="mono">${a.method} ${a.path}</span> · ${a.name}</label>`).join("") +
            '</div><div class="fw-600 fs-13 mb-2 mt-3">领域事件（Webhook 订阅）</div><div class="wf-form-checks">' +
            evs.map(e => `<label><input type="checkbox" data-ig-ev="${e.id}" style="accent-color:var(--accent)"> <span class="mono">${e.code}</span> · ${e.name}</label>`).join("") +
            "</div>";
        },
        validate: () => {
          const n = document.querySelectorAll("[data-ig-api]:checked,[data-ig-ev]:checked").length;
          return n ? null : "至少选择 1 个 API 或事件";
        }
      },
      {
        title: "回调域名",
        fields: [
          { name: "callbackDomains", label: "回调域名（每行一个 https 域名）", type: "textarea", required: true, placeholder: "https://expense.lubon.com\nhttps://expense.lubon.com/hook" }
        ],
        render: () => '<div class="readonly-banner">用于待办 / 流程 / 事件 Webhook 回调；<b>仅 https</b>，拒 IP 与内网段。</div>'
      },
      {
        title: "确认提交",
        render: (ctx) => {
          const v = (ctx && ctx.values) || {};
          return `<dl class="desc-grid"><dt>应用</dt><dd>${v.appName || "—"}</dd><dt>client_id</dt><dd class="mono">${v.clientId || "—"}</dd>
            <dt>system_code</dt><dd class="mono">${v.systemCode || "—"}</dd>
            <dt>钉钉对齐键</dt><dd class="fs-13">${igPersonOrgKeyLabel(v.personKey, v.orgKey)}</dd></dl>
            <div class="fs-12 text-secondary">提交后状态为「待审批」；通过后生成凭证与个性化接入说明。</div>`;
        }
      }
    ],
    onDone: (ctx) => {
      const v = (ctx && ctx.values) || {};
      const apis = [...document.querySelectorAll("[data-ig-api]:checked")].map(c => c.getAttribute("data-ig-api"));
      const events = [...document.querySelectorAll("[data-ig-ev]:checked")].map(c => c.getAttribute("data-ig-ev"));
      const domains = String(v.callbackDomains || "").split(/\n+/).map(s => s.trim()).filter(Boolean);
      const bad = domains.find(d => !/^https:\/\//i.test(d));
      if (bad) { msg("error", "回调域名须以 https:// 开头：" + bad); return; }
      const list = MOCK.getRegApplications();
      const id = "RA-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + String(100 + list.length).slice(-3);
      const personKey = v.personKey || "dingtalk_userid";
      const orgKey = v.orgKey || "dingtalk_dept_id";
      list.unshift({
        id, appName: v.appName, clientId: v.clientId, owner: v.owner, systemCode: v.systemCode, entryUrl: v.entryUrl,
        status: "待审批", apis, events, callbackDomains: domains,
        integrationTier: "standard", personKey, orgKey,
        orgMappingReady: true,
        accountMapping: `标准档 · ${personKey}`,
        submitted: new Date().toISOString().slice(0, 16).replace("T", " ")
      });
      MOCK.saveRegApplications(list);
      msg("success", `注册申请 ${id} 已提交，等待审批`);
      route();
    }
  });
}
function igRegisterWizard() { igApplyRegisterWizard(); }
function igAppApplyDetail(id) {
  const a = MOCK.getRegApplications().find(x => x.id === id);
  if (!a) return;
  const apiLines = (a.apis || []).map(id => (MOCK.platformApis.find(x => x.id === id) || {}).path).filter(Boolean).join("<br>") || "—";
  const evLines = (a.events || []).map(id => (MOCK.platformEvents.find(x => x.id === id) || {}).code).filter(Boolean).join("<br>") || "—";
  showDrawer("注册申请 · " + a.id, `
    <dl class="desc-grid">
      <dt>应用</dt><dd><b>${a.appName}</b></dd><dt>client_id</dt><dd class="mono">${a.clientId}</dd>
      <dt>system_code</dt><dd class="mono">${a.systemCode}</dd><dt>入口</dt><dd class="mono">${a.entryUrl || "—"}</dd>
      <dt>负责人</dt><dd>${a.owner}</dd><dt>状态</dt><dd>${igAppStatusTag(a.status)}</dd>
      <dt>钉钉对齐键</dt><dd class="fs-13">${igPersonOrgKeyLabel(a.personKey, a.orgKey)}</dd>
      <dt>回调域名</dt><dd>${(a.callbackDomains || []).map(d => `<div class="mono">${d}</div>`).join("") || "—"}</dd>
    </dl>
    <h4 class="fs-13 fw-600 mt-3">已选 API</h4><div class="fs-13 mono">${apiLines}</div>
    <h4 class="fs-13 fw-600 mt-3">已选事件</h4><div class="fs-13 mono">${evLines}</div>
    ${a.rejectReason ? `<div class="readonly-banner mt-3" style="background:var(--bmp-color-danger-light)">驳回原因：${a.rejectReason}</div>` : ""}
    ${a.status === "已通过" ? `<button class="btn btn-primary mt-3" onclick="closeDrawer('d-generic');igShowIntegrationPack('${a.id}')">打开完整接入说明</button>` : ""}`);
}
function igApproveApplication(id) {
  const list = MOCK.getRegApplications();
  const a = list.find(x => x.id === id);
  if (!a) return;
  const block = igApproveBlockReason(a);
  if (block) {
    msg("warning", block);
    return;
  }
  highRisk("审批通过注册申请",
    `将为「${a.appName}」开通 client 凭证，scope 由所选 API 推导；并生成交付物《完整接入说明》。`,
    "审批通过",
    `申请 ${id} 已通过`,
    () => {
      a.status = "已通过";
      a.approvedAt = new Date().toISOString().slice(0, 16).replace("T", " ");
      MOCK.saveRegApplications(list);
      const scopes = igScopesFromApiIds(a.apis);
      if (!MOCK.regApps.some(r => r.clientId === a.clientId)) {
        MOCK.regApps.push({ name: a.appName, clientId: a.clientId, scopes, status: "已启用", created: a.approvedAt.slice(0, 10), tokenEndpoint: "POST /v1/oauth/token" });
      }
      route();
      igShowIntegrationPack(id);
    });
}
function igRejectApplication(id) {
  CM.openDrawer({
    id: "cm-ig-reject",
    title: "驳回注册申请",
    width: 520,
    submitText: "确认驳回",
    fields: [{ name: "reason", label: "驳回原因", type: "textarea", required: true }],
    onSubmit: (values) => {
      const list = MOCK.getRegApplications();
      const a = list.find(x => x.id === id);
      if (a) { a.status = "已驳回"; a.rejectReason = values.reason; MOCK.saveRegApplications(list); }
      CM.close("cm-ig-reject");
      msg("warning", "申请已驳回");
      route();
    }
  });
}
function igShowIntegrationPack(id) {
  const a = MOCK.getRegApplications().find(x => x.id === id);
  if (!a) return;
  const apis = (a.apis || []).map(i => MOCK.platformApis.find(x => x.id === i)).filter(Boolean);
  const evs = (a.events || []).map(i => MOCK.platformEvents.find(x => x.id === i)).filter(Boolean);
  const scopeTags = igScopesFromApiIds(a.apis).map(s => `<span class="tag tag-info">${s}</span>`).join(" ");
  CM.openDrawer({
    id: "cm-ig-pack",
    title: "完整接入说明 · " + a.appName,
    width: 720,
    submitText: "下载 PDF 包",
    body: `<div class="readonly-banner" style="background:var(--bmp-color-success-light)">✅ 审批已通过 · 交付编号 <span class="mono">${a.id}-PACK</span> · 含凭证申领、SSO、所选 API / 事件、Webhook 验签与冒烟清单。</div>
      <dl class="desc-grid">
        <dt>client_id</dt><dd class="mono">${a.clientId}</dd><dt>scope</dt><dd>${scopeTags || "—"}</dd>
        <dt>令牌端点</dt><dd class="mono">POST /v1/oauth/token</dd>
        <dt>钉钉对齐键</dt><dd>${igPersonOrgKeyLabel(a.personKey, a.orgKey)} · system_code=${a.systemCode}</dd>
        <dt>回调域名</dt><dd>${(a.callbackDomains || []).join("<br>") || "—"}</dd>
      </dl>
      <h4 class="fs-13 fw-600 mt-3">① Open API（联调顺序）</h4>
      <ol class="fs-13" style="line-height:1.9">${apis.map(x => `<li><span class="mono">${x.method} ${x.path}</span> — ${x.name}</li>`).join("") || "<li>（无）</li>"}</ol>
      <h4 class="fs-13 fw-600 mt-3">② 事件订阅（Webhook）</h4>
      <ol class="fs-13" style="line-height:1.9">${evs.map(x => `<li><span class="mono">${x.code}</span> · ${x.topic} · Header: X-BMP-Signature</li>`).join("") || "<li>（无）</li>"}</ol>
      <h4 class="fs-13 fw-600 mt-3">③ 冒烟清单</h4>
      <ul class="fs-13" style="line-height:1.9"><li>SSO 登录跳转 ${a.entryUrl || ""}</li><li>client_credentials 换票</li><li>任选 1 个已开通 API 200</li>${evs.length ? "<li>Webhook 探活 200 + 验签</li>" : ""}</ul>
      <div class="flex gap-2 mt-3">
        <button class="btn btn-sm btn-primary" onclick="igShowSecret('${a.clientId}')">领取 client_secret（一次性）</button>
        <button class="btn btn-sm" onclick="igShowGuide('G-01')">快速开始文档</button>
      </div>`,
    onSubmit: () => { msg("success", "接入说明 PDF 已打包下载（含 Postman 集合与示例工程链接）"); CM.close("cm-ig-pack"); }
  });
}

/* ---- 注册成功后：《接入凭证单》一次性展示弹窗（I1-F05 升级）
   合规要点（§4.8）：① secret 默认掩码、显式「显示」最多 30s 后自动回掩码；
   ② 关闭后本会话不可再查看（关闭即清除内存与 DOM）；③ 禁止写入 localStorage；
   ④ 复制走 clipboard + 提示；⑤ 下载/打印的凭证单不含 secret 明文；⑥ 交付留痕。 ---- */
function igShowSecret(clientId) {
  /* 无 gov:app:manage 权限时不展示（按钮级策略对齐 UIUX §4.5）—— 原型默认管理员，此处可演示降级 */
  if (window._igNoPerm) { msg("error", "无 gov:app:manage 权限，无法查看凭证"); return; }
  const app = MOCK.regApps.find(a => a.clientId === clientId) || { name: clientId, scopes: ["profile"], tokenEndpoint: "POST /v1/oauth/token" };
  const secret = "sk-" + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
  const cs = MOCK.credentialSheet;
  const body =
    '<div class="readonly-banner" style="background:var(--bmp-color-warning-light);border-color:var(--bmp-color-warning-light);color:var(--bmp-color-warning-dark)">⚠ <b>client_secret 仅此处一次性明文展示，关闭后不可再查看</b>；遗失请走「重置 secret」（高危，旧密钥立即失效）。</div>' +
    '<dl class="desc-grid">' +
      '<dt>应用名称</dt><dd>' + app.name + '</dd>' +
      '<dt>client_id</dt><dd class="flex gap-2" style="align-items:center"><span class="mono">' + clientId + '</span><button class="btn btn-sm" onclick="igCopyField(\'' + clientId + '\')">复制</button></dd>' +
      '<dt>client_secret</dt><dd class="flex gap-2" style="align-items:center">' +
        '<input class="input mono cred-mask" id="cm-secret-val" value="' + cs.secretMask + '" readonly data-real="' + secret + '">' +
        '<button class="btn btn-sm" id="cm-secret-toggle">显示</button>' +
        '<button class="btn btn-sm" onclick="igCopySecret()">复制</button></dd>' +
      '<dt>令牌端点</dt><dd class="flex gap-2" style="align-items:center"><span class="mono">' + (app.tokenEndpoint || cs.tokenEndpoint) + '</span><button class="btn btn-sm" onclick="igCopyField(\'' + (app.tokenEndpoint || cs.tokenEndpoint) + '\')">复制</button></dd>' +
      '<dt>鉴权方式</dt><dd>' + cs.authMode + '</dd>' +
      '<dt>有效范围</dt><dd>' + (app.scopes || []).map(s => '<span class="tag tag-info" style="margin-right:4px">' + s + '</span>').join("") + '</dd>' +
      '<dt>环境</dt><dd>' + cs.env + '</dd>' +
    '</dl>' +
    '<div class="fs-12 text-secondary mt-3">常见错误码：' +
      MOCK.errCodes.map(e => '<span class="mono">' + e.code + '</span>（' + e.desc + '）').join(" ｜ ") + '</div>' +
    '<div class="flex gap-2 mt-3"><button class="btn btn-sm" onclick="igCredentialDownload(\'' + clientId + '\')">下载 PDF</button>' +
      '<button class="btn btn-sm" onclick="window.print()">打印</button></div>';
  const inst = CM.openDialog({
    id: "cm-ig-credential",
    title: "接入凭证单（仅此一次展示完整 secret）",
    width: 620,
    body: body,
    submitText: "我已保存，关闭",
    onSubmit: () => {
      /* 二次确认：未复制 / 未保存时提醒（危险按钮文案为具体动词「仍要关闭」） */
      CM.close("cm-ig-credential");
      msg("success", `应用 ${clientId} 的凭证已交付（写 audit_operation_log：谁在何时把哪个应用的凭证交付给谁）`);
      route();
    },
    onClose: () => { igClearSecret(); }
  });
  /* 挂载掩码控制器：默认掩码 → 点「显示」最多 30s → 自动回掩码 */
  const ctrl = CM.maskToggle({ input: "cm-secret-val", btn: "cm-secret-toggle", maskHtml: cs.secretMask, maxMs: 30000 });
  CM._credMask = ctrl;
  return inst;
}
/* 关闭凭证单时清理内存与 DOM 中的 secret（本会话不可再查看） */
function igClearSecret() {
  if (CM._credMask && CM._credMask.destroy) { try { CM._credMask.destroy(); } catch (e) { } }
  CM._credMask = null;
  const el = document.getElementById("cm-secret-val");
  if (el) {
    el.value = "";                 /* DOM 中不留任何 secret（含掩码）痕迹 */
    el.removeAttribute("data-real");
    el.setAttribute("data-cleared", "1");
  }
}
/* 复制任意字段（凭证单内 client_id / 令牌端点） */
function igCopyField(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text);
    else { const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); }
    msg("success", "已复制到剪贴板");
  } catch (e) { msg("info", "请手动选中并复制"); }
}
function igCopySecret() {
  const el = document.getElementById("cm-secret-val");
  if (!el) return;
  const v = el.getAttribute("data-real") || el.value;
  if (!v) { msg("info", "secret 已清除，请重置后获取"); return; }
  try {
    el.select();
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v);
    else document.execCommand("copy");
    msg("success", "已复制，请在 60 秒内保存到密码管理器");
  } catch (e) { msg("info", "请手动选中并复制密钥"); }
}
/* ---- 凭证单下载/打印抽屉（不含 secret 明文） ---- */
function igCredentialDownload(clientId) {
  const app = MOCK.regApps.find(a => a.clientId === clientId) || { name: clientId, scopes: [], tokenEndpoint: "POST /v1/oauth/token" };
  const cs = MOCK.credentialSheet;
  const stamp = "DEL-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + String(Math.floor(Math.random() * 900) + 100);
  CM.openDrawer({
    id: "cm-ig-cred-dl",
    title: "接入凭证单（下载 / 打印）",
    width: 640,
    submitText: "下载 PDF",
    body: '<div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">📄 凭证单<b>不含 secret 明文</b>（secret 行以「' + cs.secretPlaceholder + '」占位）；含 client_id、令牌端点、鉴权方式、scope、错误码表、交付留痕编号。</div>' +
      '<dl class="desc-grid">' +
        '<dt>应用名称</dt><dd>' + app.name + '</dd>' +
        '<dt>client_id</dt><dd class="mono">' + clientId + '</dd>' +
        '<dt>client_secret</dt><dd><span class="mono">' + cs.secretPlaceholder + '</span>（一次性展示，关闭后不可再查看）</dd>' +
        '<dt>令牌端点</dt><dd class="mono">' + (app.tokenEndpoint || cs.tokenEndpoint) + '</dd>' +
        '<dt>鉴权方式</dt><dd>' + cs.authMode + '</dd>' +
        '<dt>有效范围</dt><dd>' + (app.scopes || []).join(", ") + '</dd>' +
        '<dt>环境</dt><dd>' + cs.env + '</dd>' +
        '<dt>交付留痕编号</dt><dd class="mono">' + stamp + '</dd>' +
      '</dl>' +
      '<h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:16px 0 8px">常见错误码表</h4>' +
      '<div class="table-wrap"><table class="tbl"><tr><th>错误码</th><th>含义</th></tr>' +
        MOCK.errCodes.map(e => '<tr><td class="mono">' + e.code + '</td><td>' + e.desc + '</td></tr>').join("") + '</table></div>',
    onSubmit: () => {
      CM.close("cm-ig-cred-dl");
      msg("success", "凭证单 PDF 已生成并下载（交付留痕 " + stamp + "，写 audit_operation_log）");
    }
  });
}
/* ---- 接入指南 Tab 内容（J1-F04 实体化） ---- */
function igRenderGuideTab() {
  return `<div class="list-toolbar mb-3"><div class="left"></div><div class="right"><a class="btn btn-sm" href="console.html?page=app-register">← 应用注册</a></div></div>
    <div class="guide-card">
      <div class="gc-head">📚 接入指南（J1-F04 · V1.0）<span class="fs-12 text-secondary" style="font-weight:400">文档与 SDK<b>同源抽取</b>，不脱节；接口见详细设计 §4</span></div>
      ${MOCK.guideIndex.map(g => `<div class="gc-item"><span>${g.icon}</span><span class="gc-txt"><b>${g.title}</b><div class="fs-12 text-secondary">${g.desc}</div></span><button class="btn btn-sm" onclick="igShowGuide('${g.id}')">查看</button></div>`).join("")}
    </div>
    <div class="guide-card">
      <div class="gc-head">⬇ 示例工程下载</div>
      <div class="guide-demo-grid">
        ${MOCK.guideDemos.map(d => `<div class="card" style="padding:12px"><b>${d.name}</b><div class="fs-12 text-secondary" style="margin:4px 0 8px">${d.desc}</div><button class="btn btn-sm btn-primary" onclick="igDownloadDemo('${d.id}')">下载</button> <button class="btn btn-sm" onclick="msg('info','${d.repo}（原型演示）')">Git 仓库</button></div>`).join("")}
      </div>
      <div class="fs-12 text-secondary mt-3">ℹ <b>联调沙箱</b>：V1.0 用 <b>test 环境</b>（见指南）；Postman 集合随文档提供。</div>
    </div>
    <div class="readonly-banner" style="background:var(--bmp-color-warning-light);border-color:var(--bmp-color-warning-light);color:var(--bmp-color-warning-dark)">
      ⚙ <b>应用中台审批（C1）</b>：人在门户/待办办理或中台完成流转后，终态在 <b>C1 工作流</b>。业务系统发起流程时登记 <span class="mono">callbackUrl</span>（<b>主通道</b>，必接以回写单据）；<b>建议</b>再订阅 <span class="mono">wf.instance.completed</span> / <span class="mono">wf.task.completed</span>（<b>辅通道</b>，注册时勾选 · 能力目录）。消费按 <span class="mono">eventId</span> 幂等；丢失时用 <span class="mono">GET /v1/workflow/instance</span> 对账。
    </div>
    <div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">🔓 接入指南对<b>所有登录用户可见</b>（接入方视角，不挂管理权限）；本页为内联抽屉承载，<b>不引入完整开发者门户</b>（澄清 :525 明文要求）。</div>`;
}
/* ---- 接入指南文档索引抽屉（内联 markdown 摘要，不跳独立门户页） ---- */
function igShowGuide(id) {
  const g = MOCK.guideIndex.find(x => x.id === id) || { title: "接入指南", desc: "" };
  const outline = {
    "G-01": ["1. SSO / OIDC 接入（授权码 + PKCE）", "2. 获取 client_id / client_secret", "3. 令牌换取（client_credentials · Basic）", "4. 待办推送 /v1/todo/push", "5. 消息发送 /v1/msg/send", "6. 权限校验 @PermCheck ｜ 审计 @AuditLog"],
    "G-02": ["① 注册申请（API / 事件 / 回调域）→ ② 钉钉对齐键 → ③ 审批领取凭证 → ④ SSO / SDK → ⑤ 流程 callbackUrl + 可选 wf.* 事件 → ⑥ 冒烟（权限迁移走实施导入）"],
    "G-03": ["· 凭证申领：《接入凭证单》一次性展示", "· 令牌端点：POST /v1/oauth/token", "· 鉴权：client_credentials / Basic", "· 错误码：401 invalid_client / 403 insufficient_scope / 400 invalid_grant"],
    "G-04": ["GET /v1/user/profile（profile）", "GET /v1/org/tree（org）", "POST /v1/todo/push（todo.push）", "POST /v1/msg/send（msg.send）"],
    "G-05": ["▲ [破坏性] v1.1 回调签名头由 X-Sign 更名为 X-BMP-Signature（提前 30 天公告）", "· [新增] 只读 API /v1/org/tree 支持 path 过滤", "· [修复] 令牌端点 5xx 重试策略优化"]
  }[id] || [];
  CM.openDrawer({
    id: "cm-ig-guide",
    title: "接入指南 · " + g.title,
    width: 720,
    submitText: false,
    body: '<div class="fs-13 text-secondary mb-3">' + g.desc + '</div><ul style="line-height:2">' +
      outline.map(o => '<li>' + o + '</li>').join("") + '</ul>' +
      '<div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">ℹ 文档为内联抽屉（不跳独立门户页）；正式文档由 OpenAPI / 详细设计 §4 <b>同源抽取</b>。</div>'
  });
}
/* ---- 示例工程下载（原型演示） ---- */
function igDownloadDemo(id) {
  const d = MOCK.guideDemos.find(x => x.id === id) || { name: "示例工程" };
  msg("info", `示例工程 ${id}（${d.name}）开始下载（含 README 与 2 个可运行 demo）`);
}

/* ============================================================
   UI-C-16 · 权限迁移 Tab 内容（J2-F05 实体化）
   ------------------------------------------------------------
   三区：❶ 采集进度（批次） / ❷ 失败明细（可导 CSV） / ❸ 仲裁队列（三类入队）
   边界（页内显式标注）：只搬「授权关系」——不造身份（B3-F03）、不造权限点（B2-F02）、
   不造角色（B2-F01）；未命中一律入仲裁队列，不静默丢弃。
   高危：配置映射规则 / 导入 均走 highRisk + 影响面提示 + 快照留痕。
   ★ 仲裁队列「默认无全选通过」：批量裁决须逐条填依据（S4 断言）。
   ============================================================ */
/* ---------- UI-C-16 ❷ 组织映射（B3-F03「系统人员组织映射」· P0/V1.0） ----------
   接入序列第 2 步：应用注册 → 业务系统权威源配置（账号 + 组织映射）→ 权限迁移 → 事件订阅。
   边界：本 Tab 管「源系统组织 ↔ 中台组织」的组织结构对应（组织树级，可跨级/可裁剪）；
        与账号映射（sys_account_mapping）配对；与数据权限 B2-F03 不同（后者管「能看哪些数据」，V1.5）。 */
const ORG_MAP_TYPE = { 1: "精确", 2: "前缀", 3: "默认归属" };
const ORG_MAP_STATUS = {
  0: { label: "待映射", cls: "mig-tag-idle" },
  1: { label: "已映射", cls: "mig-tag-done" },
  2: { label: "冲突",   cls: "mig-tag-arb" },
  3: { label: "失败",   cls: "mig-tag-fail" }
};
function igRenderOrgMapTab(tierFilter) {
  tierFilter = tierFilter || window._igMapTierFilter || "need_mapping";
  /* 标准档：本页不要求全量 sys_org_mapping，展示空态引导 */
  if (tierFilter === "standard") {
    const stdApps = MOCK.getRegApplications().filter(a => a.integrationTier === "standard");
    const names = stdApps.map(a => `<b>${a.appName}</b>（<span class="mono">${a.systemCode}</span>）`).join("、") || "（暂无标准档申请）";
    return `<div class="state-box"><div class="illus">✅</div>
      <div class="txt"><b>标准档应用无需维护全量组织对照</b></div>
      <div class="fs-13 text-secondary mt-2">应用侧持久化对齐键（如 dingtalk_userid + md_org_id），经主数据事件/API 同步即可；审批<b>不</b>因本页未完成而阻塞。</div>
      <div class="fs-13 mt-3">当前标准档申请：${names}</div>
      <a class="btn btn-sm btn-primary mt-3" href="console.html?page=app-register">返回应用注册</a></div>`;
  }
  let rows = MOCK.orgMapping;
  if (tierFilter === "legacy") {
    rows = rows.filter(r => r.system_code === "KMS" || r.system_code === "OKR");
  } else if (tierFilter === "need_mapping") {
    /* 过渡/Legacy 相关 system_code（原型：排除纯标准档演示系统 PM） */
    rows = rows.filter(r => r.system_code !== "PM");
  }
  const mt = MOCK.orgMappingMetric;
  const ro = !!window._permRO;
  const typeTag = v => `<span class="tag tag-info">${ORG_MAP_TYPE[v] || "—"}</span>`;
  const stTag = v => {
    const s = ORG_MAP_STATUS[v] || { label: "未知", cls: "mig-tag-idle" };
    return `<span class="mig-tag ${s.cls}">${s.label}(${v})</span>`;
  };
  const body = rows.map((r, i) => {
    const unmapped = r.sync_status === 0;
    const target = r.target_org_id == null
      ? `<span class="text-secondary">— <span class="mono">target_org_id=NULL</span></span>`
      : `<b>${r.target_org_name}</b><div class="fs-12 text-secondary mono">md_org.id=${r.target_org_id}</div>`;
    const act = ro ? '<span class="fs-12 text-secondary">只读</span>' : `
      <button class="btn-text" onclick="igOrgMapEdit('${r.id}')">编辑</button>
      <button class="btn-text danger" onclick="igOrgMapRemove('${r.id}')">移除</button>`;
    return `<tr data-org-map-row="${i}">
      <td>${r.system_code}</td>
      <td class="mono">${r.source_org_code}</td>
      <td>${r.source_org_name}${unmapped ? `<div class="fs-12" style="color:var(--bmp-color-warning-dark)">⚠ 待映射：源组织未落到任何中台组织</div>` : ""}</td>
      <td>${target}</td>
      <td>${typeTag(r.mapping_type)}</td>
      <td>${stTag(r.sync_status)}</td>
      <td class="ops">${act}</td>
    </tr>`;
  }).join("");
  return `
    <div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
      🧩 <b>组织映射（B3-F03「系统人员组织映射」· P0/V1.0）</b>：配置<b>源系统组织 ↔ 中台组织</b>的映射（<b>组织树级</b>：可跨级归并、可裁剪子树）。
      &nbsp;·&nbsp; 与<b>账号映射</b> <span class="mono">sys_account_mapping</span> <b>配对</b>（本 Tab 定「组织结构怎么对应」，账号映射定「谁的账号是谁」，同属接入第 2 步）——
      <a href="console.html?page=employees">[去账号映射]</a>。
      &nbsp;·&nbsp; <b>与数据权限 B2-F03 不同</b>：<b>本点管「组织结构怎么对应」</b>，<code>B2-F03</code> 管「能看哪些数据」（V1.5），两者<b>不可互相替代</b>。
      &nbsp;·&nbsp; 落表 <span class="mono">sys_org_mapping</span>（bmp_sys），UK=<span class="mono">(system_code, source_org_code)</span>。
    </div>
    <div class="readonly-banner" style="background:var(--bmp-color-warning-light);border-color:var(--bmp-color-warning-light);color:var(--bmp-color-warning-dark)">
      ⚠ <b>未映射组织不静默丢弃</b>：<span class="mono">sync_status=0</span> 的源组织须<b>配置映射</b>或<b>设默认归属</b>（<span class="mono">mapping_type=3</span>）。同步时未命中一律入表待处理，不落数据、不静默过滤。
    </div>
    <div class="perm-progress">
      <div class="pp-title">映射完成度（接入序列第 2 步验收物 · 组织树级）</div>
      <div class="pp-metrics">
        <span>待映射(0) <b>${mt.todos}</b></span>
        <span>已映射(1) <b>${mt.mapped}</b></span>
        <span>冲突(2) <b>${mt.conflict}</b></span>
        <span>失败(3) <b>${mt.failed}</b></span>
        <span>合计 <b>${rows.length}</b></span>
      </div>
      <div class="pp-goal">Legacy / 过渡档收敛：<span class="mono">count(sync_status ∈ {0,2,3}) = 0</span> 或申请勾选兜底；<b>标准档审批不依赖本页</b>。</div>
    </div>
    <div class="list-toolbar">
      <div class="left">
        <button class="btn btn-primary" onclick="igOrgMapAdd()">＋ 新增映射</button>
        <button class="btn btn-sm" onclick="igOrgMapBulkImport()">导入 Excel</button>
        <button class="btn btn-sm" onclick="igOrgMapPrefixRules()">前缀/默认规则</button>
        <span class="fs-12 text-secondary">共 ${rows.length} 条组织映射 · 覆盖 ${[...new Set(rows.map(r => r.system_code))].length} 个业务系统</span>
      </div>
      <div class="right">映射类型：精确 / 前缀（子树归并）/ 默认归属（兜底）</div>
    </div>
    <div class="table-wrap"><table class="tbl">
      <tr><th>源系统</th><th>源组织编码</th><th>源组织名称</th><th>→ 目标中台组织</th><th>映射类型</th><th>状态</th><th>操作</th></tr>
      ${body}
    </table></div>
    <div class="fs-12 text-secondary mt-3">ℹ 字段口径：<span class="mono">system_code</span> / <span class="mono">source_org_code</span>（源组织编码）/ <span class="mono">target_org_id</span>（中台 <span class="mono">md_org.id</span>，<b>未映射=NULL</b>）/ <span class="mono">mapping_type</span>（1 精确 / 2 前缀 / 3 默认归属）/ <span class="mono">sync_status</span>（0 待映射 / 1 已映射 / 2 冲突 / 3 失败）。</div>`;
}
/* 目标中台组织下拉项（扁平化 MOCK.orgTree → path 名称）；停用组织标注，选中即触发「失败」示例 */
function igOrgTargetOptions() {
  const out = [];
  (function walk(n, path) {
    const full = path ? path + "/" + n.name : n.name;
    out.push({ value: n.id, label: full + (n.disabled ? "（已停用）" : "") });
    (n.children || []).forEach(c => walk(c, full));
  })(MOCK.orgTree, "");
  return out;
}
/* 组织映射抽屉字段（新增 / 编辑复用）——UK 唯一性 + 目标组织必填（未映射须显式选「默认归属」） */
function igOrgMapFields(v) {
  v = v || {};
  const systems = ["CRM", "REC", "OKR", "KMS", "DATA"];
  return [
    { name: "system_code", label: "源系统（system_code）", type: "select", required: true, value: v.system_code || "CRM", options: systems },
    { name: "source_org_code", label: "源组织编码（source_org_code）", type: "text", required: true, value: v.source_org_code || "",
      placeholder: "如：D100-02", tip: "与 system_code 组成唯一键 UK(system_code, source_org_code)",
      validators: [(val) => {
        const s = String(val || "").trim();
        if (!s) return "源组织编码必填";
        if (!/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(s)) return "仅允许字母/数字/下划线/连字符，且字母或数字开头";
        const dup = MOCK.orgMapping.some(m => m.system_code === (v.system_code || "CRM") && m.source_org_code === s && m.id !== v.id);
        return dup ? "该源系统下已存在同编码映射（唯一性校验不通过）" : null;
      }] },
    { name: "source_org_name", label: "源组织名称", type: "text", required: true, value: v.source_org_name || "", placeholder: "如：销售部/华东大区" },
    { name: "target_org_id", label: "目标中台组织（target_org_id）", type: "select", required: true,
      value: v.target_org_id == null ? "" : v.target_org_id, placeholder: "请选择 md_org（未映射须设默认归属）", options: igOrgTargetOptions() },
    { name: "mapping_type", label: "映射类型", type: "select", required: true, value: v.mapping_type || 1,
      options: [{ value: 1, label: "1 精确（逐组织一一对应）" }, { value: 2, label: "2 前缀（源编码前缀 → 整棵子树归并）" }, { value: 3, label: "3 默认归属（兜底，未命中走此条）" }] }
  ];
}
/* ---- 组织映射：新增 / 编辑 / 移除（复用 CM.openDrawer + highRisk，不手写开合） ---- */
function igOrgMapSubmit(values, id) {
  const sys = values.system_code, code = String(values.source_org_code || "").trim();
  const dup = MOCK.orgMapping.some(m => m.system_code === sys && m.source_org_code === code && m.id !== id);
  if (dup) { msg("error", "该源系统下已存在同编码映射（UK 唯一性校验不通过）"); return; }
  CM.close("cm-org-map-edit");
  msg("success", `组织映射「${sys} · ${code} → md_org.id=${values.target_org_id}」已保存，立即生效（写审计日志）`);
  route();
}
function igOrgMapAdd() {
  CM.openDrawer({
    id: "cm-org-map-edit",
    title: "新增组织映射 · B3-F03",
    width: 720,
    submitText: "保存映射",
    body: '<div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">🧩 粒度 = <b>组织树级</b>：<b>前缀</b>型可把源侧一棵子树整体归并到某个中台组织；<b>默认归属</b>型作为兜底，保证<b>未映射组织不静默丢弃</b>。</div>',
    fields: igOrgMapFields(),
    onSubmit: (values) => igOrgMapSubmit(values, null)
  });
}
function igOrgMapEdit(id) {
  const m = MOCK.orgMapping.find(x => x.id === id);
  if (!m) return;
  CM.openDrawer({
    id: "cm-org-map-edit",
    title: "编辑组织映射 · " + m.system_code + " · " + m.source_org_code,
    width: 720,
    submitText: "保存变更",
    body: '<div class="readonly-banner" style="background:var(--bmp-color-warning-light);border-color:var(--bmp-color-warning-light);color:var(--bmp-color-warning-dark)">⚠ 变更将写入 <span class="mono">sys_org_mapping</span> 并产生 <span class="mono">md.org.changed</span> 相关事件；已同步的账号组织归属将在下次同步生效。</div>',
    fields: igOrgMapFields(m),
    onSubmit: (values) => igOrgMapSubmit(values, id)
  });
}
function igOrgMapRemove(id) {
  const m = MOCK.orgMapping.find(x => x.id === id);
  if (!m) return;
  highRisk("移除组织映射",
    `源系统 <b>${m.system_code}</b> 的组织 <span class="mono">${m.source_org_code}</span>（${m.source_org_name}）将失去映射：<br>移除后该源组织<b>回落到「待映射」(sync_status=0)</b> 并阻断后续同步（若已配默认归属则回落至兜底）。移除立即生效并写审计日志。`,
    "移除",
    `组织映射「${m.system_code} · ${m.source_org_code}」已移除（该源组织回落为「待映射」，写审计日志）`);
}

/* ---- 权限迁移 Tab 渲染（V2.0 备选 · V1.5 不挂菜单；保留供走查/回归，勿删） ---- */
function igRenderPermTab() {
  const m = MOCK.permMigration, q = m.metric, ro = !!window._permRO;
  const blocking = !m.mappingReady
    ? `<div class="readonly-banner" style="background:var(--bmp-color-danger-light);border-color:var(--bmp-color-danger-light);color:var(--bmp-color-danger-dark)">⛔ 账号映射（B3-F03）未建立，采集被阻断。<a href="console.html?page=employees">[去账号映射]</a></div>`
    : "";
  const roBanner = ro
    ? `<div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">🔒 当前角色无 <span class="mono">system:perm:migration:manage</span> 权限，本 Tab <b>只读</b>（可看进度，不可裁决 / 导入 / 改规则）。</div>`
    : "";
  const batchRows = MOCK.permBatches.map(b => `<tr>
      <td class="mono">${b.batch}</td><td>${b.system}</td><td>${b.type}</td>
      <td>${statusTag(b.result, { "成功": "success", "部分失败": "warning", "失败": "danger" })}</td>
      <td class="mono">${b.normalized}</td><td class="mono">${b.arb}</td><td class="mono">${b.cost}</td>
      <td class="ops">
        <button class="btn-text" onclick="permDetailDrawer('${b.batch}')">详情</button>
        <button class="btn-text" onclick="permRerun('${b.batch}')">重跑</button>
        <button class="btn-text" onclick="permExport('batch')">导出</button>
      </td>
    </tr>`).join("");
  const arbRows = MOCK.permArbQueue.map(a => {
    const chip = a.typeCode === 2 ? "mig-tag-arb" : a.typeCode === 3 ? "mig-tag-arb" : "mig-tag-arb";
    const act = a.typeCode === 2
      ? `<button class="btn-text" onclick="permArbDrawer('${a.id}')">裁决</button><button class="btn-text" onclick="msg('info','跳转账号映射页（B3-F03）補账号映射')">去映射</button>`
      : a.typeCode === 3
        ? `<button class="btn-text" onclick="permArbDrawer('${a.id}')">裁决</button><button class="btn-text" onclick="msg('info','跳转权限点管理（UI-C-03 / B2-F02）定义权限点')">去定义</button>`
        : `<button class="btn-text" onclick="permArbDrawer('${a.id}')">裁决</button><button class="btn-text" onclick="msg('info','已保留中台授权（以中台为准）')">保留</button>`;
    return `<tr>
      <td><span class="mig-tag ${chip}">${a.type}</span></td>
      <td class="mono">${a.local}</td><td class="mono">${a.perm}</td>
      <td>${a.suggest}</td><td class="fs-12 text-secondary">${a.basis}</td>
      <td class="ops">${ro ? '<span class="fs-12 text-secondary">只读</span>' : act}</td>
    </tr>`;
  }).join("");
  return `${blocking}${roBanner}
    <div class="filter-bar" style="grid-template-columns:repeat(4,1fr)">
      <div class="field"><label>采集系统</label><select class="select">${m.systems.map(s => `<option${s === m.system ? " selected" : ""}>${s}</option>`).join("")}</select></div>
      <div class="field"><label>批次</label><select class="select">${MOCK.permBatches.map(b => `<option${b.batch === m.batch ? " selected" : ""}>${b.batch}</option>`).join("")}</select></div>
      <div class="f-ops" style="grid-column:3 / span 2">
        ${ro ? "" : '<button class="btn btn-primary" onclick="msg(\'info\',\'采集任务已提交（只读采集，写审计日志）\')">▶ 执行采集</button>'}
        <button class="btn" onclick="permCfgWizard()">配置</button>
        <button class="btn" onclick="permImport()">批量导入（高危）</button>
      </div>
    </div>
    <div class="perm-progress">
      <div class="pp-title">迁移完成度（七步 Checklist 第 4 步验收物）</div>
      <div class="pp-metrics">
        <span>应采集(目标) <b>${q.expect.toLocaleString()}</b></span>
        <span>源侧采集 <b>${q.collected.toLocaleString()}</b></span>
        <span>待映射(0) <b>${q.todos}</b></span>
        <span>已映射(1) <b>${q.mapped.toLocaleString()}</b></span>
        <span>已导入(5) <b>${q.imported.toLocaleString()}</b></span>
        <span>仲裁中(2/3/4) <b>${q.arb}</b></span>
        <span>失败(6) <b>${q.failed}</b></span>
        <span>已驳回(7) <b>${q.rejected}</b></span>
      </div>
      <div class="pp-bar"><span style="width:${q.rate}%"></span></div>
      <div class="pp-goal">迁移完整率 <b>${q.rate}%</b>（=已导入/应采集；目标 100%）；差异未收敛 → 不导入、不切换（并行期双跑核对）。<span class="mono">H1 等式核对：源侧采集 ${q.collected.toLocaleString()} ≡ 待映射${q.todos}+已映射${q.mapped}+仲裁${q.arb}+已导入${q.imported}+失败${q.failed}+已驳回${q.rejected}（批次结束须待映射(0)=0）</span></div>
    </div>
    <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:16px 0 10px">❶ 采集进度（批次列表）</h4>
    <div class="table-wrap"><table class="tbl">
      <tr><th>批次</th><th>系统</th><th>类型</th><th>结果</th><th>已归一</th><th>冲突</th><th>耗时</th><th>操作</th></tr>
      ${batchRows}
    </table></div>
    <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:16px 0 10px">❷ 失败明细（可导出 CSV）</h4>
    <div class="table-wrap"><table class="tbl">
      <tr><th>行号</th><th>源账号</th><th>源权限</th><th>字段</th><th>错误原因（字段级）</th></tr>
      ${MOCK.permFailDetail.map(f => `<tr><td class="mono">${f.row}</td><td class="mono">${f.local}</td><td class="mono">${f.perm}</td><td class="mono">${f.field}</td><td>${f.reason}</td></tr>`).join("")}
    </table></div>
    <div class="mt-2"><button class="btn btn-sm" onclick="permExport('fail')">导出 CSV</button></div>
    <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:16px 0 10px">❸ 仲裁队列（仅 2/3/4 待仲裁 · 默认不提供「整批通过」）</h4>
    <div class="readonly-banner" style="background:var(--bmp-color-warning-light);border-color:var(--bmp-color-warning-light);color:var(--bmp-color-warning-dark)">
      ⚠ 本视图<b>只搬授权关系</b>：不造身份（账号归一查 B3-F03）、不造权限点（引用 B2-F02）、不造角色（引用 B2-F01）；未命中一律入队，<b>不静默丢弃</b>。队列清空判据 <span class="mono">count(mapping_status ∈ {2,3,4}) = 0</span>（<b>不含 7</b>）。
    </div>
    <div class="table-wrap"><table class="tbl">
      <tr><th>类型</th><th>源账号</th><th>源权限</th><th>建议动作</th><th>依据</th><th>操作</th></tr>
      ${arbRows}
    </table></div>
    <div class="mt-2">${ro ? "" : `<button class="btn btn-sm" onclick="permArbDrawer('batch')">批量裁决（需逐条填依据）</button>`}
      <button class="btn btn-sm" onclick="permExport('arb')">导出 CSV</button></div>
    <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:16px 0 10px">已关闭（终态 · 可重跑）<span class="fs-12 text-secondary" style="font-weight:400">—— mapping_status=7「已驳回」，不占仲裁队列计数</span></h4>
    <div class="table-wrap"><table class="tbl">
      <tr><th>状态</th><th>源账号</th><th>源权限</th><th>说明</th><th>驳回原因</th><th>操作</th></tr>
      ${MOCK.permArbClosed.map(c => `<tr>
        <td><span class="mig-tag mig-tag-closed">已关闭</span></td>
        <td class="mono">${c.local}</td><td class="mono">${c.perm}</td>
        <td class="fs-12 text-secondary">${c.suggest}</td>
        <td>${c.reason}<div class="fs-12 text-secondary">${c.by} · ${c.time}</div></td>
        <td class="ops">${ro ? '<span class="fs-12 text-secondary">只读</span>' : `<button class="btn-text" onclick="permRerun('${c.id}')">重跑</button>`}</td>
      </tr>`).join("")}
    </table></div>`;
}

/* ---- 权限迁移：配置采集向导（抽屉内 3 步；通道只读探测通过才可保存；配映射规则=高危） ---- */
let _permProbePassed = false;
function permCfgWizard() {
  _permProbePassed = false;
  CM.openWizard({
    id: "cm-perm-cfg",
    container: "drawer",
    title: "配置采集 · 存量权限采集适配器",
    width: 720,
    submitText: "保存配置",
    steps: [
      {
        title: "采集通道",
        fields: [
          { name: "system", label: "采集系统（system_code）", type: "select", required: true, options: MOCK.permMigration.systems },
          { name: "proto", label: "协议", type: "select", options: ["JDBC（只读读表）", "REST（只读权限接口）"] },
          { name: "addr", label: "连接地址 / 接口", type: "text", required: true, placeholder: "如：jdbc:mysql://crm-db:3306/crm 只读账号" },
          { name: "auth", label: "鉴权方式", type: "select", options: ["最小权限只读账号", "OAuth2 client_credentials"] }
        ],
        render: () => '<div class="fs-13 text-secondary mb-2">通道须「<b>只读探测</b>」（读 1 条样本）通过后才可保存；采集全程只读，<b>不写源系统</b>。</div>' +
          '<button class="btn btn-sm mb-2" onclick="permProbe()">▶ 只读探测（读 1 条样本）</button><div class="log-stream" id="cm-perm-probe">等待探测…</div>',
        validate: () => (_permProbePassed ? null : "请先完成「只读探测」并通过")
      },
      {
        title: "采集范围",
        fields: [
          { name: "scope", label: "采集范围", type: "select", required: true, options: ["全量", "增量"] },
          { name: "window", label: "增量时间窗（增量时）", type: "text", placeholder: "如：近 7 天" }
        ],
        render: () => '<div class="fs-13 text-secondary mb-2">初次采集按「全量」；后续按增量。幂等键 (system_code, account_id, target_type, target_code) 防重复导入。</div>'
      },
      {
        title: "权限项映射规则",
        fields: [
          { name: "src", label: "源权限标识 (source_perm_code)", type: "text", required: true, placeholder: "如：crm_order_manage" },
          { name: "targetType", label: "映射目标类型", type: "select", required: true, options: [{ value: "1", label: "权限点（sys_permission）" }, { value: "2", label: "角色（sys_role）" }] },
          { name: "targetCode", label: "中台目标 code", type: "text", required: true, placeholder: "如：crm:order:manage" }
        ],
        render: () => '<div class="readonly-banner" style="background:var(--bmp-color-warning-light);border-color:var(--bmp-color-warning-light);color:var(--bmp-color-warning-dark)">⚠ <b>配置映射规则 = 高危元权限</b>：一条规则可批量映射到高权角色。保存前将提示<b>影响面（受影响账号数）</b>并写审计；规则经 I1-F02 配置中心托管。</div>'
      }
    ],
    onDone: (ctx) => {
      const v = (ctx && ctx.values) || {};
      highRisk("配置权限映射规则",
        `将为系统 <b>${v.system || "—"}</b> 保存映射规则：源 <span class="mono">${v.src || "—"}</span> → 目标 <span class="mono">${v.targetType === "2" ? "角色" : "权限点"}/${v.targetCode || "—"}</span>。<br>影响面：约 <b>1,240</b> 个账号的授权关系；导入前将生成快照，全程留痕（before/after + 裁决人 + 依据）。`,
        "确认",
        "权限映射规则已保存并生效（写审计日志；导入走独立高危确认）");
    }
  });
}
/* 只读探测（读 1 条样本）：日志流 + 末行放行门禁 */
function permProbe() {
  const el = document.getElementById("cm-perm-probe");
  if (!el) return;
  _permProbePassed = false;
  const lines = ["[探测] 建立只读连接… OK", "[探测] 读取权限样本 1 条… OK（sample: zhs01 / crm_order_manage）", "[探测] 校验只读权限（无写权限）… OK", "✅ 只读探测通过，可保存采集通道"];
  el.innerHTML = "";
  lines.forEach((l, i) => setTimeout(() => {
    el.innerHTML += l + "<br>"; el.scrollTop = el.scrollHeight;
    if (i === lines.length - 1) _permProbePassed = true;
  }, i * 220));
}
/* ---- 权限迁移：批量导入（高危，改写全公司授权；导入前快照 + 影响面提示） ---- */
function permImport() {
  highRisk("执行权限迁移导入",
    "导入将按已映射的规则<b>批量写入</b>全公司授权关系（<span class='mono'>sys_user_role / sys_role_permission</span>）。<br>影响面：约 <b>1,102</b> 条已映射、涉及 <b>980</b> 个账号。导入前自动<b>生成快照</b>（可回滚）；V1.5 <b>只增不减</b>（不支持反向删权）。全程留痕。",
    "导入",
    "权限迁移导入完成：已写入 980 条授权关系，快照 SNAP-20261016-01 已生成（写审计日志）");
}
/* ---- 权限迁移：重跑批次 ---- */
function permRerun(batch) {
  highRisk("重跑采集批次",
    `将重跑批次 <b>${batch}</b>（只读采集 + 重新归一/映射）。失败行可重传；已导入行按幂等键 upsert，不重复写入。`,
    batch,
    `批次 ${batch} 已触发重跑（写审计日志）`);
}
/* ---- 权限迁移：明细抽屉（全部 / 失败 / 仲裁中 / 已关闭，支持导出 CSV） ---- */
function permDetailDrawer(batch) {
  const fail = MOCK.permFailDetail, arb = MOCK.permArbQueue, closed = MOCK.permArbClosed;
  CM.openDrawer({
    id: "cm-perm-detail",
    title: "迁移明细 · 批次 " + batch,
    width: 960,
    submitText: false,
    body: '<div class="fs-13 text-secondary mb-2">逐行：<span class="mono">system_code + local_username + source_perm_code → account_id → target_code → mapping_status</span>；幂等键重复行高亮。</div>' +
      '<div class="flex gap-2 mb-2">' +
        '<button class="btn btn-sm" onclick="msg(\'info\',\'已切换到「全部」明细视图\')">全部</button>' +
        '<button class="btn btn-sm" onclick="msg(\'info\',\'已切换到「失败(6)」明细视图\')">失败(6)（' + fail.length + '）</button>' +
        '<button class="btn btn-sm" onclick="msg(\'info\',\'已切换到「仲裁中(2/3/4)」明细视图\')">仲裁中(2/3/4)（' + arb.length + '）</button>' +
        '<button class="btn btn-sm" onclick="msg(\'info\',\'已切换到「已关闭(7)」明细视图\')">已关闭(7)（' + closed.length + '）</button>' +
        '<button class="btn btn-sm" onclick="permExport(\'fail\')">导出 CSV</button>' +
      '</div>' +
      '<div class="table-wrap"><table class="tbl"><tr><th>行号</th><th>源账号</th><th>源权限</th><th>目标</th><th>mapping_status</th><th>说明</th></tr>' +
        fail.map(f => '<tr><td class="mono">' + f.row + '</td><td class="mono">' + f.local + '</td><td class="mono">' + f.perm + '</td><td>—</td><td><span class="mig-tag mig-tag-fail">6 失败</span></td><td>' + f.reason + '</td></tr>').join("") +
        arb.map(a => '<tr><td class="mono">—</td><td class="mono">' + a.local + '</td><td class="mono">' + a.perm + '</td><td>—</td><td><span class="mig-tag mig-tag-arb">' + a.typeCode + " " + a.type + '</span></td><td>' + a.basis + '</td></tr>').join("") +
        closed.map(c => '<tr><td class="mono">—</td><td class="mono">' + c.local + '</td><td class="mono">' + c.perm + '</td><td>—</td><td><span class="mig-tag mig-tag-closed">7 已驳回（已关闭）</span></td><td>' + c.reason + '</td></tr>').join("") +
      '</table></div>'
  });
}
/* ---- 权限迁移：仲裁（裁决）抽屉（单条 / 批量；依据必填；★ 无「整批通过」） ---- */
function permArbDrawer(id) {
  const isBatch = id === "batch";
  if (isBatch) {
    const fields = MOCK.permArbQueue.map(a => ({
      name: "basis_" + a.id,
      label: "依据 · " + a.type + " · " + a.local,
      type: "text",
      required: true,
      placeholder: "逐条填写裁决依据（必填）"
    }));
    const rows = MOCK.permArbQueue.map(a => `<tr>
      <td><span class="mig-tag mig-tag-arb">${a.type}</span></td>
      <td class="mono">${a.local}</td><td class="mono">${a.perm}</td><td>${a.suggest}</td><td>${a.basis}</td>
      <td><select class="select" data-arb-act="${a.id}"><option>采纳建议</option><option>保留中台</option><option>以源为准</option><option>驳回</option></select></td>
    </tr>`).join("");
    CM.openDrawer({
      id: "cm-perm-arb",
      title: "批量裁决（逐条填依据）",
      width: 960,
      submitText: "提交裁决",
      body: '<div class="readonly-banner" style="background:var(--bmp-color-warning-light);border-color:var(--bmp-color-warning-light);color:var(--bmp-color-warning-dark)">⚠ 高危批量操作：<b>不支持整批放行</b>（防一键误挂高权）；每条裁决<b>依据必填</b>，驳回记录驳回原因，全程留痕（before/after + 裁决人 + 依据）。</div>' +
        '<div class="table-wrap"><table class="tbl"><tr><th>类型</th><th>源账号</th><th>源权限</th><th>建议动作</th><th>依据</th><th>裁决</th></tr>' + rows + '</table></div>',
      fields: fields,
      onSubmit: () => {
        CM.close("cm-perm-arb");
        msg("success", `已提交 ${MOCK.permArbQueue.length} 条裁决（每条含依据，写审计日志）`);
      }
    });
  } else {
    const a = MOCK.permArbQueue.find(x => x.id === id) || MOCK.permArbQueue[0];
    CM.openDrawer({
      id: "cm-perm-arb",
      title: "裁决 · " + a.type + " · " + a.local,
      width: 720,
      submitText: "提交裁决",
      body: '<div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">依据<b>必填</b>；提交后记录 before/after + 裁决人 + 依据（写审计日志）。<b>驳回</b> → 记录驳回原因，行转为 <span class="mono">mapping_status=7</span>「<b>已关闭</b>」终态（移出主队列，可重跑）。</div>' +
        '<dl class="desc-grid"><dt>类型</dt><dd>' + a.type + '</dd><dt>源账号</dt><dd class="mono">' + a.local + '</dd>' +
        '<dt>源权限</dt><dd class="mono">' + a.perm + '</dd><dt>建议动作</dt><dd>' + a.suggest + '</dd>' +
        '<dt>依据</dt><dd>' + a.basis + '</dd></dl>' +
        '<div class="card mt-3" style="padding:12px"><b>before / after 预览</b>' +
        '<div class="diff-box mt-2"><div class="del">- 源侧：' + a.local + ' → ' + a.perm + '</div>' +
        '<div class="add">+ 中台：' + (a.suggest === "补账号映射" ? "account_id=待归一" : a.suggest === "定义权限点" ? "target_code=待定义" : "保留中台既有授权") + '</div></div></div>',
      fields: [
        { name: "action", label: "裁决动作", type: "select", required: true, options: a.typeCode === 2 ? ["补账号映射", "驳回"] : a.typeCode === 3 ? ["定义权限点", "驳回"] : ["保留中台", "以源为准（默认关）", "驳回"] },
        { name: "basis", label: "裁决依据（必填）", type: "text", required: true, placeholder: "请填写裁决依据" }
      ],
      onSubmit: (values) => {
        CM.close("cm-perm-arb");
        const tail = values.action === "驳回" ? " → 转「已关闭」终态（mapping_status=7，移出主队列，可重跑）" : "";
        msg("success", `已裁决「${a.local}」：${values.action}${tail}（依据：${values.basis}；写审计日志）`);
      }
    });
  }
}
/* ---- 权限迁移：导出 CSV（失败明细 / 仲裁 / 批次） ---- */
function permExport(kind) {
  let name = "perm-migration", headers = [], rows = [];
  if (kind === "fail") {
    name = "perm-fail-detail"; headers = ["行号", "源账号", "源权限", "字段", "错误原因"];
    rows = MOCK.permFailDetail.map(f => [f.row, f.local, f.perm, f.field, f.reason]);
  } else if (kind === "arb") {
    name = "perm-arb-queue"; headers = ["类型", "源账号", "源权限", "建议动作", "依据"];
    rows = MOCK.permArbQueue.map(a => [a.type, a.local, a.perm, a.suggest, a.basis]);
  } else {
    name = "perm-batches"; headers = ["批次", "系统", "类型", "结果", "已归一", "冲突", "耗时"];
    rows = MOCK.permBatches.map(b => [b.batch, b.system, b.type, b.result, b.normalized, b.arb, b.cost]);
  }
  const csv = [headers.join(",")].concat(rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(","))).join("\n");
  try {
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name + ".csv";
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
    msg("success", "已导出 " + name + ".csv（口径与 UI-C-09 失败明细一致）");
  } catch (e) {
    msg("info", "导出降级：请手动复制（原型演示）");
  }
}

/* 判断回调域名是否在白名单内（原型：匹配 MOCK.callbackWhitelist 已登记域名） */
function igDomainAllowed(url) {
  try {
    const h = String(url).split("//")[1].split("/")[0];
    return MOCK.callbackWhitelist.some(w => String(w.domain).split("//")[1].split("/")[0] === h);
  } catch (e) { return false; }
}

/* ---- integration 重置 secret 高危确认 ---- */
function igResetSecret(clientId, name) {
  highRisk("重置应用密钥",
    `将重置应用 <b>${name}</b>（client_id: <span class="mono">${clientId}</span>）的 client_secret。重置后<b>旧密钥立即失效</b>，新密钥仅<b>一次性明文展示</b>，请立即保存；调用方需同步更新，否则接口将鉴权失败。`,
    clientId,
    `应用 ${clientId} 的 client_secret 已重置（写审计日志）`);
}

/* ---- integration 编辑 scope 抽屉（分组多选） ---- */
function igEditScope(clientId, name) {
  const scopes = ["profile（读取当前用户）", "org（组织只读）", "todo.push（待办推送）", "msg.send（消息发送）", "employee.read（人员只读）"];
  CM.openDrawer({
    id: "cm-ig-scope",
    title: "编辑 scope · " + name,
    width: 560,
    submitText: "保存 scope",
    body: '<div class="fs-13 text-secondary mb-3">client_id：<span class="mono">' + clientId + '</span> · 按最小授权原则勾选。</div>',
    fields: scopes.map((s, i) => ({ name: "scope_" + i, label: s, type: "checkbox", checkboxText: s, value: i < 2 })),
    onSubmit: (values) => {
      const picked = Object.keys(values).filter(k => values[k]).length;
      CM.close("cm-ig-scope");
      msg("success", `应用 ${clientId} 的 scope 已更新为 ${picked} 项（写审计日志）`);
      route();
    }
  });
}

/* ---- integration 回调域名白名单：共用字段 + 校验（新增/编辑复用） ---- */
function igWhitelistFields(v) {
  v = v || {};
  return [
    { name: "domain", label: "域名", type: "text", required: true, value: v.domain || "", placeholder: "https://xxx.lubon.com",
      tip: "必须 https；精确域名或 /path 前缀；拒 IP 直连与内网网段（防 SSRF）",
      validators: [(val) => {
        const s = String(val || "");
        if (!cmIsHttpsUrl(s)) return "必须为 https:// 开头的合法域名";
        if (cmIsIpHost(s)) return "不允许填写 IP 直连地址";
        if (cmIsIntranetHost(s)) return "不允许内网网段（防 SSRF）";
        if (!cmIsControlledPrefix(s)) return "仅允许精确域名或 /path 前缀（不支持通配符 *）";
        return null;
      }] },
    { name: "func", label: "消费功能点", type: "select", required: true, value: v.func || "A4-F01", options: ["A4-F01", "C1-F06", "A4-F01 / C1-F06"] },
    { name: "prefix", label: "允许路径前缀", type: "text", value: v.prefix || "", placeholder: "如：/v1/callback",
      validators: [(val) => (!val || String(val).indexOf("/") === 0 ? null : "路径前缀需以 / 开头")] },
    { name: "use", label: "用途说明", type: "text", value: v.use || "", placeholder: "选填" }
  ];
}
/* 域名唯一性校验（排除自身 id） */
function igWhitelistDup(domain, exceptId) {
  return MOCK.callbackWhitelist.some(w => w.domain.toLowerCase() === String(domain || "").toLowerCase() && w.id !== exceptId);
}

/* ---- integration 新增回调域名抽屉（复用 CM.openDrawer + 统一校验） ---- */
function igWhitelistAdd() {
  CM.openDrawer({
    id: "cm-ig-wl-edit",
    title: "新增回调域名",
    width: 720,
    submitText: "登记域名",
    body: '<div class="readonly-banner" style="background:var(--bmp-color-warning-light);border-color:var(--bmp-color-warning-light);color:var(--bmp-color-warning-dark)">ℹ <b>V1.0 目标态</b>：字段将落 <span class="mono">gov_app_register.domain_whitelist</span>（待后端字段就绪）。<b>提交前双校验</b>（前端 + 服务端），非 https / IP / 内网一律拒绝、不写库。</div>',
    fields: igWhitelistFields(),
    onSubmit: (values) => {
      if (igWhitelistDup(values.domain, null)) { msg("error", "该域名已登记（唯一性校验不通过）"); return; }
      CM.close("cm-ig-wl-edit");
      msg("success", `回调域名「${values.domain}」已登记，立即生效（写审计日志）`);
      route();
    }
  });
}
/* ---- integration 编辑回调域名抽屉 ---- */
function igWhitelistEdit(id) {
  const w = MOCK.callbackWhitelist.find(x => x.id === id);
  if (!w) return;
  CM.openDrawer({
    id: "cm-ig-wl-edit",
    title: "编辑回调域名 · " + w.domain,
    width: 720,
    submitText: "保存变更",
    body: '<div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">🔒 域名变更<b>立即生效</b>并写审计日志。规则：仅 https 精确域名 / 受控前缀，拒 IP 与内网网段。</div>',
    fields: igWhitelistFields(w),
    onSubmit: (values) => {
      if (igWhitelistDup(values.domain, id)) { msg("error", "该域名已登记（唯一性校验不通过）"); return; }
      CM.close("cm-ig-wl-edit");
      msg("success", `回调域名已更新为「${values.domain}」，立即生效（写审计日志）`);
      route();
    }
  });
}
/* ---- integration 移除回调域名：被引用则强提示（Q-5），无引用走高危 ---- */
function igWhitelistRemove(id) {
  const w = MOCK.callbackWhitelist.find(x => x.id === id);
  if (!w) return;
  const n = (MOCK.callbackWhitelistRefs && MOCK.callbackWhitelistRefs[w.domain]) || 0;
  const refTip = n > 0
    ? `⚠ 该域名当前被 <b>${n} 个应用</b>的回调引用，移除后这些回调将被网关拒收（SSRF 防护）。`
    : "该域名当前无应用引用。";
  highRisk("移除回调白名单域名",
    `${refTip}<br>域名：<span class="mono">${w.domain}</span>（消费功能点 ${w.func}）。移除立即生效并写审计日志。`,
    "移除",
    `回调域名「${w.domain}」已移除（写审计日志）`);
}

/* ---- msg 新建消息模板弹窗（编码唯一校验 / 渠道 / 审核流） ---- */
function msgTplNew() {
  const existing = MOCK.msgTemplates.map(t => t.code);
  CM.openDialog({
    id: "cm-msg-tpl-new",
    title: "新建消息模板",
    width: 600,
    fields: [
      { name: "code", label: "模板编码", type: "text", required: true, placeholder: "如：TPL_CONTRACT_DONE", tip: "大写字母/下划线，全局唯一", validators: [(v) => (/^[A-Z][A-Z0-9_]*$/.test(String(v || "")) ? (existing.indexOf(v) !== -1 ? "该模板编码已存在" : null) : "编码须为大写字母开头、仅含大写字母/数字/下划线")] },
      { name: "name", label: "模板名称", type: "text", required: true, placeholder: "如：合同审批完成通知" },
      { name: "channel", label: "下发渠道", type: "select", required: true, options: ["钉钉", "企业微信", "站内信", "邮件", "短信"] },
      { name: "review", label: "提交审核", type: "select", options: ["保存为草稿", "提交审核"] }
    ],
    submitText: "创建模板",
    onSubmit: (values) => {
      CM.close("cm-msg-tpl-new");
      msg("success", values.review === "提交审核" ? "模板已创建并提交审核（状态→待审核，写审计日志）" : "模板已保存为草稿（写审计日志）");
      route();
    }
  });
}

/* ---- msg 发送测试弹窗（账号输入 + 模拟下发） ---- */
function msgTplTest(code, name) {
  CM.openDialog({
    id: "cm-msg-tpl-test",
    title: "发送测试 · " + code,
    width: 520,
    body: '<div class="fs-13 text-secondary mb-3">模板：' + name + '。将向指定测试账号实际下发一条测试消息（不计入正式记录）。</div>',
    fields: [
      { name: "account", label: "测试账号", type: "text", required: true, placeholder: "姓名 / 工号 / 手机号" },
      { name: "channel", label: "渠道", type: "select", options: ["钉钉", "企业微信", "站内信"] }
    ],
    submitText: "发送测试",
    onSubmit: (values) => {
      CM.close("cm-msg-tpl-test");
      msg("success", `测试消息已下发给「${values.account}」（${values.channel}）· msgId: MSG-TEST-${Date.now().toString().slice(-6)}`);
    }
  });
}

/* ---- msg 渠道凭证配置抽屉（加密存储说明 + 连通性测试） ---- */
function msgChannelConfig(connector, name) {
  CM.openDrawer({
    id: "cm-msg-channel-cfg",
    title: "渠道配置 · " + name,
    width: 600,
    submitText: "保存并测试",
    body: '<div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">🔐 凭证（AppKey/AppSecret）加密存储于 Nacos 配置中心（AES），页面不回显明文；连接器：<span class="mono">' + connector + '</span>。</div>',
    fields: [
      { name: "appKey", label: "AppKey / CorpId", type: "text", required: true, placeholder: "请输入" },
      { name: "appSecret", label: "AppSecret", type: "text", required: true, placeholder: "加密存储，不回显" }
    ],
    onSubmit: () => {
      CM.close("cm-msg-channel-cfg");
      msg("success", `渠道「${name}」凭证已保存并加密存储；连通性测试：200 OK · ${80 + Math.floor(Math.random() * 60)}ms（写审计日志）`);
      route();
    }
  });
}

/* ---- msg 连接器配置向导（抽屉内 2 步） ---- */
function msgConnectorWizard(connector, name) {
  CM.openWizard({
    id: "cm-msg-connector-wiz",
    container: "drawer",
    title: "配置连接器 · " + name,
    width: 680,
    submitText: "启用连接器",
    steps: [
      {
        title: "部署连接器",
        fields: [{ name: "endpoint", label: "连接器地址", type: "text", required: true, placeholder: "如：http://connector-email.svc:8080" }],
        render: () => '<div class="fs-13 text-secondary mb-3">连接器：<span class="mono">' + connector + '</span>。新增渠道 = 部署连接器 + 在此配置凭证，无需改平台代码（J2）。</div>'
      },
      {
        title: "凭证与启用",
        fields: [
          { name: "appKey", label: "AppKey", type: "text", required: true, placeholder: "请输入" },
          { name: "appSecret", label: "AppSecret", type: "text", required: true, placeholder: "加密存储，不回显" }
        ],
        render: () => '<div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">🔐 凭证加密存储于 Nacos；启用后该渠道可用于消息下发。</div>'
      }
    ],
    onDone: () => {
      msg("success", `连接器「${connector}」已配置并启用（写审计日志）`);
      route();
    }
  });
}

/* ---- IP 直连主机检测（回调白名单禁 IP，防 SSRF；供 T04 复用） ---- */
function cmIsIpHost(url) {
  try {
    const h = String(url).split("//")[1].split("/")[0].split(":")[0];
    const parts = h.split(".");
    if (parts.length !== 4) return false;
    return parts.every(p => p !== "" && /^\d{1,3}$/.test(p) && Number(p) <= 255);
  } catch (e) { return false; }
}

/* ---- 内网网段检测（回调白名单禁内网，防 SSRF；T01 新增） ----
   命中：10.x / 172.16~172.31 / 192.168.x / 127.x / localhost / .local / .internal
   入参可为主机名或完整 URL（均兼容）。 */
function cmIsIntranetHost(url) {
  const s = String(url == null ? "" : url).trim().toLowerCase();
  if (!s) return false;
  let host = "";
  try {
    const m = s.indexOf("//") !== -1 ? s.split("//")[1] : s;
    host = m.split("/")[0].split(":")[0];
  } catch (e) { host = s; }
  if (!host) return false;
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host.endsWith(".local") || host.endsWith(".internal")) return true;
  const parts = host.split(".");
  if (parts.length === 4 && parts.every(p => /^\d{1,3}$/.test(p))) {
    const n = parts.map(Number);
    if (n[0] === 10) return true;
    if (n[0] === 172 && n[1] >= 16 && n[1] <= 31) return true;
    if (n[0] === 192 && n[1] === 168) return true;
    if (n[0] === 127) return true;
    if (n[0] === 169 && n[1] === 254) return true; /* 链路本地 */
  }
  return false;
}

/* ---- 受控前缀 / 精确域名检测（T01 新增）----
   规则：回调域名允许「精确域名」或「https://host/path 前缀」；
   ★ 含通配符 `*` 一律拒绝（仅允许精确域名或 /path 前缀）。 */
function cmIsControlledPrefix(url) {
  const s = String(url == null ? "" : url).trim();
  if (!s) return false;
  if (s.indexOf("*") !== -1) return false;       /* 通配符禁止 */
  if (s.indexOf("https://") !== 0) return false; /* 必须 https */
  const rest = s.slice(8);
  const host = rest.split("/")[0];
  return host.length > 0 && host.indexOf(".") !== -1;
}

/* ============================================================
   UI-C-16 · Tab 内容实现（权限迁移见下 igRenderPermTab；凭证单/指南见 igShowSecret 等）
   ============================================================ */
