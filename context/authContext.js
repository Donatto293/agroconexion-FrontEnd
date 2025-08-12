import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useContext, useCallback, useEffect, useMemo } from 'react';
import { setLogoutHandler } from '../utils/axiosInstance';
import { useRouter } from 'expo-router';

export const AuthContext = createContext();

//para la imagen 
const pickImageField = (obj) => {
  if (!obj) return null;
  return obj.profile_image || obj.avatar || obj.userImage || obj.image || null;
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    

    const router = useRouter();

    const login = useCallback((userData) => {
      console.log('Login successful:', userData);

      const profileImage = pickImageField(userData);
      const username = userData.username || userData.userName || '';
      const token = userData.token || userData.access || userData.accessToken || '';
        setUser({
            username: username,
            profile_image: profileImage,
            token: token
        });
        AsyncStorage.multiSet([
            ['accessToken', token],
            ['username', username],
            ['profile_image', profileImage || '']
        ]).catch(error => {
            console.error("Error saving login data:", error);
        });
    },[]);

    const logout = useCallback(async () => {
        setUser(null);
        await AsyncStorage.multiRemove([
            'accessToken',
            'refreshToken',
            'username',
            'profile_image'
        ]);
        router.push('/inicio');
    }, []);

    useEffect(() => {
        setLogoutHandler(logout);
    }, [logout]);

    // Función para cargar la sesión al iniciar la app
    const loadSession = useCallback(async () => {
    try {
      const [accessToken, username, profile_image] = await AsyncStorage.multiGet([
        'accessToken',
        'username',
        'profile_image'
        
      ]);
      
      if (accessToken[1] && username[1]) {
        setUser({
          token: accessToken[1],
          username: username[1],
          profile_image: profile_image[1] || null
        });
        console.log("Session values:", accessToken[1], username[1], profile_image[1]);

      }
    } catch (error) {
      console.error("Error al cargar sesión:", error);
    }
  }, []);
      
    // Invocación única al montar
    useEffect(() => {
        loadSession().finally(() => setIsLoading(false));
    }, [loadSession]);

    const updateUser = useCallback( async (newData) => {
      // Actualizar estado primero
      setUser(prev => ({ 
        ...prev, 
        ...newData,
        profile_image: newData.profile_image || prev.profile_image
      }));
      
      // Luego actualizar AsyncStorage
      await AsyncStorage.multiSet([
        ['username', newData.username || user?.username || ''],
        ['profile_image', newData.profile_image || user?.profile_image || '']
      ]);
    },[]);
    // Memorizar los valores del contexto
    const contextValue = useMemo(() => ({
        user,
        login,
        logout,
        loadSession,
        updateUser
    }), [user, login, logout, loadSession, updateUser]);

    if (isLoading) {
        return null;
    }

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);