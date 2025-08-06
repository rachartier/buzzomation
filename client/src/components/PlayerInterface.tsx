import React, { useState, useEffect } from "react";
import { Crown } from "lucide-react";
import { useGameContext } from "../contexts/GameContext";
import PlayerList from "./PlayerList";
import BuzzerButton from "./BuzzerButton";
import "./PlayerInterface.css";

const PlayerInterface: React.FC = () => {
  const { gameState, pressBuzzer } = useGameContext();
  const [timeLeft, setTimeLeft] = useState(0);
  const [countdownLeft, setCountdownLeft] = useState(0);

  const game = gameState.game;
  const currentPlayer = gameState.currentPlayer;

  useEffect(() => {
    if (!game?.isActive || !game.questionStartTime) {
      setTimeLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = (Date.now() - game.questionStartTime!) / 1000;
      const remaining = Math.max(0, game.timeLimit - elapsed);
      setTimeLeft(remaining);
    }, 100);

    return () => clearInterval(interval);
  }, [game?.isActive, game?.questionStartTime, game?.timeLimit]);

  useEffect(() => {
    if (!game?.countdownActive || !game.countdownStartTime) {
      setCountdownLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = (Date.now() - game.countdownStartTime!) / 1000;
      const remaining = Math.max(0, (game.countdownDuration || 3) - elapsed);
      setCountdownLeft(remaining);
    }, 100);

    return () => clearInterval(interval);
  }, [game?.countdownActive, game?.countdownStartTime, game?.countdownDuration]);

  const getPressedPlayers = () => {
    if (!game) return [];
    return Object.values(game.players)
      .filter((player) => player.buzzerPressed)
      .sort((a, b) => (a.buzzerTimestamp || 0) - (b.buzzerTimestamp || 0));
  };

  const getPlayerRank = () => {
    if (!currentPlayer?.buzzerPressed) return null;
    const pressedPlayers = getPressedPlayers();
    return pressedPlayers.findIndex((p) => p.id === currentPlayer.id) + 1;
  };

  if (!game || !currentPlayer) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading game...</p>
      </div>
    );
  }

  const pressedPlayers = getPressedPlayers();
  const playerRank = getPlayerRank();

  return (
    <div className="player-interface">
      <header className="interface-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-logo">
              <img
                src="/buzzomation.png"
                alt="Buzzomation"
                className="logo-image"
              />
            </div>
            <div className="game-info">
              <h1>{game.name}</h1>
              <div className="player-welcome">
                <span className="welcome-text">
                  Welcome, <strong>{currentPlayer.name}</strong>!
                </span>
                <div className="game-code-display">
                  <span className="code-label">Game Code:</span>
                  <span className="code-value">{game.code}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="game-stats">
            <div className="stat">
              <span className="stat-number">
                {Object.keys(game.players).length - 1}
              </span>
              <span className="stat-label">Players</span>
            </div>
            <div className="stat">
              <span className="stat-number">{pressedPlayers.length - 1}</span>
              <span className="stat-label">Buzzed</span>
            </div>
          </div>
        </div>
      </header>

      <div className="interface-content">
        <div className="main-section">
          <div className="question-display">
            {game.currentQuestion ? (
              <div className="question-card">
                <div className="question-header">
                  <h2>Current Question</h2>
                  {game.countdownActive ? (
                    <div className="status-badge countdown">
                      <span className="status-dot"></span>
                      STARTING IN {Math.ceil(countdownLeft)}
                    </div>
                  ) : game.isActive ? (
                    <div className="status-badge active">
                      <span className="status-dot"></span>
                      LIVE
                    </div>
                  ) : (
                    <div className="status-badge waiting">
                      <span className="status-dot"></span>
                      WAITING
                    </div>
                  )}
                </div>

                <div className="question-content">
                  {game.currentQuestion === "Open Buzzer Session" ? (
                    <div className="instant-launch-content">
                      <div className="instant-launch-icon">🚀</div>
                      <p className="instant-launch-title">Open Buzzer Session</p>
                      <p className="instant-launch-description">
                        Buzz in anytime! No specific question - just press when you're ready.
                      </p>
                    </div>
                  ) : (
                    <p className="question-text">"{game.currentQuestion}"</p>
                  )}

                  {game.countdownActive ? (
                    <div className="countdown-display-large">
                      <div className="countdown-circle">
                        <div className="countdown-number-large">
                          {Math.ceil(countdownLeft)}
                        </div>
                      </div>
                      <div className="countdown-message">
                        Get ready! Buzzers will be available in {Math.ceil(countdownLeft)} seconds
                      </div>
                    </div>
                  ) : game.isActive && (
                    <div className="timer-display">
                      <div className="timer-circle">
                        <svg className="timer-svg" width="80" height="80">
                          <circle
                            cx="40"
                            cy="40"
                            r="35"
                            stroke="#e1e5e9"
                            strokeWidth="6"
                            fill="none"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="35"
                            stroke="#e74c3c"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 35}`}
                            strokeDashoffset={`${2 * Math.PI * 35 * (1 - timeLeft / game.timeLimit)}`}
                            className="timer-progress"
                          />
                        </svg>
                        <div className="timer-value">{Math.ceil(timeLeft)}</div>
                      </div>
                      <div className="timer-label">seconds left</div>
                    </div>
                  )}

                  {!game.isActive && !game.countdownActive && (
                    <div className="waiting-message">
                      Waiting for question to start...
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-question-card">
                <div className="no-question-content">
                  <h2>Waiting for Question</h2>
                  <p>The game host will set a question soon...</p>
                </div>
              </div>
            )}
          </div>

          <div className="buzzer-section">
            <div className="buzzer-container">
              <BuzzerButton
                onPress={pressBuzzer}
                isPressed={currentPlayer.buzzerPressed}
                isLocked={game.buzzersLocked || !!game.countdownActive}
                isActive={game.isActive}
                isFirst={playerRank === 1}
              />

              {playerRank && (
                <div className="player-rank">
                  <span className="rank-text">
                    You buzzed in <strong>#{playerRank}</strong>!
                  </span>
                </div>
              )}

              {game.countdownActive && (
                <div className="countdown-message">
                  Get ready! Buzzers will be enabled in {Math.ceil(countdownLeft)} seconds
                </div>
              )}

              {game.buzzersLocked && !game.countdownActive && (
                <div className="locked-message">
                  Buzzers are currently locked
                </div>
              )}
            </div>
          </div>

          {pressedPlayers.length > 0 && (
            <div className="buzzer-results card">
              <h3>Buzzer Results</h3>
              <div className="results-container">
                <ol className="results-list">
                  {pressedPlayers.map((player, index) => (
                    <li
                      key={player.id}
                      className={`result-item ${player.id === currentPlayer.id ? "current-player" : ""} rank-${index + 1}`}
                    >
                      <span className="rank">
                        {index === 0 && (
                          <Crown size={16} className="crown-icon" />
                        )}
                        {index === 0
                          ? "1st"
                          : index === 1
                            ? "2nd"
                            : index === 2
                              ? "3rd"
                              : `${index + 1}th`}
                      </span>
                      <span className="player-name">{player.name}</span>
                      <span className="timing">
                        {player.buzzerTimestamp && game.questionStartTime
                          ? `${((player.buzzerTimestamp - game.questionStartTime) / 1000).toFixed(2)}s`
                          : ""}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>

        <div className="sidebar">
          <div className="card">
            <PlayerList
              players={Object.values(game.players)}
              currentPlayerId={currentPlayer.id}
              onRemovePlayer={() => { }}
              onRenamePlayer={() => { }}
              isCreator={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerInterface;
