import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

function Insights({ sessions, totalFocusSessions, totalFocusMinutes, mostUsedTag }) {
  const tagMinutes = {};

  sessions.forEach((session) => {
    const sessionTag = session.tag || "untitled";
    tagMinutes[sessionTag] = (tagMinutes[sessionTag] || 0) + session.duration;
  });

  const sortedTags = Object.entries(tagMinutes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const totalMinutes = totalFocusMinutes || 1;

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
            backgroundColor: "rgba(197, 166, 255, 0.72)",
            borderColor: "rgba(255, 255, 255, 0.35)",
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
              "rgba(197, 166, 255, 0.82)",
              "rgba(255, 255, 255, 0.72)",
              "rgba(244, 114, 182, 0.68)",
              "rgba(147, 197, 253, 0.66)",
              "rgba(203, 186, 255, 0.7)"
            ],
            borderColor: "rgba(18, 15, 36, 0.9)",
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
  }, [sessions]);

  return (
    <div className="app-shell">
      <div className="page-card insights-layout">
        <div style={{ gridColumn: "1 / -1" }}>
          <h1>Aurora Insights</h1>
          <p className="muted-text">Track your focus habits and understand where your time goes</p>
        </div>

        <div className="insights-card">
          <h3 className="section-title">Summary</h3>
          <div className="stats-grid">
            <div className="stat-pill">
              <span className="muted-text">Focus sessions</span>
              <strong>{totalFocusSessions}</strong>
            </div>
            <div className="stat-pill">
              <span className="muted-text">Focus minutes</span>
              <strong>{totalFocusMinutes}</strong>
            </div>
            <div className="stat-pill">
              <span className="muted-text">Most used tag</span>
              <strong>{mostUsedTag}</strong>
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
            {sessions.map((session, index) => (
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