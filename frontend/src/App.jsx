import { BrowserRouter, Routes, Route } from "react-router-dom";
import NeighbourNetLogin from "./Pages/Login";
import NeighbourNetDashboard from "./Pages/Dashboard";
import Needs from "./Pages/Needs";
import CreateNeed from "./Pages/Createneed";
import NeedDetail from "./Pages/Needdetail";
import Offers from "./Pages/Offers";
import OfferDetail from "./Pages/Offerdetail";
import CreateOffer from "./Pages/Createoffer";
import Messages from "./Pages/Messages";
import Bookmarks from "./Pages/Bookmarks";
import Profile from "./Pages/Profile";
import Settings from "./Pages/Settings";
import Admin from "./Pages/Admin";
import { ThemeProvider } from "./context/ThemeContext";
import "./Css/theme-dark.css";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<NeighbourNetLogin />} />
          <Route path="/login" element={<NeighbourNetLogin />} />
          <Route path="/dashboard" element={<NeighbourNetDashboard />} />
          
          {/* Needs Routes */}
          <Route path="/needs" element={<Needs />} />
          <Route path="/needs/new" element={<CreateNeed />} />
          <Route path="/createneed" element={<CreateNeed />} />
          <Route path="/needs/:id" element={<NeedDetail />} />
          
          {/* Offers Routes */}
          <Route path="/offers" element={<Offers />} />
          <Route path="/offers/new" element={<CreateOffer />} />
          <Route path="/createoffer" element={<CreateOffer />} />
          <Route path="/offers/:id" element={<OfferDetail />} />
          
          {/* Messages & Other Pages */}
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:id" element={<Messages />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;