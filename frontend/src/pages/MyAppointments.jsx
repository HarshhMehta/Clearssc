import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../Context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payingAppointment, setPayingAppointment] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if user is returning from payment
  useEffect(() => {
    const success = searchParams.get('success');
    const cancelled = searchParams.get('cancelled');
    const sessionId = searchParams.get('session_id');
  
    if (success === 'true' && sessionId) {
      verifyPayment(sessionId);
    } else if (cancelled === 'true') {
      toast.info('Payment was cancelled. Please complete payment to view your appointment.');
      navigate('/my-appointments', { replace: true });
    }
  }, [searchParams, navigate]);

  // Verify payment after successful Stripe checkout
  const verifyPayment = async (sessionId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/verify-stripe-payment",
        { sessionId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success(`Payment verified! Amount: $${data.paymentAmount}`);
        // Refresh appointments to show updated payment status
        getUserAppointments();
      } else {
        toast.error(data.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Failed to verify payment. Please contact support.');
    } finally {
      // Clean up URL
      navigate('/my-appointments', { replace: true });
    }
  };

  const getUserAppointments = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Appointments API data:', data);
      if (data.success) {
        // Filter appointments to only show paid ones
        const paidAppointments = data.appointments.filter(appointment => 
          appointment.payment === true || appointment.isCompleted === true
        );
        setAppointments(paidAppointments.reverse());
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/cancel-appointment`, { appointmentId }, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData(); // refresh doctors data as well
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async (appointmentId) => {
    setLoading(true);
    setPayingAppointment(appointmentId);
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/create-stripe-session`, { appointmentId }, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        const stripe = await stripePromise;
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (error) toast.error('Failed to redirect to payment. Please try again.');
      } else {
        toast.error(data.message || 'Failed to create payment session');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
      setPayingAppointment(null);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
    }
  }, [token]);

  if (loading && !appointments.length) {
    return (
      <div className="mx-16 sm:mx-24 md:mx-28 lg:mx-32 overflow-x-hidden">
        <p className="pb-3 mt-12 font-normal text-2xl text-zinc-700 border-b">
          My Appointments
        </p>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (!appointments.length && token) {
    return (
      <div className="mx-16 sm:mx-24 md:mx-28 lg:mx-32 overflow-x-hidden">
        <p className="pb-3 mt-12 font-normal text-2xl text-zinc-700 border-b">
          My Appointments
        </p>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No confirmed appointments found</p>
          <p className="text-gray-400 text-sm mt-2">Only paid appointments are displayed here</p>
          <button
            onClick={() => navigate('/doctors')}
            className="mt-4 bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 transition-colors"
          >
            Book an Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-16 sm:mx-24 md:mx-28 lg:mx-32 overflow-x-hidden">
      <p className="pb-3 mt-12 font-normal text-2xl text-zinc-700 border-b">
        My Appointments
      </p>
      
      <div className="space-y-4 mt-6">
        {appointments.map((item, index) => {
          return (
            <div
              className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border border-gray-200 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow"
              key={item._id || index}
            >
              {/* Doctor Info */}
              <div className="flex-1 text-sm p-5 text-zinc-600 space-y-2">
                <p className="text-neutral-800 font-semibold text-lg">
                 {item.docData.name}
                </p>
                <p className="text-blue-600 font-medium">{item.docData.speciality}</p>
                
                <div className="space-y-1">
                  <p>
                    <span className="font-medium text-zinc-700">Date & Time: </span>
                    <span className="text-gray-900">{(item.slotDate)} at {item.slotTime}</span>
                  </p>
                  <p>
                    <span className="font-medium text-zinc-700">Fee: </span>
                    <span className="text-gray-900 font-semibold">${item.amount}</span>
                  </p>
                 
                  {item.paymentCompletedAt && (
                    <p>
                      <span className="font-medium text-zinc-700">Paid on: </span>
                      <span className="text-green-700">{(item.paymentCompletedAt)}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Status Display */}
              <div className="flex flex-col justify-center gap-3 text-sm text-center min-w-[200px]">
                {item.isCompleted ? (
                  <button className="border border-green-500 bg-green-100 text-green-700 rounded py-2 px-4 font-medium">
                    ✓ Appointment Completed
                  </button>
                ) : item.cancelled ? (
                  <button className="border border-red-500 bg-red-50 text-red-500 rounded py-2 px-4 font-medium">
                    ✗ Appointment Cancelled
                  </button>
                ) : (
                  <div className="space-y-3">
                    {/* Payment Status - Always shows as paid since we filter only paid appointments */}
                    <button className="border border-green-500 bg-green-500 text-white rounded py-2 px-4 font-medium">
                      ✓ Payment Confirmed
                    </button>

                    {/* Cancel Button - Only show if not completed */}
                    {/* {!item.isCompleted && (
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this appointment?')) {
                            cancelAppointment(item._id);
                          }
                        }}
                        disabled={loading}
                        className="border border-red-400 text-red-600 rounded py-2 px-4 hover:bg-red-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                      >
                        Cancel Appointment
                      </button>
                    )} */}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Refresh Button */}
      {appointments.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={getUserAppointments}
            disabled={loading}
            className="text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Refreshing...' : 'Refresh Appointments'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;