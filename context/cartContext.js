import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCartAPI, addToCartAPI, removeFromCartAPI } from "../api/cart";

export const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shippingDiscount, setShippingDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const SHIPPING_COST = 5; // Costo fijo de envío

  // Calcular totales
  useEffect(() => {
    const newSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    setSubtotal(newSubtotal);

    let productDiscount = 0;
    let newShippingDiscount = 0;

    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        productDiscount = newSubtotal * (appliedCoupon.discount / 100);
      } else if (appliedCoupon.type === 'fixed') {
        productDiscount = appliedCoupon.discount;
      }

      if (appliedCoupon.freeShipping) {
        newShippingDiscount = SHIPPING_COST;
      }
    }

    setDiscount(productDiscount);
    setShippingDiscount(newShippingDiscount);
    setTotal(Math.max(0, newSubtotal - productDiscount + SHIPPING_COST - newShippingDiscount));
  }, [cart, appliedCoupon]);

  // Cargar carrito del servidor
  const loadCart = async () => {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) {
      console.warn("No token disponible para cargar el carrito");
      return;
    }
    try {
      const data = await getCartAPI(token);
      setCart(data.products);
    } catch (err) {
      console.error("Error cargando carrito:", err);
    }
  };

  // Aplicar cupón
  const applyCoupon = (coupon) => {
    if (subtotal >= coupon.minPurchase) {
      setAppliedCoupon({
        id: coupon.id,
        code: coupon.code,
        discount: coupon.discount || 0,
        type: coupon.discount > 0 ? 'percentage' : 'fixed',
        minPurchase: coupon.minPurchase,
        freeShipping: coupon.freeShipping || false
      });
      return true;
    }
    return false;
  };

  // Remover cupón
  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Agregar producto al carrito (MODIFICADO)
  const addToCart = async (product) => {
    const token = await AsyncStorage.getItem("accessToken");
    try {
      // Usamos product.quantity en lugar de 1
      await addToCartAPI(product.id, product.quantity || 1, token);
      await loadCart();
    } catch (err) {
      console.error("Error al agregar al carrito:", err.response?.data || err);
    }
  };

  // Eliminar producto del carrito
  const removeFromCart = async (productId) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return;
    try {
      await removeFromCartAPI(productId, token);
      await loadCart();
    } catch (err) {
      console.error("Error al eliminar del carrito:", err.response?.data || err);
    }
  };

  // Vaciar carrito
  const clearCart = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      await Promise.all(
        cart.map(item => removeFromCartAPI(item.product.id, token))
      );
      await loadCart();
      removeCoupon();
    } catch (err) {
      console.error("Error al vaciar carrito:", err.response?.data || err.message);
    }
  };

  const resetCart = () => setCart([]);

  const contextValue = useMemo(() => ({
    cart,
    subtotal,
    discount,
    shippingDiscount,
    shippingCost: SHIPPING_COST,
    total,
    appliedCoupon,
    loadCart,
    addToCart,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    resetCart: () => setCart([])
  }), [
    cart,
    subtotal,
    discount,
    shippingDiscount,
    total,
    appliedCoupon,
    loadCart,
    addToCart,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};