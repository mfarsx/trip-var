import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { fetchDestinations } from "../store/slices/destinationSlice";
import Header from "../components/header/Header";
import HeroSection from "../components/hero/HeroSection";
import SearchSection from "../components/search/SearchSection";
import DestinationsGrid from "../components/destinations/DestinationsGrid";
import { destinationApi } from "../services/api";
import toast from "react-hot-toast";

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { destinations } = useSelector((state) => state.destinations);
  const [searchParams, setSearchParams] = useState({
    from: "",
    to: "",
    date: "",
    guests: "1 Guest",
  });
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    dispatch(fetchDestinations({ featured: true }));
  }, [dispatch]);

  useEffect(() => {
    setFilteredDestinations(destinations);
  }, [destinations]);

  const handleSearch = async () => {
    // Validate search parameters
    if (!searchParams.to.trim()) {
      toast.error("Please enter a destination");
      return;
    }
    
    try {
      setIsSearching(true);
      
      // Use the backend search API
      const response = await destinationApi.searchDestinations(searchParams);
      
      if (response.data.destinations.length === 0) {
        toast.error("No destinations found matching your criteria");
        return;
      }
      
      setFilteredDestinations(response.data.destinations);
      toast.success(`Found ${response.data.destinations.length} destinations`);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Error searching for destinations");
    } finally {
      setIsSearching(false);
    }
  };

  const handleDestinationClick = (destinationId) => {
    navigate(`/destinations/${destinationId}`);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen bg-[#1a1f2d]">
      <Header onLogout={handleLogout} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <HeroSection />
        <SearchSection 
          searchParams={searchParams}
          onSearchParamsChange={setSearchParams}
          onSearch={handleSearch}
          isSearching={isSearching}
        />
        <DestinationsGrid 
          destinations={filteredDestinations}
          onDestinationClick={handleDestinationClick}
        />
      </motion.div>
    </div>
  );
}
