import React from "react";
import { assets } from "../assets/assets_frontend/assets";
import { useNavigate } from "react-router-dom"; // ✅ Importing useNavigate

const Header = () => {
  const navigate = useNavigate(); // ✅ Initializing navigate

  return (
    <div style={{ backgroundColor: "#141B31" }} className=" pt-10 w-full">
      <div className="flex flex-col md:flex-row flex-wrap rounded-lg px-6 md:px-10 lg:px-20 pt-20 pb-20 mx-12 sm:mx-24 md:mx-28 lg:mx-32">
        {/* ----- Left Side ----- */}
        <div className="md:w-1/2 flex flex-col items-center md:items-start justify-center gap-4 py-8 m-auto md:py-12">
          <p className="text-white text-3xl md:text-4xl lg:text-6xl font-semibold leading-tight md:leading-tight lg:leading-tight">
            Book Your <br />
            {" "}
            <span style={{ color: "#D0E057" }} className="text-highlight">
              MRI Scan
            </span>{" "}
            Today!
          </p>
          <div className="text-white flex flex-col md:flex-row items-center gap-3 text-sm font-light">
            <img className="w-28" src={assets.group_profiles} alt="Profiles Group" />
            <p>
              Prioritize your health,{" "}
              <br className="hidden sm:block" />
              Advanced Medical Imaging for Preventative Health.
            </p>
          </div>

          {/* ----- Call to Action Button ----- */}
          <a
            onClick={(e) => {
              e.preventDefault();
              navigate("/services"); // ✅ Navigation on click
            }}
            style={{ backgroundColor: "#D0E057", cursor: "pointer" }}
            className="flex gap-2 justify-center text-black rounded-full px-8 py-3 w-[180px] md:w-60 text-sm m-auto md:m-0 hover:scale-105 transition-all duration-300"
          >
            <span className="font-medium text-center md:text-start">
              Schedule a Scan
            </span>
            <img className="w-4" src={assets.arrow_icon} alt="Arrow Icon" />
          </a>
        </div>

        {/* ----- Right Side with Video ----- */}
        <div className="md:w-1/2 relative flex justify-center md:block pb-8 md:pb-0">
          <video
            className="w-full max-w-md md:max-w-none md:w-[120%] md:absolute md:top-8 h-auto rounded-lg"
            src="/src/assets/assets_frontend/MRI.mp4"
            autoPlay
            loop
            muted
            playsInline
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
};

export default Header;