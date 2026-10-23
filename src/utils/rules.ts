import { VocabItem, QuestionData, QuestionStatus } from '../types/vocab';

/**
 * Normalizes text for comparison (lowercased, trimmed, trimmed punctuation)
 */
export function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/[.,!?;:'"()[\]{}]/g, '');
}

/**
 * Mode 2 - Scrabble Words
 * Shuffles the letters of a word into an array of characters.
 * Ensures the shuffled result is different from the original word if length > 2.
 */
export function generateScrabbleLetters(word: string, seed = 0): { id: string; char: string }[] {
  const cleanWord = word.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const chars = cleanWord.split('');
  
  // Deterministic or pseudo-random shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.abs(Math.sin(i + seed + 1)) * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  // If accidentally identical to original, swap first two
  if (chars.join('') === cleanWord && chars.length > 1) {
    [chars[0], chars[1]] = [chars[1], chars[0]];
  }

  return chars.map((char, index) => ({
    id: `letter-${index}-${char}-${seed}`,
    char,
  }));
}

export function checkScrabbleAnswer(attempt: string, targetWord: string): boolean {
  const cleanAttempt = attempt.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const cleanTarget = targetWord.replace(/[^a-zA-Z]/g, '').toUpperCase();
  return cleanAttempt === cleanTarget;
}

/**
 * Mode 4 - Hangman
 * Checks guessed letter against word and tracks remaining lives.
 */
export interface HangmanState {
  word: string;
  guessedLetters: Set<string>;
  maxLives: number;
  remainingLives: number;
  isWon: boolean;
  isLost: boolean;
}

export function initHangman(word: string, maxLives = 6): HangmanState {
  const cleanWord = word.toUpperCase();
  return {
    word: cleanWord,
    guessedLetters: new Set<string>(),
    maxLives,
    remainingLives: maxLives,
    isWon: false,
    isLost: false,
  };
}

export function guessHangmanLetter(state: HangmanState, letter: string): HangmanState {
  const upper = letter.toUpperCase();
  if (state.isWon || state.isLost || state.guessedLetters.has(upper)) {
    return state;
  }

  const newGuessed = new Set(state.guessedLetters);
  newGuessed.add(upper);

  const isHit = state.word.includes(upper);
  const remainingLives = isHit ? state.remainingLives : Math.max(0, state.remainingLives - 1);

  // Check win: all alphabetic characters in word are guessed
  const cleanWordLetters = state.word.split('').filter((c) => /[A-Z]/.test(c));
  const isWon = cleanWordLetters.every((c) => newGuessed.has(c));
  const isLost = !isWon && remainingLives <= 0;

  return {
    ...state,
    guessedLetters: newGuessed,
    remainingLives,
    isWon,
    isLost,
  };
}

/**
 * Mode 5 - Word Chain
 * Validates whether candidate word starts with the ending letter of previous word.
 */
export function validateWordChain(prevWord: string, nextWord: string): { valid: boolean; reason?: string } {
  const cleanPrev = prevWord.trim().toLowerCase().replace(/[^a-z]/g, '');
  const cleanNext = nextWord.trim().toLowerCase().replace(/[^a-z]/g, '');

  if (!cleanNext || cleanNext.length < 2) {
    return { valid: false, reason: 'Từ phải có ít nhất 2 chữ cái' };
  }

  if (cleanPrev.length === 0) {
    return { valid: true };
  }

  const lastChar = cleanPrev[cleanPrev.length - 1];
  const firstChar = cleanNext[0];

  if (lastChar !== firstChar) {
    return {
      valid: false,
      reason: `Từ mới phải bắt đầu bằng chữ cái '${lastChar.toUpperCase()}' (kết thúc của '${prevWord}')`,
    };
  }

  return { valid: true };
}

/**
 * Mode 6 - Gap Filling
 * Masks target word in sentence and checks if user input fills it accurately.
 */
export function maskSentenceWithGap(sentence: string, targetWord: string): { maskedText: string; blankIndex: number } {
  const regex = new RegExp(`\\b${targetWord}\\b`, 'i');
  if (regex.test(sentence)) {
    return {
      maskedText: sentence.replace(regex, '__________'),
      blankIndex: sentence.search(regex),
    };
  }
  // Fallback: replace case-insensitive occurrence
  const lowerSentence = sentence.toLowerCase();
  const lowerWord = targetWord.toLowerCase();
  const idx = lowerSentence.indexOf(lowerWord);
  if (idx !== -1) {
    const masked = sentence.substring(0, idx) + '__________' + sentence.substring(idx + targetWord.length);
    return { maskedText: masked, blankIndex: idx };
  }
  return { maskedText: `${sentence} (Từ cần điền: __________)`, blankIndex: 0 };
}

export function checkGapFillAnswer(userAnswer: string, targetWord: string): boolean {
  return normalizeText(userAnswer) === normalizeText(targetWord);
}

/**
 * Mode 7 - Sentence Unscramble
 * Splits a sentence into tokens and validates user ordered tokens.
 */
export function tokenizeSentence(sentence: string): { id: string; text: string }[] {
  // Split words while preserving meaningful words
  const words = sentence.trim().split(/\s+/);
  return words.map((w, i) => ({
    id: `token-${i}-${w}`,
    text: w,
  }));
}

export function shuffleTokens<T>(items: T[], seed = 1): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.abs(Math.cos(i + seed)) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function checkSentenceUnscramble(currentTokens: string[], originalSentence: string): boolean {
  const currentStr = normalizeText(currentTokens.join(' '));
  const origStr = normalizeText(originalSentence);
  return currentStr === origStr;
}

/**
 * Mode 8 - Synonyms and Antonyms Matching
 */
export function scoreSynonymsAntonyms(
  userPicks: { synonyms: string[]; antonyms: string[] },
  actualSynonyms: string[],
  actualAntonyms: string[]
): { score: number; total: number; correctCount: number } {
  const normActualSyn = new Set(actualSynonyms.map(normalizeText));
  const normActualAnt = new Set(actualAntonyms.map(normalizeText));

  let correctCount = 0;
  userPicks.synonyms.forEach((w) => {
    if (normActualSyn.has(normalizeText(w))) correctCount++;
  });
  userPicks.antonyms.forEach((w) => {
    if (normActualAnt.has(normalizeText(w))) correctCount++;
  });

  const total = actualSynonyms.length + actualAntonyms.length;
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 100;
  return { score, total, correctCount };
}

/**
 * Cosine Similarity calculation for simulated or real vector embeddings
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Compute Question Navigator Stats
 */
export function calculateNavigatorStats(questions: QuestionData[]) {
  const total = questions.length;
  const correct = questions.filter((q) => q.status === 'correct').length;
  const incorrect = questions.filter((q) => q.status === 'incorrect').length;
  const unanswered = questions.filter((q) => q.status === 'unanswered').length;
  const bookmarked = questions.filter((q) => q.bookmarked).length;
  const accuracy = (correct + incorrect) > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0;

  return { total, correct, incorrect, unanswered, bookmarked, accuracy };
}
