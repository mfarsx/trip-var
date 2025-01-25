import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { fetchProfile } from '../../store/slices/authSlice'

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchProfile())
    }
  }, [dispatch, isAuthenticated, user])

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
