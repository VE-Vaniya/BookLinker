import React, { useState, useEffect } from "react";
import SideNav from "./BuyerSideNav";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { useNavigate } from "react-router-dom";

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isAvatarLoading, setIsAvatarLoading] = useState(true);

  // Fetch avatar and set time
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

  // Load cart items from localStorage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("bookCart");
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to load cart items:", error);
      setError("Failed to load cart items. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove item from cart
  const removeFromCart = (bookId) => {
    try {
      const updatedCart = cartItems.filter((item) => item.bookId !== bookId);
      setCartItems(updatedCart);
      localStorage.setItem("bookCart", JSON.stringify(updatedCart));
    } catch (error) {
      setError("Failed to remove item from cart");
      console.log(error);
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    alert("Proceeding to checkout...");
    // Implement checkout logic or navigation here
  };

  // Clear entire cart
  const clearCart = () => {
    try {
      setCartItems([]);
      localStorage.setItem("bookCart", JSON.stringify([]));
    } catch (error) {
      setError("Failed to clear cart");
      console.log(error);
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
            <h1 className="text-2xl font-semibold">Your Cart</h1>
            <p className="text-sm text-white/70">
              View items you've added to your cart
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

        <div className="mb-6">
          <button
            onClick={() => navigate(-1)} // Changed to navigate(-1) to act like a browser back button
            className="bg-[#4a2c2a] hover:bg-[#3a1c1a] text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Continue Shopping
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="w-8 h-8 border-4 border-white/50 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-400 text-center p-4">{error}</div>
        ) : cartItems.length === 0 ? (
          <div className="text-center p-10">
            <p className="text-xl mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate(-1)} // Changed to navigate(-1) for consistency
              className="bg-[#4a2c2a] hover:bg-[#3a1c1a] text-white px-6 py-2 rounded-lg"
            >
              Browse Books
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}{" "}
                in cart
              </h2>
              <button
                onClick={clearCart}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-lg text-sm"
              >
                Clear Cart
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cartItems.map((book) => (
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
                            {book.condition || "N/A"}
                          </span>
                        </div>
                        <p className="text-sm text-white font-light mt-1">
                          {book.author || "Author's Name"}
                        </p>
                        <p className="text-sm text-white font-light mt-1">
                          Quantity: {book.quantity || 1}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <button
                          onClick={() => removeFromCart(book.bookId)}
                          className="text-white rounded-lg py-1 px-4 text-xs font-bold border-none cursor-pointer bg-red-600 hover:bg-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleCheckout}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Cart;
