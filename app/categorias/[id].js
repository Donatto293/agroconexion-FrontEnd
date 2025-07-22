import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router'; // Añadido useRouter
import { productsService } from '../../api/categorias';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const PRODUCT_COLORS = ['#E6F9E6'];

export default function CategoryProductsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter(); // Inicializado el router
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productsService.getByCategory(id);
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00C49A" />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#00732E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>hola </Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {}}
            colors={['#00C49A']}
            tintColor="#00C49A"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay productos en esta categoría</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <View style={styles.cardWrapper}>
            <LinearGradient
              colors={[PRODUCT_COLORS[index % PRODUCT_COLORS.length], '#ffffff']}
              style={styles.productCard}
            >
              <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.productPrice}>${item.price}</Text>
              {item.description && (
                <Text style={styles.productDescription} numberOfLines={2}>{item.description}</Text>
              )}
            </LinearGradient>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6fcf8',
    paddingHorizontal: 12
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginVertical: 16
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  backButton: {
    padding: 8
  },
  headerRightPlaceholder: {
    width: 40
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b'
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center'
  },
  columnWrapper: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8
  },
  listContent: {
    paddingBottom: 32
  },
  cardWrapper: {
    height: 100,
    width: '48%',
    marginBottom: 18
  },
  productCard: {
    borderRadius: 14,
    height: '100%',
    width: '100%',
    paddingVertical: '2%',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4
  },
  productPrice: {
    fontSize: 14,
    color: '#00C49A',
    fontWeight: '500',
    marginBottom: 4
  },
  productDescription: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b'
  }
});