const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Import models
const Destination = require('../public/models/destination.model');
const User = require('../public/models/user.model');

// Sample destinations data - Expanded with more variety
const sampleDestinations = [
  // BEACH DESTINATIONS
  {
    title: 'Paradise Beach Resort',
    description: 'Experience luxury at its finest with crystal clear waters, pristine white sand beaches, and world-class amenities. Perfect for romantic getaways and family vacations.',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
    rating: 4.8,
    ratingCount: 127,
    price: 299,
    location: 'Maldives',
    category: 'Beach',
    featured: true,
    duration: '5-7 days',
    groupSize: '2-4 people',
    difficulty: 'Easy',
    bestTimeToVisit: 'November to April',
    highlights: ['Overwater bungalows', 'Private beach access', 'Spa treatments', 'Snorkeling', 'Sunset cruises']
  },
  {
    title: 'Santorini Sunset Villa',
    description: 'Witness the most beautiful sunsets in the world from your private villa in Santorini. White-washed buildings, blue domes, and stunning Aegean Sea views.',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop',
    rating: 4.9,
    ratingCount: 234,
    price: 399,
    location: 'Santorini, Greece',
    category: 'Beach',
    featured: true
  },
  {
    title: 'Bali Tropical Paradise',
    description: 'Immerse yourself in the beauty of Bali with its lush rice terraces, ancient temples, and pristine beaches. Experience authentic Indonesian culture and cuisine.',
    imageUrl: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop',
    rating: 4.7,
    ratingCount: 189,
    price: 149,
    location: 'Bali, Indonesia',
    category: 'Beach',
    featured: true
  },
  {
    title: 'Caribbean Crystal Waters',
    description: 'Discover the turquoise waters and white sand beaches of the Caribbean. Perfect for water sports, relaxation, and tropical adventures.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    rating: 4.6,
    ratingCount: 156,
    price: 229,
    location: 'Barbados',
    category: 'Beach',
    featured: false
  },
  {
    title: 'Hawaiian Island Retreat',
    description: 'Experience the aloha spirit in Hawaii with volcanic landscapes, pristine beaches, and rich Polynesian culture. Perfect for adventure and relaxation.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    rating: 4.5,
    ratingCount: 203,
    price: 279,
    location: 'Maui, Hawaii',
    category: 'Beach',
    featured: false
  },
  {
    title: 'French Riviera Luxury',
    description: 'Indulge in the glamour of the French Riviera with its chic beaches, luxury resorts, and Mediterranean charm. Experience the lifestyle of the rich and famous.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    rating: 4.8,
    ratingCount: 167,
    price: 349,
    location: 'Nice, France',
    category: 'Beach',
    featured: true
  },

  // MOUNTAIN DESTINATIONS
  {
    title: 'Mountain Peak Lodge',
    description: 'Nestled in the heart of the Swiss Alps, this lodge offers breathtaking mountain views, cozy accommodations, and access to world-class skiing and hiking trails.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    rating: 4.6,
    ratingCount: 89,
    price: 189,
    location: 'Swiss Alps, Switzerland',
    category: 'Mountain',
    featured: true
  },
  {
    title: 'Himalayan Trek Base',
    description: 'Base camp for the ultimate mountain adventure. Experience the majesty of the Himalayas with guided treks and authentic local culture.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    rating: 4.6,
    ratingCount: 45,
    price: 129,
    location: 'Nepal',
    category: 'Mountain',
    featured: false
  },
  {
    title: 'Rocky Mountain Adventure',
    description: 'Explore the stunning Rocky Mountains with world-class hiking, wildlife viewing, and breathtaking landscapes. Perfect for outdoor enthusiasts.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    rating: 4.7,
    ratingCount: 134,
    price: 159,
    location: 'Colorado, USA',
    category: 'Mountain',
    featured: true
  },
  {
    title: 'Patagonia Wilderness',
    description: 'Discover the untouched beauty of Patagonia with its dramatic landscapes, glaciers, and unique wildlife. A true adventure for nature lovers.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    rating: 4.8,
    ratingCount: 78,
    price: 199,
    location: 'Patagonia, Chile',
    category: 'Mountain',
    featured: false
  },
  {
    title: 'Alpine Ski Resort',
    description: 'Experience world-class skiing in the Austrian Alps with pristine slopes, cozy mountain huts, and traditional alpine culture.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    rating: 4.5,
    ratingCount: 112,
    price: 179,
    location: 'Innsbruck, Austria',
    category: 'Mountain',
    featured: false
  },

  // CITY DESTINATIONS
  {
    title: 'Tokyo City Experience',
    description: 'Immerse yourself in the vibrant culture of Tokyo. Stay in the heart of the city with easy access to temples, markets, and the famous Tokyo nightlife.',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop',
    rating: 4.5,
    ratingCount: 203,
    price: 159,
    location: 'Tokyo, Japan',
    category: 'City',
    featured: false
  },
  {
    title: 'New York City Explorer',
    description: 'Experience the city that never sleeps. Stay in Manhattan with easy access to Broadway, Central Park, and all the iconic landmarks of NYC.',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop',
    rating: 4.3,
    ratingCount: 312,
    price: 199,
    location: 'New York, USA',
    category: 'City',
    featured: false
  },
  {
    title: 'London Royal Experience',
    description: 'Discover the rich history and modern charm of London. Stay near iconic landmarks like Big Ben, Tower Bridge, and Buckingham Palace.',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop',
    rating: 4.4,
    ratingCount: 245,
    price: 189,
    location: 'London, UK',
    category: 'City',
    featured: true
  },
  {
    title: 'Paris City of Lights',
    description: 'Experience the romance and elegance of Paris with its world-famous museums, cafes, and iconic landmarks like the Eiffel Tower.',
    imageUrl: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=600&fit=crop',
    rating: 4.6,
    ratingCount: 278,
    price: 219,
    location: 'Paris, France',
    category: 'City',
    featured: true
  },
  {
    title: 'Dubai Modern Marvel',
    description: 'Experience the futuristic city of Dubai with its towering skyscrapers, luxury shopping, and world-class entertainment.',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop',
    rating: 4.7,
    ratingCount: 189,
    price: 249,
    location: 'Dubai, UAE',
    category: 'City',
    featured: false
  },
  {
    title: 'Singapore Garden City',
    description: 'Explore the perfect blend of urban sophistication and natural beauty in Singapore. Experience diverse cultures and world-class cuisine.',
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop',
    rating: 4.8,
    ratingCount: 167,
    price: 179,
    location: 'Singapore',
    category: 'City',
    featured: true
  },

  // CULTURAL DESTINATIONS
  {
    title: 'Ancient Rome Heritage',
    description: 'Step back in time and explore the rich history of ancient Rome. Stay near the Colosseum and Vatican, with guided tours of historical landmarks.',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=600&fit=crop',
    rating: 4.7,
    ratingCount: 156,
    price: 179,
    location: 'Rome, Italy',
    category: 'Cultural',
    featured: true
  },
  {
    title: 'Machu Picchu Discovery',
    description: 'Discover the ancient Incan city of Machu Picchu. Stay in Cusco and take guided tours to one of the world\'s most mysterious archaeological sites.',
    imageUrl: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=600&fit=crop',
    rating: 4.8,
    ratingCount: 178,
    price: 219,
    location: 'Cusco, Peru',
    category: 'Cultural',
    featured: true
  },
  {
    title: 'Egyptian Pyramids Tour',
    description: 'Explore the ancient wonders of Egypt including the Great Pyramids, Sphinx, and the treasures of Tutankhamun. A journey through 5000 years of history.',
    imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=800&h=600&fit=crop',
    rating: 4.6,
    ratingCount: 134,
    price: 199,
    location: 'Cairo, Egypt',
    category: 'Cultural',
    featured: false
  },
  {
    title: 'Angkor Wat Temple Complex',
    description: 'Discover the magnificent temple complex of Angkor Wat in Cambodia. Experience the grandeur of ancient Khmer architecture and culture.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    rating: 4.7,
    ratingCount: 98,
    price: 149,
    location: 'Siem Reap, Cambodia',
    category: 'Cultural',
    featured: false
  },
  {
    title: 'Istanbul Crossroads',
    description: 'Experience the unique blend of European and Asian cultures in Istanbul. Explore historic mosques, bazaars, and the Bosphorus Strait.',
    imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&h=600&fit=crop',
    rating: 4.5,
    ratingCount: 167,
    price: 139,
    location: 'Istanbul, Turkey',
    category: 'Cultural',
    featured: true
  },
  {
    title: 'Kyoto Traditional Japan',
    description: 'Immerse yourself in traditional Japanese culture in Kyoto. Visit ancient temples, experience tea ceremonies, and see the famous cherry blossoms.',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=600&fit=crop',
    rating: 4.8,
    ratingCount: 189,
    price: 169,
    location: 'Kyoto, Japan',
    category: 'Cultural',
    featured: false
  },

  // ADVENTURE DESTINATIONS
  {
    title: 'Amazon Rainforest Adventure',
    description: 'Embark on an unforgettable adventure in the Amazon rainforest. Experience wildlife, river cruises, and eco-friendly accommodations in the heart of nature.',
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    rating: 4.4,
    ratingCount: 67,
    price: 249,
    location: 'Amazon, Brazil',
    category: 'Adventure',
    featured: false
  },
  {
    title: 'Great Barrier Reef Dive',
    description: 'Explore the world\'s largest coral reef system. Stay in Cairns and experience world-class diving, snorkeling, and marine life encounters.',
    imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
    rating: 4.5,
    ratingCount: 98,
    price: 279,
    location: 'Cairns, Australia',
    category: 'Adventure',
    featured: false
  },
  {
    title: 'African Safari Experience',
    description: 'Go on the ultimate wildlife safari in Africa. Spot the Big Five and experience the raw beauty of the African wilderness.',
    imageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&h=600&fit=crop',
    rating: 4.9,
    ratingCount: 145,
    price: 399,
    location: 'Serengeti, Tanzania',
    category: 'Adventure',
    featured: true,
    duration: '7-10 days',
    groupSize: '4-12 people',
    difficulty: 'Moderate',
    bestTimeToVisit: 'June to October',
    highlights: ['Big Five game drives', 'Hot air balloon safari', 'Cultural village visits', 'Photography workshops', 'Luxury tented camps']
  },
  {
    title: 'Iceland Northern Lights',
    description: 'Witness the magical Northern Lights in Iceland. Experience glaciers, geysers, and the unique landscape of the Land of Fire and Ice.',
    imageUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&h=600&fit=crop',
    rating: 4.7,
    ratingCount: 123,
    price: 229,
    location: 'Reykjavik, Iceland',
    category: 'Adventure',
    featured: true
  },
  {
    title: 'New Zealand Adventure',
    description: 'Experience the adventure capital of the world in New Zealand. Try bungee jumping, skydiving, and explore stunning fjords and mountains.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    rating: 4.6,
    ratingCount: 156,
    price: 199,
    location: 'Queenstown, New Zealand',
    category: 'Adventure',
    featured: false
  },
  {
    title: 'Costa Rica Eco Adventure',
    description: 'Explore the biodiversity hotspot of Costa Rica. Experience zip-lining, volcano tours, and wildlife encounters in pristine rainforests.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    rating: 4.5,
    ratingCount: 89,
    price: 179,
    location: 'Costa Rica',
    category: 'Adventure',
    featured: false
  },

  // ADDITIONAL PREMIUM DESTINATIONS
  {
    title: 'Monaco Luxury Experience',
    description: 'Indulge in the ultimate luxury in Monaco. Experience the glamour of Monte Carlo, world-class casinos, and Mediterranean sophistication.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    rating: 4.9,
    ratingCount: 78,
    price: 599,
    location: 'Monaco',
    category: 'City',
    featured: true
  },
  {
    title: 'Bora Bora Overwater Bungalow',
    description: 'Stay in a luxurious overwater bungalow in Bora Bora. Experience crystal clear lagoons, coral reefs, and ultimate tropical luxury.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    rating: 4.9,
    ratingCount: 112,
    price: 799,
    location: 'Bora Bora, French Polynesia',
    category: 'Beach',
    featured: true
  },
  {
    title: 'Swiss Alpine Ski Chalet',
    description: 'Experience luxury skiing in the Swiss Alps. Stay in a traditional chalet with world-class slopes and breathtaking mountain views.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    rating: 4.8,
    ratingCount: 95,
    price: 449,
    location: 'St. Moritz, Switzerland',
    category: 'Mountain',
    featured: true
  },
  {
    title: 'Marrakech Cultural Immersion',
    description: 'Experience the vibrant culture of Morocco in Marrakech. Explore souks, palaces, and the unique blend of Arab and Berber cultures.',
    imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=800&h=600&fit=crop',
    rating: 4.6,
    ratingCount: 134,
    price: 129,
    location: 'Marrakech, Morocco',
    category: 'Cultural',
    featured: false
  },
  {
    title: 'Antarctica Expedition',
    description: 'Embark on the ultimate adventure to Antarctica. Experience pristine wilderness, penguins, and the untouched beauty of the white continent.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    rating: 4.9,
    ratingCount: 45,
    price: 899,
    location: 'Antarctica',
    category: 'Adventure',
    featured: true
  },

  // POPULAR DESTINATIONS (High-rated and well-reviewed)
  {
    title: 'Barcelona Vibrant City',
    description: 'Experience the vibrant culture of Barcelona with its unique architecture, delicious cuisine, and Mediterranean beaches. Perfect blend of city and beach life.',
    imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&h=600&fit=crop',
    rating: 4.8,
    ratingCount: 267,
    price: 169,
    location: 'Barcelona, Spain',
    category: 'Popular',
    featured: true
  },
  {
    title: 'Amsterdam Canal City',
    description: 'Explore the charming canals and historic architecture of Amsterdam. Experience world-class museums, cycling culture, and vibrant nightlife.',
    imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=600&fit=crop',
    rating: 4.7,
    ratingCount: 198,
    price: 159,
    location: 'Amsterdam, Netherlands',
    category: 'Popular',
    featured: false
  },
  {
    title: 'Prague Historic Charm',
    description: 'Discover the fairytale beauty of Prague with its medieval architecture, historic bridges, and rich cultural heritage. A photographer\'s paradise.',
    imageUrl: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=600&fit=crop',
    rating: 4.6,
    ratingCount: 189,
    price: 119,
    location: 'Prague, Czech Republic',
    category: 'Popular',
    featured: false
  },

  // RELAXATION DESTINATIONS
  {
    title: 'Thailand Wellness Retreat',
    description: 'Rejuvenate your mind and body in Thailand with traditional spa treatments, meditation sessions, and peaceful beachfront accommodations.',
    imageUrl: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&h=600&fit=crop',
    rating: 4.7,
    ratingCount: 145,
    price: 139,
    location: 'Phuket, Thailand',
    category: 'Relaxation',
    featured: true
  },
  {
    title: 'Maldives Spa Resort',
    description: 'Indulge in ultimate relaxation at a luxury spa resort in the Maldives. Experience overwater treatments, yoga sessions, and pristine beaches.',
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
    rating: 4.9,
    ratingCount: 178,
    price: 499,
    location: 'Maldives',
    category: 'Relaxation',
    featured: true
  },
  {
    title: 'Tuscany Countryside Villa',
    description: 'Escape to the peaceful countryside of Tuscany. Stay in a traditional villa surrounded by vineyards, olive groves, and rolling hills.',
    imageUrl: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=600&fit=crop',
    rating: 4.8,
    ratingCount: 123,
    price: 199,
    location: 'Tuscany, Italy',
    category: 'Relaxation',
    featured: false
  },
  {
    title: 'Sedona Spiritual Retreat',
    description: 'Find inner peace in the spiritual energy of Sedona. Experience vortex sites, meditation, and the healing power of the red rock formations.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    rating: 4.6,
    ratingCount: 89,
    price: 179,
    location: 'Sedona, Arizona',
    category: 'Relaxation',
    featured: false
  }
];

// Sample users for testing
const sampleUsers = [
  {
    email: 'admin@tripvar.com',
    password: 'AdminPassword123',
    name: 'Admin User',
    role: 'admin',
    dateOfBirth: new Date('1985-01-15'),
    nationality: 'United States'
  },
  {
    email: 'john.doe@example.com',
    password: 'UserPassword123',
    name: 'John Doe',
    role: 'user',
    dateOfBirth: new Date('1990-05-20'),
    nationality: 'Canada'
  },
  {
    email: 'jane.smith@example.com',
    password: 'UserPassword123',
    name: 'Jane Smith',
    role: 'user',
    dateOfBirth: new Date('1992-08-10'),
    nationality: 'United Kingdom'
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
    const existingAdmin = await User.findOne({ email: 'admin@tripvar.com' });
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