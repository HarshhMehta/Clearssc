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
  const [docImg, setDocImg] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, WebP)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }

      setDocImg(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setDocImg(null);
    setImagePreview(null);
    // Clear the file input
    const fileInput = document.getElementById('doc-img');
    if (fileInput) {
      fileInput.value = '';
    }
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

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('speciality', formData.speciality.trim());
      formDataToSend.append('fees', formData.fees);
      formDataToSend.append('about', formData.about);
      
      // Append image if selected
      if (docImg) {
        formDataToSend.append('image', docImg);
      }

      const { data } = await axios.post(   
        backendUrl + "/api/admin/add-doctor",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${aToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setFormData(initialFormData);
        setDocImg(null);
        setImagePreview(null);
        // Clear file input
        const fileInput = document.getElementById('doc-img');
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="max-w-5xl mx-auto my-6 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add Service</h2>
      <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
        
        {/* Image Upload Section */}
        <div className="space-y-4">
          <label className="block text-gray-700 font-medium">
            Service Image
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="doc-img"
                  className="flex flex-col items-center justify-center w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <p className="text-xs text-gray-400 text-center">Upload Image</p>
                  </div>
                </label>
              )}
              <input
                id="doc-img"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </label>
          {docImg && (
            <p className="text-sm text-gray-600">
              Selected: {docImg.name} ({(docImg.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

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
                placeholder="Enter description of service"
                required
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </label>
          </div>
        </div>

        {/* About */}
        <div>
          <label className="block text-gray-700 font-medium">
            Description
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              placeholder="Write about the service"
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