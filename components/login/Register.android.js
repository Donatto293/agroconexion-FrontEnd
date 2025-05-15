import {Text, View, TextInput, TouchableOpacity, Alert} from "react-native";
import {useState} from "react";
import { useRouter } from 'expo-router';
import { IconArrowLeft } from "../icons";
export default function Register() {


    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // const handleRegister = async () => {
    //     // Validación básica
    //     if (!name || !email || !password) {
    //         Alert.alert('Error', 'Por favor, completa todos los campos');
    //         return;
    //     }
    //     if (password !== confirmPassword) {
    //         Alert.alert('Error', 'Las contraseñas no coinciden');
    //         return;
    //     }
    //     if (password.length < 6) {
    //         Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
    //         return;
    //     }
        
    //     if (!/^\S+@\S+\.\S+$/.test(email)) {
    //         Alert.alert('Error', 'Ingresa un correo electrónico válido');
    //         return;
    //     }
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    
    const handleRegister = async () => {
        let valid = true;
        const newErrors = {
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        };
    
        if (!name) {
            newErrors.name = 'Nombre es requerido';
            valid = false;
        }
    
        if (!email) {
            newErrors.email = 'Email es requerido';
            valid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = 'Email inválido';
            valid = false;
        }
    
        if (!password) {
            newErrors.password = 'Contraseña es requerida';
            valid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Mínimo 6 caracteres';
            valid = false;
        }
    
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
            valid = false;
        }
    
        setErrors(newErrors);
    
        if (valid) {
            router.push('/login');
        }
    }

        
    

    


    return (
        <View className="flex-1 bg-white">
            <View className="bg-[#9e9fa0] w-20 h-16 justify-center items-center rounded-lg">
                <TouchableOpacity onPress={() => router.back()} className="rounded-full m-2">
                    <IconArrowLeft color="#00732E" />
                </TouchableOpacity>
            </View>
            {/* Contenido del registro */}
            <View className="flex-1 items-center justify-center bg-white p-4">
                <Text className="text-2xl font-bold mb-4">Registrarse</Text>
                {errors.name && <Text className="text-red-500 text-sm mb-3 w-full">{errors.name}</Text>}
                <TextInput
                    placeholder="Nombre Completo"
                    value={name}
                    onChangeText={setName}
                    className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
                    
                /> 
                {errors.email && <Text className="text-red-500 text-sm mb-3 w-full">{errors.email}</Text>}
                <TextInput
                    placeholder="Correo Electrónico"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
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
                {errors.confirmPassword && <Text className="text-red-500 text-sm mb-3 w-full">{errors.confirmPassword}</Text>}
                <TextInput
                    placeholder="Confirmar Contraseña"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    className="border border-gray-300 rounded-lg p-2 mb-4 w-full"
                />
                <View className="w-full">
                    <TouchableOpacity onPress={handleRegister} className="bg-[#00732E] py-3 rounded-lg">
                        <Text className="text-white text-center text-lg font-bold">Registrarse</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}