import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { reportService } from '../services/reportServices';
import ScreenHeader from '../components/ScreenHeader';

// Categorías ampliadas (fallback si backend vacío)
const FALLBACK_CATEGORIES: CategoryItem[] = [
  { id: 1, label: 'Corrupción', icon: '💰' },
  { id: 2, label: 'Abuso de poder', icon: '⚖️' },
  { id: 3, label: 'Negligencia', icon: '⚠️' },
  { id: 4, label: 'Fraude', icon: '🏦' },
  { id: 5, label: 'Discriminación', icon: '👥' },
  { id: 6, label: 'Medio ambiente', icon: '🌱' },
  { id: 7, label: 'Acoso', icon: '🚫' },
  { id: 8, label: 'Seguridad', icon: '🛡️' },
  { id: 9, label: 'Salud', icon: '🩺' },
  { id: 10, label: 'Transparencia', icon: '🔍' },
];

const severities = [
  { id: 1, label: 'Baja',    color: '#16A34A', bg: '#DCFCE7' },
  { id: 2, label: 'Media',   color: '#CA8A04', bg: '#FEF9C3' },
  { id: 3, label: 'Alta',    color: '#DC2626', bg: '#FEE2E2' },
  { id: 4, label: 'Crítica', color: '#7F1D1D', bg: '#FECACA' },
];

interface CategoryItem { id: number; label: string; description?: string; icon: string; }

// Tipos para los datos del formulario
interface NewReport {
  description: string;
  category: string;
  location: string;
  severity: string;
}

// Opciones para los selectores
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

type SelectorType = 'category' | 'location' | 'severity';

interface NewReportScreenProps {
  onSubmitReport?: (report: NewReport) => void;
  onGoBack?: () => void;
}

const NewReportScreen: React.FC<NewReportScreenProps> = ({
  onSubmitReport,
  onGoBack,
}) => {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null); // fuerza selección explícita
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState('');
  const [gravedad, setGravedad] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [errorCategory, setErrorCategory] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [showSelector, setShowSelector] = useState<boolean>(false);
  const [currentSelector, setCurrentSelector] = useState<SelectorType>('category');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const raw = await reportService.getCategories();
        // Aceptar distintas claves: id, categoriaId, categoria_id
  let mapped: CategoryItem[] = (raw || []).map((c: any): CategoryItem => {
          const id =
            Number(c.id ?? c.categoriaId ?? c.categoria_id ?? c.CategoriaId ?? c.Categoria_id);
          const label =
            String(c.nombre ?? c.name ?? c.titulo ?? c.descripcion ?? 'Categoría').trim();
          return { id, label, icon: '📁' };
  }).filter((c: CategoryItem) => !Number.isNaN(c.id) && c.label.length);
        if (!mapped.length) {
          console.log('[categorias] usando fallback');
          mapped = FALLBACK_CATEGORIES;
        }
  setCategories(mapped);
  // ya no auto-seleccionar primera categoría
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Mostrar descripción debajo del selector cuando hay categoría elegida
  // (Reemplaza el bloque Category Selector existente por este)
  const renderCategorySelector = () => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>Categoría <Text style={styles.requiredAsterisk}>*</Text></Text>
      <TouchableOpacity
        style={[styles.selector, errorCategory && styles.selectorError]}
        onPress={() => openSelector('category')}
        disabled={sending}
      >
        <Text style={[styles.selectorText, !categoryId && styles.selectorPlaceholder]}>
          {categoryId ? getSelectedLabel('category', categoryId) : 'Selecciona categoría'}
        </Text>
        <Text style={styles.selectorArrow}>▼</Text>
      </TouchableOpacity>
      {errorCategory ? (
        <View style={[styles.inlineErrorBox, styles.inlineErrorCentered]}>
          <Text style={[styles.inlineErrorText, styles.inlineErrorTextCentered]}>{errorCategory}</Text>
        </View>
      ) : null}
      {categoryId && (() => {
        const cat = categories.find(c => c.id === categoryId);
        return cat?.description ? (
          <Text style={styles.categoryDescription}>{cat.description}</Text>
        ) : null;
      })()}
      {!loading && categories.length === 0 && (
        <Text style={{ marginTop: 6, fontSize: 12, color: '#64748B' }}>Sin categorías disponibles</Text>
      )}
    </View>
  );

  const openSelector = (type: SelectorType) => {
    setCurrentSelector(type);
    setShowSelector(true);
  };

  // Ajusta la función selector (value puede ser number o string)
  const handleSelectorSelect = (value: string | number) => {
    switch (currentSelector) {
      case 'category':
        setCategoryId(Number(value)); // convertir
        break;
      case 'location':
        setLocation(String(value));
        break;
      case 'severity':
        setGravedad(Number(value));
        break;
    }
    setShowSelector(false);
  };

  // Devuelve datasets con id (num) e icon (string opcional)
  const getSelectorData = () => {
    switch (currentSelector) {
      case 'category': return categories;
      case 'location': return LOCATIONS;
      case 'severity': return severities;
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

  const getSelectedLabel = (type: SelectorType, value: string | number) => {
    let data: any[] = [];
    switch (type) {
      case 'category': data = categories; break;
      case 'location': data = LOCATIONS; break;
      case 'severity': data = severities; break;
    }
    const item = data.find(it => String(it.id) === String(value));
    return item ? `${item.icon ? item.icon + ' ' : ''}${item.label}` : 'Seleccionar...';
  };

  const validate = () => {
    setError('');
    setErrorCategory('');
    if (!title.trim()) { setError('Título requerido'); return false; }
    if (!description.trim()) { setError('Descripción requerida'); return false; }
    if (categoryId == null) { setErrorCategory('Selecciona una categoría'); return false; }
    if (!location.trim()) { setError('Ubicación requerida'); return false; }
    if (gravedad < 1 || gravedad > 4) { setError('Selecciona gravedad'); return false; }
    return true;
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setGravedad(2);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSending(true);
    setSuccess('');
    try {
      await reportService.create({
        titulo: title.trim(),
        descripcion: description.trim(),
        categoriaId: categoryId,
        ubicacion: location.trim(),
        gravedad,
      });
      setSuccess('Denuncia creada');
      resetForm();
      setTimeout(() => setSuccess(''), 2500);
    } catch (e: any) {
      setError(e?.message || 'Error al crear la denuncia');
    } finally {
      setSending(false);
    }
  };

  // Selector item (item.id e item.icon existen en todos)
  const renderSelectorItem = ({ item }: { item: CategoryItem | any }) => (
    <TouchableOpacity
      style={styles.selectorItem}
      onPress={() => handleSelectorSelect(item.id)}
    >
      <Text style={styles.selectorItemIcon}>{item.icon || '📁'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.selectorItemText}>{item.label}</Text>
        {item.description ? (
          <Text style={styles.selectorItemDesc}>{item.description}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="SpeakUp" variant="brand">
        <Text style={styles.headerSubtitle}>Nueva denuncia</Text>
      </ScreenHeader>
      <View style={styles.bodyIntroRow}>
        <Text style={styles.bodyTitle}>Crear denuncia</Text>
        <Text style={styles.bodySubtitleCount}>Completa los campos obligatorios</Text>
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
            {/* Title Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Título
                <Text style={styles.requiredAsterisk}> *</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Título breve"
                placeholderTextColor="#6B7280"
                value={title}
                onChangeText={setTitle}
                editable={!sending}
              />
            </View>

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
                editable={!sending}
                maxLength={500}
              />
              <Text style={styles.characterCount}>
                {description.length}/500 caracteres
              </Text>
            </View>

            {/* Category Selector */}
            {renderCategorySelector()}

            {/* Location Selector */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Ubicación
                <Text style={styles.requiredAsterisk}> *</Text>
              </Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => openSelector('location')}
                disabled={sending}
              >
                <Text style={[
                  styles.selectorText,
                  !location && styles.selectorPlaceholder
                ]}>
                  {getSelectedLabel('location', location)}
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
              <View style={styles.severityRow}>
                {severities.map((s, idx) => {
                  const active = s.id === gravedad;
                  return (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => setGravedad(s.id)}
                      style={[
                        styles.severityButton,
                        idx === severities.length - 1 && { marginRight: 0 },
                        active && { backgroundColor: s.bg, borderColor: s.color }
                      ]}
                    >
                      <Text style={[styles.severityButtonText, active && { color: s.color }]}>
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Error/Success Message */}
            {error ? (
              <View style={[styles.inlineErrorBox, styles.inlineErrorCentered]}>
                <Text style={[styles.inlineErrorText, styles.inlineErrorTextCentered]}>{error}</Text>
              </View>
            ) : null}
            {success ? (
              <View style={[styles.inlineSuccessBox, styles.inlineErrorCentered]}>
                <Text style={[styles.inlineSuccessText, styles.inlineErrorTextCentered]}>{success}</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                sending && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={sending}
            >
              <Text style={styles.submitButtonText}>
                {sending ? 'Enviando...' : 'Crear denuncia'}
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
              keyExtractor={(item) => String(item.id)} // <- forzar string
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
  headerSubtitleBody: { fontSize:13, color:'#64748B', fontWeight:'500' },
  headerSubtitle: { fontSize:14, color:'#DBEAFE', fontWeight:'500', textAlign:'center' },
  bodyIntroRow: { paddingHorizontal:20, paddingTop:20, paddingBottom:4 },
  bodyTitle: { fontSize:22, fontWeight:'700', color:'#0F172A', letterSpacing:-0.5 },
  bodySubtitleCount: { marginTop:2, fontSize:12, color:'#64748B', fontWeight:'500' },
  // Removed old header styles (using ScreenHeader)
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
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    fontSize: 14,
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
  categoryDescription: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 16,
    color: '#475569',
  },
  selectorItemDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  error: { color: '#DC2626', marginTop: 14, textAlign: 'center', fontWeight: '500' },
  success: { color: '#16A34A', marginTop: 14, textAlign: 'center', fontWeight: '500' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  severityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  severityButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  severityButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  // Selector error highlight
  selectorError: {
    borderColor: '#FCA5A5',
  },
  // Inline feedback boxes (mirroring register/login styling consistency)
  inlineErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
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
  inlineSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    width: '100%',
    alignSelf: 'center',
  },
  inlineSuccessIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  inlineSuccessText: {
    flex: 1,
    color: '#166534',
    fontSize: 13,
    fontWeight: '600',
  },
  inlineErrorCentered: {
    justifyContent: 'center',
  },
  inlineErrorTextCentered: {
    textAlign: 'center',
  },
});

export default NewReportScreen;