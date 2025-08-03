import { View, Text, FlatList, TouchableOpacity, SafeAreaView, Image, Platform } from 'react-native';
import { useContext, useCallback, memo } from 'react';
import { Link } from 'expo-router';
import { FavoritesContext } from '../context/favoritesContext';
import { IconHeart } from '../components/icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/authContext';
import api from '../utils/axiosInstance';

const FavoritesScreen = memo(() => {
  const { favorites, removeFavorite } = useContext(FavoritesContext);
  const router = useRouter();
  const { user } = useAuth();
  const API_URL = api.defaults.baseURL;

  const handleRemove = useCallback((productId) => {
    removeFavorite(productId);
  }, []);

  if (!user) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <View className="bg-white p-6 rounded-2xl shadow-md w-5/6 items-center">
          <Text className="text-xl font-semibold text-gray-900 mb-4">
            Inicia sesión para ver tus favoritos
          </Text>
          <TouchableOpacity 
            onPress={() => router.push('/login')}
            className="bg-emerald-500 py-2 px-6 rounded-full"
          >
            <Text className="text-white font-medium text-base">Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-4">
        {/* Header centrado con margen superior */}
        <View className="items-center" style={{ marginTop: Platform.OS === 'ios' ? 40 : 30, marginBottom: 16 }}>
          <Text className="text-3xl font-bold text-gray-900 text-center">
            Mis Favoritos
          </Text>
        </View>

        {/* Lista de favoritos o estado vacío */}
        {favorites.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <View className="items-center p-6 bg-white rounded-2xl w-full max-w-xs shadow-sm">
              <IconHeart color="#9CA3AF" size={48} />
              <Text className="text-lg font-medium text-gray-700 mt-4">
                Lista vacía
              </Text>
              <Text className="text-gray-500 mt-1 text-center">
                Guarda productos para verlos aquí
              </Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={item => item?.id?.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 28 }}
            renderItem={({ item }) => (
              <View className="mb-5 bg-white rounded-xl shadow-lg overflow-hidden">
                <Link href={`/${item.product.id}`} asChild>
                  <TouchableOpacity className="flex-row p-5 items-center">
                    <Image 
                      source={{ 
                        uri: item.product.images?.[0]
                          ? `${API_URL}${item.product.images[0].image}` 
                          : 'https://via.placeholder.com/120' 
                      }}
                      className="w-28 h-28 rounded-xl mr-4 bg-gray-100"
                    />
                    <View className="flex-1">
                      <Text className="text-xl font-semibold text-gray-900 mb-1">
                        {item.product.name}
                      </Text>
                      <Text className="text-2xl font-extrabold text-emerald-600 mb-1">
                        ${item.product.price}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        En stock • Envío gratis
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Link>

                <TouchableOpacity
                  onPress={() => removeFavorite(item.product.id)}
                  className="border-t border-gray-200 py-3 items-center bg-gray-50"
                >
                  <Text className="text-red-500 font-medium text-base">
                    Eliminar de favoritos
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
});

export default FavoritesScreen;