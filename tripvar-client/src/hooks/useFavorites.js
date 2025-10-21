import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchFavorites, 
  toggleFavorite, 
  addToFavorites, 
  removeFromFavorites,
  selectFavorites,
  selectFavoriteIds,
  selectFavoritesLoading,
  selectFavoritesError
} from '../store/slices/favoritesSlice';
import apiCallManager from '../utils/apiCallManager';

export const useFavorites = () => {
  const dispatch = useDispatch();
  const favorites = useSelector(selectFavorites);
  const favoriteIds = useSelector(selectFavoriteIds);
  const loading = useSelector(selectFavoritesLoading);
  const error = useSelector(selectFavoritesError);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Fetch favorites when the hook is first used
    if (!hasFetched.current && !loading) {
      hasFetched.current = true;
      apiCallManager.executeCall('fetchFavorites', () => dispatch(fetchFavorites()));
    }
  }, [dispatch, loading]);

  const isFavorite = (destinationId) => {
    return favoriteIds.has(destinationId);
  };

  const handleToggleFavorite = (destinationId) => {
    dispatch(toggleFavorite(destinationId));
  };

  const handleAddToFavorites = (destinationId) => {
    dispatch(addToFavorites(destinationId));
  };

  const handleRemoveFromFavorites = (destinationId) => {
    dispatch(removeFromFavorites(destinationId));
  };

  return {
    favorites,
    favoriteIds,
    loading,
    error,
    isFavorite,
    toggleFavorite: handleToggleFavorite,
    addToFavorites: handleAddToFavorites,
    removeFromFavorites: handleRemoveFromFavorites,
    refetch: () => dispatch(fetchFavorites())
  };
};

export default useFavorites;