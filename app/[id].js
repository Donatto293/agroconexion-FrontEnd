import { View, Text, Image, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useProducts from '../api/products';
import { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/cartContext';
import { FavoritesContext } from '../context/favoritesContext';
import { IconFav, IconFavnot } from '../components/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageViewing from 'react-native-image-viewing';
import api from '../utils/axiosInstance';


const API_URL = api.defaults.baseURL; // Cambia por tu IP o dominio backend

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const { products, loading, error } = useProducts();
  const { addToCart } = useContext(CartContext);
  const { favorites, addFavorite, removeFavorite } = useContext(FavoritesContext);
  const router = useRouter();

  const [isFavorite, setIsFavorite] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const productData = products.find(p => String(p.id) === id);

  useEffect(() => {
    if (productData) {
      const exists = favorites.some(fav => fav.product.id === productData.id);
      setIsFavorite(exists);
    }
  }, [favorites, productData]);

  const handleToggleFavorite = async () => {
    if (isFavorite) {
      await removeFavorite(productData.id);
    } else {
      await addFavorite(productData.id);
    }
    setIsFavorite(!isFavorite);
  };

  if (loading) return <ActivityIndicator size="large" color="#00732E" />;
  if (error) return <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>;
  if (!productData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Producto no encontrado.</Text>
      </View>
    );
  }

  // Crear arreglo de imágenes para la galería
  const galleryImages = productData.images?.map(img => ({
    uri: `${API_URL}${img.image}`
  })) || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ color: '#00732E' }}>← Volver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleToggleFavorite}
          style={{
            position: 'absolute',
            top: 20,
            right: 16,
            zIndex: 10,
            backgroundColor: '#fc7070ff',
            padding: 8,
            borderRadius: 100,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 }
          }}
        >
          {isFavorite ? <IconFavnot size={24} color="gray" /> : <IconFav size={24} color="red" />}
        </TouchableOpacity>

        <View style={{ backgroundColor: '#ffffff', padding: 16, borderRadius: 12, elevation: 2 }}>
          {/* Imágenes del producto */}
          {productData.images?.length > 0 && productData.images.map((img, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setActiveImageIndex(index);
                setVisible(true);
              }}
            >
              <Image
                source={{ uri: `${API_URL}${img.image}` }}
                style={{
                  width: '100%',
                  height: 200,
                  borderRadius: 12,
                  marginBottom: 12,
                  resizeMode: 'cover',
                  backgroundColor: '#f9f9f9'
                }}
              />
            </TouchableOpacity>
          ))}

          <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 8 }}>
            {productData.name}
          </Text>
          <Text style={{ fontSize: 15, color: '#4b5563', marginBottom: 16, lineHeight: 22 }}>
            {productData.description}
          </Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#00732E', marginBottom: 16 }}>
            ${productData.price}
          </Text>

          <TouchableOpacity
            
            style={{
              backgroundColor: '#00732E',
              paddingVertical: 12,
              borderRadius: 8
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>
              Añadir al carrito
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Vista ampliada de imágenes */}
      <ImageViewing
        images={galleryImages}
        imageIndex={activeImageIndex}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      />
    </SafeAreaView>
  );
}