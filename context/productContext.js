
import React, { createContext, useContext,useMemo, useEffect, useState, useCallback } from 'react';


import * as productApi from '../api/products';

const API_URL ='/api/products/list-products/';

const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);      // para carga inicial / refresh
  const [refreshing, setRefreshing] = useState(false); // para pull-to-refresh u operaciones explícitas
  const [error, setError] = useState(null);

  // Cargar productos (list)
  const refreshProducts = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const list = await productApi.listProducts();
      // tu endpoint devuelve array de productos
      setProducts(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('refreshProducts error', err);
      setError(err?.detail || err?.message || 'Error cargando productos');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  // carga inicial
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      setLoading(true);
      try {
        const list = await productApi.listProducts();
        if (mounted) setProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Initial load products error', err);
        if (mounted) setError(err?.detail || err?.message || 'Error cargando productos');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Obtener producto por id desde el estado (sin llamar a la API)
  const getProductById = useCallback((id) => {
    return products.find((p) => String(p.id) === String(id)) ?? null;
  }, [products]);

  // Crear producto. Si backend retorna el objeto creado lo insertamos, si solo devuelve mensaje hacemos refresh.
  const createProduct = useCallback(async (productData = {}, images = []) => {
    try {
      // Opcional: validaciones previas al envío
      const res = await productApi.createProduct(productData, images);
      // Algunos endpoints devuelven el objeto creado, otros solo detail -> manejamos ambos casos
      if (res && (res.id || res.product)) {
        const created = res.product ?? res;
        setProducts((prev) => [created, ...prev]);
        return { success: true, product: created };
      } else {
        // fallback: refrescar la lista para obtener el nuevo producto
        await refreshProducts();
        return { success: true, product: null };
      }
    } catch (err) {
      console.error('createProduct error', err);
      const msg = err?.detail || err?.message || 'Error creando producto';
      Alert.alert('Error', msg);
      return { success: false, error: err };
    }
  }, [refreshProducts]);

  // Actualizar producto. Si el backend devuelve el producto actualizado lo actualizamos localmente.
  const updateProduct = useCallback(async (productId, patch = {}, images = []) => {
    try {
      const res = await productApi.updateProduct(productId, patch, images);
      // Si la respuesta incluye el producto actualizado:
      const updated = res?.product ?? res;
      if (updated && updated.id) {
        setProducts((prev) => prev.map((p) => (String(p.id) === String(updated.id) ? updated : p)));
        return { success: true, product: updated };
      } else {
        // fallback: refrescar
        await refreshProducts();
        return { success: true, product: null };
      }
    } catch (err) {
      console.error('updateProduct error', err);
      const msg = err?.detail || err?.message || 'Error actualizando producto';
      Alert.alert('Error', msg);
      return { success: false, error: err };
    }
  }, [refreshProducts]);

  // Eliminar producto (optimista)
  const deleteProduct = useCallback(async (productId) => {
    // Guardar snapshot para rollback si falla
    const prev = products;
    setProducts((p) => p.filter((item) => String(item.id) !== String(productId)));
    try {
      const res = await productApi.deleteProduct(productId);
      // res.detail esperado
      return { success: true, data: res };
    } catch (err) {
      console.error('deleteProduct error', err);
      // rollback
      setProducts(prev);
      const msg = err?.detail || err?.message || 'Error eliminando producto';
      Alert.alert('Error', msg);
      return { success: false, error: err };
    }
  }, [products]);

  // Exponer valores y funciones
  const contextValue = useMemo(() => ({
    products,
    loading,
    refreshing,
    error,
    refreshProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    setProducts,
  }), [products, loading, refreshing, error]);

  return <ProductContext.Provider value={contextValue}>{children}</ProductContext.Provider>;
};

// Hook consumible
export const useProductsContext = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProductsContext must be used inside ProductProvider');
  return ctx;
};