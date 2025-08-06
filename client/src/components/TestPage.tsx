import React, { useState } from "react";

const TestPage: React.FC = () => {
  const [count, setCount] = useState(0);
  const [mode, setMode] = useState("menu");

  console.log("TestPage render - count:", count, "mode:", mode);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Test Page</h1>
      <p>Count: {count}</p>
      <p>Mode: {mode}</p>
      <button
        onClick={() => {
          console.log("Count button clicked!");
          setCount(count + 1);
        }}
      >
        Increment Count
      </button>
      <button
        onClick={() => {
          console.log("Mode button clicked!");
          setMode(mode === "menu" ? "test" : "menu");
        }}
      >
        Toggle Mode
      </button>
    </div>
  );
};

export default TestPage;
