# Product Experiment Notes — Surprise Experience Builder

*Prototype built on top of the real Aug 9 birthday adventure. This doc records what we
decided, what we assumed, and what we need real people to tell us.*

---

## What this prototype is

One sentence: **you plan a surprise journey; the other person gets a link and discovers
it one locked moment at a time.**

- **Creator:** pick an occasion → get a fully-written starter journey → rewrite the parts
  you care about → preview it → share one link.
- **Recipient:** open the link → cinematic intro → a timeline of locked moments → each
  one opens by a secret key (creator-controlled), a clue they solve, or a timer.

---

## Decisions made (and why)

**1. The link IS the product — no backend.**
The whole experience is sealed (AES-encrypted per moment) and packed into the share URL.
No accounts, no server, no database. A recipient cannot cheat by reading the link or the
page source — the same protection the real birthday site had. This was the single
highest-leverage decision: it makes the prototype shareable with real people *today*.

**2. Templates are finished drafts, not empty forms.**
Choosing an occasion gives you a complete journey with real structure and real writing —
intro, moments, teasers, ending. Text in [brackets] marks what to personalize. The
creator's job is *rewriting*, which is much easier than *writing*. This is our answer to
"creating must not feel like work."

**3. One editor screen, not a wizard.**
No multi-step flow. Everything (who it's for, opening, moments, ending) lives on one
scrollable page with moments that expand in place. A wizard felt like software; a single
page feels like editing a letter.

**4. Three unlock types, chosen per moment with one tap.**
- 🔑 *I reveal it* — the creator types a key on the recipient's phone at the right
  moment (this is exactly how the real birthday worked, and it was magical in person).
- 🧩 *They solve it* — clue + answer, the answer is the decryption key. The gift-hunt
  backbone, works remotely.
- ⏰ *On its own* — opens at a set time. For long-distance or "read this at midnight"
  moments.

**5. Keys are auto-generated.**
Creators shouldn't invent five codes. Each "I reveal it" moment gets a pleasant word
(LANTERN, VELVET, COMPASS...) they can change but never have to. The share screen shows
a "screenshot this" cheat sheet of all keys/answers/times.

**6. The occasions genuinely differ, cheaply.**
Not three skins of one form. Each occasion has its own: template structure (birthday =
5-stop adventure with keys; anniversary = 4 memory-moments mixing keys and a personal
question; gift hunt = 4 chained riddles), voice (labels, buttons, celebration lines:
"Cracked it. 🔍" vs "One memory open. ❤️"), and color world (plum, wine-rose, deep
forest). One config file drives all of it.

**7. Preview is the recipient experience, with X-ray glasses.**
Tap PREVIEW → you are the recipient, with small dashed chips showing each moment's
key/answer so you can actually walk through it. Demos use the same trick, so a stranger
can feel the product in a minute.

**8. The original birthday experience is untouched.**
It lives at `#/aug9` with its own components and encrypted data. The product layer was
built beside it, not on top of it.

**9. AI help without AI integration.**
Every writing field has an "AI HELP" button that generates a ready-to-paste prompt for
whatever assistant the creator already uses (ChatGPT, Claude, Gemini...). The prompt
carries all the context the creator would forget to type: occasion, recipient, the hidden
surprise, the current draft, tone rules, and output format ("5 numbered options, nothing
else"). Teaser prompts explicitly tell the AI not to spoil the surprise. We never call an
AI, never ask for keys, and the user controls which AI sees their private plans. Worth
testing: do creators actually round-trip to an AI, or does the button mostly reassure?

---

## What we deliberately did NOT build

- **QR / location / photo unlocks** — the three current types already answer "does
  progressive unlocking delight people?" More types add creator complexity before we've
  validated the basics.
- **Accounts, cloud saves, links that sync** — drafts live in the creator's browser.
  Real risk (see problems), but a backend before validation is premature.
- **Manual remote reveal** ("creator taps a button and it opens on their phone") —
  needs a server. The in-person key ritual covers the same emotional job for now.
- **Media (photos/video/audio) in moments** — would blow up the URL-as-database trick
  and is a big build. Text did the job in the real birthday. Test demand first.
- **Drag-and-drop reordering** — up/down arrows are fine at 4–6 moments.
- **AI writing help** — excluded by the brief, and honestly the templates may be enough.

---

## Assumptions we're making (unvalidated)

1. Rewriting pre-written text is genuinely easier for people than writing from scratch —
   and the [brackets] convention is understood without explanation.
2. A creator will accept that the link only works while they don't clear their browser
   data (drafts are local-only).
3. ~2–4KB URLs survive WhatsApp/Telegram/SMS intact. (Verified in principle; not across
   every messenger.)
4. Recipients on a shared link won't be confused that "🔑 moments" need the creator
   physically present.
5. The 5–10 minute creation target is achievable — our guess is the template gets an
   unmotivated creator to "good enough" in ~5 minutes of rewriting.

## Where users may get confused or frustrated

- **The key-type mental model.** "I reveal it" requires the creator to understand
  *they* will type a key on the *recipient's* phone. The editor says "only you know
  this," but this is the most likely point of confusion. Watch it in testing.
- **Editing on desktop.** Everything is mobile-first; the editor is fine on a phone but
  creators may prefer a laptop for longer writing.
- **Placeholder leakage.** If a creator shares with [brackets] left in, the recipient
  sees them. We warn at share time; is a warning enough?
- **Lost drafts.** Clearing browser data deletes drafts. The share link keeps working
  (it's self-contained), but the creator can't edit or re-generate the cheat sheet
  unless they saved it.
- **Time unlocks use the recipient's device clock.** Fine in practice, spoofable in
  theory.

## What to test with real users

**Creators:** Do they understand the product from the home screen alone? Time from
"Create" to shared link. Which template fields they actually change. Whether they use
Preview before sharing (we bet the ones who do share more confidently). Whether the
key cheat sheet is understood and saved. Where they stall.

**Recipients:** Do they understand what to do at each lock type without help? Does the
celebration-between-moments land, or does it interrupt? Do clue moments feel fun or
like a quiz? Does it feel like "someone planned this for me"?

**The killer question:** after receiving one, does anyone ask "how do I make one of
these?" That's the signal this is a product.

## Recommendations for the next iteration

1. **Put real user testing before any new feature.** The prototype is complete enough.
2. If validated, the first real infrastructure should be **short links** (a tiny
   key→blob store). Long URLs are the weakest part of the current experience, and it
   also solves draft portability.
3. Explore **one photo per moment** as the only media feature — cheap emotional win if
   short links exist.
4. Consider **occasion-specific unlock defaults being invisible** — e.g. a gift hunt
   creator maybe never needs to see the unlock selector at all.
5. A "**send a test to yourself**" button (share sheet → open on your own phone) may
   replace Preview entirely for some creators. Watch which one people trust.

---

## Where things live (for us)

- Occasion personalities + templates: `src/product/occasions.ts`
- Demo content: `src/product/demos.ts`
- Sealing/sharing (encryption + URL packing): `src/product/share.ts` + `src/utils/crypto.ts`
- Recipient journey: `src/product/components/Player.tsx`
- Creator flow: `src/product/components/CreateFlow.tsx`
- Routes: `src/App.tsx` (hash router) — original birthday: `src/BirthdayApp.tsx` at `#/aug9`
