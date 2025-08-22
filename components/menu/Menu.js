import React, { useRef, useContext, useState } from 'react';
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  PanResponder,
} from 'react-native';
import {
  IconShoppingCart,
  IconFavorites,
  IconHome,
  IconCategories,
  IconCoupons,
  IconDiscount
} from '../icons';
import { useRouter } from 'expo-router';
import { CartContext } from '../../context/cartContext';
import { FavoritesContext } from '../../context/favoritesContext';
import { useAuth } from '../../context/authContext';
import { useMenu } from '../../context/menuContext';
import MenuDespegableModal from './Menu_despegable';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MENU_ITEM_WIDTH = SCREEN_WIDTH / 5;
const MENU_PADDING = 10;
const MENU_HEIGHT = 70;
const CENTER_BUTTON_OFFSET = 40;

export default function Menu() {
  const { user } = useAuth();
  const { cart } = useContext(CartContext);
  const { favorites } = useContext(FavoritesContext);
  const { shouldHideMenu } = useMenu();
  const router = useRouter();

  const pan = useRef(new Animated.ValueXY()).current;
  const [activeRoute, setActiveRoute] = useState('inicio');

  const handleNavigate = (route) => {
    setActiveRoute(route.replace('/', ''));
    router.push(route);
  };

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

  if (shouldHideMenu) return null;

  const handleCartPress = () => {
    router.push(user ? '/cart' : '/login');
  };

  const isAuthenticated = !!user;

  return (
    <>
      <View style={styles.menuContainer}>
        <View style={styles.menuContent}>
          {/* Sección izquierda - AHORA CON FAVORITOS PRIMERO */}
          <View style={styles.menuSection}>
            <MenuItem 
              icon={<IconFavorites size={22} color={activeRoute === 'favorites' ? '#00732E' : '#666'} />}
              label="Favoritos"
              isActive={activeRoute === 'favorites'}
              onPress={() => handleNavigate(isAuthenticated ? '/favorites' : '/login')}
              badgeCount={favorites.length}
            />
            
            <MenuDespegableModal onOpen={() => setActiveRoute('menu')}>
              <MenuItem 
                icon={<IconCategories size={22} color={activeRoute === 'menu' ? '#00732E' : '#666'} />}
                label="Menú"
                isActive={activeRoute === 'menu'}
                // no necesitas pasar onPress porque se inyecta desde MenuDespegableModal
              />
            </MenuDespegableModal>
          </View>
          
          {/* Botón de Inicio circular - SIN BORDE BLANCO */}
          <View style={styles.centerButtonContainer}>
            <TouchableOpacity 
              style={styles.centerButton}
              onPress={() => handleNavigate('/inicio')}
              activeOpacity={0.9}
            >
              <IconHome size={26} color="#fff" /> 
            </TouchableOpacity>
          </View>
                
          {/* Sección derecha */}
          <View style={styles.menuSection}>
            <MenuItem 
              icon={<IconDiscount size={22} color={activeRoute === 'ofertas' ? '#00732E' : '#666'} />}
              label="Ofertas"
              isActive={activeRoute === 'ofertas'}
              onPress={() => handleNavigate('/ofertas')}
            />
            
            <MenuItem 
              icon={<IconCoupons size={22} color={activeRoute === 'cupones' ? '#00732E' : '#666'} />}
              label="Cupones"
              isActive={activeRoute === 'cupones'}
              onPress={() => handleNavigate('/cupones')}
            />
          </View>

          


        </View>
        
      </View>

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
        <TouchableOpacity onPress={handleCartPress} activeOpacity={0.9}>
          <View>
            <IconShoppingCart size={24} color="#00732E" />
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const MenuItem = ({ icon, label, isActive, onPress, badgeCount = 0 }) => (
  <TouchableOpacity
    style={[
      styles.menuItem,
      isActive && styles.activeItemBackground
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.iconContainer}>
      {icon}
      {badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount}</Text>
        </View>
      )}
    </View>
    <Text style={[
      styles.menuLabel,
      isActive && styles.activeLabel
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 0.5,
    borderTopColor: '#e5e5e5',
    paddingVertical: 12,
    elevation: 8,
    height: MENU_HEIGHT,
  },
  menuContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 0,
  },
  menuSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  centerButtonContainer: {
    position: 'absolute',
    left: SCREEN_WIDTH / 2 - 35,
    bottom: CENTER_BUTTON_OFFSET,
    zIndex: 2,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(189, 236, 182, 0.9)', // Verde más claro con 85% de opacidad
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  centerButtonActive: {
    backgroundColor: '#E6F4EC',
    // BORDE ELIMINADO:
    // borderColor: '#00994D',
  },
  menuItem: {
    alignItems: 'center',
    paddingVertical: 4,
    width: SCREEN_WIDTH / 5,
    borderRadius: 8,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 2,
  },
  menuLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
    marginTop: 0,
  },
  activeLabel: {
    color: '#00732E',
    fontWeight: '600',
  },
  activeItemBackground: {
    backgroundColor: '#f5f5f5',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  draggableButton: {
    position: 'absolute',
    bottom: MENU_HEIGHT + 10,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 30,
    padding: 15,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 100,
    borderWidth: 0.5,
    borderColor: '#e5e5e5',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -4,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});