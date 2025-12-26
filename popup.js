document.getElementById("reset-all").addEventListener("click", () => {
  if (
    confirm("Are you sure you want to reset all conversation token counters?")
  ) {
    chrome.storage.local.clear(() => {
      alert("All token counters have been reset!");
    });
  }
});
