import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctorRoute.js'
import userRouter from './routes/userRoute.js'

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// app config
const app = express()  // Create an Express app instance
const port = process.env.PORT || 5001 // Define the port number

// Connect to the database and cloud storage
connectDB() // Establish MongoDB connection
connectCloudinary() // Connect to Cloudinary for media storage

// middlewares
app.use(express.json())

// CORS - Allow requests from your frontend
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5173'], // Add your frontend URLs
  credentials: true
}))

// IMPORTANT: Serve static files from uploads directory
// This must come BEFORE your API routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Debug: Check uploads directory
const uploadsPath = path.join(__dirname, 'uploads')
console.log('Uploads directory path:', uploadsPath)
console.log('Uploads directory exists:', fs.existsSync(uploadsPath))

if (fs.existsSync(uploadsPath)) {
  try {
    const files = fs.readdirSync(uploadsPath)
    console.log('Files in uploads directory:', files.slice(0, 5)) // Show first 5 files
    console.log(`Total files: ${files.length}`)
  } catch (error) {
    console.log('Error reading uploads directory:', error)
  }
} else {
  console.log('⚠️  Uploads directory does not exist! Creating it...')
  try {
    fs.mkdirSync(uploadsPath, { recursive: true })
    console.log('✅ Uploads directory created successfully')
  } catch (error) {
    console.log('❌ Failed to create uploads directory:', error)
  }
}

// Test endpoint to check static file serving
app.get('/test-static', (req, res) => {
  let filesList = []
  
  try {
    if (fs.existsSync(uploadsPath)) {
      filesList = fs.readdirSync(uploadsPath)
    }
  } catch (error) {
    console.log('Error reading files:', error)
  }

  res.json({
    message: 'Static file test endpoint',
    uploadsPath: uploadsPath,
    uploadsExists: fs.existsSync(uploadsPath),
    totalFiles: filesList.length,
    sampleFiles: filesList.slice(0, 5),
    testUrls: filesList.slice(0, 3).map(file => 
      `${req.protocol}://${req.get('host')}/uploads/${file}`
    )
  })
})

// Direct file access endpoint (fallback)
app.get('/file/:filename', (req, res) => {
  const filename = req.params.filename
  const filePath = path.join(__dirname, 'uploads', filename)
  
  console.log('Direct file request for:', filename)
  console.log('File exists:', fs.existsSync(filePath))
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath)
  } else {
    res.status(404).json({ 
      error: 'File not found', 
      requestedFile: filename,
      searchPath: filePath 
    })
  }
})

// api endpoints
app.use('/api/admin', adminRouter)
app.use('/api/doctor', doctorRouter)
app.use('/api/user', userRouter)

// Simple GET route to check if the API is working
app.get('/', (req, res) => {
  res.send("API is working great... hurray:)") // Sends a message when accessing the root endpoint
})

// Start the server and listen for requests
app.listen(port, () => {
  console.log("🚀 Server started on port", port)
  console.log(`📁 Static files available at: http://localhost:${port}/uploads/`)
  console.log(`🔧 Test endpoint: http://localhost:${port}/test-static`)
})