import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function App() {
  const [amount, setAmount] = useState("200000");
  const [annualRate, setAnnualRate] = useState("7.2"); // % nominal annual
  const [months, setMonths] = useState("360");
  const [show, setShow] = useState(true); // show by default so it renders immediately

  // per-period one-off overrides: { [periodNumber]: number }
  const [overrides, setOverrides] = useState({});

  const money = (v) =>
    Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const setOverride = (k, val) => {
    const s = val.trim();
    if (s === "") {
      const next = { ...overrides };
      delete next[k];
      setOverrides(next);
      return;
    }
    const n = Number(s);
    if (Number.isFinite(n) && n >= 0) setOverrides((o) => ({ ...o, [k]: n }));
  };

  const clearOverrides = () => setOverrides({});

  const { basePMT, schedule } = useMemo(() => {
    const PV = Number(amount);
    const n = Math.max(0, Math.floor(Number(months)));
    const r = Number(annualRate) / 100 / 12;

    if (!(PV > 0) || !(n > 0) || Number.isNaN(r)) {
      return { basePMT: 0, schedule: [] };
    }

    const pmt = (pv, rate, m) => {
      if (m <= 0) return 0;
      if (Math.abs(rate) < 1e-12) return pv / m;
      return (rate * pv) / (1 - Math.pow(1 + rate, -m));
    };

    const rows = [];
    let bal = PV;
    let remaining = n;
    let activePMT = pmt(bal, r, remaining);

    for (let k = 1; k <= n; k++) {
      const begin = bal;
      const interest = r * begin;

      // Use one-off override at k if present, otherwise the current equal PMT
      let pay = overrides[k] != null ? Number(overrides[k]) : activePMT;

      // Prevent overpay in this period
      const maxToClose = begin * (1 + r);
      if (pay > maxToClose) pay = maxToClose;

      const principal = pay - interest;
      let end = begin + interest - pay;
      if (end < 1e-8) end = 0; // kill rounding dust

      rows.push({
        period: k,
        beginning: begin,
        interest,
        payment: pay,
        ending: end,
        suggested: activePMT, // placeholder hint when no override
      });

      // Move forward
      bal = end;
      remaining = n - k;

      // After applying period k, compute a NEW equal PMT for the remaining horizon
      if (remaining > 0) {
        activePMT = pmt(bal, r, remaining);
      }
    }

    return { basePMT: pmt(PV, r, n), schedule: rows };
  }, [amount, annualRate, months, overrides]);

  // === NEW: total interest chip ===
  const totalInterest = useMemo(
    () => schedule.reduce((acc, r) => acc + (Number(r.interest) || 0), 0),
    [schedule]
  );

  // === NEW: chart data + currency tooltip helper ===
  const chartData = useMemo(
    () => schedule.map((row) => ({ period: row.period, ending: row.ending })),
    [schedule]
  );
  const currency = (v) =>
    `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div style={{ fontFamily: "Segoe UI, Arial", padding: 24, background: "#f7f9fc", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: 8 }}>📊 Amortization (One-Off Payment Overrides)</h1>
      <p style={{ color: "#555", marginTop: 0 }}>
        Type a custom payment in any month. That payment applies <b>only for that month</b>, then a new equal payment is
        recalculated so the loan still ends on the original month.
      </p>

      {/* Inputs */}
      <div style={cardRow}>
        <label style={field}>
          <span>Amount</span>
          <input type="number" min="0" step="100" value={amount} onChange={(e) => setAmount(e.target.value)} style={inp}/>
        </label>
        <label style={field}>
          <span>Annual Rate (%)</span>
          <input type="number" min="0" step="0.01" value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} style={inp}/>
        </label>
        <label style={field}>
          <span>Period (months)</span>
          <input type="number" min="1" step="1" value={months} onChange={(e) => setMonths(e.target.value)} style={inp}/>
        </label>
        <div style={{ display: "flex", alignItems: "end", gap: 8, flexWrap: "wrap" }}>
          <button style={btnPrimary} onClick={() => setShow(true)}>Calculate</button>
          <button style={btnGhost} onClick={() => setShow(false)}>Hide Table</button>
          <button style={btnWarn} onClick={clearOverrides}>Clear Overrides</button>
        </div>
      </div>

      {show && schedule.length > 0 && (
        <>
          <div style={{ marginTop: 16 }}>
            <div style={chip}>
              <b>Baseline Monthly Payment (no overrides):</b> ${money(basePMT)}
            </div>
            <div style={{ ...chip, marginLeft: 8 }}>
              <b>Total Interest (all periods):</b> ${money(totalInterest)}
            </div>
          </div>

          {/* === NEW: shaded area chart for Ending Balance === */}
          <div
            style={{
              marginTop: 16,
              background: "white",
              padding: 16,
              borderRadius: 12,
              boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
              maxWidth: 1100
            }}
          >
            <h3 style={{ margin: 0, marginBottom: 8 }}>Ending Balance by Period</h3>
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <defs>
                    <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.08} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `$${Math.round(v).toLocaleString()}`} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [currency(value), "Ending Balance"]}
                    labelFormatter={(label) => `Period ${label}`}
                  />
                  {/* Shaded area from x-axis to the curve */}
                  <Area type="monotone" dataKey="ending" stroke="#2563eb" fill="url(#balanceFill)" />
                  {/* Crisp line on top for clarity */}
                  <Line type="monotone" dataKey="ending" strokeWidth={2} dot={false} stroke="#1e40af" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ marginTop: 16, overflowX: "auto" }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={{ minWidth: 70 }}>Period</th>
                  <th>Beginning Balance</th>
                  <th>Interest</th>
                  <th style={{ minWidth: 210 }}>Payment (editable)</th>
                  <th>Ending Balance</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr key={row.period}>
                    <td>{row.period}</td>
                    <td>${money(row.beginning)}</td>
                    <td>${money(row.interest)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={overrides[row.period] ?? ""}
                          placeholder={money(row.suggested)}
                          onChange={(e) => setOverride(row.period, e.target.value)}
                          style={{ ...inp, width: 150 }}
                          title="One-off payment for this month"
                        />
                        {(overrides[row.period] ?? "") !== "" && (
                          <button onClick={() => setOverride(row.period, "")} style={xBtn} title="Clear this override">
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                    <td>${money(row.ending)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ color: "#777", fontSize: 13, marginTop: 8 }}>
              Notes: Rate is nominal annual divided by 12. If an entered payment would overpay a month, it auto-trims to finish that month exactly.
              After any override, a fresh constant PMT is computed for the remaining months so the balance still reaches $0 at term.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

/* ------- styles ------- */
const cardRow = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 12,
  background: "white",
  padding: 16,
  borderRadius: 12,
  boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
  maxWidth: 1100
};
const field = { display: "grid", gap: 6 };
const inp = { padding: "10px 12px", border: "1px solid #cfd7e6", borderRadius: 8, outline: "none" };
const btnPrimary = { padding: "10px 16px", background: "#2563eb", color: "white", border: "none", borderRadius: 8, cursor: "pointer" };
const btnGhost   = { padding: "10px 16px", background: "white", color: "#2563eb", border: "1px solid #2563eb", borderRadius: 8, cursor: "pointer" };
const btnWarn    = { padding: "10px 16px", background: "#fff7ed", color: "#9a3412", border: "1px solid #fdba74", borderRadius: 8, cursor: "pointer" };
const xBtn       = { padding: "6px 10px", background: "#ef4444", color: "white", border: "none", borderRadius: 6, cursor: "pointer" };
const table      = { width: "100%", borderCollapse: "separate", borderSpacing: 0, background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 10px rgba(0,0,0,0.06)" };
const chip       = { background: "white", display: "inline-block", padding: "10px 14px", borderRadius: 10, boxShadow: "0 4px 10px rgba(0,0,0,0.06)" };
