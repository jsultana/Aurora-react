function Settings({
  moduleInput,
  setModuleInput,
  addModuleTag,
  savedModules,
  selectedModule,
  setSelectedModule,
  removeModule,
  tag,
  setTag,
  notificationsEnabled,
  setNotificationsEnabled,
  reduceMotion,
  setReduceMotion,
  sessions,
  setSessions,
  applySettings
}) {
  function exportSessions() {
    const data = JSON.stringify(sessions, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aurora-sessions-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function clearAllData() {
    if (!window.confirm("This will permanently delete all your session data. Are you sure?")) {
      return;
    }

    setSessions([]);
    localStorage.removeItem("sessions");
  }

  return (
    <div className="app-shell">
      <div className="page-card">
        <h1>Settings</h1>
        <p className="muted-text">
          Manage your modules and session labels
        </p>

        <div className="settings-card">
          <h3 className="section-title">Session Organisation</h3>

          <div className="settings-stack compact-settings-stack">
            <div className="settings-toggle-row">
              <div>
                <h4>Notifications</h4>

                <p className="muted-text">
                  Get notified when focus or break sessions end
                </p>
              </div>

              <button
                type="button"
                className={`preset-button ${notificationsEnabled ? "preset-active" : ""}`}
                onClick={() => {
                  if (!("Notification" in window)) {
                    alert("This browser does not support notifications.");
                    return;
                  }

                  if (notificationsEnabled) {
                    setNotificationsEnabled(false);
                    return;
                  }

                  if (Notification.permission === "granted") {
                    setNotificationsEnabled(true);
                    return;
                  }

                  if (Notification.permission === "denied") {
                    alert(
                      "Notifications are blocked. Please allow notifications for Aurora in your browser settings."
                    );
                    return;
                  }

                  Notification.requestPermission().then((permission) => {
                    if (permission === "granted") {
                      setNotificationsEnabled(true);
                    }
                  });
                }}
              >
                {notificationsEnabled ? "On" : "Off"}
              </button>
            </div>

            <div className="settings-toggle-row">
              <div>
                <h4>Reduce Motion</h4>

                <p className="muted-text">
                  Disable animations for a calmer experience
                </p>
              </div>

              <button
                type="button"
                className={`preset-button ${reduceMotion ? "preset-active" : ""}`}
                onClick={() => setReduceMotion((prev) => !prev)}
              >
                {reduceMotion ? "On" : "Off"}
              </button>
            </div>

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

              {savedModules.length > 0 && (
                <div className="module-list">
                  {savedModules.map((module) => (
                    <div key={module} className="module-pill">
                      <span>{module}</span>

                      <button
                        type="button"
                        className="module-delete"
                        onClick={() => removeModule(module)}
                        aria-label={`Remove ${module}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
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

            <div
              className="button-row"
              style={{
                justifyContent: "flex-start",
                marginBottom: 0
              }}
            >
              <button onClick={applySettings}>
                Apply
              </button>
            </div>
          </div>
        </div>

        <div className="settings-card">
          <h3 className="section-title">Your Data</h3>

          <p className="muted-text" style={{ marginBottom: "14px" }}>
            All data is stored locally on your device. Nothing is sent to a server.
          </p>

          <div className="button-row" style={{ justifyContent: "flex-start" }}>
            <button
              type="button"
              className="secondary-button"
              onClick={exportSessions}
              disabled={sessions.length === 0}
            >
              Export Sessions (JSON)
            </button>

            <button
              type="button"
              className="danger-button"
              onClick={clearAllData}
              disabled={sessions.length === 0}
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
