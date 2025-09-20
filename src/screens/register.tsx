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
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../services/authServices';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

const RegisterScreen: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [apiError, setApiError] = useState<string>('');
  const navigation = useNavigation();

  const validateFields = () => {
    const newErrors: {[key: string]: string} = {};

    if (!username.trim()) {
      newErrors.username = 'Por favor ingresa un nombre de usuario';
    } else if (username.trim().length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    if (!email.trim()) {
      newErrors.email = 'Por favor ingresa un correo electrónico';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    if (!password) {
      newErrors.password = 'Por favor ingresa una contraseña';
    } else if (!passwordRegex.test(password)) {
      newErrors.password = 'Debe tener mínimo 6 caracteres, una mayúscula, una minúscula y un número';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateFields()) return;
    setApiError('');
    setIsLoading(true);
    try {
      const result: any = await authService.registerUser({
        username: username.trim(),
        email: email.trim(),
        password: password.trim(),
      });
      if (result.user) {
        setShowSuccess(true);
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowSuccess(false);
          navigation.navigate('Login' as never);
        }, 7000);
      } else {
  setApiError(result.error || 'Error en el registro');
      }
    } catch (error:any) {
      console.log('[register.catch] error object:', error);
      const rawMsg = (error && error.message) ? error.message : 'Error al crear la cuenta';
      const code = error && error.code ? error.code : undefined;
      if (code === 'DUPLICATE') {
        // Mensaje ya viene normalizado desde el servicio
        setApiError(rawMsg);
        return;
      }
  if (/usuario.*ya existe/i.test(rawMsg)) setApiError('El usuario ya existe');
  else if (/correo.*ya está/i.test(rawMsg)) setApiError('El correo ya está registrado');
  else if (/correo.*existe/i.test(rawMsg)) setApiError('El correo ya está registrado');
  else if (/existe|registrado/i.test(rawMsg)) setApiError('El usuario o correo ya existe');
  else if (/conectar/i.test(rawMsg)) setApiError(rawMsg);
  else if (/registrar.*usuario/i.test(rawMsg)) setApiError('El usuario o correo ya existe');
  else setApiError(rawMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} testID="register-screen">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Registro rápido y anónimo</Text>
          </View>
          <View style={styles.warningContainer}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              Tus datos no se mostrarán públicamente. No compartas información sensible.
            </Text>
          </View>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre de usuario</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Ej: Usuario123"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading && !showSuccess}
                maxLength={20}
                testID="register-username"
                accessibilityLabel="Campo de nombre de usuario"
              />
              <Text style={styles.inputHelper}>
                Mínimo 3 caracteres, máximo 20
              </Text>
              {errors.username ? (
                <Text style={styles.errorText}>{errors.username}</Text>
              ) : null}
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Ej: usuario@email.com"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading && !showSuccess}
                keyboardType="email-address"
                maxLength={50}
                testID="register-email"
                accessibilityLabel="Campo de correo"
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Contraseña"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading && !showSuccess}
                  maxLength={50}
                  testID="register-password"
                  accessibilityLabel="Campo de contraseña"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ marginLeft: 8, width: 60, alignItems: 'center' }}
                  testID="register-toggle-password"
                  accessibilityRole="button"
                >
                  <Text style={{ fontSize: 14, color: '#3B82F6', fontWeight: '500' }}>
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.inputHelper}>
                Mínimo 6 caracteres, una mayúscula, una minúscula y un número.
              </Text>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirmar contraseña</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repite la contraseña"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading && !showSuccess}
                  maxLength={50}
                  testID="register-confirm-password"
                  accessibilityLabel="Campo de confirmación de contraseña"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ marginLeft: 8, width: 60, alignItems: 'center' }}
                  testID="register-toggle-confirm-password"
                  accessibilityRole="button"
                >
                  <Text style={{ fontSize: 14, color: '#3B82F6', fontWeight: '500' }}>
                    {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
            </View>

            {apiError ? (
              <View style={styles.inlineErrorBox} testID="register-error-box">
                <Text style={styles.inlineErrorIcon}>❌</Text>
                <Text style={styles.inlineErrorText}>{apiError}</Text>
              </View>
            ) : null}

            {showSuccess && (
              <>
                <View style={styles.successContainer} testID="register-success-box">
                  <Text style={styles.successTitle}>¡Registro exitoso!</Text>
                  <Text style={styles.successText}>Tu cuenta ha sido creada correctamente.</Text>
                </View>
                <View style={styles.redirectContainer}>
                  <Text style={styles.redirectText}>Redirigiendo a la pantalla de inicio de sesión...</Text>
                </View>
              </>
            )}

            <TouchableOpacity
              style={[
                styles.registerButton,
                (isLoading || showSuccess) && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isLoading || showSuccess}
              testID="register-submit"
              accessibilityRole="button"
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? 'Registrando...' : 'Registrarse'}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>¿Ya tienes una cuenta? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login' as never)}
                testID="register-go-to-login"
                accessibilityRole="button"
              >
                <Text style={styles.loginLinkButton}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
    maxWidth: 380,
    alignSelf: 'center',
  },
  warningIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    fontWeight: '500',
  },
  form: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  optionalText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1F2937',
  },
  inputHelper: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  registerButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#10B981',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#10B981',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  registerButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    backgroundColor: '#D1FAE5',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  successTitle: {
    color: '#065F46',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6,
  },
  successText: {
    color: '#065F46',
    fontSize: 15,
    marginBottom: 4,
  },
  successRedirect: { }, // deprecated (mantained if referenced elsewhere)
  redirectContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  redirectText: {
    color: '#1D4ED8',
    fontSize: 13,
    fontStyle: 'italic',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLinkButton: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  inlineErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    width: '100%',
    alignSelf: 'center',
  },
  inlineErrorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  inlineErrorText: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default RegisterScreen;