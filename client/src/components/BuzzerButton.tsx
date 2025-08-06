import React from "react";
import "./BuzzerButton.css";

interface BuzzerButtonProps {
  onPress: () => void;
  isPressed: boolean;
  isLocked: boolean;
  isActive: boolean;
  isFirst?: boolean;
}

const BuzzerButton: React.FC<BuzzerButtonProps> = ({
  onPress,
  isPressed,
  isLocked,
  isActive,
  isFirst = false,
}) => {
  const handleClick = () => {
    if (!isPressed && !isLocked && isActive) {
      onPress();
    }
  };

  const getButtonClass = () => {
    let className = "buzzer-button";

    if (isPressed) {
      className += " pressed";
      if (isFirst) {
        className += " first-place";
      }
    } else if (isLocked) {
      className += " locked";
    } else if (!isActive) {
      className += " inactive";
    } else {
      className += " ready";
    }

    return className;
  };

  const getButtonText = () => {
    if (isPressed) return "BUZZED!";
    if (isLocked) return "LOCKED";
    if (!isActive) return "WAITING...";
    return "BUZZ";
  };

  return (
    <div className="buzzer-container">
      <button
        className={getButtonClass()}
        onClick={handleClick}
        disabled={isPressed || isLocked || !isActive}
      >
        <span className="buzzer-text">{getButtonText()}</span>
      </button>
    </div>
  );
};

export default BuzzerButton;
