const originEl = document.getElementById("origin");
const enableEl = document.getElementById("enable");
const enableAllEl = document.getElementById("enable-all");
const statusEl = document.getElementById("status");
let currentTab = null;
let originPattern = null;
const ALL_ORIGINS = ["http://*/*", "https://*/*"];
const ALL_SCRIPT_ID = "t3zh-all-sites";

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
  const allGranted = await chrome.permissions.contains({ origins: ALL_ORIGINS });
  enableAllEl.textContent = allGranted ? "重新应用所有站点" : "启用所有站点（自动识别 T3 Code）";
  setStatus(granted || allGranted ? "已授权，可将 T3 Code 页面加入翻译范围。" : "首次使用需要授权当前站点，或启用所有站点。");
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

enableAllEl.addEventListener("click", async () => {
  if (!currentTab) return;
  enableAllEl.disabled = true;
  try {
    const granted = await chrome.permissions.request({ origins: ALL_ORIGINS });
    if (!granted) {
      setStatus("未获得所有站点权限。", true);
      return;
    }
    const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [ALL_SCRIPT_ID] });
    if (existing.length) {
      await chrome.scripting.unregisterContentScripts({ ids: [ALL_SCRIPT_ID] });
    }
    await chrome.scripting.registerContentScripts([{
      id: ALL_SCRIPT_ID,
      matches: ALL_ORIGINS,
      js: ["translations.js", "content.js"],
      runAt: "document_start",
      allFrames: false,
    }]);
    await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      files: ["translations.js", "content.js"],
    });
    setStatus("已启用所有站点。只有 T3 Code 页面会实际翻译。");
    enableAllEl.textContent = "重新应用所有站点";
  } catch (error) {
    setStatus(`启用失败：${error.message || error}`, true);
  } finally {
    enableAllEl.disabled = false;
  }
});

refresh();
