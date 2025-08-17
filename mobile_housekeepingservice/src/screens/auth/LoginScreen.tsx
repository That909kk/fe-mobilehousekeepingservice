import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Select } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { useStaticData } from '../../hooks/useStaticData';
import { COLORS, UI, VALIDATION } from '../../constants';
import type { RootStackParamList, UserRole } from '../../types/auth';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: '' as UserRole | '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, loading, error } = useAuth();
  const { data: staticData } = useStaticData('login');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username.trim()) {
      newErrors.username = staticData?.messages?.validation?.username_required || 'Username is required';
    } else if (formData.username.length < VALIDATION.USERNAME_MIN_LENGTH) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.password) {
      newErrors.password = staticData?.messages?.validation?.password_required || 'Password is required';
    } else if (formData.password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      newErrors.password = staticData?.messages?.validation?.password_min_length || 'Password must be at least 6 characters';
    }
    
    if (!formData.role) {
      newErrors.role = staticData?.messages?.validation?.role_required || 'Role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await login({
        username: formData.username.trim(),
        password: formData.password,
        role: formData.role as UserRole,
        deviceType: 'MOBILE',
      });
      
      Alert.alert(
        'Thành công',
        staticData?.messages?.login_success || 'Login successful!',
        [{ text: 'OK' }]
      );
    } catch (err: any) {
      Alert.alert(
        'Lỗi',
        err.message || staticData?.messages?.login_error || 'Login failed',
        [{ text: 'OK' }]
      );
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const roleOptions = staticData?.form?.role?.options ? [
    { label: staticData.form.role.options.customer, value: 'CUSTOMER' },
    { label: staticData.form.role.options.employee, value: 'EMPLOYEE' },
    { label: staticData.form.role.options.admin, value: 'ADMIN' },
  ] : [
    { label: 'Customer', value: 'CUSTOMER' },
    { label: 'Employee', value: 'EMPLOYEE' },
    { label: 'Admin', value: 'ADMIN' },
  ];

  if (!staticData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={COLORS.gradient.service as [string, string]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header with Logo and Service Info */}
            <View style={styles.headerContainer}>
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Ionicons name="home" size={40} color={COLORS.primary} />
                </View>
                <Text style={styles.brandName}>CleanHome</Text>
                <Text style={styles.brandTagline}>Dịch vụ giúp việc gia đình chuyên nghiệp</Text>
              </View>
              
              <View style={styles.welcomeContainer}>
                <Text style={styles.title}>{staticData.title}</Text>
                <Text style={styles.subtitle}>{staticData.subtitle}</Text>
              </View>
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <View style={styles.formCard}>
                <Select
                  label={staticData.form.role.label}
                  value={formData.role}
                  options={roleOptions}
                  onSelect={(value) => handleInputChange('role', value)}
                  error={errors.role}
                  placeholder={staticData.form.role.label}
                />

                <Input
                  label={staticData.form.username.label}
                  value={formData.username}
                  onChangeText={(value) => handleInputChange('username', value)}
                  placeholder={staticData.form.username.placeholder}
                  autoCapitalize="none"
                  error={errors.username}
                  leftIcon="person"
                />

                <Input
                  label={staticData.form.password.label}
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  placeholder={staticData.form.password.placeholder}
                  secureTextEntry
                  error={errors.password}
                  leftIcon="lock-closed"
                />

                {error && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <Button
                  title={loading ? staticData.actions.logging_in : staticData.actions.login}
                  onPress={handleLogin}
                  loading={loading}
                  gradient={true}
                  fullWidth
                  size="large"
                />

                <Button
                  title={staticData.actions.forgot_password}
                  onPress={() => navigation.navigate('ForgotPassword')}
                  variant="ghost"
                  fullWidth
                />
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                {staticData.messages.no_account}
              </Text>
              <Button
                title={staticData.messages.register_link}
                onPress={() => navigation.navigate('Register')}
                variant="outline"
                size="medium"
              />
            </View>

            {/* Service Features */}
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
                <Text style={styles.featureText}>Tin cậy & An toàn</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="time" size={24} color={COLORS.primary} />
                <Text style={styles.featureText}>Đúng giờ</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="star" size={24} color={COLORS.primary} />
                <Text style={styles.featureText}>Chất lượng cao</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: UI.SCREEN_PADDING,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  brandName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  brandTagline: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 24,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: UI.BORDER_RADIUS.large,
    padding: 24,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: UI.BORDER_RADIUS.medium,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  footerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
});
