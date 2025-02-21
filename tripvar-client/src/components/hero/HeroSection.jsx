import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <div className="relative isolate overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-indigo-900/90" />
        <img
          src="https://images.unsplash.com/photo-1682686581362-796145f0e123"
          alt="Hero background"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-pink-100"
          >
            Your Journey Begins Here
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-lg leading-8 text-gray-200"
          >
            Discover extraordinary destinations, create unforgettable
            memories, and explore the world with confidence.
          </motion.p>
        </div>
      </div>
    </div>
  );
}
