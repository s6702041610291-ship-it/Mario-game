export interface Question {
  id: number;
  stage: number; // 1, 2, 3
  question: string;
  options: string[];
  answerIndex: number; // 0..3
  explanation: string;
  hint: string;
  categoryBadge: string;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  facing: 'left' | 'right';
  animState: 'idle' | 'walk' | 'jump';
  walkTimer: number;
  walkFrame: number;
  invulnerableTimer: number; // in seconds
  isDead: boolean;
}

export type EnemyType = 'mushroom' | 'spike';

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  width: number;
  height: number;
  minX: number;
  maxX: number;
  isDead: boolean;
  squishTimer: number;
}

export interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'brick' | 'question_prop';
}

export interface Coin {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
  baseY: number;
}

export interface Powerup {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
  baseY: number;
}

export interface PipeCheckpoint {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  isActivated: boolean;
}

export interface QuestionGate {
  id: number;
  gateIndex: number; // 0..4 in this stage
  x: number;
  y: number;
  width: number;
  height: number;
  questionId: number;
  isOpened: boolean;
  shatterParticlesTriggered?: boolean;
}

export interface CastleGoal {
  x: number;
  y: number;
  width: number;
  height: number;
  flagY: number;
  reached: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  gravity?: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface LessonCard {
  id: number;
  badge: string;
  emoji: string;
  title: string;
  description: string;
  examples: string[];
  chant?: string;
  highlight?: string;
}

export interface UserAnswerRecord {
  questionId: number;
  stage: number;
  question: string;
  selectedOption: string;
  correctOption: string;
  isCorrect: boolean;
  explanation: string;
  categoryBadge: string;
  timeTaken: number;
}

export type CharacterId = 'adventurer' | 'ribbon_girl' | 'cat_hero' | 'wizard' | 'robot';

export interface CharacterOption {
  id: CharacterId;
  name: string;
  nickname: string;
  description: string;
  avatarEmoji: string;
  themeColor: string;
  badge: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  classroom?: string;
  title: string;
  characterId: CharacterId;
  highScore: number;
  unlockedStage: number;
  totalCoins: number;
  lastPlayedAt?: string;
}
