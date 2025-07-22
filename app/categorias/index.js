import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { categoriesService } from '../../api/categorias';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconArrowLeft } from '../../components/icons';
import { MaterialCommunityIcons, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';

// Paleta de colores vibrantes
const CATEGORY_COLORS = [
  '#E8F5E9', '#FFF3E0', '#E1F5FE', 
  '#F3E5F5', '#E0F7FA', '#FFEBEE',
  '#E8EAF6', '#F1F8E9', '#FCE4EC',
  '#E6F9E6', '#FFF8E1', '#E0F2F1',
  '#FBE9E7', '#EDE7F6', '#E8F5E9'
];

// Mapeo exacto de iconos para tus categorías
const CATEGORY_ICONS = {
  'frutas': { icon: 'food-apple', lib: MaterialCommunityIcons },
  'verduras': { icon: 'carrot', lib: FontAwesome5 },
  'granos': { icon: 'wheat', lib: MaterialCommunityIcons },
  'lacteos': { icon: 'cow', lib: MaterialCommunityIcons },
  'carnes': { icon: 'food-steak', lib: MaterialCommunityIcons },
  'embutidos': { icon: 'sausage', lib: MaterialCommunityIcons },
  'huevos': { icon: 'egg', lib: MaterialCommunityIcons },
  'panaderia': { icon: 'bread-slice', lib: FontAwesome5 },
  'miel y derivados': { icon: 'honeycomb', lib: MaterialCommunityIcons },
  'bebidas': { icon: 'cup', lib: MaterialCommunityIcons },
  'bebidas fermentadas': { icon: 'beer-outline', lib: MaterialCommunityIcons },
  'productos organicos': { icon: 'leaf', lib: MaterialCommunityIcons },
  'semillas': { icon: 'seed', lib: MaterialCommunityIcons },
  'hecho a mano': { icon: 'hand-holding-heart', lib: FontAwesome5 },
  'plantas y flores': { icon: 'flower', lib: MaterialCommunityIcons },
  'productos transformados': { icon: 'factory', lib: MaterialCommunityIcons },
  'default': { icon: 'shopping', lib: MaterialCommunityIcons }
};

export default function CategoriesScreen() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadCategories = async (isRefreshing = false) => {
    try {
      isRefreshing ? setRefreshing(true) : setLoading(true);
      setError(null);
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      isRefreshing ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00732E" />
        <Text style={styles.loadingText}>Cargando categorías...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={() => loadCategories()}>
          <Text style={styles.retryText}>Presiona para reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconArrowLeft color="#00732E" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuestras Categorías</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item, index }) => {
          // Normalizar el nombre de la categoría para hacer match
          const categoryName = item.name.toLowerCase().trim();
          let iconInfo = CATEGORY_ICONS['default'];
          
          // Buscar coincidencia exacta o parcial
          for (const [key, value] of Object.entries(CATEGORY_ICONS)) {
            if (categoryName.includes(key)) {
              iconInfo = value;
              break;
            }
          }
          
          const IconComponent = iconInfo.lib;
          
          return (
            <Link href={`/categorias/${item.id}`} asChild>
              <TouchableOpacity style={styles.categoryCard}>
                <View style={[
                  styles.iconContainer,
                  { backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }
                ]}>
                  <IconComponent 
                    name={iconInfo.icon} 
                    size={32} 
                    color="#00732E" 
                  />
                </View>
                <View style={styles.categoryContent}>
                  <Text style={styles.categoryName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  
                </View>
              </TouchableOpacity>
            </Link>
          );
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadCategories(true)}
            colors={['#00732E']}
            tintColor="#00732E"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron categorías</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc'
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
  listContent: {
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 24
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 8
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    alignItems: 'center',
    paddingVertical: 16
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  categoryContent: {
    alignItems: 'center',
    paddingHorizontal: 8
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center'
  },
  productCount: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center'
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center'
  },
  retryText: {
    color: '#00732E',
    fontSize: 16,
    fontWeight: '500',
    padding: 8
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    width: '100%'
  },
  emptyText: {
    color: '#64748b',
    fontSize: 16
  }
});