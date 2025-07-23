import express from 'express';
import { 
  createDevice, 
  getDevices, 
  getDevice, 
  updateDevice, 
  deleteDevice 
} from '../controllers/deviceController.js';
import { verifyToken } from '../middleware/auth.js';
import { uploadDeviceImage } from '../config/cloudinary.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Routes
router.route('/')
  .post(uploadDeviceImage.single('image'), createDevice)
  .get(getDevices);

router.route('/:id')
  .get(getDevice)
  .put(uploadDeviceImage.single('image'), updateDevice)
  .delete(deleteDevice);

export default router;