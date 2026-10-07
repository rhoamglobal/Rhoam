export interface Vector2D {
  x: number;
  y: number;
}

export type TeamSide = 'home' | 'away';

export interface PlayerState {
  id: string;
  name: string;
  team: TeamSide;
  number: number;
  isBot: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number; // facing angle in radians
  speed: number;
  isSprinting: boolean;
  stamina: number; // 0 to 100
  isTackling: boolean;
  tackleTimer: number;
  isKicking: boolean;
  kickCharge: number; // 0 to 1
  hasBall: boolean;
  avatarColor: string;
  role: 'striker' | 'midfielder' | 'defender' | 'goalkeeper';
}

export interface BallState {
  x: number;
  y: number;
  z: number; // height off ground for pseudo-3D
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  possessedBy: string | null; // Player ID or null
  lastTouchedBy: string | null;
}

export interface PitchBounds {
  width: number;
  height: number;
  padding: number;
  goalWidth: number;
  goalDepth: number;
}

export interface MatchState {
  score: { home: number; away: number };
  timeRemaining: number; // seconds
  isHalfTime: boolean;
  isGameOver: boolean;
  status: 'lobby' | 'playing' | 'paused' | 'goal_scored' | 'ended';
  goalScoredBannerTimer: number;
  lastScorerTeam: TeamSide | null;
}

export interface GameState {
  pitch: PitchBounds;
  ball: BallState;
  players: Record<string, PlayerState>;
  match: MatchState;
  hostId: string;
}

export interface PlayerInput {
  moveX: number; // -1 to 1
  moveY: number; // -1 to 1
  sprint: boolean;
  passRequested: boolean;
  shootRequested: boolean;
  shootCharge: number; // 0 to 1
  tackleRequested: boolean;
}

export const DEFAULT_PITCH: PitchBounds = {
  width: 1000,
  height: 600,
  padding: 50,
  goalWidth: 120,
  goalDepth: 35,
};

export const PHYSICS_CONSTANTS = {
  PLAYER_RADIUS: 16,
  BALL_RADIUS: 8,
  BASE_PLAYER_SPEED: 4.2,
  SPRINT_MULTIPLIER: 1.5,
  FRICTION_GROUND: 0.985,
  FRICTION_BALL_FREE: 0.982,
  DRIBBLE_TOUCH_DISTANCE: 22,
  MAX_KICK_POWER: 18,
  PASS_POWER: 12,
  TACKLE_SPEED_BOOST: 2.2,
  TACKLE_DURATION: 0.35, // seconds
  STAMINA_REGEN: 12, // per second
  STAMINA_DRAIN: 25, // per second
};

export function createInitialBall(): BallState {
  return {
    x: DEFAULT_PITCH.width / 2,
    y: DEFAULT_PITCH.height / 2,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    radius: PHYSICS_CONSTANTS.BALL_RADIUS,
    possessedBy: null,
    lastTouchedBy: null,
  };
}

export function updatePhysics(gameState: GameState, deltaTime: number, inputs: Record<string, PlayerInput>): GameState {
  const dt = Math.min(deltaTime, 0.1); // cap max frame delta
  const nextState = JSON.parse(JSON.stringify(gameState)) as GameState;
  const { pitch, ball, players } = nextState;

  // 1. Update each player position & movement
  Object.keys(players).forEach((id) => {
    const player = players[id];
    const input = inputs[id] || { moveX: 0, moveY: 0, sprint: false, passRequested: false, shootRequested: false, shootCharge: 0, tackleRequested: false };

    // Update Stamina & Sprinting
    if (input.sprint && (input.moveX !== 0 || input.moveY !== 0) && player.stamina > 5) {
      player.isSprinting = true;
      player.stamina = Math.max(0, player.stamina - PHYSICS_CONSTANTS.STAMINA_DRAIN * dt);
    } else {
      player.isSprinting = false;
      player.stamina = Math.min(100, player.stamina + PHYSICS_CONSTANTS.STAMINA_REGEN * dt);
    }

    // Tackle Timer
    if (player.isTackling) {
      player.tackleTimer -= dt;
      if (player.tackleTimer <= 0) {
        player.isTackling = false;
        player.tackleTimer = 0;
      }
    } else if (input.tackleRequested && !player.hasBall) {
      player.isTackling = true;
      player.tackleTimer = PHYSICS_CONSTANTS.TACKLE_DURATION;
    }

    // Direction and Speed
    const moveLen = Math.hypot(input.moveX, input.moveY);
    if (moveLen > 0.1) {
      const normX = input.moveX / moveLen;
      const normY = input.moveY / moveLen;
      player.angle = Math.atan2(normY, normX);

      let currentSpeed = PHYSICS_CONSTANTS.BASE_PLAYER_SPEED;
      if (player.isSprinting) currentSpeed *= PHYSICS_CONSTANTS.SPRINT_MULTIPLIER;
      if (player.isTackling) currentSpeed *= PHYSICS_CONSTANTS.TACKLE_SPEED_BOOST;

      player.vx = normX * currentSpeed;
      player.vy = normY * currentSpeed;
    } else {
      player.vx *= 0.8;
      player.vy *= 0.8;
    }

    // Update Position
    player.x += player.vx;
    player.y += player.vy;

    // Clamp Player inside Pitch Boundaries
    const minX = pitch.padding;
    const maxX = pitch.width - pitch.padding;
    const minY = pitch.padding;
    const maxY = pitch.height - pitch.padding;

    player.x = Math.max(minX, Math.min(maxX, player.x));
    player.y = Math.max(minY, Math.min(maxY, player.y));
  });

  // 2. FC Mobile Style Dribbling & Ball Attachment Physics
  let possessor = ball.possessedBy ? players[ball.possessedBy] : null;

  // Check tackles and ball interception collisions
  Object.values(players).forEach((p) => {
    const distToBall = Math.hypot(p.x - ball.x, p.y - ball.y);

    // FC Mobile Close Dribble Attract Radius
    if (distToBall < PHYSICS_CONSTANTS.DRIBBLE_TOUCH_DISTANCE) {
      if (p.isTackling && possessor && possessor.id !== p.id) {
        // Successful Tackle dispossesses previous holder
        possessor.hasBall = false;
        ball.possessedBy = p.id;
        p.hasBall = true;
        possessor = p;
        ball.vx = Math.cos(p.angle) * 3;
        ball.vy = Math.sin(p.angle) * 3;
      } else if (!ball.possessedBy) {
        ball.possessedBy = p.id;
        p.hasBall = true;
        possessor = p;
      }
    }
  });

  // If a player has ball possession, stick ball in front of player
  if (possessor && possessor.hasBall) {
    const pInput = inputs[possessor.id] || { moveX: 0, moveY: 0, sprint: false, passRequested: false, shootRequested: false, shootCharge: 0, tackleRequested: false };

    // FC Mobile Style Ball Kick / Shoot Action
    if (pInput.shootRequested || pInput.shootCharge > 0) {
      const power = Math.max(0.3, pInput.shootCharge || 0.7) * PHYSICS_CONSTANTS.MAX_KICK_POWER;
      ball.vx = Math.cos(possessor.angle) * power;
      ball.vy = Math.sin(possessor.angle) * power;
      ball.vz = 4 + power * 0.3; // lofted shot pitch
      possessor.hasBall = false;
      ball.possessedBy = null;
      ball.lastTouchedBy = possessor.id;
    }
    // FC Mobile Targeted Pass Action
    else if (pInput.passRequested) {
      // Find nearest teammate in front angle
      let bestTarget: PlayerState | null = null;
      let closestDist = Infinity;

      Object.values(players).forEach((teammate) => {
        if (teammate.team === possessor?.team && teammate.id !== possessor?.id) {
          const dist = Math.hypot(teammate.x - possessor.x, teammate.y - possessor.y);
          if (dist < closestDist) {
            closestDist = dist;
            bestTarget = teammate;
          }
        }
      });

      let passAngle = possessor.angle;
      if (bestTarget) {
        const target = bestTarget as PlayerState;
        passAngle = Math.atan2(target.y - possessor.y, target.x - possessor.x);
      }

      ball.vx = Math.cos(passAngle) * PHYSICS_CONSTANTS.PASS_POWER;
      ball.vy = Math.sin(passAngle) * PHYSICS_CONSTANTS.PASS_POWER;
      possessor.hasBall = false;
      ball.possessedBy = null;
      ball.lastTouchedBy = possessor.id;
    } else {
      // Dribbling attachment offset
      const offsetDist = 14;
      const targetBallX = possessor.x + Math.cos(possessor.angle) * offsetDist;
      const targetBallY = possessor.y + Math.sin(possessor.angle) * offsetDist;

      ball.x += (targetBallX - ball.x) * 0.4;
      ball.y += (targetBallY - ball.y) * 0.4;
      ball.vx = possessor.vx;
      ball.vy = possessor.vy;
    }
  } else {
    // Unpossessed Free Ball physics
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.z > 0 || ball.vz > 0) {
      ball.z += ball.vz;
      ball.vz -= 0.6; // gravity
      if (ball.z <= 0) {
        ball.z = 0;
        ball.vz = -ball.vz * 0.5; // bounce
      }
    }

    ball.vx *= PHYSICS_CONSTANTS.FRICTION_BALL_FREE;
    ball.vy *= PHYSICS_CONSTANTS.FRICTION_BALL_FREE;
  }

  // 3. Pitch Wall Bounces & Goal Detection
  const goalTop = pitch.height / 2 - pitch.goalWidth / 2;
  const goalBottom = pitch.height / 2 + pitch.goalWidth / 2;

  // Check Goals
  if (ball.x - ball.radius <= pitch.padding) {
    if (ball.y >= goalTop && ball.y <= goalBottom) {
      // Goal Scored by AWAY team
      nextState.match.score.away += 1;
      nextState.match.status = 'goal_scored';
      nextState.match.goalScoredBannerTimer = 2.5;
      nextState.match.lastScorerTeam = 'away';
      resetPositionsAfterGoal(nextState);
      return nextState;
    } else {
      // Bounce Left Boundary
      ball.x = pitch.padding + ball.radius;
      ball.vx = -ball.vx * 0.8;
    }
  } else if (ball.x + ball.radius >= pitch.width - pitch.padding) {
    if (ball.y >= goalTop && ball.y <= goalBottom) {
      // Goal Scored by HOME team
      nextState.match.score.home += 1;
      nextState.match.status = 'goal_scored';
      nextState.match.goalScoredBannerTimer = 2.5;
      nextState.match.lastScorerTeam = 'home';
      resetPositionsAfterGoal(nextState);
      return nextState;
    } else {
      // Bounce Right Boundary
      ball.x = pitch.width - pitch.padding - ball.radius;
      ball.vx = -ball.vx * 0.8;
    }
  }

  // Top/Bottom pitch boundary bounce
  if (ball.y - ball.radius <= pitch.padding) {
    ball.y = pitch.padding + ball.radius;
    ball.vy = -ball.vy * 0.8;
  } else if (ball.y + ball.radius >= pitch.height - pitch.padding) {
    ball.y = pitch.height - pitch.padding - ball.radius;
    ball.vy = -ball.vy * 0.8;
  }

  return nextState;
}

function resetPositionsAfterGoal(state: GameState) {
  const { pitch } = state;
  state.ball = createInitialBall();

  // Reset 4v4 Home & Away default formations
  const homePositions = [
    { x: pitch.width * 0.2, y: pitch.height * 0.5 },
    { x: pitch.width * 0.35, y: pitch.height * 0.3 },
    { x: pitch.width * 0.35, y: pitch.height * 0.7 },
    { x: pitch.width * 0.45, y: pitch.height * 0.5 },
  ];

  const awayPositions = [
    { x: pitch.width * 0.8, y: pitch.height * 0.5 },
    { x: pitch.width * 0.65, y: pitch.height * 0.3 },
    { x: pitch.width * 0.65, y: pitch.height * 0.7 },
    { x: pitch.width * 0.55, y: pitch.height * 0.5 },
  ];

  let homeIdx = 0;
  let awayIdx = 0;

  Object.values(state.players).forEach((player) => {
    player.hasBall = false;
    player.vx = 0;
    player.vy = 0;
    if (player.team === 'home') {
      const pos = homePositions[homeIdx % homePositions.length];
      player.x = pos.x;
      player.y = pos.y;
      player.angle = 0;
      homeIdx++;
    } else {
      const pos = awayPositions[awayIdx % awayPositions.length];
      player.x = pos.x;
      player.y = pos.y;
      player.angle = Math.PI;
      awayIdx++;
    }
  });
}
