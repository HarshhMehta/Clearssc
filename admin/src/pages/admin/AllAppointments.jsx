import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets_admin/assets";
import MRIReferralFormDisplay from "../../pages/admin/MRIReferralFormDisplay";

const AllAppointments = () => {
  const { aToken, appointments, getAllAppointments, cancelAppointments } = useContext(AdminContext);
  const { currency } = useContext(AppContext);

  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const showMRIFormData = (appointment) => {
    console.log("Selected appointment MRI data:", appointment.mriFormData);
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  const hasMRIReferral = (appointment) => {
    return appointment.mriFormData &&
      typeof appointment.mriFormData === "object" &&
      Object.keys(appointment.mriFormData).length > 0;
  };

  const renderDoctors = (item) => {
    if (item.selectedDoctors && Array.isArray(item.selectedDoctors) && item.selectedDoctors.length > 0) {
      return (
        <div className="flex flex-col gap-1">
          {item.selectedDoctors.map((doctor, index) => (
            <div key={doctor._id || index} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                doctor._id === item.docId ? "bg-green-500" : "bg-blue-500"
              }`} />
              <span className={`text-sm ${
                doctor._id === item.docId ? "font-semibold text-green-700" : "text-gray-700"
              }`}>
                {doctor.name}
              </span>
              {doctor._id === item.docId && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                  Primary
                </span>
              )}
            </div>
          ))}
          <div className="text-xs text-gray-500 mt-1">
            Total: {item.selectedDoctors.length} doctor{item.selectedDoctors.length > 1 ? "s" : ""}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        <span className="text-sm text-gray-700">
          {item.docData?.name || "Doctor Name Not Available"}
        </span>
      </div>
    );
  };

  const renderFees = (item) => {
    if (item.selectedDoctors && Array.isArray(item.selectedDoctors) && item.selectedDoctors.length > 1) {
      const totalFees = item.selectedDoctors.reduce((sum, doctor) => sum + (doctor.fees || 0), 0);
      return (
        <div className="flex flex-col text-right">
          <span className="font-semibold text-gray-900">
            {currency}{totalFees}
          </span>
          <span className="text-xs text-gray-500">
            ({item.selectedDoctors.length} doctors)
          </span>
        </div>
      );
    }

    return (
      <span className="font-semibold text-gray-900">
        {currency}{item.amount}
      </span>
    );
  };

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);

  useEffect(() => {
    console.log("All appointments:", appointments);
  }, [appointments]);

  return (
    <div className="w-full max-w-7xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <div className="bg-white border rounded text-sm overflow-y-scroll max-h-[80vh] min-h-[60vh]">
        <div className="hidden sm:grid grid-cols-[0.5fr_2fr_1.5fr_3fr_1.2fr_2fr_1.5fr] grid-flow-col py-3 px-6 border-b">
          <p>#</p>
          <p>Client</p>
          <p>Date & Time</p>
          <p>Doctors</p>
          <p>Fees</p>
          <p>Form Details</p>
          <p>Actions</p>
        </div>

        {appointments.slice().reverse().map((item, index) => (
          <div
            className="flex flex-wrap justify-between items-center sm:grid sm:grid-cols-[0.5fr_2fr_1.5fr_3fr_1.2fr_2fr_1.5fr] text-gray-600 border-b px-6 py-4 hover:bg-gray-50"
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
                <p className="font-medium">{item.userData.name}</p>
              </div>
              <p className="ml-10 text-xs text-gray-400">{item.userData.phone}</p>
            </div>

            <div className="text-sm">
              <p className="font-medium">{item.slotTime}</p>
              <p className="text-gray-500">{item.slotDate}</p>
            </div>

            <div className="flex items-start">
              {renderDoctors(item)}
            </div>

            <div className="text-right">
              {renderFees(item)}
            </div>

            <div className="flex flex-col gap-2">
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
            </div>

            <div className="flex items-center justify-center">
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
