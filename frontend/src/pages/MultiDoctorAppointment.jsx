import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { loadStripe } from '@stripe/stripe-js';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DocCard from "../Components/DocCard";
import MriReferralRequest from "./MriReferralRequest";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const MultiDoctorAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMriForm, setShowMriForm] = useState(false);
  const [mriFormData, setMriFormData] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [existingAppointment, setExistingAppointment] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem('token'); // Adjust based on your auth implementation
  const currencySymbol = '$';

  // Fetch doctors from API
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/doctors`);
      if (response.data.success) {
        setDoctors(response.data.doctors);
      } else {
        toast.error("Failed to fetch doctors");
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total fees
  const calculateTotalFees = () => {
    return selectedDoctors.reduce((total, doctor) => total + (doctor.fees || 0), 0);
  };

  // Handle doctor selection
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctors(prev => [...prev, doctor]);
  };

  // Handle doctor deselection
  const handleDoctorDeselect = (doctor) => {
    setSelectedDoctors(prev => prev.filter(d => d._id !== doctor._id));
  };

  // Generate available slots based on selected doctors
  const getAvailableSlots = () => {
    if (selectedDoctors.length === 0) {
      setDocSlots([]);
      return;
    }

    let today = new Date();
    let currentYear = today.getFullYear();
    let timeSlots = [];

    // Get slots for the next 3 months
    for (let m = 0; m < 3; m++) {
      let currentMonth = (today.getMonth() + m) % 12;
      let nextYear = currentMonth < today.getMonth() ? currentYear + 1 : currentYear;

      for (let i = 0; i < 31; i++) {
        let currentDate = new Date(nextYear, currentMonth, i + 1);
        if (currentDate.getMonth() !== currentMonth) break;

        let dayDate = new Date(currentDate);
        dayDate.setHours(0, 0, 0, 0);

        let endtime = new Date(currentDate);
        endtime.setHours(18, 0);

        let dailySlots = [];
        let currentTime = new Date(currentDate);
        currentTime.setHours(9, 0); // Start at 9 AM

        while (currentTime < endtime) {
          let formattedTime = currentTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });

          let day = dayDate.getDate();
          let month = dayDate.getMonth() + 1;
          let year = dayDate.getFullYear();
          const slotDate = `${day}/${month}/${year}`;

          // Check if slot is available for ALL selected doctors
          const isSlotAvailable = selectedDoctors.every(doctor => {
            const isSlotBooked = doctor.slots_booked?.[slotDate]?.includes(formattedTime);
            return !isSlotBooked;
          });

          dailySlots.push({
            time: formattedTime,
            isBooked: !isSlotAvailable,
          });

          currentTime.setMinutes(currentTime.getMinutes() + 30);
        }

        timeSlots.push({
          date: dayDate,
          slots: dailySlots,
        });
      }
    }

    setDocSlots(timeSlots);
    
    // Set the slot index for today's date
    const todaySlotIndex = timeSlots.findIndex(
      (slot) => slot.date.toDateString() === new Date().toDateString()
    );
    if (todaySlotIndex !== -1) {
      setSlotIndex(todaySlotIndex);
    }
  };

  // Handle booking
  const handleBookingClick = () => {
    if (!token) {
      toast.warn("Login to book Appointment");
      return;
    }

    if (selectedDoctors.length === 0) {
      toast.error("Please select at least one doctor");
      return;
    }

    if (!slotTime) {
      toast.error("Please select a time slot");
      return;
    }

    // Check if all selected doctors are available
    const unavailableDoctors = selectedDoctors.filter(doctor => !doctor.available);
    if (unavailableDoctors.length > 0) {
      toast.error(`Some selected doctors are not available: ${unavailableDoctors.map(d => d.name).join(', ')}`);
      return;
    }

    setShowMriForm(true);
  };

  // Handle MRI form data
  const handleMriFormData = (data) => {
    setMriFormData(data);
  };

  // Confirm booking
  const confirmBooking = async () => {
    if (!mriFormData) {
      toast.error("Please fill out the MRI referral form");
      return;
    }

    const requiredFields = ['surname', 'firstName', 'dob', 'healthCardNumber', 'clinicalInformation'];
    const missingFields = requiredFields.filter(field => !mriFormData[field] || mriFormData[field].trim() === '');

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsProcessingPayment(true);

    try {
      const date = docSlots[slotIndex].date;
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      let slotDate = `${day}/${month}/${year}`;

      // Book appointments for all selected doctors
      const appointmentPromises = selectedDoctors.map(doctor => 
        axios.post(
          `${backendUrl}/api/user/book-appointment`,
          { 
            docId: doctor._id, 
            slotDate, 
            slotTime,
            mriFormData,
            message: `Multi-doctor appointment with ${selectedDoctors.length} doctors`
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      );

      const appointmentResponses = await Promise.all(appointmentPromises);
      const appointmentIds = appointmentResponses.map(response => response.data.appointmentId);

      // Create payment session for all appointments
      const paymentResponse = await axios.post(
        `${backendUrl}/api/user/create-multi-appointment-session`,
        { 
          appointmentIds,
          totalAmount: calculateTotalFees()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (paymentResponse.data.success) {
        const stripe = await stripePromise;
        const { error } = await stripe.redirectToCheckout({
          sessionId: paymentResponse.data.sessionId,
        });

        if (error) {
          toast.error('Failed to redirect to payment. Please try again.');
          setIsProcessingPayment(false);
        }
      } else {
        toast.error(paymentResponse.data.message || 'Failed to create payment session');
        setIsProcessingPayment(false);
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(error.response?.data?.message || error.message || 'Booking failed');
      setIsProcessingPayment(false);
    }
  };

  // Cancel booking
  const cancelBooking = () => {
    setShowMriForm(false);
    setMriFormData(null);
  };

  // Update existing appointment
  const updateAppointment = async () => {
    if (!existingAppointment) return;
    
    setIsUpdating(true);
    try {
      const date = docSlots[slotIndex].date;
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      let slotDate = `${day}/${month}/${year}`;

      const response = await axios.put(
        `${backendUrl}/api/user/update-appointment/${existingAppointment._id}`,
        {
          doctorIds: selectedDoctors.map(d => d._id),
          slotDate,
          slotTime,
          mriFormData
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Appointment updated successfully");
        setExistingAppointment(null);
        setIsUpdating(false);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update appointment");
      setIsUpdating(false);
    }
  };

  // Get availability text
  const getAvailabilityText = (date) => {
    const dayName = date.toLocaleString('default', { weekday: 'long' });
    const monthName = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate();
    return `Availability for ${dayName}, ${monthName} ${day}`;
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    getAvailableSlots();
  }, [selectedDoctors]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 sm:pb-20">
      <div className="px-4 sm:px-6 lg:px-8 xl:px-16 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Book Multiple Doctors
          </h1>
          <p className="text-gray-600 text-lg">
            Select multiple doctors and book them all at the same time
          </p>
        </div>

        {/* Selected Doctors Summary */}
        {selectedDoctors.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Selected Doctors ({selectedDoctors.length})
            </h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedDoctors.map(doctor => (
                <span 
                  key={doctor._id}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                >
                  {doctor.name}
                  <button
                    onClick={() => handleDoctorDeselect(doctor)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-blue-900">
                Total: {currencySymbol}{calculateTotalFees()}
              </span>
            </div>
          </div>
        )}

        {/* Doctors Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Doctors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {doctors.map(doctor => (
              <DocCard
                key={doctor._id}
                doctor={doctor}
                isSelected={selectedDoctors.some(d => d._id === doctor._id)}
                onSelect={handleDoctorSelect}
                onDeselect={handleDoctorDeselect}
              />
            ))}
          </div>
        </div>

        {/* Appointment Scheduling */}
        {selectedDoctors.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="mb-6 lg:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Schedule Your Appointments
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Select a date and time that works for all selected doctors
              </p>
            </div>

            <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
              {/* Date & Time Selection */}
              <div className="flex-1 xl:flex-[2]">
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <h3 className="text-base sm:text-lg font-medium text-gray-800">
                    Select a Date and Time
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Showing slots available for all {selectedDoctors.length} selected doctors
                  </p>
                </div>

                {/* Date Picker */}
                <div className="mb-6 flex justify-center">
                  <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl bg-gray-900 p-3 sm:p-4 lg:p-6 rounded-xl shadow-lg">
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => {
                        setSelectedDate(date);
                        const selectedSlot = docSlots.find(
                          (slot) => slot.date.toDateString() === date.toDateString()
                        );
                        if (selectedSlot) setSlotIndex(docSlots.indexOf(selectedSlot));
                      }}
                      minDate={new Date()}
                      maxDate={new Date().setMonth(new Date().getMonth() + 3)}
                      dateFormat="MMMM d, yyyy"
                      inline
                    />
                  </div>
                </div>

                {/* Time Slots */}
                {docSlots[slotIndex] && (
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-800 mb-4">
                      {getAvailabilityText(docSlots[slotIndex].date)}
                    </h4>

                    {docSlots[slotIndex]?.slots?.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                        {docSlots[slotIndex].slots.map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => setSlotTime(slot.time)}
                            disabled={slot.isBooked}
                            className={`
                              px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200
                              ${slot.isBooked 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                                : slotTime === slot.time
                                  ? 'bg-blue-600 text-white shadow-md transform scale-105 border border-blue-600'
                                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                              }
                            `}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">
                          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-sm sm:text-base">
                          No common available slots for all selected doctors on this date
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Booking Summary */}
              <div className="xl:flex-1 xl:min-w-0">
                <div className="sticky top-4">
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Booking Summary
                    </h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600 block mb-2">Selected Doctors</span>
                        <div className="space-y-1">
                          {selectedDoctors.map(doctor => (
                            <div key={doctor._id} className="flex justify-between items-center text-sm">
                              <span className="font-medium text-gray-900">{doctor.name}</span>
                              <span className="text-gray-600">{currencySymbol}{doctor.fees}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Date</span>
                        <span className="text-sm font-medium text-gray-900">
                          {docSlots[slotIndex]?.date.toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) || 'Not selected'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Time</span>
                        <span className="text-sm font-medium text-gray-900">
                          {slotTime || 'Not selected'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">Total Fee</span>
                        <span className="text-lg font-bold text-gray-900">
                          {currencySymbol}{calculateTotalFees()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleBookingClick}
                      disabled={!slotTime || isProcessingPayment || selectedDoctors.length === 0}
                      className={`
                        w-full py-3 px-4 rounded-lg font-medium text-sm sm:text-base transition-all duration-200
                        ${!slotTime || isProcessingPayment || selectedDoctors.length === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:scale-105'
                        }
                      `}
                    >
                      {isProcessingPayment ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        `Book ${selectedDoctors.length} Appointment${selectedDoctors.length > 1 ? 's' : ''}`
                      )}
                    </button>

                    {!token && (
                      <p className="text-xs text-gray-500 text-center mt-3">
                        Please log in to book appointments
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MRI Form Modal */}
        {showMriForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    MRI Referral Request Form
                  </h2>
                  <button
                    onClick={cancelBooking}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Please complete this form for all {selectedDoctors.length} selected doctors.
                </p>
              </div>
              
              <div className="p-6">
                <MriReferralRequest 
                  onFormDataChange={handleMriFormData}
                  initialData={mriFormData}
                />
              </div>
              
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={cancelBooking}
                  className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  disabled={!mriFormData || isProcessingPayment}
                  className={`
                    px-6 py-2 rounded-lg font-medium transition-all duration-200
                    ${!mriFormData || isProcessingPayment
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                    }
                  `}
                >
                  {isProcessingPayment ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    `Confirm & Pay ${currencySymbol}${calculateTotalFees()}`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiDoctorAppointment;
