/* ============================================================
   全局界面风格应用器（A1-F06 · 界面风格定制）
   ------------------------------------------------------------
   背景（R-1 裁定 = 方案 A）：
     settings.html 原来只覆写 --bmp-color-primary 三档，而 v2 门户页
     （home-v2.html / mobile/home-v2.html / login.html）大量使用第一轨
     --accent 且自带内联 :root 定义 → 主题切换在这些页面【完全不生效】。
   本脚本职责：
     ① 读取 localStorage「bmp_ui_style」，把「主题色 / 内容密度 / 圆角」
        统一注入到 :root —— 主题色【同时覆写 --accent / --accent-warm 与
        --bmp-color-primary 三档】，使第一轨与第二轨同步变色（双轨制不脱钩）；
     ② 语义色（success / warning / danger）、紧急语义红、渠道品牌色【恒不覆写】
        （A1-F06 硬边界 H2：语义色不随主题色改变）；
     ③ 不做暗色（决议 #3）。
   接入方式：各页面在 </head> 前引入 <script src="assets/ui-style.js"></script>
            （移动端为 ../assets/ui-style.js）。零依赖、纯 JS。
   ============================================================ */
(function () {
  var STYLE_KEY = "bmp_ui_style";

  /* 主题色预设：primary 取 PRD §6.1.6；light/dark 为派生档（保持对比度） */
  var THEMES = {
    lubon:    { primary: "#C8161D", light: "#FBECEC", dark: "#A51218", warm: "#dd5b00" },
    indigo:   { primary: "#2F6FEB", light: "#EAF1FE", dark: "#1D4FB0", warm: "#dd5b00" },
    graphite: { primary: "#4A4A47", light: "#F0EFED", dark: "#33332F", warm: "#dd5b00" },
    amber:    { primary: "#DD5B00", light: "#FFF4EC", dark: "#B34700", warm: "#dd5b00" },
    teal:     { primary: "#1F7A5A", light: "#E8F5EF", dark: "#155C43", warm: "#dd5b00" }
  };

  /* 内容密度：覆写行高 / 内边距 / 间距（只改这些，不动字号档位与栅格） */
  var DENSITY = {
    loose:   { gap: "16px", padY: "14px", line: "24px" },
    normal:  { gap: "12px", padY: "10px", line: "22px" },
    compact: { gap: "8px",  padY: "6px",  line: "20px" }
  };

  /* 圆角：映射 radius-sm/md/lg（胶囊 9999px 三档不变） */
  var RADIUS = {
    sharp:    { sm: "2px", md: "4px", lg: "4px" },
    standard: { sm: "4px", md: "8px", lg: "12px" },
    round:    { sm: "8px", md: "12px", lg: "16px" }
  };

  function readStyle() {
    var s = { theme: "lubon", density: "normal", radius: "standard" };
    try {
      var raw = localStorage.getItem(STYLE_KEY);
      if (!raw) return s;
      var o = JSON.parse(raw);
      if (!o || typeof o !== "object") return s;
      if (THEMES[o.theme]) s.theme = o.theme;
      if (DENSITY[o.density]) s.density = o.density;
      if (RADIUS[o.radius]) s.radius = o.radius;
    } catch (e) { /* 解析失败 → 默认风格 */ }
    return s;
  }

  /* 生成覆写 CSS：主题色双轨同步 + 密度 + 圆角；语义色一律不动 */
  function styleCss(s) {
    var t = THEMES[s.theme], d = DENSITY[s.density], r = RADIUS[s.radius];
    return ":root{" +
      /* ① 第二轨（兼容别名）：主色三档 */
      "--bmp-color-primary:" + t.primary + ";" +
      "--bmp-color-primary-light:" + t.light + ";" +
      "--bmp-color-primary-dark:" + t.dark + ";" +
      /* ② 第一轨（Notion 暖色基准）：同步覆写，避免两轨脱钩 */
      "--accent:" + t.primary + ";" +
      "--accent-warm:" + t.warm + ";" +
      /* ③ 内容密度 */
      "--density-gap:" + d.gap + ";" +
      "--density-pad-y:" + d.padY + ";" +
      "--density-line:" + d.line + ";" +
      /* ④ 圆角 */
      "--bmp-radius-sm:" + r.sm + ";" +
      "--bmp-radius-md:" + r.md + ";" +
      "--bmp-radius-lg:" + r.lg + ";" +
      "}";
  }

  /* 应用：注入 / 更新 <style id="ui-style-override">，置于 head 末尾（晚于页面内联 :root → 优先） */
  function apply() {
    var css = styleCss(readStyle());
    var el = document.getElementById("ui-style-override");
    if (!el) {
      el = document.createElement("style");
      el.id = "ui-style-override";
      // 必须晚于页面内联 <style>（各页 :root 定义在其中），故追加到 head 末尾
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = css;
  }

  /* 暴露给 settings.html 复用（保存后立即生效），并对外暴露读取接口 */
  window.BMP_UI_STYLE = {
    KEY: STYLE_KEY,
    THEMES: THEMES,
    DENSITY: DENSITY,
    RADIUS: RADIUS,
    read: readStyle,
    css: styleCss,
    apply: apply
  };

  /* 尽早执行：脚本置于 head 末尾，DOM 解析到 extension 即生效（防闪烁） */
  apply();
})();