import { View , Text, TouchableOpacity} from "react-native"
import Login from "../components/login/Login"
import { useRouter } from 'expo-router';
import { IconArrowLeft } from "../components/icons";

export default function LoginView() {
    const router = useRouter()

    return(
        <View className="flex-1 bg-white">
            <View className="bg-[#9e9fa0] w-20 h-16 justify-center items-center  rounded-lg  ">
                <TouchableOpacity onPress={() => router.back()} className=" rounded-full m-2 ">
                    <IconArrowLeft color="#00732E"  />
                </TouchableOpacity>
            </View>
            <View className="flex-1  ">
                <Login/>
            </View>
        </View>
    )
}