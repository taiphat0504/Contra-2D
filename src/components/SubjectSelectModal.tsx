import React from 'react';
import { SubjectId } from '../types';
import { SUBJECTS_LIST } from '../data/quizQuestions';
import { X, Check } from 'lucide-react';

interface SubjectSelectModalProps {
  isOpen: boolean;
  selectedSubject: SubjectId;
  onSelectSubject: (subjectId: SubjectId) => void;
  onClose: () => void;
}

export const SubjectSelectModal: React.FC<SubjectSelectModalProps> = ({
  isOpen,
  selectedSubject,
  onSelectSubject,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-lg bg-slate-950 border-2 border-blue-500 rounded-lg shadow-2xl shadow-blue-500/20 overflow-hidden font-mono">
        {/* Header */}
        <div className="bg-slate-900 border-b border-blue-500/40 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📚</span>
            <div>
              <h3 className="text-sm font-arcade text-blue-400">CHỌN MÔN HỌC CÂU HỎI</h3>
              <p className="text-[10px] text-slate-400">Các chướng ngại vật sẽ sử dụng câu hỏi của môn này</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subjects Grid */}
        <div className="p-4 space-y-2.5 max-h-[70vh] overflow-y-auto">
          {SUBJECTS_LIST.map((subj) => {
            const isSelected = selectedSubject === subj.id;
            return (
              <button
                key={subj.id}
                onClick={() => {
                  onSelectSubject(subj.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-md border-2 transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-blue-950/80 border-blue-400 shadow-md shadow-blue-500/10'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-600 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded flex items-center justify-center text-xl shrink-0 border"
                    style={{ borderColor: subj.color, backgroundColor: `${subj.color}20` }}
                  >
                    {subj.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-arcade text-xs text-white">{subj.name}</span>
                      {isSelected && (
                        <span className="bg-blue-500 text-slate-950 text-[9px] font-arcade px-1.5 py-0.5 rounded font-bold">
                          ĐANG CHỌN
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {subj.description}
                    </p>
                  </div>
                </div>

                <div className="ml-2 shrink-0">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-slate-950">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-slate-700" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-slate-900/80 border-t border-slate-800 px-4 py-2.5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-arcade text-xs rounded transition-all cursor-pointer active:scale-95"
          >
            ĐÓNG
          </button>
        </div>
      </div>
    </div>
  );
};
