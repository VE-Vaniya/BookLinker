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
  const [userEmail, setUserEmail] = useState("");

  // Fetch avatar, user email, and set time
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

  // Load cart items from API and fetch book details
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!userEmail) return;

      setLoading(true);
      try {
        // Fetch cart items
        const response = await fetch(
          `http://localhost:8081/api/cart/get?userEmail=${encodeURIComponent(
            userEmail
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch cart: ${errorText}`);
        }

        const cartItemsData = await response.json();
        console.log("Cart items from API:", cartItemsData);

        // For each cart item, fetch book details
        const itemsWithDetails = await Promise.all(
          cartItemsData.map(async (item) => {
            try {
              // Fetch book details using bookId
              const db = getDatabase();
              const bookRef = ref(db, `books/${item.bookId}`);
              const bookSnap = await get(bookRef);

              if (bookSnap.exists()) {
                const bookData = bookSnap.val();
                return {
                  ...item,
                  book: bookData,
                };
              } else {
                console.error(`Book with ID ${item.bookId} not found`);
                return {
                  ...item,
                  book: {
                    name: "Book Not Found",
                    author: "Unknown",
                    condition: "N/A",
                    imageUrl: "/placeholder-image.jpg",
                  },
                };
              }
            } catch (error) {
              console.error(
                `Error fetching book details for ${item.bookId}:`,
                error
              );
              return {
                ...item,
                book: {
                  name: "Error Loading Book",
                  author: "Unknown",
                  condition: "N/A",
                  imageUrl: "/placeholder-image.jpg",
                },
              };
            }
          })
        );

        setCartItems(itemsWithDetails);
      } catch (error) {
        console.error("Failed to load cart items:", error);
        setError("Failed to load cart items. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [userEmail]);

  // Remove item from cart
  const removeFromCart = async (bookId) => {
    if (!userEmail) {
      setError("User not logged in. Please log in to manage your cart.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8081/api/cart/remove?userEmail=${encodeURIComponent(
          userEmail
        )}&bookId=${encodeURIComponent(bookId)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to remove item from cart: ${errorText}`);
      }

      // Refresh cart data after successful removal
      fetchCartItems();
    } catch (error) {
      setError("Failed to remove item from cart");
      console.error(error);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Fetch cart items function to be used after operations
  const fetchCartItems = async () => {
    if (!userEmail) return;

    setLoading(true);
    try {
      // Fetch cart items
      const response = await fetch(
        `http://localhost:8081/api/cart/get?userEmail=${encodeURIComponent(
          userEmail
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch cart: ${errorText}`);
      }

      const cartItemsData = await response.json();

      // For each cart item, fetch book details
      const itemsWithDetails = await Promise.all(
        cartItemsData.map(async (item) => {
          try {
            // Fetch book details using bookId
            const db = getDatabase();
            const bookRef = ref(db, `books/${item.bookId}`);
            const bookSnap = await get(bookRef);

            if (bookSnap.exists()) {
              const bookData = bookSnap.val();
              return {
                ...item,
                book: bookData,
              };
            } else {
              console.error(`Book with ID ${item.bookId} not found`);
              return {
                ...item,
                book: {
                  name: "Book Not Found",
                  author: "Unknown",
                  condition: "N/A",
                  imageUrl: "/placeholder-image.jpg",
                },
              };
            }
          } catch (error) {
            console.error(
              `Error fetching book details for ${item.bookId}:`,
              error
            );
            return {
              ...item,
              book: {
                name: "Error Loading Book",
                author: "Unknown",
                condition: "N/A",
                imageUrl: "/placeholder-image.jpg",
              },
            };
          }
        })
      );

      setCartItems(itemsWithDetails);
    } catch (error) {
      console.error("Failed to load cart items:", error);
      setError("Failed to load cart items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price
  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => {
        const price = item.book?.price || 0;
        return total + price * item.quantity;
      }, 0)
      .toFixed(2);
  };

  // Handle checkout
  const handleCheckout = () => {
    alert("Proceeding to checkout...");
    // Implement checkout logic or navigation here
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
            onClick={() => navigate(-1)}
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

        {error && (
          <div className="bg-red-500 text-white p-2 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="w-8 h-8 border-4 border-white/50 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="text-center p-10">
            <p className="text-xl mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-[#4a2c2a] hover:bg-[#3a1c1a] text-white px-6 py-2 rounded-lg"
            >
              Browse Books
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h2 className="text-xl">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"}{" "}
                in cart
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cartItems.map((item) => (
                <div key={item.bookId} className="m-2.5">
                  <div className="flex flex-col bg-[#7a5442] rounded-2xl overflow-hidden shadow-md transition-transform transform hover:scale-105 w-full max-w-[320px] mx-auto h-full">
                    <img
                      src={item.book?.imageUrl || "/placeholder-image.jpg"}
                      alt={item.book?.name || "Book Cover"}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4 flex flex-col justify-between flex-1">
                      <div className="mb-2">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-bold text-white">
                            {item.book?.name || "Book Name"}
                          </h2>
                          <span className="bg-yellow-300 text-black rounded-full py-0.5 px-2 text-xs font-semibold ml-2">
                            {item.book?.condition || "N/A"}
                          </span>
                        </div>
                        <p className="text-sm text-white font-light mt-1">
                          {item.book?.author || "Author's Name"}
                        </p>
                        <p className="text-sm text-white mt-1">
                          Price: ${item.book?.price || "0.00"}
                        </p>
                        <p className="text-sm text-white mt-1">
                          Quantity: {item.quantity || 1}
                        </p>
                        <p className="text-sm text-white font-semibold mt-1">
                          Subtotal: $
                          {(
                            (item.book?.price || 0) * (item.quantity || 1)
                          ).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <button
                          onClick={() => removeFromCart(item.bookId)}
                          className="text-white rounded-lg py-1 px-4 text-xs font-bold border-none cursor-pointer bg-red-600 hover:bg-red-700"
                        >
                          Remove One
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-[#4a2c2a] p-4 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Cart Total:</span>
                <span className="font-bold text-xl">${calculateTotal()}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold"
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
