import { useEffect } from 'react'
import { BackHandler } from 'react-native'
import { usePathname } from 'expo-router'

export default function useBackButtonHandler(callback) {
  const pathname = usePathname() // se obtiene la ruta actual

  useEffect(() => {

    const customRoutes = ['/inicio', '/'] // rutas personalizadas donde se maneja el botón de retroceso
    
     const handleBackPress = () => {
      if (customRoutes.includes(pathname)) {
        // Ejecuta el callback personalizado solo en rutas específicas
        return callback();
      }
      // Permite comportamiento normal en otras rutas
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    )

    return () => backHandler.remove()
  }, [callback, pathname])
}