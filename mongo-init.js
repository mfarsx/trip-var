// MongoDB initialization script
db = db.getSiblingDB('tripvar');

// Create a user for the tripvar database
db.createUser({
  user: 'tripvar_user',
  pwd: 'tripvar_password123',
  roles: [
    {
      role: 'readWrite',
      db: 'tripvar'
    }
  ]
});

// Create some initial collections
db.createCollection('users');
db.createCollection('destinations');
db.createCollection('bookings');
db.createCollection('reviews');

print('MongoDB initialization completed successfully');