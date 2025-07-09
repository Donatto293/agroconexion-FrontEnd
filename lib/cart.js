import axios from 'axios';

const API_URL = 'http://192.168.20.35:8000/api/users/cart/user/cart/';
//cargar carrito
export async function getCartAPI(token) {
    const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

//agregar al carrito
export async function addToCartAPI(productId, quantity, token) {
    const response = await axios.post(API_URL, { product_id: productId, quantity }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
}

export async function removeFromCartAPI(productId, token) {
   const url = `http://192.168.20.35:8000/api/users/cart/cart/${productId}/`;

  const response = await axios.delete(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
 return response.data;

 
}