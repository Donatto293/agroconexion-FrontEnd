import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useContext, useCallback, useEffect, useMemo } from 'react';
import { setLogoutHandler } from '../utils/axiosInstance';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const login = (userData) => {
        setUser({
            username: userData.username,
            avatar: userData.avatar,
            token: userData.token
            });
    };

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.multiRemove([
      'accessToken',
      'refreshToken',
      'username',
      'avatar'
    ]);
  }, []);

  useEffect(()=>{
    setLogoutHandler(logout);
  }, [logout])

  // Función para cargar la sesión al iniciar la app
  const loadSession = useCallback(async () => {
    try {
      const [accessToken, username, avatar] = await AsyncStorage.multiGet([
        'accessToken',
        'username',
        'avatar'
      ]);
      
      if (accessToken[1] && username[1]) {
        setUser({
          token: accessToken[1],
          username: username[1],
          avatar: avatar[1] || null
        });
      }
    } catch (error) {
      console.error("Error al cargar sesión:", error);
    }
  }, []);
  // Invocación única al montar
  useEffect(() => {
    loadSession().finally(() => setIsLoading(false));
  }, [loadSession]);

  
  // Memorizar los valores del contexto para evitar re-renderizados innecesarios
  const contextValue = useMemo(() => ({
    user,
    login,
    logout,
    loadSession
  }), [user, login, logout, loadSession]);

  // Mientras carga, no renderices los children
  if (isLoading) {
    return null; // o splash screen/custom loader
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);