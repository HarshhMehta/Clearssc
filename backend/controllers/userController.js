import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Stripe from 'stripe';
import userModel from "../models/userModels.js";
import doctorModel from "../models/doctorModels.js";
import appointmentModel from "../models/appointmentModel.js";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    if (!validator.isMobilePhone(phone, 'any', { strictMode: false })) {
      return res.json({ success: false, message: "Enter a valid phone number" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Enter a strong password" });
    }

    const existingUser = await userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists. Please login" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };

    res.json({ success: true, token, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// GET PROFILE
const getProfile = async (req, res) => {
  try {
    const userData = await userModel.findById(req.userId).select("-password");
    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, dob, gender, phone, address } = req.body;

    if (!name || !dob || !gender || !phone) {
      return res.json({ success: false, message: "Data missing" });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    const updatedUser = await userModel.findById(userId);
    res.json({ success: true, message: "Profile Updated", userData: updatedUser });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// BOOK APPOINTMENT
const bookAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { docId, slotTime, slotDate, message, mriFormData } = req.body; // Ensure mriFormData is passed from frontend

    // Step 1: Check if MRI form data exists
    if (!mriFormData || !mriFormData.surname || !mriFormData.firstName || !mriFormData.dob || !mriFormData.healthCardNumber || !mriFormData.clinicalInformation) {
      return res.json({ success: false, message: 'Please fill out all the required MRI form fields.' });
    }

    // Step 2: Find the doctor
    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData) {
      return res.json({ success: false, message: "Service not available" });
    }

    // Step 3: Check if slot is available
    let slots_booked = docData.slots_booked || {};
    if (slots_booked[slotDate]?.includes(slotTime)) {
      return res.json({ success: false, message: "Slot not available" });
    }

    slots_booked[slotDate] = slots_booked[slotDate] || [];
    slots_booked[slotDate].push(slotTime);

    // Step 4: Get user data
    const userData = await userModel.findById(userId).select("-password");
    const docInfo = docData.toObject();
    delete docInfo.slots_booked;

    // Step 5: Create a new appointment and save it
    const newAppointment = new appointmentModel({
      userId,
      docId,
      slotTime,
      slotDate,
      userData,
      docData: docInfo,
      mriFormData,  // Save MRI form data here
      date: Date.now(),
      amount: docData.fees,
      message: message || "",
      payment: false, // Initially false, will be updated when payment is successful
    });

    // Save the new appointment
    await newAppointment.save();

    // Update the doctor's slots
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    // Step 6: Return success response
    res.json({ success: true, message: "Appointment Booked", appointmentId: newAppointment._id });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// LIST USER APPOINTMENTS
const listAppointments = async (req, res) => {
  try {
    const userId = req.userId;
    const appointments = await appointmentModel.find({ userId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// CANCEL APPOINTMENT
const cancelAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (appointment.userId.toString() !== userId.toString()) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    if (appointment.cancelled) {
      return res.json({ success: false, message: "Appointment already cancelled" });
    }

    // If appointment was paid, create a refund
    if (appointment.payment && appointment.stripePaymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: appointment.stripePaymentIntentId,
          reason: 'requested_by_customer'
        });
        console.log(`Refund created for appointment ${appointmentId}`);
      } catch (refundError) {
        console.error('Refund error:', refundError);
        // Continue with cancellation even if refund fails
      }
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { 
      cancelled: true,
      cancelledAt: new Date()
    });

    const { docId, slotDate, slotTime } = appointment;
    const doctor = await doctorModel.findById(docId);
    const slots_booked = doctor.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter((e) => e !== slotTime);
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment cancelled successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// CREATE STRIPE CHECKOUT SESSION
const createStripeSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { appointmentId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (appointment.userId.toString() !== userId.toString()) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    if (appointment.payment) {
      return res.json({ success: false, message: "Appointment already paid" });
    }

    if (appointment.cancelled) {
      return res.json({ success: false, message: "Cannot pay for cancelled appointment" });
    }

    const rawFrontendUrl = process.env.FRONTEND_URL;
    const cleanedFrontendUrl = rawFrontendUrl.replace(/\/+$/, '');
    const baseUrl = cleanedFrontendUrl.startsWith('http') ? cleanedFrontendUrl : `http://${cleanedFrontendUrl}`;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Appointment For ${appointment.docData.name}`,
              description: `Appointment Date: ${appointment.slotDate}, Time: ${appointment.slotTime}`,
              images: appointment.docData.image ? [appointment.docData.image] : [],
            },
            unit_amount: Math.round(appointment.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/payment-success?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/my-appointments?cancelled=true`,
      metadata: {
        appointmentId: appointmentId.toString(),
        userId: userId.toString(),
        doctorName: appointment.docData.name,
        appointmentDate: appointment.slotDate,
        appointmentTime: appointment.slotTime,
      },
      customer_email: appointment.userData.email,
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true,
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes from now
    });

    // Store the session ID in the appointment for reference
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      stripeSessionId: session.id,
      paymentInitiatedAt: new Date()
    });

    res.json({ 
      success: true, 
      sessionId: session.id,
      sessionUrl: session.url 
    });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.json({ success: false, message: `Payment session failed: ${error.message}` });
  }
};

// VERIFY STRIPE PAYMENT (called from frontend after successful payment)
const verifyStripePayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.userId;

    if (!sessionId) {
      return res.json({ success: false, message: "Session ID is required" });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return res.json({ success: false, message: "Invalid session" });
    }

    // Verify the session belongs to the user
    if (session.metadata.userId !== userId.toString()) {
      return res.json({ success: false, message: "Unauthorized payment verification" });
    }

    const appointmentId = session.metadata.appointmentId;

    if (session.payment_status === 'paid') {
      // Retrieve payment intent to get more details
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);

      // Update appointment with payment details
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        payment: true,
        stripeSessionId: sessionId,
        stripePaymentIntentId: paymentIntent.id,
        paymentCompletedAt: new Date(),
        paymentAmount: paymentIntent.amount / 100, // Convert from cents
        paymentCurrency: paymentIntent.currency,
        paymentMethod: paymentIntent.payment_method,
      });

      res.json({ 
        success: true, 
        message: "Payment verified and appointment confirmed",
        appointmentId,
        paymentAmount: paymentIntent.amount / 100
      });
    } else {
      res.json({ 
        success: false, 
        message: `Payment not completed. Status: ${session.payment_status}` 
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.json({ success: false, message: `Payment verification failed: ${error.message}` });
  }
};

// STRIPE WEBHOOK HANDLER (for server-side payment confirmation)
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      if (session.payment_status === 'paid') {
        const appointmentId = session.metadata.appointmentId;
        
        try {
          // Retrieve payment intent for additional details
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
          
          await appointmentModel.findByIdAndUpdate(appointmentId, {
            payment: true,
            stripeSessionId: session.id,
            stripePaymentIntentId: paymentIntent.id,
            paymentCompletedAt: new Date(),
            paymentAmount: paymentIntent.amount / 100,
            paymentCurrency: paymentIntent.currency,
            webhookProcessed: true,
          });
          
          console.log(`Payment confirmed via webhook for appointment ${appointmentId}`);
        } catch (error) {
          console.error('Error updating appointment payment status via webhook:', error);
        }
      }
      break;

    case 'payment_intent.succeeded':
      console.log('Payment succeeded:', event.data.object.id);
      break;

    case 'payment_intent.payment_failed':
      console.log('Payment failed:', event.data.object.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// GET PAYMENT STATUS (helper function)
const getPaymentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.userId;

    const appointment = await appointmentModel.findById(appointmentId);
    
    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (appointment.userId.toString() !== userId.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    res.json({
      success: true,
      payment: appointment.payment,
      paymentAmount: appointment.paymentAmount,
      paymentCompletedAt: appointment.paymentCompletedAt,
      stripeSessionId: appointment.stripeSessionId
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.json({ success: false, message: error.message });
  }
};

export {
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
};