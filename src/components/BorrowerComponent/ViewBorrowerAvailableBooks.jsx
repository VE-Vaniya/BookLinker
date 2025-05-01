import React, { useState, useEffect } from "react";
import SideNav from "./BorrowerSideNav";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { useNavigate } from "react-router-dom";

function ViewBorrowerAvailableBooks() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    // remove url pice of code and use actual code to get all books
    const url = searchQuery.trim()
      ? `http://localhost:8081/api/books/search?query=${encodeURIComponent(
          searchQuery
        )}`
      : `http://localhost:8081/api/books/available-books?role=buyer`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
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
  }, [searchQuery]);

  const handleCartClick = () => {
    navigate("./Cart");
  };

  const handleAddToCart = async (book) => {
    try {
      // Get existing cart from localStorage or initialize empty array
      const existingCart = JSON.parse(localStorage.getItem("bookCart") || "[]");

      // Check if the book is already in the cart
      const bookExists = existingCart.some(
        (item) => item.bookId === book.bookId
      );

      if (bookExists) {
        setError("This book is already in your cart!");
        setTimeout(() => setError(null), 3000);
        return;
      }

      // Add book to cart
      const updatedCart = [...existingCart, book];

      // Save updated cart to localStorage
      localStorage.setItem("bookCart", JSON.stringify(updatedCart));

      // Show success message
      alert("Book added to cart successfully!");
    } catch (error) {
      setError(error.message || "Failed to add book to cart");
    }
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
            <h1 className="text-2xl font-semibold">Available Books</h1>
            <p className="text-sm text-white/70">
              Browse all books available for borrowed
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

        <div className="flex justify-center mb-6 relative">
          <div className="w-full max-w-md relative flex items-center">
            <input
              type="text"
              placeholder="Search by Book Name, Author, or Genre"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-white placeholder:text-white w-full px-4 py-2 rounded-full border-2 border-white/50 focus:outline-none"
            />
            <button
              onClick={handleCartClick}
              className="absolute right-0 bg-[#4a2c2a] text-white px-4 py-2 rounded-full flex items-center justify-center hover:bg-[#3a1c1a] transition-colors"
              style={{ transform: "translateX(calc(100% + 10px))" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Cart
            </button>
          </div>
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
                        onClick={() => handleAddToCart(book)}
                        className="text-white rounded-lg py-1 px-4 text-xs font-bold border-none cursor-pointer bg-red-600 hover:bg-red-700"
                      >
                        Add to Cart
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

export default ViewBorrowerAvailableBooks;
