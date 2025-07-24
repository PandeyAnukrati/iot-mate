import Device from '../models/Device.js';
import House from '../models/House.js';
import cloudinary, { deleteImage } from '../config/cloudinary.js';

// Create a new device
export const createDevice = async (req, res, next) => {
  try {
    const { name, type, room, house, settings } = req.body;
    
    console.log('🔧 Creating device with data:', {
      name,
      type,
      room,
      house,
      settings,
      hasImage: !!req.file,
      userUid: req.user?.uid
    });
    
    // Check if house exists
    const houseExists = await House.findById(house);
    if (!houseExists) {
      return res.status(404).json({
        success: false,
        message: 'House not found'
      });
    }
    
    // Add room to house if it doesn't exist
    if (!houseExists.rooms.includes(room)) {
      houseExists.rooms.push(room);
      await houseExists.save();
    }
    
    // Create device with image if uploaded
    const deviceData = {
      name,
      type,
      room,
      house,
      settings: settings ? JSON.parse(settings) : {},
      createdBy: req.user.uid
    };
    
    // If image was uploaded, add image data
    if (req.file) {
      deviceData.image = {
        public_id: req.file.filename,
        url: req.file.path
      };
    }
    
    const device = await Device.create(deviceData);
    
    console.log('✅ Device created successfully:', device._id);
    
    res.status(201).json({
      success: true,
      message: 'Device created successfully',
      data: device
    });
  } catch (error) {
    console.error('❌ Device creation failed:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: validationErrors,
        details: error.errors
      });
    }
    
    next(error);
  }
};

// Get all devices for a user
export const getDevices = async (req, res, next) => {
  try {
    const { house } = req.query;
    
    const query = { createdBy: req.user.uid };
    
    // Filter by house if provided
    if (house) {
      query.house = house;
    }
    
    const devices = await Device.find(query)
      .populate('house', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: devices.length,
      data: devices
    });
  } catch (error) {
    next(error);
  }
};

// Get a single device
export const getDevice = async (req, res, next) => {
  try {
    const device = await Device.findById(req.params.id)
      .populate('house', 'name address');
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }
    
    // Check if user owns the device
    if (device.createdBy !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this device'
      });
    }
    
    res.status(200).json({
      success: true,
      data: device
    });
  } catch (error) {
    next(error);
  }
};

// Update a device
export const updateDevice = async (req, res, next) => {
  try {
    const { name, type, room, status, settings } = req.body;
    
    // Find device
    let device = await Device.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }
    
    // Check if user owns the device
    if (device.createdBy !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this device'
      });
    }
    
    // Update device data
    const updateData = {
      name: name || device.name,
      type: type || device.type,
      room: room || device.room,
      status: status || device.status,
      settings: settings ? JSON.parse(settings) : device.settings
    };
    
    // If new room, add to house
    if (room && room !== device.room) {
      const house = await House.findById(device.house);
      if (house && !house.rooms.includes(room)) {
        house.rooms.push(room);
        await house.save();
      }
    }
    
    // If image was uploaded, update image
    if (req.file) {
      // Delete old image if exists
      if (device.image && device.image.public_id) {
        await deleteImage(device.image.public_id);
      }
      
      updateData.image = {
        public_id: req.file.filename,
        url: req.file.path
      };
    }
    
    // Update device
    device = await Device.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Device updated successfully',
      data: device
    });
  } catch (error) {
    next(error);
  }
};

// Delete a device
export const deleteDevice = async (req, res, next) => {
  try {
    const device = await Device.findById(req.params.id);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }
    
    // Check if user owns the device
    if (device.createdBy !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this device'
      });
    }
    
    // Delete image from Cloudinary if exists
    if (device.image && device.image.public_id) {
      await deleteImage(device.image.public_id);
    }
    
    // Delete device
    await device.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};