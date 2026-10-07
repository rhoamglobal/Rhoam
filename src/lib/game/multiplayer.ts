import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { GameState, PlayerInput, TeamSide } from './physics';

export interface LobbyPlayer {
  id: string;
  name: string;
  team: TeamSide;
  isHost: boolean;
  isReady: boolean;
  isBot?: boolean;
}

export class MultiplayerRoom {
  private channel: RealtimeChannel | null = null;
  private roomCode: string;
  private playerId: string;
  private playerName: string;

  private onStateUpdate?: (state: GameState) => void;
  private onLobbyUpdate?: (players: LobbyPlayer[]) => void;
  private onInputReceived?: (playerId: string, input: PlayerInput) => void;

  constructor(roomCode: string, playerId: string, playerName: string) {
    this.roomCode = roomCode.toUpperCase();
    this.playerId = playerId;
    this.playerName = playerName;
  }

  public join(
    team: TeamSide,
    isHost: boolean,
    callbacks: {
      onStateUpdate?: (state: GameState) => void;
      onLobbyUpdate?: (players: LobbyPlayer[]) => void;
      onInputReceived?: (playerId: string, input: PlayerInput) => void;
    }
  ) {
    this.onStateUpdate = callbacks.onStateUpdate;
    this.onLobbyUpdate = callbacks.onLobbyUpdate;
    this.onInputReceived = callbacks.onInputReceived;

    this.channel = supabase.channel(`room_${this.roomCode}`, {
      config: {
        presence: { key: this.playerId },
      },
    });

    // 1. Presence Sync (Lobby Players Tracking)
    this.channel.on('presence', { event: 'sync' }, () => {
      if (!this.channel) return;
      const presenceState = this.channel.presenceState<{
        id: string;
        name: string;
        team: TeamSide;
        isHost: boolean;
        isReady: boolean;
      }>();

      const playersList: LobbyPlayer[] = [];
      Object.values(presenceState).forEach((presences) => {
        presences.forEach((p) => {
          playersList.push({
            id: p.id,
            name: p.name,
            team: p.team,
            isHost: p.isHost,
            isReady: p.isReady,
          });
        });
      });

      if (this.onLobbyUpdate) {
        this.onLobbyUpdate(playersList);
      }
    });

    // 2. Broadcast Listener for Game State (Host -> Clients)
    this.channel.on('broadcast', { event: 'game_state' }, (payload) => {
      if (!isHost && this.onStateUpdate && payload.payload) {
        this.onStateUpdate(payload.payload as GameState);
      }
    });

    // 3. Broadcast Listener for Player Inputs (Client -> Host)
    this.channel.on('broadcast', { event: 'player_input' }, (payload) => {
      if (isHost && this.onInputReceived && payload.payload) {
        const { senderId, input } = payload.payload as { senderId: string; input: PlayerInput };
        this.onInputReceived(senderId, input);
      }
    });

    // Subscribe and track presence
    this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && this.channel) {
        await this.channel.track({
          id: this.playerId,
          name: this.playerName,
          team,
          isHost,
          isReady: true,
        });
      }
    });
  }

  public broadcastGameState(state: GameState) {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'game_state',
        payload: state,
      });
    }
  }

  public broadcastInput(input: PlayerInput) {
    if (this.channel) {
      this.channel.send({
        type: 'broadcast',
        event: 'player_input',
        payload: {
          senderId: this.playerId,
          input,
        },
      });
    }
  }

  public leave() {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
  }
}
