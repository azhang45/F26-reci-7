import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { mergeIntervals, type Interval } from '../src/intervals';

// Recitation Part 2 (groups) and problem set Task 2.
// Read the spec in src/intervals/mergeIntervals.ts, then check your progress
// with `npm run mutants:intervals`.
//
// Label every property with its pattern, on the line above its `it(`:
//   // Pattern: invariant. The output is sorted.
// (invariant, algebraic, metamorphic, differential, or conditional)

// A first attempt at a generator. It has a problem: run the tests and read
// the counterexample.

const interval: fc.Arbitrary<Interval> = fc.tuple(fc.integer(), fc.integer()).map(([a, b]) => (a <= b ? [a, b] : [b, a]));
const intervalList = fc.array(interval);
const intervalsWithGap = (gap: number) =>
  fc.tuple(
    fc.integer({ max: 1000 }),
    fc.array(fc.integer({ min: 0, max: 100 }), {
      minLength: 1,
      maxLength: 100
    })
  )
  .map(([start, lengths]) => {
    let curr = start;
    return lengths.map(length => {
      const interval: Interval = [curr, curr + length];
      curr += length + gap;
      return interval;
    });
  });

const disjointIntervals = intervalsWithGap(1);
const touchingIntervals = intervalsWithGap(0);

const overlappingPair: fc.Arbitrary<[Interval, Interval]> = fc
  .tuple(fc.integer(), fc.integer(), fc.integer())
  .map(([a, b, c]) => {
    const [x, y, z] = [a, b, c].sort((a, b) => a - b);
    return [[x, y], [y, z]];
  });

describe('mergeIntervals', () => {
  // Pattern: invariant. Every input interval lies inside some output interval.
  it('every input interval lies inside some output interval', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        const uncovered = xs.filter(([s, e]) => !out.some(([a, b]) => a <= s && e <= b));
        expect(uncovered).toEqual([]);
      }),
    );
  });

  // Add your properties here. Aim for at least one of each pattern:
  // invariant, algebraic, metamorphic, differential, conditional.

  // Pattern: invariant. The output is sorted and has no overlapping intervals.
  it('returns sorted, non-overlapping intervals', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        for (let i = 0; i < out.length - 1; i++) {
          expect(out[i][1]).toBeLessThan(out[i + 1][0]);
        }
      }),
    );
  });

  // Pattern: conditional. If the input intervals are disjoint, the output intervals are the same.
  it('disjoint intervals are not merged', () => {
    fc.assert(
      fc.property(disjointIntervals, xs => {
        expect(mergeIntervals(xs)).toEqual(xs);
      }),
    );
  });

  // Pattern: conditional. If the input intervals are touching, the output intervals are merged.
  it('touching intervals are merged', () => {
    fc.assert(
      fc.property(touchingIntervals, xs => {
        const merged = mergeIntervals(xs);
        expect(merged).toHaveLength(1);
        expect(merged[0]).toEqual([xs[0][0], xs[xs.length - 1][1]]);
      }),
    );
  });

  // Pattern: metamorphic. Reordering input intervals doesn't affect merged result.
  it('reversing input order does not affect the result', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        expect(mergeIntervals(xs.toReversed()))
          .toEqual(mergeIntervals(xs));
      }),
    );
  });

  // Pattern: algebraic. Merging already merged intervals produces the same result.
  it('merging intervals is idempotent', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const merged = mergeIntervals(xs);
        expect(mergeIntervals(merged)).toEqual(merged);
      }),
    );
  });

  // Pattern: invariant. Merging intervals does not modify the input.
  it('does not mutate input intervals', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const original = xs.map(interval => [...interval]);
        mergeIntervals(xs);
        expect(xs).toEqual(original);
      }),
    );
  });

  // Pattern: invariant. Output intervals do not alias any input intervals.
  it('does not alias input intervals', () => {
    fc.assert(
      fc.property(intervalList, xs => {
        const out = mergeIntervals(xs);
        for (const output of out) {
          for (const input of xs) {
            expect(output).not.toBe(input);
          }
        }
      }),
    );
  });

  // Pattern: differential. Compare merging two overlapping intervals against using min/max.
  it('merging two overlapping intervals is equivalent to using min/max', () => {
    fc.assert(
      fc.property(overlappingPair, ([a, b]) => {
        const merged = mergeIntervals([a, b]);
        const expected = [[Math.min(a[0], b[0]), Math.max(a[1], b[1])]];
        expect(merged).toEqual(expected);
      }),
    );
  });

});
