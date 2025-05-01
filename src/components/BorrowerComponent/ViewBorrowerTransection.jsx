import React, { useState, useEffect } from "react";
import Card from "../Card";
import SideNav from "./BorrowerSideNav";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

function ViewBorrowerTransection() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isAvatarLoading, setIsAvatarLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);

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

  useEffect(() => {
    const fetchData = async () => {
      if (!userEmail) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:8081/api/books/transaction-history?userEmail=${encodeURIComponent(
            userEmail
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
          setData(result);
        } else {
          const errorText = await response.text();
          console.error("Server error:", response.status, errorText);
          setError(`Error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userEmail]);

  const style = {
    parent_div: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gridAutoRows: "1fr",
      gap: "20px",
      width: "100%",
      alignItems: "stretch",
      justifyContent: "center",
    },
  };

  const processTransactionData = () => {
    const soldItems = data.filter(
      (transaction) => transaction.status === "sold"
    );

    return soldItems.map((transaction) => (
      <div key={transaction._id} className="m-2.5">
        <Card
          data={transaction}
          buttonColor={"red"}
          buttonContent={transaction.status}
        />
      </div>
    ));
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
            <h1 className="text-2xl font-semibold">Transaction History</h1>
            <p className="text-sm text-white/70">View your Borrowed items</p>
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

        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="w-8 h-8 border-4 border-white/50 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-400 text-center">{error}</div>
        ) : (
          <div style={style.parent_div}>{processTransactionData()}</div>
        )}
      </main>
    </div>
  );
}

export default ViewBorrowerTransection;
