# ApplyTrack Chrome Extension

Saves job applications to your ApplyTrack dashboard while you apply on job sites.

## Setup

1. **Install dependencies and build**
   ```bash
   cd extension
   pnpm install
   pnpm run build
   ```

2. **Load in Chrome**
   - Open `chrome://extensions`
   - Turn on **Developer mode**
   - Click **Load unpacked**
   - Select the `extension` folder (the one containing `manifest.json` and `dist/`)

3. **Configure**
   - Click the extension icon and set **API URL** (e.g. `http://localhost:3001`) and **Dashboard URL** (e.g. `http://localhost:5173`)
   - Click **Save**

## Behavior

- On supported job sites (LinkedIn, Indeed, Greenhouse, Lever, Workday), a prompt appears: **"You're applying here. Save to ApplyTrack?"**
- **Yes** → scrapes job details (company, role, URL, location, salary when available) and POSTs to ApplyTrack `POST /api/applications`
- **No** → dismisses the prompt (won’t show again for that page for 1 hour)
- **Popup** → Open dashboard, or change API / Dashboard URL

## Development

- Edit files in `src/`. Run `pnpm run build` after changes (or `pnpm run dev` for watch mode), then click **Reload** on the extension card in `chrome://extensions`.
- The content script is bundled into a single file (`dist/content.js`) to avoid module loading errors on job sites.
