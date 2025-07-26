import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../context/authContext';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function PrivacidadScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // Estados para los switches
  const [isEnabled, setIsEnabled] = useState({
    activityStatus: true,
    profileVisibility: true,
    dataCollection: false,
    marketingEmails: false
  });
  
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  const toggleSwitch = (key) => {
    setIsEnabled(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleChangePassword = () => {
    router.push('/cambiar-password');
  };

  const handleTwoFactorAuth = () => {
    router.push('/autenticacion-dos-factores');
  };

  const handleDownloadData = async () => {
    // Lógica para descargar datos del usuario
    alert('Se ha enviado un enlace a tu correo para descargar tus datos');
  };

  const handleDeleteAccount = () => {
    router.push('/eliminar-cuenta');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Privacidad y Seguridad</Text>
      
      {/* Sección de Seguridad */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔒 Seguridad</Text>
        
        <TouchableOpacity style={styles.option} onPress={handleChangePassword}>
          <View style={styles.optionLeft}>
            <Icon name="lock" size={24} color="#00732E" />
            <Text style={styles.optionText}>Cambiar contraseña</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option} onPress={handleTwoFactorAuth}>
          <View style={styles.optionLeft}>
            <Icon name="security" size={24} color="#00732E" />
            <Text style={styles.optionText}>Autenticación de dos factores</Text>
          </View>
          <View style={styles.optionRight}>
            <Text style={styles.optionStatus}>Activado</Text>
            <Icon name="chevron-right" size={24} color="#9CA3AF" />
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
});