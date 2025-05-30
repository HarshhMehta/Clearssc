
import jwt from "jsonwebtoken";
import doctorModel from "../models/doctorModels.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModels.js";

// API for adding doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      speciality,
      fees,
      about,
    } = req.body;

    console.log("Received data:", req.body); // Debug log

    // checking for all the required data fields to add the doctor
    if (!name || !speciality || !fees )  {
      return res.json({
        success: false,
        message: "Missing required fields. Please fill all fields (name, speciality, fees, about).",
      });
    }
    // Prepare doctor data
    const doctorData = {
      name: String(name).trim(),



      date: Date.now(),
      speciality: String(speciality).trim(),


      fees: Number(fees) || 0,
      about: String(about).trim(),
      available: true,
      slots_booked: {}, // Initialize empty slots
    };



    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    res.json({ success: true, message: "Service added successfully" });
  } catch (error) {
    console.error("Add Doctor Error:", error);
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

    

    if (isEnvAdmin ) {
      
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

// API to delete doctor
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

    // Check for existing appointments with this doctor
    const existingAppointments = await appointmentModel.find({ 
      docId: docId,
      cancelled: { $ne: true } // Not cancelled appointments
    });

    if (existingAppointments.length > 0) {
      // Option 1: Prevent deletion if there are active appointments
      return res.json({
        success: false,
        message: `Cannot delete service. There are ${existingAppointments.length} active appointment(s) scheduled.`,
      });

      // Option 2: Cancel all appointments and then delete (uncomment if you prefer this approach)
      /*
      await appointmentModel.updateMany(
        { docId: docId, cancelled: { $ne: true } },
        { cancelled: true }
      );
      console.log(`Cancelled ${existingAppointments.length} appointments before deleting doctor`);
      */
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

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel the appointment
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

    // releasing that doctor slot
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId);

    if (doctorData && doctorData.slots_booked && doctorData.slots_booked[slotDate]) {
      let slots_booked = doctorData.slots_booked;
      slots_booked[slotDate] = slots_booked[slotDate].filter(
        (e) => e !== slotTime
      );

      await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    }

    res.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});

    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };
    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  addDoctor,
  loginAdmin,
  allDoctors,
  deleteDoctor, // Export the new delete function
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
};