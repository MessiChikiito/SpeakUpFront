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
} from 'react-native';

// Tipos para las denuncias
interface Report {
  id: string;
  title: string;
  category: 'Corrupción' | 'Abuso' | 'Negligencia' | 'Fraude' | 'Otros';
  validationStatus: 'Pendiente' | 'Validado' | 'Rechazado' | 'En revisión';
  createdAt: string;
  description?: string;
}

// Tipo para los tabs
type TabType = 'home' | 'new-report' | 'my-reports' | 'ranking';

interface HomeScreenProps {
  onTabPress?: (tab: TabType) => void;
  onReportPress?: (report: Report) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  onTabPress,
  onReportPress,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [reports, setReports] = useState<Report[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Datos de ejemplo para las denuncias
  const mockReports: Report[] = [
    {
      id: '1',
      title: 'Mal uso de fondos públicos en obra municipal',
      category: 'Corrupción',
      validationStatus: 'Validado',
      createdAt: '2025-08-28',
      description: 'Irregularidades detectadas en construcción'
    },
    {
      id: '2',
      title: 'Discriminación en oficina de atención ciudadana',
      category: 'Abuso',
      validationStatus: 'En revisión',
      createdAt: '2025-08-27',
    },
    {
      id: '3',
      title: 'Demora excesiva en trámites de licencias',
      category: 'Negligencia',
      validationStatus: 'Pendiente',
      createdAt: '2025-08-26',
    },
    {
      id: '4',
      title: 'Sobrefacturación en contrato de limpieza',
      category: 'Fraude',
      validationStatus: 'Validado',
      createdAt: '2025-08-25',
    },
    {
      id: '5',
      title: 'Falta de transparencia en licitación',
      category: 'Corrupción',
      validationStatus: 'Rechazado',
      createdAt: '2025-08-24',
    },
  ];

  useEffect(() => {
    // Simular carga de datos
    setReports(mockReports);
  }, []);

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
    if (onTabPress) {
      onTabPress(tab);
    } else {
      // Comportamiento por defecto
      Alert.alert('Navegación', `Navegar a: ${getTabTitle(tab)}`);
    }
  };

  const handleReportPress = (report: Report) => {
    if (onReportPress) {
      onReportPress(report);
    } else {
      Alert.alert('Denuncia', `Ver detalles: ${report.title}`);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    // Simular recarga de datos
    setTimeout(() => {
      setReports([...mockReports]);
      setIsRefreshing(false);
    }, 1000);
  };

  const getTabTitle = (tab: TabType): string => {
    switch (tab) {
      case 'home': return 'Inicio';
      case 'new-report': return 'Nueva denuncia';
      case 'my-reports': return 'Mis denuncias';
      case 'ranking': return 'Ranking';
      default: return '';
    }
  };

  const getStatusColor = (status: Report['validationStatus']): string => {
    switch (status) {
      case 'Validado': return '#10B981';
      case 'Pendiente': return '#F59E0B';
      case 'En revisión': return '#3B82F6';
      case 'Rechazado': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getCategoryColor = (category: Report['category']): string => {
    switch (category) {
      case 'Corrupción': return '#EF4444';
      case 'Abuso': return '#F59E0B';
      case 'Negligencia': return '#3B82F6';
      case 'Fraude': return '#8B5CF6';
      case 'Otros': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const renderReportItem = ({ item }: { item: Report }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() => handleReportPress(item)}
    >
      <View style={styles.reportHeader}>
        <View style={styles.reportTags}>
          <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(item.category) }]}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <View style={[styles.statusTag, { backgroundColor: getStatusColor(item.validationStatus) }]}>
            <Text style={styles.statusText}>{item.validationStatus}</Text>
          </View>
        </View>
        <Text style={styles.reportDate}>{item.createdAt}</Text>
      </View>
      
      <Text style={styles.reportTitle} numberOfLines={2}>
        {item.title}
      </Text>
      
      {item.description && (
        <Text style={styles.reportDescription} numberOfLines={1}>
          {item.description}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SpeakUp</Text>
        <Text style={styles.headerSubtitle}>Denuncias ciudadanas</Text>
      </View>

      {/* Content Area */}
      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Denuncias Recientes</Text>
          <Text style={styles.sectionSubtitle}>
            {reports.length} denuncias publicadas
          </Text>
        </View>

        <FlatList
          data={reports}
          renderItem={renderReportItem}
          keyExtractor={(item) => item.id}
          style={styles.reportsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
          contentContainerStyle={styles.reportsListContent}
        />
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'home' && styles.activeTab]}
          onPress={() => handleTabPress('home')}
        >
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={[
            styles.tabText,
            activeTab === 'home' && styles.activeTabText
          ]}>
            Inicio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'new-report' && styles.activeTab]}
          onPress={() => handleTabPress('new-report')}
        >
          <Text style={styles.tabIcon}>➕</Text>
          <Text style={[
            styles.tabText,
            activeTab === 'new-report' && styles.activeTabText
          ]}>
            Nueva denuncia
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-reports' && styles.activeTab]}
          onPress={() => handleTabPress('my-reports')}
        >
          <Text style={styles.tabIcon}>📋</Text>
          <Text style={[
            styles.tabText,
            activeTab === 'my-reports' && styles.activeTabText
          ]}>
            Mis denuncias
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'ranking' && styles.activeTab]}
          onPress={() => handleTabPress('ranking')}
        >
          <Text style={styles.tabIcon}>🏆</Text>
          <Text style={[
            styles.tabText,
            activeTab === 'ranking' && styles.activeTabText
          ]}>
            Ranking
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#DBEAFE',
    marginTop: 2,
  },
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  reportsList: {
    flex: 1,
  },
  reportsListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
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
  reportTags: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 8,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  reportDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#EBF4FF',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});

export default HomeScreen;