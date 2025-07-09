import { View } from "react-native";
import Register from "../components/login/Register";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

export default function RegisterView() {

    return (
        
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 bg-white justify-center">
                    <Register/>
                </View>
            </SafeAreaView>
      
    )
}