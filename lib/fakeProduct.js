import axios from 'axios';
import { useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';

const API_URL ='https://fakestoreapi.com/products';

export default function useFakeProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(API_URL);
                setProducts(response.data);
            } catch (err) {
                setError(err.message || 'Error cargando products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);
  

    return { products, loading, error };
}