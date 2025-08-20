import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCartAPI, addToCartAPI, removeFromCartAPI } from "../api/cart";
import { useAuth } from "./authContext";
import { Alert } from "react-native";

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
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const SHIPPING_COST = 5; // Costo fijo de envío

  const { user } = useAuth();

  useEffect(() => {
    if (user?.token) {
      loadCart();
    } else {
      setCart([]);
    }
  }, [user?.token]);

  const loadCart = async () => {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return;
    try {
      const data = await getCartAPI(token);
      const itemsWithSelection = data.products.map(item => ({
        ...item,
        selected: true,
      }));
      setCart(itemsWithSelection);
    } catch (err) {
      console.error("Error cargando carrito:", err);
    }
  };

  const toggleProductSelection = useCallback((productId) => {
    setCart(currentCart =>
      currentCart.map(item =>
        item.product.id === productId ? { ...item, selected: !item.selected } : item
      )
    );
  }, []);

  const areAllSelected = useMemo(() => cart.length > 0 && cart.every(item => item.selected), [cart]);

  const toggleSelectAll = useCallback(() => {
    const nextState = !areAllSelected;
    setCart(currentCart => currentCart.map(item => ({ ...item, selected: nextState })));
  }, [areAllSelected]);

  const increaseQuantity = useCallback(async (productId) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return;
    try {
      await addToCartAPI(productId, 1, token);
      await loadCart();
    } catch (err) {
      console.error("Error al aumentar la cantidad:", err.response?.data || err);
    }
  }, []);

  const decreaseQuantity = useCallback(async (productId) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return;
    
    const item = cart.find(i => i.product.id === productId);
    if (item && item.quantity > 1) {
      try {
        await addToCartAPI(productId, -1, token);
        await loadCart();
      } catch (err) {
        console.error("Error al disminuir la cantidad:", err.response?.data || err);
      }
    } else {
      await removeFromCart(productId);
    }
  }, [cart]);

  // *** FUNCIÓN CLAVE AÑADIDA PARA SOLUCIONAR EL PROBLEMA ***
  const updateQuantity = useCallback(async (productId, newQuantity) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return;

    const item = cart.find(i => i.product.id === productId);
    const stock = item?.product?.stock ?? 0;

    let finalQuantity = parseInt(newQuantity, 10);

    if (isNaN(finalQuantity) || finalQuantity < 1) {
      finalQuantity = 1;
    } else if (finalQuantity > stock) {
      finalQuantity = stock;
    }

    if (finalQuantity !== item.quantity) {
      try {
        await addToCartAPI(productId, finalQuantity - item.quantity, token);
        await loadCart();
      } catch (err) {
        Alert.alert("Error", err.response?.data.detail || "Error al actualizar la cantidad");
        console.error("Error al actualizar la cantidad:", err);
      }
    }
  }, [cart]);

  const { subtotal, discount, shippingDiscount, total, selectedItemsCount } = useMemo(() => {
    const selectedItems = cart.filter(item => item.selected);
    const newSubtotal = selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    let productDiscount = 0;
    let newShippingDiscount = 0;

    if (appliedCoupon && newSubtotal >= appliedCoupon.minPurchase) {
      if (appliedCoupon.type === 'percentage') {
        productDiscount = newSubtotal * (appliedCoupon.discount / 100);
      } else if (appliedCoupon.type === 'fixed') {
        productDiscount = appliedCoupon.discount;
      }
      if (appliedCoupon.freeShipping) {
        newShippingDiscount = SHIPPING_COST;
      }
    }
    
    const finalTotal = Math.max(0, newSubtotal - productDiscount + SHIPPING_COST - newShippingDiscount);

    return {
      subtotal: newSubtotal,
      discount: productDiscount,
      shippingDiscount: newShippingDiscount,
      total: finalTotal,
      selectedItemsCount: selectedItems.length,
    };
  }, [cart, appliedCoupon]);

  const applyCoupon = (coupon) => {
    if (subtotal >= coupon.minPurchase) {
      setAppliedCoupon(coupon);
      return true;
    }
    return false;
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const removeFromCart = async (productId) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return;
    try {
      await removeFromCartAPI(productId, token);
      await loadCart();
    } catch (err) {
      console.error("Error al eliminar del carrito:", err);
    }
  };

  const clearCart = async () => {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) return;
    try {
      await Promise.all(
        cart.map(item => removeFromCartAPI(item.product.id, token))
      );
      await loadCart();
      removeCoupon();
    } catch (err) {
      console.error("Error al vaciar carrito:", err);
    }
  };

  const contextValue = useMemo(() => ({
    cart,
    subtotal,
    discount,
    shippingDiscount,
    shippingCost: SHIPPING_COST,
    total,
    appliedCoupon,
    areAllSelected,
    selectedItemsCount,
    loadCart,
    addToCart: async (product, quantity) => {
      const token = await AsyncStorage.getItem("accessToken");
      await addToCartAPI(product.id, quantity, token);
      await loadCart();
    },
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    toggleProductSelection,
    toggleSelectAll,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity, // Asegúrate de exportar la nueva función
    resetCart: () => setCart([])
  }), [
    cart, subtotal, discount, shippingDiscount, total, appliedCoupon, areAllSelected, selectedItemsCount,
    toggleProductSelection, toggleSelectAll, increaseQuantity, decreaseQuantity, removeFromCart, clearCart, updateQuantity
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};