import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { LoginView } from "./src/components/LoginView/LoginView";
import { RegisterView } from "./src/components/RegisterView/RegisterView";
import { appTheme } from "./src/styles/theme";
import { ReactElement } from "react";

const AppContent: React.FC = (): ReactElement => {
  const { currentView, isAuthenticated } = useAuth();

  return (
    <>
      <StatusBar style="auto" />
      {currentView === "login" && !isAuthenticated && <LoginView />}
      {currentView === "register" && !isAuthenticated && <RegisterView />}
      {/* Main app content would go here when authenticated */}
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
