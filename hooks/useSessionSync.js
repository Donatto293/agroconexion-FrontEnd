import { useEffect, useContext, useRef } from "react";
import { useAuth } from "../context/authContext";
import { CartContext } from "../context/cartContext";
import { FavoritesContext } from "../context/favoritesContext";

export const useSessionSync = () => {
  const { user } = useAuth();
  const { loadCart, resetCart } = useContext(CartContext);
  const { fetchFavorites, clearFavorites } = useContext(FavoritesContext);
   // Guarda el último token procesado para evitar sincronizaciones innecesarias
  const lastTokenRef = useRef(null);
  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      // Primer render: sólo marcamos que ya montamos
      didMount.current = true;
      return;
    }
  }, []);
  useEffect(() => {
    // Verifica si el token ha cambiado realmente
    const currentToken = user?.token;
    
    if (currentToken === lastTokenRef.current) {
      return;
    }

    const sync = async () => {
      if (currentToken) {
        console.log("user Active USEER:", user.username || user.email || "Usuario");
        try {
           await Promise.all([
            loadCart(),
            fetchFavorites()
          ]);
        } catch (error) {
          console.error("Error al sincronizar sesión:", error);
        }
      } else {
        console.log("no usuario logueado, limpiando contextos");
        resetCart();
        clearFavorites();
      }
      
      // Actualiza la referencia con el token actual
      lastTokenRef.current = currentToken;
    };

    sync();
  }, [user?.token]); // Solo dependemos del token, no de todo el objeto user
};