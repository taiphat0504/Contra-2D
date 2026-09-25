/**
 * Contra 2D: Chiến Binh Tri Thức - Standalone Pure HTML5 Canvas Game Engine
 * Ready for GitHub Pages & Static Hosting
 */

// --- 1. WEB AUDIO API 8-BIT SYNTHESIZER ---
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmInterval = null;
    this.isBgmPlaying = false;
    this.bgmStep = 0;
  }

  initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
    return this.isMuted;
  }

  playNoise(duration, startFreq, endFreq, gainVal) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), this.ctx.currentTime + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
      whiteNoise.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playTone(freq, type, duration, gainVal, targetFreq) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (targetFreq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, targetFreq), this.ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playJump() { this.playTone(180, 'square', 0.14, 0.12, 450); }
  playShootRifle() { this.playTone(600, 'square', 0.08, 0.12, 140); }
  playShootMachine() { this.playTone(750, 'sawtooth', 0.06, 0.15, 180); }
  playShootSpread() { this.playTone(520, 'square', 0.12, 0.2, 100); this.playNoise(0.08, 800, 200, 0.12); }
  playShootLaser() { this.playTone(1200, 'sine', 0.2, 0.18, 250); }
  playShootFlame() { this.playNoise(0.18, 900, 150, 0.2); this.playTone(280, 'triangle', 0.15, 0.15, 90); }
  playShootHoming() { this.playTone(350, 'sawtooth', 0.1, 0.15, 700); }
  playEnemyExplode() { this.playNoise(0.25, 450, 60, 0.28); this.playTone(120, 'square', 0.2, 0.15, 40); }
  playBossExplode() { this.playNoise(0.65, 300, 40, 0.4); this.playTone(80, 'sawtooth', 0.5, 0.3, 30); }
  playPlayerHit() { this.playTone(300, 'sawtooth', 0.3, 0.3, 80); this.playNoise(0.2, 300, 100, 0.2); }

  playPowerUp() {
    if (this.isMuted) return;
    this.initCtx();
    [330, 440, 550, 660, 880].forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'square', 0.1, 0.15), idx * 45);
    });
  }

  playCorrectAnswer() {
    if (this.isMuted) return;
    this.initCtx();
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.25, 0.25);
        this.playTone(freq * 0.5, 'square', 0.25, 0.1);
      }, idx * 90);
    });
  }

  playWrongAnswer() {
    if (this.isMuted) return;
    this.initCtx();
    this.playTone(220, 'sawtooth', 0.25, 0.25, 110);
    this.playTone(207.65, 'sawtooth', 0.25, 0.25, 103.8);
  }

  playBarrierHum() { this.playTone(120, 'sine', 0.3, 0.1, 150); }
  playBarrierClear() { this.playNoise(0.4, 1200, 100, 0.3); this.playTone(880, 'sine', 0.35, 0.2, 220); }

  startBGM() {
    if (this.isMuted || this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.bgmStep = 0;
    const bassline = [110, 110, 130.81, 110, 146.83, 110, 130.81, 110, 98, 98, 110, 98, 130.81, 98, 110, 123.47];
    const melody = [440, 0, 523.25, 0, 587.33, 0, 523.25, 659.25, 0, 587.33, 0, 440, 523.25, 0, 392, 0];

    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted || !this.isBgmPlaying) return;
      this.initCtx();
      const bFreq = bassline[this.bgmStep % bassline.length];
      if (bFreq > 0) this.playTone(bFreq, 'sawtooth', 0.12, 0.05);
      const mFreq = melody[this.bgmStep % melody.length];
      if (mFreq > 0) this.playTone(mFreq, 'square', 0.1, 0.04);
      this.bgmStep++;
    }, 140);
  }

  stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

const soundEngine = new SoundEngine();

// --- 2. QUESTION BANK & SUBJECTS ---
const SUBJECTS = [
  { id: 'all', name: 'Tổng Hợp Đa Môn', shortName: 'TỔNG HỢP', icon: '🌐', color: '#3b82f6', desc: 'Toán, Lý, Sử, Địa, Tiếng Anh và Tin học tổng hợp' },
  { id: 'math', name: 'Toán Học', shortName: 'TOÁN', icon: '📐', color: '#10b981', desc: 'Số học, đại số, hình học và logic phản xạ' },
  { id: 'science', name: 'Khoa Học & Vật Lý', shortName: 'KHOA HỌC', icon: '⚡', color: '#f59e0b', desc: 'Vật lý, hoá học, vũ trụ và hiện tượng tự nhiên' },
  { id: 'history', name: 'Lịch Sử', shortName: 'LỊCH SỬ', icon: '⚔️', color: '#ef4444', desc: 'Những chiến công hiển hách và các mốc son lịch sử' },
  { id: 'geography', name: 'Địa Lý', shortName: 'ĐỊA LÝ', icon: '🌍', color: '#8b5cf6', desc: 'Thế giới, châu lục, sông ngòi và danh lam thắng cảnh' },
  { id: 'english', name: 'Tiếng Anh', shortName: 'TIẾNG ANH', icon: '🅰️', color: '#ec4899', desc: 'Từ vựng, ngữ pháp chuẩn và câu đố tiếng Anh' },
  { id: 'tech', name: 'Tin Học & Công Nghệ', shortName: 'TIN HỌC', icon: '💻', color: '#06b6d4', desc: 'Máy tính, lập trình, mạng internet và công nghệ số' }
];

const QUESTIONS = [
  // Toán
  { id: 'm1', subject: 'math', subjectName: 'Toán Học', question: 'Kết quả của phép tính: 25 x 4 + 15 x 6 = ?', options: ['170', '180', '190', '200'], correctIndex: 2, hint: '25 x 4 = 100, 15 x 6 = 90. Cộng hai kết quả lại!' },
  { id: 'm2', subject: 'math', subjectName: 'Toán Học', question: 'Số nguyên tố chẵn duy nhất trong tập hợp số tự nhiên là số nào?', options: ['0', '2', '4', '6'], correctIndex: 1, hint: 'Là số nguyên tố dương nhỏ nhất lớn hơn 1.' },
  { id: 'm3', subject: 'math', subjectName: 'Toán Học', question: 'Tổng ba góc trong một tam giác bằng bao nhiêu độ?', options: ['90°', '180°', '270°', '360°'], correctIndex: 1, hint: 'Bằng một nửa góc đầy 360 độ.' },
  { id: 'm4', subject: 'math', subjectName: 'Toán Học', question: 'Căn bậc hai của 144 là bao nhiêu?', options: ['11', '12', '14', '16'], correctIndex: 1, hint: 'Một tá gồm 12 chiếc.' },
  // Khoa học
  { id: 's1', subject: 'science', subjectName: 'Khoa Học', question: 'Vận tốc ánh sáng trong chân không xấp xỉ bằng bao nhiêu km/s?', options: ['3.000 km/s', '30.000 km/s', '300.000 km/s', '3.000.000 km/s'], correctIndex: 2, hint: 'Khoảng 300 nghìn kilômét mỗi giây.' },
  { id: 's2', subject: 'science', subjectName: 'Khoa Học', question: 'Công thức hoá học của nước là gì?', options: ['CO2', 'NaCl', 'H2O', 'O2'], correctIndex: 2, hint: 'Gồm 2 nguyên tử Hydro và 1 Oxy.' },
  { id: 's3', subject: 'science', subjectName: 'Khoa Học', question: 'Khí nào chiếm tỉ lệ lớn nhất trong khí quyển Trái Đất (~78%)?', options: ['Oxy (O2)', 'Nitơ (N2)', 'Cacbonic (CO2)', 'Argon (Ar)'], correctIndex: 1, hint: 'Ký hiệu là N2.' },
  // Lịch sử
  { id: 'h1', subject: 'history', subjectName: 'Lịch Sử', question: 'Chiến thắng Điện Biên Phủ "lừng lẫy năm châu" diễn ra vào năm nào?', options: ['1945', '1954', '1968', '1975'], correctIndex: 1, hint: 'Năm 1954 kết thúc kháng chiến chống thực dân Pháp.' },
  { id: 'h2', subject: 'history', subjectName: 'Lịch Sử', question: 'Ai là người 3 lần lãnh đạo đánh tan quân xâm lược Nguyên Mông?', options: ['Trần Quốc Tuấn (Hưng Đạo Đại Vương)', 'Lý Thường Kiệt', 'Lê Lợi', 'Nguyễn Huệ'], correctIndex: 0, hint: 'Tác giả của bài Hịch Tướng Sĩ vang dội non sông.' },
  { id: 'h3', subject: 'history', subjectName: 'Lịch Sử', question: 'Bác Hồ đọc bản Tuyên ngôn Độc lập tại Quảng trường Ba Đình vào ngày tháng năm nào?', options: ['19/08/1945', '02/09/1945', '30/04/1975', '22/12/1944'], correctIndex: 1, hint: 'Ngày Quốc khánh 2 tháng 9.' },
  // Địa lý
  { id: 'g1', subject: 'geography', subjectName: 'Địa Lý', question: 'Đỉnh núi nào được mệnh danh là "Nóc nhà Đông Dương"?', options: ['Fansipan', 'Langbiang', 'Bạch Mộc Lương Tử', 'Pu Si Lung'], correctIndex: 0, hint: 'Cao 3.143 mét thuộc dãy Hoàng Liên Sơn Sa Pa.' },
  { id: 'g2', subject: 'geography', subjectName: 'Địa Lý', question: 'Thủ đô của nước Nhật Bản là thành phố nào?', options: ['Osaka', 'Kyoto', 'Tokyo', 'Hiroshima'], correctIndex: 2, hint: 'Bắt đầu bằng chữ T, tên cũ là Edo.' },
  { id: 'g3', subject: 'geography', subjectName: 'Địa Lý', question: 'Đại dương nào có diện tích lớn nhất trên Trái Đất?', options: ['Đại Tây Dương', 'Ấn Độ Dương', 'Thái Bình Dương', 'Bắc Băng Dương'], correctIndex: 2, hint: 'Mang ý nghĩa bình yên, thanh bình.' },
  // Tiếng Anh
  { id: 'e1', subject: 'english', subjectName: 'Tiếng Anh', question: 'Từ nào trong tiếng Anh mang nghĩa là "Người lính / Chiến binh"?', options: ['Doctor', 'Warrior', 'Teacher', 'Farmer'], correctIndex: 1, hint: 'Bắt đầu bằng chữ W, đồng nghĩa với fighter/soldier.' },
  { id: 'e2', subject: 'english', subjectName: 'Tiếng Anh', question: 'Trái nghĩa với từ "VICTORY" (Chiến thắng) là gì?', options: ['Success', 'Defeat', 'Triumph', 'Glory'], correctIndex: 1, hint: 'Từ bắt đầu bằng chữ D mang nghĩa thất bại/bị đánh bại.' },
  { id: 'e3', subject: 'english', subjectName: 'Tiếng Anh', question: 'Thành ngữ "A piece of cake" trong tiếng Anh có nghĩa là gì?', options: ['Miếng bánh ngọt', 'Việc gì đó rất dễ dàng', 'Nhiệm vụ khó khăn', 'Bữa tiệc sinh nhật'], correctIndex: 1, hint: 'Nghĩa bóng là dễ như ăn kẹo/bánh.' },
  // Tin học
  { id: 't1', subject: 'tech', subjectName: 'Tin Học', question: 'Thiết bị nào được coi là "Bộ não" xử lý trung tâm của máy vi tính?', options: ['RAM', 'Ổ cứng SSD', 'CPU', 'Bộ nguồn PSU'], correctIndex: 2, hint: 'Viết tắt của Central Processing Unit.' },
  { id: 't2', subject: 'tech', subjectName: 'Tin Học', question: '1 Gigabyte (GB) bằng bao nhiêu Megabyte (MB) theo chuẩn nhị phân?', options: ['100 MB', '1000 MB', '1024 MB', '2048 MB'], correctIndex: 2, hint: '2 mũ 10 = 1024.' },
  { id: 't3', subject: 'tech', subjectName: 'Tin Học', question: 'Hệ đếm nhị phân (Binary) chỉ sử dụng hai chữ số nào?', options: ['1 và 2', '0 và 1', '0 và 9', 'A và B'], correctIndex: 1, hint: 'Chỉ gồm số 0 và số 1.' }
];

function getQuestions(subjectId) {
  if (subjectId === 'all') return [...QUESTIONS].sort(() => Math.random() - 0.5);
  const filtered = QUESTIONS.filter(q => q.subject === subjectId);
  return filtered.length > 0 ? [...filtered].sort(() => Math.random() - 0.5) : [...QUESTIONS];
}

// --- 3. HIGH SCORE LEADERBOARD ---
const LEADERBOARD_KEY = 'contra_knowledge_leaderboard_v1';
const DEFAULT_LEADERBOARD = [
  { id: '1', playerName: 'Bill Rizer (Đặc Nhiệm)', correctAnswers: 15, score: 84500, subjectName: 'Tổng Hợp', date: '2026-09-20', weaponUsed: 'SPREAD (S)' },
  { id: '2', playerName: 'Lance Bean', correctAnswers: 12, score: 69200, subjectName: 'Toán Học', date: '2026-09-21', weaponUsed: 'LASER (L)' },
  { id: '3', playerName: 'Học Bá Contra', correctAnswers: 10, score: 55400, subjectName: 'Khoa Học', date: '2026-09-22', weaponUsed: 'MACHINE (M)' },
  { id: '4', playerName: 'Chiến Binh Sao Vàng', correctAnswers: 8, score: 42100, subjectName: 'Lịch Sử', date: '2026-09-23', weaponUsed: 'HOMING (H)' },
  { id: '5', playerName: 'Cyber Commando', correctAnswers: 6, score: 31000, subjectName: 'Tin Học', date: '2026-09-24', weaponUsed: 'FLAME (F)' }
];

function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(DEFAULT_LEADERBOARD));
      return DEFAULT_LEADERBOARD;
    }
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : DEFAULT_LEADERBOARD;
  } catch (e) {
    return DEFAULT_LEADERBOARD;
  }
}

function saveLeaderboard(entry) {
  const current = loadLeaderboard();
  const updated = [...current, { ...entry, id: 'entry_' + Date.now(), date: new Date().toISOString().split('T')[0] }]
    .sort((a, b) => b.correctAnswers !== a.correctAnswers ? b.correctAnswers - a.correctAnswers : b.score - a.score)
    .slice(0, 50);
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
  } catch (e) {}
  return updated;
}

// --- 4. GAME CONSTANTS & WEAPONS ---
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;
const GRAVITY = 0.55;
const PLAYER_SPEED = 3.6;
const JUMP_FORCE = -10.8;
const FRICTION = 0.82;

const WEAPONS = {
  RIFLE: { type: 'RIFLE', name: 'Rifle Tiêu Chuẩn', letter: 'R', color: '#fbbf24', fireRate: 200, damage: 15, speed: 10, radius: 3, level: 1 },
  MACHINE: { type: 'MACHINE', name: 'Machine Gun', letter: 'M', color: '#f97316', fireRate: 90, damage: 18, speed: 12, radius: 3.5, level: 1 },
  SPREAD: { type: 'SPREAD', name: 'Spread Gun', letter: 'S', color: '#ef4444', fireRate: 250, damage: 22, speed: 9.5, radius: 5, level: 1 },
  LASER: { type: 'LASER', name: 'Laser Beam', letter: 'L', color: '#06b6d4', fireRate: 240, damage: 42, speed: 15, radius: 4, level: 1 },
  FLAME: { type: 'FLAME', name: 'Flame Fireball', letter: 'F', color: '#e11d48', fireRate: 280, damage: 38, speed: 7.5, radius: 7, level: 1 },
  HOMING: { type: 'HOMING', name: 'Homing Missile', letter: 'H', color: '#a855f7', fireRate: 300, damage: 30, speed: 8.5, radius: 4.5, level: 1 }
};

// --- 5. MAIN GAME CONTROLLER CLASS ---
class GameApp {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.gameState = 'START'; // START, PLAYING, QUIZ, PAUSED, GAMEOVER, VICTORY
    this.selectedSubject = localStorage.getItem('contra_selected_sub') || 'all';

    this.keys = { left: false, right: false, up: false, down: false, jump: false, shoot: false };
    this.lastShotTime = 0;
    this.cameraX = 0;
    this.tick = 0;

    this.player = this.createInitialPlayer();
    this.bullets = [];
    this.enemies = [];
    this.barriers = [];
    this.dropCapsules = [];
    this.flyingPods = [];
    this.particles = [];
    this.platforms = [];

    this.nextBulletId = 1;
    this.nextEnemyId = 1;
    this.nextDropId = 1;
    this.spawnEnemyTimer = 0;
    this.spawnPodTimer = 0;
    this.activeBarrier = null;

    this.initDOM();
    this.bindEvents();
    this.initLevel();

    // Start render loop
    requestAnimationFrame(() => this.loop());
  }

  createInitialPlayer() {
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
      lives: 6, // 6 mạng
      weapon: { ...WEAPONS.RIFLE },
      score: 0,
      correctAnswersCount: 0,
      streak: 0,
      inWater: false
    };
  }

  initLevel() {
    const qList = getQuestions(this.selectedSubject);

    // Platforms across 5500px level
    this.platforms = [
      { x: 0, y: 390, width: 900, height: 60, type: 'ground' },
      { x: 900, y: 400, width: 200, height: 50, type: 'water' },
      { x: 1100, y: 390, width: 1100, height: 60, type: 'ground' },
      { x: 2200, y: 400, width: 220, height: 50, type: 'water' },
      { x: 2420, y: 390, width: 1200, height: 60, type: 'ground' },
      { x: 3620, y: 400, width: 240, height: 50, type: 'water' },
      { x: 3860, y: 390, width: 1600, height: 60, type: 'ground' },
      // Ledges & Bridges
      { x: 250, y: 320, width: 140, height: 16, type: 'bridge' },
      { x: 450, y: 260, width: 180, height: 16, type: 'bridge' },
      { x: 720, y: 310, width: 150, height: 16, type: 'floating' },
      { x: 1300, y: 310, width: 160, height: 16, type: 'floating' },
      { x: 1550, y: 240, width: 180, height: 16, type: 'bridge' },
      { x: 1800, y: 310, width: 160, height: 16, type: 'floating' },
      { x: 2600, y: 310, width: 160, height: 16, type: 'bridge' },
      { x: 2850, y: 250, width: 200, height: 16, type: 'bridge' },
      { x: 3150, y: 300, width: 180, height: 16, type: 'floating' },
      { x: 3400, y: 240, width: 160, height: 16, type: 'floating' },
      { x: 4100, y: 320, width: 180, height: 16, type: 'bridge' },
      { x: 4400, y: 260, width: 220, height: 16, type: 'floating' },
      { x: 4700, y: 310, width: 180, height: 16, type: 'bridge' }
    ];

    // Barriers
    this.barriers = [
      { id: 1, x: 1050, y: 120, width: 32, height: 270, title: 'CỔNG PHÒNG TUYẾN ALPHA (CÂU HỎI 1)', desc: 'Lưới laser phong toả đường đi. Giải mã câu đố để vượt qua!', isCleared: false, question: qList[0] || QUESTIONS[0], color: '#3b82f6' },
      { id: 2, x: 2350, y: 120, width: 32, height: 270, title: 'LƯỚI LỬA NĂNG LƯỢNG BRAVO (CÂU HỎI 2)', desc: 'Cổng bảo vệ an ninh cấp 2. Nhập đáp án chính xác để vượt chướng ngại!', isCleared: false, question: qList[1] || QUESTIONS[1], color: '#10b981' },
      { id: 3, x: 3750, y: 120, width: 32, height: 270, title: 'CỔNG TỪ TRƯỜNG DELTA (CÂU HỎI 3)', desc: 'Vành đai tiền trạm pháo đài Red Falcon. Giải mã để tiếp cận Boss!', isCleared: false, question: qList[2] || QUESTIONS[2], color: '#f59e0b' },
      { id: 4, x: 4950, y: 100, width: 36, height: 290, title: 'LÁ CHẮN TỐI HẬU PHÁO ĐÀI (CÂU HỎI QUYẾT ĐỊNH)', desc: 'Lá chắn nguyên tử bảo vệ Trùm Cuối. Giải mã câu hỏi này để mở khoá sát thương Boss!', isCleared: false, question: qList[3] || QUESTIONS[3], color: '#ef4444' }
    ];

    // Preplaced enemies
    this.enemies = [
      { id: this.nextEnemyId++, type: 'runner', x: 500, y: 350, vx: -1.8, vy: 0, width: 24, height: 38, health: 25, scoreValue: 150, facing: 'left', shootCooldown: 120, shootInterval: 140, active: true },
      { id: this.nextEnemyId++, type: 'runner', x: 750, y: 350, vx: -1.8, vy: 0, width: 24, height: 38, health: 25, scoreValue: 150, facing: 'left', shootCooldown: 80, shootInterval: 150, active: true },
      { id: this.nextEnemyId++, type: 'sniper', x: 480, y: 226, vx: 0, vy: 0, width: 22, height: 34, health: 35, scoreValue: 250, facing: 'left', shootCooldown: 60, shootInterval: 130, active: true },
      { id: this.nextEnemyId++, type: 'turret', x: 820, y: 280, vx: 0, vy: 0, width: 28, height: 28, health: 50, scoreValue: 300, facing: 'left', shootCooldown: 90, shootInterval: 120, active: true },
      { id: this.nextEnemyId++, type: 'runner', x: 1400, y: 350, vx: -2, vy: 0, width: 24, height: 38, health: 30, scoreValue: 150, facing: 'left', shootCooldown: 90, shootInterval: 140, active: true },
      { id: this.nextEnemyId++, type: 'sniper', x: 1600, y: 206, vx: 0, vy: 0, width: 22, height: 34, health: 40, scoreValue: 250, facing: 'left', shootCooldown: 70, shootInterval: 120, active: true },
      { id: this.nextEnemyId++, type: 'turret', x: 1850, y: 280, vx: 0, vy: 0, width: 28, height: 28, health: 60, scoreValue: 300, facing: 'left', shootCooldown: 100, shootInterval: 110, active: true },
      { id: this.nextEnemyId++, type: 'drone', x: 1700, y: 150, vx: -2.2, vy: 0, width: 26, height: 26, health: 35, scoreValue: 200, facing: 'left', shootCooldown: 80, shootInterval: 120, active: true },
      { id: this.nextEnemyId++, type: 'runner', x: 2700, y: 350, vx: -2.2, vy: 0, width: 24, height: 38, health: 35, scoreValue: 180, facing: 'left', shootCooldown: 90, shootInterval: 130, active: true },
      { id: this.nextEnemyId++, type: 'sniper', x: 2900, y: 216, vx: 0, vy: 0, width: 22, height: 34, health: 50, scoreValue: 300, facing: 'left', shootCooldown: 60, shootInterval: 100, active: true },
      { id: this.nextEnemyId++, type: 'turret', x: 3200, y: 270, vx: 0, vy: 0, width: 28, height: 28, health: 70, scoreValue: 350, facing: 'left', shootCooldown: 80, shootInterval: 100, active: true },
      { id: this.nextEnemyId++, type: 'drone', x: 3050, y: 140, vx: -2.5, vy: 0, width: 26, height: 26, health: 40, scoreValue: 250, facing: 'left', shootCooldown: 70, shootInterval: 110, active: true },
      // BOSS
      { id: this.nextEnemyId++, type: 'boss_head', x: 5200, y: 200, vx: 0, vy: 0, width: 80, height: 100, health: 500, maxHealth: 500, scoreValue: 10000, facing: 'left', shootCooldown: 60, shootInterval: 70, active: true }
    ];

    // Initial starter weapon drop
    this.dropCapsules.push({ id: this.nextDropId++, x: 350, y: 290, vx: 0, vy: 0, weaponType: 'SPREAD', lifeTime: 3000 });
  }

  restart() {
    this.player = this.createInitialPlayer();
    this.cameraX = 0;
    this.tick = 0;
    this.bullets = [];
    this.particles = [];
    this.dropCapsules = [];
    this.flyingPods = [];
    this.initLevel();
    this.gameState = 'PLAYING';
    soundEngine.startBGM();
    this.updateHUD();
    this.hideAllOverlays();
  }

  setSubject(subId) {
    this.selectedSubject = subId;
    localStorage.setItem('contra_selected_sub', subId);
    const questions = getQuestions(subId);
    this.barriers.forEach((b, idx) => {
      if (!b.isCleared) b.question = questions[idx % questions.length];
    });
    this.updateSubjectUI();
  }

  // --- 6. EVENT BINDINGS & KEY CONTROLS ---
  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      const code = e.code;
      if (code === 'Space' || code === 'ArrowUp' || code === 'ArrowDown') e.preventDefault();

      if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = true;
      if (code === 'KeyW' || code === 'ArrowUp') this.keys.up = true;
      if (code === 'KeyS' || code === 'ArrowDown') this.keys.down = true;
      if (code === 'Space' || code === 'KeyK' || code === 'KeyX') this.keys.jump = true; // Phím nhảy là Space
      if (code === 'KeyJ' || code === 'KeyZ') this.keys.shoot = true; // Phím bắn là J / Z
      if (code === 'Escape') this.togglePause();
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      if (code === 'KeyA' || code === 'ArrowLeft') this.keys.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') this.keys.right = false;
      if (code === 'KeyW' || code === 'ArrowUp') this.keys.up = false;
      if (code === 'KeyS' || code === 'ArrowDown') this.keys.down = false;
      if (code === 'Space' || code === 'KeyK' || code === 'KeyX') this.keys.jump = false;
      if (code === 'KeyJ' || code === 'KeyZ') this.keys.shoot = false;
    });

    // Canvas click to shoot
    this.canvas.addEventListener('mousedown', () => { if (this.gameState === 'PLAYING') this.keys.shoot = true; });
    this.canvas.addEventListener('mouseup', () => { this.keys.shoot = false; });
  }

  initDOM() {
    // Buttons
    document.getElementById('btnStartGame').onclick = () => this.restart();
    document.getElementById('btnReturnHome').onclick = () => this.returnHome();
    document.getElementById('btnPauseHome').onclick = () => this.returnHome();
    document.getElementById('btnGameOverHome').onclick = () => this.returnHome();

    document.getElementById('btnTogglePause').onclick = () => this.togglePause();
    document.getElementById('btnResumeGame').onclick = () => this.togglePause();
    document.getElementById('btnRestartGame').onclick = () => this.restart();
    document.getElementById('btnGameOverRestart').onclick = () => this.restart();

    document.getElementById('btnToggleSound').onclick = () => {
      const muted = soundEngine.toggleMute();
      document.getElementById('soundIcon').innerText = muted ? '🔇' : '🔊';
    };

    document.getElementById('btnToggleControls').onclick = () => {
      const tc = document.getElementById('touchControls');
      tc.classList.toggle('hidden');
    };

    // Modals open
    document.getElementById('btnSubjectModal').onclick = () => this.openSubjectModal();
    document.getElementById('btnStartSubject').onclick = () => this.openSubjectModal();
    document.getElementById('btnPauseSubject').onclick = () => this.openSubjectModal();
    document.getElementById('btnGameOverSubject').onclick = () => this.openSubjectModal();

    document.getElementById('btnLeaderboardModal').onclick = () => this.openLeaderboardModal();
    document.getElementById('btnStartLeaderboard').onclick = () => this.openLeaderboardModal();
    document.getElementById('btnPauseLeaderboard').onclick = () => this.openLeaderboardModal();
    document.getElementById('btnGameOverLeaderboard').onclick = () => this.openLeaderboardModal();

    document.getElementById('btnHelpModal').onclick = () => this.openHelpModal();
    document.getElementById('btnStartHelp').onclick = () => this.openHelpModal();

    // Modal closes
    document.getElementById('btnCloseSubject').onclick = () => this.closeModal('subjectModal');
    document.getElementById('btnCloseLeaderboard').onclick = () => this.closeModal('leaderboardModal');
    document.getElementById('btnCloseHelp').onclick = () => this.closeModal('helpModal');
    document.getElementById('btnHelpGotIt').onclick = () => this.closeModal('helpModal');

    // Virtual D-pad
    this.bindTouch('dpadUp', 'up');
    this.bindTouch('dpadDown', 'down');
    this.bindTouch('dpadLeft', 'left');
    this.bindTouch('dpadRight', 'right');
    this.bindTouchAction('btnVirtualJump', 'jump');
    this.bindTouchAction('btnVirtualShoot', 'shoot');

    // Leaderboard form
    document.getElementById('leaderboardForm').onsubmit = (e) => {
      e.preventDefault();
      const input = document.getElementById('playerNameInput');
      const val = input.value.trim();
      if (!val) return;
      saveLeaderboard({
        playerName: val,
        correctAnswers: this.player.correctAnswersCount,
        score: this.player.score,
        subjectName: this.getCurrentSubject().name,
        weaponUsed: `${this.player.weapon.type} (Lv${this.player.weapon.level})`
      });
      document.getElementById('leaderboardForm').classList.add('hidden');
      document.getElementById('savedBanner').classList.remove('hidden');
      setTimeout(() => this.openLeaderboardModal(), 600);
    };

    this.updateSubjectUI();
    this.renderSubjectList();
  }

  bindTouch(elemId, key) {
    const el = document.getElementById(elemId);
    if (!el) return;
    const start = (e) => { e.preventDefault(); this.keys[key] = true; };
    const end = (e) => { e.preventDefault(); this.keys[key] = false; };
    el.onmousedown = start; el.onmouseup = end;
    el.ontouchstart = start; el.ontouchend = end;
  }

  bindTouchAction(elemId, key) {
    const el = document.getElementById(elemId);
    if (!el) return;
    const start = (e) => { e.preventDefault(); this.keys[key] = true; };
    const end = (e) => { e.preventDefault(); this.keys[key] = false; };
    el.onmousedown = start; el.onmouseup = end;
    el.ontouchstart = start; el.ontouchend = end;
  }

  returnHome() {
    this.gameState = 'START';
    soundEngine.stopBGM();
    this.activeBarrier = null;
    this.hideAllOverlays();
    document.getElementById('startOverlay').classList.remove('hidden');
    document.getElementById('arcadeHUD').classList.add('hidden');
    document.getElementById('touchControls').classList.add('hidden');
  }

  togglePause() {
    if (this.gameState === 'PLAYING') {
      this.gameState = 'PAUSED';
      document.getElementById('pauseOverlay').classList.remove('hidden');
    } else if (this.gameState === 'PAUSED') {
      this.gameState = 'PLAYING';
      document.getElementById('pauseOverlay').classList.add('hidden');
    }
  }

  getCurrentSubject() {
    return SUBJECTS.find(s => s.id === this.selectedSubject) || SUBJECTS[0];
  }

  updateSubjectUI() {
    const s = this.getCurrentSubject();
    document.getElementById('hudSubjectIcon').innerText = s.icon;
    document.getElementById('hudSubjectName').innerText = s.shortName;
    document.getElementById('startSubjectIcon').innerText = s.icon;
    document.getElementById('startSubjectName').innerText = s.name;
  }

  renderSubjectList() {
    const container = document.getElementById('subjectListContainer');
    container.innerHTML = '';
    SUBJECTS.forEach(sub => {
      const isSel = sub.id === this.selectedSubject;
      const btn = document.createElement('div');
      btn.className = `quiz-option-btn ${isSel ? 'border-cyan' : ''}`;
      btn.innerHTML = `
        <span style="font-size:22px;">${sub.icon}</span>
        <div style="flex-grow:1;">
          <div style="font-family:var(--font-arcade); font-size:10px; color:${sub.color}; font-weight:bold;">${sub.name}</div>
          <div style="font-size:11px; color:#94a3b8; margin-top:2px;">${sub.desc}</div>
        </div>
        ${isSel ? '<span style="color:#22c55e; font-weight:bold;">✓</span>' : ''}
      `;
      btn.onclick = () => {
        this.setSubject(sub.id);
        this.closeModal('subjectModal');
      };
      container.appendChild(btn);
    });
  }

  openSubjectModal() {
    this.renderSubjectList();
    document.getElementById('subjectModal').classList.remove('hidden');
  }

  openLeaderboardModal() {
    const list = loadLeaderboard();
    const container = document.getElementById('leaderboardList');
    container.innerHTML = '';
    list.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'quiz-option-btn';
      row.style.justifyContent = 'space-between';
      row.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-family:var(--font-arcade); font-size:11px; color:${idx === 0 ? '#facc15' : idx === 1 ? '#94a3b8' : idx === 2 ? '#d97706' : '#64748b'}">#${idx + 1}</span>
          <div>
            <div style="font-family:var(--font-arcade); font-size:10px; color:#fff;">${item.playerName}</div>
            <div style="font-size:11px; color:#64748b;">${item.subjectName} • ${item.date}</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-family:var(--font-arcade); font-size:10px; color:#10b981;">🎯 ${item.correctAnswers} ĐÚNG</div>
          <div style="font-family:var(--font-arcade); font-size:10px; color:#facc15;">${item.score.toLocaleString()} Đ</div>
        </div>
      `;
      container.appendChild(row);
    });
    document.getElementById('leaderboardModal').classList.remove('hidden');
  }

  openHelpModal() { document.getElementById('helpModal').classList.remove('hidden'); }

  closeModal(modalId) { document.getElementById(modalId).classList.add('hidden'); }

  hideAllOverlays() {
    ['startOverlay', 'pauseOverlay', 'quizModal', 'gameOverModal', 'subjectModal', 'leaderboardModal', 'helpModal']
      .forEach(id => document.getElementById(id).classList.add('hidden'));
  }

  triggerQuiz(barrier) {
    this.activeBarrier = barrier;
    this.gameState = 'QUIZ';
    soundEngine.playBarrierHum();

    const q = barrier.question;
    document.getElementById('quizGateTitle').innerText = barrier.title;
    document.getElementById('quizSubjectName').innerText = q.subjectName;
    document.getElementById('quizDesc').innerText = barrier.desc;
    document.getElementById('quizQuestionText').innerText = q.question;

    const optContainer = document.getElementById('quizOptionsContainer');
    optContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    const hintBox = document.getElementById('quizHintBox');
    hintBox.classList.add('hidden');

    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.innerHTML = `<span class="option-letter">${letters[idx]}</span><span>${opt}</span>`;
      btn.onclick = () => {
        if (idx === q.correctIndex) {
          // CORRECT!
          btn.style.borderColor = '#10b981';
          btn.style.background = '#064e3b';
          soundEngine.playCorrectAnswer();
          soundEngine.playBarrierClear();
          this.player.correctAnswersCount++;
          this.player.score += 1500;
          barrier.isCleared = true;

          // Spawn explosion & reward
          this.createExplosion(barrier.x + barrier.width / 2, barrier.y + barrier.height / 2, 35);
          this.dropCapsules.push({ id: this.nextDropId++, x: barrier.x + 40, y: barrier.y + barrier.height / 2, vx: 1, vy: -2, weaponType: 'SPREAD', lifeTime: 2500 });

          setTimeout(() => {
            this.closeModal('quizModal');
            this.activeBarrier = null;
            this.gameState = 'PLAYING';
            this.updateHUD();
          }, 1100);
        } else {
          // WRONG! Retry until right
          btn.style.borderColor = '#ef4444';
          btn.style.background = '#450a0a';
          btn.style.opacity = '0.5';
          btn.disabled = true;
          soundEngine.playWrongAnswer();
          hintBox.innerText = `GỢI Ý: ${q.hint}`;
          hintBox.classList.remove('hidden');
        }
      };
      optContainer.appendChild(btn);
    });

    document.getElementById('quizModal').classList.remove('hidden');
  }

  showGameOver(isVictory) {
    this.gameState = isVictory ? 'VICTORY' : 'GAMEOVER';
    soundEngine.stopBGM();

    document.getElementById('gameOverTitle').innerText = isVictory ? '🏆 CHIẾN DỊCH TOÀN THẮNG!' : '💀 NHIỆM VỤ THẤT BẠI';
    document.getElementById('gameOverTitle').className = isVictory ? 'crt-gold-glow' : 'crt-red-glow';
    document.getElementById('statCorrectCount').innerText = `${this.player.correctAnswersCount} 🎯`;
    document.getElementById('statTotalScore').innerText = this.player.score.toLocaleString();
    document.getElementById('statSubject').innerText = this.getCurrentSubject().name;
    document.getElementById('statWeapon').innerText = `${this.player.weapon.type} (Lv${this.player.weapon.level})`;

    document.getElementById('leaderboardForm').classList.remove('hidden');
    document.getElementById('savedBanner').classList.add('hidden');
    document.getElementById('playerNameInput').value = '';
    document.getElementById('gameOverModal').classList.remove('hidden');
  }

  // --- 7. PHYSICS & LOGIC LOOP ---
  loop() {
    if (this.gameState === 'PLAYING') {
      this.update();
    }
    this.render();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    this.tick++;
    const p = this.player;

    // Aim calculation (8 Directions)
    let dx = 0, dy = 0;
    const isLeft = this.keys.left, isRight = this.keys.right;
    const isUp = this.keys.up, isDown = this.keys.down;

    if (isLeft && !isRight) p.facing = 'left';
    else if (isRight && !isLeft) p.facing = 'right';

    const defDx = p.facing === 'left' ? -1 : 1;

    if (p.isCrouching && p.isGrounded) {
      dx = defDx; dy = 0;
    } else if (isUp && !isDown) {
      if (isLeft || isRight) { dx = defDx * 0.707; dy = -0.707; }
      else { dx = 0; dy = -1; }
    } else if (isDown && !isUp) {
      if (!p.isGrounded) {
        if (isLeft || isRight) { dx = defDx * 0.707; dy = 0.707; }
        else { dx = 0; dy = 1; }
      } else {
        dx = defDx; dy = 0;
      }
    } else {
      dx = defDx; dy = 0;
    }
    p.aimDir = { dx, dy };
    p.aimAngle = Math.atan2(dy, dx);

    // Crouch & horizontal motion
    p.isCrouching = (this.keys.down && p.isGrounded && !this.keys.left && !this.keys.right);

    if (!p.isCrouching) {
      if (this.keys.left) p.vx = -PLAYER_SPEED;
      else if (this.keys.right) p.vx = PLAYER_SPEED;
      else p.vx *= FRICTION;
    } else {
      p.vx = 0;
    }

    // Jump (Space key)
    if (this.keys.jump && p.isGrounded && !p.isCrouching) {
      p.vy = JUMP_FORCE;
      p.isGrounded = false;
      p.isJumping = true;
      p.jumpFlipAngle = 0;
      soundEngine.playJump();
    }

    p.vy += GRAVITY;
    if (p.vy > 12) p.vy = 12;

    if (p.isJumping) p.jumpFlipAngle += (p.facing === 'left' ? -0.35 : 0.35);

    const nextX = p.x + p.vx;
    const nextY = p.y + p.vy;

    // Barrier blocking
    let blocked = false;
    for (const b of this.barriers) {
      if (!b.isCleared) {
        if (nextX + p.width > b.x && nextX < b.x + b.width && nextY + p.height > b.y && nextY < b.y + b.height) {
          blocked = true;
          p.vx = 0;
          this.triggerQuiz(b);
          break;
        }
      }
    }
    if (!blocked) p.x = Math.max(0, nextX);

    // Platforms
    p.isGrounded = false;
    p.inWater = false;
    for (const plat of this.platforms) {
      if (p.x + p.width * 0.7 > plat.x && p.x + p.width * 0.3 < plat.x + plat.width) {
        if (p.y + p.height <= plat.y + 12 && nextY + p.height >= plat.y) {
          p.y = plat.y - p.height;
          p.vy = 0;
          p.isGrounded = true;
          p.isJumping = false;
          if (plat.type === 'water') p.inWater = true;
          break;
        }
      }
    }

    if (!p.isGrounded) p.y = nextY;
    if (p.y > CANVAS_HEIGHT - 60 - p.height) {
      p.y = CANVAS_HEIGHT - 60 - p.height;
      p.vy = 0;
      p.isGrounded = true;
      p.isJumping = false;
    }

    if (p.isInvulnerable) {
      p.invulnerableTimer--;
      if (p.invulnerableTimer <= 0) p.isInvulnerable = false;
    }

    // Shooting
    this.handleShooting();

    // Bullets update
    this.updateBullets();

    // Enemies update
    this.updateEnemies();

    // Drops & flying pods
    this.updatePodsAndDrops();

    // Particles
    this.updateParticles();

    // Camera follow player
    const targetCameraX = Math.max(0, p.x - CANVAS_WIDTH * 0.35);
    this.cameraX += (targetCameraX - this.cameraX) * 0.15;

    // Periodic spawns
    this.spawnEnemyTimer++;
    if (this.spawnEnemyTimer > 180) {
      this.spawnEnemyTimer = 0;
      this.spawnRunner();
    }
    this.spawnPodTimer++;
    if (this.spawnPodTimer > 500) {
      this.spawnPodTimer = 0;
      this.spawnPod();
    }

    if (this.tick % 6 === 0) this.updateHUD();
  }

  handleShooting() {
    if (!this.keys.shoot) return;
    const now = Date.now();
    const w = this.player.weapon;
    const cooldown = Math.max(60, w.fireRate - (w.level - 1) * 25);
    if (now - this.lastShotTime < cooldown) return;
    this.lastShotTime = now;

    const cx = this.player.x + this.player.width / 2;
    const cy = this.player.isCrouching ? this.player.y + this.player.height - 10 : this.player.y + 16;
    const spawnX = cx + this.player.aimDir.dx * 18;
    const spawnY = cy + this.player.aimDir.dy * 18;
    const spd = w.speed;
    const dmg = w.damage * (1 + (w.level - 1) * 0.35);

    if (w.type === 'RIFLE') {
      soundEngine.playShootRifle();
      this.bullets.push({ id: this.nextBulletId++, x: spawnX, y: spawnY, vx: this.player.aimDir.dx * spd, vy: this.player.aimDir.dy * spd, radius: w.radius, damage: dmg, color: w.color, isPlayer: true, life: 70 });
    } else if (w.type === 'MACHINE') {
      soundEngine.playShootMachine();
      const jitter = (Math.random() - 0.5) * 0.08;
      const a = this.player.aimAngle + jitter;
      this.bullets.push({ id: this.nextBulletId++, x: spawnX, y: spawnY, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, radius: w.radius, damage: dmg, color: w.color, isPlayer: true, life: 65 });
    } else if (w.type === 'SPREAD') {
      soundEngine.playShootSpread();
      const count = w.level >= 2 ? 7 : 5;
      const spread = w.level >= 2 ? 0.65 : 0.5;
      const step = spread / (count - 1);
      const startA = this.player.aimAngle - spread / 2;
      for (let i = 0; i < count; i++) {
        const a = startA + i * step;
        this.bullets.push({ id: this.nextBulletId++, x: spawnX, y: spawnY, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, radius: w.radius, damage: dmg * 0.8, color: w.color, isPlayer: true, life: 60 });
      }
    } else if (w.type === 'LASER') {
      soundEngine.playShootLaser();
      this.bullets.push({ id: this.nextBulletId++, x: spawnX, y: spawnY, vx: this.player.aimDir.dx * spd * 1.3, vy: this.player.aimDir.dy * spd * 1.3, radius: w.radius, damage: dmg * 1.4, color: w.color, isPlayer: true, piercing: true, life: 50 });
    } else if (w.type === 'FLAME') {
      soundEngine.playShootFlame();
      this.bullets.push({ id: this.nextBulletId++, x: spawnX, y: spawnY, vx: this.player.aimDir.dx * spd, vy: this.player.aimDir.dy * spd, radius: w.radius + 2, damage: dmg * 1.2, color: w.color, isPlayer: true, life: 55 });
    } else if (w.type === 'HOMING') {
      soundEngine.playShootHoming();
      for (let i = 0; i < 2; i++) {
        const off = (i === 0 ? -0.2 : 0.2);
        this.bullets.push({ id: this.nextBulletId++, x: spawnX, y: spawnY, vx: Math.cos(this.player.aimAngle + off) * spd, vy: Math.sin(this.player.aimAngle + off) * spd, radius: w.radius, damage: dmg, color: w.color, isPlayer: true, life: 80, isHoming: true });
      }
    }
  }

  updateBullets() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      if (b.life <= 0 || b.y < -40 || b.y > CANVAS_HEIGHT + 40 || b.x < this.cameraX - 100 || b.x > this.cameraX + CANVAS_WIDTH + 100) {
        this.bullets.splice(i, 1);
        continue;
      }

      if (b.isPlayer) {
        let hit = false;
        for (const enemy of this.enemies) {
          if (!enemy.active) continue;
          if (b.x > enemy.x && b.x < enemy.x + enemy.width && b.y > enemy.y && b.y < enemy.y + enemy.height) {
            enemy.health -= b.damage;
            if (enemy.health <= 0) {
              enemy.active = false;
              this.player.score += enemy.scoreValue;
              if (enemy.type === 'boss_head') {
                soundEngine.playBossExplode();
                this.createExplosion(enemy.x + 40, enemy.y + 50, 60);
                setTimeout(() => this.showGameOver(true), 1500);
              } else {
                soundEngine.playEnemyExplode();
                this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 16);
              }
            }
            if (!b.piercing) { hit = true; break; }
          }
        }
        if (hit) { this.bullets.splice(i, 1); continue; }
      } else {
        // Enemy bullets hit player
        const p = this.player;
        if (!p.isInvulnerable) {
          const hy = p.isCrouching ? p.y + p.height - 16 : p.y;
          const hh = p.isCrouching ? 16 : p.height;
          if (b.x > p.x && b.x < p.x + p.width && b.y > hy && b.y < hy + hh) {
            this.bullets.splice(i, 1);
            this.damagePlayer();
            continue;
          }
        }
      }
    }
  }

  damagePlayer() {
    const p = this.player;
    soundEngine.playPlayerHit();
    p.lives--;
    p.isInvulnerable = true;
    p.invulnerableTimer = 120;
    this.createExplosion(p.x + p.width / 2, p.y + p.height / 2, 20);
    this.updateHUD();

    if (p.lives <= 0) {
      this.showGameOver(false);
    }
  }

  updateEnemies() {
    const px = this.player.x, py = this.player.y;
    for (const e of this.enemies) {
      if (!e.active) continue;
      if (Math.abs(e.x - px) > CANVAS_WIDTH * 1.5) continue;

      e.facing = e.x > px ? 'left' : 'right';

      if (e.type === 'runner') {
        e.x += e.vx;
        e.y += GRAVITY * 2;
        if (e.y > 352) e.y = 352;
        if (e.x < px - 400 || e.x > px + 600) e.vx *= -1;

        if (!this.player.isInvulnerable && Math.abs(e.x - this.player.x) < 20 && Math.abs(e.y - this.player.y) < 30) {
          this.damagePlayer();
        }
      }

      e.shootCooldown--;
      if (e.shootCooldown <= 0) {
        e.shootCooldown = e.shootInterval + Math.floor(Math.random() * 30);
        if (e.type === 'runner' && Math.random() < 0.4) {
          const dir = e.facing === 'left' ? -1 : 1;
          this.bullets.push({ id: this.nextBulletId++, x: e.x + (dir === -1 ? -4 : e.width + 4), y: e.y + 14, vx: dir * 4.5, vy: 0, radius: 3.5, damage: 20, color: '#ef4444', isPlayer: false, life: 80 });
        } else if (e.type === 'sniper' || e.type === 'turret') {
          const a = Math.atan2(py + 16 - e.y, px + 14 - e.x);
          this.bullets.push({ id: this.nextBulletId++, x: e.x + e.width / 2, y: e.y + e.height / 2, vx: Math.cos(a) * 5, vy: Math.sin(a) * 5, radius: 4, damage: 25, color: '#f87171', isPlayer: false, life: 90 });
        } else if (e.type === 'boss_head') {
          const baseA = Math.atan2(py - e.y, px - e.x);
          for (let a = -0.3; a <= 0.3; a += 0.3) {
            this.bullets.push({ id: this.nextBulletId++, x: e.x + 20, y: e.y + 40, vx: Math.cos(baseA + a) * 5.2, vy: Math.sin(baseA + a) * 5.2, radius: 6, damage: 30, color: '#dc2626', isPlayer: false, life: 100 });
          }
        }
      }
    }
  }

  updatePodsAndDrops() {
    // Drops collection
    const p = this.player;
    for (let i = this.dropCapsules.length - 1; i >= 0; i--) {
      const drop = this.dropCapsules[i];
      drop.lifeTime--;
      drop.vy = (drop.vy || 0) + 0.2;
      drop.y += drop.vy;
      if (drop.y > 360) { drop.y = 360; drop.vy = 0; }

      if (Math.abs(drop.x + 12 - (p.x + p.width / 2)) < 24 && Math.abs(drop.y - (p.y + p.height / 2)) < 30) {
        soundEngine.playPowerUp();
        if (p.weapon.type === drop.weaponType) {
          p.weapon.level = Math.min(3, p.weapon.level + 1);
        } else if (WEAPONS[drop.weaponType]) {
          p.weapon = { ...WEAPONS[drop.weaponType], level: 1 };
        }
        p.score += 500;
        this.dropCapsules.splice(i, 1);
        this.updateHUD();
      } else if (drop.lifeTime <= 0) {
        this.dropCapsules.splice(i, 1);
      }
    }

    // Flying pods
    for (let i = this.flyingPods.length - 1; i >= 0; i--) {
      const pod = this.flyingPods[i];
      pod.x += pod.vx;
      if (pod.x < this.cameraX - 100) this.flyingPods.splice(i, 1);
    }
  }

  spawnRunner() {
    this.enemies.push({ id: this.nextEnemyId++, type: 'runner', x: this.cameraX + CANVAS_WIDTH + 60, y: 350, vx: -2.4, vy: 0, width: 24, height: 38, health: 25, scoreValue: 150, facing: 'left', shootCooldown: 80, shootInterval: 140, active: true });
  }

  spawnPod() {
    const types = ['MACHINE', 'SPREAD', 'LASER', 'FLAME', 'HOMING'];
    const chosen = types[Math.floor(Math.random() * types.length)];
    this.flyingPods.push({ id: this.nextDropId++, x: this.cameraX + CANVAS_WIDTH + 40, y: 100 + Math.random() * 80, vx: -2.8, weaponType: chosen });
  }

  createExplosion(x, y, count = 18) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 1 + Math.random() * 4.5;
      this.particles.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, size: 3 + Math.random() * 4, color: ['#f97316', '#ef4444', '#facc15', '#ffffff'][Math.floor(Math.random() * 4)], life: 0, maxLife: 25, alpha: 1 });
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx; p.y += p.vy; p.life++;
      p.alpha = 1 - p.life / p.maxLife;
      if (p.life >= p.maxLife) this.particles.splice(i, 1);
    }
  }

  updateHUD() {
    document.getElementById('hudScore').innerText = this.player.score.toLocaleString();
    document.getElementById('hudCorrect').innerText = this.player.correctAnswersCount;
    document.getElementById('hudLives').innerText = this.player.lives;
    document.getElementById('hudWeaponName').innerText = this.player.weapon.type;
    document.getElementById('hudWeaponStars').innerText = '★'.repeat(this.player.weapon.level) + '☆'.repeat(3 - this.player.weapon.level);
    const circle = document.getElementById('hudWeaponCircle');
    circle.innerText = this.player.weapon.letter;
    circle.style.backgroundColor = this.player.weapon.color;
    document.getElementById('arcadeHUD').classList.remove('hidden');
    document.getElementById('touchControls').classList.remove('hidden');
  }

  // --- 8. RENDERER (RETRO PIXEL CONTRA ART) ---
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Parallax Night Sky
    const sky = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    sky.addColorStop(0, '#050a18'); sky.addColorStop(0.5, '#0b162e'); sky.addColorStop(1, '#0f172a');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 73 - this.cameraX * 0.1) % CANVAS_WIDTH + CANVAS_WIDTH) % CANVAS_WIDTH;
      const sy = (i * 29) % (CANVAS_HEIGHT * 0.6);
      ctx.fillRect(Math.floor(sx), Math.floor(sy), (i % 3 === 0) ? 2 : 1, (i % 3 === 0) ? 2 : 1);
    }

    // Distant alien mountains
    const mtnOffset = (-this.cameraX * 0.2) % 400;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT);
    for (let x = -400; x <= CANVAS_WIDTH + 400; x += 100) {
      const rx = x + mtnOffset;
      const h = 140 + Math.sin(x * 0.02) * 50;
      ctx.lineTo(rx, CANVAS_HEIGHT - h);
      ctx.lineTo(rx + 50, CANVAS_HEIGHT - (h + 40));
    }
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fill();

    // Ground & platforms
    ctx.fillStyle = '#14532d';
    ctx.fillRect(0, 390, CANVAS_WIDTH, 60);
    ctx.fillStyle = '#22c55e';
    for (let x = 0; x < CANVAS_WIDTH; x += 6) {
      const gh = 4 + ((x + Math.floor(this.cameraX)) % 3) * 2;
      ctx.fillRect(x, 388 - gh, 5, gh + 2);
    }

    // Platforms
    for (const plat of this.platforms) {
      const rx = Math.floor(plat.x - this.cameraX);
      if (rx + plat.width < -50 || rx > CANVAS_WIDTH + 50) continue;

      if (plat.type === 'bridge') {
        ctx.fillStyle = '#475569'; ctx.fillRect(rx, plat.y, plat.width, 6);
        ctx.fillStyle = '#64748b'; ctx.fillRect(rx, plat.y, plat.width, 2);
      } else if (plat.type === 'water') {
        ctx.fillStyle = '#0284c7'; ctx.fillRect(rx, plat.y, plat.width, plat.height);
        ctx.fillStyle = '#38bdf8';
        const ws = Math.floor((this.tick * 0.8) % 16);
        for (let wx = rx - 16; wx < rx + plat.width; wx += 16) {
          ctx.fillRect(wx + ws, plat.y + 2, 8, 2);
        }
      } else if (plat.type === 'floating') {
        ctx.fillStyle = '#1e293b'; ctx.fillRect(rx, plat.y, plat.width, plat.height);
        ctx.fillStyle = '#06b6d4'; ctx.fillRect(rx, plat.y, plat.width, 3);
      }
    }

    // Barriers
    for (const b of this.barriers) {
      const bx = Math.floor(b.x - this.cameraX);
      if (bx + b.width < -100 || bx > CANVAS_WIDTH + 100) continue;

      if (b.isCleared) {
        ctx.fillStyle = '#334155'; ctx.fillRect(bx, b.y, b.width, 14); ctx.fillRect(bx, b.y + b.height - 14, b.width, 14);
      } else {
        ctx.fillStyle = '#1e293b'; ctx.fillRect(bx - 6, b.y - 12, b.width + 12, 16); ctx.fillRect(bx - 6, b.y + b.height - 4, b.width + 12, 16);
        ctx.fillStyle = b.color; ctx.globalAlpha = 0.4 + Math.sin(this.tick * 0.15) * 0.25;
        ctx.fillRect(bx, b.y, b.width, b.height);
        ctx.globalAlpha = 1;

        // Pulsing terminal box
        const tw = 74, th = 34;
        const tx = bx + b.width / 2 - tw / 2, ty = b.y + b.height / 2 - th / 2;
        ctx.fillStyle = '#0f172a'; ctx.fillRect(tx, ty, tw, th);
        ctx.strokeStyle = b.color; ctx.lineWidth = 2; ctx.strokeRect(tx, ty, tw, th);
        ctx.fillStyle = '#facc15'; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center';
        ctx.fillText('❓ KHÓA', tx + tw / 2, ty + 15);
        ctx.fillStyle = '#38bdf8'; ctx.font = '8px "Press Start 2P"';
        ctx.fillText('BẤM MỞ', tx + tw / 2, ty + 27);
      }
    }

    // Drops (Falcon emblems)
    for (const drop of this.dropCapsules) {
      const dx = Math.floor(drop.x - this.cameraX);
      const dy = Math.floor(drop.y) + Math.sin(this.tick * 0.2) * 3;
      if (dx < -40 || dx > CANVAS_WIDTH + 40) continue;

      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(dx - 10, dy); ctx.lineTo(dx + 12, dy - 8); ctx.lineTo(dx + 34, dy); ctx.lineTo(dx + 12, dy + 10); ctx.closePath();
      ctx.fill();

      ctx.fillStyle = WEAPONS[drop.weaponType] ? WEAPONS[drop.weaponType].color : '#ef4444';
      ctx.beginPath(); ctx.arc(dx + 12, dy, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '9px "Press Start 2P"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(WEAPONS[drop.weaponType] ? WEAPONS[drop.weaponType].letter : 'S', dx + 12, dy + 1);
    }

    // Enemies
    for (const e of this.enemies) {
      if (!e.active) continue;
      const ex = Math.floor(e.x - this.cameraX);
      const ey = Math.floor(e.y);
      if (ex + e.width < -60 || ex > CANVAS_WIDTH + 60) continue;

      if (e.type === 'runner') {
        ctx.fillStyle = '#dc2626'; ctx.fillRect(ex + 3, ey + 10, 14, 12);
        ctx.fillStyle = '#7f1d1d'; ctx.fillRect(ex + 4, ey + 2, 12, 8);
        ctx.fillStyle = '#991b1b'; ctx.fillRect(ex + 4, ey + 22, 5, 14); ctx.fillRect(ex + 11, ey + 22, 5, 14);
      } else if (e.type === 'sniper') {
        ctx.fillStyle = '#15803d'; ctx.fillRect(ex + 4, ey + 8, 12, 16); ctx.fillRect(ex + 5, ey + 2, 10, 6);
      } else if (e.type === 'turret') {
        ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.arc(ex + 14, ey + 14, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(ex + 14, ey + 14, 6, 0, Math.PI * 2); ctx.fill();
      } else if (e.type === 'boss_head') {
        ctx.fillStyle = '#7f1d1d'; ctx.beginPath(); ctx.ellipse(ex + 40, ey + 50, 38, 46, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#b91c1c'; ctx.beginPath(); ctx.arc(ex + 40, ey + 42, 20, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.ellipse(ex + 40, ey + 42, 6, 16, 0, 0, Math.PI * 2); ctx.fill();
        // HP
        const hp = Math.max(0, e.health / e.maxHealth);
        ctx.fillStyle = '#000'; ctx.fillRect(ex - 10, ey - 16, 100, 8);
        ctx.fillStyle = '#ef4444'; ctx.fillRect(ex - 9, ey - 15, 98 * hp, 6);
      }
    }

    // Player Commando
    const p = this.player;
    const px = Math.floor(p.x - this.cameraX);
    const py = Math.floor(p.y);
    const centerHeadX = px + p.width / 2;

    ctx.save();
    if (p.isInvulnerable && Math.floor(this.tick / 4) % 2 === 0) ctx.globalAlpha = 0.4;

    if (p.isJumping) {
      ctx.translate(px + p.width / 2, py + p.height / 2);
      ctx.rotate(p.jumpFlipAngle);
      ctx.fillStyle = '#2563eb'; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#dc2626'; ctx.fillRect(-10, -6, 20, 5);
      ctx.restore();
    } else if (p.isCrouching) {
      const proneY = py + p.height - 14;
      const dirMult = p.facing === 'left' ? -1 : 1;
      ctx.fillStyle = '#2563eb'; ctx.fillRect(centerHeadX - 14 * dirMult, proneY + 4, 22 * dirMult, 8);
      ctx.fillStyle = '#fdba74'; ctx.fillRect(centerHeadX + 6 * dirMult, proneY - 2, 8 * dirMult, 8);
      ctx.fillStyle = '#dc2626'; ctx.fillRect(centerHeadX + 6 * dirMult, proneY - 2, 8 * dirMult, 3);
      ctx.fillStyle = '#94a3b8'; ctx.fillRect(centerHeadX + 12 * dirMult, proneY + 2, 16 * dirMult, 4);
      ctx.restore();
    } else {
      // Standing / Running
      ctx.fillStyle = '#1d4ed8'; ctx.fillRect(centerHeadX - 7, py + 24, 5, 16); ctx.fillRect(centerHeadX + 2, py + 24, 5, 16);
      ctx.fillStyle = '#fdba74'; ctx.fillRect(centerHeadX - 6, py + 12, 12, 12);
      ctx.fillStyle = '#fdba74'; ctx.fillRect(centerHeadX - 5, py + 2, 10, 10);
      ctx.fillStyle = '#dc2626'; ctx.fillRect(centerHeadX - 6, py + 4, 12, 3);

      // Gun angled 8-ways
      const gunEndX = centerHeadX + p.aimDir.dx * 18;
      const gunEndY = py + 16 + p.aimDir.dy * 18;
      ctx.lineWidth = 3.5; ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath(); ctx.moveTo(centerHeadX, py + 16); ctx.lineTo(gunEndX, gunEndY); ctx.stroke();
      ctx.fillStyle = p.weapon.color; ctx.fillRect(gunEndX - 2, gunEndY - 2, 4, 4);
      ctx.restore();
    }

    // Bullets
    for (const b of this.bullets) {
      const bx = Math.floor(b.x - this.cameraX);
      const by = Math.floor(b.y);
      ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(bx, by, b.radius, 0, Math.PI * 2); ctx.fill();
    }

    // Particles
    for (const pt of this.particles) {
      const px = Math.floor(pt.x - this.cameraX);
      const py = Math.floor(pt.y);
      ctx.save(); ctx.globalAlpha = Math.max(0, pt.alpha);
      ctx.fillStyle = pt.color; ctx.fillRect(px, py, pt.size, pt.size);
      ctx.restore();
    }
  }
}

// Instantiate on window load
window.addEventListener('DOMContentLoaded', () => {
  window.contraApp = new GameApp();
});
