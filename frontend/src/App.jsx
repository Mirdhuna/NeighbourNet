import { BrowserRouter, Routes, Route } from "react-router-dom";
import NeighbourNetLogin from "./Pages/Login";
import NeighbourNetDashboard from "./Pages/Dashboard";
import Needs from "./Pages/Needs";
import CreateNeed from "./Pages/Createneed";
import NeedDetail from "./Pages/Needdetail";
import Offers from "./Pages/Offers";
import OfferDetail from "./Pages/Offerdetail";
import CreateOffer from "./Pages/Createoffer";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NeighbourNetLogin />} />
        <Route path="/dashboard" element={<NeighbourNetDashboard />} />
        <Route path="/needs" element={<Needs/>}/>
        <Route path="/needs/new" element={<CreateNeed/>}/>
        <Route path="/needs/:id" element={<NeedDetail />} />
        <Route path="/offers" element={<Offers/>}/>
        <Route path="/offers/:id" element={<OfferDetail/>}/>
        <Route path="/offers/new" element={<CreateOffer/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;