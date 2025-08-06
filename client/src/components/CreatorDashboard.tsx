import React, { useState, useEffect } from "react";
import {
  Clock,
  Users,
  Zap,
  Play,
  Square,
  RotateCcw,
  Lock,
  Unlock,
  Crown,
} from "lucide-react";
import { useGameContext } from "../contexts/GameContext";
import PlayerList from "./PlayerList";
import QRCodeDisplay from "./QRCodeDisplay";
import "./CreatorDashboard.css";

const CreatorDashboard: React.FC = () => {
  const {
    gameState,
    setQuestion,
    startQuestion,
    instantLaunch,
    stopQuestion,
    clearBuzzers,
    lockBuzzers,
    unlockBuzzers,
    removePlayer,
    renamePlayer,
  } = useGameContext();
  const [questionText, setQuestionText] = useState("");
  const [timeLimit, setTimeLimit] = useState(30);
  const [countdownDelay, setCountdownDelay] = useState(3);
  const [timeLeft, setTimeLeft] = useState(0);
  const [countdownLeft, setCountdownLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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

  const handleStartQuestion = () => {
    if (questionText.trim()) {
      setQuestion(questionText.trim(), timeLimit);
      // Start the question with countdown after setting it
      setTimeout(() => {
        startQuestion(countdownDelay);
      }, 100);
    }
  };

  const handleInstantLaunch = () => {
    instantLaunch(timeLimit, countdownDelay);
  };

  const handleStopQuestion = () => {
    stopQuestion();
  };

  const getPressedPlayers = () => {
    if (!game) return [];
    return Object.values(game.players)
      .filter((player) => player.buzzerPressed)
      .sort((a, b) => (a.buzzerTimestamp || 0) - (b.buzzerTimestamp || 0));
  };

  if (!game || !currentPlayer?.isCreator) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const pressedPlayers = getPressedPlayers();
  const gameUrl = `${window.location.origin}?join=${game.code}`;

  return (
    <div className="creator-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-logo">
              <img
                src="/buzzomation.png"
                alt="Buzzomation"
                className="logo-image"
              />
            </div>
            <div className="game-title">
              <h1>{game.name}</h1>
              <p className="subtitle">Host Dashboard</p>
            </div>
          </div>

          {/* Stats */}
          <div className="game-stats">
            <div className="stat">
              <div className="stat-number">
                <Users size={20} />
                {
                  Object.keys(game.players).length -
                  1 /* Exclude creator from count */
                }
              </div>
              <div className="stat-label">Players</div>
            </div>
            <div className="stat">
              <div className="stat-number">
                <Zap size={20} />
                {pressedPlayers.length}
              </div>
              <div className="stat-label">Buzzed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Left Column */}
        <div className="left-panel">
          {/* Question Setup */}
          <div className="card">
            <h3>Question Setup</h3>

            <div className="question-input-group">
              {/* Question Input */}
              <div>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="What's your question?"
                  rows={3}
                  className="question-textarea"
                />
              </div>
              {/* Time Limit & Actions Row */}
              <div className="controls-row">
                <div className="time-inputs">
                  <div className="time-input">
                    <label>
                      <Clock size={18} />
                      Timer
                    </label>
                    <select
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      className="time-select"
                    >
                      <option value={10}>10s</option>
                      <option value={15}>15s</option>
                      <option value={30}>30s</option>
                      <option value={45}>45s</option>
                      <option value={60}>1m</option>
                      <option value={120}>2m</option>
                      <option value={300}>5m</option>
                    </select>
                  </div>

                  <div className="time-input">
                    <label>
                      <Zap size={18} />
                      Countdown
                    </label>
                    <select
                      value={countdownDelay}
                      onChange={(e) => setCountdownDelay(Number(e.target.value))}
                      className="time-select"
                    >
                      <option value={1}>1s</option>
                      <option value={2}>2s</option>
                      <option value={3}>3s</option>
                      <option value={5}>5s</option>
                      <option value={10}>10s</option>
                    </select>
                  </div>
                </div>

                <div className="question-controls">
                  <button
                    onClick={handleStartQuestion}
                    disabled={!questionText.trim() || game.isActive || game.countdownActive}
                    className="btn btn-success"
                  >
                    <Play size={16} />
                    Start
                  </button>
                  <button
                    onClick={handleInstantLaunch}
                    disabled={game.isActive || game.countdownActive}
                    className="btn btn-primary"
                    title="Launch buzzer session without a question"
                  >
                    <Zap size={16} />
                    Instant Launch
                  </button>
                  {(game.isActive || game.countdownActive) && (
                    <button
                      onClick={handleStopQuestion}
                      className="btn btn-danger"
                    >
                      <Square size={16} />
                      Stop
                    </button>
                  )}
                </div>
              </div>{" "}
            </div>
          </div>

          {/* Current Question */}
          <div className="card">
            <h3>Current Question</h3>

            {game.currentQuestion ? (
              <div>
                <div className="question-display">
                  {game.currentQuestion === "Open Buzzer Session" ? (
                    <div className="instant-launch-display">
                      <div className="instant-launch-icon">
                        <Zap size={24} />
                      </div>
                      <div className="instant-launch-text">
                        Open Buzzer Session
                      </div>
                      <div className="instant-launch-subtitle">
                        Players can buzz in without a specific question
                      </div>
                    </div>
                  ) : (
                    <div className="question-text">"{game.currentQuestion}"</div>
                  )}
                </div>
                <div className="question-status">
                  {game.countdownActive ? (
                    <div className="countdown-timer">
                      <div className="status-indicator countdown">STARTING IN</div>
                      <div className="countdown-display">
                        <div className="countdown-number">
                          {Math.ceil(countdownLeft)}
                        </div>
                        <span className="countdown-unit">seconds</span>
                      </div>
                    </div>
                  ) : game.isActive ? (
                    <div className="active-timer">
                      <div className="status-indicator active">LIVE</div>
                      <div className="timer-display-question">
                        <Clock size={16} />
                        <span className="timer-number">
                          {" "}
                          {Math.ceil(timeLeft)}
                        </span>
                        <span className="timer-unit"> seconds left</span>
                      </div>
                    </div>
                  ) : (
                    <div className="status-indicator ready">Ready to start</div>
                  )}
                </div>{" "}
              </div>
            ) : (
              <div className="no-question">
                <p>No question set yet</p>
                <p className="hint">Create a question above to get started!</p>
              </div>
            )}
          </div>

          {/* Buzzer Results */}
          <div className="card">
            <div className="question-status">
              <h3>Buzzer Results</h3>

              <div className="control-buttons">
                <button
                  onClick={clearBuzzers}
                  disabled={pressedPlayers.length === 0}
                  className="btn btn-warning"
                >
                  <RotateCcw size={14} />
                  Clear All
                </button>
                <button
                  onClick={game.buzzersLocked ? unlockBuzzers : lockBuzzers}
                  className={`btn ${game.buzzersLocked ? "btn-success" : "btn-danger"}`}
                >
                  {game.buzzersLocked ? (
                    <Unlock size={14} />
                  ) : (
                    <Lock size={14} />
                  )}
                  {game.buzzersLocked ? "Unlock" : "Lock"}
                </button>
              </div>
            </div>
            {game.buzzersLocked && (
              <div className="lock-notice">Buzzers are currently locked</div>
            )}
            {pressedPlayers.length > 0 ? (
              <div className="results-container">
                <div className="results-header">
                  <div>Rank</div>
                  <div>Player</div>
                  <div>Time</div>
                </div>
                <ul className="results-list">
                  {pressedPlayers.map((player, index) => (
                    <li
                      key={player.id}
                      className={`result-item rank-${index + 1} buzzer-entry`}
                    >
                      <div className="rank">
                        {index === 0 && (
                          <Crown size={16} className="crown-icon" />
                        )}
                        {index + 1}
                      </div>
                      <div className="player-name">{player.name}</div>
                      <div className="timestamp">
                        {player.buzzerTimestamp && game.questionStartTime
                          ? `${((player.buzzerTimestamp - game.questionStartTime) / 1000).toFixed(2)}s`
                          : "N/A"}
                      </div>
                    </li>
                  ))}
                </ul>{" "}
              </div>
            ) : (
              <div className="no-results">
                <Zap
                  size={48}
                  className="buzzer-icon"
                  style={{
                    display: "inline-block",
                    animation: "pulse-glow 2s ease-in-out infinite",
                  }}
                />
                <p>No buzzers pressed yet</p>
                <p className="hint">
                  Players will appear here when they buzz in!
                </p>
              </div>
            )}{" "}
          </div>
        </div>

        {/* Right Column */}
        <div className="right-panel">
          {/* Player List */}
          <div className="card">
            <PlayerList
              players={Object.values(game.players)}
              currentPlayerId={currentPlayer.id}
              onRemovePlayer={removePlayer}
              onRenamePlayer={renamePlayer}
              isCreator={true}
            />
          </div>

          <div className="card">
            <QRCodeDisplay
              gameCode={game.code}
              shareUrl={gameUrl}
              onCopyCode={() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              onCopyLink={() => {
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default CreatorDashboard;
