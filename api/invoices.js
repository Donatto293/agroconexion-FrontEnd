import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/axiosInstance';

const BASE_URL = '/api/invoices';
// llamados list-invoice/ ----- GET
// llamados invoice/<int:id>/ ----- 
// llamados invoice/from-cart/ ----- 

// Crear factura a partir del carrito
export async function createInvoiceFromCart(method = 'efectivo') {
  const token = await AsyncStorage.getItem('accessToken');
  const url = `${BASE_URL}/from-cart/`;
  const response = await api.post(
    url,
    { method },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;  
}

// Listar facturas del usuario
export async function listInvoices() {
  const token = await AsyncStorage.getItem('accessToken');
  const url = `${BASE_URL}/list-invoice/`;
  const response = await api.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;  
}

// Detalle de una factura
export async function getInvoiceDetail(invoiceId) {
  const token = await AsyncStorage.getItem('accessToken');
  const url = `${BASE_URL}/detail/${invoiceId}/`;
  const response = await api.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}