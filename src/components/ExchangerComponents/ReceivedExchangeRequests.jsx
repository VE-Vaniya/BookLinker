import React, { useState, useEffect } from "react";
import SideNav from "./ExchangerSideNav";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get, onValue, off } from "firebase/database";

function ReceivedExchangeRequests() {
  const [exchangeRequests, setExchangeRequests] = useState([]);
  const [userBooks, setUserBooks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isAvatarLoading, setIsAvatarLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

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

    // Fetch user's books
    const fetchUserBooks = async () => {
      if (!user) return {};

      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8081/api/books/available-books?role=Exchanger&userEmail=${encodeURIComponent(
            user.email
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const books = await response.json();
          const userBooksMap = {};
          books.forEach((book) => {
            if (book.userEmail === user.email) {
              userBooksMap[book.bookId] = book;
            }
          });
          setUserBooks(userBooksMap);
          console.log("User books loaded:", Object.keys(userBooksMap).length);
          return userBooksMap;
        }
      } catch (err) {
        console.error("Error fetching user books:", err);
        setError("Failed to load your books. Please refresh the page.");
      }
      return {};
    };

    // Fetch exchange requests from backend or directly from Firebase if backend fails
    const fetchExchangeRequests = async (books) => {
      if (!user) return;

      // First try the backend API
      try {
        console.log("Trying to fetch exchange requests from backend API...");
        setLoading(true);

        const response = await fetch(
          `http://localhost:8081/api/exchange/requests?userEmail=${encodeURIComponent(
            user.email
          )}&asTarget=true`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const requests = await response.json();
          console.log(
            `Backend API: Found ${requests.length} exchange requests for your books`
          );

          // If we got some requests, use them
          if (requests && requests.length > 0) {
            // Add book details to each request
            const requestsWithDetails = requests.map((req) => {
              return {
                ...req,
                targetBookDetails: books[req.targetBookId] || null,
              };
            });

            setExchangeRequests(requestsWithDetails);
            setLoading(false);
            return; // Successfully got data from backend
          }
          // If backend returned empty (even though we might have data), fall through to direct check
          console.log(
            "Backend returned 0 requests, falling back to direct Firebase check"
          );
        } else {
          console.error("Backend API failed:", await response.text());
          // Fall through to Firebase direct approach
        }
      } catch (err) {
        console.error("Error with backend API:", err);
        // Fall through to Firebase direct approach
      }

      // TEMPORARY FALLBACK: Fetch directly from Firebase if backend API returned no results
      console.log("Using direct Firebase access as fallback...");
      try {
        const db = getDatabase();
        const requestsRef = ref(db, "exchangeRequests");

        // Get all exchange requests
        const snapshot = await get(requestsRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const requests = [];

          console.log("All exchange requests in Firebase:", data);

          for (const key in data) {
            const req = { ...data[key], id: key };
            console.log(
              `Checking request ${key} with targetBookId:`,
              req.targetBookId
            );

            // We don't have targetUserEmail in old requests, so match by book ID
            // If you have access to a book database that maps book IDs to owners,
            // you could use that information here
            const bookDetails = books[req.targetBookId];

            if (bookDetails && bookDetails.userEmail === user.email) {
              console.log("Found a match by book ID");
              requests.push({
                ...req,
                targetBookDetails: bookDetails,
                targetUserEmail: user.email, // Infer this from the book owner
              });
            }
          }

          console.log(
            `Firebase direct: Found ${requests.length} exchange requests`
          );
          setExchangeRequests(requests);
        } else {
          console.log("No exchange requests found in Firebase");
          setExchangeRequests([]);
        }
      } catch (err) {
        console.error("Firebase direct fetch error:", err);
        const errorMessage =
          err && typeof err === "object"
            ? err.message || JSON.stringify(err)
            : "Unknown error occurred";
        setError(
          `Could not load exchange requests. Please try again. (${errorMessage})`
        );
      } finally {
        setLoading(false);
      }
    };

    // Load books first, then fetch exchange requests
    if (user) {
      fetchUserBooks().then((books) => {
        fetchExchangeRequests(books);
      });
    } else {
      setLoading(false);
    }

    // Cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, [userEmail]); // Only depend on userEmail

  const handleAction = async (requestId, action) => {
    setActionLoading({ ...actionLoading, [requestId]: true });

    try {
      const response = await fetch(
        `http://localhost:8081/api/exchange/${requestId}/status?status=${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Update the local state
        setExchangeRequests(
          exchangeRequests.map((req) =>
            req.id === requestId ? { ...req, status: action } : req
          )
        );
      } else {
        setError(`Failed to ${action} request: ${await response.text()}`);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setActionLoading({ ...actionLoading, [requestId]: false });
    }
  };

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
            <h1 className="text-2xl font-semibold">
              Received Exchange Requests
            </h1>
            <p className="text-sm text-white/70">
              Manage exchange requests for your books
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
              You haven't received any book exchange requests yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {exchangeRequests.map((request) => (
              <div
                key={request.id}
                className="bg-[#7a5442] rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Exchange Request from {request.requesterId}
                      </h3>
                      <p className="text-sm text-white/70">
                        Received on {formatDate(request.createdAt)}
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status || "pending"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#8d6952] p-4 rounded-lg">
                      <h4 className="text-md font-medium mb-2">
                        Your Book They Want:
                      </h4>
                      <div className="flex items-start">
                        {request.targetBookDetails && (
                          <>
                            <img
                              src={
                                request.targetBookDetails.imageUrl ||
                                "/placeholder-image.jpg"
                              }
                              alt={request.targetBookDetails.name}
                              className="w-16 h-24 object-cover rounded-md mr-3"
                            />
                            <div>
                              <p className="font-bold">
                                {request.targetBookDetails.name}
                              </p>
                              <p className="text-sm">
                                Author: {request.targetBookDetails.author}
                              </p>
                              <p className="text-sm">
                                Condition: {request.targetBookDetails.condition}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#8d6952] p-4 rounded-lg">
                      <h4 className="text-md font-medium mb-2">
                        Book They're Offering:
                      </h4>
                      <div className="flex items-start">
                        {/* Add image for offered book */}
                        <img
                          src={
                            request.offeredBookImageUrl ||
                            "/placeholder-image.jpg"
                          }
                          alt={request.offeredBookTitle}
                          className="w-16 h-24 object-cover rounded-md mr-3"
                        />
                        <div>
                          <p className="font-bold">
                            {request.offeredBookTitle}
                          </p>
                          <p className="text-sm">
                            Author: {request.offeredBookAuthor}
                          </p>
                          <p className="text-sm">
                            Condition: {request.offeredBookCondition}
                          </p>
                          {request.offeredBookISBN && (
                            <p className="text-sm">
                              ISBN: {request.offeredBookISBN}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {request.status === "pending" && (
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => handleAction(request.id, "rejected")}
                        disabled={actionLoading[request.id]}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                      >
                        {actionLoading[request.id] ? (
                          <span className="flex items-center justify-center">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
                          </span>
                        ) : (
                          "Decline"
                        )}
                      </button>
                      <button
                        onClick={() => handleAction(request.id, "accepted")}
                        disabled={actionLoading[request.id]}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                      >
                        {actionLoading[request.id] ? (
                          <span className="flex items-center justify-center">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
                          </span>
                        ) : (
                          "Accept"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ReceivedExchangeRequests;
