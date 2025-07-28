import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image
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

const CartScreen = memo(() => {
  const { cart, removeFromCart, clearCart, total, resetCart } = useContext(CartContext);
  const router = useRouter();
  const { products } = useProducts();
  const API_URL = api.defaults.baseURL;

  const [visible, setVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

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

  return (
    <SafeAreaView className="flex-1 bg-white p-2">
      <View className="flex-1 p-4 mb-4">
        {/* Header */}
        <View className="flex-row items-center mb-2">
          <TouchableOpacity onPress={() => router.back()} className="p-2 rounded-full">
            <IconArrowLeft color="#00732E" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold ml-4">Carrito de Compras</Text>
        </View>

        {/* Contenido */}
        {cart.length === 0 ? (
          <Text className="text-gray-500">El carrito está vacío.</Text>
        ) : (
          <>
            <FlatList
              data={cart}
              keyExtractor={(item) => item?.id?.toString()}
              renderItem={({ item }) => {
                const imageUrl = item.product?.images?.[0]?.image
                  ? `${API_URL}${item.product.images[0].image}`
                  : null;
                const stock = item.product?.stock ?? 0;

                return (
                  <View className="flex-row bg-gray-100 rounded-lg mb-4 p-3 shadow-sm items-center">
                    {imageUrl && (
                      <>
                        <TouchableOpacity onPress={() => {
                          setSelectedImage(imageUrl);
                          setVisible(true);
                        }}>
                          <Image
                            source={{ uri: imageUrl }}
                            className="w-24 h-24 rounded-lg bg-gray-200 mr-3"
                          />
                        </TouchableOpacity>
                      </>
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

            <TouchableOpacity onPress={handleRemove} className="mt-6 p-3 bg-red-200 rounded">
              <Text className="text-center text-red-700 font-bold">Vaciar carrito</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleCheckout} className="mt-4 p-3 bg-yellow-200 rounded">
              <Text className="text-center text-yellow-700 font-bold">Proceder al pago</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
});

export default CartScreen;