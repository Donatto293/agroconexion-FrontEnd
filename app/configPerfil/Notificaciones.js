import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Notificaciones() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    promotions: false,
    news: true,
  });

  const toggleSwitch = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuración de Notificaciones</Text>
      
      <View style={styles.option}>
        <View style={styles.optionLeft}>
          <Icon name="email" size={24} color="#00732E" />
          <Text style={styles.optionText}>Notificaciones por correo</Text>
        </View>
        <Switch
          value={notifications.email}
          onValueChange={() => toggleSwitch('email')}
          trackColor={{ false: "#767577", true: "#00732E" }}
        />
      </View>
      
      <View style={styles.option}>
        <View style={styles.optionLeft}>
          <Icon name="notifications" size={24} color="#00732E" />
          <Text style={styles.optionText}>Notificaciones push</Text>
        </View>
        <Switch
          value={notifications.push}
          onValueChange={() => toggleSwitch('push')}
          trackColor={{ false: "#767577", true: "#00732E" }}
        />
      </View>
      
      <View style={styles.option}>
        <View style={styles.optionLeft}>
          <Icon name="local-offer" size={24} color="#00732E" />
          <Text style={styles.optionText}>Ofertas promocionales</Text>
        </View>
        <Switch
          value={notifications.promotions}
          onValueChange={() => toggleSwitch('promotions')}
          trackColor={{ false: "#767577", true: "#00732E" }}
        />
      </View>
      
      <View style={styles.option}>
        <View style={styles.optionLeft}>
          <Icon name="new-releases" size={24} color="#00732E" />
          <Text style={styles.optionText}>Novedades y actualizaciones</Text>
        </View>
        <Switch
          value={notifications.news}
          onValueChange={() => toggleSwitch('news')}
          trackColor={{ false: "#767577", true: "#00732E" }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1F2937',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#1F2937',
  },
});