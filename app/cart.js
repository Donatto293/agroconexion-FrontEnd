import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useContext } from 'react';
import { CartContext } from '../context/cartContext';
export default function CartScreen() {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);

  return (
    <SafeAreaView className="flex-1 p-4 bg-white">
        <View className="flex-1 p-4 bg-white">
        <Text className="text-2xl font-bold mb-4">Carrito de Compras</Text>

        {cart.length === 0 ? (
            <Text>El carrito está vacío.</Text>
        ) : (
            <>
            <FlatList
                data={cart}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View className="mb-4 p-3 bg-gray-100 rounded">
                    <Text className="text-lg">{item.product.title}</Text>
                    <Text className="text-green-600">
                        ${item.product.price}  x {item.quantity}
                    </Text>
                    <TouchableOpacity
                        onPress={() => removeFromCart(item.product.id)}
                        className="mt-2"
                    >
                        <Text className="text-red-500">Quitar</Text>
                    </TouchableOpacity>
                    </View>
                )}
            />
            <TouchableOpacity onPress={clearCart} className="mt-6 p-3 bg-red-200 rounded">
                <Text className="text-center text-red-700 font-bold">Vaciar carrito</Text>
            </TouchableOpacity>
            </>
        )}
        </View>
    </SafeAreaView>
  );
}