# Version History

A short product history of *A Little Adventure / Surprise Experience Builder*.
Meaningful product changes only — not a commit log.

The version lives in one place: `package.json` → `"version"`. The app reads it from
there at build time (shown in the home-screen footer). To release: bump it there,
add an entry here.

---

## v0.3.0 — Creator assist tools · Aug 10, 2026

Two additions that make the *creating* side easier, both born from product
discussions:

- **AI HELP on every writing field.**
  *Product idea (Akash):* help the creator use an external AI assistant without us
  paying for or integrating an AI API.
  *Implementation:* each field generates a ready-to-paste, context-aware prompt
  (occasion, recipient, the hidden surprise, current draft, tone + output rules) that
  the creator copies into ChatGPT/Claude/Gemini themselves. Teaser prompts instruct
  the AI not to spoil the surprise. No AI is ever called by the product.
- **Maps lookup on the location field.**
  *Product idea (Akash):* let the creator jump straight to Google Maps (app on
  mobile, site on desktop) to find the place and paste back a link.
  *Implementation:* a MAPS button opens Maps pre-searched with the typed text; a
  pasted Maps share link becomes the exact pin behind the recipient's OPEN MAP
  button, displayed as "Pinned location" instead of a raw URL.

## v0.2.0 — Surprise Experience Builder prototype · Aug 10, 2026

The pivot from one personal website to a reusable product exploration:
*a creator plans a surprise journey; the recipient gets a link and discovers it one
locked moment at a time.*

**Product direction (from our discussions):**

- Three occasions with genuinely different personalities: Birthday 🎂,
  Anniversary ❤️, Gift Hunt 🎁
- Templates as helpful starting points, not rigid forms — guidance, not restriction
- "Moments" as the unit of the journey; progressive discovery as the core mechanic
- Three reveal methods: creator-controlled key, clue/answer, scheduled time
- Creator effort minimized — creating must feel like telling, not configuring
- Creator preview of the exact recipient experience
- No backend, no accounts, no AI, no payments — local/demo state only

**Implementation decisions (engineering):**

- The share link *is* the experience: every moment AES-encrypted with its unlock
  code, the whole journey packed into the URL fragment — nothing readable in the
  link, no server needed
- Templates ship as complete, editable drafts with [bracket] placeholders
- One-page editor (no wizard); auto-generated key words; auto-save to localStorage
- One generic Player renders all occasions from config (labels, voice, celebration
  lines, color themes)
- Hash-based routing; the original birthday experience preserved untouched at
  `#/aug9`
- Three complete fictional demo experiences; hint chips in preview/demo modes
- Deploys via Netlify auto-build from GitHub pushes

Also in this line: `PRODUCT_EXPERIMENT_NOTES.md` — decisions, assumptions, open
questions, and what we deliberately did not build.

## v0.1.0 — The original Birthday Adventure · Aug 8–9, 2026

A personal, single-purpose surprise website for a real birthday date in Hyderabad —
used in the real world, successfully.

- Cinematic mobile-first journey: landing → intro → checkpoint timeline → finale
- Five locked checkpoints with mysterious teasers; destinations AES-encrypted, the
  unlock code being the decryption key (nothing discoverable in source, storage, or
  the network tab)
- Boyfriend-held unlock keys via a discreet key icon; playful wrong-code responses
- Celebration overlay after each completed checkpoint; staged suspense reveal for
  the finale; final birthday screen
- Monsoon touches: subtle rain animation, hidden rain-plan note
- Progress persisted across refreshes; hidden 7-tap reset
- Plum & champagne visual theme (after two earlier palettes)
- One real-world war story: a temporary `BIRTHDAY2026` emergency unlock code was
  hot-patched during the date itself, and removed after use 😌
