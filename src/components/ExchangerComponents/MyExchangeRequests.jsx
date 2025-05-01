import React, { useState, useEffect } from "react";
import SideNav from "./ExchangerSideNav";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get, onValue, off } from "firebase/database";

function MyExchangeRequests() {
  const [exchangeRequests, setExchangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isAvatarLoading, setIsAvatarLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setUserEmail(user.email);
    }

    const fetchAvatar = async () => {
      if (user) {
        const safeEmail = user.email.replace(/\./g, "_");
        const db = getDatabase();
        const profileImageRef = ref(
          db,
          `userProfiles/${safeEmail}/profileImageUrl`
        );

        try {
          setIsAvatarLoading(true);
          const imageSnap = await get(profileImageRef);
          const imageUrl = imageSnap.exists() ? imageSnap.val() : "";
          setAvatarUrl(
            typeof imageUrl === "string" && imageUrl.startsWith("http")
              ? imageUrl
              : ""
          );
        } catch (error) {
          console.error("Error fetching avatar:", error);
        } finally {
          setIsAvatarLoading(false);
        }
      }
    };

    fetchAvatar();

    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
      setCurrentDate(
        now.toLocaleDateString("en-GB", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      );
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 60000);

    // Fetch exchange requests for the current user
    if (user) {
      const db = getDatabase();
      const requestsRef = ref(db, "exchangeRequests");

      const handleData = (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const requests = Object.values(data).filter(
            (req) => req.requesterId === user.email
          );
          setExchangeRequests(requests);
        } else {
          setExchangeRequests([]);
        }
        setLoading(false);
      };

      const handleError = (err) => {
        setError(err.message);
        setLoading(false);
      };

      onValue(requestsRef, handleData, handleError);

      // Cleanup
      return () => {
        clearInterval(intervalId);
        off(requestsRef);
      };
    } else {
      setLoading(false);
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-400 text-yellow-900";
      case "accepted":
        return "bg-green-400 text-green-900";
      case "rejected":
        return "bg-red-400 text-red-900";
      default:
        return "bg-gray-400 text-gray-900";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          "radial-gradient(ellipse at center, #A8816C 0%, #905A40 50%, #6E4C3D 100%)",
      }}
    >
      <SideNav />
      <main className="flex-1 p-10 text-white">
        <div className="flex flex-col items-center mb-10 lg:flex-row lg:justify-between lg:items-center">
          <div className="text-center lg:text-left mb-4 lg:mb-0">
            <h1 className="text-2xl font-semibold">My Exchange Requests</h1>
            <p className="text-sm text-white/70">
              Track the status of your book exchange requests
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-sm bg-white rounded-full px-4 py-1 text-black">
              ⏰ {currentTime}
            </div>
            <div className="text-sm bg-white rounded-full px-4 py-1 text-black">
              📅 {currentDate}
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              {isAvatarLoading ? (
                <div className="w-6 h-6 border-4 border-white/50 border-t-transparent rounded-full animate-spin" />
              ) : avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-xl text-white/50">👤</span>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="w-8 h-8 border-4 border-white/50 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-400 text-center">{error}</div>
        ) : exchangeRequests.length === 0 ? (
          <div className="text-center py-10 bg-[#7a5442] rounded-lg">
            <h3 className="text-xl font-semibold mb-2">No Exchange Requests</h3>
            <p className="text-white/70">
              You haven't made any book exchange requests yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-[#7a5442] rounded-lg shadow-lg overflow-hidden">
              <thead className="bg-[#6a4632] text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Requested Book</th>
                  <th className="px-6 py-3 text-left">Your Offered Book</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {exchangeRequests.map((request) => (
                  <tr key={request.id} className="border-t border-[#8d6952]">
                    <td className="px-6 py-4">
                      {request.targetBookTitle || "Unknown book"}
                    </td>
                    <td className="px-6 py-4">{request.offeredBookTitle}</td>
                    <td className="px-6 py-4">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status || "pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default MyExchangeRequests;
