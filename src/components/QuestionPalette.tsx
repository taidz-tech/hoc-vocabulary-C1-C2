import React from 'react';
import { QuestionData } from '../types/vocab';
import { CheckCircle2, XCircle, Bookmark, HelpCircle, Trophy } from 'lucide-react';

interface QuestionPaletteProps {
  questions: QuestionData[];
  currentIndex: number;
  onSelectQuestion: (index: number) => void;
  onToggleBookmark: (index: number) => void;
  exerciseTypeLabels: Record<string, string>;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  questions,
  currentIndex,
  onSelectQuestion,
  onToggleBookmark,
  exerciseTypeLabels,
}) => {
  const correctCount = questions.filter((q) => q.status === 'correct').length;
  const incorrectCount = questions.filter((q) => q.status === 'incorrect').length;
  const unansweredCount = questions.filter((q) => q.status === 'unanswered').length;
  const progressPercent = Math.round(((correctCount + incorrectCount) / Math.max(1, questions.length)) * 100);

  return (
    <aside aria-label="Bảng điều hướng câu hỏi" className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4">
      {/* Header and Progress */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Bảng Mục Lục Câu Hỏi</h3>
            <p className="text-[11px] text-slate-400">Điều hướng & Theo dõi tiến độ</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-indigo-400">{progressPercent}%</span>
          <span className="text-[10px] text-slate-400 block">Hoàn thành</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden flex">
        <div
          className="bg-emerald-500 h-full transition-all duration-300"
          style={{ width: `${(correctCount / questions.length) * 100}%` }}
          title={`Đúng: ${correctCount}`}
        />
        <div
          className="bg-rose-500 h-full transition-all duration-300"
          style={{ width: `${(incorrectCount / questions.length) * 100}%` }}
          title={`Sai: ${incorrectCount}`}
        />
      </div>

      {/* Stats Summary Pills */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-2 flex flex-col items-center">
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{correctCount}</span>
          </div>
          <span className="text-[10px] text-emerald-300/70 mt-0.5">Chính xác</span>
        </div>
        <div className="bg-rose-950/40 border border-rose-800/50 rounded-xl p-2 flex flex-col items-center">
          <div className="flex items-center gap-1 text-rose-400 font-bold">
            <XCircle className="w-3.5 h-3.5" />
            <span>{incorrectCount}</span>
          </div>
          <span className="text-[10px] text-rose-300/70 mt-0.5">Cần xem lại</span>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-2 flex flex-col items-center">
          <div className="flex items-center gap-1 text-slate-300 font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{unansweredCount}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">Chưa làm</span>
        </div>
      </div>

      {/* Questions Grid Matrix */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
          <span>Danh sách câu hỏi:</span>
          <span>{questions.length} câu</span>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-5 gap-2 max-h-[320px] overflow-y-auto pr-1">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            let statusClasses = 'bg-slate-800/70 text-slate-300 border-slate-700/80 hover:border-slate-500';

            if (q.status === 'correct') {
              statusClasses = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/25 shadow-sm shadow-emerald-900/30';
            } else if (q.status === 'incorrect') {
              statusClasses = 'bg-rose-500/15 text-rose-300 border-rose-500/50 hover:bg-rose-500/25 shadow-sm shadow-rose-900/30';
            }

            if (isCurrent) {
              statusClasses += ' ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 font-extrabold scale-105';
            }

            return (
              <button
                key={q.id}
                onClick={() => onSelectQuestion(idx)}
                aria-label={`Câu số ${idx + 1}: ${exerciseTypeLabels[q.type]} - Trạng thái: ${q.status}`}
                className={`relative h-11 rounded-xl border flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${statusClasses}`}
              >
                <span className="text-xs">{idx + 1}</span>
                <span className="text-[8px] opacity-70 uppercase tracking-tighter truncate max-w-[40px]">
                  {q.type.slice(0, 4)}
                </span>

                {/* Bookmark indicator */}
                {q.bookmarked && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-slate-900 flex items-center justify-center">
                    <Bookmark className="w-2 h-2 text-slate-950 fill-current" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Đúng</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Sai</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-2 ring-indigo-400/40" />
          <span>Đang chọn</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>Đánh dấu</span>
        </div>
      </div>
    </aside>
  );
};
