import React, { useState } from 'react';
import { saveLeaderboardEntry } from '../services/storage';
import { Trophy, RotateCcw, BookOpen, Check, Award, Home } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  isVictory: boolean;
  stats: {
    score: number;
    correctAnswers: number;
    stage: string;
    weapon: string;
  };
  subjectName: string;
  onRestart: () => void;
  onOpenSubjectModal: () => void;
  onOpenLeaderboard: () => void;
  onReturnHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  isVictory,
  stats,
  subjectName,
  onRestart,
  onOpenSubjectModal,
  onOpenLeaderboard,
  onReturnHome,
}) => {
  const [playerName, setPlayerName] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isSaved) return;

    saveLeaderboardEntry({
      playerName: playerName.trim(),
      correctAnswers: stats.correctAnswers,
      score: stats.score,
      subjectName,
      stageReached: stats.stage,
      weaponUsed: stats.weapon,
    });

    setIsSaved(true);
    setTimeout(() => {
      onOpenLeaderboard();
    }, 600);
  };

  // Rank determination based on correct answers
  let rankTitle = 'TÂN BINH CHIẾN TRƯỜNG';
  if (stats.correctAnswers >= 15) {
    rankTitle = '🎖️ ĐẠI TƯỚNG TRI THỨC';
  } else if (stats.correctAnswers >= 10) {
    rankTitle = '⭐ ĐẶC NHIỆM TINH NHUỆ';
  } else if (stats.correctAnswers >= 5) {
    rankTitle = '⚔️ CHIẾN BINH THỰC CHIẾN';
  } else if (stats.correctAnswers >= 2) {
    rankTitle = '🎯 TIÊN PHONG CẦN CÙ';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xs select-none">
      <div className={`relative w-full max-w-lg bg-slate-950 border-2 rounded-lg shadow-2xl overflow-hidden font-mono ${
        isVictory ? 'border-yellow-400 shadow-yellow-500/20' : 'border-red-500 shadow-red-500/20'
      }`}>
        {/* Banner */}
        <div className={`p-4 text-center border-b ${
          isVictory ? 'bg-yellow-950/60 border-yellow-500/40' : 'bg-red-950/60 border-red-500/40'
        }`}>
          <div className="text-3xl mb-1">{isVictory ? '🏆' : '💀'}</div>
          <h2 className={`text-lg sm:text-xl font-arcade font-bold tracking-wider ${
            isVictory ? 'text-yellow-400 crt-gold-glow' : 'text-red-400 crt-red-glow'
          }`}>
            {isVictory ? 'CHIẾN DỊCH TOÀN THẮNG!' : 'NHIỆM VỤ THẤT BẠI'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {isVictory ? 'Bạn đã đánh bại Red Falcon và làm chủ kho tàng tri thức!' : 'Hết mạng chiến đấu! Hãy thử lại để phục thù!'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="text-center bg-slate-900 border border-slate-800 rounded p-2.5">
            <span className="text-[10px] text-slate-400 font-arcade uppercase">DANH HIỆU ĐẠT ĐƯỢC</span>
            <div className="text-sm font-arcade text-yellow-300 font-bold mt-0.5">
              {rankTitle}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded p-3 text-center">
              <span className="text-[10px] text-emerald-300 font-arcade">SỐ CÂU ĐÚNG</span>
              <div className="text-2xl font-arcade text-emerald-400 font-bold mt-1">
                {stats.correctAnswers} 🎯
              </div>
            </div>

            <div className="bg-amber-950/40 border border-amber-500/40 rounded p-3 text-center">
              <span className="text-[10px] text-amber-300 font-arcade">TỔNG ĐIỂM</span>
              <div className="text-2xl font-arcade text-amber-400 font-bold mt-1">
                {stats.score.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded p-3 text-xs space-y-1 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Môn học đã chọn:</span>
              <span className="text-cyan-400 font-bold">{subjectName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Vũ khí cuối:</span>
              <span className="text-white">{stats.weapon}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tiến độ chiến trường:</span>
              <span className="text-yellow-400">{stats.stage}</span>
            </div>
          </div>

          {/* Leaderboard Submission */}
          {!isSaved ? (
            <form onSubmit={handleSaveScore} className="bg-slate-900/90 border border-slate-700 rounded-md p-3.5 space-y-2.5">
              <label className="block text-xs font-arcade text-cyan-300">
                LƯU TÊN VÀO BẢNG XẾP HẠNG:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Nhập tên đặc nhiệm (VD: ContraPro)"
                  maxLength={18}
                  className="grow bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded px-3 py-1.5 text-xs text-white focus:outline-hidden"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!playerName.trim()}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-arcade text-[10px] font-bold rounded cursor-pointer transition-all active:scale-95"
                >
                  LƯU KỶ LỤC
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2 bg-emerald-950/80 border border-emerald-500 p-2.5 rounded text-emerald-300 text-xs font-arcade">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>ĐÃ GHI DANH VÀO BẢNG XẾP HẠNG THÀNH CÔNG!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={onRestart}
              className="grow flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-arcade text-xs font-bold rounded transition-all cursor-pointer active:scale-95 shadow-md shadow-red-600/30"
            >
              <RotateCcw className="w-4 h-4" />
              <span>CHƠI LẠI</span>
            </button>
            <button
              onClick={onReturnHome}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-arcade text-xs rounded border border-slate-600 transition-all cursor-pointer active:scale-95"
            >
              <Home className="w-4 h-4 text-slate-300" />
              <span>VỀ TRANG CHỦ</span>
            </button>
            <button
              onClick={onOpenLeaderboard}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-arcade text-xs font-bold rounded transition-all cursor-pointer active:scale-95"
            >
              <Trophy className="w-4 h-4" />
              <span>XẾP HẠNG</span>
            </button>
            <button
              onClick={onOpenSubjectModal}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-arcade text-xs rounded border border-cyan-500/40 transition-all cursor-pointer active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>ĐỔI MÔN</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
