import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, ActivityIndicator, Alert,Modal, Animated, Easing, TouchableWithoutFeedback , AsyncStorage} from 'react-native';
import { useAuth } from '../../context/authContext';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { userToggle2fa } from '../../api/user';
import { Snackbar } from 'react-native-paper';


export default function PrivacidadScreen() {
  const { user, logout, userFull } = useAuth();
  const router = useRouter();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
  // inicializa desde userFull si existe
  return userFull?.two_factor_enabled ?? userFull?.two_factor_enable ?? false;
});
  const [loading2FA, setLoading2FA] = useState(false);
  
  // Estados para los switches
  const [isEnabled, setIsEnabled] = useState({
    activityStatus: true,
    profileVisibility: true,
    dataCollection: false,
    marketingEmails: false
  });
  const [biometricEnabled, setBiometricEnabled] = useState(true);


  //modal de autentificacion 
    // --- Modal local (mensaje pequeño) ---
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('success'); // 'success' | 'error'
  const autoDismissMs = 1300;

  // small animation for modal card
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true, easing: Easing.out(Easing.cubic) })
      ]).start();

      const t = setTimeout(() => {
        closeModal();
      }, autoDismissMs);
      return () => clearTimeout(t);
    } else {
      opacity.setValue(0);
      translateY.setValue(-50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalVisible]);

  const showModal = (message, type = 'success') => {
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
  };

  const closeModal = () => {
    // animate out and then hide
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 8, duration: 160, useNativeDriver: true })
    ]).start(() => {
      setModalVisible(false);
    });
  };

  const toggleSwitch = (key) => {
    setIsEnabled(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

 
  const handleTwoFactorAuth = async () => {
     try {
        const newState = !twoFactorEnabled; // si estaba en true lo desactiva y viceversa
        const result = await userToggle2fa(newState);

       
        const msg = result.data.message ?? 'Estado de autentificacion actualizado';
        setTwoFactorEnabled(newState); // actualizar estado local
        // Actualizar AsyncStorage (mantener ambas claves por compatibilidad)
      showModal(msg, 'success');
      await AsyncStorage.setItem('two_factor_enabled', String(newState));
      
      

    } catch (error) {
        Alert.alert('Error', 'No se pudo actualizar el 2FA.', error);
    } finally {
        setLoading2FA(false);
    }
  };
  const handleDownloadData = async () => {
    // Lógica para descargar datos del usuario
    alert('Se ha enviado un enlace a tu correo para descargar tus datos');
  };

  const handleDeleteAccount = () => {
    router.push('/eliminar-cuenta');
  };

  return (
    <>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Privacidad y Seguridad</Text>
      
      {/* Sección de Seguridad */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔒 Seguridad</Text>
        
       
        
        <TouchableOpacity style={styles.option} onPress={handleTwoFactorAuth} disabled={loading2FA}>
          <View style={styles.optionLeft}>
            <Icon name="security" size={24} color="#00732E" />
            {loading2FA ? (
              <ActivityIndicator size="small" color="#00732E" style={{ marginLeft: 8 }} />
            ) : (
              <Text style={styles.optionText}>
                {twoFactorEnabled ? "Desactivar autentificacion de 2 pasos" : "Activar autentificacion de 2 pasos"}
              </Text>
            )}
          </View>
        </TouchableOpacity>
        
        <View style={styles.option}>
          <View style={styles.optionLeft}>
            <Icon name="fingerprint" size={24} color="#00732E" />
            <Text style={styles.optionText}>Autenticación biométrica</Text>
          </View>
          <Switch
            trackColor={{ false: "#767577", true: "#00732E" }}
            thumbColor={biometricEnabled ? "#FFFFFF" : "#f4f3f4"}
            onValueChange={() => setBiometricEnabled(!biometricEnabled)}
            value={biometricEnabled}
          />
        </View>
        
        <View style={styles.option}>
          <View style={styles.optionLeft}>
            <Icon name="devices" size={24} color="#00732E" />
            <Text style={styles.optionText}>Dispositivos conectados</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#9CA3AF" />
        </View>
      </View>
      
      {/* Sección de Privacidad */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Privacidad</Text>
        
        <View style={styles.option}>
          <View style={styles.optionLeft}>
            <Icon name="visibility" size={24} color="#00732E" />
            <Text style={styles.optionText}>Perfil público</Text>
          </View>
          <Switch
            trackColor={{ false: "#767577", true: "#00732E" }}
            thumbColor={isEnabled.profileVisibility ? "#FFFFFF" : "#f4f3f4"}
            onValueChange={() => toggleSwitch('profileVisibility')}
            value={isEnabled.profileVisibility}
          />
        </View>
        
        <View style={styles.option}>
          <View style={styles.optionLeft}>
            <Icon name="history" size={24} color="#00732E" />
            <Text style={styles.optionText}>Mostrar estado de actividad</Text>
          </View>
          <Switch
            trackColor={{ false: "#767577", true: "#00732E" }}
            thumbColor={isEnabled.activityStatus ? "#FFFFFF" : "#f4f3f4"}
            onValueChange={() => toggleSwitch('activityStatus')}
            value={isEnabled.activityStatus}
          />
        </View>
        
        <View style={styles.option}>
          <View style={styles.optionLeft}>
            <Icon name="share" size={24} color="#00732E" />
            <Text style={styles.optionText}>Compartir datos con terceros</Text>
          </View>
          <Switch
            trackColor={{ false: "#767577", true: "#00732E" }}
            thumbColor={isEnabled.dataCollection ? "#FFFFFF" : "#f4f3f4"}
            onValueChange={() => toggleSwitch('dataCollection')}
            value={isEnabled.dataCollection}
          />
        </View>
      </View>
      
      {/* Sección de Datos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Datos personales</Text>
        
        <TouchableOpacity style={styles.option} onPress={handleDownloadData}>
          <View style={styles.optionLeft}>
            <Icon name="cloud-download" size={24} color="#00732E" />
            <Text style={styles.optionText}>Descargar mis datos</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        
        <View style={styles.option}>
          <View style={styles.optionLeft}>
            <Icon name="email" size={24} color="#00732E" />
            <Text style={styles.optionText}>Correos de marketing</Text>
          </View>
          <Switch
            trackColor={{ false: "#767577", true: "#00732E" }}
            thumbColor={isEnabled.marketingEmails ? "#FFFFFF" : "#f4f3f4"}
            onValueChange={() => toggleSwitch('marketingEmails')}
            value={isEnabled.marketingEmails}
          />
        </View>
      </View>
      
      {/* Sección de Cuenta */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ Cuenta</Text>
        
        <TouchableOpacity style={styles.option} onPress={handleDeleteAccount}>
          <View style={styles.optionLeft}>
            <Icon name="delete" size={24} color="#DC2626" />
            <Text style={[styles.optionText, styles.dangerText]}>Eliminar cuenta</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#DC2626" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option} onPress={logout}>
          <View style={styles.optionLeft}>
            <Icon name="logout" size={24} color="#DC2626" />
            <Text style={[styles.optionText, styles.dangerText]}>Cerrar sesión</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.versionText}>Versión 1.0.0</Text>
    </ScrollView>
     {/* Modal con nuevo diseño y posicionamiento */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        <View style={styles.modalContainer}>
          <Animated.View 
            style={[
              styles.modalContent,
              {
                opacity: opacity,
                transform: [{ translateY: translateY }]
              }
            ]}
          >
            <View style={[
              styles.modalIcon,
              modalType === 'error' ? styles.modalIconError : styles.modalIconSuccess
            ]}>
              <Icon
                name={modalType === 'error' ? 'error-outline' : 'check-circle'}
                size={32}
                color="#FFF"
              />
            </View>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity 
              onPress={closeModal} 
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
    marginTop: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  dangerText: {
    color: '#DC2626',
  },
  optionStatus: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  versionText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 16,
  },
 // Estilos del modal
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconSuccess: {
    backgroundColor: '#00732E',
  },
  modalIconError: {
    backgroundColor: '#DC2626',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#1F2937',
  },
  modalButton: {
    backgroundColor: '#00732E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});