import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Upload,
  Cpu,
  FileCode,
  Settings as SettingsIcon,
  BookOpen,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Award,
  RefreshCw,
  Layers,
  Lightbulb,
} from 'lucide-react';
import { VocabItem, QuestionData, ExerciseType, AISettings } from './types/vocab';
import { PRESET_VOCAB_SETS, VocabSet } from './data/presetVocab';
import { BackgroundParticles } from './components/BackgroundParticles';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { QuestionPalette } from './components/QuestionPalette';
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { AIArchitectureModal } from './components/AIArchitectureModal';
import { ExportHtmlModal } from './components/ExportHtmlModal';
import { SettingsModal } from './components/SettingsModal';

// 8 Exercise Components
import { MCQExercise } from './components/exercises/MCQExercise';
import { ScrabbleExercise } from './components/exercises/ScrabbleExercise';
import { MemoryCardExercise } from './components/exercises/MemoryCardExercise';
import { HangmanExercise } from './components/exercises/HangmanExercise';
import { WordChainExercise } from './components/exercises/WordChainExercise';
import { GapFillExercise } from './components/exercises/GapFillExercise';
import { SentenceUnscrambleExercise } from './components/exercises/SentenceUnscrambleExercise';
import { SynonymAntonymExercise } from './components/exercises/SynonymAntonymExercise';

import { soundEngine } from './utils/audio';

const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  mcq: 'Trắc nghiệm (MCQ)',
  scrabble: 'Scrabble (Xếp chữ)',
  memory: 'Memory Card (Lật thẻ)',
  hangman: 'Hangman (Đoán chữ)',
  wordchain: 'Word Chain (Nối từ)',
  gapfill: 'Gap-filling (Điền từ)',
  sentence: 'Sắp xếp câu ứng dụng',
  synonym: 'Đồng nghĩa & Trái nghĩa',
};

const ALL_EXERCISE_TYPES: ExerciseType[] = [
  'mcq',
  'scrabble',
  'memory',
  'hangman',
  'wordchain',
  'gapfill',
  'sentence',
  'synonym',
];

export default function App() {
  const [activeSetId, setActiveSetId] = useState<string>('ielts-academic');
  const [customVocabSets, setCustomVocabSets] = useState<VocabSet[]>([]);
  const [activeExerciseFilter, setActiveExerciseFilter] = useState<'all' | ExerciseType>('all');
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // AI Settings
  const [aiSettings, setAiSettings] = useState<AISettings>({
    apiKey: '',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    temperature: 0.2,
    enableSemanticCache: true,
    enableGuardrails: true,
    enableRAG: true,
  });

  // Current active vocab items
  const activeSet = useMemo(() => {
    return (
      customVocabSets.find((s) => s.id === activeSetId) ||
      PRESET_VOCAB_SETS.find((s) => s.id === activeSetId) ||
      PRESET_VOCAB_SETS[0]
    );
  }, [activeSetId, customVocabSets]);

  // Build question queue when active set or exercise filter changes
  useEffect(() => {
    const vocabs = activeSet.items;
    const generated: QuestionData[] = vocabs.map((vocab, idx) => {
      let chosenType: ExerciseType;
      if (activeExerciseFilter === 'all') {
        chosenType = ALL_EXERCISE_TYPES[idx % ALL_EXERCISE_TYPES.length];
      } else {
        chosenType = activeExerciseFilter;
      }

      return {
        id: `q-${activeSet.id}-${idx}-${chosenType}`,
        index: idx,
        type: chosenType,
        vocab,
        status: 'unanswered',
        bookmarked: false,
        timeSpentSeconds: 0,
      };
    });

    setQuestions(generated);
    setCurrentIndex(0);
  }, [activeSet, activeExerciseFilter]);

  const currentQuestion = questions[currentIndex] || questions[0];

  const handleAnswerQuestion = (isCorrect: boolean, answerData: any) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx === currentIndex) {
          return {
            ...q,
            status: isCorrect ? 'correct' : 'incorrect',
            userAnswer: answerData,
          };
        }
        return q;
      })
    );
  };

  const handleToggleBookmark = (index: number) => {
    soundEngine.playSFX('click');
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx === index) {
          return { ...q, bookmarked: !q.bookmarked };
        }
        return q;
      })
    );
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      soundEngine.playSFX('click');
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      soundEngine.playSFX('click');
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleCustomVocabGenerated = (items: VocabItem[], sourceName: string) => {
    const newSet: VocabSet = {
      id: `custom-${Date.now()}`,
      name: `Tài liệu: ${sourceName}`,
      description: `Được AI phân tích và bóc tách từ file "${sourceName}"`,
      badge: 'User Document',
      items,
    };
    setCustomVocabSets((prev) => [newSet, ...prev]);
    setActiveSetId(newSet.id);
  };

  const handleShuffleTypes = () => {
    soundEngine.playSFX('click');
    setQuestions((prev) =>
      prev.map((q, idx) => ({
        ...q,
        type: ALL_EXERCISE_TYPES[Math.floor(Math.random() * ALL_EXERCISE_TYPES.length)],
        status: 'unanswered',
      }))
    );
    setCurrentIndex(0);
  };

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background Particles Canvas & Orbs */}
      <BackgroundParticles />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 flex-1 flex flex-col gap-6">
        {/* Top Navbar */}
        <header className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-600/30 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-purple-300">
                  VocabVerse AI
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">
                  Nền Tảng Ôn Tập & Luyện Đề Tiếng Anh Thông Minh
                </p>
              </div>
            </div>

            {/* Mobile quick actions */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setIsUploadOpen(true)}
                aria-label="Tải lên tài liệu"
                className="p-2 rounded-xl bg-indigo-600 text-white"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Tools & Audio Player */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 w-full md:w-auto">
            {/* Background Lofi Player */}
            <AudioPlayerBar />

            {/* Document Upload Button */}
            <button
              onClick={() => setIsUploadOpen(true)}
              aria-label="Tải lên tài liệu học thông minh"
              className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải file thông minh</span>
            </button>

            {/* AI Architecture Visualizer Button */}
            <button
              onClick={() => setIsArchitectureOpen(true)}
              aria-label="Xem kiến trúc AI System"
              className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Kiến trúc AI</span>
            </button>

            {/* Export Single HTML File */}
            <button
              onClick={() => setIsExportOpen(true)}
              aria-label="Xuất file HTML đơn nhất"
              title="Tải mã nguồn HTML/JS/CSS gom gọn duy nhất để mở trực tiếp trên trình duyệt"
              className="px-3 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Xuất file HTML</span>
            </button>

            {/* Settings button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Cài đặt AI & API Key"
              className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Vocab Set Switcher & Exercise Mode Filters Bar */}
        <section aria-label="Bộ chọn chủ đề từ vựng" className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Active Vocab Set Picker */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs text-slate-400 shrink-0">Chủ đề từ vựng:</span>
            <select
              value={activeSetId}
              onChange={(e) => setActiveSetId(e.target.value)}
              aria-label="Chọn danh mục bộ từ vựng"
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer max-w-xs truncate"
            >
              {customVocabSets.length > 0 && (
                <optgroup label="Tài liệu bạn đã tải lên">
                  {customVocabSets.map((s) => (
                    <option key={s.id} value={s.id}>
                      📁 {s.name} ({s.items.length} từ)
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Bộ từ vựng chuẩn hóa">
                {PRESET_VOCAB_SETS.map((s) => (
                  <option key={s.id} value={s.id}>
                    ⭐ {s.name} ({s.badge})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Exercise Formats Dropdown / Quick Shuffle */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs text-slate-400">Dạng bài tập:</span>
            <select
              value={activeExerciseFilter}
              onChange={(e) => setActiveExerciseFilter(e.target.value as any)}
              aria-label="Lọc dạng bài tập cụ thể"
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-indigo-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">🎲 Xáo trộn ngẫu nhiên cả 8 dạng bài</option>
              {ALL_EXERCISE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {EXERCISE_TYPE_LABELS[t]}
                </option>
              ))}
            </select>

            <button
              onClick={handleShuffleTypes}
              aria-label="Xáo trộn lại các dạng câu hỏi"
              title="Xáo trộn ngẫu nhiên dạng bài tập"
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Xáo trộn</span>
            </button>
          </div>
        </section>

        {/* Main Stage Grid (Exercise Area + Question Palette) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Exercise Card */}
          <main className="lg:col-span-8 bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
            {/* Question Top Navigation bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">
                  Câu {currentIndex + 1} / {questions.length}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 truncate max-w-[180px] sm:max-w-xs">
                  {activeSet.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Bookmark Toggle */}
                <button
                  onClick={() => handleToggleBookmark(currentIndex)}
                  aria-label={currentQuestion?.bookmarked ? 'Bỏ đánh dấu câu này' : 'Đánh dấu câu này để xem lại'}
                  className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                    currentQuestion?.bookmarked
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${currentQuestion?.bookmarked ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">
                    {currentQuestion?.bookmarked ? 'Đã lưu' : 'Đánh dấu'}
                  </span>
                </button>

                {/* Prev / Next controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    aria-label="Câu hỏi trước"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentIndex === questions.length - 1}
                    aria-label="Câu hỏi tiếp theo"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Exercise Renderer Switch based on currentQuestion.type */}
            {currentQuestion && (
              <div key={currentQuestion.id} className="min-h-[420px] flex flex-col justify-between">
                {currentQuestion.type === 'mcq' && (
                  <MCQExercise
                    vocab={currentQuestion.vocab}
                    allVocabs={activeSet.items}
                    onAnswer={handleAnswerQuestion}
                    status={currentQuestion.status}
                    savedAnswer={currentQuestion.userAnswer}
                    onNext={currentIndex < questions.length - 1 ? handleNext : undefined}
                  />
                )}

                {currentQuestion.type === 'scrabble' && (
                  <ScrabbleExercise
                    vocab={currentQuestion.vocab}
                    onAnswer={handleAnswerQuestion}
                    status={currentQuestion.status}
                    savedAnswer={currentQuestion.userAnswer}
                    onNext={currentIndex < questions.length - 1 ? handleNext : undefined}
                  />
                )}

                {currentQuestion.type === 'memory' && (
                  <MemoryCardExercise
                    vocab={currentQuestion.vocab}
                    allVocabs={activeSet.items}
                    onAnswer={handleAnswerQuestion}
                    status={currentQuestion.status}
                    onNext={currentIndex < questions.length - 1 ? handleNext : undefined}
                  />
                )}

                {currentQuestion.type === 'hangman' && (
                  <HangmanExercise
                    vocab={currentQuestion.vocab}
                    onAnswer={handleAnswerQuestion}
                    status={currentQuestion.status}
                    onNext={currentIndex < questions.length - 1 ? handleNext : undefined}
                  />
                )}

                {currentQuestion.type === 'wordchain' && (
                  <WordChainExercise
                    vocab={currentQuestion.vocab}
                    onAnswer={handleAnswerQuestion}
                    status={currentQuestion.status}
                    onNext={currentIndex < questions.length - 1 ? handleNext : undefined}
                  />
                )}

                {currentQuestion.type === 'gapfill' && (
                  <GapFillExercise
                    vocab={currentQuestion.vocab}
                    onAnswer={handleAnswerQuestion}
                    status={currentQuestion.status}
                    savedAnswer={currentQuestion.userAnswer}
                    onNext={currentIndex < questions.length - 1 ? handleNext : undefined}
                  />
                )}

                {currentQuestion.type === 'sentence' && (
                  <SentenceUnscrambleExercise
                    vocab={currentQuestion.vocab}
                    onAnswer={handleAnswerQuestion}
                    status={currentQuestion.status}
                    savedAnswer={currentQuestion.userAnswer}
                    onNext={currentIndex < questions.length - 1 ? handleNext : undefined}
                  />
                )}

                {currentQuestion.type === 'synonym' && (
                  <SynonymAntonymExercise
                    vocab={currentQuestion.vocab}
                    onAnswer={handleAnswerQuestion}
                    status={currentQuestion.status}
                    savedAnswer={currentQuestion.userAnswer}
                    onNext={currentIndex < questions.length - 1 ? handleNext : undefined}
                  />
                )}
              </div>
            )}

            {/* AI Encouragement Coach Banner */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center gap-3 text-xs text-slate-400">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Lightbulb className="w-3.5 h-3.5" />
              </div>
              <p className="italic">
                <span className="font-semibold text-slate-300">Lời khuyên từ AI Coach:</span>{' '}
                {currentQuestion?.status === 'correct'
                  ? 'Tuyệt vời! Bạn đang củng cố phản xạ từ vựng rất vững chắc. Hãy tiếp tục duy trì đà tiến này!'
                  : currentQuestion?.status === 'incorrect'
                  ? 'Không sao cả! Hãy đọc kỹ ngữ cảnh câu ví dụ và nhấn biểu tượng loa để lắng nghe chuẩn xác âm tiết nhé.'
                  : 'Đọc kỹ ngữ cảnh và thử suy luận từ loại (danh từ, động từ, tính từ) để làm bài chuẩn xác nhất.'}
              </p>
            </div>
          </main>

          {/* Right Question Palette / Navigator */}
          <div className="lg:col-span-4 sticky top-6">
            <QuestionPalette
              questions={questions}
              currentIndex={currentIndex}
              onSelectQuestion={(idx) => {
                soundEngine.playSFX('click');
                setCurrentIndex(idx);
              }}
              onToggleBookmark={handleToggleBookmark}
              exerciseTypeLabels={EXERCISE_TYPE_LABELS}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950/70 backdrop-blur-md py-4 text-center text-xs text-slate-500">
        <p>
          VocabVerse AI • Nền tảng ôn tập từ vựng tiếng Anh hiện đại • Tích hợp RAG, Embedding, Semantic Cache & 8 dạng bài tập game hóa.
        </p>
      </footer>

      {/* Modals */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onVocabGenerated={handleCustomVocabGenerated}
        apiKey={aiSettings.apiKey}
      />

      <AIArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      <ExportHtmlModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={aiSettings}
        onSaveSettings={(s) => setAiSettings(s)}
      />
    </div>
  );
}
