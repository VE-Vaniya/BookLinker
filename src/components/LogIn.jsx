import React, { useState } from "react";
import landing from "../assets/landing.jpg";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseconfig";

const LogIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setLoginError("");
    setLoading(true);

    if (!email.endsWith("@gmail.com")) {
      setEmailError("Email must end with @gmail.com");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();

      const response = await fetch("http://localhost:8081/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Invalid Login attempt");
      }

      navigate("/DashBoard");
    } catch (error) {
      setLoginError("Invalid email or password");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center relative px-4"
      style={{
        backgroundImage: `url(${landing})`,
      }}
    >
      <div className="relative flex flex-col items-center justify-center w-full h-full">
        <div className="absolute -top-40 left-1/2 transform -translate-x-1/2">
          <img
            src={logo}
            alt="Logo"
            className="max-w-[1100px] w-[1100px] h-auto drop-shadow-md"
          />
        </div>

        <div className="w-[450px] bg-[#a8816c]/70 backdrop-blur-md rounded-3xl px-8 py-14 text-center text-white shadow-lg relative z-0 mt-[150px]">
          <h2 className="text-5xl font-extrabold text-[#793313] mb-2">
            SIGN IN
          </h2>
          <p className="text-lg font-semibold text-[#2d2321] mb-6">
            Sign in to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-left">
              <input
                type="text"
                placeholder="Email"
                className="w-full px-4 py-2 rounded-full bg-[#d1a98c] text-[#2d2321] placeholder:text-[#2d2321] focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && (
                <p className="text-[#2d2321] mt-1 text-sm">{emailError}</p>
              )}
            </div>
            <div className="text-left">
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 rounded-full bg-[#d1a98c] text-[#2d2321] placeholder:text-[#2d2321] focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 bg-[#5e3d2b] text-white py-2 rounded-full font-semibold transition duration-200
                ${
                  loading
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-transparent hover:border hover:border-[#5e3d2b] cursor-pointer"
                }`}
            >
              {loading && (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Signing In..." : "Log In"}
            </button>
            {loginError && (
              <p className="text-[#2d2321] mt-2 text-center text-sm">
                {loginError}
              </p>
            )}
          </form>

          <div className="mt-6 flex justify-center text-xs text-white">
            <Link
              to="/SignUp"
              className="hover:underline text-sm font-semibold"
            >
              Don't have an account? SignUp
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
