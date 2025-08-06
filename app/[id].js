import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  StyleSheet
} from 'react-native';
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

const API_URL = api.defaults.baseURL;

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const { products, loading, error } = useProducts();
  const { addToCart } = useContext(CartContext);
  const { favorites, addFavorite, removeFavorite } = useContext(FavoritesContext);
  const router = useRouter();
  const { user } = useAuth();

  const [isFavorite, setIsFavorite] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuMessage, setMenuMessage] = useState("");
  const [successVisible, setSuccessVisible] = useState(false);
  const [favoriteSuccessVisible, setFavoriteSuccessVisible] = useState(false);

  const showMenu = (msg) => { setMenuMessage(msg); setMenuVisible(true); };
  const closeMenu = () => setMenuVisible(false);

  const productData = products.find(p => String(p.id) === id);

  useEffect(() => {
    if (productData) {
      const exists = favorites.some(fav => fav.product.id === productData.id);
      setIsFavorite(exists);
    }
  }, [favorites, productData]);

  const handleToggleFavorite = async () => {
    if (!user) return showMenu("Debes iniciar sesión para agregar a favoritos");
    try {
      if (isFavorite) {
        await removeFavorite(productData.id);
      } else {
        await addFavorite(productData.id);
        setFavoriteSuccessVisible(true);
        setTimeout(() => setFavoriteSuccessVisible(false), 2000);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showMenu('Hubo un problema al actualizar tus favoritos');
    }
  };

  const handleAddToCart = () => {
    if (!user) return showMenu("Debes iniciar sesión para agregar al carrito");
    addToCart({ ...productData, quantity });
    setSuccessVisible(true);
    setTimeout(() => setSuccessVisible(false), 2000);
  };

  if (loading) return <ActivityIndicator size="large" color="#00732E" />;
  if (error) return <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>;
  if (!productData) return <View style={styles.centered}><Text>Producto no encontrado.</Text></View>;

  const galleryImages = productData.images?.map(img => ({ uri: `${API_URL}${img.image}` })) || [];
  const isOutOfStock = (productData.stock || 0) === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {!isOutOfStock && (
          <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteIcon}>
            {isFavorite ? <IconFavnot size={24} color="gray" /> : <IconFav size={24} color="red" />}
          </TouchableOpacity>
        )}

        <View style={styles.card}>
          {productData.images?.map((img, index) => (
            <TouchableOpacity key={index} onPress={() => { setActiveImageIndex(index); setVisible(true); }}>
              <Image source={{ uri: `${API_URL}${img.image}` }} style={styles.image} />
            </TouchableOpacity>
          ))}

          <Text style={styles.name}>{productData.name}</Text>
          <Text style={styles.desc}>{productData.description}</Text>

          {isOutOfStock && (
            <Text style={{ fontSize: 14, color: '#EF4444', marginBottom: 8 }}>
              Este producto estará disponible pronto
            </Text>
          )}

          <Text style={styles.measure}>{productData.unit_of_measure}</Text>
          <Text style={styles.price}>${productData.price}</Text>

          {!isOutOfStock && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, marginRight: 8 }}>Cantidad:</Text>
              <TouchableOpacity
                onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(prev => Math.min(productData.stock, prev + 1))}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
              <Text style={styles.stockText}>
                Stock: {productData.stock}
              </Text>
            </View>
          )}

          {isOutOfStock ? (
            <View style={[styles.addButton, { backgroundColor: '#D1D5DB' }]}>
              <Text style={[styles.addBtnText, { color: '#6B7280' }]}>Producto agotado</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddToCart}
            >
              <Text style={styles.addBtnText}>Añadir al carrito ({quantity})</Text>
            </TouchableOpacity>
          )}
        </View>

        <Modal animationType="slide" transparent visible={menuVisible} onRequestClose={closeMenu}>
          <Pressable style={styles.backdrop} onPress={closeMenu}>
            <View style={styles.bottomCard}>
              <Text style={styles.cardTitle}>{menuMessage}</Text>
              <TouchableOpacity style={styles.cardOption} onPress={() => { closeMenu(); router.push("/login"); }}>
                <Text style={styles.optionText}>Iniciar sesión</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cardOption} onPress={closeMenu}>
                <Text style={styles.optionText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        <Modal animationType="fade" transparent visible={successVisible} onRequestClose={() => setSuccessVisible(false)}>
          <View style={styles.successBackdrop}>
            <View style={styles.successMessage}>
              <Text style={styles.successText}>¡{quantity} {productData.name} agregado(s) al carrito!</Text>
            </View>
          </View>
        </Modal>

        <Modal animationType="fade" transparent visible={favoriteSuccessVisible} onRequestClose={() => setFavoriteSuccessVisible(false)}>
          <View style={styles.successBackdrop}>
            <View style={styles.successMessage}>
              <Text style={styles.successText}>¡{productData.name} agregado a favoritos!</Text>
            </View>
          </View>
        </Modal>
      </ScrollView>

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
  quantityButton: {
    backgroundColor: "#D1FAE5",
    padding: 8,
    borderRadius: 6,
  },
  quantityButtonText: {
    fontSize: 16,
    color: "#00732E",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  stockText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#64748B',
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
  measure: {
    fontSize: 14,
    color: "#1a836eff",
  },
  successBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 20,
  },
  successMessage: {
    backgroundColor: 'rgba(0, 115, 46, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  successText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});