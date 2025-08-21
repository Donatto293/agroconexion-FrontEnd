import { View } from "react-native";
import { Stack } from "expo-router";

import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Menu from "../components/menu/Menu";


import "../global.css"

//providers
import { Provider as PaperProvider } from "react-native-paper";
import { AuthProvider, useAuth } from "../context/authContext";
import { FavoritesProvider } from "../context/favoritesContext";
import { SearchProvider } from "../context/SearchContext";
import { MenuProvider , MenuContext } from "../context/menuContext";
import { CartProvider } from "../context/cartContext";
import { MENU_HEIGHT } from "../context/menuContext";
import { ProductProvider } from "../context/productContext";

function AppWithStack() {
  const insets = useSafeAreaInsets();
  const bottomPadding = MENU_HEIGHT + insets.bottom; // espacio del menu + safe area

  return (
    <View style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { paddingBottom: bottomPadding } // <-- aplica padding global a todas las pantallas
        }}
      />
      <Menu />
    </View>
  );
}

export default function Layout(){

 //montaje del menú
 //se utiliza para evitar render duplicado
 // y en funcion para esperar el Provider del menú
 
  



  return (
    <SafeAreaProvider>
      <PaperProvider>

        <AuthProvider>
          <ProductProvider>
            <MenuProvider>
              <SearchProvider>
              <CartProvider>
                <FavoritesProvider>
                  
                    
                      <AppWithStack />
                      
                    
                  
                </FavoritesProvider>
              </CartProvider>
            </SearchProvider>
          </MenuProvider>
         </ProductProvider> 
      </AuthProvider>
    </PaperProvider>
  </SafeAreaProvider>
    )
}