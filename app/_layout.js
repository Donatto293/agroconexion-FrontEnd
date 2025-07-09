import { View } from "react-native";
import { Stack } from "expo-router";
import { CartProvider } from "../context/cartContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";


import "../global.css"



export default function Layout(){
    return(
    <SafeAreaProvider>
       
          
          <View className="flex-1">
            <CartProvider>
              <Stack 
                screenOptions={
                  {
                      headerShown: false,

                }

              }
            />
            </CartProvider>
          </View>
        
    </SafeAreaProvider>
    )
}