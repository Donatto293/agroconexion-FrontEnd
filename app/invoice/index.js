import { listInvoices } from '../../api/invoices';
import { useState, useEffect } from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Text, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InvoicesListScreen() {
  const [invoices, setInvoices] = useState([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const data = await listInvoices();
      setInvoices(data);
    })();
  }, []);

  return (
     <SafeAreaView className="flex-1 bg-white px-4 pt-4">
      <Text className="text-2xl font-bold mb-4 text-green-900">Mis Facturas</Text>

      <FlatList
        data={invoices}
        keyExtractor={inv => inv.id.toString()}
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => (
          <Card 
            onPress={() => router.push(`/invoice/${item.id}`)} 
            className="rounded-lg"
            mode="elevated"
          >
            <Card.Title 
              title={`Factura #${item.id}`} 
              subtitle={`Método: ${item.method}`} 
              right={(props) => <IconButton {...props} icon="chevron-right" />}
            />
            <Card.Content>
              <Text className="text-lg text-gray-800">Total: ${item.total}</Text>
            </Card.Content>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}