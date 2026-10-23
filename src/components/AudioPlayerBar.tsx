import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, Upload, RotateCcw } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export const AudioPlayerBar: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [trackName, setTrackName] = useState('Chill Lofi Study Beats (Procedural Synth)');
  const [isCustomTrack, setIsCustomTrack] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setIsPlaying(soundEngine.isMusicPlaying());
  }, []);

  const handleTogglePlay = () => {
    const active = soundEngine.togglePlay();
    setIsPlaying(active);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
    soundEngine.setVolume(val);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      soundEngine.setVolume(volume > 0 ? volume : 0.4);
    } else {
      setIsMuted(true);
      soundEngine.setVolume(0);
    }
  };

  const handleCustomFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const fileName = await soundEngine.loadCustomAudio(file);
        setTrackName(`Nhạc cá nhân: ${fileName}`);
        setIsCustomTrack(true);
        setIsPlaying(true);
      } catch (err) {
        console.error('Audio load failed:', err);
      }
    }
  };

  const handleResetToLofi = () => {
    soundEngine.resetToBuiltinLofi();
    setTrackName('Chill Lofi Study Beats (Procedural Synth)');
    setIsCustomTrack(false);
    setIsPlaying(soundEngine.isMusicPlaying());
  };

  return (
    <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-800/90 rounded-2xl px-3.5 py-2 shadow-lg shadow-black/40">
      {/* Play/Pause Button */}
      <button
        onClick={handleTogglePlay}
        aria-label={isPlaying ? 'Tạm dừng nhạc nền' : 'Phát nhạc nền lofi'}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
          isPlaying
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400/30'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
        }`}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      {/* Animated Equalizer Wave / Info */}
      <div className="flex flex-col min-w-[130px] sm:min-w-[180px] max-w-[200px]">
        <div className="flex items-center gap-1.5">
          <Music className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-xs font-medium text-slate-200 truncate">{trackName}</span>
        </div>
        
        {/* Equalizer bars animation when playing */}
        <div className="flex items-center gap-1 mt-1 h-2">
          {[1, 2, 3, 4, 5, 6].map((bar) => (
            <span
              key={bar}
              className={`w-1 rounded-full bg-gradient-to-t from-indigo-500 to-cyan-400 transition-all duration-300 ${
                isPlaying ? 'animate-pulse' : 'h-1 opacity-30'
              }`}
              style={{
                height: isPlaying ? `${Math.sin(bar * 1.5) * 6 + 8}px` : '3px',
                animationDelay: `${bar * 120}ms`,
              }}
            />
          ))}
          <span className="text-[10px] text-slate-400 ml-1">
            {isPlaying ? 'Đang phát' : 'Đã dừng'}
          </span>
        </div>
      </div>

      {/* Volume control */}
      <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
        <button
          onClick={handleToggleMute}
          aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          aria-label="Thanh âm lượng nhạc nền"
          className="w-16 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      {/* Upload user music file */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleCustomFileUpload}
        className="hidden"
        aria-hidden="true"
      />

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => fileInputRef.current?.click()}
          aria-label="Tải tệp nhạc cá nhân từ thiết bị"
          title="Tải lên bài nhạc yêu thích của bạn (MP3, WAV, AAC...)"
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Tải nhạc lên</span>
        </button>

        {isCustomTrack && (
          <button
            onClick={handleResetToLofi}
            aria-label="Quay lại nhạc Lofi mặc định"
            title="Quay lại nhạc Lofi mặc định"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
