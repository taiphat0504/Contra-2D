import { Bullet, DropCapsule, Enemy, ObstacleBarrier, Particle, PlayerState } from '../types';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants';

export class PixelRenderer {
  // Draw parallax background
  static drawBackground(ctx: CanvasRenderingContext2D, cameraX: number, tick: number) {
    // Deep starry arcade night sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    skyGrad.addColorStop(0, '#050a18');
    skyGrad.addColorStop(0.5, '#0b162e');
    skyGrad.addColorStop(0.85, '#1e293b');
    skyGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Stars layer (slow parallax)
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 73 - cameraX * 0.1) % CANVAS_WIDTH + CANVAS_WIDTH) % CANVAS_WIDTH;
      const sy = (i * 29) % (CANVAS_HEIGHT * 0.6);
      const twinkle = (Math.sin(tick * 0.05 + i) + 1) * 0.5;
      ctx.globalAlpha = 0.3 + twinkle * 0.7;
      ctx.fillRect(Math.floor(sx), Math.floor(sy), (i % 3 === 0) ? 2 : 1, (i % 3 === 0) ? 2 : 1);
    }
    ctx.globalAlpha = 1;

    // Distant mountain ranges (parallax factor 0.2)
    const mtnOffset = (-cameraX * 0.2) % 400;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT);
    for (let x = -400; x <= CANVAS_WIDTH + 400; x += 100) {
      const rx = x + mtnOffset;
      const mtnHeight = 140 + Math.sin(x * 0.02) * 50;
      ctx.lineTo(rx, CANVAS_HEIGHT - mtnHeight);
      ctx.lineTo(rx + 50, CANVAS_HEIGHT - (mtnHeight + 40));
    }
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fill();

    // Cyber fortress skyline & jungle silhouette (parallax factor 0.4)
    const midOffset = (-cameraX * 0.4) % 300;
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT);
    for (let x = -300; x <= CANVAS_WIDTH + 300; x += 60) {
      const rx = x + midOffset;
      const h = 90 + Math.cos(x * 0.03) * 35;
      ctx.lineTo(rx, CANVAS_HEIGHT - h);
      ctx.lineTo(rx + 30, CANVAS_HEIGHT - h - 20);
      ctx.lineTo(rx + 60, CANVAS_HEIGHT - h + 10);
    }
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fill();

    // Distant military antennas and red signal beacons
    for (let i = 0; i < 5; i++) {
      const antX = ((i * 380 - cameraX * 0.3) % (CANVAS_WIDTH + 200)) - 100;
      ctx.strokeStyle = '#312e81';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(antX, CANVAS_HEIGHT - 60);
      ctx.lineTo(antX, CANVAS_HEIGHT - 170);
      ctx.stroke();
      // Blinking red light
      if (Math.sin(tick * 0.1 + i) > 0) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(antX, CANVAS_HEIGHT - 172, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Draw terrain platforms (Ground, steel military girder bridges, rock ledges, water)
  static drawPlatforms(ctx: CanvasRenderingContext2D, cameraX: number, tick: number) {
    // Ground level is at y = 380
    // Water sections, steel girders, rocky steps
    // We will draw the visible screen area
    const screenLeft = cameraX - 50;
    const screenRight = cameraX + CANVAS_WIDTH + 50;

    // Base ground rendering
    ctx.fillStyle = '#14532d'; // Dark jungle green
    ctx.fillRect(0, 390, CANVAS_WIDTH, 60);

    // Pixel grass top fringe
    ctx.fillStyle = '#22c55e';
    for (let x = 0; x < CANVAS_WIDTH; x += 6) {
      const grassHeight = 4 + ((x + cameraX) % 3) * 2;
      ctx.fillRect(x, 388 - grassHeight, 5, grassHeight + 2);
    }

    // Rocky dirt layers below
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 394, CANVAS_WIDTH, 14);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 408, CANVAS_WIDTH, 42);

    // Ground detail stones
    ctx.fillStyle = '#92400e';
    for (let i = 0; i < 20; i++) {
      const stoneX = ((i * 67 - cameraX) % CANVAS_WIDTH + CANVAS_WIDTH) % CANVAS_WIDTH;
      ctx.fillRect(stoneX, 400 + (i % 4) * 8, 8, 4);
    }
  }

  // Draw an elevated platform (steel bridge or jungle rock)
  static drawPlatform(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    type: string,
    cameraX: number,
    tick: number
  ) {
    const rx = Math.floor(x - cameraX);
    if (rx + w < -50 || rx > CANVAS_WIDTH + 50) return;

    if (type === 'bridge') {
      // Steel military truss bridge
      ctx.fillStyle = '#475569';
      ctx.fillRect(rx, y, w, 6);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(rx, y, w, 2);

      // Steel rivets & cross beams
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      for (let bx = rx; bx < rx + w - 16; bx += 24) {
        ctx.strokeRect(bx, y + 6, 24, h - 6);
        ctx.beginPath();
        ctx.moveTo(bx, y + 6);
        ctx.lineTo(bx + 24, y + h);
        ctx.moveTo(bx + 24, y + 6);
        ctx.lineTo(bx, y + h);
        ctx.stroke();
      }
    } else if (type === 'water') {
      // Flowing water trench
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(rx, y, w, h);
      ctx.fillStyle = '#38bdf8';
      // Animated water wavelets
      const waveShift = Math.floor((tick * 0.8) % 16);
      for (let wx = rx - 16; wx < rx + w; wx += 16) {
        ctx.fillRect(wx + waveShift, y + 2, 8, 2);
        ctx.fillRect(wx + (waveShift + 8) % 16, y + 8, 6, 2);
      }
    } else {
      // High-tech steel / rock floating platform
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(rx, y, w, h);
      // Cyber neon edge
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(rx, y, w, 3);
      // Warning stripes
      ctx.fillStyle = '#eab308';
      for (let bx = rx + 4; bx < rx + w - 8; bx += 20) {
        ctx.fillRect(bx, y + 4, 8, 3);
      }
    }
  }

  // Draw Player (Contra Commando)
  static drawPlayer(ctx: CanvasRenderingContext2D, player: PlayerState, cameraX: number, tick: number) {
    const px = Math.floor(player.x - cameraX);
    const py = Math.floor(player.y);

    ctx.save();

    // Flashing when invulnerable
    if (player.isInvulnerable && Math.floor(tick / 4) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Shield aura
    if (player.shieldActive) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const sRadius = 24 + Math.sin(tick * 0.2) * 2;
      ctx.arc(px + player.width / 2, py + player.height / 2, sRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Orbiting energy spark
      const orbitAngle = tick * 0.15;
      const ox = px + player.width / 2 + Math.cos(orbitAngle) * sRadius;
      const oy = py + player.height / 2 + Math.sin(orbitAngle) * sRadius;
      ctx.fillStyle = '#facc15';
      ctx.fillRect(ox - 3, oy - 3, 6, 6);
    }

    const isLeft = player.facing === 'left';
    const centerHeadX = px + player.width / 2;

    if (player.isJumping) {
      // Classic Contra Somersault (spinning ball of acrobatics)
      ctx.translate(px + player.width / 2, py + player.height / 2);
      ctx.rotate(player.jumpFlipAngle);

      // Red/Blue combat suit ball
      ctx.fillStyle = '#2563eb'; // Blue Commando suit (Lance/Bill)
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      // Red headband / muscular limbs tucked
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-10, -6, 20, 5);

      // Skin tone limbs
      ctx.fillStyle = '#fdba74';
      ctx.fillRect(-12, 2, 7, 7);
      ctx.fillRect(5, 2, 7, 7);

      // Gun carried tightly
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-4, -12, 8, 4);

      ctx.restore();
      return;
    }

    if (player.isCrouching) {
      // Prone / Nằm rạp (Lying on ground shooting low)
      const proneY = py + player.height - 14;
      const dirMult = isLeft ? -1 : 1;

      // Body lying down
      ctx.fillStyle = '#2563eb'; // blue pants/uniform
      ctx.fillRect(centerHeadX - 14 * dirMult, proneY + 4, 22 * dirMult, 8);

      // Torso / commando chest
      ctx.fillStyle = '#fdba74';
      ctx.fillRect(centerHeadX - 4 * dirMult, proneY + 2, 10 * dirMult, 6);

      // Head & red headband
      ctx.fillStyle = '#fdba74';
      ctx.fillRect(centerHeadX + 6 * dirMult, proneY - 2, 8 * dirMult, 8);
      ctx.fillStyle = '#dc2626'; // Red headband
      ctx.fillRect(centerHeadX + 6 * dirMult, proneY - 2, 8 * dirMult, 3);

      // Gun pointing forward horizontally
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(centerHeadX + 12 * dirMult, proneY + 2, 16 * dirMult, 4);
      ctx.fillStyle = player.weapon.color;
      ctx.fillRect(centerHeadX + 24 * dirMult, proneY + 3, 5 * dirMult, 2);

      ctx.restore();
      return;
    }

    // Half submerged in water
    if (player.inWater) {
      // Upper body only
      ctx.fillStyle = '#fdba74'; // Torso
      ctx.fillRect(centerHeadX - 6, py + 12, 12, 12);
      // Head
      ctx.fillRect(centerHeadX - 5, py + 2, 10, 10);
      // Red headband
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(centerHeadX - 6, py + 3, 12, 3);
      // Gun
      ctx.fillStyle = '#94a3b8';
      const gx = isLeft ? centerHeadX - 16 : centerHeadX + 4;
      ctx.fillRect(gx, py + 8, 14, 4);

      // Water ripples
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(centerHeadX - 16, py + 24, 32, 3);

      ctx.restore();
      return;
    }

    // Standing / Running commando
    const walkAnim = Math.floor(tick * 0.25) % 4;
    const isMoving = Math.abs(player.vx) > 0.3;

    // --- LEGS ---
    ctx.fillStyle = '#1d4ed8'; // Blue combat pants
    if (isMoving) {
      if (walkAnim === 0) {
        ctx.fillRect(centerHeadX - 8, py + 24, 6, 16);
        ctx.fillRect(centerHeadX + 2, py + 24, 6, 14);
      } else if (walkAnim === 1) {
        ctx.fillRect(centerHeadX - 10, py + 24, 7, 13);
        ctx.fillRect(centerHeadX + 3, py + 24, 7, 16);
      } else if (walkAnim === 2) {
        ctx.fillRect(centerHeadX - 4, py + 24, 6, 15);
        ctx.fillRect(centerHeadX - 2, py + 24, 6, 15);
      } else {
        ctx.fillRect(centerHeadX - 3, py + 24, 7, 16);
        ctx.fillRect(centerHeadX + 4, py + 24, 7, 13);
      }
    } else {
      // Standing combat stance
      ctx.fillRect(centerHeadX - 7, py + 24, 5, 16);
      ctx.fillRect(centerHeadX + 2, py + 24, 5, 16);
    }

    // Black combat boots
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(centerHeadX - 8, py + 36, 6, 4);
    ctx.fillRect(centerHeadX + 2, py + 36, 6, 4);

    // --- TORSO ---
    ctx.fillStyle = '#fdba74'; // Muscular tanned torso
    ctx.fillRect(centerHeadX - 6, py + 12, 12, 12);
    // Harness / belt strap
    ctx.fillStyle = '#475569';
    ctx.fillRect(centerHeadX - 6, py + 14, 12, 2);
    ctx.fillRect(centerHeadX - 6, py + 22, 12, 3);

    // --- HEAD ---
    ctx.fillStyle = '#fdba74';
    ctx.fillRect(centerHeadX - 5, py + 2, 10, 10);
    // Dark hair
    ctx.fillStyle = '#451a03';
    ctx.fillRect(centerHeadX - 6, py + 1, 12, 4);
    // Red bandana / headband with fluttering tail
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(centerHeadX - 6, py + 4, 12, 3);
    const bandTailX = isLeft ? centerHeadX + 6 : centerHeadX - 10;
    const tailFlutter = Math.sin(tick * 0.3) * 2;
    ctx.fillRect(bandTailX, py + 4 + tailFlutter, 5, 3);

    // --- ARMS & WEAPON WITH 8-DIRECTION AIMING ---
    const aim = player.aimDir;
    ctx.fillStyle = '#94a3b8'; // Gun barrel
    ctx.strokeStyle = '#475569';

    const shoulderX = centerHeadX + (isLeft ? -4 : 4);
    const shoulderY = py + 16;
    const gunLen = 18;

    // Gun endpoint
    const gunEndX = shoulderX + aim.dx * gunLen;
    const gunEndY = shoulderY + aim.dy * gunLen;

    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(gunEndX, gunEndY);
    ctx.stroke();

    // Weapon colored muzzle / magazine indicator
    ctx.fillStyle = player.weapon.color;
    ctx.fillRect(gunEndX - 2, gunEndY - 2, 4, 4);

    // Arms holding gun
    ctx.fillStyle = '#fdba74';
    ctx.fillRect(shoulderX - 3, shoulderY - 2, 6, 5);

    ctx.restore();
  }

  // Draw Enemies
  static drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy, cameraX: number, tick: number) {
    const ex = Math.floor(enemy.x - cameraX);
    const ey = Math.floor(enemy.y);
    if (ex + enemy.width < -60 || ex > CANVAS_WIDTH + 60) return;

    ctx.save();

    if (enemy.type === 'runner') {
      // Red soldier running
      const isLeft = enemy.facing === 'left';
      const anim = Math.floor(tick * 0.25) % 4;

      // Legs
      ctx.fillStyle = '#991b1b'; // Red uniform
      ctx.fillRect(ex + 4, ey + 22, 5, 14);
      ctx.fillRect(ex + 11, ey + 22, 5, 14);

      // Torso
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(ex + 3, ey + 10, 14, 12);

      // Head / helmet
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(ex + 4, ey + 2, 12, 8);
      ctx.fillStyle = '#fca5a5';
      ctx.fillRect(isLeft ? ex + 3 : ex + 12, ey + 5, 5, 4);

      // Rifle held forward
      ctx.fillStyle = '#334155';
      const rX = isLeft ? ex - 6 : ex + 14;
      ctx.fillRect(rX, ey + 14, 12, 3);
    } else if (enemy.type === 'sniper') {
      // Tower sniper (camo uniform, aiming rifle)
      ctx.fillStyle = '#15803d'; // Green camo
      ctx.fillRect(ex + 4, ey + 8, 12, 16);
      ctx.fillStyle = '#14532d';
      ctx.fillRect(ex + 5, ey + 2, 10, 6);

      // Long sniper barrel
      const isLeft = enemy.facing === 'left';
      ctx.fillStyle = '#0f172a';
      const bX = isLeft ? ex - 12 : ex + 12;
      ctx.fillRect(bX, ey + 12, 18, 2);
    } else if (enemy.type === 'turret') {
      // Rotating bunker gun / pillbox
      // Base dome
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(ex + enemy.width / 2, ey + enemy.height / 2, 15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#dc2626'; // Red sensor core
      ctx.beginPath();
      ctx.arc(ex + enemy.width / 2, ey + enemy.height / 2, 6, 0, Math.PI * 2);
      ctx.fill();

      // Gun nozzle angled towards player
      const angle = enemy.angle || 0;
      const barrelLen = 16;
      const bx = ex + enemy.width / 2 + Math.cos(angle) * barrelLen;
      const by = ey + enemy.height / 2 + Math.sin(angle) * barrelLen;

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(ex + enemy.width / 2, ey + enemy.height / 2);
      ctx.lineTo(bx, by);
      ctx.stroke();
    } else if (enemy.type === 'drone') {
      // Flying alien cyber drone
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.arc(ex + enemy.width / 2, ey + enemy.height / 2, 12, 0, Math.PI * 2);
      ctx.fill();

      // Rotating blades / fins
      ctx.fillStyle = '#a5b4fc';
      const fin = Math.sin(tick * 0.4) * 8;
      ctx.fillRect(ex + enemy.width / 2 - 16, ey + enemy.height / 2 + fin - 2, 32, 4);

      // Glowing red lens
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(ex + enemy.width / 2 - 4, ey + enemy.height / 2 - 4, 8, 8);
    } else if (enemy.type === 'boss_head') {
      // Giant Red Falcon Cybernetic Alien Boss
      const cx = ex + enemy.width / 2;
      const cy = ey + enemy.height / 2;

      // Alien skull / biomechanical armored shell
      ctx.fillStyle = '#450a0a';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 45, 55, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 38, 46, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pulsating central alien brain / eye core
      const eyePulse = Math.sin(tick * 0.1) * 3;
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(cx, cy - 8, 20 + eyePulse, 0, Math.PI * 2);
      ctx.fill();

      // Slit pupil
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 8, 6, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 8, 2.5, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bio-mechanical tentacles / cyber conduits
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 4;
      for (let i = -2; i <= 2; i++) {
        const tx = cx + i * 18;
        const wave = Math.sin(tick * 0.1 + i) * 8;
        ctx.beginPath();
        ctx.moveTo(tx, cy + 30);
        ctx.quadraticCurveTo(tx + wave, cy + 60, tx, cy + 80);
        ctx.stroke();
      }

      // Boss health bar above head
      const hbW = 90;
      const hbH = 8;
      const hbX = cx - hbW / 2;
      const hbY = ey - 18;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(hbX - 2, hbY - 2, hbW + 4, hbH + 4);
      const hpPct = Math.max(0, enemy.health / enemy.maxHealth);
      ctx.fillStyle = hpPct > 0.4 ? '#ef4444' : '#f97316';
      ctx.fillRect(hbX, hbY, hbW * hpPct, hbH);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1;
      ctx.strokeRect(hbX - 2, hbY - 2, hbW + 4, hbH + 4);
    }

    ctx.restore();
  }

  // Draw Knowledge Obstacle (Forcefield Energy Barrier / Terminal Gate)
  static drawBarrier(
    ctx: CanvasRenderingContext2D,
    barrier: ObstacleBarrier,
    cameraX: number,
    tick: number
  ) {
    const bx = Math.floor(barrier.x - cameraX);
    const by = Math.floor(barrier.y);
    if (bx + barrier.width < -100 || bx > CANVAS_WIDTH + 100) return;

    ctx.save();

    if (barrier.isCleared) {
      // Barrier is disabled / destroyed! Draw deactivated smoking pillars
      ctx.fillStyle = '#334155';
      ctx.fillRect(bx, by, barrier.width, 14);
      ctx.fillRect(bx, by + barrier.height - 14, barrier.width, 14);

      // Cleared green sign
      ctx.fillStyle = '#22c55e';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('ĐÃ VƯỢT QUA ✓', bx - 14, by + barrier.height / 2);
      ctx.restore();
      return;
    }

    // Active Forcefield Barrier: High-tech vertical energy laser wall
    // Top and bottom emitter generator stations
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(bx - 6, by - 12, barrier.width + 12, 16);
    ctx.fillRect(bx - 6, by + barrier.height - 4, barrier.width + 12, 16);

    // Glowing core coils
    ctx.fillStyle = barrier.themeColor;
    ctx.fillRect(bx, by - 6, barrier.width, 6);
    ctx.fillRect(bx, by + barrier.height - 2, barrier.width, 6);

    // Forcefield laser curtain with electric sparks
    const alpha = 0.4 + Math.sin(tick * 0.15) * 0.25;
    ctx.fillStyle = barrier.themeColor;
    ctx.globalAlpha = alpha;
    ctx.fillRect(bx, by, barrier.width, barrier.height);

    // Oscillating laser beams
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const lx = bx + (barrier.width / 4) * (i + 1) + Math.sin(tick * 0.2 + i) * 3;
      ctx.beginPath();
      ctx.moveTo(lx, by);
      ctx.lineTo(lx, by + barrier.height);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Glowing Knowledge Gate Terminal in center
    const cy = by + barrier.height / 2;
    const termW = 74;
    const termH = 34;
    const termX = bx + barrier.width / 2 - termW / 2;
    const termY = cy - termH / 2;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(termX, termY, termW, termH);
    ctx.strokeStyle = barrier.themeColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(termX, termY, termW, termH);

    // Question mark or subject badge pulsating
    ctx.fillStyle = '#facc15';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('❓ KHÓA', termX + termW / 2, termY + 16);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('BẤM MỞ', termX + termW / 2, termY + 28);

    ctx.restore();
  }

  // Draw Falcon Weapon Capsule & Drop Emblems
  static drawDropCapsule(ctx: CanvasRenderingContext2D, drop: DropCapsule, cameraX: number, tick: number) {
    const dx = Math.floor(drop.x - cameraX);
    const dy = Math.floor(drop.y);
    if (dx < -40 || dx > CANVAS_WIDTH + 40) return;

    ctx.save();

    // Bobbing motion
    const bob = Math.sin(tick * 0.2) * 3;
    const cy = dy + bob;

    // Iconic Contra Falcon Emblem / Winged Badge
    // Wings
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(dx - 12, cy);
    ctx.lineTo(dx - 2, cy - 8);
    ctx.lineTo(dx + 14, cy);
    ctx.lineTo(dx + 26, cy - 8);
    ctx.lineTo(dx + 36, cy);
    ctx.lineTo(dx + 12, cy + 12);
    ctx.closePath();
    ctx.fill();

    // Central circular letter emblem
    let badgeColor = '#ef4444';
    let letter = 'S';

    if (drop.weaponType === 'MACHINE') {
      badgeColor = '#f97316';
      letter = 'M';
    } else if (drop.weaponType === 'SPREAD') {
      badgeColor = '#ef4444';
      letter = 'S';
    } else if (drop.weaponType === 'LASER') {
      badgeColor = '#06b6d4';
      letter = 'L';
    } else if (drop.weaponType === 'FLAME') {
      badgeColor = '#e11d48';
      letter = 'F';
    } else if (drop.weaponType === 'HOMING') {
      badgeColor = '#a855f7';
      letter = 'H';
    } else if (drop.weaponType === 'SHIELD') {
      badgeColor = '#3b82f6';
      letter = 'B';
    } else if (drop.weaponType === 'LIFE') {
      badgeColor = '#10b981';
      letter = '+';
    }

    ctx.fillStyle = badgeColor;
    ctx.beginPath();
    ctx.arc(dx + 12, cy, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Glowing letter
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, dx + 12, cy + 1);

    ctx.restore();
  }

  // Draw Flying Weapon Pod in the sky
  static drawFlyingPod(ctx: CanvasRenderingContext2D, pod: { x: number; y: number }, cameraX: number, tick: number) {
    const px = Math.floor(pod.x - cameraX);
    const py = Math.floor(pod.y);
    if (px < -60 || px > CANVAS_WIDTH + 60) return;

    ctx.save();
    // Flying pod with red flashing sensor
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.ellipse(px + 14, py + 8, 16, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Red Contra insignia
    ctx.fillStyle = Math.sin(tick * 0.3) > 0 ? '#ef4444' : '#b91c1c';
    ctx.beginPath();
    ctx.arc(px + 14, py + 8, 5, 0, Math.PI * 2);
    ctx.fill();

    // Exhaust jet flame
    ctx.fillStyle = '#f59e0b';
    const flameL = 6 + (Math.floor(tick * 0.5) % 4) * 3;
    ctx.fillRect(px + 28, py + 6, flameL, 4);

    ctx.restore();
  }

  // Draw Bullets with distinct effects
  static drawBullet(ctx: CanvasRenderingContext2D, bullet: Bullet, cameraX: number) {
    const bx = Math.floor(bullet.x - cameraX);
    const by = Math.floor(bullet.y);
    if (bx < -30 || bx > CANVAS_WIDTH + 30) return;

    ctx.save();

    if (bullet.type === 'LASER') {
      // Long cyan laser bolt
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(bx - bullet.vx * 1.5, by - bullet.vy * 1.5);
      ctx.lineTo(bx + bullet.vx * 0.5, by + bullet.vy * 0.5);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx - bullet.vx * 1.5, by - bullet.vy * 1.5);
      ctx.lineTo(bx + bullet.vx * 0.5, by + bullet.vy * 0.5);
      ctx.stroke();
    } else if (bullet.type === 'FLAME') {
      // Swirling fiery projectile with flame trail
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(bx, by, bullet.radius + 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(bx, by, bullet.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    } else if (bullet.type === 'HOMING') {
      // Rocket missile with smoke trail
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(bx - 3, by - 3, 6, 6);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(bx - 2, by - 2, 4, 4);
    } else {
      // Standard / Spread / Machine gun bullets
      ctx.fillStyle = bullet.color;
      ctx.beginPath();
      ctx.arc(bx, by, bullet.radius, 0, Math.PI * 2);
      ctx.fill();

      // Bright white core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(bx, by, Math.max(1, bullet.radius * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Draw Particles (explosions, sparks, debris)
  static drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[], cameraX: number) {
    for (const p of particles) {
      const px = Math.floor(p.x - cameraX);
      const py = Math.floor(p.y);
      if (px < -20 || px > CANVAS_WIDTH + 20) continue;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      if (p.type === 'shockwave') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillRect(px - p.size / 2, py - p.size / 2, p.size, p.size);
      }
      ctx.restore();
    }
  }
}
