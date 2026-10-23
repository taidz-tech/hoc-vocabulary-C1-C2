import React, { useState, useEffect } from 'react';
import { VocabItem } from '../../types/vocab';
import { initHangman, guessHangmanLetter, HangmanState } from '../../utils/rules';
import { soundEngine } from '../../utils/audio';
import { ShieldAlert, Zap, Volume2, RotateCcw, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HangmanExerciseProps {
  vocab: VocabItem;
  onAnswer: (isCorrect: boolean, answer: string) => void;
  status: 'unanswered' | 'correct' | 'incorrect';
  onNext?: () => void;
}

export const HangmanExercise: React.FC<HangmanExerciseProps> = ({
  vocab,
  onAnswer,
  status,
  onNext,
}) => {
  const [gameState, setGameState] = useState<HangmanState>(() => initHangman(vocab.word, 6));

  useEffect(() => {
    setGameState(initHangman(vocab.word, 6));
  }, [vocab]);

  const handleGuess = (letter: string) => {
    if (gameState.isWon || gameState.isLost || status !== 'unanswered') return;

    const nextState = guessHangmanLetter(gameState, letter);
    setGameState(nextState);

    const isHit = nextState.word.includes(letter.toUpperCase());
    soundEngine.playSFX(isHit ? 'click' : 'wrong');

    if (nextState.isWon) {
      soundEngine.playSFX('celebrate');
      confetti({ particleCount: 70, spread: 60 });
      onAnswer(true, `Chiến thắng với ${nextState.remainingLives} mạng còn lại`);
    } else if (nextState.isLost) {
      soundEngine.playSFX('wrong');
      onAnswer(false, 'Hết lượt đoán');
    }
  };

  const handleReset = () => {
    if (status !== 'unanswered') return;
    setGameState(initHangman(vocab.word, 6));
    soundEngine.playSFX('click');
  };

  const lettersAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            Dạng 4: Hangman Tự Chơi (Bảo Vệ Năng Lượng)
          </span>
          <span className="text-xs text-slate-400">Đoán từng chữ cái để giải mã từ vựng</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Energy Battery Shields */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <ShieldAlert className="w-4 h-4 text-cyan-400 mr-1" />
            {[...Array(gameState.maxLives)].map((_, idx) => (
              <span
                key={idx}
                className={`w-2.5 h-4 rounded-sm transition-all duration-300 ${
                  idx < gameState.remainingLives
                    ? 'bg-gradient-to-t from-cyan-500 to-indigo-400 shadow-sm shadow-cyan-400/50'
                    : 'bg-slate-800 opacity-40'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleReset}
            disabled={status !== 'unanswered'}
            aria-label="Khởi động lại vòng đoán"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Clue Prompt */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 text-center shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-[11px] uppercase font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
            Gợi ý nghĩa:
          </span>
          <span className="text-xs text-slate-400 italic">[{vocab.partOfSpeech}]</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-1.5">{vocab.vietnameseMeaning}</h3>
        <p className="text-xs sm:text-sm text-slate-400 italic max-w-lg mx-auto">
          "{vocab.englishDefinition}"
        </p>
      </div>

      {/* Mystery Word Slots */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl min-h-[74px]">
        {gameState.word.split('').map((char, index) => {
          const isLetter = /[A-Z]/.test(char);
          const isRevealed = !isLetter || gameState.guessedLetters.has(char) || gameState.isLost;

          return (
            <div
              key={index}
              className={`w-10 h-13 sm:w-12 sm:h-14 rounded-2xl border flex items-center justify-center font-mono font-black text-xl transition-all ${
                isRevealed
                  ? 'bg-indigo-950/90 border-indigo-500 text-white shadow-lg shadow-indigo-950/60 scale-100'
                  : 'bg-slate-900/60 border-slate-700/80 text-transparent border-b-4 border-b-cyan-500'
              }`}
            >
              {isRevealed ? char : ''}
            </div>
          );
        })}
      </div>

      {/* Virtual A-Z Keyboard */}
      <div>
        <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-10 gap-1.5 sm:gap-2 max-w-xl mx-auto">
          {lettersAlphabet.map((letter) => {
            const isGuessed = gameState.guessedLetters.has(letter);
            const isHit = isGuessed && gameState.word.includes(letter);
            const isMiss = isGuessed && !gameState.word.includes(letter);

            let btnStyle = 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-cyan-400';
            if (isHit) btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 opacity-80';
            if (isMiss) btnStyle = 'bg-rose-950/50 border-rose-900 text-rose-400/50 opacity-40 line-through';

            return (
              <button
                key={letter}
                onClick={() => handleGuess(letter)}
                disabled={isGuessed || gameState.isWon || gameState.isLost || status !== 'unanswered'}
                className={`h-10 sm:h-11 rounded-xl border font-mono font-bold text-sm transition-all cursor-pointer disabled:cursor-not-allowed ${btnStyle}`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Outcome Banner */}
      {(gameState.isWon || gameState.isLost || status !== 'unanswered') && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
            gameState.isWon || status === 'correct'
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold text-sm">
                {gameState.isWon || status === 'correct'
                  ? 'Tuyệt vời! Bạn đã bảo vệ thành công năng lượng và đoán đúng từ.'
                  : 'Hết năng lượng! Hãy ghi nhớ từ vựng này nhé.'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs">Từ khóa:</span>
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
