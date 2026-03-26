# Content Studio

Adapt your draft posts for three platforms at once: **Twitter/X**, **Reddit**, and **小红书**. AI edits are capped at 20% of your draft — enough to fit each platform, not enough to lose your voice.

## Features

- Write once, adapt to three platforms with a single click
- Preserves your voice — this is an adaptation tool, not a rewriting tool
- AI changes strictly capped at ≤20%, keeping your authenticity intact
- Platform-fit scores (1-10) with color-coded progress bars
- Persistent strategy document you can edit to tune every generation
- Full history of past generations, click any entry to reload it

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Open `.env.local` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get your API key from [console.anthropic.com](https://console.anthropic.com).

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

### Compose Tab (default)
- Paste or write your draft in the textarea
- Click **Generate** to adapt it for all three platforms
- Review the Twitter, Reddit, and 小红书 cards
- Click **Copy** on any card to copy the adapted content

### Strategy Tab
- Edit algorithm rules, reference bloggers, and content strategy
- Click **Save** to persist changes — all future generations will use the updated strategy
- Strategy is pre-populated with a sensible default on first run

### History Tab
- Browse all past generations (newest first, max 100)
- Click any entry to reload the draft and results into the Compose tab
- **Clear All** to wipe history

## Storage

The app stores strategy and history as JSON files in `/tmp/content-studio/` (created automatically). Data persists across dev server restarts but not across machine reboots (since `/tmp` is cleared on reboot). For production use, consider pointing storage to a persistent directory or Vercel KV.

## Stack

- Next.js 15 (App Router)
- Tailwind CSS 3
- Anthropic Claude API (`claude-sonnet-4-5-20251001`)
- File-based JSON persistence via Node.js `fs`
