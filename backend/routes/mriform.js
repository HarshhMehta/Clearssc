// Backend API endpoint for booking appointments with MRI form
// This should be added to your existing appointment booking route

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/mri-referrals/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueName = `mri-referral-${Date.now()}-${Math.round(Math.random() * 1E9)}.pdf`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Modified appointment booking endpoint
router.post('/book-appointment', upload.single('pdfFile'), async (req, res) => {
  try {
    const { docId, slotDate, slotTime, message } = req.body;
    const userId = req.user.id; // Assuming you have user authentication middleware
    
    // Validate required fields
    if (!docId || !slotDate || !slotTime) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    // Create appointment object
    const appointmentData = {
      userId,
      docId,
      slotDate,
      slotTime,
      amount: req.body.amount || 0, // Get from doctor's fees
      date: new Date(),
      cancelled: false,
      payment: 'pending',
      isCompleted: false
    };

    // Add MRI referral data if PDF was uploaded
    if (req.file) {
      appointmentData.mriReferral = {
        hasReferral: true,
        pdfPath: req.file.path,
        pdfOriginalName: req.file.originalname,
        pdfSize: req.file.size,
        uploadDate: new Date(),
        formData: message // Store the form data as well
      };
    }

    // Save appointment to database
    const appointment = new Appointment(appointmentData);
    const savedAppointment = await appointment.save();

    // Update doctor's booked slots
    await Doctor.findByIdAndUpdate(docId, {
      $push: {
        [`slots_booked.${slotDate}`]: slotTime
      }
    });

    res.json({
      success: true,
      message: 'Appointment booked successfully',
      appointmentId: savedAppointment._id,
      hasMriReferral: !!req.file
    });

  } catch (error) {
    console.error('Appointment booking error:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment',
      error: error.message
    });
  }
});

// Admin endpoint to get appointments with MRI referrals
router.get('/admin/appointments-with-referrals', async (req, res) => {
  try {
    const appointments = await Appointment.find({
      'mriReferral.hasReferral': true
    })
    .populate('userId', 'name email phone')
    .populate('docId', 'name speciality')
    .sort({ date: -1 });

    const appointmentsWithReferrals = appointments.map(appointment => ({
      _id: appointment._id,
      patient: appointment.userId,
      doctor: appointment.docId,
      slotDate: appointment.slotDate,
      slotTime: appointment.slotTime,
      bookingDate: appointment.date,
      payment: appointment.payment,
      isCompleted: appointment.isCompleted,
      mriReferral: {
        pdfPath: appointment.mriReferral.pdfPath,
        uploadDate: appointment.mriReferral.uploadDate,
        pdfSize: appointment.mriReferral.pdfSize,
        formData: appointment.mriReferral.formData
      }
    }));

    res.json({
      success: true,
      appointments: appointmentsWithReferrals
    });

  } catch (error) {
    console.error('Error fetching appointments with referrals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
});

// Admin endpoint to download/view MRI referral PDF
router.get('/admin/mri-referral/:appointmentId', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);
    
    if (!appointment || !appointment.mriReferral?.pdfPath) {
      return res.status(404).json({
        success: false,
        message: 'MRI referral not found'
      });
    }

    const pdfPath = appointment.mriReferral.pdfPath;
    
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        success: false,
        message: 'PDF file not found'
      });
    }

    // Set headers for PDF viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="mri-referral-${appointment._id}.pdf"`);
    
    // Send the PDF file
    res.sendFile(path.resolve(pdfPath));

  } catch (error) {
    console.error('Error serving MRI referral PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve PDF',
      error: error.message
    });
  }
});

// Admin endpoint to get MRI referral form data
router.get('/admin/mri-form-data/:appointmentId', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('userId', 'name email phone')
      .populate('docId', 'name speciality');
    
    if (!appointment || !appointment.mriReferral?.formData) {
      return res.status(404).json({
        success: false,
        message: 'MRI form data not found'
      });
    }

    res.json({
      success: true,
      formData: JSON.parse(appointment.mriReferral.formData),
      appointment: {
        id: appointment._id,
        patient: appointment.userId,
        doctor: appointment.docId,
        slotDate: appointment.slotDate,
        slotTime: appointment.slotTime,
        bookingDate: appointment.date
      }
    });

  } catch (error) {
    console.error('Error fetching MRI form data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch form data',
      error: error.message
    });
  }
});

module.exports = router;