import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({

  name: {type: String, required: true, unique:true},


  speciality: {type: String, required: true},
  image: { 
    type: String, 
    default: "" 
  },

  about: {type: String, required: true},
  available: {type: Boolean, required: true},
  fees: {type: Number, required: true},

  date: {type: Number, required: true},
  slots_booked: {type:Object, default: {} } 
}, {minimize: false})

const doctorModel = mongoose.models.doctor || mongoose.model('doctor', doctorSchema)

export default doctorModel