import React from "react";
import SideNav from "./SideNav";

const Dashboard = () => {
  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          "radial-gradient(ellipse at center, #A8816C 0%, #905A40 50%, #6E4C3D 100%)",
      }}
    >
      {/* Sidebar */}
      <SideNav></SideNav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-lg p-10 rounded-2xl shadow-2xl text-center">
          <h1 className="text-4xl font-bold text-[#5c3d2e] mb-4">
            Hello from Dashboard
          </h1>
          <p className="text-[#5c3d2e]">Welcome to your book manager panel.</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
