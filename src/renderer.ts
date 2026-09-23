import { LevelState } from './gameEngine';

export class CanvasPixelRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.ctx.imageSmoothingEnabled = false;
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.ctx.imageSmoothingEnabled = false;
  }

  public render(state: LevelState, cameraX: number) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Parallax Background
    this.drawSkyAndParallax(state.stage, cameraX, state.gameTime);

    // Save context for camera scrolling
    ctx.save();
    ctx.translate(-Math.floor(cameraX), 0);

    // 2. Draw Environment Tiles (Ground & Brick Platforms)
    this.drawBlocks(state);

    // 3. Draw Checkpoint Pipes
    this.drawPipes(state);

    // 4. Draw Goal Castle & Flag
    this.drawCastle(state);

    // 5. Draw Question Gates
    this.drawGates(state);

    // 6. Draw Items (Coins & Power Mushrooms)
    this.drawItems(state);

    // 7. Draw Enemies
    this.drawEnemies(state);

    // 8. Draw Player
    this.drawPlayer(state);

    // 9. Draw Particles & Floating Texts
    this.drawParticles(state);
    this.drawFloatingTexts(state);

    ctx.restore();
  }

  // --- PARALLAX BACKGROUND ---
  private drawSkyAndParallax(stage: number, cameraX: number, time: number) {
    const ctx = this.ctx;

    // Vibrant Sky Gradient based on stage (Bright, lively, playful!)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    if (stage === 1) {
      // Stage 1: Bright Cheerful Sunny Day (Cyan to Baby Blue to Warm Horizon)
      skyGrad.addColorStop(0, '#38bdf8');
      skyGrad.addColorStop(0.5, '#7dd3fc');
      skyGrad.addColorStop(1, '#e0f2fe');
    } else if (stage === 2) {
      // Stage 2: Joyful Candy Sunset (Bright Coral Pink to Peach to Warm Golden Yellow)
      skyGrad.addColorStop(0, '#f472b6');
      skyGrad.addColorStop(0.5, '#fb923c');
      skyGrad.addColorStop(1, '#fef08a');
    } else {
      // Stage 3: Magical Enchanted Sky (Vibrant Indigo to Electric Purple to Bright Cyan Horizon)
      skyGrad.addColorStop(0, '#6366f1');
      skyGrad.addColorStop(0.5, '#a855f7');
      skyGrad.addColorStop(1, '#67e8f9');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Stage 3 magical twinkling stars
    if (stage === 3) {
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 40; i++) {
        const starX = (i * 73 + time * 3) % this.width;
        const starY = (i * 37) % (this.height * 0.6);
        const sz = (i % 3 === 0) ? 3 : 2;
        ctx.fillRect(starX, starY, sz, sz);
        // Golden glint
        if (i % 4 === 0) {
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(starX - 1, starY, sz + 2, 1);
          ctx.fillRect(starX, starY - 1, 1, sz + 2);
          ctx.fillStyle = '#ffffff';
        }
      }
    }

    // Friendly Sun / Magic Moon in the sky
    const sunX = this.width - 90;
    const sunY = 70;
    ctx.fillStyle = stage === 3 ? '#fef08a' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = stage === 3 ? '#ffffff' : '#fde047';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
    ctx.fill();

    // Distant Cheerful Pixel Mountains (Bright pastel mountains)
    const mountainOffset = (cameraX * 0.12) % 360;
    const mColor = stage === 3 ? '#818cf8' : (stage === 2 ? '#fb7185' : '#60a5fa');
    const mShade = stage === 3 ? '#6366f1' : (stage === 2 ? '#f43f5e' : '#3b82f6');

    ctx.fillStyle = mColor;
    for (let x = -360; x < this.width + 360; x += 180) {
      const mx = x - mountainOffset;
      const my = this.height * 0.65;
      // Draw pixelated triangular mountain
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx + 90, my - 130);
      ctx.lineTo(mx + 180, my);
      ctx.fill();

      // Shadow side
      ctx.fillStyle = mShade;
      ctx.beginPath();
      ctx.moveTo(mx + 90, my - 130);
      ctx.lineTo(mx + 180, my);
      ctx.lineTo(mx + 90, my);
      ctx.fill();
      ctx.fillStyle = mColor;
    }

    // Fluffy Parallax Clouds (Crisp white with cheerful shadows)
    const cloudLayer1 = (cameraX * 0.2 + time * 14) % (this.width + 200);
    const cloudLayer2 = (cameraX * 0.35 + time * 22) % (this.width + 300);

    this.drawPixelCloud(this.width - cloudLayer1, 50, 1.2, '#ffffff');
    this.drawPixelCloud(this.width - cloudLayer1 + 450, 85, 0.9, '#ffffff');
    this.drawPixelCloud(this.width - cloudLayer2 + 200, 115, 1.4, 'rgba(255,255,255,0.92)');
  }

  private drawPixelCloud(x: number, y: number, scale: number, color: string) {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    const s = 10 * scale;

    // Pixelated cloud blocks
    ctx.fillRect(x + s * 2, y, s * 4, s * 2);
    ctx.fillRect(x + s, y + s, s * 6, s * 2);
    ctx.fillRect(x, y + s * 2, s * 8, s * 2);
    ctx.fillRect(x + s * 4, y - s, s * 3, s * 2);
  }

  // --- ENVIRONMENT: GROUND & BRICKS ---
  private drawBlocks(state: LevelState) {
    const ctx = this.ctx;

    for (const b of state.blocks) {
      if (b.type === 'ground') {
        // Bright Vibrant Green Grass with Colorful Little Flowers
        const grassH = 14;
        // Grass top
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(b.x, b.y, b.width, grassH);

        // Grass blade highlights (Lively lime green)
        ctx.fillStyle = '#86efac';
        for (let x = b.x; x < b.x + b.width; x += 12) {
          ctx.fillRect(x, b.y, 6, 4);
        }

        // Cute Little Pixel Flowers on the grass! (Red, Yellow, Cyan, White)
        for (let x = b.x + 14; x < b.x + b.width; x += 36) {
          const flowerColor = ['#f43f5e', '#facc15', '#38bdf8', '#ffffff'][(x / 36) % 4];
          ctx.fillStyle = flowerColor;
          ctx.fillRect(x, b.y - 4, 4, 4);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(x + 1, b.y - 3, 2, 2);
          // Flower stem
          ctx.fillStyle = '#16a34a';
          ctx.fillRect(x + 1, b.y, 2, 3);
        }

        // Fresh green trim
        ctx.fillStyle = '#15803d';
        ctx.fillRect(b.x, b.y + grassH - 3, b.width, 3);

        // Rich Warm Terracotta Earth
        ctx.fillStyle = '#9a3412';
        ctx.fillRect(b.x, b.y + grassH, b.width, b.height - grassH);

        // Warm earthy pebbles & specks
        ctx.fillStyle = '#c2410c';
        for (let x = b.x; x < b.x + b.width; x += 28) {
          for (let y = b.y + grassH + 6; y < b.y + b.height; y += 22) {
            ctx.fillRect(x + 4, y, 6, 6);
            ctx.fillRect(x + 16, y + 10, 8, 4);
          }
        }
      } else if (b.type === 'brick') {
        // Cheerful Sunny Orange-Amber Brick Platform
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(b.x, b.y, b.width, b.height);

        // Golden top highlight
        ctx.fillStyle = '#fde047';
        ctx.fillRect(b.x, b.y, b.width, 3);

        // Warm brick border & bevel
        ctx.fillStyle = '#c2410c';
        ctx.fillRect(b.x, b.y + b.height - 3, b.width, 3);
        ctx.fillRect(b.x + b.width - 3, b.y, 3, b.height);

        // Mortar lines (bright warm line)
        ctx.fillStyle = '#7c2d12';
        const brickW = 24;
        for (let x = b.x; x < b.x + b.width; x += brickW) {
          ctx.fillRect(x, b.y, 2, b.height);
        }
        ctx.fillRect(b.x, b.y + Math.floor(b.height / 2), b.width, 2);
      }
    }
  }

  // --- CHECKPOINT PIPES ---
  private drawPipes(state: LevelState) {
    const ctx = this.ctx;

    for (const p of state.pipes) {
      const topRimH = 16;
      const rimOverlap = 4;

      // Pipe Rim (Bright emerald green)
      const rimX = p.x - rimOverlap;
      const rimW = p.width + rimOverlap * 2;
      ctx.fillStyle = p.isActivated ? '#10b981' : '#16a34a';
      ctx.fillRect(rimX, p.y, rimW, topRimH);

      // Rim Highlight (Bright Mint)
      ctx.fillStyle = p.isActivated ? '#a7f3d0' : '#4ade80';
      ctx.fillRect(rimX + 4, p.y, 6, topRimH);
      ctx.fillStyle = '#065f46';
      ctx.fillRect(rimX + rimW - 6, p.y, 6, topRimH);

      // Pipe Stem
      ctx.fillStyle = p.isActivated ? '#059669' : '#15803d';
      ctx.fillRect(p.x, p.y + topRimH, p.width, p.height - topRimH);

      // Stem Highlight
      ctx.fillStyle = p.isActivated ? '#6ee7b7' : '#22c55e';
      ctx.fillRect(p.x + 4, p.y + topRimH, 6, p.height - topRimH);
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(p.x + p.width - 6, p.y + topRimH, 6, p.height - topRimH);

      // Checkpoint Flag / Marker on activated pipe
      if (p.isActivated) {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(p.x + p.width / 2 - 2, p.y - 20, 4, 20);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(p.x + p.width / 2 + 2, p.y - 20, 16, 10);
      }
    }
  }

  // --- QUESTION GATES ---
  private drawGates(state: LevelState) {
    const ctx = this.ctx;
    const time = state.gameTime;

    for (const g of state.gates) {
      if (g.isOpened) {
        // Opened gate: faded glowing gate posts on top and ground
        ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
        ctx.fillRect(g.x, 0, g.width, g.height);
        continue;
      }

      // Barrier Column (100% height from ceiling to ground)
      // Pulsating magical energy column
      const pulse = Math.sin(time * 5 + g.id) * 0.15 + 0.85;

      ctx.fillStyle = `rgba(245, 158, 11, ${pulse * 0.35})`;
      ctx.fillRect(g.x - 4, 0, g.width + 8, g.height);

      // Vertical energy beams
      ctx.fillStyle = `rgba(254, 240, 138, ${pulse * 0.7})`;
      ctx.fillRect(g.x + 6, 0, 4, g.height);
      ctx.fillRect(g.x + g.width - 10, 0, 4, g.height);

      // Giant Golden Question Block sitting in center of barrier
      const blockH = 56;
      const blockY = state.groundY - 110;
      const blockX = g.x - 6;
      const blockW = g.width + 12;

      // Outer gold box
      ctx.fillStyle = '#d97706';
      ctx.fillRect(blockX, blockY, blockW, blockH);

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(blockX + 4, blockY + 4, blockW - 8, blockH - 8);

      // Inner highlight
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(blockX + 4, blockY + 4, blockW - 8, 4);
      ctx.fillRect(blockX + 4, blockY + 4, 4, blockH - 8);

      // 4 Corner bolts
      ctx.fillStyle = '#78350f';
      ctx.fillRect(blockX + 6, blockY + 6, 4, 4);
      ctx.fillRect(blockX + blockW - 10, blockY + 6, 4, 4);
      ctx.fillRect(blockX + 6, blockY + blockH - 10, 4, 4);
      ctx.fillRect(blockX + blockW - 10, blockY + blockH - 10, 4, 4);

      // Pixelated '?' mark
      ctx.fillStyle = '#451a03';
      const qx = blockX + Math.floor(blockW / 2) - 8;
      const qy = blockY + 12;

      ctx.fillRect(qx, qy, 16, 4);
      ctx.fillRect(qx + 12, qy + 4, 4, 8);
      ctx.fillRect(qx + 6, qy + 12, 8, 4);
      ctx.fillRect(qx + 6, qy + 16, 4, 6);
      ctx.fillRect(qx + 6, qy + 26, 4, 5);

      // Floating badge: "GATE 1/5"
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(blockX - 6, blockY - 24, blockW + 12, 18);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 11px Chakra Petch, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`ด่านที่ ${g.gateIndex + 1}/5`, blockX + blockW / 2, blockY - 10);
    }
  }

  // --- ITEMS: COINS & POWERUPS ---
  private drawItems(state: LevelState) {
    const ctx = this.ctx;
    const time = state.gameTime;

    // Coins (animated 4-frame rotating 3D coin)
    for (const c of state.coins) {
      if (c.collected) continue;

      const frame = Math.floor(time * 8 + c.id) % 4;
      const floatY = c.baseY + Math.sin(time * 4 + c.id) * 4;

      ctx.save();
      ctx.translate(c.x + c.width / 2, floatY + c.height / 2);

      let scaleX = 1.0;
      if (frame === 1 || frame === 3) scaleX = 0.55;
      if (frame === 2) scaleX = 0.15;

      ctx.scale(scaleX, 1.0);

      // Outer gold rim
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      // Inner yellow
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      // Shiny core
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-2, -5, 4, 10);

      ctx.restore();
    }

    // Power Mushroom (Red cap with white spots)
    for (const m of state.powerups) {
      if (m.collected) continue;

      const floatY = m.baseY + Math.sin(time * 3 + m.id) * 3;
      const x = m.x;
      const y = floatY;

      // Stem (white/cream)
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(x + 6, y + 14, 16, 12);
      // Stem eyes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x + 9, y + 18, 2, 4);
      ctx.fillRect(x + 17, y + 18, 2, 4);

      // Red Cap
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(x + 14, y + 14, 14, Math.PI, 0);
      ctx.fill();

      // White polka dots
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x + 14, y + 6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 5, y + 11, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 23, y + 11, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- ENEMIES ---
  private drawEnemies(state: LevelState) {
    const ctx = this.ctx;

    for (const e of state.enemies) {
      if (e.isDead && e.squishTimer <= 0) continue;

      if (e.type === 'mushroom') {
        // Goomba-style Brown Mushroom
        if (e.isDead) {
          // Squished flat frame
          ctx.fillStyle = '#92400e';
          ctx.fillRect(e.x, e.y + 20, e.width, 12);
          ctx.fillStyle = '#fef3c7';
          ctx.fillRect(e.x + 4, e.y + 24, e.width - 8, 8);
          continue;
        }

        // Body / Cap
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.arc(e.x + e.width / 2, e.y + 14, 15, Math.PI, 0);
        ctx.fill();

        // Stem
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(e.x + 7, e.y + 14, 18, 11);

        // Angry Eyes & Eyebrows
        ctx.fillStyle = '#000000';
        ctx.fillRect(e.x + 9, e.y + 17, 3, 4);
        ctx.fillRect(e.x + 20, e.y + 17, 3, 4);
        // Eyebrows slanted inward
        ctx.fillRect(e.x + 8, e.y + 14, 5, 2);
        ctx.fillRect(e.x + 19, e.y + 14, 5, 2);

        // Walking Feet (alternating)
        const walkWobble = Math.sin(state.gameTime * 12) * 2;
        ctx.fillStyle = '#451a03';
        ctx.fillRect(e.x + 3, e.y + 25 + walkWobble, 10, 7);
        ctx.fillRect(e.x + 19, e.y + 25 - walkWobble, 10, 7);
      } else if (e.type === 'spike') {
        // Purple Spiky Crawler
        ctx.fillStyle = '#7e22ce';
        ctx.fillRect(e.x + 3, e.y + 12, e.width - 6, 18);

        // Spikes on head
        ctx.fillStyle = '#c084fc';
        for (let sx = e.x + 4; sx <= e.x + e.width - 8; sx += 8) {
          ctx.beginPath();
          ctx.moveTo(sx, e.y + 12);
          ctx.lineTo(sx + 4, e.y);
          ctx.lineTo(sx + 8, e.y + 12);
          ctx.fill();
        }

        // Menacing glowing yellow eyes
        ctx.fillStyle = '#fef08a';
        const facingOffset = e.vx > 0 ? 3 : -1;
        ctx.fillRect(e.x + 8 + facingOffset, e.y + 18, 4, 4);
        ctx.fillRect(e.x + 18 + facingOffset, e.y + 18, 4, 4);
      }
    }
  }

  // --- CASTLE GOAL & FLAG ---
  private drawCastle(state: LevelState) {
    const ctx = this.ctx;
    const c = state.castle;

    // Bright Fairytale Castle (Ivory white stones with colorful royal trims)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(c.x + 20, c.y + 30, c.width - 20, c.height - 30);

    // Castle side shadow / contour
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(c.x + c.width - 8, c.y + 30, 8, c.height - 30);

    // Castle Battlements (Cheerful coral-red crenellations)
    const crenW = 16;
    for (let x = c.x + 20; x < c.x + c.width; x += crenW * 1.5) {
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(x, c.y + 14, crenW, 16);
      ctx.fillStyle = '#fb7185';
      ctx.fillRect(x, c.y + 14, crenW, 3);
    }

    // Castle Doorway (Royal arched portal with warm wooden door)
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(c.x + 70, c.y + 85, 20, Math.PI, 0);
    ctx.fillRect(c.x + 50, c.y + 85, 40, 55);
    ctx.fill();

    // Wooden door inside
    ctx.fillStyle = '#d97706';
    ctx.fillRect(c.x + 54, c.y + 88, 32, 52);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(c.x + 78, c.y + 110, 4, 4); // Golden door handle

    // Tall Flag Pole (Bright gold/silver pole)
    const poleX = c.x + 5;
    const poleTopY = c.y - 60;
    const poleBottomY = state.groundY;

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(poleX, poleTopY, 6, poleBottomY - poleTopY);

    // Gold Finial Ball at top of pole
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(poleX + 3, poleTopY, 7, 0, Math.PI * 2);
    ctx.fill();

    // Flag animation: smooth rise when reached!
    const targetFlagY = c.reached ? poleTopY + 4 : state.groundY - 60;
    if (c.reached && c.flagY > targetFlagY) {
      c.flagY = Math.max(targetFlagY, c.flagY - 3.5);
    }

    // Flag (Vibrant Blue & White Flag with golden edge)
    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(poleX + 6, c.flagY, 32, 22);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(poleX + 12, c.flagY + 4, 20, 14);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(poleX + 36, c.flagY, 2, 22);
  }

  // --- PLAYER CHARACTER ---
  private drawPlayer(state: LevelState) {
    const ctx = this.ctx;
    const p = state.player;
    const charId = state.characterId || 'adventurer';

    // Flash transparency when invulnerable
    if (p.invulnerableTimer > 0 && Math.floor(state.gameTime * 20) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(p.x + p.width / 2, p.y + p.height / 2);

    if (p.facing === 'left') {
      ctx.scale(-1, 1);
    }

    const halfH = p.height / 2;

    if (charId === 'ribbon_girl') {
      // 1. Brown hair & Ponytail (bobs with movement)
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-10, -halfH + 2, 20, 10);
      // Ponytail tail on the back
      const ponyBob = p.animState === 'walk' ? (p.walkFrame % 2 === 0 ? 2 : 0) : 0;
      ctx.fillRect(-14, -halfH + 3 + ponyBob, 5, 8);

      // Pink Ribbon Bow
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-6, -halfH - 2, 12, 5);
      ctx.fillStyle = '#fb7185';
      ctx.fillRect(-2, -halfH - 4, 4, 4); // Knot

      // Face
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(-9, -halfH + 9, 18, 13);

      // Cute eye
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(2, -halfH + 13, 3, 4);

      // Blushing cheek
      ctx.fillStyle = '#fda4af';
      ctx.fillRect(-1, -halfH + 16, 4, 3);

      // Smile
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(2, -halfH + 19, 4, 2);

      // Pastel Yellow Shirt
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-10, -halfH + 22, 20, 12);

      // Mint Green Overalls
      ctx.fillStyle = '#10b981';
      ctx.fillRect(-9, -halfH + 29, 18, 9);
      // Straps
      ctx.fillRect(-6, -halfH + 22, 3, 7);
      ctx.fillRect(3, -halfH + 22, 3, 7);

      // Shoes (Pink sneakers)
      ctx.fillStyle = '#f43f5e';
      this.drawCharacterBoots(ctx, p, halfH);

    } else if (charId === 'cat_hero') {
      // Cat hood head
      ctx.fillStyle = '#f97316';
      ctx.fillRect(-10, -halfH + 2, 20, 10);

      // 2 Pointy Cat Ears
      ctx.fillRect(-9, -halfH - 5, 5, 7);
      ctx.fillRect(4, -halfH - 5, 5, 7);
      ctx.fillStyle = '#fda4af'; // Pink inner ear
      ctx.fillRect(-8, -halfH - 3, 3, 4);
      ctx.fillRect(5, -halfH - 3, 3, 4);

      // Cat Tail behind!
      ctx.fillStyle = '#ea580c';
      const tailWag = Math.sin(state.gameTime * 8) * 3;
      ctx.fillRect(-14, halfH - 12 + tailWag, 4, 8);
      ctx.fillRect(-16, halfH - 16 + tailWag, 4, 5);

      // Face
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(-9, -halfH + 9, 18, 13);

      // Cat Eye (Green emerald)
      ctx.fillStyle = '#15803d';
      ctx.fillRect(2, -halfH + 13, 3, 4);

      // Cat Whisker spots
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(-4, -halfH + 16, 3, 1);
      ctx.fillRect(4, -halfH + 16, 3, 1);

      // Cyan Fluffy Scarf
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(-11, -halfH + 21, 22, 5);
      // Scarf tails waving
      ctx.fillStyle = '#0891b2';
      ctx.fillRect(-13, -halfH + 23, 4, 8);

      // Blue Jacket
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(-10, -halfH + 25, 20, 8);

      // Dark Indigo Pants
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-9, -halfH + 33, 18, 5);

      // Orange paws / boots
      ctx.fillStyle = '#f97316';
      this.drawCharacterBoots(ctx, p, halfH);

    } else if (charId === 'wizard') {
      // Pointed Wizard Hat (Purple)
      ctx.fillStyle = '#7c3aed';
      // Hat brim
      ctx.fillRect(-12, -halfH + 2, 24, 5);
      // Hat cone
      ctx.beginPath();
      ctx.moveTo(-9, -halfH + 2);
      ctx.lineTo(2, -halfH - 14);
      ctx.lineTo(8, -halfH + 2);
      ctx.fill();

      // Golden Star buckle on hat
      ctx.fillStyle = '#facc15';
      ctx.fillRect(1, -halfH - 1, 4, 4);

      // Magic glint sparkle around hat
      const glintX = Math.sin(state.gameTime * 4) * 12;
      const glintY = -halfH - 10 + Math.cos(state.gameTime * 4) * 4;
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(glintX, glintY, 3, 3);

      // Blonde hair tuft
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(-9, -halfH + 7, 5, 4);

      // Face
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(-9, -halfH + 7, 18, 14);

      // Purple Magic Eye
      ctx.fillStyle = '#6d28d9';
      ctx.fillRect(2, -halfH + 12, 3, 4);

      // Smile
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(2, -halfH + 18, 4, 2);

      // Starry Purple Cloak / Robe
      ctx.fillStyle = '#4f46e5';
      ctx.fillRect(-11, -halfH + 21, 22, 16);
      // Gem clasp
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-1, -halfH + 22, 4, 4);

      // Golden robe trim
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-11, -halfH + 34, 22, 3);

      // Golden Wizard Shoes
      ctx.fillStyle = '#d97706';
      this.drawCharacterBoots(ctx, p, halfH);

    } else if (charId === 'robot') {
      // Antenna with blinking yellow bulb
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-1, -halfH - 8, 3, 9);
      ctx.fillStyle = (Math.floor(state.gameTime * 6) % 2 === 0) ? '#fde047' : '#f59e0b';
      ctx.fillRect(-3, -halfH - 12, 7, 5);

      // Metallic Cyan Robot Head
      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(-10, -halfH + 1, 20, 19);

      // Head side bolts
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-12, -halfH + 7, 3, 5);
      ctx.fillRect(9, -halfH + 7, 3, 5);

      // Green Glowing Visor Eyes
      ctx.fillStyle = '#15803d';
      ctx.fillRect(-6, -halfH + 7, 14, 6);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(-4, -halfH + 8, 4, 4);
      ctx.fillRect(2, -halfH + 8, 4, 4);

      // Speaker mouth grill
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(-4, -halfH + 15, 10, 3);

      // Steel Cyan Torso
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-10, -halfH + 21, 20, 14);

      // Battery / Power LED gauges on chest
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(-6, -halfH + 24, 4, 3);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-1, -halfH + 24, 4, 3);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(4, -halfH + 24, 4, 3);

      // Dark Grey Joints & Metallic Boots
      ctx.fillStyle = '#334155';
      this.drawCharacterBoots(ctx, p, halfH);

    } else {
      // Default: 'adventurer'
      // 1. Blue Cap / Helmet
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(-10, -halfH, 20, 10);
      // Cap visor
      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(4, -halfH + 6, 9, 4);

      // 2. Head / Face (warm skin tone)
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(-9, -halfH + 9, 18, 13);

      // Eye
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(2, -halfH + 13, 3, 4);

      // Cute Cheerful Smile
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(1, -halfH + 19, 4, 2);

      // 3. Red Shirt
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-10, -halfH + 22, 20, 12);

      // Backpack
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-14, -halfH + 23, 5, 10);

      // 4. Overalls / Pants (Navy)
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(-9, -halfH + 32, 18, 6);

      // Boots
      ctx.fillStyle = '#451a03';
      this.drawCharacterBoots(ctx, p, halfH);
    }

    ctx.restore();
  }

  private drawCharacterBoots(ctx: CanvasRenderingContext2D, p: any, halfH: number) {
    if (p.animState === 'walk') {
      const f = p.walkFrame;
      if (f === 0) {
        ctx.fillRect(-9, halfH - 8, 8, 8);
        ctx.fillRect(1, halfH - 6, 8, 6);
      } else if (f === 1) {
        ctx.fillRect(-8, halfH - 6, 7, 6);
        ctx.fillRect(2, halfH - 8, 8, 8);
      } else if (f === 2) {
        ctx.fillRect(-6, halfH - 7, 7, 7);
        ctx.fillRect(3, halfH - 7, 7, 7);
      } else {
        ctx.fillRect(-9, halfH - 6, 8, 6);
        ctx.fillRect(1, halfH - 8, 8, 8);
      }
    } else if (p.animState === 'jump') {
      // Tucked jumping legs
      ctx.fillRect(-9, halfH - 11, 7, 6);
      ctx.fillRect(2, halfH - 11, 7, 6);
    } else {
      // Idle standing
      ctx.fillRect(-9, halfH - 6, 8, 6);
      ctx.fillRect(1, halfH - 6, 8, 6);
    }
  }

  // --- PARTICLES ---
  private drawParticles(state: LevelState) {
    const ctx = this.ctx;
    for (const pt of state.particles) {
      const alpha = pt.life / pt.maxLife;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
      ctx.restore();
    }
  }

  // --- FLOATING TEXTS ---
  private drawFloatingTexts(state: LevelState) {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = 'bold 13px Chakra Petch, sans-serif';
    ctx.textAlign = 'center';

    for (const ft of state.floatingTexts) {
      const alpha = ft.life / ft.maxLife;
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

      // Black text shadow
      ctx.fillStyle = '#000000';
      ctx.fillText(ft.text, ft.x + 1, ft.y + 1);

      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.restore();
  }
}
