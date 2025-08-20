import {
    View,
    Text,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
    Modal,
    Pressable,
    StyleSheet,
    TextInput,
    Keyboard,
    Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useProducts from '../api/products';
import { useContext, useState, useEffect, useRef } from 'react';
import { CartContext } from '../context/cartContext';
import { FavoritesContext } from '../context/favoritesContext';
import { IconFav, IconFavnot } from '../components/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageViewing from 'react-native-image-viewing';
import api from '../utils/axiosInstance';
import { useAuth } from '../context/authContext';
import CommentSection from '../components/CommentSection';
import AverageRatingDisplay from '../components/AverageRatingDisplay'; // <-- Importa el componente para solo mostrar el promedio

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
    const [quantity, setQuantity] = useState('1');
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuMessage, setMenuMessage] = useState("");
    const [successVisible, setSuccessVisible] = useState(false);
    const [favoriteSuccessVisible, setFavoriteSuccessVisible] = useState(false);
    const [isEditingQuantity, setIsEditingQuantity] = useState(false);
    const scrollViewRef = useRef();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

    const handleQuantityChange = (text) => {
        if (/^\d*$/.test(text)) {
            setQuantity(text);
        }
    };

    const handleQuantityBlur = () => {
        setIsEditingQuantity(false);
        let qty = parseInt(quantity) || 0;
        if (qty < 1) { qty = 1; }
        else if (productData.stock && qty > productData.stock) { qty = productData.stock; }
        setQuantity(qty.toString());
    };

    const incrementQuantity = () => {
        let qty = parseInt(quantity) || 0;
        if (productData.stock && qty >= productData.stock) {
            showMenu(`No puedes agregar más de ${productData.stock} unidades`);
            return;
        }
        setQuantity((qty + 1).toString());
    };

    const decrementQuantity = () => {
        let qty = parseInt(quantity) || 0;
        if (qty <= 1) {
            showMenu("La cantidad mínima es 1");
            return;
        }
        setQuantity((qty - 1).toString());
    };

    const handleAddToCart = () => {
        if (!user) return showMenu("Debes iniciar sesión para agregar al carrito");
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
            showMenu("Ingresa una cantidad válida");
            return;
        }
        addToCart({ ...productData, quantity: qty });
        setSuccessVisible(true);
        setTimeout(() => setSuccessVisible(false), 2000);
    };
    
    // Define el ancho correcto para la imagen.
    const { width: screenWidth } = Dimensions.get('window');
    // Padding de ScrollView (16*2=32) + Padding de Card (16*2=32) = 64
    const imageWidth = screenWidth - 64; 

    const onImageChange = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        // Usa el ancho correcto para calcular el índice.
        const index = Math.round(offsetX / imageWidth);
        setCurrentImageIndex(index);
    };

    if (loading) return <ActivityIndicator size="large" color="#00732E" />;
    if (error) return <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>;
    if (!productData) return <View style={styles.centered}><Text>Producto no encontrado.</Text></View>;

    const galleryImages = productData.images?.map(img => ({ uri: `${API_URL}${img.image}` })) || [];
    const isOutOfStock = (productData.stock || 0) === 0;

    // Función para manejar la navegación a login (pasada a CommentSection)
    const handleAuthRequired = () => {
        router.push('login');
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
            <ScrollView style={{ flex: 1, padding: 16 }}>
                <View style={styles.card}>
                    <Text style={styles.name}>{productData.name}</Text>
                    
                    {/* Aplica el ancho correcto al contenedor del carrusel */}
                    <TouchableOpacity onPress={() => setVisible(true)} style={[styles.imageCarouselContainer, { width: imageWidth }]}>
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            ref={scrollViewRef}
                            onMomentumScrollEnd={onImageChange}
                            // Usa el ancho correcto para el contenido del ScrollView
                            contentContainerStyle={{ width: imageWidth * (productData.images?.length || 1) }}
                        >
                            {productData.images?.map((img, index) => (
                                // Usa el ancho correcto para cada vista de imagen
                                <View key={index} style={{ width: imageWidth, justifyContent: 'center', alignItems: 'center' }}>
                                    <Image source={{ uri: `${API_URL}${img.image}` }} style={styles.image} resizeMode="cover" />
                                </View>
                            ))}
                        </ScrollView>
                        {!isOutOfStock && (
                            <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteIcon}>
                                {isFavorite ? <IconFav size={24} color="red" /> : <IconFavnot size={24} color="gray" />}
                            </TouchableOpacity>
                        )}
                        {productData.images?.length > 1 && (
                            <View style={styles.pagination}>
                                {productData.images.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.paginationDot,
                                            currentImageIndex === index && styles.paginationDotActive,
                                        ]}
                                    />
                                ))}
                            </View>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.desc}>{productData.description}</Text>
                    {isOutOfStock && (
                        <Text style={{ fontSize: 14, color: '#EF4444', marginBottom: 8 }}>
                            Este producto estará disponible pronto
                        </Text>
                    )}
                    <View style={styles.priceContainer}>
                        <View style={styles.priceAndMeasure}>
                            <Text style={styles.price}>${productData.price}/</Text>
                            <Text style={styles.measure}>{productData.unit_of_measure}</Text>
                        </View>
                        {!isOutOfStock && (
                            <View style={styles.quantityAndStockContainer}>
                                <View style={styles.quantityContainer}>
                                    <TouchableOpacity style={styles.quantityButton} onPress={decrementQuantity} disabled={parseInt(quantity) <= 1}>
                                        <Text style={styles.quantityButtonText}>-</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.quantityInputContainer} onPress={() => setIsEditingQuantity(true)}>
                                        {isEditingQuantity ? (
                                            <TextInput
                                                value={quantity}
                                                onChangeText={handleQuantityChange}
                                                onBlur={handleQuantityBlur}
                                                onSubmitEditing={handleQuantityBlur}
                                                keyboardType="numeric"
                                                autoFocus
                                                style={styles.quantityInput}
                                                selectTextOnFocus
                                            />
                                        ) : (
                                            <Text style={styles.quantityText}>{quantity}</Text>
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.quantityButton} onPress={incrementQuantity} disabled={productData.stock && parseInt(quantity) >= productData.stock}>
                                        <Text style={styles.quantityButtonText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.stockText}>
                                    Stock: {productData.stock}
                                </Text>
                            </View>
                        )}
                    </View>
                    {/* Calificación promedio integrada aquí, debajo del priceContainer */}
                    {/* Ahora usa AverageRatingDisplay para solo mostrar el promedio */}
                    <AverageRatingDisplay productId={id} /> 
                    {/* --- FIN Calificación promedio --- */}

                    {isOutOfStock ? (
                        <View style={[styles.addButton, { backgroundColor: '#D1D5DB' }]}>
                            <Text style={[styles.addBtnText, { color: '#6B7280' }]}>Producto agotado</Text>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
                            <Text style={styles.addBtnText}>Añadir al carrito ({quantity})</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <CommentSection productId={id} user={user} onAuthRequired={handleAuthRequired} />
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
            <ImageViewing images={galleryImages} imageIndex={activeImageIndex} visible={visible} onRequestClose={() => setVisible(false)} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        marginBottom: 16,
        // Hacemos que la card se alinee en el centro para que el contenedor de imagen no se vea desfasado
        alignItems: 'center',
    },
    imageCarouselContainer: {
        position: 'relative',
        marginBottom: 12,
        // El ancho ahora se establece dinámicamente en el componente.
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        overflow: 'hidden',
    },
    favoriteIcon: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 10,
        backgroundColor: "rgba(255,255,255,0.8)",
        padding: 8,
        borderRadius: 100,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    name: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 12,
        color: "#000",
        textAlign: 'center',
    },
    desc: {
        fontSize: 15,
        color: "#4b5563",
        marginBottom: 16,
        lineHeight: 22,
        // Para que la descripción ocupe el ancho correcto de la card
        alignSelf: 'stretch',
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        // Para que ocupe el ancho correcto de la card
        alignSelf: 'stretch',
    },
    priceAndMeasure: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    price: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#00732E",
        marginRight: 8,
    },
    measure: {
        fontSize: 16,
        color: "#1a836eff",
    },
    addButton: {
        backgroundColor: "#00732E",
        paddingVertical: 12,
        borderRadius: 8,
        // Para que ocupe el ancho correcto de la card
        alignSelf: 'stretch',
    },
    addBtnText: {
        color: "#fff",
        textAlign: "center",
        fontSize: 16,
        fontWeight: "bold",
    },
    quantityAndStockContainer: {
        alignItems: 'flex-end',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    quantityButton: {
        backgroundColor: "#D1FAE5",
        padding: 8,
        borderRadius: 6,
        width: 40,
        alignItems: 'center',
    },
    quantityButtonText: {
        fontSize: 16,
        color: "#00732E",
        fontWeight: 'bold',
    },
    quantityInputContainer: {
        marginHorizontal: 8,
        minWidth: 50,
        alignItems: 'center',
    },
    quantityInput: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#111',
        borderBottomWidth: 1,
        borderBottomColor: '#00732E',
        padding: 4,
        minWidth: 40,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
        paddingHorizontal: 12,
    },
    stockText: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
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
    pagination: {
        position: 'absolute',
        bottom: 8,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ddd',
        marginHorizontal: 5,
    },
    paginationDotActive: {
        backgroundColor: '#00732E',
    },
});