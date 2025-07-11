import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useContext } from 'react';
import { Link } from 'expo-router';

import { FavoritesContext } from '../context/favoritesContext';
export default function FavoritesScreen() {
  const { addFavorite, removeFromFavorites, clearFavorites } = useContext(FavoritesContext);


  return (
    <SafeAreaView className="flex-1 p-4 bg-white">
        <View className="flex-1 p-4 bg-white">
        <Text className="text-2xl font-bold mb-4">Aun no tienes favoritos</Text>

        {favorites.length === 0 ? (
            <Text>No tienes favoritos.</Text>
        ) : (
            <>
            <FlatList
                data={favorites}
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
                        onPress={() => removeFromFavorites(item.product.id)}
                        className="mt-2"
                    >
                        <Text className="text-red-500">Quitar</Text>
                    </TouchableOpacity>
                    </View>
                )}
            />

            <TouchableOpacity onPress={clearFavorites} className="mt-6 p-3 bg-red-200 rounded">
                <Text className="text-center text-red-700 font-bold">Vaciar favoritos</Text>
            </TouchableOpacity>
            </>
        )}
        </View>
    </SafeAreaView>
  );
}