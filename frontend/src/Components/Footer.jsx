import React from "react";
import { assets } from "../assets/assets_frontend/assets";

const Footer = () => {
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
  };

  return (
    <footer
      style={{ backgroundColor: "rgb(20, 27, 49)" }}
      className="w-full px-6 sm:px-20 py-12 text-white"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-[3fr_1fr_1fr] gap-14">
        {/* Left Section */}
        <div className="text-center sm:text-left">
          <img
            className="w-60 mb-6 mx-auto sm:mx-0 transition-transform duration-300 hover:scale-105 cursor-pointer"
            src={assets.logo}
            alt="ClearScan Logo"
            onClick={() => scrollToSection("header")}
          />
          <p className="text-gray-400 leading-7">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book.
          </p>
        </div>

        {/* Center Section */}
        <div className="text-center sm:text-left">
          <p className="text-xl font-semibold mb-5 text-green-400 tracking-wide">
            COMPANY
          </p>
          <ul className="flex flex-col gap-3 text-gray-400">
            {[
              { label: "Home", section: "header" },
              { label: "About Us", section: "about" },
              { label: "Services", section: "services" },
              { label: "FAQ", section: "faq" },
              { label: "Contact Us", section: "contact" },
            ].map(({ label, section }) => (
              <li key={label}>
                <span
                  onClick={() => scrollToSection(section)}
                  className="cursor-pointer hover:text-green-400 transition-colors duration-300"
                >
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Section */}
        <div className="text-center sm:text-left">
          <p className="text-xl font-semibold mb-5 text-green-400 tracking-wide">
            GET IN TOUCH
          </p>
          <ul className="flex flex-col gap-3 text-gray-400">
            <li className="hover:text-green-400 transition-colors duration-300 cursor-pointer">
              <a href="tel:+12124567890">+1-212-456-7890</a>
            </li>
            <li className="hover:text-green-400 transition-colors duration-300 cursor-pointer">
              <a href="mailto:example@gmail.com">example@gmail.com</a>
            </li>
          </ul>
        </div>
      </div>

      <hr className="border-gray-700 my-10" />

      <p className="text-center text-gray-500 text-sm">
        Copyright © 2025 ClearScan Inc. - All Rights Reserved. by{" "}
        <a
          href="http://dotcomwebs.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-400 hover:underline"
        >
          Dotcom Webs
        </a>
      </p>
    </footer>
  );
};

export default Footer;