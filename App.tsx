import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import LoginScreen from './src/screens/login';
import RegisterScreen from './src/screens/register';
import HomeScreen from './src/screens/home';
import NewReportScreen from './src/screens/newReports';
import MyReportsScreen from './src/screens/myReports';
import RankingScreen from './src/screens/ranking';
import AppNavigator from "./src/navigation/AppNavigator";

// export default function App() {
//   return <AppNavigator />;
// }

type AppScreen = 
  | 'login' 
  | 'register' 
  | 'home' 
  | 'new-report' 
  | 'my-reports' 
  | 'ranking';

type TabType = 'home' | 'new-report' | 'my-reports' | 'ranking';

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

interface NewReport {
  description: string;
  category: string;
  location: string;
  severity: string;
}

const CompleteSpeakUpApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('register');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Manejar autenticación
  const handleLogin = (email: string, password: string) => {
    console.log('Login attempt:', { email, password: '***' });
    setCurrentUser(email);
    setIsLoggedIn(true);
    setCurrentScreen('home');
  };

  const handleRegister = (username: string, password?: string) => {
    console.log('Anonymous registration:', { username, hasPassword: !!password });
    setCurrentUser(username);
    setIsLoggedIn(true);
    setCurrentScreen('home');
  };

  const handleForgotPassword = () => {
    console.log('Forgot password flow initiated');
  };

  // Navegación entre pantallas principales
  const handleTabPress = (tab: TabType) => {
    console.log(`Navigating to tab: ${tab}`);
    
    switch (tab) {
      case 'home':
        setCurrentScreen('home');
        break;
      case 'new-report':
        setCurrentScreen('new-report');
        break;
      case 'my-reports':
        setCurrentScreen('my-reports');
        break;
      case 'ranking':
        setCurrentScreen('ranking');
        break;
    }
  };

  // Manejar envío de nueva denuncia
  const handleSubmitReport = (newReport: NewReport) => {
    console.log('New report submitted:', newReport);
    
    // Simular guardado exitoso
    setTimeout(() => {
      setCurrentScreen('my-reports');
    }, 500);
  };

  // Manejar selección de denuncia
  const handleReportPress = (report: any) => {
    console.log('Report selected for details:', report);
    // Aquí puedes navegar a una pantalla de detalles
  };

  // Navegación de regreso
  const handleGoBack = () => {
    setCurrentScreen('home');
  };

  const switchToLogin = () => {
    setCurrentScreen('login');
  };

  const switchToRegister = () => {
    setCurrentScreen('register');
  };

  // Renderizar pantalla actual
  const renderCurrentScreen = () => {
    if (!isLoggedIn) {
      // Pantallas de autenticación
      if (currentScreen === 'login') {
        return (
          <LoginScreen
            onLogin={handleLogin}
            onForgotPassword={handleForgotPassword}
          />
        );
      } else {
        return (
          <RegisterScreen
            onRegister={handleRegister}
            onGoToLogin={switchToLogin}
          />
        );
      }
    }

    // Pantallas de la aplicación principal
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            onTabPress={handleTabPress}
            onReportPress={handleReportPress}
          />
        );
      
      case 'new-report':
        return (
          <NewReportScreen
            onSubmitReport={handleSubmitReport}
            onGoBack={handleGoBack}
          />
        );
      
      case 'my-reports':
        return (
          <MyReportsScreen
            onCreateNewReport={() => setCurrentScreen('new-report')}
            onReportPress={handleReportPress}
            onGoBack={handleGoBack}
          />
        );
      
      case 'ranking':
        return (
          <RankingScreen
            onReportPress={handleReportPress}
            onGoBack={handleGoBack}                                                          
          />
        );

      
      default:
        return (
          <HomeScreen
            onTabPress={handleTabPress}
            onReportPress={handleReportPress}
          />
        );
    }
  };

  return (
    <>
      <StatusBar 
        barStyle={isLoggedIn ? "light-content" : "dark-content"} 
        backgroundColor={isLoggedIn ? "#3B82F6" : "#FFFFFF"} 
      />
      {renderCurrentScreen()}
    </>
  );
};

export default CompleteSpeakUpApp;