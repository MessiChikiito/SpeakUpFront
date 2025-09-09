import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';

// Tipos para las denuncias del usuario
interface UserReport {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'Pendiente' | 'Validado' | 'Rechazado' | 'En revisión';
  createdAt: string;
  updatedAt?: string;
}

interface MyReportsScreenProps {
  onCreateNewReport?: () => void;
  onReportPress?: (report: UserReport) => void;
  onGoBack?: () => void;
}

const { width } = Dimensions.get('window');

const MyReportsScreen: React.FC<MyReportsScreenProps> = ({
  onCreateNewReport,
  onReportPress,
  onGoBack,
}) => {
  const [reports, setReports] = useState<UserReport[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Datos de ejemplo para las denuncias del usuario
  const mockUserReports: UserReport[] = [
    {
      id: '1',
      title: 'Demora en trámites municipales',
      description: 'Los trámites de licencia están tardando más de 3 meses',
      category: 'negligence',
      location: 'municipal',
      severity: 'medium',
      status: 'Validado',
      createdAt: '2025-08-25',
    },
    {
      id: '2',
      title: 'Cobros irregulares en transporte',
      description: 'Conductores solicitan pagos extra no autorizados',
      category: 'fraud',
      location: 'transport',
      severity: 'high',
      status: 'En revisión',
      createdAt: '2025-08-20',
      updatedAt: '2025-08-22',
    },
    {
      id: '3',
      title: 'Falta de mantenimiento en parque público',
      description: 'Equipos deteriorados y áreas sin limpieza',
      category: 'negligence',
      location: 'park',
      severity: 'low',
      status: 'Pendiente',
      createdAt: '2025-08-15',
    },
    {
      id: '4',
      title: 'Discriminación en atención al público',
      description: 'Trato diferencial basado en apariencia física',
      category: 'discrimination',
      location: 'hospital',
      severity: 'high',
      status: 'Rechazado',
      createdAt: '2025-08-10',
      updatedAt: '2025-08-12',
    },
  ];

  useEffect(() => {
    // Simular carga inicial de datos
    setTimeout(() => {
      setReports(mockUserReports);
      setIsLoading(false);
    }, 1000);
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    // Simular recarga de datos
    setTimeout(() => {
      setReports([...mockUserReports]);
      setIsRefreshing(false);
    }, 1000);
  };

  const handleReportPress = (report: UserReport) => {
    if (onReportPress) {
      onReportPress(report);
    } else {
      Alert.alert(
        'Detalles de denuncia',
        `Título: ${report.title}\nEstado: ${report.status}\nFecha: ${report.createdAt}`
      );
    }
  };

  const handleCreateNew = () => {
    if (onCreateNewReport) {
      onCreateNewReport();
    } else {
      Alert.alert('Nueva denuncia', 'Abrir pantalla de nueva denuncia');
    }
  };

  const getStatusColor = (status: UserReport['status']): string => {
    switch (status) {
      case 'Validado': return '#10B981';
      case 'Pendiente': return '#F59E0B';
      case 'En revisión': return '#3B82F6';
      case 'Rechazado': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getSeverityColor = (severity: UserReport['severity']): string => {
    switch (severity) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'critical': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getSeverityLabel = (severity: UserReport['severity']): string => {
    switch (severity) {
      case 'low': return 'Baja';
      case 'medium': return 'Media';
      case 'high': return 'Alta';
      case 'critical': return 'Crítica';
      default: return 'N/A';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderReportCard = ({ item }: { item: UserReport }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() => handleReportPress(item)}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportStatusContainer}>
          <View style={[
            styles.statusDot,
            { backgroundColor: getStatusColor(item.status) }
          ]} />
          <Text style={[
            styles.statusText,
            { color: getStatusColor(item.status) }
          ]}>
            {item.status}
          </Text>
        </View>
        
        <View style={styles.reportMeta}>
          <Text style={styles.reportDate}>{formatDate(item.createdAt)}</Text>
          <View style={[
            styles.severityBadge,
            { backgroundColor: getSeverityColor(item.severity) }
          ]}>
            <Text style={styles.severityText}>
              {getSeverityLabel(item.severity)}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.reportTitle} numberOfLines={2}>
        {item.title}
      </Text>

      <Text style={styles.reportDescription} numberOfLines={2}>
        {item.description}
      </Text>

      {item.updatedAt && (
        <Text style={styles.lastUpdate}>
          Actualizado: {formatDate(item.updatedAt)}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyTitle}>No tienes denuncias aún</Text>
      <Text style={styles.emptySubtitle}>
        Comienza creando tu primera denuncia anónima
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={handleCreateNew}
      >
        <Text style={styles.emptyButtonText}>Crear primera denuncia</Text>
      </TouchableOpacity>
    </View>
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
        <Text style={styles.headerTitle}>Mis Denuncias</Text>
        <View style={styles.headerSpace} />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{reports.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {reports.filter(r => r.status === 'Validado').length}
          </Text>
          <Text style={styles.statLabel}>Validadas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {reports.filter(r => r.status === 'Pendiente').length}
          </Text>
          <Text style={styles.statLabel}>Pendientes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {reports.filter(r => r.status === 'En revisión').length}
          </Text>
          <Text style={styles.statLabel}>En revisión</Text>
        </View>
      </View>

      {/* Reports List */}
      <FlatList
        data={reports}
        renderItem={renderReportCard}
        keyExtractor={(item) => item.id}
        style={styles.reportsList}
        contentContainerStyle={[
          styles.reportsListContent,
          reports.length === 0 && styles.emptyListContent
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={['#3B82F6']}
          />
        }
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateNew}
      >
        <Text style={styles.fabIcon}>✚</Text>
      </TouchableOpacity>
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  reportsList: {
    flex: 1,
  },
  reportsListContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100, // Espacio para el FAB
  },
  emptyListContent: {
    flexGrow: 1,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reportStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reportMeta: {
    alignItems: 'flex-end',
  },
  reportDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 6,
  },
  reportDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  lastUpdate: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});

export default MyReportsScreen;