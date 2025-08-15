import { View } from "react-native";
import { Stack } from "expo-router";

import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Menu from "../components/menu/Menu";


import "../global.css"

//providers
import { Provider as PaperProvider } from "react-native-paper";
import { AuthProvider, useAuth } from "../context/authContext";
import { FavoritesProvider } from "../context/favoritesContext";
import { SearchProvider } from "../context/SearchContext";
import { MenuProvider , MenuContext } from "../context/menuContext";
import { CartProvider } from "../context/cartContext";



export default function Layout(){

 //montaje del menú
 //se utiliza para evitar render duplicado
 // y en funcion para esperar el Provider del menú
 
  



  return (
    <SafeAreaProvider>
      <PaperProvider>

        <AuthProvider>
          <MenuProvider>
            <SearchProvider>
            <CartProvider>
              <FavoritesProvider>
                
                  <View className="flex-1">
                    <Stack
                      screenOptions={{
                        headerShown: false,
                      }}

                    />
                      <Menu />

                  </View>
                
              </FavoritesProvider>
            </CartProvider>
          </SearchProvider>
        </MenuProvider>
      </AuthProvider>
    </PaperProvider>
  </SafeAreaProvider>
    )
}