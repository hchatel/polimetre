/**
 * Rounds away floating-point noise (e.g. 0.7 - (-0.2) = 0.8999999999999999),
 * so that mathematically equal values compare equal in ties and thresholds.
 */
export const roundNoise = (value: number): number => {
  return Math.round(value * 1e9) / 1e9;
};
