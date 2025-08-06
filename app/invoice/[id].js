import { getInvoiceDetail } from '../../api/invoices';
import { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text, Card, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await getInvoiceDetail(id);
      setInvoice(data);
    })();
  }, [id]);

  if (!invoice) return (
    <SafeAreaView style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Cargando factura...</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Card style={styles.mainCard} mode="elevated">
        <Card.Title 
          title={`Factura #${invoice.id}`} 
          titleStyle={styles.cardTitle} 
        />
        <Card.Content>
          <Text style={styles.infoText}>📅 Fecha: {new Date(invoice.date_created).toLocaleString()}</Text>
          <Text style={styles.infoText}>💳 Método: {invoice.method}</Text>
          <Text style={styles.totalText}>💰 Total: ${invoice.total}</Text>
        </Card.Content>
      </Card>

      <Text style={styles.sectionTitle}>🧾 Detalles</Text>

      <FlatList
        data={invoice.details}
        keyExtractor={(_, i) => i.toString()}
        ItemSeparatorComponent={() => <Divider style={{ marginVertical: 4 }} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <Card style={styles.detailCard} mode="outlined">
            <Card.Content>
              <Text style={styles.itemText}>
                {item.quantity} x {item.product_name}
              </Text>
              <Text style={styles.sellerText}>Vendedor: {item.seller_name}</Text>
              <Text style={styles.subtotalText}>Subtotal: ${item.subtotal}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingTop: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF'
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280'
  },
  mainCard: {
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#FFFFFF'
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#065F46'
  },
  infoText: {
    fontSize: 14,
    marginTop: 4,
    color: '#374151'
  },
  totalText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 8
  },
  detailCard: {
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 8
  },
  itemText: {
    fontSize: 15,
    color: '#1F2937'
  },
  sellerText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4
  },
  subtotalText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
    color: '#065F46'
  }
});