(() => {
  "use strict";

  const exact = window.__T3ZH_EXACT__ || {};
  const templates = (window.__T3ZH_TEMPLATES__ || []).map(([source, replacement]) => [
    new RegExp(source, "u"),
    replacement,
  ]);
  const CJK = /[\u3400-\u9fff]/;
  const SKIP =
    'script,style,noscript,code,pre,kbd,samp,textarea,input,svg,canvas,' +
    '[contenteditable="true"],[class*="xterm"],[class*="chat-markdown"],' +
    '[class*="monaco"],[class*="cm-editor"],[data-t3zh-skip]';
  const ATTRS = ["placeholder", "title", "aria-label", "alt"];
  const cache = new Map();

  function normalize(value) {
    return value.replace(/\s+/g, " ").trim();
  }

  function translateString(value) {
    if (!value || !/[A-Za-z]/.test(value)) return value;

    const leading = (value.match(/^\s*/) || [""])[0];
    const trailing = (value.match(/\s*$/) || [""])[0];
    const core = value.slice(leading.length, value.length - trailing.length);
    const normalized = normalize(core);
    if (!normalized || !/[A-Za-z]/.test(normalized)) return value;

    if (cache.has(normalized)) {
      const cached = cache.get(normalized);
      return cached === null ? value : leading + cached + trailing;
    }

    let translated = exact[normalized];
    if (translated === undefined && CJK.test(normalized)) {
      cache.set(normalized, null);
      return value;
    }
    if (translated === undefined) {
      for (const [pattern, replacement] of templates) {
        if (pattern.test(normalized)) {
          translated = normalized.replace(pattern, replacement);
          break;
        }
      }
    }

    if (translated === undefined || translated === normalized) {
      cache.set(normalized, null);
      return value;
    }
    cache.set(normalized, translated);
    return leading + translated + trailing;
  }

  function isSkipped(element) {
    return Boolean(element && element.closest && element.closest(SKIP));
  }

  function replaceNodeText(node, text) {
    const value = node.nodeValue || "";
    const leading = (value.match(/^\s*/) || [""])[0];
    const trailing = (value.match(/\s*$/) || [""])[0];
    node.nodeValue = leading + text + trailing;
  }

  // React renders "What should we build in <project>?" as several text nodes.
  // Translating the fragments independently produces broken word order, so
  // handle this one split prompt as a phrase.
  function translateBuildPrompt(node) {
    const parent = node.parentElement;
    if (!parent) return false;

    const parentText = normalize(parent.textContent || "");
    const grandText = parent.parentElement
      ? normalize(parent.parentElement.textContent || "")
      : "";
    const isPrompt =
      /^What should we build\??\s*in$/i.test(parentText) ||
      /^What should we build\??\s*in\s*.+\?$/i.test(grandText);
    const marked =
      parent.dataset.t3zhBuildPrompt === "1" ||
      Boolean(parent.closest && parent.closest('[data-t3zh-build-prompt="1"]'));
    if (!isPrompt && !marked) return false;

    if (!marked) {
      parent.dataset.t3zhBuildPrompt = "1";
      if (parent.parentElement) parent.parentElement.dataset.t3zhBuildPrompt = "1";
    }

    const text = normalize(node.nodeValue || "");
    if (text === "What should we build") {
      replaceNodeText(node, "在");
      return true;
    }
    if (text === "in") {
      replaceNodeText(node, "");
      return true;
    }
    if (text === "?") {
      const inPromptPhrase = normalize(parent.textContent || "").includes(
        "What should we build",
      );
      replaceNodeText(node, inPromptPhrase ? "" : "中构建什么？");
      return true;
    }
    return false;
  }

  function translateTextNode(node) {
    const parent = node.parentElement;
    if (!parent || isSkipped(parent)) return;
    if (translateBuildPrompt(node)) return;
    const next = translateString(node.nodeValue);
    if (next !== node.nodeValue) node.nodeValue = next;
  }

  function translateAttributes(element) {
    if (!element || !element.getAttribute) return;
    for (const name of ATTRS) {
      const value = element.getAttribute(name);
      if (!value || !/[A-Za-z]/.test(value)) continue;
      const next = translateString(value);
      if (next !== value) element.setAttribute(name, next);
    }
  }

  function walk(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    translateAttributes(root);
    if (root.matches && root.matches(SKIP)) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) translateTextNode(node);

    if (root.querySelectorAll) {
      for (const element of root.querySelectorAll("*")) translateAttributes(element);
    }
  }

  let scheduled = false;
  let started = false;

  function isT3CodePage() {
    const title = document.title || "";
    if (/\bT3 Code\b/i.test(title)) return true;
    if (
      document.querySelector(
        'meta[name="application-name"][content*="T3 Code" i], meta[property="og:title"][content*="T3 Code" i]',
      )
    ) {
      return true;
    }
    return Boolean(
      document.getElementById("boot-shell") &&
        document.querySelector('script[type="module"][src*="/assets/index-"]'),
    );
  }

  function detectVersion() {
    const script = document.querySelector(
      'script[type="module"][src*="/assets/index-"]',
    );
    if (!script || !script.src) return;
    fetch(script.src, { credentials: "same-origin" })
      .then((response) => (response.ok ? response.text() : ""))
      .then((text) => {
        if (!text) return;
        const versionLiteral = text.match(
          /let\s+[A-Za-z_$][\w$]*\s*=\s*`(\d+\.\d+\.\d+)`/,
        );
        const versionValue = text.match(
          /version\s*[:=]\s*[`'"]([0-9]+\.[0-9]+\.[0-9]+)/i,
        );
        const version = (versionLiteral && versionLiteral[1]) ||
          (versionValue && versionValue[1]) ||
          null;
        if (version) {
          document.documentElement.dataset.t3zhVersion = version;
          console.info(`[T3 Code 中文] detected web version ${version}`);
        }
      })
      .catch(() => {});
  }

  function translateAll() {
    scheduled = false;
    walk(document.body || document.documentElement);
    if (document.title) document.title = translateString(document.title);
  }
  function schedule() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(translateAll);
    }
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        translateTextNode(mutation.target);
      } else {
        for (const node of mutation.addedNodes) walk(node);
      }
    }
  });

  function start() {
    if (started) return;
    started = true;
    schedule();
    observer.observe(document.documentElement || document, {
      subtree: true,
      childList: true,
      characterData: true,
    });
    // React mounts after document_start; catch the first few render passes.
    let passes = 0;
    const timer = setInterval(() => {
      translateAll();
      if (++passes >= 8) clearInterval(timer);
    }, 600);
    detectVersion();
  }

  function boot() {
    if (isT3CodePage()) {
      start();
      return;
    }
    let attempts = 0;
    const timer = setInterval(() => {
      if (isT3CodePage()) {
        clearInterval(timer);
        start();
      } else if (++attempts >= 60) {
        clearInterval(timer);
      }
    }, 250);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
