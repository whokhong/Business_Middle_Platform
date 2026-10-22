/* ============================================================
   管理控制台外壳运行时
   职责：左侧菜单渲染 + ?page= 路由 + 通用列表页渲染 + 详情/高危辅助
   页面定义见 pages-config.js（window.PAGES）
   ============================================================ */

/* ---------- 左侧菜单结构（业务域梳理 · 2026-10-21） ----------
   分组顺序对齐 PRD §2.1 七层 + UIUX §3.3「平台治理 → 基础能力 → 业务运营 → 合规/集成」：
   · 总览（OPS）— 实施就绪度，非业务域配置
   · 身份与权限（B1/B2）— 认证主体 → 授权模型 → 会话与申请
   · 主数据（F1 + D2）— 组织人员 → 权威源/同步 → 文件资产（D2 归主数据域）
   · 门户运营（A1）— 入口 → 布局 → 角色默认 → 公告 → 演示项置末（运营观测见总览 dashboard）
   · 流程与表单（C1）— 定义 → 矩阵 → 实例 → 委托（wizard 无侧栏项）
   · 消息管理（D1）— 单入口三 Tab
   · 审计中心（E2）— 合规留痕检索（与 E1 网关、J3 事件排障分链）
   · 集成与网关（I1/J3/E1）— 能力目录 → 注册 → 事件运维 → 路由
   原则：一域一入口；page key 稳定；子能力走 Tab / 父页内链。
   详表：prototype/docs/menu-structure.md
   ---------- */
const CONSOLE_MENU = [
  { group: "总览", items: [{ key: "dashboard", text: "运营总览看板", icon: "📊" }] },
  { group: "身份与权限", items: [
    { key: "accounts", text: "账号管理", icon: "👤" },
    { key: "roles", text: "角色管理", icon: "🎭" },
    { key: "permissions", text: "权限点管理", icon: "🔑" },
    { key: "sessions", text: "在线会话管理", icon: "🖥" },
    { key: "perm-applies", text: "权限申请登记", icon: "📝" }
  ]},
  { group: "主数据", items: [
    { key: "orgs", text: "组织管理", icon: "🏢" },
    { key: "employees", text: "人员管理", icon: "👥" },
    { key: "sync-source", text: "权威源配置向导", icon: "🔗" },
    { key: "sync-logs", text: "同步日志", icon: "🔄" },
    /* D2 · V1.5：单入口「文件管理」（页内 Tab；侧栏 alias file-audit|file-policy 仍深链） */
    { key: "file-admin", text: "文件管理", icon: "📁" }
  ]},
  /* 门户运营：应用管理 + 首页组件管理（三 Tab）；旧书签 alias 见 PORTAL_COMPONENTS_TAB_ALIAS_PAGES */
  { group: "门户运营", items: [
    { key: "portal-apps", text: "应用管理", icon: "🧩" },
    { key: "portal-components", text: "首页组件管理", icon: "🃏" },
    { key: "layouts", text: "布局模板管理", icon: "📐" },
    { key: "portal-role-defaults", text: "角色订阅与意图", icon: "🎭" },
    { key: "notices-admin", text: "公告管理", icon: "📢" },
    { key: "portal-ai-assistant", text: "首页 AI 助手（演示）", icon: "✨" }
  ]},
  { group: "流程与表单", items: [
    { key: "workflow-defs", text: "流程定义管理", icon: "🧭" },
    /* workflow-designer 由定义页「＋ 新建审批流」进入，侧栏不重复 */
    { key: "workflow-matrix", text: "审批矩阵管理", icon: "⚖" },
    { key: "workflow-instances", text: "流程实例监控", icon: "📜" },
    { key: "workflow-delegate", text: "委托代理管理", icon: "🔁" }
  ]},
  { group: "消息管理", items: [
    { key: "msg", text: "模板 / 渠道 / 记录", icon: "✉" }
  ]},
  { group: "审计中心", items: [
    { key: "audit", text: "审计日志检索", icon: "🛡" }
  ]},
  /* 接入生命周期：先查能力 → 注册应用 → 事件运维 → 网关路由 */
  { group: "集成与网关", items: [
    { key: "platform-capabilities", text: "中台能力目录", icon: "📚" },
    { key: "app-register", text: "应用注册", icon: "📝" },
    { key: "app-register-events", text: "事件订阅运维", icon: "📡" },
    /* app-register-guide 从应用注册页内链进入，保留 page key 与 integration 深链 */
    { key: "gateway", text: "网关路由管理", icon: "🚦" }
  ]}
];

/* UI-C-16 旧 page=integration&tab=* 深链 → 独立菜单页（兼容书签） */
const INTEGRATION_LEGACY_TAB_PAGES = {
  applications: "app-register",
  registered: "app-register",
  mapping: "app-register",
  events: "app-register-events",
  guide: "app-register-guide",
  /* 旧 Tab：回调白名单 → 能力目录（全局策略）；权限迁移 Tab 已下线（J2-F05 非 V1.5 在线交付） */
  "callback-whitelist": "platform-capabilities",
  "perm-migration": "app-register"
};
/** 合并页「应用注册」子 Tab：apply=申请中 · approved=已通过 */
const APP_REGISTER_TAB_BY_LEGACY = {
  applications: "apply",
  registered: "approved",
  "perm-migration": "approved"
};
/** 旧 page key → 合并页（canonical `app-register` + tab） */
const APP_REGISTER_PAGE_ALIASES = {
  "app-register-apply": "apply",
  "app-register-approved": "approved"
};
function appRegisterTabFromUrl(params) {
  const page = params.get("page");
  if (page === "app-register") return params.get("tab") || window._appRegTab || "apply";
  if (APP_REGISTER_PAGE_ALIASES[page]) return APP_REGISTER_PAGE_ALIASES[page];
  return null;
}
/** 将旧书签归一化为 ?page=app-register&tab= */
function appRegisterCanonicalRedirect() {
  const params = new URLSearchParams(location.search);
  const tab = appRegisterTabFromUrl(params);
  if (!tab) return null;
  const page = params.get("page");
  if (page === "app-register" && params.get("tab") === tab) return null;
  if (page === "app-register" && !params.get("tab") && tab === "apply") return null;
  if (page !== "app-register" && !APP_REGISTER_PAGE_ALIASES[page]) return null;
  if (page === "app-register" && !params.get("tab") && tab !== "apply") {
    return "console.html?page=app-register&tab=" + tab;
  }
  if (APP_REGISTER_PAGE_ALIASES[page]) {
    return "console.html?page=app-register&tab=" + tab;
  }
  return null;
}
/** V1.5：旧「组织编码例外」页 key / 书签 → 应用注册 + 说明条（B3-F03 走实施/连接器离线导入） */
function deprecatedPageRedirect() {
  const params = new URLSearchParams(location.search);
  if (params.get("page") === "app-register-mapping") {
    return "console.html?page=app-register&orgMappingNote=1";
  }
  /* J3-F05：可选书签别名 → 事件订阅运维 · 事件流排查 Tab */
  if (params.get("page") === "event-monitor") {
    return "console.html?page=app-register-events&tab=outbox";
  }
  /* A1-F09：旧书签 app-analytics → 运营总览看板（单页） */
  if (params.get("page") === "app-analytics") {
    return "console.html?page=dashboard";
  }
  return null;
}

/** 旧书签 dashboard&tab=setup|ops → 单页 dashboard（无 Tab 参数） */
function dashboardCanonicalRedirect() {
  const params = new URLSearchParams(location.search);
  if (params.get("page") === "dashboard" && params.get("tab")) {
    return "console.html?page=dashboard";
  }
  return null;
}

/** D2 文件管理：书签 alias page key → file-admin 子 Tab 深链（侧栏仅单入口 file-admin） */
const FILE_ADMIN_TAB_ALIAS_PAGES = {
  "file-audit": "audit",
  "file-policy": "policy"
};
const FILE_ADMIN_TAB_LABELS = { objects: "文件元数据", audit: "下载审计", policy: "上传与安全策略" };
/** 旧书签 ?page=file-admin 无 tab 时默认「文件元数据」 */
function fileAdminTabFromUrl(params) {
  const page = params.get("page");
  if (page === "file-admin") {
    const t = params.get("tab") || window._fileAdminTab || "objects";
    return ["objects", "audit", "policy"].indexOf(t) >= 0 ? t : "objects";
  }
  if (FILE_ADMIN_TAB_ALIAS_PAGES[page]) return FILE_ADMIN_TAB_ALIAS_PAGES[page];
  return null;
}
function fileAdminCanonicalRedirect() {
  const params = new URLSearchParams(location.search);
  const page = params.get("page");
  const aliasTab = FILE_ADMIN_TAB_ALIAS_PAGES[page];
  if (!aliasTab) return null;
  if (page === "file-admin" && params.get("tab") === aliasTab) return null;
  return "console.html?page=file-admin&tab=" + aliasTab;
}

/** 门户运营：首页组件管理 · 旧书签 page key → 子 Tab（侧栏入口 portal-components） */
const PORTAL_COMPONENTS_TAB_ALIAS_PAGES = {
  "portal-apps-cards": "cards",
  "portal-apps-embeds": "embeds",
  "portal-apps-intents": "intents"
};
const PORTAL_COMPONENTS_TAB_LABELS = {
  cards: "卡片管理",
  embeds: "嵌入页面卡片",
  intents: "意图项配置"
};
function portalComponentsTabFromUrl(params) {
  const page = params.get("page");
  if (page === "portal-components") {
    const t = params.get("tab") || window._portalTab || "cards";
    return PORTAL_COMPONENTS_TAB_LABELS[t] ? t : "cards";
  }
  if (page && PORTAL_COMPONENTS_TAB_ALIAS_PAGES[page]) return PORTAL_COMPONENTS_TAB_ALIAS_PAGES[page];
  return null;
}
/** 集成域：无侧栏项的子页 → 高亮父菜单 */
const MENU_PARENT_BY_PAGE = {
  "app-register-guide": "app-register",
  "workflow-designer": "workflow-defs"
};
const APP_REGISTER_EVENTS_TAB_LABELS = { subs: "订阅与投递", outbox: "事件流排查" };
function appRegisterEventsTabFromUrl(params) {
  const raw = params.get("tab") || window._igEvTab || "subs";
  return raw === "outbox" || raw === "monitor" || raw === "stream" ? "outbox" : "subs";
}
/** 旧书签 ?page=portal-apps&tab=* / alias page key → canonical portal-apps | portal-components 深链 */
function portalAppsCanonicalRedirect() {
  const params = new URLSearchParams(location.search);
  const page = params.get("page");
  /* 已下线「域名白名单」Tab：无报错，落应用管理 */
  if (page === "portal-apps-whitelist") {
    return "console.html?page=portal-apps";
  }
  if (page === "portal-apps" && params.get("tab") === "whitelist") {
    return "console.html?page=portal-apps";
  }
  const aliasTab = PORTAL_COMPONENTS_TAB_ALIAS_PAGES[page];
  if (aliasTab) {
    return "console.html?page=portal-components&tab=" + aliasTab;
  }
  if (page === "portal-apps") {
    const tab = params.get("tab");
    if (tab && ["cards", "embeds", "intents"].indexOf(tab) >= 0) {
      return "console.html?page=portal-components&tab=" + tab;
    }
    if (tab === "apps") {
      return "console.html?page=portal-apps";
    }
  }
  return null;
}
/** 侧栏高亮：合并页 / 深链子页归一到单入口菜单 key */
function getMenuActiveKey() {
  const legacy = integrationLegacyTargetPage();
  if (legacy) return MENU_PARENT_BY_PAGE[legacy] || legacy;
  const params = new URLSearchParams(location.search);
  const p = params.get("page");
  if (p && MENU_PARENT_BY_PAGE[p]) return MENU_PARENT_BY_PAGE[p];
  if (p && PORTAL_COMPONENTS_TAB_ALIAS_PAGES[p]) return "portal-components";
  if (p === "file-admin" || (p && FILE_ADMIN_TAB_ALIAS_PAGES[p])) return "file-admin";
  if (p === "portal-components") return "portal-components";
  if (p === "portal-apps") return "portal-apps";
  if (p === "app-register-apply" || p === "app-register-approved") return "app-register";
  return (p && window.PAGES[p]) ? p : "dashboard";
}

function integrationLegacyTargetPage() {
  const params = new URLSearchParams(location.search);
  if (params.get("page") !== "integration") return null;
  const tab = params.get("tab") || "applications";
  const target = INTEGRATION_LEGACY_TAB_PAGES[tab] || "app-register";
  if (target === "app-register") {
    window._appRegTab = APP_REGISTER_TAB_BY_LEGACY[tab] || "apply";
  }
  /* 旧深链：回调域名校验 Tab → 能力目录「回调域名校验」子 Tab */
  if (tab === "callback-whitelist") window._platTab = "policy";
  return target;
}

/* ---------- 启动 ---------- */
document.addEventListener("DOMContentLoaded", () => {
  consoleInjectStyle();
  renderMenu();
  route();
});

/* ============================================================
   控制台暖色补丁（Notion 双轨制 Token 落地 · 任务「查漏补缺」）
   ------------------------------------------------------------
   说明：console.html 的 <style> 中残留少量旧冷灰硬编码（#0F172A / #E2E8F0 等），
   而 console.html 不在本任务可修改白名单（仅 console.js / pages-config.js）。
   故以「样式注入」方式覆盖为暖色 Token —— 零外链、零依赖、不改动 HTML，
   与 pages-config.js 的 layInjectStyle() 同一范式。
   注入样式位于 <head> 末尾，同特异性下晚于 console.html 内联 <style> 生效。
   ============================================================ */
function consoleInjectStyle() {
  if (document.getElementById("console-warm-patch")) return;
  const css = `
  /* 卡片类容器：统一为「暖白卡片 + 细边框」，与 common.css 的 .card 一致 */
  .stat-card, .tree-panel, .material-panel, .ck-list .ck-item, .dt-card-preview {
    background: var(--bmp-bg-card) !important;
    border: var(--line);
  }
  .stat-card .vl { color: var(--bmp-text-title); }
  /* 深色代码 diff 块：冷 navy #0F172A / #E2E8F0 → Notion 暖深灰 --dark-surface / 暖白文字 */
  .diff-box { background: var(--dark-surface) !important; color: #f6f5f4 !important; border: var(--line); }
  .diff-box .del { color: #FCA5A5; }
  .diff-box .add { color: #86EFAC; }
  /* 连接测试日志流 → 暖深灰 */
  .log-stream { background: var(--dark-surface) !important; color: #86EFAC !important; border: var(--line); }
  /* 五态演示切换器（走查用） */
  .state-switcher { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; padding: 8px 12px;
    background: var(--bmp-color-info-light); border: var(--line); border-radius: var(--bmp-radius-sm); }
  .state-switcher .ss-lbl { font-size: 12px; color: var(--bmp-text-secondary); margin-right: 4px; }
  .state-switcher .ss-btn { height: 26px; padding: 0 10px; font-size: 12px; cursor: pointer;
    border: var(--line); background: var(--bmp-bg-card); border-radius: var(--bmp-radius-sm); color: var(--bmp-text-body); }
  .state-switcher .ss-btn:hover { border-color: var(--bmp-border-strong); color: var(--bmp-text-title); }
  .state-switcher .ss-btn.on { background: var(--accent); border-color: var(--accent); color: #fff; font-weight: 600; }
  /* 侧栏菜单副标题（可选 it.desc；当前 CONSOLE_MENU 项均不展示 desc） */
  .menu-group a .menu-desc { font-size: 11px; font-weight: 400; opacity: .72; line-height: 1.25; }
  .menu-group a.active .menu-desc { opacity: .85; }
  `;
  const s = document.createElement("style");
  s.id = "console-warm-patch";
  s.textContent = css;
  document.head.appendChild(s);
}

function renderMenu() {
  const cur = getMenuActiveKey();
  document.getElementById("sideMenu").innerHTML = CONSOLE_MENU.map(g => `
    <div class="menu-group">
      <div class="g-title">${g.group}</div>
      ${g.items.map(it => {
        const href = FILE_ADMIN_TAB_ALIAS_PAGES[it.key]
            ? "console.html?page=file-admin&tab=" + FILE_ADMIN_TAB_ALIAS_PAGES[it.key]
            : "console.html?page=" + it.key;
        const desc = it.desc ? `<span class="menu-desc">${it.desc}</span>` : "";
        return `<a href="${href}" class="${cur === it.key ? "active" : ""}">${it.icon} ${it.text}${desc}</a>`;
      }).join("")}
    </div>`).join("");
}

function getPageKey() {
  const legacy = integrationLegacyTargetPage();
  if (legacy) return legacy;
  const params = new URLSearchParams(location.search);
  const p = params.get("page");
  /* 侧栏 alias → 实际渲染 portal-components */
  if (p && PORTAL_COMPONENTS_TAB_ALIAS_PAGES[p]) return "portal-components";
  if (p && FILE_ADMIN_TAB_ALIAS_PAGES[p]) return "file-admin";
  /* 菜单高亮：申请/已通过旧 key 与合并页同一入口 */
  if (p === "app-register-apply" || p === "app-register-approved") return "app-register";
  return (p && window.PAGES[p]) ? p : "dashboard";
}

function route() {
  const dep = deprecatedPageRedirect();
  if (dep) {
    location.replace(dep);
    return;
  }
  const legacyRedirect = integrationLegacyTargetPage();
  if (legacyRedirect) {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab") || "applications";
    if (legacyRedirect === "app-register") {
      const sub = APP_REGISTER_TAB_BY_LEGACY[tab] || window._appRegTab || "apply";
      let url = "console.html?page=app-register&tab=" + sub;
      if (tab === "mapping") url += "&orgMappingNote=1";
      if (tab === "perm-migration") url += "&permMigrationNote=1";
      location.replace(url);
    } else {
      location.replace("console.html?page=" + legacyRedirect);
    }
    return;
  }
  const canon = appRegisterCanonicalRedirect();
  if (canon) {
    location.replace(canon);
    return;
  }
  const portalCanon = portalAppsCanonicalRedirect();
  if (portalCanon) {
    location.replace(portalCanon);
    return;
  }
  const fileCanon = fileAdminCanonicalRedirect();
  if (fileCanon) {
    location.replace(fileCanon);
    return;
  }
  const dashCanon = dashboardCanonicalRedirect();
  if (dashCanon) {
    location.replace(dashCanon);
    return;
  }
  const key = getPageKey();
  const page = window.PAGES[key];
  /* 面包屑随子 Tab / 深链子页变化（与 ?tab=、alias page key 一致） */
  let crumb = page.crumb || ["运营总览看板"];
  const routeParams = new URLSearchParams(location.search);
  if (key === "file-admin") {
    const faTab = fileAdminTabFromUrl(routeParams) || "objects";
    crumb = ["主数据", "文件管理", FILE_ADMIN_TAB_LABELS[faTab] || "文件元数据"];
  }
  if (key === "portal-apps") {
    crumb = ["门户运营", "应用管理"];
  }
  if (key === "portal-components") {
    const pcTab = portalComponentsTabFromUrl(routeParams) || "cards";
    crumb = ["门户运营", "首页组件管理", PORTAL_COMPONENTS_TAB_LABELS[pcTab] || "卡片管理"];
  }
  if (key === "app-register-events") {
    const evTab = appRegisterEventsTabFromUrl(routeParams);
    crumb = ["集成与网关", "事件订阅运维", APP_REGISTER_EVENTS_TAB_LABELS[evTab] || "订阅与投递"];
  }
  if (key === "app-register-guide") {
    crumb = ["集成与网关", "应用注册", "接入文档"];
  }
  if (key === "workflow-designer") {
    crumb = ["流程与表单", "流程定义管理", "流程配置向导"];
  }
  renderBreadcrumb(crumb);
  const root = document.getElementById("pageRoot");
  // 特殊页（有 render）走自定义渲染；否则走通用列表渲染器
  // 【5 态演示机制】管理端外壳统一支持「态覆盖」——所有管理页（含自定义 render 页）
  //   均可通过工具栏切换 默认/加载/空/错误/无权限 五态（UIUX §4.2 要求所有页面必须覆盖）。
  const st = window._consoleState || "normal";
  if (st !== "normal") {
    root.innerHTML = renderConsoleState(st, page);
    return;
  }
  root.innerHTML = page.render ? page.render() : renderListPage(page);
  if (page.after) page.after();
  injectStateSwitcher(page);
  applyColPrefs(root);
  if (!page.render) applyPagerView(); /* I-08：通用列表页应用分页切片 */
}

/* 应用「列设置」持久化偏好（bmp_col_prefs）：隐藏被取消勾选的列（I-07） */
function applyColPrefs(rootEl) {
  if (!rootEl || !window.CM || !window.CM.colPrefs) return;
  const hidden = window.CM.colPrefs.get()[getPageKey()];
  if (!hidden || !hidden.length) return;
  rootEl.querySelectorAll("[data-ck]").forEach(el => {
    if (hidden.indexOf(el.dataset.ck) !== -1) el.style.display = "none";
  });
}

/* ============================================================
   管理端五态渲染（统一出口，覆盖全部管理页）
   —— 对应 UIUX §4.2：加载=骨架 / 空态=插图+说明+引导 / 错误=错误码+重试 / 无权限=锁形+申请入口
   ============================================================ */
function renderConsoleState(st, page) {
  const name = (page.crumb && page.crumb[page.crumb.length - 1]) || "当前页面";
  const wrap = (inner) => `<div class="card" style="min-height:420px;display:flex;align-items:center;justify-content:center">${inner}</div>`;
  if (st === "loading") {
    return wrap(`<div style="width:100%;max-width:720px">
      <div class="skeleton sk-line w80" style="height:20px"></div>
      <div class="skeleton sk-line w60"></div>
      <div class="skeleton sk-block" style="margin-top:16px"></div>
      <div class="skeleton sk-line w80" style="margin-top:16px"></div>
      <div class="skeleton sk-line w40"></div>
      <div class="fs-12 text-secondary mt-3" style="text-align:center">正在加载「${name}」…</div>
    </div>`);
  }
  if (st === "empty") {
    return wrap(`<div class="state-box">
      <div class="illus">📭</div>
      <div class="txt">「${name}」暂无数据</div>
      <div class="code">可调整筛选条件，或先创建第一条记录</div>
      <button class="btn btn-sm btn-primary" onclick="cmEmptyNew()">＋ 新建</button>
    </div>`);
  }
  if (st === "error") {
    return wrap(`<div class="state-box">
      <div class="illus">⚠️</div>
      <div class="txt">数据加载失败</div>
      <div class="code">错误码 5500 · 服务暂时不可用，请稍后重试（报障请提供该错误码）</div>
      <button class="btn btn-sm" onclick="msg('info','已重试（原型演示）')">重试</button>
    </div>`);
  }
  /* noperm */
  return wrap(`<div class="state-box">
    <div class="illus">🔒</div>
    <div class="txt">无访问权限</div>
    <div class="code">你当前的角色无「${name}」的访问权限</div>
    <a class="btn btn-sm" href="console.html?page=perm-applies">去申请权限</a>
  </div>`);
}

/* 工具栏：五态切换器（挂在列表工具栏右侧或页顶，仅用于原型走查演示） */
function injectStateSwitcher(page) {
  const root = document.getElementById("pageRoot");
  if (!root || root.querySelector(".state-switcher")) return;
  const bar = document.createElement("div");
  bar.className = "state-switcher";
  const cur = window._consoleState || "normal";
  const opts = [["normal", "默认态"], ["loading", "加载"], ["empty", "空态"], ["error", "错误"], ["noperm", "无权限"]];
  bar.innerHTML = `<span class="ss-lbl">🧪 五态演示</span>` + opts.map(([k, t]) =>
    `<button class="ss-btn ${cur === k ? "on" : ""}" onclick="setConsoleState('${k}')">${t}</button>`).join("");
  root.insertBefore(bar, root.firstChild);
}
function setConsoleState(st) {
  window._consoleState = st;
  route();
}

function renderBreadcrumb(crumb) {
  document.getElementById("breadcrumb").innerHTML =
    ["管理控制台", ...crumb].map((c, i, a) => i === a.length - 1 ? `<b>${c}</b>` : `<span>${c}</span>`).join('<span style="margin:0 6px;color:var(--bmp-text-placeholder)">/</span>');
}

/* ============================================================
   通用列表页渲染器（schema 驱动）
   page = { filters, quickTags, toolbar, stats(), cols, rows(), rowKey, note, paginationTotal }
   说明：cols / rows / stats 等可传函数（用于 Tab 切换时就地重渲染同一 schema）；
   paginationTotal 用于展示真实记录总数（如白名单/嵌入卡片仅展示前 N 行时）。
   ============================================================ */
function renderListPage(page) {
  const cols = typeof page.cols === "function" ? page.cols() : (page.cols || []);
  const rows = typeof page.rows === "function" ? page.rows() : (page.rows || []);
  const stats = page.stats ? page.stats() : "";
  /* 空态兜底（UIUX §4.2）：rows 为空时不留空白表格，改为插图 + 说明 + 引导动作 */
  if (!rows.length) {
    return `${stats}${page.filters && page.filters.length ? `<div class="filter-bar">${page.filters.map(f =>
      `<div class="field"><label>${f.label}</label><input class="input" placeholder="${f.ph || ""}"></div>`).join("")}</div>` : ""}
      <div class="card" style="min-height:320px;display:flex;align-items:center;justify-content:center">
        <div class="state-box">
          <div class="illus">📭</div>
          <div class="txt">暂无数据</div>
          <div class="code">可调整筛选条件，或先创建第一条记录</div>
          <button class="btn btn-sm btn-primary" onclick="cmEmptyNew()">＋ 新建</button>
        </div>
      </div>`;
  }
  /* 筛选区：前 3 项常显，其余折叠进「更多筛选」（I-10 .more-filter） */
  const visFilters = (page.filters || []).slice(0, 3);
  const moreFilters = (page.filters || []).slice(3);
  const filterField = f => `<div class="field"><label>${f.label}</label>${
    f.type === "select"
      ? `<select class="select" data-fkey="${f.key || f.label}"><option value="">全部</option>${(f.opts || []).map(o => `<option>${o}</option>`).join("")}</select>`
      : `<input class="input" data-fkey="${f.key || f.label}" placeholder="${f.ph || ""}">`}</div>`;
  const filters = page.filters && page.filters.length ? `
    <div class="filter-bar">
      ${visFilters.map(f => f.type === "select"
        ? `<div class="field"><label>${f.label}</label><select class="select" data-fkey="${f.key || f.label}"><option value="">全部</option>${(f.opts || []).map(o => `<option>${o}</option>`).join("")}</select></div>`
        : `<div class="field"><label>${f.label}</label><input class="input" data-fkey="${f.key || f.label}" placeholder="${f.ph || ""}"></div>`).join("")}
      <div class="f-ops">
        <button class="btn btn-primary" onclick="applyListFilter(this)">查询</button>
        <button class="btn" onclick="resetListFilter(this)">重置</button>
      </div>
      ${moreFilters.length ? `<div class="more-filter">
        <button type="button" class="mf-toggle" onclick="toggleMoreFilter(this)">▸ 更多筛选（${moreFilters.length}）</button>
        <div class="mf-body">${moreFilters.map(filterField).join("")}</div>
      </div>` : ""}
    </div>` : "";
  const quickTags = page.quickTags ? `<div class="flex gap-2 mb-3">${page.quickTags.map(q => `<button class="btn btn-sm" onclick="${q.action}">${q.text}</button>`).join("")}</div>` : "";
  const toolbar = page.toolbar ? `
    <div class="list-toolbar">
      <div class="left">${page.toolbar.map(b => `<button class="btn ${b.primary ? "btn-primary" : ""}" onclick="${b.action || ""}">${b.text}</button>`).join("")}</div>
      <div class="right"><button class="btn btn-sm" onclick="openColSettings(this)">⚙ 列设置</button></div>
    </div>` : "";
  /* 表头：数据列可排序（I-09 .sort-ind）；数字/金额列右对齐（I-06 .num-col） */
  const isNumCol = c => c.num || /金额|QPS|次数|人数|使用|数量/.test(c.t || "");
  const head = `<tr>${cols.map(c => {
    const ck = c.k || c.t;
    if (c.ops || !c.k) return `<th data-ck="${ck}">${c.t}</th>`;
    return `<th class="sortable ${isNumCol(c) ? "num-col" : ""}" data-ck="${ck}" data-key="${c.k}" onclick="sortTableCol(this)">${c.t}<span class="sort-ind"><span class="ind">▲</span><span class="ind">▼</span></span></th>`;
  }).join("")}</tr>`;
  const body = rows.map((row, ri) => `<tr data-k="${row[page.rowKey] != null ? row[page.rowKey] : ri}">
    ${cols.map(c => {
      if (c.ops) return `<td class="ops" data-ck="__ops">${c.ops(row).map(op => typeof op === "string" ? op : `<button class="btn-text ${op.cls || ""}" onclick="${op.action || ""}">${op.text}</button>`).join("")}</td>`;
      const v = c.k ? row[c.k] : "";
      return `<td data-ck="${c.k || c.t}" class="${isNumCol(c) ? "num-col" : ""}">${c.render ? c.render(v, row) : (v != null ? v : "—")}</td>`;
    }).join("")}</tr>`).join("");
  const note = page.note ? `<div class="fs-12 text-secondary mt-3">ℹ ${page.note}</div>` : "";
  const total = page.paginationTotal != null ? page.paginationTotal : rows.length;
  return `${stats}${filters}${quickTags}${toolbar}
    <div class="table-wrap"><table class="tbl">${head}${body}</table></div>
    ${renderPagination(total)}${note}`;
}

/* ============================================================
   分页器（I-08）：页码可点 + 每页条数切换（10/20/50/100）
   ============================================================ */
let _pageSize = 20;
function renderPagination(total) {
  const pages = Math.max(1, Math.ceil(total / _pageSize));
  const cur = Math.min(window._listPage || 1, pages);
  window._listPage = cur;
  const nums = [];
  const push = n => nums.push(`<span class="pg ${n === cur ? "active" : ""}" onclick="pgGoto(${n})">${n}</span>`);
  if (pages <= 7) { for (let i = 1; i <= pages; i++) push(i); }
  else {
    push(1);
    if (cur > 3) nums.push(`<span class="pg">…</span>`);
    for (let i = Math.max(2, cur - 1); i <= Math.min(pages - 1, cur + 1); i++) push(i);
    if (cur < pages - 2) nums.push(`<span class="pg">…</span>`);
    push(pages);
  }
  return `<div class="pagination">共 ${total} 条
    <select class="select" style="width:auto;height:26px;padding:0 6px" onchange="pgSize(this.value)">
      ${[10, 20, 50, 100].map(s => `<option value="${s}" ${s === _pageSize ? "selected" : ""}>${s} 条/页</option>`).join("")}
    </select>${nums.join("")}</div>`;
}
/* 跳转页码：按页切片显示表格行（就地，不刷新） */
function pgGoto(n) { window._listPage = n; applyPagerView(); }
function pgSize(v) { _pageSize = Number(v) || 20; window._listPage = 1; applyPagerView(); }
/* 当前「可见」行数（未被筛选隐藏） */
function visibleRowCount() {
  const table = document.querySelector("#pageRoot .table-wrap table");
  if (!table) return 0;
  return [...table.querySelectorAll("tr")].filter(tr => !tr.querySelector("th") && tr.dataset.filtered !== "1").length;
}
/* 统一视图：先应用筛选（dataset.filtered），再应用分页切片，并重绘分页条 */
function applyPagerView() {
  const table = document.querySelector("#pageRoot .table-wrap table");
  if (!table) return;
  const cur = window._listPage || 1;
  const start = (cur - 1) * _pageSize, end = start + _pageSize;
  let pass = 0;
  [...table.querySelectorAll("tr")].forEach(tr => {
    if (tr.querySelector("th")) return;
    if (tr.dataset.filtered === "1") { tr.style.display = "none"; return; }
    tr.style.display = (pass >= start && pass < end) ? "" : "none";
    pass++;
  });
  const total = pass;
  const pages = Math.max(1, Math.ceil(total / _pageSize));
  if (cur > pages) { window._listPage = pages; return applyPagerView(); }
  const bar = document.querySelector("#pageRoot .pagination");
  if (bar) bar.outerHTML = renderPagination(total);
}
/* 「更多筛选」折叠开关（I-10） */
function toggleMoreFilter(btn) {
  const box = btn.closest(".more-filter");
  if (!box) return;
  box.classList.toggle("open");
  btn.textContent = (box.classList.contains("open") ? "▾ 更多筛选（" : "▸ 更多筛选（") + box.querySelectorAll(".mf-body .field").length + "）";
}
/* 表头排序（I-09）：点击列就地按该列文本/数字排序 */
function sortTableCol(th) {
  const table = th.closest("table");
  const ck = th.dataset.ck;
  if (!table || !ck) return;
  const asc = th.dataset.asc !== "1";
  [...table.querySelectorAll("th .sort-ind")].forEach(s => s.classList.remove("on"));
  const ind = th.querySelector(".sort-ind");
  if (ind) { ind.classList.add("on"); ind.dataset.dir = asc ? "asc" : "desc"; }
  th.dataset.asc = asc ? "1" : "0";
  const cellText = tr => {
    const td = tr.querySelector('td[data-ck="' + ck + '"]');
    return td ? td.textContent.trim() : "";
  };
  const rows = [...table.querySelectorAll("tr")].filter(tr => !tr.querySelector("th"));
  rows.sort((a, b) => {
    const av = cellText(a), bv = cellText(b);
    const an = parseFloat(av.replace(/[^\d.-]/g, "")), bn = parseFloat(bv.replace(/[^\d.-]/g, ""));
    if (!isNaN(an) && !isNaN(bn)) return asc ? an - bn : bn - an;
    return asc ? av.localeCompare(bv) : bv.localeCompare(av);
  });
  rows.forEach(tr => table.appendChild(tr));
  applyPagerView();
  msg("info", `已按「${(th.textContent || "").replace(/[▲▼]/g, "").trim()}」${asc ? "升序" : "降序"}排列`);
}

/* ============================================================
   列表就地真实筛选（通用查询按钮 → 按筛选条件过滤当前 rows）
   说明：不重渲染、不刷新；命中的行保留，未命中的行隐藏；命中数即时反馈。
   ============================================================ */
function applyListFilter(btn) {
  const bar = btn.closest(".filter-bar");
  const table = document.querySelector("#pageRoot .table-wrap table");
  if (!bar || !table) return;
  const conds = [...bar.querySelectorAll("[data-fkey]")]
    .map(el => ({ label: el.dataset.fkey, v: (el.value || "").trim().toLowerCase() }))
    .filter(c => c.v);
  const rows = [...table.querySelectorAll("tr")].filter(tr => !tr.querySelector("th"));
  let shown = 0;
  rows.forEach(tr => {
    const txt = tr.textContent.toLowerCase();
    const hit = conds.every(c => txt.includes(c.v));
    tr.dataset.filtered = hit ? "0" : "1";
    if (hit) shown++;
  });
  window._listPage = 1;
  applyPagerView();
  if (!conds.length) msg("info", `未设置筛选条件，显示全部 ${rows.length} 条`);
  else if (shown) msg("success", `筛选已应用：命中 ${shown} / ${rows.length} 条`);
  else msg("info", `筛选已应用：无匹配记录（共 ${rows.length} 条）`);
}
function resetListFilter(btn) {
  const bar = btn.closest(".filter-bar");
  if (bar) [...bar.querySelectorAll("[data-fkey]")].forEach(el => { el.value = ""; });
  const table = document.querySelector("#pageRoot .table-wrap table");
  if (table) [...table.querySelectorAll("tr")].forEach(tr => { if (!tr.querySelector("th")) tr.dataset.filtered = "0"; });
  window._listPage = 1;
  applyPagerView();
  msg("info", "筛选条件已重置，显示全部记录");
}

/* ============================================================
   列设置弹窗（CM.openDialog）· 记忆到 bmp_col_prefs（I-07，T06 复用）
   ------------------------------------------------------------
   说明：偏好以「页面 key → 隐藏列标识数组」形式持久化；渲染时据此隐藏列。
   ============================================================ */
function openColSettings() {
  if (!window.CM) { msg("info", "交互基建未加载"); return; }
  const key = getPageKey();
  const page = window.PAGES[key];
  let cols = typeof page.cols === "function" ? page.cols() : (page.cols || []);
  /* 自定义 render 页（无 cols schema）：从当前渲染出的表头推导可设置列 */
  if (!cols.length) {
    cols = [...document.querySelectorAll("#pageRoot .table-wrap table tr:first-child th")]
      .map(th => ({ k: th.dataset.ck, t: th.textContent.replace(/[▲▼]/g, "").trim() }))
      .filter(c => c.k && c.k !== "__ops");
  }
  /* 仅「数据列」（含 c.k）可勾选；操作列 / 无键列不参与列设置 */
  const dataCols = cols.map((c, i) => ({ col: c, idx: i })).filter(x => x.col.k);
  const hidden = (window.CM.colPrefs.get()[key] || []);
  const fields = dataCols.map(x => ({
    name: "col_" + x.idx,
    label: x.col.t || ("列" + (x.idx + 1)),
    type: "checkbox",
    checkboxText: x.col.t || ("列" + (x.idx + 1)),
    value: hidden.indexOf(x.col.k) === -1
  }));
  window.CM.openDialog({
    id: "cm-col-settings",
    title: "列设置 · " + (page.crumb ? page.crumb[page.crumb.length - 1] : "当前页"),
    fields,
    submitText: "保存列设置",
    body: '<div class="fs-13 text-secondary mb-3">勾选需要在列表中显示的列（记忆于本地，下次进入自动生效）</div>',
    onSubmit: (values) => {
      const hide = dataCols
        .filter(x => !values["col_" + x.idx])
        .map(x => x.col.k);
      const prefs = window.CM.colPrefs.get();
      prefs[key] = hide;
      window.CM.colPrefs.set(prefs);
      window.CM.close("cm-col-settings");
      msg("success", `列设置已保存（隐藏 ${hide.length} 列，偏好键 ${window.CM.colPrefs.key}）`);
      route(); /* 就地重渲染当前页，应用列可见性 */
    }
  });
}

/* ============================================================
   空态「＋ 新建」真实入口（由 renderListPage / renderConsoleState 调用）
   说明：优先派发到页面自身的新建 action；无则可用的通用表单弹窗收尾。
   ============================================================ */
function cmEmptyNew() {
  if (!window.CM) { msg("info", "交互基建未加载"); return; }
  const key = getPageKey();
  const page = window.PAGES[key] || {};
  const btn = (page.toolbar || []).find(b => b.primary && /新建|新增|创建|添加/.test(b.text || ""));
  if (btn && btn.action && btn.action.indexOf("msg(") === -1) {
    try { (new Function(btn.action))(); return; } catch (e) { /* 降级到通用弹窗 */ }
  }
  window.CM.openDialog({
    id: "cm-empty-new",
    title: "新建记录 · " + (page.crumb ? page.crumb[page.crumb.length - 1] : "当前页"),
    fields: [
      { name: "name", label: "名称", type: "text", required: true, placeholder: "请输入名称", tip: "创建后可在列表中查看与编辑" },
      { name: "remark", label: "备注", type: "textarea", rows: 3, placeholder: "选填：补充说明" }
    ],
    submitText: "创建",
    onSubmit: (values) => {
      window.CM.close("cm-empty-new");
      msg("success", `已创建「${values.name}」（写审计日志）`);
      route();
    }
  });
}

/* ============================================================
   高危操作确认（HighRiskConfirm：输入名称确认，UIUX 4.5）
   ============================================================ */
let _riskCtx = null;
function highRisk(title, desc, keyword, successMsg, cb) {
  _riskCtx = { keyword, successMsg, cb };
  document.getElementById("riskTitle").textContent = title;
  document.getElementById("riskDesc").innerHTML = desc;
  document.getElementById("riskHint").innerHTML = `请输入 <code>${keyword}</code> 以确认此操作`;
  const inp = document.getElementById("riskInput");
  inp.value = ""; inp.placeholder = keyword;
  document.getElementById("riskOk").disabled = true;
  document.getElementById("riskOk").onclick = confirmRisk;
  openModal("m-risk");
}
function checkRisk() {
  if (!_riskCtx) return;
  const v = document.getElementById("riskInput").value.trim();
  document.getElementById("riskOk").disabled = v !== _riskCtx.keyword;
}
function confirmRisk() {
  const { successMsg, cb } = _riskCtx || {};
  closeModal("m-risk");
  if (successMsg) msg("success", successMsg);
  _riskCtx = null;
  if (typeof cb === "function") setTimeout(cb, 400);
}

/* ---------- 通用详情抽屉 ---------- */
function showDrawer(title, html) {
  document.getElementById("dTitle").textContent = title;
  document.getElementById("dBody").innerHTML = html;
  openDrawer("d-generic");
}

/* ============================================================
   业务辅助（被 pages-config.js 的行内 action 调用）
   ============================================================ */
function acctDetail(id) {
  const a = MOCK.accounts.find(x => x.id == id); if (!a) return;
  showDrawer("账号详情 · " + a.name, `
    <dl class="desc-grid">
      <dt>账号</dt><dd class="mono">${a.username}</dd>
      <dt>姓名</dt><dd>${a.name}</dd>
      <dt>工号（锚点）</dt><dd class="mono">${a.employeeNo}</dd>
      <dt>部门</dt><dd>${a.org}</dd>
      <dt>状态</dt><dd>${statusTag(a.status, { "启用": "success", "停用": "info", "锁定": "danger" })}</dd>
      <dt>最近登录</dt><dd>${a.lastLogin}</dd>
      <dt>创建时间</dt><dd>${a.created}</dd>
      <dt>绑定角色</dt><dd><span class="tag tag-primary">普通员工</span> ${a.username === "zhangsan" ? '<span class="tag tag-primary">系统管理员</span>' : ""}</dd>
    </dl>
    <div class="readonly-banner mt-4" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
      🔑 账号以 <b>employee_id（工号）</b>为锚点关联主数据人员；密码 BCrypt 存储，不可逆、不可查看明文（B1-F06）
    </div>
    <div class="flex gap-2 mt-4">
      <button class="btn" onclick="resetPwd('${a.username}','${a.name}')">重置密码</button>
      <button class="btn" onclick="assignRole('${a.username}','${a.name}')">分配角色</button>
    </div>`);
}

function resetPwd(username, name) {
  highRisk("重置密码", `将重置账号 <b>${username}</b>（${name}）的密码。重置后旧密码立即失效，系统生成随机初始密码并通过短信/邮件下发，用户首次登录需强制修改。`, username,
    `已重置 ${username} 密码，初始密码已通过短信下发（写审计日志）`);
}

function newAccount() {
  document.getElementById("formTitle").textContent = "新建账号";
  document.getElementById("formBody").innerHTML = `
    <div class="field"><label><span class="req">*</span>关联人员（工号锚点）</label>
      <input class="input" placeholder="EmployeeSelect：搜索姓名 / 工号（选择后自动带入部门）">
      <div class="tip">账号必须绑定一个在职人员，employee_id 为唯一锚点（B1-F01）</div></div>
    <div class="field"><label><span class="req">*</span>登录账号</label><input class="input" placeholder="小写字母 / 数字，全局唯一，创建后不可改"><div class="err-msg">该账号已存在</div></div>
    <div class="field"><label>初始角色</label><select class="select"><option>普通员工</option><option>系统管理员</option><option>消息管理员</option></select></div>
    <div class="field"><label>初始密码策略</label><select class="select"><option selected>系统随机生成并短信下发（推荐）</option><option>手动设置（需符合复杂度）</option></select></div>`;
  document.getElementById("formOk").onclick = () => { closeModal("m-form"); msg("success", "账号已创建，初始密码已下发（写审计日志）"); };
  openModal("m-form");
}

function syncLogDetail(time, result) {
  const failed = result === "失败" || result === "部分失败";
  showDrawer("同步日志详情 · " + time, `
    <dl class="desc-grid">
      <dt>同步时间</dt><dd class="mono">${time}</dd>
      <dt>来源</dt><dd>HR 系统（connector-hr-generic）</dd>
      <dt>类型</dt><dd>全量同步</dd>
      <dt>结果</dt><dd>${statusTag(result, { "成功": "success", "部分失败": "warning", "失败": "danger" })}</dd>
    </dl>
    ${failed ? `<h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:20px 0 12px">异常明细（进异常队列，需人工处理）</h4>
      <div class="table-wrap"><table class="tbl"><tr><th>字段</th><th>源值</th><th>期望</th><th>错误</th></tr>
      ${MOCK.syncFailDetail.map(f => `<tr><td class="mono">${f.field}</td><td>${f.src}</td><td>${f.expect}</td><td><span class="text-danger">${f.err}</span></td></tr>`).join("")}
      </table></div>
      <div class="flex gap-2 mt-4">
        <button class="btn btn-primary" onclick="msg('success','已重新触发该批次同步（写审计日志）')">重新同步</button>
        <button class="btn" onclick="msg('info','异常数据请在 HR 源系统修正后等待下次同步（权威源单向流）')">去源系统修正</button>
      </div>`
    : `<div class="state-box"><div class="illus">✅</div><div class="txt">本次同步全部成功，无异常记录</div></div>`}`);
}

function auditDetail(traceId, type) {
  const log = MOCK.auditLogs.find(x => x.traceId === traceId) || MOCK.auditLogs[0];
  const isDataChange = type === "数据变更";
  showDrawer("审计详情 · trace " + traceId, `
    <dl class="desc-grid">
      <dt>时间</dt><dd class="mono">${log.time}</dd>
      <dt>操作人</dt><dd>${log.user}</dd>
      <dt>类型</dt><dd>${statusTag(log.type, { "高危操作": "danger", "权限变更": "warning", "数据变更": "primary", "登录": "info" })}</dd>
      <dt>描述</dt><dd>${log.desc}</dd>
      <dt>来源 IP</dt><dd class="mono">${log.ip}</dd>
      <dt>结果</dt><dd>${statusTag(log.result, { "成功": "success", "失败": "danger" })}</dd>
      <dt>trace_id</dt><dd><span class="mono">${log.traceId}</span> <button class="btn-text" onclick="msg('success','trace_id 已复制，可用于全链路排查')">复制</button></dd>
    </dl>
    ${isDataChange ? `<h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:20px 0 12px">变更前后对比（diff）</h4>
      <div class="diff-box">
        <div class="del">- org: ${MOCK.auditDiff.before.org}</div>
        <div class="add">+ org: ${MOCK.auditDiff.after.org}</div>
        <div class="del">- post: ${MOCK.auditDiff.before.post}</div>
        <div class="add">+ post: ${MOCK.auditDiff.after.post}</div>
      </div>` : ""}
    <div class="readonly-banner mt-4" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
      🛡 审计日志月分区存储、只追加不可篡改；高危操作额外触发 MFA 二次验证记录（E2）
    </div>`);
}

/* ============================================================
   工作流引擎业务辅助（被 pages-config.js 的 workflow-* 页面调用）
   ============================================================ */

/* WI-F-01 流程定义：查看版本历史抽屉 */
function wfDefVersions(defKey, name) {
  const list = (MOCK.workflow.defVersions[defKey] || []);
  const rows = list.map(v => `<tr>
      <td class="mono">v${v.version}</td>
      <td><span class="tag ${v.defType === "TEMPLATE" ? "tag-primary" : "tag-info"}">${v.defType}</span></td>
      <td>${statusTag(v.status, { "已发布": "success", "草稿": "info", "停用": "warning" })}</td>
      <td>${v.nodeCount}</td>
      <td>${v.instances}</td>
      <td class="mono">${v.updated}</td>
      <td>${v.publisher}</td>
      <td>${v.note}</td>
    </tr>`).join("");
  showDrawer("版本历史 · " + defKey, `
    <div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
      🧭 版本管理：UK(<b>defKey</b>, <b>version</b>) 全局唯一；运行实例锁定「发起时版本」，新版本仅对新实例生效（C1-F01-3）
    </div>
    ${list.length ? `<div class="table-wrap"><table class="tbl">
      <tr><th>版本</th><th>配置方式</th><th>状态</th><th>节点数</th><th>已发起实例</th><th>发布时间</th><th>发布人</th><th>说明</th></tr>
      ${rows}</table></div>` : `<div class="state-box"><div class="illus">📭</div><div class="txt">该流程定义暂无版本历史</div></div>`}
    <div class="card mt-4 fs-13 text-secondary" style="line-height:1.9">
      <b style="color:var(--bmp-text-title)">${name}</b>：已发布版本<b>不可修改、不可回退为草稿</b>，如需修改须新建 version（原版本保留）。
    </div>`);
}

/* WF-01 流程定义：发布 */
function wfPublish(uid, defKey, version) {
  highRisk("发布流程定义",
    `将发布流程定义 <b>${defKey}</b> 的 <b>v${version}</b>。发布前需通过 8 条发布前校验；发布后 ` +
    `状态变为「已发布」，可被业务系统发起调用，运行实例按发起版本执行。`,
    defKey + "_v" + version,
    `流程定义 ${defKey} v${version} 已发布（写审计日志）`);
}

/* WF-01 流程定义：停用 / 重新启用（状态切换） */
function wfToggleStatus(uid, defKey, version, status) {
  if (status === "已发布") {
    highRisk("停用流程定义",
      `将停用流程定义 <b>${defKey}</b> 的 <b>v${version}</b>。停用后<b>不可发起新实例</b>，但<b>运行中实例不受影响</b>；` +
      `后续可通过「重新启用」恢复（需重新通过发布前校验）。`,
      defKey + "_v" + version,
      `流程定义 ${defKey} v${version} 已停用（运行中实例不受影响）`);
  } else if (status === "停用") {
    highRisk("重新启用流程定义",
      `将重新启用流程定义 <b>${defKey}</b> 的 <b>v${version}</b>。启用前将重新执行发布前校验（3.8.2）。` +
      `启用后新实例可发起，历史实例不受影响。`,
      defKey + "_v" + version,
      `流程定义 ${defKey} v${version} 已重新启用（校验通过）`);
  }
}

/* WF-01 流程定义：删除（带删除保护提示，仅在无实例时按钮可用） */
function wfDelete(uid, defKey, version, instances) {
  if (instances > 0) {
    msg("error", `存在 ${instances} 个运行/历史实例，不可删除（C1-F01-4 删除保护）`);
    return;
  }
  highRisk("删除流程定义",
    `将<b>物理删除</b>流程定义 <b>${defKey}</b> 的 <b>v${version}</b>（该定义无任何实例）。删除动作将上报 E2 审计。`,
    defKey + "_v" + version,
    `流程定义 ${defKey} v${version} 已删除（写审计日志）`);
}

/* WF-03 审批矩阵：编辑规则抽屉 */
function wfMatrixEdit(code) {
  const r = MOCK.workflow.matrixRules.find(x => x.code === code);
  if (!r) return;
  const dims = ["组织", "岗位", "金额"];
  showDrawer("编辑矩阵规则 · " + code, `
    <div class="field"><label>规则编码</label><input class="input mono" value="${r.code}" readonly></div>
    <div class="field"><label><span class="req">*</span>规则名称</label><input class="input" value="${r.name}"></div>
    <div class="field"><label><span class="req">*</span>维度</label>
      <select class="select">${dims.map(d => `<option ${d === r.dimension ? "selected" : ""}>${d}</option>`).join("")}</select>
      <div class="tip">V1.0 支持 组织 / 岗位 / 金额 三维；角色/自定义维度为 V1.5（C1-F02-4）</div></div>
    <div class="field"><label><span class="req">*</span>匹配条件</label><input class="input" value="${r.match}"></div>
    <div class="field"><label><span class="req">*</span>解析规则</label><input class="input" value="${r.resolver}"></div>
    <div class="field"><label>优先级</label><input class="input" type="number" value="${r.priority}">
      <div class="tip">数值越小优先级越高；按 priority 顺序匹配，命中即停</div></div>
    <div class="field"><label>状态</label>
      <select class="select"><option ${r.status === "启用" ? "selected" : ""}>启用</option><option ${r.status === "停用" ? "selected" : ""}>停用</option></select></div>
    <div class="readonly-banner">
      ⚠ 矩阵变更<b>不影响运行实例</b>（C1-F02）；解析失败时回退<b>兜底审批人</b>并触发<b>解析失败告警</b>（C1-F02-3）
    </div>
    <div class="flex gap-2 mt-4">
      <button class="btn btn-primary" onclick="msg('success','规则 ${r.code} 已保存，规则保存即生效（不影响运行实例）');closeDrawer('d-generic')">保存规则</button>
      <button class="btn" onclick="closeDrawer('d-generic')">取消</button>
    </div>`);
}

/* WF-04 流程实例：详情抽屉（基本信息 + formData + 审批时间轴 + 留痕说明） */
function wfInstanceDetail(instanceId) {
  const it = MOCK.workflow.instances.find(x => x.instanceId === instanceId);
  if (!it) return;
  const tagMap = { "RUNNING": "warning", "APPROVED": "success", "REJECTED": "danger", "WITHDRAWN": "info", "TERMINATED": "danger" };
  const labelMap = { "RUNNING": "运行中", "APPROVED": "已通过", "REJECTED": "已驳回", "WITHDRAWN": "已撤回", "TERMINATED": "已终止" };
  const tl = MOCK.workflow.instanceTimeline[instanceId] || [];
  const fd = it.formData || {};
  // 表单数据展示：中台自有流程且有 formSchema → 结构化只读渲染；外部集成流程 / 无 schema → 降级 key-value 平铺
  const defKey = MOCK.defKeyFromBizKey ? MOCK.defKeyFromBizKey(it.bizKey) : it.bizType;
  const launchCfg = (it.sourceSystem === "中台" && MOCK.getWorkflowLaunchConfig) ? MOCK.getWorkflowLaunchConfig(defKey) : { launchMode: "form" };
  const isExtLaunch = launchCfg.launchMode === "external";
  const schema = (!isExtLaunch && it.sourceSystem === "中台") ? wfSchemaByBizType(it.bizType) : null;
  const fdHtml = isExtLaunch
    ? `<div class="readonly-banner">第三方页面模式：表单在业务系统，中台仅存 URL 与实例关联。</div>`
    : schema
      ? wfRenderFormReadonly(schema, fd, "readonly")
      : `<dl class="desc-grid">${Object.keys(fd).map(k => `<dt>${k}</dt><dd>${fd[k]}</dd>`).join("")}</dl>`;
  const fdNote = isExtLaunch
    ? `查看地址 viewUrl 由流程定义步骤 1 配置`
    : schema
      ? `标签来自流程定义 formSchema（按 defKey+defVersion 反查），值来自实例 formData（发起版本快照）`
      : `该实例为外部集成流程（来源：${it.sourceSystem}）或未配置 formSchema，按 key-value 平铺展示`;
  const extViewBtn = isExtLaunch
    ? `<button class="btn btn-primary mt-3" onclick="MOCK.openWorkflowViewUrl('${defKey}',{bizKey:'${it.bizKey}'})">在业务系统查看</button>`
    : "";
  const tlHtml = tl.map(t => `<div class="t-item">
      <div style="font-size:14px;color:var(--bmp-text-title)"><b>${t.node}</b> · ${t.assignee} <span class="tag tag-info" style="margin-left:4px">${t.action}</span>
        ${t.proxy ? `<span class="tag tag-warning" style="margin-left:4px">代理</span>` : ""}</div>
      ${t.proxy && t.proxyFrom ? `<div class="fs-12 text-warning mt-2">🔁 ${t.proxyFrom}</div>` : ""}
      ${t.comment && t.comment !== "—" ? `<div class="fs-13 text-secondary mt-2">意见：${t.comment}</div>` : ""}
      <div class="t-time mt-2">${t.time}</div>
    </div>`).join("");
  showDrawer("流程实例详情 · " + instanceId, `
    <dl class="desc-grid">
      <dt>实例 ID</dt><dd class="mono">${it.instanceId}</dd>
      <dt>业务键 bizKey</dt><dd class="mono">${it.bizKey}</dd>
      <dt>来源系统</dt><dd>${it.sourceSystem}</dd>
      <dt>业务类型</dt><dd class="mono">${it.bizType}</dd>
      <dt>标题</dt><dd>${it.title}</dd>
      <dt>发起人</dt><dd>${it.initiator}</dd>
      <dt>当前节点</dt><dd>${it.currentNode}</dd>
      <dt>状态</dt><dd>${statusTag(labelMap[it.status], { "运行中": "warning", "已通过": "success", "已驳回": "danger", "已撤回": "info", "已终止": "danger" })}</dd>
      <dt>发起时间</dt><dd class="mono">${it.startTime}</dd>
      <dt>已耗时</dt><dd>${it.duration}</dd>
    </dl>
    <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:20px 0 12px">表单数据 formData</h4>
    ${fdHtml}
    <div class="fs-12 text-secondary mt-2">ℹ ${fdNote}</div>
    ${extViewBtn}
    <h4 style="font:var(--bmp-font-h3);color:var(--bmp-text-title);margin:20px 0 12px">审批时间轴（wf_approval_record）</h4>
    ${tl.length ? `<div class="timeline">${tlHtml}</div>` : `<div class="state-box"><div class="illus">🕓</div><div class="txt">暂无审批记录</div></div>`}
    <div class="readonly-banner mt-4" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
      🛡 审批留痕<b>仅追加、不可篡改</b>；完整记录操作人、动作、意见、时间、是否代理与 trace_id；职责边界：C1 产生留痕数据，E2 承载与检索（C1-F08）
    </div>`);
}

/* WF-04 流程实例：终止 */
function wfTerminate(instanceId) {
  const it = MOCK.workflow.instances.find(x => x.instanceId === instanceId);
  if (!it) return;
  highRisk("终止流程实例",
    `将终止流程实例 <b>${instanceId}</b>（${it.title}）。终止后实例进入 <b>TERMINATED</b> 状态，不再流转。` +
    `该动作将<b>写留痕</b>并上报 E2 审计，且不可恢复。`,
    instanceId,
    `实例 ${instanceId} 已终止（写留痕 / 上报 E2）`);
}

/* WF-03 审批矩阵：新建规则抽屉（复用编辑范式） */
function wfMatrixNew() {
  const dims = ["组织", "岗位", "金额"];
  showDrawer("新建矩阵规则", `
    <div class="field"><label>规则编码</label><input class="input mono" value="MX-NEW-" placeholder="MX-XXX-000"></div>
    <div class="field"><label><span class="req">*</span>规则名称</label><input class="input" placeholder="如：部门负责人审批"></div>
    <div class="field"><label><span class="req">*</span>维度</label>
      <select class="select">${dims.map(d => `<option>${d}</option>`).join("")}</select>
      <div class="tip">V1.0 支持 组织 / 岗位 / 金额 三维；角色/自定义维度为 V1.5（C1-F02-4）</div></div>
    <div class="field"><label><span class="req">*</span>匹配条件</label><input class="input" placeholder="如：发起人所属部门（任意组织）"></div>
    <div class="field"><label><span class="req">*</span>解析规则</label><input class="input" placeholder="如：取该部门负责人（org.leader）"></div>
    <div class="field"><label>优先级</label><input class="input" type="number" value="50">
      <div class="tip">数值越小优先级越高；按 priority 顺序匹配，命中即停</div></div>
    <div class="readonly-banner">
      ⚠ 矩阵变更<b>不影响运行实例</b>（C1-F02）；解析失败时回退<b>兜底审批人</b>并触发<b>解析失败告警</b>（C1-F02-3）
    </div>
    <div class="flex gap-2 mt-4">
      <button class="btn btn-primary" onclick="msg('success','新规则已保存，规则保存即生效（不影响运行实例）');closeDrawer('d-generic')">保存规则</button>
      <button class="btn" onclick="closeDrawer('d-generic')">取消</button>
    </div>`);
}

/* WF-05 委托代理：新建委托弹窗 */
function wfNewDelegate() {
  document.getElementById("formTitle").textContent = "新建委托";
  document.getElementById("formBody").innerHTML = `
    <div class="field"><label><span class="req">*</span>委托人</label>
      <input class="input" placeholder="EmployeeSelect：搜索姓名 / 工号（默认本人）" value="张三（EMP-2020-0031）">
      <div class="tip">代理期内该委托人收到的新任务将自动路由至代理人</div></div>
    <div class="field"><label><span class="req">*</span>代理人</label>
      <input class="input" placeholder="EmployeeSelect：搜索姓名 / 工号"></div>
    <div class="field" style="display:flex;gap:12px">
      <div style="flex:1"><label><span class="req">*</span>开始时间</label><input class="input" type="date" value="2026-09-22"></div>
      <div style="flex:1"><label><span class="req">*</span>结束时间</label><input class="input" type="date" value="2026-09-29"></div>
    </div>
    <div class="field"><label><span class="req">*</span>事由</label><input class="input" placeholder="如：出差 / 休假 / 项目驻场"></div>
    <div class="readonly-banner" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
      🔁 起止时间必填；代理期内新任务自动路由至代理人并记录实际处理人（proxy_flag）；到期自动失效（C1-F04）
    </div>`;
  document.getElementById("formOk").onclick = () => { closeModal("m-form"); msg("success", "委托已创建，代理期内新任务将自动路由至代理人（留痕标注代理关系）"); };
  openModal("m-form");
}

/* WF-05 委托代理：终止委托 */
function wfEndDelegate(id, principal, delegate) {
  highRisk("终止委托",
    `将终止委托关系 <b>${id}</b>（${principal} → ${delegate}）。终止后代理即时失效，后续任务不再路由至代理人。`,
    id,
    `委托 ${id} 已终止，代理即时失效`);
}

/* WF-05 委托代理：详情抽屉 */
function wfDelegateDetail(id) {
  const d = MOCK.workflow.delegates.find(x => x.id === id);
  if (!d) return;
  showDrawer("委托详情 · " + id, `
    <dl class="desc-grid">
      <dt>委托编号</dt><dd class="mono">${d.id}</dd>
      <dt>委托人</dt><dd>${d.principal}</dd>
      <dt>代理人</dt><dd>${d.delegate}</dd>
      <dt>代理期</dt><dd class="mono">${d.startTime} ~ ${d.endTime}</dd>
      <dt>事由</dt><dd>${d.reason}</dd>
      <dt>状态</dt><dd>${statusTag(d.status, { "生效中": "success", "已失效": "info" })}</dd>
    </dl>
    <div class="readonly-banner mt-4" style="background:var(--bmp-color-info-light);border-color:var(--bmp-border);color:var(--bmp-text-secondary)">
      🔁 代理期内委托人的新任务自动路由至代理人，办理记录实际处理人（proxy_flag）；委托人与代理人均可见；到期自动失效（C1-F04-2）
    </div>`);
}
