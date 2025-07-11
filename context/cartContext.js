import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  getCartAPI,
  addToCartAPI,
  removeFromCartAPI
} from "../api/cart";
import { useRouter } from "expo-router";

export const CartContext = createContext();
const router = useRouter();



export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  // recalcular total cuando cambie el carrito
  useEffect(() => {
    setTotal(cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0));
  }, [cart]);

  // cargar carrito del servidor
  const loadCart = async () => {
    const token = await AsyncStorage.getItem("accessToken");
    try {
      const data = await getCartAPI(token);
      setCart(data.products);
    } catch (err) {
      console.error("Error cargando carrito:", err);
    }
  };

  // al montar, lee el carrito
  useEffect(() => {
    loadCart();
  }, []);

  // agrega un producto
  const addToCart = async (product) => {
  
    const token = await AsyncStorage.getItem("accessToken");
    try {
      await addToCartAPI(product.id, 1, token);
      await loadCart();
    } catch (err) {
      console.error("Error al agregar al carrito:", err.response?.data || err);
    }
  };

  // elimina un producto
  const removeFromCart = async (productId) => {
    console.log("Eliminando producto con ID:", productId);
    const token = await AsyncStorage.getItem("accessToken");
   
    try {
        console.log("Llamando a removeFromCartAPI con ID:", productId);
      await removeFromCartAPI(productId, token);
      console.log("Producto eliminado correctamente");
      await loadCart(); 
         
    } catch (err) {
      console.error("Error al eliminar del carrito:", err.response?.data || err);
    }
  };
// vaciar el carrito
  const clearCart = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      // eliminar cada producto uno a uno
      await Promise.all(
        cart.map(item =>
          // tu item.product.id es el ID real del producto
          removeFromCartAPI(item.product.id, token)
        )
      );
      // volver a cargar (ahora estará vacío)
      await loadCart();

    } catch (err) {
      console.error("Error al vaciar carrito:", err.response?.data || err.message);
    }
  };


  return (
    <CartContext.Provider value={{ cart, total, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};