import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ExchangerSideNav from "./ExchangerSideNav";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

function ExchangeBook() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isAvatarLoading, setIsAvatarLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();

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
    return () => clearInterval(intervalId);
  }, []);

  const fetchData = async () => {
    if (!userEmail) return;

    setLoading(true);
    setError(null);

    const url = searchQuery.trim()
      ? `http://localhost:8081/api/books/search?query=${encodeURIComponent(
          searchQuery
        )}&userEmail=${encodeURIComponent(userEmail)}`
      : `http://localhost:8081/api/books/available-books?role=Exchanger&userEmail=${encodeURIComponent(
          userEmail
        )}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        const bookForExchange = result.filter(
          (book) => book.userEmail !== userEmail
        );
        setData(bookForExchange);
      } else {
        const errorText = await response.text();
        setError(
          `Error: ${response.status} ${response.statusText} ${errorText}`
        );
      }
    } catch (error) {
      setError(error.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, userEmail]);

  const handleExchangeRequest = (book) => {
    navigate("/DashBoard/SelectBookForExchange", {
      state: { requestedBook: book },
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
      <ExchangerSideNav />
      <main className="flex-1 p-10 text-white">
        <div className="flex flex-col items-center mb-10 lg:flex-row lg:justify-between lg:items-center">
          <div className="text-center lg:text-left mb-4 lg:mb-0">
            <h1 className="text-2xl font-semibold">
              Books Available For Exchange
            </h1>
            <p className="text-sm text-white/70">
              Browse books from other users that are available for exchange
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

        <div className="flex mb-6 justify-center">
          <input
            type="text"
            placeholder="Search by Book Name, Author, or Genre"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-white placeholder:text-white w-full max-w-md px-4 py-2 rounded-full border-2  border-white/50 focus:outline-none"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="w-8 h-8 border-4 border-white/50 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-400 text-center">{error}</div>
        ) : data.length === 0 ? (
          <div className="text-white text-center mt-10">No books found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((book) => (
              <div key={book.bookId} className="m-2.5">
                <div className="flex flex-col bg-[#7a5442] rounded-2xl overflow-hidden shadow-md transition-transform transform hover:scale-105 w-full max-w-[320px] mx-auto h-full">
                  <img
                    src={book.imageUrl || "/placeholder-image.jpg"}
                    alt="Book Cover"
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div className="mb-2">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">
                          {book.name || "Book Name"}
                        </h2>
                        <span className="bg-yellow-300 text-black rounded-full py-0.5 px-2 text-xs font-semibold ml-2">
                          {book.condition || "10/10"}
                        </span>
                      </div>
                      <p className="text-sm text-white font-light mt-1">
                        {book.author || "Author's Name"}
                      </p>
                      <p className="text-sm text-white font-light mt-1">
                        Quantity: {book.quantity || 0}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <button
                        onClick={() => handleExchangeRequest(book)}
                        className="text-white rounded-lg py-1 px-4 text-xs font-bold border-none cursor-pointer bg-green-600 hover:bg-green-700"
                      >
                        Request for Exchange
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ExchangeBook;
