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
            label: "Minutes per Tag",
            data: Object.values(tagMinutes),
            backgroundColor: "rgba(147, 197, 253, 0.6)",
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
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        },
        plugins: {
          legend: { display: false }
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
              "rgba(147, 197, 253, 0.7)",
              "rgba(196, 181, 253, 0.7)",
              "rgba(251, 191, 36, 0.7)",
              "rgba(244, 114, 182, 0.7)",
              "rgba(52, 211, 153, 0.7)"
            ]
          }
        ]
      },
      options: {
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        aspectRatio: 1,
        plugins: {
          legend: { position: "bottom" }
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
        <h1>Aurora Insights</h1>

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
          <h3 className="section-title">Minutes per tag</h3>
          <ul className="list-reset">
            {Object.entries(tagMinutes).map(([tag, minutes]) => (
              <li key={tag}>
                {tag}: {minutes} min
              </li>
            ))}
          </ul>
        </div>

        <div className="insights-card">
          <h3 className="section-title">Top Tags</h3>
          <ul className="list-reset">
            {sortedTags.map(([tag, minutes]) => (
              <li key={tag}>
                {tag}: {minutes} min
              </li>
            ))}
          </ul>
        </div>

        <div className="insights-card">
          <h3 className="section-title">Focus Distribution</h3>
          <ul className="list-reset">
            {tagPercentages.map(({ tag, percentage }) => (
              <li key={tag}>
                {tag}: {percentage}%
              </li>
            ))}
          </ul>
        </div>

        <div className="chart-card chart-wrap pie">
          <h3 className="section-title">Focus Pie Chart</h3>
          <div className="chart-frame-sm">
            <canvas ref={pieChartRef}></canvas>
          </div>
        </div>

        <div className="chart-card chart-wrap">
          <h3 className="section-title">Focus Chart</h3>
          <div className="chart-frame-md">
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

        <div className="history-card">
          <h3 className="section-title">Session History</h3>
          <ul className="list-reset">
            {sessions.map((session, index) => (
              <li key={index}>
                {session.type.toUpperCase()} ({session.tag || "untitled"}) - {session.duration} min - completed at{" "}
                {new Date(session.completedAt).toLocaleTimeString()}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Insights;