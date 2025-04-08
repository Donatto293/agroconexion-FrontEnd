import { View } from "react-native";
import Products from "../components/products"
import { SafeAreaView } from "react-native-safe-area-context";
import Carousel3D from "../components/carousel/Carousel3D";
import { ScrollView } from "react-native";
import Header from "../components/header/Header";
export default function Index() {
return (
    <SafeAreaView className="flex-1 justify-center items-center bg-gray-100" edges={['top', 'bottom']}> 
        <View className="position-absolute w-full h-50 bg-[#00732E]">
            <Header />
        </View>
        
        <ScrollView >
            
                <Carousel3D/>
                
                < Products />
                
            </ScrollView>
    </SafeAreaView>
)

}