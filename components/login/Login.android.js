import {Text, View, TextInput, TouchableOpacity, Pressable} from 'react-native';
import {useState} from 'react';
import { IconArrowLeft } from "../icons";
import { useRouter } from 'expo-router';

export default function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState(null);

    //para las rutas
    const router = useRouter()


    const handleLogin = () => {
        if (!email || !password) {
            setError('Por favor, completa todos los campos.');
            return;
        }

        // Aquí puedes agregar la lógica de autenticación
        console.log('Iniciando sesión con:', email, password);
        setError(null); // Limpiar el error si la autenticación es exitosa
    };


    return (
        // Encabezado
        <View className='flex-1  bg-white '>
            <View className="bg-[#9e9fa0] w-20 h-16 justify-center items-center  rounded-lg  ">
                            <TouchableOpacity onPress={() => router.back()} className=" rounded-full m-2 ">
                                <IconArrowLeft color="#00732E"  />
                            </TouchableOpacity>
            </View>
            {/* Contenido del login */}
            <View className="flex-1 items-center justify-center bg-white p-4">
                <Text className="text-2xl font-bold mb-4">Iniciar Sesión</Text>
                {error && <Text className="text-red-500 mb-4">{error}</Text>}
                <TextInput
                    placeholder="Correo Electrónico"
                    value={email}
                    onChangeText={setEmail}
                    className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
                />
                <TextInput
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
                />
                <TouchableOpacity
                    onPress={handleLogin}
                    className="bg-[#00732E] rounded-lg p-2 w-full"
                >
                    <Text className="text-white text-center">Iniciar Sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}