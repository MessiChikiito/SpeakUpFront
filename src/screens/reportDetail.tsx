import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { reportService } from '../services/reportServices';
import { getLocationLabel } from '../constants/ui';

const CATEGORY_ICON_MAP: Record<string,string> = {
  'Corrupción':'💰','Abuso de poder':'⚖️','Negligencia':'⚠️','Fraude':'🏦','Discriminación':'👥',
  'Acoso':'🚫','Medio ambiente':'🌱','Seguridad':'🛡️','Salud pública':'🩺','Transparencia':'🔍',
  'Malversación de fondos':'💸','Conflicto de intereses':'🔗','Soborno':'🤝','Violencia institucional':'🚔',
  'Hostigamiento laboral':'📣','Falsificación de documentos':'📝','Obra pública irregular':'🏗️',
  'Tráfico de influencias':'🔄','Desvío de información':'📤','Otros':'📋'
};
const fallbackIcons = ['📁','🗂️','🧩','📦','📝','📌','🔖','🧷'];
const getIcon = (name: string) => {
  if (CATEGORY_ICON_MAP[name]) return CATEGORY_ICON_MAP[name];
  let sum = 0; for (let i=0;i<name.length;i++) sum += name.charCodeAt(i);
  return fallbackIcons[sum % fallbackIcons.length];
};

const severityMap: Record<number,{label:string;color:string;bg:string}> = {
  1:{label:'Baja', color:'#16A34A', bg:'#DCFCE7'},
  2:{label:'Media', color:'#CA8A04', bg:'#FEF9C3'},
  3:{label:'Alta', color:'#DC2626', bg:'#FEE2E2'},
  4:{label:'Crítica', color:'#7F1D1D', bg:'#FECACA'},
};

export default function ReportDetail({ route, navigation }: any) {
  const { id } = route.params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await reportService.getOne(id);
        // Si no viene nombre de categoría pero sí id, intentar resolverlo
        if ((!r?.categoriaNombre && !r?.categoria?.nombre) && (r?.categoriaId || r?.categoria_id)) {
          const catIdLocal = r.categoriaId || r.categoria_id;
          try {
            const catNameResolved = await reportService.getCategoryNameById(catIdLocal);
            if (catNameResolved) {
              r.categoriaNombre = catNameResolved;
            }
          } catch {}
        }
        setData(r);
      } catch (e: any) {
        setErr(e?.message || 'Error cargando denuncia');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const catName = data?.categoria?.nombre || data?.categoriaNombre || data?.categoria || '';
  const catId = data?.categoriaId || data?.categoria_id || data?.categoriaID;
  const catDisplay = catName || (catId ? `Categoría N° ${catId}` : '');
  const catIcon = catName ? getIcon(catName) : '📁';

  const gravedadInfo = useMemo(() => {
    if (!data?.gravedad) return null;
    return severityMap[data.gravedad] || { label: String(data.gravedad), color:'#475569', bg:'#E2E8F0' };
  }, [data?.gravedad]);

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (err) return <View style={styles.center}><Text style={styles.error}>{err}</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{data.titulo}</Text>

      <Text style={styles.label}>Descripción</Text>
      <Text style={styles.block}>{data.descripcion}</Text>

      {catDisplay ? (
        <>
          <Text style={styles.label}>Categoría</Text>
          <View style={styles.inline}>
            <Text style={styles.catIcon}>{catIcon}</Text>
            <Text style={styles.block}>{catDisplay}</Text>
          </View>
        </>
      ) : null}

      { (data.ubicacion || data.location) ? (() => {
        const rawLoc = data.ubicacion || data.location;
        const locLabel = getLocationLabel(rawLoc);
        return (
          <>
            <Text style={styles.label}>Ubicación</Text>
            <Text style={styles.block}>{locLabel}</Text>
          </>
        );
      })() : null}

      {gravedadInfo ? (
        <>
          <Text style={styles.label}>Gravedad</Text>
          <View style={[styles.sevChip,{ backgroundColor: gravedadInfo.bg, borderColor: gravedadInfo.color }]}>
            <Text style={[styles.sevChipText,{ color: gravedadInfo.color }]}>{gravedadInfo.label}</Text>
          </View>
        </>
      ) : null}

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex:1, justifyContent:'center', alignItems:'center' },
  container: { padding:20 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 16, color:'#0F172A' },
  label: { fontSize: 12, fontWeight: '600', marginTop: 18, color:'#475569', textTransform:'uppercase', letterSpacing:0.5 },
  block: { fontSize: 14, color:'#1E293B', marginTop:6, lineHeight:20 },
  inline: { flexDirection:'row', alignItems:'center', gap:8, marginTop:6 },
  catIcon: { fontSize:18 },
  sevChip: {
    alignSelf:'flex-start',
    marginTop:6,
    borderWidth:1,
    borderRadius:20,
    paddingVertical:4,
    paddingHorizontal:12
  },
  sevChipText: { fontSize:12, fontWeight:'600' },
  backBtn: {
    marginTop: 32, backgroundColor:'#3B82F6', paddingVertical:14,
    borderRadius:10, alignItems:'center'
  },
  backText:{ color:'#FFF', fontWeight:'600', fontSize:14 },
  error:{ color:'#DC2626' }
});