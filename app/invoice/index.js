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
    <SafeAreaView className="flex-1 bg-gray-50 px-4 pt-10">
      <View className="items-center mb-6">
        <Text className="text-3xl font-bold text-emerald-800 tracking-tight">
           Mis Facturas
        </Text>
      </View>

      <FlatList
        data={invoices}
        keyExtractor={inv => inv.id.toString()}
        ItemSeparatorComponent={() => <View className="h-4" />}
        renderItem={({ item }) => (
          <Card
            onPress={() => router.push(`/invoice/${item.id}`)}
            className="rounded-xl shadow-sm"
            mode="elevated"
            style={{ backgroundColor: '#ffffff', elevation: 2 }}
          >
            <Card.Title
              title={`Factura #${item.id}`}
              subtitle={`Método: ${item.method}`}
              titleStyle={{ fontWeight: '600', fontSize: 16 }}
              subtitleStyle={{ color: '#6B7280' }}
              right={(props) => (
                <IconButton {...props} icon="chevron-right" iconColor="#10B981" />
              )}
            />
            <Card.Content>
              <Text className="text-lg text-gray-700 font-semibold">
                Total: ${item.total}
              </Text>
            </Card.Content>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}