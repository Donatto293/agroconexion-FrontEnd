import React from 'react';
import { View, Text, ActivityIndicator, useWindowDimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import useFakeProducts from '../../lib/fakeProduct';
import { renderItem } from "../../utils/render-item";

import { useSharedValue } from "react-native-reanimated";

export default function Carousel3D() {
  const { products, loading, error } = useFakeProducts();
  const { width } = useWindowDimensions();
  const ITEM_SIZE = width;
  const progress = useSharedValue(1);

  if (loading) return <ActivityIndicator size="large" color="#00732E" />;
  if (error)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red", fontSize: 18 }}>{error}</Text>
      </View>
    );

    return (
        
        <View
            className="bg-white"
            id="carousel-component"
            dataSet={{ kind: "basic-layouts", name: "parallax" }}
        >
            
            <Carousel
                autoPlayInterval={2000}
                data={products}
                height={500}
                loop={true}
                pagingEnabled={true}
                snapEnabled={true}
                width={ITEM_SIZE}
                style={{
                    width: 800,
                }}
                mode="parallax"
                modeConfig={{
                    parallaxScrollingScale: 0.9,
                    parallaxScrollingOffset: 60,
                }}
                onProgressChange={progress}
                renderItem={renderItem({ rounded: true })}
            />
        </View>
    );
}