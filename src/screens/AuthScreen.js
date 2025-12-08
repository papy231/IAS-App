import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AuthScreen({ navigation }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  function validateAndSubmit() {
    setError('');
    if (!email) {
      setError('Please enter your email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }
    if (mode === 'register') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords don't match");
        return;
      }
      // TODO: call registration API
      navigation.replace('Welcome');
      return;
    }

    // TODO: call login API
    navigation.replace('Welcome');
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.centerScreen}>
          <View style={styles.avatarCircleLarge}>
            <Ionicons name="person" size={60} color="#8B5CF6" />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.title}>{mode === 'login' ? 'Login' : 'Create account'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {mode === 'register' && (
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.primaryButton} onPress={validateAndSubmit}>
              <Text style={styles.primaryButtonText}>{mode === 'login' ? 'Sign in' : 'Create account'}</Text>
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}</Text>
              <TouchableOpacity onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
                <Text style={styles.switchAction}>{mode === 'login' ? ' Register' : ' Sign in'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centerScreen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarCircleLarge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  formCard: {
    width: '90%',
    maxWidth: 420,
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  title: { fontSize: 22, color: '#111827', marginBottom: 12 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
    backgroundColor: '#F9FAFB',
  },
  primaryButton: {
    marginTop: 14,
    backgroundColor: '#4B5563',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  switchText: { color: '#6B7280' },
  switchAction: { color: '#8B5CF6', fontWeight: '600' },
  errorText: { color: '#DC2626', marginTop: 8 },
});
