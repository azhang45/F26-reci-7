import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { matchGuess } from '../src/wordle';

// Recitation Part 1: follow along with your TA, filling in the todos below.
// Problem set Task 1: keep adding properties until `npm run mutants:wordle`
// kills every mutant. Read the spec in src/wordle/matchGuess.ts.
//
// Label every property with its pattern, on the line above its `it(`:
//   // Pattern: invariant. The result always has exactly five colors.
// (invariant, algebraic, metamorphic, differential, or conditional)

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SMALL_ALPHABET = 'ABC';
const HALF_ALPHABET_1 = 'ABCDEFGHIJKLM';
const HALF_ALPHABET_2 = 'NOPQRSTUVWXYZ';

// Step 1: a generator for five-letter uppercase words.
// const word = ...
const wordFrom = (letters: string) =>
  fc.array(fc.constantFrom(...letters), {minLength: 5, maxLength: 5}).map(cs => cs.join(''));
const word = wordFrom(ALPHABET);
const smallWord = wordFrom(SMALL_ALPHABET);
const halfWord1 = wordFrom(HALF_ALPHABET_1);
const halfWord2 = wordFrom(HALF_ALPHABET_2);
const uniqueLetters = fc.uniqueArray(fc.constantFrom(...ALPHABET), { minLength: 5, maxLength: 5});

describe('matchGuess', () => {
  // Pattern: invariant. The result has always five colors.
  it('returns exactly five colors', () => {
    fc.assert(
      fc.property(word, word, (secret,guess) =>{
        expect(matchGuess(secret, guess)).toHaveLength(5);
      }),
    );
  });
  // Pattern: invariant. Every color is G, Y, or B.
  it('only uses the colors G, Y, B', () => {
    fc.assert(
      fc.property(word,word,(secret,guess) => {
        for (const c of matchGuess(secret, guess)) expect(['G', 'Y', 'B']).toContain(c);
      }),
    )
  });
  // Pattern: conditional. If the guess is the secret, every color is green.
  it('guessing the secret gives all greens', () => {
    fc.assert(
      fc.property(word, w => {
        expect(matchGuess(w,w)).toEqual(['G','G','G','G','G']);
      }),
    );
  });
  // Pattern: invariant. No letter is credited (G or Y) more times than the secret contains it.
  it('never credits a letter more times than the secret contains it', () => {
    fc.assert(
      fc.property(smallWord, smallWord, (secret,guess) => {
        const result = matchGuess(secret, guess);
        for (const letter of new Set(guess)) {
          const credited = [...guess].filter((c,i) => c === letter && result[i] !== 'B').length;
          const isSecret = [...secret].filter(c => c === letter).length;
          expect(credited).toBeLessThanOrEqual(isSecret);
        }
      }),
    );
  });
  // Pattern: metamorphic and conditional. If the guess has no correct letters, no matter the order, the result is all black.
  it('getting no letters right gives all black', () => {
    fc.assert(
      fc.property(halfWord1,halfWord2, halfWord2, (secret,guess1, guess2) => {
        expect(matchGuess(secret, guess1)).toEqual(['B','B','B','B','B']);
        expect(matchGuess(secret, guess2)).toEqual(['B','B','B','B','B']);
      }),
    )
  });
  // Pattern: conditional. If a letter is in the wrong position, it is yellow.
  it('returns yellow for letters in the wrong positions', () => {
    fc.assert(
      fc.property(uniqueLetters,
        letters => {
          const secret = letters.join('');
          const guess = [...letters];
          [guess[0], guess[1]] = [guess[1], guess[0]];
          expect(matchGuess(secret, guess.join(''))).toEqual(['Y', 'Y', 'G', 'G', 'G']);
        },
      ),
    );
  });
});
