import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useContext } from 'react';
import { Link } from 'expo-router';
import { CartContext } from '../context/cartContext';
import {loadCart} from '../context/cartContext';
import { IconArrowLeft } from '../components/icons';
import { useRouter } from 'expo-router';
export default function CartScreen() {
  const { cart, removeFromCart, clearCart, total } = useContext(CartContext);
    const router = useRouter();

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
                        <Text className="text-red-500">Quitar</Text>
                    </TouchableOpacity>
                    </View>
                )}
            />

            <View className="mt-4 p-4 bg-white rounded shadow">
                <Text className="text-xl font-bold text-right">
                Total: ${total.toFixed(2)}
                </Text>
            </View>

            <TouchableOpacity onPress={clearCart} className="mt-6 p-3 bg-red-200 rounded">
                <Text className="text-center text-red-700 font-bold">Vaciar carrito</Text>
            </TouchableOpacity>
            </>
        )}
        </View>
    </SafeAreaView>
  );
}