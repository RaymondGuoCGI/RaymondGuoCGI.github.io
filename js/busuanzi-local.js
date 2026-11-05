(function () {
  'use strict';

  if (window.__busuanzi_local_loaded__) return;
  window.__busuanzi_local_loaded__ = true;

  var BUNDLED = {
    site_uv: 6965,
    site_pv: 8246,
    ts: Date.parse('2026-11-05T01:29:20.272Z')
  };
  var STORAGE_KEY = 'busuanzi_site_cache';

  var currentTimer = null;
  var currentScript = null;
  var currentCb = null;
  var inFlight = false;

  function getSafeSnapshot() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        var now = Date.now();
        if (
          parsed &&
          Number.isSafeInteger(parsed.site_uv) && parsed.site_uv >= 0 &&
          Number.isSafeInteger(parsed.site_pv) && parsed.site_pv >= 0 &&
          parsed.site_uv <= parsed.site_pv &&
          Number.isSafeInteger(parsed.ts) &&
          parsed.ts >= BUNDLED.ts &&
          parsed.ts <= now
        ) {
          return { site_uv: parsed.site_uv, site_pv: parsed.site_pv, ts: parsed.ts, isBundled: false };
        }
      }
    } catch (e) {}
    return { site_uv: BUNDLED.site_uv, site_pv: BUNDLED.site_pv, ts: BUNDLED.ts, isBundled: true };
  }

  function saveSnapshot(uv, pv) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        site_uv: uv,
        site_pv: pv,
        ts: Date.now()
      }));
    } catch (e) {}
  }

  function attachBadge(targetEl) {
    var label = targetEl.previousElementSibling;
    if (!label || label.querySelector('.bsz-cache-badge')) return;
    var badge = document.createElement('span');
    badge.className = 'bsz-cache-badge';
    badge.setAttribute('aria-label', '数据状态：缓存');
    badge.textContent = '缓存';
    badge.style.fontSize = '0.75em';
    badge.style.marginLeft = '4px';
    badge.style.verticalAlign = 'baseline';
    badge.style.opacity = '0.8';
    label.appendChild(badge);
  }

  function removeBadges() {
    var badges = document.querySelectorAll('.bsz-cache-badge');
    for (var i = 0; i < badges.length; i++) {
      if (badges[i].parentNode) {
        badges[i].parentNode.removeChild(badges[i]);
      }
    }
  }

  function setCount(valId, contId, val, titleText, isCached) {
    var valEl = document.getElementById(valId);
    if (valEl) {
      valEl.textContent = String(val);
      if (titleText) valEl.title = titleText;
      if (isCached) {
        attachBadge(valEl);
      }
    }
    var contEl = document.getElementById(contId);
    if (contEl) {
      contEl.style.display = 'inline';
    }
  }

  function renderCached() {
    var snap = getSafeSnapshot();
    var timeStr = new Date(snap.ts).toLocaleString();
    var title = snap.isBundled
      ? '不蒜子最近成功结果（缓存），时间 ' + timeStr + '；正在更新'
      : '不蒜子最近成功结果（缓存），时间 ' + timeStr + '；正在更新';
    setCount('busuanzi_value_site_uv', 'busuanzi_container_site_uv', snap.site_uv, title, true);
    setCount('busuanzi_value_site_pv', 'busuanzi_container_site_pv', snap.site_pv, title, true);
  }

  function renderLive(uv, pv, pagePv) {
    removeBadges();
    var nowStr = new Date().toLocaleString();
    var title = '不蒜子统计，更新于 ' + nowStr;
    setCount('busuanzi_value_site_uv', 'busuanzi_container_site_uv', uv, title, false);
    setCount('busuanzi_value_site_pv', 'busuanzi_container_site_pv', pv, title, false);
    setCount('busuanzi_value_page_pv', 'busuanzi_container_page_pv', pagePv, title, false);
    saveSnapshot(uv, pv);
  }

  function renderFallbackPagePv() {
    ['site_uv', 'site_pv'].forEach(function (key) {
      var counter = document.getElementById('busuanzi_value_' + key);
      if (counter) counter.title = counter.title.replace('正在更新', '暂未更新，显示缓存');
    });
    var valEl = document.getElementById('busuanzi_value_page_pv');
    if (valEl) {
      valEl.textContent = '—';
      valEl.title = '统计响应超时或不可用';
    }
    var contEl = document.getElementById('busuanzi_container_page_pv');
    if (contEl) {
      contEl.style.display = 'inline';
    }
  }

  function cleanupCurrent() {
    if (currentTimer) {
      clearTimeout(currentTimer);
      currentTimer = null;
    }
    if (currentScript && currentScript.parentNode) {
      currentScript.parentNode.removeChild(currentScript);
      currentScript = null;
    }
    if (currentCb) {
      var oldCb = currentCb;
      currentCb = null;
      delete window[oldCb];
    }
    inFlight = false;
  }

  function fetchCounts() {
    if (inFlight) return;
    cleanupCurrent();
    inFlight = true;

    var cbName;
    do {
      cbName = 'BusuanziCallback_' + Date.now() + '_' + Math.floor(Math.random() * 1000000000);
    } while (Object.prototype.hasOwnProperty.call(window, cbName));
    currentCb = cbName;

    currentTimer = setTimeout(function () {
      if (currentCb === cbName) {
        cleanupCurrent();
        renderFallbackPagePv();
      }
    }, 6000);

    window[cbName] = function (data) {
      if (currentCb !== cbName) return;
      cleanupCurrent();
      if (
        data &&
        Number.isSafeInteger(data.site_uv) && data.site_uv >= 0 &&
        Number.isSafeInteger(data.site_pv) && data.site_pv >= 0 &&
        Number.isSafeInteger(data.page_pv) && data.page_pv >= 0 &&
        data.site_uv <= data.site_pv
      ) {
        renderLive(data.site_uv, data.site_pv, data.page_pv);
      } else {
        renderFallbackPagePv();
      }
    };

    var script = document.createElement('script');
    currentScript = script;
    script.type = 'text/javascript';
    script.async = true;
    script.referrerPolicy = 'no-referrer-when-downgrade';
    script.src = 'https://busuanzi.ibruce.info/busuanzi?jsonpCallback=' + cbName;
    script.onerror = function () {
      if (currentCb === cbName) {
        cleanupCurrent();
        renderFallbackPagePv();
      }
    };

    var head = document.getElementsByTagName('head')[0] || document.documentElement;
    head.appendChild(script);
  }

  function run() {
    renderCached();
    fetchCounts();
  }

  if (document.readyState === 'loading' && !document.querySelector('[id^="busuanzi_value_"]')) {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }

})();
