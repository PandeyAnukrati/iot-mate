import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Device name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Device type is required'],
    enum: ['Light', 'Thermostat', 'Lock', 'Camera', 'Speaker', 'Sensor', 'Other'],
    trim: true
  },
  status: {
    type: String,
    enum: ['Online', 'Offline', 'Standby'],
    default: 'Offline'
  },
  room: {
    type: String,
    required: [true, 'Room is required'],
    trim: true
  },
  house: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'House',
    required: [true, 'House is required']
  },
  image: {
    public_id: String,
    url: String
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    required: [true, 'User ID is required']
  }
}, {
  timestamps: true
});

const Device = mongoose.model('Device', deviceSchema);

export default Device;