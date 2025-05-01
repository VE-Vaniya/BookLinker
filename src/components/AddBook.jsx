import React, { useEffect, useState } from "react";
import SideNav from "./SideNav";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

export default function AddBook() {
  const [form, setForm] = useState({
    bookName: "",
    authorName: "",
    price: "",
    isbn: "",
    condition: "",
    genre: "",
    description: "",
    file: null,
    quantity: 1,
    status: "Available",
  });

  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    const fetchData = async () => {
      if (user) {
        const uid = user.uid;
        const safeEmail = user.email.replace(/\./g, "_");
        const db = getDatabase();

        const roleRef = ref(db, `users/${uid}/role`);
        const profileImageRef = ref(
          db,
          `userProfiles/${safeEmail}/profileImageUrl`
        );

        try {
          setIsLoading(true);
          const [roleSnap, imageSnap] = await Promise.all([
            get(roleRef),
            get(profileImageRef),
          ]);

          if (roleSnap.exists()) {
            setIsSeller(
              roleSnap.val() === "seller" || roleSnap.val() === "Seller"
            );
          }

          const imageUrl = imageSnap.exists() ? imageSnap.val() : "";
          setAvatarUrl(
            typeof imageUrl === "string" && imageUrl.startsWith("http")
              ? imageUrl
              : ""
          );
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();

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

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setForm({ ...form, file });
      const imageUrl = URL.createObjectURL(file);
      setPreviewUrl(imageUrl);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validateFields = () => {
    const newErrors = [];

    if (!form.bookName) newErrors.push("Book Name is required.");
    if (!form.authorName) newErrors.push("Author Name is required.");
    if (!form.price) newErrors.push("Price is required.");
    if (!form.isbn) newErrors.push("ISBN is required.");
    if (!form.condition) newErrors.push("Condition is required.");
    if (!form.genre) newErrors.push("Genre is required.");
    if (!form.description) newErrors.push("Description is required.");
    if (!form.file) newErrors.push("Image file is required.");
    if (!form.quantity) newErrors.push("Quantity is required.");

    if (form.isbn && !/^\d{13}$/.test(form.isbn)) {
      newErrors.push("ISBN must be a 13-digit number.");
    }

    if (
      form.quantity &&
      (isNaN(parseInt(form.quantity)) || parseInt(form.quantity) <= 0)
    ) {
      newErrors.push("Quantity must be a positive number greater than 0.");
    }

    if (
      form.price &&
      (isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0)
    ) {
      newErrors.push("Price must be a positive number greater than 0.");
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    const errors = validateFields();
    if (errors.length > 0) {
      setErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      const user = getAuth().currentUser;
      const bookData = {
        name: form.bookName,
        author: form.authorName,
        price: parseFloat(form.price),
        isbn: form.isbn,
        condition: form.condition,
        genre: form.genre,
        description: form.description,
        userEmail: user.email,
        quantity: parseInt(form.quantity),
        status: "Available",
      };

      formData.append(
        "book",
        new Blob([JSON.stringify(bookData)], { type: "application/json" })
      );
      formData.append("image", form.file);
      formData.append("isSeller", isSeller);

      const response = await fetch("http://localhost:8081/api/books/add", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setSuccessMessage("✅ Book added successfully!");
        setForm({
          bookName: "",
          authorName: "",
          price: "",
          isbn: "",
          condition: "",
          genre: "",
          description: "",
          file: null,
          quantity: 1,
          status: "Available",
        });
        setPreviewUrl(null);
        setErrors([]);

        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        const error = await response.text();
        throw new Error(error || "Failed to add book.");
      }
    } catch (err) {
      console.error("❌ Error submitting book:", err);
      setErrors(["Failed to add book. Please try again."]);
      setSuccessMessage("");
    } finally {
      setIsSubmitting(false);
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
            <h1 className="text-2xl font-semibold">Book Description</h1>
            <p className="text-sm text-white/70">Add a Book</p>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-sm bg-white rounded-full px-4 py-1 text-black">
              ⏰ {currentTime}
            </div>
            <div className="text-sm bg-white rounded-full px-4 py-1 text-black">
              📅 {currentDate}
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              {isLoading ? (
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

        <form
          onSubmit={handleSubmit}
          className="bg-white/10 p-10 rounded-2xl shadow-md max-w-6xl mx-auto space-y-6"
        >
          {errors.length > 0 && (
            <div className="text-red-500 mb-4">
              <ul>
                {errors.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="text-green-500 mb-4">{successMessage}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <input
              type="text"
              name="bookName"
              value={form.bookName}
              onChange={handleChange}
              placeholder="Book name"
              required
              className="bg-transparent border border-white/50 px-4 py-2 rounded-xl text-white placeholder-white/70"
            />
            <input
              type="text"
              name="authorName"
              value={form.authorName}
              onChange={handleChange}
              placeholder="Author Name"
              required
              className="bg-transparent border border-white/50 px-4 py-2 rounded-xl text-white placeholder-white/70"
            />
            <select
              name="condition"
              value={form.condition}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-xl bg-transparent border border-white/50 text-white focus:outline-none"
            >
              <option className="text-black" value="">
                Condition
              </option>
              <option className="text-black" value="Excellent">
                Excellent
              </option>
              <option className="text-black" value="Good">
                Good
              </option>
              <option className="text-black" value="Average">
                Average
              </option>
              <option className="text-black" value="Poor">
                Poor
              </option>
            </select>
            <select
              name="genre"
              value={form.genre}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-xl bg-transparent border border-white/50 text-white focus:outline-none"
            >
              <option className="text-black" value="">
                Genre
              </option>
              <option className="text-black" value="Fiction">
                Fiction
              </option>
              <option className="text-black" value="Non-fiction">
                Non-fiction
              </option>
              <option className="text-black" value="Mystery">
                Mystery
              </option>
              <option className="text-black" value="Biography">
                Biography
              </option>
              <option className="text-black" value="Fantasy">
                Fantasy
              </option>
              <option className="text-black" value="Science">
                Science
              </option>
              <option className="text-black" value="Other">
                Other
              </option>
            </select>
            <input
              type="text"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              required
              className="bg-transparent border border-white/50 px-4 py-2 rounded-xl text-white placeholder-white/70"
            />
            <input
              type="text"
              name="isbn"
              value={form.isbn}
              onChange={handleChange}
              placeholder="ISBN"
              required
              className="bg-transparent border border-white/50 px-4 py-2 rounded-xl text-white placeholder-white/70"
            />
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              placeholder="Quantity"
              min="1"
              required
              className="bg-transparent border border-white/50 px-4 py-2 rounded-xl text-white placeholder-white/70"
            />
          </div>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Book Description"
            required
            className="w-full bg-transparent border border-white/50 px-4 py-2 rounded-xl text-white placeholder-white/70"
          />

          <div>
            <label className="w-full border border-dashed border-white/40 rounded-xl text-center py-10 cursor-pointer hover:bg-white/5 block">
              <input
                type="file"
                name="file"
                accept="image/*"
                onChange={handleChange}
                required
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center text-white/80">
                <span className="text-4xl mb-2">☁️</span>
                <p>Upload a File</p>
                <small className="text-white/50">
                  drag and drop files here
                </small>
              </div>
            </label>

            {previewUrl && (
              <div className="mt-4 flex justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-64 rounded-xl border border-white/30"
                />
              </div>
            )}
          </div>

          <div className="text-center">
            {isSubmitting ? (
              <div className="w-6 h-6 border-4 border-white/50 border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              <button
                type="submit"
                className="bg-[#4c2b1f] cursor-pointer text-white px-8 py-2 rounded-xl hover:bg-[#6e3f2d] transition"
              >
                Submit
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
