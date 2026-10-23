import React, { useState, useEffect } from 'react';
import { VocabItem } from '../../types/vocab';
import { soundEngine } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, RotateCcw, ArrowRight } from 'lucide-react';

interface CardItem {
  id: string;
  vocabId: string;
  type: 'word' | 'meaning';
  content: string;
  subContent?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryCardExerciseProps {
  vocab: VocabItem;
  allVocabs: VocabItem[];
  onAnswer: (isCorrect: boolean, answer: string) => void;
  status: 'unanswered' | 'correct' | 'incorrect';
  onNext?: () => void;
}

export const MemoryCardExercise: React.FC<MemoryCardExerciseProps> = ({
  vocab,
  allVocabs,
  onAnswer,
  status,
  onNext,
}) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Initialize cards pool (4 pairs = 8 cards for optimal memory puzzle)
  const initializeGame = () => {
    // Current target vocab + 3 other vocabs
    const otherVocabs = allVocabs.filter((v) => v.id !== vocab.id).slice(0, 3);
    const chosen = [vocab, ...otherVocabs];

    const deck: CardItem[] = [];
    chosen.forEach((item) => {
      deck.push({
        id: `word-${item.id}`,
        vocabId: item.id,
        type: 'word',
        content: item.word,
        subContent: item.ipa,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        id: `meaning-${item.id}`,
        vocabId: item.id,
        type: 'meaning',
        content: item.vietnameseMeaning,
        subContent: item.partOfSpeech,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle deck
    const shuffled = deck.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsLocked(false);
  };

  useEffect(() => {
    initializeGame();
  }, [vocab]);

  const handleCardClick = (index: number) => {
    if (isLocked) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    soundEngine.playSFX('flip');

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsLocked(true);

      const [firstIdx, secondIdx] = newFlipped;
      const cardA = newCards[firstIdx];
      const cardB = newCards[secondIdx];

      // Check match: same vocabId and opposite card types
      if (cardA.vocabId === cardB.vocabId && cardA.type !== cardB.type) {
        // Matched!
        setTimeout(() => {
          soundEngine.playSFX('correct');
          newCards[firstIdx].isMatched = true;
          newCards[secondIdx].isMatched = true;
          setCards([...newCards]);
          setFlippedCards([]);
          setIsLocked(false);

          const nextMatches = matches + 1;
          setMatches(nextMatches);

          // If all pairs matched (4 pairs)
          if (nextMatches >= 4) {
            soundEngine.playSFX('celebrate');
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
            onAnswer(true, `Hoàn thành sau ${moves + 1} lượt`);
          }
        }, 500);
      } else {
        // Mismatch: flip back after brief reveal
        setTimeout(() => {
          soundEngine.playSFX('click');
          newCards[firstIdx].isFlipped = false;
          newCards[secondIdx].isFlipped = false;
          setCards([...newCards]);
          setFlippedCards([]);
          setIsLocked(false);
        }, 900);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            Dạng 3: Memory Card (Lật Thẻ Nhớ 3D)
          </span>
          <span className="text-xs text-slate-400">
            Lật và tìm các cặp tương ứng giữa Từ Vựng & Nghĩa
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
            Lượt lật: <span className="text-indigo-400 font-bold">{moves}</span>
          </div>
          <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
            Đã ghép: <span className="text-emerald-400 font-bold">{matches}/4</span>
          </div>
          <button
            onClick={initializeGame}
            aria-label="Xáo bài và chơi lại"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Memory Cards 3D Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 perspective-1000">
        {cards.map((card, idx) => {
          const isFlipped = card.isFlipped || card.isMatched;

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(idx)}
              className="h-32 sm:h-36 relative cursor-pointer select-none"
            >
              <div
                className={`w-full h-full duration-500 transform-style-preserve-3d transition-transform ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Card Back (Faced Down) */}
                <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950/80 border-2 border-indigo-500/20 hover:border-indigo-400/50 flex flex-col items-center justify-center p-3 shadow-lg group">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 mt-2">Vocab Card</span>
                </div>

                {/* Card Front (Faced Up) */}
                <div
                  className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center shadow-xl border-2 ${
                    card.isMatched
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                      : card.type === 'word'
                      ? 'bg-indigo-950/90 border-indigo-400 text-indigo-100'
                      : 'bg-purple-950/90 border-purple-400 text-purple-100'
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-wider font-semibold opacity-70 mb-1">
                    {card.type === 'word' ? 'English Word' : 'Ý Nghĩa'}
                  </span>
                  <p className="font-bold text-sm sm:text-base leading-tight">{card.content}</p>
                  {card.subContent && (
                    <span className="text-[11px] font-mono opacity-60 mt-1">
                      {card.subContent}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Banner */}
      {matches >= 4 && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-7 h-7 text-emerald-400" />
            <div>
              <h4 className="font-bold text-white text-sm">Tuyệt vời! Bạn đã ghép thành công tất cả thẻ nhớ</h4>
              <p className="text-xs text-emerald-300">Tổng số lượt thực hiện: {moves} lượt</p>
            </div>
          </div>
          {onNext && (
            <button
              onClick={onNext}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
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
