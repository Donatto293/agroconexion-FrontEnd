/**
 * Módulo React para mostrar productos por categoría
 * @module CategoryProductsScreen
 */
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { productsService } from '../../lib/categorias';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Componente que muestra los productos de una categoría específica
 * @function CategoryProductsScreen
 * @returns {JSX.Element} Componente React que renderiza la lista de productos
 */
export default function CategoryProductsScreen() {
  // Obtiene el parámetro de ID de categoría de la URL
  const { id } = useLocalSearchParams();
  
  // Estado para almacenar la lista de productos
  const [products, setProducts] = useState([]);
  
  // Estado para controlar el estado de carga
  const [loading, setLoading] = useState(true);
  
  // Estado para almacenar posibles errores
  const [error, setError] = useState(null);

  /**
   * Efecto secundario que se ejecuta al montar el componente o cuando cambia el ID
   * @effect
   * @listens id
   */
  useEffect(() => {
    /**
     * Función asíncrona para cargar los productos de la categoría
     * @async
     * @function loadProducts
     */
    const loadProducts = async () => {
      try {
        // Intenta obtener los productos del servicio
        const data = await productsService.getByCategory(id);
        // Actualiza el estado con los productos obtenidos
        setProducts(data);
      } catch (err) {
        // Captura y almacena cualquier error
        setError(err.message);
      } finally {
        // Finaliza el estado de carga independientemente del resultado
        setLoading(false);
      }
    };

    // Ejecuta la función de carga
    loadProducts();
  }, [id]); // Dependencia: se vuelve a ejecutar cuando cambia el ID

  // Renderiza el indicador de carga si está cargando
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Renderiza el mensaje de error si existe
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Renderiza la lista de productos
  return (
    <SafeAreaView style={styles.container}> 
    <View>
      {/* Título de la pantalla */}
      <Text style={styles.title}>Productos</Text>
      
      {/* Lista de productos */}
      <FlatList
        // Datos a renderizar
        data={products}
        // Función para generar claves únicas
        keyExtractor={(item) => item.id.toString()}
        // Función para renderizar cada ítem
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            {/* Nombre del producto */}
            <Text style={styles.productName}>{item.name}</Text>
            {/* Precio del producto */}
            <Text style={styles.productPrice}>${item.price}</Text>
            {/* Descripción del producto (si existe) */}
            {item.description && (
              <Text style={styles.productDescription}>{item.description}</Text>
            )}
          </View>
        )}
        // Componente a mostrar cuando la lista está vacía
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No hay productos en esta categoría</Text>
          </View>
        }
      />
    </View>
    </SafeAreaView>
  );
}

/**
 * Objeto de estilos para el componente
 * @constant {Object} styles
 */
const styles = StyleSheet.create({
  // Contenedor principal
  container: {
    flex: 1, // Ocupa todo el espacio disponible
    padding: 16, // Relleno interno
    backgroundColor: '#fff' // Fondo blanco
  },
  // Contenedor centrado (para carga y errores)
  centerContainer: {
    flex: 1, // Ocupa todo el espacio disponible
    justifyContent: 'center', // Centra verticalmente
    alignItems: 'center' // Centra horizontalmente
  },
  // Estilo para el título
  title: {
    fontSize: 24, // Tamaño de fuente
    fontWeight: 'bold', // Negrita
    marginBottom: 16 // Margen inferior
  },
  // Estilo para la tarjeta de producto
  productCard: {
    backgroundColor: '#f8f9fa', // Color de fondo
    padding: 16, // Relleno interno
    marginBottom: 12, // Margen inferior
    borderRadius: 8 // Bordes redondeados
  },
  // Estilo para el nombre del producto
  productName: {
    fontSize: 18, // Tamaño de fuente
    fontWeight: '600' // Seminegrita
  },
  // Estilo para el precio del producto
  productPrice: {
    fontSize: 16, // Tamaño de fuente
    color: 'green', // Color verde
    marginTop: 4 // Margen superior
  },
  // Estilo para la descripción del producto
  productDescription: {
    fontSize: 14, // Tamaño de fuente
    color: '#666', // Color gris
    marginTop: 8 // Margen superior
  },
  // Estilo para el texto de error
  errorText: {
    color: 'red', // Color rojo
    fontSize: 16 // Tamaño de fuente
  },
  // Estilo para el contenedor vacío
  emptyContainer: {
    flex: 1, // Ocupa todo el espacio disponible
    justifyContent: 'center', // Centra verticalmente
    alignItems: 'center', // Centra horizontalmente
    padding: 20 // Relleno interno
  }
});