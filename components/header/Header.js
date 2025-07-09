
import React, { useState } from 'react';
import {
     View, 
     Text, 
     TouchableOpacity,
     TextInput,
     Animated,
    Image  } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import logo from '../../assets/logo.png';

import Menu from '../menu/Menu'; // menu 

export default function Header ( ) {

    //const insets = useSafeAreaInsets(); // Obtener los insets de la parte superior
    const [searchActive, setSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');


  return (
    <View className=" h-16 flex-row justify-between items-center px-5 bg-[#00732E]">
          
            {/* Botón del menú */}
            <Menu/>
            {/* Título o campo de búsqueda */}
      {searchActive ? (
        <TextInput
          placeholder="Buscar..."
          placeholderTextColor="black"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 ml-4 bg-white rounded-full px-4 py-2 shadow-md"
          style={{
            color: '#111',
            
          }}
          selectionColor="#00732E" // Color del cursor
          autoFocus  //para que se enfoque automáticamente en el campo de búsqueda
          onBlur={() => setSearchActive(false)} // Cerrar el campo de búsqueda al perder el foco
        />
      ) :(
            <Text className="text-white text-lg font-bold">AgroConexion</Text>
      )}

            {/* Íconos */}
            <View className="flex-row justify-between items-center space-x-4">
            {/* La función callback dentro de setSearchActive recibe el valor previo (prev)
            y lo invierte (!prev) */}
            <TouchableOpacity onPress={() => setSearchActive(prev => !prev)} >
              <Feather name="search" size={30} color="white" />
            </TouchableOpacity>
            <Image source={logo} style={{width:50, height:50}}/>
             
            </View>
        
    </View>
  )
}

