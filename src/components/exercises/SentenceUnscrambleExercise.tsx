import React, { useState, useEffect } from 'react';
import { VocabItem } from '../../types/vocab';
import { tokenizeSentence, shuffleTokens, checkSentenceUnscramble } from '../../utils/rules';
import { soundEngine } from '../../utils/audio';
import { RotateCcw, CheckCircle2, XCircle, ArrowRight, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SentenceUnscrambleExerciseProps {
  vocab: VocabItem;
  onAnswer: (isCorrect: boolean, answer: string) => void;
  status: 'unanswered' | 'correct' | 'incorrect';
  savedAnswer?: string;
  onNext?: () => void;
}

export const SentenceUnscrambleExercise: React.FC<SentenceUnscrambleExerciseProps> = ({
  vocab,
  onAnswer,
  status,
  onNext,
}) => {
  const [tokenPool, setTokenPool] = useState<{ id: string; text: string }[]>([]);
  const [placedTokens, setPlacedTokens] = useState<{ id: string; text: string }[]>([]);

  useEffect(() => {
    const rawTokens = tokenizeSentence(vocab.exampleSentence);
    const shuffled = shuffleTokens(rawTokens, vocab.word.length);
    setTokenPool(shuffled);
    setPlacedTokens([]);
  }, [vocab]);

  const handlePickToken = (token: { id: string; text: string }) => {
    if (status !== 'unanswered') return;
    soundEngine.playSFX('click');
    setTokenPool((prev) => prev.filter((t) => t.id !== token.id));
    setPlacedTokens((prev) => [...prev, token]);
  };

  const handleReturnToken = (token: { id: string; text: string }) => {
    if (status !== 'unanswered') return;
    soundEngine.playSFX('click');
    setPlacedTokens((prev) => prev.filter((t) => t.id !== token.id));
    setTokenPool((prev) => [...prev, token]);
  };

  const handleReset = () => {
    if (status !== 'unanswered') return;
    soundEngine.playSFX('click');
    const rawTokens = tokenizeSentence(vocab.exampleSentence);
    const shuffled = shuffleTokens(rawTokens, vocab.word.length);
    setTokenPool(shuffled);
    setPlacedTokens([]);
  };

  const handleSubmit = () => {
    if (status !== 'unanswered') return;
    const currentTextList = placedTokens.map((t) => t.text);
    const isCorrect = checkSentenceUnscramble(currentTextList, vocab.exampleSentence);

    if (isCorrect) {
      soundEngine.playSFX('correct');
      confetti({ particleCount: 65, spread: 60 });
    } else {
      soundEngine.playSFX('wrong');
    }

    onAnswer(isCorrect, currentTextList.join(' '));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-400">
            Dạng 7: Sắp Xếp Câu Ứng Dụng (Sentence Unscrambling)
          </span>
          <span className="text-xs text-slate-400">
            Ghép các từ thành câu văn hoàn chỉnh có nghĩa
          </span>
        </div>

        <button
          onClick={handleReset}
          disabled={status !== 'unanswered'}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer disabled:opacity-40"
          title="Làm mới lại câu"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Target Clue (Vietnamese translation) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center shadow-lg space-y-2">
        <span className="text-xs uppercase font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          Nghĩa tiếng Việt của câu cần ghép:
        </span>
        <h3 className="text-lg sm:text-xl font-bold text-white max-w-xl mx-auto">
          "{vocab.exampleTranslation}"
        </h3>
        <p className="text-xs text-slate-400">
          Từ vựng trọng tâm trong câu: <span className="text-indigo-400 font-bold">{vocab.word}</span> ({vocab.vietnameseMeaning})
        </p>
      </div>

      {/* Assembled Sentence Drop Area */}
      <div>
        <span className="text-xs text-slate-400 block mb-2">
          Câu bạn đang ghép (nhấn vào từ để gỡ bỏ):
        </span>
        <div className="min-h-[80px] p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center gap-2">
          {placedTokens.length === 0 ? (
            <span className="text-xs text-slate-500 italic">Chọn các từ bên dưới theo thứ tự ngữ pháp chính xác</span>
          ) : (
            placedTokens.map((token) => (
              <button
                key={token.id}
                onClick={() => handleReturnToken(token)}
                disabled={status !== 'unanswered'}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-md transition-all cursor-pointer transform active:scale-95"
              >
                {token.text}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Available Word Chips */}
      <div>
        <span className="text-xs text-slate-400 block mb-2">
          Các mảnh từ bị xáo trộn:
        </span>
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-wrap gap-2.5 min-h-[70px]">
          {tokenPool.map((token) => (
            <button
              key={token.id}
              onClick={() => handlePickToken(token)}
              disabled={status !== 'unanswered'}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 hover:border-blue-400 border border-slate-700 text-slate-200 font-medium text-sm transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-40"
            >
              {token.text}
            </button>
          ))}
          {tokenPool.length === 0 && placedTokens.length > 0 && status === 'unanswered' && (
            <span className="text-xs text-emerald-400 self-center animate-pulse">
              Đã dùng hết tất cả các từ! Nhấn "Kiểm tra đáp án" bên dưới.
            </span>
          )}
        </div>
      </div>

      {/* Action / Result */}
      {status === 'unanswered' ? (
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={placedTokens.length === 0}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-900/30 transition-all cursor-pointer disabled:opacity-40"
          >
            Kiểm tra đáp án
          </button>
        </div>
      ) : (
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
                {status === 'correct' ? 'Xuất sắc! Cấu trúc câu ngữ pháp chuẩn xác.' : 'Chưa hoàn toàn chính xác!'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold">Câu chuẩn:</span>
                <span className="text-sm font-medium text-white italic">
                  "{vocab.exampleSentence}"
                </span>
                <button
                  onClick={() => soundEngine.speakWord(vocab.exampleSentence)}
                  aria-label="Nghe đọc cả câu"
                  className="p-1 rounded-full hover:bg-white/10"
                >
                  <Volume2 className="w-3.5 h-3.5" />
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
