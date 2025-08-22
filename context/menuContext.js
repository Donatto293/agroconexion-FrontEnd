import React, { createContext, useContext, useState } from 'react';
import { usePathname } from 'expo-router';

export const MenuContext = createContext();
export const MENU_HEIGHT = 20;

export const MenuProvider = ({ children }) => {
    const [menuMounted, setMenuMounted] = useState(false); // para evitar render duplicado
    
    const pathname = usePathname(); 
    const hideMenuOn = ["/", "/login", "/register"];
    const shouldHideMenu = hideMenuOn.includes(pathname);    
    return (
        <MenuContext.Provider value={{ menuMounted, setMenuMounted, shouldHideMenu, menuHeight: MENU_HEIGHT }}>
            {children}
        </MenuContext.Provider>
    );
};

export const useMenu = () => useContext(MenuContext);