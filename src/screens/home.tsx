import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, RefreshControl, ActivityIndicator } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import { useNavigation } from '@react-navigation/native';
import InlineVoteBar from '../components/InlineVoteBar';
import { reportService } from '../services/reportServices';
import { CATEGORY_COLOR, getSeverityInfo, getLocationLabel } from '../constants/ui';

// Tipos para las denuncias
interface Report {
  id: number;
  titulo: string;
  descripcion?: string;
  categoriaId: number;
  gravedad: number;
  estado: string;
  createdAt: string;
  score?: number;
  userVote?: number;
  upCount?: number;
  downCount?: number;
}

// Props para el componente HomeScreen
interface HomeScreenProps { onReportPress?: (report: Report) => void; }

const HomeScreen: React.FC<HomeScreenProps> = ({ onReportPress }) => {
  const navigation: any = useNavigation();
  const [reports, setReports] = useState<Report[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const sort: 'recent' = 'recent'; // solo recientes

  const [categoryNames, setCategoryNames] = useState<Record<number,string>>({});

  const loadCategories = useCallback(async () => {
    try {
      const cats = await reportService.getCategories();
      const map: Record<number,string> = {};
  cats.forEach((c: any) => { map[c.id] = c.nombre || c.name || c.descripcion || `Cat ${c.id}`; });
      setCategoryNames(map);
    } catch {}
  }, []);

  const loadReports = useCallback(async (opts: { refresh?: boolean } = {}) => {
    if (!opts.refresh) setLoading(true);
    try {
  const data = await reportService.list({ sort });
      setReports(data);
    } catch (e) {
      console.log('Error cargando denuncias', e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [sort]);

  // Primero categorías, luego denuncias para que el nombre aparezca de inmediato
  useEffect(() => { (async()=>{ await loadCategories(); loadReports(); })(); }, [loadCategories, loadReports]);

  const handleReportPress = (report: Report) => {
    if (onReportPress) return onReportPress(report);
    navigation.navigate('ReportDetail', { id: report.id });
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    loadReports({ refresh: true });
  };

  const getStatusColor = (estado: string): string => {
    switch (estado) {
      case 'validada':
      case 'Validado': return '#10B981';
      case 'pendiente':
      case 'Pendiente': return '#F59E0B';
      case 'revision':
      case 'En revisión': return '#3B82F6';
      case 'rechazada':
      case 'Rechazado': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getCategoryColor = (_category: string): string => '#4F46E5';

  // gravedadInfo removed; using getSeverityInfo from constants

  const renderReportItem = ({ item }: { item: Report }) => {
  const categoryName = categoryNames[item.categoriaId] || 'Otros';
    return (
      <View style={styles.reportRow}>
        <View style={[styles.reportCard, { flex:1 }]}> 
          <TouchableOpacity onPress={() => handleReportPress(item)} activeOpacity={0.8}>
            <View style={styles.reportHeader}>
              <View style={styles.reportTags}>
                <View style={[styles.categoryTag, styles.categoryUnified]}> 
                  <Text style={styles.categoryText}>{categoryName}</Text>
                </View>
                <View style={[styles.severityPill,{ backgroundColor: getSeverityInfo(item.gravedad).color }]}>
                  <Text style={styles.severityPillText}>{getSeverityInfo(item.gravedad).label}</Text>
                </View>
                <View style={[styles.statusTag, { backgroundColor: getStatusColor(item.estado) }]}>
                  <Text style={styles.statusText}>{item.estado?.charAt(0).toUpperCase() + item.estado?.slice(1)}</Text>
                </View>
              </View>
              <Text style={styles.reportDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.reportTitle} numberOfLines={2}>{item.titulo}</Text>
            {item.descripcion && <Text style={styles.reportDescription} numberOfLines={2}>{item.descripcion}</Text>}
            {!!(item as any).ubicacion && (
              <Text style={styles.metaLine}>
                {getLocationLabel((item as any).ubicacion)}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.voteRightWrapper}>
          <InlineVoteBar id={item.id} score={item.score} upCount={item.upCount} downCount={item.downCount} userVote={item.userVote} onChange={(u)=>{
            setReports(prev => prev.map(r => r.id === u.id ? { ...r, ...u } : r));
          }}/>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="SpeakUp" variant="hero">
        <Text style={styles.heroSubtitle}>Denuncias ciudadanas anónimas</Text>
      </ScreenHeader>
      <View style={styles.bodyWrapper}>
        <View style={styles.bodyIntroRow}>
          <Text style={styles.bodyTitle}>Denuncias recientes</Text>
          <Text style={styles.bodySubtitleCount}>{reports.length} resultados</Text>
        </View>

        {loading ? (
          <View style={{ flex:1, justifyContent:'center', alignItems:'center', paddingTop:40 }}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={{ marginTop:12, color:'#6B7280' }}>Cargando denuncias...</Text>
          </View>
        ) : (
          <FlatList
            data={reports}
            renderItem={renderReportItem}
            keyExtractor={(item) => String(item.id)}
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
            extraData={categoryNames}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerSubtitleBody: { fontSize:13, color:'#64748B', fontWeight:'500' },
  heroSubtitle: { fontSize:14, color:'#DBEAFE', fontWeight:'500' },
  bodyWrapper: { flex:1, backgroundColor:'#F9FAFB' },
  bodyIntroRow: { paddingHorizontal:20, paddingTop:12, paddingBottom:8 },
  bodyTitle: { fontSize:22, fontWeight:'700', color:'#1E293B' },
  bodySubtitleCount: { marginTop:2, fontSize:13, color:'#64748B', fontWeight:'500' },
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  reportRow: { flexDirection:'row', alignItems:'stretch', gap:12 },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    marginTop:12,
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
  categoryUnified: { backgroundColor: CATEGORY_COLOR },
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
  severityPill: { paddingHorizontal:8, paddingVertical:4, borderRadius:6, marginRight:6 },
  severityPillText: { fontSize:11, color:'#FFF', fontWeight:'600' },
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
  metaLine: {
    marginTop: 8,
    fontSize: 11,
    color: '#6B7280'
  },
  inlineBarWrapper: { marginTop:12, flexDirection:'row', alignItems:'center' },
  voteRightWrapper: { justifyContent:'flex-start', paddingHorizontal:8, paddingTop:16 },
  hotSmall: { marginLeft:12, fontSize:11, color:'#6B7280', fontWeight:'600' },
  sortTabs: { flexDirection: 'row' },
  sortTab: { paddingVertical:4, paddingHorizontal:8, borderRadius:8, backgroundColor:'#E5E7EB', marginLeft:6 },
  sortTabActive: { backgroundColor:'#3B82F6' },
  sortTabText: { fontSize:12, color:'#374151' },
  sortTabTextActive: { color:'#FFFFFF', fontWeight:'600' },
});

export default HomeScreen;