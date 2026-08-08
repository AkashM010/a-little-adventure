/**
 * Public checkpoint data — safe to ship, contains no destinations.
 * The mysterious teaser lines shown while a checkpoint is locked.
 */
export interface Checkpoint {
  id: number
  teaser: string
}

export const CHECKPOINTS: Checkpoint[] = [
  { id: 1, teaser: 'Where the day begins.' },
  { id: 2, teaser: 'Where the city gets quieter.' },
  { id: 3, teaser: 'Time to refuel.' },
  { id: 4, teaser: 'Where we slow down.' },
  { id: 5, teaser: 'The final little surprise.' },
]

export const ADVENTURE_DATE = 'Sunday • August 9, 2026'
