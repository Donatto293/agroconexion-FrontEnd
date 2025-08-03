import React, {memo} from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Tooltip } from 'react-native-paper';


const CATEGORY_COLORS = ['#E8F5E9'];

const CATEGORY_ICONS = {
  frutas: { icon: 'food-apple', lib: MaterialCommunityIcons },
  verduras: { icon: 'carrot', lib: FontAwesome5 },
  granos: { icon: 'wheat', lib: MaterialCommunityIcons },
  lacteos: { icon: 'cow', lib: MaterialCommunityIcons },
  carnes: { icon: 'food-steak', lib: MaterialCommunityIcons },
  embutidos: { icon: 'sausage', lib: MaterialCommunityIcons },
  huevos: { icon: 'egg', lib: MaterialCommunityIcons },
  panaderia: { icon: 'bread-slice', lib: FontAwesome5 },
  'miel y derivados': { icon: 'honeycomb', lib: MaterialCommunityIcons },
  bebidas: { icon: 'cup', lib: MaterialCommunityIcons },
  'bebidas fermentadas': { icon: 'beer-outline', lib: MaterialCommunityIcons },
  'productos organicos': { icon: 'leaf', lib: MaterialCommunityIcons },
  semillas: { icon: 'seed', lib: MaterialCommunityIcons },
  'hecho a mano': { icon: 'hand-holding-heart', lib: FontAwesome5 },
  'plantas y flores': { icon: 'flower', lib: MaterialCommunityIcons },
  'productos transformados': { icon: 'factory', lib: MaterialCommunityIcons },
  default: { icon: 'shopping', lib: MaterialCommunityIcons }
};

function CategoryCarousel({ categories }) {
  const renderItem = ({ item, index }) => {
    const nameKey = item.name.toLowerCase().trim();
    let iconData = CATEGORY_ICONS.default;

    for (const [key, data] of Object.entries(CATEGORY_ICONS)) {
      if (nameKey.includes(key)) {
        iconData = data;
        break;
      }
    }

    const Icon = iconData.lib;

    return (
      <Link href={`/categorias/${item.id}`} asChild>
        <TouchableOpacity style={styles.card}>
          <View
            style={[
              styles.iconBox,
              { backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }
            ]}
          >
            <Icon name={iconData.icon} size={20} color="#00732E" />
          </View>
          <Tooltip
            title={item.name}
            theme={{ colors: { primary: 'green', surface: '#cefcc4ff' } }}
          >
            <Text style={styles.label} numberOfLines={1}>{item.name}</Text>
          </Tooltip>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <FlatList
      horizontal
      data={categories}
      keyExtractor={(item) => item.id.toString()}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.carouselContainer}
      initialNumToRender={5}
      renderItem={renderItem}
      maxToRenderPerBatch={5}
      removeClippedSubviews
    />
  );
}

const styles = StyleSheet.create({
  carouselContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  card: {
    alignItems: 'center',
    marginRight: 32,
    width: 70,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
});

export default React.memo(CategoryCarousel);

