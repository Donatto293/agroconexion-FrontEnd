import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { useAuth } from '../context/authContext';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_URL, ENABLED_FEATURES } from '../context/config';

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [errors, setErrors] = useState({
    orders: false,
    favorites: false,
    payments: false,
    addresses: false
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      if (ENABLED_FEATURES.ORDERS) {
        try {
          const ordersResponse = await fetch(`${API_URL}/orders?userId=${user.id}`);
          if (!ordersResponse.ok) throw new Error('Error al cargar pedidos');
          const ordersData = await ordersResponse.json();
          setOrders(ordersData);
        } catch (error) {
          console.error('Error fetching orders:', error);
          setErrors(prev => ({...prev, orders: true}));
        }
      }

      if (ENABLED_FEATURES.FAVORITES) {
        try {
          const favoritesResponse = await fetch(`${API_URL}/favorites?userId=${user.id}`);
          if (!favoritesResponse.ok) throw new Error('Error al cargar favoritos');
          const favoritesData = await favoritesResponse.json();
          setFavorites(favoritesData);
        } catch (error) {
          console.error('Error fetching favorites:', error);
          setErrors(prev => ({...prev, favorites: true}));
        }
      }

      if (ENABLED_FEATURES.PAYMENTS) {
        try {
          const paymentsResponse = await fetch(`${API_URL}/payments?userId=${user.id}`);
          if (!paymentsResponse.ok) throw new Error('Error al cargar métodos de pago');
          const paymentsData = await paymentsResponse.json();
          setPaymentMethods(paymentsData);
        } catch (error) {
          console.error('Error fetching payment methods:', error);
          setErrors(prev => ({...prev, payments: true}));
        }
      }

      if (ENABLED_FEATURES.ADDRESSES) {
        try {
          const addressesResponse = await fetch(`${API_URL}/addresses?userId=${user.id}`);
          if (!addressesResponse.ok) throw new Error('Error al cargar direcciones');
          const addressesData = await addressesResponse.json();
          setAddresses(addressesData);
        } catch (error) {
          console.error('Error fetching addresses:', error);
          setErrors(prev => ({...prev, addresses: true}));
        }
      }

    } catch (error) {
      console.error('Error general:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00732E" />
        <Text style={styles.loadingText}>Cargando tu perfil...</Text>
      </View>
    );
  }

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.orderItem}
      onPress={() => router.push(`/pedido/${item.id}`)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Pedido #{item.id}</Text>
        <Text style={[styles.orderStatus, 
          { color: item.status === 'completed' ? '#00732E' : 
                  item.status === 'cancelled' ? '#DC2626' : '#F59E0B' }]}>
          {item.status === 'completed' ? 'Completado' : 
           item.status === 'cancelled' ? 'Cancelado' : 'En proceso'}
        </Text>
      </View>
      <Text style={styles.orderDate}>{new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.orderTotal}>Total: ${item.total?.toFixed(2) || '0.00'}</Text>
      <View style={styles.orderProducts}>
        {item.products?.slice(0, 2).map(product => (
          <Image 
            key={product.id} 
            source={{ uri: product.image }} 
            style={styles.orderProductImage} 
          />
        ))}
        {item.products?.length > 2 && (
          <View style={styles.moreProducts}>
            <Text>+{item.products.length - 2}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFavoriteItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.favoriteItem}
      onPress={() => router.push(`/producto/${item.id}`)}
    >
      <Image 
        source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
        style={styles.favoriteImage} 
      />
      <Text style={styles.favoriteName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.favoritePrice}>${item.price?.toFixed(2) || '0.00'}</Text>
    </TouchableOpacity>
  );

  const renderPaymentMethod = ({ item }) => (
    <View style={styles.paymentMethod}>
      <Icon 
        name={item.type === 'credit_card' ? 'credit-card' : 
              item.type === 'paypal' ? 'payments' : 'attach-money'} 
        size={24} 
        color="#00732E" 
      />
      <View style={styles.paymentInfo}>
        <Text style={styles.paymentType}>
          {item.type === 'credit_card' ? 'Tarjeta de crédito' : 
           item.type === 'paypal' ? 'PayPal' : 'Otro método'}
        </Text>
        <Text style={styles.paymentDetail}>
          {item.type === 'credit_card' ? `•••• •••• •••• ${item.last4}` : 
           item.type === 'paypal' ? item.email : item.details}
        </Text>
      </View>
      <TouchableOpacity>
        <Icon name="more-vert" size={24} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );

  const renderAddress = ({ item }) => (
    <View style={styles.addressItem}>
      <Icon name="location-on" size={20} color="#00732E" />
      <View style={styles.addressDetails}>
        <Text style={styles.addressTitle}>{item.alias || 'Dirección principal'}</Text>
        <Text style={styles.addressText}>{item.street}, {item.city}</Text>
        <Text style={styles.addressText}>{item.state}, {item.country}</Text>
        <Text style={styles.addressText}>CP: {item.postalCode}</Text>
      </View>
      <TouchableOpacity>
        <Icon name="more-vert" size={24} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );

  const renderFeatureNotAvailable = (featureName) => (
    <View style={styles.emptySection}>
      <Icon name="error-outline" size={40} color="#CBD5E1" />
      <Text style={styles.placeholder}>Función no disponible</Text>
      <Text style={styles.featureText}>El {featureName} no está disponible actualmente</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
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

      {/* Sección de Pedidos */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📦 Historial de Pedidos</Text>
          {orders.length > 0 && (
            <TouchableOpacity onPress={() => router.push('/pedidos')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {!ENABLED_FEATURES.ORDERS || errors.orders ? (
          renderFeatureNotAvailable('historial de pedidos')
        ) : orders.length > 0 ? (
          <FlatList
            data={orders.slice(0, 2)}
            renderItem={renderOrderItem}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptySection}>
            <Icon name="shopping-bag" size={40} color="#CBD5E1" />
            <Text style={styles.placeholder}>Aún no has realizado compras.</Text>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/tienda')}
            >
              <Text style={styles.actionButtonText}>Explorar tienda</Text>
            </TouchableOpacity>
          </View>
        )}
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
        
        {!ENABLED_FEATURES.FAVORITES || errors.favorites ? (
          renderFeatureNotAvailable('listado de favoritos')
        ) : favorites.length > 0 ? (
          <FlatList
            data={favorites.slice(0, 3)}
            renderItem={renderFavoriteItem}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptySection}>
            <Icon name="favorite-border" size={40} color="#CBD5E1" />
            <Text style={styles.placeholder}>Tus favoritos aparecerán aquí.</Text>
          </View>
        )}
      </View>

      {/* Sección de Métodos de Pago */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Métodos de Pago</Text>
        
        {!ENABLED_FEATURES.PAYMENTS || errors.payments ? (
          renderFeatureNotAvailable('gestión de métodos de pago')
        ) : paymentMethods.length > 0 ? (
          <FlatList
            data={paymentMethods}
            renderItem={renderPaymentMethod}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptySection}>
            <Icon name="credit-card" size={40} color="#CBD5E1" />
            <Text style={styles.placeholder}>Sin métodos registrados.</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => router.push('/agregar-metodo-pago')}
          disabled={!ENABLED_FEATURES.PAYMENTS || errors.payments}
        >
          <Text style={[styles.linkText, (!ENABLED_FEATURES.PAYMENTS || errors.payments) && styles.disabledLink]}>
            Agregar método de pago
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sección de Direcciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏠 Dirección de Envío</Text>
        
        {!ENABLED_FEATURES.ADDRESSES || errors.addresses ? (
          renderFeatureNotAvailable('gestión de direcciones')
        ) : addresses.length > 0 ? (
          <FlatList
            data={addresses}
            renderItem={renderAddress}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptySection}>
            <Icon name="home" size={40} color="#CBD5E1" />
            <Text style={styles.placeholder}>No se ha configurado una dirección.</Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => router.push('/agregar-direccion')}
          disabled={!ENABLED_FEATURES.ADDRESSES || errors.addresses}
        >
          <Text style={[styles.linkText, (!ENABLED_FEATURES.ADDRESSES || errors.addresses) && styles.disabledLink]}>
            Agregar dirección
          </Text>
        </TouchableOpacity>
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
          <Text style={[styles.settingsText, styles.logoutText]}>Cerrar sesión</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
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
  orderItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  orderDate: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  orderTotal: {
    fontSize: 14,
    color: '#1F2937',
    marginTop: 4,
    fontWeight: '500',
  },
  orderStatus: {
    fontSize: 13,
    fontWeight: '500',
  },
  orderProducts: {
    flexDirection: 'row',
    marginTop: 8,
  },
  orderProductImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  moreProducts: {
    width: 40,
    height: 40,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
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
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentType: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  paymentDetail: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  addressItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  addressDetails: {
    flex: 1,
    marginLeft: 12,
  },
  addressTitle: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  addressText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  linkButton: {
    marginTop: 12,
  },
  linkText: {
    fontSize: 15,
    color: '#00732E',
    fontWeight: '500',
  },
  disabledLink: {
    color: '#9CA3AF',
    textDecorationLine: 'none',
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