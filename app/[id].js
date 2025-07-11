import { View, Text, Image, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useProducts from '../api/products';
import { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/cartContext';
import { FavoritesContext } from '../context/favoritesContext'
import { IconFav, IconFavnot } from '../components/icons';
import { Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProductDetail() {
  const { id } = useLocalSearchParams();     // recibimos solo el ID
  const { products, loading, error } = useProducts();
  const { addToCart } = useContext(CartContext);
   const { favorites, addFavorite, removeFavorite } = useContext(FavoritesContext);
  const router = useRouter();

  const [isFavorite, setIsFavorite] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
    // Verificamos si está en favoritos (al montar o cuando cambia)
  useEffect(() => {
    if (productData) {
      const exists = favorites.some(fav => fav.product.id === productData.id);
      setIsFavorite(exists);
    }
  }, [favorites, productData]);

  const handleToggleFavorite = async () => {
     if (isProcessing) return; // evita múltiples clics
      setIsProcessing(true)
    if (!productData) return;

    if (isFavorite) {
      await removeFavorite(productData.id);
    } else {
      await addFavorite(productData.id);
    }

    // Invertir el estado local manualmente para mostrar efecto inmediato
    setIsFavorite(!isFavorite);
  };
  if (loading) return <ActivityIndicator size="large" color="#00732E" />;
  if (error) return <Text className="text-red-500">{error}</Text>;

  // Buscamos el producto por id (asegúrate de comparar strings)
  const productData = products.find(p => String(p.id) === id);


  if (!productData) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Producto no encontrado.</Text>
      </View>
    );
  }
  

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <Text className="text-blue-500">← Volver</Text>
      </TouchableOpacity>
      <TouchableOpacity
          onPress={handleToggleFavorite}
          disabled={isProcessing}
          className="absolute top-12 right-4 z-10 bg-white p-2 rounded-full shadow"
        >
         {isFavorite ? (
            <IconFav size={24} color="red" />
          ) : (
            <IconFavnot size={24} color="gray" />
          )}
        </TouchableOpacity>

      <View className="bg-white p-4 rounded-lg shadow-sm">
        <Image 
          source={{ uri: productData.image }} 
          className="w-full h-64 rounded-lg mb-4"
          resizeMode="contain"
        />

        <Text className="text-2xl font-bold mb-2">{productData.title}</Text>
        <Text className="text-gray-600 text-base mb-4">{productData.description}</Text>
        <Text className="text-green-600 text-xl font-bold mb-4">
          ${productData.price}
        </Text>

        <TouchableOpacity
          onPress={() => addToCart(productData)}
          className="bg-[#00732E] py-3 px-4 rounded mt-4"
        >
          <Text className="text-white text-center font-bold text-lg">
            Añadir al carrito
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}