import {Text, View, TextInput, TouchableOpacity, Pressable} from 'react-native';
import {useState} from 'react';
import { IconArrowLeft } from "../icons";
import { Link, useRouter } from 'expo-router';

export default function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    
    //para las rutas
    const router = useRouter()

    //errores 
    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });
    //validaciones
    const handleLogin = () => {
       

        // Resetear errores
        setErrors({
            email: '',
            password: ''
        });

        let isValid = true;
        const newErrors = {
            email: '',
            password: ''
        };

        // Validación de email
        if (!email) {
            newErrors.email = 'El email es requerido';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Ingresa un email válido';
            isValid = false;
        }

        // Validación de contraseña
        if (!password) {
            newErrors.password = 'La contraseña es requerida';
            isValid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Mínimo 6 caracteres';
            isValid = false;
        }

        setErrors(newErrors);

        if (isValid) {
            // Lógica de autenticación
            console.log('Iniciando sesión con:', email, password);
            router.push('/');
        }
    };

    return (
        // Encabezado
        <View className='flex-1  bg-[#e2e7ec] '>
            <View className="bg-[#9e9fa0] w-20 h-16 justify-center items-center  rounded-lg  ">
                            <TouchableOpacity onPress={() => router.back()} className=" rounded-full m-2 ">
                                <IconArrowLeft color="#00732E"  />
                            </TouchableOpacity>
            </View>
            {/* Contenido del login */}
            <View className="flex-1 items-center justify-center  p-4">
                <Text className="text-2xl font-bold mb-4">Iniciar Sesión</Text>
                
                {errors.email && <Text className="text-red-500 text-sm mb-3 w-full">{errors.email}</Text>}
                <TextInput
                    placeholder="Correo Electrónico"
                    value={email}
                    onChangeText={setEmail}
                    className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
                />
                {errors.password && <Text className="text-red-500 text-sm mb-3 w-full">{errors.password}</Text>}
                <TextInput
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
                />
                <View className='w-full'>
                    <TouchableOpacity
                        onPress={handleLogin}
                        className="bg-[#00732E] rounded-lg p-2 w-full"
                    >
                        <Text className="text-white text-center">Iniciar Sesión</Text>
                    </TouchableOpacity>


                    <Link href={{
                         pathname: `/register`,
                    }} asChild>
                        <TouchableOpacity
                            
                            className="border border-[#00732E] rounded-lg p-2 mt-1 w-full "
                            
                        >
                            <Text className=" text-center">Registrarse</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </View>
    )
}