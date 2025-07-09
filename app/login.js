import { View , Text, TouchableOpacity} from "react-native"
import Login from "../components/login/Login"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"



export default function LoginView() {
    

    return(
        
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 bg-white justify-center">
                    <Login/>
                </View>
            </SafeAreaView>
    )
}