import { useState, useEffect, useCallback } from "react";
import { gameService } from "../services/gameService";
import { GameState, WebSocketMessage } from "../types/game";

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    game: null,
    currentPlayer: null,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGameUpdate = useCallback((message: WebSocketMessage) => {
    console.log("Game update:", message);

    setGameState((prevState) => {
      const updatedGame = message.data.game;
      const currentPlayer = prevState.currentPlayer
        ? updatedGame.players[prevState.currentPlayer.id] || null
        : null;

      return {
        game: updatedGame,
        currentPlayer,
      };
    });
  }, []);

  const handleError = useCallback((error: { message: string }) => {
    setError(error.message);
    setTimeout(() => setError(null), 5000);
  }, []);

  useEffect(() => {
    const socket = gameService.connect();

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    gameService.onGameUpdate(handleGameUpdate);
    gameService.onError(handleError);

    return () => {
      gameService.offGameUpdate(handleGameUpdate);
      gameService.offError(handleError);
      gameService.disconnect();
    };
  }, [handleGameUpdate, handleError]);

  const createGame = useCallback(
    async (gameName: string, creatorName: string) => {
      try {
        setError(null);

        const { game, playerId } = await gameService.createGame(
          gameName,
          creatorName,
        );

        const player = game.players[playerId];

        setGameState({ game, currentPlayer: player });

        gameService.joinGameSocket(game.id, playerId);

        return { game, playerId };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create game";
        setError(message);
        throw err;
      }
    },
    [],
  );

  const joinGame = useCallback(async (gameCode: string, playerName: string) => {
    try {
      setError(null);
      const { game, playerId } = await gameService.joinGame(
        gameCode,
        playerName,
      );

      const player = game.players[playerId];
      setGameState({ game, currentPlayer: player });

      gameService.joinGameSocket(game.id, playerId);

      return { game, playerId };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to join game";
      setError(message);
      throw err;
    }
  }, []);

  const pressBuzzer = useCallback(() => {
    if (
      gameState.currentPlayer &&
      !gameState.currentPlayer.buzzerPressed &&
      !gameState.game?.buzzersLocked
    ) {
      gameService.pressBuzzer();
    }
  }, [gameState]);

  const setQuestion = useCallback(
    (question: string, timeLimit: number = 30) => {
      gameService.executeGameAction({
        type: "set_question",
        data: { question, timeLimit },
      });
    },
    [],
  );

  const startQuestion = useCallback((countdownDelay: number = 3) => {
    gameService.executeGameAction({
      type: "start_question",
      data: { countdownDelay },
    });
  }, []);

  const stopQuestion = useCallback(() => {
    gameService.executeGameAction({
      type: "stop_question",
      data: {},
    });
  }, []);

  const clearBuzzers = useCallback(() => {
    gameService.executeGameAction({
      type: "clear_buzzers",
      data: {},
    });
  }, []);

  const lockBuzzers = useCallback(() => {
    gameService.executeGameAction({
      type: "lock_buzzers",
      data: {},
    });
  }, []);

  const unlockBuzzers = useCallback(() => {
    gameService.executeGameAction({
      type: "unlock_buzzers",
      data: {},
    });
  }, []);

  const removePlayer = useCallback((playerId: string) => {
    gameService.executeGameAction({
      type: "remove_player",
      data: { playerId },
    });
  }, []);

  const renamePlayer = useCallback((playerId: string, newName: string) => {
    gameService.executeGameAction({
      type: "rename_player",
      data: { playerId, newName },
    });
  }, []);

  const instantLaunch = useCallback((timeLimit: number = 30, countdownDelay: number = 3) => {
    gameService.executeGameAction({
      type: "instant_launch",
      data: { timeLimit, countdownDelay },
    });
  }, []);

  return {
    gameState,
    isConnected,
    error,
    createGame,
    joinGame,
    pressBuzzer,
    setQuestion,
    startQuestion,
    instantLaunch,
    stopQuestion,
    clearBuzzers,
    lockBuzzers,
    unlockBuzzers,
    removePlayer,
    renamePlayer,
  };
};

