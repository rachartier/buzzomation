import { useGameContext, GameProvider } from "./contexts/GameContext";
import HomePage from "./components/HomePage";
import CreatorDashboard from "./components/CreatorDashboard";
import PlayerInterface from "./components/PlayerInterface";
import "./App.css";

function AppContent() {
  const { gameState } = useGameContext();

  if (!gameState.game || !gameState.currentPlayer) {
    return <HomePage />;
  }

  if (gameState.currentPlayer.isCreator) {
    return <CreatorDashboard />;
  }

  return <PlayerInterface />;
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
