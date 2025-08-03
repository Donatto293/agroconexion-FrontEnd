import useProducts from '../api/products';
import { View, ActivityIndicator, Image, Dimensions, Pressable, StyleSheet, Text as RNText } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { useRouter } from 'expo-router';
import { TouchableRipple, Dialog, Portal, Modal, Text, Button, Provider } from 'react-native-paper';
import { useAuth } from '../context/authContext';
import { useContext, useEffect, useState } from 'react';
import { CartContext } from '../context/cartContext';
import { FavoritesContext } from '../context/favoritesContext';



import { IconPlus, IconFav, IconFavnot } from './icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import api from '../utils/axiosInstance';

const API_URL = api.defaults.baseURL; //  Cambia por tu IP local o dominio backend

export default function ProductSmall({ products, loading, error }) {
  const router = useRouter();
  const { addToCart } = useContext(CartContext);
  const { favorites, addFavorite, removeFavorite } = useContext(FavoritesContext);
  const width = Dimensions.get('window').width;
  const { user } = useAuth();
  //modal para los iconos de fav y carrito
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  
  
  const hideModal = () => setShowModal(false);

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
  if (error) return <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>;

  const handleToggleFavorite = async (product) => {
    if (!user) {
      showLoginAlert('Debes iniciar sesión para agregar a favoritos');
      return;
    }
    const isFavorite = favoritesState[product.id] || false;
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
  }

 
  const MAX_SLIDES = 7; // Máximo de productos a mostrar en el carrusel
  const randomProducts = products.sort(() => 0.5 - Math.random()).slice(0, MAX_SLIDES); // Selecciona los primeros MAX_SLIDES productos aleatorios

  return (
    <Carousel
      width={width}
      height={300}
      data={randomProducts} // Muestra productos aleatorios
      autoPlay
      scrollAnimationDuration={3000}
      windowSize={5}
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      removeClippedSubviews={true}
      renderItem={({ item: product }) => {
        const isFavorite = favoritesState[product.id] === true;
        const imageUrl = product.images?.[0]?.image
          ? `${API_URL}${product.images[0].image}`
          : 'https://via.placeholder.com/150'; // Si quieres evitar vacíos


        return (
          <View style={{ backgroundColor: 'white', margin: 8, padding: 16, borderRadius: 12, shadowColor: '#000', elevation: 3 }}>
            <TouchableRipple
              onPress={() => {
                if (!user) return showLoginAlert('Debes iniciar sesión para agregar al carrito');
                addToCart(product)
              }}
              onPressIn={() => (scale.value = withSpring(0.9))}
              onPressOut={() => (scale.value = withSpring(1))}
              rippleColor="rgba(0, 115, 46, 0.3)"
              borderless
              style={{ position: 'absolute', top: 10, right: 10, borderRadius: 999, zIndex: 10 }}
            >
              <Animated.View style={[animatedStyle, { backgroundColor: '#00732E', padding: 8, borderRadius: 999 }]}>
                <IconPlus size={24} color="white" />
              </Animated.View>
            </TouchableRipple>

            <TouchableRipple
              onPress={() => handleToggleFavorite(product)}
              
              rippleColor="rgba(255, 0, 0, 0.2)"
              borderless
              style={{ position: 'absolute', bottom: 10, right: 10, borderRadius: 999, zIndex:10 }}
            >
              <View className="bg-white p-2 rounded-full border border-red-300">
               {isFavorite ? (
                <IconFavnot name="heart-outline" size={24} color="gray" />
                  
                ) : (
                  <IconFav name="heart" size={24} color="red" />
                )}
              </View>
            </TouchableRipple>

            <Pressable
              onPress={() =>
                router.push({
                  pathname: `/${product.id}`,
                  params: { product: JSON.stringify(product) }
                })
              }
            >
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>{product.name}</Text>
              {imageUrl && (
                <Image
                  source={{ uri: imageUrl }}
                  style={{
                    width: '100%',
                    height: 160,
                    borderRadius: 8,
                    backgroundColor: '#f3f3f3',
                    marginBottom: 12,
                    resizeMode: 'cover'
                  }}
                />
              )}
              <Text style={{ color: '#00732E', fontSize: 16, fontWeight: 'bold' }}>${product.price}</Text>
            </Pressable>
          
            <Portal>
              <Dialog 
              visible={showModal}
              onDismiss={hideModal}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                margin: 0,
                backgroundColor: '#ffffff',
                borderRadius: 24,
                paddingHorizontal: 10,
                paddingVertical: 10,
                marginHorizontal: 20,
                elevation: 5,
              }}

              >
                <Dialog.Title>
                   <Text className="text-lg font-bold text-green-800"> Atención</Text>
                  </Dialog.Title>
                <Dialog.Content>
                  <Text className="text-base text-gray-800">{modalMessage}</Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button 
                  onPress={hideModal}
                  labelStyle={{ color: '#1f2937', fontWeight: 'bold' }} // text-gray-800
                  style={{
                    backgroundColor: '#a7f3d0', // bg-green-200
                    borderRadius: 12,
                    paddingHorizontal: 10,
                    marginBottom: 10,
                  }}

                  >
                    Cerrar</Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>


  
          </View>
          

          
          
        );
      }}
    />
      

  );
}
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomDialog: {
    backgroundColor: 'white',
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  dialogContent: {
    fontSize: 16,
    marginBottom: 20,
  },
});