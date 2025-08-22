
import api from '../utils/axiosInstance'; // tu instancia axios (con baseURL ya configurada)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const ENDPOINTS = {
  list: '/api/products/list-products/',
  categories: '/api/products/categories/',
  productsByCategory: (id) => `/api/products/categories/${id}/`,
  myProducts: '/api/products/my-products/',
  detail: (id) => `/api/products/detail/${id}/`,
  newProduct: '/api/products/new-product/',
  editProduct: (id) => `/api/products/edit-product/${id}/`,
  deleteProduct: (id) => `/api/products/delete-product/${id}/`,
  comments: (productId) => `/api/products/comments/${productId}/`,
  newComment: '/api/products/new-comment/',
  editComment: (id) => `/api/products/edit-comment/${id}/`,
  deleteComment: (id) => `/api/products/delete-comment/${id}/`,
  newRating: '/api/products/new-rating/',
  deleteRating: (id) => `/api/products/delete-rating/${id}/`,
  statsRating: (id) => `/api/products/stats_rating/${id}/`,
};
const BASE_URL = api.defaults.baseURL

async function getAuthHeader() {
  const token = await AsyncStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleError(err) {
  // Uniformiza el error
  if (err?.response?.data) return Promise.reject(err.response.data);
  return Promise.reject(err?.message || err);
}



/* ---------- Productos ---------- */

export async function listProducts() {
  try {
    const res = await api.get(ENDPOINTS.list);
    return res.data; // array de productos
  } catch (err) {
    return handleError(err);
  }
}

export async function myProducts() {
  try {
    const headers = await getAuthHeader();
    const res = await api.get(ENDPOINTS.myProducts, { headers });
    return res.data; // object con products, user_id, total_products...
  } catch (err) {
    return handleError(err);
  }
}

export async function getProductDetail(productId) {
  try {
    const res = await api.get(ENDPOINTS.detail(productId));
    return res.data;
  } catch (err) {
    return handleError(err);
  }
}

/**
 * createProduct
 * form con los datos 
 */
export async function createProduct(form) {

  try {
    const url = `${api.defaults.baseURL}${ENDPOINTS.newProduct}`;

    // NOTA: NO poner header 'Content-Type' dejando que fetch lo genere.
    const token = await AsyncStorage.getItem('accessToken');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
         Authorization: `Bearer ${token}`
      },
      body: form,
    });

    //PRUEBA CON AXIOS 
    // await api.post(
    //   ENDPOINTS.newProduct,
    //   form,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //       // NO Content-Type: multipart/form-data (Axios lo inyecta con boundary)
    //     },
    //   }
    // );

    const text = await response.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

    console.log('createProductFetch status:', response.status, 'body:', data);

    if (!response.ok) {
      const err = new Error('Error en crear producto');
      err.response = { status: response.status, data };
      throw err;
    }

    return data;
  } catch (err) {
    console.error('createProductFetch error:', err);
    throw err;
  }
}
/**
 * updateProduct
 * @param {number|string} productId
 * @param {Object} patch - campos a actualizar (puede venir como current_product o normal)
 * @param {Array} images - imágenes nuevas a adjuntar (opcional)
 */
export async function updateProduct(productId, patch = {}, images = []) {
  try {
    const headers = await getAuthHeader();
    // Usamos FormData para soportar imagenes; si no hay images podemos enviar JSON via put
    if (images && images.length > 0) {
      const form = new FormData();
      // El backend espera a veces campos dentro de 'current_product' -> pero tu vista acepta partial JSON también
      // Para compatibilidad, enviamos directamente los campos
      Object.keys(patch).forEach((k) => {
        const v = patch[k];
        if (Array.isArray(v)) {
          v.forEach((vv) => form.append(k, String(vv)));
        } else if (v !== undefined && v !== null) {
          form.append(k, String(v));
        }
      });
      images.forEach((img, idx) => {
        if (typeof img === 'string') {
          form.append('images', { uri: img, name: `img_${Date.now()}_${idx}.jpg`, type: 'image/jpeg' });
        } else {
          form.append('images', img);
        }
      });

      const res = await api.put(ENDPOINTS.editProduct(productId), form, {
        headers: { 'Content-Type': 'multipart/form-data', ...headers },
      });
      return res.data;
    } else {
      // No hay imágenes -> envío JSON parcial
      const res = await api.put(ENDPOINTS.editProduct(productId), patch, {
        headers: { 'Content-Type': 'application/json', ...headers },
      });
      return res.data;
    }
  } catch (err) {
    return handleError(err);
  }
}

export async function deleteProduct(productId) {
  try {
    const headers = await getAuthHeader();
    const res = await api.delete(ENDPOINTS.deleteProduct(productId), { headers });
    return res.data;
  } catch (err) {
    return handleError(err);
  }
}

/* ---------- Categorías ---------- */

export async function listCategories() {
  try {
    const res = await api.get(ENDPOINTS.categories);
    return res.data;
  } catch (err) {
    return handleError(err);
  }
}

export async function productsByCategory(categoryId) {
  try {
    const res = await api.get(ENDPOINTS.productsByCategory(categoryId));
    return res.data;
  } catch (err) {
    return handleError(err);
  }
}

/* ---------- Comentarios ---------- */

export async function getComments(productId) {
  try {
    const res = await api.get(ENDPOINTS.comments(productId));
    return res.data;
  } catch (err) {
    return handleError(err);
  }
}

export async function newComment(payload = {}) {
  try {
    const headers = await getAuthHeader();
    // payload puede contener text y images -> si hay images usamos FormData
    if (payload.images && payload.images.length > 0) {
      const form = new FormData();
      Object.keys(payload).forEach((k) => {
        if (k !== 'images') {
          form.append(k, String(payload[k]));
        }
      });
      payload.images.forEach((img, i) => {
        if (typeof img === 'string') {
          form.append('images', { uri: img, name: `img_${i}.jpg`, type: 'image/jpeg' });
        } else form.append('images', img);
      });
      const res = await api.post(ENDPOINTS.newComment, form, {
        headers: { 'Content-Type': 'multipart/form-data', ...headers },
      });
      return res.data;
    } else {
      const res = await api.post(ENDPOINTS.newComment, payload, {
        headers: { 'Content-Type': 'application/json', ...await getAuthHeader() },
      });
      return res.data;
    }
  } catch (err) {
    return handleError(err);
  }
}

export async function editComment(commentId, payload = {}) {
  try {
    const headers = await getAuthHeader();
    const res = await api.put(ENDPOINTS.editComment(commentId), payload, { headers });
    return res.data;
  } catch (err) {
    return handleError(err);
  }
}

export async function deleteComment(commentId) {
  try {
    const headers = await getAuthHeader();
    const res = await api.delete(ENDPOINTS.deleteComment(commentId), { headers });
    return res.data;
  } catch (err) {
    return handleError(err);
  }
}

/* ---------- Ratings ---------- */

export async function newRating(payload = {}) {
  try {
    const headers = await getAuthHeader();
    const res = await api.post(ENDPOINTS.newRating, payload, { headers });
    return res.data;
  } catch (err) {
    return handleError(err);
  }
}

export async function deleteRating(gradeId) {
  try {
    const headers = await getAuthHeader();
    const res = await api.delete(ENDPOINTS.deleteRating(gradeId), { headers });
    return res.data;
  } catch (err) {
    return handleError(err);
  }
}

export async function statsRating(productId) {
  try {
    const res = await api.get(ENDPOINTS.statsRating(productId));
    return res.data;
  } catch (err) {
    return handleError(err);
  }
}

export default {
  listProducts,
  myProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
  listCategories,
  productsByCategory,
  getComments,
  newComment,
  editComment,
  deleteComment,
  newRating,
  deleteRating,
  statsRating,
};
