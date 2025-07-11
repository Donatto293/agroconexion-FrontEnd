import React, { useState, useRef, useEffect, useContext} from 'react';
import { Animated, View, Text, TouchableOpacity, TouchableWithoutFeedback, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IconCoupons, IconShoppingCart,IconFavorites, IconHome, IconCategories , IconDiscount, IconUser} from '../icons';

import { Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';


import { CartContext } from '../../context/cartContext';
import { FavoritesContext } from '../../context/favoritesContext';
export default function Menu() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [username, setUsername] = useState(null);
    const [avatar, setAvatar] = useState(null);

    const slideAnim = useRef(new Animated.Value(-300)).current;
    const overlayAnim = useRef(new Animated.Value(0)).current;
    {/* carrito*/}
    const { cart, total, addToCart, removeFromCart } = useContext(CartContext);
    {/* favoritos */}
    const { favorites, addFavorite, removeFavorite, fetchFavorites } = useContext(FavoritesContext);

    const toggleMenu = () => {
        if (menuOpen) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -300,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(overlayAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start(() => setMenuOpen(false));
        } else {
            setMenuOpen(true);
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(overlayAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        }
    };
     useEffect(() => {
        const getUser = async () => {
            const name = await AsyncStorage.getItem('username');
            const avatarUrl = await AsyncStorage.getItem('avatar');
            
            setUsername(name); // null si no hay sesión
           
            if (name) {
                console.log('Usuario actual:', name);
                console.log('Avatar URL:', avatarUrl);
            } else {
                console.log('No hay usuario logueado');
            }
        };
        getUser();
     }, []); 
     const handleLogout = async () => {
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('username');
        await AsyncStorage.removeItem('avatar');
        setUsername(null);
        setAvatar(null);
        setMenuOpen(false);
        router.replace('/'); // redirige a la página principal
    };

  
    return (
        <>
      
        {/* Botón del menú */}
        <TouchableOpacity onPress={toggleMenu}  className=" z-50  top-1  ">
          <Ionicons name={menuOpen ? 'close' : 'menu'} 
                    size={32} 
                    color={menuOpen ? 'white' : 'black'} 
                />
        </TouchableOpacity>

        {/* Fondo semitransparente */}
        {menuOpen && (
                <TouchableWithoutFeedback onPress={toggleMenu}>
                    <Animated.View 
                        className="absolute inset-0 bg-red/50 z-40"
                        style={{ opacity: overlayAnim }}
                    />
                </TouchableWithoutFeedback>
            )}
  {/* Panel del menú (solo se renderiza cuando está abierto) */}
  {menuOpen && (
                <Animated.View 
                    className="absolute  top-16 left-0 w-72 bg-gray-300 rounded-lg z-50"
                    style={{ 
                        transform: [{ translateX: slideAnim }],
                        shadowOpacity: overlayAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 0.3]
                        }),
                        zIndex: 40
                    }}
                >
            {/* Contenido del menú */}
            
                <View className="  h-300 justify-center items-center "> 
                <Link href={username ? "/" : "/login"} asChild>
                    <TouchableOpacity className="flex-row items-center bg-[#00732E] w-full h-16 justify-center">
                          {username && avatar ? (
                            <Image
                                source={{ uri: avatar }}
                                className="w-10 h-10 rounded-full"
                                resizeMode="cover"
                            />
                            ) : (
                                <IconUser />
                            )}
                        <Text className="text-white text-lg font-bold ml-2">
                            {username ? `Hola, ${username}` : 'Inicia Sesión'}
                        </Text>
                    </TouchableOpacity>
                </Link>
                    
                <TouchableOpacity className="w-full flex-row justify-center items-center px-4 py-3 ">
                    <IconHome size={24} color="#4a5568" />
                    <Text className="text-lg text-gray-800">Inicio</Text>
           
                </TouchableOpacity>

                    <Link href={ username ? "/cart" : "/login"} asChild>
                    <TouchableOpacity className="w-full flex-row justify-center items-center px-4 py-3 ">
                            <IconShoppingCart/>
                            <Text className="text-lg text-gray-800">Carrito
                                {cart.length > 0 && ` (${cart.length})`}
                            </Text>
                        </TouchableOpacity>
                    </Link>
                    <Link href={username ? "/favorites" : "/login"} asChild>
                    <TouchableOpacity className="w-full flex-row justify-center items-center px-4 py-3">
                        <IconFavorites />
                        <Text className="text-lg text-gray-800">
                        Favoritos {favorites.length > 0 && `(${favorites.length})`}
                        </Text>
                    </TouchableOpacity>
                    </Link>
                    <Link href="/cupones" asChild>
                        <TouchableOpacity className="w-full flex-row justify-center items-center px-4 py-3 ">
                            <IconCoupons/>
                            <Text className="text-lg text-gray-800">Cupones</Text>
                        </TouchableOpacity>
                    </Link>

                    <TouchableOpacity className="w-full flex-row justify-center items-center px-4 py-3 ">
                        <IconDiscount/>
                        <Text className="text-lg text-gray-800">Ofertas</Text>
                    </TouchableOpacity>

                    <Link href="/categorias" asChild>
                        <TouchableOpacity className="w-full flex-row justify-center items-center px-4 py-3">
                            <IconCategories />
                            <Text className="text-lg text-gray-800">Categorías</Text>
                        </TouchableOpacity>
                    </Link>
                    {/* Cerrar sesión */}
                    {username && (
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="w-full flex-row justify-center items-center px-4 py-3 mt-2 bg-red-100 rounded"
                    >
                        <Ionicons name="log-out-outline" size={22} color="#dc2626" />
                        <Text className="text-red-600 text-base ml-2">Cerrar sesión</Text>
                    </TouchableOpacity>
                    )}

            </View>
        
        
      </Animated.View>
    )}
    </>
   
    );
  };

  
  
  