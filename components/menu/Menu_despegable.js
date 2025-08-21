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
  Keyboard,
  Modal
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
import { Link, useRouter, usePathname, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartContext } from '../../context/cartContext';
import { FavoritesContext } from '../../context/favoritesContext';
import { useAuth } from '../../context/authContext';
import { Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MenuContext, useMenu } from '../../context/menuContext';
import api from '../../utils/axiosInstance';


const SCREEN_WIDTH = 340  
export default function MenuDespegableModal(props) {
  const { children = null, triggerStyle = {}, onOpen } = props || {};
  const { logout, user, userFull } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const { cart = [], resetCart } = useContext(CartContext) ?? {};
  const { favorites = [], clearFavorites } = useContext(FavoritesContext) ?? {};
  const { menuMounted = false, setMenuMounted = () => {} } = useContext(MenuContext) ?? {};

  const username = user?.username;
  const profile_image = user?.profile_image;
  const API_URL = (api?.defaults?.baseURL || '').replace(/\/$/, '');

  // comprobar seller de forma robusta
  const isSeller = userFull?.is_seller === true || userFull?.is_seller === 1 || userFull?.is_seller === "1";

  // sync with external menuMounted (optional)
  useEffect(() => {
    if (menuMounted) openMenu();
    else closeMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuMounted]);

  useEffect(() => {
    if (menuOpen) {
      Animated.timing(slideAnim, { toValue: 0, duration: 260, useNativeDriver: true }).start();
    } else {
      Animated.timing(slideAnim, { toValue: -SCREEN_WIDTH, duration: 260, useNativeDriver: true }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuOpen]);

  const openMenu = () => {
    setMenuMounted(true);
    setMenuOpen(true);
    if (typeof onOpen === 'function') onOpen();
  };
  const closeMenu = () => {
    setMenuMounted(false);
    setMenuOpen(false);
  };
  const toggleMenu = () => {
    setMenuOpen(v => {
      const newV = !v;
      setMenuMounted(newV);
      if (newV && typeof onOpen === 'function') onOpen();
      return newV;
    });
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'username', 'profile_image']);
    if (typeof logout === 'function') await logout();
    if (typeof clearFavorites === 'function') clearFavorites();
    if (typeof resetCart === 'function') resetCart();
    closeMenu();
  };

  // --- Render del trigger: inyecta onPress dentro del children si es un elemento React ---
  const renderTrigger = () => {
    if (React.isValidElement(children)) {
      // obtener onPress original del child (si existe)
      const childOnPress = children.props?.onPress;
      const injectedOnPress = (e) => {
        // abrir menú primero
        toggleMenu();
        // luego ejecutar onPress original si existía
        if (typeof childOnPress === 'function') childOnPress(e);
      };

      return React.cloneElement(children, {
        onPress: injectedOnPress,
        // permite pasar estilos si quieres
        triggerStyle,
      });
    }

    // fallback: trigger por defecto
    return (
      <TouchableOpacity onPress={toggleMenu} style={[styles.trigger, triggerStyle]} activeOpacity={0.8}>
        <View style={styles.defaultTrigger}>
          <Ionicons name="menu-outline" size={20} color="#00732E" />
          <Text style={styles.triggerText}>Menú</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {renderTrigger()}

      <Modal visible={menuOpen} transparent animationType="none" onRequestClose={closeMenu}>
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); closeMenu(); }}>
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.panel, { transform: [{ translateX: slideAnim }] }]}>
              <View style={styles.header}>
                <Text style={styles.headerText}>Menú Principal</Text>
              </View>

              <View style={styles.panelContent}>
                <TouchableOpacity style={styles.profileBox} onPress={() => { closeMenu(); }}>
                  {username && profile_image ? (
                    <Image source={{ uri: `${API_URL}${profile_image}` }} style={styles.avatar} />
                  ) : (
                    <IconUser />
                  )}
                  <Text style={styles.profileText}>{username ? username : 'Inicia sesión'}</Text>
                </TouchableOpacity>

                {isSeller && (
                  <Link href="/seller" asChild>
                    <TouchableOpacity style={styles.item} onPress={() => { closeMenu(); }}>
                      <Ionicons name="storefront" size={22} color="#00732E" />
                      <Text style={styles.label}>Vendedor</Text>
                    </TouchableOpacity>
                  </Link>
                )}

                {/* Resto de items (igual que ya tenías) */}
                <Link href="/inicio" asChild>
                  <TouchableOpacity style={styles.item} onPress={() => { closeMenu(); }}>
                    <IconHome size={22} color="#00732E" />
                    <Text style={styles.label}>Inicio</Text>
                  </TouchableOpacity>
                </Link>

                <Link href="/cart" asChild>
                  <TouchableOpacity style={styles.item} onPress={() => { closeMenu(); }}>
                    <IconShoppingCart />
                    <Text style={styles.label}>Carrito {cart?.length > 0 && `(${cart.length})`}</Text>
                  </TouchableOpacity>
                </Link>

                <Link href="/favorites" asChild>
                  <TouchableOpacity style={styles.item} onPress={() => { closeMenu(); }}>
                    <IconFavorites />
                    <Text style={styles.label}>Favoritos {favorites?.length > 0 && `(${favorites.length})`}</Text>
                  </TouchableOpacity>
                </Link>

                <Link href="/cupones" asChild>
                  <TouchableOpacity style={styles.item} onPress={closeMenu}>
                    <IconCoupons />
                    <Text style={styles.label}>Cupones</Text>
                  </TouchableOpacity>
                </Link>

                <Link href="/ofertas" asChild>
                  <TouchableOpacity style={styles.item} onPress={closeMenu}>
                    <IconDiscount />
                    <Text style={styles.label}>Ofertas</Text>
                  </TouchableOpacity>
                </Link>

                <Link href="/categorias" asChild>
                  <TouchableOpacity style={styles.item} onPress={closeMenu}>
                    <IconCategories />
                    <Text style={styles.label}>Categorías</Text>
                  </TouchableOpacity>
                </Link>

                <Link href={username ? '/invoice' : '/login'} asChild>
                  <TouchableOpacity style={styles.item} onPress={closeMenu}>
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
      </Modal>
    </>
  );
}
const styles = StyleSheet.create({
  trigger: { 

    paddingHorizontal: 8, 
    paddingVertical: 6, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  defaultTrigger:{ 

    flexDirection: 'row', 
    alignItems: 'center' 
  },
  triggerText: { 
    marginLeft: 6,
    color: '#00732E', 
    fontWeight: '600' 
  },

  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.35)' 
  },
  panel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.82,
    backgroundColor: '#fff',
    paddingBottom: 40,
    elevation: 8,
  },
  header: { 
    paddingTop: 20, 
    paddingHorizontal: 16, 
    paddingBottom: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  headerText: { 
    fontSize: 18, 
    fontWeight: '700' 
  },
  panelContent: { 
    padding: 16
   },
  profileBox: { 
    flexDirection: 'row', 
    alignItems: 'center',
     marginBottom: 12 
    },
  avatar: {
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    marginRight: 12 
  },
  profileText: { 
    fontSize: 16, 
    fontWeight: '600' },
  item: {
     flexDirection: 'row', 
     alignItems: 'center', 
     paddingVertical: 12 },
  label: {
     marginLeft: 12,
      fontSize: 15
     },
  logout: { 
    marginTop: 18, 
    flexDirection: 'row',
     alignItems: 'center' 
    },
  logoutText: { 
    marginLeft: 8, 
    color: '#dc2626', 
    fontWeight: '600'
   },
});