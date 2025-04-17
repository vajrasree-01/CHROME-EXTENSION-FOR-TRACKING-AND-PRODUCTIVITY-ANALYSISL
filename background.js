let activeTabId = null;
let activeDomain = null;
let startTime = null;

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await trackTime();
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    activeTabId = activeInfo.tabId;
    if (tab.url && tab.url.startsWith("http")) {
      activeDomain = new URL(tab.url).hostname;
      startTime = Date.now();
    } else {
      activeDomain = null;
    }
  } catch (error) {
    console.error("Failed to get tab URL:", error);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.status === "complete" && tab.url && tab.url.startsWith("http")) {
    activeDomain = new URL(tab.url).hostname;
  }
});

chrome.windows.onFocusChanged.addListener(async () => {
  await trackTime();
  activeDomain = null;
});

async function trackTime() {
  if (activeDomain && startTime) {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const existing = await chrome.storage.local.get([activeDomain]);
    const total = (existing[activeDomain] || 0) + duration;
    await chrome.storage.local.set({ [activeDomain]: total });
    console.log(`Tracked ${duration}s on ${activeDomain}`);
  }
}