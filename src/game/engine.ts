import { getQuestionsForSubject } from '../data/quizQuestions';
import { soundEngine } from '../services/soundEngine';
import { 
  Bullet, 
  DropCapsule, 
  Enemy, 
  FlyingPod, 
  ObstacleBarrier, 
  Particle, 
  Platform, 
  PlayerState, 
  QuizQuestion, 
  SubjectId, 
  WeaponConfig, 
  WeaponType 
} from '../types';
import { 
  CANVAS_HEIGHT, 
  CANVAS_WIDTH, 
  FRICTION, 
  GRAVITY, 
  JUMP_FORCE, 
  PLAYER_SPEED, 
  WEAPON_CONFIGS 
} from './constants';
import { PixelRenderer } from './pixelArt';

export interface KeyState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  shoot: boolean;
  jump: boolean;
}

export class ContraGameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number | null = null;
  private isRunning: boolean = false;
  private isPaused: boolean = false;

  public player: PlayerState;
  public cameraX: number = 0;
  public tick: number = 0;
  public lastShotTime: number = 0;

  public bullets: Bullet[] = [];
  public enemies: Enemy[] = [];
  public barriers: ObstacleBarrier[] = [];
  public dropCapsules: DropCapsule[] = [];
  public flyingPods: FlyingPod[] = [];
  public particles: Particle[] = [];
  public platforms: Platform[] = [];

  public selectedSubject: SubjectId = 'all';
  private questionsPool: QuizQuestion[] = [];
  private activeBarrierForQuiz: ObstacleBarrier | null = null;

  public keys: KeyState = {
    left: false,
    right: false,
    up: false,
    down: false,
    shoot: false,
    jump: false,
  };

  private nextBulletId: number = 1;
  private nextEnemyId: number = 1;
  private nextDropId: number = 1;
  private spawnEnemyTimer: number = 0;
  private spawnPodTimer: number = 0;

  // Callbacks
  public onTriggerQuiz?: (barrier: ObstacleBarrier) => void;
  public onGameOver?: (victory: boolean, stats: { score: number; correctAnswers: number; stage: string; weapon: string }) => void;
  public onStatsUpdate?: (player: PlayerState) => void;

  constructor(canvas: HTMLCanvasElement, subject: SubjectId = 'all') {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get canvas 2D context');
    this.ctx = context;
    this.selectedSubject = subject;

    this.player = this.createInitialPlayer();
    this.initLevel();
  }

  private createInitialPlayer(): PlayerState {
    return {
      x: 100,
      y: 330,
      vx: 0,
      vy: 0,
      width: 28,
      height: 40,
      facing: 'right',
      aimAngle: 0,
      aimDir: { dx: 1, dy: 0 },
      isGrounded: true,
      isCrouching: false,
      isJumping: false,
      jumpFlipAngle: 0,
      isInvulnerable: false,
      invulnerableTimer: 0,
      shieldActive: false,
      shieldTimer: 0,
      health: 100,
      maxHealth: 100,
      lives: 6,
      weapon: { ...WEAPON_CONFIGS.RIFLE },
      score: 0,
      correctAnswersCount: 0,
      streak: 0,
      inWater: false,
    };
  }

  public setSubject(subject: SubjectId) {
    this.selectedSubject = subject;
    this.questionsPool = getQuestionsForSubject(subject);
    // Refresh question on active barriers that are not cleared
    this.barriers.forEach((b, idx) => {
      if (!b.isCleared) {
        b.question = this.questionsPool[idx % this.questionsPool.length];
      }
    });
  }

  private initLevel() {
    this.questionsPool = getQuestionsForSubject(this.selectedSubject);

    // Level Platforms across ~5500px adventure
    this.platforms = [
      // Base ground sections with water trenches
      { x: 0, y: 390, width: 900, height: 60, type: 'ground' },
      { x: 900, y: 400, width: 200, height: 50, type: 'water' }, // water trench 1
      { x: 1100, y: 390, width: 1100, height: 60, type: 'ground' },
      { x: 2200, y: 400, width: 220, height: 50, type: 'water' }, // water trench 2
      { x: 2420, y: 390, width: 1200, height: 60, type: 'ground' },
      { x: 3620, y: 400, width: 240, height: 50, type: 'water' }, // water trench 3
      { x: 3860, y: 390, width: 1600, height: 60, type: 'ground' },

      // Elevated bridges and tactical firing ledges
      { x: 250, y: 320, width: 140, height: 16, type: 'bridge' },
      { x: 450, y: 260, width: 180, height: 16, type: 'bridge' },
      { x: 720, y: 310, width: 150, height: 16, type: 'floating' },

      // Zone 2 ledges
      { x: 1300, y: 310, width: 160, height: 16, type: 'floating' },
      { x: 1550, y: 240, width: 180, height: 16, type: 'bridge' },
      { x: 1800, y: 310, width: 160, height: 16, type: 'floating' },

      // Zone 3 ledges
      { x: 2600, y: 310, width: 160, height: 16, type: 'bridge' },
      { x: 2850, y: 250, width: 200, height: 16, type: 'bridge' },
      { x: 3150, y: 300, width: 180, height: 16, type: 'floating' },
      { x: 3400, y: 240, width: 160, height: 16, type: 'floating' },

      // Boss Arena ledges
      { x: 4100, y: 320, width: 180, height: 16, type: 'bridge' },
      { x: 4400, y: 260, width: 220, height: 16, type: 'floating' },
      { x: 4700, y: 310, width: 180, height: 16, type: 'bridge' },
    ];

    // Knowledge Obstacle Barriers (Forcefield Gates)
    const q1 = this.questionsPool[0] || getQuestionsForSubject('all')[0];
    const q2 = this.questionsPool[1] || getQuestionsForSubject('all')[1];
    const q3 = this.questionsPool[2] || getQuestionsForSubject('all')[2];
    const q4 = this.questionsPool[3] || getQuestionsForSubject('all')[3];

    this.barriers = [
      {
        id: 1,
        x: 1050,
        y: 120,
        width: 32,
        height: 270,
        title: 'CỔNG PHÒNG TUYẾN ALPHA (CÂU HỎI 1)',
        description: 'Tia laser điện từ năng lượng cao phong tỏa lối đi. Cần giải mã câu hỏi để vô hiệu hóa cổng!',
        isCleared: false,
        question: q1,
        themeColor: '#3b82f6',
        pulseTimer: 0,
      },
      {
        id: 2,
        x: 2350,
        y: 120,
        width: 32,
        height: 270,
        title: 'LƯỚI LỬA NĂNG LƯỢNG BRAVO (CÂU HỎI 2)',
        description: 'Cổng bảo vệ an ninh cấp 2. Nhập đáp án chính xác để giải trừ rào chắn!',
        isCleared: false,
        question: q2,
        themeColor: '#10b981',
        pulseTimer: 0,
      },
      {
        id: 3,
        x: 3750,
        y: 120,
        width: 32,
        height: 270,
        title: 'CỔNG TỪ TRƯỜNG DELTA (CÂU HỎI 3)',
        description: 'Vành đai phòng vệ tiền trạm pháo đài Red Falcon. Giải mã để tiếp cận Boss!',
        isCleared: false,
        question: q3,
        themeColor: '#f59e0b',
        pulseTimer: 0,
      },
      {
        id: 4,
        x: 4950,
        y: 100,
        width: 36,
        height: 290,
        title: 'LÁ CHẮN TỐI HẬU PHÁO ĐÀI (CÂU HỎI QUYẾT ĐỊNH)',
        description: 'Lá chắn nguyên tử bảo vệ Trùm Cuối. Giải mã câu hỏi này để mở khoá sát thương Boss!',
        isCleared: false,
        question: q4,
        themeColor: '#ef4444',
        pulseTimer: 0,
        isBossGate: true,
      },
    ];

    // Initial pre-placed enemies
    this.enemies = [
      // Early scouts
      { id: this.nextEnemyId++, type: 'runner', x: 500, y: 350, vx: -1.8, vy: 0, width: 24, height: 38, health: 25, maxHealth: 25, scoreValue: 150, facing: 'left', shootCooldown: 120, shootInterval: 140, active: true },
      { id: this.nextEnemyId++, type: 'runner', x: 750, y: 350, vx: -1.8, vy: 0, width: 24, height: 38, health: 25, maxHealth: 25, scoreValue: 150, facing: 'left', shootCooldown: 80, shootInterval: 150, active: true },
      { id: this.nextEnemyId++, type: 'sniper', x: 480, y: 226, vx: 0, vy: 0, width: 22, height: 34, health: 35, maxHealth: 35, scoreValue: 250, facing: 'left', shootCooldown: 60, shootInterval: 130, active: true },
      { id: this.nextEnemyId++, type: 'turret', x: 820, y: 280, vx: 0, vy: 0, width: 28, height: 28, health: 50, maxHealth: 50, scoreValue: 300, facing: 'left', shootCooldown: 90, shootInterval: 120, active: true },

      // Zone 2 enemies
      { id: this.nextEnemyId++, type: 'runner', x: 1400, y: 350, vx: -2, vy: 0, width: 24, height: 38, health: 30, maxHealth: 30, scoreValue: 150, facing: 'left', shootCooldown: 90, shootInterval: 140, active: true },
      { id: this.nextEnemyId++, type: 'sniper', x: 1600, y: 206, vx: 0, vy: 0, width: 22, height: 34, health: 40, maxHealth: 40, scoreValue: 250, facing: 'left', shootCooldown: 70, shootInterval: 120, active: true },
      { id: this.nextEnemyId++, type: 'turret', x: 1850, y: 280, vx: 0, vy: 0, width: 28, height: 28, health: 60, maxHealth: 60, scoreValue: 300, facing: 'left', shootCooldown: 100, shootInterval: 110, active: true },
      { id: this.nextEnemyId++, type: 'drone', x: 1700, y: 150, vx: -2.2, vy: 0, width: 26, height: 26, health: 35, maxHealth: 35, scoreValue: 200, facing: 'left', shootCooldown: 80, shootInterval: 120, active: true },

      // Zone 3 enemies
      { id: this.nextEnemyId++, type: 'runner', x: 2700, y: 350, vx: -2.2, vy: 0, width: 24, height: 38, health: 35, maxHealth: 35, scoreValue: 180, facing: 'left', shootCooldown: 90, shootInterval: 130, active: true },
      { id: this.nextEnemyId++, type: 'sniper', x: 2900, y: 216, vx: 0, vy: 0, width: 22, height: 34, health: 50, maxHealth: 50, scoreValue: 300, facing: 'left', shootCooldown: 60, shootInterval: 100, active: true },
      { id: this.nextEnemyId++, type: 'turret', x: 3200, y: 270, vx: 0, vy: 0, width: 28, height: 28, health: 70, maxHealth: 70, scoreValue: 350, facing: 'left', shootCooldown: 80, shootInterval: 100, active: true },
      { id: this.nextEnemyId++, type: 'drone', x: 3050, y: 140, vx: -2.5, vy: 0, width: 26, height: 26, health: 40, maxHealth: 40, scoreValue: 250, facing: 'left', shootCooldown: 70, shootInterval: 110, active: true },

      // Boss Arena! Red Falcon Alien Fortress Core
      { 
        id: this.nextEnemyId++, 
        type: 'boss_head', 
        x: 5200, 
        y: 200, 
        vx: 0, 
        vy: 0, 
        width: 80, 
        height: 100, 
        health: 500, 
        maxHealth: 500, 
        scoreValue: 10000, 
        facing: 'left', 
        shootCooldown: 60, 
        shootInterval: 70, 
        active: true,
      },
      { 
        id: this.nextEnemyId++, 
        type: 'boss_turret', 
        x: 5120, 
        y: 310, 
        vx: 0, 
        vy: 0, 
        width: 32, 
        height: 32, 
        health: 120, 
        maxHealth: 120, 
        scoreValue: 800, 
        facing: 'left', 
        shootCooldown: 80, 
        shootInterval: 90, 
        active: true,
      }
    ];

    // Initial drop capsule near start to let player taste upgrade right away!
    this.dropCapsules.push({
      id: this.nextDropId++,
      x: 350,
      y: 290,
      vx: 0,
      vy: 0,
      weaponType: 'SPREAD',
      collected: false,
      lifeTime: 3000,
    });
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    soundEngine.startBGM();
    this.loop();
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
  }

  public stop() {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    soundEngine.stopBGM();
  }

  public restart() {
    this.stop();
    this.player = this.createInitialPlayer();
    this.cameraX = 0;
    this.tick = 0;
    this.bullets = [];
    this.particles = [];
    this.dropCapsules = [];
    this.flyingPods = [];
    this.initLevel();
    this.start();
  }

  // Handle Knowledge Barrier Clearance
  public handleBarrierSuccess(barrierId: number) {
    const barrier = this.barriers.find(b => b.id === barrierId);
    if (!barrier) return;

    barrier.isCleared = true;
    this.player.correctAnswersCount++;
    this.player.streak++;
    this.player.score += 1500 * this.player.streak;

    soundEngine.playCorrectAnswer();
    soundEngine.playBarrierClear();

    // Spawn massive celebration sparks & drops
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: barrier.x + barrier.width / 2,
        y: barrier.y + Math.random() * barrier.height,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: 3 + Math.random() * 5,
        color: ['#facc15', '#38bdf8', '#4ade80', '#f43f5e'][Math.floor(Math.random() * 4)],
        life: 0,
        maxLife: 45,
        alpha: 1,
        type: 'spark',
      });
    }

    // Reward player with a high-tier weapon drop or shield
    const rewardWeapons: (WeaponType | 'SHIELD')[] = ['SPREAD', 'LASER', 'FLAME', 'HOMING', 'SHIELD'];
    const chosenReward = rewardWeapons[Math.floor(Math.random() * rewardWeapons.length)];
    this.dropCapsules.push({
      id: this.nextDropId++,
      x: barrier.x + 50,
      y: barrier.y + barrier.height / 2,
      vx: 1.5,
      vy: -2,
      weaponType: chosenReward,
      collected: false,
      lifeTime: 2500,
    });

    this.activeBarrierForQuiz = null;
    this.resume();
  }

  public handleBarrierFailure() {
    this.player.streak = 0;
    soundEngine.playWrongAnswer();
  }

  // Core Game Loop
  private loop = () => {
    if (!this.isRunning) return;

    if (!this.isPaused) {
      this.update();
    }
    this.render();

    this.animationId = requestAnimationFrame(this.loop);
  };

  private update() {
    this.tick++;

    this.updateAimDirection();
    this.updatePlayerPhysics();
    this.handleShooting();
    this.updateBullets();
    this.updateEnemies();
    this.updatePodsAndDrops();
    this.updateBarriers();
    this.updateParticles();
    this.updateCamera();

    // Spawning extra tactical pods and running soldier waves
    this.spawnEnemyTimer++;
    if (this.spawnEnemyTimer > 180) {
      this.spawnEnemyTimer = 0;
      this.spawnWaveEnemy();
    }

    this.spawnPodTimer++;
    if (this.spawnPodTimer > 500) {
      this.spawnPodTimer = 0;
      this.spawnFlyingPod();
    }

    // Sync stats
    if (this.onStatsUpdate && this.tick % 6 === 0) {
      this.onStatsUpdate({ ...this.player });
    }
  }

  // 8-Directional Aim Calculation
  private updateAimDirection() {
    const p = this.player;
    let dx = 0;
    let dy = 0;

    const isLeft = this.keys.left;
    const isRight = this.keys.right;
    const isUp = this.keys.up;
    const isDown = this.keys.down;

    if (isLeft && !isRight) {
      p.facing = 'left';
    } else if (isRight && !isLeft) {
      p.facing = 'right';
    }

    const defaultDx = p.facing === 'left' ? -1 : 1;

    if (p.isCrouching && p.isGrounded) {
      // Crouching: shoots horizontally along ground
      dx = defaultDx;
      dy = 0;
    } else if (isUp && !isDown) {
      if (isLeft || isRight) {
        // Diagonal Up-Left or Up-Right
        dx = defaultDx * 0.707;
        dy = -0.707;
      } else {
        // Straight Up
        dx = 0;
        dy = -1;
      }
    } else if (isDown && !isUp) {
      if (!p.isGrounded) {
        // Aiming down in mid-air
        if (isLeft || isRight) {
          dx = defaultDx * 0.707;
          dy = 0.707;
        } else {
          dx = 0;
          dy = 1;
        }
      } else {
        // On ground with Down: Crouch
        dx = defaultDx;
        dy = 0;
      }
    } else {
      // Horizontal straight
      dx = defaultDx;
      dy = 0;
    }

    p.aimDir = { dx, dy };
    p.aimAngle = Math.atan2(dy, dx);
  }

  private updatePlayerPhysics() {
    const p = this.player;

    // Crouching logic: on ground + holding Down and not moving sideways
    if (this.keys.down && p.isGrounded && !this.keys.left && !this.keys.right) {
      p.isCrouching = true;
    } else {
      p.isCrouching = false;
    }

    // Horizontal movement (only when not crouching)
    if (!p.isCrouching) {
      if (this.keys.left) {
        p.vx = -PLAYER_SPEED;
      } else if (this.keys.right) {
        p.vx = PLAYER_SPEED;
      } else {
        p.vx *= FRICTION;
        if (Math.abs(p.vx) < 0.2) p.vx = 0;
      }
    } else {
      p.vx = 0;
    }

    // Jump handling
    if (this.keys.jump && p.isGrounded && !p.isCrouching) {
      p.vy = JUMP_FORCE;
      p.isGrounded = false;
      p.isJumping = true;
      p.jumpFlipAngle = 0;
      soundEngine.playJump();
    }

    // Apply gravity
    p.vy += GRAVITY;
    if (p.vy > 12) p.vy = 12; // Terminal velocity

    // Jump spin animation
    if (p.isJumping) {
      const spinSpeed = p.facing === 'left' ? -0.35 : 0.35;
      p.jumpFlipAngle += spinSpeed;
    }

    // Next intended position
    const nextX = p.x + p.vx;
    const nextY = p.y + p.vy;

    // Barrier check - cannot walk through uncleared barriers!
    let blockedByBarrier = false;
    for (const b of this.barriers) {
      if (!b.isCleared) {
        // Collision box
        if (
          nextX + p.width > b.x &&
          nextX < b.x + b.width &&
          nextY + p.height > b.y &&
          nextY < b.y + b.height
        ) {
          blockedByBarrier = true;
          p.vx = 0;

          // Trigger quiz modal!
          if (this.activeBarrierForQuiz?.id !== b.id) {
            this.activeBarrierForQuiz = b;
            this.pause();
            soundEngine.playBarrierHum();
            if (this.onTriggerQuiz) {
              this.onTriggerQuiz(b);
            }
          }
          break;
        }
      }
    }

    if (!blockedByBarrier) {
      p.x = Math.max(0, nextX);
    }

    // Platform collisions
    p.isGrounded = false;
    p.inWater = false;

    for (const plat of this.platforms) {
      // Check top landing collision
      if (
        p.x + p.width * 0.7 > plat.x &&
        p.x + p.width * 0.3 < plat.x + plat.width
      ) {
        // Landing on platform from above
        if (p.y + p.height <= plat.y + 12 && nextY + p.height >= plat.y) {
          p.y = plat.y - p.height;
          p.vy = 0;
          p.isGrounded = true;
          p.isJumping = false;
          if (plat.type === 'water') {
            p.inWater = true;
          }
          break;
        }
      }
    }

    if (!p.isGrounded) {
      p.y = nextY;
    }

    // Ground floor safeguard
    if (p.y > CANVAS_HEIGHT - 60 - p.height) {
      p.y = CANVAS_HEIGHT - 60 - p.height;
      p.vy = 0;
      p.isGrounded = true;
      p.isJumping = false;
    }

    // Invulnerability timers
    if (p.isInvulnerable) {
      p.invulnerableTimer--;
      if (p.invulnerableTimer <= 0) {
        p.isInvulnerable = false;
      }
    }

    if (p.shieldActive) {
      p.shieldTimer--;
      if (p.shieldTimer <= 0) {
        p.shieldActive = false;
      }
    }
  }

  // Shooting System & Weapons
  private handleShooting() {
    if (!this.keys.shoot) return;

    const now = Date.now();
    const w = this.player.weapon;
    const cooldown = Math.max(60, w.fireRate - (w.level - 1) * 25);

    if (now - this.lastShotTime < cooldown) return;
    this.lastShotTime = now;

    // Gun muzzle position
    const isLeft = this.player.facing === 'left';
    const cx = this.player.x + this.player.width / 2;
    const cy = this.player.isCrouching ? this.player.y + this.player.height - 10 : this.player.y + 16;
    const spawnX = cx + this.player.aimDir.dx * 18;
    const spawnY = cy + this.player.aimDir.dy * 18;

    const baseSpeed = w.speed;
    const baseDamage = w.damage * (1 + (w.level - 1) * 0.35);

    if (w.type === 'RIFLE') {
      soundEngine.playShootRifle();
      this.bullets.push({
        id: this.nextBulletId++,
        x: spawnX,
        y: spawnY,
        vx: this.player.aimDir.dx * baseSpeed,
        vy: this.player.aimDir.dy * baseSpeed,
        radius: w.bulletRadius,
        damage: baseDamage,
        type: 'RIFLE',
        color: w.color,
        isPlayer: true,
        life: 70,
      });
    } else if (w.type === 'MACHINE') {
      soundEngine.playShootMachine();
      // Slight bullet spray variance
      const jitter = (Math.random() - 0.5) * 0.08;
      const angle = this.player.aimAngle + jitter;
      this.bullets.push({
        id: this.nextBulletId++,
        x: spawnX,
        y: spawnY,
        vx: Math.cos(angle) * (baseSpeed + (Math.random() * 2)),
        vy: Math.sin(angle) * (baseSpeed + (Math.random() * 2)),
        radius: w.bulletRadius,
        damage: baseDamage,
        type: 'MACHINE',
        color: w.color,
        isPlayer: true,
        life: 65,
      });
    } else if (w.type === 'SPREAD') {
      soundEngine.playShootSpread();
      // Spread shots: 5 or 7 angles
      const pelletCount = w.level >= 2 ? 7 : 5;
      const angleSpread = w.level >= 2 ? 0.65 : 0.5; // in radians
      const angleStep = angleSpread / (pelletCount - 1);
      const startAngle = this.player.aimAngle - angleSpread / 2;

      for (let i = 0; i < pelletCount; i++) {
        const a = startAngle + i * angleStep;
        this.bullets.push({
          id: this.nextBulletId++,
          x: spawnX,
          y: spawnY,
          vx: Math.cos(a) * baseSpeed,
          vy: Math.sin(a) * baseSpeed,
          radius: w.bulletRadius,
          damage: baseDamage * 0.8,
          type: 'SPREAD',
          color: w.color,
          isPlayer: true,
          life: 60,
        });
      }
    } else if (w.type === 'LASER') {
      soundEngine.playShootLaser();
      // Continuous piercing beam
      this.bullets.push({
        id: this.nextBulletId++,
        x: spawnX,
        y: spawnY,
        vx: this.player.aimDir.dx * baseSpeed * 1.3,
        vy: this.player.aimDir.dy * baseSpeed * 1.3,
        radius: w.bulletRadius + (w.level - 1),
        damage: baseDamage * 1.4,
        type: 'LASER',
        color: w.color,
        isPlayer: true,
        piercing: true,
        life: 50,
      });
    } else if (w.type === 'FLAME') {
      soundEngine.playShootFlame();
      // Swirling fiery projectile that explodes
      this.bullets.push({
        id: this.nextBulletId++,
        x: spawnX,
        y: spawnY,
        vx: this.player.aimDir.dx * baseSpeed,
        vy: this.player.aimDir.dy * baseSpeed,
        radius: w.bulletRadius + (w.level - 1) * 2,
        damage: baseDamage * 1.2,
        type: 'FLAME',
        color: w.color,
        isPlayer: true,
        life: 55,
      });
    } else if (w.type === 'HOMING') {
      soundEngine.playShootHoming();
      // Find closest active enemy
      let closestEnemy: Enemy | null = null;
      let minDist = 600;
      for (const e of this.enemies) {
        if (!e.active) continue;
        const d = Math.hypot(e.x - spawnX, e.y - spawnY);
        if (d < minDist) {
          minDist = d;
          closestEnemy = e;
        }
      }

      const count = w.level >= 2 ? 3 : 2;
      for (let i = 0; i < count; i++) {
        const offsetAngle = (i - (count - 1) / 2) * 0.3;
        this.bullets.push({
          id: this.nextBulletId++,
          x: spawnX,
          y: spawnY,
          vx: Math.cos(this.player.aimAngle + offsetAngle) * baseSpeed,
          vy: Math.sin(this.player.aimAngle + offsetAngle) * baseSpeed,
          radius: w.bulletRadius,
          damage: baseDamage,
          type: 'HOMING',
          color: w.color,
          isPlayer: true,
          life: 80,
          targetId: closestEnemy ? closestEnemy.id : undefined,
        });
      }
    }
  }

  private updateBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];

      // Homing missile steering
      if (b.type === 'HOMING' && b.targetId) {
        const target = this.enemies.find(e => e.id === b.targetId && e.active);
        if (target) {
          const tcx = target.x + target.width / 2;
          const tcy = target.y + target.height / 2;
          const curAngle = Math.atan2(b.vy, b.vx);
          const wantAngle = Math.atan2(tcy - b.y, tcx - b.x);
          let diff = wantAngle - curAngle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          const turn = Math.sign(diff) * Math.min(Math.abs(diff), 0.12);
          const newAngle = curAngle + turn;
          const spd = Math.hypot(b.vx, b.vy);
          b.vx = Math.cos(newAngle) * spd;
          b.vy = Math.sin(newAngle) * spd;
        }
      }

      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      // Remove out of bounds or dead bullets
      if (
        b.life <= 0 ||
        b.y < -50 ||
        b.y > CANVAS_HEIGHT + 50 ||
        b.x < this.cameraX - 100 ||
        b.x > this.cameraX + CANVAS_WIDTH + 100
      ) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Player bullets vs Enemies
      if (b.isPlayer) {
        let bulletConsumed = false;

        for (const enemy of this.enemies) {
          if (!enemy.active) continue;

          // Hit check
          if (
            b.x + b.radius > enemy.x &&
            b.x - b.radius < enemy.x + enemy.width &&
            b.y + b.radius > enemy.y &&
            b.y - b.radius < enemy.y + enemy.height
          ) {
            enemy.health -= b.damage;

            // Hit spark
            this.particles.push({
              x: b.x,
              y: b.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              size: 2,
              color: '#facc15',
              life: 0,
              maxLife: 15,
              alpha: 1,
            });

            if (enemy.health <= 0) {
              enemy.active = false;
              this.player.score += enemy.scoreValue;

              if (enemy.type === 'boss_head') {
                soundEngine.playBossExplode();
                this.triggerBossVictory();
              } else {
                soundEngine.playEnemyExplode();
              }

              // Explosion particles
              this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.type === 'boss_head' ? 50 : 16);

              // Chance to drop weapon pod or life
              if (Math.random() < 0.25) {
                const types: (WeaponType | 'SHIELD')[] = ['MACHINE', 'SPREAD', 'LASER', 'FLAME', 'HOMING', 'SHIELD'];
                this.dropCapsules.push({
                  id: this.nextDropId++,
                  x: enemy.x,
                  y: enemy.y,
                  vx: 0,
                  vy: -1.5,
                  weaponType: types[Math.floor(Math.random() * types.length)],
                  collected: false,
                  lifeTime: 1800,
                });
              }
            }

            if (!b.piercing) {
              bulletConsumed = true;
              break;
            }
          }
        }

        // Check if hit flying pod
        for (const pod of this.flyingPods) {
          if (pod.isOpened) continue;
          if (
            b.x > pod.x && b.x < pod.x + 36 &&
            b.y > pod.y && b.y < pod.y + 24
          ) {
            pod.isOpened = true;
            soundEngine.playEnemyExplode();
            this.createExplosion(pod.x + 18, pod.y + 12, 14);

            // Drop weapon emblem!
            this.dropCapsules.push({
              id: this.nextDropId++,
              x: pod.x + 12,
              y: pod.y + 8,
              vx: 0,
              vy: -2,
              weaponType: pod.weaponType,
              collected: false,
              lifeTime: 2000,
            });

            bulletConsumed = true;
            break;
          }
        }

        if (bulletConsumed) {
          this.bullets.splice(i, 1);
          continue;
        }
      } else {
        // Enemy bullets vs Player
        const p = this.player;
        if (!p.isInvulnerable) {
          const hitBoxY = p.isCrouching ? p.y + p.height - 16 : p.y;
          const hitBoxH = p.isCrouching ? 16 : p.height;

          if (
            b.x + b.radius > p.x &&
            b.x - b.radius < p.x + p.width &&
            b.y + b.radius > hitBoxY &&
            b.y - b.radius < hitBoxY + hitBoxH
          ) {
            this.bullets.splice(i, 1);
            this.damagePlayer();
            continue;
          }
        }
      }
    }
  }

  private damagePlayer() {
    const p = this.player;
    if (p.shieldActive) {
      // Shield absorbs hit
      p.shieldActive = false;
      soundEngine.playBarrierHum();
      this.createExplosion(p.x + p.width / 2, p.y + p.height / 2, 10);
      return;
    }

    soundEngine.playPlayerHit();
    p.lives--;
    p.streak = 0;
    p.isInvulnerable = true;
    p.invulnerableTimer = 120; // 2 seconds flash

    this.createExplosion(p.x + p.width / 2, p.y + p.height / 2, 20);

    if (p.lives <= 0) {
      this.gameOver(false);
    }
  }

  private gameOver(victory: boolean) {
    this.stop();
    if (this.onGameOver) {
      this.onGameOver(victory, {
        score: this.player.score,
        correctAnswers: this.player.correctAnswersCount,
        stage: victory ? 'HOÀN THÀNH CHIẾN DỊCH' : `TIẾN ĐỘ ${Math.floor((this.player.x / 5200) * 100)}%`,
        weapon: `${this.player.weapon.type} (Lv${this.player.weapon.level})`,
      });
    }
  }

  private triggerBossVictory() {
    this.player.score += 25000;
    for (let i = 0; i < 60; i++) {
      this.createExplosion(5200 + (Math.random() - 0.5) * 120, 200 + (Math.random() - 0.5) * 100, 30);
    }
    setTimeout(() => {
      this.gameOver(true);
    }, 1500);
  }

  private updateEnemies() {
    const px = this.player.x;
    const py = this.player.y;

    for (const enemy of this.enemies) {
      if (!enemy.active) continue;

      // Distance to player
      const dist = Math.abs(enemy.x - px);
      if (dist > CANVAS_WIDTH * 1.5) continue; // Sleep if far

      enemy.facing = enemy.x > px ? 'left' : 'right';

      if (enemy.type === 'runner') {
        enemy.x += enemy.vx;
        // Gravity & floor
        enemy.y += GRAVITY * 2;
        if (enemy.y > 352) enemy.y = 352;

        // Turn around on ledges or edge
        if (enemy.x < px - 400 || enemy.x > px + 600) {
          enemy.vx *= -1;
        }

        // Contact damage to player
        if (!this.player.isInvulnerable) {
          if (
            Math.abs(enemy.x - this.player.x) < 20 &&
            Math.abs(enemy.y - this.player.y) < 30
          ) {
            this.damagePlayer();
          }
        }
      } else if (enemy.type === 'turret') {
        // Rotate turret towards player
        enemy.angle = Math.atan2(py - enemy.y, px - enemy.x);
      } else if (enemy.type === 'drone') {
        enemy.x += enemy.vx;
        enemy.y += Math.sin(this.tick * 0.08) * 1.5;
        if (enemy.x < this.cameraX - 100) {
          enemy.x = this.cameraX + CANVAS_WIDTH + 100;
        }
      }

      // Enemy shooting AI
      enemy.shootCooldown--;
      if (enemy.shootCooldown <= 0) {
        enemy.shootCooldown = enemy.shootInterval + Math.floor(Math.random() * 30);

        if (enemy.type === 'runner' && Math.random() < 0.4) {
          // Shoot single bullet forward
          const dir = enemy.facing === 'left' ? -1 : 1;
          this.bullets.push({
            id: this.nextBulletId++,
            x: enemy.x + (dir === -1 ? -4 : enemy.width + 4),
            y: enemy.y + 14,
            vx: dir * 4.5,
            vy: 0,
            radius: 3.5,
            damage: 20,
            type: 'RIFLE',
            color: '#ef4444',
            isPlayer: false,
            life: 80,
          });
        } else if (enemy.type === 'sniper' || enemy.type === 'turret' || enemy.type === 'boss_turret') {
          // Aim directly at player's center
          const angle = Math.atan2(py + 16 - enemy.y, px + 14 - enemy.x);
          this.bullets.push({
            id: this.nextBulletId++,
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height / 2,
            vx: Math.cos(angle) * 5,
            vy: Math.sin(angle) * 5,
            radius: 4,
            damage: 25,
            type: 'RIFLE',
            color: '#f87171',
            isPlayer: false,
            life: 90,
          });
        } else if (enemy.type === 'boss_head') {
          // Boss fires 3-way spread energy bursts
          const baseAngle = Math.atan2(py - enemy.y, px - enemy.x);
          for (let a = -0.3; a <= 0.3; a += 0.3) {
            this.bullets.push({
              id: this.nextBulletId++,
              x: enemy.x + 20,
              y: enemy.y + 40,
              vx: Math.cos(baseAngle + a) * 5.2,
              vy: Math.sin(baseAngle + a) * 5.2,
              radius: 6,
              damage: 30,
              type: 'FLAME',
              color: '#dc2626',
              isPlayer: false,
              life: 100,
            });
          }
        }
      }
    }
  }

  private updatePodsAndDrops() {
    // Flying weapon pods
    for (let i = this.flyingPods.length - 1; i >= 0; i--) {
      const pod = this.flyingPods[i];
      pod.x += pod.vx;
      pod.y += Math.sin(this.tick * 0.05) * 1.8;

      if (pod.x < this.cameraX - 100 || pod.isOpened) {
        this.flyingPods.splice(i, 1);
      }
    }

    // Dropped weapon emblems
    const p = this.player;
    for (let i = this.dropCapsules.length - 1; i >= 0; i--) {
      const drop = this.dropCapsules[i];
      drop.lifeTime--;

      // Gravity until resting on ground
      drop.vy += 0.2;
      drop.y += drop.vy;
      if (drop.y > 360) {
        drop.y = 360;
        drop.vy = 0;
      }

      // Check player collection
      if (
        Math.abs(drop.x + 12 - (p.x + p.width / 2)) < 24 &&
        Math.abs(drop.y - (p.y + p.height / 2)) < 30
      ) {
        // Collect powerup!
        soundEngine.playPowerUp();
        this.applyPowerUp(drop.weaponType);
        this.player.score += 500;
        this.dropCapsules.splice(i, 1);
        continue;
      }

      if (drop.lifeTime <= 0) {
        this.dropCapsules.splice(i, 1);
      }
    }
  }

  // Weapon Upgrade Logic
  public applyPowerUp(type: WeaponType | 'SHIELD' | 'LIFE') {
    if (type === 'SHIELD') {
      this.player.shieldActive = true;
      this.player.shieldTimer = 600; // 10 seconds shield
      return;
    }

    if (type === 'LIFE') {
      this.player.lives = Math.min(10, this.player.lives + 1);
      return;
    }

    // Weapon upgrade
    if (this.player.weapon.type === type) {
      // Level up existing weapon!
      this.player.weapon.level = Math.min(3, this.player.weapon.level + 1);
    } else {
      // Switch weapon with config
      this.player.weapon = {
        ...WEAPON_CONFIGS[type],
        level: 1,
      };
    }
  }

  private updateBarriers() {
    // Pulse animation
    for (const b of this.barriers) {
      b.pulseTimer++;
    }
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      p.alpha = 1 - p.life / p.maxLife;

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateCamera() {
    // Smooth scroll camera following player horizontally, keeping player in left-center zone
    const targetCameraX = Math.max(0, this.player.x - CANVAS_WIDTH * 0.35);
    this.cameraX += (targetCameraX - this.cameraX) * 0.15;
  }

  private spawnWaveEnemy() {
    const spawnX = this.cameraX + CANVAS_WIDTH + 60;
    this.enemies.push({
      id: this.nextEnemyId++,
      type: 'runner',
      x: spawnX,
      y: 350,
      vx: -2.4,
      vy: 0,
      width: 24,
      height: 38,
      health: 25,
      maxHealth: 25,
      scoreValue: 150,
      facing: 'left',
      shootCooldown: 80,
      shootInterval: 140,
      active: true,
    });
  }

  private spawnFlyingPod() {
    const types: WeaponType[] = ['MACHINE', 'SPREAD', 'LASER', 'FLAME', 'HOMING'];
    const chosen = types[Math.floor(Math.random() * types.length)];
    this.flyingPods.push({
      id: this.nextDropId++,
      x: this.cameraX + CANVAS_WIDTH + 40,
      y: 90 + Math.random() * 80,
      vx: -2.8,
      vy: 0,
      weaponType: chosen,
      health: 1,
      isOpened: false,
    });
  }

  private createExplosion(x: number, y: number, count: number = 18) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 4,
        color: ['#f97316', '#ef4444', '#facc15', '#ffffff'][Math.floor(Math.random() * 4)],
        life: 0,
        maxLife: 20 + Math.floor(Math.random() * 20),
        alpha: 1,
        type: 'debris',
      });
    }
  }

  // Render everything to Canvas
  private render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Parallax Stars and Mountains
    PixelRenderer.drawBackground(ctx, this.cameraX, this.tick);

    // 2. Base Ground
    PixelRenderer.drawPlatforms(ctx, this.cameraX, this.tick);

    // 3. Elevated Platforms & Bridges
    for (const plat of this.platforms) {
      if (plat.type !== 'ground') {
        PixelRenderer.drawPlatform(ctx, plat.x, plat.y, plat.width, plat.height, plat.type, this.cameraX, this.tick);
      }
    }

    // 4. Knowledge Obstacles (Barriers)
    for (const b of this.barriers) {
      PixelRenderer.drawBarrier(ctx, b, this.cameraX, this.tick);
    }

    // 5. Flying Weapon Pods
    for (const pod of this.flyingPods) {
      if (!pod.isOpened) {
        PixelRenderer.drawFlyingPod(ctx, pod, this.cameraX, this.tick);
      }
    }

    // 6. Dropped Weapon Badges
    for (const drop of this.dropCapsules) {
      PixelRenderer.drawDropCapsule(ctx, drop, this.cameraX, this.tick);
    }

    // 7. Enemies
    for (const enemy of this.enemies) {
      if (enemy.active) {
        PixelRenderer.drawEnemy(ctx, enemy, this.cameraX, this.tick);
      }
    }

    // 8. Player Commando
    PixelRenderer.drawPlayer(ctx, this.player, this.cameraX, this.tick);

    // 9. Bullets
    for (const bullet of this.bullets) {
      PixelRenderer.drawBullet(ctx, bullet, this.cameraX);
    }

    // 10. Particles
    PixelRenderer.drawParticles(ctx, this.particles, this.cameraX);
  }
}
