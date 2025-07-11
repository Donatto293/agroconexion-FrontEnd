import {Text, View, TouchableOpacity} from 'react-native';
import {useState} from 'react';
import { IconArrowLeft, EyeWithLine } from "../icons";
import { Link, useRouter } from 'expo-router';
import { TextInput } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    


    
    //para las rutas
    const router = useRouter()

    //errores 
    const [errors, setErrors] = useState({
        username: '',
        password: ''
    });
    //validaciones
    const handleLogin = async () => {
        // Resetear errores
        setErrors({ username: '', password: '' });

        let isValid = true;
        const newErrors = { username: '', password: '' };

            // Validación de usuario
            if (!username) {
                newErrors.username = 'El usuario es requerido';
                isValid = false;
            } 

            // Validación de contraseña
            if (!password) {
                newErrors.password = 'La contraseña es requerida';
                isValid = false;
            } else if (password.length < 9) {
                newErrors.password = 'Mínimo 9 caracteres';
                isValid = false;
            }

            setErrors(newErrors);

            if (!isValid) {
                return; // salirse si no pasa la validación
            }
            console.log('Login:', { username, password });
        try {
            const response = await axios.post('http://10.3.145.44:8000/api/users/login/', {
                username,
                password,
            });
            console.log('Login Response:', response.data);

            const { access, refresh, userName, userImage } = response.data;

            await AsyncStorage.setItem('accessToken', access);
            await AsyncStorage.setItem('refreshToken', refresh);
            // por si acaso 
            if (userName) {
                await AsyncStorage.setItem('username', userName);
                await AsyncStorage.setItem('avatar', userImage);
            }
           

            router.push('/');
         } catch (error) {
            // Manejo de errores de la petición
            setErrors(prev => ({
                ...prev,
                username: 'Error al iniciar sesión. Verifica tus credenciales.'
            }));
            console.error(error);
        }
    };
    

    return (
        // Encabezado
        <View className='flex-1  bg-white'>
            <View className="bg-[#9e9fa0] w-20 h-16 justify-center items-center  rounded-lg  ">
                            <TouchableOpacity onPress={() => router.back()} className=" rounded-full m-2 ">
                                <IconArrowLeft color="#00732E"  />
                            </TouchableOpacity>
            </View>
            {/* Contenido del login */}
            <View className="flex-1 items-center justify-center  p-4">
                <Text className="text-2xl font-bold mb-4">Iniciar Sesión</Text>
                 {/* Email */}
                {errors.username && <Text className="text-red-500 text-sm mb-3 w-full">{errors.username}</Text>}
               <TextInput
                    label="usuario"
                    value={username}
                    onChangeText={setUsername}
                    mode="outlined"
                    outlineColor="#ccc"
                    activeOutlineColor="#00732E"
                    style={{ width: '100%', marginBottom: 16, backgroundColor: 'white' }}
                />
                {/* Password */}
                {errors.password && <Text className="text-red-500 text-sm mb-3 w-full">{errors.password}</Text>}
                 
                 <TextInput
                    label="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    mode="outlined"
                    outlineColor="#ccc"
                    activeOutlineColor="#00732E"
                    style={{ width: '100%', marginBottom: 16, backgroundColor: 'white' }}
                    right={
                        <TextInput.Icon
                            icon={EyeWithLine}
                            name={showPassword ? 'eye-off' : 'eye'}
                            onPress={() => setShowPassword(!showPassword)}
                            color="#00732E"
                        />
                    }
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