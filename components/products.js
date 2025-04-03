import { View, Text , ActivityIndicator, ScrollView, Image, StyleSheet, Pressable} from 'react-native';
import useFakeProducts from '../lib/fakeProduct';
import { Link } from 'expo-router';


export default function Products() {
    const { products, loading, error } = useFakeProducts();
    if (loading) {
        return <ActivityIndicator size="large" color="#00732E" />;
    }
    if (error) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-red-500 text-lg">{error}</Text>
            </View>
        );
    }
    return (
        
            <View className="bg-gray-100">
               
             
                <Text className="text-lg font-bold text-center mt-4">Lista de Productos</Text>
                {products.map((product) => (
                    <Link key={product.id} href={{
                        pathname: `/${product.id}`,
                        params: { product: JSON.stringify(product) }

                    }}  
                        className="flex-1" asChild>
                        <Pressable className="active:opacity-50" android_ripple={{ color: '#A8E6A3' }}>

                            <View key={product.id} className="p-4 bg-white m-2 rounded shadow">
                                <Text className="text-xl font-semibold">{product.title}</Text>
                                <Image source={{ uri: product.image }} style={styles.image} />
                                <Text className="text-gray-600">{product.description}</Text>
                                <Text className="text-green-500">${product.price}</Text>
                            </View>
                        </Pressable>
                    </Link>
                ))}
            </View>
       
    );

   
};
const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: 160,
        borderRadius: 10,
        marginBottom: 10,
        resizeMode: 'center',
    },
})
