# Advanced Features API Usage Guide

Quick reference for using the new advanced destination features.

---

## 🔍 1. Search with Advanced Filters

### Basic Search

```http
GET /api/v1/destinations?to=Paris&guests=4&date=2024-12-25
```

### With All Filters

```http
GET /api/v1/destinations
  ?search=beach
  &category=Relaxation
  &to=Bali
  &from=New York
  &date=2024-12-01
  &guests=4
  &minPrice=100
  &maxPrice=500
  &minRating=4.0
  &page=1
  &limit=20
```

### Response

```json
{
  "status": "success",
  "data": {
    "destinations": [...],
    "pagination": {
      "current": 1,
      "pages": 5,
      "total": 100,
      "filtered": 18
    },
    "filters": {
      "category": "Relaxation",
      "guests": 4,
      "date": "2024-12-01"
    },
    "cached": false
  }
}
```

---

## 📅 2. Check Date Availability

### Request

```http
GET /api/v1/destinations/67890abcdef/availability
  ?startDate=2024-12-20
  &endDate=2024-12-25
  &guests=4
```

### Success Response (Available)

```json
{
  "status": "success",
  "data": {
    "availability": {
      "available": true,
      "availableSpots": 6,
      "maxCapacity": 8,
      "conflictingBookings": 1,
      "message": "Destination is available for the selected dates"
    },
    "destination": "67890abcdef",
    "requestedDates": {
      "startDate": "2024-12-20T00:00:00.000Z",
      "endDate": "2024-12-25T00:00:00.000Z"
    },
    "guests": 4
  },
  "message": "Destination is available"
}
```

### Not Available Response

```json
{
  "status": "success",
  "data": {
    "availability": {
      "available": false,
      "reason": "Insufficient capacity for the selected dates",
      "requestedGuests": 6,
      "availableSpots": 2,
      "conflictingBookings": 2
    }
  },
  "message": "Destination is not available"
}
```

### Guest Capacity Exceeded

```json
{
  "data": {
    "availability": {
      "available": false,
      "reason": "Guest count exceeds maximum capacity of 8",
      "maxGuests": 8
    }
  }
}
```

---

## 👥 3. Guest Capacity Filtering

### Filter Destinations by Guest Count

```http
GET /api/v1/destinations?guests=6
```

**How it works**:

- Parses `groupSize` field (e.g., "2-8 people")
- Filters out destinations that can't accommodate the guest count
- Returns only suitable destinations

---

## 📊 4. Analytics Dashboard

### Get Dashboard Data

```http
GET /api/v1/analytics/dashboard
  ?startDate=2024-01-01
  &endDate=2024-12-31
  &limit=10
Authorization: Bearer {admin_token}
```

### Response

```json
{
  "status": "success",
  "data": {
    "dateRange": {
      "start": "2024-01-01T00:00:00.000Z",
      "end": "2024-12-31T23:59:59.999Z"
    },
    "summary": {
      "totalSearches": 15420,
      "conversion": {
        "totalSearches": 15420,
        "withBookings": 892,
        "withClicks": 8734,
        "avgClicksPerSearch": 2.3,
        "conversionRate": 5.78,
        "clickThroughRate": 56.65
      }
    },
    "topSearchTerms": [
      {
        "term": "Paris",
        "count": 324,
        "avgResults": 45,
        "avgResponseTime": 123
      }
    ],
    "topCategories": [
      {
        "category": "Adventure",
        "count": 2145,
        "avgResults": 67
      }
    ],
    "topDestinations": [
      {
        "destination": "Bali",
        "count": 456,
        "avgResults": 23
      }
    ],
    "searchTrends": [
      {
        "date": "2024-01-01",
        "totalSearches": 234,
        "avgResults": 45,
        "avgResponseTime": 145,
        "uniqueUsers": 123
      }
    ],
    "guestPreferences": [
      { "guests": 2, "count": 8934 },
      { "guests": 4, "count": 4523 },
      { "guests": 6, "count": 1234 }
    ]
  }
}
```

---

## ⚡ 5. Real-Time Analytics

### Get Real-Time Stats (Last Hour)

```http
GET /api/v1/analytics/realtime
Authorization: Bearer {admin_token}
```

### Response

```json
{
  "status": "success",
  "data": {
    "lastHour": {
      "searches": 45,
      "activeUsers": 23,
      "topSearches": [
        { "term": "Paris", "count": 8 },
        { "term": "Tokyo", "count": 6 }
      ]
    },
    "timestamp": "2024-10-21T15:30:00.000Z"
  }
}
```

---

## 📍 6. Track User Interactions

### Track Destination Click

```http
POST /api/v1/analytics/track/click
Authorization: Bearer {token}
Content-Type: application/json

{
  "searchId": "search_analytics_id",
  "destinationId": "destination_id"
}
```

### Track Booking Conversion

```http
POST /api/v1/analytics/track/booking
Authorization: Bearer {token}
Content-Type: application/json

{
  "searchId": "search_analytics_id",
  "bookingId": "booking_id"
}
```

---

## 🗂️ 7. Cache Behavior

### Cache Headers

Cached responses include:

```json
{
  "data": {
    "cached": false // or true if from cache
  }
}
```

### Cache TTL

- **Destination lists**: 5 minutes
- **Individual destinations**: 10 minutes

### Cache Invalidation

Cache is automatically cleared when:

- New destination is created
- Destination is updated
- Destination is deleted

### Manual Cache Check

```javascript
// Check if response was cached
if (response.data.data.cached) {
  console.log("Response from cache");
} else {
  console.log("Fresh data from database");
}
```

---

## 🚨 Error Responses

### Invalid Date Format

```json
{
  "status": "error",
  "message": "Invalid date format"
}
```

### Invalid Guest Count

```json
{
  "status": "error",
  "message": "Guest count must be at least 1"
}
```

### Date in Past

```json
{
  "status": "error",
  "message": "Start date cannot be in the past"
}
```

### End Date Before Start Date

```json
{
  "status": "error",
  "message": "End date must be after start date"
}
```

### Unauthorized (Analytics)

```json
{
  "status": "error",
  "message": "Access denied. Admin privileges required."
}
```

---

## 💻 Frontend Integration Examples

### React - Check Availability

```javascript
import api from "./services/api";

const checkAvailability = async (destinationId, startDate, endDate, guests) => {
  try {
    const response = await api.get(
      `/destinations/${destinationId}/availability`,
      {
        params: { startDate, endDate, guests },
      }
    );
    return response.data.data.availability;
  } catch (error) {
    console.error("Availability check failed:", error);
    return null;
  }
};

// Usage
const availability = await checkAvailability(
  "dest123",
  "2024-12-20",
  "2024-12-25",
  4
);

if (availability.available) {
  console.log(`${availability.availableSpots} spots available!`);
} else {
  console.log(availability.reason);
}
```

### React - Search with Filters

```javascript
const searchDestinations = async (filters) => {
  const params = new URLSearchParams();

  if (filters.to) params.append("to", filters.to);
  if (filters.from) params.append("from", filters.from);
  if (filters.date) params.append("date", filters.date);
  if (filters.guests) params.append("guests", filters.guests);
  if (filters.minPrice) params.append("minPrice", filters.minPrice);
  if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);

  const response = await api.get(`/destinations?${params.toString()}`);
  return response.data.data;
};

// Usage
const results = await searchDestinations({
  to: "Paris",
  guests: 4,
  date: "2024-12-25",
  minPrice: 100,
  maxPrice: 500,
});

console.log(`Found ${results.pagination.filtered} destinations`);
console.log(`Cache hit: ${results.cached}`);
```

### React - Load Analytics Dashboard

```javascript
const fetchAnalytics = async (startDate, endDate) => {
  try {
    const response = await api.get("/analytics/dashboard", {
      params: { startDate, endDate, limit: 10 },
    });
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 403) {
      console.error("Admin access required");
    }
    throw error;
  }
};

// Usage
const analytics = await fetchAnalytics("2024-01-01", "2024-12-31");
console.log(`Total searches: ${analytics.summary.totalSearches}`);
console.log(`Conversion rate: ${analytics.summary.conversion.conversionRate}%`);
```

---

## 🎯 Best Practices

### 1. Date Availability

✅ **Do**:

- Check availability before showing booking form
- Display available spots to users
- Show alternative dates if unavailable
- Cache availability checks client-side

❌ **Don't**:

- Allow bookings without checking availability
- Show dates in the past
- Allow end date before start date

### 2. Guest Capacity

✅ **Do**:

- Filter destinations based on party size
- Show capacity limits in UI
- Warn when approaching capacity
- Suggest similar destinations if capacity exceeded

❌ **Don't**:

- Allow bookings exceeding capacity
- Show destinations that can't accommodate guests

### 3. Caching

✅ **Do**:

- Leverage cache for better performance
- Implement client-side caching too
- Show cache indicators if desired
- Respect cache invalidation

❌ **Don't**:

- Force cache refresh unnecessarily
- Assume cache is always fresh
- Rely on cache for critical real-time data

### 4. Analytics

✅ **Do**:

- Track all user interactions
- Use analytics to improve UX
- Monitor search trends
- Protect admin routes

❌ **Don't**:

- Track sensitive user data
- Expose analytics to non-admins
- Block requests while tracking

---

## 🔗 Related Documentation

- [Advanced Features Summary](./ADVANCED_FEATURES_SUMMARY.md)
- [API Endpoints](./tripvar-server/API_ENDPOINTS.md)
- [Deployment Guide](./DEPLOYMENT_SUMMARY.md)

---

## 📞 Support

For questions or issues:

1. Check error messages in console
2. Review API response codes
3. Verify authentication tokens
4. Check date/time formats
5. Ensure required parameters are provided

---

**Last Updated**: October 21, 2024
**Version**: 2.0.0
