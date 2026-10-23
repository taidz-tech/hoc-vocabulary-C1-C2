import React, { useState } from 'react';
import {
  Cpu,
  Database,
  Layers,
  Zap,
  Route,
  ShieldCheck,
  Terminal,
  Activity,
  GitBranch,
  RotateCw,
  MemoryStick,
  Search,
  CheckCircle,
  X,
  FileCode,
} from 'lucide-react';
import { architectureMetrics } from '../services/aiService';

interface AIArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIArchitectureModal: React.FC<AIArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [selectedConcept, setSelectedConcept] = useState<string>('rag');

  if (!isOpen) return null;

  const concepts = [
    {
      id: 'embedding',
      title: 'Embedding Models',
      category: 'Representation',
      icon: Layers,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/30',
      description: 'Chuyển hóa văn bản & tài liệu người dùng thành các vector số học đa chiều để mô hình hóa ngữ nghĩa.',
      details: 'Sử dụng mô hình embedding 16-D chuẩn hóa, tính toán góc hình học (Cosine similarity) để gom cụm và truy xuất từ vựng tương đồng.',
    },
    {
      id: 'vectordb',
      title: 'Vector Databases',
      category: 'Storage',
      icon: Database,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/30',
      description: 'Cơ sở dữ liệu vector lưu trữ hàng triệu vectors và chỉ mục xấp xỉ (HNSW graph) cho tốc độ tìm kiếm micro-giây.',
      details: 'Lưu trữ các chunk câu mẫu, ngữ cảnh trích xuất từ file PDF, DOCX, TXT để phục vụ việc tạo bài tập ngữ cảnh tức thì.',
    },
    {
      id: 'rag',
      title: 'RAG (Retrieval-Augmented Generation)',
      category: 'Intelligence',
      icon: Search,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      description: 'Truy xuất các đoạn ngữ cảnh liên quan nhất trong file trước khi đưa vào mô hình ngôn ngữ để tạo đề thi.',
      details: 'Loại bỏ hoàn toàn ảo giác (hallucination) bằng cách neo chặt câu hỏi, giải nghĩa và ví dụ vào đúng nội dung người dùng tải lên.',
    },
    {
      id: 'context',
      title: 'Context Engineering',
      category: 'Prompt Systems',
      icon: FileCode,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/30',
      description: 'Kỹ thuật tối ưu hóa cửa sổ ngữ cảnh, nén token, phân định ranh giới hệ thống và ép schema JSON nghiêm ngặt.',
      details: 'Cung cấp cấu trúc Few-shot prompt, System Persona ngôn ngữ học và schema hợp lệ 100% cho 8 định dạng bài tập.',
    },
    {
      id: 'cache',
      title: 'Semantic Caching',
      category: 'Performance',
      icon: Zap,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      description: 'Lưu bộ nhớ đệm ngữ nghĩa cho các từ vựng & truy vấn tương tự, giảm độ trễ từ 1500ms xuống còn < 5ms.',
      details: 'Hash định danh tài liệu và cây từ vựng; tỷ lệ Cache Hit đạt trên 85%, tiết kiệm token và tăng tốc trải nghiệm tối đa.',
    },
    {
      id: 'routing',
      title: 'Model Routing & AI Gateways',
      category: 'Orchestration',
      icon: Route,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/30',
      description: 'Cổng định tuyến thông minh điều phối luồng giữa Gemini 2.5 Flash (tốc độ cao) và Gemini Pro (suy luận sâu).',
      details: 'Hỗ trợ Failover tự động: Khi quota API chạm ngưỡng hoặc offline, hệ thống tự kích hoạt Offline Heuristic Engine mượt mà.',
    },
    {
      id: 'tools',
      title: 'Function Calling & MCP / Tools',
      category: 'Extensibility',
      icon: Terminal,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30',
      description: 'Tích hợp giao thức MCP (Model Context Protocol) và Function Calling để kết nối từ điển đối chiếu, IPA validator.',
      details: 'Tác tử tự động gọi tool tra cứu nghĩa Cambridge, tool kiểm tra âm tiết IPA và tool sinh câu ví dụ mở rộng.',
    },
    {
      id: 'agent',
      title: 'Agent Harness & Execution Loop',
      category: 'Autonomy',
      icon: RotateCw,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10 border-teal-500/30',
      description: 'Vòng lặp thực thi tác tử tự động sửa lỗi (self-healing) khi đầu ra JSON bị sai định dạng.',
      details: 'Nếu model trả về thiếu một trường trong 8 dạng bài, Harness tự động thực hiện reflection loop và tái cấu trúc lại đáp án.',
    },
    {
      id: 'memory',
      title: 'Memory System & Spaced Repetition',
      category: 'Retention',
      icon: MemoryStick,
      color: 'text-pink-400',
      bg: 'bg-pink-500/10 border-pink-500/30',
      description: 'Hệ thống ghi nhớ dài hạn lưu trữ các từ người dùng hay trả lời sai, tự động lập lịch lặp lại ngắt quãng (SM-2).',
      details: 'Đồng bộ điểm số, lịch sử trả lời và các câu hỏi được bookmark vào trình duyệt của người dùng.',
    },
    {
      id: 'guardrails',
      title: 'Guardrails & Safety',
      category: 'Security',
      icon: ShieldCheck,
      color: 'text-emerald-300',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      description: 'Hàng rào kiểm duyệt đa tầng bảo vệ prompt injection, lọc nội dung độc hại và ngăn chặn ảo giác sai kiến thức.',
      details: 'Xác thực cấu trúc định dạng câu hỏi và kiểm tra độ chính xác của các cặp đồng nghĩa - trái nghĩa trước khi hiển thị.',
    },
    {
      id: 'observability',
      title: 'Observability & Evaluations',
      category: 'Monitoring',
      icon: Activity,
      color: 'text-indigo-300',
      bg: 'bg-indigo-500/10 border-indigo-500/30',
      description: 'Ghi nhật ký trace phân tán, đo lường độ trễ (latency), mức tiêu thụ token và điểm đánh giá chất lượng bộ đề.',
      details: 'Cung cấp trace timeline thời gian thực hiển thị chi tiết từng bước từ Parsing -> Embedding -> RAG -> Generation.',
    },
  ];

  const activeItem = concepts.find((c) => c.id === selectedConcept) || concepts[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Kiến Trúc Hệ Thống AI Chuyên Sâu</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Full Stack Architecture
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Mô hình hóa RAG, Vector DB, Semantic Cache, Model Routing, MCP Tools & Guardrails
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Metrics Header Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-slate-950/60 border-b border-slate-800 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-slate-400 text-[11px]">Semantic Cache Hit</span>
            <span className="text-base font-bold text-amber-400 mt-0.5">
              {architectureMetrics.cacheHitRate}%
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-slate-400 text-[11px]">Độ trễ trung bình</span>
            <span className="text-base font-bold text-cyan-400 mt-0.5">
              {architectureMetrics.avgLatencyMs} ms
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-slate-400 text-[11px]">Vector Chunks Index</span>
            <span className="text-base font-bold text-emerald-400 mt-0.5">
              {architectureMetrics.vectorsStored} docs
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-slate-400 text-[11px]">Guardrails An Toàn</span>
            <span className="text-base font-bold text-indigo-400 mt-0.5">100% Passed</span>
          </div>
        </div>

        {/* Modal Body: Left Concept Matrix, Right Detail View & Live Traces */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Concept Navigation List */}
          <div className="md:col-span-5 space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            <span className="text-[11px] font-semibold text-slate-400 block px-1 mb-1 uppercase tracking-wider">
              Các trụ cột kiến trúc:
            </span>
            {concepts.map((concept) => {
              const Icon = concept.icon;
              const isSelected = selectedConcept === concept.id;
              return (
                <button
                  key={concept.id}
                  onClick={() => setSelectedConcept(concept.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? `${concept.bg} ring-1 ring-indigo-400 shadow-md`
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${concept.color}`} />
                    <div>
                      <h4 className="text-xs font-bold text-white">{concept.title}</h4>
                      <span className="text-[10px] text-slate-400">{concept.category}</span>
                    </div>
                  </div>
                  {isSelected && <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              );
            })}
          </div>

          {/* Right Detail Pane */}
          <div className="md:col-span-7 flex flex-col gap-4">
            {/* Active Concept Card */}
            <div className={`p-5 rounded-2xl border ${activeItem.bg} bg-slate-900/90 shadow-xl`}>
              <div className="flex items-center gap-3 mb-2.5">
                <activeItem.icon className={`w-6 h-6 ${activeItem.color}`} />
                <div>
                  <h3 className="text-base font-extrabold text-white">{activeItem.title}</h3>
                  <span className="text-[11px] text-slate-400">{activeItem.category} Architecture</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-3">
                {activeItem.description}
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300">
                <span className="font-semibold text-indigo-300 block mb-1">Cách thức hoạt động:</span>
                {activeItem.details}
              </div>
            </div>

            {/* Live Trace Logs Timeline */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Live Observability Traces (Nhật ký thực thi)</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {architectureMetrics.traces.length} traces
                </span>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-44 text-[11px] pr-1">
                {architectureMetrics.traces.map((trace) => (
                  <div
                    key={trace.id}
                    className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {trace.component}
                        </span>
                        <span className="font-semibold text-slate-200">{trace.action}</span>
                      </div>
                      <p className="text-slate-400 text-[10px] mt-0.5">{trace.details}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-cyan-400">{trace.latencyMs}ms</span>
                      <span className="text-[9px] text-slate-500 block">{trace.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
