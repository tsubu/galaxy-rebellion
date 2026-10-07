/*!
 * GALAXY REBELLION 埋め込みローダー
 *
 *   <div data-galaxy-rebellion></div>
 *   <script src="/path/to/embed/galaxy-rebellion.js" defer></script>
 *
 * 詳しいオプションは embed/README.md を参照。
 */
(function () {
  'use strict';
  if (window.GalaxyRebellion) return;

  var SCRIPT = document.currentScript;
  // 既定のゲーム URL：このスクリプトの1つ上の階層にある index.html
  var DEFAULT_SRC = SCRIPT && SCRIPT.src ? new URL('../index.html', SCRIPT.src).href : 'index.html';

  var CSS = [
    '.gr-embed{position:relative;width:100%;max-width:var(--gr-max,100%);margin:0 auto;aspect-ratio:var(--gr-ratio,16/9);background:#000;overflow:hidden;border-radius:var(--gr-radius,12px);box-shadow:0 10px 40px rgba(0,0,0,.35);isolation:isolate}',
    '@media (max-width:600px){.gr-embed{aspect-ratio:var(--gr-ratio-sp,4/5)}}',
    '.gr-embed iframe{position:absolute;inset:0;width:100%;height:100%;border:0;display:block;opacity:0;transition:opacity .6s}',
    '.gr-embed.gr-loaded iframe{opacity:1}',
    '.gr-poster{all:unset;box-sizing:border-box;position:absolute;inset:0;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.4em;cursor:pointer;text-align:center;color:#ffe81f;font-family:"Arial Black","Helvetica Neue",Arial,sans-serif;',
    'background:radial-gradient(1px 1px at 12% 22%,#fff,transparent),radial-gradient(1px 1px at 72% 14%,#fff,transparent),radial-gradient(1.5px 1.5px at 38% 68%,#cfe3ff,transparent),radial-gradient(1px 1px at 86% 58%,#fff,transparent),radial-gradient(1px 1px at 22% 84%,#fff,transparent),radial-gradient(1.5px 1.5px at 58% 40%,#fff,transparent),radial-gradient(1px 1px at 92% 88%,#cfe3ff,transparent),radial-gradient(1px 1px at 6% 52%,#fff,transparent),radial-gradient(ellipse at 70% 30%,rgba(90,60,200,.35),transparent 55%),radial-gradient(ellipse at 20% 80%,rgba(255,120,60,.25),transparent 50%),#02030a;',
    'transition:opacity .5s}',
    '.gr-poster:focus-visible{outline:3px solid #ffe81f;outline-offset:-6px}',
    '.gr-logo{font-weight:900;line-height:.95;color:transparent;-webkit-text-stroke:2px #ffe81f;letter-spacing:.06em;filter:drop-shadow(0 0 14px rgba(255,232,31,.35))}',
    '.gr-logo b{display:block;font-size:clamp(30px,9cqw,92px)}',
    '.gr-logo i{display:block;font-style:normal;font-size:clamp(11px,1.8cqw,18px);color:#ffe81f;-webkit-text-stroke:0;letter-spacing:.5em;margin:.4em 0}',
    '.gr-logo span{display:block;font-size:clamp(20px,5.4cqw,56px);letter-spacing:.14em}',
    '.gr-play{margin-top:.9em;padding:.7em 1.8em;border:1px solid #ffe81f;color:#ffe81f;font:700 clamp(12px,1.6cqw,16px)/1 system-ui,sans-serif;letter-spacing:.2em;transition:background .15s,color .15s}',
    '.gr-poster:hover .gr-play{background:#ffe81f;color:#000}',
    '.gr-note{font:500 clamp(10px,1.2cqw,13px) system-ui,sans-serif;color:rgba(255,232,180,.65);letter-spacing:.08em}',
    '.gr-embed{container-type:inline-size}',
    '.gr-embed.gr-loaded .gr-poster{opacity:0;pointer-events:none}',
    /* 全画面（Fullscreen API）と、使えない端末（iPhone 等）向けの擬似全画面 */
    '.gr-embed:fullscreen{max-width:none;width:100%;height:100%;aspect-ratio:auto;border-radius:0;box-shadow:none}',
    '.gr-embed:-webkit-full-screen{max-width:none;width:100%;height:100%;aspect-ratio:auto;border-radius:0;box-shadow:none}',
    '.gr-embed.gr-fs{position:fixed!important;inset:0!important;z-index:2147483000!important;max-width:none!important;width:100vw!important;height:100vh!important;height:100dvh!important;aspect-ratio:auto!important;margin:0!important;border-radius:0!important;box-shadow:none}',
    'html.gr-fs-lock,html.gr-fs-lock body{overflow:hidden!important}',
  ].join('');

  function injectCSS() {
    if (document.getElementById('gr-embed-css')) return;
    var st = document.createElement('style'); st.id = 'gr-embed-css'; st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  var flag = function (v, def) { return v == null || v === '' ? def : !/^(off|false|0|no)$/i.test(String(v)); };

  function mount(el, opts) {
    if (!el) throw new Error('GalaxyRebellion.mount: 要素が見つかりません');
    if (el.__galaxyRebellion) return el.__galaxyRebellion;
    opts = opts || {};
    injectCSS();
    var ds = el.dataset;
    var o = {
      src: opts.src || ds.src || DEFAULT_SRC,
      ratio: opts.ratio || ds.ratio || '16/9',
      ratioSp: opts.ratioSp || ds.ratioSp || '4/5',
      maxWidth: opts.maxWidth || ds.maxWidth || '',
      radius: opts.radius || ds.radius || '',
      load: (opts.load || ds.load || 'click').toLowerCase(),        // click | visible | eager
      intro: flag(opts.intro != null ? opts.intro : ds.intro, false),
      sound: flag(opts.sound != null ? opts.sound : ds.sound, true),
      share: flag(opts.share != null ? opts.share : ds.share, true),
      quality: (opts.quality || ds.quality || 'high').toLowerCase(), // high | low
      pauseOffscreen: flag(opts.pauseOffscreen != null ? opts.pauseOffscreen : ds.pauseOffscreen, true),
      label: opts.label || ds.label || 'クリックしてプレイ',
      mobileFullscreen: flag(opts.mobileFullscreen != null ? opts.mobileFullscreen : ds.mobileFullscreen, false),
      onEvent: typeof opts.onEvent === 'function' ? opts.onEvent : null,
    };

    el.classList.add('gr-embed');
    el.style.setProperty('--gr-ratio', o.ratio);
    el.style.setProperty('--gr-ratio-sp', o.ratioSp);
    if (o.maxWidth) el.style.setProperty('--gr-max', /^\d+$/.test(o.maxWidth) ? o.maxWidth + 'px' : o.maxWidth);
    if (o.radius) el.style.setProperty('--gr-radius', /^\d+$/.test(o.radius) ? o.radius + 'px' : o.radius);

    var url = new URL(o.src, location.href);
    url.searchParams.set('embed', '1');
    url.searchParams.set('intro', o.intro ? '1' : '0');
    url.searchParams.set('sound', o.sound ? '1' : '0');
    url.searchParams.set('share', o.share ? '1' : '0');
    if (o.quality === 'low') url.searchParams.set('quality', 'low');
    var origin = url.origin === 'null' ? '*' : url.origin;

    var poster = document.createElement('button');
    poster.type = 'button'; poster.className = 'gr-poster';
    poster.setAttribute('aria-label', 'GALAXY REBELLION を起動');
    poster.innerHTML = '<div class="gr-logo"><b>GALAXY</b><i>銀河反乱軍</i><span>REBELLION</span></div>' +
      '<div class="gr-play">▶ PLAY</div><div class="gr-note"></div>';
    poster.querySelector('.gr-note').textContent = o.label;
    el.appendChild(poster);

    var iframe = null, visible = true, api;

    function emit(type, detail) {
      el.dispatchEvent(new CustomEvent('galaxyrebellion:' + type, { detail: detail, bubbles: true }));
      if (o.onEvent) try { o.onEvent(type, detail); } catch (e) { console.error(e); }
    }
    function send(type, extra) {
      if (!iframe || !iframe.contentWindow) return;
      var msg = { source: 'galaxy-rebellion-host', type: type };
      if (extra) for (var k in extra) msg[k] = extra[k];
      iframe.contentWindow.postMessage(msg, origin);
    }
    // ---- 全画面 ----
    function fsEl() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
    function isFS() { return fsEl() === el || el.classList.contains('gr-fs'); }
    function pseudoOn() { el.classList.add('gr-fs'); document.documentElement.classList.add('gr-fs-lock'); emit('fullscreen', { active: true }); }
    function enterFS() {
      var rq = el.requestFullscreen || el.webkitRequestFullscreen;
      if (rq) {
        try { var pr = rq.call(el); if (pr && pr.catch) pr.catch(pseudoOn); return; } catch (err) {}
      }
      pseudoOn();
    }
    function exitFS() {
      if (el.classList.contains('gr-fs')) { el.classList.remove('gr-fs'); document.documentElement.classList.remove('gr-fs-lock'); emit('fullscreen', { active: false }); return; }
      var ex = document.exitFullscreen || document.webkitExitFullscreen;
      if (ex && fsEl()) ex.call(document);
    }
    function toggleFS(force) {
      var on = force == null ? !isFS() : force;
      if (on) enterFS(); else exitFS();
      setTimeout(function () { if (iframe) try { iframe.focus(); } catch (err) {} }, 50);
    }
    function onFsChange() { emit('fullscreen', { active: fsEl() === el }); }
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);

    function onMessage(e) {
      if (!iframe || e.source !== iframe.contentWindow || !e.data || e.data.source !== 'galaxy-rebellion') return;
      var d = e.data, detail = {};
      for (var k in d) if (k !== 'source' && k !== 'type') detail[k] = d[k];
      if (d.type === 'ready') { el.classList.add('gr-loaded'); if (!visible) send('pause'); }
      if (d.type === 'fullscreen') { toggleFS(); return; }
      emit(d.type, detail);
    }

    function load(focus) {
      if (iframe) return;
      iframe = document.createElement('iframe');
      iframe.src = url.href;
      iframe.title = 'GALAXY REBELLION（ブラウザゲーム）';
      iframe.allow = 'fullscreen; clipboard-write; autoplay; gamepad';
      iframe.allowFullscreen = true;
      iframe.addEventListener('load', function () {
        el.classList.add('gr-loaded');           // ready が届かない古い版でもポスターを外す
        if (focus) try { iframe.focus(); } catch (e) {}
      });
      el.appendChild(iframe);
      poster.setAttribute('tabindex', '-1');
    }

    poster.addEventListener('click', function () {
      if (o.mobileFullscreen && window.matchMedia && matchMedia('(pointer: coarse)').matches) toggleFS(true);
      load(true);
    });
    window.addEventListener('message', onMessage);

    var io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (ents) {
        var v = ents[0].isIntersecting;
        if (v && o.load === 'visible') load(false);
        if (v === visible || isFS()) return;
        visible = v;
        if (o.pauseOffscreen) send(v ? 'resume' : 'pause');
      }, { threshold: 0.2 });
      io.observe(el);
    } else if (o.load === 'visible') load(false);
    if (o.load === 'eager') load(false);

    api = {
      element: el,
      get iframe() { return iframe; },
      load: function () { load(true); },
      pause: function () { send('pause'); },
      resume: function () { send('resume'); },
      mute: function (m) { send('mute', { value: m !== false }); },
      fullscreen: function (on) { toggleFS(on); },
      destroy: function () {
        if (isFS()) exitFS();
        document.removeEventListener('fullscreenchange', onFsChange);
        document.removeEventListener('webkitfullscreenchange', onFsChange);
        window.removeEventListener('message', onMessage);
        if (io) io.disconnect();
        if (iframe) iframe.remove();
        poster.remove();
        el.classList.remove('gr-embed', 'gr-loaded');
        delete el.__galaxyRebellion;
      },
    };
    el.__galaxyRebellion = api;
    return api;
  }

  function autoInit(root) {
    var list = (root || document).querySelectorAll('[data-galaxy-rebellion]');
    var out = [];
    for (var i = 0; i < list.length; i++) out.push(mount(list[i]));
    return out;
  }

  window.GalaxyRebellion = { mount: mount, autoInit: autoInit, version: '1.1.0' };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { autoInit(); });
  else autoInit();
})();
