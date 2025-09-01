import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { fetchProfile, logout } from '../../store/slices/authSlice'
import PropTypes from 'prop-types'

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch()
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth)
  const location = useLocation()
  const [profileFetchAttempted, setProfileFetchAttempted] = useState(false)

  useEffect(() => {
    // Only fetch if authenticated, no user data exists, not currently loading, and we haven't already attempted
    if (isAuthenticated && !user && !loading && !profileFetchAttempted) {
      setProfileFetchAttempted(true)
      
      // Attempt to fetch the user profile
      dispatch(fetchProfile()).unwrap()
        .catch((error) => {
          // If we get an error, it might be due to an expired token
          if (error?.includes('unauthorized') || error?.includes('token') || error?.includes('expired')) {
            dispatch(logout())
          }
        })
    }
  }, [dispatch, isAuthenticated, user, loading, profileFetchAttempted])

  // Reset the fetch attempt flag when authentication state changes
  useEffect(() => {
    if (!isAuthenticated) {
      setProfileFetchAttempted(false)
    }
  }, [isAuthenticated])

  // If there's an authentication error or user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Show loading state while fetching initial profile
  if (!user && loading) {
    return <div className="min-h-screen bg-[#1a1f2d] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  }

  return children
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
}
