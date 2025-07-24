import axios from 'axios';
import { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import api from '../utils/axiosInstance';

const API_URL ='/api/products/list-products/';

export default function useProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get(API_URL);
                setProducts(response.data);
            } catch (err) {
                setError(err.message || 'Error cargando productos');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);
  

    return { products, loading, error };
}