// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openSummaryTab") {
    // Open new ChatGPT tab
    chrome.tabs.create(
      {
        url: "https://chatgpt.com/",
      },
      (tab) => {
        // Wait for tab to load, then inject the summary
        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
          if (tabId === tab.id && info.status === "complete") {
            chrome.tabs.onUpdated.removeListener(listener);

            // Wait a bit more for ChatGPT to fully load
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id, {
                action: "pasteSummary",
                text: request.summary,
              });
            }, 2000);
          }
        });
      }
    );
  } else if (request.action === "pasteSummary") {
    // Find and fill the textarea
    const textarea = document.querySelector(
      'textarea[placeholder*="Message"], textarea#prompt-textarea'
    );
    if (textarea) {
      textarea.value = request.text;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
      textarea.focus();
    }
  }

  return true;
});
