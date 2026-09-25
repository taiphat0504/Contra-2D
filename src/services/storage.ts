import { LeaderboardEntry, SubjectId } from '../types';

const LEADERBOARD_KEY = 'contra_quiz_leaderboard_v1';
const SELECTED_SUBJECT_KEY = 'contra_quiz_selected_subject_v1';

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lead_1',
    playerName: 'Bill Rizer (Đặc Nhiệm)',
    correctAnswers: 15,
    score: 84500,
    subjectName: 'Tổng Hợp Đa Môn',
    date: '2026-09-20',
    stageReached: 'Vượt Ải Pháo Đài',
    weaponUsed: 'SPREAD (S)',
  },
  {
    id: 'lead_2',
    playerName: 'Lance Bean',
    correctAnswers: 12,
    score: 69200,
    subjectName: 'Toán Học',
    date: '2026-09-21',
    stageReached: 'Căn Cứ Quái Vật',
    weaponUsed: 'LASER (L)',
  },
  {
    id: 'lead_3',
    playerName: 'Học Bá Contra',
    correctAnswers: 10,
    score: 55400,
    subjectName: 'Khoa Học',
    date: '2026-09-22',
    stageReached: 'Rừng Rậm Alien',
    weaponUsed: 'MACHINE (M)',
  },
  {
    id: 'lead_4',
    playerName: 'Chiến Binh Sao Vàng',
    correctAnswers: 8,
    score: 42100,
    subjectName: 'Lịch Sử',
    date: '2026-09-23',
    stageReached: 'Thác Nước Cổ',
    weaponUsed: 'HOMING (H)',
  },
  {
    id: 'lead_5',
    playerName: 'Cyber Commando',
    correctAnswers: 6,
    score: 31000,
    subjectName: 'Tin Học',
    date: '2026-09-24',
    stageReached: 'Cầu Sắt Phòng Tuyến',
    weaponUsed: 'FLAME (F)',
  },
];

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(DEFAULT_LEADERBOARD));
      return DEFAULT_LEADERBOARD;
    }
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      // Sort primarily by correctAnswers DESC, secondarily by score DESC
      return data.sort((a, b) => {
        if (b.correctAnswers !== a.correctAnswers) {
          return b.correctAnswers - a.correctAnswers;
        }
        return b.score - a.score;
      });
    }
  } catch {
    // fallback
  }
  return DEFAULT_LEADERBOARD;
}

export function saveLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'date'>): LeaderboardEntry[] {
  const current = getLeaderboard();
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    date: new Date().toISOString().split('T')[0],
  };

  const updated = [...current, newEntry].sort((a, b) => {
    if (b.correctAnswers !== a.correctAnswers) {
      return b.correctAnswers - a.correctAnswers;
    }
    return b.score - a.score;
  }).slice(0, 50); // Keep top 50

  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  return updated;
}

export function getSavedSubject(): SubjectId {
  try {
    const saved = localStorage.getItem(SELECTED_SUBJECT_KEY);
    if (saved) return saved as SubjectId;
  } catch {
    // fallback
  }
  return 'all';
}

export function saveSelectedSubject(subjectId: SubjectId) {
  try {
    localStorage.setItem(SELECTED_SUBJECT_KEY, subjectId);
  } catch {
    // ignore
  }
}
