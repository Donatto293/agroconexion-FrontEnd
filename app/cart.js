import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { memo, useContext, useCallback, useState } from 'react';
import { Link } from 'expo-router';
import { CartContext } from '../context/cartContext';
import { IconArrowLeft, IconTrash } from '../components/icons';
import { useRouter } from 'expo-router';
import { createInvoiceFromCart } from '../api/invoices';
import useProducts from '../api/products';
import api from '../utils/axiosInstance';
import ImageViewing from 'react-native-image-viewing';

import PaymentScreen from '../components/payment';

const CartScreen = memo(() => {
  const { cart, removeFromCart, clearCart, total, resetCart } = useContext(CartContext);
  const router = useRouter();
  const { products } = useProducts();
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

  return (
    <SafeAreaView className="flex-1 bg-white p-2 mt-2">
      <View className="flex-1 p-4 mb-4">
        {/* Header */}
        <View className="relative items-center mb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute left-2 p-2 rounded-full"
          >
            <IconArrowLeft color="#00732E" />
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
          <>
            <FlatList
              data={cart}
              keyExtractor={(item) => item?.id?.toString()}
              contentContainerStyle={{ paddingBottom: 20 }} // 👈 Espacio extra para evitar que el menú tape los botones
              renderItem={({ item }) => {
                const imageUrl = item.product?.images?.[0]?.image
                  ? `${API_URL}${item.product.images[0].image}`
                  : null;
                const stock = item.product?.stock ?? 0;

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
                      <Link
                        key={`/${item.product.id}`}
                        href={`/${item.product.id}`}
                        asChild
                      >
                        <Text className="text-lg font-semibold text-gray-800">
                          {item.product.name}
                        </Text>
                      </Link>

                      <Text className="text-green-600 mt-1">
                        ${item.product.price} x {item.quantity}
                      </Text>

                      <Text className="text-sm text-gray-500 mt-1">
                        Stock disponible: {stock > 0 ? stock : 'Agotado'}
                      </Text>

                      <TouchableOpacity
                        onPress={() => removeFromCart(item.product.id)}
                        className="mt-2 self-start"
                      >
                        <IconTrash />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />

            {/* Zoom imagen */}
            <ImageViewing
              images={[{ uri: selectedImage }]}
              imageIndex={0}
              visible={visible}
              onRequestClose={() => setVisible(false)}
            />

            {/* Total y acciones */}
            <View className="mt-4 p-4 bg-white rounded shadow">
              <Text className="text-xl font-bold text-right">
                Total: ${total.toFixed(2)}
              </Text>
            </View>

            {/* Botones elevados */}
            <View className="mt-4 mb-20">
              <TouchableOpacity onPress={handleRemove} className="p-3 bg-red-200 rounded mb-3">
                <Text className="text-center text-red-700 font-bold">Vaciar carrito</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={openPaymentModal} className="p-3 bg-yellow-200 rounded">
                <Text className="text-center text-yellow-700 font-bold">Proceder al pago</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Modal de Confirmación de Pago */}
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

      {/* Modal con el formulario de pago */}
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
    </SafeAreaView>
  );
});

export default CartScreen;