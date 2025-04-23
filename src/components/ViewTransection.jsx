import React from "react";
import { useState, useEffect } from "react";
import Card from "./Card";
function ViewTransection() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "http://localhost:8081/api/books/transaction-history?userEmail=user@gmail.com",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Data received:", result);
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

  const style = {
    container: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
      marginTop: "20px",
      backgroundImage:
        "radial-gradient(circle, #a8816c 0%, #905a40 50%, #6e4c3d 100%)",
      height: "100vh",
    },

    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "300px",
      width: "100%",
    },
    loadingText: {
      fontSize: "20px",
      color: "#333",
    },
  };

  const card = data.map((d) => {
    return (
      <div key={d._id} style={{ margin: "10px" }}>
        <Card data={d} />
      </div>
    );
  });

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={style.container}>
      {loading ? (
        <div style={style.loadingContainer}>
          <h1 style={style.loadingText}>Loading...</h1>
        </div>
      ) : error ? (
        <div style={style.loadingContainer}>
          <h1 style={style.loadingText}>{error}</h1>
        </div>
      ) : (
        card
      )}
    </div>
  );
}

export default ViewTransection;
