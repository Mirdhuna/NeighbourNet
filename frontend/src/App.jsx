import { BrowserRouter, Routes, Route } from "react-router-dom";
import NeighbourNetLogin from "./Pages/Login";
import NeighbourNetDashboard from "./Pages/Dashboard";
import Needs from "./Pages/Needs";
import CreateNeed from "./Pages/Createneed";
import NeedDetail from "./Pages/Needdetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<NeighbourNetLogin />} />
        <Route path="/dashboard" element={<NeighbourNetDashboard />} />
        <Route path="/needs" element={<Needs/>}/>
        <Route path="/needs/new" element={<CreateNeed/>}/>
        <Route path="/needs/:id" element={<NeedDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;