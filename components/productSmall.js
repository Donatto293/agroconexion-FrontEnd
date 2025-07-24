import useProducts from '../api/products';
import { View,  ActivityIndicator, Image, StyleSheet, Pressable, FlatList } from 'react-native';
import { Link } from 'expo-router';
import Carousel from 'react-native-reanimated-carousel';
import { useRouter } from 'expo-router';
import { Dimensions } from 'react-native';
import { TouchableRipple, Portal, Modal, Text, Button, Provider } from 'react-native-paper';

import React, { useContext, useEffect, useState } from 'react';
import { CartContext } from '../context/cartContext';
import { FavoritesContext } from '../context/favoritesContext';
import { IconPlus, IconFav, IconFavnot } from './icons';
import { useAuth } from '../context/authContext';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';


export default function ProductSmall({ products, loading, error }) {
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const showLoginAlert = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  //animacion de boton plus de agregar al carrito
  const scale= useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => {
  return {
    transform: [{ scale: scale.value }],
  };
})

  const hideModal = () => setShowModal(false);
  
  const { user } = useAuth();
  const router = useRouter();
  const {addToCart} = useContext(CartContext);
  const {favorites, addFavorite, removeFavorite} = useContext(FavoritesContext);
  const width = Dimensions.get('window').width;
// Estado para manejar favoritos individualmente
  const [favoritesState, setFavoritesState] = useState({});
  const [isProcessing, setIsProcessing] = useState(false); // para evitar múltiples clics

  // Actualizar estado local cuando cambia el contexto
  useEffect(() => {
    const updatedState = {};
    favorites.forEach(fav => {
      if (fav.product?.id) {
        updatedState[fav.product.id] = true;
      }
      });
      setFavoritesState(updatedState);
    }, [favorites]);
  if (loading) return <ActivityIndicator size="large" color="#00732E" />;
  if (error) return <Text className="text-red-500">{error}</Text>;
 
return (
  <View>
    <Carousel
      width={width}
      height={300}
      data={products}
      autoPlay
      scrollAnimationDuration={3000}
      renderItem={({ item: product }) => {
        const isFavorite = favoritesState[product.id] === true;

        const handleToggleFavorite = async () => {
          if (!user) {
            showLoginAlert('Debes iniciar sesión para agregar a favoritos');
            return;
          }
          if (isFavorite) {
            await removeFavorite(product.id);
          } else {
            await addFavorite(product.id);
          }

          // Actualizar inmediatamente el estado local
          setFavoritesState(prev => ({
            ...prev,
            [product.id]: !isFavorite
          }));
        };

        return (
          <View className="bg-white mx-2 p-4 rounded-xl shadow justify-center items-center">
            <TouchableRipple
              onPress={() => {
                if (!user) return showLoginAlert('Debes iniciar sesión para agregar al carrito');
                addToCart(product)
              }}
              onPressIn={() => (scale.value = withSpring(0.9))}
              onPressOut={() => (scale.value = withSpring(1))}
              rippleColor="rgba(0, 115, 46, 0.3)"
              borderless
              style={{ position: 'absolute', top: 10, right: 10, borderRadius: 999 }}
            >
              <Animated.View style={[animatedStyle, { backgroundColor: '#00732E', padding: 8, borderRadius: 999 }]}>
                <IconPlus size={24} color="white" />
              </Animated.View>
            </TouchableRipple>

            {/* BOTÓN FAVORITOS (esquina inferior derecha) */}
            <TouchableRipple
              onPress={handleToggleFavorite}
              
              rippleColor="rgba(255, 0, 0, 0.2)"
              borderless
              style={{ position: 'absolute', bottom: 10, right: 10, borderRadius: 999 }}
            >
              <View className="bg-white p-2 rounded-full border border-red-300">
               {isFavorite ? (
                <IconFavnot name="heart-outline" size={24} color="gray" />
                  
                ) : (
                  <IconFav name="heart" size={24} color="red" />
                )}
              </View>
            </TouchableRipple>

            <Pressable  onPress={() =>
                                  router.push({
                                    pathname: `/${product.id}`,
                                    params: { product: JSON.stringify(product) }
                                  })
                                } >
              <Text className="text-xl font-semibold mb-2">{product.title}</Text>
              <Image
                source={{ uri: product.image }}
                className="w-full h-40 rounded mb-2"
                resizeMode="cover"
              />
              <Text className="text-green-600 font-bold">${product.price}</Text>
            </Pressable>
          </View>
        );
      }}
    />
    <Portal>
      <Modal
        visible={showModal}
        onDismiss={hideModal}
        contentContainerStyle={{
          backgroundColor: 'white',
          padding: 20,
          margin: 20,
          borderRadius: 12,
        }}
      >
        <Text style={{ fontSize: 18, marginBottom: 20 }}>{modalMessage}</Text>
        <Button mode="contained" onPress={hideModal} buttonColor="#00732E">
          Cerrar
        </Button>
      </Modal>
    </Portal>
  </View>
);


}

