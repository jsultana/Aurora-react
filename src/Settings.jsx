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
  applySettings
}) {
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
                onClick={async () => {
                  if (!("Notification" in window)) return;

                  if (notificationsEnabled) {
                    setNotificationsEnabled(false);
                    return;
                  }

                  const permission = await Notification.requestPermission();

                  if (permission === "granted") {
                    setNotificationsEnabled(true);
                  }
                }}
              >
                {notificationsEnabled ? "On" : "Off"}
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
      </div>
    </div>
  );
}

export default Settings;