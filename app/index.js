import { View } from "react-native";
import Products from "../components/products"
import { SafeAreaView } from "react-native-safe-area-context";
export default function Index() {
return (
    <SafeAreaView className="flex-1 justify-center items-center bg-gray-100" edges={['top', 'bottom']}> 
        <Products/>
    </SafeAreaView>
)

}