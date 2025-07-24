import axios from 'axios';
import api from '../utils/axiosInstance';


const API_URL = '/users/cart/favorites/';

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
  const response = await api.delete(`${API_URL}${productId}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};