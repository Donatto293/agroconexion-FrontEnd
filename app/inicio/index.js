import React,{ 
  useState, 
  useEffect, 
  useContext, 
  useRef,
  useMemo,
  useCallback
} from "react";
import { 
  View, 
  Alert,
  Animated,
  BackHandler
 } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Components
import Top_products from "../../components/top_products";
import HeaderScreen from "../../components/header/Header";
import Welcome from "../../components/welcome/welcome";
import ProductSmall from "../../components/productSmall";
import Products from "../../components/products";

import {useProductsContext} from "../../context/productContext";

import CategoryCarousel from "../../components/carruseles/CategoryCarousel";
import { categoriesService } from "../../api/categorias";
import { useAuth } from "../../context/authContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SearchContext } from "../../context/SearchContext";
import useBackButtonHandler from "../../hooks/useBackButtonHandler";
import throttle from "lodash/throttle";
import { useRouter } from "expo-router";
import ScrollToTopButton from "../../components/scrollToTopButton";

export default function Inicio() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [checkedWelcome, setCheckedWelcome] = useState(false);
  const { products, loading, error } = useProductsContext();
  
  const {user} = useAuth();
  const router = useRouter();
  const {searchQuery} = useContext(SearchContext)
  
  // Scroll control
  const scrollViewRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  // Categories carousel
  const [categories, setCategories] = useState([]);
  const memoizedCategories = useMemo(() => categories, [categories]);

  // Scroll handler
  const handleScroll = useCallback(throttle((offsetY) => {
    setShowScrollButton(offsetY > 300);
  }, 300), []);

  // Cleanup throttle
  useEffect(() => {
    return () => {
      handleScroll.cancel?.();
    };
  }, [handleScroll]);

  // Animated scroll value
  const scrollY = useRef(new Animated.Value(0)).current;

  // Back button handler
  useBackButtonHandler(() => {
    Alert.alert(
      '¿Salir?',
      '¿Deseas salir de la aplicación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', onPress: () => BackHandler.exitApp() },
      ]
    )
    return true
  })

  // Load categories
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

  // Check welcome screen
  useEffect(() => {
    const checkWelcome = async () => {
      try {
        const now = Date.now();
        const lastOpenStr = await AsyncStorage.getItem("last_open_time");
        const loginFlag = await AsyncStorage.getItem("welcome_after_login_shown");
        let shouldShow = false;

        if (!user?.token) {
          await AsyncStorage.removeItem("welcome_after_login_shown");

          if (!lastOpenStr) {
            shouldShow = true;
          } else {
            const lastOpenTime = parseInt(lastOpenStr, 10);
            const diffMin = (now - lastOpenTime) / 60000;
            if (diffMin > 30) shouldShow = true;
          }
        } else {
          if (!loginFlag) {
            shouldShow = true;
            await AsyncStorage.setItem(
              "welcome_after_login_shown",
              "true"
            );
          }
        }

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

  if (!checkedWelcome) {
    return null;
  }

  if (showWelcome) {
    return <Welcome onContinue={() => setShowWelcome(false)} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={["top", "bottom"]}>
      <View className="position-absolute w-full h-50 bg-[#00732E]">
        <HeaderScreen />
      </View>

      <Animated.ScrollView
        ref={scrollViewRef}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: false,
            listener: (event) => {
              const offsetY = event.nativeEvent.contentOffset.y;
              handleScroll(offsetY);
            }
          }
        )}
        contentContainerStyle={{ paddingTop: 20 }}
      >
        {/* Content when NOT searching */}
        {!searchQuery && (
          <>
            {/* Categories carousel */}
            <View style={{ marginBottom: "2%" }}>
              <CategoryCarousel categories={memoizedCategories} />
            </View>

            {/* Top products carousel - NOW POSITIONED HERE */}
            <Top_products products={products} loading={loading} error={error} />

            {/* Small featured products */}
            <View style={{ marginBottom: '-9%' }}>
              <ProductSmall products={products} loading={loading} error={error} />
            </View>
          </>
        )}

        {/* All products list */}
        <Products products={products} loading={loading} error={error} />
      </Animated.ScrollView>

      <ScrollToTopButton 
        scrollRef={scrollViewRef} 
        scrollOffset={showScrollButton} 
      />
    </SafeAreaView>
  );
}