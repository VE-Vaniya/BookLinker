import React, { useEffect, useState } from "react";
import SideNav from "./BuyerSideNav";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

export default function BuyerFileComplaint() {
  const [form, setForm] = useState({
    natureOfConcern: "",
    details: "",
    complaineeEmail: "",
  });
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailVerificationStatus, setEmailVerificationStatus] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    const fetchData = async () => {
      if (user) {
        const safeEmail = user.email.replace(/\./g, "_");
        const db = getDatabase();
        const profileImageRef = ref(
          db,
          `userProfiles/${safeEmail}/profileImageUrl`
        );

        try {
          setIsLoading(true);
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
    const timer = setTimeout(() => {
      if (
        form.complaineeEmail &&
        form.natureOfConcern === "Complaint Against User"
      ) {
        verifyEmail();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [form.complaineeEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "complaineeEmail") {
      setEmailVerificationStatus(null);
    }
  };

  const verifyEmail = async () => {
    if (!form.complaineeEmail || form.complaineeEmail.trim() === "") {
      setEmailVerificationStatus("empty");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.complaineeEmail)) {
      setEmailVerificationStatus("invalid");
      return false;
    }

    setIsVerifyingEmail(true);
    try {
      const db = getDatabase();
      const safeEmail = form.complaineeEmail.replace(/\./g, "_");
      const userRef = ref(db, `userProfiles/${safeEmail}`);

      const snapshot = await get(userRef);
      const exists = snapshot.exists();

      setEmailVerificationStatus(exists ? "exists" : "not-found");
      return exists;
    } catch (error) {
      console.error("Error verifying email:", error);
      setEmailVerificationStatus("error");
      return false;
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    if (!form.natureOfConcern || !form.details) {
      setErrors(["All fields are required."]);
      setIsSubmitting(false);
      return;
    }

    if (form.natureOfConcern === "Complaint Against User") {
      const emailValid = await verifyEmail();
      if (!emailValid) {
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      const payload = {
        natureOfConcern: form.natureOfConcern,
        details: form.details,
        email: user.email,
        username: user.displayName || "Unknown",
      };

      if (form.natureOfConcern === "Complaint Against User") {
        payload.complaineeEmail = form.complaineeEmail;
      }

      const endpoint =
        form.natureOfConcern === "Complaint Against User"
          ? "http://localhost:8081/api/complaints/file"
          : "http://localhost:8081/api/complaints/file-general";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessMessage(result.message);
        setForm({ natureOfConcern: "", details: "", complaineeEmail: "" });
        setEmailVerificationStatus(null);

        setTimeout(() => {
          setSuccessMessage("");
        }, 5000);
      } else {
        const err = await response.json();
        setErrors([err.error || "Submission failed"]);
      }
    } catch (err) {
      console.error(err);
      setErrors(["An unexpected error occurred."]);
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
            <h1 className="text-2xl font-semibold">File Complaint</h1>
            <p className="text-sm text-white/70">Add a Complaint</p>
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
          className="bg-white/10 p-10 rounded-2xl shadow-md max-w-4xl mx-auto space-y-6"
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

          {successMessage && (
            <div className="text-green-500 mb-4">{successMessage}</div>
          )}

          <select
            name="natureOfConcern"
            value={form.natureOfConcern}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-xl bg-transparent border border-white/50 text-white focus:outline-none"
          >
            <option className="text-black" value="">
              Nature of Concern
            </option>
            <option className="text-black" value="Bug">
              Bug
            </option>
            <option className="text-black" value="Performance Issue">
              Performance Issue
            </option>
            <option className="text-black" value="App Crashes">
              App Crashes
            </option>
            <option className="text-black" value="Content Issue">
              Content Issue
            </option>
            <option className="text-black" value="Complaint Against User">
              Complaint Against User
            </option>
            <option className="text-black" value="Other">
              Other
            </option>
          </select>

          {form.natureOfConcern === "Complaint Against User" && (
            <div className="space-y-2">
              <input
                type="email"
                name="complaineeEmail"
                value={form.complaineeEmail}
                onChange={handleChange}
                placeholder="Enter user's email"
                className="w-full bg-transparent border border-white/50 px-4 py-2 rounded-xl text-white placeholder-white/70"
              />

              {isVerifyingEmail && (
                <div className="text-sm text-white/70">Verifying email...</div>
              )}

              {emailVerificationStatus && !isVerifyingEmail && (
                <div
                  className={`text-sm ${
                    emailVerificationStatus === "exists"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {emailVerificationStatus === "exists" && "✅ User exists"}
                  {emailVerificationStatus === "not-found" &&
                    "❌ User not found"}
                  {emailVerificationStatus === "empty" &&
                    "❌ Email cannot be empty"}
                  {emailVerificationStatus === "invalid" &&
                    "❌ Invalid email format"}
                  {emailVerificationStatus === "error" &&
                    "❌ Error verifying email"}
                </div>
              )}
            </div>
          )}

          <textarea
            name="details"
            value={form.details}
            onChange={handleChange}
            placeholder="Describe your concern in detail..."
            required
            className="w-full bg-transparent border border-white/50 px-4 py-2 rounded-xl text-white placeholder-white/70"
            rows="5"
          />

          <div className="text-center">
            {isSubmitting ? (
              <div className="w-6 h-6 border-4 border-white/50 border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              <button
                type="submit"
                className="cursor-pointer bg-[#4c2b1f] text-white px-8 py-2 rounded-xl hover:bg-[#6e3f2d] transition"
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
