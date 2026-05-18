import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Insights from "./Insights";
import Settings from "./Settings";
import "./App.css";

function App() {
  // Timer settings
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

  // Session data
  const [sessions, setSessions] = useState(() => {
    return JSON.parse(localStorage.getItem("sessions")) || [];
  });

  const [tag, setTag] = useState("");
  const [moduleInput, setModuleInput] = useState("");
  const [selectedModule, setSelectedModule] = useState("");

  const [savedModules, setSavedModules] = useState(() => {
    return JSON.parse(localStorage.getItem("savedModules")) || [];
  });

  // UI state
  const [view, setView] = useState("timer");
  const [showSessionSetup, setShowSessionSetup] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return JSON.parse(localStorage.getItem("notificationsEnabled")) ?? false;
  });

  const [reduceMotion, setReduceMotion] = useState(() => {
    return JSON.parse(localStorage.getItem("reduceMotion")) ?? false;
  });

  const hasLoggedRef = useRef(false);

  const [breakNudge, setBreakNudge] = useState("");

  const nudgeMessages = [
    "Stand up and stretch for a moment",
    "Take a sip of water",
    "Look away from the screen — rest your eyes",
    "Roll your shoulders and relax your jaw",
    "Take three slow, deep breaths",
    "Step away from your desk briefly",
    "Unclench your hands and shake them out",
    "You're doing well — rest is part of the process",
  ];

  // Derived timer values
  const activeDuration = (mode === "focus" ? focusDuration : breakDuration) * 60;
  const progress = activeDuration > 0 ? timeLeft / activeDuration : 0;
  const circleCircumference = 2 * Math.PI * 100;
  const strokeDashoffset = circleCircumference - progress * circleCircumference;

  const formattedTime = `${Math.floor(timeLeft / 60)}:${(timeLeft % 60)
    .toString()
    .padStart(2, "0")}`;

  const currentSessionParts = [selectedModule, tag.trim()].filter(Boolean);
  const currentSessionTag = currentSessionParts.join(" - ").toLowerCase() || "untitled";

  // Countdown interval
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((previousTime) => {
        if (previousTime <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          return 0;
        }

        return previousTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Handle completed focus/break sessions
  useEffect(() => {
    if (timeLeft !== 0) return;

    if (mode === "focus") {
      completeFocusSession();
      switchToBreakMode();
      return;
    }

    switchToFocusMode();
  }, [timeLeft, mode]);

  // Persist user settings/data
  useEffect(() => {
    localStorage.setItem("focusDuration", focusDuration);
  }, [focusDuration]);

  useEffect(() => {
    localStorage.setItem("breakDuration", breakDuration);
  }, [breakDuration]);

  useEffect(() => {
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("savedModules", JSON.stringify(savedModules));
  }, [savedModules]);

  useEffect(() => {
    localStorage.setItem(
      "notificationsEnabled",
      JSON.stringify(notificationsEnabled)
    );
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem("reduceMotion", JSON.stringify(reduceMotion));
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
  }, [reduceMotion]);

  // Reset timer when focus duration changes
  useLayoutEffect(() => {
    if (mode !== "focus") return;

    resetTimer("focus", focusDuration);
  }, [focusDuration]);

  // Reset timer when break duration changes
  useLayoutEffect(() => {
    if (mode !== "break") return;

    resetTimer("break", breakDuration);
  }, [breakDuration]);

  // Insight stats
  const totalFocusSessions = sessions.length;
  const totalFocusMinutes = sessions.reduce((sum, session) => {
    return sum + session.duration;
  }, 0);

  const tagCounts = sessions.reduce((counts, session) => {
    const sessionTag = session.tag || "untitled";

    if (sessionTag === "untitled") return counts;

    return {
      ...counts,
      [sessionTag]: (counts[sessionTag] || 0) + session.duration,
    };
  }, {});

  const mostUsedTag = getMostUsedTag(tagCounts);

  // Timer helpers
  function resetTimer(nextMode = "focus", duration = focusDuration) {
    setIsRunning(false);
    setMode(nextMode);
    setTimeLeft(duration * 60);
    hasLoggedRef.current = false;
  }

  function completeFocusSession() {
    if (hasLoggedRef.current) return;

    setSessions((previousSessions) => [
      ...previousSessions,
      {
        type: "focus",
        duration: focusDuration,
        tag: currentSessionTag,
        completedAt: new Date().toISOString(),
      },
    ]);

    hasLoggedRef.current = true;
  }

  function switchToBreakMode() {
    const randomNudge = nudgeMessages[Math.floor(Math.random() * nudgeMessages.length)];
    setBreakNudge(randomNudge);
    sendNotification("Focus session complete", randomNudge);
    setMode("break");
    setTimeLeft(breakDuration * 60);
  }

  function switchToFocusMode() {
    sendNotification("Break finished", "Ready to focus again?");
    setMode("focus");
    setTimeLeft(focusDuration * 60);
    hasLoggedRef.current = false;
  }

  function sendNotification(title, body) {
    if (!notificationsEnabled) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    new Notification(title, { body });
  }

  // Module/tag helpers
  function addModuleTag() {
    const normalisedModule = moduleInput.trim();
    if (!normalisedModule) return;

    const alreadyExists = savedModules.some((module) => {
      return module.toLowerCase() === normalisedModule.toLowerCase();
    });

    if (!alreadyExists) {
      setSavedModules((previousModules) => [
        ...previousModules,
        normalisedModule,
      ]);
    }

    setModuleInput("");
  }

  function removeModule(moduleToRemove) {
    setSavedModules((previousModules) => {
      return previousModules.filter((module) => module !== moduleToRemove);
    });

    if (selectedModule === moduleToRemove) {
      setSelectedModule("");
    }
  }

  function updateFocusDuration(newDuration) {
    setFocusDuration(newDuration);
  }

  function updateBreakDuration(newDuration) {
    setBreakDuration(newDuration);
  }

  function getMostUsedTag(counts) {
    const entries = Object.entries(counts);

    if (entries.length === 0) return "None yet";

    const highestCount = Math.max(...entries.map(([, count]) => count));
    const topTags = entries
      .filter(([, count]) => count === highestCount)
      .map(([sessionTag]) => sessionTag);

    return topTags.length === 1 ? topTags[0] : "Multiple";
  }

  // Page views
  if (view === "insights") {
    return (
      <div className="app-shell">
        <div className="back-row">
          <button className="secondary-button" onClick={() => setView("timer")}>
            ← Back to Timer
          </button>
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

  if (view === "settings") {
    return (
      <div className="app-shell">
        <div className="back-row">
          <button className="secondary-button" onClick={() => setView("timer")}>
            ← Back to Timer
          </button>
        </div>

        <Settings
          focusDuration={focusDuration}
          breakDuration={breakDuration}
          updateFocusDuration={updateFocusDuration}
          updateBreakDuration={updateBreakDuration}
          moduleInput={moduleInput}
          setModuleInput={setModuleInput}
          addModuleTag={addModuleTag}
          savedModules={savedModules}
          selectedModule={selectedModule}
          setSelectedModule={setSelectedModule}
          removeModule={removeModule}
          tag={tag}
          setTag={setTag}
          notificationsEnabled={notificationsEnabled}
          setNotificationsEnabled={setNotificationsEnabled}
          reduceMotion={reduceMotion}
          setReduceMotion={setReduceMotion}
          sessions={sessions}
          setSessions={setSessions}
          applySettings={() => resetTimer("focus", focusDuration)}
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
              placeItems: "center",
            }}
          >
            <svg
              className="timer-ring"
              viewBox="0 0 240 240"
              aria-hidden="true"
              style={{
                width: "100%",
                height: "100%",
                transform: "rotate(-90deg)",
                overflow: "visible",
              }}
            >
              <defs>
                <linearGradient
                  id="timerGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
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
                  strokeDashoffset,
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
                textAlign: "center",
              }}
            >
              <div className="timer-display">{formattedTime}</div>

              <h2
                className="mode-label timer-mode-inside"
                style={{ margin: 0, fontSize: "1rem" }}
              >
                {mode === "focus" ? "Focus" : "Break"}
              </h2>

              {mode === "break" && breakNudge && (
                <p className="break-nudge">{breakNudge}</p>
              )}
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
              onClick={() => resetTimer("focus", focusDuration)}
            >
              Reset
            </button>

            <button
              className="secondary-button"
              onClick={() => setView("insights")}
            >
              View Insights
            </button>

            <button
              className="secondary-button"
              onClick={() => setView("settings")}
            >
              Settings
            </button>
          </div>

          <div className="session-setup-card compact-session-setup">
            <div className="session-summary-row">
              <div>
                <h3 className="section-title">Current session</h3>

                <div className="session-pill-wrap">
                  {currentSessionParts.length > 0 ? (
                    <>
                      {selectedModule && (
                        <span className="session-pill">{selectedModule}</span>
                      )}

                      {tag.trim() && (
                        <span className="session-pill secondary">
                          {tag.trim()}
                        </span>
                      )}
                    </>
                  ) : (
                    <p className="muted-text">
                      Choose a module or focus intention
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="secondary-button session-toggle-button"
                onClick={() => setShowSessionSetup((previousValue) => !previousValue)}
              >
                {showSessionSetup ? "Done" : "Edit"}
              </button>
            </div>

            {showSessionSetup && (
              <div className="session-setup-grid">
                <label>
                  Module
                  <select
                    value={selectedModule}
                    onChange={(event) => setSelectedModule(event.target.value)}
                  >
                    <option value="">None</option>
                    {savedModules.map((module) => (
                      <option key={module} value={module}>
                        {module}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Optional tag
                  <input
                    type="text"
                    value={tag}
                    onChange={(event) => setTag(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        setShowSessionSetup(false);
                      }
                    }}
                    placeholder="e.g. lecture, essay, deep work"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="quick-timer-settings">
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
                  onChange={(event) => {
                    updateFocusDuration(Number(event.target.value));
                  }}
                />

                <div className="preset-row">
                  {[25, 45, 60].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={`preset-button ${
                        focusDuration === preset ? "preset-active" : ""
                      }`}
                      onClick={() => updateFocusDuration(preset)}
                    >
                      {preset}m
                    </button>
                  ))}
                </div>
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
                  onChange={(event) => {
                    updateBreakDuration(Number(event.target.value));
                  }}
                />

                <div className="preset-row">
                  {[5, 10, 15].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={`preset-button ${
                        breakDuration === preset ? "preset-active" : ""
                      }`}
                      onClick={() => updateBreakDuration(preset)}
                    >
                      {preset}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
