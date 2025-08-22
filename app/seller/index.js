
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Button
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { statsRating } from '../../api/products';
import { useProductsContext } from '../../context/productContext';
import CreateProductForm from '../../components/newProduct';

export default function SellerDashboard() {
  const { products, createProduct, updateProduct, deleteProduct, refreshProducts, loading } = useProductsContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    if (!products.length) return;
    (async () => {
      const results = {};
      for (const p of products) {
        try {
          const r = await statsRating(p.id);
          results[p.id] = r;
        } catch (e) {
          console.log('stats error', e);
        }
      }
      setRatings(results);
    })();
  }, [products]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00732E" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Panel de Vendedor</Text>
        <TouchableOpacity style={styles.newButton} onPress={() => setIsModalOpen(true)}>
          <Icon name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.newButtonText}>Nuevo producto</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de productos */}
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.productRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productTitle}>{item.name}</Text>
              <Text style={styles.productMeta}>
                ${Number(item.price)} · Stock: {item.stock}
              </Text>
              {ratings[item.id] && (
                <Text style={{ color: '#F59E0B' }}>
                  ⭐ {ratings[item.id].average} ({ratings[item.id].count} reseñas)
                </Text>
              )}
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => {/* open edit con AddProductForm */}} style={styles.iconBtn}>
                <Icon name="edit" size={20} color="#F59E0B" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteProduct(item.id)} style={styles.iconBtn}>
                <Icon name="delete" size={20} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal con el formato para crear */}
      <Modal visible={isModalOpen} animationType="slide">
        <SafeAreaView style={{ flex: 1, padding: 5 }}>
          <CreateProductForm onSuccess={() => { setIsModalOpen(false); refreshProducts(); }} />
          <Button title="Cerrar" onPress={() => setIsModalOpen(false)} />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newButtonText: {
    color: '#fff',
    marginLeft: 6,
  },

  content: {
    flexDirection: 'column',
    gap: 12,
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  productTitle: {
    fontWeight: '600',
    fontSize: 15,
  },
  productMeta: {
    color: '#6B7280',
    marginTop: 4,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 8,
    marginLeft: 8,
  },
  sep: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 6,
  },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: '#6B7280',
  },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },

  btn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginLeft: 8,
  },
  btnPrimary: {
    backgroundColor: '#10B981',
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '600',
  },
  btnOutline: {
    backgroundColor: '#F3F4F6',
  },
  btnOutlineText: {
    color: '#111827',
    fontWeight: '600',
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
