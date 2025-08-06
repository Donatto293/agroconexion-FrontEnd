import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';
import useProducts from '../api/products';
import { useRouter, Link } from 'expo-router';
import { SearchContext } from '../context/SearchContext';
import { useContext } from 'react';
import api from '../utils/axiosInstance';

export default function Products() {
  const API_URL = api.defaults.baseURL;
  const router = useRouter();
  const { products, loading, error } = useProducts();
  const { searchQuery } = useContext(SearchContext);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#00732E" />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.mainTitle}>
        {searchQuery
          ? `Resultados para: "${searchQuery}"`
          : 'Lista de Productos'}
      </Text>

      <View style={styles.productsGrid}>
        {filteredProducts.map(product => {
          const hasImage = product.images?.[0]?.image;

          return (
            <Link key={product.id} href={`/${product.id}`} asChild>
              <Pressable style={styles.productCard}>
                <View style={styles.cardContent}>
                  {hasImage ? (
                    <Image
                      source={{ uri: `${API_URL}${product.images[0].image}` }}
                      style={styles.productImage}
                    />
                  ) : (
                    <View style={styles.placeholder}>
                      <Text style={styles.placeholderText}>Sin imagen</Text>
                    </View>
                  )}
                  <View style={styles.textContainer}>
                    <Text style={styles.productTitle} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.productDescription} numberOfLines={2}>
                      {product.description}
                    </Text>
                    <Text style={styles.productPrice}>${product.price}</Text>
                    <Text style={styles.productMeasure}>
                      {product.unit_of_measure}
                    </Text>
                  </View>
                </View>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#333',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 280,
  },
  cardContent: {
    flex: 1,
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    backgroundColor: '#f9f9f9',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignSelf: 'stretch',
  },
  placeholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#eeeeee',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholderText: {
    color: '#999999',
    fontStyle: 'italic',
    fontSize: 14,
  },
  textContainer: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 6,
    textAlign: 'center',
  },
  productDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#228449',
    textAlign: 'center',
  },
  productMeasure: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1a836e',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});