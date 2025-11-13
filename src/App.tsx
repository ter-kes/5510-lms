import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import SimulationPage from "./SimulationPage";
import ApplyLoanPage from "./ApplyLoanPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />

        {/* Amortization simulation page */}
        <Route path="/simulate" element={<SimulationPage />} />

        {/* Apply for a loan page */}
        <Route path="/apply" element={<ApplyLoanPage />} />
      </Routes>
    </BrowserRouter>
  );
}
