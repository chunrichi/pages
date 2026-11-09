/* ============================================================
   AI Space · 原型展厅
   Vanilla JS, no dependencies, no build step.
   The registry (window.SHOWCASE) is the only data source.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- data ---------------------------------------- */
  var raw = window.SHOWCASE || {};
  var site = Object.assign(
    { name: "AI Space", tagline: "原型展厅", github: "" },
    raw.site || {}
  );
  var prototypes = Array.isArray(raw.prototypes)
    ? raw.prototypes.filter(function (item) {
        return item && item.slug && item.title;
      })
    : [];

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var initialTitle = document.title;

  /* ---------- helpers ------------------------------------- */
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call(
      (scope || document).querySelectorAll(selector)
    );
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[c];
    });
  }

  function pad(number) {
    return String(number).padStart(2, "0");
  }

  function formatDate(value) {
    var match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || "");
    return match ? match[1] + "." + match[2] + "." + match[3] : "—";
  }

  function resolveUrl(prototype, path) {
    return "prototypes/" + prototype.slug + "/" + path;
  }

  function accentOf(prototype) {
    return /^#[0-9a-f]{6}$/i.test(prototype.accent || "")
      ? prototype.accent
      : "#2d5be3";
  }

  function orderedPrototypes() {
    return prototypes.slice().sort(function (a, b) {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }

  var ordered = orderedPrototypes();
  var featured = ordered[0] || null;

  /* ---------- page chrome --------------------------------- */
  function renderSite() {
    if (site.name) {
      var brandName = $(".brand__name");
      if (brandName) brandName.textContent = site.name;
      document.title = site.name + " · " + (site.tagline || "原型展厅");
      initialTitle = document.title;
    }

    var github = $("[data-github]");
    if (github && /^https?:\/\//.test(site.github || "")) {
      github.href = site.github;
      github.hidden = false;
    }

    if (/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/.test(site.github || "")) {
      var repo = site.github.replace(/\/$/, "");
      $$("[data-doc]").forEach(function (link) {
        link.href = repo + "/blob/main/" + link.getAttribute("data-doc");
        link.target = "_blank";
        link.rel = "noopener";
      });
    }

    var count = $("[data-head-count]");
    if (count) count.textContent = pad(prototypes.length) + " 件展品";

    var statPrototypes = $("[data-stat-prototypes]");
    var statEntries = $("[data-stat-entries]");
    var statUpdated = $("[data-stat-updated]");

    var entryCount = prototypes.reduce(function (total, prototype) {
      return total + (Array.isArray(prototype.entries) ? prototype.entries.length : 0);
    }, 0);

    var latest = prototypes
      .map(function (prototype) {
        return prototype.updated;
      })
      .filter(Boolean)
      .sort()
      .pop();

    if (statPrototypes) statPrototypes.textContent = pad(prototypes.length);
    if (statEntries) statEntries.textContent = pad(entryCount);
    if (statUpdated) statUpdated.textContent = formatDate(latest);

    renderHero();
  }

  function renderHero() {
    var stack = $("[data-stack]");
    if (!stack) return;

    if (!featured) {
      stack.hidden = true;
      return;
    }

    var shots = (
      Array.isArray(featured.screens) && featured.screens.length
        ? featured.screens
        : [featured.cover]
    ).filter(Boolean);

    $$("[data-stack-img]", stack).forEach(function (img) {
      var index = Number(img.getAttribute("data-stack-img")) || 0;
      var source = shots[Math.min(index, shots.length - 1)];
      if (!source) {
        img.hidden = true;
        return;
      }
      img.src = resolveUrl(featured, source);
      img.alt = index === 0 ? featured.title + " 界面预览" : "";
      img.addEventListener("error", function () {
        img.hidden = true;
      });
    });

    var url = $("[data-stack-url]", stack);
    if (url) url.textContent = "prototypes/" + featured.slug;

    var status = $("[data-stack-status]", stack);
    if (status) {
      status.innerHTML =
        "<i></i><span>" + escapeHtml(featured.status || "可交互") + "</span>";
    }

    var entries = $("[data-stack-entries]", stack);
    if (entries) {
      entries.textContent = pad(
        Array.isArray(featured.entries) ? featured.entries.length : 0
      );
    }

    $$("[data-featured-open]").forEach(function (link) {
      var first = featured.entries && featured.entries[0];
      link.href = resolveUrl(featured, first ? first.path : "index.html");
      link.setAttribute("aria-label", "打开 " + featured.title + " 原型");
      link.addEventListener("click", function (event) {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
          return;
        }
        event.preventDefault();
        openStage(featured, 0);
      });
    });
  }

  /* ---------- gallery ------------------------------------- */
  var galleryEl = $("[data-gallery]");
  var filtersEl = $("[data-filters]");
  var galleryCountEl = $("[data-gallery-count]");
  var activeFilter = "all";
  var revealObserver = null;

  function categories() {
    var found = [];
    prototypes.forEach(function (prototype) {
      if (prototype.category && found.indexOf(prototype.category) === -1) {
        found.push(prototype.category);
      }
    });
    return found;
  }

  function renderFilters() {
    if (!filtersEl) return;

    var list = categories();
    if (prototypes.length < 2 || list.length < 2) {
      filtersEl.remove();
      filtersEl = null;
      return;
    }

    var items = [{ value: "all", label: "全部", count: prototypes.length }].concat(
      list.map(function (category) {
        return {
          value: category,
          label: category,
          count: prototypes.filter(function (prototype) {
            return prototype.category === category;
          }).length
        };
      })
    );

    filtersEl.innerHTML = items
      .map(function (item) {
        return (
          '<button class="filter" type="button" data-filter="' +
          escapeHtml(item.value) +
          '" aria-pressed="' +
          (item.value === activeFilter ? "true" : "false") +
          '">' +
          escapeHtml(item.label) +
          '<span class="filter__n">' +
          pad(item.count) +
          "</span></button>"
        );
      })
      .join("");

    filtersEl.addEventListener("click", function (event) {
      var button = event.target.closest("[data-filter]");
      if (!button) return;
      activeFilter = button.getAttribute("data-filter");
      $$(".filter", filtersEl).forEach(function (item) {
        item.setAttribute(
          "aria-pressed",
          String(item === button)
        );
      });
      renderGallery();
    });
  }

  function exhibitHtml(prototype, position, index) {
    var accent = accentOf(prototype);
    var entries = Array.isArray(prototype.entries) ? prototype.entries : [];
    var firstPath = entries[0] ? entries[0].path : "index.html";
    var cover = prototype.cover
      ? resolveUrl(prototype, prototype.cover)
      : "";
    var tags =
      Array.isArray(prototype.tags) && prototype.tags.length
        ? '<ul class="tags">' +
          prototype.tags
            .map(function (tag) {
              return "<li>" + escapeHtml(tag) + "</li>";
            })
            .join("") +
          "</ul>"
        : "";

    var entryLinks =
      entries.length > 1
        ? '<div class="entries">' +
          entries
            .map(function (entry, entryIndex) {
              return (
                '<a href="' +
                escapeHtml(resolveUrl(prototype, entry.path)) +
                '" data-entry="' +
                entryIndex +
                '">' +
                escapeHtml(entry.label) +
                ' <span aria-hidden="true">↗</span></a>'
              );
            })
            .join("") +
          "</div>"
        : "";

    return (
      '<article class="exhibit" data-reveal data-slug="' +
      escapeHtml(prototype.slug) +
      '" style="--accent:' +
      accent +
      ";--i:" +
      position +
      '">' +
      '<div class="exhibit__meta">' +
      '<span class="exhibit__num">' +
      pad(index + 1) +
      "</span>" +
      "<span>" +
      escapeHtml(prototype.category || "原型") +
      "</span>" +
      '<span class="exhibit__status"><i></i>' +
      escapeHtml(prototype.status || "可交互") +
      "</span>" +
      '<time datetime="' +
      escapeHtml(prototype.updated || "") +
      '">' +
      escapeHtml(formatDate(prototype.updated)) +
      "</time>" +
      "</div>" +
      '<div class="exhibit__grid">' +
      '<a class="exhibit__media" href="' +
      escapeHtml(resolveUrl(prototype, firstPath)) +
      '" data-entry="0" aria-label="打开 ' +
      escapeHtml(prototype.title) +
      ' 原型">' +
      '<span class="frame">' +
      '<span class="frame__bar">' +
      '<span class="win__dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
      '<span class="frame__path">prototypes/' +
      escapeHtml(prototype.slug) +
      "</span>" +
      '<span class="frame__tag">Preview</span>' +
      "</span>" +
      '<span class="frame__shot">' +
      '<span class="frame__fallback" aria-hidden="true">' +
      escapeHtml((prototype.title || "P").slice(0, 1)) +
      "</span>" +
      (cover
        ? '<img src="' +
          escapeHtml(cover) +
          '" alt="' +
          escapeHtml(prototype.title) +
          ' 界面预览" loading="lazy" decoding="async" />'
        : "") +
      "</span>" +
      '<span class="frame__cta">打开原型 <span aria-hidden="true">↗</span></span>' +
      "</span>" +
      "</a>" +
      '<div class="exhibit__body">' +
      "<h3>" +
      escapeHtml(prototype.title) +
      "</h3>" +
      '<p class="exhibit__summary">' +
      escapeHtml(prototype.summary || "") +
      "</p>" +
      tags +
      '<div class="exhibit__actions">' +
      '<button class="btn btn--dark" type="button" data-entry="0">' +
      "打开原型" +
      '<svg class="i" viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">' +
      '<path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />' +
      "</svg>" +
      "</button>" +
      entryLinks +
      "</div>" +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  function renderGallery() {
    if (!galleryEl) return;

    var list = ordered.filter(function (prototype) {
      return activeFilter === "all" || prototype.category === activeFilter;
    });

    if (galleryCountEl) galleryCountEl.textContent = pad(list.length);

    if (!list.length) {
      galleryEl.innerHTML =
        '<p class="exhibit-empty">还没有登记原型。把 prototypes/&lt;slug&gt;/ 放进展厅，然后在 data/prototypes.js 登记。</p>';
      return;
    }

    galleryEl.innerHTML = list
      .map(function (prototype, position) {
        return exhibitHtml(prototype, position, ordered.indexOf(prototype));
      })
      .join("");

    $$("img", galleryEl).forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("is-broken");
        img.removeAttribute("src");
      });
    });

    setupReveals(galleryEl);
  }

  galleryEl.addEventListener("click", function (event) {
    var trigger = event.target.closest("[data-entry]");
    if (!trigger) return;
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    var article = trigger.closest("[data-slug]");
    if (!article) return;

    var slug = article.getAttribute("data-slug");
    var prototype = prototypes.find(function (item) {
      return item.slug === slug;
    });
    if (!prototype) return;

    event.preventDefault();
    openStage(prototype, Number(trigger.getAttribute("data-entry")) || 0);
  });

  /* ---------- reveal -------------------------------------- */
  function setupReveals(scope) {
    var nodes = $$("[data-reveal]", scope || document).filter(function (node) {
      return !node.classList.contains("is-in");
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      nodes.forEach(function (node) {
        node.classList.add("is-in");
      });
      return;
    }

    if (revealObserver) revealObserver.disconnect();
    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );

    nodes.forEach(function (node) {
      revealObserver.observe(node);
    });
  }

  /* ---------- stage --------------------------------------- */
  var stageEl = $("[data-stage]");
  var stagePanel = $(".stage__panel", stageEl);
  var stageFrame = $("[data-stage-frame]");
  var stageTabs = $("[data-stage-tabs]");
  var stageLoading = $("[data-stage-loading]");
  var stageTitle = $("[data-stage-title]");
  var stagePath = $("[data-stage-path]");
  var stageDot = $("[data-stage-dot]");
  var stageOpenLink = $("[data-stage-open]");
  var stageCopyButton = $("[data-stage-copy]");
  var stageCloseButton = $("[data-stage-close]");
  var stageBackdrop = $("[data-stage-backdrop]");
  var stageState = null;
  var stageOpener = null;
  var closeTimer = 0;
  var toastTimer = 0;
  var toastEl = $("[data-toast]");

  function parseHash() {
    var rawHash = window.location.hash.replace(/^#/, "");
    if (!rawHash) return null;

    var params = new URLSearchParams(rawHash);
    var slug = params.get("p");
    if (!slug) return null;

    var prototype = prototypes.find(function (item) {
      return item.slug === slug;
    });
    if (!prototype || !Array.isArray(prototype.entries) || !prototype.entries.length) {
      return null;
    }

    var rawEntry = parseInt(params.get("e") || "0", 10);
    var entryIndex = isNaN(rawEntry)
      ? 0
      : Math.max(0, Math.min(rawEntry, prototype.entries.length - 1));
    var viewport = ["desktop", "tablet", "mobile"].indexOf(params.get("v")) > -1
      ? params.get("v")
      : "desktop";

    return {
      prototype: prototype,
      entryIndex: entryIndex,
      viewport: viewport
    };
  }

  function buildHash() {
    if (!stageState) return "";
    var params = new URLSearchParams();
    params.set("p", stageState.prototype.slug);
    if (stageState.entryIndex) params.set("e", String(stageState.entryIndex));
    if (stageState.viewport !== "desktop") params.set("v", stageState.viewport);
    return "#" + params.toString();
  }

  function pushHash(hash) {
    try {
      window.history.pushState({ gallery: true }, "", hash);
    } catch (error) {
      window.location.hash = hash;
    }
  }

  function replaceHash(hash) {
    var url = hash || window.location.pathname + window.location.search;
    try {
      window.history.replaceState(null, "", url);
    } catch (error) {
      if (hash) window.location.hash = hash;
    }
  }

  function lockPage(lock) {
    document.documentElement.classList.toggle("is-locked", lock);
    $$(".site-head, main, .site-foot, .skip-link").forEach(function (node) {
      if (lock) {
        node.setAttribute("inert", "");
      } else {
        node.removeAttribute("inert");
      }
    });
  }

  function syncTabs() {
    if (!stageState) return;
    $$("[data-entry]", stageTabs).forEach(function (tab) {
      tab.setAttribute(
        "aria-selected",
        String(Number(tab.getAttribute("data-entry")) === stageState.entryIndex)
      );
    });
  }

  function buildTabs(prototype) {
    stageTabs.innerHTML = prototype.entries
      .map(function (entry, index) {
        return (
          '<button class="stage__tab" type="button" role="tab" data-entry="' +
          index +
          '" aria-selected="' +
          (index === stageState.entryIndex ? "true" : "false") +
          '">' +
          escapeHtml(entry.label) +
          "</button>"
        );
      })
      .join("");
  }

  function updateChrome() {
    if (!stageState) return;
    var prototype = stageState.prototype;
    var entry = prototype.entries[stageState.entryIndex];
    var fullPath = "prototypes/" + prototype.slug + "/" + entry.path;

    if (stageTitle) stageTitle.textContent = prototype.title;
    if (stagePath) stagePath.textContent = fullPath;
    if (stageDot) stageDot.style.background = accentOf(prototype);
    if (stageOpenLink) stageOpenLink.href = resolveUrl(prototype, entry.path);
    if (stageFrame) {
      stageFrame.title = prototype.title + " · " + entry.label;
    }

    stageEl.style.setProperty("--stage-accent", accentOf(prototype));
    document.title = prototype.title + " · " + (site.tagline || "原型展厅");
  }

  function showLoading() {
    if (stageLoading) stageLoading.classList.remove("is-hidden");
  }

  function loadEntry() {
    if (!stageState) return;
    var prototype = stageState.prototype;
    var entry = prototype.entries[stageState.entryIndex];
    if (!entry) return;

    showLoading();
    if (stageFrame) stageFrame.src = resolveUrl(prototype, entry.path);
  }

  function selectEntry(index) {
    if (!stageState) return;
    var next = Math.max(
      0,
      Math.min(index, stageState.prototype.entries.length - 1)
    );
    if (next === stageState.entryIndex) return;

    stageState.entryIndex = next;
    syncTabs();
    updateChrome();
    loadEntry();
    replaceHash(buildHash());
  }

  function applyViewport(viewport) {
    stageEl.setAttribute("data-viewport", viewport);
    $$(".viewport button[data-viewport]").forEach(function (button) {
      button.setAttribute(
        "aria-pressed",
        String(button.getAttribute("data-viewport") === viewport)
      );
    });
  }

  function openStage(prototype, entryIndex, options) {
    options = options || {};
    if (
      !prototype ||
      !Array.isArray(prototype.entries) ||
      !prototype.entries.length
    ) {
      return;
    }

    if (!stageState) {
      stageOpener = document.activeElement;
    }

    window.clearTimeout(closeTimer);

    var index = Math.max(
      0,
      Math.min(entryIndex || 0, prototype.entries.length - 1)
    );
    var viewport =
      ["desktop", "tablet", "mobile"].indexOf(options.viewport) > -1
        ? options.viewport
        : "desktop";

    stageState = {
      prototype: prototype,
      entryIndex: index,
      viewport: viewport
    };

    stageEl.hidden = false;
    stageEl.removeAttribute("inert");
    stageEl.setAttribute("aria-hidden", "false");

    buildTabs(prototype);
    applyViewport(viewport);
    updateChrome();
    loadEntry();
    lockPage(true);

    window.requestAnimationFrame(function () {
      stageEl.classList.add("is-open");
      if (stagePanel) stagePanel.focus({ preventScroll: true });
    });

    if (options.fromHistory) {
      return;
    }
    if (options.fromHash) {
      replaceHash(buildHash());
    } else {
      pushHash(buildHash());
    }
  }

  function closeStage(options) {
    options = options || {};
    if (!stageState) return;

    var opener = stageOpener;
    stageEl.classList.remove("is-open");
    stageEl.setAttribute("aria-hidden", "true");
    stageEl.setAttribute("inert", "");
    lockPage(false);
    document.title = initialTitle;
    replaceHash(null);

    stageState = null;
    stageOpener = null;

    window.clearTimeout(closeTimer);
    closeTimer = window.setTimeout(function () {
      if (stageState) return;
      stageEl.hidden = true;
      if (stageFrame) stageFrame.src = "about:blank";
      if (stageLoading) stageLoading.classList.remove("is-hidden");
    }, 380);

    if (
      options.restoreFocus !== false &&
      opener &&
      document.contains(opener) &&
      typeof opener.focus === "function"
    ) {
      window.setTimeout(function () {
        try {
          opener.focus({ preventScroll: true });
        } catch (error) {
          opener.focus();
        }
      }, 30);
    }
  }

  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("is-show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-show");
    }, 2000);
  }

  function copyLink() {
    var url = window.location.href;

    function fallback() {
      var field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      var copied = false;
      try {
        copied = document.execCommand("copy");
      } catch (error) {
        copied = false;
      }
      document.body.removeChild(field);
      toast(copied ? "链接已复制" : "复制失败，请从地址栏复制");
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(
        function () {
          toast("链接已复制");
        },
        fallback
      );
    } else {
      fallback();
    }
  }

  function bindStage() {
    if (!stageEl) return;

    stageTabs.addEventListener("click", function (event) {
      var tab = event.target.closest("[data-entry]");
      if (!tab) return;
      selectEntry(Number(tab.getAttribute("data-entry")));
    });

    $$(".viewport button[data-viewport]").forEach(function (button) {
      button.addEventListener("click", function () {
        if (!stageState) return;
        stageState.viewport = button.getAttribute("data-viewport");
        applyViewport(stageState.viewport);
        replaceHash(buildHash());
      });
    });

    if (stageCopyButton) stageCopyButton.addEventListener("click", copyLink);

    if (stageCloseButton) {
      stageCloseButton.addEventListener("click", function () {
        closeStage();
      });
    }

    if (stageBackdrop) {
      stageBackdrop.addEventListener("click", function () {
        closeStage();
      });
    }

    if (stageFrame) {
      stageFrame.addEventListener("load", function () {
        if (stageLoading) stageLoading.classList.add("is-hidden");
        try {
          var frameDocument = stageFrame.contentDocument;
          if (frameDocument) {
            frameDocument.addEventListener("keydown", function (event) {
              if (event.key === "Escape" && stageState) closeStage();
            });
          }
        } catch (error) {
          /* cross-origin prototypes keep their own keyboard handling */
        }
      });
    }

    document.addEventListener("keydown", function (event) {
      if (!stageState) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closeStage();
      }
    });

    window.addEventListener("popstate", function () {
      var route = parseHash();
      if (route) {
        openStage(route.prototype, route.entryIndex, {
          viewport: route.viewport,
          fromHistory: true
        });
      } else if (stageState) {
        closeStage({ restoreFocus: false });
      }
    });
  }

  /* ---------- header + parallax --------------------------- */
  function bindHeader() {
    var head = $("[data-head]");
    if (!head) return;

    function update() {
      head.classList.toggle("is-scrolled", window.scrollY > 8);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function bindParallax() {
    var visual = $("[data-parallax]");
    var stack = $("[data-stack]");
    var canHover =
      window.matchMedia &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (!visual || !stack || !canHover || reduceMotion) return;

    var ticking = false;

    visual.addEventListener("pointermove", function (event) {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var rect = visual.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - 0.5;
        var y = (event.clientY - rect.top) / rect.height - 0.5;
        stack.style.setProperty("--px", x.toFixed(3));
        stack.style.setProperty("--py", y.toFixed(3));
        ticking = false;
      });
    });

    visual.addEventListener("pointerleave", function () {
      stack.style.setProperty("--px", "0");
      stack.style.setProperty("--py", "0");
    });
  }

  /* ---------- boot ---------------------------------------- */
  function init() {
    if (!prototypes.length) {
      console.warn("[gallery] data/prototypes.js 里还没有登记原型。");
    }

    renderSite();
    renderFilters();
    renderGallery();
    setupReveals();
    bindHeader();
    bindParallax();
    bindStage();

    var route = parseHash();
    if (route) {
      openStage(route.prototype, route.entryIndex, {
        viewport: route.viewport,
        fromHash: true
      });
    }
  }

  init();
})();
