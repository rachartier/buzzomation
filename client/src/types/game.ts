export interface Player {
  id: string;
  name: string;
  buzzerPressed: boolean;
  buzzerTimestamp?: number;
  isCreator: boolean;
}

export interface Game {
  id: string;
  name: string;
  code: string;
  creator: string;
  players: Record<string, Player>;
  currentQuestion: string;
  timeLimit: number;
  questionStartTime?: number;
  isActive: boolean;
  buzzersLocked: boolean;
  countdownActive?: boolean;
  countdownStartTime?: number;
  countdownDuration?: number;
}

export interface GameState {
  game: Game | null;
  currentPlayer: Player | null;
}

export interface BuzzerEvent {
  playerId: string;
  timestamp: number;
}

export interface WebSocketMessage {
  type:
    | "game_updated"
    | "player_joined"
    | "player_left"
    | "buzzer_pressed"
    | "question_started"
    | "countdown_started"
    | "countdown_tick"
    | "stop_question"
    | "buzzers_cleared"
    | "buzzers_locked"
    | "buzzers_unlocked"
    | "player_removed"
    | "player_renamed";
  data: any;
}

export interface CreateGameRequest {
  gameName: string;
  creatorName: string;
}

export interface JoinGameRequest {
  gameCode: string;
  playerName: string;
}

export interface GameAction {
  type:
    | "set_question"
    | "start_question"
    | "instant_launch"
    | "stop_question"
    | "clear_buzzers"
    | "lock_buzzers"
    | "unlock_buzzers"
    | "remove_player"
    | "rename_player";
  data: any;
}
