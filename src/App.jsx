import "./App.css";
import LandingPage from "./components/LandingPage";
import SignUp from "./components/SignUp";
import LogIn from "./components/LogIn";
import { Routes, Route } from "react-router-dom";
import DashBoard from "./components/DashBoard";
import ViewTransection from "./components/ViewTransection";
import "./index.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/DashBoard" element={<DashBoard />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
      {/* <ViewTransection /> */}
    </>
  );
}

export default App;
