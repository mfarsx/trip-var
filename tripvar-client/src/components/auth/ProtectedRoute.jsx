import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { fetchProfile } from '../../store/slices/authSlice'

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch()
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth)
  const location = useLocation()

  useEffect(() => {
    // Only fetch if authenticated and no user data exists and not currently loading
    if (isAuthenticated && !user && !loading) {
      dispatch(fetchProfile())
    }
  }, [dispatch, isAuthenticated, user, loading])

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
