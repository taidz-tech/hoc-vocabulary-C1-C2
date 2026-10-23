import React, { useState } from 'react';
import { VocabItem } from '../../types/vocab';
import { maskSentenceWithGap, checkGapFillAnswer } from '../../utils/rules';
import { soundEngine } from '../../utils/audio';
import { Lightbulb, Volume2, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GapFillExerciseProps {
  vocab: VocabItem;
  onAnswer: (isCorrect: boolean, answer: string) => void;
  status: 'unanswered' | 'correct' | 'incorrect';
  savedAnswer?: string;
  onNext?: () => void;
}

export const GapFillExercise: React.FC<GapFillExerciseProps> = ({
  vocab,
  onAnswer,
  status,
  savedAnswer,
  onNext,
}) => {
  const [userInput, setUserInput] = useState(savedAnswer || '');
  const [showHint, setShowHint] = useState(false);

  const { maskedText } = React.useMemo(() => {
    return maskSentenceWithGap(vocab.exampleSentence, vocab.word);
  }, [vocab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || status !== 'unanswered') return;

    const isCorrect = checkGapFillAnswer(userInput, vocab.word);
    if (isCorrect) {
      soundEngine.playSFX('correct');
      confetti({ particleCount: 50, spread: 60 });
    } else {
      soundEngine.playSFX('wrong');
    }

    onAnswer(isCorrect, userInput.trim());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-400">
            Dạng 6: Gap-filling (Điền từ vào ngữ cảnh)
          </span>
          <span className="text-xs text-slate-400">
            Dựa vào ngữ cảnh đoạn văn để điền từ thích hợp
          </span>
        </div>

        <button
          onClick={() => setShowHint(!showHint)}
          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>{showHint ? 'Ẩn gợi ý' : 'Hiện gợi ý'}</span>
        </button>
      </div>

      {/* Masked Sentence Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-xl space-y-4">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
          Đoạn văn ngữ cảnh:
        </span>

        <p className="text-lg sm:text-2xl font-serif leading-relaxed text-slate-100 max-w-2xl mx-auto">
          {maskedText.split('__________').map((part, i, arr) => (
            <React.Fragment key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="inline-block px-3 py-1 mx-1.5 rounded-lg bg-indigo-950/80 border-b-2 border-indigo-400 text-indigo-300 font-mono font-bold tracking-wider">
                  [ Chỗ Trống ]
                </span>
              )}
            </React.Fragment>
          ))}
        </p>

        <p className="text-xs sm:text-sm text-slate-400 italic">
          ➔ Dịch nghĩa ngữ cảnh: "{vocab.exampleTranslation}"
        </p>
      </div>

      {/* Clue Box if requested */}
      {showHint && (
        <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between text-xs text-amber-200">
          <div className="space-y-1">
            <span className="font-bold">Gợi ý từ AI:</span>
            <p>
              Từ này là một <span className="font-semibold underline">[{vocab.partOfSpeech}]</span>, bắt đầu bằng chữ cái{' '}
              <span className="font-mono font-black text-amber-300 text-sm">'{vocab.word[0].toUpperCase()}'</span>, có độ dài{' '}
              <span className="font-bold">{vocab.word.length}</span> chữ cái.
            </p>
            <p className="text-amber-300/80">Ý nghĩa: {vocab.vietnameseMeaning}</p>
          </div>
        </div>
      )}

      {/* Input Form */}
      {status === 'unanswered' ? (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Gõ từ tiếng Anh cần điền vào chỗ trống..."
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-2xl px-5 py-3.5 text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-medium"
          />
          <button
            type="submit"
            disabled={!userInput.trim()}
            className="px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-40"
          >
            Xác nhận
          </button>
        </form>
      ) : (
        /* Result Banner */
        <div
          className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
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
                {status === 'correct' ? 'Chính xác hoàn toàn!' : 'Chưa đúng!'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs">Đáp án:</span>
                <span className="font-mono font-extrabold text-base text-white underline">
                  {vocab.word}
                </span>
                {vocab.ipa && <span className="font-mono text-xs opacity-75">{vocab.ipa}</span>}
                <button
                  onClick={() => soundEngine.speakWord(vocab.word)}
                  aria-label={`Phát âm từ ${vocab.word}`}
                  className="p-1 rounded-full hover:bg-white/10"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {onNext && (
            <button
              onClick={onNext}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
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
