import React from "react";

export default function Card({ data, buttonColor, buttonContent }) {
  const style = {
    button: {
      backgroundColor: buttonColor,
    },
  };

  return (
    <div className="flex flex-col bg-[#7a5442] rounded-2xl overflow-hidden shadow-md transition-transform transform hover:scale-105 w-full max-w-[320px] mx-auto h-full">
      {/* Full width image */}
      <img
        src={data.imageUrl}
        alt="Book Cover"
        className="w-full h-48 object-cover"
      />

      {/* Card content */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              {data.name || "Book Name"}
            </h2>
            <span className="bg-yellow-300 text-black rounded-full py-0.5 px-2 text-xs font-semibold ml-2">
              {data.condition || "10/10"}
            </span>
          </div>
          {/* Author */}
          <p className="text-sm text-white font-light mt-1">
            {data.author || "Author's Name"}
          </p>
          {/* Quantity */}
          <p className="text-sm text-white font-light mt-1">
            Quantity: {data.quantity || 0}
          </p>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2">
          {/* Button */}
          {buttonContent === "sold" ? (
            <span
              className="text-white rounded-lg py-1 px-4 text-xs font-bold"
              style={style.button}
            >
              {buttonContent}
            </span>
          ) : (
            <button
              className="text-white rounded-lg py-1 px-4 text-xs font-bold border-none cursor-pointer"
              style={style.button}
            >
              {buttonContent}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
