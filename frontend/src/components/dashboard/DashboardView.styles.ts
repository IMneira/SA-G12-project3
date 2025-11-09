import { StyleSheet } from "react-native";
import { appTheme } from "../../styles/theme";


export const dashboardStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: appTheme.colors.background,
        padding: appTheme.spacing.lg,
    },
    headerCard: {
        marginBottom: appTheme.spacing.lg,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: appTheme.spacing.md,
    },
    title: {
        color: appTheme.colors.primary,
    },
    kpisRow: {
        flexDirection: "row",
        gap: appTheme.spacing.md,
    },
    kpiCard: {
        flex: 1,
    },
    listCard: {
        flex: 1,
    },
    chip: {
        marginLeft: appTheme.spacing.sm,
    },
    empty: {
        textAlign: "center",
        color: appTheme.colors.muted,
        paddingVertical: appTheme.spacing.xl,
    },
});