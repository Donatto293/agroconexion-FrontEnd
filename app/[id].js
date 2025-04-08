import { Text, View, Image, ActivityIndicator, Pressable } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";

export default function Detail(){
    const { product } = useLocalSearchParams(); 
    const productData = JSON.parse(product);

    if (!productData) {
        return <ActivityIndicator size="large" color="#00732E" />;
    }

    
    return (
        <View className="flex-1 p-4 bg-gray-100">
            <View className="bg-white p-4 rounded-lg shadow-sm">
                <Image 
                    source={{ uri: productData.image }} 
                    className="w-full h-64 rounded-lg mb-4"
                    resizeMode="contain"
                />
                <Text className="text-2xl font-bold mb-2">{productData.title}</Text>
                <Text className="text-gray-600 text-base mb-4">{productData.description}</Text>
                <Text className="text-green-600 text-xl font-bold mb-4">
                    ${productData.price}
                </Text>
                
                <Link href="/" className="text-blue-500 text-center" asChild>
                    
                        Volver a productos
                    
                </Link>
            </View>
        </View>
    );
}