import express from "express";
import {
  addDoctor,
  adminDashboard,
  allDoctors,
  deleteDoctor, // Import the new delete function
  appointmentCancel,
  loginAdmin,
  appointmentsAdmin
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import { authAdmin } from "../middlewares/authAdmin.js";
import { changeAvailability } from "../controllers/doctorController.js";

const adminRouter = express.Router();

// Doctor management routes
adminRouter.post("/add-doctor", authAdmin, upload.single('image'), addDoctor);
adminRouter.post("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/delete-doctor", authAdmin, deleteDoctor); // New delete route
adminRouter.post("/change-availability", authAdmin, changeAvailability);

// Authentication
adminRouter.post("/login", loginAdmin);

// Appointments management
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/appointment-cancel", authAdmin, appointmentCancel);

// Dashboard
adminRouter.get("/dashboard", authAdmin, adminDashboard);

export default adminRouter;