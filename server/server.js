import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import deviceRoutes from './routes/deviceRoutes.js';
import houseRoutes from './routes/houseRoutes.js';
import errorHandler from './middleware/errorHandler.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('📁 Serving static files from:', path.join(__dirname, 'uploads'));

// Routes
app.use('/api/devices', deviceRoutes);
app.use('/api/houses', houseRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date()
  });
});

// Toast notification test route
app.get('/api/test-notification', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'This is a test notification',
    type: req.query.type || 'success',
    data: {
      title: 'Notification Test',
      description: 'This is a test notification from the server',
      timestamp: new Date()
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server without waiting for MongoDB
console.log('⚠️ Starting server without MongoDB connection for development');
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));

// Attempt MongoDB connection in the background
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/iot-platform')
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    console.log('⚠️ Server running without database connection. Some features may not work.');
  });
