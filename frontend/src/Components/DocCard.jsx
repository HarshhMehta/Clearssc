import React from "react";
import { useNavigate } from "react-router-dom";

const DocCard = ({ doctor }) => {
  const navigate = useNavigate();

  // Handle missing or undefined data
  const doctorName = doctor?.name || "Doctor Name";
  const doctorSpeciality = doctor?.speciality || doctor?.specialty || "Speciality";
  const doctorFees = doctor?.fees || "Fees not available";
  const doctorImage = doctor?.image || "/default-doctor.jpg";
  const doctorAbout = doctor?.about || "No information available";
  const isAvailable = doctor?.available !== undefined ? doctor.available : true;
  const doctorId = doctor?._id || doctor?.id;

  const handleCardClick = () => {
    if (doctorId) {
      navigate(`/appointment/${doctorId}`);
      scrollTo(0, 0);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="border border-blue-200 cursor-pointer rounded-xl overflow-hidden hover:translate-y-[-10px] transition-all duration-500 h-auto bg-white shadow-sm hover:shadow-md"
    >
      {/* Doctor Image */}
      <div className="bg-blue-50 overflow-hidden">
        <img 
          className="w-full h-48 object-cover" 
          src={doctorImage} 
          alt={doctorName}
          onError={(e) => {
            e.target.src = "https://api.neohospital.com/uploads/Service/image-1718691221278-475456045-MRI.jpg"; // Fallback image
          }}
        />
      </div>

      {/* Doctor Information */}
      <div className="p-4">
        {/* Availability Status */}
        <div
          className={`flex items-center gap-2 text-sm mb-2 ${
            isAvailable ? "text-green-500" : "text-gray-500"
          }`}
        >
          <p
            className={`w-2 h-2 rounded-full ${
              isAvailable ? "bg-green-500" : "bg-gray-500"
            }`}
          ></p>
          <p>{isAvailable ? "Available" : "Not Available"}</p>
        </div>

        {/* Doctor Name */}
        <h3 className="text-gray-900 text-lg font-medium text-start mb-1 truncate">
          {doctorName}
        </h3>

        {/* Speciality */}
        <p className="text-gray-600 text-sm text-start mb-2 truncate">
          {doctorSpeciality}
        </p>

        {/* Fees */}
        <p className="text-blue-600 text-sm font-medium text-start mb-2">
          Fees: ${doctorFees}
        </p>

        {/* About (truncated) */}
        <p className="text-gray-500 text-xs text-start line-clamp-2">
          {doctorAbout.length > 80 
            ? `${doctorAbout.substring(0, 80)}...` 
            : doctorAbout
          }
        </p>
      </div>
    </div>
  );
};

export default DocCard;