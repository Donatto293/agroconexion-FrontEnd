import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { memo, useContext, useCallback, useState, useRef, useEffect } from 'react';
import { Link, useRouter } from 'expo-router';
import { CartContext } from '../context/cartContext';
import { IconArrowLeft, IconTrash } from '../components/icons';
import { createInvoiceFromCart } from '../api/invoices';
import { useProductsContext } from '../context/productContext';
import api from '../utils/axiosInstance';
import ImageViewing from 'react-native-image-viewing';
import PaymentScreen from '../components/payment';

const CartScreen = memo(() => {
  const { cart, removeFromCart, clearCart, total, resetCart, decreaseQuantity, increaseQuantity, updateQuantity } = useContext(CartContext);
  const router = useRouter();
  const { products } = useProductsContext();
  const API_URL = api.defaults.baseURL;

  const [visible, setVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentFormVisible, setPaymentFormVisible] = useState(false);

  const handleRemove = useCallback(() => {
    Alert.alert(
      "¿Vaciar carrito?",
      "Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", onPress: () => clearCart() }
      ]
    );
  }, []);

  const handleCheckout = useCallback(async () => {
    setPaymentModalVisible(false);
    if (cart.length === 0) {
      Alert.alert("Carrito vacío", "Agrega productos al carrito antes de proceder.");
      return;
    }
    try {
      const invoice = await createInvoiceFromCart();
      Alert.alert(
        "Compra exitosa",
        `Factura #${invoice.id} creada correctamente.`,
        [
          {
            text: "Ver factura",
            onPress: () => router.push(`/invoice/${invoice.id}`)
          },
          { text: "Cerrar", style: "cancel" }
        ]
      );
      resetCart();
    } catch (err) {
      Alert.alert("Error", err.response?.data.detail || "Error al generar factura");
    }
  }, [cart, resetCart]);

  const openPaymentModal = useCallback(() => {
    if (cart.length === 0) {
      Alert.alert("Carrito vacío", "Agrega productos al carrito antes de proceder.");
      return;
    }
    setPaymentModalVisible(true);
  }, [cart]);

  const handlePaymentSuccess = () => {
    setPaymentFormVisible(false);
    handleCheckout();
  };

  const QuantityControl = memo(({ item }) => {
    const [quantity, setQuantity] = useState(String(item.quantity));
    const stock = item.product?.stock ?? 0;

    useEffect(() => {
      setQuantity(String(item.quantity));
    }, [item.quantity]);

    const handleTextChange = (text) => {
      setQuantity(text.replace(/[^0-9]/g, ''));
    };

    const handleBlur = () => {
      let newQuantity;
      
      try {
        newQuantity = parseInt(quantity, 10);
      } catch (e) {
        newQuantity = 0;
      }

      if (isNaN(newQuantity) || newQuantity < 1) {
        newQuantity = 1;
      } else if (newQuantity > stock) {
        newQuantity = stock;
      }

      if (newQuantity !== item.quantity) {
        updateQuantity(item.product.id, newQuantity);
      }
    };

    return (
      <View className="flex-row items-center mt-2">
        <View className="flex-row items-center border border-gray-300 rounded-lg overflow-hidden">
          <TouchableOpacity
            onPress={() => decreaseQuantity(item.product.id)}
            className="p-2"
            disabled={item.quantity <= 1}
          >
            <Text className="text-xl font-bold text-gray-700">-</Text>
          </TouchableOpacity>
          <TextInput
            className="px-2 text-lg font-bold text-gray-800 text-center w-14"
            value={quantity}
            onChangeText={handleTextChange}
            onBlur={handleBlur}
            keyboardType="numeric"
            selectTextOnFocus={true}
          />
          <TouchableOpacity
            onPress={() => increaseQuantity(item.product.id)}
            className="p-2"
            disabled={item.quantity >= stock}
          >
            <Text className="text-xl font-bold text-gray-700">+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => removeFromCart(item.product.id)}
          className="ml-4 p-2 self-start"
        >
          <IconTrash />
        </TouchableOpacity>
      </View>
    );
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-4 pb-44">
        {/* Header */}
        <View className="relative items-center mb-6 mt-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute left-2 p-2 rounded-full"
          >
            <IconArrowLeft color="#00732E" size={28} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-center">Carrito de Compras</Text>
        </View>

        {/* Contenido */}
        {cart.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <View className="items-center p-6 bg-white rounded-2xl w-full max-w-xs shadow-sm">
              <Text className="text-lg font-medium text-gray-700 mt-4">
                Lista vacía
              </Text>
              <Text className="text-gray-500 mt-1 text-center">
                Guarda productos para verlos aquí
              </Text>
            </View>
          </View>
        ) : (
          <Animated.FlatList
            data={cart}
            keyExtractor={(item) => item?.id?.toString()}
            renderItem={({ item }) => {
              const imageUrl = item.product?.images?.[0]?.image
                ? `${API_URL}${item.product.images[0].image}`
                : null;

              return (
                <View className="flex-row bg-gray-100 rounded-lg mb-4 p-3 shadow-sm items-center">
                  {imageUrl && (
                    <TouchableOpacity onPress={() => {
                      setSelectedImage(imageUrl);
                      setVisible(true);
                    }}>
                      <Image
                        source={{ uri: imageUrl }}
                        className="w-24 h-24 rounded-lg bg-gray-200 mr-3"
                      />
                    </TouchableOpacity>
                  )}
                  <View className="flex-1">
                    <Link key={`/${item.product.id}`} href={`/${item.product.id}`} asChild>
                      <Text className="text-lg font-semibold text-gray-800">
                        {item.product.name}
                      </Text>
                    </Link>
                    <Text className="text-green-600 mt-1">
                     COL ${item.product.price} x {item.quantity} /
                      {item.product.unit_of_measure}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                      Stock disponible: {item.product?.stock ?? 0 > 0 ? item.product.stock : 'Agotado'}
                    </Text>
                    <QuantityControl item={item} />
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>

      {/* Barra fija inferior */}
      {cart.length > 0 && (
        <View
          className="bg-white px-4 py-3 border-t border-gray-200 shadow-lg absolute bottom-0 left-0 right-0 z-10"
        >
          <View className="items-center mb-4">
            <View className="bg-green-100 rounded-lg p-3">
              <Text className="text-xl font-bold text-green-800">
                Total: ${total.toFixed(2)}| COL
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={handleRemove} className="flex-1 mr-2 px-4 py-2 bg-red-200 rounded-lg">
              <Text className="text-red-700 font-bold text-center">Vaciar carrito</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={openPaymentModal} className="flex-1 ml-2 px-4 py-2 bg-yellow-200 rounded-lg">
              <Text className="text-yellow-700 font-bold text-center">Proceder al pago</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modales */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={paymentModalVisible}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg w-5/6 max-w-md">
            <Text className="text-xl font-bold mb-4">Confirmar Pago</Text>
            <Text className="text-lg mb-6">
              ¿Estás seguro que deseas proceder con el pago de ${total.toFixed(2)}?
            </Text>
            <View className="flex-row justify-between">
              <Pressable
                className="px-6 py-3 bg-gray-300 rounded-lg"
                onPress={() => setPaymentModalVisible(false)}
              >
                <Text className="font-medium">Cancelar</Text>
              </Pressable>
              <Pressable
                className="px-6 py-3 bg-green-600 rounded-lg"
                onPress={() => {
                  setPaymentModalVisible(false);
                  setPaymentFormVisible(true);
                }}
              >
                <Text className="text-white font-medium">Confirmar Pago</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={false}
        visible={paymentFormVisible}
        onRequestClose={() => setPaymentFormVisible(false)}
      >
        <PaymentScreen
          total={total}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={() => setPaymentFormVisible(false)}
        />
      </Modal>

      {/* ImageViewing y otros componentes */}
      <ImageViewing
        images={selectedImage ? [{ uri: selectedImage }] : []}
        imageIndex={0}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      />
    </SafeAreaView>
  );
});

export default CartScreen;