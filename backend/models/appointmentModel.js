import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  docId: { type: String, required: true },
  slotTime: { type: String, required: true },
  slotDate: { type: String, required: true },
  userData: { type: Object, required: true },
  docData: { type: Object, required: true },
  amount: { type: Number, required: true },
  selectedDoctors: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
      },
      name: String,
      fees: Number,
      speciality: String, // Added for multiple doctor support
      image: String, // Added for multiple doctor support
      isPrimary: { 
        type: Boolean, 
        default: false 
      } // Added to identify primary doctor
    }
  ],
  date: { type: Number, required: true },
  message: { type: String, required: false },
  cancelled: { type: Boolean, default: false },
  payment: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  
  // Added fields for multiple doctor support
  totalFees: {
    type: Number,
    default: function() {
      return this.amount || 0;
    }
  },
  
  isMultiDoctorAppointment: {
    type: Boolean,
    default: function() {
      return this.selectedDoctors && this.selectedDoctors.length > 1;
    }
  },

  // Enhanced MRI form data structure - updated to match the form
  hasMRIReferral: { type: Boolean, default: false },
  
  mriFormData: {
    // Patient Information - matches form fields exactly
    surname: String,
    firstName: String,
    street: String,
    aptNumber: String,
    city: String,
    postalCode: String,
    phoneHome: String,
    phoneWork: String,
    dob: String, // Changed from Date to String to match form input
    age: Number,
    sex: String, // M or F
    gender: String, // Alternative field for backward compatibility
    healthCardNumber: String,
    patientWeight: String, // Weight in Kgs
    maritalStatus: String,
    
    // Contact Information - keeping alternatives for backward compatibility
    address: String, // Alternative to street
    unit: String, // Alternative to aptNumber
    province: String,
    state: String, // Alternative to province
    zipCode: String, // Alternative to postalCode
    country: String,
    phoneMobile: String,
    mobilePhone: String, // Alternative field name
    cellPhone: String, // Alternative field name
    email: String,
    emergencyContactName: String,
    emergencyContactPhone: String,
    
    // WSIB Information - matches form structure
    isWsibClaim: String, // "YES" or "NO" to match form radio buttons
    claimNumber: String,
    
    // Priority - matches form checkbox structure
    priority: String, // Single selection from form checkboxes
    
    // Medical Information - matches form fields
    areaToBeExamined: String, // Textarea field from form
    bodyPart: String, // Alternative field name
    examAreaSelections: String, // Alternative field name
    examinationType: String,
    mriType: String, // Alternative field name
    contrastRequired: Boolean,
    withContrast: Boolean, // Alternative field name
    sedationRequired: Boolean,
    allergies: String,
    clinicalInformation: String, // Textarea field from form
    symptoms: String, // Alternative field name
    clinicalHistory: String, // Alternative field name
    workingDiagnosis: String, // Single line field from form
    diagnosis: String, // Alternative field name
    clinicalDiagnosis: String, // Alternative field name
    provisionalDiagnosis: String, // Keep for backward compatibility
    surgicalHistory: String, // Textarea field from form
    pastSurgeries: String, // Alternative field name
    currentMedications: String,
    medications: String, // Alternative field name
    medicalHistory: String,
    pastMedicalHistory: String, // Alternative field name
    
    // Examination Areas - matches form structure exactly
    examAreaSelections: {
      head: { type: Boolean, default: false },
      neck: { type: Boolean, default: false },
      spine: { type: Boolean, default: false },
      chest: { type: Boolean, default: false },
      abdomen: { type: Boolean, default: false },
      pelvis: Boolean, // Not in current form but keeping for compatibility
      upperExtremity: Boolean, // Not in current form but keeping for compatibility
      lowerExtremity: Boolean, // Not in current form but keeping for compatibility
      extremity: { type: Boolean, default: false }, // From current form
    },
    
    // Safety Screening Questions - matches form structure exactly
    screeningQuestions: {
      previousMri: { type: String, enum: ['YES', 'NO', 'unknown'] },
      metalGrinder: { type: String, enum: ['YES', 'NO', 'unknown'] },
      eyeInjury: { type: String, enum: ['YES', 'NO', 'unknown'] },
      pregnancy: { type: String, enum: ['YES', 'NO', 'unknown', 'n/a'] },
      claustrophobic: { type: String, enum: ['YES', 'NO', 'unknown'] },
      cardiacPacemaker: { type: String, enum: ['YES', 'NO', 'unknown'] },
      cochlearImplants: { type: String, enum: ['YES', 'NO', 'unknown'] },
      eyeSurgery: { type: String, enum: ['YES', 'NO', 'unknown'] },
      cerebralAneurysm: { type: String, enum: ['YES', 'NO', 'unknown'] },
      heartValve: { type: String, enum: ['YES', 'NO', 'unknown'] },
      shrapnel: { type: String, enum: ['YES', 'NO', 'unknown'] },
      jointReplacement: { type: String, enum: ['YES', 'NO', 'unknown'] },
      intravascular: { type: String, enum: ['YES', 'NO', 'unknown'] },
      surgicalClips: { type: String, enum: ['YES', 'NO', 'unknown'] },
      tissueExpander: { type: String, enum: ['YES', 'NO', 'unknown'] },
      implantedDevices: { type: String, enum: ['YES', 'NO', 'unknown'] },
      vascularAccess: { type: String, enum: ['YES', 'NO', 'unknown'] },
      iudDiaphragm: { type: String, enum: ['YES', 'NO', 'unknown', 'n/a'] },
      painPump: { type: String, enum: ['YES', 'NO', 'unknown'] },
      medicationPatch: { type: String, enum: ['YES', 'NO', 'unknown'] },
      penileProsthesis: { type: String, enum: ['YES', 'NO', 'unknown', 'n/a'] },
      hearingAid: { type: String, enum: ['YES', 'NO', 'unknown'] },
      piercings: { type: String, enum: ['YES', 'NO', 'unknown'] },
      tattoo: { type: String, enum: ['YES', 'NO', 'unknown'] },
      dentures: { type: String, enum: ['YES', 'NO', 'unknown'] }
    },
    
    // Referring Physician Information - matches form fields
    referringPhysicianName: String,
    doctorName: String, // Alternative field name
    refDoctorName: String, // Keep for backward compatibility
    referringPhysicianSpecialty: String,
    specialty: String, // Alternative field name
    referringPhysicianLicense: String,
    licenseNumber: String, // Alternative field name
    referringClinicName: String,
    hospitalName: String, // Keep for backward compatibility
    referringPhysicianAddress: String, // From form
    clinicAddress: String, // Alternative field name
    referringPhysicianCity: String,
    referringPhysicianPostalCode: String, // From form
    referringPhysicianPhone: String, // From form
    referringPhysicianFax: String, // From form
    referringPhysicianEmail: String,
    referralDate: Date,
    physicianSignature: Boolean,
    
    // Previous Imaging - matches form fields exactly
    mri: String, // From form
    ctAngio: String, // From form (CT/ANGIO)
    xray: String, // From form (X-RAY)
    us: String, // From form (US - Ultrasound)
    
    // Form-specific fields
    redirectTo: String, // From form checkboxes: "THC", "HHS Oakville", "Any if waitlist is shorter"
    patientSignature: String, // From form
    technologist: String, // From form
    copiesTo: String, // From form
    
    // Additional Information - keeping for backward compatibility
    scanRequired: String, // Keep for backward compatibility
    contrast: String, // Keep for backward compatibility
    
    // Form metadata
    formVersion: { type: String, default: '2.0' }, // Updated version
    submissionDate: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now }
  },

  // New field for MRI form PDF
  mriFormPdf: { type: String, default: null }, // URL to stored PDF
  
  // Stripe specific fields
  stripeSessionId: { type: String, default: null },
  paymentIntentId: { type: String, default: null },
  paymentMethod: { type: String, default: 'stripe' }, // 'stripe' or other payment methods
}, {
  timestamps: true // This will add createdAt and updatedAt fields automatically
});

// Index for better query performance
appointmentSchema.index({ userId: 1, docId: 1, slotDate: 1 });
appointmentSchema.index({ hasMRIReferral: 1 });
appointmentSchema.index({ 'mriFormData.submissionDate': -1 });
appointmentSchema.index({ 'mriFormData.priority': 1 });
appointmentSchema.index({ 'mriFormData.isWsibClaim': 1 });
// Added indexes for multiple doctor support
appointmentSchema.index({ 'selectedDoctors._id': 1 });
appointmentSchema.index({ isMultiDoctorAppointment: 1 });

// Pre-save middleware to update lastModified date
appointmentSchema.pre('save', function(next) {
  // Existing MRI form logic
  if (this.isModified('mriFormData')) {
    this.mriFormData.lastModified = new Date();
  }
  
  // Added logic for multiple doctors
  if (this.isModified('selectedDoctors')) {
    this.totalFees = this.calculateTotalFees();
    this.isMultiDoctorAppointment = this.selectedDoctors && this.selectedDoctors.length > 1;
    
    // Ensure at least one doctor is marked as primary
    if (this.selectedDoctors && this.selectedDoctors.length > 0) {
      const hasPrimary = this.selectedDoctors.some(doc => doc.isPrimary);
      if (!hasPrimary) {
        this.selectedDoctors[0].isPrimary = true;
      }
    }
  }
  
  next();
});

// Virtual for full name
appointmentSchema.virtual('mriFormData.fullName').get(function() {
  if (this.mriFormData && this.mriFormData.firstName && this.mriFormData.surname) {
    return `${this.mriFormData.firstName} ${this.mriFormData.surname}`;
  }
  return null;
});

// Method to check if form is complete
appointmentSchema.methods.isMriFormComplete = function() {
  const required = [
    'surname', 'firstName', 'dob', 'sex', 'healthCardNumber',
    'areaToBeExamined', 'clinicalInformation', 'workingDiagnosis'
  ];
  
  return required.every(field => 
    this.mriFormData && this.mriFormData[field] && this.mriFormData[field].toString().trim() !== ''
  );
};

// Method to get priority level for scheduling
appointmentSchema.methods.getPriorityLevel = function() {
  if (!this.mriFormData || !this.mriFormData.priority) return 5; // Default lowest priority
  
  const priorityMap = {
    'URGENT (WITHIN 1 WK)': 1,
    'SEMI-URGENT (2-8 WKS)': 2,
    'INPATIENT': 3,
    'ELECTIVE': 4,
    'NON-RES': 5,
    'DIALYSIS PATIENT': 2 // High priority
  };
  
  return priorityMap[this.mriFormData.priority] || 5;
};

// Added methods for multiple doctor support
appointmentSchema.methods.calculateTotalFees = function() {
  if (this.selectedDoctors && this.selectedDoctors.length > 0) {
    return this.selectedDoctors.reduce((total, doctor) => {
      return total + (doctor.fees || 0);
    }, 0);
  }
  return this.amount || 0;
};

// Method to get primary doctor
appointmentSchema.methods.getPrimaryDoctor = function() {
  if (this.selectedDoctors && this.selectedDoctors.length > 0) {
    const primary = this.selectedDoctors.find(doc => doc.isPrimary);
    return primary || this.selectedDoctors[0];
  }
  return null;
};

// Method to check if appointment has multiple doctors
appointmentSchema.methods.hasMultipleDoctors = function() {
  return this.selectedDoctors && this.selectedDoctors.length > 1;
};

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment', appointmentSchema);

export default appointmentModel;