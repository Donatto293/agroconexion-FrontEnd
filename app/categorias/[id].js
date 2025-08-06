import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, RefreshControl, StyleSheet,
  TouchableOpacity, Image
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { productsService, categoriesService } from '../../api/categorias';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../utils/axiosInstance';

const API_URL = api.defaults.baseURL;

export default function CategoryProductsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    const loadProductsAndCategory = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          productsService.getByCategory(id),
          categoriesService.getAll()
        ]);

        const filtered = productsData.filter(p =>
          Array.isArray(p.category) && p.category.includes(Number(id))
        );
        setProducts(filtered);

        const foundCategory = categoriesData.find(c => String(c.id) === String(id));
        setCategoryName(foundCategory?.name || 'Categoría');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProductsAndCategory();
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
        <Text style={styles.headerTitle}>{categoryName}</Text>
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
        renderItem={({ item }) => {
          const isOutOfStock = (item.stock || 0) === 0;
          const hasImages = Array.isArray(item.images) && item.images.length > 0;
          const imageUrl = hasImages ? `${API_URL}${item.images[0].image}` : null;

          return (
            <TouchableOpacity
              onPress={() => router.push(`/${item.id}`)}
              style={styles.card}
              activeOpacity={0.85}
            >
              <View style={{ position: 'relative' }}>
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.productImage, {
                    backgroundColor: '#f1f5f9',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }]}>
                    <Text style={{ color: '#6b7280' }}>Sin imagen</Text>
                  </View>
                )}
                {isOutOfStock && (
                  <View style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: '#dc2626',
                    paddingVertical: 2,
                    paddingHorizontal: 6,
                    borderRadius: 6
                  }}>
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Sin stock</Text>
                  </View>
                )}
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.price}>${item.price}</Text>
                {item.description && (
                  <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center'
  },
  headerRightPlaceholder: {
    width: 40
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
    justifyContent: 'space-between',
    paddingBottom: 12
  },
  listContent: {
    paddingBottom: 32
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    width: '48%',
    marginBottom: 18
  },
  productImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16
  },
  infoContainer: {
    padding: 10,
    alignItems: 'center'
  },
  name: {
    fontWeight: '600',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center'
  },
  price: {
    color: '#00C49A',
    fontWeight: '500',
    fontSize: 14,
    marginBottom: 4
  },
  description: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center'
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