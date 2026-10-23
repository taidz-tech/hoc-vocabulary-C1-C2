import React, { useState, useEffect } from 'react';
import { VocabItem } from '../../types/vocab';
import { validateWordChain } from '../../utils/rules';
import { soundEngine } from '../../utils/audio';
import { Link2, Clock, Send, Bot, User, CheckCircle2, Trophy, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WordChainExerciseProps {
  vocab: VocabItem;
  onAnswer: (isCorrect: boolean, answer: string) => void;
  status: 'unanswered' | 'correct' | 'incorrect';
  onNext?: () => void;
}

interface ChainItem {
  id: string;
  sender: 'ai' | 'user';
  word: string;
}

export const WordChainExercise: React.FC<WordChainExerciseProps> = ({
  vocab,
  onAnswer,
  status,
  onNext,
}) => {
  const [chain, setChain] = useState<ChainItem[]>([]);
  const [inputWord, setInputWord] = useState('');
  const [timeLeft, setTimeLeft] = useState(35);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize chain with current target word
  useEffect(() => {
    setChain([
      {
        id: `c-start-${vocab.id}`,
        sender: 'ai',
        word: vocab.word.toLowerCase(),
      },
    ]);
    setInputWord('');
    setTimeLeft(35);
    setErrorMsg('');
    setIsCompleted(false);
  }, [vocab]);

  // Timer countdown
  useEffect(() => {
    if (status !== 'unanswered' || isCompleted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (chain.length >= 3) {
            handleComplete(true, 'Hoàn thành thử thách nối từ');
          } else {
            handleComplete(false, 'Hết thời gian nối từ');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status, isCompleted, chain.length]);

  const handleComplete = (isSuccess: boolean, reason: string) => {
    setIsCompleted(true);
    if (isSuccess) {
      soundEngine.playSFX('celebrate');
      confetti({ particleCount: 60, spread: 50 });
      onAnswer(true, reason);
    } else {
      soundEngine.playSFX('wrong');
      onAnswer(false, reason);
    }
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputWord.trim() || status !== 'unanswered' || isCompleted) return;

    const lastWord = chain[chain.length - 1].word;
    const validation = validateWordChain(lastWord, inputWord);

    if (!validation.valid) {
      setErrorMsg(validation.reason || 'Từ không hợp lệ');
      soundEngine.playSFX('wrong');
      return;
    }

    // Check if word already used in this chain
    if (chain.some((c) => c.word.toLowerCase() === inputWord.trim().toLowerCase())) {
      setErrorMsg('Từ này đã được dùng trước đó trong chuỗi!');
      soundEngine.playSFX('wrong');
      return;
    }

    setErrorMsg('');
    soundEngine.playSFX('correct');

    const cleanInput = inputWord.trim().toLowerCase();
    const newChain: ChainItem[] = [
      ...chain,
      {
        id: `c-user-${Date.now()}`,
        sender: 'user',
        word: cleanInput,
      },
    ];
    setChain(newChain);
    setInputWord('');

    // Check target length (e.g. 5 words chain = user victory!)
    if (newChain.length >= 5) {
      handleComplete(true, `Chiến thắng chuỗi ${newChain.length} từ liên hoàn!`);
      return;
    }

    // AI opponent responds with a matching word in 700ms
    const lastChar = cleanInput[cleanInput.length - 1];
    setTimeout(() => {
      const aiWordBank: Record<string, string[]> = {
        a: ['apple', 'anchor', 'academic', 'alchemy', 'abundant'],
        b: ['brave', 'balance', 'brilliant', 'benchmark', 'beacon'],
        c: ['creative', 'clarity', 'candid', 'catalyst', 'courage'],
        d: ['dynamic', 'diligent', 'diverse', 'delight', 'dialogue'],
        e: ['energy', 'eloquent', 'empathy', 'endless', 'epoch'],
        f: ['future', 'fluent', 'focus', 'freedom', 'flourish'],
        g: ['growth', 'genuine', 'genius', 'grace', 'global'],
        h: ['harmony', 'heuristic', 'humble', 'horizon', 'heart'],
        i: ['insight', 'infinite', 'inspire', 'impact', 'ingenious'],
        j: ['journey', 'joyful', 'justice', 'jubilee'],
        k: ['knowledge', 'kindness', 'keynote', 'kinetic'],
        l: ['logic', 'lucid', 'legacy', 'luminous', 'legend'],
        m: ['mindful', 'mastery', 'meticulous', 'matrix', 'modest'],
        n: ['noble', 'nexus', 'novelty', 'natural', 'nurture'],
        o: ['optimism', 'origin', 'orbit', 'organic', 'omnipresent'],
        p: ['pioneer', 'passion', 'patience', 'paradigm', 'precise'],
        q: ['quantum', 'quest', 'quality', 'quench'],
        r: ['resilient', 'radiant', 'reason', 'robust', 'renewal'],
        s: ['serendipity', 'synergy', 'sustainable', 'spark', 'sublime'],
        t: ['talent', 'tenacious', 'thrive', 'tactical', 'tempo'],
        u: ['ubiquitous', 'unique', 'unite', 'uplift', 'utopia'],
        v: ['vision', 'vibrant', 'vector', 'valiant', 'victory'],
        w: ['wisdom', 'wonder', 'worth', 'warmth', 'welcome'],
        x: ['xenon', 'xylophone'],
        y: ['yearning', 'yield', 'youthful'],
        z: ['zeal', 'zenith', 'zone'],
      };

      const candidates = aiWordBank[lastChar] || ['system', 'target', 'object'];
      const chosenWord = candidates[Math.floor(Math.random() * candidates.length)];

      setChain((prev) => [
        ...prev,
        {
          id: `c-ai-${Date.now()}`,
          sender: 'ai',
          word: chosenWord,
        },
      ]);
    }, 700);
  };

  const lastWord = chain[chain.length - 1]?.word || '';
  const requiredChar = lastWord ? lastWord[lastWord.length - 1].toUpperCase() : '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400">
            Dạng 5: Word Chain (Đấu Nối Từ Siêu Tốc)
          </span>
          <span className="text-xs text-slate-400">Nối chữ cái cuối thành chữ đầu từ mới</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <Clock className={`w-3.5 h-3.5 ${timeLeft <= 10 ? 'text-rose-400 animate-ping' : 'text-amber-400'}`} />
            <span className={timeLeft <= 10 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
              {timeLeft}s
            </span>
          </div>

          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-indigo-400">
            <Link2 className="w-3.5 h-3.5" />
            <span>Chuỗi: {chain.length}/5</span>
          </div>
        </div>
      </div>

      {/* Target Word Intro */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
        <span className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider block mb-1">
          Từ vựng mở đầu vòng đấu:
        </span>
        <span className="font-mono text-2xl font-black text-white">
          {vocab.word.toUpperCase()}
        </span>
        <p className="text-xs text-slate-400 mt-1">({vocab.vietnameseMeaning})</p>
      </div>

      {/* Chain Stream (Interactive chat flow) */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-4 sm:p-5 max-h-60 overflow-y-auto space-y-3">
        {chain.map((item, index) => {
          const isAI = item.sender === 'ai';
          const lastLetter = item.word[item.word.length - 1];

          return (
            <div
              key={item.id}
              className={`flex items-start gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}
            >
              {isAI && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3 rounded-2xl max-w-xs border shadow-md ${
                  isAI
                    ? 'bg-slate-900/90 border-slate-800 text-slate-200'
                    : 'bg-indigo-600 text-white border-indigo-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-base tracking-wide">
                    {item.word}
                  </span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-black/30 font-mono text-amber-300">
                    ➔ '{lastLetter.toUpperCase()}'
                  </span>
                </div>
                <span className="text-[10px] opacity-70 block mt-0.5">
                  #{index + 1} {isAI ? 'Đối thủ AI' : 'Bạn'}
                </span>
              </div>

              {!isAI && (
                <div className="w-7 h-7 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input Form */}
      {status === 'unanswered' && !isCompleted && (
        <form onSubmit={handleUserSubmit} className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputWord}
                onChange={(e) => {
                  setInputWord(e.target.value);
                  setErrorMsg('');
                }}
                placeholder={`Nhập từ tiếng Anh bắt đầu bằng chữ '${requiredChar}'...`}
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono"
              />
              <span className="absolute right-3.5 top-3.5 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Bắt đầu: '{requiredChar}'
              </span>
            </div>

            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              <span>Nối</span>
              <Send className="w-4 h-4" />
            </button>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 font-medium px-2">{errorMsg}</p>
          )}
        </form>
      )}

      {/* Completion Banner */}
      {(isCompleted || status !== 'unanswered') && (
        <div
          className={`p-5 rounded-2xl border flex items-center justify-between ${
            status === 'correct' || isCompleted
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Thử thách nối từ hoàn tất!</h4>
              <p className="text-xs text-slate-300">Tổng chuỗi đã tạo: {chain.length} từ</p>
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
