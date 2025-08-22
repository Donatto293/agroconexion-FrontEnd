import axios from 'axios';
import AsyncStorage
 from '@react-native-async-storage/async-storage';


let logoutCallback = null;
let isLoggingOut = false; // evita llamadas duplicadas

const api = axios.create({
  baseURL: 'http://10.3.146.66:8000',
});

const API_BASE_URL  = api.defaults.baseURL


export const setLogoutHandler = (fn) => {
  logoutCallback = fn;
};



// para gestionar tokens expirados
// Interceptor para manejar tokens expirados
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');


        
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;

          await AsyncStorage.setItem('accessToken', access);

          // actualizar header y reintentar
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Refresh token inválido:", refreshError.response?.data || refreshError.message);

        // Validar si el error es por blacklist o token inválido
        const errorData = refreshError.response?.data || {};
        if (
          errorData.code === "token_not_valid" ||
          errorData.detail?.toLowerCase().includes("blacklisted")
        ) {
          console.warn("⚠️ Token blacklisted, limpiando sesión...");

          // limpiar tokens del storage
          await AsyncStorage.multiRemove(["accessToken", "refreshToken", "username", "profile_image"]);
        }

        // si refresh falla -> logout
        if (logoutCallback && !isLoggingOut) {
          try {
            isLoggingOut = true;
            await logoutCallback();
          } finally {
            isLoggingOut = false;
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);



export default api;