import { StyleSheet } from "react-native";
import { appTheme } from "../../styles/theme";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: appTheme.spacing.lg,
    backgroundColor: appTheme.colors.background,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    padding: appTheme.spacing.md,
  },
  title: {
    textAlign: "center",
    marginBottom: appTheme.spacing.xl,
    color: appTheme.colors.primary,
  },
  input: {
    marginBottom: appTheme.spacing.lg,
  },
  button: {
    marginTop: appTheme.spacing.sm,
    paddingVertical: appTheme.spacing.sm,
  },
  switchButton: {
    marginTop: appTheme.spacing.md,
  },
});
