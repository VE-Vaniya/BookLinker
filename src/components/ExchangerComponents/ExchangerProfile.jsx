import React, { useState, useEffect } from "react";
import { getAuth, updatePassword, updateProfile } from "firebase/auth";
import { getDatabase, ref, get, update } from "firebase/database";
import ExchangerSideNav from "./ExchangerSideNav";

export default function ExchangerProfileSetup() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    avatar: null,
  });

  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    const fetchUserAvatar = async () => {
      if (user?.email) {
        const safeEmail = user.email.replace(/\./g, "_");
        const db = getDatabase();
        const profileRef = ref(
          db,
          "userProfiles/" + safeEmail + "/profileImageUrl"
        );

        try {
          setIsLoading(true);
          const profileSnapshot = await get(profileRef);
          if (profileSnapshot.exists()) {
            const imageUrl = profileSnapshot.val();
            if (typeof imageUrl === "string" && imageUrl.startsWith("http")) {
              setAvatarUrl(imageUrl);
            } else {
              setAvatarUrl("");
            }
          } else {
            setAvatarUrl("");
          }
        } catch (error) {
          console.error("Error fetching avatar:", error);
          setAvatarUrl("");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserAvatar();

    const updateTimeAndDate = () => {
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

    const intervalId = setInterval(updateTimeAndDate, 60000);
    updateTimeAndDate();
    return () => clearInterval(intervalId);
  }, []);

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    setError("");

    if (name === "avatar") {
      const selectedFile = files[0];
      if (selectedFile) {
        const localImageUrl = URL.createObjectURL(selectedFile);
        setAvatarUrl(localImageUrl);
        setFormData({ ...formData, avatar: selectedFile });

        const formDataImage = new FormData();
        formDataImage.append("file", selectedFile);

        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          formDataImage.append("email", user.email);

          try {
            const response = await fetch(
              "http://localhost:8081/api/profile/upload-image",
              {
                method: "POST",
                body: formDataImage,
              }
            );
            const textData = await response.text();
            if (response.ok && textData.startsWith("http")) {
              setAvatarUrl(textData);
            } else {
              setError("Error uploading image.");
            }
          } catch (err) {
            setError("Failed to upload image." + err);
          }
        }
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { username, password, confirmPassword } = formData;

    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        if (user.displayName !== username) {
          await updateProfile(user, { displayName: username });
        }

        await updatePassword(user, password);

        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);
        await update(userRef, {
          name: username,
        });

        setError("Profile updated successfully!");
      } else {
        setError("No user is currently signed in.");
      }
    } catch (error) {
      console.error(error);
      setError(error.message);
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
      <ExchangerSideNav />

      <main className="flex-1 p-10 text-white">
        <div className="flex flex-col items-center mb-10 lg:flex-row lg:justify-between lg:items-center">
          <div className="text-center lg:text-left mb-4 lg:mb-0">
            <h1 className="text-2xl font-semibold">Profile Setup</h1>
            <p className="text-sm text-white/70">Edit Profile</p>
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
                <div className="w-8 h-8 border-4 border-t-4 border-white/50 border-solid rounded-full animate-spin"></div>
              ) : avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="w-full h-full rounded-full object-cover"
                  onError={() => {
                    console.log("Error loading image.");
                    setAvatarUrl("");
                  }}
                />
              ) : (
                <span className="text-2xl text-white/50">👤</span>
              )}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/10 p-10 rounded-2xl shadow-md max-w-3xl mx-auto space-y-6"
        >
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center">
              {isLoading ? (
                <div className="w-8 h-8 border-4 border-t-4 border-white/50 border-solid rounded-full animate-spin"></div>
              ) : avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="w-full h-full rounded-full object-cover"
                  onError={() => {
                    console.log("Error loading image.");
                    setAvatarUrl("");
                  }}
                />
              ) : (
                <span className="text-6xl text-white/50">👤</span>
              )}
            </div>
            <label className="mt-4">
              <input
                type="file"
                name="avatar"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
              />
              <span className="cursor-pointer bg-[#6b3f2f] text-white px-4 py-2 rounded-full hover:bg-[#8d5843]">
                Upload a photo
              </span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="username"
              value={formData.username}
              placeholder="Enter username"
              onChange={handleChange}
              className="col-span-2 bg-transparent border border-white/50 px-4 py-2 rounded-xl text-white placeholder-white/70"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              className="bg-transparent border border-white/50 px-4 py-2 rounded-xl text-white placeholder-white/70"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              onChange={handleChange}
              className="bg-transparent border border-white/50 px-4 py-2 rounded-xl text-white placeholder-white/70"
            />
          </div>

          {error && (
            <div className="text-white text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            className="bg-[#4c2b1f] text-white px-6 py-2 rounded-xl hover:bg-[#6e3f2d] transition"
          >
            Submit
          </button>
        </form>
      </main>
    </div>
  );
}
