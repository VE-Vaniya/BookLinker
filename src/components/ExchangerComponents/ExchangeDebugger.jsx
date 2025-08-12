import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, onValue } from "firebase/database";
import ExchangerSideNav from "./ExchangerSideNav";

function ExchangeDebugger() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const auth = getAuth();
    if (auth.currentUser) {
      setUserEmail(auth.currentUser.email);
    }

    const db = getDatabase();
    const requestsRef = ref(db, "exchangeRequests");

    onValue(requestsRef, (snapshot) => {
      if (snapshot.exists()) {
        const allRequests = [];
        snapshot.forEach((childSnapshot) => {
          allRequests.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          });
        });
        setRequests(allRequests);
      } else {
        setRequests([]);
      }
      setLoading(false);
    });
  }, []);

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
        <h1 className="text-2xl font-semibold mb-6">Exchange Debugger</h1>
        <div className="bg-[#7a5442] rounded-lg p-4 mb-6">
          <p>Current user: {userEmail}</p>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              All Exchange Requests ({requests.length})
            </h2>
            {requests.length === 0 ? (
              <p>No requests found in the database.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full bg-[#8d6952] rounded-lg overflow-hidden">
                  <thead className="bg-[#6a4632]">
                    <tr>
                      <th className="p-2 text-left">ID</th>
                      <th className="p-2 text-left">Requester</th>
                      <th className="p-2 text-left">Target User</th>
                      <th className="p-2 text-left">Target Book ID</th>
                      <th className="p-2 text-left">Offered Book</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.id} className="border-t border-[#8d6952]/30">
                        <td className="p-2">{req.id}</td>
                        <td className="p-2">{req.requesterId}</td>
                        <td className="p-2">
                          {req.targetUserEmail || "Not set"}
                          {req.targetUserEmail === userEmail && (
                            <span className="ml-2 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                              YOU
                            </span>
                          )}
                        </td>
                        <td className="p-2">{req.targetBookId}</td>
                        <td className="p-2">{req.offeredBookTitle}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              req.status === "pending"
                                ? "bg-yellow-500"
                                : req.status === "accepted"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="p-2">
                          {req.createdAt
                            ? new Date(req.createdAt).toLocaleString()
                            : "Unknown"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default ExchangeDebugger;
