import React from "react";
import { useNavigate } from "react-router-dom";

const DocCard = ({ doctor }) => {
  const navigate = useNavigate();

  // Handle missing or undefined data
  const doctorName = doctor?.name || "Doctor Name";
  const doctorSpeciality = doctor?.speciality || doctor?.specialty || "Speciality";
  const doctorFees = doctor?.fees || "Fees not available";
  const doctorAbout = doctor?.about || "No information available";
  const isAvailable = doctor?.available !== undefined ? doctor.available : true;
  const doctorId = doctor?._id || doctor?.id;

  // Construct the correct image URL
  const getImageUrl = () => {
    if (doctor?.image) {
      // If the image path already includes the full URL, use it as is
      if (doctor.image.startsWith('http')) {
        return doctor.image;
      }
      
      // If it's just a filename or relative path, construct the full URL
      // Remove leading slash if present to avoid double slashes
      const imagePath = doctor.image.startsWith('/') ? doctor.image.slice(1) : doctor.image;
      
      // Construct full URL to your backend (Vite environment variable)
      const baseUrl = import.meta.env.VITE_BACKEND_URL;
      return `${baseUrl}/${imagePath}`;
    }
    
    // Default fallback image
    return "/default-doctor.jpg";
  };

  const doctorImage = getImageUrl();

  const handleCardClick = () => {
    if (doctorId) {
      navigate(`/appointment/${doctorId}`);
      scrollTo(0, 0);
    }
  };

  const handleImageError = (e) => {
    console.log('Image failed to load:', e.target.src);
    // Try alternative fallback
    if (!e.target.src.includes('default-doctor.jpg')) {
      e.target.src = "/default-doctor.jpg";
    } else {
      // If even the default fails, use a placeholder
      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-size='14' text-anchor='middle' dy='.3em' fill='%23374151'%3ENo Image%3C/text%3E%3C/svg%3E";
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
          onError={handleImageError}
          onLoad={() => console.log('Image loaded successfully:', doctorImage)}
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