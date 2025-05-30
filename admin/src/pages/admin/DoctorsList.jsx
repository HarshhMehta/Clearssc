import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";

const DoctorsList = () => {
  const { doctors, changeAvailability, deleteDoctor, loading } = useContext(AdminContext);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, doctorId: null, doctorName: '' });

  const handleDeleteClick = (doctorId, doctorName) => {
    setDeleteConfirm({ 
      show: true, 
      doctorId, 
      doctorName 
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm.doctorId) {
      await deleteDoctor(deleteConfirm.doctorId);
      setDeleteConfirm({ show: false, doctorId: null, doctorName: '' });
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ show: false, doctorId: null, doctorName: '' });
  };

  return (
    <div className="w-full m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-lg font-medium">All Services</h1>
      
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-2 text-gray-600">Loading Services...</span>
        </div>
      )}

      <div className="w-full flex flex-wrap gap-4 pt-5 gap-y-6">
        {doctors.map((item, index) => (
          <div className="border border-indigo-200 rounded-lg max-w-56 cursor-pointer overflow-hidden group hover:shadow-lg transition-shadow duration-200" key={index}>
            <div className="p-4">
              <p className="text-neutral-800 text-lg font-medium">{item.name}</p>
              <p className="text-zinc-500 text-sm">{item.speciality}</p>
              
              {/* Availability Toggle */}
              <div className="mt-2 flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={item.available} 
                  onChange={() => changeAvailability(item._id)}
                  className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                />
                <p>Available</p>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => changeAvailability(item._id)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 ${
                    item.available 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {item.available ? 'Active' : 'Inactive'}
                </button>
                
                <button
                  onClick={() => handleDeleteClick(item._id, item.name)}
                  className="px-3 py-1 text-xs bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>

              {/* Additional Info (Optional) */}
              <div className="mt-2 text-xs text-gray-500">
                <p>ID: {item._id?.substring(0, 8)}...</p>
                {item.email && <p>Email: {item.email}</p>}
                {item.experience && <p>Experience: {item.experience} years</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {doctors.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <p>No doctors found</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete service  <strong>{deleteConfirm.doctorName}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                Delete service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;