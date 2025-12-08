import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerScreen}>
        <View style={styles.avatarCircleLarge}>
          <Ionicons name="person" size={60} color="#8B5CF6" />
        </View>

        <TouchableOpacity
          style={styles.loginPill}
          onPress={() => navigation.navigate('Welcome')}
        >
          <Text style={styles.loginPillTextLeft}>Login</Text>
          <Text style={styles.loginPillTextRight}>example@mail.com</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircleLarge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  loginPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  loginPillTextLeft: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  loginPillTextRight: {
    fontSize: 14,
    color: '#111827',
  },
  linkText: {
    fontSize: 15,
    color: '#6B7280',
  },
});
