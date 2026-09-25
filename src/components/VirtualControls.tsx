import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Crosshair, Zap } from 'lucide-react';

interface VirtualControlsProps {
  onDirectionPress: (dir: { left?: boolean; right?: boolean; up?: boolean; down?: boolean }) => void;
  onDirectionRelease: (dir: { left?: boolean; right?: boolean; up?: boolean; down?: boolean }) => void;
  onJumpStart: () => void;
  onJumpEnd: () => void;
  onShootStart: () => void;
  onShootEnd: () => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onDirectionPress,
  onDirectionRelease,
  onJumpStart,
  onJumpEnd,
  onShootStart,
  onShootEnd,
}) => {
  return (
    <div className="absolute inset-x-0 bottom-2 sm:bottom-4 px-2 sm:px-6 pointer-events-none flex justify-between items-end z-20 select-none">
      {/* 8-Way D-Pad on Left */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center pointer-events-auto opacity-75 hover:opacity-100 transition-opacity">
        {/* Cross background */}
        <div className="absolute w-9 sm:w-10 h-24 sm:h-28 bg-slate-950/70 backdrop-blur-xs rounded-md border border-slate-600/80 shadow-lg" />
        <div className="absolute w-24 sm:w-28 h-9 sm:h-10 bg-slate-950/70 backdrop-blur-xs rounded-md border border-slate-600/80 shadow-lg" />

        {/* Center hub */}
        <div className="absolute w-8 h-8 rounded-full bg-slate-900 border border-slate-500 z-10" />

        {/* Up Button */}
        <button
          className="absolute top-1 w-9 sm:w-10 h-9 sm:h-10 flex items-center justify-center text-slate-200 active:bg-cyan-500/50 rounded-t-md z-20 cursor-pointer"
          onMouseDown={() => onDirectionPress({ up: true })}
          onMouseUp={() => onDirectionRelease({ up: false })}
          onTouchStart={(e) => { e.preventDefault(); onDirectionPress({ up: true }); }}
          onTouchEnd={(e) => { e.preventDefault(); onDirectionRelease({ up: false }); }}
          title="Lên / Ngắm lên"
        >
          <ArrowUp className="w-5 h-5 stroke-[3]" />
        </button>

        {/* Down Button */}
        <button
          className="absolute bottom-1 w-9 sm:w-10 h-9 sm:h-10 flex items-center justify-center text-slate-200 active:bg-cyan-500/50 rounded-b-md z-20 cursor-pointer"
          onMouseDown={() => onDirectionPress({ down: true })}
          onMouseUp={() => onDirectionRelease({ down: false })}
          onTouchStart={(e) => { e.preventDefault(); onDirectionPress({ down: true }); }}
          onTouchEnd={(e) => { e.preventDefault(); onDirectionRelease({ down: false }); }}
          title="Nằm rạp / Ngắm xuống"
        >
          <ArrowDown className="w-5 h-5 stroke-[3]" />
        </button>

        {/* Left Button */}
        <button
          className="absolute left-1 w-9 sm:w-10 h-9 sm:h-10 flex items-center justify-center text-slate-200 active:bg-cyan-500/50 rounded-l-md z-20 cursor-pointer"
          onMouseDown={() => onDirectionPress({ left: true })}
          onMouseUp={() => onDirectionRelease({ left: false })}
          onTouchStart={(e) => { e.preventDefault(); onDirectionPress({ left: true }); }}
          onTouchEnd={(e) => { e.preventDefault(); onDirectionRelease({ left: false }); }}
          title="Trái"
        >
          <ArrowLeft className="w-5 h-5 stroke-[3]" />
        </button>

        {/* Right Button */}
        <button
          className="absolute right-1 w-9 sm:w-10 h-9 sm:h-10 flex items-center justify-center text-slate-200 active:bg-cyan-500/50 rounded-r-md z-20 cursor-pointer"
          onMouseDown={() => onDirectionPress({ right: true })}
          onMouseUp={() => onDirectionRelease({ right: false })}
          onTouchStart={(e) => { e.preventDefault(); onDirectionPress({ right: true }); }}
          onTouchEnd={(e) => { e.preventDefault(); onDirectionRelease({ right: false }); }}
          title="Phải"
        >
          <ArrowRight className="w-5 h-5 stroke-[3]" />
        </button>

        {/* Diagonal corners: Up-Left, Up-Right, Down-Left, Down-Right */}
        <button
          className="absolute top-1 left-1 w-7 h-7 rounded-full z-20 active:bg-cyan-500/50"
          onMouseDown={() => onDirectionPress({ up: true, left: true })}
          onMouseUp={() => onDirectionRelease({ up: false, left: false })}
          onTouchStart={(e) => { e.preventDefault(); onDirectionPress({ up: true, left: true }); }}
          onTouchEnd={(e) => { e.preventDefault(); onDirectionRelease({ up: false, left: false }); }}
        />
        <button
          className="absolute top-1 right-1 w-7 h-7 rounded-full z-20 active:bg-cyan-500/50"
          onMouseDown={() => onDirectionPress({ up: true, right: true })}
          onMouseUp={() => onDirectionRelease({ up: false, right: false })}
          onTouchStart={(e) => { e.preventDefault(); onDirectionPress({ up: true, right: true }); }}
          onTouchEnd={(e) => { e.preventDefault(); onDirectionRelease({ up: false, right: false }); }}
        />
        <button
          className="absolute bottom-1 left-1 w-7 h-7 rounded-full z-20 active:bg-cyan-500/50"
          onMouseDown={() => onDirectionPress({ down: true, left: true })}
          onMouseUp={() => onDirectionRelease({ down: false, left: false })}
          onTouchStart={(e) => { e.preventDefault(); onDirectionPress({ down: true, left: true }); }}
          onTouchEnd={(e) => { e.preventDefault(); onDirectionRelease({ down: false, left: false }); }}
        />
        <button
          className="absolute bottom-1 right-1 w-7 h-7 rounded-full z-20 active:bg-cyan-500/50"
          onMouseDown={() => onDirectionPress({ down: true, right: true })}
          onMouseUp={() => onDirectionRelease({ down: false, right: false })}
          onTouchStart={(e) => { e.preventDefault(); onDirectionPress({ down: true, right: true }); }}
          onTouchEnd={(e) => { e.preventDefault(); onDirectionRelease({ down: false, right: false }); }}
        />
      </div>

      {/* Action Buttons on Right (A: Jump, B: Shoot) */}
      <div className="flex items-center gap-3 sm:gap-5 pointer-events-auto opacity-75 hover:opacity-100 transition-opacity">
        {/* B: Shoot Button (Red) */}
        <div className="flex flex-col items-center">
          <button
            onMouseDown={onShootStart}
            onMouseUp={onShootEnd}
            onTouchStart={(e) => { e.preventDefault(); onShootStart(); }}
            onTouchEnd={(e) => { e.preventDefault(); onShootEnd(); }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-600/80 hover:bg-red-500/90 active:scale-90 active:bg-red-700 backdrop-blur-xs border-2 border-red-400 shadow-lg shadow-red-600/40 flex items-center justify-center cursor-pointer transition-all"
            title="BẮN (Phím J / Chuột trái)"
          >
            <Crosshair className="w-6 h-6 text-white stroke-[2.5]" />
          </button>
          <span className="text-[8px] sm:text-[9px] font-arcade text-red-300 mt-0.5 bg-black/60 px-1 rounded">BẮN (J)</span>
        </div>

        {/* A: Jump Button (Blue) */}
        <div className="flex flex-col items-center">
          <button
            onMouseDown={onJumpStart}
            onMouseUp={onJumpEnd}
            onTouchStart={(e) => { e.preventDefault(); onJumpStart(); }}
            onTouchEnd={(e) => { e.preventDefault(); onJumpEnd(); }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-600/80 hover:bg-blue-500/90 active:scale-90 active:bg-blue-700 backdrop-blur-xs border-2 border-blue-400 shadow-lg shadow-blue-600/40 flex items-center justify-center cursor-pointer transition-all"
            title="NHẢY (Phím SPACE / K)"
          >
            <Zap className="w-6 h-6 text-white stroke-[2.5]" />
          </button>
          <span className="text-[8px] sm:text-[9px] font-arcade text-blue-300 mt-0.5 bg-black/60 px-1 rounded">NHẢY (SPACE)</span>
        </div>
      </div>
    </div>
  );
};
