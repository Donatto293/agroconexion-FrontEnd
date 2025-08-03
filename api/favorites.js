import axios from 'axios';
import api from '../utils/axiosInstance';


const API_URL = '/api/users/cart/favorites/';

export const getFavorites = async (token) => {
  const response = await api.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const addFavoriteAPI = async (productId, token) => {
  const response = await api.post(API_URL, 
    { product_id: productId }, 
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const removeFavoriteAPI = async (productId, token) => {
  try{
    const response = await api.delete(`${API_URL}${productId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Removed from favorites:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error removing from favorites:', error);
  }
  
};