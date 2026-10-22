# 管理控制台侧栏菜单（业务域梳理）

> **真源**：`prototype/assets/console.js` → `CONSOLE_MENU`  
> **版本**：2026-10-21 · 侧栏 **27 项** · **8** 个一级分组  
> **原则**：**一域一入口** — 子能力走页内 Tab 或父页内链，不重复侧栏项。

## 分组 rationale

| 层级 | 一级菜单 | PRD / UI-C 域 | 说明 |
| --- | --- | --- | --- |
| 平台治理 | 总览 | OPS | 运营总览看板（单页：**5 项 KPI 指标卡** + 门户运营图表），非业务域 CRUD |
| 基础能力 | 身份与权限 | B1/B2 · UI-C-01~05 | 谁可以登录、授权什么、会话与申请 |
| 基础能力 | 主数据 | F1 + D2 · UI-C-06~09 + D2 | 组织人员、权威源与同步；**文件管理**归主数据（`file_object`） |
| 业务运营 | 门户运营 | A1 · UI-C-10/11/12/17 | 员工端可见内容的配置链路 |
| 业务运营 | 流程与表单 | C1 · UI-WF | 审批流全生命周期（向导无侧栏） |
| 业务运营 | 消息管理 | D1 · UI-C-13 | 模板 / 渠道 / 记录 单页三 Tab |
| 合规 | 审计中心 | E2 · UI-C-14 | 合规留痕检索（≠ 产品埋点 `dashboard`） |
| 集成 | 集成与网关 | I1/J3/E1 · UI-C-15/16 | 对外开放面：能力 → 注册 → 事件 → 路由 |

## 完整菜单树

```
总览
  └ 运营总览看板（单页）            dashboard
      （5 项 KPI 单行 + 门户运营趋势/排名/能力分布；书签 alias：app-analytics → dashboard）

身份与权限
  ├ 账号管理                        accounts
  ├ 角色管理                        roles
  ├ 权限点管理（app_code/业务域筛选） permissions
  ├ 在线会话管理                    sessions
  └ 权限申请登记                    perm-applies

主数据
  ├ 组织管理                        orgs
  ├ 人员管理                        employees
  ├ 权威源配置向导                  sync-source
  ├ 同步日志                        sync-logs
  └ 文件管理（三 Tab）              file-admin

门户运营
  ├ 应用管理                        portal-apps
      （外链上架 + 流程 kind=workflow **只读**；发布流程 → workflow-defs · C1-F01-8）
  ├ 首页组件管理（三 Tab）          portal-components
      （卡片 / 嵌入 / 意图；嵌入 host 随 I1 应用注册，无独立白名单 Tab）
  ├ 布局模板管理                    layouts
  ├ 角色订阅与意图                  portal-role-defaults
  ├ 公告管理                        notices-admin
  └ 首页 AI 助手（演示）            portal-ai-assistant

流程与表单
  ├ 流程定义管理                    workflow-defs
  ├ 审批矩阵管理                    workflow-matrix
  ├ 流程实例监控                    workflow-instances
  └ 委托代理管理                    workflow-delegate

消息管理
  └ 模板 / 渠道 / 记录              msg

审计中心
  └ 审计日志检索                    audit

集成与网关
  ├ 中台能力目录                    platform-capabilities
  ├ 应用注册                        app-register
  ├ 事件订阅运维（双 Tab）          app-register-events
  └ 网关路由管理                    gateway
```

## 无侧栏项（书签 / 内链仍有效）

| page key | 归属菜单高亮 | 进入方式 |
| --- | --- | --- |
| `app-register-guide` | `app-register` | 应用注册页内链 |
| `workflow-designer` | `workflow-defs` | 流程定义 → ＋ 新建审批流 |
| `portal-apps-cards` 等 alias | `portal-components` | 深链 → `portal-components&tab=*`（旧 `portal-apps&tab=cards\|embeds\|intents` 仍 redirect） |
| `file-audit` / `file-policy` | `file-admin` | 深链 → `file-admin&tab=*` |
| `event-monitor` | `app-register-events` | → `tab=outbox` |
| `app-analytics` | `dashboard` | → `page=dashboard`（无 Tab） |
