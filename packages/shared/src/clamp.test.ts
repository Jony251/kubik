import { describe, expect, it } from 'vitest';
import { clamp } from './clamp';

describe('clamp', () => {
  it.each([
    [5, 0, 10, 5],
    [-1, 0, 10, 0],
    [11, 0, 10, 10],
    [0, 0, 0, 0],
  ])('clamp(%d, %d, %d) is %d', (value, min, max, expected) => {
    expect(clamp(value, min, max)).toBe(expected);
  });

  it('rejects an empty range', () => {
    expect(() => clamp(1, 2, 1)).toThrow(RangeError);
  });
});
