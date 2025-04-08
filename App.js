import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Alert } from 'react-native';
import "./global.css"
import Header from './components/header/header';
import { SafeAreaProvider } from 'react-native-safe-area-context';



export default function App() {

  
  return (
    <SafeAreaProvider >
      
      <Header />
    {/* Resto del contenido de la app */}
    <View className="flex-1 items-center justify-center">
      {/* Aquí va el contenido principal */}
      <Text className='text-blue-200'>hola mundo</Text>
    </View>
  </SafeAreaProvider>
  );
}
  
