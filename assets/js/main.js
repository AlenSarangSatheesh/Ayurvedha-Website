/* ============================================================
   OJAS AYURVEDA — main.js
   ============================================================ */
(function () {
  'use strict';
  var WA_NUMBER = '918075896213';                 // +91 (India) + 10-digit number
  var WA_MSG = 'Hey I need an appointment';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    year();
    stickyHeader();
    mobileMenu();
    reveal();
    accordions();
    doshaTabs();
    counters();
    carousel();
    lightbox();
    bookingForm();
    activeNav();
    backToTop();
    decorateIcons();
  }

  /* decorative inline icons: hide from assistive tech (labels live on the buttons) */
  function decorateIcons() {
    $$('svg.ic').forEach(function (s) {
      s.setAttribute('aria-hidden', 'true');
      s.setAttribute('focusable', 'false');
    });
  }

  /* ---------- footer year ---------- */
  function year() {
    var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- shared scroll handling ---------- */
  var onScrollFns = [];
  function bindScroll(fn) { onScrollFns.push(fn); }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;
      for (var i = 0; i < onScrollFns.length; i++) onScrollFns[i](y);
      ticking = false;
    });
  }, { passive: true });

  function stickyHeader() {
    var header = $('#header');
    var topbar = $('.topbar');
    if (!header) return;
    var threshold = topbar ? topbar.offsetHeight : 40;
    var apply = function (y) { header.classList.toggle('is-stuck', y > threshold - 2); };
    bindScroll(apply);
    apply(window.scrollY || 0);
  }

  /* ---------- mobile menu (focus-trapped) ---------- */
  function mobileMenu() {
    var nav = $('#primary-nav');
    var scrim = $('.nav-scrim');
    var openBtn = $('[data-menu-open]');
    if (!nav || !openBtn) return;

    var focusables = function () { return $$('a[href], button:not([disabled])', nav); };

    var open = function () {
      nav.classList.add('is-open');
      openBtn.setAttribute('aria-expanded', 'true');
      if (scrim) scrim.hidden = false;
      document.body.style.overflow = 'hidden';
      var f = focusables(); if (f[0]) f[0].focus();
    };
    var close = function (returnFocus) {
      nav.classList.remove('is-open');
      openBtn.setAttribute('aria-expanded', 'false');
      if (scrim) scrim.hidden = true;
      document.body.style.overflow = '';
      if (returnFocus) openBtn.focus();
    };

    openBtn.addEventListener('click', open);
    $$('[data-menu-close]').forEach(function (el) { el.addEventListener('click', function () { close(true); }); });
    $$('.nav__link', nav).forEach(function (a) { a.addEventListener('click', function () { close(false); }); });

    document.addEventListener('keydown', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (e.key === 'Escape') { close(true); return; }
      if (e.key === 'Tab') {
        var f = focusables(); if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 940 && nav.classList.contains('is-open')) close(false);
    });
  }

  /* ---------- scroll reveal ---------- */
  function reveal() {
    var els = $$('.reveal');
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- accordions (therapies + FAQ) ---------- */
  function accordions() {
    $$('.acc').forEach(function (acc) {
      var head = $('.acc__head', acc);
      var panel = $('.acc__panel', acc);
      if (!head || !panel) return;
      head.addEventListener('click', function () {
        var isOpen = acc.classList.contains('is-open');
        var group = acc.closest('.accordion');
        if (group && !isOpen) {
          $$('.acc.is-open', group).forEach(function (other) { if (other !== acc) closeAcc(other); });
        }
        isOpen ? closeAcc(acc) : openAcc(acc);
      });
    });
  }
  function clearTe(panel) {
    if (panel._te) { panel.removeEventListener('transitionend', panel._te); panel._te = null; }
  }
  function openAcc(acc) {
    var head = $('.acc__head', acc), panel = $('.acc__panel', acc);
    clearTe(panel);
    acc.classList.add('is-open');
    head.setAttribute('aria-expanded', 'true');
    if (reduce) { panel.style.height = 'auto'; return; }
    panel.style.height = panel.scrollHeight + 'px';
    var te = function (e) {
      if (e.propertyName !== 'height') return;
      panel.removeEventListener('transitionend', te); panel._te = null;
      if (acc.classList.contains('is-open')) panel.style.height = 'auto';
    };
    panel._te = te;
    panel.addEventListener('transitionend', te);
  }
  function closeAcc(acc) {
    var head = $('.acc__head', acc), panel = $('.acc__panel', acc);
    clearTe(panel);
    acc.classList.remove('is-open');
    head.setAttribute('aria-expanded', 'false');
    if (reduce) { panel.style.height = '0px'; return; }
    panel.style.height = panel.scrollHeight + 'px';
    void panel.offsetHeight;
    window.requestAnimationFrame(function () { panel.style.height = '0px'; });
  }

  /* ---------- dosha tabs (roving tabindex + arrow keys) ---------- */
  function doshaTabs() {
    var root = $('[data-dosha]');
    if (!root) return;
    var tabs = $$('.dosha__tab', root);
    var panels = $$('.dosha__panel', root);

    function activate(tab, focusTab) {
      var key = tab.getAttribute('data-dosha-tab');
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach(function (p) {
        var on = p.getAttribute('data-dosha-panel') === key;
        p.hidden = !on;
        p.classList.toggle('is-active', on);
        if (on && !reduce) { p.classList.remove('anim'); void p.offsetWidth; p.classList.add('anim'); }
      });
      if (focusTab) tab.focus();
    }

    tabs.forEach(function (tab, idx) {
      tab.addEventListener('click', function () { activate(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var n = tabs.length;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); activate(tabs[(idx + 1) % n], true); }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); activate(tabs[(idx - 1 + n) % n], true); }
        else if (e.key === 'Home') { e.preventDefault(); activate(tabs[0], true); }
        else if (e.key === 'End') { e.preventDefault(); activate(tabs[n - 1], true); }
      });
    });
  }

  /* ---------- stat counters ---------- */
  function counters() {
    var nums = $$('.stat__num');
    if (!nums.length) return;
    if (reduce || !('IntersectionObserver' in window)) {
      nums.forEach(function (n) { n.textContent = fmt(+n.dataset.count) + (n.dataset.suffix || ''); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        run(en.target); io.unobserve(en.target);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });

    function run(el) {
      var target = +el.dataset.count, suffix = el.dataset.suffix || '';
      var dur = 1400, start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(target * eased)) + (p === 1 ? suffix : '');
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
  }
  function fmt(n) { return n >= 1000 ? n.toLocaleString('en-IN') : String(n); }

  /* ---------- testimonials carousel ---------- */
  function carousel() {
    var root = $('[data-carousel]');
    if (!root) return;
    var track = $('[data-track]', root);
    var slides = $$('.quote', track);
    var dotsWrap = $('[data-dots]', root);
    var prev = $('[data-prev]', root);
    var next = $('[data-next]', root);
    var controls = prev.parentNode;
    var i = 0, timer = null, paused = false;

    slides.forEach(function (_, idx) {
      var b = document.createElement('button');
      b.type = 'button';
      b.tabIndex = -1;                          // decorative (dots wrapper is aria-hidden); prev/next are the real controls
      b.setAttribute('aria-label', 'Go to testimonial ' + (idx + 1));
      b.addEventListener('click', function () { go(idx); restart(); });
      dotsWrap.appendChild(b);
    });
    var dots = $$('button', dotsWrap);

    // persistent pause/play control (WCAG 2.2.2) — only when motion is allowed
    if (!reduce) {
      var ICON_PAUSE = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="fill:currentColor;stroke:none"><rect x="7.5" y="5" width="3.3" height="14" rx="1"/><rect x="13.2" y="5" width="3.3" height="14" rx="1"/></svg>';
      var ICON_PLAY = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="fill:currentColor;stroke:none"><path d="M8 5.5v13l11-6.5z"/></svg>';
      var pauseBtn = document.createElement('button');
      pauseBtn.type = 'button';
      pauseBtn.className = 'quotes__btn quotes__btn--toggle';
      pauseBtn.setAttribute('aria-label', 'Pause testimonials');
      pauseBtn.setAttribute('aria-pressed', 'false');
      pauseBtn.innerHTML = ICON_PAUSE;
      pauseBtn.addEventListener('click', function () {
        paused = !paused;
        pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
        pauseBtn.setAttribute('aria-label', paused ? 'Play testimonials' : 'Pause testimonials');
        pauseBtn.innerHTML = paused ? ICON_PLAY : ICON_PAUSE;
        paused ? stop() : start();
      });
      controls.insertBefore(pauseBtn, prev);
    }

    function go(n) {
      i = (n + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-i * 100) + '%)';
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === i); });
    }
    prev.addEventListener('click', function () { go(i - 1); restart(); });
    next.addEventListener('click', function () { go(i + 1); restart(); });

    function start() { if (reduce || paused || timer) return; timer = setInterval(function () { go(i + 1); }, 6000); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });

    var x0 = null;
    track.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { go(dx < 0 ? i + 1 : i - 1); restart(); }
      x0 = null;
    });

    go(0); start();
  }

  /* ---------- gallery lightbox (focus-trapped dialog) ---------- */
  function lightbox() {
    var box = $('#lightbox');
    var grid = $('[data-gallery]');
    if (!box || !grid) return;
    var img = $('#lightboxImg'), cap = $('#lightboxCap');
    var cards = $$('.gcard', grid);
    var items = cards.map(function (c) { return { src: c.dataset.src, cap: c.dataset.cap }; });
    var cur = 0, lastFocus = null;

    function open(n) {
      cur = (n + items.length) % items.length;
      img.src = items[cur].src;
      img.alt = items[cur].cap || '';
      cap.textContent = items[cur].cap || '';
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      $('.lightbox__close', box).focus();
    }
    function close() {
      box.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    cards.forEach(function (c, idx) {
      c.addEventListener('click', function () { lastFocus = c; open(idx); });
    });
    $('.lightbox__close', box).addEventListener('click', close);
    $('.lightbox__nav--prev', box).addEventListener('click', function () { open(cur - 1); });
    $('.lightbox__nav--next', box).addEventListener('click', function () { open(cur + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') { close(); }
      else if (e.key === 'ArrowLeft') { open(cur - 1); }
      else if (e.key === 'ArrowRight') { open(cur + 1); }
      else if (e.key === 'Tab') {
        var f = $$('button', box);
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- booking form -> WhatsApp ---------- */
  function bookingForm() {
    var form = $('#bookingForm');
    if (!form) return;
    var hint = $('#formHint');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var therapy = form.therapy.value;
      var message = form.message.value.trim();

      var bad = [];
      toggleInvalid(form.name, !name); if (!name) bad.push(form.name);
      var phoneOk = phone.length >= 7 && /[0-9]/.test(phone);
      toggleInvalid(form.phone, !phoneOk); if (!phoneOk) bad.push(form.phone);

      if (bad.length) {
        setHint('Please add your name and a valid phone number.', 'err');
        bad[0].focus();
        return;
      }

      var text = WA_MSG + '.\n\n'
        + 'Name: ' + name + '\n'
        + 'Phone: ' + phone + '\n'
        + 'Interested in: ' + therapy
        + (message ? '\nNote: ' + message : '');

      var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
      setHint('Opening WhatsApp…', 'ok');
      window.open(url, '_blank', 'noopener');
    });

    ['name', 'phone'].forEach(function (k) {
      form[k].addEventListener('input', function () { toggleInvalid(form[k], false); });
    });

    function toggleInvalid(el, on) {
      el.classList.toggle('invalid', on);
      el.setAttribute('aria-invalid', on ? 'true' : 'false');
      if (on) el.setAttribute('aria-describedby', 'formHint');
      else el.removeAttribute('aria-describedby');
    }
    function setHint(msg, kind) { if (!hint) return; hint.textContent = msg; hint.className = 'cform__hint ' + kind; }
  }

  /* ---------- active nav highlight ---------- */
  function activeNav() {
    var links = $$('.nav__link[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (l) {
      var id = l.getAttribute('href').slice(1);
      var sec = document.getElementById(id);
      if (sec) map[id] = l;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove('is-active'); });
        var l = map[en.target.id];
        if (l) l.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  }

  /* ---------- back to top ---------- */
  function backToTop() {
    var btn = $('#toTop');
    if (!btn) return;
    btn.hidden = false;
    bindScroll(function (y) { btn.classList.toggle('show', y > 700); });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }
})();
