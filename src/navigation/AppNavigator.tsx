import React from 'react';
import { Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../hooks/useAuth';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import Home from '../screens/home';
import NewReport from '../screens/newReports';
import MyReports from '../screens/myReports';
import Ranking from '../screens/ranking';
import Login from '../screens/login';
import Register from '../screens/register';
import ReportDetail from '../screens/reportDetail';
import Profile from '../screens/profile';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function LogoutButton({ onLogout }: { onLogout: () => void }) {
  const handlePress = React.useCallback(() => {
    if (Platform.OS === 'web') {
      const ok = typeof window !== 'undefined' && window.confirm('¿Deseas salir?');
      if (ok) onLogout();
      return;
    }
    Alert.alert(
      'Cerrar sesión',
      '¿Deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí', style: 'destructive', onPress: onLogout },
      ],
      { cancelable: true }
    );
  }, [onLogout]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{ marginRight: 12 }}
      testID="logout-button"
      accessibilityRole="button"
    >
      <Text style={{ color: '#EF4444', fontWeight: '600' }}>Cerrar sesión</Text>
    </TouchableOpacity>
  );
}

function MainTabs({ onLogout }: { onLogout: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarShowLabel: true,
        tabBarStyle: { height: 60, paddingBottom: 6, paddingTop: 6 },
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Inicio') {
            return <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />;
          }
          if (route.name === 'Nueva denuncia') {
            return <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={22} color={color} />;
          }
          if (route.name === 'Mis denuncias') {
            return <MaterialCommunityIcons name={focused ? 'clipboard-list' : 'clipboard-list-outline'} size={22} color={color} />;
          }
          if (route.name === 'Ranking') {
            return <Ionicons name={focused ? 'trophy' : 'trophy-outline'} size={22} color={color} />;
          }
          if (route.name === 'Perfil') {
            return <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />;
          }
          return null;
        },
      })}
    >
      <Tab.Screen
        name="Inicio"
        component={Home}
        options={{ tabBarTestID: 'tab-home', tabBarAccessibilityLabel: 'Ir a Inicio' }}
      />
      <Tab.Screen
        name="Nueva denuncia"
        component={NewReport}
        options={{ tabBarTestID: 'tab-new-report', tabBarAccessibilityLabel: 'Ir a Nueva denuncia' }}
      />
      <Tab.Screen
        name="Mis denuncias"
        component={MyReports}
        options={{ tabBarTestID: 'tab-my-reports', tabBarAccessibilityLabel: 'Ir a Mis denuncias' }}
      />
      <Tab.Screen
        name="Ranking"
        component={Ranking}
        options={{ tabBarTestID: 'tab-ranking', tabBarAccessibilityLabel: 'Ir a Ranking' }}
      />
      <Tab.Screen
        name="Perfil"
        component={Profile}
        options={{ tabBarTestID: 'tab-profile', tabBarAccessibilityLabel: 'Ir a Perfil' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading, logout } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Stack.Navigator>
          <Stack.Screen
            name="MainTabs"
            options={{ headerShown: false }}
          >
            {() => <MainTabs onLogout={logout} />}
          </Stack.Screen>
          <Stack.Screen
            name="ReportDetail"
            component={ReportDetail}
            options={{ title: 'Detalle denuncia' }}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
