import { View, Text, Image, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useProducts from '../lib/products';
import { useContext } from 'react';
import { CartContext } from '../context/cartContext';

export default function ProductDetail() {
  const { id } = useLocalSearchParams();     // recibimos solo el ID
  const { products, loading, error } = useProducts();
  const { addToCart } = useContext(CartContext);
  const router = useRouter();

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
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <Text className="text-blue-500">← Volver</Text>
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
  );
}