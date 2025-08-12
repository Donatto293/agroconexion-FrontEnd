import React, { useRef, useContext, useState } from 'react';
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  StyleSheet,
  PanResponder,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager
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

const SCREEN_WIDTH = Dimensions.get('window').width;


export default function Menu() {
  const { user } = useAuth();
  const { cart } = useContext(CartContext);
  const { favorites } = useContext(FavoritesContext);
  const { shouldHideMenu } = useMenu();
  const router = useRouter();

  const pan = useRef(new Animated.ValueXY()).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const username = user?.username;

  const [activeRoute, setActiveRoute] = useState('inicio');

  const handleNavigate = (route) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveRoute(route.replace('/', ''));
    router.push(route);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
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

  return (
    <>
      <View style={styles.menuContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.bottomMenu}
          contentContainerStyle={styles.menuContent}
        >
          {/* Favoritos */}
          <TouchableOpacity
            style={[
              styles.menuItem,
              activeRoute === 'favorites' && styles.activeItemBackground
            ]}
            onPress={() => handleNavigate(username ? '/favorites' : '/login')}
          >
            <IconFavorites size={24} color={activeRoute === 'favorites' ? '#00732E' : '#999'} />
            {favorites.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{favorites.length}</Text>
              </View>
            )}
            <Text style={[
              styles.menuLabel,
              activeRoute === 'favorites' && styles.activeLabel
            ]}>
              Favoritos
            </Text>
          </TouchableOpacity>

          {/* Categorías */}
          <TouchableOpacity
            style={[
              styles.menuItem,
              activeRoute === 'categorias' && styles.activeItemBackground
            ]}
            onPress={() => handleNavigate('/categorias')}
          >
            <IconCategories size={24} color={activeRoute === 'categorias' ? '#00732E' : '#999'} />
            <Text style={[
              styles.menuLabel,
              activeRoute === 'categorias' && styles.activeLabel
            ]}>
              Categorías
            </Text>
          </TouchableOpacity>

          {/* Inicio */}
          <TouchableWithoutFeedback
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => handleNavigate('/inicio')}
          >
            <Animated.View
              style={[
                styles.menuItem,
                styles.centerItem,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <IconHome size={28} color="#fff" />
              <Text style={[styles.menuLabel, styles.centerLabel]}>
                Inicio
              </Text>
            </Animated.View>
          </TouchableWithoutFeedback>

          {/* Cupones */}
          <TouchableOpacity
            style={[
              styles.menuItem,
              activeRoute === 'cupones' && styles.activeItemBackground
            ]}
            onPress={() => handleNavigate('/cupones')}
          >
            <IconCoupons size={24} color={activeRoute === 'cupones' ? '#00732E' : '#999'} />
            <Text style={[
              styles.menuLabel,
              activeRoute === 'cupones' && styles.activeLabel
            ]}>
              Cupones
            </Text>
          </TouchableOpacity>

          {/* Ofertas */}
          <TouchableOpacity
            style={[
              styles.menuItem,
              activeRoute === 'ofertas' && styles.activeItemBackground
            ]}
            onPress={() => handleNavigate('/ofertas')}
          >
            <IconDiscount size={24} color={activeRoute === 'ofertas' ? '#00732E' : '#999'} />
            <Text style={[
              styles.menuLabel,
              activeRoute === 'ofertas' && styles.activeLabel
            ]}>
              Ofertas
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Botón flotante del carrito */}
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
        <TouchableOpacity onPress={handleCartPress} activeOpacity={0.8}>
          <View>
            <IconShoppingCart size={32} color="#00732E" />
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

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    paddingBottom: 25,
  },
  bottomMenu: {
    width: '100%',
    paddingVertical: 2,
  },
  menuContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  menuItem: {
    alignItems: 'center',
    paddingVertical: 8,
    minWidth: 70,
    position: 'relative',
    borderRadius: 12,
  },
  centerItem: {
    marginHorizontal: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 32,
    backgroundColor: '#00994D',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  menuLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#000',
    fontWeight: '600',
  },
  centerLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  activeLabel: {
    color: '#00732E',
  },
  activeItemBackground: {
    backgroundColor: '#E6F4EC',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
draggableButton: {
  position: 'absolute',
  bottom: '12%',
  right: 16, // 👈 Lo movemos a la derecha
  backgroundColor: '#ffffff',
  borderRadius: 40,
  borderBottomWidth: 9, // Grosor del borde inferior
  

  borderBottomColor: '#04a909ff', // Color rojo
  padding: 16,
  elevation: 30,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  zIndex: 100,

},

  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
   
    fontWeight: 'bold',
  },
});