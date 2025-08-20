import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import useTopProducts from '../api/top_products';
import { useRouter, Link } from 'expo-router';
import { SearchContext } from '../context/SearchContext';
import { useContext, useRef, useEffect } from 'react';
import api from '../utils/axiosInstance';

export default function Top_products() {
  const API_URL = api.defaults.baseURL;
  const { products, loading, error } = useTopProducts();
  const { searchQuery } = useContext(SearchContext);
  const { width: screenWidth } = Dimensions.get('window');
  
  // Configuración fija para todas las cards
  const CARD_WIDTH = screenWidth * 0.75;
  const CARD_HEIGHT = 320;
  const IMAGE_HEIGHT = 160;
  const CARD_MARGIN = 12;

  const scrollViewRef = useRef(null);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Core logic for the infinite carousel
  const duplicates = 2; // Duplicamos los productos para un loop más largo
  const infiniteProducts = [...filteredProducts];
  for (let i = 0; i < duplicates; i++) {
    infiniteProducts.push(...filteredProducts);
  }

  // Set the initial scroll position to the start of the second set
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (scrollViewRef.current && filteredProducts.length > 0) {
        const itemWidth = CARD_WIDTH + CARD_MARGIN * 2;
        const initialPosition = filteredProducts.length * itemWidth;
        scrollViewRef.current.scrollTo({ x: initialPosition, animated: false });
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [filteredProducts, CARD_WIDTH, CARD_MARGIN]);

  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    const itemWidth = CARD_WIDTH + CARD_MARGIN * 2;
    const contentWidth = filteredProducts.length * itemWidth;

    // Jump back to the beginning of the duplicated items when scrolling to the right end
    if (contentOffset.x >= contentWidth * duplicates) {
      const newPosition = contentOffset.x - contentWidth;
      scrollViewRef.current.scrollTo({ x: newPosition, animated: false });
    } 
    // Jump back to the end of the duplicated items when scrolling to the left end
    else if (contentOffset.x < contentWidth) {
      const newPosition = contentOffset.x + contentWidth;
      scrollViewRef.current.scrollTo({ x: newPosition, animated: false });
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#00732E" />;
  if (error) return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {filteredProducts.length > 0 && (
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>Productos Más Vendidos</Text>
          <View style={styles.titleUnderline} />
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        ref={scrollViewRef}
        scrollEventThrottle={16}
      >
        {infiniteProducts.map((product, index) => (
          <View 
            key={`${product.id}-${index}`}
            style={[styles.cardWrapper, { width: CARD_WIDTH, marginHorizontal: CARD_MARGIN }]}
          >
            <Link href={`/${product.id}`} asChild>
              <Pressable style={({ pressed }) => [
                styles.productCard,
                { height: CARD_HEIGHT },
                pressed && styles.cardPressed,
              ]}>
                <View style={styles.cardContent}>
                  <View style={[styles.imageContainer, { height: IMAGE_HEIGHT }]}>
                    {product.images?.[0]?.image ? (
                      <Image
                        source={{ uri: `${API_URL}${product.images[0].image}` }}
                        style={styles.productImage}
                      />
                    ) : (
                      <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>Sin imagen</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>🔥 Más vendido</Text>
                  </View>

                  <View style={styles.textContainer}>
                    <Text style={styles.productTitle} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.productDescription} numberOfLines={2}>
                      {product.description}
                    </Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.productPrice}>${product.price} /{product.unit_of_measure}</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            </Link>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 5,
    backgroundColor: '#F9FAFB',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: '#059669',
    borderRadius: 2,
  },
  scrollContent: {
    paddingVertical: -10,
    paddingLeft: '8%',
    alignItems: 'flex-start',
  },
  cardWrapper: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    width: '100%',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  cardContent: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    backgroundColor: '#F3F4F6',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#F97316',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  textContainer: {
    padding: 20,
    height: 140,
    justifyContent: 'space-between',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  productDescription: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  priceContainer: {
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669',
  },
  productMeasure: {
    fontSize: 14,
    fontWeight: '500',
    color: '#065F46',
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
  },
});