import React, { useState, useRef } from 'react';
import { Animated, View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IconCoupons, IconShoppingCart,IconFavorites, IconHome, IconCategories , IconDiscount, IconUser} from '../icons';
import Login from '../../app/login';
import { Link } from 'expo-router';


export default function Menu() {
    const [menuOpen, setMenuOpen] = useState(false);
    const slideAnim = useRef(new Animated.Value(-300)).current;
    const overlayAnim = useRef(new Animated.Value(0)).current;

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
                <Link href={{
                                    pathname: `/login`
                                    
            
                                }} aschild>
                    <View className="flex-row items-center bg-[#00732E] w-full h-16 justify-center ">
                        <IconUser />
                        <Text className="text-white text-lg font-bold ml-2">Inicia Sesion</Text>
                    </View>
                </Link>
                    
                <TouchableOpacity className="w-full flex-row justify-center items-center px-4 py-3 ">
                    <IconHome size={24} color="#4a5568" />
                    <Text className="text-lg text-gray-800">Inicio</Text>
           
                </TouchableOpacity>
                    
                    
                <TouchableOpacity className="w-full flex-row justify-center items-center px-4 py-3 ">
                        <IconShoppingCart/>
                        <Text className="text-lg text-gray-800">Carrito</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity className="w-full flex-row justify-center items-center px-4 py-3 ">
                        <IconFavorites/>
                        <Text className="text-lg text-gray-800">Favoritos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="w-full flex-row justify-center items-center px-4 py-3 ">
                        <IconCoupons/>
                        <Text className="text-lg text-gray-800">Cupones</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="w-full flex-row justify-center items-center px-4 py-3 ">
                        <IconDiscount/>
                        <Text className="text-lg text-gray-800">Ofertas</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="w-full flex-row justify-center items-center px-4 py-3 ">
                        <IconCategories/>
                        <Text className="text-lg text-gray-800">Categorias</Text>
                    </TouchableOpacity>

            </View>
        
        
      </Animated.View>
    )}
    </>
   
    );
  };

  
  
  