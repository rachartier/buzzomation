import { io, Socket } from "socket.io-client";
import { Game, GameAction, WebSocketMessage } from "../types/game";

class GameService {
  private socket: Socket | null = null;
  private baseUrl =
    process.env.NODE_ENV === "production" ? "" : "http://localhost:3001";

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.baseUrl);
    }
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  async createGame(
    gameName: string,
    creatorName: string,
  ): Promise<{ game: Game; playerId: string }> {
    const response = await fetch(`${this.baseUrl}/api/games`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gameName, creatorName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create game");
    }

    return response.json();
  }

  async joinGame(
    gameCode: string,
    playerName: string,
  ): Promise<{ game: Game; playerId: string }> {
    const response = await fetch(`${this.baseUrl}/api/games/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gameCode, playerName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to join game");
    }

    return response.json();
  }

  async getGame(gameId: string): Promise<{ game: Game }> {
    const response = await fetch(`${this.baseUrl}/api/games/${gameId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get game");
    }

    return response.json();
  }

  joinGameSocket(gameId: string, playerId: string): void {
    if (this.socket) {
      if (this.socket.connected) {
        this.socket.emit("join_game", { gameId, playerId });
      } else {
        this.socket.once("connect", () => {
          this.socket!.emit("join_game", { gameId, playerId });
        });
      }
    }
  }

  pressBuzzer(): void {
    if (this.socket) {
      this.socket.emit("press_buzzer");
    }
  }

  executeGameAction(action: GameAction): void {
    if (this.socket) {
      this.socket.emit("game_action", action);
    }
  }

  onGameUpdate(callback: (message: WebSocketMessage) => void): void {
    if (this.socket) {
      this.socket.on("game_update", callback);
    }
  }

  onError(callback: (error: { message: string }) => void): void {
    if (this.socket) {
      this.socket.on("error", callback);
    }
  }

  offGameUpdate(callback: (message: WebSocketMessage) => void): void {
    if (this.socket) {
      this.socket.off("game_update", callback);
    }
  }

  offError(callback: (error: { message: string }) => void): void {
    if (this.socket) {
      this.socket.off("error", callback);
    }
  }
}

export const gameService = new GameService();
