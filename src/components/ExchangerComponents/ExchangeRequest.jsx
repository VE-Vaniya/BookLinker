import React from "react";
import { useNavigate } from "react-router-dom";
import ExchangerSideNav from "./ExchangerSideNav";

function ExchangeRequest() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          "radial-gradient(ellipse at center, #A8816C 0%, #905A40 50%, #6E4C3D 100%)",
      }}
    >
      <ExchangerSideNav />
      <main className="flex-1 p-10 text-white">
        <h1 className="text-2xl font-semibold mb-6">Exchange Requests</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            onClick={() => navigate("/DashBoard/MyExchangeRequests")}
            className="bg-[#7a5442] rounded-lg p-8 text-center cursor-pointer hover:bg-[#8d6952] transition-colors"
          >
            <div className="text-4xl mb-4">📤</div>
            <h2 className="text-xl font-medium mb-2">Sent Requests</h2>
            <p className="text-white/70">
              View the status of exchange requests you've sent to other users
            </p>
          </div>

          <div
            onClick={() => navigate("/DashBoard/ReceivedExchangeRequests")}
            className="bg-[#7a5442] rounded-lg p-8 text-center cursor-pointer hover:bg-[#8d6952] transition-colors"
          >
            <div className="text-4xl mb-4">📥</div>
            <h2 className="text-xl font-medium mb-2">Received Requests</h2>
            <p className="text-white/70">
              Manage exchange requests received from other users
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ExchangeRequest;
