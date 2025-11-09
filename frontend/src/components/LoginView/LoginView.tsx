import React, { useState } from "react";
import { View } from "react-native";
import { Text, TextInput, Button, Card, Snackbar } from "react-native-paper";
import { useAuth } from "../../contexts/AuthContext";
import { LoginCredentials } from "../../../types/auth";
import { styles } from "./LoginView.styles";

export const LoginView: React.FC = () => {
  const { login, isLoading, switchAuthView } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: "",
  });
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleLogin = async (): Promise<void> => {
    try {
      await login(credentials);
      // Navigation would be handled here (React Navigation)
    } catch (error) {
      setSnackbarMessage(
        error instanceof Error ? error.message : "Login failed",
      );
      setSnackbarVisible(true);
    }
  };

  const handleInputChange =
    (field: keyof LoginCredentials) => (value: string) => {
      setCredentials((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSwitchToRegister = (): void => {
    switchAuthView("register");
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Welcome Back
          </Text>

          <TextInput
            label="Email"
            value={credentials.username}
            onChangeText={handleInputChange("username")}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            disabled={isLoading}
          />

          <TextInput
            label="Password"
            value={credentials.password}
            onChangeText={handleInputChange("password")}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            disabled={isLoading}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            disabled={isLoading}
            loading={isLoading}
          >
            {!isLoading && "Login"}
          </Button>

          <Button
            mode="text"
            onPress={handleSwitchToRegister}
            style={styles.switchButton}
            disabled={isLoading}
          >
            Don't have an account? Register
          </Button>
        </Card.Content>
      </Card>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "Dismiss",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};
