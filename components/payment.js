import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const PaymentScreen = ({ total, onPaymentSuccess, onClose }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simular validación/procesamiento de pago
      await new Promise(resolve => setTimeout(resolve, 3000));
      onPaymentSuccess(); // Notificar al padre que el pago fue exitoso
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className="text-2xl font-bold text-green-800 mb-4">Pago con Tarjeta</Text>

        <TextInput
          label="Número de Tarjeta"
          value={cardNumber}
          onChangeText={setCardNumber}
          keyboardType="number-pad"
          maxLength={16}
          style={{ marginBottom: 16 }}
          mode="outlined"
        />

        <TextInput
          label="Nombre del Titular"
          value={cardHolder}
          onChangeText={setCardHolder}
          style={{ marginBottom: 16 }}
          mode="outlined"
        />

        <View className="flex-row justify-between space-x-4 mb-4">
          <TextInput
            label="MM/AA"
            value={expiry}
            onChangeText={setExpiry}
            keyboardType="numeric"
            style={{ flex: 1 }}
            mode="outlined"
            maxLength={5}
            placeholder="MM/YY"
          />
          <TextInput
            label="CVV"
            value={cvv}
            onChangeText={setCvv}
            keyboardType="number-pad"
            secureTextEntry
            style={{ flex: 1 }}
            mode="outlined"
            maxLength={4}
          />
        </View>

        <Button
          mode="contained"
          loading={loading}
          disabled={loading || !cardNumber || !cardHolder || !expiry || !cvv}
          onPress={handleSubmit}
          className="mt-4 bg-green-700 rounded-xl"
        >
          Realizar Pago
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default PaymentScreen
