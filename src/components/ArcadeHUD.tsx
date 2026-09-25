import React from 'react';
import { PlayerState, SubjectInfo } from '../types';
import { soundEngine } from '../services/soundEngine';
import { Volume2, VolumeX, Trophy, BookOpen, Pause, Play, HelpCircle, Home, Gamepad2 } from 'lucide-react';

interface ArcadeHUDProps {
  player: PlayerState;
  subjectInfo: SubjectInfo;
  isPaused: boolean;
  showControls: boolean;
  onToggleControls: () => void;
  onTogglePause: () => void;
  onOpenSubjectModal: () => void;
  onOpenLeaderboard: () => void;
  onOpenHelp: () => void;
  onReturnHome: () => void;
}

export const ArcadeHUD: React.FC<ArcadeHUDProps> = ({
  player,
  subjectInfo,
  isPaused,
  showControls,
  onToggleControls,
  onTogglePause,
  onOpenSubjectModal,
  onOpenLeaderboard,
  onOpenHelp,
  onReturnHome,
}) => {
  const [isMuted, setIsMuted] = React.useState(soundEngine.getMuted());

  const handleToggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const weaponLevelStars = '★'.repeat(player.weapon.level) + '☆'.repeat(3 - player.weapon.level);

  return (
    <div className="w-full bg-slate-950/85 backdrop-blur-xs border-b border-cyan-500/30 px-2 sm:px-3 py-1 sm:py-1.5 flex flex-wrap items-center justify-between gap-1.5 shadow-md select-none text-xs z-20 shrink-0">
      {/* Left: Score & High Rank metric */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Score */}
        <div className="flex flex-col">
          <span className="text-[8px] sm:text-[9px] text-slate-400 font-arcade tracking-wider">ĐIỂM</span>
          <span className="text-xs sm:text-base font-arcade text-yellow-400 crt-gold-glow">
            {player.score.toLocaleString()}
          </span>
        </div>

        {/* Correct Answers Count (Bảng xếp hạng chủ đạo) */}
        <div className="flex items-center gap-1 bg-emerald-950/70 border border-emerald-500/50 px-1.5 py-0.5 rounded">
          <span className="text-xs sm:text-sm">🎯</span>
          <div className="flex flex-col">
            <span className="text-[8px] text-emerald-300 font-arcade uppercase hidden sm:inline">CÂU ĐÚNG</span>
            <span className="text-xs sm:text-sm font-arcade text-emerald-400 font-bold">
              {player.correctAnswersCount}
            </span>
          </div>
        </div>

        {/* Lives */}
        <div className="flex items-center gap-1 bg-red-950/60 border border-red-500/50 px-1.5 py-0.5 rounded">
          <span className="text-xs sm:text-sm">❤️</span>
          <span className="text-xs sm:text-sm font-arcade text-red-400 font-bold">
            {player.lives}
          </span>
          <div className="hidden lg:flex items-center gap-0.5 ml-0.5">
            {Array.from({ length: Math.min(player.lives, 6) }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-3 rounded-xs bg-red-500 shadow-xs shadow-red-500"
                title={`Mạng ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Center: Current Weapon & Level */}
      <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
        <div 
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-arcade font-bold text-[10px] text-white border border-white shadow-xs"
          style={{ backgroundColor: player.weapon.color }}
        >
          {player.weapon.letter}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[9px] sm:text-[10px] font-arcade text-white tracking-tight">
            {player.weapon.type}
          </span>
          <span className="text-[9px] font-arcade text-yellow-400">
            {weaponLevelStars}
          </span>
        </div>
      </div>

      {/* Right: Subject Badge & Actions */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* 16:9 Aspect Tag */}
        <span className="hidden xl:inline-block bg-slate-900 border border-slate-700 text-slate-400 text-[8px] font-arcade px-1.5 py-0.5 rounded">
          16:9
        </span>

        {/* Subject Button */}
        <button
          onClick={onOpenSubjectModal}
          className="flex items-center gap-1 bg-blue-900/60 hover:bg-blue-800/80 border border-blue-400/50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] font-arcade text-blue-200 transition-all cursor-pointer active:scale-95"
          title="Chọn môn câu hỏi"
        >
          <span>{subjectInfo.icon}</span>
          <span className="hidden sm:inline">{subjectInfo.shortName}</span>
        </button>

        {/* Leaderboard Button */}
        <button
          onClick={onOpenLeaderboard}
          className="flex items-center gap-1 bg-amber-900/60 hover:bg-amber-800/80 border border-amber-400/50 p-1 sm:px-2 sm:py-1 rounded text-[10px] font-arcade text-amber-200 transition-all cursor-pointer active:scale-95"
          title="Bảng xếp hạng điểm cao"
        >
          <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
          <span className="hidden md:inline">BXH</span>
        </button>

        {/* Virtual Gamepad Toggle */}
        <button
          onClick={onToggleControls}
          className={`p-1 sm:p-1.5 rounded border text-[10px] transition-all cursor-pointer ${
            showControls
              ? 'bg-cyan-900/70 border-cyan-400 text-cyan-200'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
          title={showControls ? 'Ẩn phím điều khiển ảo' : 'Bật phím điều khiển ảo'}
        >
          <Gamepad2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>

        {/* Help button */}
        <button
          onClick={onOpenHelp}
          className="p-1 sm:p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-300 transition-all cursor-pointer"
          title="Hướng dẫn chơi & phím điều khiển"
        >
          <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>

        {/* Audio Mute */}
        <button
          onClick={handleToggleSound}
          className="p-1 sm:p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-300 transition-all cursor-pointer"
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {isMuted ? <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400" /> : <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />}
        </button>

        {/* Pause */}
        <button
          onClick={onTogglePause}
          className="p-1 sm:p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-300 transition-all cursor-pointer"
          title={isPaused ? 'Tiếp tục' : 'Tạm dừng'}
        >
          {isPaused ? <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-400" /> : <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300" />}
        </button>

        {/* Home Button (Quay về trang chủ) */}
        <button
          onClick={onReturnHome}
          className="flex items-center gap-1 bg-rose-950/70 hover:bg-rose-900 border border-rose-500/60 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] font-arcade text-rose-200 transition-all cursor-pointer active:scale-95"
          title="Quay về trang chủ"
        >
          <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400" />
          <span className="hidden sm:inline">HOME</span>
        </button>
      </div>
    </div>
  );
};
