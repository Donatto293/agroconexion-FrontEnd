
import api from "../utils/axiosInstance";

export const API_URL = api.defaults.baseURL; // Reemplaza con tu URL real
export const ENABLED_FEATURES = {
  ORDERS: true,      // Cambia a false si no tienes este endpoint
  FAVORITES: true,   // Cambia a false si no tienes este endpoint
  PAYMENTS: true,    // Cambia a false si no tienes este endpoint
  ADDRESSES: true    // Cambia a false si no tienes este endpoint
};