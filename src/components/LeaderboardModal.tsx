import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import { getLeaderboard } from '../services/storage';
import { Trophy, Award, Medal, X, Target, Calendar } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<'correct' | 'score'>('correct');

  useEffect(() => {
    if (isOpen) {
      setEntries(getLeaderboard());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sortedEntries = [...entries].sort((a, b) => {
    if (sortBy === 'correct') {
      if (b.correctAnswers !== a.correctAnswers) {
        return b.correctAnswers - a.correctAnswers;
      }
      return b.score - a.score;
    } else {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.correctAnswers - a.correctAnswers;
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-2xl bg-slate-950 border-2 border-amber-500 rounded-lg shadow-2xl shadow-amber-500/20 overflow-hidden font-mono">
        {/* Header */}
        <div className="bg-slate-900 border-b border-amber-500/40 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-arcade text-amber-400">BẢNG XẾP HẠNG ANH HÙNG</h3>
              <p className="text-[10px] text-slate-400">Tôn vinh các đặc nhiệm có số câu trả lời đúng cao nhất</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-900/60 px-4 py-2 border-b border-slate-800 flex gap-2">
          <button
            onClick={() => setSortBy('correct')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-arcade transition-all cursor-pointer ${
              sortBy === 'correct'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>THEO CÂU ĐÚNG (CHÍNH)</span>
          </button>
          <button
            onClick={() => setSortBy('score')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-arcade transition-all cursor-pointer ${
              sortBy === 'score'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>THEO TỔNG ĐIỂM</span>
          </button>
        </div>

        {/* Entries List */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
          {sortedEntries.length === 0 ? (
            <div className="text-center py-8 text-slate-500 font-arcade text-xs">
              Chưa có kỷ lục nào được ghi nhận. Hãy trở thành người đầu tiên!
            </div>
          ) : (
            sortedEntries.map((item, index) => {
              const rank = index + 1;
              let rankBadge = (
                <span className="w-7 h-7 rounded bg-slate-800 text-slate-300 flex items-center justify-center font-arcade text-xs font-bold shrink-0">
                  #{rank}
                </span>
              );

              let rowBorder = 'border-slate-800 bg-slate-900/70';
              if (rank === 1) {
                rankBadge = (
                  <span className="w-7 h-7 rounded bg-yellow-500 text-slate-950 flex items-center justify-center font-arcade text-xs font-bold shrink-0 shadow-md shadow-yellow-500/30">
                    🥇
                  </span>
                );
                rowBorder = 'border-yellow-500/60 bg-yellow-950/20';
              } else if (rank === 2) {
                rankBadge = (
                  <span className="w-7 h-7 rounded bg-slate-300 text-slate-950 flex items-center justify-center font-arcade text-xs font-bold shrink-0">
                    🥈
                  </span>
                );
                rowBorder = 'border-slate-400/50 bg-slate-900/80';
              } else if (rank === 3) {
                rankBadge = (
                  <span className="w-7 h-7 rounded bg-amber-700 text-white flex items-center justify-center font-arcade text-xs font-bold shrink-0">
                    🥉
                  </span>
                );
                rowBorder = 'border-amber-700/50 bg-slate-900/80';
              }

              return (
                <div
                  key={item.id}
                  className={`flex flex-wrap sm:flex-nowrap items-center justify-between p-3 rounded-md border gap-3 transition-colors ${rowBorder}`}
                >
                  <div className="flex items-center gap-3">
                    {rankBadge}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-arcade text-xs text-white">{item.playerName}</span>
                        <span className="text-[10px] bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded">
                          {item.subjectName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>Vũ khí: {item.weaponUsed}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {item.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* High Score & Correct Answers */}
                  <div className="flex items-center gap-4 ml-auto sm:ml-0">
                    {/* Correct Answers */}
                    <div className="text-right">
                      <div className="text-[9px] text-emerald-400 font-arcade">CÂU ĐÚNG</div>
                      <div className="text-sm font-arcade text-emerald-300 font-bold flex items-center justify-end gap-1">
                        <span>🎯</span>
                        <span>{item.correctAnswers}</span>
                      </div>
                    </div>

                    {/* Total Score */}
                    <div className="text-right min-w-[80px]">
                      <div className="text-[9px] text-amber-400 font-arcade">ĐIỂM</div>
                      <div className="text-sm font-arcade text-amber-300 font-bold">
                        {item.score.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-900 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-arcade">HỆ THỐNG GHI NHẬN TỰ ĐỘNG</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade text-xs font-bold rounded transition-all cursor-pointer active:scale-95"
          >
            ĐÓNG
          </button>
        </div>
      </div>
    </div>
  );
};
