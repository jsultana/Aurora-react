import { useState, useEffect, useRef } from "react";
import Insights from "./Insights";
import "./App.css";

function App() {
const [focusDuration, setFocusDuration] = useState(() => {
  return Number(localStorage.getItem("focusDuration")) || 25;
});

const [breakDuration, setBreakDuration] = useState(() => {
  return Number(localStorage.getItem("breakDuration")) || 5;
});

const [timeLeft, setTimeLeft] = useState(() => {
  const savedFocus = Number(localStorage.getItem("focusDuration")) || 25;
  return savedFocus * 60;
});

const [isRunning, setIsRunning] = useState(false);
const [mode, setMode] = useState("focus");

const [sessions, setSessions] = useState(() => {
  return JSON.parse(localStorage.getItem("sessions")) || [];
});  

const [tag, setTag] = useState("");
const [moduleInput, setModuleInput] = useState("");
const [savedModules, setSavedModules] = useState(() => {
  return JSON.parse(localStorage.getItem("savedModules")) || [];
});
const [selectedModule, setSelectedModule] = useState("");

const [view, setView] = useState("timer");

const hasLoggedRef = useRef(false);
const activeDuration = (mode === "focus" ? focusDuration : breakDuration) * 60;
const progress = activeDuration > 0 ? timeLeft / activeDuration : 0;
const circleCircumference = 2 * Math.PI * 100;
const strokeDashoffset = circleCircumference - progress * circleCircumference;

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, focusDuration, breakDuration]);

  useEffect(() => {
    if (timeLeft !== 0) return;

    if (mode === "focus") {
      if (!hasLoggedRef.current) {
        setSessions((prevSessions) => [
          ...prevSessions,
          {
            type: "focus",
            duration: focusDuration,
            tag:
              [selectedModule, tag.trim()]
                .filter(Boolean)
                .join(" - ")
                .toLowerCase() || "untitled",
            completedAt: new Date().toISOString()
          }
        ]);
        hasLoggedRef.current = true;
      }

      setMode("break");
      setTimeLeft(breakDuration * 60);
    } else {
      setMode("focus");
      setTimeLeft(focusDuration * 60);
    }
  }, [timeLeft, mode, focusDuration, breakDuration]);

// saving focusDuration
  useEffect(() => {
  localStorage.setItem("focusDuration", focusDuration);
}, [focusDuration]);

// saving breakDuration
useEffect(() => {
  localStorage.setItem("breakDuration", breakDuration);
}, [breakDuration]);

// saving sessions 
useEffect(() => {
  localStorage.setItem("sessions", JSON.stringify(sessions));
}, [sessions]);

useEffect(() => {
  localStorage.setItem("savedModules", JSON.stringify(savedModules));
}, [savedModules]);

  const totalFocusSessions = sessions.length;
  const totalFocusMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);

  const tagCounts = {};

  sessions.forEach((session) => {
    const sessionTag = session.tag || "untitled";
    tagCounts[sessionTag] = (tagCounts[sessionTag] || 0) + 1;
  });

  let mostUsedTag = "None yet";
let highestCount = 0;
let topTags = [];

for (const sessionTag in tagCounts) {
  if (tagCounts[sessionTag] > highestCount) {
    highestCount = tagCounts[sessionTag];
    topTags = [sessionTag];
  } else if (tagCounts[sessionTag] === highestCount) {
    topTags.push(sessionTag);
  }
}

if (topTags.length === 1) {
  mostUsedTag = topTags[0];
} else if (topTags.length > 1) {
  mostUsedTag = "Multiple";
}

  function addModuleTag() {
    const normalisedModule = moduleInput.trim();

    if (!normalisedModule) return;

    const alreadyExists = savedModules.some(
      (module) => module.toLowerCase() === normalisedModule.toLowerCase()
    );

    if (alreadyExists) {
      setModuleInput("");
      return;
    }

    setSavedModules([...savedModules, normalisedModule]);
    setModuleInput("");
  }

  if (view === "insights") {
    return (
      <div className="app-shell">
        <div className="back-row">
          <button className="secondary-button" onClick={() => setView("timer")}>← Back to Timer</button>
        </div>
        <Insights
          sessions={sessions}
          totalFocusSessions={totalFocusSessions}
          totalFocusMinutes={totalFocusMinutes}
          mostUsedTag={mostUsedTag}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="page-card">
        <div className="timer-hero">
          <h1 className="timer-title">Aurora</h1>

          <div
            className="timer-circle-wrap"
            style={{
              position: "relative",
              width: "min(78vw, 320px)",
              aspectRatio: "1",
              margin: "8px auto 28px",
              display: "grid",
              placeItems: "center"
            }}
          >
            <svg
              className="timer-ring"
              viewBox="0 0 240 240"
              width="320"
              height="320"
              aria-hidden="true"
              style={{ width: "100%", height: "100%", transform: "rotate(-90deg)", overflow: "visible" }}
            >
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c5a6ff" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
              <circle
                className="timer-ring-track"
                cx="120"
                cy="120"
                r="100"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="10"
              />
              <circle
                className="timer-ring-progress"
                cx="120"
                cy="120"
                r="100"
                fill="none"
                stroke="url(#timerGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                style={{
                  filter: "drop-shadow(0 0 10px rgba(197, 166, 255, 0.5))",
                  transition: "stroke-dashoffset 0.5s linear",
                  strokeDasharray: circleCircumference,
                  strokeDashoffset
                }}
              />
            </svg>

            <div
              className="timer-center"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                textAlign: "center"
              }}
            >
              <div className="timer-display">
                {Math.floor(timeLeft / 60)}:
                {(timeLeft % 60).toString().padStart(2, "0")}
              </div>
              <h2 className="mode-label timer-mode-inside" style={{ margin: 0, fontSize: "1rem" }}>
                {mode === "focus" ? "Focus" : "Break"}
              </h2>
            </div>
          </div>

          <div className="button-row">
            <button
              disabled={isRunning}
              onClick={() => {
                hasLoggedRef.current = false;
                setIsRunning(true);
              }}
            >
              Start
            </button>
            <button
              className="secondary-button"
              disabled={!isRunning}
              onClick={() => setIsRunning(false)}
            >
              Pause
            </button>
            <button
              className="secondary-button"
              onClick={() => {
                setIsRunning(false);
                setMode("focus");
                setTimeLeft(focusDuration * 60);
              }}
            >
              Reset
            </button>
            <button className="secondary-button" onClick={() => setView("insights")}>
              📊 View Insights
            </button>
          </div>
        </div>

        <div className="settings-card">
          <h3 className="section-title">Settings</h3>

          <div className="slider-grid">
            <div className="slider-card">
              <div className="slider-label-row">
                <span>Focus duration</span>
                <strong>{focusDuration} min</strong>
              </div>
              <input
                className="duration-slider"
                type="range"
                min="5"
                max="120"
                step="5"
                value={focusDuration}
                onChange={(e) => setFocusDuration(Number(e.target.value))}
              />
            </div>

            <div className="slider-card">
              <div className="slider-label-row">
                <span>Break duration</span>
                <strong>{breakDuration} min</strong>
              </div>
              <input
                className="duration-slider"
                type="range"
                min="5"
                max="30"
                step="5"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="settings-stack compact-settings-stack">
            <div>
              <h4>Saved Modules</h4>
              <div className="inline-row">
                <input
                  type="text"
                  value={moduleInput}
                  onChange={(e) => setModuleInput(e.target.value)}
                  placeholder="Add a module e.g. FYP"
                />
                <button type="button" onClick={addModuleTag}>
                  Add Module
                </button>
              </div>
            </div>

            <div>
              <label>
                Select module:
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                >
                  <option value="">None</option>
                  {savedModules.map((module) => (
                    <option key={module} value={module}>
                      {module}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <label>
                Session tag:
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="Add extra tag e.g. deep work"
                />
              </label>
            </div>

            <div className="button-row" style={{ justifyContent: "flex-start", marginBottom: 0 }}>
              <button
                onClick={() => {
                  setIsRunning(false);
                  setMode("focus");
                  setTimeLeft(focusDuration * 60);
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
