import { OCCASIONS } from './occasions'
import type { Experience, Moment } from './types'

/**
 * Ready-to-paste prompts for any external AI assistant.
 * We never call an AI ourselves — the creator copies a prompt that already
 * carries all the context (occasion, recipient, surprise, current draft),
 * pastes it into ChatGPT/Claude/Gemini/anything, and pastes the answer back.
 */

export type PromptKind =
  | { kind: 'title' }
  | { kind: 'opening' }
  | { kind: 'teaser'; moment: Moment }
  | { kind: 'reveal'; moment: Moment }
  | { kind: 'clue'; moment: Moment }
  | { kind: 'ending' }

const clean = (s: string | undefined): string => (s ?? '').trim()

/** Skip placeholder [bracket] text when quoting the current draft. */
const draftValue = (s: string | undefined): string => {
  const v = clean(s)
  return v && !v.startsWith('[') ? v : ''
}

function context(exp: Experience): string {
  const occ = OCCASIONS[exp.occasion]
  const lines = [
    `I'm creating an interactive ${occ.name.toLowerCase()} surprise experience for someone special.`,
    'They will discover it step by step on their phone: locked moments open one at a time, each revealing a message or surprise.',
  ]
  if (draftValue(exp.toName)) lines.push(`It's for: ${exp.toName.trim()}.`)
  if (draftValue(exp.title)) lines.push(`The experience is titled: "${exp.title.trim()}".`)
  lines.push(
    'Tone: warm, personal, a little playful and mysterious. Never cheesy, never corporate.',
    'Where a personal detail would make it better, leave a [placeholder in square brackets] for me to fill in.',
  )
  return lines.join('\n')
}

function momentContext(exp: Experience, moment: Moment): string {
  const i = exp.moments.findIndex((m) => m.id === moment.id)
  const lines = [`This is about moment ${i + 1} of ${exp.moments.length} in the journey.`]
  const teaser = draftValue(moment.teaser)
  const name = draftValue(moment.reveal.name)
  const location = draftValue(moment.reveal.location)
  const message = draftValue(moment.reveal.message)
  if (teaser) lines.push(`Its locked-state teaser is: "${teaser}"`)
  if (name) lines.push(`The hidden surprise is: ${name}${location ? ` (${location})` : ''}.`)
  else if (location) lines.push(`The hidden surprise happens at: ${location}.`)
  if (message) lines.push(`My current draft of the reveal message: "${message}"`)
  return lines.join('\n')
}

export function buildPrompt(exp: Experience, req: PromptKind): string {
  const base = context(exp)

  switch (req.kind) {
    case 'title': {
      const current = draftValue(exp.title)
      return [
        base,
        '',
        'TASK: Suggest a title for the whole experience.',
        current ? `My current draft: "${current}" — feel free to improve on it or go elsewhere.` : '',
        'It should feel like the name of a small adventure made for one person, not a product.',
        '',
        'Give me 5 options, 2–5 words each. Reply with only the numbered options, nothing else.',
      ]
        .filter(Boolean)
        .join('\n')
    }

    case 'opening': {
      const current = exp.introLines.map(draftValue).filter(Boolean).join('\n')
      return [
        base,
        '',
        'TASK: Write the opening — the first thing they see, shown one line at a time like a slow cinematic intro.',
        'It should build curiosity: something has been planned for them, but reveal nothing about what.',
        current ? `My current draft:\n${current}\n\nImprove it or rewrite it.` : '',
        '',
        'Write 5–7 short lines (each under 12 words). The last line should be the warmest.',
        'Reply with only the lines, one per line — no numbering, no quotes, no commentary.',
      ]
        .filter(Boolean)
        .join('\n')
    }

    case 'teaser': {
      return [
        base,
        '',
        momentContext(exp, req.moment),
        '',
        'TASK: Write the teaser — the single mysterious line shown while this moment is still locked.',
        'It must NOT give away the surprise. It should make them desperate to know what it is.',
        '',
        'Give me 5 options, each under 8 words. Reply with only the numbered options, nothing else.',
      ].join('\n')
    }

    case 'reveal': {
      return [
        base,
        '',
        momentContext(exp, req.moment),
        '',
        'TASK: Write the reveal message — what they read the instant this moment unlocks.',
        'This is the emotional payoff: personal, warm, written to them directly.',
        '',
        'Give me 3 options of 2–4 short lines each (line breaks matter — they are shown as written).',
        'Reply with only the numbered options, nothing else.',
      ].join('\n')
    }

    case 'clue': {
      const answer =
        req.moment.unlock.type === 'clue' ? draftValue(req.moment.unlock.answer) : ''
      return [
        base,
        '',
        momentContext(exp, req.moment),
        answer
          ? `The answer they must type to unlock it is: "${answer}".`
          : 'I have not decided the answer yet — propose one along with each clue.',
        '',
        'TASK: Write the clue or riddle they must solve.',
        'Medium difficulty: solvable in under a minute by the person it’s for, satisfying to crack.',
        'It can rhyme but doesn’t have to.',
        '',
        'Give me 3 options (with the answer stated after each if you proposed one).',
        'Reply with only the numbered options, nothing else.',
      ]
        .filter(Boolean)
        .join('\n')
    }

    case 'ending': {
      const headline = draftValue(exp.ending.headline)
      const lines = exp.ending.lines.map(draftValue).filter(Boolean).join('\n')
      return [
        base,
        '',
        'TASK: Write the ending — the final screen after every moment has been opened and completed.',
        'It should land softly: grateful, warm, a little emotional. The goodbye of the experience.',
        headline ? `Current headline draft: "${headline}"` : '',
        lines ? `Current closing lines draft:\n${lines}` : '',
        '',
        'Give me 2 options. Each option = one short headline (under 6 words) plus 2–4 closing lines.',
        'Reply with only the numbered options, nothing else.',
      ]
        .filter(Boolean)
        .join('\n')
    }
  }
}
