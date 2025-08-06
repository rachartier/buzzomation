import React, { useState, useEffect } from "react";
import { useGameContext } from "../contexts/GameContext";
import "./HomePage.css";

const HomePage: React.FC = () => {
  const [mode, setMode] = useState<"menu" | "create" | "join">("menu");
  const [gameName, setGameName] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [urlJoinCode, setUrlJoinCode] = useState<string | null>(null);
  const { createGame, joinGame, error } = useGameContext();

  useEffect(() => {
    console.log("Mode changed to:", mode);
  }, [mode]);

  useEffect(() => {
    // Check for URL join parameter
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get("join");

    if (joinCode) {
      setUrlJoinCode(joinCode);
      setGameCode(joinCode.toUpperCase());
      setMode("join");
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleCreateButtonClick = () => {
    setMode("create");
  };

  const handleJoinButtonClick = () => {
    setMode("join");
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gameName.trim() || !creatorName.trim()) {
      return;
    }

    setLoading(true);
    try {
      const result = await createGame(gameName.trim(), creatorName.trim());
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameCode.trim() || !playerName.trim()) return;

    setLoading(true);
    try {
      await joinGame(gameCode.trim().toUpperCase(), playerName.trim());
    } catch (err) {
      console.error("Failed to join game:", err);
    } finally {
      setLoading(false);
    }
  };

  if (mode === "create") {
    return (
      <div className="home-container" key="create-mode">
        <div className="home-card">
          <div className="card-header">
            <h1>Create Game</h1>
            <p>Set up a new buzzer game session</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleCreateGame} className="form">
            <div className="form-group">
              <label htmlFor="gameName">Game Name</label>
              <input
                type="text"
                id="gameName"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder=""
                disabled={loading}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="creatorName">Your Name (Host)</label>
              <input
                type="text"
                id="creatorName"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="Enter your name"
                disabled={loading}
                required
                className="form-input"
              />
            </div>

            <div className="button-group">
              <button
                type="submit"
                disabled={loading || !gameName.trim() || !creatorName.trim()}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Creating...
                  </>
                ) : (
                  "Create Game"
                )}
              </button>
              <button
                type="button"
                onClick={() => setMode("menu")}
                className="btn btn-secondary"
                disabled={loading}
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (mode === "join") {
    return (
      <div className="home-container" key="join-mode">
        <div className="home-card">
          <div className="card-header">
            <h1>Join Game</h1>
            <p>
              {urlJoinCode
                ? `Joining game with code: ${urlJoinCode}`
                : "Enter the game code to join an existing session"}
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleJoinGame} className="form">
            <div className="form-group">
              <label htmlFor="gameCode">Game Code</label>
              <input
                type="text"
                id="gameCode"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                maxLength={6}
                disabled={loading || !!urlJoinCode}
                required
                className="form-input code-input"
              />
              <div className="input-hint">
                Ask the host for the 6-character game code
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="playerName">Your Name</label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                disabled={loading}
                required
                className="form-input"
              />
            </div>

            <div className="button-group">
              <button
                type="submit"
                disabled={loading || !gameCode.trim() || !playerName.trim()}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Joining...
                  </>
                ) : (
                  "Join Game"
                )}
              </button>
              <button
                type="button"
                onClick={() => setMode("menu")}
                className="btn btn-secondary"
                disabled={loading}
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container" key="menu-mode">
      <div className="home-content">
        <div className="brand">
          <div className="brand-logo">
            <img
              src="/buzzomation.png"
              alt="Buzzomation"
              className="logo-image"
            />
          </div>
          <h1 className="brand-title">Buzzomation</h1>
        </div>

        <div className="main-actions">
          <button
            type="button"
            onClick={handleCreateButtonClick}
            className="action-button primary"
          >
            <span className="action-title">Create Game</span>
            <span className="action-desc">Host a new session</span>
          </button>

          <button
            type="button"
            onClick={handleJoinButtonClick}
            className="action-button secondary"
          >
            <span className="action-title">Join Game</span>
            <span className="action-desc">Enter with code</span>
          </button>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <div className="info-number">1</div>
            <div className="info-text">Create or join game</div>
          </div>
          <div className="info-item">
            <div className="info-number">2</div>
            <div className="info-text">Share game code</div>
          </div>
          <div className="info-item">
            <div className="info-number">3</div>
            <div className="info-text">Buzz in to answer</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
