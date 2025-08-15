import React, { useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../utils/axiosInstance';
import { useAuth } from '../../context/authContext';

const EditProfileScreen = () => {
  const { userFull, updateProfile} = useAuth();
  

  const [formData, setFormData] = useState({
    username: '',
    phone_number: '',
    address: '',
    profile_image: null, // local uri or server path
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);
  const [imageVersion, setImageVersion] = useState(0); // para cache bust
  const API_URL = (api.defaults.baseURL || '').replace(/\/$/, '');

  // refs para moverse entre inputs
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const addressRef = useRef(null);
  // Cargar datos iniciales del user
  useEffect(() => {
    if (userFull) {
      setFormData({
        username: userFull.username || '',
        email: userFull.email || '',
        phone_number: userFull.phone_number || '',
        address: userFull.address || '',
        profile_image: userFull.profile_image || null,
      });
    }
    setLoading(false);
  }, [userFull]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // foto de perfil
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

  const handleSubmit = async () => {
    // Validaciones básicas
    if (!formData.username?.trim()) {
      Alert.alert('Error', 'El nombre de usuario no puede estar vacío.');
      return;
    }
    setSaving(true);

    try {
      const form = new FormData();
      form.append('username', formData.username || '');
      form.append('phone_number', formData.phone_number || '');
      form.append('address', formData.address || '');

      if (imageChanged && formData.profile_image) {
        const imagePart = buildImagePart(formData.profile_image);
        form.append('profile_image', imagePart);
      }

      // NOTA: no fijes 'Content-Type' aquí — deja que axios lo ponga (boundary)
      const result = await updateProfile(form);

      if (result.status === 'success') {
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
        setImageChanged(false);
        
        // Forzar recarga de imagen del servidor para evitar cache antiguo
        setImageVersion(v => v + 1);

      } else {
        Alert.alert('Error', result.message || 'No se pudo actualizar el perfil');
      }
    } catch (err) {
      console.error('Unhandled error en handleSubmit:', err);
      Alert.alert('Error', 'Ocurrió un error inesperado');
    } finally {
      setSaving(false);
    }
  };

  // resolver URI de avatar: si se modificó, usar el local uri; sino usar la ruta del servidor (con cache bust)
  const avatarUri = imageChanged
    ? formData.profile_image
    : formData.profile_image
      ? `${API_URL}${formData.profile_image}?t=${imageVersion}`
      : 'https://i.imgur.com/8Km9tLL.png';

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 p-5">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 80}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="px-5 py-6"
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar */}
            <View className="items-center mb-6">
              <View className="relative">
                <Image
                  source={{ uri: avatarUri }}
                  className="w-32 h-32 rounded-full bg-gray-200"
                />
                <TouchableOpacity
                  onPress={pickImageOptions}
                  className="absolute bottom-0 right-0 bg-green-600 p-2 rounded-full shadow-lg"
                >
                  <Text className="text-white text-sm">✎</Text>
                </TouchableOpacity>
              </View>

              <Text className="mt-3 text-lg font-semibold text-gray-800">{formData.username || 'Usuario'}</Text>
              
            </View>

            {/* Form fields card */}
            <View className="bg-white rounded-xl p-4 shadow-sm">
              {/* Usuario */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">Usuario</Text>
                <TextInput
                  value={formData.username}
                  onChangeText={t => handleChange('username', t)}
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  blurOnSubmit={false}
                  className="border border-gray-200 rounded-lg px-3 py-2 bg-white"
                  placeholder="Nombre de usuario"
                />
              </View>

              {/* Email */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
                <TextInput
                value={formData.email}
                editable={false} // Deshabilitar edición
                selectTextOnFocus={false} // Evitar selección de texto
                className="border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-500" // Estilo diferente
                placeholder="correo@ejemplo.com"
                autoCapitalize="none"
              />
                
              </View>

              {/* Teléfono */}
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-1">Teléfono</Text>
                <TextInput
                ref={phoneRef}
                value={formData.phone_number}
                onChangeText={t => handleChange('phone_number', t)}
                keyboardType="phone-pad"
                returnKeyType="next"
                onSubmitEditing={() => addressRef.current?.focus()}
                blurOnSubmit={false}
                className="border border-gray-200 rounded-lg px-3 py-2 bg-white"
                placeholder="+57 300 000 0000"
              />
              </View>

              {/* Dirección */}
              <View className="mb-2">
                <Text className="text-sm font-medium text-gray-700 mb-1">Dirección</Text>
                <TextInput
                  ref={addressRef}
                  value={formData.address}
                  onChangeText={t => handleChange('address', t)}
                  returnKeyType="done"
                  className="border border-gray-200 rounded-lg px-3 py-2 bg-white"
                  placeholder="Dirección"
                />
              </View>

              {/* Guardar */}
              <View className="mt-4">
                <TouchableOpacity
                  onPress={handleSubmit}
                  className={`py-3 rounded-lg items-center ${saving ? 'bg-green-400' : 'bg-green-600'}`}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-semibold">Guardar cambios</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
