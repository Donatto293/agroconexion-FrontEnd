import { View } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/header";

import "../global.css"


export default function Layout(){
    return(
    <SafeAreaProvider>
        <View 
                
        className="flex-1 bg-gray-100"
            >
          <Header />
          <View className="flex-1">
            <Stack />
          </View>
        </View>
    </SafeAreaProvider>
    )
}