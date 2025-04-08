import { View } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";


import "../global.css"
import Header from "../components/header/Header.android";


export default function Layout(){
    return(
    <SafeAreaProvider>
       
          
          <View className="flex-1">
            
            <Stack 
              screenOptions={
                {
                    headerShown: false,
                    
                }

              }
            />
          </View>
        
    </SafeAreaProvider>
    )
}