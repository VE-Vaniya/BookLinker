import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

const SideNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  const linkClasses = ({ isActive }) =>
    `text-left px-2 py-1 rounded-md transition-colors duration-200 ${
      isActive
        ? "bg-white/20 text-white font-semibold"
        : "text-white/70 hover:text-white hover:bg-white/10"
    }`;

  return (
    <>
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed top-4 left-4 z-50 bg-[#caa287] p-2 rounded-md shadow-lg text-white"
        >
          <Menu size={24} />
        </button>
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 lg:bg-[#caa287]/30 bg-[#905A40] p-4 rounded-r-3xl shadow-lg text-white z-40 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 lg:fixed lg:h-screen`}
      >
        <div className="relative mb-8 flex items-center justify-between pr-2">
          <span className="text-xl font-semibold text-left">
            📚 Book Linker
          </span>

          <button onClick={toggleSidebar} className="lg:hidden text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col gap-3 text-left">
          <NavLink
            to="/DashBoard"
            end
            className={linkClasses}
            onClick={() => setIsOpen(false)}
          >
            🏠 Dashboard
          </NavLink>
          <NavLink
            to="/DashBoard/AddBook"
            className={linkClasses}
            onClick={() => setIsOpen(false)}
          >
            ➕ Add Book
          </NavLink>
          <NavLink
            to="/DashBoard/Profile"
            className={linkClasses}
            onClick={() => setIsOpen(false)}
          >
            👥 Profile
          </NavLink>

          {/* New "File Complaints" Button */}
          <NavLink
            to="/DashBoard/FileComplaints"
            className={linkClasses}
            onClick={() => setIsOpen(false)}
          >
            📋 File Complaints
          </NavLink>
        </nav>
      </aside>

      <main className="lg:ml-64 p-4 overflow-auto"> </main>
    </>
  );
};

export default SideNav;
