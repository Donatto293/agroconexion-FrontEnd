import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../utils/axiosInstance';


export default function VerificationScreen() {
    const router = useRouter();
    const { email } = useLocalSearchParams();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (value, index) => {
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        
        // Auto-enfoque al siguiente campo
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
        
        
        };

        const handleVerify = async () => {
            setIsLoading(true);
        const fullCode = code.join('');

        if (!email) {
            Alert.alert("Error", "No se encontró el email.");
            setIsLoading(false);
            return;
        }

        if (fullCode.length !== 6) {
            Alert.alert("Código incompleto", "Debes ingresar los 6 dígitos.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.post('/api/users/verify-account/', {
                email,
                code: fullCode
            });

            if (response.status === 200) {
                Alert.alert('¡Cuenta verificada!', 'Tu cuenta ha sido activada correctamente');
                router.push('/login');
            }
        } catch (error) {
            console.error('Verification error:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.error || 'Código inválido o expirado';
            Alert.alert('Error de verificación', errorMsg);
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        try {
            await api.post('/api/users/verify-account/resend/', { email });
            Alert.alert('Código reenviado', 'Por favor revisa tu correo electrónico');
        } catch (error) {
            console.error('Resend error:', error);
            Alert.alert('Error', 'No se pudo reenviar el código');
        }
    };

    return (
        <View className="flex-1 justify-center p-4 bg-white">
            <Text className="text-2xl font-bold mb-6 text-center">
                Verifica tu cuenta
            </Text>
            
            <Text className="text-center mb-8">
                Hemos enviado un código de 6 dígitos a {email}
            </Text>
            
            <View className="flex-row justify-between mb-8">
                {[...Array(6)].map((_, i) => (
                    <TextInput
                        key={i}
                        ref={ref => inputRefs.current[i] = ref}
                        className="w-12 h-12 border border-gray-300 rounded-lg text-center text-xl"
                        keyboardType="numeric"
                        maxLength={1}
                        value={code[i]}
                        onChangeText={text => handleChange(text, i)}
                        selectTextOnFocus
                    />
                ))}
            </View>
            
            <TouchableOpacity 
                onPress={handleVerify}
                disabled={isLoading}
                className="bg-[#00732E] py-3 rounded-lg mb-4"
            >
                <Text className="text-white text-center text-lg font-bold">
                    {isLoading ? 'Verificando...' : 'Verificar Cuenta'}
                </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                onPress={handleResendCode}
                className="mb-4"
            >
                <Text className="text-[#00732E] text-center">
                    No recibí el código · Reenviar
                </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                onPress={() => router.push('/register')}
            >
                <Text className="text-gray-500 text-center">
                    Volver al registro
                </Text>
            </TouchableOpacity>
        </View>
    );
}