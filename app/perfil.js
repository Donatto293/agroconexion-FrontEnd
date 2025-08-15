import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, FlatList, Alert, Platform,  Modal } from 'react-native';
import { useAuth } from '../context/authContext';
import { FavoritesContext } from '../context/favoritesContext';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ENABLED_FEATURES } from '../context/config';
import api from '../utils/axiosInstance';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as ImagePicker from 'expo-image-picker';
import { requestPasswordChange } from '../api/user';

export default function PerfilScreen() {
  const {  userFull, logout, updateProfile  } = useAuth();
  const { favorites } = useContext(FavoritesContext);
  const router = useRouter();
  const [loading] = useState(false);
  const API_URL = (api.defaults.baseURL || '').replace(/\/$/, ''); 

  //modal de changePassword
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  // foto de perfil

  const [imageChanged, setImageChanged] = useState(false);
  const [imageVersion, setImageVersion] = useState(0); // para cache bust
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
      profile_image: null, // local uri or server path
    });
  
  // muestra opciones al usuario
  const pickImageOptions = () => {
    // En iOS podrías usar ActionSheetIOS para un aspecto nativo,
    // pero Alert funciona en ambas plataformas.
    Alert.alert(
      'Seleccionar imagen',
      'Elige una opción',
      [
        { text: 'Tomar foto', onPress: () => takePhoto() },
        { text: 'Elegir de la galería', onPress: () => pickFromGallery() },
        { text: 'Cancelar', style: 'cancel' }
      ],
      { cancelable: true }
    );
  };

  // pedir permiso y abrir la galería
  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos permiso para acceder a la galería.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.8,
      });

      if (!result.canceled) {
        const localUri = result.assets[0].uri;
        setFormData(prev => ({ ...prev, profile_image: localUri }));
        setImageChanged(true);
      }
    } catch (err) {
      console.error('pickFromGallery error:', err);
      Alert.alert('Error', 'No se pudo seleccionar la imagen.');
    }
  };

  // pedir permiso y abrir la cámara
  const takePhoto = async () => {
    try {
      // pedir permiso de cámara (y opcionalmente acceso a galería para guardar la foto)
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos permiso para usar la cámara.');
        return;
      }

      // En Android a veces también se requiere permiso de almacenamiento para guardar la foto
      if (Platform.OS === 'android') {
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        // no bloqueamos si mediaStatus !== 'granted', pero en algunos casos lo necesitarás
        if (mediaStatus !== 'granted') {
          // opcional: notificar pero continuar
          console.warn('Permiso de galería no concedido; la foto puede no guardarse en la galería.');
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.8,
        saveToPhotos: true // si quieres guardar la foto en la galería (iOS/Android)
      });

      if (!result.canceled) {
        const localUri = result.assets[0].uri;
        setFormData(prev => ({ ...prev, profile_image: localUri }));
        setImageChanged(true);
      }
    } catch (err) {
      console.error('takePhoto error:', err);
      Alert.alert('Error', 'No se pudo tomar la foto.');
    }
  };

  // helper para convertir URI a parte de FormData (si necesitas)
  const buildImagePart = (localUri) => {
    let uri = localUri;
    // (en iOS los URIs suelen empezar con file:// — axios/formdata normalmente lo maneja)
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1].toLowerCase() : 'jpg';
    const mimeType = match ? `image/${ext === 'jpg' ? 'jpeg' : ext}` : 'image/jpeg';
    return { uri, name: filename, type: mimeType };
  };
  
  const handleProfile= async()=>{
    // solo si hay cambio y uri válido
    if (!imageChanged || !formData.profile_image) {
      Alert.alert('Atención', 'No hay una nueva foto seleccionada.');
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      const imagePart = buildImagePart(formData.profile_image);
      form.append('profile_image', imagePart);

      // Llama a updateProfile del AuthContext (debe manejar setUser y AsyncStorage)
      const result = await updateProfile(form);

      if (result?.status === 'success') {
        Alert.alert('Éxito', 'Foto de perfil actualizada');
        setImageChanged(false);
        setImageVersion(v => v + 1); // bust cache para ver la nueva foto
        // opcional: si quieres mostrar la nueva URL inmediatamente, puedes:
        // setFormData(prev => ({ ...prev, profile_image: result.data.profile_image }));
      } else {
        Alert.alert('Error', result?.message || 'No se pudo actualizar la foto');
      }
    } catch (err) {
      console.error('handleProfile error:', err);
      Alert.alert('Error', 'Ocurrió un error al subir la foto');
    } finally {
      setUploading(false);
    }
  
  }

  if (!userFull) {
    return (
      <View style={styles.requireLoginContainer}>
        <Icon name="account-circle" size={80} color="#9CA3AF" />
        <Text style={styles.requireLogin}>Debes iniciar sesión para ver tu perfil</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
          <Text style={styles.loginButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const avatarUri = userFull?.profile_image ? `${API_URL}${userFull.profile_image}` : 'https://i.imgur.com/8Km9tLL.png';

  const renderFavoriteItem = ({ item }) => {
    const product = item?.product || item?.product_detail || null;
    if (!product) return null; // seguridad: no renderices si no hay producto

    const imageUri =
      product.images && product.images[0] && product.images[0].image
        ? `${API_URL}${product.images[0].image}`
        : 'https://via.placeholder.com/150';

    const priceText =
      product.price !== undefined && !isNaN(product.price)
        ? `$${Number(product.price).toFixed(2)}`
        : '$0.00';

    return (
      <TouchableOpacity
        style={styles.favoriteItem}
        onPress={() => product?.id && router.push(`/producto/${product.id}`)}
      >
        <View>
          <Image source={{ uri: imageUri }} style={styles.favoriteImage} />
        </View>
        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteName} numberOfLines={1}>
            {product.name || 'Sin nombre'}
          </Text>
          <Text style={styles.favoritePrice}>{priceText}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFeatureNotAvailable = (featureName) => (
    <View style={styles.emptySection}>
      <Icon name="error-outline" size={40} color="#CBD5E1" />
      <Text style={styles.placeholder}>Función no disponible</Text>
      <Text style={styles.featureText}>El {featureName} no está disponible actualmente</Text>
    </View>
  );

  //cambio de contraseña
  const handleChangePassword = async () => {
    setChangingPassword(true);
    try {
      // Paso 1: pedir código
      const step1 = await requestPasswordChange();
      
      if (step1.status === 'success') {
        setChangingPassword(false);
        setShowPasswordModal(false);
        router.push('/configPerfil/CambiarPassword');
      } else {
        Alert.alert('Error', step1.message || 'Error al solicitar cambio de contraseña');
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado');
    } finally {
      setChangingPassword(false);
    }
  };

  

  const settingsItems = [
    { icon: 'lock', text: 'Cambiar contraseña', action: () => setShowPasswordModal(true) },
    { icon: 'notifications', text: 'Preferencias de notificación', action: ()=> router.push('/configPerfil/Notificaciones') },
    { icon: 'privacy-tip', text: 'Privacidad y seguridad', action: ()=> router.push( '/configPerfil/Privacidad') }
  ];

  return (
    <SafeAreaView className='mt-5'>
    <ScrollView contentContainerStyle={styles.container}>
      {/* Perfil */}
      <View className="items-center mb-4">
  <View className="relative">
    <Image
      source={{ uri: imageChanged ? formData.profile_image : avatarUri }}
      className="w-32 h-32 rounded-full bg-gray-200"
    />

    {/* small edit floating button */}
    <TouchableOpacity
      onPress={pickImageOptions}
      className="absolute right-0 bottom-0 bg-green-600 p-2 rounded-full shadow"
      accessibilityLabel="Editar foto"
    >
      <Icon name="edit" size={16} color="#fff" />
    </TouchableOpacity>
  </View>

  {/* Username / email abajo (con espacio) */}
  <Text className="text-lg font-semibold text-gray-800 mt-3">{userFull?.username || 'Usuario'}</Text>
  {/* <Text className="text-sm text-gray-500">{userFull?.email || ''}</Text> */}

  {/* Botones sólo si hay una nueva imagen seleccionada */}
  {imageChanged ? (
    <View className="flex-row mt-3 space-x-3">
          {/* Cancelar (restaura vista anterior) */}
          <TouchableOpacity
            onPress={() => {
              // si quieres restaurar la imagen del servidor:
              setFormData(prev => ({ ...prev, profile_image: userFull?.profile_image || null }));
              setImageChanged(false);
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white flex-row items-center"
          >
            <Text className="text-gray-700 font-medium">Cancelar</Text>
          </TouchableOpacity>

          {/* Subir / Cambiar foto */}
          <TouchableOpacity
            onPress={handleProfile}
            disabled={uploading}
            className={`px-4 py-2 rounded-lg items-center flex-row ${uploading ? 'bg-green-400' : 'bg-green-600'}`}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="cloud-upload" size={16} color="#fff" />
                <Text className="text-white font-semibold ml-2">Cambiar foto</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        // pequeño espacio cuando no hay botones
      <TouchableOpacity style={styles.editButton} onPress={() => router.push('configPerfil/editPerfil')}>
          <Text style={styles.editButtonText}>Editar Perfil</Text>
      </TouchableOpacity>
      )}
    </View>
      

      {/* Favoritos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>❤️ Productos Favoritos</Text>
          {Array.isArray(favorites) && favorites.length > 0 ? (
            <TouchableOpacity onPress={() => router.push('/favoritos')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {!ENABLED_FEATURES.FAVORITES
          ? renderFeatureNotAvailable('listado de favoritos')
          : Array.isArray(favorites) && favorites.length > 0 ? (
              <FlatList
                data={favorites.slice(0, 8)}
                renderItem={renderFavoriteItem}
                keyExtractor={(item, index) => {
                  const id = item?.product?.id ?? item?.product_detail?.id;
                  return id ? String(id) : String(index);
                }}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptySection}>
                <Icon name="favorite-border" size={40} color="#CBD5E1" />
                <Text style={styles.placeholder}>Tus favoritos aparecerán aquí.</Text>
                <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/tienda')}>
                  <Text style={styles.actionButtonText}>Explorar tienda</Text>
                </TouchableOpacity>
              </View>
            )}
      </View>

      {/* Configuración */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Configuración</Text>

        {settingsItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.settingsItem}
            onPress={item.action}
          >
            <View style={styles.settingsLeft}>
              <Icon name={item.icon} size={24} color="#00732E" />
            </View>

            <View style={styles.settingsCenter}>
              <Text style={styles.settingsText}>{item.text}</Text>
            </View>

            <View style={styles.settingsRight}>
              <Icon name="chevron-right" size={24} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[styles.settingsItem, styles.logoutItem]} onPress={handleLogout}>
          <View style={styles.settingsLeft}>
            <Icon name="logout" size={24} color="#DC2626" />
          </View>
          <View style={styles.settingsCenter}>
            <Text style={[styles.settingsText, styles.logoutText]}>Cerrar sesión</Text>
          </View>
          <View style={styles.settingsRight} />
        </TouchableOpacity>
      </View>

      {/* modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPasswordModal}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60">
          <View className="bg-white rounded-lg p-6 w-80">
            <Text className="text-lg font-bold mb-4 text-center">
              ¿Cambiar contraseña?
            </Text>
            <Text className="text-gray-600 mb-6 text-center">
              Se enviará un código de verificación a tu correo electrónico para confirmar el cambio.
            </Text>
            
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="px-5 py-2 border border-gray-300 rounded-lg"
                onPress={() => setShowPasswordModal(false)}
              >
                <Text className="text-gray-700">Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className="px-5 py-2 bg-green-600 rounded-lg"
                onPress={handleChangePassword}
                  
                  
              >
                {changingPassword ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white">Continuar</Text>
                  )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
 
  container: { padding: 16 },
  profileHeader: { alignItems: 'center', marginBottom: 20 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  editAvatarButton: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#00732E', padding: 6, borderRadius: 16 },
  name: { fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  email: { color: '#6B7280' },
  editButton: { marginTop: 10, backgroundColor: '#00732E', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  editButtonText: { color: '#fff' },

  section: { marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  seeAll: { color: '#00732E' },

  favoriteItem: { width: 120, marginRight: 12 },
  favoriteImage: { width: 120, height: 80, borderRadius: 8 },
  favoriteInfo: { marginTop: 6 },
  favoriteName: { fontSize: 13 },
  favoritePrice: { fontSize: 12, color: '#10B981' },

  emptySection: { alignItems: 'center', padding: 20 },
  placeholder: { marginTop: 8, color: '#94A3B8' },
  featureText: { marginTop: 4, color: '#64748B' },
  actionButton: { marginTop: 10, backgroundColor: '#00732E', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  actionButtonText: { color: '#fff' },

  settingsItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#E5E7EB' },
  settingsLeft: { width: 36, alignItems: 'center' },
  settingsCenter: { flex: 1 },
  settingsRight: { width: 36, alignItems: 'center' },
  settingsText: { fontSize: 15 },
  logoutItem: {},
  logoutText: { color: '#DC2626' },

  requireLoginContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loginButton: { marginTop: 12, backgroundColor: '#00732E', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  loginButtonText: { color: '#fff' }
});
