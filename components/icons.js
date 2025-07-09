import AntDesign from '@expo/vector-icons/AntDesign';
import { Ionicons } from '@expo/vector-icons';
import EvilIcons from '@expo/vector-icons/EvilIcons';

import Foundation from '@expo/vector-icons/Foundation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';



export const IconUser = () => <Ionicons name="person-circle" size={36} color="white" />;
export const IconSearch = () => <Feather name="search" size={24} color="black" />;
export const IconHome = () => <AntDesign name="home" size={24} color="black" />;
export const IconShoppingCart = () => <AntDesign name="shoppingcart" size={24} color="black" />;
export const IconFavorites = () => <EvilIcons name="star" size={24} color="black" />;
export const IconCoupons = () => <Foundation name="ticket" size={24} color="black" />;
export const IconDiscount = () => <MaterialIcons name="discount" size={24} color="black" />;
export const IconCategories = () => <Feather name="list" size={24} color="black" />;

export const IconArrowLeft = () => <AntDesign name="arrowleft" size={30} color="black" />

export const EyeWithLine=()=> <Entypo name="eye-with-line" size={24} color="black" />

export const IconPlus =() =><Entypo name="plus" size={24} color="black" />