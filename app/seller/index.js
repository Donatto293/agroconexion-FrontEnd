// SellerDashboard.js
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
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

const screenWidth = Dimensions.get('window').width - 32;

/**
 * MOCK API: reemplaza estas funciones por llamadas reales a tu backend.
 * Mantén la misma interfaz: listProducts(), createProduct(obj), updateProduct(obj), deleteProduct(id)
 */
const fakeApi = {
  listProducts: async () => {
    await new Promise((r) => setTimeout(r, 350));
    return [
      { id: 1, title: 'Camiseta básica', price: 19.99, stock: 42, sales: 120, created_at: '2025-06-01' },
      { id: 2, title: 'Jean clásico', price: 49.99, stock: 12, sales: 80, created_at: '2025-05-12' },
      { id: 3, title: 'Zapatillas running', price: 89.99, stock: 7, sales: 200, created_at: '2025-04-20' },
    ];
  },
  createProduct: async (payload) => {
    await new Promise((r) => setTimeout(r, 250));
    return { ...payload, id: Date.now() };
  },
  updateProduct: async (payload) => {
    await new Promise((r) => setTimeout(r, 250));
    return payload;
  },
  deleteProduct: async (id) => {
    await new Promise((r) => setTimeout(r, 200));
    return { success: true };
  },
};

export default function SellerDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal create/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ title: '', price: '', stock: '' });

  // delete confirm
  const [deletePendingId, setDeletePendingId] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const list = await fakeApi.listProducts();
        if (mounted) setProducts(list);
      } catch (e) {
        console.error('load products error', e);
        Alert.alert('Error', 'No se pudieron cargar los productos');
      } finally {
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((s, p) => s + Number(p.stock || 0), 0);
    const totalSales = products.reduce((s, p) => s + Number(p.sales || 0), 0);
    const topProduct = products.slice().sort((a, b) => (b.sales || 0) - (a.sales || 0))[0] ?? null;
    return { totalProducts, totalStock, totalSales, topProduct };
  }, [products]);

  const salesTimeSeries = useMemo(() => {
    // Sumar ventas por mes (yyyy-mm)
    const map = {};
    products.forEach((p) => {
      const month = (p.created_at || new Date().toISOString()).slice(0, 7);
      map[month] = (map[month] || 0) + (p.sales || 0);
    });
    const entries = Object.keys(map)
      .sort()
      .map((k) => ({ month: k, sales: map[k] }));
    // si no hay datos, agrega meses vacíos para mostrar algo
    if (entries.length === 0) {
      return [{ month: '2025-01', sales: 0 }];
    }
    return entries;
  }, [products]);

  // open modal for new product
  const openNew = () => {
    setEditingProduct(null);
    setForm({ title: '', price: '', stock: '' });
    setIsModalOpen(true);
  };

  // open modal for edit
  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({ title: p.title, price: String(p.price), stock: String(p.stock) });
    setIsModalOpen(true);
  };

  const onSubmit = async () => {
    if (!form.title.trim()) return Alert.alert('Aviso', 'El producto necesita un título');
    // small validation
    const payload = {
      title: form.title.trim(),
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      sales: editingProduct?.sales ?? 0,
      created_at: editingProduct?.created_at ?? new Date().toISOString().slice(0, 10),
    };

    try {
      if (editingProduct) {
        const updated = { ...editingProduct, ...payload };
        const res = await fakeApi.updateProduct(updated);
        setProducts((prev) => prev.map((x) => (x.id === res.id ? res : x)));
      } else {
        const res = await fakeApi.createProduct(payload);
        setProducts((prev) => [res, ...prev]);
      }
      setIsModalOpen(false);
    } catch (e) {
      console.error('save product error', e);
      Alert.alert('Error', 'No se pudo guardar el producto');
    }
  };

  const confirmDelete = (id) => {
    Alert.alert('Confirmar', '¿Eliminar este producto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => doDelete(id),
      },
    ]);
  };

  const doDelete = async (id) => {
    try {
      await fakeApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error('delete error', e);
      Alert.alert('Error', 'No se pudo eliminar');
    }
  };

  // Chart data transform for chart-kit
  const chartLabels = salesTimeSeries.map((d) => d.month.slice(5)); // 'YYYY-MM' -> 'MM'
  const chartValues = salesTimeSeries.map((d) => d.sales);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00732E" />
      </View>
    );
  }

  return (

    <SafeAreaView style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.title}>Panel de Vendedor</Text>
        <TouchableOpacity style={styles.newButton} onPress={openNew}>
          <Icon name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.newButtonText}>Nuevo producto</Text>
        </TouchableOpacity>
      </View>

      {/* layout: left = list, right = stats (on small screens stacked) */}
      <View style={styles.content}>
        {/* lista */}
        <View style={styles.listCard}>
          <Text style={styles.cardTitle}>Mis productos</Text>
          <FlatList
            data={products}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <View style={styles.productRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productTitle}>{item.title}</Text>
                  <Text style={styles.productMeta}>
                    ${Number(item.price).toFixed(2)} · Stock: {item.stock} · Ventas: {item.sales}
                  </Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
                    <Icon name="edit" size={20} color="#F59E0B" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.iconBtn}>
                    <Icon name="delete" size={20} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            ListEmptyComponent={() => <Text style={{ textAlign: 'center', padding: 20 }}>No hay productos</Text>}
          />
        </View>

        {/* stats + chart */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Estadísticas</Text>
          <View style={styles.statRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalProducts}</Text>
              <Text style={styles.statLabel}>Productos</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalStock}</Text>
              <Text style={styles.statLabel}>Stock</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.totalSales}</Text>
              <Text style={styles.statLabel}>Ventas</Text>
            </View>
          </View>

          {stats.topProduct && (
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontWeight: '600' }}>Top: {stats.topProduct.title}</Text>
              <Text style={{ color: '#374151' }}>{stats.topProduct.sales} ventas</Text>
            </View>
          )}

          <View style={{ marginTop: 12 }}>
            <BarChart
              data={{ labels: chartLabels, datasets: [{ data: chartValues }] }}
              width={screenWidth}
              height={180}
              yAxisLabel=""
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(16,185,129, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(31,41,55, ${opacity})`,
                style: { borderRadius: 8 },
                propsForBackgroundLines: { strokeDasharray: '' },
              }}
              style={{ borderRadius: 8 }}
              fromZero
              showValuesOnTopOfBars
            />
          </View>
        </View>
      </View>

      {/* Modal create / edit */}
      <Modal visible={isModalOpen} animationType="slide" transparent onRequestClose={() => setIsModalOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingProduct ? 'Editar producto' : 'Nuevo producto'}</Text>

            <TextInput
              placeholder="Título"
              value={form.title}
              onChangeText={(t) => setForm((s) => ({ ...s, title: t }))}
              style={styles.input}
            />
            <TextInput
              placeholder="Precio"
              value={form.price}
              onChangeText={(t) => setForm((s) => ({ ...s, price: t }))}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              placeholder="Stock"
              value={form.stock}
              onChangeText={(t) => setForm((s) => ({ ...s, stock: t }))}
              keyboardType="numeric"
              style={styles.input}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
              <TouchableOpacity onPress={() => setIsModalOpen(false)} style={[styles.btn, styles.btnOutline]}>
                <Text style={styles.btnOutlineText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onSubmit} style={[styles.btn, styles.btnPrimary]}>
                <Text style={styles.btnPrimaryText}>{editingProduct ? 'Guardar' : 'Crear'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F3F4F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700' },
  newButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  newButtonText: { color: '#fff', marginLeft: 6 },

  content: { flexDirection: 'column' /* stacked for mobile */, gap: 12 },
  listCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 12 },
  statsCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12 },

  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  productRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  productTitle: { fontWeight: '600', fontSize: 15 },
  productMeta: { color: '#6B7280', marginTop: 4, fontSize: 13 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 8, marginLeft: 8 },
  sep: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 6 },

  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statBox: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: '700' },
  statLabel: { color: '#6B7280' },

  // modal
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalCard: { width: '100%', maxWidth: 560, backgroundColor: '#fff', borderRadius: 10, padding: 16, elevation: 6 },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 8 },

  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, marginLeft: 8 },
  btnPrimary: { backgroundColor: '#10B981' },
  btnPrimaryText: { color: '#fff', fontWeight: '600' },
  btnOutline: { backgroundColor: '#F3F4F6' },
  btnOutlineText: { color: '#111827', fontWeight: '600' },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
