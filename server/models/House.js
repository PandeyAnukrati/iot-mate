import mongoose from 'mongoose';

const houseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'House name is required'],
    trim: true
  },
  caretakerName: {
    type: String,
    required: [true, 'Caretaker name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  image: {
    public_id: String,
    url: String
  },
  floors: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    rooms: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      image: {
        public_id: String,
        url: String
      },
      sketch: {
        type: String // Base64 encoded canvas data
      },
      shapes: [{
        id: String,
        type: String,
        name: String,
        x: Number,
        y: Number,
        width: Number,
        height: Number,
        color: String,
        selected: { type: Boolean, default: false }
      }],
      devices: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device'
      }]
    }]
  }],
  // Keep rooms for backward compatibility
  rooms: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: String,
    required: [true, 'User ID is required']
  }
}, {
  timestamps: true
});

// Create a geospatial index on the location field
houseSchema.index({ location: '2dsphere' });

const House = mongoose.model('House', houseSchema);

export default House;