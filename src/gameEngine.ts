import {
  Block,
  CastleGoal,
  CharacterId,
  Coin,
  Enemy,
  FloatingText,
  Particle,
  PipeCheckpoint,
  Player,
  Powerup,
  QuestionGate,
} from './types';
import { sound } from './audio';

export interface LevelState {
  stage: number;
  characterId: CharacterId;
  worldWidth: number;
  groundY: number;
  player: Player;
  checkpointSpawn: { x: number; y: number };
  blocks: Block[];
  enemies: Enemy[];
  coins: Coin[];
  powerups: Powerup[];
  pipes: PipeCheckpoint[];
  gates: QuestionGate[];
  castle: CastleGoal;
  particles: Particle[];
  floatingTexts: FloatingText[];
  score: number;
  coinsCount: number;
  lives: number;
  maxLives: number;
  timeLeft: number;
  combo: number;
  maxCombo: number;
  activeGate: QuestionGate | null;
  isStageClear: boolean;
  isGameOver: boolean;
  flagRaisedHeight: number;
  gameTime: number;
}

export function createInitialLevel(stage: number, characterId: CharacterId = 'adventurer'): LevelState {
  const worldWidth = 3400;
  const groundY = 460;

  // Player initial config
  const player: Player = {
    x: 60,
    y: groundY - 48,
    vx: 0,
    vy: 0,
    width: 34,
    height: 44,
    isGrounded: true,
    facing: 'right',
    animState: 'idle',
    walkTimer: 0,
    walkFrame: 0,
    invulnerableTimer: 0,
    isDead: false,
  };

  // Base ground blocks
  const blocks: Block[] = [
    { x: 0, y: groundY, width: worldWidth, height: 140, type: 'ground' }
  ];

  // Floating brick platforms across the 5 zones
  const brickPlatforms = [
    // Zone 1
    { x: 200, y: 360, width: 90, height: 28 },
    { x: 340, y: 300, width: 120, height: 28 },
    // Zone 2
    { x: 740, y: 350, width: 100, height: 28 },
    { x: 890, y: 280, width: 140, height: 28 },
    { x: 1080, y: 340, width: 90, height: 28 },
    // Zone 3
    { x: 1420, y: 360, width: 110, height: 28 },
    { x: 1580, y: 290, width: 130, height: 28 },
    { x: 1760, y: 330, width: 100, height: 28 },
    // Zone 4
    { x: 2080, y: 360, width: 120, height: 28 },
    { x: 2260, y: 280, width: 140, height: 28 },
    { x: 2440, y: 340, width: 100, height: 28 },
    // Zone 5
    { x: 2720, y: 340, width: 130, height: 28 },
    { x: 2900, y: 270, width: 150, height: 28 },
  ];

  brickPlatforms.forEach(p => {
    blocks.push({ ...p, type: 'brick' });
  });

  // 5 Question Gates placed at boundaries of each zone
  // Gate heights block the entire vertical way so players must answer!
  const gateXCoords = [560, 1260, 1920, 2580, 3100];
  const stageQuestionOffset = (stage - 1) * 5;
  const gates: QuestionGate[] = gateXCoords.map((gx, idx) => ({
    id: idx + 1,
    gateIndex: idx,
    x: gx,
    y: 0,
    width: 44,
    height: groundY, // spans from ceiling to ground
    questionId: stageQuestionOffset + idx + 1,
    isOpened: false,
  }));

  // Checkpoint pipes (at zone 2 and zone 4)
  const pipes: PipeCheckpoint[] = [
    { id: 1, x: 1360, y: groundY - 60, width: 48, height: 60, isActivated: false },
    { id: 2, x: 2680, y: groundY - 60, width: 48, height: 60, isActivated: false },
  ];

  // Enemies (brown mushroom & purple spiky crawler)
  const enemies: Enemy[] = [
    // Zone 1
    { id: 1, type: 'mushroom', x: 380, y: groundY - 32, vx: -1.0, width: 32, height: 32, minX: 220, maxX: 520, isDead: false, squishTimer: 0 },
    // Zone 2
    { id: 2, type: 'spike', x: 800, y: groundY - 30, vx: 1.1, width: 32, height: 30, minX: 680, maxX: 960, isDead: false, squishTimer: 0 },
    { id: 3, type: 'mushroom', x: 1040, y: groundY - 32, vx: -1.2, width: 32, height: 32, minX: 980, maxX: 1220, isDead: false, squishTimer: 0 },
    // Zone 3
    { id: 4, type: 'spike', x: 1520, y: groundY - 30, vx: -1.2, width: 32, height: 30, minX: 1400, maxX: 1680, isDead: false, squishTimer: 0 },
    { id: 5, type: 'mushroom', x: 1780, y: groundY - 32, vx: 1.2, width: 32, height: 32, minX: 1700, maxX: 1890, isDead: false, squishTimer: 0 },
    // Zone 4
    { id: 6, type: 'spike', x: 2160, y: groundY - 30, vx: 1.3, width: 32, height: 30, minX: 2040, maxX: 2320, isDead: false, squishTimer: 0 },
    { id: 7, type: 'mushroom', x: 2420, y: groundY - 32, vx: -1.2, width: 32, height: 32, minX: 2360, maxX: 2540, isDead: false, squishTimer: 0 },
    // Zone 5
    { id: 8, type: 'spike', x: 2800, y: groundY - 30, vx: 1.4, width: 32, height: 30, minX: 2700, maxX: 2980, isDead: false, squishTimer: 0 },
    { id: 9, type: 'mushroom', x: 2950, y: 238, vx: -1.0, width: 32, height: 32, minX: 2900, maxX: 3040, isDead: false, squishTimer: 0 },
  ];

  // Coins along the path and above platforms
  const coins: Coin[] = [
    // Zone 1
    { id: 1, x: 230, y: 320, width: 22, height: 22, collected: false, baseY: 320 },
    { id: 2, x: 260, y: 320, width: 22, height: 22, collected: false, baseY: 320 },
    { id: 3, x: 370, y: 250, width: 22, height: 22, collected: false, baseY: 250 },
    { id: 4, x: 410, y: 250, width: 22, height: 22, collected: false, baseY: 250 },
    // Zone 2
    { id: 5, x: 770, y: 300, width: 22, height: 22, collected: false, baseY: 300 },
    { id: 6, x: 920, y: 230, width: 22, height: 22, collected: false, baseY: 230 },
    { id: 7, x: 960, y: 230, width: 22, height: 22, collected: false, baseY: 230 },
    { id: 8, x: 1000, y: 230, width: 22, height: 22, collected: false, baseY: 230 },
    { id: 9, x: 1120, y: 290, width: 22, height: 22, collected: false, baseY: 290 },
    // Zone 3
    { id: 10, x: 1460, y: 310, width: 22, height: 22, collected: false, baseY: 310 },
    { id: 11, x: 1620, y: 240, width: 22, height: 22, collected: false, baseY: 240 },
    { id: 12, x: 1660, y: 240, width: 22, height: 22, collected: false, baseY: 240 },
    { id: 13, x: 1800, y: 280, width: 22, height: 22, collected: false, baseY: 280 },
    // Zone 4
    { id: 14, x: 2120, y: 310, width: 22, height: 22, collected: false, baseY: 310 },
    { id: 15, x: 2300, y: 230, width: 22, height: 22, collected: false, baseY: 230 },
    { id: 16, x: 2340, y: 230, width: 22, height: 22, collected: false, baseY: 230 },
    { id: 17, x: 2480, y: 290, width: 22, height: 22, collected: false, baseY: 290 },
    // Zone 5
    { id: 18, x: 2760, y: 290, width: 22, height: 22, collected: false, baseY: 290 },
    { id: 19, x: 2930, y: 220, width: 22, height: 22, collected: false, baseY: 220 },
    { id: 20, x: 2980, y: 220, width: 22, height: 22, collected: false, baseY: 220 },
  ];

  // Power Mushrooms (+1 heart / +200 pts)
  const powerups: Powerup[] = [
    { id: 1, x: 940, y: 240, width: 28, height: 28, collected: false, baseY: 240 },
    { id: 2, x: 2310, y: 240, width: 28, height: 28, collected: false, baseY: 240 },
  ];

  // Goal Castle with flagpole
  const castle: CastleGoal = {
    x: 3200,
    y: groundY - 140,
    width: 140,
    height: 140,
    flagY: groundY - 50,
    reached: false,
  };

  return {
    stage,
    characterId,
    worldWidth,
    groundY,
    player,
    checkpointSpawn: { x: 60, y: groundY - 48 },
    blocks,
    enemies,
    coins,
    powerups,
    pipes,
    gates,
    castle,
    particles: [],
    floatingTexts: [],
    score: 0,
    coinsCount: 0,
    lives: 3,
    maxLives: 5,
    timeLeft: 90,
    combo: 0,
    maxCombo: 0,
    activeGate: null,
    isStageClear: false,
    isGameOver: false,
    flagRaisedHeight: 0,
    gameTime: 0,
  };
}

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
}

export function updatePhysics(
  state: LevelState,
  inputs: InputState,
  delta: number,
  onOpenQuiz: (gate: QuestionGate) => void
) {
  if (state.isGameOver || state.isStageClear || state.activeGate) {
    return;
  }

  state.gameTime += delta;
  const p = state.player;

  // Decrease invulnerability timer
  if (p.invulnerableTimer > 0) {
    p.invulnerableTimer = Math.max(0, p.invulnerableTimer - delta);
  }

  // 1. Horizontal movement & friction
  const MOVE_SPEED = 4.2;
  const ACCEL = 0.55;
  const FRICTION = 0.82;

  if (inputs.left && !inputs.right) {
    p.vx = Math.max(p.vx - ACCEL, -MOVE_SPEED);
    p.facing = 'left';
    p.animState = p.isGrounded ? 'walk' : 'jump';
  } else if (inputs.right && !inputs.left) {
    p.vx = Math.min(p.vx + ACCEL, MOVE_SPEED);
    p.facing = 'right';
    p.animState = p.isGrounded ? 'walk' : 'jump';
  } else {
    p.vx *= FRICTION;
    if (Math.abs(p.vx) < 0.1) p.vx = 0;
    p.animState = p.isGrounded ? 'idle' : 'jump';
  }

  if (p.animState === 'walk') {
    p.walkTimer += delta;
    if (p.walkTimer > 0.12) {
      p.walkFrame = (p.walkFrame + 1) % 4;
      p.walkTimer = 0;
    }
  } else {
    p.walkFrame = 0;
  }

  // 2. Jumping & Gravity
  const GRAVITY = 0.52;
  const JUMP_POWER = -11.6;

  if (inputs.jump && p.isGrounded) {
    p.vy = JUMP_POWER;
    p.isGrounded = false;
    p.animState = 'jump';
    sound.playJump();

    // Small jump dust particles
    for (let i = 0; i < 4; i++) {
      state.particles.push({
        x: p.x + p.width / 2 + (Math.random() - 0.5) * 14,
        y: p.y + p.height,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 1.5,
        color: '#e2e8f0',
        size: 3,
        life: 0.25,
        maxLife: 0.25,
      });
    }
  }

  p.vy += GRAVITY;
  if (p.vy > 12) p.vy = 12;

  // Move X & Check block collisions
  p.x += p.vx;

  // World bounds X
  if (p.x < 10) {
    p.x = 10;
    p.vx = 0;
  }
  if (p.x + p.width > state.worldWidth) {
    p.x = state.worldWidth - p.width;
    p.vx = 0;
  }

  // Block collisions X
  for (const block of state.blocks) {
    if (
      p.x < block.x + block.width &&
      p.x + p.width > block.x &&
      p.y < block.y + block.height &&
      p.y + p.height > block.y
    ) {
      if (p.vx > 0) {
        p.x = block.x - p.width;
        p.vx = 0;
      } else if (p.vx < 0) {
        p.x = block.x + block.width;
        p.vx = 0;
      }
    }
  }

  // Question Gate collisions
  for (const gate of state.gates) {
    if (!gate.isOpened) {
      if (
        p.x < gate.x + gate.width &&
        p.x + p.width > gate.x &&
        p.y < gate.y + gate.height &&
        p.y + p.height > gate.y
      ) {
        // Player touched gate -> Trigger Quiz modal!
        if (p.vx > 0) {
          p.x = gate.x - p.width;
        } else {
          p.x = gate.x + gate.width;
        }
        p.vx = 0;
        state.activeGate = gate;
        onOpenQuiz(gate);
        return;
      }
    }
  }

  // Move Y & Check block collisions
  p.y += p.vy;
  p.isGrounded = false;

  for (const block of state.blocks) {
    if (
      p.x < block.x + block.width &&
      p.x + p.width > block.x &&
      p.y < block.y + block.height &&
      p.y + p.height > block.y
    ) {
      if (p.vy > 0) {
        // Landing on block top
        p.y = block.y - p.height;
        p.vy = 0;
        p.isGrounded = true;
      } else if (p.vy < 0) {
        // Bumping head on block bottom
        p.y = block.y + block.height;
        p.vy = 0;
      }
    }
  }

  // Fall off bottom check
  if (p.y > state.groundY + 100) {
    handlePlayerDamage(state, 1, 'ตกเหว!');
  }

  // 3. Pipe Checkpoints check
  for (const pipe of state.pipes) {
    if (
      p.x + p.width >= pipe.x &&
      p.x <= pipe.x + pipe.width &&
      !pipe.isActivated
    ) {
      pipe.isActivated = true;
      state.checkpointSpawn = { x: pipe.x + 8, y: state.groundY - p.height };
      sound.playCheckpoint();
      addFloatingText(state, pipe.x - 10, pipe.y - 20, '🚩 CHECKPOINT!', '#22c55e');
    }
  }

  // 4. Coins collection
  for (const coin of state.coins) {
    if (!coin.collected) {
      if (
        p.x < coin.x + coin.width &&
        p.x + p.width > coin.x &&
        p.y < coin.y + coin.height &&
        p.y + p.height > coin.y
      ) {
        coin.collected = true;
        state.coinsCount += 1;
        state.score += 50;
        sound.playCoin();
        addFloatingText(state, coin.x, coin.y - 12, '+50', '#fbbf24');
        // Sparkle particles
        for (let i = 0; i < 5; i++) {
          state.particles.push({
            x: coin.x + 10,
            y: coin.y + 10,
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 3,
            color: '#fef08a',
            size: 3,
            life: 0.35,
            maxLife: 0.35,
          });
        }
      }
    }
  }

  // 5. Powerups (Red Mushroom)
  for (const power of state.powerups) {
    if (!power.collected) {
      if (
        p.x < power.x + power.width &&
        p.x + p.width > power.x &&
        p.y < power.y + power.height &&
        p.y + p.height > power.y
      ) {
        power.collected = true;
        state.lives = Math.min(state.maxLives, state.lives + 1);
        state.score += 200;
        sound.playMushroom();
        addFloatingText(state, power.x - 10, power.y - 15, '❤️ +1 UP!', '#ef4444');
      }
    }
  }

  // 6. Enemies update & collisions
  for (const enemy of state.enemies) {
    if (enemy.isDead) {
      if (enemy.squishTimer > 0) {
        enemy.squishTimer -= delta;
      }
      continue;
    }

    // Patrol back and forth
    enemy.x += enemy.vx;
    if (enemy.x <= enemy.minX) {
      enemy.x = enemy.minX;
      enemy.vx = Math.abs(enemy.vx);
    } else if (enemy.x + enemy.width >= enemy.maxX) {
      enemy.x = enemy.maxX - enemy.width;
      enemy.vx = -Math.abs(enemy.vx);
    }

    // Collision with player
    if (
      p.x < enemy.x + enemy.width &&
      p.x + p.width > enemy.x &&
      p.y < enemy.y + enemy.height &&
      p.y + p.height > enemy.y
    ) {
      // Check if player jumped onto enemy from above
      const isStomping = p.vy > 0 && p.y + p.height - p.vy <= enemy.y + 12;

      if (isStomping && enemy.type === 'mushroom') {
        // Squish mushroom!
        enemy.isDead = true;
        enemy.squishTimer = 0.5;
        p.vy = -7.5; // Bounce player
        state.score += 150;
        sound.playStomp();
        addFloatingText(state, enemy.x, enemy.y - 10, '+150', '#a3e635');
      } else {
        // Player takes damage!
        if (p.invulnerableTimer <= 0) {
          handlePlayerDamage(state, 1, enemy.type === 'spike' ? 'โดนหนาม!' : 'ชนศัตรู!');
        }
      }
    }
  }

  // 7. Goal Castle Check
  if (
    !state.castle.reached &&
    p.x >= state.castle.x &&
    p.x <= state.castle.x + state.castle.width
  ) {
    state.castle.reached = true;
    state.isStageClear = true;
    sound.playVictory();
    // Add remaining time bonus to score
    const timeBonus = Math.floor(state.timeLeft) * 20;
    state.score += timeBonus;
  }

  // Update particles
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const pt = state.particles[i];
    pt.x += pt.vx;
    pt.y += pt.vy;
    pt.vy += pt.gravity ?? 0.15;
    pt.life -= delta;
    if (pt.life <= 0) {
      state.particles.splice(i, 1);
    }
  }

  // Update floating text
  for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
    const ft = state.floatingTexts[i];
    ft.y -= 0.6;
    ft.life -= delta;
    if (ft.life <= 0) {
      state.floatingTexts.splice(i, 1);
    }
  }
}

export function handlePlayerDamage(state: LevelState, amount = 1, reason = 'บาดเจ็บ!') {
  state.lives -= amount;
  state.combo = 0; // combo reset
  sound.playHit();

  addFloatingText(state, state.player.x, state.player.y - 20, reason, '#ef4444');

  if (state.lives <= 0) {
    state.isGameOver = true;
    return;
  }

  // Respawn at checkpoint with temporary invulnerability
  state.player.x = state.checkpointSpawn.x;
  state.player.y = state.checkpointSpawn.y;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.invulnerableTimer = 1.8; // 1.8 seconds invulnerability flash
}

export function triggerGateShatter(state: LevelState, gate: QuestionGate) {
  gate.isOpened = true;
  gate.shatterParticlesTriggered = true;

  // Huge burst of golden explosion particles & coins
  for (let i = 0; i < 40; i++) {
    state.particles.push({
      x: gate.x + gate.width / 2 + (Math.random() - 0.5) * gate.width,
      y: Math.random() * (gate.height - 40) + 40,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 7 - 2,
      color: ['#fbbf24', '#f59e0b', '#d97706', '#fef08a', '#ffffff'][Math.floor(Math.random() * 5)],
      size: Math.random() * 6 + 4,
      life: 0.9,
      maxLife: 0.9,
      gravity: 0.25,
    });
  }

  sound.playCorrect();
  addFloatingText(state, gate.x - 20, 200, '✨ GATE OPEN! +300', '#fbbf24');
}

export function addFloatingText(state: LevelState, x: number, y: number, text: string, color: string) {
  state.floatingTexts.push({
    id: Math.random(),
    x,
    y,
    text,
    color,
    life: 1.0,
    maxLife: 1.0,
  });
}
