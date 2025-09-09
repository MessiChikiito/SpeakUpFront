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
  Modal,
  FlatList,
} from 'react-native';

// Tipos para los datos del formulario
interface NewReport {
  description: string;
  category: string;
  location: string;
  severity: string;
}

// Opciones para los selectores
const CATEGORIES = [
  { id: 'corruption', label: 'Corrupción', icon: '💰' },
  { id: 'abuse', label: 'Abuso de poder', icon: '⚖️' },
  { id: 'negligence', label: 'Negligencia', icon: '⚠️' },
  { id: 'fraud', label: 'Fraude', icon: '🏦' },
  { id: 'discrimination', label: 'Discriminación', icon: '👥' },
  { id: 'environment', label: 'Medio ambiente', icon: '🌱' },
  { id: 'others', label: 'Otros', icon: '📋' },
];

const LOCATIONS = [
  { id: 'municipal', label: 'Oficina municipal', icon: '🏛️' },
  { id: 'hospital', label: 'Hospital/Centro de salud', icon: '🏥' },
  { id: 'school', label: 'Institución educativa', icon: '🏫' },
  { id: 'police', label: 'Comisaría/Policía', icon: '👮' },
  { id: 'transport', label: 'Transporte público', icon: '🚌' },
  { id: 'construction', label: 'Obra pública', icon: '🏗️' },
  { id: 'park', label: 'Espacio público', icon: '🏞️' },
  { id: 'online', label: 'Trámite en línea', icon: '💻' },
  { id: 'others', label: 'Otro lugar', icon: '📍' },
];

const SEVERITY_LEVELS = [
  { id: 'low', label: 'Baja', color: '#10B981', icon: '🟢' },
  { id: 'medium', label: 'Media', color: '#F59E0B', icon: '🟡' },
  { id: 'high', label: 'Alta', color: '#EF4444', icon: '🔴' },
  { id: 'critical', label: 'Crítica', color: '#DC2626', icon: '🚨' },
];

type SelectorType = 'category' | 'location' | 'severity';

interface NewReportScreenProps {
  onSubmitReport?: (report: NewReport) => void;
  onGoBack?: () => void;
}

const NewReportScreen: React.FC<NewReportScreenProps> = ({
  onSubmitReport,
  onGoBack,
}) => {
  const [description, setDescription] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Modal states
  const [showSelector, setShowSelector] = useState<boolean>(false);
  const [currentSelector, setCurrentSelector] = useState<SelectorType>('category');

  const openSelector = (type: SelectorType) => {
    setCurrentSelector(type);
    setShowSelector(true);
  };

  const handleSelectorSelect = (value: string) => {
    switch (currentSelector) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'location':
        setSelectedLocation(value);
        break;
      case 'severity':
        setSelectedSeverity(value);
        break;
    }
    setShowSelector(false);
  };

  const getSelectorData = () => {
    switch (currentSelector) {
      case 'category': return CATEGORIES;
      case 'location': return LOCATIONS;
      case 'severity': return SEVERITY_LEVELS;
      default: return [];
    }
  };

  const getSelectorTitle = () => {
    switch (currentSelector) {
      case 'category': return 'Seleccionar categoría';
      case 'location': return 'Seleccionar ubicación';
      case 'severity': return 'Seleccionar gravedad';
      default: return 'Seleccionar';
    }
  };

  const getSelectedLabel = (type: SelectorType, value: string) => {
    let data;
    switch (type) {
      case 'category': data = CATEGORIES; break;
      case 'location': data = LOCATIONS; break;
      case 'severity': data = SEVERITY_LEVELS; break;
    }
    const item = data.find(item => item.id === value);
    return item ? `${item.icon} ${item.label}` : 'Seleccionar...';
  };

  const validateForm = (): boolean => {
    if (!description.trim()) {
      Alert.alert('Error', 'Por favor describe la situación');
      return false;
    }
    if (description.trim().length < 20) {
      Alert.alert('Error', 'La descripción debe tener al menos 20 caracteres');
      return false;
    }
    if (!selectedCategory) {
      Alert.alert('Error', 'Por favor selecciona una categoría');
      return false;
    }
    if (!selectedLocation) {
      Alert.alert('Error', 'Por favor selecciona la ubicación');
      return false;
    }
    if (!selectedSeverity) {
      Alert.alert('Error', 'Por favor selecciona el nivel de gravedad');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const newReport: NewReport = {
        description: description.trim(),
        category: selectedCategory,
        location: selectedLocation,
        severity: selectedSeverity,
      };

      if (onSubmitReport) {
        onSubmitReport(newReport);
      } else {
        console.log('New report submitted:', newReport);
        Alert.alert(
          'Denuncia enviada',
          'Tu denuncia ha sido registrada de forma anónima y será revisada.',
          [
            {
              text: 'Continuar',
              onPress: () => {
                // Limpiar formulario
                setDescription('');
                setSelectedCategory('');
                setSelectedLocation('');
                setSelectedSeverity('');
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la denuncia. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSelectorItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.selectorItem}
      onPress={() => handleSelectorSelect(item.id)}
    >
      <Text style={styles.selectorItemIcon}>{item.icon}</Text>
      <Text style={styles.selectorItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onGoBack}
        >
          <Text style={styles.backButtonText}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva Denuncia</Text>
        <View style={styles.headerSpace} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Warning Message */}
          <View style={styles.warningContainer}>
            <Text style={styles.warningIcon}>🔐</Text>
            <Text style={styles.warningText}>
              No se guardarán tus datos personales
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Description Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Descripción de la situación
                <Text style={styles.requiredAsterisk}> *</Text>
              </Text>
              <TextInput
                style={styles.textArea}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe detalladamente la situación que quieres denunciar..."
                placeholderTextColor="#9CA3AF"
                multiline={true}
                numberOfLines={5}
                textAlignVertical="top"
                editable={!isLoading}
                maxLength={500}
              />
              <Text style={styles.characterCount}>
                {description.length}/500 caracteres
              </Text>
            </View>

            {/* Category Selector */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Categoría
                <Text style={styles.requiredAsterisk}> *</Text>
              </Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => openSelector('category')}
                disabled={isLoading}
              >
                <Text style={[
                  styles.selectorText,
                  !selectedCategory && styles.selectorPlaceholder
                ]}>
                  {getSelectedLabel('category', selectedCategory)}
                </Text>
                <Text style={styles.selectorArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Location Selector */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Ubicación
                <Text style={styles.requiredAsterisk}> *</Text>
              </Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => openSelector('location')}
                disabled={isLoading}
              >
                <Text style={[
                  styles.selectorText,
                  !selectedLocation && styles.selectorPlaceholder
                ]}>
                  {getSelectedLabel('location', selectedLocation)}
                </Text>
                <Text style={styles.selectorArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Severity Selector */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Nivel de gravedad
                <Text style={styles.requiredAsterisk}> *</Text>
              </Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => openSelector('severity')}
                disabled={isLoading}
              >
                <Text style={[
                  styles.selectorText,
                  !selectedSeverity && styles.selectorPlaceholder
                ]}>
                  {getSelectedLabel('severity', selectedSeverity)}
                </Text>
                <Text style={styles.selectorArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Enviando...' : 'Enviar denuncia'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Selector Modal */}
      <Modal
        visible={showSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{getSelectorTitle()}</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowSelector(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={getSelectorData()}
              renderItem={renderSelectorItem}
              keyExtractor={(item) => item.id}
              style={styles.selectorList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSpace: {
    width: 60,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: '#EF4444',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 120,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  selector: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectorText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  selectorPlaceholder: {
    color: '#9CA3AF',
  },
  selectorArrow: {
    fontSize: 14,
    color: '#6B7280',
  },
  submitButton: {
    width: '100%',
    height: 54,
    backgroundColor: '#EF4444', // Rojo
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  selectorList: {
    paddingHorizontal: 20,
  },
  selectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectorItemIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  selectorItemText: {
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
});

export default NewReportScreen;