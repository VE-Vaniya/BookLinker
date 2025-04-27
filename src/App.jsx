import "./App.css";
import LandingPage from "./components/LandingPage";
import SignUp from "./components/SignUp";
import LogIn from "./components/LogIn";
import { Routes, Route } from "react-router-dom";
import DashBoard from "./components/DashBoard";
import ProfileSetup from "./components/Profile";
import AddBook from "./components/AddBook";
import FileComplaint from "./components/FileComplaint";
import ViewTransection from "./components/ViewTransection";
import ViewHistory from "./components/ViewHistory";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/DashBoard" element={<DashBoard />} />
        <Route path="/DashBoard/Profile" element={<ProfileSetup />} />
        <Route path="/DashBoard/AddBook" element={<AddBook />} />
        <Route path="/DashBoard/FileComplaints" element={<FileComplaint />} />
        <Route
          path="/DashBoard/ViewTransection"
          element={<ViewTransection />}
        />
        <Route path="/DashBoard/ViewHistory" element={<ViewHistory />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </>
  );
}

export default App;
