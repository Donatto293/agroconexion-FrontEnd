import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Animated,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Componente de ola personalizado
const Wave = ({ style, color, waveHeight = 120, waveWidth = width, animation }) => {
  const wavePath = `
    M0 ${waveHeight * 0.5}
    C ${waveWidth * 0.25} ${waveHeight * 0.2}, 
      ${waveWidth * 0.75} ${waveHeight * 0.8}, 
      ${waveWidth} ${waveHeight * 0.5}
    V ${waveHeight}
    H 0
    Z
  `;

  return (
    <Animated.View style={[styles.waveContainer, style, animation]}>
      <Svg width={waveWidth} height={waveHeight} viewBox={`0 0 ${waveWidth} ${waveHeight}`}>
        <Path 
          d={wavePath} 
          fill={color} 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </Svg>
    </Animated.View>
  );
};

export default function Welcome({ onContinue }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const wave1Anim = useRef(new Animated.Value(0)).current;
  const wave2Anim = useRef(new Animated.Value(0)).current;
  const wave3Anim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de olas
    Animated.loop(
      Animated.parallel([
        // Ola 1: movimiento lento
        Animated.timing(wave1Anim, {
          toValue: -width,
          duration: 15000,
          useNativeDriver: true,
        }),
        // Ola 2: movimiento medio
        Animated.timing(wave2Anim, {
          toValue: -width,
          duration: 10000,
          useNativeDriver: true,
        }),
        // Ola 3: movimiento rápido
        Animated.timing(wave3Anim, {
          toValue: -width,
          duration: 7000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animación de flotación del ícono
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 5,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade-in inicial
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start(() => {
      onContinue();
    });
  };

  return (
    <View style={styles.container}>
      {/* Fondo gradiente */}
      <View style={styles.backgroundGradient} />
      
      {/* Capas de olas */}
      <Wave 
        color="#E8F5E9" 
        waveHeight={height * 0.4} 
        waveWidth={width * 2} 
        animation={{ 
          position: 'absolute',
          bottom: 0,
          transform: [{ translateX: wave1Anim }] 
        }} 
      />
      
      <Wave 
        color="#C8E6C9" 
        waveHeight={height * 0.35} 
        waveWidth={width * 2} 
        animation={{ 
          position: 'absolute',
          bottom: -10,
          transform: [{ translateX: wave2Anim }],
          opacity: 0.8
        }} 
      />
      
      <Wave 
        color="#A5D6A7" 
        waveHeight={height * 0.3} 
        waveWidth={width * 2} 
        animation={{ 
          position: 'absolute',
          bottom: -20,
          transform: [{ translateX: wave3Anim }],
          opacity: 0.6
        }} 
      />

      {/* Contenido principal */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Animated.Image
          source={require('../../assets/forest-icon.png')}
          style={[styles.icon, { transform: [{ translateY: floatAnim }] }]}
        />

        <Text style={styles.title}>Agroconexion Market</Text>
        <Text style={styles.subtitle}>
          El mercado campesino que conecta tradición con tecnología.
        </Text>

        <TouchableWithoutFeedback
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Animated.View style={[styles.button, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.buttonText}>Entrar al mercado</Text>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#F1F8E9',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F1F8E9',
  },
  waveContainer: {
    width: '200%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#1B5E20',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#388E3C',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
});