import { View } from "react-native";
import { Stack, usePathname } from "expo-router";

import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Menu from "../components/menu/Menu";


import "../global.css"

import { useSessionSync } from "../hooks/useSessionSync";
import { useEffect, useState, useContext, use } from "react";
import { ActivityIndicator } from "react-native-paper";
import AsyncStorage from '@react-native-async-storage/async-storage';


//providers
import { Provider as PaperProvider } from "react-native-paper";
import { AuthProvider, useAuth } from "../context/authContext";
import { FavoritesProvider } from "../context/favoritesContext";
import { SearchProvider } from "../context/SearchContext";
import { MenuProvider , MenuContext } from "../context/menuContext";
import { CartProvider } from "../context/cartContext";



export default function Layout(){

 //montaje del menú
 //se utiliza para evitar render duplicado
 // y en funcion para esperar el Provider del menú
 function MenuInitializer({ children }) {
  const { menuMounted, setMenuMounted } = useContext(MenuContext);

  useEffect(() => {
    if (!menuMounted) setMenuMounted(true);
  }, [menuMounted, setMenuMounted]);

  return <>{children}</>;
}
  

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

  return (
    <SafeAreaProvider>
      <PaperProvider>

        <AuthProvider>
          <MenuProvider>
            <SearchProvider>
            <CartProvider>
              <FavoritesProvider>
                <SessionSyncWrapper>
                  <View className="flex-1">
                    <Stack
                      screenOptions={{
                        headerShown: false,
                      }}

                    />
                      <Menu />

                  </View>
                </SessionSyncWrapper>
              </FavoritesProvider>
            </CartProvider>
          </SearchProvider>
        </MenuProvider>
      </AuthProvider>
    </PaperProvider>
  </SafeAreaProvider>
    )
}