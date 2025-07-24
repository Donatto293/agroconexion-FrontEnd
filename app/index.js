import { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../components/header/Header";
import ProductSmall from "../components/productSmall";
import Products from "../components/products";
import useProducts from "../api/products";
import Welcome from "../components/welcome/welcome";
import CategoryCarousel from "../components/carruseles/CategoryCarousel";
import { categoriesService } from "../api/categorias";

export default function Index() {
  const [showWelcome, setShowWelcome] = useState(true); // pantalla de bienvenida activa al inicio
  const { products, loading, error } = useProducts();
  const [categories, setCategories] = useState([]);

  const handleContinue = () => {
    setShowWelcome(false); // desactiva welcome
  };

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

  if (showWelcome) {
    return <Welcome onContinue={handleContinue} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={["top", "bottom"]}>
      <View className="position-absolute w-full h-50 bg-[#00732E]">
        <Header />
      </View>

<ScrollView contentContainerStyle={{ paddingTop: 25 }}>
  {/*  Carrusel de categorías con espacio */}
  <View style={{ marginBottom: 45 }}>
    <CategoryCarousel categories={categories} />
  </View>

  {/*  Productos pequeños destacados */}
  <View style={{ marginBottom: 24 }}>
    <ProductSmall products={products} loading={loading} error={error} />
  </View>

  {/*  Todos los productos */}
  <Products products={products} loading={loading} error={error} />
</ScrollView>

    </SafeAreaView>
  );
}