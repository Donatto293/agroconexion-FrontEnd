import { View, Text, ActivityIndicator, ScrollView, Image, StyleSheet, Pressable } from 'react-native';
import useProducts from '../api/products';
import { useRouter, Link } from 'expo-router';

export default function Products() {
    const router = useRouter();
    const { products, loading, error } = useProducts();
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
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.mainTitle}>Lista de Productos</Text>
            
            <View style={styles.productsGrid}>
                {products.map((product) => (
                    <Link key={product.id} href={`/${product.id}`} asChild>
                        <Pressable style={styles.productCard}>
                            <View style={styles.cardContent}>
                                <Image 
                                    source={{ uri: product.image }} 
                                    style={styles.productImage} 
                                />
                                <View style={styles.textContainer}>
                                    <Text style={styles.productTitle} numberOfLines={1}>
                                        {product.title}
                                    </Text>
                                    <Text style={styles.productDescription} numberOfLines={2}>
                                        {product.description}
                                    </Text>
                                    <Text style={styles.productPrice}>
                                        ${product.price}
                                    </Text>
                                </View>
                            </View>
                        </Pressable>
                    </Link>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        padding: 16,
        backgroundColor: '#f5f5f5'
    },
    mainTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 16,
        color: '#333'
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
    },
    productCard: {
        width: '48%',
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        height: 280 // Altura fija para todas las tarjetas
    },
    cardContent: {
        flex: 1
    },
    productImage: {
        width: '100%',
        height: 150,
        resizeMode: 'contain',
        backgroundColor: '#f9f9f9',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12
    },
    textContainer: {
        padding: 12,
        flex: 1,
        justifyContent: 'space-between'
    },
    productTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        marginBottom: 6
    },
    productDescription: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
        lineHeight: 18,
        textAlign: 'center'
    },
    productPrice: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#00732E',
        marginTop: 'auto',
        textAlign: 'center'
        
    }
});