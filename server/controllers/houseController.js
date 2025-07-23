import House from '../models/House.js';
import Device from '../models/Device.js';
import { deleteImage } from '../config/cloudinary.js';

// Create a new house
export const createHouse = async (req, res, next) => {
  try {
    const { name, caretakerName, phone, address, latitude, longitude } = req.body;
    
    // Create house with image if uploaded
    const houseData = {
      name,
      caretakerName,
      phone,
      address,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      floors: [
        {
          name: 'Ground Floor',
          rooms: [
            { name: 'Living Room', devices: [] },
            { name: 'Kitchen', devices: [] },
            { name: 'Bathroom', devices: [] }
          ]
        }
      ], // Default floor structure
      rooms: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom'], // Keep for backward compatibility
      createdBy: req.user.uid
    };
    
    // If image was uploaded, add image data
    if (req.file) {
      // When using Cloudinary, the path will be the secure_url
      const url = req.file.path;
      
      houseData.image = {
        public_id: req.file.filename,
        url: url
      };
      
      console.log('📸 Image data:', houseData.image);
    }
    
    const house = await House.create(houseData);
    
    res.status(201).json({
      success: true,
      message: 'House created successfully',
      data: house
    });
  } catch (error) {
    next(error);
  }
};

// Get all houses for a user
export const getHouses = async (req, res, next) => {
  try {
    const houses = await House.find({ createdBy: req.user.uid })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: houses.length,
      data: houses
    });
  } catch (error) {
    next(error);
  }
};

// Get a single house with its devices
export const getHouse = async (req, res, next) => {
  try {
    const house = await House.findById(req.params.id);
    
    if (!house) {
      return res.status(404).json({
        success: false,
        message: 'House not found'
      });
    }
    
    // Check if user owns the house
    if (house.createdBy !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this house'
      });
    }
    
    // Get devices for this house
    const devices = await Device.find({ house: req.params.id });
    
    res.status(200).json({
      success: true,
      data: {
        house,
        devices
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update a house
export const updateHouse = async (req, res, next) => {
  try {
    const { name, caretakerName, phone, address, latitude, longitude, rooms } = req.body;
    
    // Find house
    let house = await House.findById(req.params.id);
    
    if (!house) {
      return res.status(404).json({
        success: false,
        message: 'House not found'
      });
    }
    
    // Check if user owns the house
    if (house.createdBy !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this house'
      });
    }
    
    // Update house data
    const updateData = {
      name: name || house.name,
      caretakerName: caretakerName || house.caretakerName,
      phone: phone || house.phone,
      address: address || house.address,
      rooms: rooms ? JSON.parse(rooms) : house.rooms
    };
    
    // Update location if provided
    if (latitude && longitude) {
      updateData.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }
    
    // If image was uploaded, update image
    if (req.file) {
      // Delete old image if exists
      if (house.image && house.image.public_id) {
        await deleteImage(house.image.public_id);
      }
      
      // When using Cloudinary, the path will be the secure_url
      const url = req.file.path;
      
      updateData.image = {
        public_id: req.file.filename,
        url: url
      };
      
      console.log('📸 Updated image data:', updateData.image);
    }
    
    // Update house
    house = await House.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'House updated successfully',
      data: house
    });
  } catch (error) {
    next(error);
  }
};

// Delete a house
export const deleteHouse = async (req, res, next) => {
  try {
    const house = await House.findById(req.params.id);
    
    if (!house) {
      return res.status(404).json({
        success: false,
        message: 'House not found'
      });
    }
    
    // Check if user owns the house
    if (house.createdBy !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this house'
      });
    }
    
    // Get all devices associated with this house
    const devices = await Device.find({ house: req.params.id });
    
    // Delete all device images from Cloudinary if they exist
    for (const device of devices) {
      if (device.image && device.image.public_id) {
        try {
          await deleteImage(device.image.public_id);
          console.log(`🗑️ Deleted device image: ${device.image.public_id}`);
        } catch (error) {
          console.error(`Failed to delete device image ${device.image.public_id}:`, error);
        }
      }
    }
    
    // Delete all devices associated with this house
    const deletedDevicesCount = await Device.deleteMany({ house: req.params.id });
    console.log(`🗑️ Deleted ${deletedDevicesCount.deletedCount} devices from house ${house.name}`);
    
    // Delete house image from Cloudinary if exists
    if (house.image && house.image.public_id) {
      try {
        await deleteImage(house.image.public_id);
        console.log(`🗑️ Deleted house image: ${house.image.public_id}`);
      } catch (error) {
        console.error(`Failed to delete house image ${house.image.public_id}:`, error);
      }
    }
    
    // Delete house
    await house.deleteOne();
    
    // Create appropriate success message
    let message = 'House deleted successfully';
    if (deletedDevicesCount.deletedCount > 0) {
      message = `House and ${deletedDevicesCount.deletedCount} associated device(s) deleted successfully`;
    }
    
    res.status(200).json({
      success: true,
      message: message,
      deletedDevices: deletedDevicesCount.deletedCount
    });
  } catch (error) {
    next(error);
  }
};

// Add a floor to a house
export const addFloor = async (req, res, next) => {
  try {
    const { name } = req.body;
    const houseId = req.params.id;
    
    const house = await House.findById(houseId);
    
    if (!house) {
      return res.status(404).json({
        success: false,
        message: 'House not found'
      });
    }
    
    // Check if user owns the house
    if (house.createdBy !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this house'
      });
    }
    
    // Add new floor
    const newFloor = {
      name: name || `Floor ${house.floors.length + 1}`,
      rooms: []
    };
    
    house.floors.push(newFloor);
    await house.save();
    
    res.status(200).json({
      success: true,
      message: 'Floor added successfully',
      data: house
    });
  } catch (error) {
    next(error);
  }
};

// Add a room to a floor
export const addRoom = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { id: houseId, floorIndex } = req.params;
    
    const house = await House.findById(houseId);
    
    if (!house) {
      return res.status(404).json({
        success: false,
        message: 'House not found'
      });
    }
    
    // Check if user owns the house
    if (house.createdBy !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this house'
      });
    }
    
    // Check if floor exists
    if (!house.floors[floorIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }
    
    // Add new room
    const newRoom = {
      name: name || `Room ${house.floors[floorIndex].rooms.length + 1}`,
      devices: []
    };
    
    // Handle image upload if provided
    if (req.file) {
      newRoom.image = {
        public_id: req.file.filename || req.file.public_id,
        url: req.file.path || req.file.secure_url
      };
    }
    
    house.floors[floorIndex].rooms.push(newRoom);
    await house.save();
    
    res.status(200).json({
      success: true,
      message: 'Room added successfully',
      data: house
    });
  } catch (error) {
    next(error);
  }
};

// Delete a floor from a house
export const deleteFloor = async (req, res, next) => {
  try {
    const { id: houseId, floorIndex } = req.params;
    
    const house = await House.findById(houseId);
    
    if (!house) {
      return res.status(404).json({
        success: false,
        message: 'House not found'
      });
    }
    
    // Check if user owns the house
    if (house.createdBy !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this house'
      });
    }
    
    // Check if floor exists
    if (!house.floors[floorIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }
    
    // Get the floor to be deleted for response
    const deletedFloor = house.floors[floorIndex];
    
    // Remove the floor
    house.floors.splice(floorIndex, 1);
    await house.save();
    
    res.status(200).json({
      success: true,
      message: `Floor "${deletedFloor.name}" deleted successfully`,
      data: house
    });
  } catch (error) {
    next(error);
  }
};

// Delete a room from a floor
export const deleteRoom = async (req, res, next) => {
  try {
    const { id: houseId, floorIndex, roomIndex } = req.params;
    
    const house = await House.findById(houseId);
    
    if (!house) {
      return res.status(404).json({
        success: false,
        message: 'House not found'
      });
    }
    
    // Check if user owns the house
    if (house.createdBy !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this house'
      });
    }
    
    // Check if floor exists
    if (!house.floors[floorIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }
    
    // Check if room exists
    if (!house.floors[floorIndex].rooms[roomIndex]) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // Get the room to be deleted for response
    const deletedRoom = house.floors[floorIndex].rooms[roomIndex];
    
    // Remove the room
    house.floors[floorIndex].rooms.splice(roomIndex, 1);
    await house.save();
    
    res.status(200).json({
      success: true,
      message: `Room "${deletedRoom.name}" deleted successfully`,
      data: house
    });
  } catch (error) {
    next(error);
  }
};