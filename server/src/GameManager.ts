import { v4 as uuidv4 } from "uuid";
import { Game, Player, GameAction, BuzzerEvent } from "./types";

export class GameManager {
  private games: Map<string, Game> = new Map();
  private codeToGameId: Map<string, string> = new Map();
  private gameTimers: Map<string, NodeJS.Timeout> = new Map();
  private countdownTimers: Map<string, NodeJS.Timeout> = new Map();
  private broadcastCallback?: (gameId: string, message: any) => void;

  constructor(broadcastCallback?: (gameId: string, message: any) => void) {
    this.broadcastCallback = broadcastCallback;
    // Check for expired timers every second
    setInterval(() => {
      this.checkExpiredTimers();
    }, 1000);
  }

  createGame(
    gameName: string,
    creatorName: string,
  ): { game: Game; playerId: string } {
    const gameId = uuidv4();
    const playerId = uuidv4();
    const gameCode = this.generateGameCode();

    const creator: Player = {
      id: playerId,
      name: creatorName,
      buzzerPressed: false,
      isCreator: true,
    };

    const game: Game = {
      id: gameId,
      name: gameName,
      code: gameCode,
      creator: playerId,
      players: { [playerId]: creator },
      currentQuestion: "",
      timeLimit: 30,
      isActive: false,
      buzzersLocked: false,
    };

    this.games.set(gameId, game);
    this.codeToGameId.set(gameCode, gameId);

    return { game, playerId };
  }

  joinGame(
    gameCode: string,
    playerName: string,
  ): { game: Game; playerId: string } | null {
    const gameId = this.codeToGameId.get(gameCode);
    if (!gameId) return null;

    const game = this.games.get(gameId);
    if (!game) return null;

    const playerId = uuidv4();
    const player: Player = {
      id: playerId,
      name: playerName,
      buzzerPressed: false,
      isCreator: false,
    };

    game.players[playerId] = player;
    return { game, playerId };
  }

  getGame(gameId: string): Game | null {
    return this.games.get(gameId) || null;
  }

  getGameByCode(gameCode: string): Game | null {
    const gameId = this.codeToGameId.get(gameCode);
    return gameId ? this.games.get(gameId) || null : null;
  }

  removePlayer(gameId: string, playerId: string): Game | null {
    const game = this.games.get(gameId);
    if (!game) return null;

    delete game.players[playerId];

    if (Object.keys(game.players).length === 0) {
      this.clearGameTimer(gameId);
      this.clearCountdownTimer(gameId);
      this.games.delete(gameId);
      this.codeToGameId.delete(game.code);
      return null;
    }

    if (game.creator === playerId) {
      const remainingPlayers = Object.values(game.players);
      if (remainingPlayers.length > 0) {
        const newCreator = remainingPlayers[0];
        newCreator.isCreator = true;
        game.creator = newCreator.id;
      }
    }

    return game;
  }

  pressBuzzer(
    gameId: string,
    playerId: string,
  ): { game: Game; buzzerEvent: BuzzerEvent } | null {
    const game = this.games.get(gameId);

    if (
      !game ||
      !game.players[playerId] ||
      !game.isActive ||
      game.buzzersLocked ||
      game.countdownActive
    ) {
      console.log(
        `Buzzer press rejected: game=${!!game}, player=${!!game?.players[playerId]}, isActive=${game?.isActive}, locked=${game?.buzzersLocked}, countdown=${game?.countdownActive}`,
      );
      return null;
    }

    const player = game.players[playerId];
    if (player.buzzerPressed) {
      console.log(
        `Buzzer press rejected: Player ${player.name} (${playerId}) already pressed`,
      );
      return null;
    }

    const timestamp = Date.now();
    player.buzzerPressed = true;
    player.buzzerTimestamp = timestamp;

    console.log(
      `Buzzer press accepted: Player ${player.name} (${playerId}) at ${timestamp}`,
    );
    console.log(
      `Current pressed players:`,
      Object.values(game.players)
        .filter((p) => p.buzzerPressed)
        .map((p) => `${p.name} (${p.buzzerTimestamp})`)
        .join(", "),
    );

    return {
      game,
      buzzerEvent: { playerId, timestamp },
    };
  }

  executeAction(
    gameId: string,
    action: GameAction,
    creatorId: string,
  ): Game | null {
    const game = this.games.get(gameId);
    if (!game || game.creator !== creatorId) return null;

    switch (action.type) {
      case "set_question":
        game.currentQuestion = action.data.question;
        game.timeLimit = action.data.timeLimit || 30;
        break;

      case "start_question":
        this.startCountdown(
          gameId,
          game.timeLimit,
          action.data.countdownDelay || 3,
        );
        break;

      case "instant_launch":
        this.startCountdown(
          gameId,
          action.data.timeLimit || 30,
          action.data.countdownDelay || 3,
          true,
        );
        break;

      case "stop_question":
        game.isActive = false;
        game.questionStartTime = undefined;
        game.countdownActive = false;
        game.countdownStartTime = undefined;
        game.countdownDuration = undefined;
        this.clearGameTimer(gameId);
        this.clearCountdownTimer(gameId);
        break;

      case "clear_buzzers":
        this.clearAllBuzzers(game);
        break;

      case "lock_buzzers":
        game.buzzersLocked = true;
        break;

      case "unlock_buzzers":
        game.buzzersLocked = false;
        break;

      case "remove_player":
        if (action.data.playerId !== creatorId) {
          delete game.players[action.data.playerId];
        }
        break;

      case "rename_player":
        if (game.players[action.data.playerId]) {
          game.players[action.data.playerId].name = action.data.newName;
        }
        break;

      default:
        return null;
    }

    return game;
  }

  private startCountdown(
    gameId: string,
    timeLimit: number,
    countdownDelay: number,
    isInstantLaunch: boolean = false,
  ): void {
    const game = this.games.get(gameId);
    if (!game) return;

    // For instant launch, set the question, for regular questions it's already set
    if (isInstantLaunch) {
      game.currentQuestion = "Open Buzzer Session";
    }

    game.timeLimit = timeLimit;
    game.countdownActive = true;
    game.countdownStartTime = Date.now();
    game.countdownDuration = countdownDelay;
    this.clearAllBuzzers(game);

    if (this.broadcastCallback) {
      this.broadcastCallback(gameId, {
        type: "countdown_started",
        data: { game, countdownDelay },
      });
    }

    let remainingTime = countdownDelay;
    const countdownInterval = setInterval(() => {
      remainingTime--;

      if (remainingTime > 0) {
        if (this.broadcastCallback) {
          this.broadcastCallback(gameId, {
            type: "countdown_tick",
            data: { game, remainingTime },
          });
        }
      } else {
        clearInterval(countdownInterval);
        this.countdownTimers.delete(gameId);

        const currentGame = this.games.get(gameId);
        if (currentGame) {
          currentGame.countdownActive = false;
          currentGame.countdownStartTime = undefined;
          currentGame.countdownDuration = undefined;
          currentGame.isActive = true;
          currentGame.questionStartTime = Date.now();
          currentGame.buzzersLocked = false;

          this.startGameTimer(gameId);

          if (this.broadcastCallback) {
            this.broadcastCallback(gameId, {
              type: "question_started",
              data: { game: currentGame },
            });
          }
        }
      }
    }, 1000);

    this.countdownTimers.set(gameId, countdownInterval);
  }

  private clearCountdownTimer(gameId: string): void {
    const timer = this.countdownTimers.get(gameId);
    if (timer) {
      clearInterval(timer);
      this.countdownTimers.delete(gameId);
    }
  }

  private clearAllBuzzers(game: Game): void {
    Object.values(game.players).forEach((player) => {
      player.buzzerPressed = false;
      player.buzzerTimestamp = undefined;
    });
  }

  private startGameTimer(gameId: string): void {
    this.clearGameTimer(gameId);

    const game = this.games.get(gameId);
    if (!game) return;

    console.log(
      `Starting timer for game ${gameId} with ${game.timeLimit}s duration`,
    );

    const timer = setTimeout(() => {
      const currentGame = this.games.get(gameId);
      if (currentGame && currentGame.isActive) {
        currentGame.buzzersLocked = true;
        currentGame.isActive = false;
        currentGame.questionStartTime = undefined;
        console.log(
          `Auto-locked buzzers for game ${gameId} after ${currentGame.timeLimit}s`,
        );

        if (this.broadcastCallback) {
          this.broadcastCallback(gameId, {
            type: "buzzers_locked",
            data: { game: currentGame },
          });
        }
      }
      this.gameTimers.delete(gameId);
    }, game.timeLimit * 1000);

    this.gameTimers.set(gameId, timer);
  }

  private clearGameTimer(gameId: string): void {
    const timer = this.gameTimers.get(gameId);
    if (timer) {
      clearTimeout(timer);
      this.gameTimers.delete(gameId);
    }
  }

  private checkExpiredTimers(): void {
    for (const [gameId, game] of this.games.entries()) {
      if (game.isActive && game.questionStartTime) {
        const elapsed = (Date.now() - game.questionStartTime) / 1000;
        if (elapsed >= game.timeLimit && !game.buzzersLocked) {
          game.buzzersLocked = true;
          game.isActive = false;
          game.questionStartTime = undefined;
          console.log(
            `Auto-locked buzzers for game ${gameId} after ${game.timeLimit}s (backup check)`,
          );

          if (this.broadcastCallback) {
            this.broadcastCallback(gameId, {
              type: "buzzers_locked",
              data: { game },
            });
          }
        }
      }
    }
  }

  private generateGameCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    if (this.codeToGameId.has(result)) {
      return this.generateGameCode();
    }

    return result;
  }
}
