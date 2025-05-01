import React, { useState, useEffect } from "react";
import SideNav from "./ExchangerSideNav";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

function ConfirmExchange() {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestedBook, offeredBook, requesterEmail, targetUserEmail } =
    location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isAvatarLoading, setIsAvatarLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

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
    return () => clearInterval(intervalId);
  }, []);

  const handleSubmitExchangeRequest = async () => {
    if (!requestedBook || !offeredBook) {
      setError("Missing book information");
      return;
    }

    setLoading(true);
    setError(null);

    // Create exchange request object
    const exchangeRequest = {
      requesterId: requesterEmail,
      targetBookId: requestedBook.bookId,
      targetUserEmail: requestedBook.userEmail, // Add the target user email
      offeredBookTitle: offeredBook.name,
      offeredBookAuthor: offeredBook.author,
      offeredBookISBN: offeredBook.ISBN || "",
      offeredBookCondition: offeredBook.condition,
      offeredBookId: offeredBook.bookId, // Add the offered book ID for reference
      safeRequesterEmail: requesterEmail.replace(/\./g, "_"),
    };

    try {
      const response = await fetch(
        "http://localhost:8081/api/exchange/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(exchangeRequest),
        }
      );

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/DashBoard/MyExchangeRequests");
        }, 2000);
      } else {
        const errorData = await response.text();
        setError(`Error: ${errorData}`);
      }
    } catch (err) {
      setError("Failed to submit exchange request: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackNavigation = () => {
    navigate(-1);
  };

  if (!requestedBook || !offeredBook) {
    return (
      <div
        className="min-h-screen flex"
        style={{
          background:
            "radial-gradient(ellipse at center, #A8816C 0%, #905A40 50%, #6E4C3D 100%)",
        }}
      >
        <SideNav />
        <main className="flex-1 p-10 text-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Missing Information</h2>
            <p className="mb-6">
              Book information is missing. Please go back and try again.
            </p>
            <button
              onClick={() => navigate("/DashBoard/ExchangeBook")}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white"
            >
              Return to Exchange
            </button>
          </div>
        </main>
      </div>
    );
  }

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
            <h1 className="text-2xl font-semibold">Confirm Exchange Request</h1>
            <p className="text-sm text-white/70">
              Review the details and confirm your exchange request
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

        <div className="max-w-3xl mx-auto bg-[#7a5442] rounded-lg shadow-lg p-6">
          {success ? (
            <div className="text-center p-8">
              <div className="text-green-400 text-5xl mb-4">✓</div>
              <h3 className="text-xl font-semibold mb-2">
                Exchange Request Sent!
              </h3>
              <p>You will be redirected to your exchange requests shortly...</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-6">Exchange Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-[#8d6952] p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">Book You Want</h3>
                  <div className="flex items-start">
                    <img
                      src={requestedBook.imageUrl || "/placeholder-image.jpg"}
                      alt={requestedBook.name}
                      className="w-24 h-32 object-cover rounded-md mr-4"
                    />
                    <div>
                      <p className="font-bold">{requestedBook.name}</p>
                      <p className="text-sm">Author: {requestedBook.author}</p>
                      <p className="text-sm">
                        Condition: {requestedBook.condition}
                      </p>
                      <p className="text-sm mt-2">
                        Owner: {requestedBook.userEmail}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#8d6952] p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-3">
                    Book You're Offering
                  </h3>
                  <div className="flex items-start">
                    <img
                      src={offeredBook.imageUrl || "/placeholder-image.jpg"}
                      alt={offeredBook.name}
                      className="w-24 h-32 object-cover rounded-md mr-4"
                    />
                    <div>
                      <p className="font-bold">{offeredBook.name}</p>
                      <p className="text-sm">Author: {offeredBook.author}</p>
                      <p className="text-sm">
                        Condition: {offeredBook.condition}
                      </p>
                      <p className="text-sm mt-2">Your book</p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 text-red-200 p-3 rounded-md mb-4">
                  {error}
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleBackNavigation}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-full text-white"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitExchangeRequest}
                  className={`px-6 py-2 rounded-full text-white ${
                    loading ? "bg-green-800" : "bg-green-600 hover:bg-green-700"
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <span className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin mr-2"></span>
                      Sending...
                    </span>
                  ) : (
                    "Send Exchange Request"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default ConfirmExchange;
