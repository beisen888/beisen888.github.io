/* Ben Eisen portfolio: interactive layer.
   Everything here is progressive: the page reads fine without it. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };

  /* ---------- Hero intro sequence ---------- */
  var hero = $('.hero');
  if (hero && !reduceMotion) {
    hero.classList.add('intro');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hero.classList.add('go'); });
    });
  }

  /* ---------- Theme toggle ---------- */
  var themeBtn = $('.theme-btn');
  function currentTheme() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function syncThemeLabel() {
    if (!themeBtn) return;
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    themeBtn.setAttribute('aria-label', 'Switch to ' + next + ' mode');
    root.dataset.theme = currentTheme();
  }
  if (themeBtn) {
    syncThemeLabel();
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncThemeLabel();
    });
  }

  /* ---------- Scroll progress, back to top, timeline fill ---------- */
  var bar = $('.progress span');
  var toTop = $('.to-top');
  var timelines = $$('.timeline');
  var ticking = false;
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? h.scrollTop / max : 0;
    if (bar) bar.style.setProperty('--p', p.toFixed(4));
    if (toTop) toTop.classList.toggle('show', h.scrollTop > 900);
    var vh = window.innerHeight;
    timelines.forEach(function (tl) {
      var r = tl.getBoundingClientRect();
      var f = (vh * 0.7 - r.top) / r.height;
      tl.style.setProperty('--tl', Math.max(0, Math.min(1, f)).toFixed(3));
    });
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* ---------- Active section in nav ---------- */
  var navLinks = $$('.nav ul a[href^="#"]').filter(function (a) { return a.getAttribute('href').length > 1; });
  var sections = navLinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + en.target.id;
          a.classList.toggle('active', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); revObs.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    reveals.forEach(function (el) { revObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Ledger count-up ---------- */
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
  var counters = $$('[data-count]');
  function runCount(el) {
    var end = parseFloat(el.dataset.count);
    var pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = pre + fmt(end) + suf; return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = pre + fmt(end * eased) + suf;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCount(en.target); cObs.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cObs.observe(el); });
  }

  /* ---------- Project filters ---------- */
  var chips = $$('.chip');
  var cases = $$('.case[data-cat]');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.dataset.filter;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      cases.forEach(function (c) {
        var show = f === 'all' || c.dataset.cat.split(' ').indexOf(f) !== -1;
        c.classList.toggle('is-hidden', !show);
        if (show) c.classList.add('in');
      });
    });
  });

  /* ---------- Expandable case studies ---------- */
  $$('.case-toggle').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    var label = btn.querySelector('span');
    if (!panel) return;
    panel.setAttribute('aria-hidden', 'true');
    panel.inert = true;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('open', open);
      panel.setAttribute('aria-hidden', String(!open));
      panel.inert = !open;
      if (label) label.textContent = open ? 'Close case study' : 'Open case study';
    });
  });

  /* ---------- TSA decision matrix ---------- */
  var matrix = $('.matrix');
  if (matrix) {
    var scores = [[5, 3, 3], [5, 2, 3], [4, 2, 4], [4, 3, 5], [3, 4, 4]];
    var defaults = [30, 25, 20, 15, 10];
    var inputs = $$('input[type="range"]', matrix);
    var bars = $$('.bar', matrix);
    var update = function () {
      var w = inputs.map(function (i) { return parseFloat(i.value); });
      var total = w.reduce(function (a, b) { return a + b; }, 0) || 1;
      var res = [0, 1, 2].map(function (o) {
        return w.reduce(function (acc, wi, k) { return acc + (wi / total) * scores[k][o]; }, 0);
      });
      var best = res.indexOf(Math.max.apply(null, res));
      inputs.forEach(function (i) { i.nextElementSibling.textContent = Math.round(i.value / total * 100); });
      bars.forEach(function (b, o) {
        b.style.setProperty('--w', (res[o] / 5 * 100).toFixed(1) + '%');
        b.querySelector('.bar-val').textContent = res[o].toFixed(2);
        b.classList.toggle('lead', o === best);
      });
    };
    inputs.forEach(function (i) { i.addEventListener('input', update); });
    $('.matrix-reset', matrix).addEventListener('click', function () {
      inputs.forEach(function (i, k) { i.value = defaults[k]; });
      update();
    });
    update();
  }

  /* ---------- Qualico roadmap ---------- */
  var phases = [
    { t: 'Shared KPI dashboard', d: 'Launch the Enterprise Hub app to regional managers, starting with a shared KPI dashboard tied to StreetSide’s existing forum, the lowest-friction place to start.' },
    { t: 'Standard capital scorecard', d: 'Roll out one scorecard for capital requests company-wide in the next budget cycle, so projects can be ranked and compared across regions.' },
    { t: 'Talent visibility', d: 'Add the talent layer: who is at capacity, who the high performers are, and who is ready for succession.' },
    { t: 'Company-wide knowledge sharing', d: 'Expand best-practice sharing from StreetSide to every business unit, and keep improving it with internal feedback loops.' }
  ];
  var phaseBtns = $$('.phase');
  var panelEl = $('.phase-panel');
  var fill = $('.phase-fill');
  phaseBtns.forEach(function (b, i) {
    b.addEventListener('click', function () { selectPhase(i); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        var n = (i + (e.key === 'ArrowRight' ? 1 : -1) + phaseBtns.length) % phaseBtns.length;
        selectPhase(n); phaseBtns[n].focus();
      }
    });
  });
  function selectPhase(i) {
    phaseBtns.forEach(function (b, k) {
      b.setAttribute('aria-selected', String(k === i));
      b.tabIndex = k === i ? 0 : -1;
    });
    if (panelEl) panelEl.innerHTML = '<h4>' + phases[i].t + '</h4><p>' + phases[i].d + '</p>';
    if (fill) fill.style.width = ((i + 1) / phases.length * 100) + '%';
  }
  if (phaseBtns.length) selectPhase(0);

  /* ---------- Lightbox ---------- */
  var dlg = $('.lightbox');
  if (dlg && typeof dlg.showModal === 'function') {
    var img = $('img', dlg), cap = $('.lb-cap', dlg);
    var group = [], idx = 0;
    var show = function (i) {
      idx = (i + group.length) % group.length;
      var g = group[idx];
      img.src = g.dataset.src;
      img.alt = g.querySelector('img').alt;
      cap.textContent = g.dataset.caption + '  (' + (idx + 1) + ' of ' + group.length + ')';
    };
    $$('.zoom').forEach(function (z) {
      z.addEventListener('click', function () {
        group = $$('.zoom[data-lightbox="' + z.dataset.lightbox + '"]');
        show(group.indexOf(z));
        dlg.showModal();
      });
    });
    $('.lb-prev', dlg).addEventListener('click', function () { show(idx - 1); });
    $('.lb-next', dlg).addEventListener('click', function () { show(idx + 1); });
    $('.lb-close', dlg).addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'ArrowLeft') show(idx - 1);
    });
  } else {
    $$('.zoom').forEach(function (z) {
      z.addEventListener('click', function () { window.open(z.dataset.src, '_blank'); });
    });
  }

  /* ---------- Copy email + toast ---------- */
  var toast = $('.toast'), toastTimer;
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  $$('.copy-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var text = b.dataset.copy;
      var done = function () { say('Email copied: ' + text); };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { say('Couldn’t copy. Email: ' + text); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { say('Email: ' + text); }
        document.body.removeChild(ta);
      }
    });
  });

  /* ---------- Advice drop box ----------
     If data-endpoint is set (for example a Formspree form URL), notes are sent there.
     Otherwise the note opens in the visitor's email app, addressed to Ben. */
  var form = $('.advice-form');
  if (form) {
    var ta = $('textarea', form), countEl = $('.count b', form), msg = $('.form-msg', form);
    var btn = $('button[type="submit"]', form);
    var thanksBox = $('.advice-thanks', form), thanksText = $('.advice-thanks p', form);
    ta.addEventListener('input', function () {
      countEl.textContent = ta.value.length;
      ta.closest('.field').classList.remove('invalid');
    });
    var thanks = function (viaEmail) {
      thanksText.textContent = viaEmail
        ? 'Your email app should open with your note ready to send. If it doesn\u2019t, email me at beisen@tulane.edu.'
        : 'Your advice is on its way to me. I really appreciate it.';
      form.classList.add('sent');
      thanksBox.hidden = false;
      $('h3', thanksBox).focus();
    };
    $('.again', form).addEventListener('click', function () {
      form.reset(); countEl.textContent = '0'; msg.textContent = ''; btn.disabled = false;
      form.classList.remove('sent'); thanksBox.hidden = true; ta.focus();
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form._gotcha && form._gotcha.value) return;
      var advice = ta.value.trim();
      if (advice.length < 5) {
        ta.closest('.field').classList.add('invalid');
        msg.className = 'form-msg err'; msg.textContent = 'Write a few words of advice first.';
        ta.focus(); return;
      }
      var name = form.name.value.trim(), role = form.role.value.trim();
      var endpoint = form.dataset.endpoint;
      if (!endpoint) {
        var body = advice + '\n\n' + (name ? '- ' + name : '') + (role ? ', ' + role : '');
        window.location.href = 'mailto:beisen@tulane.edu?subject=' + encodeURIComponent('Advice for Ben') + '&body=' + encodeURIComponent(body);
        thanks(true); return;
      }
      btn.disabled = true; msg.className = 'form-msg'; msg.textContent = 'Sending\u2026';
      fetch(endpoint, { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form) })
        .then(function (r) { if (!r.ok) throw new Error(); thanks(false); })
        .catch(function () {
          btn.disabled = false; msg.className = 'form-msg err';
          msg.textContent = 'That didn\u2019t send. Try again, or email beisen@tulane.edu.';
        });
    });
  }
})();

/* ---------- $BEN chart ---------- */
(function () {
  'use strict';
  var wrap = document.querySelector('.stock');
  if (!wrap) return;
  var svg = wrap.querySelector('.stock-svg');
  var tip = wrap.querySelector('.stock-tip');
  var NS = 'http://www.w3.org/2000/svg';
  var items = Array.prototype.slice.call(wrap.querySelectorAll('.milestones li'));
  var data = items.map(function (li, i) {
    return {
      i: i, x: parseFloat(li.dataset.x), v: parseFloat(li.dataset.v), future: li.dataset.future === '1',
      date: li.querySelector('time').textContent, title: li.querySelector('b').textContent,
      body: li.querySelector('p').textContent, li: li
    };
  });
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FULL = [2023.35, 2027.6];
  var domain = FULL.slice(), sel = data.length - 2, range = 'all';
  var W = 1000, H = 320, pad = { l: 8, r: 18, t: 22, b: 30 };

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function sx(x) { return pad.l + (x - domain[0]) / (domain[1] - domain[0]) * (W - pad.l - pad.r); }
  function sy(v) { return pad.t + (1 - v / 112) * (H - pad.t - pad.b); }

  function draw() {
    W = svg.clientWidth || 1000; H = svg.clientHeight || 320;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var defs = el('defs', {}, svg);
    var lg = el('linearGradient', { id: 'stFill', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    var dark = document.documentElement.dataset.theme === 'dark';
    var c = dark ? '#8fd0ec' : '#0b4a36';
    el('stop', { offset: 0, 'stop-color': c, 'stop-opacity': dark ? .22 : .16 }, lg);
    el('stop', { offset: 1, 'stop-color': c, 'stop-opacity': 0 }, lg);
    var clip = el('clipPath', { id: 'stClip' }, defs);
    el('rect', { x: pad.l - 10, y: 0, width: W - pad.l - pad.r + 20, height: H }, clip);

    var grid = el('g', { class: 'st-grid' }, svg);
    [25, 50, 75, 100].forEach(function (v) { el('line', { x1: pad.l, x2: W - pad.r, y1: sy(v), y2: sy(v) }, grid); });
    var axis = el('g', { class: 'st-axis' }, svg);
    for (var y = 2023; y <= 2027; y++) {
      [0, 0.5].forEach(function (off) {
        var xx = y + off;
        if (xx < domain[0] || xx > domain[1]) return;
        var span = domain[1] - domain[0];
        if (off && span > 2) return;
        var t = el('text', { x: sx(xx), y: H - 8, 'text-anchor': 'middle' }, axis);
        t.textContent = off ? 'Jul ' + y : String(y);
      });
    }
    var g = el('g', { 'clip-path': 'url(#stClip)' }, svg);
    var past = data.filter(function (d) { return !d.future; });
    var future = data.filter(function (d) { return d.future; });
    var start = { x: 2023.35, v: 6 };
    var pts = [start].concat(past);
    var line = pts.map(function (d, k) { return (k ? 'L' : 'M') + sx(d.x).toFixed(1) + ' ' + sy(d.v).toFixed(1); }).join(' ');
    el('path', { class: 'st-area', d: line + ' L' + sx(past[past.length - 1].x) + ' ' + sy(0) + ' L' + sx(start.x) + ' ' + sy(0) + ' Z' }, g);
    var path = el('path', { class: 'st-line', d: line }, g);
    if (future.length) {
      var last = past[past.length - 1], f = future[0];
      el('path', { class: 'st-proj', d: 'M' + sx(last.x) + ' ' + sy(last.v) + ' L' + sx(f.x) + ' ' + sy(f.v) }, g);
    }
    var cross = el('line', { class: 'st-cross', x1: 0, x2: 0, y1: pad.t, y2: H - pad.b }, g);

    data.forEach(function (d) {
      var gp = el('g', { class: 'st-pt' + (d.future ? ' future' : '') + (d.i === sel ? ' sel' : ''), tabindex: 0, role: 'button', 'aria-label': d.date + ': ' + d.title }, g);
      var cx = sx(d.x), cy = sy(d.v);
      el('circle', { class: 'halo', cx: cx, cy: cy, r: 16 }, gp);
      el('circle', { class: 'dot', cx: cx, cy: cy, r: d.i === sel ? 8 : 6 }, gp);
      el('circle', { class: 'hit', cx: cx, cy: cy, r: 18 }, gp);
      gp.addEventListener('click', function () { select(d.i); });
      gp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(d.i); }
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          var n = Math.max(0, Math.min(data.length - 1, d.i + (e.key === 'ArrowRight' ? 1 : -1)));
          select(n); var nodes = svg.querySelectorAll('.st-pt'); if (nodes[n]) nodes[n].focus();
        }
      });
      d.node = gp; d.cx = cx; d.cy = cy;
    });

    svg.onmousemove = function (e) {
      var r = svg.getBoundingClientRect();
      var mx = (e.clientX - r.left) * (W / r.width);
      var best = null, bd = 1e9;
      data.forEach(function (d) {
        if (d.x < domain[0] || d.x > domain[1]) return;
        var dd = Math.abs(d.cx - mx); if (dd < bd) { bd = dd; best = d; }
      });
      if (!best || bd > 60) { svg.onmouseleave(); return; }
      cross.setAttribute('x1', best.cx); cross.setAttribute('x2', best.cx); cross.classList.add('on');
      tip.hidden = false;
      tip.innerHTML = '<b>' + best.title + '</b>' + best.date;
      tip.style.left = (best.cx / W * 100) + '%';
      tip.style.top = (best.cy / H * r.height) + 'px';
    };
    svg.onmouseleave = function () { cross.classList.remove('on'); tip.hidden = true; };

    if (!reduce && !draw.done) {
      var len = path.getTotalLength();
      path.style.strokeDasharray = len; path.style.strokeDashoffset = len;
      path.getBoundingClientRect();
      path.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(.4,0,.2,1)';
      var go = function () { path.style.strokeDashoffset = 0; };
      if ('IntersectionObserver' in window) {
        var o = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { go(); o.disconnect(); } }, { threshold: .4 });
        o.observe(svg);
      } else go();
      draw.done = true;
    }
  }

  var dDate = wrap.querySelector('.sd-date'), dTitle = wrap.querySelector('.sd-title'), dBody = wrap.querySelector('.sd-body');
  function select(i) {
    sel = i;
    var d = data[i];
    dDate.textContent = d.date + (d.future ? ' (upcoming)' : '');
    dTitle.textContent = d.title;
    dBody.textContent = d.body;
    data.forEach(function (x) {
      x.li.classList.toggle('sel', x.i === i);
      if (x.node) {
        x.node.classList.toggle('sel', x.i === i);
        x.node.querySelector('.dot').setAttribute('r', x.i === i ? 8 : 6);
      }
    });
    if (range !== 'all' && Math.floor(d.x) !== parseInt(range, 10)) setRange('all', true);
    var list = d.li.parentNode, left = d.li.offsetLeft - list.offsetLeft;
    if (left < list.scrollLeft || left + d.li.offsetWidth > list.scrollLeft + list.clientWidth) {
      list.scrollTo({ left: Math.max(0, left - 8), behavior: reduce ? 'auto' : 'smooth' });
    }
  }
  items.forEach(function (li, i) { li.querySelector('button').addEventListener('click', function () { select(i); }); });

  var priceEl = wrap.querySelector('.q-price'), chgEl = wrap.querySelector('.q-chg-text');
  var rangeBtns = Array.prototype.slice.call(wrap.querySelectorAll('.range'));
  function setRange(r, keepSel) {
    range = r;
    rangeBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.range === r)); });
    var target = r === 'all' ? FULL.slice() : [parseInt(r, 10) - 0.06, parseInt(r, 10) + 1.06];
    var inRange = data.filter(function (d) { return r === 'all' || Math.floor(d.x) === parseInt(r, 10); });
    data.forEach(function (d) { d.li.classList.toggle('dim', inRange.indexOf(d) === -1); });
    priceEl.textContent = r === 'all' ? 'Since 2023' : r;
    chgEl.textContent = inRange.length + (inRange.length === 1 ? ' milestone' : ' milestones');
    if (!keepSel && inRange.length) select(inRange[inRange.length - 1].i);
    var from = domain.slice(), t0 = null, dur = reduce ? 0 : 550;
    function step(ts) {
      if (!t0) t0 = ts;
      var k = dur ? Math.min(1, (ts - t0) / dur) : 1;
      var e = 1 - Math.pow(1 - k, 3);
      domain = [from[0] + (target[0] - from[0]) * e, from[1] + (target[1] - from[1]) * e];
      draw();
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  rangeBtns.forEach(function (b) { b.addEventListener('click', function () { setRange(b.dataset.range); }); });

  draw(); select(sel);
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(draw, 120); });
  var tb = document.querySelector('.theme-btn');
  if (tb) tb.addEventListener('click', function () { setTimeout(draw, 0); });
})();

/* ---------- Skills radar ---------- */
(function () {
  'use strict';
  var radar = document.querySelector('.radar');
  if (!radar) return;
  var btns = Array.prototype.slice.call(radar.querySelectorAll('.radar-keys button'));
  var proof = radar.querySelector('.radar-proof');
  var dots = radar.querySelectorAll('.rd-dot'), labels = radar.querySelectorAll('.rd-label');
  function pick(i) {
    btns.forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === i)); });
    Array.prototype.forEach.call(dots, function (d, k) { d.classList.toggle('on', k === i); });
    Array.prototype.forEach.call(labels, function (l, k) { l.classList.toggle('on', k === i); });
    proof.innerHTML = btns[i].parentNode.querySelector('p').innerHTML;
  }
  btns.forEach(function (b, i) {
    b.addEventListener('click', function () { pick(i); });
    b.addEventListener('mouseenter', function () { pick(i); });
  });
  Array.prototype.forEach.call(labels, function (l) {
    l.addEventListener('click', function () { pick(parseInt(l.dataset.i, 10)); });
  });
  pick(0);
})();
