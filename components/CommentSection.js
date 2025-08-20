import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Alert, // Keep Alert for now, but consider custom modal for better UX
  Image,
  ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../utils/axiosInstance';
import StarRating from './StarRating'; // Se asume que este componente ya maneja la lógica de calificación dinámica

const CommentSection = ({ productId, user, onAuthRequired }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [images, setImages] = useState([]);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await api.get(`/api/comments/product-comments/${productId}/`);
        
        const commentsData = Array.isArray(response.data) ? response.data : [];
        
        const formattedComments = commentsData.map(comment => ({
          id: comment.id,
          comment: comment.comment,
          user_name: comment.user?.username || 'Anónimo', // Obtener el nombre de usuario
          user: comment.user?.id, // ID del usuario que hizo el comentario
          user_image: comment.user?.profile_image ? (comment.user.profile_image.startsWith('http') ? comment.user.profile_image : `${api.defaults.baseURL}${comment.user.profile_image}`) : null, // Obtener la imagen de perfil
          created_at: comment.created_at,
          images: comment.images?.map(img => ({
            id: img.id,
            image: img.image?.startsWith('http') ? img.image : `${api.defaults.baseURL}${img.image}`
          })) || []
        }));
        
        setComments(formattedComments);
      } catch (err) {
        console.error('Error al cargar comentarios:', err);
        setError('Error al cargar los comentarios');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [productId]);

  const toggleCommentForm = () => {
    setShowCommentForm(!showCommentForm);
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images, // Correct usage for modern Expo versions
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        setImages(prev => [...prev, ...result.assets.map(asset => asset.uri)]);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      setError('Error al seleccionar imagen');
    }
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const trimmedComment = newComment.trim();
    
    if (!trimmedComment && images.length === 0) {
      setError('Debes escribir un comentario o subir una imagen');
      return;
    }

    if (!user?.token) {
      Alert.alert('Autenticación requerida', 'Debes iniciar sesión para comentar', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Iniciar sesión', onPress: () => onAuthRequired?.() }
      ]);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('product', productId);
      formData.append('comment', trimmedComment);
      
      images.forEach((uri, index) => {
        const fileName = uri.split('/').pop();
        const fileType = 'image/jpeg'; 
        formData.append('images', {
          uri: uri,
          name: fileName,
          type: fileType
        });
      });

      const response = await api.post('/api/comments/new-comment/', formData, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.id) {
        const newCommentItem = {
          id: response.data.id,
          comment: response.data.comment || trimmedComment,
          user_name: user.username,
          user: user.id,
          user_image: user.profile_image ? (user.profile_image.startsWith('http') ? user.profile_image : `${api.defaults.baseURL}${user.profile_image}`) : null,
          created_at: response.data.created_at || new Date().toISOString(),
          images: response.data.images?.map(img => ({
            id: img.id,
            image: img.image?.startsWith('http') ? img.image : `${api.defaults.baseURL}${img.image}`
          })) || []
        };

        setComments(prev => [newCommentItem, ...prev]);
        setNewComment('');
        setImages([]);
        setShowCommentForm(false);
        Keyboard.dismiss();
      }
    } catch (err) {
      console.error('Error al publicar comentario:', err.response?.data || err.message);
      if (err.response?.status === 401) { 
        Alert.alert('Sesión expirada', 'Por favor, inicia sesión de nuevo.', [
          { text: 'Ok', onPress: () => onAuthRequired?.() }
        ]);
      } else {
        setError(err.response?.data?.message || 'Error al publicar el comentario');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (comment) => {
    setEditingComment(comment.id);
    setEditText(comment.comment);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditText('');
  };

  const handleUpdate = async (commentId) => {
    if (!editText.trim()) {
      setError('El comentario no puede estar vacío');
      return;
    }

    try {
      const response = await api.put(
        `/api/comments/edit-comment/${commentId}/`,
        { comment: editText },
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.id) {
        setComments(prev =>
          prev.map(comment =>
            comment.id === commentId
              ? { ...comment, comment: editText }
              : comment
          )
        );
        cancelEditing();
        setError(null);
      }
    } catch (err) {
      console.error('Error al actualizar comentario:', err);
      if (err.response?.status === 401) { 
        Alert.alert('Sesión expirada', 'Por favor, inicia sesión de nuevo.', [
          { text: 'Ok', onPress: () => onAuthRequired?.() }
        ]);
      } else {
        setError('Error al actualizar el comentario');
      }
    }
  };

  const handleDelete = async (commentId) => {
    Alert.alert(
      'Eliminar comentario',
      '¿Estás seguro de que quieres eliminar este comentario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(
                `/api/comments/delete-comment/${commentId}/`,
                {
                  headers: {
                    'Authorization': `Bearer ${user.token}`,
                  }
                }
              );

              setComments(prev => prev.filter(comment => comment.id !== commentId));
            } catch (err) {
              console.error('Error al eliminar comentario:', err);
              if (err.response?.status === 401) { 
                Alert.alert('Sesión expirada', 'Por favor, inicia sesión de nuevo.', [
                  { text: 'Ok', onPress: () => onAuthRequired?.() }
                ]);
              } else {
                setError('Error al eliminar el comentario');
              }
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00732E" />
      </View>
    );
  }
  

  return (
    <View style={styles.container}>
      {/* Integración del componente de calificación */}
      <StarRating productId={productId} user={user} onAuthRequired={onAuthRequired} />

      <View style={styles.header}>
        <Text style={styles.title}>Comentarios ({comments.length})</Text>
        <TouchableOpacity onPress={toggleCommentForm} style={styles.commentButton}>
          <Text style={styles.commentButtonText}>
            {showCommentForm ? 'Cancelar' : 'Comentar'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {showCommentForm && (
        <View style={styles.formContainer}>
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Escribe tu comentario..."
            style={styles.input}
            multiline
            maxLength={500}
            editable={!submitting}
          />
          
          <TouchableOpacity 
            style={styles.addImageButton}
            onPress={handlePickImage}
            disabled={submitting}
          >
            <Text style={styles.addImageText}>Añadir imágenes</Text>
          </TouchableOpacity>
          
          {images.length > 0 && (
            <ScrollView horizontal style={styles.imagesPreviewContainer}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imagePreviewWrapper}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
          
          <TouchableOpacity 
            style={[styles.submitButton, submitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={(!newComment.trim() && images.length === 0) || submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Publicar comentario</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
      
      {!user && (
        <TouchableOpacity 
          style={styles.loginPrompt}
          onPress={() => onAuthRequired?.()}
        >
          <Text style={styles.loginText}>Inicia sesión para comentar</Text>
        </TouchableOpacity>
      )}
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      <ScrollView style={styles.commentsList}>
        {comments.length === 0 ? (
          <Text style={styles.noComments}>No hay comentarios aún. Sé el primero!</Text>
        ) : (
          comments.map((comment) => (
            <View key={comment.id} style={styles.commentContainer}>
              <View style={styles.commentHeader}>
                {comment.user_image ? (
                  <Image 
                    source={{ uri: comment.user_image }} 
                    style={styles.userImage} 
                  />
                ) : (
                  <View style={[styles.userImage, styles.defaultUserImage]}>
                    <Text style={styles.userInitial}>
                      {comment.user_name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{comment.user_name}</Text>
                  <Text style={styles.commentDate}>
                    {new Date(comment.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </View>
              
              {editingComment === comment.id ? (
                <View>
                  <TextInput
                    value={editText}
                    onChangeText={setEditText}
                    style={styles.editInput}
                    multiline
                    autoFocus
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.cancelButton]}
                      onPress={cancelEditing}
                    >
                      <Text style={styles.actionButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.saveButton]}
                      onPress={() => handleUpdate(comment.id)}
                    >
                      <Text style={styles.actionButtonText}>Guardar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <Text style={styles.commentText}>{comment.comment}</Text>
                  
                  {comment.images?.length > 0 && (
                    <ScrollView horizontal style={styles.commentImagesContainer}>
                      {comment.images.map((img) => (
                        <Image 
                          key={img.id} 
                          source={{ uri: img.image }} 
                          style={styles.commentImage}
                        />
                      ))}
                    </ScrollView>
                  )}
                </>
              )}
              
              {/* Solo muestra los botones de editar/eliminar si el usuario logueado es el autor del comentario y no está editando */}
              {user?.id === comment.user && editingComment !== comment.id && (
                <View style={styles.commentActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => startEditing(comment)}
                  >
                    <Text style={styles.actionButtonText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDelete(comment.id)}
                  >
                    <Text style={styles.actionButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00732E',
  },
  commentButton: {
    backgroundColor: '#00732E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  commentButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  addImageButton: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  addImageText: {
    color: '#00732E',
    fontWeight: '500',
  },
  imagesPreviewContainer: {
    marginBottom: 10,
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#00732E',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#81c784',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginPrompt: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  loginText: {
    color: '#00732E',
    fontWeight: '500',
  },
  commentsList: {
    flex: 1,
  },
  noComments: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  commentContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#e0e0e0', // Fondo para imagen por defecto o si no carga
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultUserImage: {
    backgroundColor: '#00732E', // Color si no hay imagen de perfil
  },
  userInitial: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
  },
  commentDate: {
    color: '#666',
    fontSize: 12,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 12,
  },
  commentImagesContainer: {
    marginBottom: 12,
  },
  commentImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
    resizeMode: 'cover',
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginTop: 8,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
    marginTop: 5,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#e3f2fd', // Azul claro
  },
  deleteButton: {
    backgroundColor: '#ffebee', // Rojo claro
  },
  cancelButton: {
    backgroundColor: '#ffebee',
  },
  saveButton: {
    backgroundColor: '#d1fae5', // Verde muy claro
    marginLeft: 10,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#00732E', // Texto verde para editar/guardar/cancelar
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default CommentSection;