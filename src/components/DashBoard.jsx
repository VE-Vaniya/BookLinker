import React, { useState, useEffect } from "react";
import SideNav from "./SideNav";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from "recharts";
import { getAuth } from "firebase/auth";

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [bookData, setBookData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError("User not authenticated.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:8081/api/books/available-books?userEmail=${encodeURIComponent(user.email)}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        setBookData(result);
      } catch (err) {
        setError("Error fetching data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookData();
  }, []);

  const chartData = bookData.reduce((acc, book) => {
    const genre = book.genre || "Unknown";
    const quantity = book.quantity || 1;

    const existingGenre = acc.find((item) => item.genre === genre);
    if (existingGenre) {
      existingGenre.quantity += quantity;
    } else {
      acc.push({ genre, quantity });
    }
    return acc;
  }, []);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setCurrentDate(
        now.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).replace(/ /g, "-")
      );
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: "radial-gradient(ellipse at center, #A8816C 0%, #905A40 50%, #6E4C3D 100%)",
      }}
    >
      <SideNav />
      <main className="flex-1 p-10 text-white">
        {/* Header */}
        <div className="flex flex-col items-center mb-10 lg:flex-row lg:justify-between lg:items-center">
          <div className="text-center lg:text-left mb-4 lg:mb-0">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="text-sm text-white/70">Welcome to your dashboard</p>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-sm bg-white rounded-full px-4 py-1 text-black">
              ⏰ {currentTime}
            </div>
            <div className="text-sm bg-white rounded-full px-4 py-1 text-black">
              📅 {currentDate}
            </div>
          </div>
        </div>

        {/* Chart and Info Section */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="w-10 h-10 border-4 border-white/40 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-400 text-center">{error}</div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Chart */}
            <div className="w-full lg:w-2/3 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="#ffffff20" />
                  <XAxis dataKey="genre" stroke="#fff">
                    <Label value="Genre" offset={-10} position="insideBottom" fill="#fff" />
                  </XAxis>
                  <YAxis stroke="#fff">
                    <Label value="Quantity" angle={-90} position="insideLeft" fill="#fff" />
                  </YAxis>
                  <Tooltip contentStyle={{ backgroundColor: "#6E4C3D", border: "none", color: "#fff" }} />
                  <Legend wrapperStyle={{ color: "red" }} />
                  <Bar
                    dataKey="quantity"
                    fill="#F2C94C"
                    radius={[10, 10, 0, 0]}
                    barSize={100}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Information Section */}
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-xl font-semibold mb-4">Overview</h2>
              <p className="text-white/80 mb-2">
                📚 Total Genres: <strong>{chartData.length}</strong>
              </p>
              <p className="text-white/80 mb-2">
                📦 Total Books: <strong>{bookData.reduce((sum, b) => sum + (b.quantity || 1), 0)}</strong>
              </p>
              <p className="text-white/80">
                🔥 Top Genre:{" "}
                <strong>
                  {chartData.length > 0
                    ? chartData.reduce((a, b) => (a.quantity > b.quantity ? a : b)).genre
                    : "N/A"}
                </strong>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
