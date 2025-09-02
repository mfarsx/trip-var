const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Import models
const Destination = require('../models/destination.model');
const User = require('../models/user.model');

// Sample destinations data
const sampleDestinations = [
  {
    title: "Paradise Beach Resort",
    description: "Experience luxury at its finest with crystal clear waters, pristine white sand beaches, and world-class amenities. Perfect for romantic getaways and family vacations.",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
    rating: 4.8,
    ratingCount: 127,
    price: 299,
    location: "Maldives",
    category: "Beach",
    featured: true
  },
  {
    title: "Mountain Peak Lodge",
    description: "Nestled in the heart of the Swiss Alps, this lodge offers breathtaking mountain views, cozy accommodations, and access to world-class skiing and hiking trails.",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    rating: 4.6,
    ratingCount: 89,
    price: 189,
    location: "Swiss Alps, Switzerland",
    category: "Mountain",
    featured: true
  },
  {
    title: "Tokyo City Experience",
    description: "Immerse yourself in the vibrant culture of Tokyo. Stay in the heart of the city with easy access to temples, markets, and the famous Tokyo nightlife.",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop",
    rating: 4.5,
    ratingCount: 203,
    price: 159,
    location: "Tokyo, Japan",
    category: "City",
    featured: false
  },
  {
    title: "Ancient Rome Heritage",
    description: "Step back in time and explore the rich history of ancient Rome. Stay near the Colosseum and Vatican, with guided tours of historical landmarks.",
    imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop",
    rating: 4.7,
    ratingCount: 156,
    price: 179,
    location: "Rome, Italy",
    category: "Cultural",
    featured: true
  },
  {
    title: "Amazon Rainforest Adventure",
    description: "Embark on an unforgettable adventure in the Amazon rainforest. Experience wildlife, river cruises, and eco-friendly accommodations in the heart of nature.",
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
    rating: 4.4,
    ratingCount: 67,
    price: 249,
    location: "Amazon, Brazil",
    category: "Adventure",
    featured: false
  },
  {
    title: "Santorini Sunset Villa",
    description: "Witness the most beautiful sunsets in the world from your private villa in Santorini. White-washed buildings, blue domes, and stunning Aegean Sea views.",
    imageUrl: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop",
    rating: 4.9,
    ratingCount: 234,
    price: 399,
    location: "Santorini, Greece",
    category: "Beach",
    featured: true
  },
  {
    title: "New York City Explorer",
    description: "Experience the city that never sleeps. Stay in Manhattan with easy access to Broadway, Central Park, and all the iconic landmarks of NYC.",
    imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop",
    rating: 4.3,
    ratingCount: 312,
    price: 199,
    location: "New York, USA",
    category: "City",
    featured: false
  },
  {
    title: "Himalayan Trek Base",
    description: "Base camp for the ultimate mountain adventure. Experience the majesty of the Himalayas with guided treks and authentic local culture.",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    rating: 4.6,
    ratingCount: 45,
    price: 129,
    location: "Nepal",
    category: "Mountain",
    featured: false
  },
  {
    title: "Machu Picchu Discovery",
    description: "Discover the ancient Incan city of Machu Picchu. Stay in Cusco and take guided tours to one of the world's most mysterious archaeological sites.",
    imageUrl: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=600&fit=crop",
    rating: 4.8,
    ratingCount: 178,
    price: 219,
    location: "Cusco, Peru",
    category: "Cultural",
    featured: true
  },
  {
    title: "Great Barrier Reef Dive",
    description: "Explore the world's largest coral reef system. Stay in Cairns and experience world-class diving, snorkeling, and marine life encounters.",
    imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
    rating: 4.5,
    ratingCount: 98,
    price: 279,
    location: "Cairns, Australia",
    category: "Adventure",
    featured: false
  }
];

// Sample users for testing
const sampleUsers = [
  {
    email: "admin@tripvar.com",
    password: "AdminPassword123",
    name: "Admin User",
    role: "admin",
    dateOfBirth: new Date("1985-01-15"),
    nationality: "United States"
  },
  {
    email: "john.doe@example.com",
    password: "UserPassword123",
    name: "John Doe",
    role: "user",
    dateOfBirth: new Date("1990-05-20"),
    nationality: "Canada"
  },
  {
    email: "jane.smith@example.com",
    password: "UserPassword123",
    name: "Jane Smith",
    role: "user",
    dateOfBirth: new Date("1992-08-10"),
    nationality: "United Kingdom"
  }
];

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function seedDestinations() {
  try {
    console.log('🌱 Seeding destinations...');
    
    // Clear existing destinations
    await Destination.deleteMany({});
    console.log('🗑️  Cleared existing destinations');
    
    // Insert sample destinations
    const destinations = await Destination.insertMany(sampleDestinations);
    console.log(`✅ Created ${destinations.length} destinations`);
    
    return destinations;
  } catch (error) {
    console.error('❌ Error seeding destinations:', error);
    throw error;
  }
}

async function seedUsers() {
  try {
    console.log('👥 Seeding users...');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: "admin@tripvar.com" });
    if (existingAdmin) {
      console.log('👤 Admin user already exists, skipping user seeding');
      return [existingAdmin];
    }
    
    // Insert sample users (using save() to trigger password hashing)
    const users = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      users.push(user);
    }
    console.log(`✅ Created ${users.length} users`);
    
    return users;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}

async function seedDatabase() {
  try {
    console.log('🚀 Starting database seeding...');
    
    await connectDB();
    
    const destinations = await seedDestinations();
    const users = await seedUsers();
    
    console.log('\n📊 Seeding Summary:');
    console.log(`   Destinations: ${destinations.length}`);
    console.log(`   Users: ${users.length}`);
    console.log('\n✅ Database seeding completed successfully!');
    
    // Display some sample data
    console.log('\n🏖️  Sample Destinations:');
    destinations.slice(0, 3).forEach(dest => {
      console.log(`   - ${dest.title} (${dest.location}) - $${dest.price}/night`);
    });
    
    console.log('\n👤 Sample Users:');
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = {
  seedDestinations,
  seedUsers,
  seedDatabase,
  sampleDestinations,
  sampleUsers
};