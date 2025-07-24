import { getInvoiceDetail } from '../../api/invoices';
import { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
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

  if (!invoice) return <Text>Cargando...</Text>;

  return (
    <SafeAreaView className="flex-1 bg-white px-4 pt-4">
      <Card className="rounded-lg mb-4">
        <Card.Title title={`Factura #${invoice.id}`} />
        <Card.Content>
          <Text>Fecha: {new Date(invoice.date_created).toLocaleString()}</Text>
          <Text>Método: {invoice.method}</Text>
          <Text className="font-bold mt-2">Total: ${invoice.total}</Text>
        </Card.Content>
      </Card>

      <Text className="text-xl font-bold mb-2 text-green-900">Detalles</Text>

      <FlatList
        data={invoice.details}
        keyExtractor={(d, i) => i.toString()}
        ItemSeparatorComponent={() => <Divider />}
        renderItem={({ item }) => (
          <Card className="mb-2" mode="outlined">
            <Card.Content>
              <Text className="text-base">{item.quantity} x {item.product_name}</Text>
              <Text className="text-gray-600">Vendedor: {item.seller_name}</Text>
              <Text className="text-gray-800 font-semibold">Subtotal: ${item.subtotal}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}
