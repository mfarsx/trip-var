const mongoose = require("mongoose");
const Destination = require("../models/destination.model");
require("dotenv").config();

const destinations = [
  {
    title: "Bali Paradise",
    description: "Experience the perfect blend of beaches, culture, and luxury in Bali. Enjoy pristine beaches, ancient temples, and world-class resorts.",
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
    rating: 4.8,
    price: 1299,
    location: "Bali, Indonesia",
    category: "Beach",
    featured: true,
  },
  {
    title: "Swiss Alps Adventure",
    description: "Discover the majestic Swiss Alps with breathtaking mountain views, skiing opportunities, and charming alpine villages.",
    imageUrl: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7",
    rating: 4.9,
    price: 1899,
    location: "Swiss Alps, Switzerland",
    category: "Mountain",
    featured: true,
  },
  {
    title: "Tokyo Explorer",
    description: "Immerse yourself in the vibrant culture of Tokyo. Experience modern technology, traditional temples, and amazing cuisine.",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
    rating: 4.7,
    price: 1599,
    location: "Tokyo, Japan",
    category: "City",
    featured: true,
  },
  {
    title: "Ancient Rome Discovery",
    description: "Walk through history in the eternal city. Visit the Colosseum, Roman Forum, and Vatican City.",
    imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5",
    rating: 4.8,
    price: 1499,
    location: "Rome, Italy",
    category: "Cultural",
    featured: false,
  },
  {
    title: "Amazon Expedition",
    description: "Explore the world's largest rainforest. Experience unique wildlife, indigenous cultures, and natural wonders.",
    imageUrl: "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a",
    rating: 4.6,
    price: 2199,
    location: "Amazon Rainforest, Brazil",
    category: "Adventure",
    featured: true,
  },
  {
    title: "Santorini Escape",
    description: "Relax in the stunning Greek islands. Enjoy white-washed buildings, beautiful sunsets, and crystal-clear waters.",
    imageUrl: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e",
    rating: 4.9,
    price: 1799,
    location: "Santorini, Greece",
    category: "Beach",
    featured: true,
  },
];

async function seedDestinations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    // Use console.log for seed script as it's a one-time operation
    console.log("Connected to MongoDB");

    // Clear existing destinations
    await Destination.deleteMany({});
    console.log("Cleared existing destinations");

    // Insert new destinations
    await Destination.insertMany(destinations);
    console.log("Added new destinations");

    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    // Use console.error for seed script as it's a one-time operation
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDestinations();
