import { Text, View, TouchableOpacity, Alert, ScrollView} from "react-native";
import { useState , useRef} from "react";
import { useRouter } from 'expo-router';
import { IconArrowLeft } from "../icons";
import { TextInput } from 'react-native-paper'; 
export default function Register() {


    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');


    // Estado para manejar errores en los labels
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Referencias para manejar el enfoque automático
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    // Función para validar un campo específico
    const validateField = (fieldName, value) => {
        const newErrors = { ...errors };
        
        switch (fieldName) {
            case 'username':
                newErrors.username = !value ? 'Nombre es requerido' : '';
                break;
            case 'email':
                if (!value) {
                    newErrors.email = 'Email es requerido';
                } else if (!/^\S+@\S+\.\S+$/.test(value)) {
                    newErrors.email = 'Email inválido';
                } else {
                    newErrors.email = '';
                }
                break;
            case 'password':
                if (!value) {
                    newErrors.password = 'Contraseña es requerida';
                } else if (value.length < 9) {
                    newErrors.password = 'Mínimo 9 caracteres';
                } else {
                    newErrors.password = '';
                }
                // Validar también la confirmación si ya tiene valor
                if (password2 && value !== password2) {
                    newErrors.confirmPassword = 'Las contraseñas no coinciden';
                }
                break;
            case 'confirmPassword':
                if (!value) {
                    newErrors.confirmPassword = 'Confirma tu contraseña';
                } else if (value !== password) {
                    newErrors.confirmPassword = 'Las contraseñas no coinciden';
                } else {
                    newErrors.confirmPassword = '';
                }
                break;
            default:
                break;
        }
        
        setErrors(newErrors);
        return newErrors[fieldName] === '';
    };
    
    // Función para manejar el envío del formulario
    const handleRegister = async () => {
        // Validar todos los campos
        const validations = [
            validateField('username', username),
            validateField('email', email),
            validateField('password', password),
            validateField('confirmPassword', password2),
        ];
        
        // Verificar si todos los campos son válidos
        const allValid = validations.every(valid => valid);
        
        if (!allValid) {
            // Encontrar el primer campo con error para enfocarlo
            const firstErrorField = Object.keys(errors).find(field => errors[field]);
            
            // Desplazar al primer campo con error
            if (firstErrorField === 'email') emailRef.current.focus();
            else if (firstErrorField === 'password') passwordRef.current.focus();
            else if (firstErrorField === 'confirmPassword') confirmPasswordRef.current.focus();
            
            // Mostrar alerta con todos los errores
            const errorMessages = Object.values(errors).filter(msg => msg);
            if (errorMessages.length > 0) {
                Alert.alert('Corrige los siguientes errores:', errorMessages.join('\n\n'));
            }
            return;
        }
        
        // Si pasa la validación, enviar los datos al backend
        try {
            const response = await fetch('http://192.168.20.35:8000/api/users/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    password2,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                let backendErrorMessage = 'Error de sistema';
                
                // Manejar errores del backend
                if (errorData.password) {
                    backendErrorMessage = errorData.password[0];
                    setErrors(prev => ({ ...prev, password: errorData.password[0] }));
                } else if (errorData.email) {
                    backendErrorMessage = errorData.email[0];
                    setErrors(prev => ({ ...prev, email: errorData.email[0] }));
                } else if (errorData.username) {
                    backendErrorMessage = errorData.username[0];
                    setErrors(prev => ({ ...prev, username: errorData.username[0] }));
                } else if (errorData.detail) {
                    backendErrorMessage = errorData.detail;
                } else if (errorData.non_field_errors) {
                    backendErrorMessage = errorData.non_field_errors[0];
                }
                
                throw new Error(backendErrorMessage);
            }
            
            const data = await response.json();
            Alert.alert('Registro exitoso', `Bienvenido ${data.username}`);
            router.push('/login');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="bg-[#9e9fa0] w-20 h-16 justify-center items-center rounded-lg">
                <TouchableOpacity onPress={() => router.back()} className="rounded-full m-2">
                    <IconArrowLeft color="#00732E" />
                </TouchableOpacity>
            </View>
            
            {/* Contenido del registro */}
            <View className="flex-1 items-center justify-center bg-white p-4">
                <Text className="text-2xl font-bold mb-4">Registrarse</Text>
                
                {/* Campo de nombre de usuario */}
                <TextInput
                    label="Nombre Completo"
                    value={username}
                    onChangeText={text => {
                        setUsername(text);
                        validateField('username', text);
                    }}
                    onSubmitEditing={() => emailRef.current.focus()}
                    returnKeyType="next"
                    mode="outlined"
                    outlineColor="#ccc"
                    activeOutlineColor="#00732E"
                    style={{ width: '100%', marginBottom: 8, backgroundColor: 'white' }}
                    error={!!errors.username}
                />
                {errors.username ? (
                    <Text className="text-red-500 text-sm mb-3 w-full">{errors.username}</Text>
                ) : null}
                
                {/* Campo de email */}
                <TextInput
                    ref={emailRef}
                    label="Correo Electrónico"
                    value={email}
                    onChangeText={text => {
                        setEmail(text);
                        validateField('email', text);
                    }}
                    onSubmitEditing={() => passwordRef.current.focus()}
                    returnKeyType="next"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    mode="outlined"
                    outlineColor="#ccc"
                    activeOutlineColor="#00732E"
                    style={{ width: '100%', marginBottom: 8, backgroundColor: 'white' }}
                    error={!!errors.email}
                />
                {errors.email ? (
                    <Text className="text-red-500 text-sm mb-3 w-full">{errors.email}</Text>
                ) : null}
                
                {/* Campo de contraseña */}
                <TextInput
                    ref={passwordRef}
                    label="Contraseña"
                    value={password}
                    onChangeText={text => {
                        setPassword(text);
                        validateField('password', text);
                    }}
                    onSubmitEditing={() => confirmPasswordRef.current.focus()}
                    returnKeyType="next"
                    secureTextEntry
                    mode="outlined"
                    outlineColor="#ccc"
                    activeOutlineColor="#00732E"
                    style={{ width: '100%', marginBottom: 8, backgroundColor: 'white' }}
                    error={!!errors.password}
                />
                {errors.password ? (
                    <Text className="text-red-500 text-sm mb-3 w-full">{errors.password}</Text>
                ) : null}
                
                {/* Campo de confirmación de contraseña */}
                <TextInput
                    ref={confirmPasswordRef}
                    label="Confirmar Contraseña"
                    value={password2}
                    onChangeText={text => {
                        setPassword2(text);
                        validateField('confirmPassword', text);
                    }}
                    onSubmitEditing={handleRegister}
                    returnKeyType="done"
                    secureTextEntry
                    mode="outlined"
                    outlineColor="#ccc"
                    activeOutlineColor="#00732E"
                    style={{ width: '100%', marginBottom: 8, backgroundColor: 'white' }}
                    error={!!errors.confirmPassword}
                />
                {errors.confirmPassword ? (
                    <Text className="text-red-500 text-sm mb-3 w-full">{errors.confirmPassword}</Text>
                ) : null}
                
                {/* Botón de registro */}
                <View className="w-full mt-4">
                    <TouchableOpacity 
                        onPress={handleRegister} 
                        className="bg-[#00732E] py-3 rounded-lg"
                    >
                        <Text className="text-white text-center text-lg font-bold">Registro</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}