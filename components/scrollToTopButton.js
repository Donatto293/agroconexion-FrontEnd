import React, { useEffect, useRef, memo } from 'react';
import { Animated, TouchableOpacity, Text, StyleSheet, View } from 'react-native';

const ScrollToTopButton = memo(({ scrollRef, scrollOffset }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const visible = scrollOffset; // scrollOffset ya es booleano (true/false)

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: visible ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [visible, fadeAnim]);

    const scrollToTop = () => {
        scrollRef?.current?.scrollTo({ y: 0, animated: true });
    };

    // Si no está visible y la animación ha terminado, no renderizar
    if (!visible && fadeAnim.__getValue() === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.buttonContainer, { 
                opacity: fadeAnim,
                transform: [{
                    translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [100, 0]
                    })
                }]
            }]}>
                <TouchableOpacity 
                    style={styles.button}
                    onPress={scrollToTop}
                >
                    <Text style={styles.buttonText}>↑ Volver arriba</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        pointerEvents: 'box-none', // Permite clics a través de este contenedor
        zIndex: 1000,
    },
    buttonContainer: {
        position: 'absolute',
        top: 100, // Posición fija desde arriba
        alignSelf: 'center', // Centrado horizontal
    },
    button: {
        backgroundColor: '#242a23ff', //#27970eff
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default ScrollToTopButton;