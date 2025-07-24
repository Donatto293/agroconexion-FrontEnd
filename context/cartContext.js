import React, { createContext, useState, useEffect, useContext } from "react";
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
      // Descuento por porcentaje o monto fijo en productos
      if (appliedCoupon.type === 'percentage') {
        productDiscount = newSubtotal * (appliedCoupon.discount / 100);
      } else if (appliedCoupon.type === 'fixed') {
        productDiscount = appliedCoupon.discount;
      }

      // Descuento por envío gratis
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

  // Agregar producto al carrito
  const addToCart = async (product) => {
    const token = await AsyncStorage.getItem("accessToken");
    try {
      await addToCartAPI(product.id, 1, token);
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

  return (
    <CartContext.Provider value={{ 
      cart,
      subtotal,
      discount,
      shippingDiscount,
      shippingCost: SHIPPING_COST,
      total,
      appliedCoupon,
      addToCart,
      removeFromCart,
      clearCart,
      loadCart,
      applyCoupon,
      removeCoupon,
      resetCart
    }}>
      {children}
    </CartContext.Provider>
  );
};