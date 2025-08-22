import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, Alert, TouchableOpacity, Image} from 'react-native';
import { useProductsContext } from '../context/productContext';
import api from '../utils/axiosInstance';
import { Picker } from '@react-native-picker/picker';
import { listCategories } from '../api/products';
import * as ImagePicker from 'expo-image-picker';

export default function CreateProductForm({ onSuccess }) {
  const { createProduct } = useProductsContext();

  const [loading, setLoading]= useState(false)

  // Estados para el producto
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('unidad');
  const [status, setStatus] = useState('disponible');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [images, setImages] = useState([]);

  // Cargar categorías desde el backend
    useEffect(() => {
    const fetchCategories = async () => {
        try {
        const res = await listCategories(); 
       
        setCategories(res || []); 
        
        } catch (err) {
        console.error('Error cargando categorías', err);
        setCategories([]); // fallback para que nunca quede undefined
        }
    };
    fetchCategories();
    }, []);

    

    // Seleccionar imágenes
    const handlePickImages = async () => {
        try {
        // Solicitar permisos primero
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permisos necesarios', 'Se necesitan permisos para acceder a la galería');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.7,
            allowsEditing: false,
        });

        if (result.canceled) return;

        const normalizedImages = result.assets.map((asset, index) => {
            // Extraer el nombre de archivo de la URI
            const uriParts = asset.uri.split('/');
            const fileName = uriParts[uriParts.length - 1];
            
            return {
            uri: asset.uri,
            name: fileName || `image_${Date.now()}_${index}.jpg`,
            type: asset.type || 'image/jpeg',
            };
        });

        setImages(normalizedImages);
        } catch (error) {
        console.error('Error seleccionando imágenes:', error);
        Alert.alert('Error', 'No se pudieron seleccionar las imágenes');
        }
    };


  // Handler para crear producto
  const handleSubmit = async () => {
    //validacion de datos, se evita que esten vacios 
    if (!name || !description || !price || !stock || !selectedCategory) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    //validacion se necesita minimo una imagen 
    if (images.length === 0) {
      Alert.alert('Error', 'Debes seleccionar al menos una imagen');
      return;
    }

    setLoading(true);


    const productData = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      unit_of_measure: unit,
      state: status,
      category: [selectedCategory], 
    };

    console.log('productos desde el handle:', productData, 'imagenes:',images)

    try {
        const res = await createProduct(productData, images);
        if (res.success) {
            Alert.alert('Éxito', 'Producto creado correctamente');
            if (onSuccess) onSuccess();
            setName('');
            setDescription('');
            setPrice('');
            setStock('');
            setUnit('unidad');
            setStatus('disponible');
            setSelectedCategory(null);
        
        }
    } catch (error) {
        console.log('error en crear el producto:',error)
    } finally{
        setLoading(false)
    }

    
  };

  return (
    <ScrollView className="flex-1 bg-white p-4 pb">
      <Text className="text-2xl font-bold text-green-700 mb-4 text-center">
        🌱 Nuevo Producto Campesino
      </Text>

      {/* Nombre */}
      <Text className="text-green-700 font-semibold mb-1">Nombre</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nombre del producto"
        className="border border-green-400 rounded-lg p-2 mb-3"
      />

      {/* Descripción */}
      <Text className="text-green-700 font-semibold mb-1">Descripción</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Descripción"
        multiline
        className="border border-green-400 rounded-lg p-2 mb-3"
      />

      {/* Precio */}
      <Text className="text-green-700 font-semibold mb-1">Precio</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="Precio"
        keyboardType="decimal-pad"
        className="border border-green-400 rounded-lg p-2 mb-3"
      />

      {/* Stock */}
      <Text className="text-green-700 font-semibold mb-1">Stock</Text>
      <TextInput
        value={stock}
        onChangeText={setStock}
        placeholder="Cantidad disponible"
        keyboardType="numeric"
        className="border border-green-400 rounded-lg p-2 mb-3"
      />

      {/* Unidad */}
      <Text className="text-green-700 font-semibold mb-1">Unidad de medida</Text>
      <View className="border border-green-400 rounded-lg mb-3">
        <Picker selectedValue={unit} onValueChange={setUnit}>
          <Picker.Item label="Kilogramos" value="kg" />
          <Picker.Item label="Gramos" value="g" />
          <Picker.Item label="Litros" value="l" />
          <Picker.Item label="Mililitros" value="ml" />
          <Picker.Item label="Unidad" value="unidad" />
          <Picker.Item label="Libra" value="li" />
        </Picker>
      </View>

      {/* Estado */}
      <Text className="text-green-700 font-semibold mb-1">Estado</Text>
      <View className="border border-green-400 rounded-lg mb-3">
        <Picker selectedValue={status} onValueChange={setStatus}>
          <Picker.Item label="Disponible" value="disponible" />
          <Picker.Item label="Agotado" value="agotado" />
          <Picker.Item label="Inactivo" value="inactivo" />
        </Picker>
      </View>

      {/* Categoría */}
     <Text className="text-green-700 font-semibold mb-1">Categoría</Text>
      <View className="border border-green-400 rounded-lg mb-3" style={{ minHeight: 50 }}>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
        >
           <Picker.Item label="Selecciona una categoría" value="" />
          {categories.map(cat => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
          ))}
        </Picker>
        </View>

      {/* Imágenes */}
      <Text className="text-green-700 font-semibold mb-2">Imágenes (máx 4)</Text>
      <View className="flex-row flex-wrap mb-3">
        {images.map((img, index) => (
          <Image
            key={index}
            source={{ uri: img.uri }}
            className="w-20 h-20 m-1 rounded-lg border border-green-300"
          />
        ))}
      </View>

      {/* Botón seleccionar imágenes */}
      <TouchableOpacity
        onPress={handlePickImages}
        className="bg-green-600 py-3 rounded-xl mb-4"
      >
        <Text className="text-white text-center font-semibold">
           Seleccionar Imágenes
        </Text>
      </TouchableOpacity>

      {/* Botón crear */}
      <TouchableOpacity
        onPress={handleSubmit}
        className="bg-green-700 py-3 rounded-xl"
      >
        <Text className="text-white text-center font-bold">
            {loading ? 'Creando producto...' : 'Crear Producto'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}