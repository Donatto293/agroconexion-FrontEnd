import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFavorites, addFavoriteAPI,removeFavoriteAPI } from '../api/favorites';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  const loadFavorites= async ()=> {
    const token = await AsyncStorage.getItem("accessToken");
    try {
      const data = await getFavorites(token);
      setFavorites(data.products);
    } catch (err) {
      console.error("Error loading favorites:", err);
    }
  }

  const fetchFavorites = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    try {
      setLoading(true);
      const response = await getFavorites(token);
      setFavorites(response);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (product) => {
    const token = await AsyncStorage.getItem("accessToken");
    try {
      const response = await addFavoriteAPI(productId, 1, token);
      await loadFavorites();
    } catch (err) {
      console.error('Error adding favorite:', err);
      setError(err);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const clearFavorites = async () => {
    const token = await AsyncStorage.getItem("accessToken");
    try {
      await AsyncStorage.removeItem('favorites');
      setFavorites([]);
    } catch (err) {
      console.error('Error clearing favorites:', err);
      setError(err);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, loading, error, fetchFavorites, loadFavorites, addFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}