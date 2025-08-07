import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import path from "path";
import { GameManager } from "./GameManager";
import {
  CreateGameRequest,
  JoinGameRequest,
  GameAction,
  WebSocketMessage,
} from "./types";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production" ? false : "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Create broadcast callback for GameManager
const broadcastToGame = (gameId: string, message: any) => {
  io.to(gameId).emit("game_update", message);
};

const gameManager = new GameManager(broadcastToGame);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? false : "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  }),
);
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../public")));
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

interface SocketWithPlayer extends Socket {
  gameId?: string;
  playerId?: string;
}

app.post("/api/games", (req, res) => {
  try {
    const { gameName, creatorName }: CreateGameRequest = req.body;

    if (!gameName || !creatorName) {
      return res
        .status(400)
        .json({ error: "Game name and creator name are required" });
    }

    const { game, playerId } = gameManager.createGame(gameName, creatorName);
    res.json({ game, playerId });
  } catch (error) {
    res.status(500).json({ error: "Failed to create game" });
  }
});

app.post("/api/games/join", (req, res) => {
  try {
    const { gameCode, playerName }: JoinGameRequest = req.body;

    if (!gameCode || !playerName) {
      return res
        .status(400)
        .json({ error: "Game code and player name are required" });
    }

    const result = gameManager.joinGame(gameCode, playerName);
    if (!result) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to join game" });
  }
});

app.get("/api/games/:gameId", (req, res) => {
  try {
    const game = gameManager.getGame(req.params.gameId);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    res.json({ game });
  } catch (error) {
    res.status(500).json({ error: "Failed to get game" });
  }
});

io.on("connection", (socket: SocketWithPlayer) => {
  console.log("Client connected:", socket.id);

  socket.on("join_game", ({ gameId, playerId }) => {
    const game = gameManager.getGame(gameId);
    if (!game || !game.players[playerId]) {
      socket.emit("error", { message: "Invalid game or player" });
      return;
    }

    socket.gameId = gameId;
    socket.playerId = playerId;
    socket.join(gameId);

    const message: WebSocketMessage = {
      type: "player_joined",
      data: { game, playerId },
    };
    socket.to(gameId).emit("game_update", message);
  });

  socket.on("press_buzzer", () => {
    if (!socket.gameId || !socket.playerId) {
      socket.emit("error", { message: "Not in a game" });
      return;
    }

    const result = gameManager.pressBuzzer(socket.gameId, socket.playerId);
    if (!result) {
      socket.emit("error", { message: "Cannot press buzzer" });
      return;
    }

    const message: WebSocketMessage = {
      type: "buzzer_pressed",
      data: { game: result.game, buzzerEvent: result.buzzerEvent },
    };
    io.to(socket.gameId).emit("game_update", message);
  });

  socket.on("game_action", (action: GameAction) => {
    if (!socket.gameId || !socket.playerId) {
      socket.emit("error", { message: "Not in a game" });
      return;
    }

    const game = gameManager.executeAction(
      socket.gameId,
      action,
      socket.playerId,
    );
    if (!game) {
      socket.emit("error", { message: "Action failed" });
      return;
    }

    const message: WebSocketMessage = {
      type: action.type as any,
      data: { game },
    };
    io.to(socket.gameId).emit("game_update", message);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    if (socket.gameId && socket.playerId) {
      const game = gameManager.removePlayer(socket.gameId, socket.playerId);

      if (game) {
        const message: WebSocketMessage = {
          type: "player_left",
          data: { game, playerId: socket.playerId },
        };
        socket.to(socket.gameId).emit("game_update", message);
      }
    }
  });
});

// Serve React app for all non-API routes in production
if (process.env.NODE_ENV === "production") {
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
  });

  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
