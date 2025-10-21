import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import Header from "../components/header/Header";
import HeroSection from "../components/hero/HeroSection";
import SearchSection from "../components/search/SearchSection";
import BackgroundEffects from "../components/common/BackgroundEffects";
import { useSearch } from "../hooks/useSearch";
import { useDestinations } from "../hooks/useDestinations";

// Constants
const ANIMATION_DURATION = 0.8;
const BACKGROUND_COLOR = "bg-[#1a1f2d]";

/**
 * Home - Main landing page component
 *
 * Features:
 * - Animated background effects
 * - Hero section with call-to-action
 * - Search functionality
 * - Responsive design
 * - Performance optimized
 */
function Home() {
  const dispatch = useDispatch();

  // Custom hooks
  const { searchParams, setSearchParams, isSearching, handleSearch } =
    useSearch();

  // Load destinations data when Home component mounts
  const { destinations, loading: destinationsLoading } = useDestinations();

  const handleLogout = () => {
    dispatch(logout());
  };

  // Simplified search handler - no need for wrapper function

  return (
    <div
      className={`min-h-screen ${BACKGROUND_COLOR} relative overflow-hidden`}
    >
      {/* Global background effects */}
      <BackgroundEffects />

      <Header onLogout={handleLogout} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: ANIMATION_DURATION }}
      >
        <HeroSection />
        <SearchSection
          searchParams={searchParams}
          onSearchParamsChange={setSearchParams}
          onSearch={handleSearch}
          isSearching={isSearching}
        />
      </motion.div>
    </div>
  );
}

Home.displayName = "Home";

export default Home;
