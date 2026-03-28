import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function ProgressChart({ tasks }) {
  const completed = tasks.filter((t) => t.status === "completed" && t.actualTime > 0);

  // Bar chart — estimated vs actual per task
  const barData = {
    labels: completed.map((t) => t.title.length > 12 ? t.title.slice(0, 12) + "..." : t.title),
    datasets: [
      {
        label: "Estimated (hrs)",
        data: completed.map((t) => t.estimatedTime),
        backgroundColor: "rgba(124, 107, 255, 0.8)",
        borderRadius: 6
      },
      {
        label: "Actual (hrs)",
        data: completed.map((t) => parseFloat(t.actualTime.toFixed(2))),
        backgroundColor: "rgba(255, 107, 157, 0.8)",
        borderRadius: 6
      }
    ]
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "var(--text)", font: { size: 12 } }
      },
      title: {
        display: true,
        text: "Estimated vs Actual Time",
        color: "var(--text)",
        font: { size: 14, weight: "bold" }
      }
    },
    scales: {
      x: { ticks: { color: "var(--text2)" }, grid: { color: "rgba(255,255,255,0.05)" } },
      y: { ticks: { color: "var(--text2)" }, grid: { color: "rgba(255,255,255,0.05)" } }
    }
  };

  // Doughnut chart — task status breakdown
  const total = tasks.length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const pendingCount = total - completedCount;

  const doughnutData = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        data: [completedCount, pendingCount],
        backgroundColor: [
          "rgba(124, 107, 255, 0.8)",
          "rgba(255, 107, 157, 0.8)"
        ],
        borderWidth: 0
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "var(--text)", font: { size: 12 }, padding: 16 }
      },
      title: {
        display: true,
        text: "Task Completion",
        color: "var(--text)",
        font: { size: 14, weight: "bold" }
      }
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", color: "var(--text2)", fontSize: "14px" }}>
        <h2>📈 Progress Charts</h2>
        <p style={{ marginTop: "12px" }}>Add and complete tasks to see your progress charts.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>📈 Progress Charts</h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "24px"
      }}>

        {/* Doughnut */}
        <div style={{
          background: "var(--bg3)",
          borderRadius: "12px",
          padding: "16px",
          maxWidth: "280px",
          margin: "0 auto",
          width: "100%"
        }}>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>

        {/* Bar chart — only show if there are completed tasks */}
        {completed.length > 0 && (
          <div style={{
            background: "var(--bg3)",
            borderRadius: "12px",
            padding: "16px"
          }}>
            <Bar data={barData} options={barOptions} />
          </div>
        )}

      </div>
    </div>
  );
}