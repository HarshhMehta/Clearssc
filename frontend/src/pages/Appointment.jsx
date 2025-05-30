import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../Context/AppContext";
import { assets } from "../assets/assets_frontend/assets";
import { toast } from "react-toastify";
import axios from "axios";
import { loadStripe } from '@stripe/stripe-js';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Appointment = () => {
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [message, setMessage] = useState("");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  // Set default date as today's date
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } =
    useContext(AppContext);
  const { docId } = useParams();
  const navigate = useNavigate();

  // Find the doctor with the matching ID
  const docInfo = doctors.find((doc) => doc._id === docId);
  let timeSlots = [];

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
          const isSlotBooked = docInfo?.slots_booked?.[slotDate]?.includes(formattedTime);

          dailySlots.push({
            time: formattedTime,
            isBooked: isSlotBooked,
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

    if (!docInfo.available) {
      toast.error("Service not available");
      return;
    }

    if (!slotTime) {
      toast.error("Please select a time slot");
      return;
    }

    setShowMessageModal(true);
  };

  const confirmBooking = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message ");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const date = docSlots[slotIndex].date;
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      let slotDate = day + "/" + month + "/" + year;

      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        { 
          docId, 
          slotDate, 
          slotTime,
          message: message.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        const appointmentId = data.appointmentId;
        
        const paymentResponse = await axios.post(
          `${backendUrl}/api/user/create-stripe-session`,
          { appointmentId }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (paymentResponse.data.success) {
          const stripe = await stripePromise;
          const { error } = await stripe.redirectToCheckout({ 
            sessionId: paymentResponse.data.sessionId 
          });
          
          if (error) {
            toast.error('Failed to redirect to payment. Please try again.');
            setIsProcessingPayment(false);
          }
        } else {
          toast.error(paymentResponse.data.message || 'Failed to create payment session');
          setIsProcessingPayment(false);
        }
        
        getDoctorsData();
        
      } else {
        toast.error(data.message);
        setIsProcessingPayment(false);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || error.message || 'Booking failed');
      setIsProcessingPayment(false);
    }
  };

  const cancelBooking = () => {
    setShowMessageModal(false);
    setMessage("");
  };

  const getAvailabilityText = (date) => {
    const dayName = date.toLocaleString('default', { weekday: 'long' });
    const monthName = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate();
    return `Availability for ${dayName}, ${monthName} ${day}`;
  };

  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  return (
    docInfo && (
      <div className="min-h-screen bg-gray-50 pb-16 sm:pb-20">
        {/* Enhanced Responsive Calendar Styles */}
        <style jsx>{`
          .react-datepicker-wrapper {
            width: 100% !important;
          }
          
          .react-datepicker__month-container {
            float: none !important;
            left: 0 !important;
            position: relative !important;
          }

          .react-datepicker {
            border: none !important;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.2) !important;
            border-radius: 16px !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
            background: white !important;
            padding: 16px !important;
            min-width: 280px !important;
            max-width: 100% !important;
            border: 1px solid rgba(208, 224, 87, 0.1) !important;
            width: 100% !important;
          }
          
          @media (min-width: 640px) {
            .react-datepicker {
              padding: 24px !important;
              min-width: 350px !important;
              border-radius: 20px !important;
            }
          }
          
          @media (min-width: 1024px) {
            .react-datepicker {
              padding: 32px !important;
              min-width: 420px !important;
              border-radius: 24px !important;
            }
          }
          
          .react-datepicker__header {
            background: transparent !important;
            border: none !important;
            color: black !important;
            padding: 0 !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
            margin-bottom: 16px !important;
          }
          
          @media (min-width: 640px) {
            .react-datepicker__header {
              margin-bottom: 20px !important;
            }
          }
          
          .react-datepicker__current-month {
            color: #D0E057 !important;
            font-size: 18px !important;
            font-weight: 700 !important;
            margin-bottom: 16px !important;
            letter-spacing: -0.5px !important;
            text-align: center !important;
          }
          
          @media (min-width: 640px) {
            .react-datepicker__current-month {
              font-size: 20px !important;
              margin-bottom: 18px !important;
            }
          }
          
          @media (min-width: 1024px) {
            .react-datepicker__current-month {
              font-size: 24px !important;
              margin-bottom: 20px !important;
            }
          }
          
          .react-datepicker__navigation {
            background: rgba(208, 224, 87, 0.1) !important;
            border-radius: 50% !important;
            width: 36px !important;
            height: 36px !important;
            line-height: 34px !important;
            top: 20px !important;
            border: 1px solid rgba(208, 224, 87, 0.2) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          
          @media (min-width: 640px) {
            .react-datepicker__navigation {
              width: 40px !important;
              height: 40px !important;
              line-height: 38px !important;
              top: 24px !important;
            }
          }
          
          @media (min-width: 1024px) {
            .react-datepicker__navigation {
              width: 44px !important;
              height: 44px !important;
              line-height: 42px !important;
              top: 28px !important;
            }
          }
          
          .react-datepicker__navigation:hover {
            background: rgba(208, 224, 87, 0.2) !important;
            border-color: rgba(208, 224, 87, 0.4) !important;
            transform: scale(1.05) !important;
          }
          
          .react-datepicker__navigation--previous {
            left: 20px !important;
            padding: 2px !important;
          }
          
          .react-datepicker__navigation--next {
            right: 20px !important;
            padding: 2px !important;  
          }
          
          @media (min-width: 1024px) {
            .react-datepicker__navigation--previous {
              left: 32px !important;
            }
            
            .react-datepicker__navigation--next {
              right: 32px !important;
            }
          }
          
          .react-datepicker__navigation-icon::before {
            border-color: black !important;
            border-width: 2px 2px 0 0 !important;
            margin-top: 8px !important; 
            width: 8px !important;
            height: 8px !important;
          }
          
          @media (min-width: 1024px) {
            .react-datepicker__navigation-icon::before {
              margin-top: 10px !important; 
              width: 10px !important;
              height: 10px !important;
            }
          }
          
          .react-datepicker__day-names {
            background: rgba(255, 255, 255, 0.03) !important;
            margin: 0 0 0 !important;
            border-radius: 8px !important;
            padding: 8px 0 !important;
            border: 1px solid rgba(255, 255, 255, 0.05) !important;
          }
          
          @media (min-width: 640px) {
            .react-datepicker__day-names {
              border-radius: 10px !important;
              padding: 10px 0 !important;
            }
          }
          
          @media (min-width: 1024px) {
            .react-datepicker__day-names {
              border-radius: 12px !important;
              padding: 12px 0 !important;
            }
          }
          
          .react-datepicker__day-name {
            color: black !important;
            font-weight: 600 !important;
            font-size: 10px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            width: 32px !important;
            margin: 0 2px !important;
          }
          
          @media (min-width: 640px) {
            .react-datepicker__day-name {
              font-size: 11px !important;
              letter-spacing: 0.8px !important;
              width: 36px !important;
              margin: 0 3px !important;
            }
          }
          
          @media (min-width: 1024px) {
            .react-datepicker__day-name {
              font-size: 12px !important;
              letter-spacing: 1px !important;
              width: 44px !important;
              margin: 0 4px !important;
            }
          }
          
          .react-datepicker__month {
            margin: 0 !important;
            background: transparent !important;
            padding: 0 !important;
          }
          
          .react-datepicker__week {
            display: flex !important;
            justify-content: center !important;
            gap: 4px !important;
            margin-bottom: 4px !important;
          }
          
          @media (min-width: 640px) {
            .react-datepicker__week {
              gap: 6px !important;
              margin-bottom: 6px !important;
            }
          }
          
          @media (min-width: 1024px) {
            .react-datepicker__week {
              gap: 8px !important;
              margin-bottom: 8px !important;
            }
          }
          
          .react-datepicker__day {
            color: black !important;
            width: 32px !important;
            height: 32px !important;
            line-height: 30px !important;
            margin: 0 !important;
            border-radius: 8px !important;
            font-weight: 500 !important;
            font-size: 12px !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            position: relative !important;
            cursor: pointer !important;
            border: 1px solid transparent !important;
            background: rgba(255, 255, 255, 0.02) !important;
          }
          
          @media (min-width: 640px) {
            .react-datepicker__day {
              width: 36px !important;
              height: 36px !important;
              line-height: 34px !important;
              border-radius: 10px !important;
              font-size: 13px !important;
            }
          }
          
          @media (min-width: 1024px) {
            .react-datepicker__day {
              width: 44px !important;
              height: 44px !important;
              line-height: 42px !important;
              border-radius: 12px !important;
              font-size: 14px !important;
            }
          }
          
          .react-datepicker__day:hover {
            background: rgba(208, 224, 87, 0.15) !important;
            color: #D0E057 !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 12px rgba(208, 224, 87, 0.2) !important;
            border-color: rgba(208, 224, 87, 0.3) !important;
          }
          
          @media (min-width: 1024px) {
            .react-datepicker__day:hover {
              transform: translateY(-2px) !important;
              box-shadow: 0 8px 20px rgba(208, 224, 87, 0.2) !important;
            }
          }
          
          .react-datepicker__day--selected {
            background: #D0E057 !important;
            color: #141B31 !important;
            font-weight: 700 !important;
            transform: scale(1.05) !important;
            box-shadow: 0 4px 16px rgba(208, 224, 87, 0.4) !important;
            border-color: #D0E057 !important;
            z-index: 2 !important;
          }
          
          @media (min-width: 1024px) {
            .react-datepicker__day--selected {
              box-shadow: 0 8px 24px rgba(208, 224, 87, 0.4) !important;
            }
          }
          
          .react-datepicker__day--selected:hover {
            background: #D0E057 !important;
            color: #141B31 !important;
            transform: scale(1.05) translateY(-1px) !important;
            box-shadow: 0 8px 20px rgba(208, 224, 87, 0.5) !important;
          }
          
          @media (min-width: 1024px) {
            .react-datepicker__day--selected:hover {
              transform: scale(1.05) translateY(-2px) !important;
              box-shadow: 0 12px 28px rgba(208, 224, 87, 0.5) !important;
            }
          }
          
          .react-datepicker__day--today {
            background: rgba(255, 255, 255, 0.08) !important;
            color: blue !important;
            font-weight: 600 !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1) !important;
          }
          
          @media (min-width: 1024px) {
            .react-datepicker__day--today {
              box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1) !important;
            }
          }
          
          .react-datepicker__day--today:hover {
            background: rgba(255, 255, 255, 0.12) !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 12px rgba(255, 255, 255, 0.15) !important;
          }
          
          @media (min-width: 1024px) {
            .react-datepicker__day--today:hover {
              transform: translateY(-2px) !important;
              box-shadow: 0 8px 20px rgba(255, 255, 255, 0.15) !important;
            }
          }
          
          .react-datepicker__day--weekend {
            color: red !important;
            font-weight: 400 !important;
          }
          
          .react-datepicker__day--disabled {
            color: grey !important;
            cursor: not-allowed !important;
            background: rgba(255, 255, 255, 0.01) !important;
          }
          
          .react-datepicker__day--disabled:hover {
            background: #D0E057 !important;
            transform: none !important;
            box-shadow: none !important;
            color: black !important;
          }
          
          .react-datepicker__day--outside-month {
            color: gray !important;
            background: transparent !important;
          }
          
          .react-datepicker__day--outside-month:hover {
            background: rgba(255, 255, 255, 0.05) !important;
            color: black !important;
          }
          
          .react-datepicker__day--keyboard-selected {
            background: #141B31 !important;
            color: white !important;
            border-color: rgba(208, 224, 87, 0.4) !important;
          }
          
          .react-datepicker {
            animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(16px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          @media (min-width: 1024px) {
            @keyframes slideInUp {
              from {
                opacity: 0;
                transform: translateY(24px) scale(0.95);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
          }
          
          .react-datepicker__day--has-slots::after {
            content: '';
            position: absolute;
            bottom: 4px;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 6px;
            background: #D0E057;
            border-radius: 50%;
            box-shadow: 0 0 0 1px #141B31, 0 0 6px rgba(208, 224, 87, 0.6);
            animation: pulse 2s infinite;
          }
          
          @media (min-width: 1024px) {
            .react-datepicker__day--has-slots::after {
              bottom: 6px;
              width: 8px;
              height: 8px;
              box-shadow: 0 0 0 1px #141B31, 0 0 8px rgba(208, 224, 87, 0.6);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: translateX(-50%) scale(1);
            }
            50% {
              opacity: 0.7;
              transform: translateX(-50%) scale(1.1);
            }
          }
          
          .react-datepicker::-webkit-scrollbar {
            width: 4px;
          }
          
          @media (min-width: 1024px) {
            .react-datepicker::-webkit-scrollbar {
              width: 6px;
            }
          }
          
          .react-datepicker::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 2px;
          }
          
          @media (min-width: 1024px) {
            .react-datepicker::-webkit-scrollbar-track {
              border-radius: 3px;
            }
          }
          
          .react-datepicker::-webkit-scrollbar-thumb {
            background: rgba(208, 224, 87, 0.3);
            border-radius: 2px;
          }
          
          @media (min-width: 1024px) {
            .react-datepicker::-webkit-scrollbar-thumb {
              border-radius: 3px;
            }
          }
          
          .react-datepicker::-webkit-scrollbar-thumb:hover {
            background: rgba(208, 224, 87, 0.5);
          }
        `}</style>

        {/* Main Container - Responsive padding */}
        <div className="px-4 sm:px-6 lg:px-8 xl:px-16 text-center 2xl:px-24 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">
          {/* Doctor Profile Section */}
          <div className="flex  flex-col text-center  lg:flex-row gap-6 lg:gap-8 mb-8">
            {/* Doctor Image - Responsive sizing */}
          

            {/* Doctor Info - Responsive layout */}
            <div className="w-full justify-center alineitems-center text-center">
              <div style={{ backgroundColor: "#141B31" }}  className="border text-white border-gray-300 rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm">
                <div className="flex flex-col text-center justify-center sm:flex-row sm:items-center gap-2 mb-4">
                  <h1 className="text-xl text-center sm:text-2xl font-semibold text-white">
                    {docInfo.name}
                  </h1>

                </div>
                
                <div className="flex flex-col justify-center text-center  sm:flex-row sm:items-center gap-2 text-sm mb-4">
                  <p>{docInfo.degree} - {docInfo.speciality}</p>
                 
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-medium  mb-2">About</h3>
                  <p className=" text-sm leading-relaxed">
                    {docInfo.about}
                  </p>
                </div>
                
                <div className=" font-medium">
                  Appointment fee: &nbsp;
                  <span className=" text-lg font-semibold">
                    {currencySymbol}{docInfo.fees}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Section - Responsive grid */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="mb-6 lg:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Schedule Your Appointment
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Select your preferred date and time for the consultation
              </p>
            </div>

            <div className="flex flex-col xl:flex-row gap-6 lg:gap-8">
              {/* Date & Time Selection - Responsive width */}
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

                {/* Enhanced Date Picker - Responsive container */}
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

                {/* Time Slots - Responsive grid */}
                {docSlots[slotIndex] && (
                  <div>
                    <h4 className="text-sm sm:text-base font-medium text-gray-800 mb-4">
                      {getAvailabilityText(docSlots[slotIndex].date)}
                    </h4>

                    {docSlots[slotIndex]?.slots?.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
                        {docSlots[slotIndex].slots.map((slot, idx) => (
                          <button
                            key={idx}
                            onClick={() => !slot.isBooked && setSlotTime(slot.time)}
                            disabled={slot.isBooked}
                            className={`px-2 sm:px-3 lg:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all border ${
                              slot.isBooked
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : slot.time === slotTime
                                ? 'bg-primary text-white border-primary shadow-md scale-105'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-primary hover:text-white hover:border-primary hover:shadow-md hover:scale-105'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic">
                        No slots available for this date
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Booking Summary - Responsive sidebar */}
              <div className="w-full xl:w-80 xl:flex-shrink-0">
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200 sticky top-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Appointment Summary
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Doctor:</span>
                      <span className="font-medium text-gray-900">{docInfo.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Speciality:</span>
                      <span className="font-medium text-gray-900">{docInfo.speciality}</span>
                    </div>
                    {selectedDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium text-gray-900">
                          {selectedDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    {slotTime && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium text-gray-900">{slotTime}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="text-gray-600">Consultation Fee:</span>
                      <span className="font-semibold text-gray-900 text-base">
                        {currencySymbol}{docInfo.fees}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleBookingClick}
                    disabled={!slotTime || !docInfo.available}
                    className={`w-full py-3 px-4 rounded-lg font-medium text-sm sm:text-base transition-all ${
                      !slotTime || !docInfo.available
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:scale-105 active:scale-100'
                    }`}
                  >
                    {!docInfo.available 
                      ? 'Service Unavailable' 
                      : !slotTime 
                      ? 'Select Time Slot' 
                      : 'Book Appointment'
                    }
                  </button>

                  {!docInfo.available && (
                    <p className="text-xs text-red-500 mt-2 text-center">
                      This Service is currently not available for appointments
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Modal - Responsive design */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md mx-auto shadow-2xl">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Add a Message for the Doctor
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your symptoms or reason for visit
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe your symptoms, medical history, or reason for this appointment..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {message.length}/500 characters
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={cancelBooking}
                  disabled={isProcessingPayment}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  disabled={isProcessingPayment || !message.trim()}
                  className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default Appointment;