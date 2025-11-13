import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        fontFamily: "Segoe UI, Arial",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 800,
          width: "100%",
          background: "rgba(15, 23, 42, 0.9)",
          borderRadius: 16,
          padding: 32,
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
        }}
      >
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>
          Loan Management System
        </h1>
        <p style={{ color: "#cbd5f5", marginBottom: 24 }}>
          Simulate amortization schedules, explore custom payment scenarios,
          and apply for a loan with just a few clicks.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <button
            onClick={() => navigate("/simulate")}
            style={{
              padding: "12px 18px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              background: "#22c55e",
              color: "white",
            }}
          >
            📊 Go to Simulation
          </button>

          <button
            onClick={() => navigate("/apply")}
            style={{
              padding: "12px 18px",
              borderRadius: 10,
              border: "1px solid #60a5fa",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              background: "transparent",
              color: "#bfdbfe",
            }}
          >
            📝 Apply for a Loan
          </button>
        </div>

        <p style={{ fontSize: 13, color: "#9ca3af" }}>
          Tip: Start with the simulation to understand your monthly payments,
          then proceed to the application form when you&apos;re ready.
        </p>
      </div>
    </div>
  );
}
