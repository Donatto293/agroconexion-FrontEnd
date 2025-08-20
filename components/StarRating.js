import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import api from '../utils/axiosInstance';

// Este componente permite al usuario calificar el producto y asegura la persistencia visual de la calificación del usuario.
const StarRating = ({ productId, user, onAuthRequired, onRatingUpdated }) => {
  const [rating, setRating] = useState(0); // Calificación del usuario actual
  const [userRatingId, setUserRatingId] = useState(null); // ID de la calificación del usuario para eliminarla
  const [loading, setLoading] = useState(true); // Estado de carga inicial
  const [submitting, setSubmitting] = useState(false); // Estado de envío (al calificar/eliminar)
  const [error, setError] = useState(null); // Mensajes de error
  const [hasUserRated, setHasUserRated] = useState(false); // Nuevo estado para controlar la vista post-calificación
  const [showThankYou, setShowThankYou] = useState(false); // Estado para mostrar el mensaje de agradecimiento temporal

  // Estados para el modal personalizado
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalOnConfirm, setModalOnConfirm] = useState(null);
  const [modalIsConfirm, setModalIsConfirm] = useState(false);

  // Función para mostrar el modal
  const displayModal = (message, isConfirm = false, onConfirmAction = null) => {
    setModalMessage(message);
    setModalIsConfirm(isConfirm);
    setModalOnConfirm(() => {
      if (onConfirmAction) {
        return async () => {
          setShowModal(false);
          await onConfirmAction();
        };
      }
      return () => setShowModal(false);
    });
    setShowModal(true);
  };

  // useEffect para cargar la calificación del usuario al iniciar
  useEffect(() => {
    const fetchUserRating = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/api/products/stats_rating/${productId}/`);
        
        if (user?.id) {
          const userRating = response.data.ratings_by_user?.find(r => r.user === user.id);
          if (userRating) {
            setRating(userRating.rating);
            setUserRatingId(userRating.id);
            setHasUserRated(true); // Si hay una calificación, se establece que el usuario ya calificó
          } else {
            setRating(0);
            setUserRatingId(null);
            setHasUserRated(false); // No hay calificación, mostrar estrellas para calificar
          }
        } else {
          setRating(0);
          setUserRatingId(null);
          setHasUserRated(false); // No hay usuario logueado, mostrar estrellas para calificar
        }
      } catch (err) {
        console.error("Error al cargar la calificación del usuario:", err);
        setError("Error al cargar tu calificación.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRating();
  }, [productId, user]); 

  // handleRate: función para enviar una nueva calificación al backend
  const handleRate = async (newRating) => {
    if (!user?.token) {
      displayModal('Debes iniciar sesión para calificar.', true, onAuthRequired);
      return;
    }

    const previousRating = rating; 
    setRating(newRating); 
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        product: productId,
        rating: newRating,
      };
      
      const response = await api.post('/api/products/new-rating/', payload, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 201) {
        const receivedId = response.data?.id;
        if (receivedId) {
          setUserRatingId(receivedId);
          setHasUserRated(true); // El usuario ha calificado
          setShowThankYou(true); // Mostrar mensaje de agradecimiento
          setTimeout(() => setShowThankYou(false), 3000); // Ocultar después de 3 segundos
          setError(null);
          onRatingUpdated?.(); // Notificar al padre para actualizar el promedio
        } else {
          console.warn('Recibido status 201 pero sin ID en response.data:', response.data);
          setError("Calificación guardada, pero no se pudo obtener el ID. Podría no ser posible eliminarla.");
          onRatingUpdated?.(); 
        }
      } else {
        setRating(previousRating);
        setError("Error inesperado al calificar el producto. Por favor, inténtalo de nuevo.");
      }

    } catch (err) {
      console.error("Error al calificar el producto:", err.response?.data || err.message);
      setRating(previousRating);
      setError(err.response?.data?.rating?.[0] || "Error al calificar el producto.");
    } finally {
      setSubmitting(false);
    }
  };

  // handleDeleteRating: función para eliminar la calificación del usuario
  const handleDeleteRating = async () => {
    if (!userRatingId) return;

    displayModal(
      '¿Estás seguro de que quieres eliminar tu calificación?',
      true,
      async () => {
        setSubmitting(true);
        setError(null);
        try {
          await api.delete(`/api/products/delete-rating/${userRatingId}/`, {
            headers: {
              'Authorization': `Bearer ${user.token}`,
            }
          });
          setRating(0); // Restablece la calificación a 0
          setUserRatingId(null); // Limpia el ID de la calificación del usuario
          setHasUserRated(false); // El usuario ha eliminado su calificación, mostrar estrellas para calificar
          setError(null);
          onRatingUpdated?.(); // Notificar al padre para actualizar el promedio
        } catch (err) {
          console.error("Error al eliminar la calificación:", err);
          setError("Error al eliminar la calificación.");
        } finally {
          setSubmitting(false);
        }
      }
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#00732E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Mensaje de agradecimiento que aparece temporalmente */}
      {showThankYou && (
        <View style={styles.thankYouMessageContainer}>
          <Text style={styles.thankYouMessageText}>¡Muchas gracias por calificar!</Text>
        </View>
      )}

      {/* Sección para que el usuario califique el producto o elimine su calificación */}
      {user?.token ? (
        <>
          {hasUserRated ? (
            // Si el usuario ya calificó, muestra el botón de eliminar
            <View style={styles.postRatingContainer}>
              <Text style={styles.yourRatingText}>Tu calificación: {rating} estrellas</Text>
              <TouchableOpacity onPress={handleDeleteRating} style={styles.deleteButton} disabled={submitting}>
                <Text style={styles.deleteButtonText}>Eliminar mi calificación</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Si el usuario no ha calificado, muestra las estrellas para calificar
            <>
              <Text style={styles.ratePrompt}>Tu calificación:</Text>
              <View style={styles.myRatingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleRate(star)}
                    disabled={submitting}
                  >
                    <Icon
                      name="star"
                      size={30}
                      color={star <= rating ? '#FFD700' : '#d8d8d8'} // Estrellas amarillas según la calificación del usuario
                      style={styles.myStar}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </>
      ) : (
        // Mensaje para usuarios no autenticados
        <TouchableOpacity style={styles.loginPrompt} onPress={() => onAuthRequired?.()}>
          <Text style={styles.loginText}>Inicia sesión para calificar este producto</Text>
        </TouchableOpacity>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Modal personalizado */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <View style={styles.modalButtons}>
              {modalIsConfirm && (
                <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton]} onPress={() => setShowModal(false)}>
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.modalButton, styles.modalConfirmButton]} onPress={modalOnConfirm}>
                <Text style={styles.modalButtonText}>
                  {modalIsConfirm ? 'Confirmar' : 'Cerrar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thankYouMessageContainer: {
    backgroundColor: '#D1FAE5', // Un verde claro
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
  },
  thankYouMessageText: {
    color: '#00732E', // Texto verde oscuro
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  ratePrompt: {
    fontSize: 16,
    color: '#333',
    marginTop: 15,
  },
  myRatingContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  myStar: {
    marginHorizontal: 5,
  },
  loginPrompt: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  loginText: {
    color: '#00732E',
    fontWeight: 'bold',
  },
  postRatingContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  yourRatingText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  deleteButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#EF4444', // Rojo para eliminar
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#d32f2f',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  modalConfirmButton: {
    backgroundColor: '#00732E',
  },
  modalCancelButton: {
    backgroundColor: '#d32f2f',
    marginRight: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default StarRating;