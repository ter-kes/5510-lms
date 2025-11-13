import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ApplyLoanPage() {
  const [amount, setAmount] = useState<string>("");
  const [months, setMonths] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !months) {
      alert("Please fill in both fields.");
      return;
    }

    setSubmitted(true);
  };

  return (
    <div
      style={{
        fontFamily: "Segoe UI, Arial",
        minHeight: "100vh",
        background: "#f7f9fc",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          background: "white",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 8 }}>
          Apply for a Loan
        </h1>
        <p style={{ marginTop: 0, color: "#6b7280", marginBottom: 20 }}>
          Please enter the basic details of the loan you would like to request.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Loan Amount</span>
            <input
              type="number"
              min="0"
              step="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                outline: "none",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Period (months)</span>
            <input
              type="number"
              min="1"
              step="1"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                outline: "none",
              }}
            />
          </label>

          <button
            type="submit"
            style={{
              marginTop: 8,
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: "#2563eb",
              color: "white",
              fontWeight: 600,
            }}
          >
            Submit Application
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              cursor: "pointer",
              background: "white",
              color: "#4b5563",
              fontWeight: 500,
            }}
          >
            ⬅ Back to Landing Page
          </button>
        </form>

        {submitted && (
          <div
            style={{
              marginTop: 20,
              padding: 12,
              borderRadius: 10,
              background: "#ecfeff",
              border: "1px solid #22c55e",
              fontSize: 14,
            }}
          >
            <b>Application received!</b> <br />
            Amount: <b>${Number(amount).toLocaleString()}</b> <br />
            Period: <b>{months} months</b>
          </div>
        )}
      </div>
    </div>
  );
}
