import { View } from "react-native";
import { Stack } from "expo-router";
import { CartProvider } from "../context/cartContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";


import "../global.css"
import { FavoritesProvider } from "../context/favoritesContext";



export default function Layout(){
    return(
    <SafeAreaProvider>
       
          
          <View className="flex-1">
            <CartProvider>
              <FavoritesProvider>
                <Stack 
                  screenOptions={
                    {
                        headerShown: false,

                  }

                }
              />
              </FavoritesProvider>
            </CartProvider>
            
          </View>
        
    </SafeAreaProvider>
    )
}