import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Avatar, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/authContext';
import api from '../../utils/axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfileScreen = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    address: '',
    profile_image: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);
  const API_URL = api.defaults.baseURL;
  // Cargar datos iniciales del usuario
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
        profile_image: user.profile_image,
      });
      setLoading(false);
    }
  }, [user]);

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setFormData({
        ...formData,
        profile_image: result.assets[0].uri,
      });
      setImageChanged(true);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    
    try {
      const form = new FormData();
      
      // Campos básicos
      form.append('username', formData.username);
      form.append('email', formData.email);
      form.append('phone_number', formData.phone_number);
      form.append('address', formData.address);
      
      // Imagen de perfil (si fue cambiada)
      if (imageChanged && formData.profile_image) {
        form.append('profile_image', {
          uri: formData.profile_image,
          name: 'profile.jpg',
          type: 'image/jpeg',
        });
      }

      const token = await AsyncStorage.getItem('accessToken');

      // Enviar form como cuerpo directo
      const response = await api.put('/api/users/update/', form, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      // Usar response.data directamente
      if (response.status >= 200 && response.status < 300) {
        // Actualizar AsyncStorage con los nuevos datos
        await AsyncStorage.multiSet([
          ['username', formData.username],
          ['email', formData.email],
          ['phone_number', formData.phone_number || ''],
          ['address', formData.address || ''],
          ['profile_image', formData.profile_image || ''],
        ]);
        
        updateUser({
          ...user,
          ...response.data,
          username: formData.username,
          email: formData.email,
          phone_number: formData.phone_number,
          address: formData.address,
          profile_image: response.data.profile_image || user.profile_image
        });
        
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
        setImageChanged(false);
      } else {
        // Manejar errores específicos del backend
        const errorMsg = response.data.detail || 
                         Object.values(response.data)[0]?.[0] || 
                         'Error al actualizar el perfil';
        Alert.alert('Error', errorMsg);
      }
    } catch (error) {
      // Manejar mejor los errores de red
      console.error('Error al actualizar perfil:', error);
      
      if (error.response) {
        const errorData = error.response.data;
        let errorMessage = 'Error del servidor';
        
        // Intentar obtener el primer mensaje de error disponible
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === 'object') {
          const firstKey = Object.keys(errorData)[0];
          if (errorData[firstKey]) {
            errorMessage = Array.isArray(errorData[firstKey]) 
              ? errorData[firstKey][0] 
              : errorData[firstKey];
          }
        }
        
        Alert.alert('Error', errorMessage);
      } else {
        Alert.alert('Error de red', 'No se pudo conectar al servidor');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="p-4 bg-white flex-1 ">
      <View className="items-center my-6">
        <Avatar.Image 
          size={120} 
          source={{ 
            uri: imageChanged 
              ? formData.profile_image 
              : formData.profile_image 
                ? `${API_URL}${formData.profile_image}`
                : 'https://via.placeholder.com/150' 
          }} 
        />
        <Button 
          mode="outlined" 
          onPress={pickImage}
          className="mt-3"
        >
          Cambiar foto
        </Button>
      </View>

      <TextInput
        label="Nombre de usuario"
        value={formData.username}
        onChangeText={(text) => handleChange('username', text)}
        mode="outlined"
        className="mb-4"
      />
      
      <TextInput
        label="Correo electrónico"
        value={formData.email}
        onChangeText={(text) => handleChange('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
        mode="outlined"
        className="mb-4"
      />
      
      <TextInput
        label="Teléfono"
        value={formData.phone_number}
        onChangeText={(text) => handleChange('phone_number', text)}
        keyboardType="phone-pad"
        mode="outlined"
        className="mb-4"
      />
      
      <TextInput
        label="Dirección"
        value={formData.address}
        onChangeText={(text) => handleChange('address', text)}
        multiline
        numberOfLines={3}
        mode="outlined"
        className="mb-6"
      />
      
      <Button 
        mode="contained" 
        onPress={handleSubmit}
        loading={saving}
        disabled={saving}
        className="mt-2 py-2"
      >
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </ScrollView>
  );
};

export default EditProfileScreen;