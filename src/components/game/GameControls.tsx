'use client';

import React, { useEffect, useState, useRef } from 'react';
import { PlayerInput } from '@/lib/game/physics';

interface GameControlsProps {
  onInputUpdate: (input: PlayerInput) => void;
}

export default function GameControls({ onInputUpdate }: GameControlsProps) {
  const [keysPressed, setKeysPressed] = useState<Record<string, boolean>>({});
  const inputStateRef = useRef<PlayerInput>({
    moveX: 0,
    moveY: 0,
    sprint: false,
    passRequested: false,
    shootRequested: false,
    shootCharge: 0,
    tackleRequested: false,
  });

  // Handle Keyboard Inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeysPressed((prev) => ({ ...prev, [e.key.toLowerCase()]: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed((prev) => ({ ...prev, [e.key.toLowerCase()]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Compute Movement and Actions based on Key States
  useEffect(() => {
    let moveX = 0;
    let moveY = 0;

    if (keysPressed['w'] || keysPressed['arrowup']) moveY -= 1;
    if (keysPressed['s'] || keysPressed['arrowdown']) moveY += 1;
    if (keysPressed['a'] || keysPressed['arrowleft']) moveX -= 1;
    if (keysPressed['d'] || keysPressed['arrowright']) moveX += 1;

    const sprint = !!(keysPressed['shift'] || keysPressed['k']);
    const passRequested = !!keysPressed['j'];
    const shootRequested = !!keysPressed['l'];
    const tackleRequested = !!keysPressed['k'];

    const newInput: PlayerInput = {
      moveX,
      moveY,
      sprint,
      passRequested,
      shootRequested,
      shootCharge: shootRequested ? 0.8 : 0,
      tackleRequested,
    };

    inputStateRef.current = newInput;
    onInputUpdate(newInput);
  }, [keysPressed, onInputUpdate]);

  // Touch Virtual Action Triggers
  const handleTouchAction = (action: 'pass' | 'shoot' | 'tackle' | 'sprint', active: boolean) => {
    const curr = { ...inputStateRef.current };
    if (action === 'sprint') curr.sprint = active;
    if (action === 'pass') curr.passRequested = active;
    if (action === 'shoot') {
      curr.shootRequested = active;
      curr.shootCharge = active ? 0.8 : 0;
    }
    if (action === 'tackle') curr.tackleRequested = active;

    inputStateRef.current = curr;
    onInputUpdate(curr);
  };

  return (
    <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/80 backdrop-blur border border-slate-800 p-4 rounded-2xl shadow-xl">
      {/* Desktop Keyboard Hints */}
      <div className="hidden md:flex gap-6 text-xs text-slate-300 font-medium">
        <div>
          <span className="font-bold text-amber-400">WASD / ARROWS</span> : Move Avatar
        </div>
        <div>
          <span className="font-bold text-emerald-400">J</span> : Pass
        </div>
        <div>
          <span className="font-bold text-red-400">L</span> : Shoot
        </div>
        <div>
          <span className="font-bold text-blue-400">SHIFT / K</span> : Sprint / Tackle
        </div>
      </div>

      {/* FC Mobile Style Touch Action Buttons for Mobile / Touch Devices */}
      <div className="flex items-center justify-center gap-3 w-full md:w-auto">
        <button
          onTouchStart={() => handleTouchAction('pass', true)}
          onTouchEnd={() => handleTouchAction('pass', false)}
          onMouseDown={() => handleTouchAction('pass', true)}
          onMouseUp={() => handleTouchAction('pass', false)}
          className="flex-1 md:flex-none bg-emerald-600 active:bg-emerald-500 text-white font-extrabold px-5 py-3 rounded-xl shadow-lg border border-emerald-400 text-sm select-none"
        >
          PASS (J)
        </button>

        <button
          onTouchStart={() => handleTouchAction('shoot', true)}
          onTouchEnd={() => handleTouchAction('shoot', false)}
          onMouseDown={() => handleTouchAction('shoot', true)}
          onMouseUp={() => handleTouchAction('shoot', false)}
          className="flex-1 md:flex-none bg-red-600 active:bg-red-500 text-white font-extrabold px-5 py-3 rounded-xl shadow-lg border border-red-400 text-sm select-none"
        >
          SHOOT (L)
        </button>

        <button
          onTouchStart={() => handleTouchAction('sprint', true)}
          onTouchEnd={() => handleTouchAction('sprint', false)}
          onMouseDown={() => handleTouchAction('sprint', true)}
          onMouseUp={() => handleTouchAction('sprint', false)}
          className="flex-1 md:flex-none bg-amber-600 active:bg-amber-500 text-white font-extrabold px-5 py-3 rounded-xl shadow-lg border border-amber-400 text-sm select-none"
        >
          SPRINT / TACKLE
        </button>
      </div>
    </div>
  );
}
