import axios from 'axios';


let logoutCallback = null;
let isLoggingOut = false; // evita llamadas duplicadas

const api = axios.create({
  baseURL: 'http://192.168.20.35:8000',
});




export const setLogoutHandler = (fn) => {
  logoutCallback = fn;
};

api.interceptors.response.use(
  res => res,
  async error => {
    const status = error.response?.status;
    if (status === 401 && logoutCallback && !isLoggingOut) {
      console.warn('Token expirado. Ejecutando logout...');
      try{
        isLoggingOut = true;
        await logoutCallback({reason: 'Token expirado'});
      }finally{
        isLoggingOut = false;
      }
    }
    return Promise.reject(error);
  }
);
export default api;