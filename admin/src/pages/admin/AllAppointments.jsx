import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets_admin/assets";

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointments } =
    useContext(AdminContext);
  const { currency } = useContext(AppContext);
  
  // State for message popup
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");

  // Function to show message popup
  const showMessage = (message, patientName) => {
    setSelectedMessage(message);
    setSelectedPatient(patientName);
    setShowMessageModal(true);
  };

  // Function to close message popup
  const closeMessageModal = () => {
    setShowMessageModal(false);
    setSelectedMessage("");
    setSelectedPatient("");
  };

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken, appointments]);

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <div className="bg-white border rounded text-sm overflow-y-scroll max-h-[80vh] min-h-[60vh]">
        <div className="hidden sm:grid grid-cols-[0.5fr_2.5fr_2.5fr_3fr_1fr_1.5fr_1.5fr] grid-flow-col py-3 px-6 border-b">
          <p>#</p>
          <p>Client</p>
          <p>Date & Time</p>
          <p>Service name</p>
          <p>Fees</p>
          <p>Message</p>
          <p>Actions</p>
        </div>

        {appointments.slice().reverse().map((item, index) => (
          <div
            className="flex flex-wrap justify-between items-center sm:grid sm:grid-cols-[0.5fr_2.5fr_2.5fr_3fr_1fr_1.5fr_1.5fr] text-gray-600 border-b px-6 py-3 hover:bg-gray-100"
            key={index}
          >
            <p className="max-sm:hidden">{index + 1}</p>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <img
                  className="w-8 h-8 rounded-full object-cover"
                  src={item.userData.image}
                  alt="User"
                />
                <p>{item.userData.name}</p>
              </div>
              <p className="ml-10 text-xs text-gray-400">{item.userData.phone}</p>
            </div>

            <p>
              {item.slotTime}, {item.slotDate}
            </p>

            <div className="flex items-center gap-2">
              <p>{item.docData.name}</p>
            </div>

            <p>
              {currency}
              {item.amount}
            </p>

            {/* Message Column */}
            <div className="flex items-center">
              {item.message ? (
                <button
                  onClick={() => showMessage(item.message, item.userData.name)}
                  className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  View Message
                </button>
              ) : (
                <span className="text-gray-400 text-xs italic">No message</span>
              )}
            </div>

            {/* Actions Column */}
            <div className="flex items-center">
              {item.cancelled ? (
                <p className="text-red-500 text-sm font-medium">Cancelled</p>
              ) : item.isCompleted ? (
                <p className="text-green-500 text-sm font-medium">Completed</p>
              ) : (
                <img
                  onClick={() => cancelAppointments(item._id)}
                  src={assets.cancel_icon}
                  alt="Cancel"
                  className="cursor-pointer hover:opacity-70 transition-opacity"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Patient Message
              </h3>
              <button
                onClick={closeMessageModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="font-medium text-gray-700">From: {selectedPatient}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={closeMessageModal}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAppointments;