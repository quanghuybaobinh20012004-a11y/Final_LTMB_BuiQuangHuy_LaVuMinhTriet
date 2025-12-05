// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../theme/ThemeProvider';

// 👇 Dùng trực tiếp Firebase Auth
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../services/firebase';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async () => {
    setError(null);
    setSubmitting(true);
    try {
      // ✅ GỌI TRỰC TIẾP FIREBASE, KHÔNG DÙNG signIn TỪ CONTEXT NỮA
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged trong AuthProvider sẽ tự cập nhật user
    } catch (e: any) {
      setError(
        e?.message ??
          'Đăng nhập thất bại, hãy kiểm tra lại tài khoản/mật khẩu.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Vui lòng nhập email để đặt lại mật khẩu.');
      return;
    }
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
      setError(
        'Đã gửi email đặt lại mật khẩu, vui lòng kiểm tra hộp thư.',
      );
    } catch (e: any) {
      setError(
        e?.message ??
          'Không gửi được email đặt lại mật khẩu, hãy thử lại sau.',
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          Đăng nhập
        </Text>

        {error && (
          <Text
            style={{
              color: 'red',
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            {error}
          </Text>
        )}

        <TextInput
          placeholder="Email"
          placeholderTextColor={colors.subtext}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={[
            styles.input,
            {
              borderColor: colors.outline,
              color: colors.text,
              backgroundColor: colors.bgSoft,
            },
          ]}
        />

        <TextInput
          placeholder="Mật khẩu"
          placeholderTextColor={colors.subtext}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={[
            styles.input,
            {
              borderColor: colors.outline,
              color: colors.text,
              backgroundColor: colors.bgSoft,
            },
          ]}
        />

        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: colors.primary }]}
          onPress={handleEmailLogin}
          disabled={submitting}
        >
          <Text
            style={[styles.loginText, { color: colors.onPrimary }]}
          >
            {submitting ? 'Đang đăng nhập…' : 'Đăng nhập'
            }
          </Text>
        </TouchableOpacity>

        {/* Quên mật khẩu */}
        <TouchableOpacity
          style={{ marginTop: 12, alignItems: 'center' }}
          onPress={handleForgotPassword}
        >
          <Text
            style={{ color: colors.primary, fontWeight: '700' }}
          >
            Quên mật khẩu?
          </Text>
        </TouchableOpacity>

        {/* Đăng ký */}
        <TouchableOpacity
          style={{ marginTop: 16, alignItems: 'center' }}
          onPress={() => navigation.navigate('Register' as never)}
        >
          <Text
            style={{ color: colors.primary, fontWeight: '700' }}
          >
            Chưa có tài khoản? Đăng ký
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    fontWeight: '800',
  },
});
