import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import ScreenHeader from '../components/ScreenHeader';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const subtitle = user ? `Sesión de ${user.username || user.email}` : 'Sin sesión activa';
  return (
    <View style={styles.container}>
      <ScreenHeader title="SpeakUp" variant="brand">
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </ScreenHeader>
      <View style={styles.content}>
        {user ? (
          <>
            <Text style={styles.sessionLabel}>Sesión iniciada como:</Text>
            <View style={styles.card}>
              <Text style={styles.primaryUser}>{user.username || user.email || '(sin nombre)'}</Text>
              {user.email && user.email !== user.username && (
                <Text style={styles.secondaryLine}>{user.email}</Text>
              )}
              <View style={styles.metaRow}> 
                {user.role ? <Text style={styles.badge}>Rol: {user.role}</Text> : null}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyBox}><Text style={styles.emptyText}>No hay sesión iniciada</Text></View>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#F8FAFC' },
  headerSubtitle: { fontSize:14, color:'#DBEAFE', fontWeight:'500', textAlign:'center' },
  content: { padding:20 },
  label: { marginTop:16, fontSize:12, fontWeight:'600', color:'#475569', textTransform:'uppercase', letterSpacing:0.5 },
  value: { marginTop:4, fontSize:15, color:'#1F2937', fontWeight:'500' },
  card: { backgroundColor:'#FFFFFF', padding:20, borderRadius:16, shadowColor:'#000', shadowOpacity:0.05, shadowRadius:6, shadowOffset:{ width:0, height:2 }, elevation:2 },
  primaryUser: { fontSize:20, fontWeight:'700', color:'#1E293B' },
  secondaryLine: { marginTop:4, fontSize:14, color:'#475569' },
  badge: { marginTop:10, alignSelf:'flex-start', backgroundColor:'#E0F2FE', color:'#0369A1', paddingHorizontal:10, paddingVertical:4, borderRadius:20, fontSize:12, fontWeight:'600' },
  metaRow: { marginTop:12, flexDirection:'row', flexWrap:'wrap', gap:8 },
  logoutBtn: { marginTop:32, backgroundColor:'#EF4444', paddingVertical:14, borderRadius:12, alignItems:'center' },
  logoutText: { color:'#FFF', fontWeight:'600', fontSize:15 },
  emptyBox: { backgroundColor:'#FFFFFF', padding:24, borderRadius:16, alignItems:'center', justifyContent:'center', shadowColor:'#000', shadowOpacity:0.04, shadowRadius:4, shadowOffset:{width:0,height:1} },
  emptyText: { fontSize:14, color:'#475569', fontWeight:'500' },
  sessionLabel: { fontSize:30, color:'#0F172A', fontWeight:'700', marginBottom:12, letterSpacing:-0.5 },
});

export default ProfileScreen;
