# 麓邦业务中台 全局 UI 规范（Design System v1.0）

| 项目 | 内容 |
| --- | --- |
| 文档版本 | **v1.0**（横向全站规范，承接 UIUX v1.1「Notion 暖色体系 + 双轨制」） |
| 文档定位 | **文档 A · 全局 UI 规范**（横向）：只给全站共用的 Token、状态、组件、反馈、无障碍、动效、文案、命名；**不逐页描述** |
| 与文档 B 的边界 | 逐页内容（区块树 / 字段 / 交互 / 权限 / 5 态 / 验收）见《麓邦业务中台 UI-UX 页面规范》**文档 B**；本文只给「约束与依据」，B 文档只**引用**本文（写「见 A 文档 §2.1」） |
| 上游权威源 | 《麓邦业务中台产品PRD.md》**v2.0**（125 功能点）、《麓邦业务中台UIUX设计文档.md》**v1.1**（30+2 页） |
| 主要落地文件 | `prototype/assets/tokens.css`（114 行）、`prototype/assets/common.css`（558 行） |
| 事实基线 | `outputs/核查/00-事实基线.md`（含 P-01~P-08 已发现问题的行号证据） |
| 读者 | 前端开发（Vue3/TS/Element Plus）、UI 设计师、测试/QA、后续修复人 |
| 编写契约 | `outputs/规范/00-UI规范与页面规范-编写规格简报.md` §二（章节结构不可增删） |

---

## §0 文档信息

### 0.1 版本与依据

| 项 | 值 | 来源 |
| --- | --- | --- |
| 本规范版本 | v1.0 | 首次制定 |
| 上游 PRD 版本 | **v2.0**（125 顶层功能点，9 业务域 / 27 模块） | PRD §2.7 功能点总表 |
| 上游 UIUX 版本 | **v1.1**（Notion 暖色体系 + 双轨制 + 决议 #5b） | UIUX 文档头 |
| 原型基线 | 22 个 HTML + 4 个资产文件（`prototype/`） | 事实基线 §1、§4.1 |
| Token 落地版本 | `tokens.css` 双轨制，第一轨 20 个变量 + 第二轨 44 个 `--bmp-*` 别名 | §2.9 实测 |
| 技术栈锁定 | Vue 3.4+ / TypeScript 5 / Vite 5 / Element Plus / Pinia / Vue Router 4 / pnpm；移动端 Vue3 + Vant | UIUX §8.1、PRD §2.5 |

### 0.2 适用范围

| 端 | 范围 | 页面数 |
| --- | --- | --- |
| 统一登录 | UI-LOGIN-01~04 | 4 |
| 工作台门户（PC） | UI-A1-01/02/03/04、UI-A4-01、UI-U-01 | 6 |
| 统一移动端（钉钉/企微 H5） | UI-M-01~05 | 5 |
| 管理控制台 | UI-C-01~17 | 17 |
| 组件库（J1） | `@bmp/components` / `@bmp/components-mobile` / `@bmp/theme` | —— |
| **合计** | | **30 + 2** |

> 页面编号与 PRD 需求编号（如 A1-F01）双向映射，见 UIUX §3.4 页面地图总表。

### 0.3 本规范的强制性等级

| 等级 | 标记 | 含义 | 违反后果 |
| --- | --- | --- | --- |
| 强制 | **【强制】** | 必须遵守，不可协商 | 走查不通过；P0/P1 问题 |
| 推荐 | **【推荐】** | 默认做法，偏离需说明理由 | P2 问题 |
| 待裁定 | **【待裁定】** | 已有倾向但未拍板，需产品/设计确认 | 记录在 §0.4 |

### 0.4 未决事项（本规范内部登记）

| # | 未决项 | 影响章节 | 建议 | 阻塞 |
| --- | --- | --- | --- | --- |
| U-1 | 品牌红精确色值（当前占位 `#C8161D`） | §2.1 | 待 VI 手册提取后**仅替换 `@bmp/theme` Token 包一处** | 不阻塞 |
| U-2 | 内容密度是否在管理控制台生效 | §2.3 | PRD §10.5 #6 倾向「仅门户 PC + 移动生效，管理台固定标准档」 | 不阻塞 |
| U-3 | 必填星标用 danger 亮红还是品牌红 | §2.1 | 本规范裁定：**用 danger 亮红**（与提交失败提示同屏同色系），见 §2.1.3 | 不阻塞 |
| U-4 | `--bmp-radius-pill` 未在 `tokens.css` 定义 | §2.9 | 落地用第一轨 `--r-pill`；如需别名轨补齐见 §2.9 缺项表 | 不阻塞 |
| U-5 | UIUX 写 `--border-strong`，落地为 `--border-strong-color` | §2.9 | **以落地文件为准**，UIUX 命名视为笔误 | 不阻塞 |

### 0.5 §0 走查 checklist

- [ ] 本规范版本号与上游 PRD/UIUX 版本号已在文档头显式声明
- [ ] 文档 A / 文档 B 的边界声明已存在，且本文未出现逐页区块树
- [ ] 未决事项 U-1~U-5 已登记且均不阻塞

---

## §1 设计目标与原则

### 1.1 设计目标（承接 UIUX §1.1，补可度量口径）

| 目标 | UIUX 原度量 | 本规范补充的可度量口径 | 依据 |
| --- | --- | --- | --- |
| **一站式** | 工作台日活 ≥70% | 首页首屏承载 ≥80% 高频入口动作；首屏可见待办卡 | UIUX §1.1、PRD §1.4 |
| **零学习成本** | 首次使用无需培训 | 新用户进入任一页面，**核心动作的按钮文案为动词开头且唯一**（同屏同义按钮不超过 1 个） | UIUX §1.1、§4.7 |
| **可配置** | 管理员配角色首页 ≤30 分钟 | 新卡片上线 = **注册 manifest + 发布组件**，零平台改造 | UIUX §1.1、§8.3 |
| **一致** | 业务组件复用率 ≥80% | **硬编码色值数 / 硬编码字号数** 作为反向指标（当前基线：非 tokens 文件共 558 处十六进制） | UIUX §1.1、事实基线 §4.3 |
| **可访问**（本规范新增） | —— | 正文对比度 ≥4.5:1；键盘可达全部交互元素；尊重 `prefers-reduced-motion` | UIUX §4.7、WCAG AA |

### 1.2 设计原则（承接 UIUX §1.3，落为可检验条款）

| # | 原则 | 可检验条款 |
| --- | --- | --- |
| P1 | **任务优先** | 待办与审批是最高频任务，一切导航为其让路（首屏必见待办卡）；任何新功能不得占用首屏「最要紧的一件事」的位置 |
| P2 | **状态可见** | 任何异步操作有明确反馈（加载/成功/失败），任何数据有 **6 态**覆盖（见 §3）；空态**必带下一步动作** |
| P3 | **一致复用** | 同类操作用同类控件与文案；管理端一律列表页 / 左树右表 / 详情抽屉 / 向导 / 工作台五范式（UIUX §4.1） |
| P4 | **克制装饰** | 企业工具属性，信息密度中等偏高，避免大留白营销风；品牌红仅点缀（§2.1.3 第 5 条） |
| P5 | **可配置即产品** | 布局引擎、卡片注册、权限指令驱动的界面差异全部配置化，不硬编码 |
| P6 | **色彩不动摇**（本规范新增） | **语义色不随主题变**（PRD A1-F06 H2）；**紧急/超时=品牌红、错误/失败=danger 亮红**同屏不得混用（§2.1.3） |

### 1.3 §1 走查 checklist

- [ ] 每一页的首屏可定位到「待办/审批」类信息（P1）
- [ ] 每一页的异步操作均具备 6 态中的至少 4 态（加载/空/错误/无权限）（P2、§3）
- [ ] 管理端页面已标注归属五范式（P3、UIUX §4.1）
- [ ] 页面背景保持中性（白画布 / 暖白区块），无大面积品牌红（P4）
- [ ] 无组件内硬编码色值/字号（`grep -nE "#[0-9A-Fa-f]{3,8}" <文件>` 结果仅出现在样式定义层的 Token 区）（P5）
- [ ] 语义色与紧急语义红在主题切换后值不变（P6、PRD A1-F06 验收）

---

## §2 设计 Token 全量清单 ⭐

> **本章是本书重心。** 所有值与 `prototype/assets/tokens.css` **逐条对齐**，前端可直接照 §2.9 落地表建 `@bmp/theme` 包。

### 2.0 双轨制（先读本节再看 §2.1）

Token 采用**双轨制**，落地于 `prototype/assets/tokens.css`：

| 轨 | 变量前缀 | 角色 | 实测数量 | 说明 |
| --- | --- | --- | --- | --- |
| **第一轨（基准）** | `--canvas` / `--surface` / `--text-primary` / `--accent` … | **Notion 暖色体系事实基准** | **20 个** | 新页面、新组件**一律使用**；与 `home-v2.html` / `sample-notion.html` 内联变量同名 |
| **第二轨（兼容别名）** | `--bmp-*` | **兼容别名：变量名保留、值指向第一轨** | **44 个**（语义别名 42 + 尺寸别名 2） | 旧页面 + `common.css` 共 **1400 处** `var(--bmp-*)` 引用靠它继续工作 —— **零改动自动变暖色** |

**四条原则**：

1. **变量名不改**：保护存量引用（实测全站 `var(--bmp-*)` 引用 **1400 处**；含第一轨引用合计 2499 处）；
2. **值全部映射到暖色第一轨**：旧冷色 → 暖色，仅在别名轨改值即可；
3. **新代码优先用第一轨变量**；除「必须兼容旧类名」外，不新增 `--bmp-*`；
4. **语义色（success/warning/danger）与渠道品牌色固定，不随风格变化**（PRD A1-F06 H2）。

> **⚠ 数量口径澄清（易被误判）**：`tokens.css` 注释与 UIUX §2.0 均写「`--bmp-*`（42 个）」。**实测定义 44 个**。差异原因：42 个 = 颜色（13）+ 文字（4）+ 边框（2）+ 背景（2）+ 字体（7）+ 间距（7）+ 圆角（4）+ 阴影（3）；另 **2 个尺寸别名**（`--bmp-topbar-h`、`--bmp-console-menu-w`）未计入「42」。**本规范以实测 44 为准**，下文 §2.9 逐条列全。
>
> **核实命令**：`grep -oE -- "--bmp-[a-z0-9-]+:" prototype/assets/tokens.css | sed 's/://' | sort -u | wc -l` → `44`

### 2.1 色彩

#### 2.1.1 基准色（第一轨 · Notion 暖色）

| Token | 值 | 用途 | 落地行 |
| --- | --- | --- | --- |
| `--page-bg` | `#ffffff` | 页面最底（与 `--canvas` 同值，语义别名） | tokens.css:16 |
| `--canvas` | `#ffffff` | **画布底**（页面最底 / 卡片底，纯白） | tokens.css:17 |
| `--surface` | `#f6f5f4` | **区块 / 卡片底**（暖白，带黄褐底调） | tokens.css:18 |
| `--surface-hover` | `#efedea` | 区块悬停 | tokens.css:19 |
| `--surface-sunken` | `#f8f7f6` | 表头 / 浅陷底（比 `--surface` 略亮） | tokens.css:20 |
| `--dark-surface` | `#31302e` | 深色反衬底（Toast / 头像底 / 用户气泡 / 代码 diff 块） | tokens.css:21 |
| `--text-primary` | `rgba(0,0,0,.95)` | 标题（暖黑） | tokens.css:24 |
| `--text-body` | `#444444` | 正文常规 | tokens.css:27 |
| `--text-secondary` | `#615d59` | 次要文字（暖灰 500） | tokens.css:25 |
| `--text-weak` | `#a39e98` | 占位 / 弱化（暖灰 300） | tokens.css:26 |
| `--line-color` | `rgba(0,0,0,.1)` | 细边框色值（供 `border-color` 使用） | tokens.css:34 |
| `--line` | `1px solid rgba(0,0,0,.1)` | **细如耳语的边框（Notion 标识）**，简写形式 | tokens.css:35 |
| `--border-strong-color` | `rgba(0,0,0,.18)` | 强化边框（hover / 聚焦） | tokens.css:36 |
| `--accent` | `#C8161D` | 麓邦品牌红（主操作 / 链接 / 选中态 / **紧急超时语义**） | tokens.css:30 |
| `--accent-warm` | `#dd5b00` | 暖橙（hover / 辅助强调 / 「本周待办」色条） | tokens.css:31 |

> **重要用法——「白画布 + 暖白区块」（Notion 的正确用法）【强制】**：
> ① **页面最底（`body`）用纯白 `--canvas: #ffffff`**；
> ② **区块 / 卡片 / 表格这些「容器」用暖白 `--surface: #f6f5f4`**；
> ③ **不要**写成「页面底应为暖白」——页面底是白的，暖白是**区块的底**。白色画布上浮起一层暖白卡片，才是 Notion 的视觉来源；
> ④ 旧 `--bmp-bg-page` 指向 `--surface`（暖白），是为兼容旧页面把「整页底」当暖白用的历史实现；**新页面请用 `--canvas` 作页底、`--surface` 作区块底**。

#### 2.1.2 品牌色 / 语义色 / 渠道色（固定，不随风格变）

| Token（别名轨） | 值 | 用途 | 随主题变？ |
| --- | --- | --- | --- |
| `--bmp-color-primary` | `var(--accent)` → `#C8161D` | 主操作按钮、链接、导航选中态、品牌区 | **是**（A1-F06-1 允许切换主题色） |
| `--bmp-color-primary-light` | `#FBECEC` | 悬停背景、选中标签底色 | 是（随主题派生） |
| `--bmp-color-primary-dark` | `#A51218` | 按钮 hover/active | 是（随主题派生） |
| `--bmp-color-success` | `#16A34A` | 成功、已通过、启用 | **否（固定）** |
| `--bmp-color-success-light` | `#ECFDF3` | 成功浅底 | 否 |
| `--bmp-color-warning` | `#F59E0B` | 警告、临期待办 | **否（固定）** |
| `--bmp-color-warning-light` | `#FFFBEB` | 警告浅底 | 否 |
| `--bmp-color-danger` | `#F53F3F`（亮红） | **仅限错误与失败**（见 §2.1.3） | **否（固定）** |
| `--bmp-color-danger-light` | `#FEF2F2` | 错误浅底 | 否 |
| `--bmp-color-info` | `#64748B` | 中性提示（**仅作语义 info，注意力等级低，不作为正文/边框等中性色阶使用**） | **否（固定）** |
| `--bmp-color-info-light` | `#F1F5F9` | 中性浅底 | 否 |
| `--bmp-color-dingtalk` | `#1677FF` | 钉钉渠道标识 | **否（固定）** |
| `--bmp-color-wecom` | `#07C160` | 企微渠道标识 | **否（固定）** |

> **⚠ 易误判点 A（必读）**：`--bmp-color-info-light: #F1F5F9` 与 `settings.html:225` 的「石墨灰」预设 `#F1F5F9/#334155/#1E293B` 是**旧冷色系**取值，但**二者性质完全不同**：
> - `--bmp-color-info-light` 是**语义色 info 的浅底**（固定，不随主题变），其值沿用旧冷色是**已知遗留**，属于「语义色固定」的守规结果，**不是冷色残留**；
> - `settings.html:225` 的 `#334155/#F1F5F9/#1E293B` 是 **A1-F06 用户可选主题预设**（「石墨灰」档）的 `primary/light/dark` 三档派生色，**在授权范围内**，**不是缺陷**。
> **但规范必须写明（避免后续走查误判）**：
> ① **风格预设色 ≠ 设计基准色**——预设色是**用户可选的主题色**，只在 A1-F06-1 生效范围内替换 `primary/primary-light/primary-dark` 三档；
> ② **语义色不随主题变**——success/warning/danger/info、紧急语义红、渠道品牌色在任何预设下**值恒定**。

#### 2.1.2.1 【强制】风格预设色 ≠ 设计基准色

> **规则条文（写死，供走查直接引用）**：
>
> **① 用户可选主题预设色可以超出设计基准色表。**
> `settings.html:222-242` 的 `THEME_PRESETS` / `DENSITY_PRESETS` / `RADIUS_PRESETS` 是 **A1-F06 个人界面风格定制**授权的**用户可选项**。其取值**允许**包含设计基准色表之外的颜色（例如「石墨灰」档的 `#334155 / #F1F5F9 / #1E293B` 属旧冷色系取值）。
> **这类取值不构成「冷色残留」，走查时不得计入 P-02 / P-04 类缺陷。**
>
> **② 预设色只覆盖「品牌三档」，不覆盖语义色与渠道色。**
> 预设生效范围**严格限于** `primary` / `primary-light` / `primary-dark` 三档。以下**恒不随主题变**（PRD A1-F06 H2）：

| 类别 | Token | 是否随主题变 |
| --- | --- | --- |
| 品牌三档 | `--bmp-color-primary` / `-light` / `-dark` | **是**（仅此三项） |
| 语义色 | `--bmp-color-success(-light)` / `-warning(-light)` / `-danger(-light)` / `-info(-light)` | **否** |
| **紧急语义红** | 应为**固定**品牌红（当前 `--accent`） | **否** —— ⚠ **实现风险**：A1-F06-1 切主题时 `--bmp-color-primary` 会变，若紧急类元素误用 `--bmp-color-primary` 则会随之变色。故紧急类元素**必须绑定「固定 Token」**；当前 `--accent` 亦被预设覆写，故需**新增固定 Token**（见 §2.9 缺项 G-7） |
| 渠道品牌色 | `--bmp-color-dingtalk` / `--bmp-color-wecom` | **否** |
| 圆角三档 | `--bmp-radius-sm/md/lg` | 是（A1-F06-3）；`--r-pill` **否** |
| 密度 | 行高 / 内边距 / 间距 | 是（A1-F06-2，仅门户 PC + 移动） |

> **③ 预设色与基准色共用同一套变量名与「同一处定义」。**
> 预设通过 `data-theme="indigo|graphite|amber|teal"` 属性覆写 `:root` 的 `--bmp-color-primary*` 三值，**不新增变量名、不在组件内写分支**。基准（`lubon`）即 `:root` 默认值。

```css
:root                    { --bmp-color-primary: #C8161D; --bmp-color-primary-light: #FBECEC; --bmp-color-primary-dark: #A51218; } /* 麓邦红（默认） */
[data-theme="indigo"]    { --bmp-color-primary: #4F46E5; --bmp-color-primary-light: #EEF2FF; --bmp-color-primary-dark: #3730A3; }
[data-theme="graphite"]  { --bmp-color-primary: #334155; --bmp-color-primary-light: #F1F5F9; --bmp-color-primary-dark: #1E293B; } /* 用户可选，非残留 */
[data-theme="amber"]     { --bmp-color-primary: #DD5B00; --bmp-color-primary-light: #FFF4EC; --bmp-color-primary-dark: #B34700; }
[data-theme="teal"]      { --bmp-color-primary: #0F766E; --bmp-color-primary-light: #ECFDF5; --bmp-color-primary-dark: #0B5C56; }
/* 语义色（success/warning/danger/info）与渠道色不在此列 —— 恒不变 */
/* 紧急语义红应绑定独立固定 Token（G-7），不随 data-theme 变 */
```

> **④ 走查判定口径（三条，直接照做）**

| 走查发现 | 判定 | 处置 |
| --- | --- | --- |
| `settings.html:222-242` 内出现 `#334155` 等旧冷色系值 | ✅ **合规**（授权范围内的用户预设） | 不改 |
| 组件 / 样式层出现 `#334155` 等旧冷色系值（非预设定义处） | ❌ **冷色残留**（P-02 / P-04） | 改暖色 Token |
| 切换主题后 `success/warning/danger/info` 或**紧急红**发生变化 | ❌ **违反 PRD A1-F06 H2** | 立即修 |

> **扫描命令（区分两类）**：
> ```bash
> # ① 预设定义处（合规白名单）：settings.html 的 PRESETS 段
> sed -n '220,244p' prototype/settings.html | grep -nE "#[0-9A-Fa-f]{6}"
> # ② 其余位置的冷色（应仅剩 tokens.css 语义色与 common.css info-light）
> grep -rnE "#(F1F5F9|0F172A|E2E8F0|334155|1E293B)" prototype/ --include="*.html" --include="*.css" --include="*.js" \
>   | grep -v "assets/tokens.css"
> ```
>
> **⑤ 与 A1-F06-5「恢复默认」的关系**：恢复默认 = 回 `lubon` 预设（品牌红 + 标准密度 + 标准圆角），**只清 `ui_style`，不清 `user_override`（布局覆盖）**（PRD A1-F06-5）。**禁止**在恢复默认时重置语义色（本就未变）或清空布局。

#### 2.1.2.2 🔴 P-21【P0·已运行时确证】主题色「双轨脱钩」——A1-F06 在 v2 页面实际不生效

> **本节不是设计规则，而是把「已确证的实现缺陷 + 可复现的验证方法」固化在规范内**，供走查/修复共用，避免重复论证。
> 上游问题编号：**P-21（P0）**，登记于 `outputs/核查/00-事实基线.md` §6。

**缺陷机理（三段式）**

| 段 | 事实 | 证据 |
| --- | --- | --- |
| ① 两条轨是**镜像**（初始同值） | `--accent: #C8161D` ← tokens.css:30；`--bmp-color-primary: var(--accent)` ← tokens.css:59 | `prototype/assets/tokens.css:30,59` |
| ② 主题覆写**只写第二轨** | `settings.html` 的 `applyStyle()` 注入 `:root{--bmp-color-primary:…;--bmp-color-primary-light:…;--bmp-color-primary-dark:…;--density-*;--bmp-radius-*}` —— **完全不写 `--accent`** | `prototype/settings.html:262-285` |
| ③ 覆写后**两轨脱钩** | 运行时实测：覆写靛蓝 → `--accent` 仍为麓邦红、`--bmp-color-primary` 变靛蓝 | 下方可复现命令 A |

**实测增量证据（本规范独立复现，比 §6 原记录更强）**

| # | 证据 | **本规范实测值** | 说明 |
| --- | --- | --- | --- |
| 1 | **v2 家族对第二轨的引用数** | `home-v2.html` = **0**；`mobile/home-v2.html` = **0**；`login.html` = **0** | 三个 v2 页面**完全不引用 `--bmp-color-primary`**（它们分别用 `--accent` 33 / 34 / 15 次），**主题覆写对它们 100% 无效** |
| 2 | **自带内联 `:root{--accent}` 的页面** | `home-v2.html:31`、`login.html:33`、`mobile/home-v2.html:30` | 三页**自带 `--accent` 定义**，直接绕开 `tokens.css` |
| 3 | **跨端同步落地度** | `grep -rl "bmp_ui_style" prototype/` = **1**（仅 `settings.html`） | PRD「跨端同步」**未落地**——其他页面不读已保存风格 |
| 4 | **两轨引用量（口径已校准）** | 排除 `style-samples/`（非产品页）：`--accent` **112** 处 / `--bmp-color-primary` **145** 处（其中 `canvas-formcard-preview.html` 占 44 处） | 两轨**各占约一半**，故影响面约「门户/移动/登录 + 管理端各一部分」 |

> **⚠ 口径提示（与 §6 原记录不同，以本节为准）**：§6 记为「108 / 125」。本规范复测为 **`--accent` 112 / `--bmp-color-primary` 145**（排除 `style-samples/`）。差异原因：§6 计数疑似按「引用点」去重或未含 `assets/*.css`；本规范按**全文出现次数**计。**两者结论一致（两轨约各半、v2 全走 accent），不影响 P0 定性**；引用数字时请注明口径。

**违反条款**

| 违反 | 依据 |
| --- | --- |
| 「切换后立即全局生效且刷新保持」 | PRD §6.1.4 A1-F06 / A1-F06-4 验收标准 |
| 「主按钮 / 链接 / 选中态同步变色」 | PRD §6.1.6 A1-F06-1 验收标准 |
| 「主题色跨端同步」 | PRD §6.1.6 跨端规则 |
| 「紧急语义红不随主题变」（反向：**当前是紧急红不跟随主题**，但**品牌视觉也不跟随**，两头都不满足） | PRD A1-F06 H2 |

**可复现验证命令（【固化·走查直接复用】）**

> 零 npm 依赖，仅需 Chrome / Edge。**在仓库根目录执行**：

```bash
# ---- P-21 验证（A1-F06 主题色双轨脱钩）----
TOKENS="$(cygpath -m "$(pwd)")/prototype/assets/tokens.css"
PROBE="$(mktemp -d)/p21.html"
BROWSER=""
for b in "/c/Program Files/Google/Chrome/Application/chrome.exe" \
         "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" \
         "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; do
  [ -f "$b" ] && BROWSER="$b" && break
done
[ -z "$BROWSER" ] && BROWSER="$(command -v google-chrome || command -v chromium)"
{
  printf '<!DOCTYPE html><meta charset="UTF-8">\n'
  printf '<link rel="stylesheet" href="file:///%s">\n<style id="ov"></style>\n' "$TOKENS"
  printf '<pre id="out">pending</pre><script>\n'
  printf 'document.getElementById("ov").textContent=":root{--bmp-color-primary:#4F46E5;--bmp-color-primary-light:#EEF2FF;--bmp-color-primary-dark:#3730A3;}";\n'
  printf 'addEventListener("load",function(){var c=getComputedStyle(document.documentElement);var v=function(n){return c.getPropertyValue(n).trim()};var a=v("--accent"),p=v("--bmp-color-primary");document.getElementById("out").textContent="RUNTIME_PROBE accent="+(a||"(EMPTY)")+" primary="+(p||"(EMPTY)")+" EQUIVALENT="+(a===p?"YES":"NO")});\n'
  printf '</script>\n'
} > "$PROBE"
"$BROWSER" --headless --disable-gpu --no-sandbox --virtual-time-budget=3000 \
  --dump-dom "file:///$(cygpath -m "$PROBE")" 2>/dev/null \
  | sed -n 's/.*<pre id="out">\(.*\)<\/pre>.*/\1/p'
```

**期望输出（当前状态 = FAIL）**

```
RUNTIME_PROBE accent=#C8161D primary=#4F46E5 EQUIVALENT=NO
```

| 字段 | 含义 | 判定 |
| --- | --- | --- |
| `accent=#C8161D` | 覆写靛蓝后 `--accent` **未变** | ❌ |
| `primary=#4F46E5` | `--bmp-color-primary` 已变靛蓝 | ✅（第二轨正常） |
| `EQUIVALENT=NO` | **两轨脱钩** | ❌ **FAIL** |
| **通过条件** | 修复后应输出 `EQUIVALENT=YES`（或 `accent=primary=靛蓝`） | 修复验收断言 |

> **健壮性说明**：本命令已实测通过（Windows + Git Bash + Chrome headless）。若浏览器未找到（非 Windows/无 Chrome），命令会以空 `BROWSER` 报错 —— **不静默通过**，避免「假绿」。若在 CI（Linux）执行，需把 `cygpath -m` 换成 `realpath`。

**附加静态证据命令（无需浏览器，可先跑）**

```bash
# 证据 1：v2 家族对第二轨引用数应为 0（主题覆写对它们无效）
for f in prototype/home-v2.html prototype/mobile/home-v2.html prototype/login.html; do
  printf '%-34s accent=%-4s primary=%s\n' "$f" \
    "$(grep -c 'var(--accent)' "$f")" "$(grep -c 'var(--bmp-color-primary)' "$f")"
done
# 证据 2：自带内联 :root --accent 的页面（绕过 Token 轨）
grep -rn -- '--accent:' prototype/*.html prototype/mobile/*.html | grep -v tokens.css
# 证据 3：跨端同步落地度（应 >1 才叫已落地）
grep -rl "bmp_ui_style" prototype/ | wc -l
```

**两条修复路径（【需产品/架构裁定，不可单方选路】）**

| 路径 | 做法 | 代价 | 与 PRD 的关系 |
| --- | --- | --- | --- |
| **A（推荐·兼容双轨制）** | ① `applyStyle()` 覆写串**同时写 `--accent` / `--accent-warm`**（主题色轨一并覆写）；② 抽出统一 `applyUiStyle()` 放 `assets/common.js`（或 `mock.js`），**每页引入**；③ 移除 `home-v2.html:31` / `login.html:33` / `mobile/home-v2.html:30` 的内联 `:root{--accent}`，改由 `tokens.css` 统一提供 | 需为 3 个 v2 页加样式应用入口 | ✅ 符合 PRD「全局生效 + 跨端同步」 |
| **B（收窄）** | 主题切换**仅作用于管理端**（管理端主要走 `--bmp-color-primary`），门户 v2 页保持麓邦红固定 | 门户用户无主题切换能力 | ❌ 与 PRD「全局生效」不符，**须改需求** |

> **⚠ 与 G-7 的联动（重要）**：路径 A 若同时覆写 `--accent`，则**「紧急语义红不随主题变」（H2）会再次被破坏** —— 因为 §2.1.3 要求紧急/超时/临期用品牌红且**恒定**。
> **正解**：路径 A 必须**配合 G-7** —— 覆写照写 `--accent`（供主操作/品牌视觉跟随主题），但**紧急类元素改绑独立的固定 Token `--bmp-color-urgent`**（不参与任何覆写）。这样：**品牌视觉跟随主题 ✅、紧急语义恒定 ✅、两轨不再脱钩 ✅**。
> **故修复顺序建议：先落 G-7（新增固定 Token），再落路径 A。** 否则 §2.1.3 的 17 处修复会改两遍（见 §A.5 P-01）。

**回写要求**：本项应回写 `麓邦业务中台产品PRD.md` §6.1.6（A1-F06 验收标准）与 UIUX §5.3 / §5.6 的实现说明。

#### 2.1.3 【强制】品牌红 vs danger 规则（5 条，主色为红后的硬约束）

| # | 规则 | 说明 |
| --- | --- | --- |
| 1 | **职责分离** | primary 深红（`#C8161D`）只用于**品牌与主操作**（实心按钮、导航选中、链接）；danger 亮红（`#F53F3F`）**只用于「错误与失败」语义**（错误文字/图标、浅红底提示条、高危实心按钮） |
| 2 | **形态区分** | 错误反馈一律用「**浅红底 `#FEF2F2` + 亮红字/边框**」形态，**禁止用实心品牌红表达错误**，避免与主按钮混淆 |
| 3 | **【核心】紧急 / 超时 / 临期 → 品牌红 `#C8161D`；错误 / 失败 → danger 亮红 `#F53F3F`** | 暖色体系下页面同时存在「品牌红（主操作）+ 亮红（错误）+ 暖橙（辅助）」，若「紧急/超时」再用 danger 亮红，会出现**三种红打架**——同一屏难以分辨「这是主按钮 / 这是危险 / 这是紧急」。故明确划分：<br>• **紧急 / 超时 / 临期 → 品牌红 `#C8161D`**（待办紧急圆点、超时文字「已超时 Xh」、时间轴「今天必须做」色条、Banner 紧急标签）<br>• **错误 / 失败 → danger 亮红 `#F53F3F`**（校验失败、提交失败、接口报错、降级卡错误标识）<br>• 该划分**不随主题色改变**（PRD A1-F06 H2），紧急语义色恒定 |
| 4 | **同屏规则** | 同一视图内实心品牌红按钮与 danger 元素同现时，两者明度差已由色值保证，**设计走查时逐页核验** |
| 5 | **大面积用红克制** | 品牌红仅点缀使用（顶栏 Logo、主按钮、选中态），页面背景保持中性色（白画布 / 暖白区块），避免红色焦虑感 |

**为什么「三种红打架」必须禁止（认知解释）**：红色承担「注意力最高优先级」语义。当同一屏出现三种红且语义各异时，人眼无法通过色相区分「主按钮（要做的事）」「危险（错误）」「紧急（时间压力）」，注意力资源被平均分配 → **红色不再警示**，反而增加误点风险。因此把「红色家族」收敛为**两支**：品牌红（含紧急）+ danger 亮红（仅错误），第三支用**暖橙 `#dd5b00`** 承接「本周 / 次级紧迫」。

**反例（当前原型实际误用，必须修）——【精确修复面，勿扩大】**

> **⚠ 这是「跨页不一致」，不是全局设计问题。** 同类「紧急度」视觉在原型内**有两套实现**：一套**已正确**用 `var(--accent)` 品牌红（`home-v2.html`、`mobile/home-v2.html`），另一套**误用** `--bmp-color-danger`（`todos.html`、`approval.html`）。修复时**只改有误的那几处**，**禁止**把已正确的品牌红改成 danger，也**禁止**把错误/失败场景一起改掉。

**（A）紧急度色条 / 圆点（误用，必须改品牌红）**

| 位置 | 现状代码 | 问题 | 应改为 | 级别 |
| --- | --- | --- | --- | --- |
| `prototype/todos.html:20` | `.todo-card.u2 { border-left-color: var(--bmp-color-danger); }` | 待办卡**紧急度**色条用 danger 亮红表达「紧急」，属**语义误用**（紧急≠错误） | `var(--accent)` | **P0** |
| `prototype/approval.html:24` | `.ac-card.u2 { border-left-color: var(--bmp-color-danger); }` | 同上（审批卡紧急度色条） | `var(--accent)` | **P0** |
| `prototype/assets/common.css:55` | `.dot-urgent { background: var(--bmp-color-danger); }` | 待办**紧急度圆点**用 danger 亮红 | `var(--accent)` | P1（本规范新增发现） |
| `prototype/assets/common.css:116` | `.badge-n { … background: var(--bmp-color-danger); }` | **未读角标**用 danger 亮红；未读=「需注意」非「错误」 | `var(--accent)` | P1（本规范新增发现） |

**（B）超时 / 临期文字（误用 `.text-danger`，必须改品牌红）**

> 【强制】超时（`已超时 Xh`）与临期（`剩余 X 小时`）**属时间压力语义**，一律品牌红。**当前全部误用 `.text-danger`（等价 `--bmp-color-danger`）**。

| 位置 | 现状 | 应改为 |
| --- | --- | --- |
| `prototype/todos.html:99` | `⏰ 已超时 {n} 小时` 用 `.text-danger fw-600` | `.text-primary fw-600`（品牌红） |
| `prototype/todos.html:101` | `⏰ 剩余 {n} 小时` 用 `.text-danger fw-600` | `.text-primary fw-600` |
| `prototype/approval.html:127` | `⏰ 已超时 {n} 小时` 用 `.text-danger fw-600` | `.text-primary fw-600` |
| `prototype/approval.html:129` | `⏰ 剩余 {n} 小时` 用 `.text-danger fw-600` | `.text-primary fw-600` |
| `prototype/approval.html:216` | 详情「紧急度」行 `已超时 {n}h` 用 `.text-danger` | `.text-primary` |
| `prototype/home.html:152` | `已超时 {n}h` 用 `.text-danger fw-600` | `.text-primary fw-600` |
| `prototype/home.html:153` | `剩余 {n}小时`（临期 ≤4h）用 `.text-danger` | `.text-primary` |
| `prototype/mobile/index.html:234` | `⏰ 已超时 {n} 小时` 用 `.fs-12 text-danger fw-600` | 品牌红 |
| `prototype/mobile/index.html:235` | `⏰ 剩余 {n} 小时` 用 `.fs-12 text-danger fw-600` | 品牌红 |
| `prototype/mobile/index.html:324` | 详情「时限 · 已超时」用 `.text-danger fw-600` | 品牌红 |
| `prototype/mobile/index.html:325` | 详情「剩余时限」用 `.text-danger fw-600` | 品牌红 |
| `prototype/mobile/index.html:385` | `⏰ 剩余 {n} 小时` 用 `.fs-12 text-danger fw-600` | 品牌红 |

> **落地建议**：`common.css:554` 的 `.text-danger { color: var(--bmp-color-danger); }` **保留**（错误场景仍用）；**新增** `.text-primary { color: var(--accent); }`（已在 `common.css:554` 同行为 `var(--bmp-color-primary)`，两者等价）后，把上表 12 处超时/临期文字**逐处替换类名**。
>
> **❗ 勿误改清单（这些 `.text-danger` 是错误语义，必须保留）**：
> - `prototype/mobile/index.html:304` —— 驳回意见「* 必填星标」（表单约束，同 U-3 裁定）
> - 其余 `.text-danger` 出现在校验错误、提交失败、账号锁定等场景，**均不动**

**（C）公告「置顶」标签误用 danger（必须改品牌红）**

| 位置 | 现状代码 | 问题 | 应改为 |
| --- | --- | --- | --- |
| `prototype/assets/pages-config.js:3269-3270` | `const tagBg = n.top ? "var(--bmp-color-danger-light)" : "var(--bmp-color-primary-light)";`<br>`const tagFg = n.top ? "var(--bmp-color-danger)" : "var(--bmp-color-primary)";` | 公告**置顶=紧急**标记用 danger 表达「紧急」；且导致「置顶」与「通知」两类标签**在非置顶时同为品牌红、置顶时跳到亮红**，色相跳变无规律 | 置顶（紧急）：`tagBg = var(--bmp-color-primary-light)`、`tagFg = var(--accent)`；非置顶（通知）：保持品牌红浅底 + 品牌红字，**两者靠「紧急」文字标签 + 图标区分，不靠换色** |

> 依据：PRD §6.1.5 A1-F07「Banner 内部不得重复…**紧急=品牌红**（不随主题色改变）」——「紧急」标签的色只能是品牌红，**不是 danger**。

**（D）已正确实现（勿误改，作为修复参照）**

| 位置 | 现状代码 | 说明 |
| --- | --- | --- |
| `prototype/home-v2.html:215` | `.brief-card::before { … background: var(--accent); }` | AI 简报卡左侧色条 = 品牌红 ✅ |
| `prototype/home-v2.html:315-316` | `.grp-today .g-title { color: var(--accent); }`<br>`.grp-today .g-dot { background: var(--accent); box-shadow: 0 0 0 4px rgba(200,22,29,.12); }` | 时间轴「今天必须做」标题 + 圆点 = 品牌红 ✅ |
| `prototype/home-v2.html:326` | `.grp-today .row { border-left: 3px solid var(--accent); … }` | 「今天必须做」行色条 = 品牌红 ✅ |
| `prototype/mobile/home-v2.html:496` | `.gd-now { background: var(--accent); }` | 移动端「此刻」分组圆点 = 品牌红 ✅ |
| `prototype/mobile/home-v2.html:526` | `.r-dot-urgent { background: var(--accent); }` | 移动端紧急行圆点 = 品牌红 ✅ |

> **结论**：修复面 = **A 组 4 处 + B 组 12 处 + C 组 1 处 = 17 处**，全部改为品牌红系；D 组 5 处**已合规，勿动**。
>
> **D 组更强的证据**：`home-v2.html` 与 `mobile/home-v2.html` **全文 `color-danger` 命中数为 0**（`grep -c "color-danger"` → 0 / 0），即这两个文件对「紧急度」的表达**整体一致地使用品牌红**，不存在混合写法。故这是**跨页不一致**（`todos.html`/`approval.html`/`home.html`/`mobile/index.html` 一侧用错），**不是全局设计问题**——修复时**只需改有误的 17 处**，切勿反向把 `home-v2` 系列改成 danger。
> **扫描命令（复核用）**：
> ```bash
> # 找紧急度误用 danger（A 组）
> grep -rn "u2.*color-danger\|color-danger.*u2" prototype/todos.html prototype/approval.html
> grep -n "dot-urgent\|badge-n" prototype/assets/common.css
> # 找超时/临期误用 text-danger（B 组，人工比对是否为超时/临期语境）
> grep -rn "text-danger" prototype/todos.html prototype/approval.html prototype/home.html prototype/mobile/index.html
> # 找置顶标签误用（C 组）
> grep -n "n.top" prototype/assets/pages-config.js
> ```

> **反向确认（正确用法，勿误改）**：`.tag-danger`（`common.css:49`）、`.btn-danger`（`common.css:34`）、`.field.has-error .input`（`common.css:73`）、`.net-banner`（`common.css:183`）、`.wf-canvas-vitem.error`（`common.css:478`）、`.wf-check-item.fail`（`common.css:367`）、`.wf-canvas-node.bad`（`common.css:423`）—— 这些**均为「错误/失败」语义，用 danger 亮红正确**。
>
> **必填星标裁定（U-3）**：`.field > label .req`（`common.css:62`）用 danger 亮红。**本规范裁定保留 danger 亮红**——理由：必填星标属「表单约束提示」，提交失败时与错误提示**同屏同色系**，色相一致可降低认知成本；且它**不属于**「紧急/超时/临期」三类紧急语义。

#### 2.1.4 语义色映射表（全站唯一口径）

| 业务语义 | 用色 | Token | 出现位置（示例） |
| --- | --- | --- | --- |
| 待办紧迫度 · 紧急 | 品牌红 `#C8161D` | `--accent` / `--bmp-color-primary` | 待办卡色条、紧急圆点、时间轴首组色条、Banner 紧急标签 |
| 待办紧迫度 · 重要 | 警告橙 `#F59E0B` | `--bmp-color-warning` | 待办卡 u1 色条、重要圆点 |
| 待办紧迫度 · 普通 | 中性 info `#64748B` | `--bmp-color-info` | 待办卡 u0 色条、普通圆点 |
| 超时 / 临期 | 品牌红 `#C8161D` | `--accent` | 「已超时 2小时」「剩余 3 小时」文字 |
| 本周待办（次级紧迫） | 暖橙 `#dd5b00` | `--accent-warm` | 时间轴第二组色条、`.btn-primary:hover` |
| 成功 / 已通过 / 启用 | 绿 `#16A34A` | `--bmp-color-success` | 状态标签、步骤条 done |
| 警告 / 待审核 / 停用中灰 | 橙 `#F59E0B` | `--bmp-color-warning` | 只读横幅、状态标签 |
| **错误 / 失败 / 锁定** | **亮红 `#F53F3F`** | `--bmp-color-danger` | 校验失败、提交失败、接口报错、账号锁定 |
| 停用 / 未激活 / 中性 | 中性 `#64748B` | `--bmp-color-info` | 状态标签 info |
| **运营指标 · 上升** | **绿** `#16A34A` | `--bmp-color-success` | 看板环比 `▲`、完成率上升、活跃度上升 |
| **运营指标 · 下降** | **红** `#F53F3F` | `--bmp-color-danger` | 看板环比 `▼`、完成率下降、接入异常告警 |
| **行情类 · 上涨** | **红** `#F53F3F`（中国市场惯例） | `--bmp-color-danger` | 见 §2.1.4.1（预留，V1.0 无此场景） |
| **行情类 · 下跌** | **绿** `#16A34A`（中国市场惯例） | `--bmp-color-success` | 见 §2.1.4.1（预留，V1.0 无此场景） |
| 渠道 · 钉钉 | `#1677FF` | `--bmp-color-dingtalk` | 消息记录渠道标签 |
| 渠道 · 企微 | `#07C160` | `--bmp-color-wecom` | 消息记录渠道标签 |
| 账号状态 · 锁定 | 亮红 | `--bmp-color-danger` | 账号列表状态标签 |

#### 2.1.4.1 【强制】红 / 绿语义场景区分（两套惯例，不可混用）

> **问题背景**：全站大量使用「红/绿」表达「好/坏」，但**中国市场存在两套相反惯例**。若不显式区分，走查时会把**正确实现判为缺陷**（或反之），也会让前端在新增场景时选错色。

| # | 场景类别 | 惯例 | 红 = | 绿 = | 依据 |
| --- | --- | --- | --- | --- | --- |
| **一** | **金融行情类**（股票 / 基金 / 涨跌 / 净值 / 指数） | **中国市场惯例：涨红跌绿** | **上涨（喜）** | **下跌（忧）** | 中国大陆证券/基金市场约定俗成；本项目 **V1.0/V1.5 无此业务场景**，本条为**预留规则**，防止未来接入金融数据时误用 |
| **二** | **产品运营指标类**（调用量环比 / 活跃应用排名 / 中台能力使用分布 / 完成率 / 接入健康度） | **升绿降红** | **下降（异常/退化）** | **上升（向好）** | `prototype/assets/pages-config.js:3364` `aaMom()` 实现；PRD §6.1.9 A1-F09 运营看板 |

**【强制】判定规则**：

1. **先判类别，再选色**——问一句「这个数字的『好』是涨还是跌？」；
2. **行情类**（价格/净值/指数）：红 = 涨，绿 = 跌；
3. **运营指标类**（调用量/活跃度/完成率/成功率）：红 = 降（坏），绿 = 升（好）；
4. **禁止在两套惯例之间「混用同一张图 / 同一个表格」**——同一视图内只允许一套惯例；
5. **跨类混排时必须显式标注**（表头或图例写「涨红跌绿 / 升绿降红」），否则用户会误读；
6. 语义色固定不变（`success`/`danger` 不随主题色变，PRD A1-F06 H2），本规则**只约束「何时用哪个语义色」**。

**当前实现确认（✅ 正确，勿误判为缺陷）**

| 位置 | 现状代码 | 结论 |
| --- | --- | --- |
| `prototype/assets/pages-config.js:3364-3369` | `function aaMom(v) { const up = v >= 0; const color = up ? "var(--bmp-color-success)" : "var(--bmp-color-danger)"; … }` | **运营指标 = 升绿降红，实现正确 ✅** |
| `prototype/assets/pages-config.js:3366`（注释） | `/* 环比标签：运营指标用语义色表达好坏（升=success 绿，降=danger 红） */` | 注释已写明口径 ✅ |
| `prototype/assets/pages-config.js:313,360,380` | `aaMom(kpi.callsMom)` / `<td>${aaMom(r.mom)}</td>` / `aaMom(a.mom)` | 三处调用均为**运营指标**场景 ✅ |

> **⚠ 易误判点 B（必读）**：`pages-config.js:3364-3369` 的 `aaMom()` **不是**「danger 误用」，而是**运营指标类的正确实现**。走查 Token 一致性时，**不得**把 `aaMom` 的 `var(--bmp-color-danger)` 计入 P-01 同类问题——它表达的是「指标下降 = 坏」，与「紧急/超时」无关。
>
> **区分口诀**：同一处 `danger`，**「时间压力」→ 改品牌红；「指标/结果变差」→ 保留 danger**。

**扫描命令（复核用）**：

```bash
# ① 确认全站无金融行情场景（V1.0 应为 0 命中）
grep -rniE "涨|跌|行情|股价|基金|净值" prototype/ --include="*.html" --include="*.js" | grep -v style-samples
# → 实测：0 命中（故「涨红跌绿」为预留规则，无现存实现需要核验）

# ② 确认运营指标环比实现（应为 aaMom 单点，升绿降红）
grep -rn "aaMom" prototype/assets/pages-config.js
# → 实测：定义 1 处（:3364）+ 调用 3 处（:313,360,380）
```

#### 2.1.5 主题色预设（A1-F06-1，用户可选）

> **【强制】风格预设色 ≠ 设计基准色。** 下表为 **A1-F06 授权范围内的 5 档主题预设**，仅替换 `primary` / `primary-light` / `primary-dark` 三档；**语义色、紧急语义红、渠道品牌色恒不变**（PRD A1-F06 H2）。

| # | 预设 | primary | primary-light | primary-dark | 落地证据 |
| --- | --- | --- | --- | --- | --- |
| 1 | **麓邦红（默认）** | `#C8161D` | `#FBECEC` | `#A51218` | `settings.html:223`、PRD §6.1.4 |
| 2 | 靛蓝 | `#4F46E5` | `#EEF2FF` | `#3730A3` | `settings.html:224` |
| 3 | 石墨灰 | `#334155` | `#F1F5F9` | `#1E293B` | `settings.html:225` ⚠ **见 §2.1.2「易误判点 A」：非冷色残留** |
| 4 | 暖橙 | `#DD5B00` | `#FFF4EC` | `#B34700` | `settings.html:226` |
| 5 | 青绿 | `#0F766E` | `#ECFDF5` | `#0B5C56` | `settings.html:227` |

> **口径差异登记（不可自行改口径）**：PRD §6.1.4 文本描述为「靛蓝 `#2F6FEB` / 石墨灰 `#4A4A47` / 暖橙 `#DD5B00` / 青竹绿 `#1F7A5A`」，**与原型 `settings.html:222-228` 的实测值不一致**（原型为 `#4F46E5` / `#334155` / `#DD5B00` / `#0F766E`）。**本规范以原型落地值为准**（原型是实现基线），差异记录于附 A 追溯矩阵，交产品裁定。

#### 2.1.6 内容密度预设（A1-F06-2）

> **【强制】只改行高 / 内边距 / 区块间距 / 表格行高；字号档位、栅格、栏宽、图标尺寸不变。**

| 档 | 行高 | 卡片内边距 | 表格行高 | 备注 | 依据 |
| --- | --- | --- | --- | --- | --- |
| 宽松 | 1.7 | 20px | 52px | —— | PRD §6.1.4 |
| **标准（默认）** | 1.5 | 16px | 44px | 与 §2.9 `--bmp-space-*` 基准一致 | PRD §6.1.4 |
| 紧凑 | 1.35 | 12px | 36px | —— | PRD §6.1.4 |

> **实现备注**：原型 `settings.html:231-235` 的密度实现为 `gap/padY/line`（12/10/22 三档），是标准的**简化模拟**；正式实现应按上表 1.7/1.5/1.35 + 20/16/12 + 52/44/36 落地，通过 `data-density` 属性覆写间距类 Token。
> **范围**：**建议仅门户 PC + 移动生效，管理控制台固定标准档**（保护表格可读性）—— PRD §10.5 #6，**待确认（U-2）**。

#### 2.1.7 圆角预设（A1-F06-3）

| 档 | radius-sm | radius-md | radius-lg | 备注 |
| --- | --- | --- | --- | --- |
| 直角 | 4px | 4px | 6px | PRD §6.1.4 |
| **标准（默认）** | 4px | 8px | 12px | 与 §2.9 一致 |
| 圆润 | 6px | 12px | 16px | PRD §6.1.4 |
| **`radius-pill`** | **9999px（三档不变）** | | | 胶囊形态恒定 |

> **实现备注**：原型 `settings.html:238-242` 为 `sharp(2/4/4) / standard(4/8/12) / round(8/12/16)`，与 PRD 的 `直角(4/4/6)` 有差异，**标准档一致**。以 PRD §6.1.4 为准修直角档，差异记入附 A。

### 2.2 字体排版

#### 2.2.1 字体栈

| Token | 值 | 用途 |
| --- | --- | --- |
| `--font`（第一轨） | **`Inter, -apple-system, "PingFang SC", sans-serif`** | 全局 |
| `--bmp-font-family` | `var(--font)` | 兼容别名 |
| 数字 | `font-variant-numeric: tabular-nums`（在 `body` 上全局开启，见 `common.css:10`） | 表格数字对齐 |

> **【强制】** 字体栈**禁止**在组件内另行声明；禁止引入外链字体（零依赖硬约束，事实基线 §5.1）。等宽场景（JSON / 代码 diff）用 `"SFMono-Regular", Consolas, monospace`（`common.css:486,558`），**仅限代码块**。

#### 2.2.2 字号阶梯（6 档，不可增删）

| Token | 规格（weight/size/line-height） | 落地行 | 用途 |
| --- | --- | --- | --- |
| `--bmp-font-h1` | `600 24px/32px` | tokens.css:89 | 页面大标题（**少用**） |
| `--bmp-font-h2` | `600 20px/28px` | tokens.css:90 | 模块标题 |
| `--bmp-font-h3` | `600 16px/24px` | tokens.css:91 | 卡片标题、弹窗标题 |
| `--bmp-font-body` | `400 14px/22px` | tokens.css:92 | 正文（**默认**） |
| `--bmp-font-caption` | `400 12px/18px` | tokens.css:93 | 辅助说明、时间戳 |
| `--bmp-font-number-lg` | `600 28px/36px` | tokens.css:94 | 数据卡大数字 |

> **【强制】** 使用 `font:` 简写注入（`font: var(--bmp-font-body)`），**不得**拆成 `font-size` / `line-height` 单写（避免漂移）。
> **例外（已存在的越界，需收敛）**：全站存在 **13px / 15px / 11px** 等阶梯外字号（如 `common.css:92` 表头 13px、`:117` 角标 11px、`todos.html:26` 卡片标题 15px、`home-v2.html` 时间轴 15px/44px 行）。**收敛口径**：13px → 12px（caption）或 14px（body）；15px → 14px 或 16px；11px → 12px。**仅时间轴权重表的 16/15/14px 三档经 UIUX §5.3 授权保留**。

#### 2.2.3 【强制】字距硬规则

> **全站唯一正字距 = 12px 徽标 `+0.125px`。**

| 层级 | 字距 | 说明 |
| --- | --- | --- |
| 大标题（H1 / 品牌区 slogan / 页面标题） | `-.4px ~ -.5px`（超大标题可到 `-1.5px`） | **负字距**——大字收紧，是 Notion 紧凑感来源 |
| 区块标题（H2/H3、分组标题） | `-.25px` | 轻度收紧 |
| 卡片小标题 / 应用名 | `-.2px` | 微收紧 |
| **徽标 / 角标 / 计数（badge）** | **`12px / 600 / letter-spacing: +0.125px`** | **系统内唯一的「正字距」**——小字微放开，避免拥挤 |

> **硬规则**：**字号越大字距越负、字号越小（尤其 12px 徽标）用正字距**。除徽标这一类 12px 徽章外，**全站不再出现正字距**；**禁止标题使用正字距或徽标使用负字距**。
>
> **落地证据**：`sample-notion.html` 中 `.kbd` / `.badge-ai` / `.sec-note` 均为 `+0.125px`；`h1` 为 `-1.5px`，`h2/h3` 为 `-.25px`。
>
> **反例（必须修）**：
> | 位置 | 现状 | 问题 | 应改为 |
> | --- | --- | --- | --- |
> | `assets/common.css:19` | `h1, .h1 { letter-spacing: -.5px; }` | 与 UIUX §2.2「大标题 -.4~-.5px」**一致**（✅ 合规） | —— |
> | `assets/common.css:20` | `h2, .h2 { letter-spacing: -.3px; }` | UIUX §2.2 区块标题规定 `-.25px`，`-.3px` 属**偏离** | `-.25px` |
> | `assets/common.css:21` | `h3, .h3 { letter-spacing: -.2px; }` | 卡片小标题 `-.2px`（✅ 合规） | —— |
> | `assets/common.css:254` | `.menu-group .g-title { … letter-spacing: .04em; }` | **正字距** 且非徽标（管理端菜单分组标题） | **删除**（或改用 caption 默认字距）；若确需区分，改 `-.2px` 并靠颜色区分 |
> | `home-v2.html:157`（`.badge-*` 类） | 徽标 `+0.125px` | ✅ 合规 | —— |
>
> **禁止清单**：① 标题出现正字距；② 徽标出现负字距；③ 除 12px 徽标外任何元素使用 `letter-spacing` 正值；④ 用 `em` 作字距单位（统一 `px`，除已存在的 `common.css:254` 需清理）。

### 2.3 间距与栅格

#### 2.3.1 间距阶梯（4px 基准）

| Token | 值 | 典型用途 | 落地行 |
| --- | --- | --- | --- |
| `--bmp-space-1` | `4px` | 图标与文字间隙、密排 | tokens.css:97 |
| `--bmp-space-2` | `8px` | 按钮组内间隙、标签间距 | tokens.css:97 |
| `--bmp-space-3` | `12px` | 表单字段间、卡片头下间距 | tokens.css:97 |
| `--bmp-space-4` | `16px` | **卡片内边距（默认）**、区块间距 | tokens.css:98 |
| `--bmp-space-5` | `20px` | 弹窗内边距 | tokens.css:98 |
| `--bmp-space-6` | `24px` | **页面边距** | tokens.css:98 |
| `--bmp-space-8` | `32px` | 大区块分隔、顶栏元素间距 | tokens.css:99 |

**【强制】** 间距只能取上表 7 档（4/8/12/16/20/24/32）；**禁止** `5px` / `6px` / `10px` / `14px` / `18px` 等阶梯外值。**例外（已存在的越界，需收敛）**：`common.css:34` 按钮 `gap: 6px`、`common.css:290` 批量条 `padding: 10px 20px`、`todos.html:16` 卡片 `padding: 14px 16px`、`common.css:92` 表格 `padding: 10px 12px`。**收敛口径**：6→8、10→8 或 12、14→12 或 16。

- 卡片内边距 **16px**；区块间距 **16px**；页面边距 **24px**（`common.css:243` `.portal-main { padding: var(--bmp-space-6) }` ✅ 合规）。

#### 2.3.2 栅格

| 项 | 规格 | 依据 |
| --- | --- | --- |
| 栅格系统 | **24 栅格**，gutter **16px** | UIUX §2.3 |
| 工作台卡片最小宽度 | **6 栅格（1/4 屏）** | UIUX §2.3 |
| **v2 三栏（左 8 / 中弹性 / 右 8）** | **三个独立 24 栅格容器**（`LayoutGrid` 递归），**跨栏禁拖拽**（栏宽由模板层决定），栏内可拖拽/显隐/调栅格 | UIUX §2.3、§5.3 |
| 管理端列表页 | 筛选区 4 列网格（`common.css:279` `grid-template-columns: repeat(4, 1fr)`） | UIUX §4.1 |
| 左树右表 | 左树 **280px 可折叠** + 右表（原型 `console-side` 实测 232px，**差异见下**） | UIUX §4.1 |
| 工作台内容区 | `max-width: 1440px` 居中（`common.css:243`） | UIUX §4.1 |

> **⚠ 差异登记**：UIUX §4.1 规定左树 **280px**，实测 `tokens.css:114` 与 `common.css:248` 为 `--bmp-console-menu-w: 232px`。**本规范以落地值 232px 为准**（管理端实际渲染），UIUX 280px 视为规划值。若后续需对齐，改 `--bmp-console-menu-w` 一处即可。

### 2.4 圆角与阴影

#### 2.4.1 圆角

| Token | 值 | 用途 | 落地行 |
| --- | --- | --- | --- |
| `--bmp-radius-sm` | `4px` | 小元件（标签内、菜单项、步骤点） | tokens.css:102 |
| `--bmp-radius-md` | `8px` | **卡片（Notion 主圆角）**、抽屉菜单、Toast | tokens.css:103 |
| `--bmp-radius-lg` | `12px` | 弹窗 | tokens.css:104 |
| `--bmp-radius-btn` | `8px` | 按钮（**由原 4px 调整为 8px**，贴近 Notion 圆润） | tokens.css:105 |
| `--r-card`（第一轨） | `8px` | 卡片圆角（=`--bmp-radius-md`） | tokens.css:47 |
| `--r-pill`（第一轨） | `9999px` | **胶囊**：标签 / 搜索框 / 头像 / Tab 项 / 顶栏导航项 | tokens.css:48 |

> **【强制】** 胶囊形态（`9999px`）三档主题/圆角预设下**恒定不变**（PRD A1-F06-3）。
> **缺项提醒**：UIUX §2.3 写 `--bmp-radius-pill 9999px`，但 **`tokens.css` 未定义该别名**（实测 `grep "radius-pill" assets/tokens.css` 无结果）。落地统一用 `--r-pill`；如需别名轨补齐，见 §2.9 缺项表。

#### 2.4.2 【强制】阴影哲学（Notion 多层低透明度）

| Token | 值 | 用途 | 落地行 |
| --- | --- | --- | --- |
| `--bmp-shadow-1` | `rgba(0,0,0,.04) 0 1px 3px, rgba(0,0,0,.02) 0 1px 2px` | 卡片静止 | tokens.css:108 |
| `--bmp-shadow-2`（=`--shadow-soft`） | `rgba(0,0,0,.04) 0 4px 18px, rgba(0,0,0,.027) 0 2px 8px, rgba(0,0,0,.02) 0 .8px 3px` | 卡片悬浮 / 下拉 | tokens.css:109、:37 |
| `--bmp-shadow-3`（=`--shadow-lift`） | `rgba(0,0,0,.05) 0 8px 28px, rgba(0,0,0,.035) 0 3px 10px, rgba(0,0,0,.025) 0 1px 4px` | 弹窗 / 抽屉 / 浮层 | tokens.css:110、:41 |

**Notion 阴影哲学（三条）**：

1. **多层、极低透明度、大模糊半径** —— 营造「纸片轻浮」而非「厚切投影」；三档累计不透明度 **≤0.05**（实测算术和 0.04+0.02=0.06、0.04+0.027+0.02=0.087、0.05+0.035+0.025=0.11，**注意：这是「叠加多层」而非单层总不透明度**，视觉等效不透明度远低于算术和）；
2. **禁止单层高透明度阴影** —— 如 `0 12px 32px rgba(15,23,42,.16)` 为**旧冷色写法，已废弃**（实测仍存在于 `mobile/home-v2.html:75` 手机壳 `box-shadow: 0 12px 32px rgba(15, 23, 42, .16)`，属 P1 待修）；
3. **静止靠细边框 `1px solid rgba(0,0,0,.1)`，悬浮加淡影** —— 卡片/区块/输入/顶栏分隔**优先用细边框界定**，阴影只作悬浮时的轻量补充；**禁止用重阴影替代边框**。

**反例（当前原型实际误用）**：

| 位置 | 现状 | 问题 | 应改为 |
| --- | --- | --- | --- |
| `mobile/home-v2.html:75` | `box-shadow: 0 12px 32px rgba(15, 23, 42, .16)` | 单层高透明度 + 冷色（`rgb(15,23,42)` 是旧冷色 navy 基色） | `var(--shadow-lift)` 或 `var(--bmp-shadow-3)` |
| `common.css:79`（`.card`） | `border: var(--line)` + `box-shadow: var(--shadow-soft)` | 卡片**静止**即带 shadow-2，违反「静止靠边框、悬浮加淡影」 | 静止用 `--bmp-shadow-1`（或仅边框）；hover 升到 `--bmp-shadow-2` |
| `todos.html:15,19`（`.todo-card`） | 静止 `--bmp-shadow-1` + hover `--bmp-shadow-2` | ✅ **合规示例**（本规范推荐范式） | —— |

### 2.5 动效

| 项 | 规格 | 依据 |
| --- | --- | --- |
| 时长 | **≤200ms**（默认 150ms） | UIUX §4.7 |
| 缓动 | **`ease-out`** | UIUX §4.7 |
| 属性 | 只动 `opacity` / `transform` / `background` / `border-color` / `box-shadow`；**禁止动 `width`/`height`/`top`/`left`**（避免重排） | 本规范新增 |
| 尊重系统设置 | **【强制】** `@media (prefers-reduced-motion: reduce)` 下**禁用自动播放动效**（Banner 轮播不自动切换、骨架屏 shimmer 停止或降为静态底色） | UIUX §4.7、PRD A1-F07-5 |
| 骨架屏 | `shimmer` 1.3s infinite（`common.css:171-176`） | UIUX §4.2 |
| Toast/Message | `drop` 0.2s ease-out（`common.css:158`） | UIUX §4.3 |
| 弹窗 | `pop` 0.18s ease-out（`common.css:131`） | UIUX §4.3 |
| 抽屉 | `right` 0.2s ease-out（`common.css:144`） | UIUX §4.3 |
| 按钮 | `all .15s ease-out`（`common.css:29`） | UIUX §4.7 |

**动效令牌**（建议新增到 `@bmp/theme`，供前端统一）：

| 建议 Token | 值 | 用途 |
| --- | --- | --- |
| `--bmp-duration-fast` | `150ms` | 按钮、链接、边框、hover |
| `--bmp-duration-base` | `200ms` | 抽屉、Toast、弹窗 |
| `--bmp-ease-out` | `cubic-bezier(0, 0, .2, 1)` | 全局缓动 |

> **【强制】已存在的越界**：`common.css:176` 骨架 `1.3s`、`common.css:154` Toast 0.2s ✅；`home-v2.html` 内 `scroll-behavior: smooth`（`:85`）在 `prefers-reduced-motion` 下应关闭。**全站「是否声明 reduced-motion」的扫描命令**：`grep -rn "prefers-reduced-motion" prototype/` —— **当前结果为空（0 处）**，属**全站缺失**，必须补齐（P1）。

### 2.6 图标

| 项 | 规格 | 依据 |
| --- | --- | --- |
| 库 | **iconify 线性图标** | UIUX §2.3 |
| 网格 | **20px 网格**（门户 / 卡片） | UIUX §2.3 |
| 管理端菜单图标 | **16px** | UIUX §2.3 |
| 风格 | **【强制】禁用多风格混用**（同一页面不得线性与填充混用） | UIUX §2.3 |
| 尺寸阶梯（本规范固化） | `14 / 16 / 20 / 24 / 32 / 44`（44 仅空态插图） | 综合 UIUX §4.2 |
| 颜色 | 继承 `currentColor`；禁用彩色图标（除渠道品牌 Logo） | 本规范新增 |
| 空态插图 | **居中线性插图 120px**（CSS 实现为 `font-size: 44px` emoji 或 SVG，见 §3.2） | UIUX §4.2 |
| 触控热区 | 移动端 **≥44px**（图标本身可小，热区必须够） | UIUX §5.6、PRD A2-F05 |

> **⚠ 现实偏差登记**：原型当前使用 **emoji 作为图标**（`common.css:166` `.state-box .illus { font-size: 44px }` 配合 `🤖`/`📝`/`✅` 等，`home-v2.html` 的意图流等）。**这是原型的降级实现**，正式前端必须替换为 iconify 线性 SVG，避免跨平台字形差异。**已存在的合规部分**：管理端 `.wf-canvas-*` 系列的 SVG 是**纯手写 SVG**（零依赖），可作为「无法引库时」的等价实现范式。

### 2.7 层级 z-index

#### 2.7.1 PC 端层级（本规范固化，来源于原型实测）

| 层 | z-index | 元素 | 落地证据 |
| --- | --- | --- | --- |
| 内容基线 | `auto` / `1` | 页面内容（`.portal-main` / `.console-body`） | —— |
| 卡片内操作悬浮 | `5 ~ 6` | `.card-ops` / `.blk-ops` | `home.html:54`、`home-v2.html:179` |
| 演示提示 | `10` | `.demo-hint`（仅演示，正式删除） | `home.html:304`、`login.html:298` |
| 移动端 Tab 栏 | `40` | `.tabbar`（移动） | `mobile/home-v2.html:593` |
| 门户口顶栏（sticky） | `40 ~ 100` | `.portal-topbar` 实测 `100`（`common.css:208`）；`home-v2.html:73` 实测 `40` | **存在不一致，需统一** |
| 管理端顶栏（sticky） | `90` | `.console-topbar` | `common.css:268` |
| 下拉菜单 | `200` | `.dropdown-menu` | `common.css:236` |
| 批量浮条 | `500` | `.batch-bar` | `common.css:291` |
| 遮罩（Modal/Drawer） | `1000` | `.modal-mask` / `.drawer-mask` | `common.css:122,139` |
| 抽屉面板 | `1001` | `.drawer` | `common.css:143` |
| 引导遮罩 | `1500 ~ 1501` | `.coach-mask` + 引导卡 | `home.html:65,68` |
| Toast / Message | `2000` | `#msg-root` | `common.css:152` |

> **⚠ 不一致登记（P2）**：门户顶栏 z-index 在 `common.css:208` 为 `100`，在 `home-v2.html:73` 为 `40`，`index.html:19` 为 `40`。**本规范固化**：**门户口顶栏统一 `100`**（因需覆盖卡片内悬浮操作 z=6 且低于下拉 z=200）。

#### 2.7.2 移动端层级（【强制】与 UIUX §5.6 一致）

> **层级优先级：内容 < 行动栏 z30 < Tab 栏 z40 < 抽屉 z60 < Toast**

| 层 | 位置/层级 | 行为 | 落地证据 |
| --- | --- | --- | --- |
| **内容区（`.screen`）** | `flex: 1`，Tab 栏为 `.phone` 的 flex 兄弟节点 | 内容**天然不被 Tab 栏叠加**（比靠 padding 硬撑稳健） | `mobile/home-v2.html:589` |
| **底部行动栏** | `bottom: var(--bottom-chrome)`，**z30** | **「滚动后出现」**（阈值 `ACTION_SHOW_AT = 160`），对最紧急项一键操作；回顶收起 | `mobile/home-v2.html:632`、`:2118,2127` |
| **底部 Tab 栏** | `bottom: 0`（含安全区），**z40** | 全局导航（首页/待办/审批/消息/我的） | `mobile/home-v2.html:593` |
| 抽屉（AI 对话 / 任务处理 / 全部应用） | **z60** | 覆盖于两栏之上 | `mobile/home-v2.html:669,676` |
| AI FAB | `z80` | 悬浮球（**高于抽屉，属例外，需裁定**） | `mobile/home-v2.html:769` |
| 免登降级层 | `z90` | 免登失败降级展示登录页 | `mobile/home-v2.html:94` |

**移动端底部高度变量（【强制】不可改公式）**：

| 变量 | 值 | 说明 | 落地证据 |
| --- | --- | --- | --- |
| `--tabbar-h` | `56px` | Tab 栏内容高度（≥44px 触控） | `mobile/home-v2.html:49` |
| `--home-ind-h` | `22px` | home indicator 安全区高度（沿用手机壳既有规格） | `mobile/home-v2.html:50` |
| `--bottom-chrome` | `calc(var(--tabbar-h) + var(--home-ind-h) + env(safe-area-inset-bottom))` | 行动栏上移基准 | `mobile/home-v2.html:51` |

> **两栏不重叠**要求：行动栏定位在 Tab 栏之上（`bottom = --bottom-chrome`）+ 行动栏为「滚动后出现」→ 不会与常驻 Tab 栏争夺视觉（UIUX §5.6、PRD A2-F05-3）。
> **未决**：AI FAB `z80` 高于抽屉 `z60`，与「抽屉覆盖于两栏之上」的通则不完全一致；**建议** FAB 降至 `z50`（高于 Tab 栏、低于抽屉），否则抽屉展开时 FAB 仍可点，可能误触。**标注为 §2.7 待裁定项**。

#### 2.7.3 【强制】层级使用规则

1. **禁止使用魔数**：新增层级必须从本表取值，不得写 `9999` / `999999` 等；
2. **禁止负 z-index**（除刻意的背景层，须注释说明）；
3. 遮罩与面板成对：`mask = 1000`、`panel = 1001`（PC）；移动端按 §2.7.2；
4. Toast 永远最高（`2000`），保证反馈不被遮挡。

### 2.8 断点与响应式

| 断点 | 布局行为 | 依据 |
| --- | --- | --- |
| **≥1440px** | 工作台内容区 `max-width: 1440px` 居中；**v2 三栏**；管理端表格完整列 | UIUX §4.6、§5.3 |
| **1024–1439px** | 卡片栅格自动降列（6 栅格卡 → 8 栅格）；表格次要列隐藏；**首页右栏折叠为吸底抽屉触发条**（左 + 中双栏） | UIUX §4.6、§5.3 |
| **<1024px** | PC 端提示「建议在更大屏幕使用」，核心功能（待办/审批）**保持可用** | UIUX §4.6 |
| **移动端 H5** | **375px 基准 vw 适配**；钉钉/企微容器内全屏；安全区适配（底部 home indicator） | UIUX §4.6、§5.6 |
| 移动端断点 | 375px 基准（原型手机壳实测 `width: 375px; height: 760px`），`>414px` 时保持手机壳居中展示 | `mobile/home-v2.html:73` |

> **【强制】** 响应式**不得用 JS 监听 resize 改样式**（除布局引擎必需要的栏折叠状态切换）；一律用 CSS 媒体查询 + CSS 变量。
> **扫描命令**：`grep -rn "@media" prototype/` —— 用于核对断点声明是否与上表一致。

### 2.9 【落地表】Token → CSS 变量 → 实际值 → 用途

> **本节前端可直接抄。** 第一轨 20 条 + 第二轨 44 条 = **64 条全覆盖**。

#### 2.9.1 第一轨（Notion 暖色基准，20 个）

| Token 名 | CSS 变量名 | 实际值 | 用途 |
| --- | --- | --- | --- |
| 页面底 | `--page-bg` | `#ffffff` | 页面最底（与 `--canvas` 同值，语义别名） |
| 画布 | `--canvas` | `#ffffff` | 卡片 / 画布底（纯白） |
| 区块底 | `--surface` | `#f6f5f4` | 区块 / 卡片底（暖白，带黄褐底调） |
| 区块悬停 | `--surface-hover` | `#efedea` | 区块 hover 背景 |
| 浅陷底 | `--surface-sunken` | `#f8f7f6` | 表头 / 浅陷底（比 `--surface` 略亮） |
| 深色反衬底 | `--dark-surface` | `#31302e` | Toast 反白底 / 头像底 / 代码 diff 块 |
| 标题文字 | `--text-primary` | `rgba(0,0,0,.95)` | 标题（暖黑） |
| 正文文字 | `--text-body` | `#444444` | 正文常规 |
| 次要文字 | `--text-secondary` | `#615d59` | 次要文字（暖灰 500） |
| 弱化文字 | `--text-weak` | `#a39e98` | 占位 / 弱化（暖灰 300） |
| 细边框色 | `--line-color` | `rgba(0,0,0,.1)` | `border-color` / 分隔线色值 |
| 细边框 | `--line` | `1px solid rgba(0,0,0,.1)` | 细如耳语的边框（简写，Notion 标识） |
| 强化边框色 | `--border-strong-color` | `rgba(0,0,0,.18)` | hover / 聚焦边框色值 |
| 品牌红 | `--accent` | `#C8161D` | 主操作 / 链接 / 选中态 / **紧急超时语义** |
| 暖橙 | `--accent-warm` | `#dd5b00` | hover / 辅助强调 / 「本周待办」色条 |
| 卡片阴影（悬浮） | `--shadow-soft` | `rgba(0,0,0,.04) 0 4px 18px, rgba(0,0,0,.027) 0 2px 8px, rgba(0,0,0,.02) 0 .8px 3px` | 卡片悬浮 / 下拉 |
| 浮层阴影 | `--shadow-lift` | `rgba(0,0,0,.05) 0 8px 28px, rgba(0,0,0,.035) 0 3px 10px, rgba(0,0,0,.025) 0 1px 4px` | 弹窗 / 抽屉 / 浮层 |
| 卡片圆角 | `--r-card` | `8px` | 卡片主圆角（= `--bmp-radius-md`） |
| 胶囊圆角 | `--r-pill` | `9999px` | 标签 / 搜索框 / 头像 / Tab 项 |
| 字体栈 | `--font` | `Inter, -apple-system, "PingFang SC", sans-serif` | 全局字体 |

#### 2.9.2 第二轨（`--bmp-*` 兼容别名，44 个）

**（a）品牌色 3 个**

| Token 名 | CSS 变量名 | 实际值 | 用途 |
| --- | --- | --- | --- |
| 品牌主色 | `--bmp-color-primary` | `var(--accent)` → `#C8161D` | 主操作按钮、链接、导航选中态 |
| 品牌浅底 | `--bmp-color-primary-light` | `#FBECEC` | 悬停背景、选中标签底色 |
| 品牌深色 | `--bmp-color-primary-dark` | `#A51218` | 按钮 hover/active |

**（b）语义色 8 个（【固定】不随风格变化）**

| Token 名 | CSS 变量名 | 实际值 | 用途 |
| --- | --- | --- | --- |
| 成功 | `--bmp-color-success` | `#16A34A` | 成功 / 已通过 / 启用 |
| 成功浅底 | `--bmp-color-success-light` | `#ECFDF3` | 成功标签底 |
| 警告 | `--bmp-color-warning` | `#F59E0B` | 警告 / 临期待办 |
| 警告浅底 | `--bmp-color-warning-light` | `#FFFBEB` | 只读横幅底 |
| **危险（仅错误失败）** | `--bmp-color-danger` | `#F53F3F` | 校验失败 / 提交失败 / 接口报错 / 锁定 |
| 危险浅底 | `--bmp-color-danger-light` | `#FEF2F2` | 错误提示条底 / 网络异常横幅底 |
| 中性提示 | `--bmp-color-info` | `#64748B` | 中性提示（**不作中性色阶用**） |
| 中性浅底 | `--bmp-color-info-light` | `#F1F5F9` | 中性标签底 / 代码块底 |

**（c）渠道品牌色 2 个（固定）**

| Token 名 | CSS 变量名 | 实际值 | 用途 |
| --- | --- | --- | --- |
| 钉钉 | `--bmp-color-dingtalk` | `#1677FF` | 钉钉渠道标识 |
| 企微 | `--bmp-color-wecom` | `#07C160` | 企微渠道标识 |

**（d）中性色阶 8 个（→ 暖灰体系）**

| Token 名 | CSS 变量名 | 实际值 | 用途 |
| --- | --- | --- | --- |
| 标题 | `--bmp-text-title` | `var(--text-primary)` → `rgba(0,0,0,.95)` | 标题文字 |
| 正文 | `--bmp-text-body` | `#444444` | 正文文字 |
| 次要 | `--bmp-text-secondary` | `var(--text-secondary)` → `#615d59` | 次要文字 |
| 占位 | `--bmp-text-placeholder` | `var(--text-weak)` → `#a39e98` | 占位 / 弱化 |
| 细边框 | `--bmp-border` | `var(--line-color)` → `rgba(0,0,0,.1)` | 边框色 |
| 强化边框 | `--bmp-border-strong` | `var(--border-strong-color)` → `rgba(0,0,0,.18)` | hover / 聚焦边框 |
| **页面底** | `--bmp-bg-page` | `var(--surface)` → `#f6f5f4` | **【关键】页面底：冷灰 `#F1F5F9` → 暖白 `#f6f5f4`** |
| 卡片底 | `--bmp-bg-card` | `var(--canvas)` → `#ffffff` | 卡片 / 面板底 |

**（e）字体 7 个**

| Token 名 | CSS 变量名 | 实际值 | 用途 |
| --- | --- | --- | --- |
| 字体族 | `--bmp-font-family` | `var(--font)` | 全局字体 |
| H1 | `--bmp-font-h1` | `600 24px/32px var(--font)` | 页面大标题 |
| H2 | `--bmp-font-h2` | `600 20px/28px var(--font)` | 模块标题 |
| H3 | `--bmp-font-h3` | `600 16px/24px var(--font)` | 卡片 / 弹窗标题 |
| 正文 | `--bmp-font-body` | `400 14px/22px var(--font)` | 正文默认 |
| 辅助 | `--bmp-font-caption` | `400 12px/18px var(--font)` | 辅助说明 / 时间戳 |
| 大数字 | `--bmp-font-number-lg` | `600 28px/36px var(--font)` | 数据卡大数字 |

**（f）间距 7 个**

| Token 名 | CSS 变量名 | 实际值 | 用途 |
| --- | --- | --- | --- |
| 间距 1 | `--bmp-space-1` | `4px` | 密排间隙 |
| 间距 2 | `--bmp-space-2` | `8px` | 按钮组 / 标签间距 |
| 间距 3 | `--bmp-space-3` | `12px` | 字段间距 |
| 间距 4 | `--bmp-space-4` | `16px` | 卡片内边距 / 区块间距 |
| 间距 5 | `--bmp-space-5` | `20px` | 弹窗内边距 |
| 间距 6 | `--bmp-space-6` | `24px` | 页面边距 |
| 间距 8 | `--bmp-space-8` | `32px` | 大区块分隔 |

**（g）圆角 4 个**

| Token 名 | CSS 变量名 | 实际值 | 用途 |
| --- | --- | --- | --- |
| 小圆角 | `--bmp-radius-sm` | `4px` | 标签内 / 菜单项 / 步骤点 |
| 中圆角 | `--bmp-radius-md` | `8px` | 卡片主圆角 |
| 大圆角 | `--bmp-radius-lg` | `12px` | 弹窗 |
| 按钮圆角 | `--bmp-radius-btn` | `8px` | 按钮（原 4px → 8px） |

**（h）阴影 3 个**

| Token 名 | CSS 变量名 | 实际值 | 用途 |
| --- | --- | --- | --- |
| 阴影 1 | `--bmp-shadow-1` | `rgba(0,0,0,.04) 0 1px 3px, rgba(0,0,0,.02) 0 1px 2px` | 卡片静止 |
| 阴影 2 | `--bmp-shadow-2` | `var(--shadow-soft)` | 卡片悬浮 / 下拉 |
| 阴影 3 | `--bmp-shadow-3` | `var(--shadow-lift)` | 弹窗 / 抽屉 / 浮层 |

**（i）尺寸 2 个**

| Token 名 | CSS 变量名 | 实际值 | 用途 |
| --- | --- | --- | --- |
| 顶栏高度 | `--bmp-topbar-h` | `56px` | 门户顶栏高度（sticky 定位基准） |
| 管理端菜单宽 | `--bmp-console-menu-w` | `232px` | 管理端左侧菜单宽度 |

#### 2.9.3 两轨对应关系总览

| 第一轨（新写优先） | 对应第二轨别名 | 关系 |
| --- | --- | --- |
| `--canvas` | `--bmp-bg-card` | 别名指向基准 |
| `--surface` | `--bmp-bg-page` | 别名指向基准（**历史语义反转**：`bg-page` 实为区块底，见 §2.1.1 ④） |
| `--text-primary` | `--bmp-text-title` | 别名指向基准 |
| `--text-body` | `--bmp-text-body` | **两轨同值**（`#444444`，非 `var()` 链） |
| `--text-secondary` | `--bmp-text-secondary` | 别名指向基准 |
| `--text-weak` | `--bmp-text-placeholder` | 别名指向基准 |
| `--line-color` | `--bmp-border` | 别名指向基准 |
| `--border-strong-color` | `--bmp-border-strong` | 别名指向基准 |
| `--accent` | `--bmp-color-primary` | 别名指向基准 |
| `--shadow-soft` | `--bmp-shadow-2` | 别名指向基准 |
| `--shadow-lift` | `--bmp-shadow-3` | 别名指向基准 |
| `--r-card` | `--bmp-radius-md` | **两轨同值**（`8px`，非 `var()` 链） |
| `--r-pill` | （**无别名**） | **缺项**：UIUX 写 `--bmp-radius-pill`，未落地 |
| `--font` | `--bmp-font-family` | 别名指向基准 |
| （无第一轨） | `--bmp-shadow-1` | 别名轨独立（第一轨无对应） |
| （无第一轨） | `--bmp-space-1~8`、`--bmp-radius-sm/lg/btn`、`--bmp-topbar-h`、`--bmp-console-menu-w`、语义色 8 个、渠道色 2 个、`--accent-warm` 无别名 | 别名轨独立 / 第一轨独立 |

#### 2.9.4 落地缺项与建议补充（供 `@bmp/theme` 补齐）

| # | 缺项 | 现状 | 建议 |
| --- | --- | --- | --- |
| G-1 | `--bmp-radius-pill` | 未定义（UIUX §2.3 有要求） | 补 `--bmp-radius-pill: var(--r-pill)` |
| G-2 | `--bmp-color-primary-light` / `-dark` | **硬编码** `#FBECEC` / `#A51218`，非 `var()` | 主题切换需由 `data-theme` 覆写，**保留硬编码是正确的**（每档预设各自定义三档派生色）——**不改** |
| G-3 | 动效令牌 | 全站散落 `0.15s/0.18s/0.2s` | 新增 `--bmp-duration-fast/base` + `--bmp-ease-out`（见 §2.5） |
| G-4 | `--bmp-z-*` | 全站 z-index 为魔数 | 新增 `--bmp-z-topbar:100` / `--bmp-z-dropdown:200` / `--bmp-z-batch:500` / `--bmp-z-mask:1000` / `--bmp-z-drawer:1001` / `--bmp-z-toast:2000`（移动端另加 `--bmp-z-action:30` / `--bmp-z-tabbar:40` / `--bmp-z-sheet:60`） |
| G-5 | `--bmp-line-height-loose/normal/compact` | 密度档未 Token 化（原型用 JS 硬写） | 新增三档行高 Token，配合 `data-density` |
| G-6 | `--bmp-focus-ring` | 全站无统一焦点环 | 新增 `0 0 0 3px rgba(200,22,29,.08)`（已有单点实现见 `common.css:70`） |
| **G-7** | **`--bmp-color-urgent`（紧急语义红·固定）** | **【重要缺口】** 紧急/超时/临期（§2.1.3 第 3 条）与公告「紧急」标签要求「品牌红且**不随主题色变**」（PRD A1-F06 H2、A1-F07）。**运行时实测（§2.1.2.2 / P-21）显示当前 `--accent` 并未被主题预设覆写** —— 即「随主题变」这条风险在当前实现下尚未暴露；**但两条修复路径（§2.1.2.2 路径 A）一旦补写 `--accent` 覆写，紧急色就会立刻跟着主题变，H2 随即被破坏** | **前置新增独立固定 Token**：`:root { --bmp-color-urgent: #C8161D; }`（**不列入任何 `[data-theme]` 覆写块**）；紧急/超时/临期/紧急标签一律改用 `var(--bmp-color-urgent)`；`--accent` 仍作主操作品牌色（**修复 P-21 后**可随主题变）。**必须与 P-21 的路径 A 同批落地**（见 §2.1.2.2 联动说明） |
| G-8 | `--bmp-color-raise` / `--bmp-color-fall`（指标涨跌） | 运营指标「升绿降红」当前硬写 `var(--bmp-color-success/danger)`（`pages-config.js:3366`） | 可选新增两枚语义别名（`--bmp-color-raise: var(--bmp-color-success)` / `--bmp-color-fall: var(--bmp-color-danger)`），**仅为可读性**；若采纳，需与「行情类涨红跌绿」（§2.1.4.1）**分名**（建议 `--bmp-color-quote-up: var(--bmp-color-danger)` / `--bmp-color-quote-down: var(--bmp-color-success)`）以防混用 |

#### 2.9.5 §2 走查 checklist

**色彩（§2.1）**

- [ ] 页面 `body` 背景为 `--canvas`（白）或 `--bmp-bg-page`（暖白），**无 `#F1F5F9` / `#0F172A` / `#E2E8F0` / `#334155` 冷色残留**
  - 扫描：`grep -rnE "#(F1F5F9|0F172A|E2E8F0|334155|64748B)" prototype/ --include="*.html" --include="*.css" --include="*.js"`
  - **允许例外仅 3 处**：`settings.html:222-242` 用户预设（§2.1.2.1 ①）、`assets/tokens.css` 的 info 语义色、`assets/common.css:70-71` info/info-light
- [ ] **紧急 / 超时 / 临期**类元素使用**品牌红**（`--accent`，或 G-7 落地后改 `--bmp-color-urgent`），**未使用** `--bmp-color-danger`
  - 复核 §2.1.3（A）组 4 处 +（B）组 12 处 +（C）组 1 处 = **17 处修复面已全改**
  - **反向核对（D）组 5 处**（`home-v2.html:215/315/316/326`、`mobile/home-v2.html:496/526`）**仍为品牌红，未被误改成 danger**
- [ ] **错误 / 失败**类元素使用 `--bmp-color-danger`（亮红），**未使用** `--accent`
- [ ] **超时/临期文字未使用 `.text-danger`**（扫描：`grep -rn "text-danger" prototype/todos.html prototype/approval.html prototype/home.html prototype/mobile/index.html`，逐条确认非超时/临期语境）
- [ ] **公告「置顶/紧急」标签用品牌红**（`pages-config.js:3269-3270`），**未用 danger**
- [ ] **【新增】红/绿语义场景区分正确**（§2.1.4.1）：
  - 运营指标（环比/活跃度/完成率）为**升绿降红**（`pages-config.js:3364` `aaMom()` ✅ 正确，**不得判为缺陷**）
  - 金融行情类（若未来接入）为**涨红跌绿**；同视图内不得两套惯例混用
  - 复核：`grep -rniE "涨|跌|行情|股价|基金|净值" prototype/ --include="*.html" --include="*.js"` → **当前 0 命中**
- [ ] **【新增】风格预设色 ≠ 设计基准色**（§2.1.2.1）：`settings.html:222-242` 的 `THEME/DENSITY/RADIUS_PRESETS` 属授权用户预设，**不计入冷色残留**
- [ ] **【新增】语义色不随主题变**：切 5 档主题色后，`success` / `warning` / `danger` / `info` / **紧急红** / 渠道色**值恒定**（PRD A1-F06 H2 验收）
- [ ] 同屏无「实心品牌红按钮 + 大面积 danger 底色」抢注意力（§2.1.3 第 4 条）

**排版与间距（§2.2 / §2.3）**

- [ ] 全站仅 12px 徽标使用正字距（`+0.125px`）；标题全为负字距（大标题 `-.4~-.5px` / 区块 `-.25px` / 卡片名 `-.2px`）
- [ ] 间距只取 4/8/12/16/20/24/32；字号只取 12/14/16/20/24/28

**圆角与阴影（§2.4）**

- [ ] 卡片静止用细边框（+ 可选 `--bmp-shadow-1`），悬浮才升到 `--bmp-shadow-2`
- [ ] 无单层高透明度阴影（扫描：`grep -rnE "box-shadow: 0 [0-9]+px [0-9]+px rgba" prototype/`）

**动效与层级（§2.5 / §2.7）**

- [ ] 动效 ≤200ms / ease-out；已声明 `prefers-reduced-motion`
- [ ] z-index 无魔数（除允许的 `1000/1001/2000` 由 Token 表达）；移动端符合 内容 < 行动栏 z30 < Tab 栏 z40 < 抽屉 z60 < Toast

**落地（§2.9）**

- [ ] §2.9 落地表 64 条已全部进入 `@bmp/theme`，且值与本表一致（自动化比对脚本）
- [ ] G-1~G-8 缺项已评估（尤其 **G-7 `--bmp-color-urgent`** 为 H2 合规的必要项）

---

## §3 全局状态规范 ⭐

> **【强制】** UIUX §4.2 规定「所有页面必须覆盖」。本章六态为**全站最小集**，每页至少覆盖 **加载 / 空 / 错误 / 无权限** 四态；涉及异步与登录链路的页面另加 **网络异常 / 会话过期**。
> **计分口径**：页面态覆盖率 = 已实现态数 / 6。**当前基线问题**：`notices.html` 0 态、`apps.html` 仅部分、`todos/messages` 无加载与错误态（事实基线 P-05，P1）。

### 3.0 六态速查表

| # | 状态 | 触发条件 | 视觉规格 | 恢复路径 | 最小实现 |
| --- | --- | --- | --- | --- | --- |
| 1 | **加载中** | 首次进入 / 切换筛选 / 翻页 | 骨架屏（卡片/表格行形状）；**全屏 loading 仅在 >300ms 后出现** | 自动完成 | 必须有 |
| 2 | **空态** | 请求成功但数据为空（含筛选无结果） | 居中线性插图 + 说明 + **引导操作按钮** | 引导按钮 | 必须有 |
| 3 | **错误态** | 请求 4xx/5xx / 解析失败 / 超时 | 插图 + 错误说明 + **错误码** + 「重试」 | 重试 / 反馈 | 必须有 |
| 4 | **无权限态** | 403 / 权限码不足 / 直访无权路由 | 锁形插图 + 「无访问权限」+ 申请入口 | 申请权限 | 必须有 |
| 5 | **网络异常** | `navigator.onLine === false` / 连续请求超时 | **顶部全局横幅（红，可关闭）** | 自动重连后消失 | 涉及异步则必须有 |
| 6 | **会话过期** | 静默续期失败 / refresh token 失效 | 弹窗「登录已过期」→ 确认后跳统一登录 | 重新登录（保留 `redirect`） | 涉及登录则必须有 |

---

### 3.1 加载中（Loading）

**触发条件**

| 触发 | 是否展示骨架 | 是否展示 spinner |
| --- | --- | --- |
| 首次进入页面（无缓存数据） | ✅ 骨架屏 | ❌ |
| 切换筛选 / 翻页 / 排序 | ✅ 骨架屏（表格行 / 卡片） | ❌ |
| 局部刷新（刷新按钮 / 卡片级重载） | ✅ 该区域骨架 | ❌ |
| 提交类操作（表单保存 / 批量操作） | ❌ | ✅ **按钮内联 spinner** |
| **耗时 >300ms 的全屏级操作** | 骨架 | ✅ 允许出现 spinner |

**视觉规格**

| 元素 | 规格 | 落地类 |
| --- | --- | --- |
| 骨架底 | `background: var(--surface-hover)`，`border-radius: var(--bmp-radius-sm)` | `.skeleton`（`common.css:170`） |
| 扫光 | `linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent)`，`shimmer 1.3s infinite` | `.skeleton::after`（`common.css:171-176`） |
| 行骨架 | `height: 14px; margin-bottom: 10px`；宽度档 40% / 60% / 80% | `.sk-line` / `.w40` / `.w60` / `.w80`（`common.css:177-178`） |
| 块骨架 | `height: 96px; border-radius: var(--bmp-radius-md)` | `.sk-block`（`common.css:179`） |
| 按钮 loading | 12px 圆环，`border: 2px solid rgba(255,255,255,.4); border-top-color: #fff`，`spin .7s linear infinite` | `.btn.loading::before`（`common.css:42`） |

**【强制】** ① 骨架屏形状**必须与真实内容同构**（卡片骨架 = 卡片形状，表格骨架 = 行形状）；② 骨架数量 = 默认每页条数（列表 10 行）；③ **禁止**用「一片灰块」代替结构性骨架。

**可复制文案模板**

| 场景 | 文案 |
| --- | --- |
| 表格/列表加载 | （无文字，纯骨架） |
| 卡片加载 | `正在加载…` |
| iframe 嵌入卡加载（A1-F08-4） | `正在加载 {应用名}…` |
| 全屏级加载（>300ms） | `加载中，请稍候…` |

**恢复路径**：自动完成（无用户动作）。

---

### 3.2 空态（Empty）

> **【强制】空态必带下一步动作。** 禁止只写「暂无数据」而不给按钮。

**触发条件（细分 4 类，视觉同构、文案不同）**

| 类型 | 触发 | 文案差异 |
| --- | --- | --- |
| 无数据 | 首次使用 / 系统内确实无记录 | 「还没有…，去创建」 |
| 无结果 | 筛选/搜索后无匹配 | 「没有符合条件的结果」+ 清除筛选 |
| 无权限（空态变体） | 有权访问但数据范围为空 | 见 §3.4 无权限态 |
| 待处理完成 | 待办/审批已清空 | 「太棒了，暂无待办」 |

**视觉规格**

| 元素 | 规格 |
| --- | --- |
| 容器 | 垂直居中，`padding: 48px 0`，`gap: 10px`，`color: var(--bmp-text-secondary)` |
| 插图 | 线性插图；CSS 实现 `font-size: 44px; opacity: .8`（正式版用 120px iconify 线性 SVG） |
| 说明文字 | `--bmp-font-body`（14px），`color: var(--bmp-text-secondary)` |
| 引导按钮 | `.btn.btn-primary`（品牌红实心）1 个，**最多 2 个**（主 + 次） |

**落地类**：`.state-box` / `.state-box .illus` / `.state-box .txt`（`common.css:165-167`）、`.empty-tip` / `.empty-tip .big`（`common.css:325-326`）

**可复制文案模板（【强制】直接抄）**

| 页面 | 插图 | 说明 | 引导按钮（去向） |
| --- | --- | --- | --- |
| 统一待办中心（UI-A4-01） | ✅ 完成态 | `太棒了，暂无待办` | `去应用中心看看` → `/apps` |
| 我的待办 · 已办 | 📋 | `还没有已处理的待办` | 无（弱引导文字：`处理过的待办会出现在这里`） |
| 我发起的 | 📤 | `还没有发起过流程` | `发起审批` → 审批中心 |
| 消息中心（UI-A1-03） | 💬 | `暂无新消息` | `去待办中心` → `/todos` |
| 公告列表（UI-A1-04） | 📢 | `暂无公告` | 无（`有公告时会在这里通知你`） |
| 应用中心（UI-A1-02）· 无结果 | 🔍 | `没有找到「{关键词}」相关应用` | `清除筛选`（次要按钮） |
| 管理端列表页（通用） | 📋 | `暂无{对象名}数据` | `新建{对象名}`（有权限时） |
| 管理端列表页 · 无结果 | 🔍 | `没有符合条件的结果` | `清除筛选条件` |
| 数据看板（UI-C-17）· 无数据 | 📊 | **`数据采集中，预计 {X} 后可见`** | `查看埋点状态` | 
| 搜索无权限结果 | 🔒 | 见 §3.4（**不暴露资源存在性**） | 申请入口 |

> **【强制 · 看板特例】** UI-C-17 应用运营看板的「无数据态」**禁止留空白图表**（禁止空坐标轴 / 0 值假图），必须显示引导文案「数据采集中，预计 X 后可见」（UIUX §5.7、PRD A1-F09）。**扫描命令**：`grep -n "采集中\|预计.*可见" prototype/assets/pages-config.js`

**恢复路径**：点击引导按钮 → 进入对应功能；或清除筛选条件。

---

### 3.3 错误态（Error）

**触发条件**

| 触发 | 错误类型 | 建议错误码前缀 |
| --- | --- | --- |
| 接口 4xx | 参数错误 / 资源不存在 | `4xxx` |
| 接口 5xx | 服务端异常 | `5xxx` |
| 请求超时 | 网络/服务慢 | `4408`（超时） |
| 数据解析失败 | 契约不符 | `5001` |
| 局部模块失败（卡片/嵌入页） | 降级 | 用降级卡（见下） |
| 业务错误码 | 业务规则拦截 | 业务自定义码 |

**视觉规格**

| 元素 | 规格 |
| --- | --- |
| 插图 | 线性插图（警示/断开） |
| 说明 | `--bmp-font-body`，`color: var(--bmp-text-secondary)` |
| **错误码** | **【强制】必须展示**，`--bmp-font-caption`，`color: var(--bmp-text-placeholder)` —— 便于报障 |
| 重试按钮 | `.btn`，文案 `重试` |
| 副操作 | 文案 `复制错误码` 或 `联系管理员`（可选） |

**落地类**：`.state-box` + `.state-box .code`（`common.css:168`）

**可复制文案模板（【强制】直接抄）**

| 场景 | 说明文案 | 错误码展示 | 按钮 |
| --- | --- | --- | --- |
| 列表/表格加载失败 | `数据加载失败，请重试` | `错误码：{code}` | `重试` |
| 详情加载失败 | `详情加载失败，请稍后重试` | `错误码：{code}` | `重试` / `返回列表` |
| **卡片加载失败降级**（A1-F02-4） | `卡片加载失败` | （可选 `requestId`） | `重试`（**只影响本卡**） |
| **iframe 嵌入卡失败**（A1-F08-4） | `无法在首页内嵌显示` | —— | `在新标签页打开` + `重试` |
| 接口报错（提交类） | `{操作名}失败：{具体原因}` | `错误码：{code}` | `重试` |
| 数据解析失败 | `数据格式异常，已上报` | `错误码：5001` | `刷新页面` |
| 导出失败 | `导出任务创建失败，请重试` | `错误码：{code}` | `重试` |

> **【强制】** 错误提示**禁止**只写「操作失败」——必须含**原因 + 解法**（UIUX §4.7、§9.1）。
> **【强制】** 单模块失败**不得拖垮整页**（UIUX §5.3 第 4 条）：卡片级错误用**降级卡**（标题 + 说明 + 按钮），页面其余部分正常渲染。

**恢复路径**：重试（自动带原参数）→ 仍失败则提示「已记录，请联系管理员并提供错误码 {code}」。

---

### 3.4 无权限态（NoPermission）

**触发条件**

| 触发 | 判定路径 |
| --- | --- |
| 直接访问无权限路由 | 动态路由未注册 → 404 或本态（UIUX §8.2） |
| 页面级权限不足 | 菜单权限有但数据/操作权限无 |
| 接口返回 403 | 服务端拒绝 |

**视觉规格**

| 元素 | 规格 |
| --- | --- |
| 插图 | **锁形**线性插图 |
| 标题 | `无访问权限`（`--bmp-font-h3`） |
| 说明 | `当前账号无权访问该功能，可申请后使用` |
| 主按钮 | `申请权限` → 跳权限申请登记（UI-C-05） |
| 次按钮 | `返回工作台` |

**落地类**：`.state-box`（同 §3.2）；权限申请入口指向 `/console/perm-applies`

**【强制】** **不暴露资源存在性**（UIUX §4.2）：无权限时**不得**显示资源名称、数量、内容轮廓；提示语只用泛化的「该功能 / 该数据」。

**可复制文案模板**

| 场景 | 文案 | 按钮 |
| --- | --- | --- |
| 页面级 | `无访问权限` / `当前账号无权访问该功能，可申请后使用` | `申请权限` + `返回工作台` |
| 数据级（V1.5 后） | `暂无可见数据` / `你当前的数据范围不含该范围记录` | `查看我的权限` |
| 已禁用按钮的 tooltip | `无权限，可申请` | 点击 tooltip 内 `去申请` |
| Banner/入口不可见 | （**不渲染 DOM**，非禁用非占位） | —— |

**恢复路径**：跳权限申请登记 → 管理员审批 → 重新加载权限（`GET /v1/auth/me`）后可见。

---

### 3.5 网络异常（NetworkError）

**触发条件**：`navigator.onLine === false`；或连续 N（建议 3）次请求超时。

**视觉规格（【强制】顶部全局横幅）**

| 属性 | 规格 |
| --- | --- |
| 位置 | **顶部全局横幅**（`position` 置于顶栏之下、内容之上） |
| 底色 | `var(--bmp-color-danger-light)` `#FEF2F2` |
| 文字色 | `var(--bmp-color-danger)` `#F53F3F` |
| 边框底 | `1px solid #FECACA` |
| 字号 | 13px |
| 对齐 | 居中 |
| 可关闭 | ✅（关闭后本会话不再提示；恢复后自动消失） |

**落地类**：`.net-banner` / `.net-banner.show`（`common.css:182-187`）

**可复制文案模板**

| 场景 | 文案 |
| --- | --- |
| 断网 | `网络连接异常，部分数据可能不是最新` |
| 已恢复（瞬时提示） | `网络已恢复`（用 Message，成功态，2s 消失） |
| 弱网（超时但未断网） | `网络较慢，正在重试…` |
| 埋点上报失败（A1-F05） | **静默失败，不提示**（PRD §6.1.3 关键技术点） |

**恢复路径**：自动重连（监听 `online` 事件 + 指数退避重试）→ 成功后横幅消失 + Message「网络已恢复」。

> **【强制】** 网络异常态**不得**阻断已加载内容的浏览（只提示可能不是最新），**不得**用全屏遮罩。

---

### 3.6 会话过期（SessionExpired）

**触发条件**：静默续期（silent refresh）失败 → 弹窗。**未失败时不弹**（UIUX §4.2）。

**视觉规格**

| 元素 | 规格 |
| --- | --- |
| 形态 | **Dialog（模态，不可点遮罩关闭）** |
| 标题 | `登录已过期` |
| 说明 | `为保障账号安全，请重新登录后继续操作` |
| 按钮 | 主 `重新登录`（品牌红实心）；**无取消按钮**（或取消 = 停留但功能不可用） |
| 附加 | 倒计时可选（建议 5s 后自动跳转） |

**可复制文案模板**

| 场景 | 文案 |
| --- | --- |
| 静默续期失败 | `登录已过期` / `为保障账号安全，请重新登录后继续操作` |
| 多标签页并发发现过期 | `账号已在其他标签页重新登录，本页将刷新` |
| 强制下线（管理员操作） | `账号已被管理员强制下线，请重新登录` |
| 账号锁定 | `账号已锁定，请 30 分钟后重试或联系管理员`（B1-F05） |

**恢复路径**：确认 → 跳 `/login?redirect={当前URL}`（**【强制】全链路保留 `redirect`**，UIUX §8.2）→ 登录后回原页面且**筛选/分页状态保留**（URL query 同步，UIUX §4.4）。

**实现约束（UIUX §8.2）**：401 统一由 axios 拦截器处理 → 静默 refresh（并发请求**挂起重放**）→ 失败才弹窗。**禁止**每个请求各自弹窗。

---

### 3.7 状态间的优先级与叠加规则

| 优先级 | 规则 |
| --- | --- |
| 1 | **会话过期 > 无权限 > 网络异常 > 错误 > 空 > 加载**（高优先覆盖低优先） |
| 2 | 网络异常横幅**可与任何态叠加**（横幅在顶部，态在内容区） |
| 3 | 局部态（卡片级）**不覆盖**页面级态（页面级加载中时，卡片不单独显示自己的加载） |
| 4 | 同时满足「空」与「错误」时，**错误优先**（错误有明确原因） |
| 5 | 「无权限」与「空」同时满足时，**无权限优先**（不暴露存在性） |

### 3.8 §3 走查 checklist

- [ ] 每页至少实现 加载 / 空 / 错误 / 无权限 四态（覆盖率 = 100%）
- [ ] 涉及异步请求的页面额外实现网络异常；涉及登录链路的页面额外实现会话过期
- [ ] 空态**每一个都有引导按钮或弱引导文字**（无「只有插图+暂无数据」的空态）
- [ ] 错误态**都显示了错误码**，且文案含「原因 + 解法」
- [ ] 无权限态**未暴露资源存在性**（无资源名/数量）
- [ ] 卡片级错误为降级卡，页面其余部分正常
- [ ] UI-C-17 看板无数据态**无空白图表**，显示「数据采集中，预计 X 后可见」
- [ ] 网络异常为顶部横幅且可关闭
- [ ] 会话过期弹窗保留 `redirect`，登录后回到原页面且筛选保留
- [ ] 状态叠加符合 §3.7 优先级表
- [ ] 扫描：`grep -c "state-box\|empty-tip\|net-banner" prototype/*.html` 逐页核对 0 态页面

---

## §4 组件规范 ⭐

### 4.1 组件分层（L0 / L1 / L2）

| 层 | 内容 | 来源 | 包 | 数量 |
| --- | --- | --- | --- | --- |
| **L0 基础组件** | Button / Input / Table / Form / Dialog 等 | Element Plus 直接使用，**仅注入主题 Token** | `element-plus` + `@bmp/theme` | 不新建 |
| **L1 业务通用组件** | 下表 §4.3 | **自研，发布 npm 包** | `@bmp/components` | **13**（UIUX §7.2 实测行数） |
| **L2 卡片组件** | 待办卡 / 消息卡 / 应用卡 / 数据卡 / 嵌入卡 / AI 简报卡 等（布局引擎物料） | 自研，注册进 card manifest | `@bmp/components` | 见 §4.4 |
| **移动端子包** | 移动业务组件 | 自研 | **`@bmp/components-mobile`**（Vant 基础） | 见 §4.5 |

> **⚠ 数量口径澄清**：规格简报 §二写「L1 自研 12 个」，同时提示「UIUX 原文列了 13 行，请以 UIUX §7.2 表格实际行数为准」。**实测 UIUX §7.2 表格为 13 行**：`PermButton` / `EmployeeSelect` / `OrgTreeSelect` / `TodoCard` / `MsgBell` / `AppNav` / `LayoutGrid` / `CardShell` / `AuditTraceLink` / `StatusTag` / `HighRiskConfirm` / `EmptyState` / `SearchFilterBar`。
> **核实命令**：`sed -n '724,739p' 麓邦业务中台UIUX设计文档.md | grep -c "^| \`"` → **`13`**
> **本规范以 13 个为准**（含 `TodoCard`）。术语沿用上游，不改名。

### 4.2 L0 层规范（Element Plus 注入主题）

**【强制】** L0 组件**禁止二次封装造型**，只做 **Token 注入 + 默认属性约定**：

| Element Plus 组件 | 必须注入的 Token | 默认属性约定 |
| --- | --- | --- |
| `el-button` | `--el-color-primary` ← `--accent`；圆角 ← `--bmp-radius-btn`(8px)；高度 34px | `size="default"`；主按钮 `type="primary"`；危险按钮 `type="danger"`（**仅错误/失败与高危**） |
| `el-input` / `el-select` | `border` ← `--line`；聚焦环 ← `--accent`；圆角 6px；高度 34px | 占位色 ← `--bmp-text-placeholder` |
| `el-table` | 表头底 ← `--surface-sunken`；行分隔 ← `rgba(0,0,0,.08)`；hover 行 ← `--surface` | `stripe` 关闭（靠 hover）；`border` 关闭 |
| `el-dialog` | 圆角 ← `--bmp-radius-lg`(12px)；遮罩 `rgba(0,0,0,.4)`；阴影 ← `--shadow-lift` | `:close-on-click-modal="false"`（高危场景） |
| `el-drawer` | 宽 640px；左侧 `--line`；阴影 ← `--shadow-lift` | `direction="rtl"` |
| `el-pagination` | 当前页 ← `--accent` | 每页 10/20/50/100 档 |
| `el-tag` | 高度 22px；`--r-pill` 胶囊；字号 caption | 语义色映射见 §2.1.4 |
| `el-form` / `el-form-item` | 必填星 ← danger 亮红（U-3）；错误文字 12px danger | 标签位置见 §6.1 |
| `el-switch` | 开启色 ← `--accent` | —— |
| `el-message` / `el-notification` | 边框 `--line`；阴影 ← `--shadow-soft`；圆角 `--bmp-radius-md` | 时长见 §5.1 |
| `el-steps` | 已完成 ← `--bmp-color-success`；当前 ← `--bmp-color-primary` | 对应 `.steps`（`common.css:298-308`） |
| `el-tree` | 选中 ← `--bmp-color-primary-light`；节点高 32px | 左树右表范式用 |
| `el-upload` | 拖拽区虚线 ← `--bmp-border-strong` | —— |
| `el-timeline` | 点 ← `--bmp-color-primary`；线 ← `--bmp-border` | 对应 `.timeline`（`common.css:316-322`） |

**【强制】** L0 注入方式：**统一在 `@bmp/theme` 中用 SCSS `@forward` + CSS 变量双写**（Element Plus 主题变量 + `--bmp-*` 变量），组件内**不得**写 `:deep()` 覆盖颜色。

### 4.3 L1 业务组件规格（13 个，逐个完整）

> 每个组件给 **用途 / 关键 API / props / events / 状态 / 无障碍要求 / 落地文件位置**。

#### 4.3.1 `PermButton`（权限按钮）

| 项 | 内容 |
| --- | --- |
| **用途** | 权限受控按钮。同时提供**指令版**（`v-perm`）与**组件版** |
| **关键 API** | `v-perm="'system:account:create'"`（指令版）；`<BmpPermButton perm="...">`（组件版） |
| **props** | `perm: string \| string[]`（权限码，数组为「任一满足」）<br>`disabledMode?: boolean`（无权限时**禁用+tooltip**而非隐藏，默认 `false`=隐藏）<br>`permTip?: string`（禁用态 tooltip 文案，默认 `无权限，可申请`）<br>`type?: 'primary' \| 'danger' \| 'default' \| 'text'`<br>`loading?: boolean`；`disabled?: boolean` |
| **events** | `click`（有权限且非禁用时透传）；`apply`（点击 tooltip 内「去申请」时触发，带 `perm` 参数） |
| **状态** | 默认 / hover / active / **禁用（无权限）** / **隐藏（无权限）** / loading / 无权限待申请 |
| **无障碍** | 隐藏模式：**不渲染 DOM**；禁用模式：`aria-disabled="true"` + `title`/`tooltip` 可键盘聚焦（`tabindex="0"`）；tooltip 内容含 `去申请` 可操作链接；权限码写入 `data-perm` 便于走查 |
| **落地位置** | `packages/components/src/perm-button/`（`BmpPermButton.vue` + `directive.ts` + `README.md` + Storybook）<br>原型参照：`assets/mock.js` 权限码用法、`console.js` 动态渲染 |
| **判定标准** | **隐藏 vs 禁用+tooltip** 判定见 §7.2 |

#### 4.3.2 `EmployeeSelect`（员工选择器）

| 项 | 内容 |
| --- | --- |
| **用途** | 员工选择（账号关联、成员管理、操作人筛选、审批人指定） |
| **关键 API** | `v-model`（`employee_no` 数组或字符串，`multiple` 决定）；远程搜索 |
| **props** | `multiple?: boolean`（默认 `false`）<br>`valueKey?: 'employee_no' \| 'account_id'`（默认 `employee_no`）<br>`placeholder?: string`（默认 `搜索姓名 / 工号 / 拼音`）<br>`disabled?: boolean`；`clearable?: boolean`（默认 `true`）<br>`maxTagCount?: number`（多选时标签折叠，默认 `3`）<br>`statusFilter?: ('active' \| 'inactive')[]`（按任职状态过滤） |
| **events** | `update:modelValue`；`change`（值变更）；`search`（关键词，可外接自定义接口）；`focus` / `blur` |
| **状态** | 默认 / 聚焦（品牌红聚焦环 `0 0 0 3px rgba(200,22,29,.08)`）/ 加载（选项区骨架）/ 空（`没有找到「{kw}」相关员工`）/ 错误（`加载失败，请重试`）/ 禁用 / 多选溢出 |
| **无障碍** | `role="combobox"` + `aria-autocomplete="list"` + `aria-expanded`；方向键上下导航 + Enter 选中 + Esc 关闭；**回显必须含工号+姓名**（`工号 姓名`），不只用姓名（重名风险）；候选项禁用态需 `aria-disabled` |
| **落地位置** | `packages/components/src/employee-select/`<br>接口约定：`GET /v1/employees?kw=&status=` |
| **备注** | 审计日志筛选的「操作人」、角色成员管理、账号关联均复用本组件 |

#### 4.3.3 `OrgTreeSelect`（组织树选择）

| 项 | 内容 |
| --- | --- |
| **用途** | 组织节点选择（部门筛选、数据范围、组织归属） |
| **关键 API** | `v-model`（`org_id` 或数组） |
| **props** | `multiple?: boolean`<br>`lazy?: boolean`（**默认 `true`**，懒加载）+ `load: (node) => Promise<OrgNode[]>`<br>`includeDisabled?: boolean`（**含/不含停用节点开关**，默认 `false`=不含）<br>`checkStrictly?: boolean`（父子不联动）<br>`placeholder?: string`（默认 `选择组织`）<br>`showSearch?: boolean`（默认 `true`，搜索定位） |
| **events** | `update:modelValue`；`change`（含选中节点完整对象）；`node-click`；`expand` |
| **状态** | 默认 / 展开 / 加载子节点（`loading` 行内）/ 搜索无结果（`没有匹配的组织`）/ 错误（`组织树加载失败 [重试]`）/ 禁用（停用节点置灰 + 后缀标签「已停用」）/ 权限不足（**裁剪到有权子树**，不显示无权节点） |
| **无障碍** | `role="tree"` + `role="treeitem"`；`aria-level` / `aria-expanded` / `aria-selected`；键盘：↑↓ 移动、→ 展开、← 收起、Enter 选中；搜索命中节点需高亮且可键盘跳转 |
| **落地位置** | `packages/components/src/org-tree-select/`<br>接口：`GET /v1/orgs/tree?parentId=` |
| **备注** | UI-C-06/07 左树右表范式的「左树」与筛选区的组织选择共用 |

#### 4.3.4 `TodoCard`（待办卡片）

| 项 | 内容 |
| --- | --- |
| **用途** | 待办 / 审批卡片的统一渲染（门户待办中心、首页时间轴流、移动待办列表、审批中心） |
| **关键 API** | `<BmpTodoCard :todo="todo" @handle="..." @urge="..." />` |
| **props** | `todo: object`（**必填**，含 `todoId` / `title` / `sourceSystem` / `urgency(0\|1\|2)` / `remainHours` / `overdueHours` / `submitter` / `submitTime` / `summary` / `jumpUrl`）<br>`urgencyDot?: boolean`（显示紧急度圆点，默认 `true`）<br>`showCountdown?: boolean`（剩余时间倒计时，默认 `true`）<br>`density?: 'loose' \| 'normal' \| 'compact'`（随 `data-density`）<br>`selectable?: boolean`（批量勾选）<br>`readonly?: boolean`（已办视图）<br>`overdueRed?: boolean`（超时红字，默认 `true`） |
| **events** | `handle`（去处理）；`urge`（催办）；`select`（勾选变更）；`click`（整行点击） |
| **slots** | `ops`（操作区）；`title-extra`（标题右侧标签）；`footer`（底部扩展） |
| **状态** | 默认 / hover（升 `--bmp-shadow-2`）/ 选中（`--bmp-color-primary-light` 底）/ **紧急（左侧 3px 品牌红 `var(--accent)` 色条）** / 重要（3px `--bmp-color-warning`）/ 普通（3px `--bmp-color-info`）/ **超时（`已超时 Xh` 品牌红字）** / 临期（`剩余 X 小时` 品牌红字，到期前 2h 起）/ 加载（骨架）/ 错误（`待办加载失败 [重试]`） |
| **无障碍** | 整卡 `role="article"` + `aria-label="{标题} · {来源} · {紧急度} · {剩余时间}"`；勾选框独立可聚焦；**紧急度不得只靠颜色传达**（需同时有文字「紧急」/圆点 + `aria-label`）；触控高度（移动端）≥44px |
| **落地位置** | `packages/components/src/todo-card/`；移动端子包 `components-mobile/src/todo-card/` |
| **❗ 必读** | **紧急度色条必须用 `var(--accent)`（品牌红），禁止 `--bmp-color-danger`** —— 见 §2.1.3 反例，当前 `todos.html:20` / `approval.html:24` 为**错误示范** |

#### 4.3.5 `MsgBell`（顶栏消息铃铛）

| 项 | 内容 |
| --- | --- |
| **用途** | 门户/管理端顶栏消息入口，展示未读数与最近消息下拉 |
| **关键 API** | `<BmpMsgBell :count="3" @jump="..." />` |
| **props** | `count: number`（未读数；**为 0 时不显示角标**，不渲染 `<sup>`）<br>`maxCount?: number`（超此值显示 `99+`，默认 `99`）<br>`recent?: Message[]`（下拉最近 N 条）<br>`pollInterval?: number`（轮询间隔，默认 `30000`ms） |
| **events** | `jump`（跳消息中心）；`read`（点击某条已读）；`refresh`（手动刷新） |
| **状态** | 默认（无未读）/ 有未读（`--accent` 角标）/ 加载（下拉骨架 5 行）/ 空（`暂无新消息`）/ 错误（`消息加载失败 [重试]`）/ 轮询中（**静默，不显示 loading**） |
| **无障碍** | `aria-label="消息，{n} 条未读"`；角标文本不被屏幕阅读器重复（角标 `aria-hidden="true"`，未读数进 `aria-label`）；下拉可 Esc 关闭；快捷键可选 `⌘K` 体系不冲突 |
| **落地位置** | `packages/components/src/msg-bell/`；顶栏集成见 `common.css:224-226`（`.icon-btn` + `.badge-n`） |
| **❗ 必读** | 未读角标色应为 `--accent`（品牌红），当前 `common.css:116` 用 `--bmp-color-danger`（**P1 待修**，见 §2.1.3 反例表） |

#### 4.3.6 `AppNav`（应用宫格 / 列表）

| 项 | 内容 |
| --- | --- |
| **用途** | 应用入口渲染（首页「全部应用」、应用中心、我的订阅、意图流） |
| **关键 API** | `<BmpAppNav :apps="apps" mode="grid\|list" />` |
| **props** | `apps: App[]`（含 `appId` / `name` / `icon` / `url` / `freq` / `scope`）<br>`mode?: 'grid' \| 'list'`（默认 `'grid'`）<br>`sortBy?: 'freq' \| 'name' \| 'custom'`（默认 `'freq'`）<br>`favoriteFirst?: boolean`（**V1.5** 收藏置顶）<br>`maxVisible?: number`（超出收「更多」，默认 `12`）<br>`lazyIcon?: boolean`（图标懒加载，默认 `true`） |
| **events** | `open`（打开应用，**新标签页**，决议 #5）；`favorite`（收藏切换，V1.5）；`more` |
| **状态** | 默认 / hover（`--surface` 底）/ 图标加载中（占位方块）/ 图标失败（首字母回退块）/ 空（`还没有可用的应用`）/ 错误（`应用列表加载失败 [重试]`）/ 无权限过滤后为空（`暂无可用应用，请联系管理员`） |
| **无障碍** | 每项为 `<a>` 或 `role="link"`；`aria-label="{应用名}"`；键盘 Tab 可达、Enter 打开；**图标必须有文字标签**（不得只图标）；`target="_blank"` 需带 `rel="noopener"`；`aria-label` 提示「在新标签页打开」 |
| **落地位置** | `packages/components/src/app-nav/` |
| **❗ 硬规则** | **图标点击一律新标签页**（决议 #5，不因 #5b 改变）；排序默认 `freq` 降序，V1.5 起由埋点累计（A1-F05） |

#### 4.3.7 `LayoutGrid`（布局引擎渲染器）

| 项 | 内容 |
| --- | --- |
| **用途** | 解析 `template_json` → 渲染卡片 → 支持编辑模式拖拽/缩放/显隐（**A1-F02 核心**） |
| **关键 API** | `<BmpLayoutGrid :template="json" :editable="false" :override="userOverride" />` |
| **props** | `template: TemplateJson`（**必填**，`{version, cards: [{cardId, grid, order, visible, props}]}`）<br>`editable?: boolean`（编辑模式，默认 `false`）<br>`override?: UserOverrideJson`（用户级覆盖，深合并；**cardId 集合不可增删**）<br>`columns?: 1 \| 2 \| 3`（栏数，由模板/断点决定；**v2 = 3**）<br>`gutter?: number`（默认 `16`）<br>`colSpan?: 'left' \| 'center' \| 'right'`（**每栏为独立 24 栅格容器**） |
| **events** | `update:override`（编辑模式下变更）；`save`；`reset`（恢复默认模板）；`drop`（跨栏拖拽被拒时触发，用于提示）；`card-error`（单卡加载失败） |
| **状态** | 默认 / 加载（按可见卡片渲染骨架）/ **单卡错误（降级占位，不影响其他卡）** / 空（`暂无卡片，请联系管理员配置`）/ 编辑模式（拖拽手柄 + 显隐开关 + 跨栏禁拖拽提示）/ 保存中 / 保存失败（`保存失败，请重试 [重试]`） |
| **无障碍** | 编辑模式：拖拽必须提供**键盘等价操作**（卡片聚焦后 `Alt+↑/↓` 调序、`Alt+←/→` 换栏、`Space` 切换显隐）；卡片容器 `role="region"` + `aria-label="{卡片名}"`；**跨栏禁拖拽**需 `aria-describedby` 提示原因（栏宽由模板层决定）；焦点顺序按 左栏→中栏→右栏 |
| **落地位置** | `packages/components/src/layout-grid/`<br>协议见 UIUX §8.3；注册表 `cards/registry.ts` |
| **❗ 硬规则** | ① **不删除任何既有 cardId**（老用户 `user_override_json` 可能引用，删除导致覆盖配置静默失效）；② `cardId` 集合不可增删（`applyOverride` 按 cardId 精确匹配）；③ 嵌入卡 `cardId` 形如 `embed:<唯一id>`（A1-F08-1） |

#### 4.3.8 `CardShell`（卡片容器）

| 项 | 内容 |
| --- | --- |
| **用途** | 所有 L2 卡片的统一外壳：卡片头（标题/更多/刷新）+ 加载骨架 + 错误降级占位 |
| **关键 API** | `<BmpCardShell title="我的订阅" :loading="false"><slot /></BmpCardShell>` |
| **props** | `title: string`（**必填**）<br>`loading?: boolean`<br>`error?: ErrorInfo \| null`（含 `code` / `message`）<br>`collapsible?: boolean`（可折叠，默认 `false`）<br>`moreText?: string`（默认 `更多`，无 `more` 事件时不渲染）<br>`refreshable?: boolean`（显示刷新按钮，默认 `false`）<br>`padding?: 'default' \| 'none'`（默认 `'default'`=16px） |
| **events** | `more`（点击「更多」）；`refresh`（点击刷新）；`retry`（错误态重试）；`collapse` |
| **状态** | 默认 / 加载（标题保留 + 内容骨架）/ 错误（标题保留 + `卡片加载失败 [重试]`）/ 空（标题保留 + 内容区空态）/ 折叠（内容收起，头部保留）/ 刷新中（刷新图标旋转） |
| **无障碍** | 卡片头 `role="heading" aria-level="3"`；刷新按钮 `aria-label="刷新{标题}"`；折叠按钮 `aria-expanded`；错误态 `role="alert"`；**卡片头与内容用 `aria-labelledby` 关联** |
| **落地位置** | `packages/components/src/card-shell/`；样式参照 `common.css:78-85`（`.card` + `.card-head`） |
| **❗ 硬规则** | 卡片头标题字距 `-.2px`（§2.2.3）；卡片静止用细边框（`--line`）+ 可选 `--bmp-shadow-1`，**禁止**静止即 `--shadow-soft` |

#### 4.3.9 `AuditTraceLink`（trace_id 链接）

| 项 | 内容 |
| --- | --- |
| **用途** | `trace_id` 一键复制 + 跳转审计检索预填（E2 链路排查） |
| **关键 API** | `<BmpAuditTraceLink :trace-id="id" />` |
| **props** | `traceId: string`（**必填**）<br>`copyable?: boolean`（默认 `true`）<br>`jumpable?: boolean`（默认 `true`，有审计权限时跳转）<br>`truncate?: number`（展示截断长度，默认 `16`，超长中间省略）<br>`mono?: boolean`（等宽字体，默认 `true`） |
| **events** | `copy`（复制成功）；`jump`（跳转审计检索） |
| **状态** | 默认（等宽 + 复制图标）/ hover（显示完整值 tooltip）/ 复制成功（图标变 ✅ + Message「已复制」2s）/ 复制失败（降级：显示可手动选中的完整文本）/ 无审计权限（**只可复制，跳转图标隐藏**）/ 空值（渲染 `—`） |
| **无障碍** | `role="button"` + `aria-label="复制链路 ID {traceId}"`；键盘 Enter/Space 触发复制；复制结果用 `aria-live="polite"` 播报；**不得只用图标表意**，需有可访问名称 |
| **落地位置** | `packages/components/src/audit-trace-link/`；跳转目标 `/console/audit?trace_id=` |

#### 4.3.10 `StatusTag`（状态标签）

| 项 | 内容 |
| --- | --- |
| **用途** | 全站状态视觉统一（启用/停用/锁定/待审核/已通过/已驳回/草稿/进行中…） |
| **关键 API** | `<BmpStatusTag type="account-status" status="locked" />` |
| **props** | `type: string`（状态域：`account-status` / `role-source` / `todo-status` / `msg-status` / `sync-result` / `template-status` / `route-status` / `banner-status` / `approve-status`…）<br>`status: string \| number`（状态值）<br>`text?: string`（覆盖默认文案）<br>`pill?: boolean`（胶囊，默认 `true`，`--r-pill`）<br>`size?: 'default' \| 'small'`（高度 22px / 20px）<br>`showIcon?: boolean`（默认 `false`） |
| **events** | `click`（可选） |
| **状态** | 各语义态：success（绿）/ warning（橙）/ danger（亮红）/ info（中性灰）/ primary（品牌红）/ 默认（无匹配 → info + 原文） |
| **语义映射（【强制】唯一口径）** | 账号：启用=success、停用=info、**锁定=danger**；待办：待处理=warning、已处理=success、**超时=primary（品牌红）**；同步结果：成功=success、部分失败=warning、**失败=danger**；模板：草稿=info、待审核=warning、已启用=success、停用=info；Banner：未展示=info、展示中=success、已过期=info；路由：启用=success、停用=info |
| **无障碍** | 颜色**不得为唯一信息来源**（必须有文字）；`role="status"`（动态变化时）；标签文字不含 emoji 单独表意 |
| **落地位置** | `packages/components/src/status-tag/`；样式参照 `common.css:46-51`（`.tag-*`） |
| **❗ 硬规则** | **超时 ≠ danger**：超时用 `primary`（品牌红 `--accent`）；danger 仅错误失败（§2.1.3） |

#### 4.3.11 `HighRiskConfirm`（高危确认弹窗）

| 项 | 内容 |
| --- | --- |
| **用途** | 停用账号 / 强制下线 / 删除模板 / 切换权威源 / 恢复默认风格等高危操作确认 |
| **关键 API** | `<BmpHighRiskConfirm v-model="show" :object-name="name" @confirm="..." />` |
| **props** | `modelValue: boolean`（显隐）<br>`title: string`（默认 `确认{操作名}`）<br>`objectName: string`（**必填**，需用户输入或勾选确认的对象名）<br>`confirmMode?: 'input' \| 'checkbox'`（默认 `'input'`，输入对象名）<br>`description?: string`（`slot` 优先）<br>`confirmText?: string`（**按钮文案用具体动词**，如 `停用账号`，**禁止 `确定`**）<br>`danger?: boolean`（默认 `true`，危险按钮亮红）<br>`auditTip?: string`（审计说明，默认 `该操作将写入审计日志`） |
| **events** | `update:modelValue`；`confirm`；`cancel` |
| **slots** | `default`（说明区）；`audit`（审计说明区） |
| **状态** | 默认（确认按钮**禁用**，直至输入匹配）/ 输入不匹配（保留按钮禁用 + 提示 `名称不一致`）/ 输入匹配（按钮可用）/ 提交中（loading）/ 提交失败（`{操作}失败：{原因} [重试]`，弹窗不关闭）/ 成功（关闭 + Message） |
| **无障碍** | `role="dialog" aria-modal="true"` + `aria-labelledby`（标题）+ `aria-describedby`（说明）；**焦点圈定在弹窗内**（Tab 循环）；初始焦点在输入框或取消按钮（**不在危险按钮**）；Esc = 取消；`:close-on-click-modal="false"`；危险按钮有 `aria-label` 含对象名 |
| **落地位置** | `packages/components/src/high-risk-confirm/`；样式参照 `common.css:126-137`（`.modal`）、`:196-198`（`.hr-input-hint`） |
| **❗ 用例清单** | 停用账号 / 强制下线 / 重置密码 / 删除消息模板 / 切换权威源 / 编辑网关路由 / 全部已读 / 恢复默认风格（A1-F06-5，**只清 `ui_style` 不清布局 override**） |

#### 4.3.12 `EmptyState`（空态）

| 项 | 内容 |
| --- | --- |
| **用途** | §3.2 六态中「空态」的组件化实现（含 4 种插图类型） |
| **关键 API** | `<BmpEmptyState type="no-data" :actions="[{text:'去应用中心看看',to:'/apps'}]" />` |
| **props** | `type: 'no-data' \| 'no-permission' \| 'no-result' \| 'network-error'`（**插图类型**，必填）<br>`title?: string`（默认按 type 取值）<br>`description?: string`<br>`actions?: Array<{text, to?, handler?, type?: 'primary' \| 'default'}>`（**空态必带**，最多 2 个）<br>`size?: 'sm' \| 'md' \| 'lg'`（插图 80 / 120 / 160px）<br>`errorCode?: string`（`network-error` 时展示） |
| **events** | `action`（点击任一 action，带 index） |
| **状态** | 4 类（no-data / no-permission / no-result / network-error）；各含插图 + 标题 + 说明 + 按钮 |
| **无障碍** | 容器 `role="status"`（首次渲染）；插图 `aria-hidden="true"`（装饰）；**标题进入焦点或 `aria-live="polite"` 播报**；按钮为真实 `<button>`/`<a>`，键盘可达；`no-permission` 时**不得**在 DOM 中暴露资源名 |
| **落地位置** | `packages/components/src/empty-state/`；样式参照 `common.css:165-168`（`.state-box`）、`:325-326`（`.empty-tip`） |
| **❗ 硬规则** | **`no-data` / `no-result` 类型必须传 `actions`**（否则控制台警告）；`no-permission` 的 `description` **不得含资源信息** |

#### 4.3.13 `SearchFilterBar`（筛选区）

| 项 | 内容 |
| --- | --- |
| **用途** | 管理端/门户列表页的配置化筛选区，**折叠/展开 + URL query 双向同步** |
| **关键 API** | `<BmpSearchFilterBar :fields="fields" v-model="query" @search="..." />` |
| **props** | `fields: FilterField[]`（`{key, label, type: 'input'\|'select'\|'date'\|'daterange'\|'employee'\|'orgtree'\|'tags', options?, placeholder?, span?}`）<br>`modelValue: object`（**与 URL query 双向同步**，刷新/分享保留筛选）<br>`defaultVisible?: number`（默认展示条件数，默认 `4`；「更多筛选」展开其余）<br>`collapsible?: boolean`（默认 `true`）<br>`showReset?: boolean`（默认 `true`）<br>`syncUrl?: boolean`（默认 `true`） |
| **events** | `update:modelValue`；`search`（点击查询，**重置到第 1 页**）；`reset`（清空所有条件 + 清 URL query）；`expand`（展开更多筛选）；`field-change` |
| **状态** | 默认（≤4 条件 + 「更多筛选」）/ 展开（全部条件）/ 查询中（查询按钮 loading）/ 无结果（列表区走 `EmptyState type="no-result"`）/ 校验失败（如日期起>止：字段级错误 `结束时间不能早于开始时间`）/ URL 携带非法参数（忽略并提示 `部分筛选条件已失效`） |
| **无障碍** | 每个字段 `<label for>` 关联；`collapsible` 按钮 `aria-expanded` + `aria-controls`；「更多筛选」展开后**焦点不移走**；查询按钮为主要操作（品牌红）；**Enter 提交**（input 上）；重置按钮 `aria-label="清空筛选条件"` |
| **落地位置** | `packages/components/src/search-filter-bar/`；样式参照 `common.css:275-285`（`.filter-bar` / `.filter-tools`）、`:283-285`（`.list-toolbar`） |
| **❗ 硬规则** | ① 筛选条件与 URL 双向同步（UIUX §4.4）；② **查询重置分页到第 1 页**；③ 默认展示 ≤4 个高频条件；④ 4 列网格布局（`common.css:279`） |

---

### 4.4 L2 卡片组件（布局引擎物料）

| cardId | 名称 | 归属栏 | 状态 | 依据 |
| --- | --- | --- | --- | --- |
| `ai-brief` | AI 今日简报 | 左 | v2 新增 | UIUX §5.3、PRD A1-F05 |
| `intent-stream` | 意图流 | 左 | v2 新增 | UIUX §5.3 |
| `all-apps` | 全部应用 | 左 | v2 新增 | UIUX §5.3 |
| `urgency-stream` | 紧迫度时间轴流 | 中 | v2 新增 | UIUX §5.3（三组四维衰减） |
| `watch-list` | 关注与动态 | 右 | v2 新增 | UIUX §5.3 |
| `my-subscriptions` | 我的订阅 | 右 | v2 新增 | UIUX §5.3 |
| `quick-stats` | 本月速览 | 右 | v2 新增 | UIUX §5.3 |
| `embed:<唯一id>` | 嵌入页面卡 | 任意 | v2 新增（多实例） | PRD A1-F08-1 |
| `todo-list` | 待办列表 | 任意 | **legacy（`visible:false`）** | UIUX §5.3 |
| `notice-msg` | 消息公告 | 任意 | **legacy** | UIUX §5.3 |
| `birthday` | 生日提醒 | 任意 | **legacy** | UIUX §5.3 |
| `data-metrics` | 数据指标 | 任意 | **legacy** | UIUX §5.3 |
| `frequent-apps` | 常用应用 | 任意 | **legacy** | UIUX §5.3 |
| `quick-stats`（旧） | 快捷统计 | 任意 | **legacy** | UIUX §5.3 |

**【强制`cardId` 硬规则】** ① **不删除任何既有 cardId**；② 新默认模板只改其 `visible / order`；③ 嵌入卡 `cardId` 必须唯一（`embed:<id>`），实例 `params` 与 `user_override` **分两个 key 持久化**（`bmp_embed_cards` 存 `params`）。

**L2 卡片通用要求**

| 要求 | 规格 |
| --- | --- |
| 外壳 | 一律用 `CardShell` 包裹（统一头/骨架/错误降级） |
| manifest | `{ cardId, name, component(异步), defaultProps, dataApi, minGrid, icon }` 注册进 `cards/registry.ts` |
| 懒加载 | 首屏仅加载 `visible` 卡片（分包） |
| 降级 | 单卡失败 → `卡片加载失败 [重试]`，**不影响其他卡片** |
| 空态 | 每卡必须有独立空态（不许整卡空白） |
| `minGrid` | 最小栅格宽度（如 `ai-brief` = 8） |

### 4.5 移动端子包 `@bmp/components-mobile`

| 组件 | 说明 | 依据 |
| --- | --- | --- |
| `MobileTabBar` | 底部 Tab 全局导航（5 项：首页/待办/审批/消息/我的）；未读角标（**为 0 不显示**）；`env(safe-area-inset-bottom)`；触控 ≥44px | PRD A2-F05、A2-F05-1 |
| `MobileActionBar` | 底部行动栏（**滚动后出现**，阈值 `ACTION_SHOW_AT`）；`bottom: var(--bottom-chrome)`；z30 | PRD A2-F05-3 |
| `MobileTodoCard` | 移动待办卡（内容等价 `TodoCard`，触控区 ≥44px） | UIUX §5.6 |
| `MobileApprovalDetail` | 移动审批详情（标题 + 来源标签 + key-value 摘要 + 底部固定操作栏） | UIUX §5.6 |
| `MobileMsgCard` | 消息卡片落地页 | UIUX §5.6 / UI-M-04 |
| `MobileIntentChips` | 意图胶囊（横向滚动，取代旧「金刚区」） | UIUX §5.6 |
| `MobileBanner` | 移动通知 Banner（**不吸顶、无条目不占位**） | PRD A1-F07-2 |
| `MobileEmbedEntry` | 嵌入页面入口卡（**移动端不渲染 iframe**，改走新标签页） | PRD A1-F08-5 |
| `MobileSheet` | 底部抽屉（AI 对话 / 任务处理 / 全部应用），z60 | UIUX §5.6 |

**【强制】** 移动端所有组件：① 触控区 ≥44px；② 含安全区适配；③ 沿用 Notion Token（**不照搬旧版配色**）；④ 滑动操作（如待办左滑催办）**必须提供按钮等价操作**（可访问性，UIUX §8.5）。

### 4.6 组件设计约定（UIUX §7.3 落地）

| 约定 | 规格 |
| --- | --- |
| 命名 | **`Bmp` 前缀**（`BmpEmployeeSelect`）；组件名 PascalCase |
| props | **camelCase** |
| events | **kebab-case** |
| Token | 全部组件支持主题 Token 注入，**禁止硬编码色值/字号/间距** |
| 交付物 | 源码 + TypeScript 类型 + **Storybook 示例** + README（含与设计稿映射截图） |
| 移动端子包 | `@bmp/components-mobile`（Vant 基础 + 移动业务组件） |

### 4.7 §4 走查 checklist

- [ ] L1 组件 **13 个全部实现**，且与 UIUX §7.2 表格逐行对应（脚本比对）
- [ ] 每个组件有 props 类型定义 + events 声明 + Storybook 示例 + README
- [ ] 组件内**零硬编码色值**（扫描：`grep -nE "#[0-9A-Fa-f]{3,8}" packages/components/src/**/*.vue` 应为 0）
- [ ] 组件内使用 `font: var(--bmp-font-*)` 简写，无阶梯外字号
- [ ] 所有交互元素**键盘可达**（Tab/Enter/Space/Esc/方向键）
- [ ] 危险按钮（`HighRiskConfirm`）初始焦点不在危险按钮上
- [ ] 拖拽（`LayoutGrid` 编辑模式）有键盘等价操作
- [ ] 状态标签颜色**不是唯一信息源**（均有文字）
- [ ] `StatusTag` 的超时用 `primary`（品牌红），**非** `danger`
- [ ] `TodoCard` 紧急度色条用 `var(--accent)`（品牌红）
- [ ] `MsgBell` 角标为 `--accent`，且为 0 时不渲染
- [ ] `EmptyState` 的 `no-data`/`no-result` 必带 `actions`
- [ ] `SearchFilterBar` 与 URL query 双向同步，查询重置分页
- [ ] L2 卡片全部经 `CardShell` 包裹，且**无 cardId 被删除**
- [ ] 移动端组件触控 ≥44px，且滑动操作有按钮等价

---

## §5 反馈与确认规范

### 5.1 反馈模式使用边界（承接 UIUX §4.3）

| 模式 | 使用场景 | 时长 / 行为 | 位置 | 无障碍 |
| --- | --- | --- | --- | --- |
| **Message（轻提示）** | 操作成功/失败即时反馈 | **成功 2s 自动消失；失败 3s** | 视口顶部居中（`#msg-root` `top:16px`），z2000 | `role="alert"` + `aria-live="assertive"`（失败）/ `polite`（成功） |
| **Notification（通知）** | 系统级通知、新待办到达 | **5s，可点击跳转** | **右上角** | `role="alert"`；可键盘关闭 |
| **Dialog（模态）** | 高危确认、表单填写（字段 ≤8） | **必须显式关闭** | 视口中心，z1000/1001 | `aria-modal="true"` + 焦点圈定 |
| **Drawer（抽屉）** | 详情查看、长表单、配置面板 | 保留列表上下文 | **右侧 640px**，z1000/1001 | 焦点圈定 + Esc 关闭 |
| **行内反馈** | 表单字段校验错误 | 常驻至修正 | 字段下方 | `aria-describedby` 关联输入框 |
| **顶部横幅（Banner）** | 网络异常 / 只读提示 / 通知 Banner | 常驻（可关闭） | 顶部 | `role="status"` |
| **按钮内联 spinner** | 提交类操作防重复 | 至请求完成 | 按钮内 | `aria-busy="true"` |

**时长令牌（建议）**：`--bmp-msg-success: 2000ms` / `--bmp-msg-error: 3000ms` / `--bmp-notification: 5000ms`

**【强制】边界判定表（何时用哪个）**

| 场景 | 选择 | 理由 |
| --- | --- | --- |
| 保存成功、复制成功、已读 | **Message** | 无需中断 |
| 保存失败（可重试） | **Message**（失败 3s，含原因） | 不中断，用户可重新点 |
| 表单提交失败（需修正字段） | **行内反馈** + Message 汇总 | 定位到具体字段 |
| 有新待办到达（推送） | **Notification** | 需可点击跳转 |
| 停用账号 / 强制下线 / 删除 | **Dialog**（`HighRiskConfirm`） | 不可逆，必须显式确认 |
| 表单字段 ≤8 个 | **Dialog** | 轻量，不必跳页 |
| 表单字段 >8 个 / 长配置 | **Drawer** 或 独立页 | 保留上下文 |
| 列表行详情 | **Drawer** | 保留列表上下文 |
| 全部已读 / 批量操作确认 | **Dialog**（轻量） | 影响多条 |
| 网络断开 | **顶部横幅** | 全局性 |
| 只读（权威源同步） | **顶部只读横幅** | 常驻提示 |

### 5.2 高危操作规范（`HighRiskConfirm`）

> **【强制】** 停用账号、强制下线、删除模板、切换权威源、重置密码、编辑网关路由、恢复默认风格 —— 必须满足以下 5 条。

| # | 要求 | 说明 |
| --- | --- | --- |
| 1 | **必须二次确认** | Dialog 模态，`:close-on-click-modal="false"` |
| 2 | **必须输入对象名称或勾选确认** | `confirmMode: 'input'`（默认）—— 输入对象名匹配后才启用按钮；简单场景可 `'checkbox'` |
| 3 | **按钮文案用具体动词** | `停用账号` / `强制下线` / `删除模板`；**禁止** `确定` / `是` / `OK` |
| 4 | **危险按钮亮红** | `--bmp-color-danger` `#F53F3F`（**§2.1.3：高危属错误/失败侧的「破坏性」，用 danger 亮红**） |
| 5 | **必须有审计说明** | `auditTip`：`该操作将写入审计日志`；涉及对象名、操作人、时间 |

**可复制文案模板**

| 操作 | 标题 | 说明 | 输入提示 | 按钮 |
| --- | --- | --- | --- | --- |
| 停用账号 | `停用账号` | `停用后该账号将无法登录，关联会话立即失效` | `请输入账号名 {name} 以确认` | `停用账号` |
| 强制下线 | `强制下线` | `该账号当前有 {n} 个在线会话，强制下线后需重新登录` | `请输入账号名 {name} 以确认` | `强制下线` |
| 重置密码 | `重置密码` | `将生成随机密码，仅展示一次，请通过安全渠道发送` | ——（checkbox 模式） | `重置密码` |
| 删除模板 | `删除模板` | `删除后引用该模板的发送任务将失败，且不可恢复` | `请输入模板编码 {code} 以确认` | `删除模板` |
| 切换权威源 | `切换权威源` | `启用后中台组织人员数据将以该源为准，现有手工数据将被覆盖` | `请输入「切换权威源」以确认` | `切换权威源` |
| 编辑网关路由 | `保存路由变更` | `变更将立即生效并写入审计日志` | ——（checkbox 模式） | `保存变更` |
| 全部已读 | `全部标记为已读` | `将把 {n} 条未读消息标记为已读` | ——（checkbox 模式） | `全部已读` |
| 恢复默认风格 | `恢复默认风格` | `将恢复「麓邦红 + 标准密度 + 标准圆角」，**首页布局个性化不受影响**` | ——（checkbox 模式） | `恢复默认` |
| 会话过期（非高危） | `登录已过期` | 见 §3.6 | —— | `重新登录` |

> **【强制】恢复默认风格的特例**：文案必须显式说明「**只清 `ui_style`，不清布局覆盖 `user_override`**」（PRD A1-F06-5），避免用户误以为会丢失首页布局。

### 5.3 成功/失败反馈文案规范

| 类型 | 模板 | 示例 |
| --- | --- | --- |
| 成功（创建） | `已创建{对象}` | `已创建角色「财务审批员」` |
| 成功（更新） | `已保存{对象}` | `已保存账号信息` |
| 成功（删除） | `已删除{对象}` | `已删除消息模板「待办通知」` |
| 成功（批量） | `已{动作} {n} 条{对象}` | `已催办 2 条待办` |
| 成功（异步） | `{任务}已提交，完成后将通知你` | `导出任务已提交，完成后将通知你` |
| 失败（校验） | `{字段}：{具体原因}` | `用户名：仅支持 4-32 位字母与数字` |
| 失败（业务） | `{操作}失败：{原因}。{解法}` | `停用失败：该账号为系统预置账号，不可停用。请联系管理员` |
| 失败（网络） | `网络异常，{操作}未完成，请重试` | `网络异常，保存未完成，请重试` |
| 警告（部分成功） | `已{动作} {n} 条，{m} 条失败（{原因}）` | `已停用 8 个账号，2 个失败（系统预置账号不可停用）` |

**【强制】** ① **禁止**只写「操作失败」；② 失败消息必须含**原因 + 解法**；③ 批量操作必须报告**成功/失败条数**；④ 部分失败时提供「查看失败明细」。

### 5.4 反馈并发与去重

| 场景 | 规则 |
| --- | --- |
| 同一操作的连续点击 | 提交按钮 **loading 态防重复**（UIUX §4.4） |
| 同类 Message 高频触发 | **合并为 1 条**（同一内容 3s 内不重复弹出，或计数 `已{动作} {n} 次`） |
| 催办去重 | 24h 内同一待办催办去重，重复点击提示 `今日已催办`（UIUX §5.4、A4-F04） |
| Toast 堆叠 | 最多同时 3 条，超出入队（`#msg-root` flex column，`common.css:152`） |
| 埋点上报失败 | **静默失败**，不弹任何提示（PRD §6.1.3） |

### 5.5 §5 走查 checklist

- [ ] 每个操作都有成功/失败反馈，且时长符合（成功 2s / 失败 3s / Notification 5s）
- [ ] 失败提示含**原因 + 解法**，无裸「操作失败」
- [ ] 批量操作报告成功/失败条数，并提供失败明细入口
- [ ] 高危操作满足 5 条（二次确认 / 输入对象名 / 具体动词 / 亮红按钮 / 审计说明）
- [ ] 高危弹窗初始焦点不在危险按钮，Esc 可取消
- [ ] 「恢复默认风格」文案显式说明不清布局覆盖
- [ ] Message 有 `role="alert"`，失败用 `aria-live="assertive"`
- [ ] 提交按钮有 loading 防重复
- [ ] 催办去重提示「今日已催办」
- [ ] 埋点失败不弹提示

---

## §6 表单与表格规范

### 6.1 表单规范

#### 6.1.1 标签对齐（【强制】按端区分）

| 端 | 对齐方式 | 依据 | 落地 |
| --- | --- | --- | --- |
| **管理控制台** | **标签右对齐**（`label-position="right"`），标签宽度按最长字段 96~120px 统一 | UIUX §4.4 | `common.css:61`（`.field > label` 当前为 `display:block` 顶部对齐 → **需按端覆盖**） |
| **弹窗 / Dialog** | **顶部对齐**（`label-position="top"`） | UIUX §4.4 | `common.css:60-61` |
| **移动端** | **顶部对齐** | UIUX §4.4 | `components-mobile` |

#### 6.1.2 必填与校验时机

| 项 | 规格 |
| --- | --- |
| 必填标记 | **红星前置**（`<span class="req">*</span>`，色 = `--bmp-color-danger`，`margin-right: 2px`）—— 见 `common.css:62`（**U-3 裁定保留 danger 亮红**） |
| 校验时机 | **失焦校验（blur）+ 提交时全量校验**（UIUX §4.4） |
| 错误提示位置 | **字段下方**，红色 12px（`--bmp-font-caption` + `--bmp-color-danger`） |
| 错误态边框 | `border-color: var(--bmp-color-danger)`（`common.css:73`） |
| 错误提示关联 | `aria-describedby` 指向错误文字；`aria-invalid="true"` |
| 输入长度提示 | 字段下方灰色 12px（`.field .tip`，`common.css:75`） |
| 长表单 | **分步骤**（向导）或**分区卡片**（UIUX §4.4） |
| 提交按钮 | **loading 态防重复**（UIUX §4.4） |
| **防重复提交** | 提交期间按钮禁用 + loading；同一表单 3s 内不可重复提交 |

**校验错误文案模板（【强制】含具体规则）**

| 字段 | 错误文案 |
| --- | --- |
| 用户名 | `仅支持 4-32 位字母与数字` |
| 必填空值 | `请输入{字段名}` / `请选择{字段名}` |
| 格式错误 | `{字段名}格式不正确，应为{期望格式}` |
| 长度超限 | `{字段名}最多 {n} 个字符，当前 {m} 个` |
| 日期范围 | `结束时间不能早于开始时间` |
| 唯一性冲突 | `该{字段名}已存在，请更换` |
| 名称不匹配（高危确认） | `名称不一致，请输入「{期望值}」` |
| 服务端校验失败 | `{字段名}：{服务端返回的原因}` |

#### 6.1.3 输入框状态与尺寸

| 项 | 规格 | 落地 |
| --- | --- | --- |
| 高度 | 34px（`--bmp-radius-btn` 同源 8px / input 6px） | `common.css:64` |
| 圆角 | **6px**（表单控件），按钮 8px，卡片 8px | `common.css:64-66` |
| 边框 | `var(--line)` `1px solid rgba(0,0,0,.1)` | `common.css:65` |
| 聚焦 | `border-color: var(--accent)` + `box-shadow: 0 0 0 3px rgba(200,22,29,.08)` | `common.css:70` |
| 占位色 | `var(--bmp-text-placeholder)` | `common.css:71` |
| 禁用 | `opacity: .5; cursor: not-allowed` | `common.css:41`（按钮同源） |
| 只读（权威源同步） | 字段只读 + **顶部只读横幅** | `common.css:190-194`（`.readonly-banner`） |

**只读横幅文案（UI-C-06/07，【强制】）**：`数据由 HR 系统每日同步，如需修改请在源系统操作 [查看权威源配置]`（UIUX §5.7）

### 6.2 表格规范

| 项 | 规格 | 落地 |
| --- | --- | --- |
| 表头底 | `var(--surface-sunken)` `#f8f7f6`；`font-size: 13px`（**应收敛为 caption 12px**） | `common.css:91-92` |
| 表头字重 | `600`，色 `--bmp-text-title` | `common.css:92` |
| 行分隔 | `1px solid rgba(0,0,0,.08)` | `common.css:92,94` |
| 行 hover | `background: var(--surface)` | `common.css:95` |
| 行选中 | `background: var(--bmp-color-primary-light)` | `common.css:96` |
| 单元格内边距 | `10px 12px`（**应收敛为 12px**） | `common.css:91,94` |
| 行内操作 | **≤3 个**，超出收「更多」 | UIUX §4.1 |
| 排序 | **仅服务端字段标注可排序**；排序图标方向明确 | UIUX §4.4 |
| 列设置 | 记忆用户偏好（**localStorage**） | UIUX §4.4 |
| 批量 | 选中后**底部浮出操作条**（`.batch-bar`，z500） | `common.css:288-295` |
| 空态 | 表格内嵌 `EmptyState`（不整页空） | §3.2 |
| 加载 | 表格骨架（10 行） | §3.1 |
| 长文本 | 单元格 `ellipsis` + tooltip 显示全文；**禁止撑破表格** | 本规范新增 |

**分页规范（【强制】）**

| 项 | 规格 | 落地 |
| --- | --- | --- |
| 默认每页 | **10 条** | 本规范 |
| 可选档 | **10 / 20 / 50 / 100** | UIUX §4.4 |
| 位置 | **右下角右对齐** | `common.css:99`（`.pagination { justify-content: flex-end }`） |
| 当前页 | `background: var(--accent); color:#fff`+ 圆角 6px | `common.css:101` |
| 总数字段 | 含总数（`共 {n} 条`）；服务端分页返回 `total` | 本规范 |
| 跳转 | 页码 + 每页档 + （>100 页时）跳转输入框 | 本规范 |

**筛选区规范**：见 §4.3.13 `SearchFilterBar`（默认 ≤4 条件 + 「更多筛选」展开 + URL query 同步 + 查询重置分页）

### 6.3 数据展示格式规范（【强制】唯一口径）

| 类型 | 格式 | 示例 | 依据 |
| --- | --- | --- | --- |
| 列表内时间 | **相对时间**（`5 分钟前` / `3 小时前` / `昨天 10:32`） | `5 分钟前` | UIUX §4.4 |
| 相对时间的绝对时间 | **hover 显示 tooltip** 绝对时间 | tooltip: `2026-09-22 10:15` | UIUX §4.4 |
| 详情页时间 | **绝对时间 `yyyy-MM-dd HH:mm`** | `2026-09-22 10:15` | UIUX §4.4 |
| 日期（无时分） | `yyyy-MM-dd` | `2026-09-22` | 本规范 |
| 日期范围 | `yyyy-MM-dd ~ yyyy-MM-dd` | `2026-09-01 ~ 2026-09-22` | 本规范 |
| 时间制 | **24 小时制**（禁止 AM/PM） | `22:15` | UIUX §4.7 |
| 时区 | 统一**本地时区**（V1.0 仅中文单时区） | —— | 本规范 |
| 数字 | **千分位** | `1,234,567` | UIUX §4.4 |
| 金额 | **`¥` 前缀 + 千分位 + 右对齐 + 2 位小数** | `¥120,000.00` | UIUX §4.4 |
| 百分比 | 1 位小数 + `%` | `98.5%` | 本规范 |
| 大数字（数据卡） | `--bmp-font-number-lg`（28px/600）+ 千分位 | `12` / `1,280` | UIUX §2.2 |
| 文件大小 | `B / KB / MB / GB`，1 位小数 | `2.4 MB` | 本规范 |
| 耗时 | `<1s` 显示 `xxx ms`；≥1s 显示 `x.x s` | `420 ms` | 本规范 |
| 姓名回显 | **`工号 姓名`**（不只用姓名） | `A1024 张三` | §4.3.2 |
| 手机号 | **中间 4 位打码** | `138****8888` | PRD 安全要求 |
| 敏感字段（请求快照） | **自动打码** | `password: ******` | UIUX §5.7 |
| 空值 | **`—`**（em dash），**禁止** `null` / `undefined` / `-` / 空字符串 | `—` | 本规范 |
| 布尔 | `是 / 否`（表格列）；开关（表单） | `是` | 本规范 |
| 长文本截断 | `ellipsis` + tooltip；**标题单行省略**，摘要 ≤40 字 | —— | PRD A1-F07-4 |
| 数字字体 | `tabular-nums`（全局开启，`common.css:10`） | —— | UIUX §2.2 |

**【强制】** 时间/数字**禁止**在组件内自行 `toLocaleString` 拼装 —— 统一走 `@bmp/utils` 的 `format` 模块（UIUX §8.1）。

### 6.4 §6 走查 checklist

- [ ] 管理端表单标签右对齐；弹窗/移动端顶部对齐
- [ ] 必填红星前置；错误提示在字段下方 12px 红色
- [ ] 校验时机为失焦 + 提交全量；错误文案含具体规则
- [ ] 提交按钮有 loading 防重复
- [ ] 表格分页默认 10 条，档位 10/20/50/100，位置右下
- [ ] 表格行内操作 ≤3 个，超出收「更多」
- [ ] 仅服务端字段可排序
- [ ] 列设置偏好写入 localStorage
- [ ] 列表时间为相对时间 + hover 绝对时间；详情页为绝对时间
- [ ] 时间 24 小时制；数字千分位；金额 `¥` 前缀右对齐
- [ ] 空值统一 `—`
- [ ] 姓名回显含工号
- [ ] 只读（权威源）时字段只读 + 顶部横幅
- [ ] 筛选条件与 URL 同步且查询重置分页

---

## §7 权限的界面表达

### 7.1 `v-perm` 四策略（承接 UIUX §4.5）

| 策略 | 粒度 | 规则 | 实现 |
| --- | --- | --- | --- |
| **按钮级** | 元素 | 无权限默认**隐藏**；涉及「需要让用户知道功能存在」的场景用**禁用 + tooltip「无权限，可申请」** | `v-perm` 指令（`@bmp/components`），读 Pinia `permissionStore.codes`（UIUX §8.2） |
| **菜单级** | 路由/菜单 | 无权限菜单**不渲染**（动态路由过滤） | 登录后 `GET /v1/auth/me` 返回菜单权限 → `router.addRoute`；**无权限路由不存在**（而非跳转拦截）（UIUX §8.2） |
| **页面级** | 路由 | 直接访问无权限路由 → **无权限态页**（§3.4） | 路由守卫链：白名单 → token 校验 → 权限加载完成 → 放行（UIUX §8.2） |
| **数据级** | 数据行 | V1.5 数据权限生效后，列表**仅展示有权数据**，**不做前端脱敏占位** | 服务端过滤；前端不显示「无权行」的占位（UIUX §4.5） |

### 7.2 【强制】隐藏 vs 禁用 + tooltip 判定标准

> **默认：隐藏。** 只有满足下表**任一**条件时才用「禁用 + tooltip」。

| # | 判定条件 | 选择 | 理由 | 示例 |
| --- | --- | --- | --- | --- |
| 1 | 用户**需要知道该功能存在**才能提出权限申请 | **禁用 + tooltip** | 否则用户不知道可申请 | 角色管理页的「新建角色」（普通管理员可见但无权限） |
| 2 | 该功能是**页面主操作**且缺失会让人以为页面坏了 | **禁用 + tooltip** | 避免误判为系统故障 | 列表页的「新建{对象}」 |
| 3 | 该操作**在上下文中有明确位置依赖**（隐藏会破坏布局/理解） | **禁用 + tooltip** | 保持界面结构完整 | 表格行内的「编辑/删除」列 |
| 4 | 该功能**用户无权限且无申请路径**（如系统预置、审计专用） | **隐藏** | 申请也拿不到 | 超管专属的「权威源切换」 |
| 5 | 该按钮是**危险/破坏性**操作 | **隐藏** | 减少误触与视觉噪音 | 批量删除（无权限时） |
| 6 | **默认情况**（以上都不满足） | **隐藏** | 遵循 UIUX §4.5 默认 | 页面内的次要工具按钮 |

**tooltip 文案模板（【强制】）**：`无权限，可申请` + 内嵌可点链接 `去申请`（跳 UI-C-05 权限申请登记）。

**【强制】** ① 隐藏 = **不渲染 DOM**（非 `display:none`，非 `visibility:hidden`）；② 禁用 = 真实渲染但 `aria-disabled="true"` + 可聚焦 + tooltip；③ **禁止**「灰掉但不解释」的按钮（用户无法得知原因与解法）。

### 7.3 无权限的降级链（【强制】）

```
页面级无权限 → 显示无权限态页（§3.4），不渲染页面内容
     ↓ （若有部分权限）
区块级无权限 → 该区块不渲染 DOM（不占位、不留白）
     ↓
按钮级无权限 → 按 §7.2 判定：隐藏 或 禁用+tooltip
     ↓
数据级无权限 → 服务端过滤，前端不显示占位行
```

**【强制】** 无权限**不暴露资源存在性**（UIUX §4.2）：无权限时不得显示资源名称、数量、内容轮廓（如「你有 5 条无权查看的日志」是**禁止**表述）。

### 7.4 权限变更后的界面行为

| 触发 | 界面行为 | 依据 |
| --- | --- | --- |
| 管理员保存角色权限 | 提示 `已生效，在线用户将在下次请求时应用新权限`（缓存失效策略） | UIUX §5.7 |
| 用户收到权限变更 | 下次请求自动生效（无需重登）；菜单/路由懒加载 | UIUX §8.2 |
| 权限加载未完成时访问 | 守卫拦截，等待 `permissionStore` ready（`GET /v1/auth/me`） | UIUX §8.2 |
| 权限码校验点 | **不分大小写敏感？否 —— 严格区分**；命名 `域:资源:动作`（如 `system:account:create`） | UIUX §7.2 |

### 7.5 §7 走查 checklist

- [ ] 按钮级默认隐藏；禁用+tooltip 仅在满足 §7.2 六条之一时使用
- [ ] 菜单无权限不渲染（动态路由，非跳转拦截）
- [ ] 页面级无权限显示无权限态页，不渲染真实内容
- [ ] 隐藏 = 不渲染 DOM（扫描：无权限账号走查「无权限项 0 出现」，PRD A1-F05-8 验收）
- [ ] 数据级无权限由服务端过滤，前端无脱敏占位
- [ ] 无权限提示不暴露资源存在性
- [ ] 禁用按钮 tooltip 含「无权限，可申请」+ 可点「去申请」
- [ ] 权限保存后提示缓存失效说明
- [ ] 权限码命名符合 `域:资源:动作`

---

## §8 可访问性规范

### 8.1 对比度（WCAG AA，【强制】）

| 类型 | 最低对比度 | 落地核对 |
| --- | --- | --- |
| 正文（14px / 12px） | **≥4.5:1** | `--text-body #444444` on `--canvas #ffffff` → **约 9.7:1 ✅** |
| 大字（≥18.66px 或 ≥14px bold） | **≥3:1** | `--text-primary rgba(0,0,0,.95)` on white ✅ |
| 次要文字（caption） | **≥4.5:1** | `--text-secondary #615d59` on `#f6f5f4` → **约 6.0:1 ✅** |
| **弱化文字（placeholder）** | ≥4.5:1（WCAG）；**允许 3:1（非关键信息）** | ⚠ `--text-weak #a39e98` on `#ffffff` → **约 2.4:1 ❌ 低于 3:1** —— **【强制】仅用于 placeholder / 装饰性文字，不得用于传达有效信息** |
| 品牌红（按钮底白字） | **≥4.5:1**（正常字） | `#ffffff` on `#C8161D` → **约 6.6:1 ✅** |
| danger 亮红（按钮底白字） | ≥4.5:1 | `#ffffff` on `#F53F3F` → **约 3.6:1 ⚠ 低于 4.5** —— **【强制】danger 按钮文案必须 ≥14px bold（大字豁免 3:1 ✅）** |
| 状态标签（浅底深字） | ≥4.5:1 | `#16A34A` on `#ECFDF3` ✅；`#F53F3F` on `#FEF2F2` ✅ |
| **渠道色** | 仅作标识，不作为文字底色 | `#1677FF` / `#07C160` 作小色块 ✅ |

> **【强制】`--text-weak` 使用边界**：仅限 `placeholder`、禁用态文字、装饰性图标。**禁止**用于时间戳、状态、金额等有效信息（当前 `common.css:322` `.timeline .t-time` 用 `--bmp-text-placeholder` 显示时间戳 → **P2 待修：改为 `--bmp-text-secondary`**）。

### 8.2 键盘可访问（【强制】）

| 要求 | 规格 | 落地 |
| --- | --- | --- |
| Tab 顺序 | **按视觉流**（左→右、上→下）；不得用正 `tabindex` 打乱 | UIUX §4.7 |
| 焦点可见 | 所有可聚焦元素有**可见焦点环**：`0 0 0 3px rgba(200,22,29,.08)`（聚焦色用品牌红系） | `common.css:70`（仅 input，**需全站推广**） |
| 弹窗焦点圈定 | Dialog / Drawer 打开后焦点**圈定在内**（Tab 循环），关闭后**归还触发元素** | UIUX §4.7 |
| Esc 关闭 | **Esc 关闭**抽屉 / 弹窗 / 下拉 | UIUX §4.7 |
| Enter / Space | 按钮、链接、自定义可点元素均可 Enter/Space 触发 | 本规范 |
| 方向键 | 树（↑↓←→）、下拉列表（↑↓）、Tab 组（←→） | §4.3.3 / §4.3.2 |
| 拖拽等价 | `LayoutGrid` 编辑模式必须提供键盘等价操作（`Alt+↑/↓` 调序、`Alt+←/→` 换栏、`Space` 显隐） | §4.3.7 |
| 滑动等价 | 移动端左滑操作必须提供按钮等价（如待办左滑催办需有催办按钮） | UIUX §8.5 |
| 快捷键 | `⌘K` 唤起命令栏（B6）；不得与浏览器原生快捷键冲突 | UIUX §5.3 |
| 焦点陷阱禁止 | 不得将焦点永久困在某元素（除模态内循环） | 本规范 |

### 8.3 语义化（【强制】）

| 要求 | 规格 |
| --- | --- |
| 按钮 vs 链接 | **操作**用 `<button>`；**跳转**用 `<a href>`（含 `target="_blank"` 时带 `rel="noopener"`） |
| 图片/图标 | 装饰性 `aria-hidden="true"`；有意义的须有 `alt` / `aria-label`；**纯图标按钮必须有 `aria-label`** |
| 状态提示 | `role="status"`（温和）/ `role="alert"`（紧急）；配 `aria-live` |
| 加载 | `aria-busy="true"` |
| 表单 | `<label for>` 关联；错误 `aria-describedby` + `aria-invalid` |
| 表格 | `<th scope="col">`；表头与数据单元格关联 |
| 模态 | `role="dialog"` + `aria-modal="true"` + `aria-labelledby` + `aria-describedby` |
| 树 | `role="tree"` / `role="treeitem"` + `aria-expanded` / `aria-level` / `aria-selected` |
| 标签页 | `role="tablist"` / `role="tab"` / `role="tabpanel"` + `aria-selected` |
| 进度 | `role="progressbar"` + `aria-valuenow` / `aria-valuemin` / `aria-valuemax` |
| **颜色不是唯一信息源** | 状态/紧急度**必须同时有文字或图标**（不得只靠红/绿区分） |
| 语言 | `<html lang="zh-CN">`（原型已合规） |

### 8.4 动效可访问（【强制】）

| 要求 | 规格 |
| --- | --- |
| 尊重系统设置 | `@media (prefers-reduced-motion: reduce)` 下：**禁用**自动播放轮播、骨架 shimmer、平滑滚动；过渡降为 `0.01ms` 或直接无过渡 |
| 闪烁 | 禁止每 3–50Hz 的闪烁（WCAG 2.3.1） |
| 自动播放 | Banner 轮播 ≥2 条时每 6s 切换，**hover / 触摸暂停**，`prefers-reduced-motion` 下**不自动切换**（PRD A1-F07-5） |

> **【强制】全站缺失（P1）**：**当前原型 `prefers-reduced-motion` 声明数为 0**。
> **核实命令**：`grep -rn "prefers-reduced-motion" prototype/ | wc -l` → **`0`**
> **修复要求**：在 `@bmp/theme` 的全局样式中统一声明：

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
  .notice-banner .carousel { animation: none !important; }  /* Banner 不自动切换 */
}
```

### 8.5 屏幕阅读器播报要点

| 场景 | 播报要求 |
| --- | --- |
| 加载完成 | `aria-busy` 由 true → false；必要时 `aria-live="polite"` 播报「已加载 {n} 条」 |
| 表单错误 | 提交失败时**焦点移到第一个错误字段**，并 `aria-live="assertive"` 播报错误摘要 |
| 批量操作 | 播报「已选择 {n} 项」 |
| 未读角标 | 角标本身 `aria-hidden`，未读数进按钮 `aria-label`（避免重复播报） |
| 抽屉打开 | 播报抽屉标题 |

### 8.6 §8 走查 checklist

- [ ] 正文对比度 ≥4.5:1；大字 ≥3:1；`--text-weak` 未用于有效信息
- [ ] danger 按钮文案 ≥14px bold（对比度豁免）
- [ ] 所有可聚焦元素有可见焦点环
- [ ] Tab 顺序符合视觉流，无正 `tabindex`
- [ ] 弹窗/抽屉焦点圈定、Esc 关闭、焦点归还
- [ ] 树/下拉/标签页支持方向键
- [ ] 拖拽与滑动均有键盘/按钮等价
- [ ] 纯图标按钮有 `aria-label`
- [ ] 模态具备 `role="dialog"` + `aria-modal` + `aria-labelledby`
- [ ] 状态/紧急度**不只靠颜色**传达
- [ ] 已声明 `prefers-reduced-motion`（全站覆盖）
- [ ] Banner 轮播 hover 暂停、减少动效时不自动切换
- [ ] 提交失败焦点移到首个错误字段

---

## §9 文案与国际化

### 9.1 文案总则（【强制】）

| # | 规则 | 反例 | 正例 |
| --- | --- | --- | --- |
| 1 | **动词开头** | `新建角色` 按钮写 `角色` | `新建角色` / `保存` / `提交审核` |
| 2 | **错误提示含原因 + 解法** | `操作失败` | `停用失败：该账号为系统预置账号，不可停用。请联系管理员` |
| 3 | **一句话说清「做什么 + 后果」** | `确定要执行此操作吗？` | `停用后该账号将无法登录，关联会话立即失效` |
| 4 | **时间统一 24 小时制** | `10:15 PM` | `22:15` |
| 5 | **不使用技术术语面向业务用户** | `token 过期` / `500 错误` | `登录已过期` / `服务暂时不可用（错误码 5001）` |
| 6 | **术语与上游一致** | `待办事项列表` | `紧迫度时间轴` / `ticket 交换` / `cardId 不可增删` |
| 7 | **不用「您」堆砌**（企业工具，简洁） | `您的账号已被您停用` | `账号已停用` |
| 8 | **数量词必带单位** | `共 12` | `共 12 条` |
| 9 | **禁止空洞感叹** | `操作成功啦！` | `已保存角色「财务审批员」` |
| 10 | **按钮文案唯一**（同屏同义不重复） | 同屏两个 `确定` | `保存` + `取消` |

### 9.2 按钮文案对照表（【强制】唯一口径）

| 场景 | 文案（禁止替换） |
| --- | --- |
| 新增 | `新建{对象}` / `添加{对象}` |
| 编辑 | `编辑` |
| 保存 | `保存` / `保存变更` |
| 提交 | `提交` / `提交审核` |
| 取消 | `取消` |
| 关闭 | `关闭` |
| 删除 | `删除`（高危用 `删除{对象}`） |
| 确认（高危动词） | `停用账号` / `强制下线` / `切换权威源` |
| 重试 | `重试` |
| 返回列表 | `返回列表` |
| 权限申请 | `申请权限` / `去申请` |
| 空态引导 | `去应用中心看看` / `发起审批` / `清除筛选` |
| 恢复默认 | `恢复默认`（风格）/ `恢复默认模板`（布局） |

### 9.3 空态 / 错误 / 高危 文案模板索引

| 类型 | 章节 |
| --- | --- |
| 六态文案模板 | **§3.1 §3.2 §3.3 §3.4 §3.5 §3.6** |
| 反馈（成功/失败）文案 | **§5.3** |
| 高危确认文案 | **§5.2** |
| 表单校验文案 | **§6.1.2** |
| 只读横幅文案 | **§6.1.3** |

### 9.4 国际化（i18n）

| 项 | 规则 | 依据 |
| --- | --- | --- |
| 语言范围 | **V1.0 仅中文**；不提供英文；V1.5 亦不新增 | UIUX 决议 #4、§4.7 |
| 架构保留 | **文案全部走 i18n key**（为未来预留，**禁止硬编码中文入组件**） | UIUX §4.7 |
| **key 命名约定（本规范固化）** | `<域>.<模块>.<语义>` 小写点分，如 `portal.todo.emptyTitle`、`common.action.retry`、`iam.account.disableConfirm` | 本规范新增 |
| key 分层 | `common.*`（通用）> `<domain>.*`（域）> `<module>.*`（模块） | 本规范 |
| 变量占位 | `{name}` 形式（InnoDB 风格），如 `已创建角色「{name}」` | 本规范 |
| 复数/数量词 | 中文无需复数；数量词统一带单位（§9.1 第 8 条） | 本规范 |
| 文件组织 | `packages/theme/src/locales/zh-CN/*.ts` 按域拆分 | 本规范 |
| 禁止项 | ① 硬编码中文入 L0/L1/L2 组件；② 拼接字符串（应整体成 key + 变量）；③ 在模板中写 `v-if` 分支中文 | 本规范 |
| 错误码映射 | 业务错误码 → i18n 文案映射表（UIUX §8.4） | UIUX §8.4 |

### 9.5 §9 走查 checklist

- [ ] 按钮文案动词开头且全站唯一（对照 §9.2）
- [ ] 错误提示含原因 + 解法，无裸「操作失败」
- [ ] 时间 24 小时制；无 AM/PM
- [ ] 不用技术术语面向业务用户（含错误码提示时给业务文案 + 括号错误码）
- [ ] 术语与上游一致（紧迫度时间轴 / ticket 交换 / cardId）
- [ ] 数量词带单位
- [ ] 组件内无硬编码中文（扫描：`grep -rn "[\u4e00-\u9fa5]" packages/components/src/ | grep -v locales` 应为 0）
- [ ] i18n key 命名符合 `<域>.<模块>.<语义>`
- [ ] 变量占位统一 `{name}` 形式
- [ ] 错误码 → i18n 映射表存在

---

## §10 命名与交付规范

### 10.1 Figma 命名（UIUX §9.2）

| 项 | 规则 | 示例 |
| --- | --- | --- |
| 页面命名 | `BMP / {端} / {页面ID} {页面名} / {状态}` | `BMP / 管理端 / UI-C-08 权威源向导 / 步骤2-错误态` |
| 端 | `门户` / `移动` / `管理端` / `登录` | —— |
| 状态 | `默认` / `加载` / `空` / `错误` / `无权限`（对照 §3 六态） | —— |
| 组件命名 | `Bmp{组件名}`（PascalCase），与 npm 包组件同名 | `BmpEmployeeSelect` |
| 变量命名 | 与 §2.9 落地表**逐条同名**（Figma Variables 与 CSS 变量一一对应） | `--bmp-color-primary` |
| 图层命名 | 语义化（`header/title` 而非 `Rectangle 12`） | —— |
| 交互标注 | 跳转关系用 Prototype 连线；复杂规则（布局引擎编辑模式、催办去重）附**文字标注块** | UIUX §9.2 |

### 10.2 文件命名

| 类型 | 规则 | 示例 |
| --- | --- | --- |
| Vue 组件文件 | **PascalCase** | `EmployeeSelect.vue` |
| 目录 | **kebab-case** | `employee-select/` |
| 工具/类型文件 | **camelCase** / **PascalCase** | `format.ts` / `TodoCard.types.ts` |
| 样式文件 | kebab-case | `card-shell.scss` |
| Storybook | `{组件名}.stories.ts` | `EmployeeSelect.stories.ts` |
| API 模块 | kebab-case | `todo-api.ts` |
| 路由文件 | kebab-case + `routes` | `portal-routes.ts` |
| 常量文件 | **SCREAMING_SNAKE_CASE** 内容 | `TODO_STATUS_MAP.ts` |

### 10.3 组件命名与包结构（UIUX §7.3、§8.1）

| 项 | 规则 |
| --- | --- |
| 组件名 | **`Bmp` 前缀**（`BmpEmployeeSelect`） |
| props | **camelCase** |
| events | **kebab-case** |
| 包 | `@bmp/components`（L1/L2）、`@bmp/components-mobile`（移动端）、`@bmp/theme`（Token + Element 主题 + i18n）、`@bmp/utils`（request/auth/format） |
| monorepo | pnpm workspace；`apps/{portal,console,mobile}` + `packages/{components,components-mobile,utils,theme}` |
| 交付物（每组件） | 源码 + TypeScript 类型 + **Storybook 示例** + README（含与设计稿映射截图） |

### 10.4 代码层命名（衔接 Vue/TS）

| 类型 | 规则 | 示例 |
| --- | --- | --- |
| Pinia Store | `use{Name}Store` | `usePermissionStore` |
| Store 文件 | `{name}.ts` | `permission.ts` |
| 组合式函数 | `use{Name}` | `useTodoPolling` |
| 常量 | `SCREAMING_SNAKE_CASE` | `ACTION_SHOW_AT`（原型已合规，`mobile/home-v2.html:2118`） |
| 权限码 | `域:资源:动作`（小写 + 冒号） | `system:account:create` |
| CSS 类（业务） | kebab-case；BEM 变体用 `--` | `.todo-card` / `.todo-card--urgent` |
| CSS 类（工具） | 短前缀（现状 `.flex` / `.mt-2` / `.fs-12`，`common.css:549-558`） | 保留现状 |
| localStorage key | `bmp_` 前缀 + snake | `bmp_ui_style` / `bmp_user_override` / `bmp_embed_cards` / `bmp_my_subscriptions` / `bmp_banner_closed` |

### 10.5 设计走查清单（交付验收用，UIUX §9.2）

> 前端开发完成后，设计师按原型逐页走查，**走查三项固定**：**状态覆盖 / Token 一致性 / 文案规范**。

| # | 走查项 | 判定 | 工具 |
| --- | --- | --- | --- |
| 1 | 状态覆盖 | 六态覆盖率 ≥4/6（涉异步 ≥5/6） | §3.0 + `outputs/核查/verify-prototype.mjs` |
| 2 | Token 一致性 | 零硬编码色值/字号/间距（除 Token 定义层） | `grep -nE "#[0-9A-Fa-f]{3,8}"` |
| 3 | 文案规范 | 动词开头、错误含原因+解法、时间 24 小时制 | §9 走查 checklist |
| 4 | 语义色正确性 | 紧急=品牌红、错误=danger；无三种红混用 | §2.1.3 |
| 5 | 字距硬规则 | 仅 12px 徽标正字距 | §2.2.3 |
| 6 | 阴影哲学 | 静止靠边框、悬浮加淡影 | §2.4.2 |
| 7 | 层级正确 | z-index 取值自 §2.7 表；移动端内容<行动栏30<Tab40<抽屉60<Toast | §2.7 |
| 8 | 可访问性 | 焦点环、键盘可达、`prefers-reduced-motion`、对比度 | §8 |
| 9 | 权限表达 | 隐藏/禁用符合 §7.2；无权限不暴露存在性 | §7 |
| 10 | 组件齐备 | L1 13 个 + L2 卡片全部注册 | §4.7 |

### 10.6 交付检查命令（可复制的自动化走查基线）

```bash
# ① 硬编码色值总数（应仅剩 Token 定义层与已知豁免）
grep -rhoE "#[0-9A-Fa-f]{6}\b" prototype/ --include="*.html" --include="*.css" | wc -l

# ② 冷色残留（允许：settings.html 石墨灰预设、tokens.css info 语义色、common.css info-light）
grep -rnE "#(F1F5F9|0F172A|E2E8F0|334155)" prototype/ --include="*.html" --include="*.css"

# ③ 紧急度误用 danger（应为 0 处）—— §2.1.3（A）组
grep -rn "color-danger" prototype/todos.html prototype/approval.html prototype/assets/common.css

# ③b 超时/临期文字误用 .text-danger（应为 0 处）—— §2.1.3（B）组
grep -rn "text-danger" prototype/todos.html prototype/approval.html prototype/home.html prototype/mobile/index.html

# ③c 公告「置顶/紧急」标签误用 danger（应为 0 处）—— §2.1.3（C）组
grep -n "n.top" prototype/assets/pages-config.js

# ③d 紧急语义正确实现（正例，应为 5 处，勿改）—— §2.1.3（D）组
grep -n "var(--accent)" prototype/home-v2.html prototype/mobile/home-v2.html

# ④ 正字距越界（应仅徽标 +0.125px）
grep -rnE "letter-spacing:\s*\+?[0-9.]+(px|em)" prototype/ --include="*.html" --include="*.css"

# ⑤ 单层高透明度阴影（应为 0 处）
grep -rnE "box-shadow:\s*0 [0-9]+px [0-9]+px rgba\([0-9]" prototype/ --include="*.html" --include="*.css"

# ⑥ 减少动效声明（当前 0 处，必须补齐）
grep -rn "prefers-reduced-motion" prototype/ | wc -l

# ⑦ Token 定义数核对（第一轨 20 / 第二轨 44）
grep -oE "^\s+--[a-z][a-z0-9-]*:" prototype/assets/tokens.css | grep -vc bmp
grep -oE -- "--bmp-[a-z0-9-]+:" prototype/assets/tokens.css | sed 's/://' | sort -u | wc -l

# ⑧ L1 组件清单比对（应对 UIUX §7.2 的 13 行）
sed -n '724,739p' 麓邦业务中台UIUX设计文档.md | grep -c "^| \`"

# ⑨ 红/绿语义场景区分核对（§2.1.4.1）—— 行情类应 0 命中；运营指标应仅 aaMom 一处
grep -rniE "涨|跌|行情|股价|基金|净值" prototype/ --include="*.html" --include="*.js" | grep -v style-samples
grep -rn "aaMom" prototype/assets/pages-config.js

# ⑩ 风格预设色白名单核对（§2.1.2.1）—— 冷色仅应出现在预设定义段
sed -n '220,244p' prototype/settings.html | grep -nE "#[0-9A-Fa-f]{6}"
grep -rnE "#(F1F5F9|0F172A|E2E8F0|334155|1E293B)" prototype/ --include="*.html" --include="*.css" --include="*.js" | grep -v "assets/tokens.css"

# ⑪ 主题色双轨是否脱钩（§2.1.2.2 / P-21）—— 期望 repaired 后输出 EQUIVALENT=YES
TOKENS="$(cygpath -m "$(pwd)")/prototype/assets/tokens.css"; PROBE="$(mktemp -d)/p21.html"; BROWSER=""
for b in "/c/Program Files/Google/Chrome/Application/chrome.exe" "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; do [ -f "$b" ] && BROWSER="$b" && break; done
[ -z "$BROWSER" ] && BROWSER="$(command -v google-chrome || command -v chromium)"
{ printf '<!DOCTYPE html><meta charset="UTF-8">\n'; printf '<link rel="stylesheet" href="file:///%s">\n<style id="ov"></style>\n' "$TOKENS"
  printf '<pre id="out">pending</pre><script>\n'
  printf 'document.getElementById("ov").textContent=":root{--bmp-color-primary:#4F46E5;--bmp-color-primary-light:#EEF2FF;--bmp-color-primary-dark:#3730A3;}";\n'
  printf 'addEventListener("load",function(){var c=getComputedStyle(document.documentElement);var v=function(n){return c.getPropertyValue(n).trim()};var a=v("--accent"),p=v("--bmp-color-primary");document.getElementById("out").textContent="RUNTIME_PROBE accent="+(a||"(EMPTY)")+" primary="+(p||"(EMPTY)")+" EQUIVALENT="+(a===p?"YES":"NO")});\n'
  printf '</script>\n'; } > "$PROBE"
"$BROWSER" --headless --disable-gpu --no-sandbox --virtual-time-budget=3000 --dump-dom "file:///$(cygpath -m "$PROBE")" 2>/dev/null | sed -n 's/.*<pre id="out">\(.*\)<\/pre>.*/\1/p'
# 当前期望输出： RUNTIME_PROBE accent=#C8161D primary=#4F46E5 EQUIVALENT=NO  → FAIL（待修）
# 证据补充：v2 家族对第二轨引用数应为 0
for f in prototype/home-v2.html prototype/mobile/home-v2.html prototype/login.html; do printf '%-34s accent=%-4s primary=%s\n' "$f" "$(grep -c 'var(--accent)' "$f")" "$(grep -c 'var(--bmp-color-primary)' "$f")"; done
# 跨端同步落地度（应 >1 才叫已落地；当前 =1）
grep -rl "bmp_ui_style" prototype/ | wc -l
```

### 10.7 §10 走查 checklist

- [ ] Figma 页面命名符合 `BMP / {端} / {页面ID} {页面名} / {状态}`
- [ ] Figma Variables 与 §2.9 落地表逐条同名
- [ ] 组件名 `Bmp` 前缀；props camelCase；events kebab-case
- [ ] 文件/目录命名符合 §10.2
- [ ] 每组件交付 源码 + TS 类型 + Storybook + README
- [ ] localStorage key 均为 `bmp_` 前缀
- [ ] 权限码命名 `域:资源:动作`
- [ ] §10.5 十项走查全部通过（附证据）
- [ ] §10.6 八条命令结果符合预期

---

## 附 A 与 PRD / UIUX 的追溯矩阵

> **用途**：本文档每条规则 → 依据的 PRD 需求编号 / UIUX 章节。凡本规范**新增**（无上游依据）的条目，标注 `本规范新增` 并给出理由。

### A.1 逐章追溯

| 本规范条目 | 规则摘要 | PRD 依据 | UIUX 依据 | 备注 |
| --- | --- | --- | --- | --- |
| §0.2 适用范围（30+2 页） | 页面清单 | §2.7 功能点总表 | §1.2、§3.4 | —— |
| §1.1 设计目标 | 一站式/零学习/可配置/一致 | §1.4 北极星 | §1.1 | 本规范补「可访问」目标（本规范新增） |
| §1.3 P1 任务优先 | 首屏必见待办卡 | A1-F01、A4-F01 | §1.3-1 | —— |
| §1.3 P2 状态可见 | 6 态覆盖 | —— | §1.3-2、§4.2 | —— |
| §1.3 P3 一致复用 | 五范式 | —— | §1.3-3、§4.1 | —— |
| §1.3 P4 克制装饰 | 品牌红点缀 | —— | §1.3-4、§2.1.2-5 | —— |
| §1.3 P5 可配置即产品 | 布局引擎/卡片注册 | A1-F02 | §1.3-5、§8.3 | —— |
| §1.3 P6 色彩不动摇 | 语义色不随主题变 | **A1-F06 H2** | §2.1.2 | —— |
| §2.0 双轨制 | `--bmp-*` 兼容别名 | —— | §2.0 | 实测 44 个（UIUX 写 42，见 §2.0 澄清） |
| §2.1.1 基准色（第一轨） | Notion 暖色 20 个 | —— | §2.1.1 | —— |
| §2.1.2 语义色固定 | success/warning/danger/info/渠道 | —— | §2.1.2 | —— |
| **§2.1.3 品牌红 vs danger（5 条）** | **紧急=品牌红 / 错误=danger** | **A1-F05 时间轴、A1-F06 H2、A1-F07、A4-F05、C1-F05** | **§2.1.2 第 3 条（v1.1 新增）** | 修复面 **17 处**（A组4+B组12+C组1），正例 5 处勿改；依据事实基线 §6 主理人复核 |
| **§2.1.2.1 风格预设色 ≠ 设计基准色（新增）** | **预设色可超基准色表；语义色不随主题变** | **A1-F06 / A1-F06-1~5（H2）** | §2.1.2、§2.1.5 | 依据事实基线 §6 第 3 点 + P-17；走查判定 3 条口径 |
| **§2.1.2.2 主题色双轨脱钩（新增·P-21）** | **缺陷机理 + 运行时验证命令 + 两条修复路径** | **A1-F06-4（全局生效/持久化）、A1-F06-1（同步变色）、跨端同步规则（H2 联动）** | §2.0（双轨制）、§5.3 | 依据事实基线 §6 P-21；本规范独立复现运行时证据 |
| **§2.1.4.1 红/绿语义场景区分（新增）** | **行情类涨红跌绿 / 运营指标类升绿降红** | **A1-F09（运营看板）、A1-F05** | —— | 依据事实基线 §6 第 1 点；`pages-config.js:3364-3369` 正确实现 |
| §2.1.4 语义色映射表 | 全站唯一口径 | A1-F05/1.2/1.3 | §2.1.1、§2.1.2 | 本规范固化 |
| §2.1.5 主题预设 5 档 | 麓邦红/靛蓝/石墨灰/暖橙/青绿 | **A1-F06-1** | §2.1.2 | ⚠ 原型值与 PRD 文本不一致（见 §2.1.5） |
| §2.1.6 密度 3 档 | 宽松/标准/紧凑 | **A1-F06-2** | —— | 管理台是否生效待确认（U-2） |
| §2.1.7 圆角 3 档 | 直角/标准/圆润；pill 不变 | **A1-F06-3** | §2.3 | ⚠ 直角档原型与 PRD 不一致 |
| §2.2.1 字体栈 | Inter 栈 + tabular-nums | —— | §2.2 | —— |
| §2.2.2 字号阶梯 6 档 | 24/20/16/14/12/28 | —— | §2.2 | 本规范补「阶梯外字号收敛口径」 |
| **§2.2.3 字距硬规则** | **唯一正字距=12px 徽标 +0.125px** | —— | **§2.2（v1.1 新增）** | 反例：`common.css:20`(-.3px)、`:254`(.04em) |
| §2.3.1 间距 7 档 | 4/8/12/16/20/24/32 | —— | §2.3 | 本规范补「阶梯外值收敛口径」 |
| §2.3.2 栅格 | 24 栅格 + v2 三栏独立容器 | A1-F02 | §2.3、§5.3 | ⚠ 左树宽 280 vs 232 |
| §2.4.1 圆角 Token | sm/md/lg/btn + pill | A1-F06-3 | §2.3 | ⚠ `--bmp-radius-pill` 未落地（G-1） |
| **§2.4.2 阴影哲学** | 多层低透明度；静止靠边框 | —— | **§2.3（v1.1 升级）** | 反例：`mobile/home-v2.html:75`、`common.css:79` |
| §2.5 动效 | ≤200ms ease-out；reduced-motion | —— | §4.7 | 全站 reduction 缺失（P1） |
| §2.6 图标 | iconify 20px / 管理端 16px / 禁混风格 | —— | §2.3 | —— |
| **§2.7 z-index** | **内容<行动栏30<Tab40<抽屉60<Toast** | **A2-F05-3** | **§5.6（v1.1）** | 门户口顶栏不一致（common.css:208=100 / home-v2.html:73=40） |
| §2.8 断点 | ≥1440 / 1024–1439 / <1024 / 移动 375 | —— | §4.6 | —— |
| **§2.9 落地表** | **64 条 Token 全覆盖** | —— | §2.0、§2.1、§2.2、§2.3 | **本规范重心**；实测 20 + 44 |
| §3.0 六态速查 | 加载/空/错误/无权限/网络/会话 | —— | §4.2 | 基线：`notices.html` 0 态（P-05） |
| §3.1 加载 | 骨架屏；>300ms 才 spinner | —— | §4.2 | —— |
| **§3.2 空态** | **必带下一步动作** | —— | **§4.2** | 看板特例：PRD A1-F09「无数据态有引导」 |
| §3.3 错误态 | 插图 + 说明 + **错误码** + 重试 | —— | §4.2 | 卡片降级：A1-F02-4；iframe 降级：A1-F08-4 |
| §3.4 无权限态 | 锁形 + 申请入口；**不暴露存在性** | B2-F04 | §4.2、§4.5 | —— |
| §3.5 网络异常 | 顶部红色横幅可关闭 | —— | §4.2 | —— |
| §3.6 会话过期 | 弹窗 → 跳登录（保留 redirect） | B1-F04、B1-F05 | §4.2、§8.2 | 账号锁定文案：B1-F05 |
| §3.7 状态优先级 | 会话>无权限>网络>错误>空>加载 | —— | —— | 本规范新增（消歧义） |
| §4.1 组件分层 L0/L1/L2 | 三层 | J1 | §7.1 | —— |
| §4.2 L0 注入 | Element Plus 主题注入 | §2.5 技术栈 | §7.1 | —— |
| **§4.3 L1 业务组件 13 个** | 用途/API/props/events/状态/无障碍/位置 | J1 | **§7.2（实测 13 行）** | 简报写 12，以 UIUX §7.2 表格实测 13 为准 |
| §4.4 L2 卡片 | cardId 清单 + manifest + 不删 cardId | **A1-F02、A1-F08-1** | §5.3、§8.3 | legacy cardId 不可删 |
| §4.5 移动端子包 | Tab/行动栏/卡片/嵌入入口等 | **A2-F05、A1-F07-2、A1-F08-5** | §5.6、§7.3 | —— |
| §4.6 组件设计约定 | Bmp 前缀 / camelCase / kebab-case | —— | §7.3 | —— |
| §5.1 反馈模式边界 | Message 2s/3s、Notification 5s、Dialog、Drawer | —— | §4.3 | 本规范补「边界判定表」 |
| **§5.2 高危操作** | 输入对象名 + 具体动词 + 亮红 + 审计说明 | B1-F01/F06/F07、F1-F03、D1、E1 | §4.3 | 恢复默认风格特例：A1-F06-5 |
| §5.3 成功/失败文案 | 模板化（含批量成功/失败条数） | —— | §4.7 | —— |
| §5.4 反馈并发与去重 | 提交防重复；催办 24h 去重 | **A4-F04** | §4.4、§5.4 | 埋点失败静默：A1-F05 |
| §6.1 表单 | 标签对齐/校验时机/错误文案 | —— | §4.4 | 只读横幅：F1-F03、UI-C-06/07 |
| §6.2 表格 | 分页 10/20/50/100、排序、列设置、批量 | —— | §4.4 | —— |
| §6.3 数据格式 | 相对时间/绝对时间/千分位/金额/空值 `—` | —— | §4.4 | 姓名回显含工号；手机号打码 |
| §7.1 v-perm 四策略 | 按钮/菜单/页面/数据 | B2-F01/F02/F04/F05 | §4.5、§8.2 | —— |
| **§7.2 隐藏 vs 禁用判定** | 6 条判定条件 | —— | §4.5 | 本规范新增（把「默认隐藏」落为可判定规则） |
| §7.3 降级链 | 页面>区块>按钮>数据 | —— | §4.5 | —— |
| §7.4 权限变更行为 | 缓存失效提示 | B2-F01 | §5.7、§8.2 | —— |
| §8.1 对比度 | WCAG AA | —— | §4.7 | 本规范补实测对比度与 `--text-weak` 边界 |
| §8.2 键盘 | Tab/焦点/弹窗圈定/Esc | —— | §4.7、§8.5 | 拖拽键盘等价（本规范新增） |
| §8.3 语义化 | role/aria/label | —— | §4.7 | 本规范新增细则 |
| **§8.4 动效可访问** | prefers-reduced-motion | **A1-F07-5** | §4.7 | **全站缺失（0 处声明）** |
| §9.1 文案总则 | 动词开头 / 原因+解法 / 24h | —— | §4.7 | —— |
| §9.4 国际化 | 仅中文；i18n key 约定 | —— | 决议 #4、§4.7 | key 命名本规范新增 |
| §10.1–10.3 命名 | Figma / 文件 / 组件 | —— | §9.2、§7.3、§8.1 | —— |
| §10.4 代码命名 | Store/hook/常量/权限码/localStorage | —— | §8.4 | —— |
| §10.5 走查清单 | 10 项交付验收 | —— | §9.2 | —— |

### A.2 关键 PRD 需求点 → 本规范落点

| PRD 需求编号 | 需求名 | 本规范落点 |
| --- | --- | --- |
| A1-F01 | 一站式工作台入口 | §1.3 P1、§4.3.6 AppNav |
| A1-F02（+1~6） | 角色化首页布局引擎 | §2.3.2、§4.3.7 LayoutGrid、§4.4、§3.3 卡片降级 |
| A1-F03 | 消息中心 | §3.2 空态、§4.3.5 MsgBell |
| A1-F04（+1~5） | 公告 + Banner 后台增强 | §3.2、§2.1.4（Banner 状态列语义色） |
| **A1-F05**（+1~8） | 千人千面（埋点/推荐/退化） | **§2.1.3（时间轴权重紧急=品牌红）、§2.1.4、§5.4（埋点静默失败）、§7.4** |
| **A1-F06**（+1~5） | 个人界面风格定制 | **§2.0（双轨）、§2.1.2/§2.1.3（H2 语义色不随主题变）、§2.1.5/§2.1.6/§2.1.7、§5.2（恢复默认）** |
| A1-F07（+1~7） | 首页通知 Banner | §2.1.3（紧急标签=品牌红）、§2.5/§8.4（轮播 + reduced-motion）、§3.2（零占位） |
| A1-F08（+1~5） | 首页页面嵌入（#5b） | §3.3（iframe 降级）、§4.4（`embed:<id>` cardId）、§4.5（移动端入口卡） |
| **A1-F09**（+1~4） | 应用运营看板 | **§3.2（无数据态有引导，禁空白图表）、§3.3** |
| **A2-F05**（+1~4） | 移动端底部 Tab 导航 | **§2.7.2（z-index 层级）、§4.5（MobileTabBar/MobileActionBar）、§2.5（触控）** |
| A4-F01~F05 | 统一待办中心 | §2.1.3（紧急圆点/色条=品牌红）、§3.2、§4.3.4 TodoCard、§5.4（催办去重） |
| B1-F01/F06/F07 | 账号/密码/会话 | §5.2 高危（停用/重置/下线）、§2.1.4（锁定=danger） |
| B1-F02（+1~4） | 统一登录（钉钉扫码主推） | §3.6、§6.1、§3.4（OIDC 授权页） |
| B1-F04/B1-F05 | MFA / 密码策略 | §3.6（账号锁定文案） |
| B2-F01/F02/F04/F05 | 角色/权限点/申请/校验 | §7.1、§7.2、§7.4、§4.3.1 PermButton |
| B3-F01/F02 | 同步日志 | §2.1.4（同步结果语义色）、§4.3.10 StatusTag |
| C1/C2/C3 | 流程与表单 | §6.1 表单、§4.3.11 HighRiskConfirm |
| D1-F01~F05 | 消息模板/渠道/记录 | §2.1.4（渠道色）、§4.3.10、§5.2（审核驳回） |
| E1-F01 | 网关路由 | §5.2（编辑路由高危）、§4.3.10 |
| E2-F01~F05 | 审计检索 | §4.3.9 AuditTraceLink、§6.3（请求快照打码） |
| F1-F01/F03/F05 | 组织人员主数据 | §6.1.3（只读横幅）、§4.3.3 OrgTreeSelect、§5.2（切换权威源） |
| H1-F01/H1-F03 | 目标/知识 | §4.3.7、§4.3.8 |
| I1-F01 | 应用注册 | §4.3.6 AppNav、§5.2 |
| J1 | 组件库 | §4 全部 |
| J3 | 事件订阅 | §4.3.10（状态标签） |
| §7 非功能需求 | 兼容性（Chrome/Edge 最新两版；钉钉/企微 WebView） | §2.8 断点、§4.5 移动端 |
| §2.5 技术栈 | Vue3 + TS + Element Plus | §4.2 L0 注入、§10.3 包结构 |

### A.3 UIUX 章节 → 本规范落点（反向核对）

| UIUX 章节 | 内容 | 本规范落点 | 是否覆盖 |
| --- | --- | --- | --- |
| §1.1 | 设计目标 | §1.1 | ✅ |
| §1.2 | 设计范围（30+2） | §0.2 | ✅ |
| §1.3 | 设计原则 5 条 | §1.2（6 条，含新增 P6） | ✅ |
| §1.4 | 用户与场景 | ——（属 B 文档） | N/A |
| §2.0 | 双轨制 | §2.0 | ✅ |
| §2.1.1 | 基准色 | §2.1.1、§2.9.1 | ✅ |
| §2.1.2 | 品牌/语义色 + 5 条规则 | §2.1.2、§2.1.3、§2.1.4、§2.9.2 | ✅ |
| §2.2 | 字体 + 字距 | §2.2（含 §2.2.3）、§2.9.2(e) | ✅ |
| §2.3 | 间距/栅格/圆角/阴影 | §2.3、§2.4、§2.9.2(f)(g)(h) | ✅ |
| §3.1–3.4 | 信息架构 / 导航 / 页面地图 | §0.2（页面数）；导航结构属 B 文档 | 部分 |
| §4.1 | 布局范式 | §1.2 P3、§2.3.2 | ✅ |
| **§4.2** | **全局状态设计** | **§3 全章** | ✅ |
| §4.3 | 反馈模式边界 + 高危 | §5.1、§5.2 | ✅ |
| §4.4 | 表单与表格 | §6.1、§6.2、§6.3 | ✅ |
| §4.5 | 权限交互 | §7.1、§7.2、§7.3 | ✅ |
| §4.6 | 响应式与多端 | §2.8 | ✅ |
| §4.7 | 可访问性与文案 | §8、§9 | ✅ |
| §5.1–5.7 | 关键页面设计 | ——（属 B 文档）；本文只取其中的**全站规则**（如 §5.3 时间轴权重表、§5.6 移动端层级与 Tab 共存） | 部分 |
| §6.x | 用户旅程 | ——（属 B 文档） | N/A |
| **§7.1** | **组件分层** | **§4.1** | ✅ |
| **§7.2** | **L1 组件 13 个** | **§4.3（13 个逐个）** | ✅ |
| §7.3 | 组件设计约定 | §4.6、§10.3 | ✅ |
| §8.1 | 工程结构 | §10.3 | ✅ |
| §8.2 | 路由与权限实现 | §7.1、§3.6 | ✅ |
| §8.3 | 布局引擎渲染协议 | §4.3.7、§4.4 | ✅ |
| §8.4 | 状态管理与 API 层 | §9.4（错误码映射）、§6.3 | 部分 |
| §8.5 | 移动端适配约定 | §4.5、§8.2（滑动等价） | ✅ |
| §9.1–9.3 | 原型交付计划/规范/对接清单 | §10.1、§10.5、§10.6 | ✅ |
| §10 | 已确认决议（含 #5b） | §2.1.2（H2）、§2.7.2、§4.3.6（#5）、§4.4（#5b） | ✅ |

### A.4 上游口径差异登记（需产品或设计裁定）

| # | 差异点 | 上游写法 | 落地实测 | 本规范取值 | 处理建议 |
| --- | --- | --- | --- | --- | --- |
| D-1 | `--bmp-*` 数量 | UIUX §2.0 与 `tokens.css` 注释：**42 个** | **44 个** | **以实测 44 为准** | 修正注释即可 |
| D-2 | `--border-strong` 命名 | UIUX §2.1.1：`--border-strong` | `--border-strong-color` | **以落地为准**（`--border-strong-color`） | UIUX 视为笔误 |
| D-3 | `--bmp-radius-pill` | UIUX §2.3：有 | **未定义** | 用 `--r-pill`；建议补别名（G-1） | 补 `--bmp-radius-pill: var(--r-pill)` |
| D-4 | 左树宽度 | UIUX §4.1：**280px** | `--bmp-console-menu-w: 232px` | **以落地 232px 为准** | 择一固化 |
| D-5 | 主题预设 5 档色值 | PRD §6.1.4：靛蓝 `#2F6FEB`、石墨灰 `#4A4A47`、青竹绿 `#1F7A5A` | `settings.html:224,225,227`：`#4F46E5`、`#334155`、`#0F766E` | **以原型落地为准** | 产品裁定后统一 |
| D-6 | 圆角「直角」档 | PRD §6.1.4：**4/4/6** | `settings.html:239`：**2/4/4** | **以 PRD 为准**（4/4/6） | 修原型 |
| D-7 | 密度档实现 | PRD §6.1.4：行高 1.7/1.5/1.35、内边距 20/16/12、表格行 52/44/36 | `settings.html:232-234`：gap/padY/line = 16/14/24 等简化值 | **以 PRD 为准** | 正式实现按 PRD |
| D-8 | 区块标题字距 | UIUX §2.2：`-.25px` | `common.css:20`：`-.3px` | **以 UIUX 为准**（-.25px） | 修 common.css |
| D-9 | L1 组件数量 | 规格简报 §二：12 个 | UIUX §7.2 表格：**13 行** | **以 UIUX §7.2 表格为准（13）** | 简报口径更新 |
| D-10 | 门户口顶栏 z-index | —— | `common.css:208`=100 / `home-v2.html:73`=40 / `index.html:19`=40 | **统一 100** | 修 home-v2/index |
| D-11 | 移动端 AI FAB 层级 | UIUX §5.6：抽屉 z60 覆盖两栏之上 | `mobile/home-v2.html:769` FAB z80 | **建议降为 z50** | 待裁定（§2.7.2） |
| D-12 | `.card` 静止阴影 | UIUX §2.3：静止靠边框 | `common.css:79`：静止即 `--shadow-soft` | **静止用 `--bmp-shadow-1` 或仅边框** | 修 common.css |
| D-13 | `prefers-reduced-motion` | UIUX §4.7：尊重 | **全站 0 处声明** | 必须补齐（§8.4） | 全局样式补齐 |
| **D-14** | **紧急语义红的 Token 载体（新增）** | UIUX §2.1.2 / PRD A1-F06 H2 / A1-F07 均要求「**紧急=品牌红且不随主题变**」 | 紧急类元素一律用 `--accent`；**运行时实测 `--accent` 当前未被覆写**（故 H2 尚未被破坏），但 §2.1.2.2 路径 A 一旦补写 `--accent` 覆写，紧急色即随之改变 | **前置新增固定 Token `--bmp-color-urgent`（G-7）**，与 P-21 路径 A 同批落地；紧急类改用它，`--accent` 仅作主操作 | 架构师确认后落地 |
| **D-15** | **红/绿语义惯例双轨（新增）** | 上游未区分「行情类涨红跌绿」与「运营指标升绿降红」 | `pages-config.js:3364-3369` `aaMom()` 实现「升绿降红」（运营指标，**正确**） | **本规范新增 §2.1.4.1**：显式区分两套惯例，并声明 V1.0 无行情类场景（0 命中） | 已在本规范固化，无需上游改 |
| **D-16** | **A1-F06 主题色的「覆写轨」歧义（新增·P-21）** | PRD §6.1.4/§6.1.6 要求 A1-F06「全局即时生效并持久化」「主题色跨端同步」，**未规定覆写哪条轨** | 双轨制下存在**两条轨**：`settings.html` 只覆写 **第二轨 `--bmp-color-primary`**（`settings.html:262-285`），而 **v2 页面全部走第一轨 `--accent`**（`home-v2.html` 33 处 / `mobile/home-v2.html` 34 处 / `login.html` 15 处，对 `--bmp-color-primary` 均为 **0 处**）→ **覆写命中率约一半，v2 页主题切换完全无效**；另 `bmp_ui_style` 读取者仅 `settings.html` 1 个文件 | **需产品/架构裁定覆写路径**：<br>**路径 A**：覆写照写 `--accent`/`--accent-warm` + 全站统一 `applyUiStyle()` + 移除 3 页内联 `:root`（符合 PRD，代价是需改代码）<br>**路径 B**：收窄为「仅管理端生效」，门户 v2 固定麓邦红（**须改需求**）<br>**⚠ 路径 A 必须与 G-7 同批**（否则破坏 H2） | 产品/架构裁定后落地；并回写 PRD §6.1.6 与 UIUX §5.3/§5.6 |

### A.5 与事实基线 P-01~P-21 的对应

> **口径说明**：P-01~P-08 为**首轮扫描**发现（`00-事实基线.md` §4.3）；**P-09~P-21 为主理人复核与运行时探针**补充（同文件 §6）。
> 本表登记为**「本规范是否承载该问题」**，非问题清单本身 —— 完整问题清单以 `outputs/核查/` 为准。
> 采纳主理人对 **P-02 / P-04 的口径修正**（见下方对应行）。

| 事实基线条目 | 本规范对应位置 | 本规范给出的修复口径 |
| --- | --- | --- |
| **P-01（P0）紧急度语义色误用** | §2.1.3 第 3 条 + 反例表（**A/B/C 三组，精确 17 处**） | **A 组 4 处**：`todos.html:20`、`approval.html:24`、`common.css:55,116` → 品牌红（G-7 后为 `--bmp-color-urgent`）；**B 组 12 处超时/临期文字**：`todos.html:99,101`、`approval.html:127,129,216`、`home.html:152,153`、`mobile/index.html:234,235,324,325,385` → 品牌红；**C 组 1 处**：`pages-config.js:3269-3270` 公告置顶标签 → 品牌红。**（D）组 5 处已正确（`home-v2.html:215/315/316/326`、`mobile/home-v2.html:496/526`），勿误改**。**⚠ 主理人补充高杠杆点**：`common.css:57` 的 `.dot-urgent` 为**全局默认类**，改这一处即可同时修正 `todos`/`approval`/`mobile/index` 的紧急圆点（引用链 `mock.js:615` `URGENCY` 映射） |
| P-02（P1）移动端冷色残留 | §2.9.5 checklist、§2.4.2 反例 | **采纳主理人精确分类**：`mobile/home-v2.html` **真违规 6 处**（`:64 :76 :81 :91 :250 :780 :781`）+ 低风险 3 处（`:515 :1510×2`）；`mobile/index.html` 4 处（`:10 :13 :16 :25`）。**口径**：设备模拟外框（手机壳/状态栏/home indicator/说明侧栏）保留中性深色隐喻，但**改为 Token 引用**；`19-31` 行的 `:root` Token 定义段与 `#1677FF` 渠道色**属合理，勿改** |
| P-03（P1）老首页冷色渐变 | §2.9.5 checklist | `home.html:10` 的 `#E4453A` 改 `var(--accent-warm)`（渐变第二色） |
| P-04（P1）非标准色 | §2.9.5 checklist、§2.1.1 | **采纳主理人重大修正**：真实修复面**从「62 处」收缩为约 8 处**（`home-v2.html:210 :500 :327 :584 :333 :334 :566 :568 :655`）。**排除项**：`:22-32` Token 定义（11 处）、`#f6f5f4` 字面复用（10 处）、**`1455-1545` `embedDemoDoc()` 内 34 处（模拟第三方大屏，独立风格，本就不应套中台 Token）**。**教训**：十六进制计数 ≠ 违规计数，必须逐行判上下文 |
| P-05（P1）5 态覆盖不均 | §3 全章 + §10.5 走查项 1 | 每页 ≥4 态；`notices.html` 补齐；`todos/messages` 补加载+错误。**并入 P-19 根因**（见下） |
| **P-06（P2）settings.html 主题预设疑冷色** | **§2.1.2「易误判点 A」+ §2.1.2.1 专条 + §2.1.5 + §A.4 D-5/D-16** | **明确「风格预设色 ≠ 设计基准色」：预设色可超出基准色表，非冷色残留、非缺陷；语义色 / 紧急红 / 渠道色不随主题变；并给出 3 条走查判定口径**。**注意与 P-17 联动**：预设可超基准表 ≠ 预设可随意定义（预设值是产品规定值，须符合 PRD） |
| **（P-14）运营看板 `aaMom` 升绿降红易误判** | **§2.1.4.1「易误判点 B」+ §A.4 D-15** | **明确 `pages-config.js:3364-3369` 属「运营指标类 = 升绿降红」的正确实现，不得判为 danger 误用；区分口诀「时间压力→改品牌红；指标变差→保留 danger」** |
| P-07（P2）console.html 内联冷色 | §2.9.5 checklist、§2.1.2 | 已有 `console.js:58-77` 注入补丁；**建议改为直接修 `console.html` 内联样式**（根治） |
| P-08（P2）老首页与 v2 并存 | §10.1、§0.2 | 在 `index.html` 标注「老首页=对照件」；正式版下线。**并入 P-15 / P-16** |
| **P-09 / P-09b（P1）`index.html` 页面 ID 与功能点标签系统性错位（11 处）** | §0.2（页面清单口径） | **本规范不直接承载**（属导航台标注问题，交文档 B 与核查报告）；**本规范提请**：页面 ID 一律以 **UIUX §3.4 页面地图为唯一权威源**（如 `UI-A4-01`=待办中心、`UI-U-01`=个人设置；**不存在 `UI-A1-05` / `UI-WF-06`**）。与 §0.2「30+2 页」口径一致 |
| P-10（P1）跨栏拖拽与 UIUX §5.3 硬规则冲突 | §4.3.7 `LayoutGrid`（props `colSpan` / events `drop`） | **本规范已按 UIUX §5.3 写死「跨栏禁拖拽」**（`drop` 事件用于提示被拒）。**此项属「待裁定」**（原型超纲 vs UIUX 表述过严），裁定前**不得单方删功能**；若裁定放开，需同步改 §4.3.7 与 §2.3.2 |
| P-11（P1）AI 简报「诚实原则」降级态缺失 | §3.3（降级卡）、§4.4（AI 简报卡） | 本规范 §3.3 已要求「单模块失败不拖垮整页 + 降级卡」；**补充要求**：AI 不可用/超时/数据不足时**不生成判断文案、不显示 AI 徽标**，降级为模板句 + 小字「AI 暂不可用，已按待办时限排序」（UIUX §5.3 第 6 条） |
| P-12（P1）UI-M-04 消息卡片落地页缺失 | §0.2（移动端 5 页：UI-M-01~05）、§4.5 `MobileMsgCard` | 本规范 §0.2 已按 **UI-M-01~05** 登记（含 UI-M-04）；§4.5 已列 `MobileMsgCard`。**建议补实现**（A2-F04 为 P0） |
| P-13（P1）紧迫度分组阈值与 UIUX §5.3 权重表不符 | §2.1.4（紧迫度语义）、§6.3 | 本规范已固化紧迫度三档语义色（紧急=品牌红/重要=橙/普通=中性）。**阈值须以 UIUX §5.3 权重表为准**：今天必须做 = `urgency=2` 或 `overdue` 或 `remainHours ≤ 4`；本周 = `≤168`；知悉 = `urgency=0` 且 `>24`。**原型三处阈值 6/4/6 不收敛 → 必须抽出常量**（建议 `URGENCY_THRESHOLD`） |
| P-15（P1）全站 9 处跳转指向老首页 `home.html` | §10.1（老首页=归档定位） | **本规范提请**：v2 为新默认（UIUX §5.3），登录/回跳/顶栏导航一律指向 `home-v2.html`；修复面 9 处（**排除 `index.html:278` 归档区**，该处指向 `home.html` 正确） |
| P-16（P2）`mobile/index.html` 为孤立旧版移动端 | §0.2、§10.1 | 与 `home.html` 同类，属历史版本；**建议在导航台「归档」区显式列出或加「已归档」标注**；其冷色修复并入 P-02 |
| **P-17（P1）主题预设 3 档色值与 1 处名称不符合 PRD** | **§2.1.5（已含口径差异登记）+ §2.1.2.1 ①** | **本规范 §2.1.5 已登记该差异**（以原型落地为准）。**与 P-06/D-5 的边界澄清**：**「预设色 ≠ 设计基准色」成立（预设可超基准色表），但不等于「预设色可随意定义」** —— 预设值属**产品规定值**，PRD §6.1.4 明确 5 档色值。修复面：`settings.html:222-228` 的 靛蓝/石墨灰/青竹绿（+名称「青绿」→「青竹绿」）3 档色值 + 1 处名称 |
| **P-18（P1）`v-perm` 权限交互零落地** | **§7 全章（四策略 + 隐藏/禁用判定 6 条）** | 本规范 §7 已把 UIUX §4.5 落为可判定规则（含 §7.2 六条判定）。**补充要求**：原型作为交互基准稿，**每类权限策略至少 1 个可切换演示**（否则无法验证「隐藏 vs 禁用+tooltip」差异） |
| **P-19（P1）管理端列表页 5 态缺口共同根因（高杠杆）** | **§3 全章 + §4.3.13 `SearchFilterBar`** | **本规范提请**：根因在 `console.js:121-156` 的 `renderListPage()` **无状态分支**，一处修复覆盖 **16 页**。**建议**：在该函数加 `state` 参数（`normal\|loading\|empty\|error\|noperm`）并以开关演示，**而非逐页改**。与 §3.7「状态优先级」配套 |
| P-20（P2）移动端驳回用 `prompt()` 与 PC 不一致 | §4.5 `MobileSheet`、§5.1（Dialog/Drawer/行内边界） | 本规范 §5.1 已要求「字段 >8 用 Drawer/Sheet；行内反馈用于字段校验」。**建议**改为**底部 Sheet 输入 + 必填校验**，与 PC 内联表单范式对齐 |
| **P-21（P0·已运行时确证）A1-F06 主题切换在 v2 页面实际不生效** | **§2.1.2.2（专节·含可复现命令）+ §2.9 G-7 + §A.4 D-16** | **本规范已固化**：缺陷机理三段式 + 运行时探针命令（本次实测 `accent=#C8161D primary=#4F46E5 EQUIVALENT=NO`）+ 两条修复路径（A 兼容双轨 / B 收窄管理端）+ **与 G-7 的联动**（路径 A 必须同批落 G-7，否则破坏 H2） |

### A.6 附 A 走查 checklist

- [ ] §A.1 逐章追溯覆盖 §0~§10 全部章节
- [ ] §A.2 覆盖 PRD 中所有「前端可见」功能点（A1/A2/A4/B1/B2/B3/C/D/E/F/H/I/J）
- [ ] §A.3 覆盖 UIUX §1~§10 全部章节（N/A 项已标注）
- [ ] §A.4 差异 D-1~**D-16** 全部登记且有处理建议
- [ ] §A.5 与事实基线 **P-01~P-21** 逐条对应（P-01 精确到 17 处 + 高杠杆点；P-04 采纳「62→8 处」修正；P-21 含可复现命令）
- [ ] **§2.1.4.1 红/绿语义场景区分**已在规范中写死（行情类涨红跌绿 / 运营指标类升绿降红），且已声明「`aaMom()` 非缺陷」
- [ ] **§2.1.2.1 风格预设色 ≠ 设计基准色**已在规范中写死，并给出 3 条走查判定口径
- [ ] **§2.1.2.2（P-21）主题色双轨脱钩**的运行时探针命令已执行，且结果已记录（修复前 `EQUIVALENT=NO`、修复后 `YES`）
- [ ] **§2.1.3 精确修复面**（17 处）与**正例清单**（5 处）均已列全，且已提示「禁止扩大修复面」
- [ ] §A.5 与事实基线 P-01~P-08 逐条对应
- [ ] 凡「本规范新增」的条目均有理由说明
- [ ] 「全部/零/没有」类断言均附扫描命令（见 §10.6）

---

## 附录 B 文档信息与维护

| 项 | 内容 |
| --- | --- |
| 文件路径 | `outputs/规范/麓邦业务中台全局UI规范.md` |
| 文档角色 | 文档 A · 全局 UI 规范（横向） |
| 配套文档 | 文档 B · `outputs/规范/麓邦业务中台UI-UX页面规范.md`（纵向，逐页 32 页） |
| 核查输入 | `outputs/核查/00-事实基线.md`、`outputs/核查/01-原型可交互性核查.md`、`outputs/核查/02-PRD还原度核查.md` |
| 不修改声明 | 本规范**只读**引用上游；**未修改** `prototype/` 下任何文件，**未修改** PRD 与 UIUX |
| 术语一致性 | 沿用上游术语：紧迫度时间轴 / ticket 交换 / cardId 不可增删 / 双轨制 / 五范式 |
| 维护规则 | ① 上游 Token 变更 → 同步 §2.9 落地表；② 新增组件 → 更新 §4.3；③ 新增页面 → 更新 §0.2（页面数） |
| 待裁定移交 | U-1~U-5（§0.4）+ D-1~D-13（§A.4）移交产品/设计裁定后再更新本规范 |