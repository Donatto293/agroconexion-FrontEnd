
import React, { useState } from 'react';
import {
     View, 
     Text, 
     TouchableOpacity, 
     Animated,
    Image  } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import logo from '../../assets/logo.png';

import Menu from '../menu/Menu'; // menu 

export default function Header ( ) {

    //const insets = useSafeAreaInsets(); // Obtener los insets de la parte superior

  return (
    <View className=" h-16 flex-row justify-between items-center px-5 bg-[#00732E]">
          
            {/* Botón del menú */}
            <Menu/>
            <Text className="text-white text-lg font-bold">AgroConexion</Text>

            {/* Íconos */}
            <View className="flex-row justify-between items-center space-x-4">
            <Feather name="search" size={30} color="white" />
            <Image source={logo} style={{width:50, height:50}}/>
             
            </View>
        
    </View>
  )
}

