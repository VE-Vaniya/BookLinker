import React from "react";

export default function Card({ data }) {
  const style = {
    parent_div: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      border: "none",
      margin: "10px",
      backgroundColor: "#c9a897", // Updated to match beige/brown color
      borderRadius: "10px",
      width: "300px",
      height: "300px",
      padding: "15px",
      boxSizing: "border-box",
    },

    title: {
      fontSize: "20px",
      fontWeight: "bold",
      marginBottom: "0",
      color: "white",
    },

    author: {
      fontSize: "15px",
      fontWeight: "lighter",
      color: "white",
      margin: "0",
    },

    bookImage: {
      borderRadius: "50%",
      aspectRatio: "1/1",
      width: "150px",
      height: "150px",
      marginBottom: "15px",
      border: "4px solid #7b8f91", // Added border to match image
      backgroundColor: "#f0f0f0",
    },

    textContainer: {
      width: "100%",
      textAlign: "left",
    },

    condition: {
      backgroundColor: "#ffeb3b",
      borderRadius: "50px",
      padding: "2px 8px",
      fontSize: "10.6px",
      fontWeight: "bold",
      marginLeft: "10px",
      width: "fit-content",
    },

    removeButton: {
      backgroundColor: "rgb(25 151 49)",
      color: "white",
      borderRadius: "50px",
      padding: "2px 10px",
      fontSize: "10px",
      fontWeight: "bold",
      border: "none",
      cursor: "pointer",
      marginTop: "5px",
    },
  };

  return (
    <div style={style.parent_div}>
      <img src={data.imageUrl} alt="book cover" style={style.bookImage} />
      <div style={style.textContainer}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={style.title}>{data.name || "Book Name"}</h2>
          <span style={style.condition}>Condition: 10/10</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "5px",
          }}
        >
          <p style={style.author}>{data.author || "Author's Name"}</p>
          <span style={style.removeButton}>{data.status}</span>
        </div>
      </div>
    </div>
  );
}
