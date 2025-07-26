import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


let logoutCallback = null;


const api = axios.create({
  baseURL: 'http://192.168.0.248:8000',
});

export default api;


export const setLogoutHandler = (fn) => {
  logoutCallback = fn;
};

api.interceptors.response.use(
  res => res,
  async error => {
    const status = error.response?.status;
    if (status === 401) {
      console.warn('Token expirado. Ejecutando logout...');

      await AsyncStorage.multiRemove([
        'accessToken',
        'refreshToken',
        'username',
        'avatar'
      ]);

      if (logoutCallback) logoutCallback(); // ejecuta logout del contexto

      // Opcional: podrías redirigir al login si estás dentro de Router
    }
    return Promise.reject(error);
  }
);