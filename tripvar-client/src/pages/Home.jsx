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

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { destinations } = useSelector((state) => state.destinations);
  const [searchParams, setSearchParams] = useState({
    location: "",
    date: "",
    guests: "1 Guest",
  });
  const [filteredDestinations, setFilteredDestinations] = useState([]);

  useEffect(() => {
    dispatch(fetchDestinations({ featured: true }));
  }, [dispatch]);

  useEffect(() => {
    setFilteredDestinations(destinations);
  }, [destinations]);

  const handleSearch = () => {
    const filtered = destinations.filter((destination) => {
      return destination.title
        .toLowerCase()
        .includes(searchParams.location.toLowerCase());
    });
    setFilteredDestinations(filtered);
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
        />
        <DestinationsGrid 
          destinations={filteredDestinations}
          onDestinationClick={handleDestinationClick}
        />
      </motion.div>
    </div>
  );
}
