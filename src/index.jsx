import React from "react";
import ReactDOM from "react-dom/client";
import "./app.css";
import Timeline from "./components/Timeline.jsx";
import timelineItems from "./timelineItems.js";

function App() {
  return (
    <div className="app-container">
      <h1>Timeline Visualization</h1>
      <div className="timeline-wrapper">
        <Timeline items={timelineItems} />
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);