import React, { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../Context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { backendUrl, token } = useContext(AppContext);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      const appointmentId = searchParams.get('appointmentId');

      if (sessionId) {
        try {
          const { data } = await axios.post(
            backendUrl + '/api/user/verify-stripe-payment',
            { sessionId },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (data.success) {
            toast.success('Payment successful!');
            setTimeout(() => {
              navigate('/my-appointments');
            }, 2000);
          } else {
            toast.error('Payment verification failed');
            navigate('/my-appointments');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          toast.error('Payment verification failed');
          navigate('/my-appointments');
        }
      } else {
        navigate('/my-appointments');
      }
    };

    verifyPayment();
  }, [searchParams, navigate, backendUrl, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h2>
        
        <p className="text-gray-600 mb-6">
          Your appointment payment has been processed successfully. 
          You will be redirected to your appointments page shortly.
        </p>
        
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;