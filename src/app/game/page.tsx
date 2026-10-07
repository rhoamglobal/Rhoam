'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GameEngine } from '@/lib/game/engine';
import { GameRenderer } from '@/lib/game/renderer';
import { computeAIBotInputs } from '@/lib/game/aiController';
import { MultiplayerRoom, LobbyPlayer } from '@/lib/game/multiplayer';
import { GameState, PlayerInput, TeamSide } from '@/lib/game/physics';
import GameCanvas from '@/components/game/GameCanvas';
import GameControls from '@/components/game/GameControls';

export default function MonkeyPostGamePage() {
  const [playerName, setPlayerName] = useState('Player 1');
  const [selectedTeam, setSelectedTeam] = useState<TeamSide>('home');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [inLobby, setInLobby] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const [lobbyPlayers, setLobbyPlayers] = useState<LobbyPlayer[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);

  const playerIdRef = useRef<string>(`usr_${Math.random().toString(36).substring(2, 9)}`);
  const engineRef = useRef<GameEngine | null>(null);
  const roomRef = useRef<MultiplayerRoom | null>(null);

  // Initialize Game Engine if Host
  const createLobby = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setActiveRoomCode(code);
    setIsHost(true);
    setInLobby(true);

    const engine = new GameEngine(playerIdRef.current);
    engine.addPlayer(playerIdRef.current, playerName, selectedTeam, false, 10, selectedTeam === 'home' ? '#EF4444' : '#3B82F6');
    engineRef.current = engine;

    const room = new MultiplayerRoom(code, playerIdRef.current, playerName);
    room.join(selectedTeam, true, {
      onLobbyUpdate: (players) => {
        setLobbyPlayers(players);
      },
      onInputReceived: (pId, input) => {
        engine.setPlayerInput(pId, input);
      },
    });
    roomRef.current = room;
  };

  const joinLobby = () => {
    if (!roomCodeInput) return;
    const code = roomCodeInput.toUpperCase();
    setActiveRoomCode(code);
    setIsHost(false);
    setInLobby(true);

    const room = new MultiplayerRoom(code, playerIdRef.current, playerName);
    room.join(selectedTeam, false, {
      onLobbyUpdate: (players) => setLobbyPlayers(players),
      onStateUpdate: (syncedState) => {
        setGameState(syncedState);
        if (syncedState.match.status === 'playing') {
          setGameStarted(true);
        }
      },
    });
    roomRef.current = room;
  };

  const handleStartMatch = () => {
    if (!engineRef.current || !isHost) return;
    const engine = engineRef.current;

    // Add all joined human lobby players into the game engine
    lobbyPlayers.forEach((lp) => {
      if (lp.id !== playerIdRef.current) {
        engine.addPlayer(
          lp.id,
          lp.name,
          lp.team,
          false,
          Math.floor(Math.random() * 90) + 10,
          lp.team === 'home' ? '#EF4444' : '#3B82F6'
        );
      }
    });

    // Fill remaining unfilled 4v4 slots with AI bots
    const homeCount = Object.values(engine.getState().players).filter((p) => p.team === 'home').length;
    const awayCount = Object.values(engine.getState().players).filter((p) => p.team === 'away').length;

    for (let i = homeCount + 1; i <= 4; i++) {
      engine.addPlayer(`bot_home_${i}`, `Bot H${i}`, 'home', true, i, '#EF4444');
    }
    for (let i = awayCount + 1; i <= 4; i++) {
      engine.addPlayer(`bot_away_${i}`, `Bot A${i}`, 'away', true, i, '#3B82F6');
    }

    let broadcastCounter = 0;
    engine.registerStateCallback((updatedState) => {
      // Compute AI movements on host loop
      const aiInputs = computeAIBotInputs(updatedState);
      Object.entries(aiInputs).forEach(([botId, input]) => {
        engine.setPlayerInput(botId, input);
      });

      setGameState(updatedState);

      // Throttle network broadcast to ~20Hz (every 3 frames)
      broadcastCounter++;
      if (broadcastCounter % 3 === 0 && roomRef.current) {
        roomRef.current.broadcastGameState(updatedState);
      }
    });

    engine.start();
    setGameStarted(true);
  };

  const handleInputUpdate = (input: PlayerInput) => {
    if (isHost && engineRef.current) {
      engineRef.current.setPlayerInput(playerIdRef.current, input);
    } else if (roomRef.current) {
      roomRef.current.broadcastInput(input);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      {/* 1. Main Menu / Lobby Setup */}
      {!inLobby && !gameStarted && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-amber-400">MONKEY POST ⚽</h1>
            <p className="text-slate-400 text-sm">4v4 Real-time Multiplayer Street Football</p>
          </div>

          <div className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">PLAYER NAME</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">CHOOSE TEAM</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTeam('home')}
                  className={`py-2 px-4 rounded-lg font-bold border transition ${
                    selectedTeam === 'home' ? 'bg-red-600 border-red-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  🔴 HOME
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTeam('away')}
                  className={`py-2 px-4 rounded-lg font-bold border transition ${
                    selectedTeam === 'away' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  🔵 AWAY
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={createLobby}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-xl transition shadow-lg"
            >
              CREATE NEW LOBBY
            </button>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ROOM CODE"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 text-center font-mono uppercase tracking-widest text-amber-300"
              />
              <button
                onClick={joinLobby}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-600 px-5 py-3 rounded-xl font-bold transition"
              >
                JOIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Lobby Waiting Room */}
      {inLobby && !gameStarted && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-lg w-full text-center space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-200">MATCH LOBBY (4v4)</h2>
            <p className="text-amber-400 font-mono text-xl font-black">ROOM CODE: {activeRoomCode}</p>
          </div>

          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-left space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 tracking-wider">CONNECTED PLAYERS</h3>
            <div className="space-y-2">
              {lobbyPlayers.map((p) => (
                <div key={p.id} className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={p.team === 'home' ? 'text-red-400 font-bold' : 'text-blue-400 font-bold'}>
                      {p.team === 'home' ? '🔴' : '🔵'}
                    </span>
                    <span className="font-semibold">{p.name}</span>
                    {p.isHost && <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">HOST</span>}
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">READY</span>
                </div>
              ))}
            </div>
          </div>

          {isHost ? (
            <button
              onClick={handleStartMatch}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-xl transition shadow-xl text-lg tracking-wide"
            >
              START 4v4 MATCH 🚀
            </button>
          ) : (
            <p className="text-slate-400 text-sm animate-pulse">Waiting for room host to start the game...</p>
          )}
        </div>
      )}

      {/* 3. Active Game Screen */}
      {gameStarted && gameState && (
        <div className="flex flex-col items-center gap-4 w-full max-w-5xl">
          {/* Top Scoreboard HUD */}
          <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl flex items-center justify-between w-full max-w-3xl shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-red-500 font-extrabold text-xl">RED</span>
              <span className="text-3xl font-black">{gameState.match.score.home}</span>
            </div>

            <div className="text-center font-mono text-amber-400 font-black text-2xl">
              {Math.floor(gameState.match.timeRemaining / 60)}:
              {Math.floor(gameState.match.timeRemaining % 60)
                .toString()
                .padStart(2, '0')}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-black">{gameState.match.score.away}</span>
              <span className="text-blue-500 font-extrabold text-xl">BLUE</span>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="relative w-full aspect-[16/9] max-w-4xl bg-slate-900 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl">
            <GameCanvas gameState={gameState} localPlayerId={playerIdRef.current} />

            {/* Goal Scored Overlay */}
            {gameState.match.status === 'goal_scored' && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <h1 className="text-5xl font-black text-amber-400 animate-bounce">GOAL SCORED! ⚽</h1>
              </div>
            )}
          </div>

          {/* Virtual Touch & Keyboard Controls */}
          <GameControls onInputUpdate={handleInputUpdate} />
        </div>
      )}
    </div>
  );
}
