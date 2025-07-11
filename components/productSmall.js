import useProducts from '../api/products';
import { View, Text, ActivityIndicator, Image, StyleSheet, Pressable, FlatList } from 'react-native';
import { Link } from 'expo-router';
import Carousel from 'react-native-reanimated-carousel';
import { useRouter } from 'expo-router';
import { Dimensions } from 'react-native';
import { TouchableRipple } from 'react-native-paper';

import { useContext, useEffect, useState } from 'react';
import { CartContext } from '../context/cartContext';
import { FavoritesContext } from '../context/favoritesContext';
import { IconPlus, IconFav, IconFavnot } from './icons';


export default function ProductSmall({ products, loading, error }) {
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
    <Carousel
        width={width}
        height={300}
        data={products}
        autoPlay
        scrollAnimationDuration={3000}
        renderItem={({ item: product }) => {
          const isFavorite = favoritesState[product.id] === true;

          const handleToggleFavorite = async () => {
            if (isProcessing) return; // evita múltiples clics
            setIsProcessing(true);
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
                onPress={() => addToCart(product)}
                rippleColor="rgba(0, 115, 46, 0.3)"
                borderless
                style={{ position: 'absolute', top: 10, right: 10, borderRadius: 999 }}
              >
                <View className="bg-[#00732E] p-2 rounded-full">
                  <IconPlus size={24} color="white" />
                </View>
              </TouchableRipple>

              {/* BOTÓN FAVORITOS (esquina inferior derecha) */}
              <TouchableRipple
                onPress={handleToggleFavorite}
                disabled={isProcessing}
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
  );
}