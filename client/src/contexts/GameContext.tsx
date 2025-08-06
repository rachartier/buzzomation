import React, { createContext, useContext, ReactNode } from "react";
import { useGame } from "../hooks/useGame";

type GameContextType = ReturnType<typeof useGame>;

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const gameValue = useGame();

  return (
    <GameContext.Provider value={gameValue}>{children}</GameContext.Provider>
  );
};
