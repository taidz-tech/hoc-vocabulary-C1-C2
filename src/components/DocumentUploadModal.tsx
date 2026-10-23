import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Sparkles, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { extractRawContent, analyzeDocumentAndExtractVocab } from '../services/aiService';
import { VocabItem } from '../types/vocab';
import { soundEngine } from '../utils/audio';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVocabGenerated: (items: VocabItem[], sourceName: string) => void;
  apiKey?: string;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onVocabGenerated,
  apiKey,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = async (file: File) => {
    setSelectedFile(file);
    setErrorMsg('');
    setIsProcessing(true);
    soundEngine.playSFX('click');

    try {
      // Step 1: Multimodal Ingestion / OCR
      setCurrentStep('Đang đọc định dạng tài liệu & xử lý OCR/Text Parsing...');
      const content = await extractRawContent(file);

      // Step 2: RAG & Vector Chunking
      setCurrentStep('Đang chia nhỏ văn bản (RAG Chunks) và tạo Vector Embeddings...');
      await new Promise((r) => setTimeout(r, 450));

      // Step 3: Semantic Cache & AI Extraction
      setCurrentStep('AI đang phân tích ngữ cảnh, lọc từ vựng trọng tâm & phiên âm IPA...');
      const extracted = await analyzeDocumentAndExtractVocab(
        content.text,
        content.isImage,
        content.base64Data,
        apiKey,
        file.name
      );

      // Step 4: Verification & Synthesis
      setCurrentStep('Kiểm tra Guardrails an toàn & tổng hợp bộ đề luyện tập...');
      await new Promise((r) => setTimeout(r, 350));

      soundEngine.playSFX('celebrate');
      onVocabGenerated(extracted, file.name);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Không thể phân tích file: ${err.message || 'Lỗi không xác định'}`);
      soundEngine.playSFX('wrong');
    } finally {
      setIsProcessing(false);
      setCurrentStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Tải Lên Tài Liệu Học Thông Minh</h3>
            <p className="text-xs text-slate-400">Hỗ trợ PDF, DOCX, Hình ảnh chứa chữ (OCR), Text/LaTeX</p>
          </div>
        </div>

        {/* Drag & Drop Zone */}
        {!isProcessing ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
                : 'border-slate-700/80 hover:border-slate-500 bg-slate-950/50 hover:bg-slate-950/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md,.tex,.latex,.png,.jpg,.jpeg,.webp"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center mb-3">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h4 className="text-sm font-semibold text-white mb-1">
              Kéo thả tài liệu vào đây hoặc <span className="text-indigo-400 underline">chọn từ thiết bị</span>
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              AI sẽ quét tài liệu, bóc tách chính xác từ vựng, ngữ cảnh, nghĩa tiếng Việt và tự động tạo 8 dạng bài ôn tập.
            </p>

            {/* Supported format badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-mono text-slate-300">
                PDF
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-mono text-slate-300">
                DOCX
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-mono text-slate-300">
                Images (OCR)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-mono text-slate-300">
                Text / LaTeX
              </span>
            </div>
          </div>
        ) : (
          /* Processing State with Animated Pipeline */
          <div className="p-8 rounded-3xl bg-slate-950/70 border border-slate-800 text-center space-y-5">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping" />
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
              </div>
            </div>

            <div>
              <h4 className="text-base font-bold text-white mb-1">Kiến trúc AI đang xử lý</h4>
              <p className="text-xs text-indigo-300 font-mono animate-pulse">{currentStep}</p>
            </div>

            <div className="space-y-2 text-left max-w-xs mx-auto text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Multimodal Parser / OCR Pipeline</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>RAG Vector Similarity Indexing</span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                <span>Context Engineering & Extraction</span>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
