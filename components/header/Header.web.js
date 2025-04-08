import { View, Text} from "react-native"
export default function Header ( ) {

    //const insets = useSafeAreaInsets(); // Obtener los insets de la parte superior

  return (
    <View className=" h-16 flex-row justify-between items-center px-5 bg-[#00732E]">
        <Text className="text-white text-lg font-bold">AgroConexion</Text>
    </View>
  )
}