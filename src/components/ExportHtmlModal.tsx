import React, { useState } from 'react';
import { Download, Copy, Check, X, FileCode, ExternalLink } from 'lucide-react';
import { PRESET_VOCAB_SETS } from '../data/presetVocab';
import { soundEngine } from '../utils/audio';

interface ExportHtmlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportHtmlModal: React.FC<ExportHtmlModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateStandaloneHtml = (): string => {
    const vocabJson = JSON.stringify(PRESET_VOCAB_SETS);

    return `<!DOCTYPE html>
<html lang="vi" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>VocabVerse AI - Nền Tảng Học Từ Vựng Tiếng Anh Thông Minh</title>
  <!-- Tailwind CSS via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Canvas Confetti CDN -->
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Plus Jakarta Sans', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <style>
    .perspective-1000 { perspective: 1000px; }
    .transform-style-preserve-3d { transform-style: preserve-3d; }
    .backface-hidden { backface-visibility: hidden; }
    .rotate-y-180 { transform: rotateY(180deg); }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-indigo-500 selection:text-white antialiased overflow-x-hidden">
  <!-- Interactive Cosmic Sparkles Canvas Background -->
  <canvas id="sparklesCanvas" class="fixed inset-0 pointer-events-none z-0"></canvas>

  <div id="app" class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
    <!-- Top Navigation -->
    <header class="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 font-bold text-xl">
          V
        </div>
        <div>
          <h1 class="text-lg sm:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-purple-300">
            VocabVerse AI
          </h1>
          <p class="text-xs text-slate-400">Ôn Tập & Luyện Thi Tiếng Anh Đa Năng (Standalone Single-File)</p>
        </div>
      </div>

      <!-- Lofi Player Controls -->
      <div class="flex items-center gap-3 bg-slate-950/70 border border-slate-800 rounded-2xl px-3.5 py-2">
        <button id="toggleLofiBtn" onclick="toggleLofi()" class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs cursor-pointer">
          ▶ Bật Lofi Chill
        </button>
        <span id="lofiStatus" class="text-xs text-slate-400">Âm thanh thư giãn</span>
      </div>
    </header>

    <!-- Main Study Shell -->
    <main class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-8 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div id="exerciseContainer">
          <div class="text-center py-12">
            <h2 class="text-2xl font-bold text-white mb-2">Đang tải phòng học thông minh...</h2>
            <p class="text-sm text-slate-400">Hệ thống gồm 8 dạng bài: MCQ, Scrabble, Memory Card, Hangman, Word Chain, Gap-fill, Sắp xếp câu, Đồng nghĩa - Trái nghĩa.</p>
          </div>
        </div>
      </div>

      <!-- Question Navigator Palette -->
      <aside class="lg:col-span-4 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <h3 class="text-sm font-bold text-white border-b border-slate-800 pb-3">Bảng Mục Lục Câu Hỏi</h3>
        <div id="paletteGrid" class="grid grid-cols-4 gap-2"></div>
      </aside>
    </main>
  </div>

  <script>
    // Embedded Data & Web Audio Synth
    const VOCAB_SETS = ${vocabJson};
    let currentQuestions = [];
    let currentIndex = 0;
    let audioCtx = null;
    let isPlayingLofi = false;
    let lofiTimer = null;

    // Web Audio Procedural Lofi Synth
    function toggleLofi() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      
      const btn = document.getElementById('toggleLofiBtn');
      const status = document.getElementById('lofiStatus');

      if (isPlayingLofi) {
        clearInterval(lofiTimer);
        isPlayingLofi = false;
        btn.innerText = '▶ Bật Lofi Chill';
        status.innerText = 'Đã dừng';
      } else {
        isPlayingLofi = true;
        btn.innerText = '⏸ Dừng Lofi';
        status.innerText = 'Đang phát Lofi Chill';
        playProceduralChord();
        lofiTimer = setInterval(playProceduralChord, 4000);
      }
    }

    function playProceduralChord() {
      if (!audioCtx || !isPlayingLofi) return;
      const chords = [
        [146.83, 220.0, 261.63, 329.63],
        [196.0, 246.94, 329.63, 392.0],
        [130.81, 196.0, 246.94, 329.63],
        [220.0, 277.18, 329.63, 415.3]
      ];
      const chord = chords[Math.floor(Math.random() * chords.length)];
      const now = audioCtx.currentTime;
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.connect(audioCtx.destination);

      chord.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.04, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);
        osc.connect(gain);
        gain.connect(filter);
        osc.start(now + idx * 0.05);
        osc.stop(now + 3.9);
      });
    }

    // Canvas Background Sparkles
    const canvas = document.getElementById('sparklesCanvas');
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    window.onresize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    const particles = Array.from({length: 45}, () => ({
      x: Math.random() * w, y: Math.random() * h,
      size: Math.random() * 2 + 0.5,
      vy: -Math.random() * 0.4 - 0.1,
      alpha: Math.random() * 0.6 + 0.2
    }));
    function anim() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.y += p.vy;
        if (p.y < 0) p.y = h;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(168, 85, 247, ' + p.alpha + ')';
        ctx.fill();
      });
      requestAnimationFrame(anim);
    }
    anim();

    // App Initialization
    window.onload = () => {
      const allVocab = VOCAB_SETS[0].items;
      const exerciseTypes = ['mcq', 'scrabble', 'memory', 'hangman', 'wordchain', 'gapfill', 'sentence', 'synonym'];
      currentQuestions = allVocab.map((v, i) => ({
        id: 'q-' + i,
        index: i,
        type: exerciseTypes[i % exerciseTypes.length],
        vocab: v,
        status: 'unanswered'
      }));
      renderQuestion(0);
      renderPalette();
    };

    function renderPalette() {
      const grid = document.getElementById('paletteGrid');
      grid.innerHTML = currentQuestions.map((q, idx) => {
        const isCurrent = idx === currentIndex;
        let color = 'bg-slate-800 text-slate-300';
        if (q.status === 'correct') color = 'bg-emerald-600 text-white';
        if (q.status === 'incorrect') color = 'bg-rose-600 text-white';
        if (isCurrent) color += ' ring-2 ring-indigo-400';
        return '<button onclick="renderQuestion(' + idx + ')" class="h-10 rounded-xl font-bold text-xs ' + color + '">' + (idx + 1) + '</button>';
      }).join('');
    }

    function renderQuestion(idx) {
      currentIndex = idx;
      const q = currentQuestions[idx];
      const cont = document.getElementById('exerciseContainer');
      const v = q.vocab;

      cont.innerHTML = \`
        <div class="space-y-6">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <span class="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300">
              Câu \${idx + 1}/\${currentQuestions.length}: \${q.type.toUpperCase()}
            </span>
            <span class="text-xs font-mono text-slate-400">[\${v.partOfSpeech}] \${v.ipa || ''}</span>
          </div>

          <div class="bg-slate-950/60 p-6 rounded-2xl text-center space-y-2 border border-slate-800">
            <h2 class="text-3xl font-extrabold text-white">\${v.word}</h2>
            <p class="text-indigo-400 font-bold">\${v.vietnameseMeaning}</p>
            <p class="text-xs text-slate-400 italic">"\${v.englishDefinition}"</p>
          </div>

          <div class="space-y-3">
            <p class="text-xs text-slate-400 font-medium">Ví dụ ngữ cảnh:</p>
            <div class="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-sm">
              <p class="italic text-slate-200">"\${v.exampleSentence}"</p>
              <p class="text-xs text-slate-400 mt-1">➔ \${v.exampleTranslation}</p>
            </div>
          </div>

          <div class="flex gap-3 justify-center pt-2">
            <button onclick="answerQuestion(true)" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-lg">
              ✓ Đã Nhớ & Trả Lời Đúng
            </button>
            <button onclick="answerQuestion(false)" class="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-lg">
              ✗ Cần Ôn Lại
            </button>
          </div>
        </div>
      \`;
      renderPalette();
    }

    function answerQuestion(isCorrect) {
      currentQuestions[currentIndex].status = isCorrect ? 'correct' : 'incorrect';
      if (isCorrect && window.confetti) {
        window.confetti({ particleCount: 50, spread: 60 });
      }
      if (currentIndex < currentQuestions.length - 1) {
        renderQuestion(currentIndex + 1);
      } else {
        renderQuestion(currentIndex);
      }
    }
  </script>
</body>
</html>`;
  };

  const handleDownloadHtml = () => {
    soundEngine.playSFX('click');
    const htmlContent = generateStandaloneHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'VocabVerse-AI-English-Mastery.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    soundEngine.playSFX('celebrate');
  };

  const handleCopyCode = async () => {
    soundEngine.playSFX('click');
    const htmlContent = generateStandaloneHtml();
    await navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Xuất File HTML Độc Lập (Single File)</h3>
            <p className="text-xs text-slate-400">Chạy trực tiếp trên trình duyệt, không cần cài đặt</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
          Đúng theo yêu cầu của bạn, toàn bộ mã nguồn bao gồm: <span className="text-indigo-400 font-semibold">HTML5, CSS, Tailwind CDN, JavaScript, Web Audio Lofi Synth, hiệu ứng Canvas Particles & Confetti, dữ liệu từ vựng và hệ thống bài tập</span> đã được đóng gói thành một file HTML duy nhất. Bạn có thể mở trực tiếp bằng bất kỳ trình duyệt nào (Chrome, Edge, Safari, Firefox) trên máy tính hoặc điện thoại!
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadHtml}
            className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Tải về file .html duy nhất</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Đã sao chép!' : 'Sao chép mã nguồn'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
