import { View, Text, Image, ActivityIndicator, TouchableOpacity, ScrollView, Modal, Pressable, StyleSheet} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useProducts from '../api/products';
import { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/cartContext';
import { FavoritesContext } from '../context/favoritesContext';
import { IconFav, IconFavnot } from '../components/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageViewing from 'react-native-image-viewing';
import api from '../utils/axiosInstance';
import { useAuth } from '../context/authContext';


const API_URL = api.defaults.baseURL; // Cambia por tu IP o dominio backend

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const { products, loading, error } = useProducts();
  const { addToCart } = useContext(CartContext);
  const { favorites, addFavorite, removeFavorite } = useContext(FavoritesContext);
  const router = useRouter();
  const {user} = useAuth();

  const [isFavorite, setIsFavorite] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  {/*Modal de login*/}
  const [showLoginALert, setShowLoginAlert] = useState()
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuMessage, setMenuMessage] = useState("");

  const showMenu = (message) => {
    setMenuMessage(message);
    setMenuVisible(true);
  };

  const closeMenu = () => setMenuVisible(false);
//------------------handle favorite
  const handleToggleFavorite = async () => {
    if (!user) {
      showMenu("Debes iniciar sesión para agregar a favoritos");
      return;
    }

    if (isFavorite) {
      await removeFavorite(productData.id);
    } else {
      await addFavorite(productData.id);
    }
    setIsFavorite(!isFavorite);
  };


  const productData = products.find(p => String(p.id) === id);

  useEffect(() => {
    if (productData) {
      const exists = favorites.some(fav => fav.product.id === productData.id);
      setIsFavorite(exists);
    }
  }, [favorites, productData]);


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
            onPress={() => {
              if (!user) {
                showMenu("Debes iniciar sesión para agregar al carrito");
                return;
              }
              addToCart(productData);
            }}
            
          >
            <Text style={{ color: 'white', textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>
              Añadir al carrito
            </Text>
          </TouchableOpacity>
        </View>
        
         {/* Modal desplegable desde abajo */}
              <Modal
                animationType="slide"
                transparent
                visible={menuVisible}
                onRequestClose={closeMenu}
              >
                <Pressable style={styles.backdrop} onPress={closeMenu}>
                  <View style={styles.bottomCard}>
                    <Text style={styles.cardTitle}>{menuMessage}</Text>
                    <TouchableOpacity
                      style={styles.cardOption}
                      onPress={() => {
                        closeMenu();
                        router.push("/login");
                      }}
                    >
                      <Text style={styles.optionText}>Iniciar sesión</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cardOption}
                      onPress={closeMenu}
                    >
                      <Text style={styles.optionText}>Cerrar</Text>
                    </TouchableOpacity>
                  </View>
                </Pressable>
              </Modal>


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
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteIcon: {
    position: "absolute",
    top: 20,
    right: 16,
    zIndex: 10,
    backgroundColor: "#fc7070ff",
    padding: 8,
    borderRadius: 100,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    resizeMode: "cover",
    backgroundColor: "#f9f9f9",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  desc: {
    fontSize: 15,
    color: "#4b5563",
    marginBottom: 16,
    lineHeight: 22,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00732E",
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: "#00732E",
    paddingVertical: 12,
    borderRadius: 8,
  },
  addBtnText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  bottomCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: "auto",
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00732E",
    marginBottom: 16,
    textAlign: "center",
  },
  cardOption: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    color: "#1e293b",
    textAlign: "center",
  },
});
