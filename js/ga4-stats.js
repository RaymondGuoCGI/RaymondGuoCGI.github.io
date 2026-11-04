(function () {
  'use strict';

  const ENDPOINT = 'https://stats.raymondstudio.cn/stats.json';
  const TIMEOUT_MS = 8000;
  const BASE_TITLE = 'GA4浏览量（PV），上海时间';
  const EMDASH = '—';

  const METRICS = [
    { key: 'today', label: '今日浏览量', id: 'ga4-stat-today' },
    { key: 'week', label: '本周浏览量', id: 'ga4-stat-week' },
    { key: 'month', label: '本月浏览量', id: 'ga4-stat-month' }
  ];

  let cachedData = null;
  let isFetching = false;

  function isValidCount(val) {
    return Number.isInteger(val) && val >= 0;
  }

  function validatePayload(data) {
    if (!data || data.available !== true) return null;
    if (data.source !== 'GA4' || data.metric !== 'screenPageViews' || data.timeZone !== 'Asia/Shanghai') {
      return null;
    }
    if (!data.periods || typeof data.periods !== 'object') return null;
    return data;
  }

  function ensureItem(container, id, labelText) {
    let item = document.getElementById(id);
    if (!item) {
      item = document.createElement('div');
      item.id = id;
      item.className = 'webinfo-item';

      const nameEl = document.createElement('div');
      nameEl.className = 'item-name';
      nameEl.textContent = labelText + ' :';

      const countEl = document.createElement('div');
      countEl.className = 'item-count';
      countEl.textContent = EMDASH;

      item.appendChild(nameEl);
      item.appendChild(countEl);
      container.appendChild(item);
    }
    return item;
  }

  function updateDOM(data, errorMsg) {
    const container = document.querySelector('.card-webinfo .webinfo');
    if (!container) return;

    const validData = validatePayload(data);

    METRICS.forEach(m => {
      const item = ensureItem(container, m.id, m.label);
      const countEl = item.querySelector('.item-count');

      if (!validData) {
        if (countEl) countEl.textContent = EMDASH;
        item.title = errorMsg ? `${BASE_TITLE}（${errorMsg}）` : `${BASE_TITLE}（数据暂不可用）`;
        return;
      }

      const period = validData.periods[m.key];
      const views = period ? period.views : null;

      if (isValidCount(views)) {
        if (countEl) countEl.textContent = String(views);
      } else {
        if (countEl) countEl.textContent = EMDASH;
      }

      let tooltip = BASE_TITLE;
      if (validData.stale) {
        tooltip += `（缓存数据，更新于 ${validData.updatedAt || '未知'}）`;
      }
      item.title = tooltip;
    });
  }

  async function fetchStats() {
    if (isFetching) return;
    isFetching = true;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(ENDPOINT, {
        method: 'GET',
        credentials: 'omit',
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timer);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      cachedData = validatePayload(json);
      if (!cachedData) {
        updateDOM(null, '数据格式不符');
      } else {
        updateDOM(cachedData);
      }
    } catch (err) {
      clearTimeout(timer);
      updateDOM(null, '网络超时或服务不可用');
    } finally {
      isFetching = false;
    }
  }

  function render() {
    const container = document.querySelector('.card-webinfo .webinfo');
    if (!container) return;

    if (cachedData) {
      updateDOM(cachedData);
    } else {
      updateDOM(null);
      fetchStats();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }

  if (window.btf && typeof window.btf.addGlobalFn === 'function') {
    window.btf.addGlobalFn('pjaxComplete', render, 'ga4-stats');
  }
})();