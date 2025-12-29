# ChatGPT Token Counter Extension

A Chrome extension that monitors token usage in ChatGPT conversations and automatically offers to create summaries when reaching 350,000 tokens.

## Features

- **Real-time Token Tracking**: Displays a live counter showing current token usage
- **Visual Progress Bar**: Color-coded progress indicator (green → yellow → red)
- **Automatic Detection**: Monitors conversations and triggers at 350k tokens
- **Smart Summary**: Opens a new ChatGPT tab with a pre-filled summary prompt
- **Per-Conversation Tracking**: Tracks tokens separately for each conversation
- **Reset Options**: Clear counters when needed

## Installation

### Method 1: Load Unpacked Extension

1. **Download/Create Files**: Create a new folder called `chatgpt-token-counter` and add these files:

   - `manifest.json`
   - `content.js`
   - `background.js`
   - `styles.css`
   - `popup.html`
   - `popup.js`

2. **Create Icons** (optional but recommended):

   - Create three PNG icons: `icon16.png`, `icon48.png`, `icon128.png`
   - Or download free icons from sites like flaticon.com
   - Place them in the extension folder

3. **Load in Chrome**:

   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `chatgpt-token-counter` folder

4. **Done!** The extension is now active.

## Usage

1. **Visit ChatGPT**: Go to https://chatgpt.com or https://chat.openai.com
2. **Token Counter Appears**: You'll see a counter in the top-right corner
3. **Chat Normally**: The counter updates automatically as you chat
4. **At 350k Tokens**: A modal will appear asking if you want a summary
5. **Generate Summary**: Click "Yes, Summarize" to open a new tab with the summary prompt pre-filled

## Token Counter Display

The counter shows:

- Current token count
- Progress bar (color changes as you approach the limit)
- Target goal (350,000 tokens)

**Colors**:

- 🟢 Green: 0-49% (0-174,999 tokens)
- 🟡 Yellow: 50-79% (175,000-279,999 tokens)
- 🔴 Red: 80-100% (280,000+ tokens)

## Modal Options

When the 350k threshold is reached, you have three options:

1. **Yes, Summarize**: Opens new ChatGPT tab with summary prompt
2. **No, Thanks**: Dismisses the modal
3. **Reset Counter**: Clears the counter for this conversation

## Token Estimation

The extension estimates tokens using a simple rule: **~4 characters = 1 token**

This is an approximation. Actual token counts may vary slightly based on:

- Language used
- Special characters
- Code blocks
- Formatting

## Technical Details

- **Permissions**: Storage (for tracking), Tabs (for opening new tabs)
- **Monitoring**: Checks every 5 seconds + on DOM changes
- **Storage**: Uses Chrome's local storage per conversation
- **Compatibility**: Works on both chatgpt.com and chat.openai.com

## Troubleshooting

**Counter not showing?**

- Refresh the ChatGPT page
- Check if the extension is enabled at `chrome://extensions/`

**Summary not pasting?**

- The new tab may need a moment to fully load
- Try manually pasting if it doesn't auto-fill

**Want to reset everything?**

- Click the extension icon and use "Reset All Counters"

## Privacy

- All data is stored locally in your browser
- No data is sent to external servers
- Tracking is per-conversation and stored only on your device

## Notes

- Token counts are estimates and may not match OpenAI's exact counts
- The extension works best with standard text conversations
- Very large conversations may take a moment to analyze

---

Enjoy tracking your ChatGPT token usage! 🚀
