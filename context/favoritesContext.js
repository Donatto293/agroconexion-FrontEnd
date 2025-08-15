import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFavorites, addFavoriteAPI,removeFavoriteAPI } from '../api/favorites';
import { useAuth } from './authContext';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
 const [favorites, setFavorites] = useState([]);
 const {user} =useAuth()


  // Cargar favoritos apenas se inicie la app
  useEffect(() => {
    const load = async () => {
      if (user?.token) {
        await fetchFavorites();
      } else {
        clearFavorites();
      }
    };
    
    load();
  }, [user?.token]);

  //buscar favoritos
  const fetchFavorites = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    try {
      const data = await getFavorites(token);
      const normalized = data.map(fav => ({
        ...fav,
        product: fav.product_detail // creamos la clave product
      }));
      setFavorites(normalized); // o data.products según tu backend
    } catch (err) {
      console.error("Error loading favorites:", err);
    }
  };

  //añadir a favoritos
  const addFavorite = async (productId) => {
    const token = await AsyncStorage.getItem("accessToken");
    try {
      await addFavoriteAPI(productId, token);
      await fetchFavorites();
    } catch (err) {
      console.error('Error adding favorite:', err);
    }
  };


  //eliminar de favoritos
  const removeFavorite = async (productId) => {
    const token = await AsyncStorage.getItem("accessToken");
    try {
      await removeFavoriteAPI(productId, token);
      await fetchFavorites();
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  
  //vaciar favoritos
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