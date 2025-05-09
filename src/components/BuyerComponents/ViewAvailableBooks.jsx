import React, { useState, useEffect } from "react";
import BuyerSideNav from "./BuyerSideNav";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { useNavigate } from "react-router-dom";

function ViewAvailableBooks() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isAvatarLoading, setIsAvatarLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  // New state for quantity popup
  const [showQuantityPopup, setShowQuantityPopup] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [quantityError, setQuantityError] = useState("");

  // New state for managing chat initialization
  const [isInitializingChat, setIsInitializingChat] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setUserEmail(user.email);
      fetchWishlist(user.email);
      fetchCart(user.email);
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

  // New function to get seller emails from Firebase
  const fetchSellerEmailsFromFirebase = async (booksList) => {
    const db = getDatabase();
    const booksRef = ref(db, "books");

    try {
      // Create a copy of the books list to update with seller emails
      let updatedBooks = [...booksList];

      // Get all books data from Firebase
      const booksSnapshot = await get(booksRef);

      if (booksSnapshot.exists()) {
        const booksData = booksSnapshot.val();

        // Loop through each book in our list and find its seller email in Firebase
        updatedBooks = updatedBooks.map((book) => {
          const bookId = book.bookId;
          if (booksData[bookId] && booksData[bookId].userEmail) {
            return {
              ...book,
              sellerEmail: booksData[bookId].userEmail,
            };
          }
          return book;
        });
      }

      return updatedBooks;
    } catch (error) {
      console.error("Error fetching seller emails from Firebase:", error);
      // Return original books list if there's an error
      return booksList;
    }
  };

  const fetchCart = async (email) => {
    try {
      const response = await fetch(
        `http://localhost:8081/api/cart/get?userEmail=${encodeURIComponent(
          email
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        // Extract bookIds from cart items
        const cartBookIds = result.map((item) => item.bookId);
        setCartItems(cartBookIds);
      } else {
        console.error("Failed to fetch cart");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const fetchWishlist = async (email) => {
    try {
      const response = await fetch(
        `http://localhost:8081/api/wishlist/get?userEmail=${encodeURIComponent(
          email
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        // Extract bookIds from wishlist items
        const wishlistBookIds = result.map((item) => item.bookId);
        setWishlistItems(wishlistBookIds);
      } else {
        console.error("Failed to fetch wishlist");
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    // remove url piece of code and use actual code to get all books
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
        console.log("API response:", result); // Log the API response

        // Fetch seller emails from Firebase and update books data
        const booksWithSellerEmails = await fetchSellerEmailsFromFirebase(
          result
        );
        setData(booksWithSellerEmails);
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
    console.log("Data fetched:", data); // Add logging to check data structure
  }, [searchQuery]);

  const handleCartClick = () => {
    navigate("./Cart");
  };

  const handleAddToCartClick = (book) => {
    // Check if the book is already in the cart
    if (cartItems.includes(book.bookId)) {
      setError("This book is already in your cart!");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Open the quantity popup and set the selected book
    setSelectedBook(book);
    setQuantity("1"); // Reset quantity to default
    setQuantityError(""); // Clear any previous errors
    setShowQuantityPopup(true);
  };

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
    setQuantityError("");
  };

  const validateAndAddToCart = async () => {
    // Validate that quantity is a number and within valid range
    if (
      !quantity ||
      isNaN(quantity) ||
      quantity.includes(".") ||
      parseInt(quantity) <= 0
    ) {
      setQuantityError("Please enter a valid positive whole number.");
      return;
    }

    const numericQuantity = parseInt(quantity);

    if (numericQuantity > selectedBook.quantity) {
      setQuantityError(
        `Maximum available quantity is ${selectedBook.quantity}`
      );
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8081/api/cart/add?userEmail=${encodeURIComponent(
          userEmail
        )}&bookId=${encodeURIComponent(
          selectedBook.bookId
        )}&quantity=${numericQuantity}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Update cart items in state
        setCartItems([...cartItems, selectedBook.bookId]);
        alert("Book added to cart successfully!");
        // Close the popup
        setShowQuantityPopup(false);
      } else {
        const errorText = await response.text();
        setError(`Failed to add to cart: ${errorText}`);
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      setError(error.message || "Failed to add book to cart");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleAddToWishlist = async (book) => {
    try {
      const response = await fetch(
        `http://localhost:8081/api/wishlist/add?userEmail=${encodeURIComponent(
          userEmail
        )}&bookId=${encodeURIComponent(book.bookId)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Update wishlist items in state
        setWishlistItems([...wishlistItems, book.bookId]);
        alert("Book added to wishlist successfully!");
      } else {
        const errorText = await response.text();
        setError(`Failed to add to wishlist: ${errorText}`);
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      setError(error.message || "Failed to add to wishlist");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRemoveFromWishlist = async (bookId) => {
    try {
      const response = await fetch(
        `http://localhost:8081/api/wishlist/remove?userEmail=${encodeURIComponent(
          userEmail
        )}&bookId=${encodeURIComponent(bookId)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Update wishlist items in state
        setWishlistItems(wishlistItems.filter((id) => id !== bookId));
        alert("Book removed from wishlist successfully!");
      } else {
        const errorText = await response.text();
        setError(`Failed to remove from wishlist: ${errorText}`);
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      setError(error.message || "Failed to remove from wishlist");
      setTimeout(() => setError(null), 3000);
    }
  };

  // New function to initialize chat with book owner
  const handleChatWithOwner = async (sellerEmail) => {
    if (!userEmail) {
      setError("You must be logged in to chat with the seller");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (userEmail === sellerEmail) {
      setError("You cannot chat with yourself");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsInitializingChat(true);

    try {
      const response = await fetch(
        `http://localhost:8081/api/messages/getchatroom?senderEmail=${encodeURIComponent(
          userEmail
        )}&receiverEmail=${encodeURIComponent(sellerEmail)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        // Navigate to the chat page with the chatId
        navigate(`/DashBoard/BuyerChat`);
      } else {
        const errorText = await response.text();
        setError(`Failed to initialize chat: ${errorText}`);
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      setError(error.message || "Failed to initialize chat");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsInitializingChat(false);
    }
  };

  const isBookInWishlist = (bookId) => {
    return wishlistItems.includes(bookId);
  };

  const isBookInCart = (bookId) => {
    return cartItems.includes(bookId);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          "radial-gradient(ellipse at center, #A8816C 0%, #905A40 50%, #6E4C3D 100%)",
      }}
    >
      <BuyerSideNav />
      <main className="flex-1 p-10 text-white">
        <div className="flex flex-col items-center mb-10 lg:flex-row lg:justify-between lg:items-center">
          <div className="text-center lg:text-left mb-4 lg:mb-0">
            <h1 className="text-2xl font-semibold">Available Books</h1>
            <p className="text-sm text-white/70">
              Browse all books available for purchase
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

        {error && (
          <div className="bg-red-500 text-white p-2 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="w-8 h-8 border-4 border-white/50 border-t-transparent rounded-full animate-spin" />
          </div>
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
                      <p className="text-sm text-white font-light mt-1">
                        Seller:{" "}
                        {book.sellerEmail
                          ? book.sellerEmail.split("@")[0]
                          : "Unknown"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {isBookInCart(book.bookId) ? (
                        <button className="text-white rounded-lg py-1 px-4 text-xs font-bold border-none cursor-default bg-gray-600">
                          In Cart
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddToCartClick(book)}
                          className="text-white rounded-lg py-1 px-4 text-xs font-bold border-none cursor-pointer bg-red-600 hover:bg-red-700"
                        >
                          Add to Cart
                        </button>
                      )}

                      {isBookInWishlist(book.bookId) ? (
                        <button
                          onClick={() => handleRemoveFromWishlist(book.bookId)}
                          className="text-white rounded-lg py-1 px-4 text-xs font-bold border-none cursor-pointer bg-pink-600 hover:bg-pink-700 flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Wishlisted
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddToWishlist(book)}
                          className="text-white rounded-lg py-1 px-4 text-xs font-bold border-none cursor-pointer bg-purple-600 hover:bg-purple-700 flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          Wishlist
                        </button>
                      )}
                    </div>

                    {/* Chat with Seller Button - Always visible */}
                    <button
                      onClick={() =>
                        handleChatWithOwner(
                          book.sellerEmail || "seller@example.com"
                        )
                      }
                      disabled={
                        isInitializingChat ||
                        !book.sellerEmail ||
                        book.sellerEmail === userEmail
                      }
                      className={`w-full mt-3 text-white rounded-lg py-1 px-4 text-xs font-bold border-none flex items-center justify-center ${
                        !book.sellerEmail || book.sellerEmail === userEmail
                          ? "bg-gray-600 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                      }`}
                    >
                      {isInitializingChat ? (
                        <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      )}
                      Chat with Seller
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quantity Popup Modal */}
        {showQuantityPopup && selectedBook && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent bg-opacity-50">
            <div className="bg-[#7a5442] p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">
                Enter Quantity for {selectedBook.name}
              </h3>

              <div className="text-white mb-2">
                Available: {selectedBook.quantity}
              </div>

              <div className="mb-4">
                <label htmlFor="quantity" className="block text-white mb-2">
                  Quantity:
                </label>
                <input
                  type="text"
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-full px-3 py-2 bg-[#6e4c3d] text-white rounded border border-white/30 focus:outline-none focus:border-white"
                  autoFocus
                />
                {quantityError && (
                  <p className="text-red-400 text-sm mt-1">{quantityError}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowQuantityPopup(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={validateAndAddToCart}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ViewAvailableBooks;
