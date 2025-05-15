import React, { useMemo } from "react";
import {
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewProps,
  Pressable,
  useWindowDimensions
} from "react-native";
import Animated from "react-native-reanimated";
import type { AnimatedProps } from "react-native-reanimated";
import { Link } from "expo-router";


interface Props extends AnimatedProps<ViewProps> {
  style?: StyleProp<ImageStyle>;
  index?: number;
  rounded?: boolean;
  source: ImageSourcePropType;
  testID?: string;
  item?: any; // Recibirá el producto completo
}

export const SlideItem: React.FC<Props> = (props) => {
  const { style, index = 0, rounded = false, testID, source, item, ...animatedViewProps } = props;
  const { width } = useWindowDimensions();
  const ITEM_HEIGHT = width * 0.6;

  return (
    <Link key={item.id} href={{
                            pathname: `/${item.id}`,
                            params: { product: JSON.stringify(item) }
    
                        }}  
                            className="flex-1" asChild>
                            <Pressable className="active:opacity-50" 
                            android_ripple={{ color: '#A8E6A3' }}
                             style={{ width: '100%', height: ITEM_HEIGHT }}
                            >
    
   
        <Animated.View testID={testID} style={{ flex: 1,width: '100%', height: ITEM_HEIGHT  }} {...animatedViewProps}>
        
        <Animated.Image
            style={[styles.container, style, rounded && { borderRadius: 15 }]}
            source={source}
            resizeMode="center"
        />
        
        {item && (
            
            <View style={styles.overlay}>
            <View style={styles.overlayTextContainer}>
                <Text style={styles.titleText} numberOfLines={2}>
                {item.title}
                </Text>
                <Text style={styles.priceText}>${item.price}</Text>
                <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            </View>
        
        )}
        </Animated.View>
        </Pressable>
     </Link>
    
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
  },
  overlayTextContainer: {
    alignItems: "center",
  },
  titleText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  priceText: {
    color: "white",
    fontSize: 14,
    marginTop: 5,
  },
  categoryText: {
    color: "white",
    fontSize: 14,
    marginTop: 5,
    textTransform: "capitalize",
  },
});