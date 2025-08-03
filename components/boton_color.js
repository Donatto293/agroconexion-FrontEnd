import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Switch, Text, useTheme } from 'react-native-paper';
import { ThemeContext } from '../context/themeContext';

export default function ThemeToggleButton() {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={{ color: colors.onSurface, marginRight: 8 }}>
        {isDark ? '🌙 Oscuro' : '☀️ Claro'}
      </Text>
      <Switch value={isDark} onValueChange={toggleTheme} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 20,
  },
});
