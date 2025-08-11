import {Text, View, TouchableOpacity, Alert} from 'react-native';
import {useState} from 'react';
import {useRouter, useLocalSearchParams} from 'expo-router';
import {TextInput} from 'react-native-paper';
import {IconArrowLeft} from "../components/icons";
import api from '../utils/axiosInstance';

export default function VerifyAccount() {
    const router = useRouter();
    // Obtiene los parámetros pasados desde la pantalla anterior (ej. el email)
    const {email} = useLocalSearchParams(); 

    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerifyAccount = async () => {
        setError('');
        if (!code) {
            setError('El código de verificación es requerido.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/api/users/verify-account/', {
                email, // Pasa el email del usuario
                code,  // Pasa el código de verificación
            });

            // Si el backend responde con un éxito (estado 200)
            if (response.status === 200) {
                Alert.alert('¡Cuenta verificada!', 'Tu cuenta ha sido activada con éxito.');
                router.replace('/login'); // Redirige al login para que el usuario pueda entrar
            }

        } catch (err) {
            const serverError = err.response?.data?.error || 'Código inválido o expirado.';
            setError(serverError);
            Alert.alert('Error de verificación', serverError);
            console.error('Error de verificación de cuenta:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className='flex-1 bg-white'>
            <View className="bg-[#9e9fa0] w-20 h-16 justify-center items-center rounded-lg">
                <TouchableOpacity onPress={() => router.back()} className="rounded-full m-2">
                    <IconArrowLeft color="#00732E" />
                </TouchableOpacity>
            </View>
            <View className="flex-1 items-center justify-center p-4">
                <Text className="text-2xl font-bold mb-4">Verificar Cuenta</Text>
                
                <Text className="text-center mb-4">
                    Se ha enviado un código de 6 dígitos a tu correo electrónico. Por favor, ingrésalo a continuación.
                </Text>

                {error && <Text className="text-red-500 text-sm mb-3 w-full text-center">{error}</Text>}
                <TextInput
                    label="Código de Verificación"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="numeric"
                    mode="outlined"
                    outlineColor="#ccc"
                    activeOutlineColor="#00732E"
                    style={{ width: '100%', marginBottom: 16, backgroundColor: 'white' }}
                />

                <TouchableOpacity
                    onPress={handleVerifyAccount}
                    className="bg-[#00732E] rounded-lg p-2 w-full"
                    disabled={isLoading}
                >
                    <Text className="text-white text-center">{isLoading ? 'Verificando...' : 'Verificar'}</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}