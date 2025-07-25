import { useState, useEffect, useContext } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import HeaderScreen from "../../components/header/Header";
import ProductSmall from "../../components/productSmall";
import Products from "../../components/products";
import useProducts from "../../api/products";
import Welcome from "../../components/welcome/welcome";
import CategoryCarousel from "../../components/carruseles/CategoryCarousel";
import { categoriesService } from "../../api/categorias";
import { useAuth } from "../../context/authContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SearchContext } from "../../context/SearchContext";

export default function Inicio() {
  const [showWelcome, setShowWelcome] = useState(true); // pantalla de bienvenida activa al inicio
  const [checkedWelcome, setCheckedWelcome] = useState(false);
  const { products, loading, error } = useProducts();
  const [categories, setCategories] = useState([]);
  const {user} = useAuth();

  const {searchQuery} = useContext(SearchContext)

  
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesService.getAll();
        setCategories(data);
      } catch (err) {
        console.error("Error cargando categorías:", err.message);
      }
    };
    fetchCategories();
  }, []);

useEffect(() => {
    const checkWelcome = async () => {
      try {
        const now = Date.now();
        const lastOpenStr = await AsyncStorage.getItem("last_open_time");
        const loginFlag = await AsyncStorage.getItem("welcome_after_login_shown");
        let shouldShow = false;

        if (!user?.token) {
          // Al hacer logout, borramos el flag de first-login
          await AsyncStorage.removeItem("welcome_after_login_shown");

          // Lógica no autenticado: primera vez o >30 min
          if (!lastOpenStr) {
            shouldShow = true;
          } else {
            const lastOpenTime = parseInt(lastOpenStr, 10);
            const diffMin = (now - lastOpenTime) / 60000;
            if (diffMin > 30) shouldShow = true;
          }
        } else {
          // Usuario acaba de loguearse: si nunca vimos la bienvenida post-login
          if (!loginFlag) {
            shouldShow = true;
            await AsyncStorage.setItem(
              "welcome_after_login_shown",
              "true"
            );
          }
        }

        // Guardamos la hora de esta apertura siempre
        await AsyncStorage.setItem("last_open_time", now.toString());

        setShowWelcome(shouldShow);
      } catch (err) {
        console.error("Error verificando welcome:", err);
      } finally {
        setCheckedWelcome(true);
      }
    };

    checkWelcome();
  }, [user?.token]);

  // 1) Esperamos a que termine la comprobación
  if (!checkedWelcome) {
    return null;
  }

  // 2) Si toca mostrar bienvenida
  if (showWelcome) {
    return <Welcome onContinue={() => setShowWelcome(false)} />;
  }



  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={["top", "bottom"]}>
      <View className="position-absolute w-full h-50 bg-[#00732E]">
        <HeaderScreen />
      </View>

<ScrollView contentContainerStyle={{ paddingTop: 25 }}>
 {/* Si NO estamos buscando, renderizo carrusel y ProductSmall */}
        {!searchQuery && (
          <>

  {/*  Carrusel de categorías con espacio */}
  <View style={{ marginBottom: "2%", }}>
    <CategoryCarousel categories={categories} />
  </View>

  {/*  Productos pequeños destacados */}
  <View style={{ marginBottom: 0 }}>
    <ProductSmall products={products} loading={loading} error={error} />
  </View>
         </>
        )}

  {/*  Todos los productos */}
  <Products products={products} loading={loading} error={error} />
</ScrollView>

    </SafeAreaView>
  );
}