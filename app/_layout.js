import { View } from "react-native";
import { Stack } from "expo-router";
import { CartProvider } from "../context/cartContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";
import { AuthProvider, useAuth } from "../context/authContext";
import "../global.css"
import { FavoritesProvider } from "../context/favoritesContext";
import { useSessionSync } from "../hooks/useSessionSync";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native-paper";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Layout(){


  function SessionSyncWrapper({ children }) {
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  
  useSessionSync(); // Sincronización con contextos

  // Cargar sesión al iniciar
  useEffect(() => {
    const loadSession = async () => {
      try {
        const [token, username, avatar] = await AsyncStorage.multiGet([
          'accessToken',
          'username',
          'avatar'
        ]);
        
        if (token[1] && username[1]) {
          login({
            username: username[1],
            avatar: avatar[1],
            token: token[1]
          });
        }
      } catch (error) {
        console.error('Error cargando sesión:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSession();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#00732E" />
      </View>
    );
  }

  return <>{children}</>;
}
  return(
    <SafeAreaProvider>
       
        
         
            <AuthProvider>
              <CartProvider>
                <FavoritesProvider>
                  <PaperProvider>
                     <SessionSyncWrapper>
                      <View className="flex-1">

                        <Stack
                          screenOptions={
                            {
                                headerShown: false,

                          }

                        }
                      />
                    </View>
                  </SessionSyncWrapper>
                </PaperProvider>
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
        

    </SafeAreaProvider>
    )
}