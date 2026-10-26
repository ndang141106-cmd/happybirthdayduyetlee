/* ==========================================================================
   script.js — logic của trang. Nội dung nằm ở data.js, thường không cần sửa file này.
   ========================================================================== */
(function () {
  "use strict";
  var S = window.SITE;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (id) { return document.getElementById(id); };
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); };
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ---------- ảnh có dự phòng: nếu thiếu file thì hiện khung "ĐẶT ẢNH Ở…" ---------- */
  function makeFrame(src, alt) {
    var f = h("div", "frame");
    var img = new Image();
    img.alt = alt || "";
    img.loading = "lazy";
    img.decoding = "async";
    img.onerror = function () { markMissing(f, src); };
    img.src = src;
    f.appendChild(img);
    return f;
  }
  function markMissing(f, src) {
    f.classList.add("missing");
    f.textContent = "";
    var b = h("b", null, "ĐẶT ẢNH Ở"); f.appendChild(b);
    f.appendChild(h("span", null, src));
  }

  /* ---------- hiệu ứng gõ chữ ---------- */
  function typeInto(node, text, speed) {
    if (reduce) { node.textContent = text; return Promise.resolve(); }
    return new Promise(function (res) {
      var i = 0;
      (function tick() { node.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(tick, speed); else res(); })();
    });
  }

  /* ---------- hiện dần khi cuộn tới ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); if (e.target.dataset.once !== "keep") io.unobserve(e.target); } });
  }, { threshold: 0.18 }) : null;
  function watch(el) { if (io) io.observe(el); else el.classList.add("in"); }

  /* ================= 1. MỞ ĐẦU ================= */
  var kickerText = "CLASSIFIED PERSONNEL FILE";
  $("introName").textContent = S.name;
  $("introAlias").textContent = S.alias + " — The Flower Gentleman";
  $("introDate").textContent = "Ngày sinh: " + S.birthDisplay;
  $("introTag").textContent = S.tagline;
  $("openBtn").addEventListener("click", function () {
    var cut = $("cut");
    var go = function () { $("profile").scrollIntoView({ behavior: "auto" }); };
    if (reduce) { go(); return; }
    cut.classList.add("on");
    setTimeout(function () { go(); cut.classList.remove("on"); }, 380);
  });
  (function intro() {
    var k = $("kicker");
    typeInto(k, kickerText, 55).then(function () { return sleep(250); }).then(function () { $("introMain").classList.add("show"); });
    if (reduce) $("introMain").classList.add("show");
  })();

  /* Dòng đếm ngược / chúc mừng (giờ Việt Nam, UTC+7) */
  (function countdown() {
    var el = $("countdown"), pad = function (n) { return String(n).padStart(2, "0"); };
    var y = new Date().getUTCFullYear() + (0);
    function bounds(year) {
      var mm = pad(S.birthMonth), dd = pad(S.birthDay);
      var start = new Date(year + "-" + mm + "-" + dd + "T00:00:00+07:00");
      return [start, new Date(start.getTime() + 864e5)];
    }
    function render() {
      var now = new Date(), b = bounds(now.getUTCFullYear()), s = b[0], e = b[1];
      if (now >= s && now < e) { el.textContent = "Hôm nay là ngày sinh — " + S.birthDisplay.slice(0, 5); return; }
      if (now < s && s - now < 14 * 864e5) {
        var t = Math.floor((s - now) / 1000), d = Math.floor(t / 86400), hr = Math.floor(t % 86400 / 3600), mi = Math.floor(t % 3600 / 60), se = t % 60;
        el.textContent = "Đếm ngược · " + (d ? d + " ngày " : "") + pad(hr) + ":" + pad(mi) + ":" + pad(se);
        return;
      }
      el.textContent = "";
    }
    render(); setInterval(render, 1000);
  })();

  /* Hạt bụi trong ánh sáng */
  (function dust() {
    var c = $("dust"), ctx = c.getContext("2d"), intro = $("intro"), ps = [], visible = true, W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
    function size() { W = intro.clientWidth; H = intro.clientHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function make() { return { x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + .3, vy: -(Math.random() * .25 + .05), vx: (Math.random() - .5) * .15, a: Math.random() * .5 + .15, t: Math.random() * 6 }; }
    function init() { size(); var n = Math.round(Math.min(90, W * H / 14000)); ps = []; for (var i = 0; i < n; i++) ps.push(make()); draw(0); }
    function draw(dt) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        if (!reduce) { p.x += p.vx * dt; p.y += p.vy * dt; p.t += .02 * dt; if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; } }
        ctx.globalAlpha = p.a * (.6 + .4 * Math.sin(p.t));
        ctx.fillStyle = "#d8c8a0";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
    }
    var last = 0;
    function loop(t) { if (visible) { draw(Math.min(3, (t - last) / 16.7 || 1)); } last = t; requestAnimationFrame(loop); }
    init(); window.addEventListener("resize", init);
    if (!reduce) { requestAnimationFrame(loop); }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(intro);
    /* ánh sáng đi theo con trỏ */
    var light = intro.querySelector(".intro__light"), raf = 0;
    if (!reduce) intro.addEventListener("pointermove", function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = 0; var r = intro.getBoundingClientRect(); light.style.setProperty("--lx", (e.clientX - r.left) + "px"); light.style.setProperty("--ly", (e.clientY - r.top) + "px"); });
    });
  })();

  /* ================= 2. HỒ SƠ ================= */
  (function profile() {
    var p = $("portrait");
    p.appendChild(makeFrame(S.portrait.src, "Ảnh chân dung " + S.alias));
    p.appendChild(h("figcaption", null, "Hồ sơ số 2710 · " + S.alias));
    var dl = $("fields");
    S.fields.forEach(function (f) { var d = h("div"); d.appendChild(h("dt", null, f[0])); d.appendChild(h("dd", null, f[1])); dl.appendChild(d); });
    var box = $("stats");
    S.stats.forEach(function (s) {
      var row = h("div", "stat"), top = h("div", "stat__top");
      top.appendChild(h("span", "stat__label", s.label));
      top.appendChild(h("span", "stat__text", (s.infinite ? "∞ · " : s.value + "% · ") + s.text));
      var tr = h("div", "stat__track"), fill = h("div", "stat__fill" + (s.infinite ? " inf" : ""));
      fill.dataset.v = s.value; tr.appendChild(fill);
      row.appendChild(top); row.appendChild(tr); box.appendChild(row);
    });
    $("statsNote").textContent = S.statsNote;
    var stats = box.closest(".stats");
    var fillAll = function () { box.querySelectorAll(".stat__fill").forEach(function (f) { f.style.width = f.dataset.v + "%"; }); };
    if ("IntersectionObserver" in window && !reduce) {
      var so = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { fillAll(); so.disconnect(); } }, { threshold: .3 });
      so.observe(stats);
    } else fillAll();
  })();

  /* ================= 3. TIMELINE ================= */
  (function timeline() {
    var ol = $("tl");
    S.timeline.forEach(function (m) {
      var li = h("li", "tl__item reveal"), meta = h("p", "tl__meta mono");
      meta.appendChild(h("span", null, m.tag));
      if (m.date) meta.appendChild(h("span", null, m.date));
      li.appendChild(meta);
      li.appendChild(h("h3", "tl__title", m.title));
      li.appendChild(h("p", "tl__text", m.text));
      if (m.image) { var w = h("div", "tl__img"); var f = makeFrame(m.image, m.title); f.style.aspectRatio = "4/3"; w.appendChild(f); li.appendChild(w); }
      ol.appendChild(li); watch(li);
    });
  })();

  /* ================= 4. GALLERY + LIGHTBOX ================= */
  (function gallery() {
    var box = $("shots"), lb = $("lb"), media = $("lbMedia"), cap = $("lbCap"), count = $("lbCount"), cur = 0, opener = null;
    S.gallery.forEach(function (g, i) {
      var b = h("button", "shot"); b.type = "button"; b.setAttribute("aria-label", "Xem ảnh lớn: " + g.caption);
      b.appendChild(makeFrame(g.src, g.caption));
      b.appendChild(h("span", "shot__cap", g.caption));
      b.addEventListener("click", function () { open(i, b); });
      box.appendChild(b);
    });
    function show(i) {
      cur = (i + S.gallery.length) % S.gallery.length;
      var g = S.gallery[cur];
      media.textContent = ""; media.appendChild(makeFrame(g.src, g.caption));
      var f = media.firstChild; f.style.aspectRatio = "auto"; f.style.background = "transparent";
      cap.textContent = g.caption; count.textContent = (cur + 1) + " / " + S.gallery.length;
    }
    function open(i, from) { opener = from; show(i); lb.hidden = false; document.body.style.overflow = "hidden"; $("lbClose").focus(); }
    function close() { lb.hidden = true; document.body.style.overflow = ""; if (opener) opener.focus(); }
    $("lbClose").addEventListener("click", close);
    $("lbPrev").addEventListener("click", function () { show(cur - 1); });
    $("lbNext").addEventListener("click", function () { show(cur + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") close(); else if (e.key === "ArrowLeft") show(cur - 1); else if (e.key === "ArrowRight") show(cur + 1);
    });
    var x0 = null;
    lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) { if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); x0 = null; });
  })();

  /* ================= 5. CASE FILE ================= */
  (function caseFile() {
    var c = S.caseFile;
    $("caseCode").textContent = c.code + " · Tuyệt mật";
    $("caseTitle").textContent = c.title;
    var dl = $("caseLines");
    c.lines.forEach(function (l, i) { var d = h("div", "case__line"); d.style.setProperty("--i", i); d.appendChild(h("dt", null, l[0])); d.appendChild(h("dd", null, l[1])); dl.appendChild(d); });
    $("caseStamp").textContent = c.stamp;
    $("caseClosing").textContent = c.closing;
    watch(dl.closest(".case"));
  })();

  /* ================= 6. THƯ ================= */
  (function letter() {
    var btn = $("letterBtn"), wrap = $("letter"), paper = $("letterPaper"), dec = $("decode"), hint = $("letterHint");
    var L = S.letter, state = "closed", token = 0, typedOnce = false;
    btn.textContent = L.button;
    var all = L.paragraphs.concat([L.signature]);
    function fillAll() {
      paper.textContent = "";
      all.forEach(function (t, i) { paper.appendChild(h("p", i === all.length - 1 ? "sig" : null, t)); });
      hint.hidden = true;
    }
    function scramble() {
      var chars = "█▓▒░#@%&01", target = "ĐÃ GIẢI MÃ", n = 0;
      dec.hidden = false;
      return new Promise(function (res) {
        if (reduce) { dec.textContent = target; return res(); }
        var iv = setInterval(function () {
          n++; var out = "";
          for (var i = 0; i < 28; i++) out += (i < n / 2 && target[i]) ? target[i] : chars[Math.floor(Math.random() * chars.length)];
          dec.textContent = out;
          if (n > 36) { clearInterval(iv); dec.textContent = target; res(); }
        }, 40);
      });
    }
    async function typeLetter(my) {
      paper.textContent = ""; hint.hidden = false;
      for (var i = 0; i < all.length; i++) {
        var p = h("p", i === all.length - 1 ? "sig" : null); p.classList.add("caret"); paper.appendChild(p);
        var t = all[i];
        for (var k = 0; k < t.length; k += 3) {
          if (my !== token) return;
          p.textContent = t.slice(0, k + 3); await sleep(16);
        }
        p.textContent = t; p.classList.remove("caret");
      }
      hint.hidden = true; typedOnce = true;
    }
    paper.addEventListener("click", function () { token++; fillAll(); typedOnce = true; });
    paper.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); token++; fillAll(); typedOnce = true; } });
    btn.addEventListener("click", async function () {
      if (state === "busy") return;
      if (state === "open") { token++; wrap.hidden = true; dec.hidden = true; state = "closed"; btn.textContent = L.button; btn.setAttribute("aria-expanded", "false"); return; }
      state = "busy"; btn.setAttribute("aria-expanded", "true");
      if (!typedOnce) await scramble(); else dec.hidden = true;
      wrap.hidden = false; state = "open"; btn.textContent = "ĐÓNG LÁ THƯ";
      var my = ++token;
      if (typedOnce) fillAll(); else await typeLetter(my);
    });
  })();

  /* ================= 7. TIÊN TRI ================= */
  (function oracle() {
    var btn = $("oracleBtn"), screen = $("oracleScreen"), cnt = $("oracleCount"), last = -1, n = 0, busy = false;
    btn.textContent = S.prophecyButton;
    btn.addEventListener("click", async function () {
      if (busy) return; busy = true;
      screen.textContent = ""; screen.classList.add("scan");
      screen.appendChild(h("span", "mono oracle__scanning", "Đang quét vận mệnh…"));
      await sleep(1100);
      var i; do { i = Math.floor(Math.random() * S.prophecies.length); } while (i === last && S.prophecies.length > 1);
      last = i; n++;
      screen.classList.remove("scan"); screen.textContent = "";
      screen.appendChild(h("p", "oracle__text", S.prophecies[i]));
      cnt.textContent = "Lần dự đoán thứ " + n + " · độ tin cậy do " + S.sender + " đại ca bảo lãnh";
      busy = false;
    });
  })();

  /* ================= 8. KẾT + PHÁO GIẤY ================= */
  (function ending() {
    var e = S.ending;
    $("endHead").textContent = e.headline; $("endWish").textContent = e.wish; $("endHb").textContent = e.hb; $("endFrom").textContent = e.from;
    var btn = $("confettiBtn"); btn.textContent = e.confettiButton;
    var c = $("confetti"), ctx = c.getContext("2d"), parts = [], running = false;
    var colors = ["#8f1d22", "#e0555a", "#ece6d8", "#d8c8a0", "#a39e92"];
    function resize() { var d = Math.min(2, window.devicePixelRatio || 1); c.width = innerWidth * d; c.height = innerHeight * d; ctx.setTransform(d, 0, 0, d, 0, 0); }
    function burst() {
      if (reduce) return;
      resize();
      for (var i = 0; i < 140; i++) {
        var left = i % 2 === 0;
        parts.push({ x: left ? 0 : innerWidth, y: innerHeight * .75, vx: (left ? 1 : -1) * (Math.random() * 9 + 4), vy: -(Math.random() * 14 + 6), w: Math.random() * 7 + 4, h: Math.random() * 4 + 3, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: colors[i % colors.length], life: 0 });
      }
      if (!running) { running = true; requestAnimationFrame(step); }
    }
    function step() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter(function (p) { return p.y < innerHeight + 20 && p.life < 260; });
      parts.forEach(function (p) {
        p.vy += .32; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.globalAlpha = Math.max(0, 1 - p.life / 260); ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      if (parts.length) requestAnimationFrame(step); else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
    }
    btn.addEventListener("click", burst);
    window.addEventListener("resize", function () { if (running) resize(); });
    if ("IntersectionObserver" in window) {
      var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { burst(); o.disconnect(); } }, { threshold: .6 });
      o.observe($("endHead"));
    }
  })();

  /* ================= Nhạc (tuỳ chọn, không tự phát) ================= */
  (function music() {
    if (!S.music) return;
    var a = new Audio(); a.loop = true; a.preload = "metadata";
    var btn = $("music"), label = $("musicLabel");
    a.addEventListener("loadedmetadata", function () { btn.hidden = false; });
    a.addEventListener("error", function () { btn.hidden = true; });
    a.src = S.music;
    btn.addEventListener("click", function () {
      if (a.paused) { a.play().then(function () { btn.setAttribute("aria-pressed", "true"); label.textContent = "Tắt nhạc"; }).catch(function () { btn.hidden = true; }); }
      else { a.pause(); btn.setAttribute("aria-pressed", "false"); label.textContent = "Bật nhạc"; }
    });
  })();
})();
