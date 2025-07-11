/**
 * Importación de React y sus hooks fundamentales
 * useState: Para manejar estado local del componente
 * useEffect: Para efectos secundarios y ciclo de vida
 */
import React, { useState, useEffect } from 'react';

/**
 * Importación de componentes básicos de React Native
 * View: Contenedor fundamental similar a div
 * Text: Para mostrar texto
 * FlatList: Componente optimizado para listas largas
 * ActivityIndicator: Spinner de carga
 * StyleSheet: Para estilos organizados
 * RefreshControl: Para funcionalidad pull-to-refresh
 * TouchableOpacity: Botón con efecto de opacidad
 */
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';

/**
 * Importación del sistema de routing
 * Link: Componente para navegación entre pantallas
 */
import { Link, useRouter } from 'expo-router';

/**
 * Importación del servicio de categorías
 * Nota: La ruta '../../lib/categorias' debe apuntar al archivo correcto
 */
import { categoriesService } from '../../api/categorias';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconArrowLeft } from '../../components/icons';

/**
 * Componente principal de pantalla de categorías
 * @function CategoriesScreen
 * @description Muestra una lista de categorías con capacidad de navegación a productos
 * @returns {JSX.Element} Árbol de elementos React para renderizar
 */
export default function CategoriesScreen() {
  /**
   * Estado para almacenar la lista de categorías
   * @type {[Array, Function]}
   * @default []
   */
  const [categories, setCategories] = useState([]);

  /**
   * Estado para controlar el estado de carga inicial
   * @type {[boolean, Function]}
   * @default true
   */
  const [loading, setLoading] = useState(true);

  /**
   * Estado para almacenar mensajes de error
   * @type {[string|null, Function]}
   * @default null
   */
  const [error, setError] = useState(null);

  /**
   * Estado para controlar el refresco manual (pull-to-refresh)
   * @type {[boolean, Function]}
   * @default false
   */
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Función asíncrona para cargar categorías
   * @async
   * @function loadCategories
   * @param {boolean} [isRefreshing=false] - Indica si es recarga manual
   * @returns {Promise<void>}
   */
  const loadCategories = async (isRefreshing = false) => {
    try {
      // Actualiza estado según tipo de carga
      isRefreshing ? setRefreshing(true) : setLoading(true);
      setError(null); // Resetea errores previos
      
      // Obtiene datos del servicio
      const data = await categoriesService.getAll();
      setCategories(data); // Actualiza estado con nuevos datos
      
    } catch (err) {
      // Captura y almacena error
      setError(err.message);
    } finally {
      // Finaliza estado de carga
      isRefreshing ? setRefreshing(false) : setLoading(false);
    }
  };

  /**
   * Efecto para carga inicial de datos
   * Se ejecuta solo al montar el componente (dependencias vacías)
   */
  useEffect(() => {
    loadCategories();
  }, []);

  // Renderizado durante carga inicial
  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Cargando categorías...</Text>
      </View>
    );
  }
  const router = useRouter()

  // Renderizado cuando hay error
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text 
          style={styles.retryText}
          onPress={() => loadCategories()} // Reintenta al presionar
        >
          Presiona para reintentar
        </Text>
        <Text style={styles.urlText}>
          Endpoint: http://192.168.0.248:8000/api/products/categories/
        </Text>
      </View>
    );
  }

  // Renderizado principal con lista de categorías
  return (
    <SafeAreaView style={styles.container}>
    <View >
      {/* Título de la pantalla */}
      <Text style={styles.header}>Nuestras Categorías</Text>
       <View className=''>
            <View className=" w-20 h-16 justify-center items-center  rounded-lg  ">
                            <TouchableOpacity onPress={() => router.back()} className=" rounded-full m-2 ">
                                <IconArrowLeft color="#00732E"  />
                            </TouchableOpacity>
            </View>
      </View>
      {/* Lista optimizada de categorías */}
      <FlatList
        data={categories} // Fuente de datos
        keyExtractor={(item) => item.id.toString()} // Extrae keys únicas
        renderItem={({ item }) => ( // Renderiza cada ítem
          <Link href={`/categorias/${item.id}`} asChild>
            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryName}>{item.name}</Text>
              {item.description && ( // Descripción condicional
                <Text style={styles.categoryDescription}>{item.description}</Text>
              )}
              <Text style={styles.viewProductsText}>Ver productos →</Text>
            </TouchableOpacity>
          </Link>
        )}
        // Configuración de pull-to-refresh
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadCategories(true)}
            colors={['#007bff']}
          />
        }
        // Componente para lista vacía
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron categorías</Text>
          </View>
        }
      />
    </View>
    </SafeAreaView>
  );
}

/**
 * Objeto de estilos organizados con StyleSheet
 * @constant {Object} styles
 */
const styles = StyleSheet.create({
  // Contenedor principal
  container: {
    flex: 1, // Ocupa todo el espacio disponible
    padding: 16, // Espaciado interno
    backgroundColor: '#f8f9fa' // Color de fondo
  },
  // Contenedor para centrar contenido
  centerContainer: {
    flex: 1,
    justifyContent: 'center', // Centrado vertical
    alignItems: 'center', // Centrado horizontal
    padding: 20
  },
  // Estilo para el encabezado
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 20,
    textAlign: 'center'
  },
  // Estilo para cada tarjeta de categoría
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2, // Sombra en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  // Estilo para el nombre de categoría
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529'
  },
  // Estilo para la descripción de categoría
  categoryDescription: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
    marginBottom: 8
  },
  // Estilo para el texto "Ver productos"
  viewProductsText: {
    color: '#007bff', // Color azul
    fontSize: 14,
    textAlign: 'right',
    marginTop: 4
  },
  // Estilo para texto de carga
  loadingText: {
    marginTop: 10,
    color: '#6c757d'
  },
  // Estilo para texto de error
  errorText: {
    color: '#dc3545', // Color rojo
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center'
  },
  // Estilo para texto de reintentar
  retryText: {
    color: '#007bff',
    fontSize: 16,
    textDecorationLine: 'underline'
  },
  // Estilo para texto de URL
  urlText: {
    marginTop: 20,
    color: '#6c757d',
    fontSize: 12,
    fontFamily: 'monospace' // Fuente tipo código
  },
  // Contenedor para lista vacía
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  // Texto para lista vacía
  emptyText: {
    color: '#6c757d',
    fontSize: 16
  }
});