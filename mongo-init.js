// MongoDB initialization script for Tripvar
// This script runs when the MongoDB container starts for the first time

// Switch to the tripvar database
db = db.getSiblingDB("tripvar");

// Create collections with proper indexes
db.createCollection("users");
db.createCollection("trips");
db.createCollection("destinations");
db.createCollection("bookings");

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.trips.createIndex({ userId: 1 });
db.trips.createIndex({ destinationId: 1 });
db.trips.createIndex({ startDate: 1 });
db.destinations.createIndex({ name: 1 });
db.destinations.createIndex({ country: 1 });
db.bookings.createIndex({ userId: 1 });
db.bookings.createIndex({ tripId: 1 });
db.bookings.createIndex({ bookingDate: 1 });

// Insert sample data (optional)
db.destinations.insertMany([
  {
    name: "Paris",
    country: "France",
    description: "The City of Light",
    coordinates: { lat: 48.8566, lng: 2.3522 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Tokyo",
    country: "Japan",
    description: "Modern metropolis with ancient traditions",
    coordinates: { lat: 35.6762, lng: 139.6503 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "New York",
    country: "USA",
    description: "The Big Apple",
    coordinates: { lat: 40.7128, lng: -74.006 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

print("✅ MongoDB initialization completed successfully!");
print("📊 Created collections: users, trips, destinations, bookings");
print("🔍 Created indexes for optimal performance");
print("🌍 Inserted sample destinations");
