import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useContext, useCallback, useEffect, useMemo } from 'react';
import { setLogoutHandler } from '../utils/axiosInstance';
import { useRouter } from 'expo-router';
import { userLogin, userInfo, userUpdate, refreshTokenAPI } from '../api/user';
import { ActivityIndicator } from 'react-native-paper';


export const AuthContext = createContext();

//para la imagen 
// const pickImageField = (obj) => {
//   if (!obj) return null;
//   return obj.profile_image || obj.avatar || obj.userImage || obj.image || null;
// };

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userFull, setUserFull] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    

    const router = useRouter();

   

    const login = useCallback(async (username, password) => {
    
      try {
        const response = await userLogin(username, password);

        if (response.data.detail === "Account not verified") return { status: 'need_verification' };
        if (response.data.detail === "2FA required") return { status: 'need_2FA', sessionToken: response.data.session_token };
        
         // Caso : 2FA requerido (nuevo formato)
        if (response.data.message && response.data.message.includes("Código enviado a tu correo")) {
          return { 
            status: 'need_2FA', 
            email: response.data.email,
            sessionToken: response.data.session_token // Si está disponible
          };
        }
        
        // Caso : 2FA requerido (formato antiguo)
        if (response.data.detail === "2FA required") {
          return { 
            status: 'need_2FA', 
            email: username, // Asumimos que username es el email
            sessionToken: response.data.session_token 
          };
        }
              //  Guardar tokens y datos mínimos en AsyncStorage
        await AsyncStorage.multiSet([
          ['accessToken', response.data.access],
          ['refreshToken', response.data.refresh],
          ['username', response.data.userName || ''],
          ['profile_image', response.data.userImage || ''],
          ['email', response.data.userEmail || '']
        ]);
        // esperar a que loadSession termine para evitar condiciones de carrera
        await loadSession()
        return { status: 'success' };
    } catch (error) {
        return { status: 'error', message: error.response?.data?.detail || 'Error al iniciar sesión' };
    }
  }, []);


  //refres Token 
  const refreshAccessToken = useCallback(async () => {
    try {
    
      const refresh_Token = await AsyncStorage.getItem('refreshToken');
      if (!refresh_Token) {
      // En lugar de throw, llama a logout directamente
        if (logout) await logout();
        throw new Error('No refresh token available');
      }
      const response = await refreshTokenAPI(refresh_Token )
      const newAccessToken = response.data.access;
      
      await AsyncStorage.setItem('accessToken', newAccessToken);
      return newAccessToken;

    } catch (error) {
      console.error('Error refreshing token:', error);
      await logout();
      throw error;
    }
  }, []);


    

    const logout = useCallback(async () => {

      setUser(null);
      setUserFull(null);
  
    // Limpiar AsyncStorage
    await AsyncStorage.multiRemove([
      'accessToken', 
      'refreshToken', 
      'username',
      'profile_image',
      'email',
      'phone_number',
      'address',
      'two_factor_enable'
    ]);
          router.push('/inicio');
      }, []);

    useEffect(() => {
        setLogoutHandler(logout);
    }, [logout]);

  // Función para cargar la sesión al iniciar la app
  const loadSession = useCallback(async () => {

    try {
      // Leer valores guardados
      const pairs = await AsyncStorage.multiGet([
        'accessToken',
        'refresh',
        'username',
        'profile_image',
        'email',
        'phone_number',
        'address',
        'two_factor_enable'
      ]);

      const accessToken = pairs[0]?.[1];
      const refreshToken = pairs[1]?.[1];
      const storedUsername = pairs[2]?.[1] ?? '';
      const storedProfile = pairs[3]?.[1] ?? '';
      const storedEmail = pairs[4]?.[1] ?? '';
      const storedPhone = pairs[5]?.[1] ?? '';
      const storedAddress = pairs[6]?.[1] ?? '';
      const storedTwoFactor = pairs[7]?.[1] === 'false'; 

        // 1. Verificación robusta inicial
      if (!accessToken || accessToken.trim() === '') {
        console.log('No hay token almacenado');
        setIsLoading(false);
        return; // Sale inmediatamente
      }
      

      try {
        // Llamada al backend para obtener datos completos
        const info = await userInfo(accessToken); // espera que retorne objeto con fields

        // Construir objetos user y userFull
        const minimalUser = {
          token: accessToken,
          username: info.username || storedUsername || '',
          profile_image: info.profile_image || storedProfile || null
        };

        const fullUser = {
          token: accessToken,
          refresh:refreshToken,
          id: info.id ?? null,
          username: info.username ?? storedUsername ?? '',
          email: info.email ?? storedEmail ?? '',
          phone_number: info.phone_number ?? storedPhone ?? '',
          address: info.address ?? storedAddress ?? '',
          profile_image: info.profile_image ?? storedProfile ?? null,
          user_type: info.user_type ?? 'common',
          is_buyer: info.is_buyer ?? true,
          is_seller: info.is_seller ?? false,
          group_profile: info.group_profile ?? null,
          two_factor_enable: info.two_factor_enable ??  storedTwoFactor ?? false
        };

        // Setear estados
        setUser(minimalUser);
        setUserFull(fullUser);

        // Guardar en AsyncStorage solo los campos que usas localmente
        const storageUpdates = [
          ['username', fullUser.username || ''],
          ['profile_image', fullUser.profile_image || ''],
          ['email', fullUser.email || ''],
          ['phone_number', fullUser.phone_number || ''],
          ['address', fullUser.address || ''],
          ['two_factor_enable', String(fullUser.two_factor_enable)]
        ];
        await AsyncStorage.multiSet(storageUpdates);

        
        console.log('Sesión cargada y actualizada desde API');
      } catch (err) {
        const status = err?.response?.status;
        console.error('Error al obtener userInfo:', err?.response?.data ?? err.message);

        if (status === 401 || status === 403) {
          // Token inválido/expirado: intenta refrescar si tienes refresh logic
          // Si no tienes refresh, haz logout para limpiar estado
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
          logout();
          setUser(null);
          setUserFull(null);
        } else {
          // Error temporal: no forzar logout; usar datos locales como fallback
          console.warn('Error temporal al obtener userInfo — limpiando datos');
          setUser(null);
          setUserFull(null);
        }
      }
      
    } catch (error) {
      console.error('Error al cargar sesión:', error);
    } finally {
      // importante: marca que terminó la carga
      setIsLoading(false);
    }
  }, [logout]);

          
    

    const updateUserLocal = useCallback( async (newData) => {
      // Actualizar estado primero
      setUser(prev => ({ 
        ...prev, 
        ...newData,
        // preserva profile_image si no viene en patch
        profile_image: newData.profile_image?? prev.profile_image?? null
      }));
      }, []);

      
      
      // updateProfile: recibe FormData (multipart) y centraliza la actualización
    const updateProfile = useCallback(async (formData) => {
      try {
        const data = await userUpdate(formData); // llama al servicio que retorna response.data
        
       
        // data debería contener campos actualizados del usuario (username, email, profile_image, etc.)
         // Actualizar estado inmediatamente
        setUser(prev => ({
          ...prev,
          username: data.username || prev.username,
          profile_image: data.profile_image || prev.profile_image
        }));
        
        setUserFull(prev => ({
          ...prev,
          ...data
        }));

        // Guardar en AsyncStorage sólo los campos relevantes (normaliza keys)
        const keys = [];
        if (data.username !== undefined) keys.push(['username', String(data.username)]);
        if (data.profile_image !== undefined) keys.push(['profile_image', String(data.profile_image)]);
        if (data.email !== undefined) keys.push(['email', String(data.email)]);
        if (data.phone_number !== undefined) keys.push(['phone_number', String(data.phone_number)]);
        if (data.address !== undefined) keys.push(['address', String(data.address)]);
        if (data.two_factor_enable !== undefined) keys.push(['two_factor_enable', String(data.two_factor_enable ? 1 : 0)]);
        if (keys.length > 0) await AsyncStorage.multiSet(keys);
        
        // Llamar loadSession para asegurar consistencia
        await loadSession();
        
        return { status: 'success', data };
        
      } catch (err) {
        console.error('updateProfile error:', err.response?.data || err.message);
        // construir mensaje amigable
        let message = 'Error al actualizar perfil';
        if (err.response?.data) {
          const errData = err.response.data;
          if (errData.detail) message = errData.detail;
          else if (typeof errData === 'object') {
            const firstKey = Object.keys(errData)[0];
            const val = errData[firstKey];
            message = Array.isArray(val) ? val[0] : String(val);
          }
        } else if (err.message) {
          message = err.message;
        }
        return { status: 'error', message };
      }
    }, []);


     // Invocación única al montar
    useEffect(() => {
        loadSession().finally(() => setIsLoading(false));
    }, [loadSession]);
    

    // Memorizar los valores del contexto
    const contextValue = useMemo(() => ({
        user,
        userFull,
        login,
        logout,
        loadSession,
        updateUserLocal,
        updateProfile
    }), [user,userFull, login, logout, loadSession, updateUserLocal, updateProfile]);

    if (isLoading) {
        return <ActivityIndicator size="large" />;
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);