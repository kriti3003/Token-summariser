// Simple token estimation: ~4 characters per token
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// Extract conversation ID from URL
function getConversationId() {
  const match = window.location.pathname.match(/\/c\/([a-zA-Z0-9-]+)/);
  return match ? match[1] : "default";
}

// Get all conversation text
function getConversationText() {
  const messages = [];
  const messageElements = document.querySelectorAll(
    "[data-message-author-role]"
  );

  messageElements.forEach((el) => {
    const role = el.getAttribute("data-message-author-role");
    const textContent = el.innerText || el.textContent;
    if (textContent) {
      messages.push({
        role: role,
        content: textContent.trim(),
      });
    }
  });

  return messages;
}

// Calculate total tokens
function calculateTotalTokens(messages) {
  return messages.reduce((sum, msg) => sum + estimateTokens(msg.content), 0);
}

// Create summary prompt
function createSummaryPrompt(messages) {
  let conversationText = messages
    .map((msg) => {
      const speaker = msg.role === "user" ? "User" : "Assistant";
      return `${speaker}: ${msg.content}`;
    })
    .join("\n\n");

  return `Please provide a comprehensive summary of the following conversation that reached 200,000 tokens:\n\n${conversationText}\n\nProvide a detailed summary covering:\n1. Main topics discussed\n2. Key questions asked\n3. Important answers and solutions provided\n4. Any action items or conclusions\n\nSummary:`;
}

// Show modal popup
function showSummaryModal(tokenCount, messages) {
  // Remove existing modal if any
  const existing = document.getElementById("token-counter-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "token-counter-modal";
  modal.innerHTML = `
    <div class="token-modal-overlay">
      <div class="token-modal-content">
        <h2>🎯 Token Limit Reached!</h2>
        <p>This conversation has reached <strong>${tokenCount.toLocaleString()}</strong> tokens.</p>
        <p>Would you like to generate a summary in a new ChatGPT tab?</p>
        <div class="token-modal-buttons">
          <button id="token-summary-yes" class="token-btn token-btn-primary">Yes, Summarize</button>
          <button id="token-summary-no" class="token-btn token-btn-secondary">No, Thanks</button>
          <button id="token-summary-reset" class="token-btn token-btn-tertiary">Reset Counter</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Handle button clicks
  document.getElementById("token-summary-yes").addEventListener("click", () => {
    const summary = createSummaryPrompt(messages);
    chrome.runtime.sendMessage({
      action: "openSummaryTab",
      summary: summary,
    });
    modal.remove();
  });

  document.getElementById("token-summary-no").addEventListener("click", () => {
    modal.remove();
  });

  document
    .getElementById("token-summary-reset")
    .addEventListener("click", () => {
      const convId = getConversationId();
      chrome.storage.local.set({
        [`conversation_${convId}`]: {
          tokens: 0,
          prompted: false,
          lastCheck: Date.now(),
        },
      });
      updateTokenDisplay(0);
      modal.remove();
    });
}

// Create and update token counter display
function updateTokenDisplay(tokens) {
  let display = document.getElementById("token-counter-display");

  if (!display) {
    display = document.createElement("div");
    display.id = "token-counter-display";
    document.body.appendChild(display);
  }

  const percentage = (tokens / 200000) * 100;
  const color =
    percentage < 50 ? "#10a37f" : percentage < 80 ? "#f59e0b" : "#ef4444";

  display.innerHTML = `
    <div class="token-counter-content">
      <div class="token-counter-label">Tokens</div>
      <div class="token-counter-value">${tokens.toLocaleString()}</div>
      <div class="token-counter-bar">
        <div class="token-counter-progress" style="width: ${Math.min(
          percentage,
          100
        )}%; background-color: ${color};"></div>
      </div>
      <div class="token-counter-target">Target: 200,000</div>
    </div>
  `;
}

// Main monitoring function
async function monitorTokens() {
  try {
    const convId = getConversationId();
    const messages = getConversationText();

    // Skip if no messages yet
    if (messages.length === 0) {
      return;
    }

    const totalTokens = calculateTotalTokens(messages);

    updateTokenDisplay(totalTokens);

    // Get stored data
    const result = await chrome.storage.local.get([`conversation_${convId}`]);
    const convData = result[`conversation_${convId}`] || {
      tokens: 0,
      prompted: false,
    };

    // Check if we've reached threshold and haven't prompted yet
    if (totalTokens >= 200000 && !convData.prompted) {
      showSummaryModal(totalTokens, messages);

      // Mark as prompted
      chrome.storage.local.set({
        [`conversation_${convId}`]: {
          tokens: totalTokens,
          prompted: true,
          lastCheck: Date.now(),
        },
      });
    } else {
      // Update stored token count
      chrome.storage.local.set({
        [`conversation_${convId}`]: {
          tokens: totalTokens,
          prompted: convData.prompted,
          lastCheck: Date.now(),
        },
      });
    }
  } catch (error) {
    console.error("Error in monitorTokens:", error);
  }
}

// Initialize
let observer;
let monitorTimeout;

// Debounced monitoring to prevent performance issues
function debouncedMonitor() {
  if (monitorTimeout) {
    clearTimeout(monitorTimeout);
  }
  monitorTimeout = setTimeout(() => {
    try {
      monitorTokens();
    } catch (error) {
      console.error("Token monitoring error:", error);
    }
  }, 1000); // Wait 1 second after last change
}

function init() {
  try {
    // Initial check after page loads
    setTimeout(() => {
      monitorTokens();
    }, 2000);

    // Watch for new messages with debouncing
    observer = new MutationObserver(debouncedMonitor);

    // Only observe the main content area, not entire body
    const targetNode = document.querySelector("main") || document.body;
    observer.observe(targetNode, {
      childList: true,
      subtree: true,
    });

    // Periodic check every 10 seconds (less aggressive)
    setInterval(() => {
      try {
        monitorTokens();
      } catch (error) {
        console.error("Token monitoring error:", error);
      }
    }, 10000);
  } catch (error) {
    console.error("Extension initialization error:", error);
  }
}

// Start when page is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  setTimeout(init, 1000);
}
