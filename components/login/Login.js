import {
    Text, 
    View, 
    TouchableOpacity,
    Alert,
    Modal,
    StyleSheet
} from 'react-native';
import React, {useState, useContext, useEffect } from 'react';
import { IconArrowLeft, EyeWithLine } from "../icons";
import { Link, useRouter } from 'expo-router';
import { TextInput } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/authContext';
import { CartContext } from '../../context/cartContext';
import { FavoritesContext } from '../../context/favoritesContext';
import api from '../../utils/axiosInstance';
import { getApiErrorMessage } from '../../utils/getApiError';

export default function Login() {
  // Contexto de autenticación
  const { login } = useAuth();
  const { loadCart } = useContext(CartContext);
  const { fetchFavorites } = useContext(FavoritesContext);
  const router = useRouter();

  // Estados para manejar el formulario
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ username: '', password: '' });

  // Estados para verificación de cuenta
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // Estados para autenticación en dos pasos
  const [twoFAModalVisible, setTwoFAModalVisible] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFASessionToken, setTwoFASessionToken] = useState('');

  // Estados para recuperación de contraseña
  const [forgotPasswordModalVisible, setForgotPasswordModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetStep, setResetStep] = useState('request'); // request, verify, reset
  // Helpers
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

    


    const handleVerification =  () => {

        if(!verificationEmail) {
            Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
            return;
        }

       router.push({
                    pathname: '/verification',
                    params: { email: verificationEmail }
                });
    }

    // Validaciones
    const validateLoginFields = () => {
        const newErrors = { username: '', password: '' };
        let isValid = true;

        if (!username) {
        newErrors.username = 'El usuario es requerido';
        isValid = false;
        }
        if (!specialCharRegex.test(password)) {
          Alert.alert('Error', 'La contraseña debe contener al menos un carácter especial');
          return;
        }

        if (!password) {
        newErrors.password = 'La contraseña es requerida';
        isValid = false;
        } else if (password.length < 9) {
        newErrors.password = 'Mínimo 9 caracteres';
        isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Manejo de inicio de sesión
    const handleLogin = async () => {
        if (!validateLoginFields()) return;

        setIsLoading(true);

        try {
        const response = await api.post('/api/users/login/', {
            username,
            password,
        });

        // Si la cuenta requiere verificación
        if (response.data.detail === "Account not verified") {
            setVerificationEmail(username); // Usar el username como email
            setVerificationModalVisible(true);
            return;
        }

        // Si requiere autenticación en dos pasos
        if (response.data.detail === "2FA required") {
            setTwoFASessionToken(response.data.session_token);
            setTwoFAModalVisible(true);
            return;
        }

        // Si todo está bien, proceder con el login
        const { access, refresh, userName, userImage } = response.data;
        
        //se delega al login del Auth
        await login({ 
            username: userName, 
            profile_image: userImage,
            refresh: refresh,
            token: access
        });

        await Promise.all([loadCart(), fetchFavorites()]);
        router.replace('/inicio');
        } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        const errorMsg = error.response?.data?.detail || 
            'Error al iniciar sesión. Verifica tus credenciales.';
        
        setErrors(prev => ({ ...prev, username: errorMsg }));
        } finally {
        setIsLoading(false);
        }
    };

    

    // Resend verification code
    const handleResendCode = async () => {
        try {
        await api.post('/api/users/verify-account/resend/', { email: verificationEmail });
        Alert.alert('Código reenviado', 'Revisa tu correo electrónico');
        } catch (error) {
        console.error('Resend error:', error);
        Alert.alert('Error', 'No se pudo reenviar el código');
        }
    };

  // Autenticación en dos pasos
  const handleTwoFactorAuth = async () => {
    if (!twoFACode) {
      Alert.alert('Error', 'Por favor ingresa el código de autenticación');
      return;
    }

    try {
      const response = await api.post('/api/users/login/step2/', {
        token: twoFASessionToken,
        code: twoFACode
      });

      const { access, refresh, userName, userImage } = response.data;
      await AsyncStorage.multiSet([
        ['accessToken', access],
        ['refreshToken', refresh],
        ['username', userName],
        ['profile_image', userImage || '']
      ]);

      login({ 
        username: userName, 
        profile_image: userImage,
        token: access
      });

      await Promise.all([loadCart(), fetchFavorites()]);
      router.replace('/inicio');
      setTwoFAModalVisible(false);
    } catch (error) {
      console.error('2FA error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.detail || 'Código inválido');
    }
  };

  // 1) Solicitud de recuperación de contraseña
  const handlePasswordResetRequest = async () => {
    if (!resetEmail || !emailRegex.test(resetEmail.trim())) {
      Alert.alert('Error', 'Por favor ingresa un correo electrónico válido');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/api/users/password-reset/request/', { email: resetEmail });
      setResetStep('reset');
      Alert.alert('Código enviado', 'Revisa tu correo para el código de verificación');
    } catch (error) {
      console.error('Password reset request error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.detail || 'No se pudo enviar el código');
    } finally {
      setIsLoading(false);
    }
  };

  

  // 3) Cambio de contraseña después de verificación
  const handlePasswordReset = async () => {
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
    } else if (newPassword.length < 9) {
      Alert.alert('Error', 'La contraseña debe tener al menos 9 caracteres');
    } else if (!resetCode?.trim()) {
      Alert.alert('Error', 'Falta el código de verificación');
    } else if (!specialCharRegex.test(newPassword)) {
      Alert.alert('Error', 'La contraseña debe contener al menos un carácter especial');
    } else {
      setIsLoading(true); // <-- corregido (antes tenías setLoading)
      try {
        await api.post('/api/users/password-reset/confirm/', {
          email: resetEmail.trim(),
          code: resetCode.trim(),
          new_password: newPassword,
          new_password2 : confirmNewPassword
        });
        Alert.alert('Contraseña cambiada', 'Ahora puedes iniciar sesión con tu nueva contraseña');
        setForgotPasswordModalVisible(false);
        setResetStep('request');
        // Limpieza opcional
        // setResetEmail(''); setResetCode(''); setNewPassword(''); setConfirmNewPassword('');
      } catch (error) {
        console.error('Password reset error:', error.response?.data || error.message);
        msg = getApiErrorMessage(error)
        Alert.alert('Error', msg || 'No se pudo cambiar la contraseña');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <View className='flex-1 bg-white'>
      {/* Encabezado */}
      <View className="bg-[#9e9fa0] w-20 h-16 justify-center items-center rounded-lg">
        <TouchableOpacity onPress={() => router.back()} className="rounded-full m-2">
          <IconArrowLeft color="#00732E" />
        </TouchableOpacity>
      </View>
      
      {/* Contenido del login */}
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-2xl font-bold mb-4">Iniciar Sesión</Text>
        
        {/* Email */}
        {errors.username && <Text className="text-red-500 text-sm mb-3 w-full">{errors.username}</Text>}
        <TextInput
          label="Usuario o Email"
          value={username}
          onChangeText={setUsername}
          mode="outlined"
          outlineColor="#ccc"
          activeOutlineColor="#00732E"
          style={{ width: '100%', marginBottom: 16, backgroundColor: 'white' }}
        />
        
        {/* Password */}
        {errors.password && <Text className="text-red-500 text-sm mb-3 w-full">{errors.password}</Text>}
        <TextInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          mode="outlined"
          outlineColor="#ccc"
          activeOutlineColor="#00732E"
          style={{ width: '100%', marginBottom: 16, backgroundColor: 'white' }}
          right={
            <TextInput.Icon
               icon={showPassword ? "eye-off" : "eye"}
               onPress={() => setShowPassword(!showPassword)}
            />
          }
        />
        
        {/* Olvidé mi contraseña */}
        <TouchableOpacity 
          onPress={() => setForgotPasswordModalVisible(true)}
          className="self-end mb-4"
        >
          <Text className="text-[#00732E]">¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
        
        <View className='w-full'>
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className="bg-[#00732E] rounded-lg p-2 w-full"
          >
            <Text className="text-white text-center">
              {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/register')}
            className="border border-[#00732E] rounded-lg p-2 mt-1 w-full"
          >
            <Text className="text-center">Registrarse</Text>
          </TouchableOpacity>
        </View>
        
        {/* Botón para reenviar verificación - Agregado en la pantalla principal */}
        <TouchableOpacity 
            onPress={() => setVerificationModalVisible(true)}
            className="mt-4"
        >
            <Text className="text-[#00732E] text-center">
            Activar Cuenta
            </Text>
        </TouchableOpacity>

       


      </View>
          {/* Modal de Activacion */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={verificationModalVisible}
        onRequestClose={() => setVerificationModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Activación de Cuenta</Text>
            <Text className="mb-4">Por favor ingresa el correo que registraste</Text>

            <TextInput
              label="Correo Electrónico"
              value={verificationEmail}
              onChangeText={setVerificationEmail}
              keyboardType="email-address"
              mode="outlined"
              style={{ width: '100%', marginBottom: 16 }}
            />
            
            <TouchableOpacity
              onPress={handleVerification}
              className="bg-[#00732E] rounded-lg p-2 w-full mb-2"
            >
              <Text className="text-white text-center">Continuar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setVerificationModalVisible(false)} 
              className="mt-2"
            >
              <Text className="text-gray-500 text-center">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
       
     
      
      {/* Modal de Autenticación en Dos Pasos */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={twoFAModalVisible}
        onRequestClose={() => setTwoFAModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Autenticación en Dos Pasos</Text>
            <Text className="mb-4">Por favor ingresa el código de tu aplicación de autenticación.</Text>
            
            <TextInput
              label="Código de autenticación"
              value={twoFACode}
              onChangeText={setTwoFACode}
              keyboardType="numeric"
              mode="outlined"
              style={{ width: '100%', marginBottom: 16 }}
            />
            
            <TouchableOpacity
              onPress={handleTwoFactorAuth}
              className="bg-[#00732E] rounded-lg p-2 w-full mb-2"
            >
              <Text className="text-white text-center">Continuar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setTwoFAModalVisible(false)} 
              className="mt-2"
            >
              <Text className="text-gray-500 text-center">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Modal de Recuperación de Contraseña */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={forgotPasswordModalVisible}
        onRequestClose={() => {
          setForgotPasswordModalVisible(false);
          setResetStep('request');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {resetStep === 'request' ? 'Recuperar Contraseña' : 
               resetStep === 'verify' ? 'Verificar Código' : 
               'Restablecer Contraseña'}
            </Text>
            
            {resetStep === 'request' && (
              <>
                <Text className="mb-4">Ingresa tu correo electrónico para restablecer tu contraseña.</Text>
                
                <TextInput
                  label="Correo Electrónico"
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  mode="outlined"
                  style={{ width: '100%', marginBottom: 16 }}
                />
                
                <TouchableOpacity
                  onPress={handlePasswordResetRequest}
                  disabled={isLoading}
                  className="bg-[#00732E] rounded-lg p-2 w-full mb-2"
                >
                  <Text className="text-white text-center">
                    {isLoading ? 'Enviando Codigo...' : 'Enviar Código'} 
                  </Text>
                </TouchableOpacity>
              </>
            )}
            
            {resetStep === 'reset' && (
            <>
              <Text style={{ marginBottom: 16 }}>
                Se envió un código a {resetEmail}. Ingresa el código y tu nueva contraseña.
              </Text>

              <TextInput
                label="Código de verificación"
                value={resetCode}
                onChangeText={setResetCode}
                keyboardType="numeric"
                mode="outlined"
                style={{ width: '100%', marginBottom: 16 }}
              />

              <TextInput
                label="Nueva Contraseña"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                mode="outlined"
                style={{ width: '100%', marginBottom: 16 }}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword((s) => !s)}
                  />
                }
              />

              <TextInput
                label="Confirmar Nueva Contraseña"
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                secureTextEntry
                mode="outlined"
                style={{ width: '100%', marginBottom: 16 }}
              />

              <TouchableOpacity
                onPress={handlePasswordReset}
                disabled={isLoading}
                style={{ backgroundColor: '#00732E', borderRadius: 8, padding: 12, width: '100%', marginBottom: 8, opacity: isLoading ? 0.7 : 1 }}
              >
                <Text style={{ color: '#FFF', textAlign: 'center' }}>
                  {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </Text>
              </TouchableOpacity>
            </>
          )}
                
                <TouchableOpacity 
                  onPress={() => {
                    setForgotPasswordModalVisible(false);
                    setResetStep('request');
                  }} 
                  className="mt-2"
                >
                  <Text className="text-gray-500 text-center">Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      );
    }

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
});