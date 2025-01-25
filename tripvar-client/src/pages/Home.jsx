import { useState } from 'react'
import Button from '../components/ui/Button'

const popularDestinations = [
  {
    id: 1,
    name: 'Bali',
    description: 'Experience the magic of Indonesian paradise',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
  },
  {
    id: 2,
    name: 'Tokyo',
    description: 'Explore the vibrant culture of Japan',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
  },
  {
    id: 3,
    name: 'Paris',
    description: 'Discover the city of love and lights',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
  },
]

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-primary-600 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Discover Your Next Adventure
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-100">
              Plan your perfect trip with TripVar. Find amazing destinations, create memorable experiences,
              and explore the world with confidence.
            </p>
            <div className="mt-10">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Where do you want to go?"
                  className="w-full rounded-md border-0 px-4 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-500"
                />
                <Button
                  variant="solid"
                  color="white"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Destinations */}
      <section>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Popular Destinations
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {popularDestinations.map((destination) => (
              <div
                key={destination.id}
                className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:-translate-y-1"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={destination.imageUrl}
                    alt={destination.name}
                    className="h-48 w-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {destination.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {destination.description}
                  </p>
                  <Button
                    variant="outline"
                    color="primary"
                    className="mt-4"
                    href={`/destination/${destination.id}`}
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
