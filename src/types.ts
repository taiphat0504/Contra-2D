export type SubjectId = 
  | 'all'
  | 'math' 
  | 'science' 
  | 'history' 
  | 'geography' 
  | 'english' 
  | 'tech';

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  description: string;
}

export interface QuizQuestion {
  id: string;
  subject: SubjectId;
  subjectName: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number; // 0, 1, 2, 3
  explanation: string;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export type WeaponType = 'RIFLE' | 'MACHINE' | 'SPREAD' | 'LASER' | 'FLAME' | 'HOMING';

export interface WeaponConfig {
  type: WeaponType;
  name: string;
  letter: string;
  color: string;
  glowColor: string;
  fireRate: number; // ms between shots
  damage: number;
  speed: number;
  bulletRadius: number;
  description: string;
  level: number;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  aimAngle: number; // in radians
  aimDir: { dx: number; dy: number };
  isGrounded: boolean;
  isCrouching: boolean;
  isJumping: boolean;
  jumpFlipAngle: number;
  isInvulnerable: boolean;
  invulnerableTimer: number;
  shieldActive: boolean;
  shieldTimer: number;
  health: number;
  maxHealth: number;
  lives: number;
  weapon: WeaponConfig;
  score: number;
  correctAnswersCount: number;
  streak: number;
  inWater: boolean;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  type: WeaponType;
  color: string;
  isPlayer: boolean;
  piercing?: boolean;
  life: number;
  trail?: { x: number; y: number }[];
  targetId?: number;
}

export interface Enemy {
  id: number;
  type: 'runner' | 'sniper' | 'turret' | 'drone' | 'boss_head' | 'boss_turret';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  scoreValue: number;
  facing: 'left' | 'right';
  shootCooldown: number;
  shootInterval: number;
  active: boolean;
  phase?: number;
  animFrame?: number;
  angle?: number;
}

export interface ObstacleBarrier {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  description: string;
  isCleared: boolean;
  question: QuizQuestion;
  themeColor: string;
  pulseTimer: number;
  isBossGate?: boolean;
}

export interface DropCapsule {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  weaponType: WeaponType | 'SHIELD' | 'LIFE';
  collected: boolean;
  lifeTime: number;
}

export interface FlyingPod {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  weaponType: WeaponType | 'SHIELD' | 'LIFE';
  health: number;
  isOpened: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  alpha: number;
  type?: 'spark' | 'smoke' | 'debris' | 'shockwave';
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'bridge' | 'floating' | 'water' | 'hazard';
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  correctAnswers: number;
  score: number;
  subjectName: string;
  date: string;
  stageReached: string;
  weaponUsed: string;
}

export type GameState = 'START' | 'PLAYING' | 'QUIZ' | 'PAUSED' | 'GAMEOVER' | 'VICTORY';
