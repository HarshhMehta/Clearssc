import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import DocCard from "../Components/DocCard";

const Doctors = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [filterDoc, setFilterDoc] = useState([]);
  const [filters, setfilters] = useState(false);

  const { doctors } = useContext(AppContext);

  const navigate = useNavigate();
  const { speciality } = useParams();

  const specialties = [...new Set(doctors.map((doctor) => doctor.speciality))];

  useEffect(() => {
    const filteredDoctors = speciality
      ? doctors.filter((doc) => doc.speciality === speciality)
      : doctors;
    setFilterDoc(filteredDoctors);
    setSelectedSpecialty(speciality || null);
  }, [doctors, speciality]);

  return (
    <div className="text-gray-600 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 py-8 max-w-screen-xl mx-auto">
      {/* Heading Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-10">
        <div className="inline-block w-full">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black leading-tight">
                      </h1>
          <div className="w-20 h-1 bg-black rounded-full mt-2 mx-auto"></div>
        </div>
        <p
          style={{ color: "rgb(208, 224, 87)" }}
          className="text-lg sm:text-xl font-medium"
        >
          Book Your Appointment Today
        </p>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filterDoc.map((item, index) => (
          <DocCard doctor={item} key={index} />
        ))}
      </div>
    </div>
  );
};

export default Doctors;
