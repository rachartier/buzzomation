# Buzzomation

## How to build

Simply enter:
```
docker compose build
```

## How to run
To run the application, use:
```
docker compose up
```


# API Endpoints

## REST API

### Health Check
- **GET** `/health`
- Returns server status, timestamp, and uptime

### Games

#### Create Game
- **POST** `/api/games`
- **Body**: `{ gameName: string, creatorName: string }`
- **Response**: `{ game: Game, playerId: string }`

#### Join Game
- **POST** `/api/games/join`
- **Body**: `{ gameCode: string, playerName: string }`
- **Response**: `{ game: Game, playerId: string }`

#### Get Game
- **GET** `/api/games/:gameId`
- **Response**: `{ game: Game }`

## WebSocket Events

### Client → Server
- `join_game` - Join a game room
- `press_buzzer` - Press the buzzer
- `game_action` - Execute game actions (start/stop questions, clear buzzers, etc.)

### Server → Client
- `game_update` - Game state changed
- `error` - Error message

## Data Types

### Game
```typescript
{
  id: string;
  name: string;
  code: string;
  creator: string;
  players: Record<string, Player>;
  currentQuestion: string;
  timeLimit: number;
  isActive: boolean;
  buzzersLocked: boolean;
}
```

### Player
```typescript
{
  id: string;
  name: string;
  buzzerPressed: boolean;
  buzzerTimestamp?: number;
  isCreator: boolean;
}
```
