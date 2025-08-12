import { Text, View, TouchableOpacity, Alert, ScrollView, Switch, Image, formData} from "react-native";
import { useState , useRef} from "react";
import { useRouter } from 'expo-router';
import { IconArrowLeft } from "../icons";
import { TextInput, IconButton, } from 'react-native-paper';
import api from "../../utils/axiosInstance";


//import para las imagenes 
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';


export default function Register() {
    const ip = api.defaults.baseURL
    const router = useRouter();
    // Estados para campos comunes
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [isSeller, setIsSeller] = useState(false);

    //mostrar contraseña 
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [verificationEmail, setVerificationEmail] = useState('');
   //estados de imagenes
    const [cedulaImage, setCedulaImage] = useState(null);
    const [rutDocument, setRutDocument] = useState(null);

    // Estados específicos para vendedores (agrupaciones)
    const [nit, setNit] = useState('');
    const [organizationType, setOrganizationType] = useState('');
    const [legalRepresentative, setLegalRepresentative] = useState('');
    const [representativeCedula, setRepresentativeCedula] = useState('');
    


    // Estado para manejar errores
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        nit: '',
        organizationType: '',
        legalRepresentative: '',
        representativeCedula: ''
    });

    // Referencias para manejar el enfoque automático
    const emailRef = useRef(null);
    const phoneRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);
    const nitRef = useRef(null);
    const orgTypeRef = useRef(null);
    const legalRepRef = useRef(null);
    const cedulaRef = useRef(null);

    


    // Función para tomar foto de cédula
    const takeCedulaPhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        
        if (status !== 'granted') {
            Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara para tomar fotos');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            aspect: [3, 2],
            quality: 0.8,
        });

        if (!result.canceled) {
            setCedulaImage(result.assets[0]);
        }
    };

  // Función para seleccionar documento RUT
    const pickRutDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
        });

        if (result.type === 'success') {
            setRutDocument(result);
        }
    };



    // Función para validar un campo específico
    const validateField = (fieldName, value) => {
        const newErrors = { ...errors };
        
        switch (fieldName) {
            case 'username':
                if (!value) {
                newErrors.username = 'Nombre es requerido';
            } 
            // Longitud mínima (opcional)
            else if (value.length < 3) {
                newErrors.username = 'Mínimo 3 caracteres';
            } 
            // Solo letras, números y guión bajo (sin espacios ni caracteres especiales)
            else if (!/^[A-Za-z0-9_]+$/.test(value)) {
                newErrors.username = 'Solo letras, números y guión bajo (sin espacios ni caracteres especiales)';
            } else {
                newErrors.username = '';
            }
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
            case 'phoneNumber':
                if (!value) {
                    newErrors.phoneNumber = 'Teléfono es requerido';
                } else if (!/^\d{7,15}$/.test(value)) {
                    newErrors.phoneNumber = 'Teléfono inválido';
                } else {
                    newErrors.phoneNumber = '';
                }
                break;
            case 'password':
                if (!value) {
                    newErrors.password = 'Contraseña es requerida';
                } else if (value.length < 9) {
                    newErrors.password = 'Mínimo 9 caracteres';
                } else if (!/[A-Z]/.test(value)) {
                    newErrors.password = 'Debe tener al menos una mayúscula';
                } else if (!/[a-z]/.test(value)) {
                    newErrors.password = 'Debe tener al menos una minúscula';
                } else if (!/[0-9]/.test(value)) {
                    newErrors.password = 'Debe tener al menos un número';
                } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
                    newErrors.password = 'Debe tener al menos un carácter especial';
                } else {
                    newErrors.password = '';
                }
                
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
            case 'nit':
                if (isSeller && !value) {
                    newErrors.nit = 'NIT es requerido';
                } else {
                    newErrors.nit = '';
                }
                break;
            case 'organizationType':
                if (isSeller && !value) {
                    newErrors.organizationType = 'Tipo de organización es requerido';
                } else {
                    newErrors.organizationType = '';
                }
                break;
            case 'legalRepresentative':
                if (isSeller && !value) {
                    newErrors.legalRepresentative = 'Representante legal es requerido';
                } else {
                    newErrors.legalRepresentative = '';
                }
                break;
            case 'representativeCedula':
                if (isSeller && !value) {
                    newErrors.representativeCedula = 'Cédula es requerida';
                } else if (isSeller && !/^\d{6,12}$/.test(value)) {
                    newErrors.representativeCedula = 'Cédula inválida';
                } else {
                    newErrors.representativeCedula = '';
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
        // Validar todos los campos comunes
        const commonValidations = [
            validateField('username', username),
            validateField('email', email),
            validateField('password', password),
            validateField('confirmPassword', password2),
        ];
        
        // Validar campos específicos si es vendedor
        const sellerValidations = isSeller ? [
            validateField('nit', nit),
            validateField('organizationType', organizationType),
            validateField('legalRepresentative', legalRepresentative),
            validateField('representativeCedula', representativeCedula),
            validateField('phoneNumber', phoneNumber),
        ] : [];
        
        // Combinar todas las validaciones
        const allValidations = [...commonValidations, ...sellerValidations];
        const allValid = allValidations.every(valid => valid);
        
        if (!allValid) {
            // Encontrar el primer campo con error para enfocarlo
            const firstErrorField = Object.keys(errors).find(field => errors[field]);
            
            // Mapear referencias para enfoque automático
            const refMap = {
                email: emailRef,
                phoneNumber: phoneRef,
                password: passwordRef,
                confirmPassword: confirmPasswordRef,
                nit: nitRef,
                organizationType: orgTypeRef,
                legalRepresentative: legalRepRef,
                representativeCedula: cedulaRef
            };
            
            if (firstErrorField && refMap[firstErrorField]?.current) {
                refMap[firstErrorField].current.focus();
            }
            
            // Mostrar alerta con todos los errores
            const errorMessages = Object.values(errors).filter(msg => msg);
            if (errorMessages.length > 0) {
                Alert.alert('Corrige los siguientes errores:', errorMessages.join('\n\n'));
            }
            return;
        }
        
        
        
        
        try {
            let endpoint = '/api/users/register/';
            
            // Preparar datos para enviar al backend

            const formData = new FormData();
            formData.append('username', username);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('password2', password2);
                
                // Si es vendedor, usar endpoint de agrupación y añadir datos adicionales
            if (isSeller) {
                endpoint = '/api/users/register-group/';
                formData.append('phone_number', phoneNumber);
                formData.append('address', address);
                formData.append('profile_image', null); // Aquí luego puedes agregar imagen si se usa

                formData.append('nit', nit);
                formData.append('organization_type', organizationType);
                formData.append('legal_representative', legalRepresentative);
                formData.append('representative_cedula', representativeCedula);

                if (representativeCedulaImage) {
                    formData.append('image_cedula', {
                        uri: representativeCedulaImage.uri,
                        type: representativeCedulaImage.type || 'image/jpeg',
                        name: representativeCedulaImage.fileName || 'cedula.jpg',
                    });
                }

                if (representativeRutDocument) {
                    formData.append('rut_document', {
                        uri: representativeRutDocument.uri,
                        type: representativeRutDocument.type || 'application/pdf',
                        name: representativeRutDocument.fileName || 'rut.pdf',
                    });
                }
            }

            // Enviar petición de registro
            const response = await api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Si el registro es exitoso (código 201)
            if (response.status === 201) {
                // Guardar el email para la verificación
                setVerificationEmail(email);
                
                // Mostrar alerta y redirigir a pantalla de verificación
                Alert.alert(
                    'Verificación requerida', 
                    'Hemos enviado un código de verificación a tu correo electrónico'
                );
                
                // Redirigir a la pantalla de verificación
                router.push({
                    pathname: '/verification',
                    params: { email }
                });
            } else {
                // Manejar otros códigos de estado
                handleBackendErrors(response.data);
            }
        } catch (error) {
            console.error('Registration error:', error.response?.data || error.message);
            if (error.response) {
                handleBackendErrors(error.response.data);
            } else {
                Alert.alert('Error', 'Error de conexión con el servidor');
            }
        }
    };
    
    // Manejar errores específicos del backend
    const handleBackendErrors = (errorData) => {
        const newErrors = { ...errors };
        
        // Mapear errores de backend a campos del formulario
        if (errorData.username) {
            newErrors.username = errorData.username[0];
        }
        if (errorData.email) {
            newErrors.email = errorData.email[0];
        }
        if (errorData.password) {
            newErrors.password = Array.isArray(errorData.password) 
                ? errorData.password[0] 
                : errorData.password;
        }
        if (errorData.phone_number) {
            newErrors.phoneNumber = errorData.phone_number[0];
        }
        if (errorData.nit) {
            newErrors.nit = errorData.nit[0];
        }
        // ... otros campos ...
        
        setErrors(newErrors);
        
        // Mostrar alerta con el primer error encontrado
        const firstError = Object.values(newErrors).find(e => e);
        if (firstError) {
            Alert.alert('Error en el registro', firstError);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="bg-[#9e9fa0] w-20 h-16 justify-center items-center rounded-lg">
                <TouchableOpacity onPress={() => router.back()} className="rounded-full m-2">
                    <IconArrowLeft color="#00732E" />
                </TouchableOpacity>
            </View>
            
            <View className="flex-1 items-center justify-center bg-white p-4">
                <Text className="text-2xl font-bold mb-4">Registrarse</Text>
                
              
                
                {/* Campos comunes */}
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
                {errors.username && <Text className="text-red-500 text-sm mb-3 w-full">{errors.username}</Text>}
                
                <TextInput
                    ref={emailRef}
                    label="Correo Electrónico"
                    value={email}
                    onChangeText={text => {
                        setEmail(text);
                        validateField('email', text);
                    }}
                    onSubmitEditing={() => phoneRef.current.focus()}
                    returnKeyType="next"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    mode="outlined"
                    outlineColor="#ccc"
                    activeOutlineColor="#00732E"
                    style={{ width: '100%', marginBottom: 8, backgroundColor: 'white' }}
                    error={!!errors.email}
                />
                {errors.email && <Text className="text-red-500 text-sm mb-3 w-full">{errors.email}</Text>}
                
                
                
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
                    secureTextEntry ={!showPassword}
                    mode="outlined"
                    outlineColor="#ccc"
                    activeOutlineColor="#00732E"
                    style={{ width: '100%', marginBottom: 8, backgroundColor: 'white' }}
                    error={!!errors.password}
                    right={
                        <TextInput.Icon
                            icon={showPassword ? "eye-off" : "eye"}
                            onPress={() => setShowPassword(!showPassword)}
                        />
                        }
                />
                {errors.password && <Text className="text-red-500 text-sm mb-3 w-full">{errors.password}</Text>}
                
                <TextInput
                    ref={confirmPasswordRef}
                    label="Confirmar Contraseña"
                    value={password2}
                    onChangeText={text => {
                        setPassword2(text);
                        validateField('confirmPassword', text);
                    }}
                    onSubmitEditing={isSeller ? () => nitRef.current.focus() : handleRegister}
                    returnKeyType={isSeller ? "next" : "done"}
                    secureTextEntry
                    mode="outlined"
                    outlineColor="#ccc"
                    activeOutlineColor="#00732E"
                    style={{ width: '100%', marginBottom: 8, backgroundColor: 'white' }}
                    error={!!errors.confirmPassword}
                    
                      
                                />
                {errors.confirmPassword && <Text className="text-red-500 text-sm mb-3 w-full">{errors.confirmPassword}</Text>}
                
                  {/* Selector de tipo de usuario */}
                <View className="flex-row items-center w-full mb-4">
                    <Text className="mr-2 text-lg">¿Eres una Agrupación?</Text>
                    <Switch
                        value={isSeller}
                        onValueChange={(value) => setIsSeller(value)}
                        trackColor={{ false: "#767577", true: "#00732E" }}
                        thumbColor={isSeller ? "#f4f3f4" : "#f4f3f4"}
                    />
                </View>

                {/* Campos específicos para vendedores */}
                {isSeller && (
                    <>
                        <Text className="text-center p-2"> Recuerda como agrupacion los datos de arriba tambien son Relacionados a la agrupacion. </Text>
                        <Text className="text-center p-2 color-red-500"> Ejemplo:</Text>
                        <Text className="text-center p-2 color-red-500"> Nombre Completo:  Fincas Doña rosa</Text>
                        <Text className="text-xl font-bold mt-4 mb-2 w-full">Datos de la Agrupación</Text>
                        
                        <TextInput
                            ref={nitRef}
                            label="NIT"
                            value={nit}
                            onChangeText={text => {
                                setNit(text);
                                validateField('nit', text);
                            }}
                            onSubmitEditing={() => orgTypeRef.current.focus()}
                            returnKeyType="next"
                            mode="outlined"
                            outlineColor="#ccc"
                            activeOutlineColor="#00732E"
                            style={{ width: '100%', marginBottom: 8, backgroundColor: 'white' }}
                            error={!!errors.nit}
                        />
                        {errors.nit && <Text className="text-red-500 text-sm mb-3 w-full">{errors.nit}</Text>}
                        
                        <TextInput
                            ref={orgTypeRef}
                            label="Tipo de Organización"
                            value={organizationType}
                            onChangeText={text => {
                                setOrganizationType(text);
                                validateField('organizationType', text);
                            }}
                            onSubmitEditing={() => legalRepRef.current.focus()}
                            returnKeyType="next"
                            mode="outlined"
                            outlineColor="#ccc"
                            activeOutlineColor="#00732E"
                            style={{ width: '100%', marginBottom: 8, backgroundColor: 'white' }}
                            error={!!errors.organizationType}
                        />
                        {errors.organizationType && <Text className="text-red-500 text-sm mb-3 w-full">{errors.organizationType}</Text>}
                        
                        <TextInput
                            ref={legalRepRef}
                            label="Representante Legal"
                            value={legalRepresentative}
                            onChangeText={text => {
                                setLegalRepresentative(text);
                                validateField('legalRepresentative', text);
                            }}
                            onSubmitEditing={() => cedulaRef.current.focus()}
                            returnKeyType="next"
                            mode="outlined"
                            outlineColor="#ccc"
                            activeOutlineColor="#00732E"
                            style={{ width: '100%', marginBottom: 8, backgroundColor: 'white' }}
                            error={!!errors.legalRepresentative}
                        />
                        {errors.legalRepresentative && <Text className="text-red-500 text-sm mb-3 w-full">{errors.legalRepresentative}</Text>}
                        
                        <TextInput
                            ref={cedulaRef}
                            label="Cédula del Representante"
                            value={representativeCedula}
                            onChangeText={text => {
                                setRepresentativeCedula(text);
                                validateField('representativeCedula', text);
                            }}
                            onSubmitEditing={handleRegister}
                            returnKeyType="done"
                            keyboardType="numeric"
                            mode="outlined"
                            outlineColor="#ccc"
                            activeOutlineColor="#00732E"
                            style={{ width: '100%', marginBottom: 8, backgroundColor: 'white' }}
                            error={!!errors.representativeCedula}
                        />
                        {errors.representativeCedula && <Text className="text-red-500 text-sm mb-3 w-full">{errors.representativeCedula}</Text>}

                        {/* Foto de cédula */}
                        <View className="w-full mb-4">
                            <Text className="text-lg mb-2">Foto de la cédula del representante legal</Text>
                            {cedulaImage ? (
                                <TouchableOpacity onPress={takeCedulaPhoto}>
                                <Image 
                                    source={{ uri: cedulaImage.uri }} 
                                    className="w-full h-48 border-2 border-[#00732E] rounded-lg"
                                />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity 
                                onPress={takeCedulaPhoto}
                                className="bg-gray-200 p-8 rounded-lg items-center justify-center border-2 border-dashed border-gray-400"
                                >
                                <Text className="text-gray-500 text-center">Tomar foto de la cédula</Text>
                                </TouchableOpacity>
                            )}
                            </View>
                            
                            {/* Documento RUT */}
                            <View className="w-full mb-4">
                                <Text className="text-lg mb-2">Documento RUT (PDF)</Text>
                            {rutDocument ? (
                                <TouchableOpacity onPress={pickRutDocument} className="bg-green-100 p-4 rounded-lg">
                                <Text className="text-green-800 font-bold">{rutDocument.name}</Text>
                                <Text className="text-gray-500 mt-1">Toca para cambiar</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity 
                                onPress={pickRutDocument}
                                className="bg-gray-200 p-8 rounded-lg items-center justify-center border-2 border-dashed border-gray-400"
                                >
                                <Text className="text-gray-500 text-center">Seleccionar documento RUT</Text>
                                </TouchableOpacity>
                            )}

                            <TextInput
                            ref={phoneRef}
                            label="Teléfono"
                            value={phoneNumber}
                            onChangeText={text => {
                                setPhoneNumber(text);
                                validateField('phoneNumber', text);
                            }}
                            onSubmitEditing={() => passwordRef.current.focus()}
                            returnKeyType="next"
                            keyboardType="phone-pad"
                            mode="outlined"
                            outlineColor="#ccc"
                            activeOutlineColor="#00732E"
                            style={{ width: '100%', marginBottom: 8, backgroundColor: 'white' }}
                            error={!!errors.phoneNumber}
                            />
                        {errors.phoneNumber && <Text className="text-red-500 text-sm mb-3 w-full">{errors.phoneNumber}</Text>}
                        
                        <TextInput
                            label="Dirección"
                            value={address}
                            onChangeText={setAddress}
                            mode="outlined"
                            outlineColor="#ccc"
                            activeOutlineColor="#00732E"
                            style={{ width: '100%', marginBottom: 8, backgroundColor: 'white' }}
                        />
                            
                        </View>
                    </>
                )}
                
                {/* Botón de registro */}
                <View className="w-full mt-4">
                    <TouchableOpacity 
                        onPress={handleRegister} 
                        className="bg-[#00732E] py-3 rounded-lg"
                    >
                        <Text className="text-white text-center text-lg font-bold">
                            {isSeller ? 'Registrar Agrupación' : 'Registrarse'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}