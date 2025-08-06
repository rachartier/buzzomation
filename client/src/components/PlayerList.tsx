import React, { useState } from "react";
import { Player } from "../types/game";
import "./PlayerList.css";

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string;
  onRemovePlayer: (playerId: string) => void;
  onRenamePlayer: (playerId: string, newName: string) => void;
  isCreator: boolean;
}

const PlayerList: React.FC<PlayerListProps> = ({
  players,
  currentPlayerId,
  onRemovePlayer,
  onRenamePlayer,
  isCreator,
}) => {
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleStartEdit = (player: Player) => {
    setEditingPlayerId(player.id);
    setEditName(player.name);
  };

  const handleSaveEdit = () => {
    if (editingPlayerId && editName.trim()) {
      onRenamePlayer(editingPlayerId, editName.trim());
    }
    setEditingPlayerId(null);
    setEditName("");
  };

  const handleCancelEdit = () => {
    setEditingPlayerId(null);
    setEditName("");
  };

  return (
    <div className="player-list">
      <h3>Players ({players.length - 1})</h3>
      <div className="players">
        {players.map((player) => (
          <div
            key={player.id}
            className={`player-item ${player.buzzerPressed ? "buzzed" : ""} ${player.id === currentPlayerId ? "current-player" : ""}`}
          >
            <div className="player-info">
              <div className="player-status">
                {player.isCreator && (
                  <span className="creator-badge">Host</span>
                )}
                {player.buzzerPressed && (
                  <span className="buzzer-indicator">●</span>
                )}
              </div>

              {editingPlayerId === player.id ? (
                <div className="edit-name">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
                    autoFocus
                  />
                  <div className="edit-buttons">
                    <button onClick={handleSaveEdit} className="btn-save">
                      ✓
                    </button>
                    <button onClick={handleCancelEdit} className="btn-cancel">
                      ✗
                    </button>
                  </div>
                </div>
              ) : (
                <span className="player-name">{player.name}</span>
              )}
            </div>

            {isCreator && player.id !== currentPlayerId && (
              <div className="player-actions">
                <button
                  onClick={() => handleStartEdit(player)}
                  className="btn-edit"
                  title="Rename player"
                >
                  Edit
                </button>
                <button
                  onClick={() => onRemovePlayer(player.id)}
                  className="btn-remove"
                  title="Remove player"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;
