// components/CouponCarousel.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useCart } from '../../context/cartContext'; // Asegúrate de que la ruta sea correcta
import { useRouter } from 'expo-router'; // Si usas Expo Router

const coupons = [
  {
    id: '1',
    title: 'Descuento de Bienvenida',
    description: '20% OFF en tu primera compra',
    discount: 20,
    code: 'BIENVENIDO20',
    expiration: 'Válido hasta 30/06/2026',
    image: require('../../assets/cupon1.png'), // Asegúrate de que las imágenes existan
    minPurchase: 50
  },
  {
    id: '2',
    title: 'Promo Verano',
    description: '15% OFF en compras mayores a $100',
    discount: 15,
    code: 'VERANO15',
    expiration: 'Válido hasta 15/08/2026',
    image: require('../../assets/cupon2.png'),
    minPurchase: 100
  },
  {
    id: '3',
    title: 'Envío Gratis',
    description: 'Envío gratis en compras mayores a $150',
    discount: 0,
    code: 'ENVIOGRATIS',
    expiration: 'Válido hasta 31/12/2026',
    image: require('../../assets/cupon3.png'),
    minPurchase: 150,
    freeShipping: true
  }
];

export default function CouponCarousel({ onApplyCoupon }) {
  const { subtotal } = useCart();
  const router = useRouter();

  const renderCouponItem = ({ item }) => {
    const isDisabled = subtotal < item.minPurchase;
    
    return (
      <TouchableOpacity 
        style={[styles.card, isDisabled && styles.disabledCard]}
        onPress={() => {
          if (!isDisabled) {
            onApplyCoupon(item);
          }
        }}
        disabled={isDisabled}
      >
        <Image 
          source={item.image} 
          style={styles.image} 
        />
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.code}>CÓDIGO: {item.code}</Text>
          <Text style={[styles.condition, isDisabled && styles.conditionDisabled]}>
            {isDisabled ? `Mín. $${item.minPurchase} para aplicar` : 'Disponible'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Cupones Disponibles</Text>
        <TouchableOpacity onPress={() => router.push('/coupons-screen')}>
          <Text style={styles.seeAllText}>Ver todos</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={coupons}
        renderItem={renderCouponItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  seeAllText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500'
  },
  list: {
    paddingHorizontal: 16
  },
  card: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  disabledCard: {
    opacity: 0.6
  },
  image: {
    width: '100%',
    height: 80
  },
  infoContainer: {
    padding: 12
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  code: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold',
    marginBottom: 4
  },
  condition: {
    fontSize: 12,
    color: '#4CAF50'
  },
  conditionDisabled: {
    color: '#FF5722'
  }
});