import React, { useState } from "react";
import { View } from "react-native";
import { Text, TextInput, Button, Card, Snackbar } from "react-native-paper";
import { useAuth } from "../../contexts/AuthContext";
import { RegisterCredentials } from "../../../types/auth";
import { styles } from "./RegisterView.styles";
import { ReactElement } from "react";

export const RegisterView: React.FC = (): ReactElement => {
  const { register, isLoading, switchAuthView } = useAuth();
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    username: "",
    password: "",
    email: "",
  });

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleRegister = async (): Promise<void> => {
    try {
      await register(credentials);
      setSnackbarMessage("Registration successful!");
      setSnackbarVisible(true);
    } catch (error: any) {
      setSnackbarMessage(
        error.message || "Registration failed. Please try again.",
      );
      setSnackbarVisible(true);
    }
  };

  const handleInputChange =
    (field: keyof RegisterCredentials) =>
    (value: string): void => {
      setCredentials({ ...credentials, [field]: value });
    };

  const handleSwitchToLogin = (): void => {
    switchAuthView("login");
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Let's Get Started!
          </Text>

          <TextInput
            label="Email"
            value={credentials.email}
            onChangeText={handleInputChange("email")}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            disabled={isLoading}
          />

          <TextInput
            label="Username"
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
            onPress={handleRegister}
            style={styles.button}
            disabled={isLoading}
            loading={isLoading}
          >
            {!isLoading && "Sign Up"}
          </Button>

          <Button
            mode="text"
            onPress={handleSwitchToLogin}
            style={styles.switchButton}
            disabled={isLoading}
          >
            Already have an account? Login
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
