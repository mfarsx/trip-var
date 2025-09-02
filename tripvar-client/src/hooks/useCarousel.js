import { useState, useEffect } from "react";

export function useCarousel() {
  const [itemsPerView, setItemsPerView] = useState(4);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Responsive items per view
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1); // Mobile: 1 item
      } else if (window.innerWidth < 768) {
        setItemsPerView(2); // Small tablet: 2 items
      } else if (window.innerWidth < 1024) {
        setItemsPerView(4); // Tablet: 4 items
      } else if (window.innerWidth < 1280) {
        setItemsPerView(5); // Desktop: 5 items
      } else if (window.innerWidth < 1536) {
        setItemsPerView(6); // Large desktop: 6 items
      } else {
        setItemsPerView(7); // Extra large: 7 items
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
