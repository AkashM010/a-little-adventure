import type { Experience, Moment, Occasion, UnlockRule } from './types'

/**
 * Everything that makes an occasion feel different lives here:
 * voice, labels, colors, celebration lines, and the starter template.
 */
export interface OccasionConfig {
  id: Occasion
  emoji: string
  name: string
  tagline: string
  pickerLine: string
  momentLabel: string
  beginLabel: string
  introButton: string
  keyPrompt: string
  cluePlaceholder: string
  lockedTease: string
  completeLabel: string
  finishLabel: string
  celebrate: { title: string; line: string }[]
  /** CSS variable overrides that re-skin the whole recipient journey. */
  theme: Record<string, string>
  /** Pool of pleasant, non-hinting auto-generated unlock keys. */
  keyWords: string[]
}

export const OCCASIONS: Record<Occasion, OccasionConfig> = {
  birthday: {
    id: 'birthday',
    emoji: '🎂',
    name: 'Birthday',
    tagline: 'A little adventure, one surprise at a time.',
    pickerLine: 'A day of checkpoints they can’t predict.',
    momentLabel: 'CHECKPOINT',
    beginLabel: 'BEGIN THE ADVENTURE',
    introButton: 'LET’S GO',
    keyPrompt: 'Enter the key',
    cluePlaceholder: 'your answer...',
    lockedTease: 'Nice try. 😌 The keys aren’t yours yet.',
    completeLabel: 'MARK THIS CHECKPOINT COMPLETE',
    finishLabel: 'FINISH THE ADVENTURE',
    celebrate: [
      { title: 'One down. ✨', line: 'The day is only getting started.' },
      { title: 'Two down. 😌', line: 'You’re getting good at this.' },
      { title: 'Another one. 🎈', line: 'Someone really planned this, huh.' },
      { title: 'Almost there. 👀', line: 'Only a little mystery left.' },
    ],
    theme: {
      '--color-ink': '#211423',
      '--color-ink-soft': '#301e33',
      '--color-cream': '#faf5f2',
      '--color-parchment': '#f3e7e4',
      '--color-rose': '#b05a6e',
      '--color-burgundy': '#8a3050',
      '--color-gold': '#d4af71',
      '--color-gold-soft': '#e9d7b0',
    },
    keyWords: ['LANTERN', 'PEARL', 'MERIDIAN', 'CASCADE', 'ORCHID', 'HARBOR', 'SOLSTICE', 'WILLOW'],
  },
  anniversary: {
    id: 'anniversary',
    emoji: '❤️',
    name: 'Anniversary',
    tagline: 'A walk through us.',
    pickerLine: 'Memories, moments, and one more thing.',
    momentLabel: 'MOMENT',
    beginLabel: 'START OUR STORY',
    introButton: 'WALK WITH ME',
    keyPrompt: 'Enter the key',
    cluePlaceholder: 'you remember this...',
    lockedTease: 'Patience, love. 😌 We’ll get there.',
    completeLabel: 'WE LIVED THIS ONE',
    finishLabel: 'ONE LAST THING',
    celebrate: [
      { title: 'One memory open. ❤️', line: 'There’s more where that came from.' },
      { title: 'Two now.', line: 'Do you remember it the way I do?' },
      { title: 'Getting closer.', line: 'The best part is still hidden.' },
      { title: 'Nearly there. 🤍', line: 'One more breath, one more moment.' },
    ],
    theme: {
      '--color-ink': '#231018',
      '--color-ink-soft': '#331722',
      '--color-cream': '#fbf5f3',
      '--color-parchment': '#f5e6e3',
      '--color-rose': '#bb5f6f',
      '--color-burgundy': '#8e2f47',
      '--color-gold': '#d6a97a',
      '--color-gold-soft': '#ecd6b8',
    },
    keyWords: ['VELVET', 'AMBER', 'JUNIPER', 'MOONRISE', 'GARNET', 'SONNET', 'DUSK', 'IVORY'],
  },
  gifthunt: {
    id: 'gifthunt',
    emoji: '🎁',
    name: 'Gift Hunt',
    tagline: 'Follow the clues. Find the thing.',
    pickerLine: 'Riddles that lead somewhere real.',
    momentLabel: 'CLUE',
    beginLabel: 'START THE HUNT',
    introButton: 'I’M READY',
    keyPrompt: 'Enter the key',
    cluePlaceholder: 'crack the riddle...',
    lockedTease: 'The clue above is your only way in. 🔍',
    completeLabel: 'FOUND IT — NEXT CLUE',
    finishLabel: 'CLAIM THE PRIZE',
    celebrate: [
      { title: 'Cracked it. 🔍', line: 'The trail is warm.' },
      { title: 'Two solved.', line: 'You’d make a decent detective.' },
      { title: 'On a roll. 🕵️', line: 'The prize can hear you coming.' },
      { title: 'So close. 👀', line: 'One clue between you and it.' },
    ],
    theme: {
      '--color-ink': '#101f1a',
      '--color-ink-soft': '#1a2f27',
      '--color-cream': '#f4f7f3',
      '--color-parchment': '#e6eee5',
      '--color-rose': '#3f7d5f',
      '--color-burgundy': '#2c5f47',
      '--color-gold': '#c9a45f',
      '--color-gold-soft': '#e0d0a4',
    },
    keyWords: ['COMPASS', 'ACORN', 'FALCON', 'COBALT', 'THICKET', 'MARBLE', 'QUARTZ', 'BONFIRE'],
  },
}

const uid = (): string => crypto.randomUUID().slice(0, 8)

/** Pick an unused auto-key for a "creator reveals" moment. */
export function pickKey(occasion: Occasion, used: string[]): string {
  const pool = OCCASIONS[occasion].keyWords.filter((w) => !used.includes(w))
  const source = pool.length > 0 ? pool : OCCASIONS[occasion].keyWords
  return source[Math.floor(Math.random() * source.length)]
}

export function newMoment(occasion: Occasion, usedKeys: string[]): Moment {
  const unlock: UnlockRule =
    occasion === 'gifthunt'
      ? { type: 'clue', clue: '', answer: '' }
      : { type: 'key', key: pickKey(occasion, usedKeys) }
  return {
    id: uid(),
    teaser: '',
    unlock,
    reveal: { message: '' },
    hints: {
      teaser: 'a mysterious one-liner about this surprise',
      message: 'what do you want to say when this opens?',
    },
  }
}

/**
 * Starter templates. Everything is editable; brackets mark the spots
 * a creator is expected to make their own.
 */
export function buildTemplate(occasion: Occasion): Experience {
  const base = {
    id: uid(),
    occasion,
    createdAt: new Date().toISOString(),
  }

  if (occasion === 'birthday') {
    const keys = ['LANTERN', 'PEARL', 'CASCADE', 'ORCHID', 'SOLSTICE']
    return {
      ...base,
      title: 'A Little Adventure',
      toName: '',
      introLines: [
        'Today isn’t just another day.',
        'It’s a little adventure planned just for you.',
        'There are a few checkpoints waiting.',
        'You’ll know when we reach each one...',
        'but not what’s waiting there.',
        'I’ll have the keys.',
        'You just have to come along. ❤️',
      ],
      moments: [
        {
          id: uid(),
          teaser: 'Where the day begins.',
          unlock: { type: 'key', key: keys[0] },
          reveal: { message: '' },
          hints: {
            message: 'say something about the first stop — why you chose it',
            name: 'first place or activity',
            location: 'area / city, e.g. Jubilee Hills, Hyderabad',
          },
        },
        {
          id: uid(),
          teaser: 'Something you’d never guess.',
          unlock: { type: 'key', key: keys[1] },
          reveal: { message: '' },
          hints: {
            message: 'the surprise activity — set it up with a line or two',
            name: 'the activity',
          },
        },
        {
          id: uid(),
          teaser: 'Time to refuel.',
          unlock: { type: 'key', key: keys[2] },
          reveal: { message: '' },
          hints: {
            message: 'a line about the food stop',
            name: 'restaurant / café',
            location: 'area',
          },
        },
        {
          id: uid(),
          teaser: 'Where we slow down.',
          unlock: { type: 'key', key: keys[3] },
          reveal: { message: '' },
          hints: { message: 'a quieter, personal moment — no activity needed' },
        },
        {
          id: uid(),
          teaser: 'The final little surprise.',
          unlock: { type: 'key', key: keys[4] },
          reveal: { message: '' },
          hints: { message: 'save the warmest thing for last ❤️', name: 'the finale' },
        },
      ],
      ending: {
        headline: 'Adventure Complete. ❤️',
        lines: ['A whole day of surprises.', 'Thank you for coming along.'],
      },
    }
  }

  if (occasion === 'anniversary') {
    return {
      ...base,
      title: 'A Walk Through Us',
      toName: '',
      introLines: [
        'This isn’t a date. Not exactly.',
        'It’s a walk through everything we’ve been.',
        'A few moments are waiting below.',
        'Some are memories. Some are new.',
        'Open them slowly. ❤️',
      ],
      moments: [
        {
          id: uid(),
          teaser: 'Where this story began.',
          unlock: { type: 'key', key: 'VELVET' },
          reveal: { message: '' },
          hints: {
            message: 'the story of how it started — your version of it',
            name: 'the place it began',
            location: 'where',
          },
        },
        {
          id: uid(),
          teaser: 'Something I never told you.',
          unlock: { type: 'clue', clue: '', answer: '' },
          reveal: { message: '' },
          hints: {
            clue: 'ask something only they would know',
            answer: 'the answer',
            message: 'tell them the thing you never said',
          },
        },
        {
          id: uid(),
          teaser: 'Slow down with me.',
          unlock: { type: 'key', key: 'MOONRISE' },
          reveal: { message: '' },
          hints: {
            message: 'a quiet stretch of time together — food, a walk, anything unhurried',
            name: 'where you’ll be',
            location: 'area',
          },
        },
        {
          id: uid(),
          teaser: 'One more thing. ❤️',
          unlock: { type: 'key', key: 'GARNET' },
          reveal: { message: '' },
          hints: { message: 'the promise, the gift, or the words you’ve been saving' },
        },
      ],
      ending: {
        headline: 'Here’s to us. ❤️',
        lines: [
          'Every moment above really happened.',
          'And the best ones aren’t written yet.',
        ],
      },
    }
  }

  // gifthunt
  return {
    ...base,
    title: 'The Hunt Is On',
    toName: '',
    introLines: [
      'Somewhere, something is hidden for you.',
      'Between you and it: a trail of clues.',
      'Each one you crack opens the next.',
      'No hints. No mercy. 😌',
      'Good luck.',
    ],
    moments: [
      {
        id: uid(),
        teaser: 'It starts with a riddle.',
        unlock: { type: 'clue', clue: '', answer: '' },
        reveal: { message: '' },
        hints: {
          clue: 'riddle #1 — point them somewhere in the house or city',
          answer: 'the answer',
          message: 'confirm what they found + hand them the next thread',
          name: 'what’s at this spot',
        },
      },
      {
        id: uid(),
        teaser: 'Getting warmer.',
        unlock: { type: 'clue', clue: '', answer: '' },
        reveal: { message: '' },
        hints: {
          clue: 'riddle #2',
          answer: 'the answer',
          message: 'a taunt or an encouragement — hunter’s choice',
        },
      },
      {
        id: uid(),
        teaser: 'So close now.',
        unlock: { type: 'clue', clue: '', answer: '' },
        reveal: { message: '' },
        hints: { clue: 'riddle #3', answer: 'the answer', message: 'almost there...' },
      },
      {
        id: uid(),
        teaser: 'The last one. 🎁',
        unlock: { type: 'clue', clue: '', answer: '' },
        reveal: { message: '' },
        hints: {
          clue: 'the final riddle — make it the hardest',
          answer: 'the answer',
          message: 'the big reveal — where the gift actually is',
          name: 'the gift',
        },
      },
    ],
    ending: {
      headline: 'Found it. 🎁',
      lines: ['Every clue, cracked.', 'The prize was always going to be yours.'],
    },
  }
}
