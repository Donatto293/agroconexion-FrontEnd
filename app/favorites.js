import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useContext, useCallback, memo } from 'react';
import { Link } from 'expo-router';

import { FavoritesContext } from '../context/favoritesContext';
import { IconArrowLeft } from '../components/icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/authContext';

const FavoritesScreen = memo(() => {
  const { favorites, removeFavorite } = useContext(FavoritesContext);
  const router = useRouter();
  const { user } = useAuth();

  const handleRemove = useCallback((productId) => {
    removeFavorite(productId);
  }, []);

  if (!user) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-center text-red-500">Debes iniciar sesión para ver tus favoritos</Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView className="flex-1 p-4 bg-white">
      <View className="flex-1 p-4 bg-white">
        <View className=''>
            <View className=" w-20 h-16 justify-center items-center  rounded-lg  ">
                            <TouchableOpacity onPress={() => router.back()} className=" rounded-full m-2 ">
                                <IconArrowLeft color="#00732E"  />
                            </TouchableOpacity>
            </View>
        </View>
        <Text className="text-2xl text-center font-bold mb-4">Tus favoritos</Text>

        {favorites.length === 0 ? (
          <Text className="text-gray-600">No tienes productos en favoritos.</Text>
        ) : (
          <>
            <FlatList
              data={favorites}
              keyExtractor={item => item?.id?.toString()}
              renderItem={({ item }) => (
                <View className="mb-4 p-3 bg-gray-100 rounded">
                  <Link href={`/${item.product.id}`} asChild>
                    <Text className="text-lg font-semibold text-blue-800">
                      {item.product.name}
                    </Text>
                  </Link>

                  <Text className="text-green-600 mt-1">
                    ${item.product.price}
                  </Text>

                  <TouchableOpacity
                    onPress={() => removeFavorite(item.product.id)}
                    className="mt-2"
                  >
                    <Text className="text-red-500">Quitar de favoritos</Text>
                  </TouchableOpacity>
                </View>
              )}
            />

            
          </>
        )}
      </View>
    </SafeAreaView>
  );
});

export default FavoritesScreen;