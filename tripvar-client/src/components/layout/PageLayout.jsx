import { motion } from "framer-motion";
import PropTypes from "prop-types";
import Header from "../header/Header";
import Footer from "./Footer";
import PageTransition from "../common/PageTransition";

// Constants
const BACKGROUND_COLOR = "bg-[#1a1f2d]";
const PAGE_PADDING = "pt-20 pb-8";

/**
 * PageLayout - Common layout wrapper for all pages
 *
 * Features:
 * - Consistent header and footer
 * - Page transitions
 * - Responsive design
 * - Background styling
 * - Logout functionality
 */
const PageLayout = ({
  children,
  onLogout,
  showFooter = true,
  className = "",
  containerClassName = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
}) => {
  return (
    <div className={`min-h-screen ${BACKGROUND_COLOR} text-white ${className}`}>
      <Header onLogout={onLogout} />
      <PageTransition>
        <div className={PAGE_PADDING}>
          <div className={containerClassName}>{children}</div>
        </div>
      </PageTransition>
      {showFooter && <Footer />}
    </div>
  );
};

PageLayout.propTypes = {
  children: PropTypes.node.isRequired,
  onLogout: PropTypes.func.isRequired,
  showFooter: PropTypes.bool,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
};

export default PageLayout;
