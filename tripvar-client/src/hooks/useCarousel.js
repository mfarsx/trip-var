import { useState, useEffect } from "react";

export function useCarousel() {
  const [itemsPerView, setItemsPerView] = useState(4);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Responsive items per view - Home page optimized
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1); // Mobile: 1 item
      } else if (window.innerWidth < 768) {
        setItemsPerView(2); // Small tablet: 2 items
      } else if (window.innerWidth < 1024) {
        setItemsPerView(3); // Tablet: 3 items
      } else if (window.innerWidth < 1280) {
        setItemsPerView(4); // Desktop: 4 items
      } else if (window.innerWidth < 1536) {
        setItemsPerView(5); // Large desktop: 5 items
      } else {
        setItemsPerView(5); // Extra large: 5 items
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  return {
    itemsPerView,
    currentIndex,
    setCurrentIndex,
  };
}
