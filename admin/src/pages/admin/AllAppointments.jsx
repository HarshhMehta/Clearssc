import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets_admin/assets";
import MRIReferralFormDisplay from "../../pages/admin/MRIReferralFormDisplay";

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointments } =
    useContext(AdminContext);
  const { currency } = useContext(AppContext);
  
  // State for MRI data popup only
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Function to show complete MRI form data
  const showMRIFormData = (appointment) => {
    console.log("Selected appointment MRI data:", appointment.mriFormData); // Debug log
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  // Function to close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  // FIXED: Check if appointment has MRI referral data - only check for mriFormData existence
  const hasMRIReferral = (appointment) => {
    const hasData = appointment.mriFormData && 
                   typeof appointment.mriFormData === 'object' &&
                   Object.keys(appointment.mriFormData).length > 0;
    
    // Debug log to see what's happening
    console.log("Checking MRI data for appointment:", {
      hasFlag: appointment.hasMRIReferral,
      hasFormData: !!appointment.mriFormData,
      formDataKeys: appointment.mriFormData ? Object.keys(appointment.mriFormData).length : 0,
      result: hasData
    });
    
    return hasData;
  };

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);

  // Debug log to see all appointments
  useEffect(() => {
    console.log("All appointments:", appointments);
  }, [appointments]);

  return (
    <div className="w-full max-w-7xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <div className="bg-white border rounded text-sm overflow-y-scroll max-h-[80vh] min-h-[60vh]">
        <div className="hidden sm:grid grid-cols-[0.5fr_2.5fr_2fr_2.5fr_1fr_2fr_1.5fr] grid-flow-col py-3 px-6 border-b">
          <p>#</p>
          <p>Client</p>
          <p>Date & Time</p>
          <p>Service name</p>
          <p>Fees</p>
          <p>Form Details</p>
          <p>Actions</p>
        </div>

        {appointments.slice().reverse().map((item, index) => (
          <div
            className="flex flex-wrap justify-between items-center sm:grid sm:grid-cols-[0.5fr_2.5fr_2fr_2.5fr_1fr_2fr_1.5fr] text-gray-600 border-b px-6 py-3 hover:bg-gray-100"
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

            {/* Form Details Column */}
            <div className="flex flex-col gap-2">
              {/* MRI Referral Button */}
              {hasMRIReferral(item) && (
                <button
                  onClick={() => showMRIFormData(item)}
                  className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-medium hover:bg-green-200 transition-colors flex items-center gap-1 justify-center"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  MRI Form
                </button>
              )}
              
              {/* Show debug info for troubleshooting */}
              <div className="text-xs text-gray-400">
                {item.mriFormData ? (
                  <span className="text-blue-500">Has form data ({Object.keys(item.mriFormData).length} fields)</span>
                ) : (
                  <span>No form data</span>
                )}
              </div>
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

      {/* MRI Form Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full shadow-2xl max-h-[95vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-800">
                MRI Referral Form - {selectedAppointment?.userData?.name}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <MRIReferralFormDisplay formData={selectedAppointment.mriFormData} />
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeModal}
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