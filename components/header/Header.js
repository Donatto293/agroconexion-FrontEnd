import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import logo from '../../assets/logo.png';
import { SearchContext } from '../../context/SearchContext';
import { useAuth } from '../../context/authContext';
import { useRouter } from 'expo-router';

export default function HeaderScreen() {
  const [searchActive, setSearchActive] = useState(false);
  const { searchQuery, setSearchQuery } = useContext(SearchContext);
  const { user } = useAuth();
  const router = useRouter();
  const avatar = user?.avatar;

  const handleProfilePress = () => {
    router.push(user ? '/perfil' : '/login'); // Redirige según autenticación
  };

  return (
    <View className="h-16 flex-row justify-between items-center px-5 bg-[#00732E]">
      {searchActive ? (
        <TextInput
          placeholder="Buscar..."
          placeholderTextColor="black"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 ml-4 bg-white rounded-full px-4 py-2 shadow-md"
          style={{ color: '#111' }}
          selectionColor="#00732E"
          autoFocus
          onBlur={() => setSearchActive(false)}
        />
      ) : (
        <View className="flex-row items-center">
          {/* Botón de perfil dinámico */}
          <TouchableOpacity onPress={handleProfilePress}>
            <View className="w-10 h-10 rounded-full bg-white mr-3 overflow-hidden border-2 border-white">
              {avatar ? (
                <Image
                  source={{ uri: avatar }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <View className="flex-1 justify-center items-center">
                  <Feather name="user" size={20} color="#00732E" />
                </View>
              )}
            </View>
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">AgroConexion</Text>
        </View>
      )}

      <View className="flex-row justify-between items-center space-x-4">
        <TouchableOpacity onPress={() => setSearchActive(prev => !prev)}>
          <Feather name="search" size={30} color="white" />
        </TouchableOpacity>
        <Image source={logo} style={{ width: 50, height: 50 }} />
      </View>
    </View>
  );
}