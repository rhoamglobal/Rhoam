import { GameState, PlayerInput } from './physics';

export function computeAIBotInputs(gameState: GameState): Record<string, PlayerInput> {
  const botInputs: Record<string, PlayerInput> = {};
  const { pitch, ball, players } = gameState;

  // Identify all AI bot players
  const bots = Object.values(players).filter((p) => p.isBot);

  bots.forEach((bot) => {
    let moveX = 0;
    let moveY = 0;
    let sprint = false;
    let passRequested = false;
    let shootRequested = false;
    let tackleRequested = false;

    const opponentGoalX = bot.team === 'home' ? pitch.width - pitch.padding : pitch.padding;
    const goalCenterY = pitch.height / 2;

    const distToBall = Math.hypot(ball.x - bot.x, ball.y - bot.y);

    if (bot.hasBall) {
      // 1. Attacking state with Ball
      const distToGoal = Math.hypot(opponentGoalX - bot.x, goalCenterY - bot.y);

      if (distToGoal < 280) {
        // In shooting range -> Aim at goal & SHOOT
        const angleToGoal = Math.atan2(goalCenterY - bot.y, opponentGoalX - bot.x);
        moveX = Math.cos(angleToGoal);
        moveY = Math.sin(angleToGoal);
        shootRequested = true;
      } else {
        // Look for open human teammate to pass
        const humanTeammate = Object.values(players).find(
          (p) => p.team === bot.team && !p.isBot && p.id !== bot.id
        );

        if (humanTeammate && Math.random() < 0.03) {
          // Pass to human teammate
          passRequested = true;
        } else {
          // Dribble towards opponent goal
          const angleToGoal = Math.atan2(goalCenterY - bot.y, opponentGoalX - bot.x);
          moveX = Math.cos(angleToGoal);
          moveY = Math.sin(angleToGoal);
          sprint = distToGoal > 350;
        }
      }
    } else if (ball.possessedBy && players[ball.possessedBy]?.team !== bot.team) {
      // 2. Defending state -> Press ball carrier & tackle
      const angleToBall = Math.atan2(ball.y - bot.y, ball.x - bot.x);
      moveX = Math.cos(angleToBall);
      moveY = Math.sin(angleToBall);
      sprint = true;

      if (distToBall < 30) {
        tackleRequested = true;
      }
    } else {
      // 3. Free Ball -> Chase Ball
      const angleToBall = Math.atan2(ball.y - bot.y, ball.x - bot.x);
      moveX = Math.cos(angleToBall);
      moveY = Math.sin(angleToBall);
      sprint = distToBall > 100;
    }

    botInputs[bot.id] = {
      moveX,
      moveY,
      sprint,
      passRequested,
      shootRequested,
      shootCharge: shootRequested ? 0.8 : 0,
      tackleRequested,
    };
  });

  return botInputs;
}
