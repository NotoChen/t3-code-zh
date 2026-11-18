const originEl = document.getElementById("origin");
const enableEl = document.getElementById("enable");
const statusEl = document.getElementById("status");
let currentTab = null;
let originPattern = null;

function setStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.style.color = isError ? "#dc2626" : "#64748b";
}

function hostPattern(url) {
  const u = new URL(url);
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  return `${u.protocol}//${u.hostname}/*`;
}

function scriptId(pattern) {
  const safe = pattern.replace(/[^a-zA-Z0-9_-]/g, "-").slice(-48);
  return `t3zh-${safe}`;
}

async function refresh() {
  [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!currentTab || !currentTab.url) {
    originEl.textContent = "无法读取当前页面";
    return;
  }
  const pattern = hostPattern(currentTab.url);
  originEl.textContent = pattern ? pattern.replace("/*", "") : currentTab.url;
  if (!pattern) {
    setStatus("当前页面不是 HTTP/HTTPS 页面，无法启用。", true);
    return;
  }
  originPattern = pattern;
  const granted = await chrome.permissions.contains({ origins: [pattern] });
  enableEl.disabled = false;
  enableEl.textContent = granted ? "重新应用汉化" : "启用当前站点汉化";
  setStatus(granted ? "此站点已授权，点击可重新应用。" : "首次使用需要授权此站点。");
}

enableEl.addEventListener("click", async () => {
  if (!currentTab || !originPattern) return;
  enableEl.disabled = true;
  try {
    const granted = await chrome.permissions.request({ origins: [originPattern] });
    if (!granted) {
      setStatus("未获得站点权限，无法启用。", true);
      enableEl.disabled = false;
      return;
    }
    const id = scriptId(originPattern);
    const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [id] });
    if (existing.length) {
      await chrome.scripting.unregisterContentScripts({ ids: [id] });
    }
    await chrome.scripting.registerContentScripts([{
      id,
      matches: [originPattern],
      js: ["translations.js", "content.js"],
      runAt: "document_start",
      allFrames: false,
    }]);
    await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      files: ["translations.js", "content.js"],
    });
    setStatus("已启用。刷新页面后会继续生效。");
    enableEl.textContent = "重新应用汉化";
  } catch (error) {
    setStatus(`启用失败：${error.message || error}`, true);
  } finally {
    enableEl.disabled = false;
  }
});

refresh();
