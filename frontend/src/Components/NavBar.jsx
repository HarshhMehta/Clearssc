import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { assets } from "../assets/assets_frontend/assets";
import NavItem from "./NavItem";
import { AppContext } from "../Context/AppContext";
import { toast } from "react-toastify";

const NavBar = () => {
  const [showMenu, setShowMenu] = useState(false);

  const { token, setToken, userData } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const navMenu = [
    { section: "header", navItem: "Home" },
    { section: "about", navItem: "About Us" },
    { section: "services", navItem: "Services" },
    { section: "WhyChooseUs", navItem: "Why Choose Us" },
    { section: "faq", navItem: "FAQ" },
    { section: "contact", navItem: "Contact" },
  ];

  const logout = () => {
    setToken(false);
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/");
  };

  // Smooth scroll to section with offset for sticky navbar
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 100; // Adjust this value based on your navbar height
      const elementPosition = element.offsetTop - navbarHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
    setShowMenu(false); // close mobile menu
  };

  // Handle navigation - navigate to home first if not already there, then scroll
  const handleNavClick = (item) => {
    if (item.section) {
      // Check if we're on the home page (root path)
      if (location.pathname === '/') {
        // Already on home page, just scroll
        scrollToSection(item.section);
      } else {
        // Navigate to home page first, then scroll after navigation
        navigate('/');
        // Use setTimeout to allow navigation to complete before scrolling
        setTimeout(() => {
          scrollToSection(item.section);
        }, 100);
      }
    } else if (item.path) {
      navigate(item.path);
      setShowMenu(false);
    }
  };

  // Handle logo click - always go to home and scroll to header
  const handleLogoClick = () => {
    if (location.pathname === '/') {
      scrollToSection("header");
    } else {
      navigate('/');
      setTimeout(() => {
        scrollToSection("header");
      }, 100);
    }
  };

  return (
    <div
      style={{ backgroundColor: "#141B31" }}
      className="sticky top-0 w-full z-50 py-4"
    >
      <div className="px-6 sm:px-16 md:px-24 lg:px-36 flex flex-row items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <img
            onClick={handleLogoClick}
            src={assets.logo}
            alt="ClearScan logo"
            className="cursor-pointer"
            style={{ width: "60px", height: "60px", objectFit: "cover" }}
          />
          <h1
            className="font-semibold tracking-wider cursor-pointer"
            onClick={handleLogoClick}
            style={{
              fontSize: "42px",
              color: "#D0E057",
              margin: 0,
              lineHeight: "1.1",
            }}
          >
            ClearScan
          </h1>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex md:gap-12">
          {navMenu.map((item, index) => (
            <li
              key={index}
              onClick={() => handleNavClick(item)}
              className="cursor-pointer text-white hover:text-[#D0E057] transition-colors duration-300 font-medium"
            >
              {item.navItem}
            </li>
          ))}
        </ul>

        {/* Profile */}
        <div className="flex items-center gap-6">
          {token && userData ? (
            <div className="flex items-center gap-2 cursor-pointer group relative">
              <img
                className="rounded-full w-11 h-11 object-cover"
                src={userData.image}
                alt="my profile"
              />
              <img
                className="text-white w-3"
                src={assets.dropdown_icon}
                alt="dropdown icon"
              />
              <div className="absolute top-6 right-0 pt-4 text-base font-medium text-gray-600 z-20 hidden group-hover:block mt-5">
                <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                  <p
                    onClick={() => navigate("/my-profile")}
                    className="hover:text-black font-medium"
                  >
                    My Profile
                  </p>
                  <p
                    onClick={() => navigate("/my-appointments")}
                    className="hover:text-black font-medium"
                  >
                    My Appointments
                  </p>
                  <p onClick={logout} className="hover:text-black font-medium">
                    Logout
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="hidden md:block text-black bg-white rounded-full py-2 px-4 text-sm font-medium"
            >
              Create Account
            </button>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <div
          className="w-6 md:hidden cursor-pointer"
          onClick={() => setShowMenu(!showMenu)}
          style={{ color: "#D0E057" }}
        >
          <img
            src={showMenu ? assets.cross_icon : assets.menu_icon}
            alt="menu toggle"
          />
        </div>
      </div>

      {/* Mobile Menu */}
      {showMenu && (
        <div className="md:hidden absolute top-[90px] right-6 bg-stone-200 z-50 rounded p-4 w-[220px] shadow-lg">
          <ul className="flex flex-col gap-4">
            {navMenu.map((item, index) => (
              <li
                key={index}
                onClick={() => handleNavClick(item)}
                className="cursor-pointer font-medium text-gray-800 hover:text-black transition-colors"
              >
                {item.navItem}
              </li>
            ))}
            {!token && (
              <li
                onClick={() => navigate("/login")}
                className="cursor-pointer font-medium text-gray-800 hover:text-black transition-colors"
              >
                Create Account
              </li>
            )}
            {token && (
              <>
                <li
                  onClick={() => navigate("/my-profile")}
                  className="cursor-pointer font-medium text-gray-800 hover:text-black transition-colors"
                >
                  My Profile
                </li>
                <li
                  onClick={() => navigate("/my-appointments")}
                  className="cursor-pointer font-medium text-gray-800 hover:text-black transition-colors"
                >
                  My Appointments
                </li>
                <li
                  onClick={logout}
                  className="cursor-pointer font-medium text-gray-800 hover:text-black transition-colors"
                >
                  Logout
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NavBar;