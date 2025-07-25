import React, { useState, useRef, useEffect, useContext, use } from 'react';
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  PanResponder,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  IconCoupons,
  IconShoppingCart,
  IconFavorites,
  IconHome,
  IconCategories,
  IconDiscount,
  IconUser
} from '../icons';
import { Link, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartContext } from '../../context/cartContext';
import { FavoritesContext } from '../../context/favoritesContext';
import { useAuth } from '../../context/authContext';
import { Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function Menu() {
  const {logout, user} = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
 

  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const buttonPosition = useRef(new Animated.ValueXY({ x: 20, y: 120 })).current;

  const router = useRouter();
  const { cart, resetCart } = useContext(CartContext);
  const { favorites, clearFavorites  } = useContext(FavoritesContext);
  
  


  const username = user?.username;
  const avatar = user?.avatar;

 

  const toggleMenu = () => {
    if (menuOpen) {
      Animated.timing(slideAnim, {
        toValue: -SCREEN_WIDTH,
        duration: 300,
        useNativeDriver: true
      }).start(() => setMenuOpen(false));
    } else {
      setMenuOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove([
      'accessToken',
      'refreshToken',
      'username',
      'avatar'
    ]);
    logout(); // limpia el contexto global
    clearFavorites();       // limpia FavoritesContext
    resetCart();  // limpia CartContext
    setMenuOpen(false);
    router.replace('/');
  };

  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      }
    })
  ).current;
  console.log('user Active:', username);

 return (
 
  <>
 
    <Portal>
      {/* Botón flotante arrastrable */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.draggableButton,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y }
            ]
          }
        ]}
      >
        <TouchableOpacity onPress={toggleMenu} activeOpacity={0.8}>
          <Ionicons name="finger-print" size={32} color="#00732E" />
        </TouchableOpacity>
      </Animated.View>

      {/* Menú lateral completo */}
      {menuOpen && (
        <>
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            if (menuOpen) toggleMenu();
          }}
        >
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              marginTop: "4%",
              backgroundColor: 'rgba(0,0,0,0.3)', // Fondo oscurecido 
              zIndex: 9999, // Asegurar que esta por encima de todo 
            }}
          >
            <Animated.View style={[styles.panel, { transform: [{ translateX: slideAnim }] }]}>
              <View style={styles.header}>
                <Text style={styles.headerText}>Menú Principal</Text>
              </View>

              <View style={styles.panelContent}>
                <Link href={username ? '/' : '/login'} asChild>
                  <TouchableOpacity style={styles.profileBox} onPress={toggleMenu}>
                    {username && avatar ? (
                      <Image source={{ uri: avatar }} style={styles.avatar} />
                    ) : (
                      <IconUser />
                    )}
                    <Text style={styles.profileText}>
                      {username ? `${username}` : 'Inicia sesión'}
                    </Text>
                  </TouchableOpacity>
                </Link>

                {/* Opciones del menú */}
                <Link href="/inicio" asChild>
                  <TouchableOpacity style={styles.item} onPress={toggleMenu}>
                    <IconHome size={22} color="#00732E" />
                    <Text style={styles.label}>Inicio</Text>
                  </TouchableOpacity>
                </Link>

                <Link href={username ? '/cart' : '/login'} asChild>
                  <TouchableOpacity style={styles.item} onPress={toggleMenu}>
                    <IconShoppingCart />
                    <Text style={styles.label}>
                      Carrito {cart.length > 0 && `(${cart.length})`}
                    </Text>
                  </TouchableOpacity>
                </Link>

                <Link href={username ? '/favorites' : '/login'} asChild>
                  <TouchableOpacity style={styles.item} onPress={toggleMenu}>
                    <IconFavorites />
                    <Text style={styles.label}>
                      Favoritos {favorites.length > 0 && `(${favorites.length})`}
                    </Text>
                  </TouchableOpacity>
                </Link>

                <Link href="/cupones" asChild>
                  <TouchableOpacity style={styles.item} onPress={toggleMenu}>
                    <IconCoupons />
                    <Text style={styles.label}>Cupones</Text>
                  </TouchableOpacity>
                </Link>

                <Link href="/ofertas" asChild>
                  <TouchableOpacity style={styles.item} onPress={toggleMenu}>
                    <IconDiscount />
                    <Text style={styles.label}>Ofertas</Text>
                  </TouchableOpacity>
                </Link>

                <Link href="/categorias" asChild>
                  <TouchableOpacity style={styles.item} onPress={toggleMenu}>
                    <IconCategories />
                    <Text style={styles.label}>Categorías</Text>
                  </TouchableOpacity>
                </Link>

                <Link href={username ? '/invoice' : '/login'} asChild>
                  <TouchableOpacity style={styles.item} onPress={toggleMenu}>
                    <IconShoppingCart />
                    <Text style={styles.label}>Facturas</Text>
                  </TouchableOpacity>
                </Link>

                {username && (
                  <TouchableOpacity onPress={handleLogout} style={styles.logout}>
                    <Ionicons name="log-out-outline" size={20} color="#dc2626" />
                    <Text style={styles.logoutText}>Cerrar sesión</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
        </>
      )}
    </Portal>
    
  </>
  
);
}

const styles = StyleSheet.create({
  draggableButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 100,
    backgroundColor: '#ffffff',
    borderRadius: 40,
    padding: 10,
    elevation: 8
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '10000%',
    width: SCREEN_WIDTH * 0.5,
    backgroundColor: '#ffffff',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 10,
    zIndex: 50
  },
  header: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f9fafb'
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00732E',
  
  },
  panelContent: {
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  profileBox: {
    flexDirection: 'row',
   
    alignItems: 'center',
    backgroundColor: '#00732E',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  profileText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14
  },
  label: {
    fontSize: 16,
    marginLeft: 12,
    color: '#1e293b'
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    backgroundColor: '#fee2e2',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10
  },
  logoutText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#dc2626'
  }
});