import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, RefreshControl, ActivityIndicator } from 'react-native';
import ScreenHeader from '../components/ScreenHeader';
import { useNavigation } from '@react-navigation/native';
// Reemplaza control vertical por barra inline
import InlineVoteBar from '../components/InlineVoteBar';
import { reportService } from '../services/reportServices';
import { CATEGORY_COLOR, getSeverityInfo, getLocationLabel } from '../constants/ui';

// Tipos para las denuncias en el ranking
interface RankedReport {
  id: number;
  titulo: string;
  descripcion?: string;
  categoriaId: number;
  gravedad: number;
  estado: string;
  createdAt: string;
  score?: number;
  upCount?: number;
  downCount?: number;
  userVote?: number;
}

interface RankingScreenProps {
  onReportPress?: (report: RankedReport) => void;
  onGoBack?: () => void;
}


const RankingScreen: React.FC<RankingScreenProps> = ({ onReportPress, onGoBack }) => {
  const navigation: any = useNavigation();
  const [reports, setReports] = useState<RankedReport[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'top'|'recent'>('top');

  const [categoryNames, setCategoryNames] = useState<Record<number,string>>({});
  const loadCategories = useCallback(async () => {
    try {
      const cats = await reportService.getCategories();
      const map: Record<number,string> = {};
      cats.forEach((c:any)=> { map[c.id] = c.nombre || c.name || c.descripcion || `Cat ${c.id}`; });
      setCategoryNames(map);
    } catch {}
  }, []);

  const load = useCallback(async (opts:{refresh?:boolean}={}) => {
    if (!opts.refresh) setLoading(true);
    try {
  const data = await reportService.list({ sort });
      setReports(data);
    } catch(e) { console.log('Error ranking', e);} finally { setLoading(false); setIsRefreshing(false);}  
  }, [sort]);

  // Primero categorías, luego ranking, para que los nombres ya estén listos
  useEffect(()=>{ (async()=>{ await loadCategories(); load(); })(); }, [load, loadCategories]);

  const onRefresh = () => { setIsRefreshing(true); load({refresh:true}); };

  const handleReportPress = (report: RankedReport) => {
    if (onReportPress) return onReportPress(report);
    navigation.navigate('ReportDetail', { id: report.id });
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Corrupción': return '#EF4444';
      case 'Abuso': return '#F59E0B';
      case 'Negligencia': return '#3B82F6';
      case 'Fraude': return '#8B5CF6';
      case 'Otros': return '#6B7280';
      default: return '#6B7280';
    }
  };

  // gravedadInfo replaced by getSeverityInfo (shared constant)

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getRankDisplay = (index:number) => {
    const pos = index+1;
    return '#' + pos;
  };

  const renderRankingCard = ({ item, index }: { item: RankedReport, index: number }) => {
    const categoryName = categoryNames[item.categoriaId] || 'Otros';
    return (
      <View style={styles.rankingRow}>
        <TouchableOpacity style={styles.rankingContent} onPress={()=>handleReportPress(item)} activeOpacity={0.7}>
          <Text style={styles.rankingTitle}>{item.titulo}</Text>
          <View style={styles.metaInline}>
            <View style={[styles.categoryBadge, styles.categoryUnified]}>
              <Text style={styles.categoryText}>{categoryName}</Text>
            </View>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.metaSmall}>{formatDate(item.createdAt)}</Text>
            <Text style={styles.dot}>•</Text>
            <View style={[styles.severityPill,{ backgroundColor: getSeverityInfo(item.gravedad).color }]}>
              <Text style={styles.severityPillText}>{getSeverityInfo(item.gravedad).label}</Text>
            </View>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.metaSmall}>{item.estado? item.estado.charAt(0).toUpperCase()+item.estado.slice(1):''}</Text>
          </View>
          {(item as any).ubicacion ? (
            <Text style={styles.metaSmall}>
              {getLocationLabel((item as any).ubicacion)}
            </Text>
          ) : null}
        </TouchableOpacity>
        <View style={[styles.rankBadgeDecor, index===0 && styles.rank1, index===1 && styles.rank2, index===2 && styles.rank3]}>
          <Text style={[styles.rankBadgeDecorText, index===0 && styles.rankText1, index===1 && styles.rankText2, index===2 && styles.rankText3]}>{index+1}°</Text>
        </View>
        <View style={styles.voteRightWrapper}>
          <InlineVoteBar id={item.id} score={item.score} upCount={item.upCount} downCount={item.downCount} userVote={item.userVote} onChange={(u)=>{
            setReports(prev => prev.map(r=> r.id===u.id ? { ...r, ...u } : r));
          }}/> 
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📊</Text>
      <Text style={styles.emptyTitle}>No hay denuncias en el ranking</Text>
      <Text style={styles.emptySubtitle}>
        Las denuncias aparecerán aquí cuando tengan interacciones
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="SpeakUp" variant="brand">
        <Text style={styles.headerSubtitle}>Ranking</Text>
      </ScreenHeader>
      <View style={styles.sortTabsContainerBody}>
        <View style={styles.sortTabs}>
          {(['top','recent'] as const).map(s => (
            <TouchableOpacity key={s} style={[styles.sortTab, sort===s && styles.sortTabActive]} onPress={()=>{ setSort(s); load(); }}>
              <Text style={[styles.sortTabText, sort===s && styles.sortTabTextActive]}>
                {s==='top'?'Top':'Recientes'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.bodyIntroRow}> 
          <Text style={styles.bodyTitle}>{sort==='top' ? 'Top denuncias' : 'Denuncias recientes'}</Text>
          <Text style={styles.bodySubtitleCount}>{reports.length} resultados</Text>
        </View>
      </View>
      {loading ? (
        <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ marginTop:12, color:'#6B7280' }}>Cargando ranking...</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderRankingCard}
          keyExtractor={(item) => String(item.id)}
          style={styles.rankingList}
          contentContainerStyle={[styles.rankingListContent, reports.length===0 && styles.emptyListContent]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#3B82F6" colors={['#3B82F6']} />}
          ListEmptyComponent={!loading ? renderEmptyState : null}
          extraData={categoryNames}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  /* Removed old header/back button styles after moving to ScreenHeader */
  rankingList: {
    flex: 1,
  },
  rankingListContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  rankingRow: {
    flexDirection:'row',
    alignItems:'flex-start',
    backgroundColor:'#FFFFFF',
    borderRadius:12,
    padding:12,
    marginBottom:12,
    shadowColor:'#000',
    shadowOffset:{ width:0, height:1 },
    shadowOpacity:0.08,
    shadowRadius:2,
    elevation:2,
  },
  rankingContent: { flex:1, marginHorizontal:12 },
  rankingTitle: { fontSize:15, fontWeight:'600', color:'#1F2937', lineHeight:20, marginBottom:4 },
  rankBadgeDecor: { minWidth:36, paddingHorizontal:12, paddingVertical:8, borderRadius:18, backgroundColor:'#E2E8F0', alignItems:'center', justifyContent:'center', shadowColor:'#000', shadowOpacity:0.08, shadowRadius:2, shadowOffset:{width:0,height:1} },
  rankBadgeDecorText: { fontSize:13, fontWeight:'700', color:'#475569' },
  voteRightWrapper: { marginLeft:12, justifyContent:'flex-start', alignItems:'center' },
  rankBadge: { position:'absolute', top:12, right:12, paddingHorizontal:14, paddingVertical:6, borderRadius:16, backgroundColor:'#E2E8F0' },
  rankTextBig: { fontSize:14, fontWeight:'700', color:'#475569' },
  rank1: { backgroundColor:'#FDE68A' },
  rank2: { backgroundColor:'#E5E7EB' },
  rank3: { backgroundColor:'#FDBA74' },
  rankText1: { color:'#92400E' },
  rankText2: { color:'#374151' },
  rankText3: { color:'#7C2D12' },
  cardContent: {
    padding: 20,
    paddingTop: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: { paddingHorizontal:10, paddingVertical:4, borderRadius:8, minWidth:60, alignItems:'center' },
  categoryUnified: { backgroundColor: CATEGORY_COLOR },
  categoryText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 10,
    color: '#166534',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 22,
    marginBottom: 16,
  },
  cardMeta: {
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '600',
  },
  severityIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  inlineVoteWrapper: { flexDirection:'row', alignItems:'center', marginTop:12 },
  metaInline: { flexDirection:'row', alignItems:'center', flexWrap:'wrap' },
  metaSmall: { fontSize:11, color:'#6B7280', fontWeight:'500' },
  dot: { marginHorizontal:6, color:'#D1D5DB' },
  severityPill: { paddingHorizontal:8, paddingVertical:2, borderRadius:6 },
  severityPillText: { fontSize:11, color:'#FFF', fontWeight:'600' },
  sortTabsContainerBody: { backgroundColor:'#FFFFFF', borderBottomWidth:1, borderBottomColor:'#E5E7EB', paddingVertical:12, paddingHorizontal:20 },
  bodyIntroRow: { marginTop:12 },
  bodyTitle: { fontSize:22, fontWeight:'700', color:'#1E293B' },
  bodySubtitleCount: { marginTop:2, fontSize:13, color:'#64748B', fontWeight:'500' },
  sortTabs: { flexDirection:'row', alignItems:'center' },
  sortTab: { backgroundColor:'#E5E7EB', paddingVertical:4, paddingHorizontal:8, borderRadius:8, marginLeft:6 },
  sortTabActive: { backgroundColor:'#3B82F6' },
  sortTabText: { fontSize:12, color:'#374151' },
  sortTabTextActive: { color:'#FFFFFF', fontWeight:'600' },
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
  },
  headerSubtitle: { fontSize:14, color:'#DBEAFE', fontWeight:'500', textAlign:'center' },
});

export default RankingScreen;