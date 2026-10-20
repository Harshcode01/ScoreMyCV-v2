import "./App.css";
import SideBar from "./component/SideBar/SideBar";
import { Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./component/Dashboard/Dashboard";
import History from "./component/History/History";
import Admin from "./component/Admin/Admin";
import Login from "./component/Login/Login";
import ThreeBackground from "./component/three/ThreeBackground";
import MagneticCursor from "./component/ui/MagneticCursor";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  return (
    <div className="App swiss-grid-overlay">
      {/* Precision Dual-Element Magnetic Cursor */}
      <MagneticCursor />

      {/* Full-Viewport Interactive 3D WebGL Particle System */}
      <ThreeBackground />

      {/* Floating Spatial Glass Navigation Dock */}
      {!isLoginPage && <SideBar />}

      {/* Main Workspace Route Container */}
      <main className={isLoginPage ? "fullPageLayout" : "mainContent"}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
