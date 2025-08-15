import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../context/authContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { confirmPasswordChange } from '../../api/user';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function CambiarPassword() {
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  //validaciones de la contraseña 
  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push("Debe tener al menos 8 caracteres");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("Debe contener al menos una letra mayúscula");
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("Debe contener al menos una letra minúscula");
    }
    
    if (!/\d/.test(password)) {
      errors.push("Debe contener al menos un número");
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Debe contener al menos un carácter especial");
    }
    
    return errors;
  };


  const handleSubmit = async () => {
    // Validación de contraseñas coincidentes
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    // Validación de código
    if (!code) {
      Alert.alert('Error', 'Por favor ingresa el código de verificación');
      return;
    }

    // Validaciones de complejidad de contraseña
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      Alert.alert(
        'Error en la contraseña', 
        passwordErrors.join('\n')
      );
      return;
    }

    setLoading(true);
    try {
      
      const result = await confirmPasswordChange(code, newPassword);
      
      if (result.status === 'success') {
        Alert.alert('Éxito', 'Contraseña cambiada con éxito');
        // Redirigir a la pantalla principal o de perfil
        router.push('/perfil');
      } else {
        Alert.alert('Error', result.message || 'Error al cambiar contraseña');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
    <View >
      <Text style={styles.title}>Cambiar Contraseña</Text>
      
      <Text style={styles.subtitle}>
        Ingresa el código de verificación que recibiste en tu correo electrónico
      </Text>
      
      {/* Campo para el código de verificación */}
      <View style={styles.inputContainer}>
        <Icon name="vpn-key" size={20} color="#00732E" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Código de verificación"
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
        />
      </View>
      
      {/* Nueva contraseña */}
      <View style={styles.inputContainer}>
        <Icon name="lock-outline" size={20} color="#00732E" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Nueva contraseña"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
      </View>
      
      {/* Confirmar nueva contraseña */}
      <View style={styles.inputContainer}>
        <Icon name="lock-reset" size={20} color="#00732E" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Confirmar nueva contraseña"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
        </Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1F2937',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#1F2937',
  },
  button: {
    backgroundColor: '#00732E',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});