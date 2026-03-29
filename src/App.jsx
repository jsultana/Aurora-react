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
          <h2 className="mode-label">{mode === "focus" ? "Focus" : "Break"}</h2>

          <div className="timer-display">
            {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}
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

          <div className="settings-grid">
            <div>
              <label>
                Focus (minutes):
                <input
                  type="number"
                  min="1"
                  value={focusDuration}
                  onChange={(e) => setFocusDuration(Number(e.target.value))}
                />
              </label>
            </div>

            <div>
              <label>
                Break (minutes):
                <input
                  type="number"
                  min="1"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(Number(e.target.value))}
                />
              </label>
            </div>
          </div>

          <div className="settings-stack">
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
