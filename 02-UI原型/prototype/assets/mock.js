/* ============================================================
   麓邦业务中台 原型模拟数据与公共交互
   字段与《V1.0 基座版详细设计》第三章接口契约一致
   ============================================================ */
window.MOCK = {
  user: { accountId: 1001, username: "zhangsan", name: "张三", employeeNo: "EMP-2020-0031", org: "数字化中心", avatarText: "张", roles: ["普通员工", "系统管理员"] },

  todos: [
    { id: 1, urgency: 2, source: "CRM", bizType: "contract_approval", title: "【合同审批】华宇科技采购合同 ¥120,000", submitter: "王经理", remainHours: 3, overdue: false, time: "09-22 10:15", jumpUrl: "javascript:msg('info','原型演示：新标签页打开 CRM 处理页（决议 #5）')" },
    { id: 2, urgency: 1, source: "招聘系统", bizType: "resume_screen", title: "【简历初筛】前端工程师候选人 ×3", submitter: "李四", remainHours: -2, overdue: true, time: "09-21 16:00", jumpUrl: "javascript:msg('info','原型演示：新标签页打开招聘系统')" },
    { id: 3, urgency: 2, source: "OA", bizType: "purchase_approval", title: "【采购审批】研发中心服务器扩容 ¥86,000", submitter: "赵工", remainHours: 6, overdue: false, time: "09-22 09:40", jumpUrl: "javascript:msg('info','原型演示：新标签页打开 OA')" },
    { id: 4, urgency: 0, source: "OA", bizType: "leave_approval", title: "【请假审批】李四 年假 2 天（09-25 ~ 09-26）", submitter: "李四", remainHours: 20, overdue: false, time: "09-22 08:55", jumpUrl: "javascript:msg('info','原型演示：新标签页打开 OA')" },
    { id: 5, urgency: 1, source: "CRM", bizType: "discount_approval", title: "【折扣审批】恒信集团年度框架折扣 12%", submitter: "销售部-陈晨", remainHours: 9, overdue: false, time: "09-21 17:30", jumpUrl: "javascript:msg('info','原型演示：新标签页打开 CRM')" },
    { id: 6, urgency: 0, source: "目标管理", bizType: "okr_review", title: "【目标确认】Q3 部门 OKR 对齐确认", submitter: "周总", remainHours: 40, overdue: false, time: "09-21 14:00", jumpUrl: "javascript:msg('info','原型演示：新标签页打开目标系统')" }
  ],

  /**
   * A4 员工侧待办聚合：外链 portal_todo + 站内 wf_task（深链审批中心）
   * 与 C3 站内办理对齐；同 bizType 的外链项去重，避免双份展示
   */
  portalEmployeeTodos() {
    const external = (MOCK.todos || []).map(t => ({
      ...t,
      channel: "external",
      handleMode: "jump",
      jumpUrl: t.jumpUrl
    }));
    const wfTodo = ((MOCK.workflow && MOCK.workflow.approvalCenter && MOCK.workflow.approvalCenter.todo) || [])
      .filter(w => w.mode === "站内");
    const internal = wfTodo.map(w => ({
      id: "wf-" + w.id,
      wfTaskId: w.id,
      urgency: w.urgency,
      source: w.sourceSystem,
      bizType: w.bizType,
      title: w.title,
      submitter: w.submitter,
      remainHours: w.remainHours,
      overdue: w.remainHours < 0,
      time: w.time,
      channel: "workflow",
      handleMode: "internal",
      jumpUrl: "approval.html?task=" + encodeURIComponent(w.id)
    }));
    const internalBiz = new Set(internal.map(t => t.bizType));
    const extFiltered = external.filter(t => !internalBiz.has(t.bizType));
    return internal.concat(extFiltered);
  },
  todosDone: [
    { id: 101, source: "OA", title: "【报销审批】差旅费 ¥2,340", result: "已同意", time: "09-20 15:22" },
    { id: 102, source: "CRM", title: "【合同审批】蓝海科技服务协议", result: "已同意", time: "09-19 11:05" },
    { id: 103, source: "招聘系统", title: "【面试安排】产品经理候选人复试", result: "已确认", time: "09-18 16:40" }
  ],
  todosInitiated: [
    { id: 201, source: "OA", title: "【用章申请】华宇科技合同盖章", progress: "处理中", node: "法务审核（2/3）", time: "09-22 09:10" },
    { id: 202, source: "OA", title: "【差旅申请】上海客户拜访 09-26", progress: "已完成", node: "—", time: "09-20 10:00" },
    { id: 203, source: "CRM", title: "【折扣申请】恒信集团特批折扣", progress: "处理中", node: "销售总监（1/2）", time: "09-19 14:30" }
  ],

  messages: [
    { id: 1, cat: "公告", title: "关于国庆节放假安排的通知", time: "09-22 09:00", unread: true, top: true, body: "根据国务院办公厅通知，国庆节 10 月 1 日至 7 日放假调休，共 7 天。请各部门提前安排好工作交接与值班事宜。" },
    { id: 2, cat: "系统通知", title: "系统维护通知：本周六 22:00-24:00", time: "09-22 10:32", unread: true, top: false, body: "为提升服务质量，业务中台将于本周六 22:00-24:00 进行例行维护，期间 SSO 登录可能短暂中断，请提前保存工作内容。" },
    { id: 3, cat: "审批结果", title: "合同审批结果：华宇科技合同已通过终审", time: "09-22 09:15", unread: true, top: false, jumpUrl: "javascript:msg('info','原型演示：跳转 CRM 合同详情')", body: "你提交的《华宇科技采购合同》已通过终审，合同编号 HT-2026-0918，可前往 CRM 下载用印版本。" },
    { id: 4, cat: "待办提醒", title: "待办临期提醒：采购审批剩余 6 小时", time: "09-22 08:00", unread: false, top: false, body: "你有一条【采购审批】待办将于 6 小时后到期，请及时处理。" },
    { id: 5, cat: "审批结果", title: "报销单 BX-2026-0342 已打款", time: "09-21 16:20", unread: false, top: false, body: "你的差旅报销 ¥2,340 已完成打款，预计 1 个工作日内到账。" }
  ],

  notices: [
    { id: 1, title: "关于国庆节放假安排的通知", dept: "行政部", time: "09-22 09:00", top: true, read: false, body: "根据国务院办公厅通知，国庆节 10 月 1 日至 7 日放假调休，共 7 天。9 月 28 日（周日）、10 月 11 日（周六）上班。请各部门提前安排好工作交接与值班事宜，值班表请于 9 月 26 日前报送行政部。" },
    { id: 2, title: "业务中台 V1.0 上线公告", dept: "数字化中心", time: "09-20 10:00", top: false, read: false, body: "麓邦业务中台 V1.0 基座版正式上线，提供统一登录、统一待办、统一消息能力。原各系统入口逐步迁移，使用过程中遇到问题请联系数字化中心（内线 8000）。" },
    { id: 3, title: "关于开展 2026 年度职称评审工作的通知", dept: "人力资源部", time: "09-18 14:30", top: false, read: true, body: "2026 年度职称评审工作即日起启动，申报截止 10 月 15 日，请符合条件同事登录 HR 系统提交材料。" }
  ],

  /* V1.5 方案 A：门户意图项默认集（管理端 A1-F02-7 可改，持久化 key=bmp_portal_intents） */
  portalIntentsDefault: [
    { key: "launch_approval", icon: "🚀", name: "发起一个审批", sub: "合同 / 采购 / 权限申请", kind: "form", bizType: "launch_approval", jumpUrl: "approval.html", jumpType: "internal", enabled: true, order: 1 },
    { key: "my_contracts", icon: "📄", name: "查我的合同", sub: "CRM · 合同与用印记录", kind: "sso", app: "CRM 客户管理", jumpUrl: "https://crm.example.com/contracts/mine", jumpType: "external", enabled: true, order: 2 },
    { key: "find_person", icon: "🔎", name: "找人", sub: "组织人员 · 按姓名 / 部门", kind: "form", bizType: "find_person", jumpUrl: "console.html?page=employees", jumpType: "internal", enabled: true, order: 3 },
    { key: "leave", icon: "🌴", name: "我要请假", sub: "年假 / 事假 / 病假", kind: "form", bizType: "leave_approval", jumpUrl: "", jumpType: "cmd", enabled: true, order: 4 },
    { key: "expense", icon: "🧾", name: "提个报销", sub: "差旅 / 招待 / 办公费", kind: "sso", app: "费用报销", jumpUrl: "https://expense.example.com/submit", jumpType: "external", enabled: true, order: 5 },
    { key: "data", icon: "📈", name: "看本月数据", sub: "经营 / 销售 / 人力看板", kind: "sso", app: "数据报表", jumpUrl: "apps.html", jumpType: "internal", enabled: true, order: 6 },
    { key: "seal", icon: "🔖", name: "用章申请", sub: "合同章 / 公章 / 法人章", kind: "form", bizType: "seal_apply", jumpUrl: "", jumpType: "cmd", enabled: true, order: 7 }
  ],

  /* 门户首页 AI 助手（验收演示默认开启 · A1-F02-9；持久化 key=bmp_portal_ai_config） */
  portalAiAssistantDefault: {
    enabled: true,
    welcomeText: "我是工作台助手。可问我待办、打开应用或流程说明；与左侧「规则今日简报」互补，多轮对话经 MCP 对接中台能力。",
    inputPlaceholder: "输入问题…（演示路由：模型路由 V2）",
    modelRouteLabel: "模型路由 V2",
    aiAvailable: true,
    unavailableMessage: "AI 服务暂不可用。请使用 ⌘K 或左栏「意图流」，或联系数字化中心。",
    e1RouteLink: "console.html?page=gateway",
    e1RouteHint: "E1 网关 · /ai/** → ai-platform（原型路由待启用）"
  },

  apps: [
    { name: "CRM 客户管理", icon: "📊", group: "业务系统", kind: "external", appCode: "crm", freq: 32, color: "#1677FF" },
    { name: "OA 办公", icon: "📋", group: "业务系统", kind: "external", appCode: "oa", freq: 28, color: "#F59E0B" },
    { name: "招聘系统", icon: "🧑‍💼", group: "业务系统", kind: "external", appCode: "recruit", freq: 12, color: "#07C160" },
    { name: "费用报销", icon: "🧾", group: "业务系统", kind: "external", appCode: "expense", freq: 9, color: "#8B5CF6" },
    { name: "目标管理", icon: "🎯", group: "业务系统", kind: "external", appCode: "okr", freq: 7, color: "#EC4899" },
    { name: "项目管理", icon: "📁", group: "业务系统", kind: "external", appCode: "pm", freq: 5, color: "#14B8A6" },
    { name: "知识库", icon: "📚", group: "协作平台", kind: "external", appCode: "wiki", freq: 4, color: "#F97316" },
    { name: "数据报表", icon: "📈", group: "协作平台", kind: "external", appCode: "bi", freq: 3, color: "#0EA5E9" }
  ],

  /* 业务域字典（V1.5+ 静态 · 与 portal_app.biz_domain / B2-F02-1 对齐） */
  bizDomains: [
    { code: "HR", label: "人事" },
    { code: "PROCUREMENT", label: "采购" },
    { code: "SALES", label: "销售" },
    { code: "IT", label: "IT" },
    { code: "GENERAL", label: "通用" }
  ],

  /* 流程类门户应用种子（portal_app.kind=workflow · C1-F01-8 / A1-F01-3） */
  portalWorkflowApps: [
    { name: "合同审批", kind: "workflow", defKey: "contract_approval", appCode: "wf_contract_approval", bizDomain: "SALES", group: "销售", icon: "📝", color: "#1677FF", freq: 14, portalVisible: true, status: "已上架", launchMode: "start_form" },
    { name: "Offer 审批", kind: "workflow", defKey: "recruit_offer", appCode: "wf_recruit_offer", bizDomain: "HR", group: "人事", icon: "🤝", color: "#07C160", freq: 6, portalVisible: true, status: "已上架", launchMode: "start_form" },
    { name: "差旅报销", kind: "workflow", defKey: "travel_expense", appCode: "wf_travel_expense", bizDomain: "GENERAL", group: "财务", icon: "🧾", color: "#8B5CF6", freq: 5, portalVisible: true, status: "已上架", launchMode: "start_form" }
  ],

  /* 布局引擎：template_json（角色模板）+ user_override（个人覆盖，决议 #6） */
  layoutTemplate: {
    version: 1,
    cards: [
      { cardId: "todo-list", name: "待办卡片", grid: 12, order: 1, visible: true },
      { cardId: "frequent-apps", name: "常用应用", grid: 12, order: 2, visible: true },
      { cardId: "notice-msg", name: "消息/公告", grid: 16, order: 3, visible: true },
      { cardId: "data-metrics", name: "数据指标卡（V1.5）", grid: 8, order: 4, visible: true }
    ]
  },
  cardManifest: [
    { cardId: "todo-list", name: "待办卡片", minGrid: 8, dataApi: "GET /v1/todos?top=5" },
    { cardId: "frequent-apps", name: "常用应用", minGrid: 6, dataApi: "GET /v1/apps/frequent" },
    { cardId: "notice-msg", name: "消息/公告", minGrid: 8, dataApi: "GET /v1/messages/unread-count" },
    { cardId: "data-metrics", name: "数据指标卡", minGrid: 6, dataApi: "GET /v1/metrics（V1.5）" },
    { cardId: "birthday", name: "员工生日卡", minGrid: 6, dataApi: "GET /v1/md/birthday（V1.5 上架）" }
  ],

  accounts: [
    { id: 1001, username: "zhangsan", name: "张三", employeeNo: "EMP-2020-0031", org: "数字化中心", status: "启用", lastLogin: "09-22 08:55", created: "2026-08-01" },
    { id: 1002, username: "lisi", name: "李四", employeeNo: "EMP-2021-0102", org: "人力资源部", status: "启用", lastLogin: "09-22 09:12", created: "2026-08-01" },
    { id: 1003, username: "wangjl", name: "王经理", employeeNo: "EMP-2019-0008", org: "销售部", status: "启用", lastLogin: "09-21 18:02", created: "2026-08-01" },
    { id: 1004, username: "zhaogong", name: "赵工", employeeNo: "EMP-2022-0233", org: "研发中心", status: "锁定", lastLogin: "09-20 10:11", created: "2026-08-05" },
    { id: 1005, username: "chenchen", name: "陈晨", employeeNo: "EMP-2023-0311", org: "销售部", status: "停用", lastLogin: "09-10 14:20", created: "2026-08-12" }
  ],
  roles: [
    { id: 1, name: "超级管理员", code: "super_admin", members: 2, source: "系统预置" },
    { id: 2, name: "普通员工", code: "employee", members: 486, source: "系统预置" },
    { id: 3, name: "系统管理员", code: "sys_admin", members: 4, source: "系统预置" },
    { id: 4, name: "消息管理员", code: "msg_admin", members: 2, source: "自建" },
    { id: 5, name: "审计员", code: "auditor", members: 3, source: "自建" }
  ],
  /* 权限点扁平行（UI-C-03 分系统/分业务域筛选 · B2-F02-1 原型） */
  permissionsFlat: [
    { code: "system:account:list", type: "menu", apiPattern: "GET /v1/accounts", desc: "账号列表查看", appCode: "platform", bizDomain: "GENERAL", module: "身份与权限", submodule: "账号管理", roleRefs: 3 },
    { code: "system:account:create", type: "button", apiPattern: "POST /v1/accounts", desc: "新建账号", appCode: "platform", bizDomain: "GENERAL", module: "身份与权限", submodule: "账号管理", roleRefs: 1 },
    { code: "system:account:disable", type: "api", apiPattern: "PUT /v1/accounts/*/status", desc: "停用/启用账号（高危）", appCode: "platform", bizDomain: "IT", module: "身份与权限", submodule: "账号管理", roleRefs: 1 },
    { code: "system:role:list", type: "menu", apiPattern: "GET /v1/roles", desc: "角色列表", appCode: "platform", bizDomain: "GENERAL", module: "身份与权限", submodule: "角色管理", roleRefs: 2 },
    { code: "portal:layout:list", type: "menu", apiPattern: "GET /v1/portal/layouts", desc: "布局模板列表", appCode: "platform", bizDomain: "GENERAL", module: "门户运营", submodule: "布局模板", roleRefs: 2 },
    { code: "portal:app:view", type: "menu", apiPattern: "GET /v1/portal/apps", desc: "应用中心可见", appCode: "platform", bizDomain: "GENERAL", module: "门户运营", submodule: "应用入口", roleRefs: 5 },
    { code: "workflow:def:manage", type: "menu", apiPattern: "POST /v1/workflow/definition", desc: "流程定义管理", appCode: "platform", bizDomain: "IT", module: "工作流", submodule: "流程定义", roleRefs: 1 },
    { code: "workflow:instance:start:contract_approval", type: "button", apiPattern: "POST /v1/workflow/instance", desc: "发起合同审批", appCode: "platform", bizDomain: "SALES", module: "工作流", submodule: "contract_approval", roleRefs: 4 },
    { code: "workflow:instance:start:recruit_offer", type: "button", apiPattern: "POST /v1/workflow/instance", desc: "发起 Offer 审批", appCode: "platform", bizDomain: "HR", module: "工作流", submodule: "recruit_offer", roleRefs: 2 },
    { code: "crm:contract:edit", type: "button", apiPattern: "PUT /crm/v1/contracts/*", desc: "CRM 合同编辑", appCode: "crm", bizDomain: "SALES", module: "外链 · CRM", submodule: "合同", roleRefs: 3 },
    { code: "oa:purchase:approve", type: "api", apiPattern: "POST /oa/v1/purchase/approve", desc: "OA 采购审批", appCode: "oa", bizDomain: "PROCUREMENT", module: "外链 · OA", submodule: "采购", roleRefs: 2 }
  ],

  permTree: [
    { name: "身份与权限", children: [
      { name: "账号管理", perms: [{ code: "system:account:list", type: "menu" }, { code: "system:account:create", type: "button" }, { code: "system:account:disable", type: "button" }, { code: "POST /v1/accounts", type: "api" }] },
      { name: "角色管理", perms: [{ code: "system:role:list", type: "menu" }, { code: "system:role:assign", type: "button" }] },
      { name: "会话管理", perms: [{ code: "system:session:list", type: "menu" }, { code: "system:session:kick", type: "button" }] }
    ]},
    { name: "主数据", children: [
      { name: "组织人员", perms: [{ code: "md:org:list", type: "menu" }, { code: "md:employee:edit", type: "button" }] },
      { name: "权威源", perms: [{ code: "md:sync:config", type: "menu" }, { code: "md:sync:switch", type: "api" }] }
    ]},
    { name: "门户运营", children: [
      { name: "布局模板", perms: [{ code: "portal:layout:list", type: "menu" }, { code: "portal:layout:publish", type: "button" }] }
    ]},
    { name: "消息管理", children: [
      { name: "模板审核", perms: [{ code: "msg:template:audit", type: "button" }] }
    ]}
  ],
  sessions: [
    { id: "jti-9f21", account: "zhangsan", name: "张三", loginTime: "09-22 08:55", lastActive: "1 分钟前", ip: "10.20.3.41", device: "Chrome / Windows", self: true },
    { id: "jti-8e02", account: "lisi", name: "李四", loginTime: "09-22 09:12", lastActive: "5 分钟前", ip: "10.20.5.18", device: "钉钉 / iPhone", self: false },
    { id: "jti-7c33", account: "wangjl", name: "王经理", loginTime: "09-21 18:02", lastActive: "14 小时前", ip: "10.20.7.92", device: "企业微信 / Android", self: false }
  ],

  orgTree: {
    id: 1, name: "麓邦集团", count: 512, children: [
      { id: 2, name: "数字化中心", count: 36, children: [
        { id: 5, name: "平台研发组", count: 18 }, { id: 6, name: "数据组", count: 10 }, { id: 7, name: "实施运维组", count: 8 } ]},
      { id: 3, name: "销售部", count: 120, children: [ { id: 8, name: "华北大区", count: 45 }, { id: 9, name: "华东大区", count: 52 } ]},
      { id: 4, name: "人力资源部", count: 12 },
      { id: 10, name: "研发中心", count: 180, children: [ { id: 11, name: "前端组", count: 24 }, { id: 12, name: "后端组", count: 60 } ]},
      { id: 13, name: "市场部（停用）", count: 0, disabled: true }
    ]
  },
  /* empType（D14 · md_employee.employee_type 标记位）：正式 / 外包 / 维护
     —— 维护账号（MNT-{流水}）无钉钉 userid，登录走「账号密码 + MFA」；挂真实组织，不建虚拟组织。 */
  employees: [
    { no: "MNT-001", name: "运维A", org: "数字化中心/实施运维组", post: "维护", status: "在职", leader: "刘总监", source: "自建维护", account: true, empType: "维护" },
    { no: "EMP-2019-0008", name: "王经理", org: "销售部/华北大区", post: "销售经理", status: "在职", leader: "周总", source: "HR系统", account: true, empType: "正式" },
    { no: "EMP-2020-0031", name: "张三", org: "数字化中心/平台研发组", post: "产品经理", status: "在职", leader: "刘总监", source: "HR系统", account: true, empType: "正式" },
    { no: "EMP-2021-0102", name: "李四", org: "人力资源部", post: "HRBP", status: "在职", leader: "钱经理", source: "HR系统", account: true, empType: "正式" },
    { no: "EMP-2022-0233", name: "赵工", org: "研发中心/后端组", post: "高级工程师", status: "在职", leader: "孙组长", source: "钉钉", account: true, empType: "正式" },
    { no: "EMP-2023-0311", name: "陈晨", org: "销售部/华东大区", post: "销售代表", status: "离职", leader: "王经理", source: "HR系统", account: false, empType: "正式" },
    { no: "EMP-2026-0455", name: "新小二", org: "研发中心/前端组", post: "前端工程师", status: "在职", leader: "孙组长", source: "钉钉", account: false, empType: "外包" }
  ],
  syncLogs: [
    { time: "09-22 02:00", source: "HR系统", type: "全量", result: "成功", stat: "新增 2 / 更新 15 / 停用 1 / 异常 0", cost: "42s" },
    { time: "09-21 02:00", source: "HR系统", type: "全量", result: "部分失败", stat: "新增 1 / 更新 8 / 停用 0 / 异常 2", cost: "39s" },
    { time: "09-20 02:00", source: "HR系统", type: "全量", result: "成功", stat: "新增 0 / 更新 11 / 停用 0 / 异常 0", cost: "35s" },
    { time: "09-19 02:00", source: "HR系统", type: "全量", result: "失败", stat: "接口超时（连接 HR 网关 10.0.2.30:8443）", cost: "30s" }
  ],
  syncFailDetail: [
    { field: "mobile", src: "138****223X", expect: "11 位手机号", err: "格式非法（含掩码字符）" },
    { field: "entry_date", src: "2026/9/1", expect: "yyyy-MM-dd", err: "日期格式不匹配" }
  ],

  msgTemplates: [
    { code: "TPL_TODO_URGENT", name: "紧急待办提醒", channels: ["钉钉", "站内信"], status: "已启用", updated: "09-18 14:00" },
    { code: "TPL_AUDIT_RESULT", name: "审批结果通知", channels: ["钉钉", "企业微信", "站内信"], status: "已启用", updated: "09-15 10:20" },
    { code: "TPL_ONBOARD", name: "新员工账号开通通知", channels: ["钉钉", "邮件"], status: "待审核", updated: "09-21 16:40" },
    { code: "TPL_PWD_RESET", name: "密码重置通知", channels: ["邮件", "短信"], status: "草稿", updated: "09-20 09:00" },
    { code: "TPL_SYS_MAINTAIN", name: "系统维护公告", channels: ["站内信"], status: "停用", updated: "09-01 11:00" }
  ],
  msgChannels: [
    { name: "钉钉工作通知", connector: "connector-dingtalk", status: "已连接", lastTest: "09-22 08:00", result: "成功 200 · 120ms" },
    { name: "企业微信应用消息", connector: "connector-wecom", status: "已连接", lastTest: "09-22 08:00", result: "成功 200 · 98ms" },
    { name: "站内信", connector: "内置", status: "已连接", lastTest: "—", result: "—" },
    { name: "邮件（SMTP）", connector: "connector-email", status: "未配置", lastTest: "—", result: "—" },
    { name: "短信", connector: "connector-sms", status: "未配置", lastTest: "—", result: "—" }
  ],
  msgRecords: [
    { time: "09-22 10:15", tpl: "TPL_AUDIT_RESULT", receiver: "张三", channel: "钉钉", status: "成功", msgId: "MSG-20260922-0912" },
    { time: "09-22 09:00", tpl: "TPL_TODO_URGENT", receiver: "王经理", channel: "钉钉", status: "成功", msgId: "MSG-20260922-0855" },
    { time: "09-22 08:30", tpl: "TPL_TODO_URGENT", receiver: "赵工", channel: "企业微信", status: "失败", msgId: "MSG-20260922-0831", err: "账号锁定，容器免登失效" },
    { time: "09-21 17:00", tpl: "TPL_AUDIT_RESULT", receiver: "陈晨", channel: "站内信", status: "成功", msgId: "MSG-20260921-1658" }
  ],

  auditLogs: [
    { time: "09-22 10:32:15", user: "张三 (EMP-2020-0031)", type: "登录", desc: "SSO 登录成功（钉钉扫码）", ip: "10.20.3.41", result: "成功", high: false, traceId: "tr-9f21a3c" },
    { time: "09-22 10:05:44", user: "系统管理员 (admin)", type: "权限变更", desc: "角色[消息管理员]新增权限点 msg:template:audit", ip: "10.20.1.5", result: "成功", high: true, traceId: "tr-8e02b7d" },
    { time: "09-22 09:48:02", user: "李四 (EMP-2021-0102)", type: "数据变更", desc: "更新员工[新小二]任职信息：部门 研发中心→研发中心/前端组", ip: "10.20.5.18", result: "成功", high: false, traceId: "tr-7c33e1f" },
    { time: "09-22 09:30:19", user: "系统管理员 (admin)", type: "高危操作", desc: "强制下线账号 zhaogong（会话 jti-7a01）", ip: "10.20.1.5", result: "成功", high: true, traceId: "tr-6b44d2e" },
    { time: "09-21 18:22:51", user: "王经理 (EMP-2019-0008)", type: "登录", desc: "密码连续错误 5 次，账号锁定 30 分钟", ip: "10.20.7.92", result: "失败", high: false, traceId: "tr-5a55c8b" }
  ],
  auditDiff: { before: { org: "研发中心", post: "前端工程师（实习）" }, after: { org: "研发中心/前端组", post: "前端工程师" } },

  gwRoutes: [
    { prefix: "/crm/**", target: "http://10.0.3.11:8080", enabled: true, qps: 200, gray: "—", legacy: true },
    { prefix: "/oa/**", target: "http://10.0.3.12:8081", enabled: true, qps: 300, gray: "—", legacy: true },
    { prefix: "/recruit/**", target: "http://10.0.3.15:9001", enabled: true, qps: 100, gray: "按部门：数字化中心 100%", legacy: true },
    { prefix: "/ai/**", target: "http://ai-platform.svc:8000", enabled: false, qps: 500, gray: "—", legacy: false },
    { prefix: "/bi/**", target: "http://data-platform.svc:7001", enabled: true, qps: 150, gray: "—", legacy: false }
  ],
  regApps: [
    { name: "CRM 客户管理", clientId: "crm-web", scopes: ["profile", "org", "todo.push"], status: "已启用", created: "2026-08-20", tokenEndpoint: "POST /v1/oauth/token" },
    { name: "OA 办公系统", clientId: "oa-legacy", scopes: ["profile", "todo.push", "msg.send"], status: "已启用", created: "2026-08-20", tokenEndpoint: "POST /v1/oauth/token" },
    { name: "招聘系统", clientId: "recruit-app", scopes: ["profile", "todo.push"], status: "已启用", created: "2026-09-02", tokenEndpoint: "POST /v1/oauth/token" },
    { name: "AI 中台（外挂）", clientId: "ai-platform", scopes: ["profile", "org", "perm.check"], status: "待启用", created: "2026-09-18", tokenEndpoint: "POST /v1/oauth/token" }
  ],
  /* 中台开放能力目录（管理端维护 · 注册申请时勾选） */
  platformApis: [
    { id: "api-profile", method: "GET", path: "/v1/user/profile", name: "当前用户档案", scope: "profile", kind: "OpenAPI", status: "已发布", version: "v1.0" },
    { id: "api-org-tree", method: "GET", path: "/v1/org/tree", name: "组织树只读", scope: "org", kind: "OpenAPI", status: "已发布", version: "v1.0" },
    { id: "api-employee", method: "GET", path: "/v1/md/employees", name: "人员只读检索", scope: "employee.read", kind: "OpenAPI", status: "已发布", version: "v1.0" },
    { id: "api-todo-push", method: "POST", path: "/v1/todo/push", name: "待办推送", scope: "todo.push", kind: "OpenAPI", status: "已发布", version: "v1.0" },
    { id: "api-msg-send", method: "POST", path: "/v1/msg/send", name: "消息发送", scope: "msg.send", kind: "OpenAPI", status: "已发布", version: "v1.0" },
    { id: "api-oauth-token", method: "POST", path: "/v1/oauth/token", name: "令牌换取", scope: "—", kind: "OpenAPI", status: "已发布", version: "v1.0" }
  ],
  platformEvents: [
    { id: "ev-org-changed", code: "md.org.changed", name: "组织变更", topic: "bmp-events-md", delivery: "Webhook(HMAC)", status: "已发布" },
    { id: "ev-emp-created", code: "md.employee.created", name: "人员入职", topic: "bmp-events-md", delivery: "Webhook(HMAC)", status: "已发布" },
    { id: "ev-emp-transferred", code: "md.employee.transferred", name: "人员调动", topic: "bmp-events-md", delivery: "Webhook(HMAC)", status: "已发布" },
    { id: "ev-emp-deactivated", code: "md.employee.deactivated", name: "人员离职/停用", topic: "bmp-events-md", delivery: "Webhook(HMAC)", status: "已发布" },
    { id: "ev-todo-created", code: "biz.todo.created", name: "待办创建", topic: "bmp-events-biz", delivery: "内部/MQ", status: "已发布" },
    /* C1 工作流领域事件（J3 · 对外契约 wf.*；与 C1-F06 callbackUrl 同 eventId 幂等） */
    { id: "ev-wf-inst-done", code: "wf.instance.completed", name: "流程实例通过", topic: "bmp-events-wf", delivery: "Webhook(HMAC)", status: "已发布" },
    { id: "ev-wf-inst-rej", code: "wf.instance.rejected", name: "流程实例驳回", topic: "bmp-events-wf", delivery: "Webhook(HMAC)", status: "已发布" },
    { id: "ev-wf-task-done", code: "wf.task.completed", name: "任务办理完成", topic: "bmp-events-wf", delivery: "Webhook(HMAC)", status: "已发布" }
  ],
  /* 应用注册申请（5 步向导 · V1.5 标准钉钉对齐键；不含库表/schema 发现） */
  regApplicationsDefault: [
    {
      id: "RA-2026-010", appName: "费用报销", clientId: "expense-web", owner: "李四", systemCode: "EXP",
      entryUrl: "https://expense.lubon.com", status: "待审批",
      apis: ["api-profile", "api-todo-push", "api-msg-send"], events: ["ev-emp-transferred"],
      callbackDomains: ["https://expense.lubon.com"],
      integrationTier: "standard", personKey: "dingtalk_userid", orgKey: "dingtalk_dept_id",
      orgMappingReady: true,
      accountMapping: "标准档 · dingtalk_userid", submitted: "2026-10-18 14:20", remark: "V1.5 新系统接入"
    },
    {
      id: "RA-2026-008", appName: "项目管理", clientId: "pm-suite", owner: "赵工", systemCode: "PM",
      entryUrl: "https://pm.lubon.com", status: "已通过",
      apis: ["api-profile", "api-org-tree"], events: ["ev-org-changed"],
      callbackDomains: ["https://pm.lubon.com"],
      integrationTier: "standard", personKey: "dingtalk_userid", orgKey: "dingtalk_dept_id",
      orgMappingReady: true,
      accountMapping: "标准档 · dingtalk_userid", submitted: "2026-10-10 09:00", approvedAt: "2026-10-11 11:30"
    },
    {
      id: "RA-2026-007", appName: "知识库（测试）", clientId: "kms-test", owner: "王管理员", systemCode: "KMS",
      entryUrl: "https://kms-test.lubon.com", status: "已驳回",
      apis: ["api-profile"], events: [], callbackDomains: ["http://kms-test.lubon.com"],
      integrationTier: "standard", personKey: "dingtalk_userid", orgKey: "dingtalk_dept_id",
      orgMappingReady: true,
      accountMapping: "标准档 · dingtalk_userid", submitted: "2026-10-08 16:40",
      rejectReason: "回调域名须为 https"
    }
  ],
  eventSubs: [
    { topic: "bmp-events-md", event: "md.employee.transferred", subscriber: "数据中台", type: "内部", status: "正常" },
    { topic: "bmp-events-md", event: "md.employee.deactivated", subscriber: "CRM Webhook", type: "Webhook(HMAC)", status: "正常" },
    { topic: "bmp-events-biz", event: "biz.todo.created", subscriber: "消息中心", type: "内部", status: "正常" },
    { topic: "bmp-events-md", event: "md.org.changed", subscriber: "招聘系统 Webhook", type: "Webhook(HMAC)", status: "死信 2 条" }
  ],
  /* J3-F05 · event_outbox 样例（集成排障 · 原型 mock；payload 已脱敏） */
  eventOutboxSample: [
    {
      eventId: "evt-20261021-a001", eventType: "md.org.changed", sourceApp: "主数据同步", systemCode: "MD",
      occurredAt: "2026-10-21 08:12:03", publishStatus: "已投递", subscriber: "招聘系统 Webhook",
      retryCount: 0, payloadSummary: "{ orgId: \"****12ab\", change: \"rename\", name: \"***\" }", deadLetter: false
    },
    {
      eventId: "evt-20261021-a002", eventType: "md.employee.transferred", sourceApp: "主数据同步", systemCode: "MD",
      occurredAt: "2026-10-21 08:15:44", publishStatus: "已投递", subscriber: "数据中台",
      retryCount: 0, payloadSummary: "{ empNo: \"****8891\", fromDept: \"***\", toDept: \"***\" }", deadLetter: false
    },
    {
      eventId: "evt-20261020-b014", eventType: "md.org.changed", sourceApp: "主数据同步", systemCode: "MD",
      occurredAt: "2026-10-20 17:02:11", publishStatus: "死信", subscriber: "招聘系统 Webhook",
      retryCount: 3, payloadSummary: "{ orgId: \"****9f02\", parentId: \"***\" }", deadLetter: true
    },
    {
      eventId: "evt-20261020-b015", eventType: "md.org.changed", sourceApp: "主数据同步", systemCode: "MD",
      occurredAt: "2026-10-20 17:02:12", publishStatus: "死信", subscriber: "招聘系统 Webhook",
      retryCount: 3, payloadSummary: "{ orgId: \"****9f03\", parentId: \"***\" }", deadLetter: true
    },
    {
      eventId: "evt-20261021-c008", eventType: "biz.todo.created", sourceApp: "待办中心", systemCode: "TODO",
      occurredAt: "2026-10-21 09:01:00", publishStatus: "投递中", subscriber: "消息中心",
      retryCount: 1, payloadSummary: "{ todoId: \"****7712\", title: \"***\", assignee: \"***\" }", deadLetter: false
    },
    {
      eventId: "evt-20261021-d003", eventType: "wf.instance.completed", sourceApp: "流程引擎", systemCode: "WF",
      occurredAt: "2026-10-21 09:18:22", publishStatus: "投递失败", subscriber: "CRM Webhook",
      retryCount: 2, payloadSummary: "{ instanceId: \"****wf01\", bizKey: \"CRM:leave:***\" }", deadLetter: false
    },
    {
      eventId: "evt-20261019-e001", eventType: "md.employee.deactivated", sourceApp: "主数据同步", systemCode: "MD",
      occurredAt: "2026-10-19 11:40:00", publishStatus: "已投递", subscriber: "CRM Webhook",
      retryCount: 0, payloadSummary: "{ dingtalk_userid: \"****uid9\", reason: \"leave\" }", deadLetter: false
    },
    {
      eventId: "evt-20261021-f002", eventType: "md.employee.created", sourceApp: "主数据同步", systemCode: "MD",
      occurredAt: "2026-10-21 07:55:10", publishStatus: "待投递", subscriber: "—",
      retryCount: 0, payloadSummary: "{ empNo: \"****2201\", deptId: \"***\" }", deadLetter: false
    }
  ],
  /* D2 · V1.5 管理台 mock（file_object 元数据 / 取 URL 审计 / 上传策略占位） */
  fileAdminSamples: [
    { fileId: "F-20261018-001", fileName: "报销附件-10月.pdf", bizApp: "费用报销", systemCode: "EXP", mimeType: "application/pdf", size: "1.2 MB", sha256: "a3f2…9c01", uploader: "张三", status: "可用", uploadedAt: "2026-10-18 10:22", downloadCount: 3, lastDownload: "2026-10-20 15:08" },
    { fileId: "F-20261012-014", fileName: "合同扫描件.zip", bizApp: "项目管理", systemCode: "PM", mimeType: "application/zip", size: "8.6 MB", sha256: "b881…2e4f", uploader: "李四", status: "可用", uploadedAt: "2026-10-12 14:05", downloadCount: 12, lastDownload: "2026-10-21 08:41" },
    { fileId: "F-20260930-003", fileName: "流程表单附件.png", bizApp: "流程引擎", systemCode: "WF", mimeType: "image/png", size: "420 KB", sha256: "c019…77aa", uploader: "王五", status: "可用", uploadedAt: "2026-09-30 09:18", downloadCount: 1, lastDownload: "2026-09-30 11:02" },
    { fileId: "F-20261005-008", fileName: "候选人简历.docx", bizApp: "招聘系统", systemCode: "HR", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: "256 KB", sha256: "d4aa…1102", uploader: "赵六", status: "可用", uploadedAt: "2026-10-05 16:40", downloadCount: 5, lastDownload: "2026-10-19 09:12" },
    { fileId: "F-20260820-002", fileName: "已删除-旧版报价.xlsx", bizApp: "CRM", systemCode: "CRM", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: "88 KB", sha256: "e55b…0033", uploader: "系统同步", status: "已删除", uploadedAt: "2026-08-20 11:00", downloadCount: 0, lastDownload: "—" }
  ],
  fileDownloadAuditSamples: [
    { time: "2026-10-21 08:41:02", fileId: "F-20261012-014", fileName: "合同扫描件.zip", action: "下载", operator: "李四", systemCode: "PM", clientIp: "10.12.3.88", traceId: "tr-8f3a21c9", result: "成功", urlTtlMin: 30 },
    { time: "2026-10-20 15:08:44", fileId: "F-20261018-001", fileName: "报销附件-10月.pdf", action: "下载", operator: "张三", systemCode: "EXP", clientIp: "10.12.1.22", traceId: "tr-7e102abc", result: "成功", urlTtlMin: 30 },
    { time: "2026-10-19 09:12:18", fileId: "F-20261005-008", fileName: "候选人简历.docx", action: "预览", operator: "HR-审阅员", systemCode: "HR", clientIp: "10.12.5.10", traceId: "tr-6d0091ef", result: "成功", urlTtlMin: 30 },
    { time: "2026-10-18 10:25:01", fileId: "F-20261018-001", fileName: "报销附件-10月.pdf", action: "取 URL", operator: "费用报销服务", systemCode: "EXP", clientIp: "172.16.0.5", traceId: "tr-5c88aa01", result: "成功", urlTtlMin: 30 },
    { time: "2026-10-17 14:02:33", fileId: "F-20260999-xxx", fileName: "（未知）", action: "下载", operator: "外部访客", systemCode: "CRM", clientIp: "203.0.113.9", traceId: "tr-4b771002", result: "拒绝", urlTtlMin: 0 }
  ],
  fileUploadPolicySample: {
    maxSizeGb: 2,
    urlTtlMinutes: 30,
    typeWhitelist: ["pdf", "doc", "docx", "xls", "xlsx", "png", "jpg", "jpeg", "zip"],
    watermarkOnDownload: true,
    watermarkOnPreview: true,
    virusScan: "V1.5 占位（V1.0 仅类型白名单 + 大小限制 + 文件名清洗）",
    aclMode: "V1.5 占位（D2-F05 文件级 ACL，默认继承上传者业务上下文）"
  },
  checklist: [
    { name: "注册应用（gov_app_register）", page: "console.html?page=app-register", done: true },
    { name: "配置权威源（组织人员）", page: "console.html?page=sync-source", done: true },
    { name: "核对首次同步结果", page: "console.html?page=sync-logs", done: true },
    { name: "配置角色与权限", page: "console.html?page=roles", done: true },
    { name: "配置首页布局模板", page: "console.html?page=layouts", done: false },
    { name: "配置消息模板并审核", page: "console.html?page=msg", done: false },
    { name: "配置网关路由（存量接入）", page: "console.html?page=gateway", done: false },
    { name: "冒烟验证（测试账号走员工旅程）", page: "home-v2.html", done: false }
  ],
  /* ============================================================
     本轮增量（T01 数据层）：
     - callbackWhitelist：回调域名白名单（I1-F06，服务 A4-F01 / C1-F06）
       ★ 与 A1-F08 嵌入 host 校验（I1 应用注册 / 原型常量，无 portal-apps 白名单 Tab）语义不同，勿混。
     - credentialSheet：接入凭证单（I1-F05）字段样例；★ 不含 secret 明文（占位「重置后获取」）
     - errCodes：常见错误码表（I1-F05 验收要点 ②）
     - guideIndex：接入指南文档索引 + 示例工程清单（J1-F04）
     - permMigration / permBatches：权限迁移批次与完成度指标（J2-F05，mapping_status 0~7）
     - permArbQueue：仲裁队列（三类入队：2 未归一 / 3 无对应 / 4 冲突）
     - permFailDetail：失败明细（字段级，可导 CSV）
     - importReport：初始数据导入校验报告（D12 步骤 3）
     ============================================================ */
  callbackWhitelist: [
    { id: "WL-001", domain: "https://crm.lubon.com", func: "A4-F01", prefix: "/v1/callback", time: "2026-08-20", use: "CRM 待办回调" },
    { id: "WL-002", domain: "https://oa.lubon.com", func: "A4-F01 / C1-F06", prefix: "/api/hook", time: "2026-08-20", use: "OA 待办 + 流程回调" },
    { id: "WL-003", domain: "https://wf.lubon.com", func: "C1-F06", prefix: "/flow/callback", time: "2026-09-02", use: "流程引擎回调" }
  ],
  /* 回调域名白名单的「引用计数」：域名 → 引用它的应用数（用于移除前校验，Q-5 强提示） */
  callbackWhitelistRefs: { "https://crm.lubon.com": 2, "https://oa.lubon.com": 3, "https://wf.lubon.com": 1 },

  /* ============================================================
     组织映射（B3-F03「系统人员组织映射」· 实施/连接器离线导入；V1.5 控制台无独立 page key）
     ------------------------------------------------------------
     · 落表 sys_org_mapping（bmp_sys）；UK = (system_code, source_org_code)
     · target_org_id = 中台 md_org.id，允许 NULL（未映射 → sync_status=0）
     · mapping_type：1 精确 / 2 前缀 / 3 默认归属
     · sync_status：0 待映射 / 1 已映射 / 2 冲突 / 3 失败
     · 边界：本点管「组织结构怎么对应」；B2-F03 数据权限管「能看哪些数据」（V1.5）——勿混。
     · 组织树级粒度（可跨级、可裁剪）：源侧 sub-org 可整体归并到上级中台组织（前缀/默认归属）。
     ============================================================ */
  orgMapping: [
    { id: "OM-001", system_code: "CRM", source_org_code: "D100", source_org_name: "销售部", target_org_id: 3, target_org_name: "销售部", mapping_type: 1, sync_status: 1, updated: "2026-10-16 09:12" },
    { id: "OM-002", system_code: "CRM", source_org_code: "D100-01", source_org_name: "销售部/华北大区", target_org_id: 8, target_org_name: "销售部/华北大区", mapping_type: 1, sync_status: 1, updated: "2026-10-16 09:12" },
    /* 前缀规则：源侧 D100-02 子树（华东大区各办事处）整体归并到「销售部/华东大区」 */
    { id: "OM-003", system_code: "CRM", source_org_code: "D100-02", source_org_name: "销售部/华东大区（整棵子树）", target_org_id: 9, target_org_name: "销售部/华东大区", mapping_type: 2, sync_status: 1, updated: "2026-10-16 09:14" },
    { id: "OM-004", system_code: "REC", source_org_code: "RD", source_org_name: "研发中心（招聘系统口径）", target_org_id: 10, target_org_name: "研发中心", mapping_type: 1, sync_status: 1, updated: "2026-10-15 18:02" },
    /* 待映射：源侧已撤销的临时组织 → target_org_id 允许 NULL，不静默丢弃 */
    { id: "OM-005", system_code: "REC", source_org_code: "TMP-9F", source_org_name: "临时项目组（源侧已撤销）", target_org_id: null, target_org_name: "", mapping_type: 1, sync_status: 0, updated: "2026-10-16 07:40" },
    /* 冲突：源侧编码命中多个前缀规则 / 同一中台组织被两条源侧编码指向 */
    { id: "OM-006", system_code: "OKR", source_org_code: "ORG-UNK", source_org_name: "未登记部门", target_org_id: 10, target_org_name: "研发中心", mapping_type: 3, sync_status: 2, updated: "2026-10-16 07:41" },
    { id: "OM-007", system_code: "CRM", source_org_code: "D100-02-BJ", source_org_name: "销售部/华东大区/北京办", target_org_id: 8, target_org_name: "销售部/华北大区", mapping_type: 2, sync_status: 2, updated: "2026-10-16 07:42" },
    /* 失败：目标中台组织已停用（市场部（停用））→ 写入被拒 */
    { id: "OM-008", system_code: "DATA", source_org_code: "MKT-ALL", source_org_name: "市场部（全量）", target_org_id: 13, target_org_name: "市场部（停用）", mapping_type: 3, sync_status: 3, updated: "2026-10-16 07:45" }
  ],
  /* 完成度指标（4 态）：四数之和 ≡ orgMapping.length（供断言校验，禁止出现第 5 态） */
  orgMappingMetric: { todos: 1, mapped: 4, conflict: 2, failed: 1 },
  credentialSheet: {
    tokenEndpoint: "POST /v1/oauth/token",
    authMode: "client_credentials / Basic",
    env: "prod（test 见接入指南）",
    secretPlaceholder: "重置后获取",
    secretMask: "••••••••••••••"
  },
  errCodes: [
    { code: "401 invalid_client", desc: "client_id / client_secret 不正确或已被重置" },
    { code: "403 insufficient_scope", desc: "令牌 scope 不足以调用目标接口" },
    { code: "400 invalid_grant", desc: "授权请求参数不合法（grant_type / 环境不匹配）" }
  ],
  guideIndex: [
    { id: "G-01", icon: "📖", title: "快速开始（≤2 人日接入）", desc: "SSO/OIDC 接入 · client_id/secret 获取与令牌换取 · /v1/todo/push · /v1/msg/send · @PermCheck/@AuditLog" },
    { id: "G-02", icon: "🧭", title: "七步 Checklist 操作指引", desc: "从注册应用到冒烟验证的完整落地路径" },
    { id: "G-03", icon: "🔑", title: "凭证申领与令牌换取说明", desc: "同《接入凭证单》：client_credentials + Basic 鉴权" },
    { id: "G-04", icon: "📋", title: "只读 API 清单", desc: "详细设计 §4 导出的只读接口一览" },
    { id: "G-05", icon: "📢", title: "变更公告 CHANGELOG", desc: "破坏性变更以 ▲ 标注，提前 30 天公告" }
  ],
  guideDemos: [
    { id: "DEMO-CRM", name: "CRM 合同审批 demo", desc: "含 README 与可运行示例（待办推送 + 审批回调）", repo: "https://git.lubon.internal/bmp/demo-crm" },
    { id: "DEMO-OFFER", name: "招聘 offer 审批 demo", desc: "含 README 与可运行示例（流程发起 + 结果回写）", repo: "https://git.lubon.internal/bmp/demo-offer" }
  ],
  /* 权限迁移批次（J2-F05）：mapping_status 0~7 → 0待映射/1已映射/2未归一/3无对应/4冲突/5已导入/6失败/7已驳回 */
  permBatches: [
    { batch: "2026-10-16-01", system: "CRM", type: "全量", result: "部分失败", total: 1240, normalized: 1180, mapped: 1102, imported: 980, arb: 56, failed: 4, cost: "3m12s" },
    { batch: "2026-10-15-01", system: "CRM", type: "全量", result: "成功", total: 1206, normalized: 1206, mapped: 1206, imported: 1198, arb: 0, failed: 0, cost: "2m48s" },
    { batch: "2026-10-16-02", system: "REC", type: "增量", result: "成功", total: 86, normalized: 86, mapped: 84, imported: 84, arb: 2, failed: 0, cost: "0m21s" }
  ],
  permMigration: {
    system: "CRM",
    batch: "2026-10-16-01",
/* 完成度指标（覆盖 mapping_status 8 态 · 对齐 PRD:15449 H1 等式）：
       expect=应采集（目标；完整率=imported/expect）；collected=源侧实际采集行数（H1 等式左值）；
       todos=待映射(0)；mapped=已映射(1)；imported=已导入(5)；
       arb=仲裁中(2/3/4)；failed=失败(6)；rejected=已驳回(7)；normalized=已归一（统计口径，非 8 态之一）
       H1：collected ≡ todos+mapped+arb+imported+failed+rejected（=1180，批次可核对） */
metric: { expect: 1240, collected: 1180, todos: 0, mapped: 122, imported: 980, arb: 56, failed: 4, rejected: 18, normalized: 1180, rate: 79 },
    /* 采集系统可选（PRD:5758 五套） */
    systems: ["CRM", "REC", "OKR", "KMS", "DATA"],
    /* 待归一阻断示例：账号映射未就绪 → 前置阻断（B3-F03） */
    mappingReady: true
  },
  /* 仲裁队列（mapping_status ∈ {2,3,4} 待仲裁）——★ 主队列计数排除 7（PRD:1138） */
  permArbQueue: [
    { id: "ARB-001", type: "未归一", typeCode: 2, local: "zhs01", perm: "—", suggest: "补账号映射", basis: "B3-F03 未命中（账号未归一）", status: "待裁决" },
    { id: "ARB-002", type: "未归一", typeCode: 2, local: "zhs02", perm: "—", suggest: "补账号映射", basis: "B3-F03 未命中（账号未归一）", status: "待裁决" },
    { id: "ARB-003", type: "无对应", typeCode: 3, local: "lisi", perm: "crm_exp_report", suggest: "定义权限点", basis: "B2-F02 无匹配 code（不静默丢弃）", status: "待裁决" },
    { id: "ARB-004", type: "无对应", typeCode: 3, local: "wangjl", perm: "crm_custom_view", suggest: "定义权限点", basis: "B2-F02 无匹配 code", status: "待裁决" },
    { id: "ARB-005", type: "冲突", typeCode: 4, local: "wangwu", perm: "order_manage", suggest: "人工确认", basis: "中台已有冲突授权（保留中台 / 以源为准）", status: "待裁决" },
    { id: "ARB-006", type: "冲突", typeCode: 4, local: "chenchen", perm: "sales_discount", suggest: "人工确认", basis: "中台已有冲突授权", status: "待裁决" }
  ],
  /* 已关闭子区（mapping_status = 7 已驳回 · 终态 · 可重跑）——★ 与 6 失败不同区（PRD:15324） */
  permArbClosed: [
    { id: "ARB-C01", typeCode: 7, local: "zhao", perm: "kms_edit", suggest: "（终态·可重跑）", reason: "KMS 权限点已废弃，驳回", by: "王管理员", time: "2026-10-16 03:10" },
    { id: "ARB-C02", typeCode: 7, local: "qian", perm: "okr_admin", suggest: "（终态·可重跑）", reason: "误配高权角色，驳回重配规则", by: "王管理员", time: "2026-10-16 03:12" }
  ],
  permFailDetail: [
    { row: 42, local: "zhaoliu", perm: "purchase_approve", field: "source_perm_code", reason: "源侧权限标识为空（无法采集）", batch: "2026-10-16-01" },
    { row: 187, local: "sunqi", perm: "contract_sign", field: "local_username", reason: "源账号含非常规字符（编码不匹配）", batch: "2026-10-16-01" },
    { row: 902, local: "zhouba", perm: "report_export", field: "granted_at", reason: "授权时间格式非法（yyyy-MM-dd 期望）", batch: "2026-10-16-01" },
    { row: 1130, local: "wujiu", perm: "data_import", field: "source_perm_code", reason: "只读探测超时（老系统不可达，已重试 3 次）", batch: "2026-10-16-01" }
  ],
  /* 初始数据导入校验报告（D12 步骤 3）：模板下载 + 批量导入 + 校验报告 */
  importReport: {
    success: 1180, warn: 12, fail: 4,
    rows: [
      { row: 42, field: "工号", src: "(空)", reason: "工号必填" },
      { row: 187, field: "部门", src: "研发中心/未知组", reason: "组织 path 未命中（警告，按上级归属）" },
      { row: 902, field: "入职日期", src: "2026/9/1", reason: "日期格式应为 yyyy-MM-dd" },
      { row: 1130, field: "工号", src: "EMP-2026-1130", reason: "工号重复（幂等 upsert 将合并）" }
    ]
  },

  /* ============================================================
     工作流引擎（C1/C2/C3）Mock —— 独立命名空间 MOCK.workflow
     字段与《PRD 增量-工作流引擎》3.9 数据模型（bmp_wf 库 / wf_ 前缀）对齐
     ============================================================ */
  workflow: {
    /* ---------- wf_process_def：流程定义与版本管理（含 contract_approval 的 v1/v2） ---------- */
    defs: [
      { uid: "d1", defKey: "contract_approval", name: "合同审批流", version: 1, defType: "TEMPLATE", status: "已发布", nodeCount: 4, updated: "2026-09-10 10:20", instances: 128 },
      { uid: "d2", defKey: "contract_approval", name: "合同审批流", version: 2, defType: "TEMPLATE", status: "已发布", nodeCount: 5, updated: "2026-09-20 14:30", instances: 36 },
      { uid: "d3", defKey: "purchase_approval", name: "采购审批流", version: 1, defType: "JSON", status: "草稿", nodeCount: 3, updated: "2026-09-22 09:00", instances: 0 },
      { uid: "d4", defKey: "leave_approval", name: "请假审批流", version: 2, defType: "TEMPLATE", status: "停用", nodeCount: 3, updated: "2026-08-30 16:40", instances: 412 },
      { uid: "d5", defKey: "recruit_offer", name: "招聘 Offer 审批流", version: 1, defType: "JSON", status: "已发布", nodeCount: 3, updated: "2026-09-18 11:05", instances: 24 },
      { uid: "d6", defKey: "perm_apply", name: "权限申请审批流", version: 1, defType: "TEMPLATE", status: "草稿", nodeCount: 2, updated: "2026-09-21 15:10", instances: 0 },
      /* 演示：第三方页面发起（不配 formSchema；中台仅存 URL + 实例/待办） */
      { uid: "d7", defKey: "travel_expense", name: "差旅报销审批流", version: 1, defType: "TEMPLATE", status: "已发布", nodeCount: 2, updated: "2026-10-21 10:00", instances: 18, launchMode: "external", fillUrl: "https://expense.example.com/fill?sso=1&bizKey={bizKey}", viewUrl: "https://expense.example.com/view?bizKey={bizKey}" }
    ],

    /* ---------- 某 defKey 的版本历史（UK(defKey, version)） ---------- */
    defVersions: {
      contract_approval: [
        { version: 2, defType: "TEMPLATE", status: "已发布", nodeCount: 5, publisher: "系统管理员", updated: "2026-09-20 14:30", instances: 36, note: "新增「法务审核」会签节点；旧版本 v1 保留，运行实例仍按发起版本执行" },
        { version: 1, defType: "TEMPLATE", status: "已发布", nodeCount: 4, publisher: "系统管理员", updated: "2026-09-10 10:20", instances: 128, note: "初始版本（销售总监 → 分管领导 → 总经理）" }
      ],
      leave_approval: [
        { version: 2, defType: "TEMPLATE", status: "停用", nodeCount: 3, publisher: "HR 管理员", updated: "2026-08-30 16:40", instances: 412, note: "已停用：不可发起新实例，运行中实例不受影响" },
        { version: 1, defType: "TEMPLATE", status: "停用", nodeCount: 2, publisher: "HR 管理员", updated: "2026-06-01 09:00", instances: 260, note: "初始版本" }
      ]
    },

    /* ---------- wf_approval_matrix：审批矩阵（审批人解析） ---------- */
    matrixRules: [
      { code: "MX-ORG-001", name: "部门负责人审批", dimension: "组织", match: "发起人所属部门（任意组织）", resolver: "取该部门负责人（org.leader）", priority: 10, status: "启用" },
      { code: "MX-POS-002", name: "分管领导审批", dimension: "岗位", match: "金额 > ¥100,000", resolver: "取发起人岗位的上级（分管领导）", priority: 20, status: "启用" },
      { code: "MX-AMT-003", name: "金额分级·总经理审批", dimension: "金额", match: "amount > 50000", resolver: "指定人：周总（总经理）", priority: 30, status: "启用" },
      { code: "MX-ORG-004", name: "华东大区负责人", dimension: "组织", match: "组织 = 销售部/华东大区", resolver: "指定人：王经理", priority: 5, status: "停用" },
      { code: "MX-AMT-005", name: "小额免审批", dimension: "金额", match: "amount <= 1000", resolver: "自动通过（发起人上级代审）", priority: 40, status: "启用" }
    ],

    /* ---------- wf_process_instance：流程实例（覆盖 5 种状态） ---------- */
    instances: [
      { instanceId: "WFI-20260922-0001", bizKey: "CRM:contract_approval:HT-2026-0918", sourceSystem: "CRM", bizType: "contract_approval", title: "【合同审批】华宇科技采购合同 ¥120,000", currentNode: "法务审核", status: "RUNNING", initiator: "王经理", startTime: "2026-09-22 10:15", duration: "6h 12m", formData: { "合同名称": "华宇科技采购合同", "客户名称": "华宇科技有限公司", "合同金额": "¥120,000.00", "合同类型": "采购合同 · 标准模板", "付款条件": "验收后 30 天电汇", "折扣": "12%（已获销售总监预批准）" } },
      { instanceId: "WFI-20260920-0027", bizKey: "BMP:perm_apply:PA-2026-0011", sourceSystem: "中台", bizType: "perm_apply", title: "【权限申请】portal:layout:list 布局查看权限", currentNode: "已完成", status: "APPROVED", initiator: "赵工", startTime: "2026-09-20 14:00", duration: "3h 28m", formData: { "申请权限": "portal:layout:list（布局查看）", "申请理由": "协助配置研发角色首页", "申请期限": "30 天", "数据范围": "本部门" } },
      { instanceId: "WFI-20260921-0033", bizKey: "CRM:discount_approval:DC-2026-0305", sourceSystem: "CRM", bizType: "discount_approval", title: "【折扣审批】恒信集团年度框架折扣 12%", currentNode: "销售总监审批", status: "REJECTED", initiator: "陈晨", startTime: "2026-09-21 17:30", duration: "2h 05m", formData: { "客户名称": "恒信集团", "折扣力度": "12%", "年度框架": "是", "预计年销售额": "¥3,200,000" } },
      { instanceId: "WFI-20260919-0041", bizKey: "BMP:leave_approval:LV-2026-0210", sourceSystem: "中台", bizType: "leave_approval", title: "【请假审批】李四 年假 2 天（09-25 ~ 09-26）", currentNode: "—", status: "WITHDRAWN", initiator: "李四", startTime: "2026-09-19 09:10", duration: "18m", formData: { "请假类型": "年假", "开始时间": "2026-09-25 09:00", "结束时间": "2026-09-26 18:00", "时长": "2 天", "事由": "个人休假" } },
      { instanceId: "WFI-20260922-0048", bizKey: "OA:purchase_approval:PO-2026-0788", sourceSystem: "OA", bizType: "purchase_approval", title: "【采购审批】研发中心服务器扩容 ¥86,000", currentNode: "—", status: "TERMINATED", initiator: "赵工", startTime: "2026-09-22 09:40", duration: "42m", formData: { "采购事项": "服务器扩容 6 台", "采购金额": "¥86,000.00", "使用部门": "研发中心", "供应商": "浪潮信息", "预算科目": "IT 基础设施" } },
      { instanceId: "WFI-20260922-0052", bizKey: "HR:recruit_offer:OF-2026-0133", sourceSystem: "招聘系统", bizType: "recruit_offer", title: "【Offer 审批】高级前端工程师 年薪 ¥38 万", currentNode: "HRBP 复核", status: "RUNNING", initiator: "钱经理", startTime: "2026-09-22 11:02", duration: "1h 20m", formData: { "候选人": "李某", "应聘岗位": "高级前端工程师", "拟定年薪": "¥380,000", "入职日期": "2026-10-08", "招聘渠道": "内推" } }
    ],

    /* ---------- wf_approval_record：审批留痕时间轴（按实例 id 索引，仅追加不可篡改） ---------- */
    instanceTimeline: {
      "WFI-20260922-0001": [
        { node: "发起", assignee: "王经理", action: "发起流程", comment: "提交合同审批，折扣 12% 已获销售总监预批准", time: "2026-09-22 10:15", proxy: false },
        { node: "销售总监审批", assignee: "刘总监", action: "同意", comment: "折扣在权限范围内，同意", time: "2026-09-22 11:40", proxy: false },
        { node: "法务审核", assignee: "周律师（法务）", action: "办理中", comment: "—", time: "—", proxy: true, proxyFrom: "王经理 → 陈晨（委托代理）" },
        { node: "总经理审批", assignee: "待解析", action: "待处理", comment: "—", time: "—", proxy: false }
      ],
      "WFI-20260921-0033": [
        { node: "发起", assignee: "陈晨", action: "发起流程", comment: "提交恒信集团年度框架折扣审批", time: "2026-09-21 17:30", proxy: false },
        { node: "销售总监审批", assignee: "刘总监", action: "驳回", comment: "折扣力度超出授权上限（≤10%），请重新测算后提交", time: "2026-09-21 19:35", proxy: false }
      ],
      "WFI-20260920-0027": [
        { node: "发起", assignee: "赵工", action: "发起流程", comment: "协助研发角色首页配置", time: "2026-09-20 14:00", proxy: false },
        { node: "部门负责人审批", assignee: "孙组长", action: "同意", comment: "同意，协助配置", time: "2026-09-20 15:10", proxy: false },
        { node: "系统管理员审批", assignee: "系统管理员", action: "同意", comment: "权限已开通（30 天有效期）", time: "2026-09-20 17:28", proxy: false }
      ],
      "WFI-20260922-0048": [
        { node: "发起", assignee: "赵工", action: "发起流程", comment: "研发中心服务器扩容", time: "2026-09-22 09:40", proxy: false },
        { node: "部门负责人审批", assignee: "孙组长", action: "同意", comment: "同意", time: "2026-09-22 09:58", proxy: false },
        { node: "—", assignee: "赵工", action: "终止", comment: "预算科目调整，本单作废（终止写留痕）", time: "2026-09-22 10:22", proxy: false }
      ]
    },

    /* ---------- wf_delegate：委托代理 ---------- */
    delegates: [
      { id: "DL-2026-001", principal: "王经理", delegate: "陈晨", startTime: "2026-09-20", endTime: "2026-09-27", reason: "出差（上海客户拜访）", status: "生效中" },
      { id: "DL-2026-002", principal: "刘总监", delegate: "张三", startTime: "2026-09-01", endTime: "2026-09-10", reason: "年假", status: "已失效" },
      { id: "DL-2026-003", principal: "钱经理", delegate: "李四", startTime: "2026-09-22", endTime: "2026-10-06", reason: "产假", status: "生效中" },
      { id: "DL-2026-004", principal: "孙组长", delegate: "赵工", startTime: "2026-08-15", endTime: "2026-08-22", reason: "项目驻场", status: "已失效" }
    ],

    /* ---------- C3-F01 统一审批中心：待办（站内可办 vs 跳转） / 已办 / 我发起 ---------- */
    approvalCenter: {
      todo: [
        { id: "AT-2001", mode: "站内", sourceSystem: "中台", bizType: "perm_apply", title: "【权限申请】md:employee:edit 人员编辑权限", urgency: 1, remainHours: 40, submitter: "张三 · 数字化中心", time: "2026-09-22 09:30", bizKey: "BMP:perm_apply:PA-2026-0012", formData: { "申请权限": "md:employee:edit（人员编辑）", "申请理由": "HR 异动维护需要", "申请期限": "长期", "数据范围": "本部门" } },
        { id: "AT-2002", mode: "站内", sourceSystem: "中台", bizType: "purchase_approval", title: "【采购审批】研发中心服务器扩容 ¥86,000", urgency: 2, remainHours: 6, submitter: "赵工 · 研发中心", time: "2026-09-22 09:40", bizKey: "OA:purchase_approval:PO-2026-0788", formData: { "采购事项": "服务器扩容 6 台", "采购金额": "¥86,000.00", "使用部门": "研发中心", "供应商": "浪潮信息", "预算科目": "IT 基础设施" } },
        { id: "AT-2003", mode: "站内", sourceSystem: "中台", bizType: "leave_approval", title: "【请假审批】李四 年假 2 天（09-25 ~ 09-26）", urgency: 0, remainHours: 20, submitter: "李四 · 人力资源部", time: "2026-09-22 08:55", bizKey: "BMP:leave_approval:LV-2026-0210", formData: { "请假类型": "年假", "开始时间": "2026-09-25 09:00", "结束时间": "2026-09-26 18:00", "时长": "2 天", "事由": "个人休假" } },
        { id: "AT-2004", mode: "跳转", sourceSystem: "CRM", bizType: "contract_approval", title: "【合同审批】华宇科技采购合同 ¥120,000", urgency: 2, remainHours: -2, submitter: "王经理 · 销售部/华北大区", time: "2026-09-22 10:15", bizKey: "CRM:contract_approval:HT-2026-0918", formData: { "合同金额": "¥120,000.00", "客户名称": "华宇科技有限公司", "付款条件": "验收后 30 天电汇" } },
        { id: "AT-2005", mode: "跳转", sourceSystem: "招聘系统", bizType: "resume_screen", title: "【简历初筛】前端工程师候选人 ×3", urgency: 1, remainHours: 9, submitter: "招聘专员", time: "2026-09-21 16:00", bizKey: "HR:resume_screen:RS-2026-0456", formData: { "岗位": "前端工程师", "候选人数": "3", "初筛结果": "待确认" } },
        { id: "AT-2006", mode: "跳转", sourceSystem: "OA", bizType: "expense_approval", title: "【报销审批】差旅费 ¥2,340", urgency: 0, remainHours: 30, submitter: "陈晨 · 销售部/华东大区", time: "2026-09-21 14:20", bizKey: "OA:expense_approval:BX-2026-0342", formData: { "报销金额": "¥2,340.00", "费用类型": "差旅费", "出差事由": "上海客户拜访" } },
        { id: "AT-2007", mode: "站内", sourceSystem: "中台", bizType: "travel_expense", title: "【差旅报销】深圳展会差旅 ¥4,680", urgency: 1, remainHours: 18, submitter: "陈晨 · 销售部/华东大区", time: "2026-10-20 16:05", bizKey: "BMP:travel_expense:TE-2026-0088", formData: { "说明": "表单在费用系统，中台仅关联实例" } }
      ],
      done: [
        { id: "AD-3001", mode: "站内", sourceSystem: "中台", bizType: "perm_apply", title: "【权限申请】portal:layout:list 布局查看权限", result: "已同意", time: "2026-09-20 17:28" },
        { id: "AD-3002", mode: "站内", sourceSystem: "中台", bizType: "recruit_offer", title: "【Offer 审批】中级后端工程师 年薪 ¥28 万", result: "已驳回", time: "2026-09-18 11:05" },
        { id: "AD-3003", mode: "跳转", sourceSystem: "CRM", bizType: "contract_approval", title: "【合同审批】蓝海科技服务协议 ¥58,000", result: "已同意（源系统）", time: "2026-09-19 11:05" },
        { id: "AD-3004", mode: "跳转", sourceSystem: "招聘系统", bizType: "interview_arrange", title: "【面试安排】产品经理候选人复试", result: "已确认（源系统）", time: "2026-09-18 16:40" }
      ],
      initiated: [
        { id: "AI-4001", mode: "站内", sourceSystem: "中台", bizType: "leave_approval", title: "【请假申请】年假 2 天（09-25 ~ 09-26）", progress: "处理中", node: "部门负责人审批（1/2）", time: "2026-09-19 09:10" },
        { id: "AI-4002", mode: "站内", sourceSystem: "中台", bizType: "perm_apply", title: "【权限申请】md:employee:edit 人员编辑权限", progress: "已完成", node: "—", time: "2026-09-22 09:30" },
        { id: "AI-4003", mode: "跳转", sourceSystem: "OA", bizType: "purchase_approval", title: "【采购申请】研发中心服务器扩容", progress: "已终止", node: "—", time: "2026-09-22 09:40" },
        { id: "AI-4004", mode: "站内", sourceSystem: "中台", bizType: "travel_expense", title: "【差旅报销】上海客户拜访 ¥2,340", progress: "处理中", node: "部门负责人审批（1/2）", time: "2026-10-20 15:20", defKey: "travel_expense" }
      ]
    },

    /* ---------- 发布前校验规则（3.8.2 · 8 条）模拟结果：全通过 ---------- */
    validateRules: [
      { seq: 1, name: "存在开始节点与结束节点", pass: true, detail: "开始节点（start）与结束节点（end）均存在" },
      { seq: 2, name: "所有审批节点的审批人可解析", pass: true, detail: "3 个审批节点均可命中审批矩阵或已配置兜底审批人" },
      { seq: 3, name: "条件分支必须有默认分支（default=true）", pass: true, detail: "网关 G1「金额分级」已配置默认分支 → 总经理审批" },
      { seq: 4, name: "节点 key 唯一，无孤立（不可达）节点", pass: true, detail: "5 个节点 key 唯一，全部可达" },
      { seq: 5, name: "条件表达式符合受限白名单语法，变量已声明", pass: true, detail: "amount > 50000 合法；变量 amount 来自表单字段 formSchema.fields[].key（声明源由发起表单字段派生，替代裸 variables）" },
      { seq: 6, name: "会签 / 或签节点至少配置 1 个审批人", pass: true, detail: "会签节点「法务审核」已配置 2 名审批人" },
      { seq: 7, name: "版本唯一性约束 UK(defKey, version) 成立", pass: true, detail: "contract_approval v3 无冲突，可发布" },
      { seq: 8, name: "流程至少包含 1 个审批节点", pass: true, detail: "流程含 3 个审批节点，满足至少 1 个审批节点要求" }
    ],
    /* ---------- 发布前校验规则：部分失败（演示失败态 · 6 通过 2 失败，与 UIUX v1.3 步骤 4 线框一致：仅规则 3 与规则 8 失败） ---------- */
    validateRulesFailed: [
      { seq: 1, name: "存在开始节点与结束节点", pass: true, detail: "开始节点（start）与结束节点（end）均存在" },
      { seq: 2, name: "所有审批节点的审批人可解析", pass: true, detail: "全部审批节点均可命中审批矩阵或已配置兜底审批人" },
      { seq: 3, name: "条件分支必须有默认分支（default=true）", pass: false, detail: "网关「金额分级」缺少默认分支，存在条件无命中风险（定位 node: g1）" },
      { seq: 4, name: "节点 key 唯一，无孤立（不可达）节点", pass: true, detail: "节点 key 唯一，全部可达" },
      { seq: 5, name: "条件表达式符合受限白名单语法，变量已声明", pass: true, detail: "条件表达式合法；变量均来自表单字段 formSchema.fields[].key（声明源由发起表单字段派生）" },
      { seq: 6, name: "会签 / 或签节点至少配置 1 个审批人", pass: true, detail: "会签节点已配置审批人" },
      { seq: 7, name: "版本唯一性约束 UK(defKey, version) 成立", pass: true, detail: "contract_approval v3 无冲突" },
      { seq: 8, name: "流程至少包含 1 个审批节点", pass: false, detail: "流程未配置任何审批节点（APPROVAL 数量为 0），至少需添加 1 个审批节点（定位：节点配置区）" }
    ],

    /* ---------- 审批人解析预览（步骤 4 · 模拟发起人试算） ---------- */
    parsePreview: {
      initiator: "王经理（销售部/华北大区 · 销售经理）",
      results: [
        { node: "部门负责人审批", resolved: "刘总监（销售部负责人 / org.leader）", ok: true, by: "MX-ORG-001 组织矩阵" },
        { node: "分管领导审批", resolved: "周总（销售经理上级 / 分管领导）", ok: true, by: "MX-POS-002 岗位矩阵" },
        { node: "法务审核", resolved: "解析失败 → 兜底审批人：流程管理员（李管理员）", ok: false, by: "兜底规则 C1-F02-3" }
      ]
    },

    /* ---------- 预置审批模板（模板化配置演示） ----------
       TPL_BLANK「空白模板」：全新配置，从零开始；nodes 为空数组，不预置任何节点。
       同属「模板化配置」档（非 JSON 定义档），选中后仍走步骤 2/3 的列表或画布配置。 */
    approvalTemplates: [
      { code: "TPL_BLANK", name: "空白模板", desc: "从零开始，全新配置；节点由用户自行添加", nodes: [] },
      { code: "TPL_AMOUNT_2", name: "金额分级审批 2 级", desc: "≤5 万：部门负责人；>5 万：部门负责人 + 分管领导", nodes: [
        { name: "部门负责人审批", assigneeType: "组织", signMode: "单人" },
        { name: "分管领导审批", assigneeType: "岗位", signMode: "单人" } ] },
      { code: "TPL_LEADER", name: "部门负责人 + 分管领导", desc: "固定两级直线审批，适合常规业务单据", nodes: [
        { name: "部门负责人审批", assigneeType: "组织", signMode: "单人" },
        { name: "分管领导审批", assigneeType: "岗位", signMode: "单人" } ] },
      { code: "TPL_SINGLE", name: "单人审批", desc: "仅部门负责人单节点审批，适合小额 / 低风险单据", nodes: [
        { name: "部门负责人审批", assigneeType: "组织", signMode: "单人" } ] },
      { code: "TPL_COUNTERSIGN", name: "会签审批（法务 + 财务）", desc: "同一节点多人会签，全部同意才通过", nodes: [
        { name: "法务 + 财务会签", assigneeType: "岗位", signMode: "会签ALL" } ] }
    ],

    /* ============================================================
       发起表单定义 formSchema（按 bizType 索引；缺失即降级为自由表单透传）
       - 结构：{ schemaVersion, title, fields:[{key,label,type,required,placeholder,help,defaultValue,sort,maxLength,options}] }
       - 字段类型 9 种：text / textarea / number / amount / date / datetime / select / multiselect / attachment
       - fields[].key 直接作为条件分支变量（步骤 3 变量来源 = 表单字段）
       ============================================================ */
    formSchemas: {
      contract_approval: {
        schemaVersion: 1,
        title: "合同审批单",
        fields: [
          { key: "contractName", label: "合同名称", type: "text", required: true, placeholder: "请输入合同名称", help: "", defaultValue: "", sort: 1, maxLength: 64, options: [] },
          { key: "customerName", label: "客户名称", type: "text", required: true, placeholder: "请输入客户名称", help: "", defaultValue: "", sort: 2, maxLength: 64, options: [] },
          { key: "amount", label: "合同金额", type: "amount", required: true, placeholder: "请输入合同金额（元）", help: "含税金额，单位：元", defaultValue: null, sort: 3, maxLength: null, options: [] },
          { key: "contractType", label: "合同类型", type: "select", required: true, placeholder: "请选择合同类型", help: "", defaultValue: "", sort: 4, maxLength: null, options: [
            { label: "采购合同", value: "purchase" }, { label: "服务合同", value: "service" }, { label: "框架协议", value: "framework" } ] },
          { key: "signDate", label: "签订日期", type: "date", required: false, placeholder: "", help: "", defaultValue: "", sort: 5, maxLength: null, options: [] },
          { key: "payTerms", label: "付款条件", type: "textarea", required: false, placeholder: "如：验收后 30 天电汇", help: "", defaultValue: "", sort: 6, maxLength: 500, options: [] },
          { key: "risks", label: "风险标签", type: "multiselect", required: false, placeholder: "", help: "", defaultValue: [], sort: 7, maxLength: null, options: [
            { label: "涉及知识产权", value: "ip" }, { label: "跨境条款", value: "crossBorder" }, { label: "付款周期长", value: "longPay" } ] },
          { key: "attachment", label: "合同扫描件", type: "attachment", required: false, placeholder: "", help: "附件存文件服务，仅记录 fileId", defaultValue: [], sort: 8, maxLength: null, options: [] }
        ]
      },
      purchase_approval: {
        schemaVersion: 1,
        title: "采购申请单",
        fields: [
          { key: "item", label: "采购事项", type: "text", required: true, placeholder: "请输入采购事项", help: "", defaultValue: "", sort: 1, maxLength: 128, options: [] },
          { key: "amount", label: "采购金额", type: "amount", required: true, placeholder: "请输入采购金额（元）", help: "", defaultValue: null, sort: 2, maxLength: null, options: [] },
          { key: "dept", label: "使用部门", type: "select", required: true, placeholder: "请选择使用部门", help: "", defaultValue: "", sort: 3, maxLength: null, options: [
            { label: "销售部", value: "SALES" }, { label: "研发中心", value: "RD" }, { label: "人力资源部", value: "HR" } ] },
          { key: "supplier", label: "供应商", type: "text", required: false, placeholder: "", help: "", defaultValue: "", sort: 4, maxLength: 64, options: [] },
          { key: "budget", label: "预算科目", type: "text", required: false, placeholder: "", help: "", defaultValue: "", sort: 5, maxLength: 64, options: [] },
          { key: "attachment", label: "询价单 / 报价单", type: "attachment", required: false, placeholder: "", help: "", defaultValue: [], sort: 6, maxLength: null, options: [] }
        ]
      },
      perm_apply: {
        schemaVersion: 1,
        title: "权限申请单",
        fields: [
          { key: "permCode", label: "申请权限", type: "text", required: true, placeholder: "如：md:employee:edit", help: "", defaultValue: "", sort: 1, maxLength: 128, options: [] },
          { key: "reason", label: "申请理由", type: "textarea", required: true, placeholder: "请说明申请理由", help: "", defaultValue: "", sort: 2, maxLength: 500, options: [] },
          { key: "period", label: "申请期限", type: "select", required: false, placeholder: "", help: "", defaultValue: "", sort: 3, maxLength: null, options: [
            { label: "30 天", value: "30d" }, { label: "长期", value: "forever" } ] },
          { key: "dataScope", label: "数据范围", type: "select", required: false, placeholder: "", help: "", defaultValue: "", sort: 4, maxLength: null, options: [
            { label: "本部门", value: "dept" }, { label: "全公司", value: "all" } ] }
        ]
      },
      leave_approval: {
        schemaVersion: 1,
        title: "请假申请单",
        fields: [
          { key: "leaveType", label: "请假类型", type: "select", required: true, placeholder: "请选择请假类型", help: "", defaultValue: "", sort: 1, maxLength: null, options: [
            { label: "年假", value: "annual" }, { label: "事假", value: "personal" }, { label: "病假", value: "sick" } ] },
          { key: "startTime", label: "开始时间", type: "datetime", required: true, placeholder: "", help: "", defaultValue: "", sort: 2, maxLength: null, options: [] },
          { key: "endTime", label: "结束时间", type: "datetime", required: true, placeholder: "", help: "", defaultValue: "", sort: 3, maxLength: null, options: [] },
          { key: "duration", label: "时长", type: "text", required: false, placeholder: "", help: "", defaultValue: "", sort: 4, maxLength: 32, options: [] },
          { key: "reason", label: "事由", type: "textarea", required: false, placeholder: "", help: "", defaultValue: "", sort: 5, maxLength: 500, options: [] }
        ]
      }
    },

    /* 演示：按 formSchema 填写的实例值（内部发起演示用 key 对齐 formSchema.fields[].key） */
    formDataSamples: {
      contract_approval: { contractName: "华宇科技采购合同", customerName: "华宇科技有限公司", amount: 120000, contractType: "purchase", signDate: "2026-09-18", payTerms: "验收后 30 天电汇", risks: ["crossBorder"], attachment: ["file_ht20260918_v1.pdf"] }
    }
  }
};

/* ============================================================
   发起表单 formSchema 共享工具（console.html / approval.html / mobile 均加载本文件）
   —— 9 种字段类型、值格式化、只读/填写渲染器；无 schema 时降级为 key-value
   ============================================================ */
function wfFieldTypes() {
  return [
    { value: "text", label: "单行文本" },
    { value: "textarea", label: "多行文本" },
    { value: "number", label: "数字" },
    { value: "amount", label: "金额" },
    { value: "date", label: "日期" },
    { value: "datetime", label: "日期时间" },
    { value: "select", label: "下拉单选" },
    { value: "multiselect", label: "多选" },
    { value: "attachment", label: "附件" }
  ];
}
function wfFieldTypeLabel(t) {
  const map = { text: "单行文本", textarea: "多行文本", number: "数字", amount: "金额", date: "日期", datetime: "日期时间", select: "下拉单选", multiselect: "多选", attachment: "附件" };
  return map[t] || t;
}
/* 值格式化：金额千分位、选项映射 label、附件 chip、多选逗号分隔 */
function wfFormatFieldValue(field, value) {
  if (!field) return value == null ? "—" : String(value);
  const empty = value == null || value === "" || (Array.isArray(value) && value.length === 0);
  if (empty) return "—";
  switch (field.type) {
    case "amount": {
      const n = Number(value);
      return isNaN(n) ? wfEsc(String(value)) : "¥" + n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    case "select": {
      const o = (field.options || []).find(x => String(x.value) === String(value));
      return wfEsc(o ? o.label : String(value));
    }
    case "multiselect": {
      const arr = Array.isArray(value) ? value : [value];
      return arr.map(v => { const o = (field.options || []).find(x => String(x.value) === String(v)); return `<span class="tag tag-info">${wfEsc(o ? o.label : String(v))}</span>`; }).join(" ");
    }
    case "attachment": {
      const arr = Array.isArray(value) ? value : [value];
      return arr.map(f => `<span class="wf-form-attach">📎 ${wfEsc(String(f))}</span>`).join(" ");
    }
    default:
      return wfEsc(String(value));
  }
}
function wfEsc(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
/* 规范化 schema：校验/渲染统一入口，非法返回 null */
function wfNormalizeSchema(schema) {
  if (!schema || typeof schema !== "object" || !Array.isArray(schema.fields)) return null;
  return schema;
}
/* 按 key 取实例值（兼容中文 label 键的既有 formData） */
function wfFieldValue(field, data) {
  if (!data) return undefined;
  if (Object.prototype.hasOwnProperty.call(data, field.key)) return data[field.key];
  if (field.label && Object.prototype.hasOwnProperty.call(data, field.label)) return data[field.label];
  return undefined;
}
/* 只读渲染器：按 formSchema 结构化渲染（label + type + value）；无 schema 降级为 key-value 平铺 */
function wfRenderFormReadonly(schema, data, mode) {
  mode = mode || "readonly";
  const s = wfNormalizeSchema(schema);
  if (!s) {  // 降级：自由表单模式（外部集成流程 / 存量定义）
    const d = data || {};
    const keys = Object.keys(d);
    if (!keys.length) return `<div class="state-box"><div class="illus">🗒</div><div class="txt">无表单数据</div></div>`;
    return `<dl class="desc-grid">${keys.map(k => `<dt>${wfEsc(k)}</dt><dd>${wfEsc(d[k])}</dd>`).join("")}</dl>`;
  }
  const fields = s.fields.slice().sort((a, b) => (a.sort || 0) - (b.sort || 0));
  if (!fields.length) return `<div class="state-box"><div class="illus">🗒</div><div class="txt">该表单暂未配置字段</div></div>`;
  if (mode === "edit") return wfRenderFormFill(s, data || {});
  // 结构化渲染 + 未在 schema 中声明的余量字段兜底展示（避免数据丢失）
  const covered = {};
  fields.forEach(f => { covered[f.key] = 1; if (f.label) covered[f.label] = 1; });
  const leftovers = Object.keys(data || {}).filter(k => !covered[k]);
  const extra = leftovers.length
    ? `<dt style="color:var(--bmp-text-placeholder)">其他字段</dt><dd>${leftovers.map(k => `<span class="tag tag-info">${wfEsc(k)}：${wfEsc(data[k])}</span>`).join(" ")}</dd>`
    : "";
  return `<div class="wf-form-readonly"><dl class="desc-grid">${fields.map(f => `
      <dt>${f.required ? '<span class="req">*</span>' : ""}${wfEsc(f.label)}</dt>
      <dd>${wfFormatFieldValue(f, wfFieldValue(f, data))}</dd>`).join("")}${extra}</dl></div>`;
}
/* 按 bizType / bizKey 反查发起表单定义（无匹配返回 null → 降级为 key-value） */
function wfSchemaByBizType(bizType) {
  const reg = (window.MOCK && MOCK.workflow && MOCK.workflow.formSchemas) || {};
  return reg[bizType] || null;
}
function wfSchemaByBizKey(bizKey) {
  if (!bizKey) return null;
  const parts = String(bizKey).split(":");
  const bizType = parts.length >= 2 ? parts[1] : parts[0];
  return wfSchemaByBizType(bizType);
}
/* 便捷：给定 bizType + formData，输出结构化只读表单 HTML（无 schema 自动降级） */
function wfRenderFormByBiz(bizType, formData, mode) {
  return wfRenderFormReadonly(wfSchemaByBizType(bizType), formData, mode);
}
/* 填写渲染器：按 type 渲染原生控件（内部发起演示用） */
function wfRenderFormFill(schema, values) {
  const s = wfNormalizeSchema(schema);
  if (!s) return `<div class="state-box"><div class="illus">🗒</div><div class="txt">无表单定义</div></div>`;
  values = values || {};
  const fields = s.fields.slice().sort((a, b) => (a.sort || 0) - (b.sort || 0));
  const ctrl = f => {
    const v = wfFieldValue(f, values);
    const val = v == null ? "" : v;
    const ph = wfEsc(f.placeholder || "");
    switch (f.type) {
      case "textarea": return `<textarea class="input" data-fk="${wfEsc(f.key)}" rows="3" placeholder="${ph}">${wfEsc(val)}</textarea>`;
      case "number":
      case "amount": return `<input class="input" type="number" data-fk="${wfEsc(f.key)}" value="${val === "" ? "" : wfEsc(val)}" placeholder="${ph}">`;
      case "date": return `<input class="input" type="date" data-fk="${wfEsc(f.key)}" value="${wfEsc(val)}" placeholder="${ph}">`;
      case "datetime": return `<input class="input" type="datetime-local" data-fk="${wfEsc(f.key)}" value="${wfEsc(val)}" placeholder="${ph}">`;
      case "select":
        return `<select class="select" data-fk="${wfEsc(f.key)}"><option value="">${ph || "请选择"}</option>${(f.options || []).map(o => `<option value="${wfEsc(o.value)}" ${String(o.value) === String(val) ? "selected" : ""}>${wfEsc(o.label)}</option>`).join("")}</select>`;
      case "multiselect": {
        const arr = Array.isArray(val) ? val.map(String) : (val ? [String(val)] : []);
        return `<div class="wf-form-checks" data-fk="${wfEsc(f.key)}">${(f.options || []).map(o => `<label><input type="checkbox" value="${wfEsc(o.value)}" ${arr.indexOf(String(o.value)) >= 0 ? "checked" : ""}> ${wfEsc(o.label)}</label>`).join("")}</div>`;
      }
      case "attachment":
        return `<input class="input" data-fk="${wfEsc(f.key)}" value="${wfEsc(Array.isArray(val) ? val.join(",") : val)}" placeholder="附件文件名（原型演示，逗号分隔）">`;
      default:
        return `<input class="input" data-fk="${wfEsc(f.key)}" value="${wfEsc(val)}" placeholder="${ph}">`;
    }
  };
  return `<div class="wf-form-fill">${fields.map(f => `
    <div class="field" data-field="${wfEsc(f.key)}">
      <label>${f.required ? '<span class="req">*</span>' : ""}${wfEsc(f.label)}</label>
      ${ctrl(f)}
      ${f.help ? `<div class="tip">${wfEsc(f.help)}</div>` : ""}
      <div class="err-msg">${wfEsc(f.label)}为必填项</div>
    </div>`).join("")}</div>`;
}
/* 前端校验（与后端 7008 同规则）：返回 [{key,label,rule,message}] */
function wfValidateForm(schema, values) {
  const s = wfNormalizeSchema(schema);
  if (!s) return [];
  values = values || {};
  const errors = [];
  s.fields.forEach(f => {
    const v = wfFieldValue(f, values);
    const empty = v == null || v === "" || (Array.isArray(v) && v.length === 0);
    if (f.required && empty) errors.push({ key: f.key, label: f.label, rule: "REQUIRED", message: `${f.label}为必填项` });
    if (!empty && (f.type === "select" || f.type === "multiselect")) {
      const arr = Array.isArray(v) ? v : [v];
      const ok = arr.every(x => (f.options || []).some(o => String(o.value) === String(x)));
      if (!ok) errors.push({ key: f.key, label: f.label, rule: "INVALID_OPTION", message: `${f.label}取值不在允许范围内` });
    }
  });
  return errors;
}

/* ============ 公共交互工具 ============ */
function msg(type, text) {
  let root = document.getElementById("msg-root");
  if (!root) { root = document.createElement("div"); root.id = "msg-root"; document.body.appendChild(root); }
  const icons = { success: "✔", error: "✖", info: "ℹ", warning: "⚠" };
  const el = document.createElement("div");
  el.className = "msg-toast " + type;
  el.innerHTML = '<span class="ic">' + (icons[type] || "ℹ") + "</span><span>" + text + "</span>";
  root.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .3s"; setTimeout(() => el.remove(), 300); }, type === "error" ? 3000 : 2000);
}

function openModal(id) { const m = document.getElementById(id); if (m) m.classList.add("show"); }
function closeModal(id) { const m = document.getElementById(id); if (m) m.classList.remove("show"); }
function openDrawer(id) {
  const mask = document.getElementById(id + "-mask"), d = document.getElementById(id);
  if (mask) mask.classList.add("show");
  if (d) { d.classList.add("show"); }
}
function closeDrawer(id) {
  const mask = document.getElementById(id + "-mask"), d = document.getElementById(id);
  if (mask) mask.classList.remove("show");
  if (d) d.classList.remove("show");
}
/* ============================================================
   Esc 关闭：已并入统一交互基建（window.CM）的 Esc「栈」管理
   ------------------------------------------------------------
   若 CM 已挂载且栈非空（存在 CM 打开的弹窗/抽屉/向导），则交由其按栈
   关闭最上层（避免 Dialog+Drawer 并发时全部关闭，架构风险 R2）；
   否则（门户页 / 无 CM 场景）沿用原有「关闭全部」语义，保持向后兼容。
   ============================================================ */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (window.CM && window.CM.A11y && window.CM.A11y.escStack && window.CM.A11y.escStack.length) return;
    document.querySelectorAll(".drawer.show").forEach(d => closeDrawer(d.id));
    document.querySelectorAll(".modal-mask.show").forEach(m => m.classList.remove("show"));
  }
});

/* 相对时间（列表相对 + title 绝对，UIUX 4.4；I-05）
   原型基准「现在」固定为 2026-09-22 11:00，保证走查结果确定性。 */
const REL_NOW = new Date(2026, 8, 22, 11, 0, 0);
function parseAbsTime(abs) {
  if (!abs) return null;
  const m = String(abs).match(/(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return new Date(2026, Number(m[1]) - 1, Number(m[2]), Number(m[3]), Number(m[4]));
}
function relTime(abs) {
  const t = parseAbsTime(abs);
  if (!t) return abs;
  const diff = Math.floor((REL_NOW - t) / 1000); /* 秒 */
  if (diff < 0 || diff < 60) return "刚刚";
  if (diff < 3600) return Math.floor(diff / 60) + " 分钟前";
  if (diff < 86400) return Math.floor(diff / 3600) + " 小时前";
  if (diff < 86400 * 7) return Math.floor(diff / 86400) + " 天前";
  return abs; /* 超过 7 天回落为绝对时间 */
}
/* 渲染相对时间 + hover 显示绝对时间（title 属性，I-05） */
function relTimeHtml(abs) {
  return `<span title="${abs}">${relTime(abs)}</span>`;
}

/* 按 bizKey 反查流程实例的审批时间轴（wf_approval_record）；无匹配返回 null */
function wfTimelineByBizKey(bizKey) {
  if (!bizKey || !window.MOCK.workflow) return null;
  const it = MOCK.workflow.instances.find(x => x.bizKey === bizKey);
  if (it && MOCK.workflow.instanceTimeline[it.instanceId]) return MOCK.workflow.instanceTimeline[it.instanceId];
  return MOCK.workflow.instanceTimeline[bizKey] || null;
}

/* 紧急度渲染
   语义色（UIUX §2.1 第 3 条）：紧急/超时 → 品牌红（.dot-urgent 已在 common.css 指向 --accent）；
   错误/失败 → danger 亮红。此映射仅决定 class 名，色值由 common.css 统一控制。 */
const URGENCY = { 0: { cls: "dot-normal", label: "普通" }, 1: { cls: "dot-important", label: "重要" }, 2: { cls: "dot-urgent", label: "紧急" } };

/* ============================================================
   门户页「五态」公共渲染器（UIUX §4.2 + 走查演示）
   用途：门户各页（待办/消息/公告/应用）统一支持 加载 / 空 / 错误 / 无权限 演示，
        避免每页各写一套。用法：
          <div id="xxxState"></div>  ← 页内为状态预留容器（通常包住列表容器）
          renderStateBox(el, "loading"|"empty"|"error"|"noperm", { name, action });
   另提供 stateSwitcher(hostId, onPick, cur) 生成演示切换条。
   ============================================================ */
function renderStateBox(el, st, opt) {
  opt = opt || {};
  const name = opt.name || "数据";
  const wrap = inner => `<div class="card" style="min-height:260px;display:flex;align-items:center;justify-content:center">${inner}</div>`;
  if (st === "loading") {
    el.innerHTML = wrap(`<div style="width:100%;max-width:560px">
      <div class="skeleton sk-line w80" style="height:18px"></div>
      <div class="skeleton sk-line w60"></div>
      <div class="skeleton sk-block" style="margin-top:14px"></div>
      <div class="skeleton sk-line w40" style="margin-top:14px"></div>
      <div class="fs-12 text-secondary mt-3" style="text-align:center">正在加载${name}…</div>
    </div>`);
  } else if (st === "empty") {
    /* 【强制】空态必带下一步动作（I-05）：opt.action 渲染为 <a>/<button>；未传时给默认引导动作兜底 */
    const actText = opt.action || "查看全部";
    const actHref = opt.actionHref || "javascript:msg('info','已跳转（原型演示）')";
    el.innerHTML = wrap(`<div class="state-box">
      <div class="illus">${opt.illus || "📭"}</div>
      <div class="txt">${opt.emptyText || ("暂无可展示的" + name)}</div>
      <div class="code">${opt.emptyHint || "可调整筛选条件后再试"}</div>
      <a class="btn btn-sm btn-primary" href="${actHref}">${actText}</a>
    </div>`);
  } else if (st === "error") {
    el.innerHTML = wrap(`<div class="state-box">
      <div class="illus">⚠️</div>
      <div class="txt">${name}加载失败</div>
      <div class="code">错误码 5500 · 服务暂时不可用（报障请提供该错误码）</div>
      <button class="btn btn-sm" onclick="msg('info','已重试（原型演示）')">重试</button>
    </div>`);
  } else {
    el.innerHTML = wrap(`<div class="state-box">
      <div class="illus">🔒</div>
      <div class="txt">无访问权限</div>
      <div class="code">你当前的角色无权查看${name}</div>
      <a class="btn btn-sm" href="javascript:msg('info','跳转权限申请登记（原型演示）')">去申请权限</a>
    </div>`);
  }
}
/* 演示切换条（走查用，不影响正常浏览） */
function stateSwitcher(hostId, onPick) {
  const host = document.getElementById(hostId);
  if (!host || host.querySelector(".state-switcher")) return;
  const bar = document.createElement("div");
  bar.className = "state-switcher";
  bar.style.cssText = "display:flex;align-items:center;gap:6px;margin-bottom:12px;padding:8px 12px;background:var(--bmp-color-info-light);border:var(--line);border-radius:var(--bmp-radius-sm)";
  const cur = window._pageState || "normal";
  const opts = [["normal", "默认态"], ["loading", "加载"], ["empty", "空态"], ["error", "错误"], ["noperm", "无权限"]];
  bar.innerHTML = `<span style="font-size:12px;color:var(--bmp-text-secondary);margin-right:4px">🧪 五态演示</span>` +
    opts.map(([k, t]) => `<button style="height:26px;padding:0 10px;font-size:12px;cursor:pointer;border:var(--line);border-radius:var(--bmp-radius-sm);background:${cur === k ? "var(--accent)" : "var(--bmp-card,#fff)"};color:${cur === k ? "#fff" : "var(--bmp-text-body)"};font-weight:${cur === k ? 600 : 400}" onclick="__pickState('${k}')">${t}</button>`).join("");
  window.__pickState = function (k) { window._pageState = k; onPick(k); };
  host.insertBefore(bar, host.firstChild);
}
/* 查当前演示态（页面渲染时先判断） */
function pageState() { return window._pageState || "normal"; }

/* 模拟登录态跳转 */
function requireLogin() { /* 原型不强制，仅演示 redirect 参数 */ }
function logout() {
  if (confirm("确认退出登录？将同时退出所有已接入系统（全局登出）。")) location.href = "login.html";
}

/** 读取门户意图项（方案 A：模拟 GET /v1/portal/intents） */
MOCK.getPortalIntents = function () {
  try {
    const s = localStorage.getItem("bmp_portal_intents");
    if (s) return JSON.parse(s);
  } catch (e) { /* 降级默认集 */ }
  return JSON.parse(JSON.stringify(MOCK.portalIntentsDefault));
};
/** 管理端保存意图项（A1-F02-7） */
MOCK.savePortalIntents = function (list) {
  localStorage.setItem("bmp_portal_intents", JSON.stringify(list));
  try { window.dispatchEvent(new CustomEvent("bmp:intents-updated")); } catch (e) {}
};

/** 读取门户 AI 助手配置（原型演示 · 模拟 GET /v1/portal/assistant/config） */
MOCK.getPortalAiConfig = function () {
  const base = JSON.parse(JSON.stringify(MOCK.portalAiAssistantDefault));
  try {
    const raw = localStorage.getItem("bmp_portal_ai_config");
    if (raw) Object.assign(base, JSON.parse(raw));
  } catch (e) { /* 降级默认 */ }
  return base;
};
/** 管理端保存 AI 助手配置（演示项，非 V1.5 产品必交付） */
MOCK.savePortalAiConfig = function (cfg) {
  const merged = Object.assign({}, MOCK.getPortalAiConfig(), cfg || {});
  localStorage.setItem("bmp_portal_ai_config", JSON.stringify(merged));
  try { window.dispatchEvent(new CustomEvent("bmp:portal-ai-config-updated")); } catch (e) {}
  return merged;
};
/** 多轮对话 mock 回复（无真实 API / 不经 E1） */
MOCK.portalAiMockReply = function (userText, cfg) {
  const c = cfg || MOCK.getPortalAiConfig();
  if (c.aiAvailable === false) {
    return c.unavailableMessage || MOCK.portalAiAssistantDefault.unavailableMessage;
  }
  const t = String(userText || "").trim();
  const low = t.toLowerCase();
  if (!t) return "请输入你想了解的内容，或点下方快捷问题。";
  if (/待办|审批|超时|紧急/.test(t)) {
    const n = (MOCK.todos && MOCK.todos.length) || 0;
    return `你当前有 ${n} 条待办（演示数据）。最紧急项已在首页时间轴置顶；也可在 ⌘K 输入「待办」快速跳转。`;
  }
  if (/打开|crm|oa|应用/.test(low)) {
    return "演示：将经 SSO 在新标签页打开对应应用（决议 #5）。生产环境走 E1 网关鉴权与 ticket 交换。";
  }
  if (/简报|今日|早上/.test(t)) {
    return "今日简报由规则引擎生成（cardId `ai-brief`，接口 `GET /v1/portal/brief?source=rule`），非大模型输出。";
  }
  if (/模型|路由|v2/.test(low)) {
    return `【${c.modelRouteLabel || "模型路由 V2"}】原型未接真实推理；保存配置见「门户运营 → 首页 AI 助手（演示）」。`;
  }
  if (/⌘k|命令|意图/.test(low)) {
    return "V1.5 智能入口：顶栏 ⌘K + 左栏意图流（管理端「意图项配置」维护，5 分钟内生效）。";
  }
  return `收到：「${t}」。这是原型 mock 回复（${c.modelRouteLabel || "模型路由 V2"}），不会调用真实大模型。`;
};

/**
 * 校验意图「跳转链接」（A1-F02-7 · 管理端保存前）
 * 允许：https 外链；站内相对路径（/foo、*.html、console.html?…）；空串表示走 cmd/表单兜底
 */
MOCK.validateIntentJumpUrl = function (url) {
  const u = String(url == null ? "" : url).trim();
  if (!u) return { ok: true, url: "" };
  if (/^https:\/\/.+/i.test(u)) return { ok: true, url: u };
  if (/^\/[\w\-/.?&=%#]*$/i.test(u)) return { ok: true, url: u };
  if (/^[a-z0-9_-]+\.html(\?[^#]*)?(#.*)?$/i.test(u)) return { ok: true, url: u };
  if (/^console\.html\?/i.test(u)) return { ok: true, url: u };
  return {
    ok: false,
    msg: "跳转链接须为 https:// 外链，或站内路径（如 approval.html、/portal/foo、console.html?page=…）"
  };
};

/** 推断 jumpType：未配置时 https → external，其余站内 → internal，空链接 → cmd */
MOCK.inferIntentJumpType = function (jumpUrl, jumpType) {
  const jt = String(jumpType || "").trim();
  if (jt === "external" || jt === "internal" || jt === "cmd") return jt;
  const u = String(jumpUrl || "").trim();
  if (!u) return "cmd";
  return /^https?:\/\//i.test(u) ? "external" : "internal";
};

/**
 * 员工端执行意图跳转（有 jumpUrl 且 jumpType≠cmd 时优先于表单/SSO 演示 toast）
 * external：新标签页（决议 #5）；internal：当前页 location.href
 */
MOCK.navigateIntentJump = function (it) {
  if (!it) return false;
  const jt = MOCK.inferIntentJumpType(it.jumpUrl, it.jumpType);
  if (jt === "cmd") return false;
  const v = MOCK.validateIntentJumpUrl(it.jumpUrl);
  if (!v.ok || !v.url) return false;
  const url = v.url;
  if (jt === "external" || /^https:\/\//i.test(url)) {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    location.href = url;
  }
  return true;
};

/* ============================================================
   角色默认 · 我的订阅 / 我要做什么（A1-F02 扩展 · 原型 localStorage）
   ------------------------------------------------------------
   存储：
     portal_role_defaults_{roleId} → { subscriptionAppIds[], intentIds[] }
     bmp_my_subscriptions          → 用户个人订阅（应用名数组，存在即覆盖角色默认）
     bmp_user_intents              → 用户个人意图 key 列表（存在即覆盖角色默认）
   合并规则（员工端）：
     ① 有个人 key → 仅用个人数据（再与「角色可选范围 + 目录」求交校验）
     ② 无个人 key → 使用当前用户命中角色的 role defaults
     ③ 原型中 role defaults 的多选同时表示「默认展示」与「该角色可选范围」
   roleId 与 LAY_TEMPLATES 对齐：tpl-employee / tpl-manager / tpl-rd
   ============================================================ */
MOCK.SUB_KEY = "bmp_my_subscriptions";
MOCK.USER_INTENTS_KEY = "bmp_user_intents";

/** 与 pages-config.js · LAY_TEMPLATES 角色名对齐 */
/** 匹配顺序：更专属的角色优先（多角色用户取第一个命中） */
MOCK.portalRoleBindings = [
  { roleId: "tpl-manager", label: "管理层（系统/超级管理员）", matchRoles: ["系统管理员", "超级管理员"] },
  { roleId: "tpl-rd", label: "研发角色", matchRoles: ["研发中心"] },
  { roleId: "tpl-employee", label: "普通员工", matchRoles: ["普通员工"] }
];

/** 预置角色默认（管理员未保存时回退；appId 原型口径 = MOCK.apps.name） */
MOCK.portalRoleDefaultsSeed = {
  "tpl-employee": {
    subscriptionAppIds: ["CRM 客户管理", "招聘系统", "费用报销", "数据报表", "合同审批"],
    intentIds: ["launch_approval", "find_person", "leave", "expense"]
  },
  "tpl-manager": {
    subscriptionAppIds: ["CRM 客户管理", "OA 办公", "数据报表", "目标管理"],
    intentIds: ["launch_approval", "my_contracts", "find_person", "data", "seal"]
  },
  "tpl-rd": {
    subscriptionAppIds: ["项目管理", "知识库", "OA 办公"],
    intentIds: ["launch_approval", "find_person", "leave"]
  }
};

MOCK.roleDefaultsStorageKey = function (roleId) {
  return "portal_role_defaults_" + roleId;
};

/** 按 MOCK.user.roles 命中 layout 模板角色（与 layTemplateForRole 同源语义） */
MOCK.resolvePortalRoleId = function (userRoles) {
  const roles = userRoles || (MOCK.user && MOCK.user.roles) || [];
  for (let i = 0; i < MOCK.portalRoleBindings.length; i++) {
    const b = MOCK.portalRoleBindings[i];
    if (roles.some(r => b.matchRoles.indexOf(r) >= 0)) return b.roleId;
  }
  return "tpl-employee";
};

/** 流程门户应用 localStorage 覆盖（C1-F01-8）；管理端 UI 唯一发布入口：workflow-defs「发布到应用中心」 */
MOCK.PORTAL_WF_APPS_KEY = "bmp_portal_workflow_apps";

MOCK.getPortalWorkflowApps = function () {
  let extras = [];
  try {
    const s = localStorage.getItem(MOCK.PORTAL_WF_APPS_KEY);
    if (s) extras = JSON.parse(s);
  } catch (e) { /* 降级 seed */ }
  const byKey = {};
  (MOCK.portalWorkflowApps || []).forEach(a => {
    byKey[a.defKey] = Object.assign({ kind: "workflow" }, a);
  });
  (extras || []).forEach(a => {
    if (a && a.defKey) byKey[a.defKey] = Object.assign({ kind: "workflow" }, a);
  });
  return Object.values(byKey);
};

/** 是否存在可发起的已发布版本（停用定义 → 应用中心隐藏） */
MOCK.isWorkflowDefStartable = function (defKey) {
  const defs = (MOCK.workflow && MOCK.workflow.defs) || [];
  return defs.some(d => d.defKey === defKey && d.status === "已发布");
};

MOCK.getWorkflowDefMeta = function (defKey) {
  const defs = (MOCK.workflow && MOCK.workflow.defs) || [];
  const published = defs.filter(d => d.defKey === defKey && d.status === "已发布");
  if (!published.length) return null;
  return published.sort((a, b) => b.version - a.version)[0];
};

/** 流程向导步骤 1：发起方式（form=中台 formSchema · external=第三方 fillUrl/viewUrl）持久化（原型 localStorage） */
MOCK.WF_LAUNCH_CFG_KEY = "bmp_wf_def_launch_cfg";

MOCK.isWorkflowHttpUrl = function (url) {
  return /^https?:\/\/.+/i.test(String(url || "").trim());
};

/** 读取 defKey 发起配置：优先 localStorage 草稿，其次已发布 def 行内字段，默认 form */
MOCK.getWorkflowLaunchConfig = function (defKey) {
  const key = String(defKey || "").trim();
  let cfg = null;
  try {
    const all = JSON.parse(localStorage.getItem(MOCK.WF_LAUNCH_CFG_KEY) || "{}");
    if (all[key]) cfg = Object.assign({}, all[key]);
  } catch (e) { /* 降级 seed */ }
  if (!cfg) {
    const def = MOCK.getWorkflowDefMeta(key);
    if (def && def.launchMode === "external") {
      cfg = { launchMode: "external", fillUrl: def.fillUrl || "", viewUrl: def.viewUrl || "" };
    }
  }
  if (!cfg) cfg = { launchMode: "form", fillUrl: "", viewUrl: "" };
  if (!cfg.launchMode) cfg.launchMode = "form";
  return cfg;
};

MOCK.saveWorkflowLaunchDraft = function (defKey, cfg) {
  const key = String(defKey || "").trim();
  if (!key) return { ok: false };
  let all = {};
  try {
    all = JSON.parse(localStorage.getItem(MOCK.WF_LAUNCH_CFG_KEY) || "{}");
  } catch (e) { all = {}; }
  all[key] = {
    launchMode: cfg.launchMode || "form",
    fillUrl: String(cfg.fillUrl || "").trim(),
    viewUrl: String(cfg.viewUrl || "").trim(),
    updatedAt: new Date().toISOString()
  };
  try { localStorage.setItem(MOCK.WF_LAUNCH_CFG_KEY, JSON.stringify(all)); } catch (e2) {}
  return { ok: true };
};

/** 替换 URL 占位符：{bizKey}、{defKey}（原型说明 SSO 由业务系统处理） */
MOCK.resolveWorkflowLaunchUrl = function (urlTemplate, ctx) {
  ctx = ctx || {};
  return String(urlTemplate || "")
    .replace(/\{bizKey\}/g, encodeURIComponent(ctx.bizKey || ""))
    .replace(/\{defKey\}/g, encodeURIComponent(ctx.defKey || ""));
};

/** 第三方填报：新标签打开 fillUrl */
MOCK.openWorkflowFillUrl = function (defKey, ctx) {
  const cfg = MOCK.getWorkflowLaunchConfig(defKey);
  if (cfg.launchMode !== "external" || !MOCK.isWorkflowHttpUrl(cfg.fillUrl)) return false;
  const url = MOCK.resolveWorkflowLaunchUrl(cfg.fillUrl, Object.assign({ defKey }, ctx || {}));
  try { window.open(url, "_blank", "noopener,noreferrer"); } catch (e) { /* 原型降级 */ }
  if (typeof msg === "function") {
    msg("success", "已跳转第三方填报，提交后由业务系统回调");
  }
  return true;
};

MOCK.openWorkflowViewUrl = function (defKey, ctx) {
  const cfg = MOCK.getWorkflowLaunchConfig(defKey);
  if (cfg.launchMode !== "external" || !MOCK.isWorkflowHttpUrl(cfg.viewUrl)) return false;
  const url = MOCK.resolveWorkflowLaunchUrl(cfg.viewUrl, Object.assign({ defKey }, ctx || {}));
  try { window.open(url, "_blank", "noopener,noreferrer"); } catch (e) { /* 原型降级 */ }
  if (typeof msg === "function") {
    msg("info", "已在业务系统打开单据查看页（经 SSO 免登 · 原型演示）");
  }
  return true;
};

/** 从 bizKey 解析 defKey/bizType（BMP:travel_expense:xxx） */
MOCK.defKeyFromBizKey = function (bizKey) {
  if (!bizKey) return "";
  const parts = String(bizKey).split(":");
  return parts.length >= 2 ? parts[1] : parts[0];
};

MOCK.getActiveWorkflowPortalApps = function () {
  return MOCK.getPortalWorkflowApps().filter(a => {
    if (a.portalVisible === false || a.status === "已下架") return false;
    return MOCK.isWorkflowDefStartable(a.defKey);
  });
};

/** 应用中心目录：外链 + 流程（GET /v1/portal/apps?include=workflow） */
MOCK.getPortalCatalogApps = function () {
  const external = (MOCK.apps || [])
    .filter(a => a.portalVisible !== false && a.status !== "已下架")
    .map(a => Object.assign({ kind: a.kind || "external" }, a));
  return external.concat(MOCK.getActiveWorkflowPortalApps());
};

MOCK.findPortalAppByName = function (name) {
  return MOCK.getPortalCatalogApps().find(a => a.name === name) || null;
};

MOCK.bizDomainLabel = function (code) {
  const hit = (MOCK.bizDomains || []).find(d => d.code === code);
  return hit ? hit.label : code || "—";
};

/** 员工端打开门户应用：外链 SSO · 流程站内发起（A1-F01-3） */
MOCK.openPortalApp = function (nameOrApp) {
  const app = typeof nameOrApp === "string" ? MOCK.findPortalAppByName(nameOrApp) : nameOrApp;
  if (!app) {
    if (typeof msg === "function") msg("warning", "应用不存在或未上架");
    return;
  }
  if (app.kind === "workflow") {
    const def = MOCK.getWorkflowDefMeta(app.defKey);
    if (!def) {
      if (typeof msg === "function") msg("error", "流程定义已停用或未发布，暂不可发起");
      return;
    }
    const launch = MOCK.getWorkflowLaunchConfig(app.defKey);
    if (launch.launchMode === "external") {
      const bizKey = "BMP:" + app.defKey + ":DRAFT-" + Date.now();
      MOCK.openWorkflowFillUrl(app.defKey, { bizKey });
      return;
    }
    location.href = "approval.html?action=start&defKey=" + encodeURIComponent(app.defKey);
    return;
  }
  if (typeof msg === "function") {
    msg("info", "新标签页打开「" + app.name + "」（经 E1 网关 SSO 免登，决议 #5）");
  }
};

/** 管理端：发布流程到应用中心（写 localStorage + 可选注册 start 权限点；勿在 portal-apps 重复建入口） */
MOCK.publishWorkflowToPortal = function (opts) {
  const defKey = String(opts.defKey || "").trim();
  const def = MOCK.getWorkflowDefMeta(defKey);
  if (!def) return { ok: false, reason: "defKey 无已发布版本" };
  const bizDomain = String(opts.bizDomain || "GENERAL").trim();
  if (!(MOCK.bizDomains || []).some(d => d.code === bizDomain)) {
    return { ok: false, reason: "业务域不在字典内" };
  }
  const name = String(opts.name || def.name).trim();
  const appCode = "wf_" + defKey;
  let list = [];
  try {
    const s = localStorage.getItem(MOCK.PORTAL_WF_APPS_KEY);
    if (s) list = JSON.parse(s);
  } catch (e) { list = []; }
  if (!Array.isArray(list)) list = [];
  const entry = {
    name,
    kind: "workflow",
    defKey,
    appCode,
    bizDomain,
    group: opts.group || MOCK.bizDomainLabel(bizDomain),
    icon: opts.icon || "📝",
    color: opts.color || "#1677FF",
    freq: opts.freq || 3,
    portalVisible: true,
    status: "已上架",
    launchMode: opts.launchMode || "start_form",
    updatedAt: new Date().toISOString()
  };
  const idx = list.findIndex(x => x.defKey === defKey);
  if (idx >= 0) list[idx] = Object.assign({}, list[idx], entry);
  else list.push(entry);
  try { localStorage.setItem(MOCK.PORTAL_WF_APPS_KEY, JSON.stringify(list)); } catch (e) {}
  /* 原型：自动挂载 workflow:instance:start:{defKey} 到 permissionsFlat（若不存在） */
  const permCode = "workflow:instance:start:" + defKey;
  if (!(MOCK.permissionsFlat || []).some(p => p.code === permCode)) {
    MOCK.permissionsFlat.push({
      code: permCode,
      type: "button",
      apiPattern: "POST /v1/workflow/instance",
      desc: "发起「" + name + "」",
      appCode: "platform",
      bizDomain: bizDomain,
      module: "工作流",
      submodule: defKey,
      roleRefs: 1
    });
  }
  try { window.dispatchEvent(new CustomEvent("bmp:portal-apps-updated")); } catch (e2) {}
  return { ok: true, entry };
};

/** 快捷入口目录：管理端意图注册表中已启用的项 */
MOCK.getPortalCatalogIntents = function () {
  return MOCK.getPortalIntents().filter(it => it.enabled !== false);
};

MOCK.getRoleDefaults = function (roleId) {
  const rid = roleId || MOCK.resolvePortalRoleId();
  try {
    const s = localStorage.getItem(MOCK.roleDefaultsStorageKey(rid));
    if (s) {
      const o = JSON.parse(s);
      return {
        subscriptionAppIds: Array.isArray(o.subscriptionAppIds) ? o.subscriptionAppIds.slice() : [],
        intentIds: Array.isArray(o.intentIds) ? o.intentIds.slice() : []
      };
    }
  } catch (e) { /* 降级 seed */ }
  const seed = MOCK.portalRoleDefaultsSeed[rid];
  return seed
    ? { subscriptionAppIds: seed.subscriptionAppIds.slice(), intentIds: seed.intentIds.slice() }
    : { subscriptionAppIds: [], intentIds: [] };
};

MOCK.saveRoleDefaults = function (roleId, data) {
  const catalogApps = new Set(MOCK.getPortalCatalogApps().map(a => a.name));
  const catalogIntentKeys = new Set(MOCK.getPortalCatalogIntents().map(it => it.key));
  const subscriptionAppIds = (data.subscriptionAppIds || [])
    .filter(id => catalogApps.has(id))
    .filter((id, i, arr) => arr.indexOf(id) === i);
  const intentIds = (data.intentIds || [])
    .filter(k => catalogIntentKeys.has(k))
    .filter((k, i, arr) => arr.indexOf(k) === i);
  const payload = { subscriptionAppIds, intentIds, updatedAt: new Date().toISOString() };
  localStorage.setItem(MOCK.roleDefaultsStorageKey(roleId), JSON.stringify(payload));
  try { window.dispatchEvent(new CustomEvent("bmp:role-defaults-updated", { detail: { roleId } })); } catch (e) {}
  return payload;
};

/** 角色可选应用名（原型：与 role defaults 的 subscriptionAppIds 相同集合） */
MOCK.getRoleAllowedAppNames = function (roleId) {
  return MOCK.getRoleDefaults(roleId).subscriptionAppIds.filter(n =>
    MOCK.getPortalCatalogApps().some(a => a.name === n)
  );
};

/** 角色可选意图 key */
MOCK.getRoleAllowedIntentKeys = function (roleId) {
  const allowed = new Set(MOCK.getPortalCatalogIntents().map(it => it.key));
  return MOCK.getRoleDefaults(roleId).intentIds.filter(k => allowed.has(k));
};

MOCK.hasPersonalSubscriptions = function () {
  try { return localStorage.getItem(MOCK.SUB_KEY) != null; } catch (e) { return false; }
};

MOCK.hasPersonalIntents = function () {
  try { return localStorage.getItem(MOCK.USER_INTENTS_KEY) != null; } catch (e) { return false; }
};

/** 校验并保存个人订阅（仅限目录 ∩ 角色可选） */
MOCK.saveUserSubscriptions = function (list, roleId) {
  const allowed = new Set(MOCK.getRoleAllowedAppNames(roleId));
  const catalog = new Set(MOCK.getPortalCatalogApps().map(a => a.name));
  const valid = (list || [])
    .filter(n => typeof n === "string" && catalog.has(n) && allowed.has(n))
    .filter((n, i, arr) => arr.indexOf(n) === i);
  try { localStorage.setItem(MOCK.SUB_KEY, JSON.stringify(valid)); } catch (e) {}
  return valid;
};

MOCK.saveUserIntentKeys = function (keys, roleId) {
  const allowed = new Set(MOCK.getRoleAllowedIntentKeys(roleId));
  const valid = (keys || [])
    .filter(k => typeof k === "string" && allowed.has(k))
    .filter((k, i, arr) => arr.indexOf(k) === i);
  try { localStorage.setItem(MOCK.USER_INTENTS_KEY, JSON.stringify(valid)); } catch (e) {}
  try { window.dispatchEvent(new CustomEvent("bmp:user-intents-updated")); } catch (e) {}
  return valid;
};

/**
 * 有效订阅应用名列表
 * @returns {{ names: string[], fromRoleDefault: boolean }}
 */
MOCK.getEffectiveSubscriptions = function (roleId) {
  const rid = roleId || MOCK.resolvePortalRoleId();
  const allowed = MOCK.getRoleAllowedAppNames(rid);
  const catalog = new Set(MOCK.getPortalCatalogApps().map(a => a.name));
  if (MOCK.hasPersonalSubscriptions()) {
    try {
      const raw = localStorage.getItem(MOCK.SUB_KEY);
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        const names = arr.filter(n => catalog.has(n) && allowed.indexOf(n) >= 0);
        return { names, fromRoleDefault: false };
      }
    } catch (e) { /* fallthrough */ }
  }
  return { names: allowed.slice(), fromRoleDefault: true };
};

/**
 * 有效意图 key 列表（有序：按门户意图 order，仅保留选中项）
 */
MOCK.getEffectiveIntentKeys = function (roleId) {
  const rid = roleId || MOCK.resolvePortalRoleId();
  const allowedSet = new Set(MOCK.getRoleAllowedIntentKeys(rid));
  let picked;
  if (MOCK.hasPersonalIntents()) {
    try {
      const raw = localStorage.getItem(MOCK.USER_INTENTS_KEY);
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) picked = arr.filter(k => allowedSet.has(k));
    } catch (e) { picked = null; }
  }
  if (!picked) {
    picked = MOCK.getRoleDefaults(rid).intentIds.filter(k => allowedSet.has(k));
    return { keys: picked, fromRoleDefault: true };
  }
  return { keys: picked, fromRoleDefault: false };
};

/** 员工端渲染：已启用且落在有效 key 集合内的意图项 */
MOCK.getEffectiveIntents = function (roleId) {
  const eff = MOCK.getEffectiveIntentKeys(roleId);
  const pick = new Set(eff.keys);
  return MOCK.getPortalCatalogIntents()
    .filter(it => pick.has(it.key))
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(it => Object.assign({}, it, { _fromRoleDefault: eff.fromRoleDefault }));
};

MOCK.clearUserSubscriptions = function () {
  try { localStorage.removeItem(MOCK.SUB_KEY); } catch (e) {}
};

MOCK.clearUserIntents = function () {
  try { localStorage.removeItem(MOCK.USER_INTENTS_KEY); } catch (e) {}
};

/** 注册申请单条：V1.5 原型仅标准路径，审批不依赖 orgMappingReady */
MOCK.normalizeRegApplication = function (a) {
  if (!a || typeof a !== "object") return a;
  a.integrationTier = a.integrationTier || "standard";
  a.orgMappingReady = true;
  return a;
};
/** 注册申请列表（模拟 gov_app_register_apply） */
MOCK.getRegApplications = function () {
  let list;
  try {
    const s = localStorage.getItem("bmp_reg_applications");
    if (s) list = JSON.parse(s);
  } catch (e) { /* 降级 */ }
  if (!list) list = JSON.parse(JSON.stringify(MOCK.regApplicationsDefault));
  return list.map(a => MOCK.normalizeRegApplication(a));
};
MOCK.saveRegApplications = function (list) {
  const normalized = (list || []).map(a => MOCK.normalizeRegApplication(Object.assign({}, a)));
  localStorage.setItem("bmp_reg_applications", JSON.stringify(normalized));
};

/* 门户顶栏渲染（未读角标 30s 轮询模拟） */
function renderTopbar(active) {
  const u = MOCK.user;
  const unreadMsg = MOCK.messages.filter(m => m.unread).length;
  const pendingTodo = MOCK.todos.length;
  const nav = [
    { key: "home", href: "home-v2.html", text: "首页" },
    { key: "todos", href: "todos.html", text: "待办", badge: pendingTodo },
    { key: "approval", href: "approval.html", text: "审批中心", badge: (MOCK.workflow && MOCK.workflow.approvalCenter ? MOCK.workflow.approvalCenter.todo.length : 0) },
    { key: "messages", href: "messages.html", text: "消息", badge: unreadMsg },
    { key: "apps", href: "apps.html", text: "应用" }
  ];
  return `
  <div class="portal-topbar">
    <div class="portal-logo" onclick="location.href='home-v2.html'"><span class="logo-mark">麓</span>麓邦业务中台</div>
    <nav class="portal-nav">
      ${nav.map(n => `<a href="${n.href}" class="${active === n.key ? "active" : ""}">${n.text}${n.badge ? ` <span class="badge-n">${n.badge}</span>` : ""}</a>`).join("")}
      <a href="javascript:void(0)" title="V1.5 上线（位置预留）" style="opacity:.45;cursor:not-allowed">搜索 🔍</a>
    </nav>
    <div class="portal-right">
      <button class="icon-btn" title="消息通知" onclick="location.href='messages.html'">🔔<span class="badge-n">${unreadMsg}</span></button>
      <div class="dropdown">
        <div class="avatar">${u.avatarText}</div>
        <div class="dropdown-menu">
          <div style="padding:8px 12px"><b>${u.name}</b><div class="fs-12 text-secondary">${u.org} · ${u.employeeNo}</div></div>
          <div class="sep"></div>
          <a href="settings.html">个人设置</a>
          <a href="console.html?page=dashboard">管理控制台</a>
          <div class="sep"></div>
          <a href="javascript:logout()">退出登录</a>
        </div>
      </div>
    </div>
  </div>`;
}
