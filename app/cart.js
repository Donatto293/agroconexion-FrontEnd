import { View, Text, FlatList, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import {  memo, useContext, useCallback } from 'react';
import { Link } from 'expo-router';
import { CartContext } from '../context/cartContext';
import { IconArrowLeft } from '../components/icons';
import { useRouter } from 'expo-router';
import { IconTrash } from '../components/icons';
import { createInvoiceFromCart } from '../api/invoices';
 

const CartScreen = memo(() => {
  const { cart, removeFromCart, clearCart, total, resetCart } = useContext(CartContext)
  const router = useRouter();

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

    const handleCheckout = useCallback(async() => {
    if (cart.length === 0) {
      Alert.alert("Carrito vacío", "Agrega productos al carrito antes de proceder.");
      return;
    }
    try {
        const invoice = await createInvoiceFromCart();
        console.log("Factura creada:", invoice);
        Alert.alert(
            'Compra exitosa',
            `Factura #${invoice.id} creada correctamente.`,
            [
                {
                text: 'Ver factura',
                onPress: () => router.push(`/invoice/${invoice.id}`)
                },
                { text: 'Cerrar', style: 'cancel' }
            ]
            );

        // Limpias el carrito tras crear la factura

        resetCart()
        console.log(("despues de compraarr"))
        } catch (err) {
            console.error(err);
            Alert.alert({ message: err.response?.data.detail || 'Error al generar factura', type: 'danger' });
            }
        }, [cart, clearCart, router]);

  return (
    <SafeAreaView className="flex-1 p-4 bg-white">
        <View className="flex-1 p-4 bg-white">
        <Text className="text-2xl font-bold mb-4">Carrito de Compras</Text>
        <View className=''>
            <View className=" w-20 h-16 justify-center items-center  rounded-lg  ">
                            <TouchableOpacity onPress={() => router.back()} className=" rounded-full m-2 ">
                                <IconArrowLeft color="#00732E"  />
                            </TouchableOpacity>
            </View>
        </View>

        {cart.length === 0 ? (
            <Text>El carrito está vacío.</Text>
        ) : (
            <>
            <FlatList
                data={cart}
                keyExtractor={item => item?.id?.toString()}
                renderItem={({ item }) => (
                  
                    <View className="mb-4 p-3 bg-gray-100 rounded">
                          
                    <Link key={`/${item.product.id}`}
                        href={`/${item.product.id}`}
                        className="flex-1" asChild>
                    <Text className="text-lg">{item.product.name}</Text>
                    </Link>
                    {console.log(item)}
                    <Text className="text-green-600">
                        ${item.product.price}  x {item.quantity}
                    </Text>
                    <TouchableOpacity
                        onPress={() => removeFromCart(item.product.id)}
                        className="mt-2"
                    >
                        <IconTrash />
                    </TouchableOpacity>
                    </View>
                )}
            />

            <View className="mt-4 p-4 bg-white rounded shadow">
                <Text className="text-xl font-bold text-right">
                Total: ${total.toFixed(2)}
                </Text>
            </View>

            <TouchableOpacity onPress={handleRemove} className="mt-6 p-3 bg-red-200 rounded">
                <Text className="text-center text-red-700 font-bold">Vaciar carrito</Text>
            </TouchableOpacity>

             <TouchableOpacity onPress={handleCheckout} className="mt-6 p-3 bg-yellow-200 rounded">
                <Text className="text-center text-yellow-700 font-bold">Proceder al pago</Text>
            </TouchableOpacity>
            </>
        )}
        </View>
    </SafeAreaView>
  );
});

export default CartScreen;