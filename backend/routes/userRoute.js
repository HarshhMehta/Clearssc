import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getProfile, 
  updateProfile, 
  bookAppointment, 
  listAppointments, 
  cancelAppointment,
  createStripeSession,
  verifyStripePayment,
  stripeWebhook,
  getPaymentStatus,
} from '../controllers/userController.js';
import { authUser } from '../middlewares/authUser.js';

const userRouter = express.Router();

// Public routes
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

// Protected routes - require authentication
userRouter.get('/get-profile', authUser, getProfile);
userRouter.post('/update-profile', authUser, updateProfile);
userRouter.post('/book-appointment', authUser, bookAppointment);
userRouter.get('/appointments', authUser, listAppointments);
userRouter.post('/cancel-appointment', authUser, cancelAppointment);

// Stripe payment routes
userRouter.post('/create-stripe-session', authUser, createStripeSession);
userRouter.post('/verify-stripe-payment', authUser, verifyStripePayment);
userRouter.get('/payment-status/:appointmentId', authUser, getPaymentStatus);

// Stripe webhook route (no auth middleware)
userRouter.post('/stripe-webhook', express.raw({ type: 'application/json' }), stripeWebhook);

export default userRouter;