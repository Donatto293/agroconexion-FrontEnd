import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Asegúrate de tener esta librería instalada
import api from '../utils/axiosInstance'; // Tu instancia de Axios

// Este componente solo mostrará la calificación promedio de un producto.
const AverageRatingDisplay = ({ productId, refreshKey }) => {
  const [averageRating, setAverageRating] = useState(0); // Calificación promedio del producto
  const [totalRatings, setTotalRatings] = useState(0); // Total de calificaciones
  const [loading, setLoading] = useState(true); // Estado de carga inicial
  const [error, setError] = useState(null); // Mensajes de error

  // useEffect para cargar las estadísticas de calificación al iniciar o cuando refreshKey cambia
  useEffect(() => {
    const fetchRatingStats = async () => {
      setLoading(true); // Inicia el estado de carga antes de la petición
      setError(null);   // Limpia errores previos
      try {
        const response = await api.get(`/api/products/stats_rating/${productId}/`);
        // Actualiza el promedio y el total de calificaciones
        setAverageRating(response.data.average_rating || 0);
        setTotalRatings(response.data.total_ratings || 0);
      } catch (err) {
        console.error("Error al cargar estadísticas de calificación para AverageRatingDisplay:", err);
        setError("Error al cargar las calificaciones.");
      } finally {
        setLoading(false); // Finaliza el estado de carga
      }
    };

    fetchRatingStats();
  }, [productId, refreshKey]); // Se ejecuta cuando cambia el ID del producto o la clave de refresco

  // Muestra un indicador de carga mientras se obtienen los datos iniciales
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#00732E" />
      </View>
    );
  }

  // Muestra un mensaje de error si ocurre uno
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sección para mostrar la calificación promedio del producto */}
      {totalRatings > 0 ? ( // Solo muestra si hay al menos una calificación
        <View style={styles.averageContainer}>
          {/* Contenedor para las estrellas y el número de promedio (en fila) */}
          <View style={styles.starsAndNumberRow}> 
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon
                  key={star}
                  name="star"
                  size={22} // Tamaño de estrella más grande
                  color={star <= averageRating ? '#FFD700' : '#d8d8d8'} // Estrellas amarillas hasta el promedio
                  style={styles.star}
                />
              ))}
            </View>
            <Text style={styles.averageNumber}>{averageRating.toFixed(1)}</Text>
          </View>
          {/* Texto de total de calificaciones (en nueva línea) */}
          <Text style={styles.totalRatingsText}>({totalRatings} calificaciones)</Text>
        </View>
      ) : (
        <Text style={styles.noRatingsText}>Sin calificaciones aún.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 5, // Padding vertical reducido
    paddingHorizontal: 10,
    marginTop: '-7%', // Ajustado para subirlo más
    marginBottom: '10%', // Reducido para acercarlo
    alignSelf: 'stretch', // Ocupa todo el ancho disponible
    alignItems: 'flex-start', // Alinea todo el contenido del contenedor al inicio (izquierda)
  },
  loadingContainer: {
    height: 30, // Altura fija para el loader
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    height: 30, // Altura fija para el mensaje de error
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  averageContainer: {
    flexDirection: 'column', // Cambiado a columna para apilar elementos verticalmente
    alignItems: 'flex-start', // Alinea el contenido (estrellas+número y texto) a la izquierda
    justifyContent: 'center', 
  },
  starsAndNumberRow: { // Nuevo estilo para el contenedor de estrellas y número
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2, // Pequeño margen entre la fila de estrellas y el texto de calificaciones
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5, // Espacio entre estrellas y número
  },
  star: {
    marginHorizontal: 1, // Espacio reducido entre estrellas
  },
  averageNumber: {
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 5,
  },
  totalRatingsText: {
    fontSize: 12, 
    color: '#666',
    // No necesita marginLeft aquí, ya que el averageContainer lo alinea a la izquierda
  },
  noRatingsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'left', // Alineado a la izquierda para coherencia
    paddingVertical: 5,
  },
});

export default AverageRatingDisplay;