import express from 'express';
import { 
  createHouse, 
  getHouses, 
  getHouse, 
  updateHouse, 
  deleteHouse,
  addFloor,
  addRoom,
  deleteFloor,
  deleteRoom
} from '../controllers/houseController.js';
import { verifyToken } from '../middleware/auth.js';
import { uploadHouseImage, uploadRoomImage } from '../config/cloudinary.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Routes
router.route('/')
  .post(uploadHouseImage.single('image'), createHouse)
  .get(getHouses);

router.route('/:id')
  .get(getHouse)
  .put(uploadHouseImage.single('image'), updateHouse)
  .delete(deleteHouse);

// Floor and room routes
router.post('/:id/floors', addFloor);
router.delete('/:id/floors/:floorIndex', deleteFloor);
router.post('/:id/floors/:floorIndex/rooms', uploadRoomImage.single('image'), addRoom);
router.delete('/:id/floors/:floorIndex/rooms/:roomIndex', deleteRoom);

export default router;