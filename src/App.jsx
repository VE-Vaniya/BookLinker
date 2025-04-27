import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import SignUp from "./components/SignUp";
import LogIn from "./components/LogIn";
import DashBoard from "./components/DashBoard";
import ProfileSetup from "./components/Profile";
import AddBook from "./components/AddBook";
import FileComplaint from "./components/FileComplaint";
import ViewTransection from "./components/ViewTransection";
import ViewHistory from "./components/ViewHistory";
import Chat from "./components/Chat";
import ProtectedRoute from "./components/ProtectedRoute";
import { auth } from "./components/firebaseconfig";
import { getDatabase, onValue, ref } from "firebase/database";

function App() {
  const [userRole, setUserRole] = useState(null);
  const db = getDatabase();

  const getUserRole = (uid) => {
    const userRoleRef = ref(db, `users/${uid}/role`);
    onValue(userRoleRef, (snapshot) => {
      const role = snapshot.val();
      if (role) {
        setUserRole(role);
      }
    });
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const uid = user.uid;
        getUserRole(uid);
      } else {
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<LogIn />} />

      {/* Dynamic Routes Based on Role */}
      {userRole === "Seller" && (
        <>
          {/* Seller Routes */}
          <Route
            path="/DashBoard"
            element={
              <ProtectedRoute>
                <DashBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/DashBoard/Profile"
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/DashBoard/AddBook"
            element={
              <ProtectedRoute>
                <AddBook />
              </ProtectedRoute>
            }
          />
          <Route
            path="/DashBoard/FileComplaints"
            element={
              <ProtectedRoute>
                <FileComplaint />
              </ProtectedRoute>
            }
          />
          <Route
            path="/DashBoard/ViewTransection"
            element={
              <ProtectedRoute>
                <ViewTransection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/DashBoard/ViewHistory"
            element={
              <ProtectedRoute>
                <ViewHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/DashBoard/Chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
        </>
      )}
      {/* if you want to add routes of different role copy the above code which 
      starts with userRole==="Seller" and paste it here and just change the components 
      like you have created a different component folder for donator so import those and use it 
      protectedRoute will remain same  */}
      <Route
        path="*"
        element={
          <div className="flex justify-center items-center h-screen">
            <div className="spinner-border animate-spin border-t-4 border-blue-500 border-solid rounded-full w-16 h-16"></div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
