import React, { useState } from 'react';
import { ObstacleBarrier } from '../types';
import { AlertTriangle, CheckCircle2, XCircle, Lightbulb, HelpCircle } from 'lucide-react';

interface QuizModalProps {
  barrier: ObstacleBarrier | null;
  onAnswerCorrect: (barrierId: number) => void;
  onAnswerIncorrect: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  barrier,
  onAnswerCorrect,
  onAnswerIncorrect,
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [failedAttempts, setFailedAttempts] = useState<number[]>([]);
  const [showHint, setShowHint] = useState<boolean>(false);

  if (!barrier) return null;

  const q = barrier.question;

  const handleSelectOption = (idx: number) => {
    // If already solved or previously failed this option, ignore
    if (isCorrect || failedAttempts.includes(idx)) return;

    setSelectedIdx(idx);

    if (idx === q.correctIndex) {
      setIsCorrect(true);
      setTimeout(() => {
        onAnswerCorrect(barrier.id);
        // Reset states
        setSelectedIdx(null);
        setIsCorrect(null);
        setFailedAttempts([]);
        setShowHint(false);
      }, 1300);
    } else {
      setIsCorrect(false);
      setFailedAttempts(prev => [...prev, idx]);
      setShowHint(true);
      onAnswerIncorrect();
      // Auto clear error banner after 2s so they can try again smoothly
      setTimeout(() => {
        setIsCorrect(null);
      }, 2000);
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-xl bg-slate-950 border-2 border-cyan-500 rounded-lg shadow-2xl shadow-cyan-500/20 overflow-hidden font-mono">
        {/* Terminal Header */}
        <div className="bg-slate-900 border-b border-cyan-500/40 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-arcade text-cyan-400 tracking-wider">
              {barrier.title}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded text-[10px] font-arcade text-cyan-300">
            <span>MÔN: {q.subjectName.toUpperCase()}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Situation banner */}
          <div className="flex items-start gap-2.5 bg-slate-900/90 border border-amber-500/40 rounded p-2.5 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              {barrier.description} (Vượt qua chướng ngại vật bằng cách trả lời đúng).
            </span>
          </div>

          {/* Question Box */}
          <div className="bg-slate-900 border border-slate-700 rounded-md p-4 shadow-inner">
            <div className="flex items-center gap-2 mb-2 text-cyan-400 text-xs font-arcade">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>CÂU HỎI KIỂM SOÁT:</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
              {q.question}
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {q.options.map((opt, idx) => {
              const isFailed = failedAttempts.includes(idx);
              const isRight = isCorrect && idx === q.correctIndex;
              const isWrongChosen = isCorrect === false && selectedIdx === idx;

              let btnStyle = 'bg-slate-900 border-slate-700 hover:border-cyan-400 text-slate-200 hover:bg-slate-800/80';
              if (isRight) {
                btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500';
              } else if (isWrongChosen || isFailed) {
                btnStyle = 'bg-red-950/60 border-red-500/60 text-red-300 opacity-60 line-through cursor-not-allowed';
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isCorrect !== null && isCorrect}
                  className={`flex items-center gap-3 p-3 rounded border-2 transition-all cursor-pointer text-left active:scale-[0.98] ${btnStyle}`}
                >
                  <span className={`w-7 h-7 rounded flex items-center justify-center font-arcade text-xs font-bold shrink-0 ${
                    isRight ? 'bg-emerald-500 text-slate-950' : isFailed ? 'bg-red-900 text-red-200' : 'bg-slate-800 text-cyan-300'
                  }`}>
                    {optionLabels[idx]}
                  </span>
                  <span className="text-sm font-medium leading-tight grow">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Feedback Banner */}
          {isCorrect === true && (
            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500 p-3 rounded text-emerald-300 text-xs sm:text-sm font-arcade animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>CHÍNH XÁC! RÀO CHẮN ĐÃ ĐƯỢC GIẢI MÃ (+1500 ĐIỂM)</span>
            </div>
          )}

          {isCorrect === false && (
            <div className="flex items-start gap-2 bg-red-950/80 border border-red-500 p-3 rounded text-red-300 text-xs sm:text-sm font-sans animate-pulse">
              <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-arcade text-xs text-red-200 font-bold mb-1">
                  CẢNH BÁO: TRẢ LỜI CHƯA ĐÚNG!
                </p>
                <p className="text-xs text-red-300">
                  Hãy chọn lại đáp án khác đến khi chính xác để vượt qua rào chắn!
                </p>
              </div>
            </div>
          )}

          {/* Hint Section (Visible if user made a mistake or requests hint) */}
          {(showHint || failedAttempts.length > 0) && !isCorrect && (
            <div className="flex items-start gap-2 bg-yellow-950/40 border border-yellow-600/40 p-2.5 rounded text-xs text-yellow-200">
              <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-yellow-400">{q.hint}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-900/60 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 font-arcade">
          <span>Quy tắc: Trả lời đúng để tiếp tục</span>
          <span className="text-cyan-400">STATUS: CHỜ GIẢI MÃ</span>
        </div>
      </div>
    </div>
  );
};
