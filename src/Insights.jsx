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
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      <h1>Aurora Insights</h1>

      <div style={{ marginTop: "20px" }}>
        <h3>Summary</h3>
        <p>Total focus sessions: {totalFocusSessions}</p>
        <p>Total focus minutes: {totalFocusMinutes}</p>
        <p>Most used tag: {mostUsedTag}</p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Minutes per tag</h3>
        <ul style={{ listStylePosition: "inside", padding: 0, margin: 0 }}>
          {Object.entries(tagMinutes).map(([tag, minutes]) => (
            <li key={tag}>
              {tag}: {minutes} min
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Top Tags</h3>
        <ul style={{ listStylePosition: "inside", padding: 0, margin: 0 }}>
          {sortedTags.map(([tag, minutes]) => (
            <li key={tag}>
              {tag}: {minutes} min
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Focus Distribution</h3>
        <ul style={{ listStylePosition: "inside", padding: 0, margin: 0 }}>
          {tagPercentages.map(({ tag, percentage }) => (
            <li key={tag}>
              {tag}: {percentage}%
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: "20px", maxWidth: "280px", marginInline: "auto" }}>
        <h3>Focus Pie Chart</h3>
        <div style={{ position: "relative", width: "100%", height: "220px" }}>
          <canvas ref={pieChartRef}></canvas>
        </div>
      </div>

      <div style={{ marginTop: "20px", maxWidth: "420px", marginInline: "auto" }}>
        <h3>Focus Chart</h3>
        <div style={{ position: "relative", width: "100%", height: "240px" }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Session History</h3>
        <ul style={{ listStylePosition: "inside", padding: 0, margin: 0 }}>
          {sessions.map((session, index) => (
            <li key={index}>
              {session.type.toUpperCase()} ({session.tag || "untitled"}) - {session.duration} min - completed at{" "}
              {new Date(session.completedAt).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Insights;