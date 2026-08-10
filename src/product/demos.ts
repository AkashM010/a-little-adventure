import type { Experience } from './types'

/**
 * Three complete fictional experiences — one per occasion — so anyone
 * can feel the product in 60 seconds without creating anything.
 */

export const DEMOS: Record<string, Experience> = {
  birthday: {
    id: 'demo-birthday',
    occasion: 'birthday',
    title: 'Maya’s Little Adventure',
    toName: 'Maya',
    createdAt: '2026-08-01T00:00:00.000Z',
    introLines: [
      'Today isn’t just your birthday.',
      'It’s a little adventure planned just for you.',
      'Four checkpoints are waiting below.',
      'You’ll know when we reach each one...',
      'but not what’s waiting there.',
      'I’ll have the keys. You just have to come along. ❤️',
    ],
    moments: [
      {
        id: 'db1',
        teaser: 'Where the day begins.',
        unlock: { type: 'key', key: 'LANTERN' },
        reveal: {
          message:
            'You always say mornings are wasted on you.\nToday we’re proving you wrong.',
          name: 'SUNRISE AT THE OLD FORT',
          location: 'Golconda Fort, Hyderabad',
        },
      },
      {
        id: 'db2',
        teaser: 'Something you’d never guess.',
        unlock: { type: 'key', key: 'CASCADE' },
        reveal: {
          message:
            'You’ve been saying "we should try that" for a year.\nToday we’re actually trying it.',
          name: 'POTTERY CLASS FOR TWO',
          location: 'Banjara Hills, Hyderabad',
        },
      },
      {
        id: 'db3',
        teaser: 'Time to refuel.',
        unlock: { type: 'key', key: 'ORCHID' },
        reveal: {
          message: 'Your favorite table. Already booked.\nOrder the dessert first. It’s your day.',
          name: 'LUNCH AT TERRA',
          location: 'Jubilee Hills, Hyderabad',
        },
      },
      {
        id: 'db4',
        teaser: 'The final little surprise.',
        unlock: { type: 'key', key: 'SOLSTICE' },
        reveal: {
          message:
            'Everyone who loves you is already there.\nThey’ve been terrible at keeping the secret. 🎈',
          name: 'A ROOFTOP FULL OF YOUR PEOPLE',
        },
      },
    ],
    ending: {
      headline: 'Adventure Complete. ❤️',
      lines: [
        'Four checkpoints. One birthday.',
        'Thank you for being easy to surprise',
        'and impossible not to celebrate.',
      ],
    },
  },

  anniversary: {
    id: 'demo-anniversary',
    occasion: 'anniversary',
    title: 'Three Years of Us',
    toName: 'Riya',
    createdAt: '2026-08-01T00:00:00.000Z',
    introLines: [
      'This isn’t a date. Not exactly.',
      'It’s a walk through everything we’ve been.',
      'Four moments are waiting below.',
      'Some are memories. Some are new.',
      'Open them slowly. ❤️',
    ],
    moments: [
      {
        id: 'da1',
        teaser: 'Where this story began.',
        unlock: { type: 'key', key: 'VELVET' },
        reveal: {
          message:
            'A crowded bookshop. You reached for the same book I did.\nI let you have it. Best trade I ever made.\nWe’re going back today.',
          name: 'THE BOOKSHOP',
          location: 'Abids, Hyderabad',
        },
      },
      {
        id: 'da2',
        teaser: 'Something I never told you.',
        unlock: {
          type: 'clue',
          clue: 'What did I order the first time we got coffee? (one word — you teased me about it for weeks)',
          answer: 'HOT CHOCOLATE',
        },
        reveal: {
          message:
            'Correct. And here’s the part I never said:\nI don’t even like hot chocolate.\nI panicked because you were looking at me. ☕',
        },
      },
      {
        id: 'da3',
        teaser: 'Slow down with me.',
        unlock: { type: 'key', key: 'MOONRISE' },
        reveal: {
          message:
            'No plan for this one.\nA long dinner, no phones, the corner table.\nJust us, the way it started.',
          name: 'DINNER AT OUR PLACE',
          location: 'Film Nagar, Hyderabad',
        },
      },
      {
        id: 'da4',
        teaser: 'One more thing. ❤️',
        unlock: { type: 'key', key: 'GARNET' },
        reveal: {
          message:
            'Three years ago you took a chance on me.\nInside the blue box at home is my answer\nto the question you asked me last month.\nYes.',
        },
      },
    ],
    ending: {
      headline: 'Here’s to us. ❤️',
      lines: [
        'Every moment above really happened.',
        'And the best ones aren’t written yet.',
      ],
    },
  },

  gifthunt: {
    id: 'demo-gifthunt',
    occasion: 'gifthunt',
    title: 'The Great Gift Hunt',
    toName: 'Rohan',
    createdAt: '2026-08-01T00:00:00.000Z',
    introLines: [
      'Somewhere in the house, your gift is hidden.',
      'Between you and it: four clues.',
      'Each one you crack opens the next.',
      'No hints. No mercy. 😌',
      'Good luck.',
    ],
    moments: [
      {
        id: 'dg1',
        teaser: 'It starts with a riddle.',
        unlock: {
          type: 'clue',
          clue: 'I hold your clothes but never wear them.\nOpen me and look up. (one word)',
          answer: 'WARDROBE',
        },
        reveal: {
          message: 'Top shelf. The old shoebox.\nInside it: nothing but the next clue. 😌\nToo easy? They get harder.',
          name: 'THE SHOEBOX',
        },
      },
      {
        id: 'dg2',
        teaser: 'Getting warmer.',
        unlock: {
          type: 'clue',
          clue: 'I’m full of cold secrets and midnight snacks.\nWhat am I? (one word)',
          answer: 'FRIDGE',
        },
        reveal: {
          message: 'Behind the leftovers nobody will eat.\nThere’s an envelope. It’s not money. Stop smiling.',
        },
      },
      {
        id: 'dg3',
        teaser: 'So close now.',
        unlock: {
          type: 'clue',
          clue: 'Every hero sits on me, every remote hides in me. (one word)',
          answer: 'SOFA',
        },
        reveal: {
          message: 'Third cushion. The one with the tea stain\nyou pretend you didn’t cause. Lift it.',
        },
      },
      {
        id: 'dg4',
        teaser: 'The last one. 🎁',
        unlock: {
          type: 'clue',
          clue: 'I sing every morning whether you like it or not,\nand you slap me for it. (two words)',
          answer: 'ALARM CLOCK',
        },
        reveal: {
          message:
            'Under the bed, behind the suitcase.\nThe box with the terrible wrapping.\nI wrapped it myself. Obviously.',
          name: 'YOUR GIFT 🎁',
        },
      },
    ],
    ending: {
      headline: 'Found it. 🎁',
      lines: [
        'Four clues, zero mercy shown.',
        'The prize was always going to be yours.',
        'Happy hunting, detective.',
      ],
    },
  },
}
