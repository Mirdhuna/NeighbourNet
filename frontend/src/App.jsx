import { BrowserRouter, Routes, Route } from "react-router-dom";
import NeighbourNetLogin from "./Pages/Login";
import NeighbourNetDashboard from "./Pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NeighbourNetLogin />} />
        <Route path="/dashboard" element={<NeighbourNetDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;