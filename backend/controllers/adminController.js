import jwt from "jsonwebtoken";
import doctorModel from "../models/doctorModels.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModels.js";
import upload from "../middlewares/multer.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

// API for adding doctor with image upload
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      speciality,
      fees,
      about,
    } = req.body;

    console.log("Received data:", req.body); // Debug log
    console.log("Received file:", req.file); // Debug log for file

    // checking for all the required data fields to add the doctor
    if (!name || !speciality || !fees) {
      // If there's an uploaded file but validation fails, delete it
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      }
      
      return res.json({
        success: false,
        message: "Missing required fields. Please fill all fields (name, speciality, fees).",
      });
    }

    // Prepare doctor data
    const doctorData = {
      name: String(name).trim(),
      date: Date.now(),
      speciality: String(speciality).trim(),
      fees: Number(fees) || 0,
      about: String(about || '').trim(),
      available: true,
      slots_booked: {}, // Initialize empty slots
    };

    // Add image path if file was uploaded
    if (req.file) {
      doctorData.image = req.file.filename; // Store the file path
    }

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    res.json({ success: true, message: "Doctor added successfully" });
  } catch (error) {
    console.error("Add Doctor Error:", error);
    
    // If there's an error and a file was uploaded, delete it
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }
    
    res.json({ success: false, message: error.message || "Failed to add doctor" });
  }
};

// API for admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("Login attempt:", { email });

    const isEnvAdmin =
      email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD;

    if (isEnvAdmin) {
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET not found in environment variables");
        return res.json({ 
          success: false, 
          message: "Server configuration error - JWT_SECRET missing" 
        });
      }

      const token = jwt.sign(
        { 
          email: email,
          role: "admin" 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7h' }
      );

      console.log("Token generated successfully");

      return res.json({ 
        success: true, 
        message: "Login successful",
        token: token
      });
      
    } else {
      console.log("Invalid credentials provided");
      return res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.error("Login Admin Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to delete doctor - Enhanced for multiple doctor appointments
const deleteDoctor = async (req, res) => {
  try {
    const { docId } = req.body;

    console.log("Delete service request for ID:", docId);

    // Validate docId
    if (!docId) {
      return res.json({
        success: false,
        message: "service ID is required",
      });
    }

    // Check if doctor exists
    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      return res.json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Check for existing appointments with this doctor - Updated for multiple doctor support
    const existingAppointments = await appointmentModel.find({ 
      $or: [
        { docId: docId }, // Primary doctor appointments
        { 'selectedDoctors._id': new mongoose.Types.ObjectId(docId) } // Multiple doctor appointments
      ],
      cancelled: { $ne: true } // Not cancelled appointments
    });

    if (existingAppointments.length > 0) {
      // Option 1: Prevent deletion if there are active appointments
      return res.json({
        success: false,
        message: `Cannot delete service. There are ${existingAppointments.length} active appointment(s) scheduled.`,
      });
    }

    // Delete associated image file if it exists
    if (doctor.image) {
      fs.unlink(doctor.image, (err) => {
        if (err) {
          console.error("Error deleting image file:", err);
        } else {
          console.log("Image file deleted successfully");
        }
      });
    }

    // Delete the doctor
    await doctorModel.findByIdAndDelete(docId);

    console.log("Doctor deleted successfully:", doctor.name);

    res.json({ 
      success: true, 
      message: `Service. ${doctor.name} has been deleted successfully` 
    });

  } catch (error) {
    console.error("Delete service Error:", error);
    res.json({ 
      success: false, 
      message: error.message || "Failed to delete service" 
    });
  }
};

// API to get all appointments list - Enhanced with multiple doctor support
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({})
      .populate('selectedDoctors._id', 'name speciality fees image') // Populate selected doctors
      .populate('userId', 'name email') // Populate user data
      .sort({ date: -1 }); // Sort by newest first

    // Enhanced appointment data with multiple doctor info
    const enhancedAppointments = appointments.map(appointment => {
      const appointmentObj = appointment.toObject();
      
      // Add calculated fields
      appointmentObj.totalFees = appointment.calculateTotalFees();
      appointmentObj.isMultiDoctorAppointment = appointment.hasMultipleDoctors();
      appointmentObj.primaryDoctor = appointment.getPrimaryDoctor();
      appointmentObj.priorityLevel = appointment.getPriorityLevel();
      appointmentObj.isMriFormComplete = appointment.isMriFormComplete();
      
      return appointmentObj;
    });

    res.json({ success: true, appointments: enhancedAppointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel the appointment - Enhanced for multiple doctor support
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({
        success: false,
        message: "Appointment not found",
      });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // Release slots for all doctors involved in the appointment
    const { docId, selectedDoctors, slotDate, slotTime } = appointmentData;
    
    // Release primary doctor slot
    if (docId) {
      const doctorData = await doctorModel.findById(docId);
      if (doctorData && doctorData.slots_booked && doctorData.slots_booked[slotDate]) {
        let slots_booked = doctorData.slots_booked;
        slots_booked[slotDate] = slots_booked[slotDate].filter(
          (e) => e !== slotTime
        );
        await doctorModel.findByIdAndUpdate(docId, { slots_booked });
      }
    }

    // Release slots for additional selected doctors
    if (selectedDoctors && selectedDoctors.length > 0) {
      for (const selectedDoctor of selectedDoctors) {
        if (selectedDoctor._id && selectedDoctor._id.toString() !== docId) {
          const doctorData = await doctorModel.findById(selectedDoctor._id);
          if (doctorData && doctorData.slots_booked && doctorData.slots_booked[slotDate]) {
            let slots_booked = doctorData.slots_booked;
            slots_booked[slotDate] = slots_booked[slotDate].filter(
              (e) => e !== slotTime
            );
            await doctorModel.findByIdAndUpdate(selectedDoctor._id, { slots_booked });
          }
        }
      }
    }

    res.json({ success: true, message: "Appointment cancelled successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data for admin panel - Enhanced with multiple doctor analytics
const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});

    // Enhanced analytics
    const multiDoctorAppointments = appointments.filter(apt => 
      apt.selectedDoctors && apt.selectedDoctors.length > 1
    );
    
    const mriAppointments = appointments.filter(apt => apt.hasMRIReferral);
    const completedAppointments = appointments.filter(apt => apt.isCompleted);
    const cancelledAppointments = appointments.filter(apt => apt.cancelled);
    const paidAppointments = appointments.filter(apt => apt.payment);

    // Revenue calculation
    const totalRevenue = appointments
      .filter(apt => apt.payment && !apt.cancelled)
      .reduce((total, apt) => {
        return total + (apt.totalFees || apt.amount || 0);
      }, 0);

    // Priority distribution for MRI appointments
    const priorityDistribution = mriAppointments.reduce((acc, apt) => {
      const priority = apt.mriFormData?.priority || 'ELECTIVE';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      latestAppointments: appointments.reverse().slice(0, 5),
      
      // Enhanced statistics
      multiDoctorAppointments: multiDoctorAppointments.length,
      mriAppointments: mriAppointments.length,
      completedAppointments: completedAppointments.length,
      cancelledAppointments: cancelledAppointments.length,
      paidAppointments: paidAppointments.length,
      totalRevenue,
      priorityDistribution,
      
      // Percentage calculations
      multiDoctorPercentage: appointments.length > 0 
        ? ((multiDoctorAppointments.length / appointments.length) * 100).toFixed(1)
        : 0,
      mriPercentage: appointments.length > 0 
        ? ((mriAppointments.length / appointments.length) * 100).toFixed(1)
        : 0,
      completionRate: appointments.length > 0 
        ? ((completedAppointments.length / appointments.length) * 100).toFixed(1)
        : 0,
      cancellationRate: appointments.length > 0 
        ? ((cancelledAppointments.length / appointments.length) * 100).toFixed(1)
        : 0,
      paymentRate: appointments.length > 0 
        ? ((paidAppointments.length / appointments.length) * 100).toFixed(1)
        : 0
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// New API to get MRI appointments specifically
const getMRIAppointments = async (req, res) => {
  try {
    const { priority, completed, page = 1, limit = 10 } = req.query;
    
    let filter = { hasMRIReferral: true };
    
    if (priority) {
      filter['mriFormData.priority'] = priority;
    }
    
    if (completed !== undefined) {
      filter.isCompleted = completed === 'true';
    }

    const appointments = await appointmentModel
      .find(filter)
      .populate('selectedDoctors._id', 'name speciality')
      .sort({ 'mriFormData.submissionDate': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await appointmentModel.countDocuments(filter);

    res.json({ 
      success: true, 
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// New API to update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId, status, notes } = req.body;
    
    const updateData = {};
    
    if (status === 'completed') {
      updateData.isCompleted = true;
    } else if (status === 'cancelled') {
      updateData.cancelled = true;
    } else if (status === 'paid') {
      updateData.payment = true;
    }
    
    if (notes) {
      updateData.message = notes;
    }

    const appointment = await appointmentModel.findByIdAndUpdate(
      appointmentId, 
      updateData, 
      { new: true }
    );

    if (!appointment) {
      return res.json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.json({ 
      success: true, 
      message: "Appointment status updated successfully",
      appointment 
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  addDoctor,
  loginAdmin,
  allDoctors,
  deleteDoctor,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
  getMRIAppointments,
  updateAppointmentStatus,
};