import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList
} from 'react-native';
import { useAuth } from '../context/authContext';
import { FavoritesContext } from '../context/favoritesContext';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_URL, ENABLED_FEATURES } from '../context/config';

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const { favorites } = useContext(FavoritesContext);
  const router = useRouter();
  const [loading] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  if (!user) {
    return (
      <View style={styles.requireLoginContainer}>
        <Icon name="account-circle" size={80} color="#9CA3AF" />
        <Text style={styles.requireLogin}>Debes iniciar sesión para ver tu perfil</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.loginButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.favoriteItem}
      onPress={() => router.push(`/producto/${item.product.id}`)}
    >
      <Image
        source={{
          uri: item.product.images?.[0]
            ? `${API_URL}${item.product.images[0].image}`
            : 'https://via.placeholder.com/150'
        }}
        style={styles.favoriteImage}
      />
      <Text style={styles.favoriteName} numberOfLines={1}>
        {item.product.name}
      </Text>
      <Text style={styles.favoritePrice}>
        {item.product.price !== undefined && !isNaN(item.product.price)
          ? `$${Number(item.product.price).toFixed(2)}`
          : '$0.00'}
      </Text>
    </TouchableOpacity>
  );

  const renderFeatureNotAvailable = (featureName) => (
    <View style={styles.emptySection}>
      <Icon name="error-outline" size={40} color="#CBD5E1" />
      <Text style={styles.placeholder}>Función no disponible</Text>
      <Text style={styles.featureText}>
        El {featureName} no está disponible actualmente
      </Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Sección de Perfil */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: user.avatar || 'https://i.imgur.com/8Km9tLL.png' }}
            style={styles.avatar}
          />
          <TouchableOpacity
            style={styles.editAvatarButton}
            onPress={() => router.push('/editar-perfil')}
          >
            <Icon name="edit" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{user.username || 'Usuario'}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push('/editar-perfil')}
        >
          <Text style={styles.editButtonText}>Editar Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Sección de Favoritos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>❤️ Productos Favoritos</Text>
          {favorites.length > 0 && (
            <TouchableOpacity onPress={() => router.push('/favoritos')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          )}
        </View>

        {!ENABLED_FEATURES.FAVORITES ? (
          renderFeatureNotAvailable('listado de favoritos')
        ) : favorites.length > 0 ? (
          <FlatList
            data={favorites.slice(0, 8)}
            renderItem={renderFavoriteItem}
            keyExtractor={(item) => item.product.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptySection}>
            <Icon name="favorite-border" size={40} color="#CBD5E1" />
            <Text style={styles.placeholder}>Tus favoritos aparecerán aquí.</Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/tienda')}
            >
              <Text style={styles.actionButtonText}>Explorar tienda</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Sección de Configuración */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Configuración</Text>

        <TouchableOpacity
          style={styles.settingsItem}
          onPress={() => router.push('/configPerfil/CambiarPassword')}
        >
          <Icon name="lock" size={24} color="#00732E" />
          <Text style={styles.settingsText}>Cambiar contraseña</Text>
          <Icon name="chevron-right" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsItem}
          onPress={() => router.push('/configPerfil/Notificaciones')}
        >
          <Icon name="notifications" size={24} color="#00732E" />
          <Text style={styles.settingsText}>Preferencias de notificación</Text>
          <Icon name="chevron-right" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsItem}
          onPress={() => router.push('/configPerfil/Privacidad')}
        >
          <Icon name="privacy-tip" size={24} color="#00732E" />
          <Text style={styles.settingsText}>Privacidad y seguridad</Text>
          <Icon name="chevron-right" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.settingsItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <Icon name="logout" size={24} color="#DC2626" />
          <Text style={[styles.settingsText, styles.logoutText]}>
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    paddingBottom: 40,
  },
  requireLoginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  requireLogin: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 16,
  },
  loginButton: {
    backgroundColor: '#00732E',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#00732E',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 15,
  },
  editButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  seeAll: {
    fontSize: 14,
    color: '#00732E',
    fontWeight: '500',
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  placeholder: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  favoriteItem: {
    width: 140,
    marginRight: 16,
  },
  favoriteImage: {
    width: 140,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
  },
  favoriteName: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  favoritePrice: {
    fontSize: 14,
    color: '#00732E',
    fontWeight: '600',
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#00732E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingsText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    marginLeft: 12,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#DC2626',
  },
});
