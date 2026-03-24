import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Main from "./pages/Main";
import Application from "./pages/Application";
import ApplicationCheck from "./pages/ApplicationCheck";
import MyPage from "./pages/MyPage";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Greetings from "./pages/Greetings";
import Festival from "./pages/Festival";
import Directions from "./pages/Directions";
import Materials from "./pages/Materials";
import Alumni from "./pages/Alumni";
import Policy from "./pages/Policy";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Main Home Page */}
        <Route path="/" element={<Main />} />

        {/* Application Routes */}
        <Route path="/application" element={<Application />} />
        <Route path="/check" element={<ApplicationCheck />} />
        <Route path="/login" element={<Navigate to="/check" replace />} />

        {/* MyPage */}
        <Route path="/mypage" element={<MyPage />} />

        {/* Payment Routes */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/success" element={<Success />} />

        {/* Greetings Menu */}
        <Route path="/greetings" element={<Greetings />} />

        {/* Festival Menu */}
        <Route path="/festival" element={<Festival />} />
        <Route path="/festival/invitation" element={<Festival />} />
        <Route path="/festival/program" element={<Festival />} />

        {/* Directions Menu */}
        <Route path="/directions" element={<Directions />} />

        {/* Materials Menu */}
        <Route path="/materials" element={<Materials />} />

        {/* Alumni Association Menu */}
        <Route path="/alumni" element={<Alumni />} />

        {/* Policy Routes */}
        <Route path="/policy" element={<Policy />} />

        {/* Legacy routes redirect */}
        <Route path="/timeline" element={<Navigate to="/festival" replace />} />
        <Route path="/gallery" element={<Navigate to="/materials" replace />} />
        <Route path="/events" element={<Navigate to="/festival" replace />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}
