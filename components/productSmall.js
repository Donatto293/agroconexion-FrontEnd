import useProducts from '../api/products';
import { View, Text, ActivityIndicator, Image, StyleSheet, Pressable, FlatList } from 'react-native';
import { Link } from 'expo-router';
import Carousel from 'react-native-reanimated-carousel';
import { useRouter } from 'expo-router';
import { Dimensions } from 'react-native';

import { useContext } from 'react';
import { CartContext } from '../context/cartContext';
import { FavoritesContext } from '../context/favoritesContext';
import { IconPlus, IconFav } from './icons';


export default function ProductSmall({ products, loading, error }) {
  const router = useRouter();
  const {addToCart} = useContext(CartContext);
  const {addFavorite} = useContext(FavoritesContext);
  const width = Dimensions.get('window').width;

  if (loading) return <ActivityIndicator size="large" color="#00732E" />;
  if (error) return <Text className="text-red-500">{error}</Text>;
  

  return (
    <Carousel
        width={width}
        height={300}
        data={products}
        autoPlay
        scrollAnimationDuration={3000}
        renderItem={({ item: product }) => (
          <View className="bg-white mx-2 p-4 rounded-xl shadow justify-center items-center">
            <Pressable
              onPress={() => addToCart(product)}
              className="absolute top-2 right-2 bg-[#00732E] p-2 rounded-full "
            >
              <IconPlus size={24} color="white" />
            </Pressable>

            <Pressable
              onPress={() => addFavorite(product)}
              className="absolute top-2 right-2 bg-[#00732E] p-2 rounded-full "
            >
              <IconFav size={24} color="red" />
            </Pressable>


         
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
        )}
      />
  );
}