import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const isLoggedIn = false; // Reemplaza con tu lógica real de sesión

export default function InicioConHuella() {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo o imagen representativa */}
        <Image 
          source={require('../assets/agro-icon.png')} // Asegúrate de tener esta imagen
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>AgroConexión</Text>
        <Text style={styles.subtitle}>🌿 Conectando el campo con el mundo digital</Text>
        
        {/* Sección de introducción */}
        <View style={styles.introContainer}>
          <Text style={styles.sectionTitle}>Transformando la agricultura</Text>
          <Text style={styles.introText}>
            AgroConexión es la plataforma que une a productores agrícolas con consumidores 
            conscientes, eliminando intermediarios y promoviendo un comercio justo y sostenible.
          </Text>
          
          <View style={styles.benefitCard}>
            <MaterialCommunityIcons name="account-tie" size={24} color="#00732E" />
            <Text style={styles.benefitText}>
              <Text style={styles.bold}>Productores:</Text> Vende directamente tus cosechas, 
              establece precios justos y accede a nuevos mercados.
            </Text>
          </View>
          
          <View style={styles.benefitCard}>
            <MaterialCommunityIcons name="account-heart" size={24} color="#00732E" />
            <Text style={styles.benefitText}>
              <Text style={styles.bold}>Consumidores:</Text> Compra productos frescos directamente 
              del campo, con trazabilidad y apoyando a quienes cultivan tus alimentos.
            </Text>
          </View>
          
          <Text style={styles.impactText}>
            🌎 Juntos estamos reduciendo el desperdicio de alimentos, disminuyendo la huella 
            de carbono y construyendo una cadena alimentaria más transparente y humana.
          </Text>
        </View>
      </ScrollView>

      {/* Botón de acción flotante */}
      <TouchableOpacity
        style={styles.fingerprintButton}
        onLongPress={openMenu}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="fingerprint" size={40} color="#ffffff" />
        <Text style={styles.buttonHint}>Mantén presionado</Text>
      </TouchableOpacity>

      {/* Modal de opciones */}
      <Modal
        animationType="slide"
        transparent
        visible={menuVisible}
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.backdrop} onPress={closeMenu}>
          <View style={styles.bottomCard}>
            <Text style={styles.cardTitle}>¿Cómo quieres continuar?</Text>
            {!isLoggedIn && (
              <>
                <TouchableOpacity
                  style={[styles.cardOption, styles.primaryOption]}
                  onPress={() => {
                    closeMenu();
                    router.push('/login');
                  }}
                >
                  <Text style={styles.optionText}>Iniciar sesión</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.cardOption, styles.secondaryOption]}
                  onPress={() => {
                    closeMenu();
                    router.replace('/categorias');
                  }}
                >
                  <Text style={styles.optionText}>Explorar sin cuenta</Text>
                </TouchableOpacity>
              </>
            )}
            <Text style={styles.footerText}>
              Al continuar, aceptas nuestros Términos y Política de Privacidad
            </Text>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// Estilos mejorados
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Espacio para el botón flotante
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#00732E',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#374151',
    marginBottom: 40,
    textAlign: 'center',
  },
  introContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#00732E',
    marginBottom: 15,
    textAlign: 'center',
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    marginLeft: 10,
  },
  bold: {
    fontWeight: '700',
    color: '#00732E',
  },
  impactText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    marginTop: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  fingerprintButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#00732E',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  buttonHint: {
    position: 'absolute',
    bottom: -25,
    fontSize: 12,
    color: '#4b5563',
    width: 100,
    textAlign: 'center',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#00732E',
    marginBottom: 25,
  },
  cardOption: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryOption: {
    backgroundColor: '#00732E',
  },
  secondaryOption: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 15,
  },
});