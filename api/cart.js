import axios from 'axios';
import api from '../utils/axiosInstance'

const API_URL = 'api/users/cart/user/cart/';
//cargar carrito
export async function getCartAPI(token) {
    const response = await api.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

//agregar al carrito
export async function addToCartAPI(productId, quantity, token) {
    const response = await api.post(API_URL, { product_id: productId, quantity }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

export async function removeFromCartAPI(productId, token) {

  const response = await api.delete(`/users/cart/cart/${productId}/`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data ?? {};
}