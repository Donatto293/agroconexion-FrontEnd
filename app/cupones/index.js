import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { useCart } from '../../context/cartContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconArrowLeft } from '../../components/icons';
import { useRouter } from 'expo-router';

const coupons = [
  {
    id: '1',
    title: 'Descuento de Bienvenida',
    description: '20% OFF en tu primera compra',
    discount: 20,
    code: 'BIENVENIDO20',
    expiration: 'Válido hasta 30/06/2023',
    image: require('../../assets/cupon1.png'),
    minPurchase: 50
  },
  {
    id: '2',
    title: 'Promo Verano',
    description: '15% OFF en compras mayores a $100',
    discount: 15,
    code: 'VERANO15',
    expiration: 'Válido hasta 15/08/2023',
    image: require('../../assets/cupon2.png'),
    minPurchase: 100
  },
  {
    id: '3',
    title: 'Envío Gratis',
    description: 'Envío gratis en compras mayores a $150',
    discount: 0,
    code: 'ENVIOGRATIS',
    expiration: 'Válido hasta 31/12/2023',
    image: require('../../assets/cupon3.png'),
    minPurchase: 150,
    freeShipping: true
  }
];

export default function CouponsScreen() {
  const { applyCoupon, appliedCoupon, subtotal } = useCart();
  const [selectedCoupon, setSelectedCoupon] = useState(null);
const router = useRouter()
  const handleApplyCoupon = (coupon) => {
    if (subtotal < coupon.minPurchase) {
      Alert.alert(
        'Compra mínima requerida',
        `Necesitas un mínimo de $${coupon.minPurchase} para usar este cupón`
      );
      return;
    }

    const success = applyCoupon(coupon);
    if (success) {
      setSelectedCoupon(coupon.id);
      setTimeout(() => setSelectedCoupon(null), 2000);
    }
  };

  const isCouponApplied = (couponId) => {
    return selectedCoupon === couponId || (appliedCoupon && appliedCoupon.id === couponId);
  };

  return (
    <SafeAreaView style={styles.container}>
             <View className=''>
                        <View className=" w-20 h-16 justify-center items-center  rounded-lg  ">
                                        <TouchableOpacity onPress={() => router.back()} className=" rounded-full m-2 ">
                                            <IconArrowLeft color="#00732E"  />
                                        </TouchableOpacity>
                        </View>
        <Text style={styles.header}>Cupones Disponibles</Text>
        <Text style={styles.subheader}>Selecciona un cupón para aplicarlo a tu compra</Text>
        
        <FlatList
            data={coupons}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
            <View style={[
                styles.couponCard,
                isCouponApplied(item.id) && styles.selectedCoupon,
                subtotal < item.minPurchase && styles.disabledCoupon
            ]}>
                <View style={styles.couponHeader}>
                <Image source={item.image} style={styles.couponImage} />
                <View style={styles.couponText}>
                    <Text style={styles.couponTitle}>{item.title}</Text>
                    <Text style={styles.couponDescription}>{item.description}</Text>
                </View>
                </View>
                
                <View style={styles.couponDetails}>
                <Text style={styles.couponCode}>Código: {item.code}</Text>
                <Text style={styles.couponExpiration}>{item.expiration}</Text>
                {item.minPurchase > 0 && (
                    <Text style={styles.couponCondition}>Mínimo de compra: ${item.minPurchase}</Text>
                )}
                </View>
                
                <TouchableOpacity 
                style={[
                    styles.applyButton,
                    isCouponApplied(item.id) && styles.appliedButton,
                    subtotal < item.minPurchase && styles.disabledButton
                ]}
                onPress={() => handleApplyCoupon(item)}
                disabled={subtotal < item.minPurchase}
                >
                <Text style={styles.applyButtonText}>
                    {isCouponApplied(item.id) ? '¡Aplicado!' : 
                    subtotal < item.minPurchase ? 'No disponible' : 'Aplicar Cupón'}
                </Text>
                </TouchableOpacity>
                
                {item.discount > 0 ? (
                <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{item.discount}%</Text>
                </View>
                ) : item.freeShipping ? (
                <View style={styles.shippingBadge}>
                    <Text style={styles.shippingText}>ENVÍO GRATIS</Text>
                </View>
                ) : null}
            </View>
            )}
            keyExtractor={item => item.id}
        />
        </View>
        
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    marginBottom: '30%'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center'
  },
  subheader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center'
  },
  listContainer: {
    paddingBottom: 20
  },
  couponCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden'
  },
  selectedCoupon: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9'
  },
  disabledCoupon: {
    opacity: 0.7
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  couponImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12
  },
  couponText: {
    flex: 1
  },
  couponTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  couponDescription: {
    fontSize: 14,
    color: '#666'
  },
  couponDetails: {
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12
  },
  couponCode: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#2196F3',
    marginBottom: 4
  },
  couponExpiration: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4
  },
  couponCondition: {
    fontSize: 12,
    color: '#FF9800'
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  appliedButton: {
    backgroundColor: '#2E7D32'
  },
  disabledButton: {
    backgroundColor: '#9E9E9E'
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  discountBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF5722',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 12
  },
  discountText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14
  },
  shippingBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#2196F3',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomLeftRadius: 8,
    borderTopRightRadius: 12
  },
  shippingText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12
  }
});