# AI PM Daily — Build Session Log

**Date**: March 29-30, 2026
**Updated**: April 4, 2026
**Builder**: Shaily Garg + Claude Opus 4.6
**Project**: AI PM Daily — 5-Minute Daily AI Learning App for Product Managers

---

## Session Timeline

### 1. PRD Review
- Read `AI_PM_Daily_PRD_v1.docx` from Downloads folder
- PRD defined a mobile-first PWA for PMs transitioning into AI-native roles
- 7-day curriculum covering: AI Agents, LLMs, RAG/Fine-Tuning/Prompting, AI Metrics, AI Safety, Multimodal AI, AI-Native PM Playbook
- Each day: 5 briefing bullets with real-world analogies + 5 quiz questions + YouTube learning links for wrong answers
- Audio-first (Web Speech API TTS), editorial design (Newsreader + Source Sans 3 + JetBrains Mono)

### 2. Project Scaffolding
- Created `/Users/shailygarg/ai-pm-daily/` using `npm create vite@latest` with React template
- Downgraded from Vite 8 to Vite 5 due to Node.js 20.18.0 compatibility (Vite 8 requires 20.19+)
- Installed dependencies

### 3. Content Creation (data.js)
- Wrote all 7 days of curriculum content:
  - 5 briefing items per day (text + real-world example)
  - 5 quiz questions per day with 4 options each
  - YouTube search learning links for each wrong answer
- Initial issue: all quiz answers were option B (index 1) — fixed in v2

### 4. App Component Build (App.jsx)
**v1 — Core Features:**
- `useTTS()` custom hook for Web Speech API text-to-speech
- 4 views: Home, Briefing, Quiz, Results
- Home screen: stats bar (streak, avg score, completion), 7 day cards, Phase 2 teaser
- Briefing view: 5 bullet cards with per-bullet audio + "Listen to Full Briefing"
- Quiz view: progress bar, 4-option multiple choice, instant green/red feedback
- Results view: score hero, "Review & Learn" with YouTube links, collapsible "Nailed It"
- Inline styles with CSS-in-JS per PRD spec
- Animations: fadeUp with stagger delays

**v2 — Major Enhancements (user feedback round):**
- **Quiz answer diversification**: Spread correct answers across A, B, C, D positions
- **AI Knowledge Level Selector (1-10)**: Onboarding screen with slider, adjustable from home
  - Levels 1-3: beginner content (simple analogies)
  - Levels 4-6: intermediate (practical examples + tool references)
  - Levels 7-10: expert (technical architecture, code patterns)
  - Tier badges on each briefing card (Beginner/Intermediate/Expert)
- **Hot Tools Section**: 10 trending AI tools with descriptions, "Why it matters for PMs", hands-on assignments, and direct links
  - Claude Code, Cursor, v0, OpenHands, Bolt.new, Perplexity, Replit Agent, NotebookLM, Windsurf, Lovable
  - Tools mapped to relevant days (e.g., agent tools on Day 1)
- **Tool Knowledge in Quizzes**: 5th question on each day tests tool knowledge (blue badge)
- **Improved TTS**: Sentence-by-sentence delivery, 200ms inter-sentence pauses, 600ms inter-bullet pauses, rate 1.0x, expanded voice priority list
- **Adaptive content**: `advancedText` and `advancedExample` fields per briefing item, selected based on level
- **localStorage persistence**: Scores, level, onboarding state, round number survive refresh
- **Completion rounds**: After finishing all 7 days, "Level Up & Replay" auto-bumps level +2 and resets scores

### 5. PWA Configuration
- `manifest.json` with standalone display mode, portrait orientation
- Apple meta tags: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`
- Generated PNG icons (192px, 512px, 180px apple-touch-icon)
- Custom favicon.svg (indigo rounded rect with "AI")

### 6. Deployment
- Initialized git repo
- Created GitHub repo: `shailygarg1992/ai-pm-daily` (public)
- Deployed to Vercel production: **https://ai-pm-daily.vercel.app**
- Connected GitHub for auto-deploy on push

### 7. Live AI Content — Daily Pulse (Session 2)
- **Vercel Serverless Function** (`/api/daily-pulse.js`): two-step AI pipeline
  - Step 1: Perplexity (`perplexity/sonar-pro`) searches latest 48h AI news
  - Step 2: Claude (`anthropic/claude-sonnet-4.5`) structures into JSON (5 briefing items, 3 quiz questions, tool spotlight)
- **AI Gateway + OIDC**: Vercel-managed authentication via `VERCEL_OIDC_TOKEN` — no manual API keys
- **Cron Job**: `vercel.json` schedule runs `/api/daily-pulse` daily at 6 AM UTC
- **Caching**: 12h in-memory server cache + `Cache-Control: s-maxage=43200` + client-side localStorage cache
- **DailyPulse component** on Home screen: expandable card with LIVE badge, mini quiz, tool spotlight

### 8. Daily Pulse Enhancements (Session 2 continued)
- **Audio Listening**: "Listen to Pulse" button using `useTTS()` hook — reads all 5 briefing titles + summaries + PM takeaways with sentence-level pausing
- **Bulleted Layout**: Reformatted from paragraph blocks to structured bullets:
  - Main bullet: headline title
  - Sub-bullet (open circle): summary text
  - Sub-bullet (target icon): PM takeaway in amber highlight
- **Active Item Highlighting**: Currently-playing TTS item gets subtle background highlight
- **Quick Takeaways Section**: Numbered summary at the bottom listing all 5 PM takeaways in a compact amber card
- **localStorage vs Supabase evaluation**: Analyzed tradeoffs; staying with localStorage for MVP simplicity

### 9. Interactive Learning Features (Session 3 — March 31, 2026)
- **"More Details" button** on each briefing card:
  - Expands a deep-dive panel showing the alternate tier content (beginner sees expert view, expert sees simple explanation)
  - Includes a "Watch a Short Video" YouTube link for the topic
  - `DAY_VIDEOS` mapping added to `data.js` with curated search queries per day
- **"Ask an Agent" button** on each briefing card:
  - Opens full-screen iMessage/WhatsApp-style chat overlay (`AgentChatPanel` component)
  - Powered by Claude via new `/api/ask-agent.js` serverless function through AI Gateway
  - Agent is context-aware: receives current topic, all 5 lesson points, and user's knowledge level
  - Responses tailored to tier (beginner gets analogies, expert gets architecture details)
  - Chat bubbles with user messages right-aligned (colored) and agent messages left-aligned (gray)
  - Typing indicator ("Thinking...") during API calls
  - Full mobile keyboard support with Enter-to-send

### 10. Podcast-Style Audio Research (Session 4 — April 1, 2026)
- Researched options to upgrade from Web Speech API to podcast-style audio:
  - **OpenAI gpt-4o-mini-tts**: Best cost (~$0.015/min), prompt-steerable voices, 13 voices for 2-host format
  - **Google NotebookLM Podcast API**: Best quality, turnkey 2-host generation, but requires GCP enterprise allowlist
  - **ElevenLabs**: Best voice quality (~$0.10-0.17/min), Projects API for multi-speaker
  - **Google Cloud TTS**: Best free tier (4M chars/month), native multi-speaker SSML
  - **Wondercraft**: Purpose-built podcast API with "Convo Mode"
- **Recommended approach**: Two-stage pipeline — Claude generates 2-host conversational script, OpenAI TTS renders with alternating voices, cached in Vercel Blob
- **Estimated cost**: ~$0.05/briefing (~$1.50/month) — not yet implemented

### 11. GitHub Username Migration (Session 4 — April 1, 2026)
- User changed GitHub username from `shailygarg1992-svg` to `shailygarg1992`
- Updated git remote URL
- Updated all references in SESSION_LOG.md and SESSION_SUMMARY.md
- Verified push works with new URL
- Vercel auto-deploy unaffected (uses repo ID, not username)

### 12. Commits & Deploys
- Six commits pushed total:
  1. Initial release with all core features
  2. localStorage persistence, level-based content, completion rounds, hot tools
  3. Live AI Daily Pulse with AI Gateway + Perplexity + Claude pipeline
  4. Audio, bulleted layout, and quick takeaways for Daily Pulse
  5. "More Details" + "Ask an Agent" interactive features per briefing section
  6. GitHub username migration (shailygarg1992-svg → shailygarg1992)

---

## Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Framework | Vite + React (SPA) | PRD specified, minimal deps, fast build |
| Vite version | v5 (not v8) | Node.js 20.18.0 compat |
| Styling | Inline styles + CSS-in-JS | Single-file architecture per PRD |
| Audio | Web Speech API | Zero deps, browser-native, works offline |
| State | React useState + localStorage | No backend needed for MVP |
| Fonts | Google Fonts CDN | Newsreader, Source Sans 3, JetBrains Mono |
| Hosting | Vercel | Auto-deploy from GitHub, free tier, PWA support |
| Content (curriculum) | Static JS constants | No API calls, instant load, works offline |
| Content (Daily Pulse) | AI Gateway (Perplexity + Claude) | Live AI news, updated daily via cron |
| AI Auth | Vercel OIDC | Auto-provisioned, no manual API keys |
| Caching | In-memory + CDN + localStorage | 12h server cache, CDN s-maxage, client cache |
| AI Chat Agent | Claude via AI Gateway | Context-aware tutor for in-app Q&A |

## Files Modified

```
ai-pm-daily/
├── index.html          — Meta tags, PWA config, title
├── vercel.json         — Cron job config (daily 6 AM UTC)
├── api/
│   ├── daily-pulse.js  — Serverless function: Perplexity → Claude → structured JSON
│   └── ask-agent.js    — Serverless function: AI tutor chat via Claude
├── public/
│   ├── manifest.json   — PWA manifest
│   ├── favicon.svg     — Custom icon
│   ├── icon-192.png    — PWA icon
│   ├── icon-512.png    — PWA icon
│   └── apple-touch-icon.png
├── src/
│   ├── main.jsx        — Entry point (removed CSS import)
│   ├── App.jsx         — All components (Home, Briefing, Quiz, Results, Onboarding, HotTools, DailyPulse, AgentChat)
│   └── data.js         — 7 days curriculum + 10 hot tools + tool-day mapping + video queries
├── SESSION_LOG.md      — This file
├── SESSION_SUMMARY.md  — High-level summary
└── package.json
```

## Known Limitations / Future Work
- Web Speech API TTS is robotic — recommended: OpenAI gpt-4o-mini-tts two-stage pipeline (~$0.015/min) for podcast-style audio
- No backend / user accounts — state is device-local only (localStorage)
- Consider Supabase migration for cross-device sync, user accounts, analytics
- Phase 2 (Interview Prep) content not yet built
- No spaced repetition algorithm — future Phase 3
- YouTube learning links are search URLs, not curated video links
- AI Gateway costs ~$0.03-0.05/pulse generation + ~$0.01-0.02/agent chat — monitor via Vercel dashboard
- Daily Pulse and Ask an Agent require AI Gateway to be active on Vercel project
- Podcast-style audio pipeline researched but not yet implemented
