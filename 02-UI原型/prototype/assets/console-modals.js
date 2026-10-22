/* ============================================================
   管理控制台统一交互基建 · window.CM
   ------------------------------------------------------------
   职责：Dialog / Drawer / Wizard 统一开合；表单范式（fields /
        bindBlur / validate / submit / setErrors）；无障碍（焦点圈定
        与 Esc 栈）。一处定义、全管理端复用。
   设计依据：《原型交互补全-架构设计与任务分解.md》§3.1 ~ §3.4
   红线约束：
     · 零依赖：无 CDN / 外链字体 / 第三方库；
     · 零硬编码色值：色值一律 var(--accent) / var(--bmp-*)；
     · 复用共享宿主：#m-form(Dialog) 与 #d-generic(Drawer)，不新增宿主；
     · DOM id 前缀 cm-；localStorage 键前缀 bmp_（列设置 bmp_col_prefs）。
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 共享宿主常量（复用 console.html 现成节点） ---------- */
  var HOST_DIALOG = "m-form";     /* 通用表单弹窗宿主 */
  var HOST_DRAWER = "d-generic";  /* 通用详情 / 向导抽屉宿主 */
  var COL_PREFS_KEY = "bmp_col_prefs"; /* 列设置记忆键（I-07，T06 复用） */

  /* ---------- 实例登记表：逻辑 id → 宿主与上下文 ---------- */
  var REG = Object.create(null);
  var WIZ = Object.create(null);

  /* ---------- 焦点栈：Esc 用「栈」关闭最上层（避免 Dialog+Drawer 并发错乱，风险 R2） ---------- */
  var escStack = [];                 /* [{ id, host }] 后进先出 */
  var trapState = new WeakMap();     /* containerEl → { restore, handler } */

  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

  /* ============================================================
     工具函数
     ============================================================ */
  function toast(type, text) { if (typeof window.msg === "function") window.msg(type, text); }
  function $(id) { return document.getElementById(id); }
  function slice(list) { return Array.prototype.slice.call(list || []); }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function escapeAttr(s) { return escapeHtml(s); }

  /* 读取单个控件的值（checkbox → 布尔，其余 → 字符串） */
  function readControl(el) {
    if (!el) return "";
    if (el.type === "checkbox") return !!el.checked;
    /* radio 组：仅读取选中项（同 data-name 多枚 radio） */
    if (el.type === "radio") {
      if (!el.checked) return undefined;
      return el.value == null ? "" : el.value;
    }
    return el.value == null ? "" : el.value;
  }

  /* 读取 rootEl 内所有 [data-name] 控件的值 → 对象 */
  function readAll(rootEl) {
    var out = {};
    if (!rootEl) return out;
    slice(rootEl.querySelectorAll("[data-name]")).forEach(function (el) {
      out[el.getAttribute("data-name")] = readControl(el);
    });
    return out;
  }

  /* ============================================================
     表单范式 · Form
     ============================================================ */
  var Form = {
    /* 字段渲染 → HTML；fields = [{ name, label, type, required, options, tip, placeholder, validators }] */
    fields: function (fields) {
      fields = fields || [];
      return fields.map(function (f) { return renderField(f); }).join("");
    },

    /* 失焦 / 输入即单字段校验（I-01） */
    bindBlur: function (rootEl, fields) {
      if (!rootEl || !fields) return;
      fields.forEach(function (f) {
        if (!f || !f.name) return;
        var ctrl = rootEl.querySelector('[data-name="' + f.name + '"]');
        if (!ctrl) return;
        var run = function () { validateField(rootEl, f, ctrl); };
        ctrl.addEventListener("blur", run);
        ctrl.addEventListener("input", run);
        ctrl.addEventListener("change", run);
      });
    },

    /* 全量校验 → [{ name, message }] */
    validate: function (fields, values) {
      values = values || {};
      var errs = [];
      (fields || []).forEach(function (f) {
        var m = firstError(f, values[f.name]);
        if (m) errs.push({ name: f.name, message: m });
      });
      return errs;
    },

    /* 提交防重复：置 .loading + disabled + aria-busy="true"，fn 完成后恢复（I-02） */
    submit: function (btnEl, fn) {
      if (!btnEl) { if (typeof fn === "function") fn(); return; }
      var prevText = btnEl.textContent;
      btnEl.classList.add("loading");
      btnEl.disabled = true;
      btnEl.setAttribute("aria-busy", "true");
      var restore = function () {
        btnEl.classList.remove("loading");
        btnEl.disabled = false;
        btnEl.removeAttribute("aria-busy");
        if (prevText != null) btnEl.textContent = prevText;
      };
      var out;
      try {
        out = (typeof fn === "function") ? fn() : null;
      } catch (e) {
        restore();
        toast("error", "操作失败：" + (e && e.message ? e.message : e));
        return;
      }
      if (out && typeof out.then === "function") {
        out.then(function () { restore(); }, function (e) { restore(); toast("error", (e && e.message) || "操作失败"); });
      } else {
        /* 同步完成：保留短暂 loading 视觉后恢复 */
        setTimeout(restore, 260);
      }
    },

    /* 失败行内错误：标红字段 + 定位首个错误 */
    setErrors: function (rootEl, errors) {
      if (!rootEl || !errors || !errors.length) return;
      errors.forEach(function (e) {
        var box = rootEl.querySelector('.field[data-field="' + e.name + '"]');
        if (!box) return;
        box.classList.add("has-error");
        var em = box.querySelector(".err-msg");
        if (em) em.textContent = e.message;
      });
      var first = rootEl.querySelector('.field.has-error input, .field.has-error select, .field.has-error textarea');
      if (first && first.focus) { try { first.focus(); } catch (ignore) { } }
    },

    /* 便捷读取（供向导 / 弹窗复用） */
    read: function (rootEl, fields) {
      var out = {};
      (fields || []).forEach(function (f) {
        if (!rootEl || !f || !f.name) return;
        /* radio：取同名字段组内 checked 项 */
        if (f.type === "radio") {
          var checked = rootEl.querySelector('[data-name="' + f.name + '"]:checked');
          out[f.name] = checked ? readControl(checked) : (f.value != null ? f.value : "");
          return;
        }
        var ctrl = rootEl.querySelector('[data-name="' + f.name + '"]');
        if (ctrl) out[f.name] = readControl(ctrl);
      });
      return out;
    }
  };

  function renderField(f) {
    var nm = f.name || ("f_" + Math.random().toString(36).slice(2, 8));
    var req = f.required ? '<span class="req">*</span>' : "";
    var label = "<label>" + req + escapeHtml(f.label || f.name || "") + "</label>";
    var ctrl = "";
    if (f.type === "select") {
      var opts = (f.options || []).map(function (o) {
        var val = (o && typeof o === "object") ? o.value : o;
        var txt = (o && typeof o === "object") ? o.label : o;
        var sel = (f.value != null && String(f.value) === String(val)) ? " selected" : "";
        return '<option value="' + escapeAttr(val) + '"' + sel + ">" + escapeHtml(txt) + "</option>";
      }).join("");
      ctrl = '<select class="select" data-name="' + escapeAttr(nm) + '"' + (f.required ? " required" : "") + ">" +
        (f.placeholder ? '<option value="">' + escapeHtml(f.placeholder) + "</option>" : "") + opts + "</select>";
    } else if (f.type === "textarea") {
      ctrl = '<textarea class="input" rows="' + (f.rows || 3) + '" data-name="' + escapeAttr(nm) +
        '" placeholder="' + escapeAttr(f.placeholder || "") + '">' + escapeHtml(f.value || "") + "</textarea>";
    } else if (f.type === "checkbox") {
      ctrl = '<label class="flex items-center gap-2"><input type="checkbox" data-name="' + escapeAttr(nm) + '"' +
        (f.value ? " checked" : "") + "> " + escapeHtml(f.checkboxText || f.label || "") + "</label>";
    } else if (f.type === "radio") {
      /* 接入档位等单选：wf-form-checks 纵向排列，便于扫读三档差异 */
      var rOpts = (f.options || []).map(function (o) {
        var val = (o && typeof o === "object") ? o.value : o;
        var txt = (o && typeof o === "object") ? o.label : o;
        var chk = (f.value != null && String(f.value) === String(val)) ? " checked" : "";
        return '<label><input type="radio" name="cm-' + escapeAttr(nm) + '" data-name="' + escapeAttr(nm) +
          '" value="' + escapeAttr(val) + '"' + chk + ' style="accent-color:var(--accent)"> ' + escapeHtml(txt) + "</label>";
      }).join("");
      ctrl = '<div class="wf-form-checks" style="flex-direction:column;align-items:flex-start;gap:8px">' + rOpts + "</div>";
    } else {
      var t = (f.type === "number" || f.type === "date") ? (' type="' + f.type + '"') : ' type="text"';
      ctrl = '<input class="input"' + t + ' data-name="' + escapeAttr(nm) + '" value="' +
        escapeAttr(f.value != null ? f.value : "") + '" placeholder="' + escapeAttr(f.placeholder || "") + '"' +
        (f.required ? " required" : "") + ">";
    }
    var tip = f.tip ? '<div class="tip">' + escapeHtml(f.tip) + "</div>" : "";
    var err = '<div class="err-msg">' + escapeHtml(f.errText || ((f.label || f.name || "") + "为必填项")) + "</div>";
    return '<div class="field" data-field="' + escapeAttr(nm) + '">' + label + ctrl + tip + err + "</div>";
  }

  /* 单字段首错（必填 + validators）→ 字符串 | null */
  function firstError(f, v) {
    if (!f) return null;
    var empty = (v == null || v === "" || v === false || (Array.isArray(v) && !v.length));
    if (f.required && empty) return (f.label || f.name || "该字段") + "为必填项";
    if (!empty && Array.isArray(f.validators)) {
      for (var i = 0; i < f.validators.length; i++) {
        var vd = f.validators[i];
        if (typeof vd === "function") {
          var m = vd(v);
          if (m) return m;
        } else if (vd && typeof vd === "object") {
          var bad = false;
          try {
            if (vd.test) bad = !vd.test(v);
            else if (vd.regex) bad = !(new RegExp(vd.regex)).test(String(v));
          } catch (ignore) { bad = false; }
          if (bad) return vd.message || ((f.label || f.name || "该字段") + "格式不正确");
        }
      }
    }
    return null;
  }

  /* 单字段校验 → 切换 .has-error 与 .err-msg（I-01） */
  function validateField(rootEl, f, ctrl) {
    var err = firstError(f, readControl(ctrl));
    var box = rootEl.querySelector('.field[data-field="' + f.name + '"]') || (ctrl.closest ? ctrl.closest(".field") : null);
    if (!box) return err;
    if (err) {
      box.classList.add("has-error");
      var em = box.querySelector(".err-msg");
      if (em) em.textContent = err;
    } else {
      box.classList.remove("has-error");
    }
    return err;
  }

  /* ============================================================
     无障碍 · A11y（焦点圈定 + Esc 栈）
     ============================================================ */
  /* 焦点圈定：记录触发元素 → 初始焦点置于首个非危险控件 → Tab 在容器内循环（I-14 / I-06） */
  function focusTrap(containerEl) {
    if (!containerEl) return;
    var restore = document.activeElement; /* 关闭时归还焦点（I-06） */
    var handler = function (e) {
      if (e.key !== "Tab") return;
      var items = slice(containerEl.querySelectorAll(FOCUSABLE)).filter(function (el) { return !el.disabled; });
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    containerEl.addEventListener("keydown", handler);
    trapState.set(containerEl, { restore: restore, handler: handler });
    /* 危险按钮初始焦点不在其上（§4.7）：优先聚焦首个非 danger 控件 */
    var items = slice(containerEl.querySelectorAll(FOCUSABLE)).filter(function (el) { return !el.disabled; });
    var safe = null;
    for (var i = 0; i < items.length; i++) {
      if (!/(danger|btn-danger)/i.test(items[i].className || "")) { safe = items[i]; break; }
    }
    var target = safe || items[0] || containerEl;
    if (target && target.focus) { try { target.focus(); } catch (ignore) { } }
  }

  /* 释放：移除监听并把焦点归还触发元素（I-06） */
  function releaseTrap(containerEl) {
    if (!containerEl) return;
    var st = trapState.get(containerEl);
    if (!st) return;
    containerEl.removeEventListener("keydown", st.handler);
    trapState.delete(containerEl);
    if (st.restore && st.restore.focus) { try { st.restore.focus(); } catch (ignore) { } }
  }

  /* 全局 Esc：按「栈」关闭最上层（弹窗 → 抽屉 → 向导） */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" && e.key !== "Esc") return;
    if (!escStack.length) return;
    e.preventDefault();
    closeImpl(escStack[escStack.length - 1].id);
  });

  /* ============================================================
     统一下发：把宿主内的关闭控件重绑到 CM.close（清理焦点栈）
     ============================================================ */
  function bindCloseControls(host, id, container) {
    if (!host) return;
    slice(host.querySelectorAll(".modal-close")).forEach(function (b) {
      b.onclick = function () { closeImpl(id); };
    });
    if (container === "dialog") {
      slice(host.querySelectorAll(".modal-foot .btn")).forEach(function (b) {
        if (b.id !== "formOk") b.onclick = function () { closeImpl(id); };
      });
    } else {
      var mask = $(host.id + "-mask");
      if (mask) mask.onclick = function () { closeImpl(id); };
    }
  }

  /* ============================================================
     统一提交时序（CRITICAL）：校验 → loading → onSubmit → 恢复
     ============================================================ */
  function handleSubmit(id, btnEl, opts, rootEl) {
    var values = opts.fields ? Form.read(rootEl, opts.fields) : readAll(rootEl);
    if (opts.fields) {
      var errs = Form.validate(opts.fields, values);
      if (errs.length) { Form.setErrors(rootEl, errs); toast("error", errs[0].message); return; }
    }
    Form.submit(btnEl, function () {
      if (typeof opts.onSubmit === "function") {
        return opts.onSubmit(values, { id: id, rootEl: rootEl, close: function () { closeImpl(id); } });
      }
      return null;
    });
  }

  /* ============================================================
     Dialog（复用 #m-form）
     ============================================================ */
  function openDialogImpl(opts) {
    opts = opts || {};
    var id = opts.id || ("cm-dlg-" + Date.now());
    var host = $(HOST_DIALOG);
    if (!host) { toast("error", "未找到弹窗宿主 #" + HOST_DIALOG); return null; }
    var modal = host.querySelector(".modal");
    var titleEl = $("formTitle"), bodyEl = $("formBody"), okBtn = $("formOk");
    if (modal) {
      modal.style.width = (opts.width || 480) + "px";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.setAttribute("aria-label", opts.title || "对话框");
    }
    if (titleEl) titleEl.textContent = opts.title || "编辑";
    if (bodyEl) {
      bodyEl.innerHTML = (opts.body || "") + (opts.fields ? Form.fields(opts.fields) : "");
      if (opts.fields) Form.bindBlur(bodyEl, opts.fields);
    }
    if (okBtn) {
      okBtn.style.display = "";
      okBtn.className = "btn " + (opts.danger ? "btn-danger" : "btn-primary");
      okBtn.textContent = opts.submitText || "保存";
      okBtn.onclick = function () { handleSubmit(id, okBtn, opts, bodyEl); };
    }
    bindCloseControls(host, id, "dialog");
    REG[id] = { host: HOST_DIALOG, modal: modal, opts: opts };
    if (typeof window.openModal === "function") window.openModal(HOST_DIALOG);
    focusTrap(modal);
    escStack.push({ id: id, host: HOST_DIALOG });
    return id;
  }

  /* ============================================================
     Drawer（复用 #d-generic）
     ============================================================ */
  function openDrawerImpl(opts) {
    opts = opts || {};
    var id = opts.id || ("cm-drw-" + Date.now());
    var host = $(HOST_DRAWER);
    if (!host) { toast("error", "未找到抽屉宿主 #" + HOST_DRAWER); return null; }
    if (opts.width) host.style.width = opts.width + "px";
    host.setAttribute("role", "dialog");
    host.setAttribute("aria-modal", "true");
    host.setAttribute("aria-label", opts.title || "抽屉");
    var titleEl = $("dTitle"), bodyEl = $("dBody");
    if (titleEl) titleEl.textContent = opts.title || "详情";
    var foot = (opts.submitText === false) ? "" :
      '<div class="flex gap-2 mt-4"><button type="button" class="btn ' + (opts.danger ? "btn-danger" : "btn-primary") +
      '" id="cm-drawer-ok">' + escapeHtml(opts.submitText || "保存") + '</button>' +
      '<button type="button" class="btn" id="cm-drawer-cancel">取消</button></div>';
    if (bodyEl) {
      bodyEl.innerHTML = (opts.body || "") + (opts.fields ? Form.fields(opts.fields) : "") + foot;
      if (opts.fields) Form.bindBlur(bodyEl, opts.fields);
    }
    bindCloseControls(host, id, "drawer");
    var ok = $("cm-drawer-ok");
    if (ok) ok.onclick = function () { handleSubmit(id, ok, opts, bodyEl); };
    var cancel = $("cm-drawer-cancel");
    if (cancel) cancel.onclick = function () { closeImpl(id); };
    REG[id] = { host: HOST_DRAWER, modal: host, opts: opts };
    if (typeof window.openDrawer === "function") window.openDrawer(HOST_DRAWER);
    focusTrap(host);
    escStack.push({ id: id, host: HOST_DRAWER });
    return id;
  }

  /* ============================================================
     Wizard（默认渲染进共享抽屉 #d-generic，不跳独立页）
     ============================================================ */
  function openWizardImpl(opts) {
    opts = opts || {};
    var steps = opts.steps || [];
    if (!steps.length) { toast("error", "向导至少需要 1 个步骤"); return null; }
    var id = opts.id || ("cm-wiz-" + Date.now());
    var container = (opts.container === "dialog") ? "dialog" : "drawer";
    var hostId = (container === "dialog") ? HOST_DIALOG : HOST_DRAWER;
    var host = $(hostId);
    if (!host) { toast("error", "未找到宿主 #" + hostId); return null; }
    var inst = {
      id: id, steps: steps, container: container, host: hostId, opts: opts,
      ctx: { values: {}, data: {}, step: 0 }
    };
    var titleEl = $(container === "dialog" ? "formTitle" : "dTitle");
    var bodyEl = $(container === "dialog" ? "formBody" : "dBody");
    if (!bodyEl) { toast("error", "宿主缺少内容容器"); return null; }
    if (container === "dialog") {
      var modal = host.querySelector(".modal");
      if (modal) {
        modal.style.width = (opts.width || 720) + "px";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
      }
      var okH = $("formOk"); if (okH) okH.style.display = "none";
    } else {
      if (opts.width) host.style.width = opts.width + "px";
      host.setAttribute("role", "dialog");
      host.setAttribute("aria-modal", "true");
    }
    if (titleEl) titleEl.textContent = opts.title || "配置向导";
    inst.mount = bodyEl;
    bodyEl.innerHTML = '<div id="cm-wizard"></div>';
    bindCloseControls(host, id, container);
    var focusRoot = (container === "dialog") ? host.querySelector(".modal") : host;
    REG[id] = { host: hostId, modal: focusRoot, opts: opts, wizard: true };
    WIZ[id] = inst;
    if (container === "dialog") { if (typeof window.openModal === "function") window.openModal(HOST_DIALOG); }
    else { if (typeof window.openDrawer === "function") window.openDrawer(HOST_DRAWER); }
    focusTrap(focusRoot);
    escStack.push({ id: id, host: hostId });
    renderWizard(inst);
    return id;
  }

  /* 渲染步骤条 + 当前步 + 底部导航（复用 .steps / .step / .line） */
  function renderWizard(inst) {
    var mount = inst.mount;
    if (!mount) return;
    var wrap = mount.querySelector("#cm-wizard");
    if (!wrap) return;
    var steps = inst.steps, i = inst.ctx.step, step = steps[i] || {};
    var bar = '<div class="steps">' + steps.map(function (s, k) {
      var cls = (k === i) ? "active" : (k < i ? "done" : "");
      return (k ? '<div class="line"></div>' : "") +
        '<div class="step ' + cls + '"><span class="n">' + (k + 1) + '</span>' +
        '<span class="t">' + escapeHtml(s.title || ("步骤" + (k + 1))) + "</span></div>";
    }).join("") + "</div>";
    var body = (typeof step.render === "function") ? step.render(inst.ctx) : (step.render || "");
    if (step.fields) body += Form.fields(step.fields); /* 字段由基建统一渲染，render 只需给出上下文 / 说明 */
    var isLast = (i === steps.length - 1);
    var foot = '<div class="flex gap-2 mt-4" id="cm-wiz-foot">' +
      (i > 0 ? '<button type="button" class="btn" data-wiz="prev">上一步</button>' : "") +
      '<button type="button" class="btn btn-primary" data-wiz="' + (isLast ? "done" : "next") + '">' +
      escapeHtml(isLast ? (inst.opts.submitText || "完成") : "下一步") + "</button>" +
      '<button type="button" class="btn" data-wiz="cancel">取消</button></div>';
    wrap.innerHTML = bar + '<div id="cm-step-body">' + body + "</div>" + foot;
    slice(wrap.querySelectorAll("[data-wiz]")).forEach(function (b) {
      b.onclick = function () { wizNav(inst, b.getAttribute("data-wiz")); };
    });
    var bodyEl = wrap.querySelector("#cm-step-body");
    if (step.fields && bodyEl) {
      Form.bindBlur(bodyEl, step.fields);
      /* 单选变更时刷新本步（支持接入档位等条件说明 banner） */
      slice(bodyEl.querySelectorAll('input[type="radio"][data-name]')).forEach(function (r) {
        r.addEventListener("change", function () {
          collectStep(inst, step);
          renderWizard(inst);
        });
      });
    }
    var first = bodyEl ? bodyEl.querySelector("input, select, textarea") : null;
    if (first && first.focus) { try { first.focus(); } catch (ignore) { } }
  }

  /* 采集当前步字段值 → ctx.values */
  function collectStep(inst, step) {
    var bodyEl = inst.mount ? inst.mount.querySelector("#cm-step-body") : null;
    if (!bodyEl || !step.fields) return;
    var vals = Form.read(bodyEl, step.fields);
    Object.keys(vals).forEach(function (k) { inst.ctx.values[k] = vals[k]; });
  }

  /* 校验当前步：先 step.validate(ctx)，再对 fields 做必填/规则校验 */
  function stepValidate(inst, step) {
    if (typeof step.validate === "function") {
      var m = step.validate(inst.ctx);
      if (m) return m;
    }
    if (step.fields) {
      var errs = Form.validate(step.fields, inst.ctx.values);
      if (errs.length) {
        var bodyEl = inst.mount.querySelector("#cm-step-body");
        if (bodyEl) Form.setErrors(bodyEl, errs);
        return errs[0].message;
      }
    }
    return null;
  }

  /* 向导导航：下一步 / 上一步 / 提交 / 取消（校验不通过则阻断并提示） */
  function wizNav(inst, act) {
    if (act === "cancel") { closeImpl(inst.id); return; }
    var step = inst.steps[inst.ctx.step] || {};
    collectStep(inst, step);
    var err = stepValidate(inst, step);
    if (err) { toast("error", err); return; }
    if (act === "prev") { inst.ctx.step = Math.max(0, inst.ctx.step - 1); renderWizard(inst); return; }
    if (act === "next") { inst.ctx.step = Math.min(inst.steps.length - 1, inst.ctx.step + 1); renderWizard(inst); return; }
    if (act === "done") {
      if (typeof inst.opts.onDone === "function") inst.opts.onDone(inst.ctx);
      closeImpl(inst.id);
    }
  }

  /* ============================================================
     统一关闭：清焦点栈 + 移除 a11y + 关闭宿主（兼容 DOM id 直接关闭）
     ============================================================ */
  function closeImpl(id) {
    var key = id;
    if (typeof key === "string" && key.charAt(0) === "#") key = key.slice(1);
    for (var k = escStack.length - 1; k >= 0; k--) {
      if (escStack[k].id === key) escStack.splice(k, 1);
    }
    var inst = REG[key];
    if (inst) {
      /* onClose 钩子：供一次性密钥等场景在任意关闭路径（按钮 / Esc / 遮罩）清理内存与 DOM */
      if (inst.opts && typeof inst.opts.onClose === "function") {
        try { inst.opts.onClose(); } catch (ignore) { }
      }
      if (inst.modal) {
        releaseTrap(inst.modal);
        inst.modal.removeAttribute("aria-modal");
        inst.modal.removeAttribute("role");
      }
      if (inst.host === HOST_DIALOG) { if (typeof window.closeModal === "function") window.closeModal(HOST_DIALOG); }
      else if (inst.host === HOST_DRAWER) { if (typeof window.closeDrawer === "function") window.closeDrawer(HOST_DRAWER); }
      delete REG[key];
      delete WIZ[key];
      return;
    }
    /* 兜底：按 DOM id 直接关闭（兼容 mock.js 的 closeModal / closeDrawer 语义） */
    var el = $(key);
    if (!el) return;
    if (el.classList.contains("modal-mask")) { if (typeof window.closeModal === "function") window.closeModal(key); }
    else if (typeof window.closeDrawer === "function") window.closeDrawer(key);
  }

  /* ============================================================
     列设置记忆（bmp_col_prefs · 前缀约定 bmp_，供 T06 复用）
     —— localStorage 键前缀约定：所有本基建持久化键均以 `bmp_` 开头
        （如 bmp_col_prefs），禁止写入无前缀键。
     ============================================================ */
  var colPrefs = {
    key: COL_PREFS_KEY,
    get: function () {
      try { return JSON.parse(localStorage.getItem(COL_PREFS_KEY) || "{}") || {}; }
      catch (e) { return {}; }
    },
    set: function (obj) {
      try { localStorage.setItem(COL_PREFS_KEY, JSON.stringify(obj || {})); } catch (e) { /* 无痕 / file:// 下静默降级 */ }
    }
  };

  /* ============================================================
     一次性密钥掩码切换辅助（I1-F05 · §4.8 安全敏感范式）
     ------------------------------------------------------------
     maskToggle(opts)：
       opts = { input(元素或 id), btn(元素或 id,可选), maskHtml, maskChar, maxMs=30000,
                onTimerEnd }
     · 默认以掩码渲染；点「显示」最多明文 maxMs 后自动回掩码（防肩窥）；
     · 再次点击可手动回掩码并清除定时器。
     返回控制器 { show, hide, toggle, destroy }（原型用于内存态演示，不落 localStorage）。
     ============================================================ */
  function maskToggle(opts) {
    opts = opts || {};
    var input = (typeof opts.input === "string") ? $(opts.input) : opts.input;
    var btn = (typeof opts.btn === "string") ? $(opts.btn) : opts.btn;
    if (!input) return null;
    var real = input.getAttribute("data-real") || input.value || "";
    input.setAttribute("data-real", real);
    var maskHtml = opts.maskHtml || "••••••••••••••";
    var maxMs = opts.maxMs == null ? 30000 : opts.maxMs;
    var timer = null;
    function render(masked) {
      input.value = masked ? maskHtml : real;
      input.setAttribute("data-masked", masked ? "1" : "0");
      input.setAttribute("type", "text");
      if (btn) btn.textContent = masked ? "显示" : "隐藏";
    }
    function clear() { if (timer) { clearTimeout(timer); timer = null; } }
    var ctrl = {
      show: function () {
        render(false);
        clear();
        timer = setTimeout(function () {
          render(true);
          if (typeof opts.onTimerEnd === "function") opts.onTimerEnd();
        }, maxMs);
      },
      hide: function () { clear(); render(true); },
      toggle: function () { (input.getAttribute("data-masked") === "1") ? ctrl.show() : ctrl.hide(); },
      destroy: function () { clear(); render(true); input.removeAttribute("data-real"); }
    };
    if (btn) btn.onclick = ctrl.toggle;
    render(true);
    return ctrl;
  }

  /* ============================================================
     挂载门面
     ============================================================ */
  window.CM = {
    /* 弹窗：字段 ≤8 用 Dialog；>8 或长配置用 Drawer（§5.1 边界表） */
    openDialog: openDialogImpl,
    openDrawer: openDrawerImpl,
    /* 向导：3~4 步；默认 container="drawer" → 渲染进共享抽屉 #d-generic */
    openWizard: openWizardImpl,
    /* 统一关闭：清焦点栈 + 移除 a11y */
    close: closeImpl,
    Form: Form,
    A11y: {
      trap: focusTrap,
      focusTrap: focusTrap,   /* §3.3 用语别名 */
      release: releaseTrap,
      escStack: escStack      /* Esc 处理用「栈」（风险 R2） */
    },
    colPrefs: colPrefs,
    /* 一次性密钥掩码切换（I1-F05 · §4.8）：{input,btn,maskHtml,maxMs} → {show,hide,toggle,destroy} */
    maskToggle: maskToggle
  };
})();