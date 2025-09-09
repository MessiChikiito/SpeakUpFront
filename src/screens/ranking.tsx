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

// Tipos para las denuncias en el ranking
interface RankedReport {
  id: string;
  title: string;
  category: 'Corrupción' | 'Abuso' | 'Negligencia' | 'Fraude' | 'Discriminación' | 'Medio ambiente' | 'Otros';
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  interactions: {
    views: number;
    likes: number;
    comments: number;
    total: number;
  };
  rank: number;
  isVerified: boolean;
}

interface RankingScreenProps {
  onReportPress?: (report: RankedReport) => void;
  onGoBack?: () => void;
}

const { width } = Dimensions.get('window');

const RankingScreen: React.FC<RankingScreenProps> = ({
  onReportPress,
  onGoBack,
}) => {
  const [reports, setReports] = useState<RankedReport[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Datos de ejemplo para el ranking
  const mockRankedReports: RankedReport[] = [
    {
      id: '1',
      title: 'Mal uso de fondos en construcción del nuevo hospital',
      category: 'Corrupción',
      severity: 'critical',
      createdAt: '2025-08-20',
      interactions: {
        views: 2340,
        likes: 856,
        comments: 127,
        total: 3323,
      },
      rank: 1,
      isVerified: true,
    },
    {
      id: '2',
      title: 'Discriminación racial en oficina de migraciones',
      category: 'Discriminación',
      severity: 'high',
      createdAt: '2025-08-18',
      interactions: {
        views: 1890,
        likes: 634,
        comments: 89,
        total: 2613,
      },
      rank: 2,
      isVerified: true,
    },
    {
      id: '3',
      title: 'Contaminación en río por empresa textil',
      category: 'Medio ambiente',
      severity: 'high',
      createdAt: '2025-08-22',
      interactions: {
        views: 1456,
        likes: 523,
        comments: 73,
        total: 2052,
      },
      rank: 3,
      isVerified: false,
    },
    {
      id: '4',
      title: 'Sobrecostos en licitación de transporte público',
      category: 'Fraude',
      severity: 'medium',
      createdAt: '2025-08-15',
      interactions: {
        views: 1234,
        likes: 445,
        comments: 67,
        total: 1746,
      },
      rank: 4,
      isVerified: true,
    },
    {
      id: '5',
      title: 'Demoras sistemáticas en atención médica',
      category: 'Negligencia',
      severity: 'medium',
      createdAt: '2025-08-16',
      interactions: {
        views: 987,
        likes: 342,
        comments: 45,
        total: 1374,
      },
      rank: 5,
      isVerified: false,
    },
    {
      id: '6',
      title: 'Abuso de autoridad en control vehicular',
      category: 'Abuso',
      severity: 'medium',
      createdAt: '2025-08-12',
      interactions: {
        views: 876,
        likes: 298,
        comments: 34,
        total: 1208,
      },
      rank: 6,
      isVerified: true,
    },
  ];

  useEffect(() => {
    // Simular carga de datos ordenados por interacciones
    setTimeout(() => {
      const sortedReports = mockRankedReports.sort((a, b) => b.interactions.total - a.interactions.total);
      setReports(sortedReports);
      setIsLoading(false);
    }, 1000);
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const sortedReports = [...mockRankedReports].sort((a, b) => b.interactions.total - a.interactions.total);
      setReports(sortedReports);
      setIsRefreshing(false);
    }, 1000);
  };

  const handleReportPress = (report: RankedReport) => {
    if (onReportPress) {
      onReportPress(report);
    } else {
      Alert.alert(
        'Denuncia #' + report.rank,
        `${report.title}\n\nInteracciones: ${report.interactions.total.toLocaleString()}\nEstado: ${report.isVerified ? 'Verificado' : 'Sin verificar'}`
      );
    }
  };

  const getCategoryColor = (category: RankedReport['category']): string => {
    switch (category) {
      case 'Corrupción': return '#EF4444';
      case 'Abuso': return '#F59E0B';
      case 'Negligencia': return '#3B82F6';
      case 'Fraude': return '#8B5CF6';
      case 'Discriminación': return '#EC4899';
      case 'Medio ambiente': return '#10B981';
      case 'Otros': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getSeverityColor = (severity: RankedReport['severity']): string => {
    switch (severity) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'critical': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getSeverityLabel = (severity: RankedReport['severity']): string => {
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

  const getRankIcon = (rank: number): string => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const formatInteractions = (total: number): string => {
    if (total >= 1000) {
      return (total / 1000).toFixed(1) + 'k';
    }
    return total.toString();
  };

  const renderRankingCard = ({ item }: { item: RankedReport }) => (
    <TouchableOpacity
      style={styles.rankingCard}
      onPress={() => handleReportPress(item)}
    >
      {/* Rank Badge */}
      <View style={[
        styles.rankBadge,
        item.rank <= 3 && styles.topRankBadge
      ]}>
        <Text style={[
          styles.rankText,
          item.rank <= 3 && styles.topRankText
        ]}>
          {getRankIcon(item.rank)}
        </Text>
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        {/* Header with category and verification */}
        <View style={styles.cardHeader}>
          <View style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor(item.category) }
          ]}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          
          {item.isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verificado</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Meta information */}
        <View style={styles.cardMeta}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Fecha:</Text>
            <Text style={styles.metaValue}>{formatDate(item.createdAt)}</Text>
          </View>
          
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Gravedad:</Text>
            <View style={[
              styles.severityIndicator,
              { backgroundColor: getSeverityColor(item.severity) }
            ]}>
              <Text style={styles.severityText}>
                {getSeverityLabel(item.severity)}
              </Text>
            </View>
          </View>
        </View>

        {/* Interactions */}
        <View style={styles.interactionsContainer}>
          <View style={styles.interactionItem}>
            <Text style={styles.interactionIcon}>👁️</Text>
            <Text style={styles.interactionCount}>
              {formatInteractions(item.interactions.views)}
            </Text>
          </View>
          
          <View style={styles.interactionItem}>
            <Text style={styles.interactionIcon}>👍</Text>
            <Text style={styles.interactionCount}>
              {formatInteractions(item.interactions.likes)}
            </Text>
          </View>
          
          <View style={styles.interactionItem}>
            <Text style={styles.interactionIcon}>💬</Text>
            <Text style={styles.interactionCount}>
              {formatInteractions(item.interactions.comments)}
            </Text>
          </View>
          
          <View style={styles.totalInteractions}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalCount}>
              {formatInteractions(item.interactions.total)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onGoBack}
        >
          <Text style={styles.backButtonText}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ranking de Denuncias</Text>
        <View style={styles.headerSpace} />
      </View>

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>
          Las denuncias más relevantes ordenadas por interacciones
        </Text>
      </View>

      {/* Rankings List */}
      <FlatList
        data={reports}
        renderItem={renderRankingCard}
        keyExtractor={(item) => item.id}
        style={styles.rankingList}
        contentContainerStyle={[
          styles.rankingListContent,
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
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
  subtitleContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  rankingList: {
    flex: 1,
  },
  rankingListContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  rankingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  rankBadge: {
    position: 'absolute',
    top: 12,
    left: 150,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  topRankBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  topRankText: {
    fontSize: 14,
    color: '#92400E',
  },
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
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
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
  interactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  interactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  interactionIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  interactionCount: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  totalInteractions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
    marginRight: 4,
  },
  totalCount: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
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
  },
});

export default RankingScreen;