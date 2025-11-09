import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { LoginView } from "./src/components/LoginView/LoginView";
import { RegisterView } from "./src/components/RegisterView/RegisterView";
import { appTheme } from "./src/styles/theme";
import { ReactElement } from "react";
import { DashboardView } from "./src/components/dashboard/DashboardView"; 

const AppContent: React.FC = (): ReactElement => {
  const { currentView, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <>
        <StatusBar style="auto" />
        <DashboardView />
      </>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      {currentView === "login" && <LoginView />}
      {currentView === "register" && <RegisterView />}
    </>
  );
};


export default function App(): ReactElement {
  return (
    <PaperProvider theme={appTheme}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </PaperProvider>
  );
}
