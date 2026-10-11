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
})();
