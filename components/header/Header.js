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
import Menu from '../menu/Menu';
import { SearchContext } from '../../context/SearchContext';

export default function Header() {
  const [searchActive, setSearchActive] = useState(false);
  const { searchQuery, setSearchQuery } = useContext(SearchContext);

  return (
    <View className="h-16 flex-row justify-between items-center px-5 bg-[#00732E]">
      <Menu />

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
        <Text className="text-white text-lg font-bold">AgroConexion</Text>
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