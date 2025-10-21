import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import Header from "../components/header/Header";
import Footer from "../components/layout/Footer";
import PageTransition from "../components/common/PageTransition";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  FiSearch,
  FiTrendingUp,
  FiUsers,
  FiMapPin,
  FiDollarSign,
  FiClock,
  FiBarChart2,
  FiActivity,
} from "react-icons/fi";

export default function Analytics() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch analytics data
  useEffect(() => {
    if (user && user.role === "admin") {
      fetchAnalytics();
      fetchRealTimeStats();

      // Refresh real-time stats every 30 seconds
      const interval = setInterval(fetchRealTimeStats, 30000);
      return () => clearInterval(interval);
    }
  }, [user, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/analytics/dashboard?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      setAnalytics(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analytics");
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const fetchRealTimeStats = async () => {
    try {
      const response = await api.get("/analytics/realtime");
      setRealTimeStats(response.data.data);
    } catch (err) {
      console.error("Failed to fetch real-time stats:", err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-[#1a1f2d] text-white">
        <Header onLogout={handleLogout} />
        <LoadingState />
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="min-h-screen bg-[#1a1f2d] text-white">
        <Header onLogout={handleLogout} />
        <ErrorState error={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1f2d] text-white">
      <Header onLogout={handleLogout} />
      <PageTransition>
        <div className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
              <p className="text-gray-400">
                Track search trends, user behavior, and booking conversions
              </p>
            </div>

            {/* Date Range Selector */}
            <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/30">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <label className="text-gray-300">Date Range:</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                  className="px-3 py-2 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                  className="px-3 py-2 bg-gray-700 rounded-lg text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                />
                <button
                  onClick={fetchAnalytics}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Real-Time Stats */}
            {realTimeStats && (
              <div className="mb-6 p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <FiActivity className="w-5 h-5 text-purple-400 animate-pulse" />
                  <h2 className="text-xl font-semibold">
                    Live Stats (Last Hour)
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Searches</div>
                    <div className="text-2xl font-bold text-purple-400">
                      {realTimeStats.lastHour.searches}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">
                      Active Users
                    </div>
                    <div className="text-2xl font-bold text-green-400">
                      {realTimeStats.lastHour.activeUsers}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Top Search</div>
                    <div className="text-lg font-semibold text-white truncate">
                      {realTimeStats.lastHour.topSearches[0]?.term || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {analytics && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-purple-500/20 rounded-lg">
                        <FiSearch className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">
                          Total Searches
                        </div>
                        <div className="text-2xl font-bold">
                          {analytics.summary.totalSearches}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-green-500/20 rounded-lg">
                        <FiTrendingUp className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">
                          Conversion Rate
                        </div>
                        <div className="text-2xl font-bold text-green-400">
                          {analytics.summary.conversion.conversionRate?.toFixed(
                            1
                          ) || 0}
                          %
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-blue-500/20 rounded-lg">
                        <FiUsers className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">
                          Click-Through Rate
                        </div>
                        <div className="text-2xl font-bold text-blue-400">
                          {analytics.summary.conversion.clickThroughRate?.toFixed(
                            1
                          ) || 0}
                          %
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 bg-pink-500/20 rounded-lg">
                        <FiBarChart2 className="w-6 h-6 text-pink-400" />
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">
                          Avg Clicks/Search
                        </div>
                        <div className="text-2xl font-bold text-pink-400">
                          {analytics.summary.conversion.avgClicksPerSearch || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Search Terms */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <FiSearch className="w-5 h-5 text-purple-400" />
                      Top Search Terms
                    </h2>
                    <div className="space-y-3">
                      {analytics.topSearchTerms.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{item.term}</div>
                            <div className="text-sm text-gray-400">
                              {item.avgResults} avg results
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-purple-400">
                              {item.count}
                            </div>
                            <div className="text-xs text-gray-400">
                              searches
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Categories */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <FiMapPin className="w-5 h-5 text-pink-400" />
                      Popular Categories
                    </h2>
                    <div className="space-y-3">
                      {analytics.topCategories.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{item.category}</div>
                            <div className="text-sm text-gray-400">
                              {item.avgResults} avg results
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-pink-400">
                              {item.count}
                            </div>
                            <div className="text-xs text-gray-400">
                              searches
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Destinations */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 mb-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FiMapPin className="w-5 h-5 text-green-400" />
                    Most Searched Destinations
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analytics.topDestinations.map((item, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:border-green-500/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{item.destination}</div>
                          <div className="text-lg font-bold text-green-400">
                            {item.count}
                          </div>
                        </div>
                        <div className="text-sm text-gray-400">
                          {item.avgResults} avg results
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guest Preferences */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <FiUsers className="w-5 h-5 text-blue-400" />
                      Guest Count Preferences
                    </h2>
                    <div className="space-y-3">
                      {analytics.guestPreferences.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg"
                        >
                          <div className="font-medium">
                            {item.guests} guests
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-bold text-blue-400">
                              {item.count}
                            </div>
                            <div
                              className="h-2 bg-blue-500 rounded-full"
                              style={{
                                width: `${
                                  (item.count /
                                    analytics.guestPreferences.reduce(
                                      (a, b) => a + b.count,
                                      0
                                    )) *
                                  100
                                }px`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Search Trends */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <FiClock className="w-5 h-5 text-yellow-400" />
                      Search Trends
                    </h2>
                    <div className="space-y-2">
                      {analytics.searchTrends.slice(-7).map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-700/30 rounded text-sm"
                        >
                          <div className="text-gray-300">{item.date}</div>
                          <div className="flex items-center gap-4">
                            <div className="text-gray-400">
                              {item.totalSearches} searches
                            </div>
                            <div className="text-green-400">
                              {item.uniqueUsers} users
                            </div>
                            <div className="text-purple-400">
                              {item.avgResponseTime}ms
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </PageTransition>
      <Footer />
    </div>
  );
}
