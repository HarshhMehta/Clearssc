import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import DocCard from "./DocCard";

const TopDoctors = () => {
  const navigate = useNavigate();
  const { doctors, getDoctorsData } = useContext(AppContext);

  useEffect(() => {
    getDoctorsData();
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 mx-4 sm:mx-8 md:mx-16 lg:mx-24 xl:mx-32 my-12 text-gray-900">
      {/* Header Section */}
      <div className="text-center space-y-4 max-w-4xl">
        <div className="inline-block">
          <h1  className="text-2xl sm:text-3xl lg:text-4xl font-bold  bg-clip-text text-black leading-tight">
            Our Top Services
          </h1>
          <div className="w-full h-1 bg-black rounded-full mt-2"></div>
        </div>
        <p style={{ color: 'rgb(208, 224, 87)' }} className="text-lg sm:text-xl font-medium  mb-2">
          Book Your Appointment Today
        </p>
        
      </div>

      {/* Doctors Grid */}
      <div className="w-full max-w-7xl">
        {doctors && doctors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 px-2">
            {doctors.slice(0, 10).map((doctor, index) => (
              <div 
                key={doctor._id || index}
                className="transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
              >
                <DocCard doctor={doctor} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No Doctors Available</h3>
            <p className="text-gray-500 text-center max-w-md">
              We're currently updating our doctor listings. Please check back soon for available appointments.
            </p>
          </div>
        )}
      </div>

      {/* View More Button */}
      {doctors && doctors.length > 10 && (
        <div className="mt-8">
          <button
            onClick={() => {
              navigate("/doctors");
              scrollTo(0, 0);
            }}
            className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-full font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              View All Doctors
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <p className="text-sm text-gray-500 mt-3 text-center">
            {doctors.length - 10} more doctors available
          </p>
        </div>
      )}
    </div>
  );
};

export default TopDoctors;