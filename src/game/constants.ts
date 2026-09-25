import { WeaponConfig, WeaponType } from '../types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 450;

export const GRAVITY = 0.55;
export const PLAYER_SPEED = 3.6;
export const JUMP_FORCE = -10.8;
export const FRICTION = 0.82;

export const WEAPON_CONFIGS: Record<WeaponType, WeaponConfig> = {
  RIFLE: {
    type: 'RIFLE',
    name: 'Súng Trường Tiêu Chuẩn',
    letter: 'R',
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    fireRate: 200,
    damage: 15,
    speed: 10,
    bulletRadius: 3,
    description: 'Bắn phát một ổn định, tốc độ đạn tốt',
    level: 1,
  },
  MACHINE: {
    type: 'MACHINE',
    name: 'Súng Máy Liên Thanh (M)',
    letter: 'M',
    color: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.5)',
    fireRate: 90,
    damage: 18,
    speed: 12,
    bulletRadius: 3.5,
    description: 'Xả đạn liên tục cực nhanh với luồng hoả lực áp đảo',
    level: 1,
  },
  SPREAD: {
    type: 'SPREAD',
    name: 'Súng Bắn Toả Đa Hướng (S)',
    letter: 'S',
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    fireRate: 250,
    damage: 22,
    speed: 9.5,
    bulletRadius: 5,
    description: 'Vũ khí Contra huyền thoại! Bắn chùm 5 tia toả quét sạch mọi mục tiêu',
    level: 1,
  },
  LASER: {
    type: 'LASER',
    name: 'Pháo Laser Xuyên Phá (L)',
    letter: 'L',
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.7)',
    fireRate: 240,
    damage: 42,
    speed: 15,
    bulletRadius: 4,
    description: 'Chùm tia năng lượng cực đại xuyên qua mọi kẻ địch trên đường bay',
    level: 1,
  },
  FLAME: {
    type: 'FLAME',
    name: 'Cầu Lửa Xoáy Nổ (F)',
    letter: 'F',
    color: '#e11d48',
    glowColor: 'rgba(225, 29, 72, 0.6)',
    fireRate: 280,
    damage: 38,
    speed: 7.5,
    bulletRadius: 7,
    description: 'Cầu lửa xoáy cuộn tạo ra vụ nổ diện rộng thiêu rụi mục tiêu',
    level: 1,
  },
  HOMING: {
    type: 'HOMING',
    name: 'Tên Lửa Tầm Nhiệt Tự Dẫn (H)',
    letter: 'H',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    fireRate: 300,
    damage: 30,
    speed: 8.5,
    bulletRadius: 4.5,
    description: 'Tên lửa thông minh tự động truy kích kẻ thù gần nhất',
    level: 1,
  },
};
