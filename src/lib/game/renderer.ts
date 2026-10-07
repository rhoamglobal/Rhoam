import { GameState, PlayerState, BallState, PitchBounds } from './physics';

export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context from canvas');
    this.ctx = context;
  }

  public render(gameState: GameState, localPlayerId: string | null) {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    const { pitch, ball, players } = gameState;

    // Clear background (Street Pitch Surrounding Dark Asphalt)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, height);

    // Calculate scaling to fit pitch nicely inside canvas view
    const scaleX = width / pitch.width;
    const scaleY = height / pitch.height;
    const scale = Math.min(scaleX, scaleY) * 0.95;

    ctx.save();
    ctx.translate((width - pitch.width * scale) / 2, (height - pitch.height * scale) / 2);
    ctx.scale(scale, scale);

    // Render 3D / 2.5D Street Turf Pitch
    this.renderPitch(pitch);

    // Render Goal Posts & Nets (Behind/Depth sorting)
    this.renderGoals(pitch);

    // Collect all entities for 2.5D Y-sorting (Depth rendering)
    const renderables: Array<{ type: 'player' | 'ball'; y: number; data: PlayerState | BallState }> = [];

    Object.values(players).forEach((p) => {
      renderables.push({ type: 'player', y: p.y, data: p });
    });
    renderables.push({ type: 'ball', y: ball.y, data: ball });

    renderables.sort((a, b) => a.y - b.y);

    // Render Y-sorted Entities
    renderables.forEach((item) => {
      if (item.type === 'player') {
        const player = item.data as PlayerState;
        this.renderPlayer(player, player.id === localPlayerId);
      } else {
        const b = item.data as BallState;
        this.renderBall(b);
      }
    });

    ctx.restore();
  }

  private renderPitch(pitch: PitchBounds) {
    const ctx = this.ctx;
    const pad = pitch.padding;
    const pWidth = pitch.width - pad * 2;
    const pHeight = pitch.height - pad * 2;

    // Street Pitch Turf Green Base
    const pitchGrad = ctx.createLinearGradient(pad, pad, pad + pWidth, pad + pHeight);
    pitchGrad.addColorStop(0, '#15803d');
    pitchGrad.addColorStop(1, '#166534');

    ctx.fillStyle = pitchGrad;
    ctx.beginPath();
    ctx.roundRect(pad, pad, pWidth, pHeight, 16);
    ctx.fill();

    // Pitch Stripes (Pseudo 3D turf effect)
    const stripeCount = 8;
    const stripeW = pWidth / stripeCount;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let i = 0; i < stripeCount; i += 2) {
      ctx.fillRect(pad + i * stripeW, pad, stripeW, pHeight);
    }

    // Pitch Boundary White Lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(pad, pad, pWidth, pHeight);

    // Center Line
    const centerX = pitch.width / 2;
    const centerY = pitch.height / 2;
    ctx.beginPath();
    ctx.moveTo(centerX, pad);
    ctx.lineTo(centerX, pitch.height - pad);
    ctx.stroke();

    // Center Circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 70, 0, Math.PI * 2);
    ctx.stroke();

    // Center Spot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Penalty / Goal Areas (Monkey Post Style Small Boxes)
    const boxW = 80;
    const boxH = 180;
    const boxY = centerY - boxH / 2;

    // Left Box
    ctx.strokeRect(pad, boxY, boxW, boxH);
    // Right Box
    ctx.strokeRect(pitch.width - pad - boxW, boxY, boxW, boxH);
  }

  private renderGoals(pitch: PitchBounds) {
    const ctx = this.ctx;
    const goalTop = pitch.height / 2 - pitch.goalWidth / 2;
    const goalBottom = pitch.height / 2 + pitch.goalWidth / 2;
    const pad = pitch.padding;

    // Left Monkey Post Goal Net
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;

    ctx.fillRect(pad - pitch.goalDepth, goalTop, pitch.goalDepth, pitch.goalWidth);
    ctx.strokeRect(pad - pitch.goalDepth, goalTop, pitch.goalDepth, pitch.goalWidth);

    // Right Monkey Post Goal Net
    ctx.fillRect(pad + (pitch.width - pad * 2), goalTop, pitch.goalDepth, pitch.goalWidth);
    ctx.strokeRect(pad + (pitch.width - pad * 2), goalTop, pitch.goalDepth, pitch.goalWidth);
  }

  private renderPlayer(player: PlayerState, isLocal: boolean) {
    const ctx = this.ctx;

    // Shadow underneath player (Pseudo-3D effect)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(player.x, player.y + 12, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Player Direction Indicator Ring if local
    if (isLocal) {
      ctx.strokeStyle = '#f59e0b'; // Gold / Yellow
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(player.x, player.y, 22, 0, Math.PI * 2);
      ctx.stroke();

      // Facing Direction Arrow
      const arrowX = player.x + Math.cos(player.angle) * 28;
      const arrowY = player.y + Math.sin(player.angle) * 28;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(arrowX, arrowY, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player Jersey / Body Circle
    ctx.fillStyle = player.team === 'home' ? '#ef4444' : '#3b82f6'; // Red vs Blue
    ctx.beginPath();
    ctx.arc(player.x, player.y, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tackle Effect Burst
    if (player.isTackling) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(player.x, player.y, 26, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Shirt Number or Bot tag
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.isBot ? 'BOT' : `${player.number}`, player.x, player.y);

    // Player Name Tag & Stamina Bar above Player
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px sans-serif';
    ctx.fillText(player.name, player.x, player.y - 24);

    // Mini Stamina Bar
    const barW = 24;
    const barH = 3;
    const barX = player.x - barW / 2;
    const barY = player.y - 18;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX, barY, barW, barH);

    ctx.fillStyle = player.stamina > 30 ? '#22c55e' : '#ef4444';
    ctx.fillRect(barX, barY, (barW * player.stamina) / 100, barH);
  }

  private renderBall(ball: BallState) {
    const ctx = this.ctx;

    // Pseudo-3D Height Lift
    const ballY = ball.y - ball.z;

    // Ball Drop Shadow on Ground
    const shadowAlpha = Math.max(0.1, 0.4 - ball.z * 0.01);
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(ball.x, ball.y + 4, 8 + ball.z * 0.1, 4 + ball.z * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Soccer Ball Base
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ballY, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Soccer Ball Pattern Outline
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Center Pentagon Pattern
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(ball.x, ballY, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}
