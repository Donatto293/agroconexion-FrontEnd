import axios from 'axios';

const API_URL = 'http://192.168.0.248:8000/api/users/cart/favorites/';


export const getFavorites = async (token) => {
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const addFavoriteAPI = async (productId, token) => {
  const response = await axios.post(API_URL, 
    { product_id: productId }, 
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const removeFavoriteAPI = async (productId, token) => {
  const response = await axios.delete(`${API_URL}${productId}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};