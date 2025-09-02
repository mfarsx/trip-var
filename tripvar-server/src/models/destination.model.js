const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    location: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ['Beach', 'Mountain', 'City', 'Cultural', 'Adventure', 'Popular', 'Relaxation']
    },
    featured: {
      type: Boolean,
      default: false
    },
    duration: {
      type: String,
      default: '3-5 days'
    },
    groupSize: {
      type: String,
      default: '2-8 people'
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Moderate', 'Challenging', 'Expert'],
      default: 'Moderate'
    },
    bestTimeToVisit: {
      type: String,
      default: 'Year-round'
    },
    highlights: [{
      type: String
    }],
    originalPrice: {
      type: Number,
      default: function() {
        return Math.round(this.price * 1.2);
      }
    }
  },
  {
    timestamps: true
  }
);

const Destination = mongoose.model('Destination', destinationSchema);

module.exports = Destination;
