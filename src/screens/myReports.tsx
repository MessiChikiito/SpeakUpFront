import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import { reportService } from '../services/reportServices';
import ScreenHeader from '../components/ScreenHeader';
import { getLocationLabel } from '../constants/ui';
import { useAuth } from '../hooks/useAuth';

// Tipos para las denuncias del usuario
interface UserReport {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryId?: number;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical'; // backend numeric -> mapped
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

const MyReportsScreen: React.FC<MyReportsScreenProps & { navigation?: any }> = ({
  navigation,
  onCreateNewReport,
  onReportPress,
  onGoBack,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [reports, setReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const mapBackend = (arr: any[]): UserReport[] => {
    if (!Array.isArray(arr)) return [];
    return arr.map(r => {
      const gravedadNum = Number(r.gravedad) || 1;
      const sev = gravedadNum >=4 ? 'critical' : gravedadNum ===3 ? 'high' : gravedadNum ===2 ? 'medium' : 'low';
      const estadoRaw = (r.estado || '').toLowerCase();
      let estadoMap: UserReport['status'];
      switch (estadoRaw) {
        case 'validada':
        case 'validado':
          estadoMap = 'Validado'; break;
        case 'rechazada':
        case 'rechazado':
          estadoMap = 'Rechazado'; break;
        case 'revision':
        case 'en_revision':
          estadoMap = 'En revisión'; break;
        default:
          estadoMap = 'Pendiente';
      }
      return {
        id: String(r.id),
        title: r.titulo || r.title || '(Sin título)',
        description: r.descripcion || r.description || '',
        category: r.categoriaNombre || r.categoria?.nombre || (r.categoriaId ? `Categoría N° ${r.categoriaId}` : '—'),
        categoryId: r.categoriaId ? Number(r.categoriaId) : undefined,
  location: getLocationLabel(r.ubicacion || r.location) || '—',
        severity: sev as UserReport['severity'],
        status: estadoMap,
        createdAt: r.createdAt || r.fechaCreacion || new Date().toISOString(),
        updatedAt: r.updatedAt || r.fechaActualizacion
      };
    });
  };

  const load = useCallback(async () => {
    if (!isAuthenticated) return;
    setError('');
    try {
      if (!isRefreshing) setIsLoading(true);
      const [data, cats] = await Promise.all([
        reportService.listMine(),
        reportService.getCategories()
      ]);
      const catsById = Array.isArray(cats) ? Object.fromEntries(cats.map((c:any)=>[String(c.id), c.nombre || c.name])) : {};
      const mapped = mapBackend(data).map(r => {
        if (r.categoryId && catsById[String(r.categoryId)]) {
          return { ...r, category: catsById[String(r.categoryId)] };
        }
        return r;
      });
      setReports(mapped);
    } catch (e: any) {
      setError(e?.message || 'Error al cargar');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated]);

  // (debug removido)

  // Refresca cada vez que la pestaña gana foco
  // Cargar al enfocar evitando ráfagas múltiples
  const lastFocusLoadRef = useRef(0);
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (now - lastFocusLoadRef.current < 500) {
        return; // ignora foco duplicado rápido
      }
      lastFocusLoadRef.current = now;
      load();
    }, [load])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    load();
  };

  const handleCreateNew = () => {
    if (onCreateNewReport) {
      onCreateNewReport();
    } else {
      // Si tienes tab “Nueva denuncia”, navega allí:
      navigation?.navigate?.('Nueva denuncia');
    }
  };

  const handlePressReport = (report: UserReport) => {
    if (onReportPress) onReportPress(report);
  else navigation?.navigate?.('ReportDetail', { id: report.id });
  };

  // Mostrar loading mientras esperamos user (opcional)
  if (!user && isLoading) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator color="#3B82F6" />
        <Text style={{ marginTop: 8, color:'#64748B' }}>Cargando usuario...</Text>
      </View>
    );
  }

  if (isLoading && !isRefreshing) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator color="#3B82F6" />
        {error ? <Text style={{ marginTop:12, color:'#DC2626' }}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <ScreenHeader title="SpeakUp" variant="brand"> 
        <Text style={styles.headerSubtitle}>Mis denuncias</Text>
      </ScreenHeader>

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

      {/* Body intro (titulo dentro del body + conteo) */}
      <View style={styles.bodyIntroRow}>
        <Text style={styles.bodyTitle}>Mis denuncias</Text>
        <Text style={styles.bodySubtitleCount}>{reports.length} en total</Text>
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        style={styles.reportsList}
        contentContainerStyle={[styles.reportsListContent, reports.length === 0 && styles.emptyListContent]}
        ListEmptyComponent={
          <View style={{ padding:32, alignItems:'center' }}>
            <Text style={{ color:'#64748B', marginBottom:6 }}>No tienes denuncias todavía.</Text>
            {error ? <Text style={{ color:'#DC2626', fontSize:12 }}>Error: {error}</Text> : null}
            {!error && !isLoading ? <Text style={{ color:'#94A3B8', fontSize:11 }}>Debug: lista vacía (raw logs en consola)</Text> : null}
          </View>
        }
        renderItem={({ item }) => {
          const statusColors: Record<UserReport['status'], {bg:string;color:string}> = {
            'Pendiente': { bg:'#FDE68A', color:'#92400E' }, // amarillo
            'Validado': { bg:'#BBF7D0', color:'#065F46' }, // verde
            'Rechazado': { bg:'#FECACA', color:'#7F1D1D' }, // rojo
            'En revisión': { bg:'#DBEAFE', color:'#1E3A8A' }, // azul
          };
          const sevMap: Record<UserReport['severity'], string> = {
            low: 'Baja',
            medium: 'Media',
            high: 'Alta',
            critical: 'Crítica'
          };
          const st = statusColors[item.status];
          const severityLevel = item.severity; // 'low' | 'medium' | 'high' | 'critical'
          const levelIndex = { low:1, medium:2, high:3, critical:4 }[severityLevel];
          const segmentColors = ['#E2E8F0', '#E2E8F0', '#E2E8F0', '#E2E8F0'];
          const activePalette = ['#4ADE80', '#FACC15', '#F87171', '#7F1D1D'];
          for (let i=0;i<levelIndex;i++) segmentColors[i] = activePalette[i];
          return (
            <TouchableOpacity
              onPress={() => handlePressReport(item)}
              style={{
                padding:16,
                borderBottomWidth:1,
                borderColor:'#E2E8F0',
                backgroundColor:'#FFF'
              }}
            >
              <Text style={{ fontWeight:'600', color:'#0F172A' }}>{item.title}</Text>
              <Text
                numberOfLines={2}
                style={{ marginTop:4, fontSize:12, color:'#475569' }}
              >
                {item.description}
              </Text>
              <View style={{ marginTop:12, gap:8 }}>
                <View style={{ flexDirection:'row', flexWrap:'wrap', gap:8, alignItems:'center' }}>
                  <Text style={{ fontSize:11, color:'#334155' }}>{item.category}</Text>
                  <View style={{ backgroundColor: st.bg, paddingHorizontal:8, paddingVertical:2, borderRadius:8 }}>
                    <Text style={{ fontSize:10, fontWeight:'600', color: st.color }}>{item.status}</Text>
                  </View>
                </View>
                {/* Barra de gravedad */}
                <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
                  <View style={{ flexDirection:'row', width:'25%', minWidth:100, height:10, borderRadius:6, overflow:'hidden', backgroundColor:'#E2E8F0' }}>
                    {segmentColors.map((c,idx) => (
                      <View key={idx} style={{ flex:1, backgroundColor:c, marginRight: idx<3 ? 2 : 0, borderRadius:4 }} />
                    ))}
                  </View>
                  <Text style={{ fontSize:10, color:'#475569', width:50, textAlign:'right' }}>{sevMap[item.severity]}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

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
  // Removed old header styles (using ScreenHeader)
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
  bodyIntroRow: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  bodyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  bodySubtitleCount: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  headerSubtitle: { fontSize:14, color:'#DBEAFE', fontWeight:'500', textAlign:'center' },
});

export default MyReportsScreen;