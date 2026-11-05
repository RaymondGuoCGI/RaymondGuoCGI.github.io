// report-green.js - Dependency-free interactive runtime for report-green theme
(function () {
  'use strict';

  // Safe localStorage helper
  function safeGet(key, fallback) {
    try {
      var val = localStorage.getItem(key);
      return val !== null ? val : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function safeSet(key, val) {
    try {
      localStorage.setItem(key, val);
    } catch (e) {}
  }

  // 1. Theme Toggle
  var currentTheme = safeGet('rg_theme', 'dark');

  function updateThemeUI(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var themeBtn = document.getElementById('rg-theme-btn');
    if (themeBtn) {
      var isDark = theme === 'dark';
      var titleText = isDark ? '切换浅色模式 / Switch to light mode' : '切换深色模式 / Switch to dark mode';
      themeBtn.setAttribute('title', titleText);
      themeBtn.setAttribute('aria-label', titleText);
    }
    syncGiscusThemeLang(theme, currentLang);
  }

  function initTheme() {
    updateThemeUI(currentTheme);
    var themeBtn = document.getElementById('rg-theme-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        safeSet('rg_theme', currentTheme);
        updateThemeUI(currentTheme);
      });
    }
  }

  // 2. Localization (i18n)
  var currentLang = safeGet('rg_lang', document.documentElement.getAttribute('data-ui-lang') || 'zh');

  var I18N = {
    zh: {
      about_site: "关于本站",
      archive_title: "归档",
      by_time: "按发布时间排列",
      categories: "分类",
      categories_count: "分类总数",
      category_label: "分类",
      latest: "最新文章",
      menu: "菜单",
      nav_home: "首页",
      nav_archives: "归档",
      nav_categories: "分类",
      nav_tags: "标签",
      nav_about: "关于",
      nav_contact: "联系",
      nav_privacy: "隐私",
      next_page: "下一页",
      next_post: "下一篇",
      no_categories: "暂无分类",
      no_result: "未找到结果",
      no_tags: "暂无标签",
      page_views: "页面浏览",
      posts_count: "文章总数",
      prev_page: "上一页",
      prev_post: "上一篇",
      search: "搜索",
      search_ph: "搜索文章…",
      selected_tags: "精选标签",
      start_read: "开始阅读 ↓",
      stats: "访问统计（GA4 浏览量）",
      summary: "内容概要",
      tag_label: "标签",
      tags: "标签",
      tags_count: "标签总数",
      theme_toggle: "切换深浅色",
      toc: "本页目录",
      views: "累计浏览",
      visitors: "累计访客"
    },
    en: {
      about_site: "About Site",
      archive_title: "Archives",
      by_time: "By Date",
      categories: "Categories",
      categories_count: "Total Categories",
      category_label: "Category",
      latest: "Latest Posts",
      menu: "Menu",
      nav_home: "Home",
      nav_archives: "Archives",
      nav_categories: "Categories",
      nav_tags: "Tags",
      nav_about: "About",
      nav_contact: "Contact",
      nav_privacy: "Privacy",
      next_page: "Next",
      next_post: "Next Post",
      no_categories: "No categories",
      no_result: "No results found",
      no_tags: "No tags",
      page_views: "Page Views",
      posts_count: "Total Posts",
      prev_page: "Prev",
      prev_post: "Previous Post",
      search: "Search",
      search_ph: "Search articles…",
      selected_tags: "Selected Tags",
      start_read: "Start Reading ↓",
      stats: "Analytics (GA4 Views)",
      summary: "Summary",
      tag_label: "Tag",
      tags: "Tags",
      tags_count: "Total Tags",
      theme_toggle: "Toggle Theme",
      toc: "Table of Contents",
      views: "Total Views",
      visitors: "Total Visitors"
    }
  };

  function applyTranslations(lang) {
    document.documentElement.setAttribute('data-ui-lang', lang);
    var dict = I18N[lang] || I18N.zh;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (key && dict[key]) {
        el.textContent = dict[key];
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-title');
      if (key && dict[key]) {
        el.setAttribute('title', dict[key]);
        if (el.hasAttribute('aria-label')) {
          el.setAttribute('aria-label', dict[key]);
        }
      }
    });

    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-ph');
      if (key && dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    var langLabel = document.getElementById('rg-lang-label');
    if (langLabel) {
      langLabel.textContent = lang === 'zh' ? 'EN' : '中';
    }

    localizeGA4Rows(lang);
    localizeCacheBadges(lang);
    syncGiscusThemeLang(currentTheme, lang);
  }

  function localizeGA4Rows(lang) {
    var labels = lang === 'en'
      ? { today: 'Today', week: 'This Week', month: 'This Month' }
      : { today: '今日浏览量', week: '本周浏览量', month: '本月浏览量' };
    Object.keys(labels).forEach(function (key) {
      var item = document.getElementById('ga4-stat-' + key);
      var node = item && item.querySelector('.item-name');
      if (node && node.textContent !== labels[key]) node.textContent = labels[key];
    });
  }

  function localizeCacheBadges(lang) {
    var label = lang === 'en' ? 'cached' : '缓存';
    document.querySelectorAll('.bsz-cache-badge').forEach(function (node) {
      if (node.textContent !== label) node.textContent = label;
      node.setAttribute('aria-label', lang === 'en' ? 'Data status: cached' : '数据状态：缓存');
    });
  }

  function initStatsLabels() {
    if (!window.MutationObserver) return;
    var observer = new MutationObserver(function () {
      localizeGA4Rows(currentLang);
      localizeCacheBadges(currentLang);
    });
    document.querySelectorAll('.card-webinfo .webinfo, .rg-counter-label').forEach(function (node) {
      observer.observe(node, { childList: true, subtree: true });
    });
  }

  function initLang() {
    applyTranslations(currentLang);
    var langBtn = document.getElementById('rg-lang-btn');
    if (langBtn) {
      langBtn.addEventListener('click', function () {
        currentLang = currentLang === 'zh' ? 'en' : 'zh';
        safeSet('rg_lang', currentLang);
        applyTranslations(currentLang);
      });
    }
  }

  // 3. Mobile Navigation Menu
  function initMobileMenu() {
    var menuBtn = document.getElementById('rg-menu-btn');
    var nav = document.getElementById('rg-nav');
    if (!menuBtn || !nav) return;

    menuBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = nav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !menuBtn.contains(e.target)) {
        nav.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (nav.classList.contains('is-open')) {
          nav.classList.remove('is-open');
          menuBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // 4. In-Site Search Modal (Zero innerHTML, strict createElement & same-origin URL check)
  function initSearch() {
    var searchBtn = document.getElementById('rg-search-btn');
    var dialog = document.getElementById('rg-search');
    var input = document.getElementById('rg-search-input');
    var resultsList = document.getElementById('rg-search-results');
    var emptyMsg = document.getElementById('rg-search-empty');

    if (!searchBtn || !dialog || !input || !resultsList || !emptyMsg) return;

    var searchUrl = dialog.getAttribute('data-url') || '/search.json';
    var cachedData = null;
    var isFetching = false;
    var previousFocusedElement = null;

    // Ensure close button exists
    var closeBtn = dialog.querySelector('.rg-search-close');
    if (!closeBtn) {
      closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'rg-search-close';
      closeBtn.setAttribute('aria-label', currentLang === 'zh' ? '关闭搜索' : 'Close search');
      closeBtn.textContent = '×';
      var container = dialog.querySelector('.rg-search-in') || dialog;
      container.appendChild(closeBtn);
    }

    function isSafeSameOriginUrl(urlStr) {
      if (typeof urlStr !== 'string' || !urlStr) return false;
      if (/^\/(?!\/)/.test(urlStr) || /^\.\.?\//.test(urlStr)) return true;
      try {
        var parsed = new URL(urlStr, window.location.origin);
        return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.origin === window.location.origin;
      } catch (e) {
        return false;
      }
    }

    function clearResults() {
      while (resultsList.firstChild) {
        resultsList.removeChild(resultsList.firstChild);
      }
      emptyMsg.hidden = true;
    }

    function makeSnippet(text, query) {
      if (!text) return '';
      var idx = text.toLowerCase().indexOf(query.toLowerCase());
      if (idx === -1) {
        return text.slice(0, 85) + (text.length > 85 ? '…' : '');
      }
      var start = Math.max(0, idx - 25);
      var end = Math.min(text.length, idx + query.length + 55);
      var snippet = text.slice(start, end).trim();
      if (start > 0) snippet = '…' + snippet;
      if (end < text.length) snippet = snippet + '…';
      return snippet;
    }

    function renderResults(posts, query) {
      clearResults();
      if (!posts || posts.length === 0) {
        emptyMsg.hidden = false;
        return;
      }

      posts.slice(0, 10).forEach(function (post) {
        var li = document.createElement('li');
        var a = document.createElement('a');

        var safeHref = isSafeSameOriginUrl(post.url) ? post.url : '#';
        a.setAttribute('href', safeHref);

        var titleEl = document.createElement('div');
        titleEl.className = 'rg-search-item-title';
        titleEl.textContent = post.title || 'Untitled';
        a.appendChild(titleEl);

        var snippetText = makeSnippet(post.text, query);
        if (snippetText) {
          var snipEl = document.createElement('div');
          snipEl.className = 'rg-search-item-snippet';
          snipEl.textContent = snippetText;
          a.appendChild(snipEl);
        }

        li.appendChild(a);
        resultsList.appendChild(li);
      });
    }

    function filterPosts(query) {
      if (!cachedData || !cachedData.posts) return;
      var q = query.trim().toLowerCase();
      if (!q) {
        clearResults();
        return;
      }

      var matches = cachedData.posts.filter(function (post) {
        var title = (post.title || '').toLowerCase();
        var text = (post.text || '').toLowerCase();
        var tags = Array.isArray(post.tags) ? post.tags.join(' ').toLowerCase() : '';
        var cats = Array.isArray(post.categories) ? post.categories.join(' ').toLowerCase() : '';
        return title.indexOf(q) !== -1 || text.indexOf(q) !== -1 || tags.indexOf(q) !== -1 || cats.indexOf(q) !== -1;
      });

      renderResults(matches, q);
    }

    function loadIndexAndSearch(query) {
      if (cachedData) {
        filterPosts(query);
        return;
      }
      if (isFetching) return;
      isFetching = true;

      fetch(searchUrl)
        .then(function (res) {
          if (!res.ok) throw new Error('Network error');
          return res.json();
        })
        .then(function (data) {
          cachedData = data;
          isFetching = false;
          filterPosts(input.value);
        })
        .catch(function () {
          isFetching = false;
          clearResults();
          emptyMsg.hidden = false;
        });
    }

    function openDialog() {
      previousFocusedElement = document.activeElement;
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
      input.value = '';
      clearResults();
      input.focus();
      loadIndexAndSearch('');
    }

    function closeDialog() {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
      if (previousFocusedElement && typeof previousFocusedElement.focus === 'function') {
        previousFocusedElement.focus();
      }
    }

    searchBtn.addEventListener('click', openDialog);
    closeBtn.addEventListener('click', closeDialog);

    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) {
        closeDialog();
      }
    });

    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeDialog();
      }
    });

    var debounceTimer = null;
    input.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        loadIndexAndSearch(input.value);
      }, 150);
    });
  }

  // 5. Table of Contents (TOC) & Active Spy
  function initTOC() {
    var toc = document.getElementById('rg-toc');
    var toggleBtn = document.getElementById('rg-toc-toggle');
    var tocNav = document.getElementById('rg-toc-nav');
    if (!toc || !tocNav) return;

    var isSmallScreen = window.innerWidth <= 960;
    if (toggleBtn) {
      if (isSmallScreen) {
        toc.classList.add('is-collapsed');
        toggleBtn.setAttribute('aria-expanded', 'false');
      } else {
        toggleBtn.setAttribute('aria-expanded', 'true');
      }

      toggleBtn.addEventListener('click', function () {
        var collapsed = toc.classList.toggle('is-collapsed');
        toggleBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      });
    }

    var tocLinks = Array.from(tocNav.querySelectorAll('a[data-toc]'));
    var headingTargets = [];

    tocLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href && href.charAt(0) === '#') {
        var targetEl = document.getElementById(decodeURIComponent(href.slice(1)));
        if (targetEl) {
          headingTargets.push({ el: targetEl, link: link });
        }
      }

      link.addEventListener('click', function () {
        if (window.innerWidth <= 960 && toggleBtn) {
          toc.classList.add('is-collapsed');
          toggleBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });

    if (headingTargets.length > 0 && 'IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              tocLinks.forEach(function (l) { l.classList.remove('on'); });
              var match = headingTargets.find(function (item) { return item.el === entry.target; });
              if (match) {
                match.link.classList.add('on');
              }
            }
          });
        },
        { rootMargin: '0px 0px -70% 0px', threshold: 0 }
      );

      headingTargets.forEach(function (item) {
        observer.observe(item.el);
      });
    }
  }

  // 6. Wrap Wide Article Tables for Overflow
  function initTableWrap() {
    var tables = document.querySelectorAll('.p-content table, .rg-article table');
    tables.forEach(function (tbl) {
      if (tbl.closest('.highlight') || (tbl.parentElement && tbl.parentElement.classList.contains('table-wrap'))) {
        return;
      }
      var wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      tbl.parentNode.insertBefore(wrap, tbl);
      wrap.appendChild(tbl);
    });
  }

  // 7. Giscus Theme & Lang Synchronization
  function syncGiscusThemeLang(theme, lang) {
    var comments = document.getElementById('rg-comments');
    if (!comments) return;

    var lightTheme = comments.getAttribute('data-light') || 'light';
    var darkTheme = comments.getAttribute('data-dark') || 'dark';
    var targetTheme = theme === 'light' ? lightTheme : darkTheme;
    var targetLang = lang === 'zh' ? 'zh-CN' : 'en';

    var script = comments.querySelector('script[src*="giscus.app"]');
    if (script) {
      script.setAttribute('data-theme', targetTheme);
      script.setAttribute('data-lang', targetLang);
    }

    var iframe = document.querySelector('iframe.giscus-frame');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          giscus: {
            setConfig: {
              theme: targetTheme,
              lang: targetLang
            }
          }
        },
        'https://giscus.app'
      );
    }
  }

  function initGiscusObserver() {
    var comments = document.getElementById('rg-comments');
    if (!comments) return;

    var observer = new MutationObserver(function () {
      var iframe = document.querySelector('iframe.giscus-frame');
      if (iframe) {
        syncGiscusThemeLang(currentTheme, currentLang);
        observer.disconnect();
      }
    });

    observer.observe(comments, { childList: true, subtree: true });
  }

  // Initialize all features once DOM is ready
  function init() {
    initTheme();
    initLang();
    initStatsLabels();
    initMobileMenu();
    initSearch();
    initTOC();
    initTableWrap();
    initGiscusObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
