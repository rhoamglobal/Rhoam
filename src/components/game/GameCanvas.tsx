'use client';

import React, { useEffect, useRef } from 'react';
import { GameState } from '@/lib/game/physics';
import { GameRenderer } from '@/lib/game/renderer';

interface GameCanvasProps {
  gameState: GameState;
  localPlayerId: string | null;
}

export default function GameCanvas({ gameState, localPlayerId }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);

  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = new GameRenderer(canvasRef.current);
    }
  }, []);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.render(gameState, localPlayerId);
    }
  }, [gameState, localPlayerId]);

  return (
    <canvas
      ref={canvasRef}
      width={1000}
      height={600}
      className="w-full h-full object-contain bg-slate-950"
    />
  );
}
