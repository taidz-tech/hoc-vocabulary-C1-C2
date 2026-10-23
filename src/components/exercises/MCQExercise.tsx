import React, { useState } from 'react';
import { VocabItem } from '../../types/vocab';
import { Volume2, Sparkles, Check, X, ArrowRight } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface MCQExerciseProps {
  vocab: VocabItem;
  allVocabs: VocabItem[];
  onAnswer: (isCorrect: boolean, answer: string) => void;
  status: 'unanswered' | 'correct' | 'incorrect';
  savedAnswer?: string;
  onNext?: () => void;
}

export const MCQExercise: React.FC<MCQExerciseProps> = ({
  vocab,
  allVocabs,
  onAnswer,
  status,
  savedAnswer,
  onNext,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(savedAnswer || null);
  const [mode, setMode] = useState<'en-to-vi' | 'vi-to-en'>('en-to-vi');

  // Generate 4 options: 1 correct + 3 distractors
  const options = React.useMemo(() => {
    if (mode === 'en-to-vi') {
      const correct = vocab.vietnameseMeaning;
      // Pick 3 random other vocab meanings
      const others = allVocabs
        .filter((v) => v.id !== vocab.id)
        .map((v) => v.vietnameseMeaning)
        .slice(0, 3);
      
      const pool = [correct, ...others];
      // Shuffle options deterministically based on word length
      return pool.sort((a, b) => a.localeCompare(b));
    } else {
      const correct = vocab.word;
      const others = allVocabs
        .filter((v) => v.id !== vocab.id)
        .map((v) => v.word)
        .slice(0, 3);
      const pool = [correct, ...others];
      return pool.sort((a, b) => a.localeCompare(b));
    }
  }, [vocab, allVocabs, mode]);

  const handleSelect = (option: string) => {
    if (status !== 'unanswered') return;
    setSelectedOption(option);
    soundEngine.playSFX('click');

    const isCorrect =
      mode === 'en-to-vi'
        ? option === vocab.vietnameseMeaning
        : option.toLowerCase() === vocab.word.toLowerCase();

    onAnswer(isCorrect, option);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.speakWord(vocab.word);
    soundEngine.playSFX('click');
  };

  return (
    <div className="space-y-6">
      {/* Mode Switch & Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
            Dạng 1: Trắc Nghiệm (MCQ)
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300">
            CEFR: {vocab.difficulty}
          </span>
        </div>

        {/* Toggle en-to-vi or vi-to-en */}
        <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          <button
            onClick={() => {
              setMode('en-to-vi');
              setSelectedOption(null);
            }}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              mode === 'en-to-vi' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Từ Anh &rarr; Nghĩa Việt
          </button>
          <button
            onClick={() => {
              setMode('vi-to-en');
              setSelectedOption(null);
            }}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              mode === 'vi-to-en' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Nghĩa Việt &rarr; Từ Anh
          </button>
        </div>
      </div>

      {/* Target Word Card */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          {mode === 'en-to-vi' ? (
            <>
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  {vocab.partOfSpeech}
                </span>
                {vocab.ipa && (
                  <span className="text-sm font-['Charis_SIL',serif] tracking-wide text-indigo-200/90 bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-500/20">{vocab.ipa}</span>
                )}
                <button
                  onClick={handleSpeak}
                  aria-label={`Phát âm từ ${vocab.word}`}
                  className="p-1.5 rounded-full bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300 tracking-tight">
                {vocab.word}
              </h2>

              <p className="mt-3 text-xs sm:text-sm text-slate-400 max-w-lg mx-auto italic">
                "{vocab.englishDefinition}"
              </p>
            </>
          ) : (
            <>
              <span className="text-xs uppercase tracking-wider font-semibold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 mb-2 inline-block">
                Chọn từ tiếng Anh chính xác cho nghĩa:
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                {vocab.vietnameseMeaning}
              </h2>
            </>
          )}
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {options.map((option, idx) => {
          const isSelected = selectedOption === option;
          const isTargetCorrect =
            mode === 'en-to-vi'
              ? option === vocab.vietnameseMeaning
              : option.toLowerCase() === vocab.word.toLowerCase();

          let cardStyle =
            'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 text-slate-200 hover:border-indigo-500/50';

          if (status !== 'unanswered') {
            if (isTargetCorrect) {
              cardStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30';
            } else if (isSelected && !isTargetCorrect) {
              cardStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 ring-2 ring-rose-500/30';
            } else {
              cardStyle = 'bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(option)}
              disabled={status !== 'unanswered'}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between group cursor-pointer ${cardStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm sm:text-base font-medium">{option}</span>
              </div>

              {status !== 'unanswered' && isTargetCorrect && (
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              {status !== 'unanswered' && isSelected && !isTargetCorrect && (
                <X className="w-5 h-5 text-rose-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Context Sentence and Next Button */}
      {status !== 'unanswered' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-slate-300">
            <span className="font-semibold text-indigo-400 block mb-1">Ví dụ ứng dụng trong ngữ cảnh:</span>
            <p className="italic text-slate-200">"{vocab.exampleSentence}"</p>
            <p className="text-slate-400 text-xs mt-1">➔ {vocab.exampleTranslation}</p>
          </div>

          {onNext && (
            <button
              onClick={onNext}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-xs flex items-center gap-2 shrink-0 transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              <span>Câu tiếp theo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
