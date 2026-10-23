import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeText,
  checkScrabbleAnswer,
  generateScrabbleLetters,
  initHangman,
  guessHangmanLetter,
  validateWordChain,
  maskSentenceWithGap,
  checkGapFillAnswer,
  checkSentenceUnscramble,
  scoreSynonymsAntonyms,
  cosineSimilarity,
  calculateNavigatorStats,
} from './rules';

test('normalizeText cleans whitespace and punctuation correctly', () => {
  assert.equal(normalizeText('  Ephemeral!  '), 'ephemeral');
  assert.equal(normalizeText('Hello, World?'), 'hello world');
});

test('Scrabble generator and checker validate anagrams', () => {
  const letters = generateScrabbleLetters('RESILIENT', 42);
  assert.equal(letters.length, 9);
  assert.equal(checkScrabbleAnswer('resilient', 'RESILIENT'), true);
  assert.equal(checkScrabbleAnswer('resilietn', 'RESILIENT'), false);
});

test('Hangman state transitions and life deduction', () => {
  let game = initHangman('AI', 6);
  assert.equal(game.remainingLives, 6);
  assert.equal(game.isWon, false);

  // Guess wrong letter
  game = guessHangmanLetter(game, 'Z');
  assert.equal(game.remainingLives, 5);
  assert.equal(game.isLost, false);

  // Guess correct letters
  game = guessHangmanLetter(game, 'A');
  assert.equal(game.remainingLives, 5);
  assert.equal(game.isWon, false);

  game = guessHangmanLetter(game, 'I');
  assert.equal(game.isWon, true);
  assert.equal(game.isLost, false);
});

test('Word Chain validates matching ending and starting characters', () => {
  assert.equal(validateWordChain('learn', 'nature').valid, true);
  assert.equal(validateWordChain('learn', 'apple').valid, false);
  assert.equal(validateWordChain('', 'apple').valid, true);
});

test('Gap fill masks target word and validates answer', () => {
  const masked = maskSentenceWithGap('The resilient student never gave up.', 'resilient');
  assert.ok(masked.maskedText.includes('__________'));
  assert.equal(checkGapFillAnswer('resilient', 'Resilient'), true);
  assert.equal(checkGapFillAnswer('weak', 'Resilient'), false);
});

test('Sentence unscramble checks token order', () => {
  const original = 'Knowledge is power and wisdom is key.';
  const correctTokens = ['Knowledge', 'is', 'power', 'and', 'wisdom', 'is', 'key.'];
  const wrongTokens = ['power', 'is', 'Knowledge', 'and', 'wisdom', 'is', 'key.'];

  assert.equal(checkSentenceUnscramble(correctTokens, original), true);
  assert.equal(checkSentenceUnscramble(wrongTokens, original), false);
});

test('Synonyms and antonyms scoring', () => {
  const result = scoreSynonymsAntonyms(
    { synonyms: ['ubiquitous', 'pervasive'], antonyms: ['rare'] },
    ['ubiquitous', 'omnipresent', 'pervasive'],
    ['rare', 'scarce']
  );
  assert.equal(result.correctCount, 3);
  assert.equal(result.total, 5);
  assert.equal(result.score, 60);
});

test('Cosine similarity calculates vector angle accurately', () => {
  const v1 = [1, 0, 0];
  const v2 = [1, 0, 0];
  const v3 = [0, 1, 0];
  assert.equal(Math.round(cosineSimilarity(v1, v2)), 1);
  assert.equal(Math.round(cosineSimilarity(v1, v3)), 0);
});

test('calculateNavigatorStats counts questions accurately', () => {
  const dummyQuestions: any = [
    { status: 'correct', bookmarked: true },
    { status: 'correct', bookmarked: false },
    { status: 'incorrect', bookmarked: false },
    { status: 'unanswered', bookmarked: true },
  ];
  const stats = calculateNavigatorStats(dummyQuestions);
  assert.equal(stats.total, 4);
  assert.equal(stats.correct, 2);
  assert.equal(stats.incorrect, 1);
  assert.equal(stats.unanswered, 1);
  assert.equal(stats.bookmarked, 2);
  assert.equal(stats.accuracy, 67); // 2/3 ≈ 67%
});
