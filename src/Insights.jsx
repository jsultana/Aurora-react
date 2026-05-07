import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

function Insights({ sessions, totalFocusSessions, totalFocusMinutes, mostUsedTag }) {
  const [timeFilter, setTimeFilter] = useState("all");

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

  const filteredSessions = sessions.filter((session) => {
    const completedDate = new Date(session.completedAt);

    if (timeFilter === "today") {
      return completedDate >= startOfToday;
    }

    if (timeFilter === "week") {
      return completedDate >= startOfWeek;
    }

    return true;
  });

  const filteredTotalFocusSessions = filteredSessions.length;
  const filteredTotalFocusMinutes = filteredSessions.reduce(
    (sum, session) => sum + session.duration,
    0
  );

  const filteredTagCounts = {};

  filteredSessions.forEach((session) => {
    const sessionTag = session.tag || "untitled";

    if (sessionTag === "untitled") return;

    filteredTagCounts[sessionTag] =
      (filteredTagCounts[sessionTag] || 0) + session.duration;
  });

  let filteredMostUsedTag = "None yet";
  let filteredHighestMinutes = 0;
  let filteredTopTags = [];

  for (const sessionTag in filteredTagCounts) {
    if (filteredTagCounts[sessionTag] > filteredHighestMinutes) {
      filteredHighestMinutes = filteredTagCounts[sessionTag];
      filteredTopTags = [sessionTag];
    } else if (filteredTagCounts[sessionTag] === filteredHighestMinutes) {
      filteredTopTags.push(sessionTag);
    }
  }

  if (filteredTopTags.length === 1) {
    filteredMostUsedTag = filteredTopTags[0];
  } else if (filteredTopTags.length > 1) {
    filteredMostUsedTag = "Multiple";
  }
  const tagMinutes = {};

  filteredSessions.forEach((session) => {
    const sessionTag = session.tag || "untitled";
    tagMinutes[sessionTag] = (tagMinutes[sessionTag] || 0) + session.duration;
  });

  const sortedTags = Object.entries(tagMinutes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const totalMinutes = filteredTotalFocusMinutes || 1;

  const tagPercentages = Object.entries(tagMinutes).map(([tag, minutes]) => ({
    tag,
    percentage: ((minutes / totalMinutes) * 100).toFixed(1)
  }));

  const chartRef = useRef(null);
  const pieChartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const pieChartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current || !pieChartRef.current) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    if (pieChartInstanceRef.current) {
      pieChartInstanceRef.current.destroy();
    }

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: Object.keys(tagMinutes),
        datasets: [
          {
            label: "Focus minutes by tag",
            data: Object.values(tagMinutes),
            backgroundColor: "rgba(207, 184, 255, 0.78)",
            borderColor: "rgba(255, 248, 239, 0.38)",
            borderWidth: 1,
            borderRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        aspectRatio: 1.5,
        scales: {
          x: {
            ticks: { color: "#c9bddf" },
            grid: { color: "rgba(255, 255, 255, 0.06)" }
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: "#c9bddf"
            },
            grid: { color: "rgba(255, 255, 255, 0.08)" }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(27, 20, 51, 0.95)",
            titleColor: "#fff8ef",
            bodyColor: "#e9e2ff",
            borderColor: "rgba(203, 186, 255, 0.2)",
            borderWidth: 1
          }
        }
      }
    });

    pieChartInstanceRef.current = new Chart(pieChartRef.current, {
      type: "pie",
      data: {
        labels: Object.keys(tagMinutes),
        datasets: [
          {
            data: Object.values(tagMinutes),
            backgroundColor: [
              "rgba(207, 184, 255, 0.86)",
              "rgba(255, 248, 239, 0.74)",
              "rgba(236, 180, 213, 0.72)",
              "rgba(177, 205, 255, 0.68)",
              "rgba(170, 145, 218, 0.78)"
            ],
            borderColor: "rgba(18, 15, 36, 0.92)",
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        aspectRatio: 1,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#c9bddf",
              boxWidth: 12,
              padding: 14
            }
          },
          tooltip: {
            backgroundColor: "rgba(27, 20, 51, 0.95)",
            titleColor: "#fff8ef",
            bodyColor: "#e9e2ff",
            borderColor: "rgba(203, 186, 255, 0.2)",
            borderWidth: 1
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }

      if (pieChartInstanceRef.current) {
        pieChartInstanceRef.current.destroy();
        pieChartInstanceRef.current = null;
      }
    };
  }, [filteredSessions, tagMinutes]);

  return (
    <div className="app-shell">
      <div className="page-card insights-layout">
        <div style={{ gridColumn: "1 / -1" }}>
          <h1>Aurora Insights</h1>
          <p className="muted-text">Track your focus habits and understand where your time goes</p>

          <div className="filter-row">
            <button
              type="button"
              className={`filter-button ${timeFilter === "today" ? "filter-active" : ""}`}
              onClick={() => setTimeFilter("today")}
            >
              Today
            </button>
            <button
              type="button"
              className={`filter-button ${timeFilter === "week" ? "filter-active" : ""}`}
              onClick={() => setTimeFilter("week")}
            >
              This Week
            </button>
            <button
              type="button"
              className={`filter-button ${timeFilter === "all" ? "filter-active" : ""}`}
              onClick={() => setTimeFilter("all")}
            >
              All Time
            </button>
          </div>
        </div>

        <div className="insights-card">
          <h3 className="section-title">Summary</h3>
          <div className="stats-grid">
            <div className="stat-pill">
              <span className="muted-text">Focus sessions</span>
              <strong>{filteredTotalFocusSessions}</strong>
            </div>
            <div className="stat-pill">
              <span className="muted-text">Focus minutes</span>
              <strong>{filteredTotalFocusMinutes}</strong>
            </div>
            <div className="stat-pill">
              <span className="muted-text">Most used tag</span>
              <strong>{filteredMostUsedTag}</strong>
            </div>
          </div>
        </div>

        <div className="insights-card">
          <h3 className="section-title">Top Focus Areas</h3>

          <div className="stats-grid">
            {sortedTags.map(([tag, minutes]) => {
              const percentage = ((minutes / totalMinutes) * 100).toFixed(1);
              return (
                <div key={tag} className="stat-pill">
                  <span className="muted-text">{tag}</span>
                  <strong>{minutes} min</strong>
                  <span className="muted-text">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chart-card chart-wrap pie">
          <h3 className="section-title">Focus Distribution by Tag</h3>
          <div className="chart-frame-sm">
            <canvas ref={pieChartRef}></canvas>
          </div>
        </div>

        <div className="chart-card chart-wrap">
          <h3 className="section-title">Focus Minutes per Tag</h3>
          <div className="chart-frame-md">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

        <div className="history-card">
          <h3 className="section-title">Session History</h3>
          <p className="muted-text">Your recent focus sessions</p>

          <div className="history-list">
            {[...filteredSessions].reverse().map((session, index) => (
              <div key={index} className="history-item">
                <div>
                  <strong>{session.tag || "untitled"}</strong>
                  <div className="muted-text">
                    {session.type.toUpperCase()} • {session.duration} min
                  </div>
                </div>
                <div className="muted-text">
                  {new Date(session.completedAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Insights;