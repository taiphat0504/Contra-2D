/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { ArcadeHUD } from './components/ArcadeHUD';
import { GameOverModal } from './components/GameOverModal';
import { HelpModal } from './components/HelpModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { QuizModal } from './components/QuizModal';
import { SubjectSelectModal } from './components/SubjectSelectModal';
import { VirtualControls } from './components/VirtualControls';
import { SUBJECTS_LIST } from './data/quizQuestions';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './game/constants';
import { ContraGameEngine } from './game/engine';
import { soundEngine } from './services/soundEngine';
import { getSavedSubject, saveSelectedSubject } from './services/storage';
import { GameState, ObstacleBarrier, PlayerState, SubjectId } from './types';
import { Play, Trophy, BookOpen, HelpCircle, Gamepad2, Volume2 } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ContraGameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('START');
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>(getSavedSubject());
  const [activeBarrier, setActiveBarrier] = useState<ObstacleBarrier | null>(null);

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showVirtualControls, setShowVirtualControls] = useState(true);

  const [gameOverData, setGameOverData] = useState<{
    victory: boolean;
    stats: { score: number; correctAnswers: number; stage: string; weapon: string };
  } | null>(null);

  // HUD player state
  const [hudPlayer, setHudPlayer] = useState<PlayerState | null>(null);

  const currentSubjectInfo =
    SUBJECTS_LIST.find((s) => s.id === selectedSubject) || SUBJECTS_LIST[0];

  // Initialize or update Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    if (!engineRef.current) {
      const engine = new ContraGameEngine(canvasRef.current, selectedSubject);

      // Quiz barrier triggered
      engine.onTriggerQuiz = (barrier: ObstacleBarrier) => {
        setActiveBarrier(barrier);
        setGameState('QUIZ');
      };

      // Game over or victory
      engine.onGameOver = (victory, stats) => {
        setGameOverData({ victory, stats });
        setGameState(victory ? 'VICTORY' : 'GAMEOVER');
      };

      // Stats update for HUD
      engine.onStatsUpdate = (player) => {
        setHudPlayer(player);
      };

      engineRef.current = engine;
      setHudPlayer(engine.player);
    } else {
      engineRef.current.setSubject(selectedSubject);
    }
  }, [selectedSubject]);

  // Keyboard Event Listeners for PC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept inputs when typing name in Game Over modal
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      const engine = engineRef.current;
      if (!engine) return;

      const code = e.code;

      // Prevent scrolling when pressing Space or Arrow keys
      if (code === 'Space' || code === 'ArrowUp' || code === 'ArrowDown') {
        e.preventDefault();
      }

      if (code === 'KeyA' || code === 'ArrowLeft') {
        engine.keys.left = true;
      }
      if (code === 'KeyD' || code === 'ArrowRight') {
        engine.keys.right = true;
      }
      if (code === 'KeyW' || code === 'ArrowUp') {
        engine.keys.up = true;
      }
      if (code === 'KeyS' || code === 'ArrowDown') {
        engine.keys.down = true;
      }
      if (code === 'KeyJ' || code === 'KeyZ') {
        engine.keys.shoot = true;
      }
      if (code === 'Space' || code === 'KeyK' || code === 'KeyX') {
        engine.keys.jump = true;
      }
      if (code === 'Escape') {
        handleTogglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      const code = e.code;

      if (code === 'KeyA' || code === 'ArrowLeft') {
        engine.keys.left = false;
      }
      if (code === 'KeyD' || code === 'ArrowRight') {
        engine.keys.right = false;
      }
      if (code === 'KeyW' || code === 'ArrowUp') {
        engine.keys.up = false;
      }
      if (code === 'KeyS' || code === 'ArrowDown') {
        engine.keys.down = false;
      }
      if (code === 'KeyJ' || code === 'KeyZ') {
        engine.keys.shoot = false;
      }
      if (code === 'Space' || code === 'KeyK' || code === 'KeyX') {
        engine.keys.jump = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Start Playing
  const handleStartGame = () => {
    setGameState('PLAYING');
    if (engineRef.current) {
      engineRef.current.restart();
    }
  };

  // Return to Home / Start Screen
  const handleReturnHome = () => {
    if (engineRef.current) {
      engineRef.current.stop();
    }
    soundEngine.stopBGM();
    setActiveBarrier(null);
    setGameState('START');
  };

  // Pause / Resume
  const handleTogglePause = () => {
    if (gameState === 'PLAYING') {
      engineRef.current?.pause();
      setGameState('PAUSED');
    } else if (gameState === 'PAUSED') {
      engineRef.current?.resume();
      setGameState('PLAYING');
    }
  };

  // Subject selection change
  const handleSelectSubject = (subjId: SubjectId) => {
    setSelectedSubject(subjId);
    saveSelectedSubject(subjId);
    if (engineRef.current) {
      engineRef.current.setSubject(subjId);
    }
  };

  // Quiz callbacks
  const handleQuizSuccess = (barrierId: number) => {
    if (engineRef.current) {
      engineRef.current.handleBarrierSuccess(barrierId);
    }
    setActiveBarrier(null);
    setGameState('PLAYING');
  };

  const handleQuizFailure = () => {
    if (engineRef.current) {
      engineRef.current.handleBarrierFailure();
    }
  };

  // Virtual Gamepad Handlers
  const handleVirtualDirPress = (dir: { left?: boolean; right?: boolean; up?: boolean; down?: boolean }) => {
    if (!engineRef.current) return;
    if (dir.left !== undefined) engineRef.current.keys.left = dir.left;
    if (dir.right !== undefined) engineRef.current.keys.right = dir.right;
    if (dir.up !== undefined) engineRef.current.keys.up = dir.up;
    if (dir.down !== undefined) engineRef.current.keys.down = dir.down;
  };

  const handleVirtualDirRelease = (dir: { left?: boolean; right?: boolean; up?: boolean; down?: boolean }) => {
    if (!engineRef.current) return;
    if (dir.left !== undefined) engineRef.current.keys.left = false;
    if (dir.right !== undefined) engineRef.current.keys.right = false;
    if (dir.up !== undefined) engineRef.current.keys.up = false;
    if (dir.down !== undefined) engineRef.current.keys.down = false;
  };

  const handleVirtualJumpStart = () => {
    if (!engineRef.current) return;
    engineRef.current.keys.jump = true;
  };

  const handleVirtualJumpEnd = () => {
    if (!engineRef.current) return;
    engineRef.current.keys.jump = false;
  };

  const handleVirtualShootStart = () => {
    if (!engineRef.current) return;
    engineRef.current.keys.shoot = true;
  };

  const handleVirtualShootEnd = () => {
    if (!engineRef.current) return;
    engineRef.current.keys.shoot = false;
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-mono select-none p-0 sm:p-2">
      {/* Strict 16:9 Retro Arcade Cabinet Screen */}
      <div 
        className="relative aspect-video max-w-full max-h-full flex flex-col bg-black rounded-none sm:rounded-lg border-0 sm:border-2 border-slate-800 shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden"
        style={{
          width: 'min(100vw, calc(100vh * 16 / 9))',
          height: 'min(100vh, calc(100vw * 9 / 16))',
          aspectRatio: '16 / 9',
        }}
      >
        {/* Top Arcade HUD (Visible while in game / paused / quiz) */}
        {hudPlayer && gameState !== 'START' && (
          <ArcadeHUD
            player={hudPlayer}
            subjectInfo={currentSubjectInfo}
            isPaused={gameState === 'PAUSED'}
            showControls={showVirtualControls}
            onToggleControls={() => setShowVirtualControls(!showVirtualControls)}
            onTogglePause={handleTogglePause}
            onOpenSubjectModal={() => setShowSubjectModal(true)}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onOpenHelp={() => setShowHelp(true)}
            onReturnHome={handleReturnHome}
          />
        )}

        {/* Main Canvas Viewport Container (16:9) */}
        <div className="relative grow w-full h-full flex items-center justify-center bg-black overflow-hidden">
          {/* Game Canvas (Native 800x450 = 16:9) */}
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="pixelated w-full h-full object-fill cursor-crosshair"
            onMouseDown={() => {
              if (engineRef.current && gameState === 'PLAYING') {
                engineRef.current.keys.shoot = true;
              }
            }}
            onMouseUp={() => {
              if (engineRef.current) {
                engineRef.current.keys.shoot = false;
              }
            }}
          />

          {/* Scanlines retro CRT overlay */}
          <div className="absolute inset-0 scanlines pointer-events-none opacity-35" />

          {/* Floating Touch & Virtual Gamepad (Inside 16:9 Viewport) */}
          {gameState === 'PLAYING' && showVirtualControls && (
            <VirtualControls
              onDirectionPress={handleVirtualDirPress}
              onDirectionRelease={handleVirtualDirRelease}
              onJumpStart={handleVirtualJumpStart}
              onJumpEnd={handleVirtualJumpEnd}
              onShootStart={handleVirtualShootStart}
              onShootEnd={handleVirtualShootEnd}
            />
          )}

          {/* START SCREEN OVERLAY */}
          {gameState === 'START' && (
            <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-xs flex flex-col items-center justify-center p-3 sm:p-4 z-30">
              {/* Retro Contra Title */}
              <div className="text-center mb-3 sm:mb-5 max-w-lg">
                <div className="inline-flex items-center gap-1.5 bg-red-600 text-white font-arcade text-[8px] sm:text-[9px] px-2.5 py-0.5 rounded-sm uppercase tracking-widest mb-1.5 shadow-md shadow-red-600/50">
                  <span>1988 ARCADE CLASSIC</span>
                  <span>•</span>
                  <span className="text-yellow-300">16:9 HD</span>
                </div>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-arcade font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-red-500 to-red-700 tracking-wider drop-shadow-[0_4px_10px_rgba(239,68,68,0.8)]">
                  CONTRA 2D
                </h1>
                <div className="text-xs sm:text-sm font-arcade text-cyan-400 mt-1 tracking-widest crt-glow">
                  CHIẾN BINH TRI THỨC
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5 px-4 line-clamp-2">
                  Bắn súng 8 hướng • Nâng cấp kho vũ khí huyền thoại • Vượt chướng ngại vật trắc nghiệm đa môn học
                </p>
              </div>

              {/* Selected Subject Banner */}
              <div className="mb-3 sm:mb-5 flex flex-col items-center">
                <span className="text-[9px] font-arcade text-slate-400 mb-1">MÔN CÂU HỎI HIỆN TẠI:</span>
                <button
                  onClick={() => setShowSubjectModal(true)}
                  className="flex items-center gap-2 bg-slate-900 border-2 border-blue-500 hover:border-cyan-400 px-3 py-1.5 rounded-lg text-xs font-arcade text-white shadow-lg shadow-blue-500/20 cursor-pointer transition-all active:scale-95"
                >
                  <span className="text-base">{currentSubjectInfo.icon}</span>
                  <span className="text-blue-300">{currentSubjectInfo.name}</span>
                  <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">
                    ĐỔI
                  </span>
                </button>
              </div>

              {/* Menu Buttons */}
              <div className="w-full max-w-xs space-y-2">
                <button
                  onClick={handleStartGame}
                  className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 px-5 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-arcade text-xs sm:text-sm font-bold rounded-md shadow-lg shadow-red-600/40 transition-all cursor-pointer border-2 border-red-400"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>BẮT ĐẦU CHIẾN DỊCH</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowLeaderboard(true)}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 bg-amber-900/60 hover:bg-amber-800/80 active:scale-95 text-amber-300 font-arcade text-[10px] rounded-md border border-amber-500/50 transition-all cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>BẢNG XẾP HẠNG</span>
                  </button>

                  <button
                    onClick={() => setShowHelp(true)}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-300 font-arcade text-[10px] rounded-md border border-slate-700 transition-all cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>HƯỚNG DẪN</span>
                  </button>
                </div>
              </div>

              <div className="text-[9px] text-slate-400 font-arcade mt-4 text-center leading-relaxed">
                Di chuyển: A/D • Nhảy: <span className="text-yellow-400 font-bold">SPACE</span> • Bắn: <span className="text-red-400 font-bold">J</span> hoặc Chuột trái
              </div>
            </div>
          )}

          {/* PAUSE OVERLAY */}
          {gameState === 'PAUSED' && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-30">
              <h2 className="text-xl sm:text-2xl font-arcade text-yellow-400 mb-3 crt-gold-glow">
                TẠM DỪNG
              </h2>
              <div className="space-y-2.5 w-60">
                <button
                  onClick={handleTogglePause}
                  className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-arcade text-xs font-bold rounded cursor-pointer transition-all active:scale-95"
                >
                  TIẾP TỤC CHIẾN ĐẤU
                </button>
                <button
                  onClick={handleReturnHome}
                  className="w-full py-2 bg-rose-900/80 hover:bg-rose-800 border border-rose-500/50 text-rose-200 font-arcade text-xs rounded cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>🏠 VỀ TRANG CHỦ</span>
                </button>
                <button
                  onClick={() => setShowSubjectModal(true)}
                  className="w-full py-2 bg-blue-900/80 hover:bg-blue-800 border border-blue-500/50 text-blue-200 font-arcade text-xs rounded cursor-pointer transition-all active:scale-95"
                >
                  ĐỔI MÔN CÂU HỎI
                </button>
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-arcade text-xs rounded cursor-pointer transition-all active:scale-95"
                >
                  XEM BẢNG XẾP HẠNG
                </button>
                <button
                  onClick={handleStartGame}
                  className="w-full py-1.5 bg-red-950 border border-red-500 text-red-300 font-arcade text-xs rounded cursor-pointer transition-all active:scale-95"
                >
                  CHƠI LẠI TỪ ĐẦU
                </button>
              </div>
            </div>
          )}
        </div>

        {/* QUIZ TERMINAL MODAL FOR KNOWLEDGE OBSTACLES */}
        <QuizModal
          barrier={activeBarrier}
          onAnswerCorrect={handleQuizSuccess}
          onAnswerIncorrect={handleQuizFailure}
        />

        {/* SUBJECT SELECTOR MODAL */}
        <SubjectSelectModal
          isOpen={showSubjectModal}
          selectedSubject={selectedSubject}
          onSelectSubject={handleSelectSubject}
          onClose={() => setShowSubjectModal(false)}
        />

        {/* LEADERBOARD MODAL (Ranked by Correct Answers) */}
        <LeaderboardModal
          isOpen={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
        />

        {/* GAME OVER / VICTORY MODAL */}
        {gameOverData && (
          <GameOverModal
            isOpen={gameState === 'GAMEOVER' || gameState === 'VICTORY'}
            isVictory={gameOverData.victory}
            stats={gameOverData.stats}
            subjectName={currentSubjectInfo.name}
            onRestart={handleStartGame}
            onOpenSubjectModal={() => setShowSubjectModal(true)}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
            onReturnHome={handleReturnHome}
          />
        )}

        {/* HELP & CONTROLS MODAL */}
        <HelpModal
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
        />
      </div>
    </div>
  );
}
