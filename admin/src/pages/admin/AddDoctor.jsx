import React, { useState, useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { toast } from "react-toastify";
import axios from "axios";

const initialFormData = {
  name: "",
  fees: "500",
  about: "",
  speciality: "",
};

const AddDoctor = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const requiredFields = ['name', 'fees', 'speciality'];
      const missingFields = requiredFields.filter(
        (field) => !formData[field] || formData[field].toString().trim() === ''
      );

      if (missingFields.length > 0) {
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      const doctorData = {
        name: formData.name.trim(),
        speciality: formData.speciality.trim(),
        fees: formData.fees,
        about: formData.about,

      };

      const { data } = await axios.post(   
        backendUrl + "/api/admin/add-doctor",
        doctorData,
        {
          headers: {
            Authorization: `Bearer ${aToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setFormData(initialFormData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-5xl mx-auto my-6 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add Service</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Name & Fees */}
          <div className="space-y-4">
            <label className="block text-gray-700 font-medium">
              Service Name <span className="text-red-600">*</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                required
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>

            <label className="block text-gray-700 font-medium">
              Fees <span className="text-red-600">*</span>
              <input
                type="number"
                name="fees"
                value={formData.fees}
                onChange={handleChange}
                placeholder="Fees"
                min="1"
                required
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
          </div>

          {/* Speciality */}
          <div className="space-y-4">
            <label className="block text-gray-700 font-medium">
              Service description <span className="text-red-600">*</span>
              <input
                type="text"
                name="speciality"
                value={formData.speciality}
                onChange={handleChange}
                placeholder="Enter description of serivice"
                required
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
          </div>
        </div>

        {/* About */}
        <div>
          <label className="block text-gray-700 font-medium">
            Description <span className="text-red-600"></span>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              placeholder="Write about doctor"
              rows={5}

              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </label>
        </div>

        <button
          type="submit"
          className="bg-primary hover:bg-green-500 text-white font-semibold py-3 px-10 rounded-full disabled:opacity-50 transition"
        >
          Add Service
        </button>
      </form>
    </div>
  );
};

export default AddDoctor;