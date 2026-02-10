function isAllowedNow(windows) {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();

  return windows.some(({ start, end }) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    const s = sh * 60 + sm;
    const e = eh * 60 + em;

    // normal window
    if (s <= e) {
      return current >= s && current <= e;
    }

    // overnight window (e.g. 22:00 → 06:00)
    return current >= s || current <= e;
  });
}

function updateRules() {
  console.log("⏱ Updating rules...");

  chrome.storage.sync.get(null, (data) => {
    const addRules = [];
    const removeRuleIds = [];

    let ruleId = 1;

    for (const domain in data) {
      const windows = data[domain];
      const allowed = isAllowedNow(windows);

      console.log(`🌐 ${domain}`, windows, "allowed:", allowed);

      removeRuleIds.push(ruleId);

      if (!allowed) {
        addRules.push({
          id: ruleId,
          priority: 1,
          action: { type: "block" },
          condition: {
            urlFilter: domain,
            resourceTypes: ["main_frame"]
          }
        });
      }

      ruleId++;
    }

    chrome.declarativeNetRequest.updateDynamicRules(
      {
        removeRuleIds,
        addRules
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error("❌ Rule update failed", chrome.runtime.lastError);
        } else {
          console.log("✅ Active block rules:", addRules);
        }
      }
    );
  });
}

// Run on important events (MV3 friendly)
chrome.runtime.onInstalled.addListener(updateRules);
chrome.runtime.onStartup.addListener(updateRules);
chrome.tabs.onCreated.addListener(updateRules);
chrome.tabs.onUpdated.addListener(updateRules);
