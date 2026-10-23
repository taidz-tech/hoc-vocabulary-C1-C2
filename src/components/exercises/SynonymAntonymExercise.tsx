import React, { useState, useEffect } from 'react';
import { VocabItem } from '../../types/vocab';
import { scoreSynonymsAntonyms } from '../../utils/rules';
import { soundEngine } from '../../utils/audio';
import { CheckCircle2, XCircle, ArrowRight, Volume2, Plus, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SynonymAntonymExerciseProps {
  vocab: VocabItem;
  onAnswer: (isCorrect: boolean, answer: any) => void;
  status: 'unanswered' | 'correct' | 'incorrect';
  savedAnswer?: any;
  onNext?: () => void;
}

export const SynonymAntonymExercise: React.FC<SynonymAntonymExerciseProps> = ({
  vocab,
  onAnswer,
  status,
  onNext,
}) => {
  const [synonymsList, setSynonymsList] = useState<string[]>([]);
  const [antonymsList, setAntonymsList] = useState<string[]>([]);
  const [candidatesPool, setCandidatesPool] = useState<string[]>([]);

  // Setup word bank
  useEffect(() => {
    const distractors = vocab.distractors || ['neutral', 'common', 'simple'];
    const pool = [...vocab.synonyms, ...vocab.antonyms, ...distractors];
    // Shuffle pool
    const shuffled = pool.sort(() => Math.random() - 0.5);
    setCandidatesPool(shuffled);
    setSynonymsList([]);
    setAntonymsList([]);
  }, [vocab]);

  const handleAddToBucket = (word: string, bucket: 'synonyms' | 'antonyms') => {
    if (status !== 'unanswered') return;
    soundEngine.playSFX('click');
    setCandidatesPool((prev) => prev.filter((w) => w !== word));
    if (bucket === 'synonyms') {
      setSynonymsList((prev) => [...prev, word]);
    } else {
      setAntonymsList((prev) => [...prev, word]);
    }
  };

  const handleRemoveFromBucket = (word: string, bucket: 'synonyms' | 'antonyms') => {
    if (status !== 'unanswered') return;
    soundEngine.playSFX('click');
    if (bucket === 'synonyms') {
      setSynonymsList((prev) => prev.filter((w) => w !== word));
    } else {
      setAntonymsList((prev) => prev.filter((w) => w !== word));
    }
    setCandidatesPool((prev) => [...prev, word]);
  };

  const handleSubmit = () => {
    if (status !== 'unanswered') return;
    const result = scoreSynonymsAntonyms(
      { synonyms: synonymsList, antonyms: antonymsList },
      vocab.synonyms,
      vocab.antonyms
    );

    const isPass = result.score >= 60;
    if (isPass) {
      soundEngine.playSFX('correct');
      confetti({ particleCount: 50, spread: 60 });
    } else {
      soundEngine.playSFX('wrong');
    }

    onAnswer(isPass, { synonyms: synonymsList, antonyms: antonymsList, score: result.score });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/15 border border-teal-500/30 text-teal-400">
            Dạng 8: Synonyms & Antonyms (Từ Đồng Nghĩa & Trái Nghĩa)
          </span>
          <span className="text-xs text-slate-400">
            Phân loại các từ tương ứng vào nhóm Đồng nghĩa hoặc Trái nghĩa
          </span>
        </div>
      </div>

      {/* Target Word Hero */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 text-center shadow-xl">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="text-xs uppercase font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
            {vocab.partOfSpeech}
          </span>
          {vocab.ipa && <span className="font-mono text-xs text-slate-400">{vocab.ipa}</span>}
          <button
            onClick={() => soundEngine.speakWord(vocab.word)}
            aria-label={`Phát âm từ ${vocab.word}`}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-300"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <h2 className="text-3xl font-extrabold text-white tracking-tight">{vocab.word}</h2>
        <p className="text-sm font-semibold text-indigo-400 mt-1">{vocab.vietnameseMeaning}</p>
        <p className="text-xs text-slate-400 italic max-w-md mx-auto mt-2">
          "{vocab.englishDefinition}"
        </p>
      </div>

      {/* Candidate Word Pool */}
      <div>
        <span className="text-xs text-slate-400 block mb-2 font-medium">
          Kho từ ứng viên (Nhấn vào nhóm tương ứng để xếp):
        </span>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap gap-2.5 min-h-[64px]">
          {candidatesPool.length === 0 ? (
            <span className="text-xs text-slate-500 italic self-center">
              Đã xếp hết các từ vào 2 nhóm bên dưới!
            </span>
          ) : (
            candidatesPool.map((word) => (
              <div
                key={word}
                className="inline-flex items-center gap-1.5 p-1.5 pl-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium"
              >
                <span>{word}</span>
                {status === 'unanswered' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleAddToBucket(word, 'synonyms')}
                      className="px-2 py-0.5 rounded-lg bg-teal-900/60 hover:bg-teal-700 text-teal-300 text-[10px] cursor-pointer"
                      title="Thêm vào Từ Đồng Nghĩa"
                    >
                      +Đồng nghĩa
                    </button>
                    <button
                      onClick={() => handleAddToBucket(word, 'antonyms')}
                      className="px-2 py-0.5 rounded-lg bg-rose-900/60 hover:bg-rose-700 text-rose-300 text-[10px] cursor-pointer"
                      title="Thêm vào Từ Trái Nghĩa"
                    >
                      +Trái nghĩa
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Two Buckets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Synonyms Bucket */}
        <div className="bg-teal-950/20 border border-teal-800/40 rounded-2xl p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-teal-800/30">
            <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
              <span>Từ Đồng Nghĩa (Synonyms)</span>
            </span>
            <span className="text-[11px] font-mono text-teal-300/80">
              {synonymsList.length} từ
            </span>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[60px]">
            {synonymsList.length === 0 ? (
              <span className="text-xs text-slate-500 italic self-center">Chưa có từ nào</span>
            ) : (
              synonymsList.map((w) => (
                <span
                  key={w}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-teal-900/40 border border-teal-600/50 text-teal-200 text-xs font-medium"
                >
                  {w}
                  {status === 'unanswered' && (
                    <button
                      onClick={() => handleRemoveFromBucket(w, 'synonyms')}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Antonyms Bucket */}
        <div className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-rose-800/30">
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <span>Từ Trái Nghĩa (Antonyms)</span>
            </span>
            <span className="text-[11px] font-mono text-rose-300/80">
              {antonymsList.length} từ
            </span>
          </div>

          <div className="flex flex-wrap gap-2 min-h-[60px]">
            {antonymsList.length === 0 ? (
              <span className="text-xs text-slate-500 italic self-center">Chưa có từ nào</span>
            ) : (
              antonymsList.map((w) => (
                <span
                  key={w}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-900/40 border border-rose-600/50 text-rose-200 text-xs font-medium"
                >
                  {w}
                  {status === 'unanswered' && (
                    <button
                      onClick={() => handleRemoveFromBucket(w, 'antonyms')}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Action / Result */}
      {status === 'unanswered' ? (
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={synonymsList.length === 0 && antonymsList.length === 0}
            className="px-8 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-xl shadow-teal-900/30 transition-all cursor-pointer disabled:opacity-40"
          >
            Kiểm tra phân loại
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
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {status === 'correct' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400" />
              )}
              <h4 className="font-bold text-sm">
                {status === 'correct' ? 'Phân loại rất tốt!' : 'Cần đối chiếu lại'}
              </h4>
            </div>
            <div className="text-xs text-slate-300">
              <p>
                <span className="text-teal-400 font-semibold">Đồng nghĩa chuẩn:</span>{' '}
                {vocab.synonyms.join(', ')}
              </p>
              <p>
                <span className="text-rose-400 font-semibold">Trái nghĩa chuẩn:</span>{' '}
                {vocab.antonyms.join(', ')}
              </p>
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
