# Content Studio — SPEC.md

## Overview

A web app that takes a draft post and adapts it into three platform-optimized versions: **Twitter/X (English)**, **Reddit (English)**, and **小红书 (Chinese)**. Each version gets a platform-fit score (1-10), improvement tips, and platform-specific metadata (小红书 gets title + search keywords, Reddit gets suggested subreddit + post title).

### Core Principle: Voice Preservation

**This is NOT a rewriting tool. It is an adaptation tool.** The system must strictly preserve the user's original word order, sentence structure, language style, and tone. Changes are limited to:
- Hook / title / opening line optimization for each platform's algorithm
- Platform-specific formatting (thread breaks for Twitter, paragraph structure for Reddit, emotional hooks for 小红书)
- Language translation where needed (English↔Chinese), keeping the same logical flow
- Removing or adding small connective phrases for platform fit
- **NEVER** polish prose, add filler adjectives, make sentences "smoother", use corporate/AI tone, or restructure the user's argument order

The user writes in short declarative sentences with natural spoken rhythm, sometimes code-switching between Chinese and English. The output must read like the user wrote it, not like an AI rewrote it.

The app also includes a persistent **Strategy Document** that the user edits over time (algorithm rules, reference bloggers, content positioning), and a **History** of all past generations.

**Target user:** A creator posting about AI, games, and tech across Twitter, Reddit, and 小红书.

**Stack:** Next.js (App Router) + Tailwind CSS + Anthropic Claude API + Vercel KV (or local JSON file for dev). Deploy on Vercel.

---

## Pages & Routes

Single-page app with three tabs. No auth needed (single-user tool).

```
/                → main app (Compose tab default)
/api/generate    → POST endpoint that calls Claude API
```

---

## Core Features

### 1. Compose Tab (default)

**Input:**
- Large textarea for the user's draft (supports Chinese + English mixed input)
- Character count display
- "Generate" button

**On Generate:**
- POST draft + current strategy doc to `/api/generate`
- Show loading state with animation
- Display results:

**Output — three cards (two-column grid on desktop, stack on mobile):**

**Twitter / X card:**
- Platform badge: "Twitter / X" with blue accent, "EN" tag
- Adapted English content (preserves line breaks, thread markers like [1/n])
- Score bar (1-10) with color coding (8+ green, 5-7 yellow, <5 red)
- Improvement tips
- Copy button (copies content to clipboard)

**Reddit card:**
- Platform badge: "Reddit" with orange accent, "EN" tag
- Suggested post title (compelling but not clickbait, fits subreddit norms)
- Suggested subreddit(s) (1-3, displayed as pills with r/ prefix)
- Adapted English content — longer form, conversational, reads like a real person's post. NO AI polish. Preserve raw voice, imperfect phrasing, personal anecdotes. Reddit users aggressively downvote anything that smells like AI or marketing.
- Score bar (1-10)
- Improvement tips
- Copy button (copies title + content)

**小红书 card:**
- Platform badge: "小红书" with red accent, "中文" tag
- Suggested title (under 20 chars, displayed prominently)
- Adapted Chinese content
- Search keyword tags (3-5, displayed as pills with # prefix)
- Score bar (1-10)
- Improvement tips
- Copy button (copies title + content)

**Analysis section (above the two cards):**
- Overall reasoning / analysis of the draft's dual-platform potential

### 2. Strategy Tab

- Full-page textarea (monospace font) for editing the strategy document
- Save button → persists to storage
- Success feedback on save
- Helper text: "编辑算法规则、参考博主、内容策略。改动持久保存，影响所有后续生成。"

**Default strategy document content (pre-populated on first use):**

```markdown
# 平台策略文档

---

## Twitter / X

### 算法机制（2026最新）
- For You feed 用 AI（部分 Grok 驱动）从上千候选帖里预测每个用户的 engagement 概率，然后排序推送
- 早期互动决定一切：发帖后 30 分钟内 replies、reposts、bookmarks 权重极高，replies 能达到 likes 的 10-150 倍不等
- 富媒体大加分：原生短视频（<2分钟、高完播率）最猛，经常 10 倍 engagement；图片/GIF/轮播图其次；纯文本最弱（除非文字极强 hook）
- 一致性很重要：算法偏好"活跃信号"，隔两天不发 momentum 会掉，推送范围缩小。但不是永久惩罚，恢复发帖就能回血
- 外部链接重罚：带外链（尤其是非 Premium 账号）reach 掉 50-90%
- Premium 账号有小 boost；作者信誉（粉丝多、历史互动好越容易被推）；内容相关性（follower 爱看什么，就更容易扩散到"感兴趣但没 follow"的人）
- 一句话：算法不是看"内容好不好"，而是看"用户会不会停下来互动、看完、存下来"

### 内容策略
- 别纯发"方法论"，把它包装成小产品/小 demo。例："我用这个方法 2 小时做了个 AI 邮件分类工具（附 CLI + GitHub）"，配 15-60 秒屏幕录制视频 + 截图
- 发布节奏：每周 3-5 帖（质量 > 数量），隔 1-2 天发一条
- 发帖前加 hook（问题/痛点/惊人结果）+ CTA（"试过的朋友说说效果？""需要我录视频 demo 吗？"）
- 回复每一条评论（把单帖 reach 再放大）
- 格式优先级：①短原生视频/屏幕录制（demo最强）②图片轮播+详细文字 ③偶尔直播coding ④避开纯长文字或外链
- 英文为主，可中英混合
- 标题/开头：观点先行，默认读者有上下文

### 参考博主
- guoyu：产品demo+工具博主人设，vibe lab系列，实时互动
-（在这里继续添加）

---

## Reddit

### 算法机制
- 内容发现完全靠 upvote/downvote，社区自治
- 新帖有短暂窗口期（~1小时），早期 upvote 速度决定能否进入 hot/rising
- 每个 subreddit 是独立生态，规则和文化差异巨大，发之前必须了解社区氛围
- Reddit 用户对 AI 生成内容极度敏感，任何 AI 味都会被 downvote 到底
- 自我推广有严格比例限制（大部分 sub 要求 90% 非自我推广内容）
- 评论区参与度影响帖子排名，作者积极回复能持续推帖子上升

### 内容策略
- 保持 raw、honest、imperfect 的表达，像在跟社区里的人聊天
- 标题要具体、有信息量，避免 clickbait（Reddit 社区会惩罚标题党）
- 长帖比短帖表现好，但要有实质内容而非填充
- 开头不要自我介绍，直接进入话题
- 分享经验和过程，不是宣传结果
- 适合的 subreddit：r/gamedev, r/indiegaming, r/aigamedev, r/machinelearning, r/singularity
- 问一个真诚的问题结尾，邀请讨论

### 参考博主
（在这里添加你觉得 Reddit 上写得好的人）

---

## 小红书

### 算法机制
- 内容分发：先推给几百个陌生人，根据 CTR/完读率/互动率决定是否继续推
- 奖励"让完全不认识你的人想点进来"
- 搜索流量占比高（~48%），埋搜索关键词非常重要
- 封面点击率是第一道门槛，决定初始流量池能否扩大
- 评论区权重很高，回复评论能显著提升二次分发
- 连续几条表现平平会拉低账号权重，质量 > 数量
- 发布后前 2 小时是黄金窗口，积极回复评论

### 内容策略
- 科技帖思路：用大众能理解的场景/比喻包装技术内容，"圈外能感知到的场景或情绪"
- 标题：信息差或情绪钩子前置，前两行要抓人，20字以内
- 中文，口语化，有画面感
- 每周 3-4 条，集中精力在标题打磨和选题上
- 保证 1-2 条有大众话题入口的帖子（破圈用），其余可以是圈内向
- 封面用有视觉冲击力的图片+大字标题，避免纯代码截图
- 发布前在搜索框看联想词，选择性融入标题和正文

### 参考博主
（在这里添加你喜欢的小红书博主风格笔记）

---

## 我的内容定位
- 核心身份：独立游戏开发者 + VC分析师 + AI实践者
- 护城河：技术深度 + 行业视角 + 实际产品经验
- 跨平台核心素材：产品demo、开发故事、AI×日常生活的交叉话题
- 避免：纯术语堆砌、没有情绪入口的技术文档风格

## 我的写作风格（所有平台必须保留）
- 短句为主，口语节奏，不用em-dash
- 中英混合code-switch是正常的，不要"修正"
- 不要加"值得注意的是""需要指出的是"之类的AI连接词
- 不要把我的观点变得更"平衡"或更"全面"，保持锐度
- 翻译时保持同样的逻辑顺序和句子密度

## 参考风格（通用）
（在这里添加跨平台的风格参考）
```

### 3. History Tab

- List of all past generations, newest first (max 100)
- Each entry shows: truncated draft (first 80 chars), date, Twitter score, Reddit score, 小红书 score
- Click any entry → loads the full draft + results back into Compose tab
- "Clear All" button with confirmation

---

## API Route: `/api/generate`

### Request
```json
POST /api/generate
{
  "draft": "user's raw draft text",
  "strategy": "current strategy document content"
}
```

### Implementation
- Call Anthropic Messages API with `claude-sonnet-4-20250514`
- System prompt includes the strategy document
- Request the model to respond in **strict JSON only** (no markdown fences)
- Parse response, handle JSON parse errors gracefully (retry once if malformed)
- Return parsed result to client

### System Prompt

```
You are a content adaptation assistant for a game developer / VC analyst who posts about AI, indie games, and tech.

CRITICAL RULE — VOICE PRESERVATION:
You are NOT rewriting. You are ADAPTING. The user's voice is sacred.
- KEEP the user's original word order, sentence structure, and argument flow
- KEEP short declarative sentences, spoken rhythm, imperfect phrasing
- KEEP code-switching between Chinese and English where it exists
- NEVER add filler words, smoothing phrases, corporate tone, or AI-sounding polish
- NEVER restructure paragraphs or reorder the user's points
- ONLY change: hook/title/opening for platform algorithm, formatting for platform norms, language translation (EN↔CN) preserving the same logical flow, and minor connective edits
- The output must read like the USER wrote it natively for that platform, not like an AI cleaned it up

STRATEGY DOCUMENT (user's current platform rules & preferences):
{strategy}

Your job: Given a draft, produce THREE adapted versions:

1. Twitter/X — ENGLISH. Sharp, opinionated, high info-density. Keep the user's voice and observations intact. Can be a single tweet or short thread ([1/n] format). No hashtags unless very relevant. Don't soften or hedge the user's takes.

2. Reddit — ENGLISH. Longer form, conversational, reads like a real human post. This is the most important platform to NOT sound like AI. Keep raw voice, personal anecdotes, casual phrasing. Reddit users aggressively downvote anything that smells like AI or self-promotion. Frame as sharing experience / asking for discussion, not announcing or marketing. Suggest 1-3 relevant subreddits.

3. 小红书 — CHINESE. Start with a scene, question, or emotional hook that anyone can understand. Then layer in the substance following the user's original argument order. Include 3-5 search keywords naturally. End with a question or CTA for comments. Conversational tone, like explaining to a smart non-tech friend.

Score each version 1-10 for platform fit. Tips should be specific and actionable.

Respond with VALID JSON ONLY. No markdown fences. No preamble.

{
  "twitter": {
    "content": "adapted twitter text",
    "score": 8,
    "tips": "specific tips in Chinese"
  },
  "reddit": {
    "content": "adapted reddit post body",
    "score": 7,
    "title": "suggested post title",
    "subreddits": ["gamedev", "indiegaming"],
    "tips": "specific tips in Chinese"
  },
  "xiaohongshu": {
    "content": "adapted xiaohongshu text",
    "score": 7,
    "title": "suggested title under 20 chars",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "tips": "specific tips in Chinese"
  },
  "reasoning": "overall analysis in Chinese"
}
```

### Error Handling
- If JSON parse fails on first attempt: retry the API call once
- If still fails: return error message to client
- Client displays error in red banner with "请重试"
- Timeout: 30 seconds

---

## Data Persistence

Use **Vercel KV** (Redis) for production, fallback to local JSON file for dev.

**Keys:**
- `strategy` → string (the strategy document markdown)
- `history` → JSON array of generation entries

**History entry schema:**
```typescript
interface HistoryEntry {
  id: string;           // timestamp-based ID
  date: string;         // ISO 8601
  draft: string;        // full draft text
  draftPreview: string; // first 80 chars + "…"
  twitterScore: number;
  redditScore: number;
  xhsScore: number;
  result: GenerationResult; // full API response
}
```

**Alternative:** If Vercel KV feels heavy for a single-user tool, use a simple JSON file on disk (`data/strategy.json`, `data/history.json`) with fs read/write in API routes. This works fine on Vercel with serverless functions if the data directory is in `/tmp/` or you use Vercel Blob instead.

---

## Design System

### Aesthetic Direction
Dark, minimal, editorial. Think: developer tool meets content studio. No generic AI aesthetics.

### Colors
```
Background:       #0C0B0E
Surface:          #16151A
Border:           #2A2930
Border focus:     #5B4FE8
Text:             #E8E6EF
Text muted:       #8A8895
Accent:           #5B4FE8
Twitter blue:     #1D9BF0
Twitter bg tint:  rgba(29,155,240,0.08)
Reddit orange:    #FF4500
Reddit bg tint:   rgba(255,69,0,0.08)
XHS red:          #FF2442
XHS bg tint:      rgba(255,36,66,0.08)
Score green:      #34D399
Score yellow:     #FBBF24
Score red:        #F87171
```

### Typography
- Display/headings: `EB Garamond` (with `Noto Serif SC` for Chinese fallback)
- Body: `DM Sans` (with `Noto Sans SC` for Chinese fallback)
- Code/labels: `JetBrains Mono`
- Load via Google Fonts

### Components
- Tabs: underline style, accent color for active
- Buttons: primary (accent bg, white text), secondary (transparent, border)
- Cards: dark surface, left border accent (blue for Twitter, orange for Reddit, red for XHS)
- Score bars: thin (4px) progress bars with color coding
- Tags/pills: small rounded, platform-tinted background
- Textarea: dark surface, subtle border, accent border on focus
- Labels: monospace, uppercase, small, muted color

### Responsive
- Three cards in single-column stack (each full width) — content is long-form, side-by-side doesn't work well
- Textarea full-width always

---

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...
```

Only one env var needed. The API key is used server-side only in `/api/generate`.

---

## File Structure

```
content-studio/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # main app with tabs
│   ├── globals.css           # Tailwind + custom vars
│   └── api/
│       └── generate/
│           └── route.ts      # Claude API endpoint
├── components/
│   ├── ComposeTab.tsx
│   ├── StrategyTab.tsx
│   ├── HistoryTab.tsx
│   ├── ResultCard.tsx
│   ├── ScoreBar.tsx
│   └── LoadingPulse.tsx
├── lib/
│   ├── storage.ts            # KV or file-based persistence
│   ├── prompts.ts            # system prompt builder
│   └── types.ts              # TypeScript interfaces
├── data/
│   └── default-strategy.md   # default strategy doc content
├── tailwind.config.ts
├── package.json
└── .env.local
```

---

## Implementation Notes

### JSON Parsing Robustness
The Claude API sometimes returns JSON with trailing text or markdown fences. The parse function should:
1. Strip leading/trailing whitespace
2. Remove ```json and ``` fences if present
3. Try JSON.parse
4. If fail: try to extract JSON object with regex `/\{[\s\S]*\}/`
5. If still fail: retry API call once with "Respond with valid JSON only, no other text" appended

### Copy Button Behavior
- Twitter: copies content only
- Reddit: copies title + newline + newline + content
- 小红书: copies title + newline + newline + content
- Show "✓ copied" for 1.5 seconds then revert

### Loading State
- Disable Generate button
- Show animated dots with "Adapting for three platforms..." text
- Timeout after 30s with error message

### Strategy Document
- Loaded on app init from storage
- If not found in storage, use default
- Injected into every API call's system prompt
- Saved manually (not auto-save, to avoid accidental changes)

---

## Future Enhancements (not in v1)

- Draft scheduling / calendar view
- A/B testing: generate multiple variants and compare scores
- Import actual 小红书 analytics data to refine strategy
- Twitter thread preview with proper formatting
- Reddit post preview with markdown rendering
- Reference blogger content analysis (paste a URL, extract style patterns)
- Voice calibration: paste 5-10 of your past posts, system extracts your style fingerprint automatically
