import React, {createContext, useState, useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const calculateTotal = () => {
            const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
            setTotal(totalAmount);
        };
        calculateTotal();
    }, [cart]);

    const addToCart = async (product) => {
        const existingProduct = cart.find(item => item.id === product.id);
        if (existingProduct) {
            setCart(cart.map(item => 
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
        await AsyncStorage.setItem('cart', JSON.stringify([...cart, product]));
    };

    const removeFromCart = async (productId) => {
        const updatedCart = cart.filter(item => item.id !== productId);
        setCart(updatedCart);
        await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    return (
        <CartContext.Provider value={{ cart, total, addToCart, removeFromCart }}>
            {children}
        </CartContext.Provider>
    );
}