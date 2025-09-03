import { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import Header from "../components/header/Header";
import HeroSection from "../components/hero/HeroSection";
import SearchSection from "../components/search/SearchSection";
import DestinationsSection from "../components/sections/DestinationsSection";
import DestinationsErrorBoundary from "../components/common/DestinationsErrorBoundary";
import FeaturesSection from "../components/sections/FeaturesSection";
import CTASection from "../components/sections/CTASection";
import Footer from "../components/layout/Footer";
import { useDestinations } from "../hooks/useDestinations";
import { useDestinationFilters } from "../hooks/useDestinationFilters";
import { useSearch } from "../hooks/useSearch";
import { useCarousel } from "../hooks/useCarousel";
import { useDestinationActions } from "../hooks/useDestinationActions";

export default function Home() {
  const dispatch = useDispatch();
  const [showFilters, setShowFilters] = useState(false);

  // Custom hooks
  const {
    destinations,
    filteredDestinations,
    setFilteredDestinations,
    loading,
  } = useDestinations();
  const { activeFilter, setActiveFilter, sortBy, setSortBy } =
    useDestinationFilters(destinations, setFilteredDestinations);
  const { searchParams, setSearchParams, isSearching, handleSearch } =
    useSearch();
  const { itemsPerView, currentIndex, setCurrentIndex } = useCarousel();
  const {
    selectedDestinations,
    setSelectedDestinations,
    handleDestinationClick,
    handleCompareToggle,
    handleQuickBook,
    handleFilterChange,
    handleSortChange,
  } = useDestinationActions();

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleSearchWithDestinations = () => {
    handleSearch(setFilteredDestinations);
  };

  const handleFilterChangeWithToast = (filter) => {
    setActiveFilter(filter);
    handleFilterChange(filter);
  };

  const handleSortChangeWithToast = (sort) => {
    setSortBy(sort);
    handleSortChange(sort);
  };

  return (
    <div className="min-h-screen bg-[#1a1f2d]">
      <Header onLogout={handleLogout} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <HeroSection />
        <SearchSection
          searchParams={searchParams}
          onSearchParamsChange={setSearchParams}
          onSearch={handleSearchWithDestinations}
          isSearching={isSearching}
        />
        <DestinationsErrorBoundary>
          <DestinationsSection
            destinations={destinations}
            filteredDestinations={filteredDestinations}
            setFilteredDestinations={setFilteredDestinations}
            loading={loading}
            activeFilter={activeFilter}
            sortBy={sortBy}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            onFilterChange={handleFilterChangeWithToast}
            onSortChange={handleSortChangeWithToast}
            onDestinationClick={handleDestinationClick}
            onCompareToggle={handleCompareToggle}
            onQuickBook={handleQuickBook}
            selectedDestinations={selectedDestinations}
            setSelectedDestinations={setSelectedDestinations}
            itemsPerView={itemsPerView}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
          />
        </DestinationsErrorBoundary>
        <FeaturesSection />
        <CTASection />
        <Footer />
      </motion.div>
    </div>
  );
}
