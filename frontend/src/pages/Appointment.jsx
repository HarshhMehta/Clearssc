import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { loadStripe } from '@stripe/stripe-js';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import MriReferralRequest from "./MriReferralRequest";
import DocCard from "../Components/DocCard";
import '../index.css';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Appointment = () => {
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [showMriForm, setShowMriForm] = useState(false);
  const [mriFormData, setMriFormData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Enhanced states for multiple doctor selection
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [showDoctorSelector, setShowDoctorSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");

  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext);
  const { docId } = useParams();
  const navigate = useNavigate();

  // Find the primary doctor (from URL parameter)
  const primaryDoctor = doctors.find((doc) => doc._id === docId);

  // Initialize selected doctors with primary doctor
  useEffect(() => {
    if (primaryDoctor && selectedDoctors.length === 0) {
      setSelectedDoctors([primaryDoctor]);
    }
  }, [primaryDoctor]);

  // Get unique specialties for filter
  const specialties = [...new Set(doctors.map(doctor => doctor.speciality).filter(Boolean))];

  // Filter doctors based on search and specialty
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !filterSpecialty || doctor.speciality === filterSpecialty;
    const isAvailable = doctor.available;
    
    return matchesSearch && matchesSpecialty && isAvailable;
  });

  // Calculate total fees
  const calculateTotalFees = () => {
    return selectedDoctors.reduce((total, doctor) => total + (parseFloat(doctor.fees) || 0), 0);
  };

  // Add doctor to selection
  const addDoctor = (doctor) => {
    if (selectedDoctors.some(d => d._id === doctor._id)) {
      toast.info(`${doctor.name} is already selected`);
      return;
    }
    
    // Check if doctor is available
    if (!doctor.available) {
      toast.error(`${doctor.name} is currently unavailable`);
      return;
    }
    
    setSelectedDoctors(prev => [...prev, doctor]);
    toast.success(`✅ ${doctor.name} added to your appointment`);
  };

  // Remove doctor from selection
  const removeDoctor = (doctorId) => {
    // Don't allow removing the primary doctor
    if (doctorId === docId) {
      toast.info("Cannot remove the primary doctor from your appointment");
      return;
    }
    
    setSelectedDoctors(prev => {
      const removed = prev.find(d => d._id === doctorId);
      const updated = prev.filter(d => d._id !== doctorId);
      
      if (removed) {
        toast.success(`❌ ${removed.name} removed from your appointment`);
      }
      
      return updated;
    });
  };

  // Toggle doctor selection (for clicking on doctor cards)
  const handleDoctorToggle = (doctor) => {
    const isSelected = selectedDoctors.some(d => d._id === doctor._id);
    
    if (isSelected) {
      // If trying to remove primary doctor, show message
      if (doctor._id === docId) {
        toast.info("Primary doctor cannot be removed. You can add additional Services to your appointment.");
        return;
      }
      removeDoctor(doctor._id);
    } else {
      addDoctor(doctor);
    }
  };

  const getAvailableSlots = () => {
    let today = new Date();
    let currentYear = today.getFullYear();
    let timeSlots = [];

    // Get slots for the entire next year (12 months)
    for (let m = 0; m < 12; m++) {
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
            const isSlotBooked = doctor?.slots_booked?.[slotDate]?.includes(formattedTime);
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
    
    // Set the slot index for today's date after slots are generated
    const todaySlotIndex = timeSlots.findIndex(
      (slot) => slot.date.toDateString() === new Date().toDateString()
    );
    if (todaySlotIndex !== -1) {
      setSlotIndex(todaySlotIndex);
    }
  };

  const handleBookingClick = () => {
    if (!token) {
      toast.warn("Login to book Appointment");
      return navigate("/login");
    }

    // Check if any selected doctor is not available
    const unavailableDoctors = selectedDoctors.filter(doctor => !doctor.available);
    if (unavailableDoctors.length > 0) {
      toast.error(`Some selected Services are not available: ${unavailableDoctors.map(d => d.name).join(', ')}`);
      return;
    }

    if (!slotTime) {
      toast.error("Please select a time slot");
      return;
    }

    // Show confirmation for multiple doctors, then proceed to form
    if (selectedDoctors.length > 1) {
      const doctorNames = selectedDoctors.map(d => d.name).join(', ');
      const confirmed = window.confirm(
        `You are booking appointments with ${selectedDoctors.length} Services:\n\n${doctorNames}\n\nTotal Fee: ${currencySymbol}${calculateTotalFees()}\n\nProceed to fill the referral form?`
      );
      
      if (!confirmed) {
        return;
      }
    }

    // Show MRI form (keeping original flow)
    setShowMriForm(true);
  };

  const handleMriFormData = (data) => {
    setMriFormData(data);
  };

  const confirmBooking = async () => {
    if (!mriFormData) {
      toast.error("Please fill out the MRI referral form");
      return;
    }
  
    // Validate required fields
    const requiredFields = ['surname', 'firstName', 'dob', 'healthCardNumber', 'clinicalInformation'];
    const missingFields = requiredFields.filter(field => !mriFormData[field] || mriFormData[field].trim() === '');
  
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Close MRI form and show confirmation
    setShowMriForm(false);
    setShowConfirmation(true);
  };

  const processPayment = async () => {
    setIsProcessingPayment(true);
  
    try {
      const date = docSlots[slotIndex].date;
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      let slotDate = `${day}/${month}/${year}`;

      if (selectedDoctors.length === 1) {
        // Single doctor booking (original flow)
        const { data } = await axios.post(
          backendUrl + "/api/user/book-appointment",
          { 
            docId: selectedDoctors[0]._id, 
            slotDate, 
            slotTime,
            mriFormData,
            message: ""
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
  
        if (data.success) {
          const appointmentId = data.appointmentId;
  
          // Original payment flow for single doctor
          const paymentResponse = await axios.post(
            `${backendUrl}/api/user/create-stripe-session`,
            { appointmentId },
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
        } else {
          toast.error(data.message);
          setIsProcessingPayment(false);
        }
      } else {
        // Multiple doctors booking - create separate appointments for each doctor
        const appointmentPromises = selectedDoctors.map(doctor =>
          axios.post(
            backendUrl + "/api/user/book-appointment",
            {
              docId: doctor._id,
              slotDate,
              slotTime,
              mriFormData,
              message: `Multi-doctor appointment session with ${selectedDoctors.length} Services`,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
        );

        const appointmentResponses = await Promise.all(appointmentPromises);
        const successfulBookings = appointmentResponses.filter(response => response.data.success);
        
        if (successfulBookings.length === 0) {
          toast.error('Failed to book appointments. Please try again.');
          setIsProcessingPayment(false);
          return;
        }

        if (successfulBookings.length < selectedDoctors.length) {
          toast.warn('Some appointments could not be booked. Proceeding with successful bookings.');
        }

        const appointmentIds = successfulBookings.map(response => response.data.appointmentId);

        // Try multi-appointment payment session, fallback to individual payments
        try {
          const paymentResponse = await axios.post(
            `${backendUrl}/api/user/create-multi-appointment-session`,
            {
              appointmentIds,
              totalAmount: calculateTotalFees(),
              doctorNames: selectedDoctors.map(d => d.name),
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
            throw new Error('Multi-appointment session failed');
          }
        } catch (multiPaymentError) {
          // Fallback: Use single appointment payment for the first appointment
          console.log('Multi-appointment payment failed, using fallback:', multiPaymentError);
          
          const paymentResponse = await axios.post(
            `${backendUrl}/api/user/create-stripe-session`,
            { 
              appointmentId: appointmentIds[0],
              // Add metadata about multiple appointments
              metadata: {
                isMultipleAppointments: true,
                totalAppointments: appointmentIds.length,
                totalAmount: calculateTotalFees(),
                allAppointmentIds: appointmentIds.join(',')
              }
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
            toast.error('Failed to create payment session. Please try again.');
            setIsProcessingPayment(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message || 'Booking failed');
      setIsProcessingPayment(false);
    }
  };

  const cancelBooking = () => {
    setShowMriForm(false);
    setShowConfirmation(false);
    setMriFormData(null);
  };

  const getAvailabilityText = (date) => {
    const dayName = date.toLocaleString('default', { weekday: 'long' });
    const monthName = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate();
    return `Availability for ${dayName}, ${monthName} ${day}`;
  };

  useEffect(() => {
    getAvailableSlots();
  }, [selectedDoctors]);

  if (!primaryDoctor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Doctor not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 sm:pb-20">
      <div className="px-4 sm:px-6 lg:px-8 xl:px-16 text-center 2xl:px-24 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">
        
        {/* Enhanced Multiple Doctor Selection */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-6">
            <button
              onClick={() => setShowDoctorSelector(!showDoctorSelector)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                showDoctorSelector
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {showDoctorSelector ? 'Hide Doctor Selection' : 'Add More Services'}
            </button>
            
            {selectedDoctors.length > 1 && (
              <div className="text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg">
                {selectedDoctors.length} Service selected
              </div>
            )}
          </div>

          {/* Selected Doctors Summary */}
          {selectedDoctors.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Selected Services ({selectedDoctors.length})
              </h3>
              
              <div className="space-y-3">
                {selectedDoctors.map((doctor, index) => (
                  <div
                    key={doctor._id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 ${
                      doctor._id === docId 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          doctor._id === docId ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
                          {doctor._id === docId && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{doctor.speciality}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {currencySymbol}{doctor.fees}
                        </div>
                      </div>
                      
                      {doctor._id !== docId && (
                        <button
                          onClick={() => removeDoctor(doctor._id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                          title="Remove doctor"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Consultation Fee:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {currencySymbol}{calculateTotalFees()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Doctor Selection Interface */}
          {showDoctorSelector && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Add More Services</h2>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search Services by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                <div className="sm:w-48">
                  <select
                    value={filterSpecialty}
                    onChange={(e) => setFilterSpecialty(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Specialties</option>
                    {specialties.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bulk Selection Actions */}
              {filteredDoctors.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <button
                    onClick={() => {
                      const availableDoctors = filteredDoctors.filter(doc => doc.available && !selectedDoctors.some(d => d._id === doc._id));
                      if (availableDoctors.length === 0) {
                        toast.info("All available Services are already selected");
                        return;
                      }
                      setSelectedDoctors(prev => [...prev, ...availableDoctors]);
                      toast.success(`Added ${availableDoctors.length} Services to your appointment`);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Select All Available ({filteredDoctors.filter(doc => doc.available && !selectedDoctors.some(d => d._id === doc._id)).length})
                  </button>
                  
                  {selectedDoctors.length > 1 && (
                    <button
                      onClick={() => {
                        const primaryDoc = selectedDoctors.find(d => d._id === docId);
                        setSelectedDoctors(primaryDoc ? [primaryDoc] : []);
                        toast.success("Cleared all additional Services (kept primary Service)");
                      }}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear Additional ({selectedDoctors.length - 1})
                    </button>
                  )}
                  
                  <div className="ml-auto flex items-center text-sm text-gray-600">
                    <span className="bg-white px-3 py-2 rounded-lg border border-gray-200">
                      {selectedDoctors.length} of {filteredDoctors.length} selected
                    </span>
                  </div>
                </div>
              )}
              
              {/* Doctors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDoctors.map((doctor) => {
                  const isSelected = selectedDoctors.some(d => d._id === doctor._id);
                  const isPrimary = doctor._id === docId;
                  
                  return (
                    <div
                      key={doctor._id}
                      className={`relative bg-white border-2 rounded-xl p-4 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                        isSelected 
                          ? isPrimary 
                            ? 'border-green-400 bg-green-50 shadow-md' 
                            : 'border-blue-400 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => handleDoctorToggle(doctor)}
                    >
                      {/* Selection Checkbox */}
                      <div className="absolute top-3 right-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          isSelected
                            ? isPrimary
                              ? 'bg-green-500 border-green-500'
                              : 'bg-blue-500 border-blue-500'
                            : 'border-gray-300 bg-white hover:border-blue-400'
                        }`}>
                          {isSelected && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Primary Badge */}
                      {isPrimary && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                            Primary
                          </span>
                        </div>
                      )}

                      {/* Doctor Avatar */}
                      <div className="flex flex-col items-center text-center mt-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                          {doctor.image ? (
                            <img 
                              src={doctor.image} 
                              alt={doctor.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-2xl font-bold">
                              {doctor.name.charAt(0)}
                            </span>
                          )}
                        </div>

                        {/* Doctor Info */}
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          {doctor.name}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {doctor.speciality}
                        </p>

                        {doctor.degree && (
                          <p className="text-xs text-gray-500 mb-3">
                            {doctor.degree}
                          </p>
                        )}

                        {/* Experience & Availability */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          {doctor.experience && (
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {doctor.experience}
                            </div>
                          )}
                          
                          <div className={`flex items-center gap-1 ${doctor.available ? 'text-green-600' : 'text-red-600'}`}>
                            <div className={`w-2 h-2 rounded-full ${doctor.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            {doctor.available ? 'Available' : 'Unavailable'}
                          </div>
                        </div>

                        {/* Fee */}
                        <div className="bg-gray-100 rounded-lg px-3 py-2 w-full">
                          <div className="text-center">
                            <span className="text-sm text-gray-600">Consultation Fee</span>
                            <div className="font-bold text-lg text-gray-900">
                              {currencySymbol}{doctor.fees}
                            </div>
                          </div>
                        </div>

                        {/* About */}
                        {doctor.about && (
                          <p className="text-xs text-gray-600 mt-3 line-clamp-2">
                            {doctor.about}
                          </p>
                        )}
                      </div>

                      {/* Selection Overlay */}
                      {isSelected && (
                        <div className={`absolute inset-0 rounded-xl border-2 pointer-events-none ${
                          isPrimary ? 'border-green-400' : 'border-blue-400'
                        }`}>
                          <div className={`absolute inset-0 rounded-xl ${
                            isPrimary ? 'bg-green-500' : 'bg-blue-500'
                          } opacity-5`}></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {filteredDoctors.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No Services found matching your criteria</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Booking Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
          <div className="mb-6 lg:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Schedule Your Appointment{selectedDoctors.length > 1 ? 's' : ''}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Select your preferred date and time for the consultation
              {selectedDoctors.length > 1 && (
                <span className="block text-blue-600 font-medium mt-1">
                  Showing slots available for all {selectedDoctors.length} selected Services
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
            {/* Date & Time Selection */}
            <div className="flex-1 xl:flex-[2]">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-medium text-gray-800">
                    Select a Date and Time
                  </h3>
                  <div className="text-xs sm:text-sm text-gray-500">
                    Time zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </div>
                </div>
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
                    maxDate={new Date().setFullYear(new Date().getFullYear() + 1)}
                    dateFormat="MMMM d, yyyy"
                    inline
                    dayClassName={(date) => {
                      const hasSlots = docSlots.some(slot => 
                        slot.date.toDateString() === date.toDateString() && 
                        slot.slots.some(s => !s.isBooked)
                      );
                      return hasSlots ? 'react-datepicker__day--has-slots' : '';
                    }}
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm sm:text-base">
                        {selectedDoctors.length > 1 
                          ? "No common available slots for all selected Services on this date"
                          : "No available slots for this date"
                        }
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
                    {selectedDoctors.length > 1 ? (
                      <div className="py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600 block mb-2">Selected Services</span>
                        <div className="space-y-1">
                          {selectedDoctors.map((doctor) => (
                            <div key={doctor._id} className="flex justify-between items-center text-sm">
                              <span className="font-medium text-gray-900">{doctor.name}</span>
                              <span className="text-gray-600">{currencySymbol}{doctor.fees}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center py-2 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Services</span>
                        <span className="text-sm font-medium text-gray-900">{primaryDoctor.name}</span>
                      </div>
                    )}
                    
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
                    disabled={!slotTime || isProcessingPayment}
                    className={`
                      w-full py-3 px-4 rounded-lg font-medium text-sm sm:text-base transition-all duration-200
                      ${!slotTime || isProcessingPayment
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:scale-105'
                      }
                    `}
                  >
                    {isProcessingPayment ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      `Book Appointment${selectedDoctors.length > 1 ? 's' : ''} - ${currencySymbol}${calculateTotalFees()}`
                    )}
                  </button>
                  
                  {!slotTime && (
                    <p className="text-xs text-red-500 text-center mt-2">
                      Please select a time slot to continue
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                Please complete this form before booking your appointment.
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
                  'Confirm & Pay'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && mriFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  Confirm Your Appointment{selectedDoctors.length > 1 ? 's' : ''}
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

              {/* Appointment Details */}
              <div className="space-y-6 mb-8">
                {/* Doctors */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {selectedDoctors.length > 1 ? 'Selected Doctors' : 'Doctor'}
                  </h3>
                  <div className="space-y-2">
                    {selectedDoctors.map((doctor, index) => (
                      <div key={doctor._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{doctor.name}</div>
                          <div className="text-sm text-gray-600">{doctor.speciality}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{currencySymbol}{doctor.fees}</div>
                          {doctor._id === docId && (
                            <div className="text-xs text-green-600">Primary Doctor</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Date</h4>
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-700">
                      {docSlots[slotIndex]?.date.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Time</h4>
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-700">
                      {slotTime}
                    </div>
                  </div>
                </div>

                {/* Patient Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Patient Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Name</div>
                      <div className="font-medium text-gray-900">
                        {mriFormData.firstName} {mriFormData.surname}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Date of Birth</div>
                      <div className="font-medium text-gray-900">{mriFormData.dob}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Health Card Number</div>
                      <div className="font-medium text-gray-900">{mriFormData.healthCardNumber}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Gender</div>
                      <div className="font-medium text-gray-900">{mriFormData.gender || 'Not specified'}</div>
                    </div>
                  </div>
                  
                  {mriFormData.clinicalInformation && (
                    <div className="mt-4">
                      <div className="text-sm text-gray-600 mb-1">Clinical Information</div>
                      <div className="p-3 bg-gray-50 rounded-lg text-gray-700 text-sm">
                        {mriFormData.clinicalInformation}
                      </div>
                    </div>
                  )}
                </div>

                {/* Total Fee */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Consultation Fee</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {currencySymbol}{calculateTotalFees()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={cancelBooking}
                  disabled={isProcessingPayment}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={processPayment}
                  disabled={isProcessingPayment}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Payment...
                    </>
                  ) : (
                    `Proceed to Payment - ${currencySymbol}${calculateTotalFees()}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointment;