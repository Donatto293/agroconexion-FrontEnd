import axios from 'axios';

const API_URL = 'http://10.3.145.44:8000/api/users/cart/favorites/';

export const getFavorites = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw error;
  }
};

export const addFavoriteAPI = async (productId) => {
  try {
    const response = await axios.post(API_URL, { productId });
    return response.data;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
};

export const removeFavoriteAPI = async (productId) => {
  try {
    const response = await axios.delete(`${API_URL}${productId}/`);
    return response.data;
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};