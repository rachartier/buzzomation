import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Share2, Copy } from "lucide-react";
import "./QRCodeDisplay.css";

interface QRCodeDisplayProps {
  gameCode: string;
  shareUrl: string;
  onCopyCode?: () => void;
  onCopyLink?: () => void;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  gameCode,
  shareUrl,
  onCopyCode,
  onCopyLink,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, shareUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
    }
  }, [shareUrl]);

  const copyToClipboard = async (text: string): Promise<boolean> => {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        console.warn("Clipboard API failed, trying fallback:", error);
      }
    }

    // Fallback for older browsers or non-HTTPS environments
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (!successful) {
        throw new Error("execCommand failed");
      }

      return true;
    } catch (error) {
      console.error("All copy methods failed:", error);
      return false;
    }
  };

  const handleCopyCode = async () => {
    const success = await copyToClipboard(gameCode);
    if (success) {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
      onCopyCode?.();
    } else {
      // Show error or alternative action
      alert(`Copy failed. Game code: ${gameCode}`);
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      onCopyLink?.();
    } else {
      // Show error or alternative action
      alert(`Copy failed. Share link: ${shareUrl}`);
    }
  };

  return (
    <div className="qr-code-display">
      <h3>Join the Game</h3>

      <div className="qr-code-container">
        <canvas ref={canvasRef} />
      </div>

      <div className="join-options">
        <div className="join-option">
          <div className="option-label">Game Code</div>
          <button
            className={`option-button code-button ${codeCopied ? "copied" : ""}`}
            onClick={handleCopyCode}
          >
            <span className="code-display">{gameCode}</span>
            <Copy size={16} />
          </button>
          {codeCopied && <div className="copied-indicator">Copied!</div>}
        </div>

        <div className="join-option">
          <div className="option-label">Share Link</div>
          <button
            className={`option-button link-button ${linkCopied ? "copied" : ""}`}
            onClick={handleCopyLink}
          >
            <Share2 size={16} />
            <span>{linkCopied ? "Link Copied!" : "Copy Link"}</span>
          </button>
        </div>
      </div>

      <p className="qr-instructions">
        Scan QR code, enter game code, or share the link
      </p>
    </div>
  );
};

export default QRCodeDisplay;
