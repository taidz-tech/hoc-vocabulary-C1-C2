import React, { useState, useEffect } from 'react';
import { VocabItem } from '../../types/vocab';
import { generateScrabbleLetters, checkScrabbleAnswer } from '../../utils/rules';
import { soundEngine } from '../../utils/audio';
import { RotateCcw, Lightbulb, CheckCircle2, XCircle, ArrowRight, Volume2 } from 'lucide-react';

interface ScrabbleExerciseProps {
  vocab: VocabItem;
  onAnswer: (isCorrect: boolean, answer: string) => void;
  status: 'unanswered' | 'correct' | 'incorrect';
  savedAnswer?: string;
  onNext?: () => void;
}

export const ScrabbleExercise: React.FC<ScrabbleExerciseProps> = ({
  vocab,
  onAnswer,
  status,
  savedAnswer,
  onNext,
}) => {
  const [lettersPool, setLettersPool] = useState<{ id: string; char: string }[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<{ id: string; char: string }[]>([]);
  const [hintUsed, setHintUsed] = useState(false);

  // Initialize randomized letters pool
  useEffect(() => {
    const scrambled = generateScrabbleLetters(vocab.word, vocab.word.length);
    setLettersPool(scrambled);
    setSelectedLetters([]);
    setHintUsed(false);
  }, [vocab]);

  const handlePickLetter = (item: { id: string; char: string }) => {
    if (status !== 'unanswered') return;
    soundEngine.playSFX('click');
    setLettersPool((prev) => prev.filter((p) => p.id !== item.id));
    setSelectedLetters((prev) => [...prev, item]);
  };

  const handleReturnLetter = (item: { id: string; char: string }) => {
    if (status !== 'unanswered') return;
    soundEngine.playSFX('click');
    setSelectedLetters((prev) => prev.filter((p) => p.id !== item.id));
    setLettersPool((prev) => [...prev, item]);
  };

  const handleReset = () => {
    if (status !== 'unanswered') return;
    soundEngine.playSFX('click');
    const scrambled = generateScrabbleLetters(vocab.word, vocab.word.length);
    setLettersPool(scrambled);
    setSelectedLetters([]);
  };

  const handleHint = () => {
    if (status !== 'unanswered' || hintUsed) return;
    soundEngine.playSFX('click');
    const cleanWord = vocab.word.replace(/[^a-zA-Z]/g, '').toUpperCase();
    const firstChar = cleanWord[0];

    // Find letter in pool or reset and place first letter
    const matchInPool = lettersPool.find((l) => l.char === firstChar);
    if (matchInPool) {
      setLettersPool((prev) => prev.filter((p) => p.id !== matchInPool.id));
      setSelectedLetters((prev) => [matchInPool, ...prev]);
    }
    setHintUsed(true);
  };

  const handleSubmit = () => {
    if (status !== 'unanswered') return;
    const constructedWord = selectedLetters.map((l) => l.char).join('');
    const isCorrect = checkScrabbleAnswer(constructedWord, vocab.word);
    onAnswer(isCorrect, constructedWord);
  };

  const cleanTargetLength = vocab.word.replace(/[^a-zA-Z]/g, '').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-400">
            Dạng 2: Scrabble Words (Xếp chữ cái)
          </span>
          <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300">
            Độ dài: <span className="font-mono font-bold text-indigo-400">{cleanTargetLength}</span> ký tự
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleHint}
            disabled={hintUsed || status !== 'unanswered'}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Gợi ý ký tự đầu</span>
          </button>
          <button
            onClick={handleReset}
            disabled={status !== 'unanswered'}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer disabled:opacity-40"
            title="Làm mới lại"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Clue Prompt Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center shadow-lg">
        <span className="text-xs uppercase tracking-wider font-semibold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 mb-3 inline-block">
          Nghĩa của từ:
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
          {vocab.vietnameseMeaning}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 italic max-w-md mx-auto">
          "{vocab.englishDefinition}"
        </p>
      </div>

      {/* Target Word Slots (Assembled word) */}
      <div>
        <span className="text-xs text-slate-400 block text-center mb-2">
          Từ bạn đang ghép (nhấn vào chữ cái để gỡ bỏ):
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2 min-h-[58px] p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          {selectedLetters.length === 0 ? (
            <span className="text-xs text-slate-500 italic">Chọn các chữ cái bên dưới để ghép từ</span>
          ) : (
            selectedLetters.map((item) => (
              <button
                key={item.id}
                onClick={() => handleReturnLetter(item)}
                disabled={status !== 'unanswered'}
                className="w-11 h-12 rounded-xl bg-gradient-to-t from-indigo-700 to-indigo-500 text-white font-mono font-bold text-lg shadow-md shadow-indigo-900/50 flex items-center justify-center transform active:scale-95 transition-all cursor-pointer hover:bg-indigo-600"
              >
                {item.char}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Scrambled Rack (Available Letters) */}
      <div>
        <span className="text-xs text-slate-400 block text-center mb-2">
          Kho ký tự xáo trộn:
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2.5 min-h-[64px] p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
          {lettersPool.map((item) => (
            <button
              key={item.id}
              onClick={() => handlePickLetter(item)}
              disabled={status !== 'unanswered'}
              className="w-12 h-13 rounded-2xl bg-slate-800 hover:bg-indigo-600/80 hover:text-white border border-slate-700 text-slate-200 font-mono font-extrabold text-xl shadow-md transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer disabled:opacity-40"
            >
              {item.char}
            </button>
          ))}
          {lettersPool.length === 0 && selectedLetters.length > 0 && status === 'unanswered' && (
            <span className="text-xs text-emerald-400 animate-pulse">
              Đã chọn hết các chữ cái! Nhấn "Kiểm tra đáp án" bên dưới.
            </span>
          )}
        </div>
      </div>

      {/* Action Submit Button */}
      {status === 'unanswered' ? (
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={selectedLetters.length === 0}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-900/30 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            Kiểm tra đáp án
          </button>
        </div>
      ) : (
        /* Result Feedback */
        <div className="space-y-4">
          <div
            className={`p-5 rounded-2xl border flex items-center justify-between ${
              status === 'correct'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {status === 'correct' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
              )}
              <div>
                <p className="font-bold text-sm">
                  {status === 'correct' ? 'Tuyệt vời! Bạn đã sắp xếp chuẩn xác.' : 'Chưa chính xác!'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs">Đáp án đúng là:</span>
                  <span className="font-mono font-extrabold text-sm underline text-white">
                    {vocab.word}
                  </span>
                  {vocab.ipa && <span className="font-mono text-xs opacity-70">{vocab.ipa}</span>}
                  <button
                    onClick={() => soundEngine.speakWord(vocab.word)}
                    aria-label={`Phát âm từ ${vocab.word}`}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {onNext && (
              <button
                onClick={onNext}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
              >
                <span>Tiếp tục</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
