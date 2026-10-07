/**
 * Convert monetary decimal or floating-point values to standard 2-decimal
 * rounded numbers at DTO boundaries (research.md D-10).
 */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
