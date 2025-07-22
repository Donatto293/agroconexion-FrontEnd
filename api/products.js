import axios from 'axios';
import { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';

const API_URL ='http://192.168.0.248:8000/api/products/list-products/';

export default function useProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(API_URL);
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