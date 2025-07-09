import { View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { ScrollView } from "react-native";
import Header from "../components/header/Header";
import ProductSmall from "../components/productSmall";
import useProducts from "../lib/products";
import Products from "../components/products";


export default function Index() {
    const { products, loading, error } = useProducts();
return (
    <SafeAreaView className="flex-1 justify-center items-center bg-gray-100" edges={['top', 'bottom']}> 
        <View className="position-absolute w-full h-50 bg-[#00732E]">
            <Header />
        </View>
        
        <ScrollView >
            
               
                
                < ProductSmall products={products} loading={loading} error={error} />
                <Products products={products} loading={loading} error={error} />
            </ScrollView>
    </SafeAreaView>
)

}