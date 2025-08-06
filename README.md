# Buzzomation

<img width="2558" height="1278" alt="image" src="https://github.com/user-attachments/assets/930c84ea-a67b-46ec-b429-68fcd2869b5c" />

### Host Dashboard
<img width="2558" height="1278" alt="image" src="https://github.com/user-attachments/assets/91bbf680-30c7-4f57-b742-80443e8267b4" />

### Player Dashboard
<img width="2559" height="1278" alt="image" src="https://github.com/user-attachments/assets/63cb20b1-25e7-4547-a182-aff239eb5194" />

<img width="2558" height="1271" alt="image" src="https://github.com/user-attachments/assets/48d0a52e-35dc-4aca-af86-8118eaf14458" />


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
