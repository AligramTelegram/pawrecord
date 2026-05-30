export const SPECIES = ['dog', 'cat', 'rabbit', 'bird', 'other'] as const;
export type Species = typeof SPECIES[number];

export const SPECIES_EMOJI: Record<Species, string> = {
  dog: '🐶',
  cat: '🐱',
  rabbit: '🐰',
  bird: '🐦',
  other: '🐾',
};
