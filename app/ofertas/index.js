import React from "react";
import { SafeAreaView, View, TouchableOpacity } from "react-native";
import {
  Card,
  IconButton,
  Text,
  useTheme,
} from "react-native-paper";
import { IconArrowLeft } from "../../components/icons";
import { useRouter } from "expo-router";

export default function Ofertas() {
  const theme = useTheme();
  const router= useRouter();

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900">
        <View className="  mt-10 justify-center rounded-lg  ">
            <TouchableOpacity onPress={() => router.back()} className=" rounded-full m-2 ">
                <IconArrowLeft  color={theme.colors.primary} />
            </TouchableOpacity>
        </View>
        <View className="flex-1 justify-center items-center p-6">
            <Card
            className="w-full max-w-sm rounded-xl shadow-md"
            style={{ backgroundColor: theme.colors.surface }}
            >
            <Card.Content className="items-center space-y-4 py-8">
                <IconButton
                icon="tag-off"
                size={64}
                color={theme.colors.primary}
                />
                <Text
                variant="headlineMedium"
                className="text-center"
                style={{ color: theme.colors.text }}
                >
                No hay Ofertas Disponibles...
                </Text>
                <Text
                variant="bodyMedium"
                className="text-center text-gray-500 dark:text-gray-400"
                >
                Vuelve más tarde para descubrir nuevas promociones.
                </Text>
            </Card.Content>
            </Card>
        </View>
    </SafeAreaView>
  );
}
   
 