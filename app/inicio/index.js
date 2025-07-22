import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable
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
      <Text style={styles.title}>AgroConexión</Text>
      <Text style={styles.subtitle}>🌿 Conectando el campo contigo</Text>

      {/* Botón redondo tipo huella */}
      <TouchableOpacity
        style={styles.fingerprintButton}
        onLongPress={openMenu}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="fingerprint" size={40} color="#ffffff" />
      </TouchableOpacity>

      {/* Modal desplegable desde abajo */}
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
                  style={styles.cardOption}
                  onPress={() => {
                    closeMenu();
                    router.push('/login');
                  }}
                >
                  <Text style={styles.optionText}> Iniciar sesión</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cardOption}
                  onPress={() => {
                    closeMenu();
                    router.replace('/categorias');
                  }}
                >
                  <Text style={styles.optionText}> Explorar sin cuenta</Text>
                </TouchableOpacity>
              </>
            )}

          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#00732E',
    marginBottom: 6
  },
  subtitle: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 40,
    textAlign: 'center'
  },
  fingerprintButton: {
    backgroundColor: '#00732E',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  bottomCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 4
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: '#00732E',
    marginBottom: 20
  },
  cardOption: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12
  },
  optionText: {
    fontSize: 16,
    color: '#1e293b',
    textAlign: 'center'
  }
});