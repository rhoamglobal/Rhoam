import { GameState, PlayerInput, DEFAULT_PITCH, createInitialBall, updatePhysics, TeamSide } from './physics';

export class GameEngine {
  private state: GameState;
  private lastTimestamp: number = 0;
  private animFrameId: number | null = null;
  private inputs: Record<string, PlayerInput> = {};
  private onStateUpdate?: (state: GameState) => void;

  constructor(hostId: string) {
    this.state = {
      pitch: DEFAULT_PITCH,
      ball: createInitialBall(),
      players: {},
      match: {
        score: { home: 0, away: 0 },
        timeRemaining: 180, // 3-minute 4v4 match
        isHalfTime: false,
        isGameOver: false,
        status: 'lobby',
        goalScoredBannerTimer: 0,
        lastScorerTeam: null,
      },
      hostId,
    };
  }

  public getState(): GameState {
    return this.state;
  }

  public setState(newState: GameState) {
    this.state = newState;
  }

  public registerStateCallback(cb: (state: GameState) => void) {
    this.onStateUpdate = cb;
  }

  public addPlayer(id: string, name: string, team: TeamSide, isBot = false, number = 10, color = '#3B82F6') {
    const isHome = team === 'home';
    const pitch = this.state.pitch;

    const sameTeamCount = Object.values(this.state.players).filter((p) => p.team === team).length;
    const homeFormations = [
      { x: pitch.width * 0.2, y: pitch.height * 0.5 },
      { x: pitch.width * 0.35, y: pitch.height * 0.3 },
      { x: pitch.width * 0.35, y: pitch.height * 0.7 },
      { x: pitch.width * 0.45, y: pitch.height * 0.5 },
    ];
    const awayFormations = [
      { x: pitch.width * 0.8, y: pitch.height * 0.5 },
      { x: pitch.width * 0.65, y: pitch.height * 0.3 },
      { x: pitch.width * 0.65, y: pitch.height * 0.7 },
      { x: pitch.width * 0.55, y: pitch.height * 0.5 },
    ];

    const initialPos = isHome
      ? homeFormations[sameTeamCount % homeFormations.length]
      : awayFormations[sameTeamCount % awayFormations.length];

    this.state.players[id] = {
      id,
      name,
      team,
      number,
      isBot,
      x: initialPos.x,
      y: initialPos.y,
      vx: 0,
      vy: 0,
      angle: isHome ? 0 : Math.PI,
      speed: 0,
      isSprinting: false,
      stamina: 100,
      isTackling: false,
      tackleTimer: 0,
      isKicking: false,
      kickCharge: 0,
      hasBall: false,
      avatarColor: color,
      role: 'midfielder',
    };
  }

  public removePlayer(id: string) {
    delete this.state.players[id];
    delete this.inputs[id];
  }

  public setPlayerInput(id: string, input: PlayerInput) {
    this.inputs[id] = input;
  }

  public start() {
    if (this.animFrameId) return;
    this.state.match.status = 'playing';
    this.lastTimestamp = performance.now();
    this.loop(this.lastTimestamp);
  }

  public stop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private loop = (timestamp: number) => {
    const deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    if (this.state.match.status === 'playing' || this.state.match.status === 'goal_scored') {
      // Goal banner timer update
      if (this.state.match.status === 'goal_scored') {
        this.state.match.goalScoredBannerTimer -= deltaTime;
        if (this.state.match.goalScoredBannerTimer <= 0) {
          this.state.match.status = 'playing';
        }
      } else {
        // Countdown match timer
        this.state.match.timeRemaining = Math.max(0, this.state.match.timeRemaining - deltaTime);
        if (this.state.match.timeRemaining <= 0) {
          this.state.match.status = 'ended';
          this.state.match.isGameOver = true;
        }
      }

      // Physics Step
      this.state = updatePhysics(this.state, deltaTime, this.inputs);

      if (this.onStateUpdate) {
        this.onStateUpdate(this.state);
      }
    }

    this.animFrameId = requestAnimationFrame(this.loop);
  };
}
