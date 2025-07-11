import axios from 'axios';

/**
 * URL base de la API del backend Django
 * @constant {string}
 */
const API_BASE_URL = 'http://192.168.20.35:8000/api'; // Sin barra final

/**
 * Instancia configurada de axios para todas las peticiones HTTP
 * @constant {AxiosInstance}
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos de timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

/**
 * Servicio para manejar operaciones relacionadas con categorías
 * @namespace categoriesService
 */
export const categoriesService = {
  /**
   * Obtiene todas las categorías disponibles
   * @async
   * @function getAll
   * @returns {Promise<Array>} Lista de categorías
   * @throws {Error} Cuando falla la petición o el formato de respuesta es inválido
   */
  getAll: async () => {
    try {
      // Realiza petición GET al endpoint de categorías
      const response = await api.get('/products/categories/');
      
      // Verifica que la respuesta sea un array
      if (!Array.isArray(response.data)) {
        console.warn('La respuesta no es un array:', response.data);
        throw new Error('Formato de respuesta inesperado');
      }
      
      // Retorna los datos de categorías
      return response.data;
      
    } catch (error) {
      // Log detallado del error
      console.error('Error en categoriesService:', {
        url: `${API_BASE_URL}/products/categories/`,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Lanza error con mensaje amigable
      throw new Error(error.response?.data?.detail || 'Error al obtener categorías');
    }
  }
};

/**
 * Servicio para manejar operaciones relacionadas con productos
 * @namespace productsService
 */
export const productsService = {
  /**
   * Obtiene productos filtrados por categoría
   * @async
   * @function getByCategory
   * @param {number|string} categoryId - ID de la categoría
   * @returns {Promise<Array>} Lista de productos
   * @throws {Error} Cuando falla la petición o el formato de respuesta es inválido
   */
  getByCategory: async (categoryId) => {
    try {
      // Realiza petición GET con parámetro de categoría
      const response = await api.get('/products/list-products/', {
        params: {
          category: categoryId
        }
      });

      // Verifica que la respuesta sea un array
      if (!Array.isArray(response.data)) {
        console.warn('Respuesta de productos inesperada:', response.data);
        throw new Error('Formato de productos inválido');
      }

      // Retorna los datos de productos
      return response.data;

    } catch (error) {
      // Log detallado del error
      console.error('Error al obtener productos por categoría:', {
        categoryId,
        status: error.response?.status,
        error: error.response?.data || error.message
      });
      
      // Lanza error con mensaje amigable
      throw new Error(error.response?.data?.detail || 'Error al cargar productos');
    }
  },

  /**
   * Obtiene detalles de un producto específico
   * @async
   * @function getProductDetail
   * @param {number|string} productId - ID del producto
   * @returns {Promise<Object>} Detalles del producto
   * @throws {Error} Cuando falla la petición
   */
  getProductDetail: async (productId) => {
    try {
      // Realiza petición GET al endpoint de detalle de producto
      const response = await api.get(`/product/${productId}/`);
      return response.data;
    } catch (error) {
      // Log detallado del error
      console.error('Error al obtener detalle de producto:', {
        productId,
        error: error.response?.data || error.message
      });
      
      // Lanza error con mensaje amigable
      throw new Error(error.response?.data?.detail || 'Error al cargar el producto');
    }
  }
};

/**
 * Interceptor global para manejo de errores
 * @function responseInterceptor
 */
api.interceptors.response.use(
  // Función para respuesta exitosa
  response => response,
  
  // Función para manejo de errores
  error => {
    // Maneja específicamente errores de timeout
    if (error.code === 'ECONNABORTED') {
      throw new Error('Tiempo de espera agotado. Verifica tu conexión');
    }
    return Promise.reject(error);
  }
);