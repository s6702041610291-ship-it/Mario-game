import { CharacterOption, PlayerProfile } from '../types';

export const CHARACTERS: CharacterOption[] = [
  {
    id: 'adventurer',
    name: 'น้องกานต์',
    nickname: 'นักสำรวจหมวกฟ้า',
    description: 'นักผจญภัยใจกล้า สวมหมวกแก๊ปสีฟ้าและแบกเป้คู่ใจ พร้อมกระโดดข้ามทุกอุปสรรค!',
    avatarEmoji: '🧢',
    themeColor: 'from-blue-500 to-indigo-600',
    badge: 'สายลุย',
  },
  {
    id: 'ribbon_girl',
    name: 'น้องขวัญ',
    nickname: 'สาวน้อยโบชมพู',
    description: 'เด็กหญิงสดใสติดโบสีชมพู อารมณ์ดี ฉลาดหลักแหลม จำคำศัพท์แม่กนได้แม่นยำ!',
    avatarEmoji: '🎀',
    themeColor: 'from-pink-500 to-rose-600',
    badge: 'สายวิชาการ',
  },
  {
    id: 'cat_hero',
    name: 'กัปตันเหมียว',
    nickname: 'ฮีโร่หูแมวส้ม',
    description: 'สวมฮู้ดหูแมวสีส้มและผ้าพันคอสีฟ้า คล่องแคล่วว่องไว ตอบคำถามรวดเร็วดั่งสายฟ้า!',
    avatarEmoji: '🐱',
    themeColor: 'from-amber-500 to-orange-600',
    badge: 'สายความไว',
  },
  {
    id: 'wizard',
    name: 'จอมเวทวาฬ',
    nickname: 'เมจิกสตาร์',
    description: 'จอมเวทฝึกหัดหมวกดวงดาว สามารถร่ายเวทมนตร์แกะรอยตัวสะกด ญ ณ ร ล ฬ ได้อย่างง่ายดาย!',
    avatarEmoji: '🧙',
    themeColor: 'from-purple-500 to-indigo-700',
    badge: 'สายเวทมนตร์',
  },
  {
    id: 'robot',
    name: 'บ็อตน้อย AI',
    nickname: 'หุ่นยนต์พลังคำ',
    description: 'หุ่นยนต์ตัวจิ๋วติดเสาอากาศดวงไฟสแกนคำ ประมวลผลแม่นยำ ไร้ข้อผิดพลาด!',
    avatarEmoji: '🤖',
    themeColor: 'from-cyan-500 to-teal-600',
    badge: 'สายไฮเทค',
  },
];

export const STUDENT_TITLES: string[] = [
  'นักสืบคำ ป.3',
  'อัศวินแม่กน',
  'ผู้กล้าแห่งดินแดนคำ',
  'เซียนภาษาไทย ป.3',
  'นักล่าเหรียญอักษร',
  'ยอดนักอ่านตัวจิ๋ว',
];

export const DEFAULT_PROFILE: PlayerProfile = {
  id: 'guest_player',
  name: 'ผู้กล้าตัวน้อย',
  classroom: 'ป.3/1',
  title: 'นักสืบคำ ป.3',
  characterId: 'adventurer',
  highScore: 0,
  unlockedStage: 1,
  totalCoins: 0,
  lastPlayedAt: new Date().toISOString(),
};

const PROFILES_STORAGE_KEY = 'maekon_all_profiles';
const ACTIVE_PROFILE_KEY = 'maekon_active_profile_id';

export function getSavedProfiles(): PlayerProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read profiles:', e);
  }
  return [];
}

export function saveProfilesList(profiles: PlayerProfile[]): void {
  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error('Failed to save profiles:', e);
  }
}

export function getActiveProfileId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_PROFILE_KEY);
  } catch (e) {
    return null;
  }
}

export function setActiveProfileId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  } catch (e) {
    console.error('Failed to set active profile id:', e);
  }
}

