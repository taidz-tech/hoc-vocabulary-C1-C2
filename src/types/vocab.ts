export type ExerciseType = 
  | 'mcq'
  | 'scrabble'
  | 'memory'
  | 'hangman'
  | 'wordchain'
  | 'gapfill'
  | 'sentence'
  | 'synonym';

export interface VocabItem {
  id: string;
  word: string;
  ipa?: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase' | 'idiom';
  vietnameseMeaning: string;
  englishDefinition: string;
  exampleSentence: string;
  exampleTranslation: string;
  synonyms: string[];
  antonyms: string[];
  distractors?: string[]; // for multiple choice
  difficulty: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  contextSnippet?: string;
}

export type QuestionStatus = 'unanswered' | 'correct' | 'incorrect';

export interface QuestionData {
  id: string;
  index: number;
  type: ExerciseType;
  vocab: VocabItem;
  status: QuestionStatus;
  bookmarked: boolean;
  userAnswer?: any;
  timeSpentSeconds: number;
  aiExplanation?: string;
}

export interface AISettings {
  apiKey: string;
  provider: 'gemini' | 'openai';
  model: string;
  temperature: number;
  enableSemanticCache: boolean;
  enableGuardrails: boolean;
  enableRAG: boolean;
}

export interface TraceLog {
  id: string;
  timestamp: string;
  component: 'RAG' | 'Embedding' | 'Router' | 'Cache' | 'Guardrail' | 'Agent' | 'LLM';
  action: string;
  latencyMs: number;
  status: 'hit' | 'miss' | 'success' | 'warn';
  details: string;
}

export interface AIArchitectureMetrics {
  cacheHitRate: number;
  avgLatencyMs: number;
  totalTokens: number;
  vectorsStored: number;
  guardrailChecks: number;
  traces: TraceLog[];
}
