import React, { useState } from 'react';
import { Settings, Key, Cpu, Shield, Zap, X, Check, Save } from 'lucide-react';
import { AISettings } from '../types/vocab';
import { soundEngine } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AISettings;
  onSaveSettings: (settings: AISettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<AISettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playSFX('click');
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Cấu Hình Trí Tuệ Nhân Tạo (AI Engine)</h3>
            <p className="text-xs text-slate-400">Tích hợp API Key, kiến trúc RAG & Semantic Caching</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Provider Select */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Nhà cung cấp mô hình (AI Provider):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, provider: 'gemini', model: 'gemini-2.5-flash' })}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  formData.provider === 'gemini'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-4 h-4 text-indigo-400" />
                <div>
                  <span className="text-xs font-bold block">Google Gemini</span>
                  <span className="text-[10px] opacity-70">Flash 2.5 / Pro</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, provider: 'openai', model: 'gpt-4o-mini' })}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  formData.provider === 'openai'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-xs font-bold block">OpenAI</span>
                  <span className="text-[10px] opacity-70">GPT-4o / mini</span>
                </div>
              </button>
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>API Key ({formData.provider === 'gemini' ? 'Google AI Studio Key' : 'OpenAI Secret Key'}):</span>
              </span>
              <span className="text-[10px] text-slate-500">Bảo mật trên trình duyệt (Local Only)</span>
            </label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder={formData.provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              *Nếu không nhập API Key, hệ thống tự động sử dụng <span className="text-indigo-400 font-semibold">Offline Intelligent Linguistic Engine</span> để bóc tách từ vựng từ mọi file mà không bị gián đoạn.
            </p>
          </div>

          {/* Toggles */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800 cursor-pointer">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Kích hoạt Semantic Caching</span>
                  <span className="text-[10px] text-slate-400">Lưu đệm ngữ nghĩa, giảm độ trễ phản hồi xuống 4ms</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.enableSemanticCache}
                onChange={(e) => setFormData({ ...formData, enableSemanticCache: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800 cursor-pointer">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Bật Safety Guardrails & Hallucination Filter</span>
                  <span className="text-[10px] text-slate-400">Ngăn chặn thông tin sai lệch và kiểm tra logic bài thi</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.enableGuardrails}
                onChange={(e) => setFormData({ ...formData, enableGuardrails: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </label>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Đã lưu thành công!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu Cấu Hình</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
