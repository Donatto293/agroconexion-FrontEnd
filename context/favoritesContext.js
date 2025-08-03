import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFavorites, addFavoriteAPI,removeFavoriteAPI } from '../api/favorites';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
 const [favorites, setFavorites] = useState([]);

  const fetchFavorites = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    try {
      const data = await getFavorites(token);
      setFavorites(data); // o data.products según tu backend
    } catch (err) {
      console.error("Error loading favorites:", err);
    }
  };

  const addFavorite = async (productId) => {
    const token = await AsyncStorage.getItem("accessToken");
    try {
      await addFavoriteAPI(productId, token);
      await fetchFavorites();
    } catch (err) {
      console.error('Error adding favorite:', err);
    }
  };

  const removeFavorite = async (productId) => {
    const token = await AsyncStorage.getItem("accessToken");
    try {
      await removeFavoriteAPI(productId, token);
      await fetchFavorites();
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  

  const clearFavorites = () => setFavorites([]);

const contextValue = useMemo(() => ({
    favorites,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    clearFavorites
  }), [favorites, fetchFavorites, addFavorite, removeFavorite, clearFavorites]);

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  );
};