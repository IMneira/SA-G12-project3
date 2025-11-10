import { StyleSheet } from "react-native";
import { appTheme } from "../../styles/theme";

export const dashboardStyles = StyleSheet.create({
  page: {
    flex: 1,
    alignItems: "center",
    backgroundColor: appTheme.colors.background,
  },
  pageMax: {
    width: "100%",
    maxWidth: 980,
    padding: 12,
    gap: 16,
  },
  // fila que contiene ambos charts
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    alignItems: "stretch",
    justifyContent: "space-between",
  },
  // cada card-columna (se ponen lado a lado y se apilan cuando no cabe)
  colCard: {
    flexGrow: 1,
    minWidth: 300,
    maxWidth: 480,
    alignSelf: "stretch",
  },
  container: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  cardMax: {
    maxWidth: 980,
    width: "100%",
  },
  headerCard: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: appTheme.colors.elevation.level1,
  },
  title: {
    color: appTheme.colors.primary,
  },
  chip: {
    marginLeft: 10,
    marginTop: 2,
  },
  kpiCard: {
    borderRadius: 20,
    backgroundColor: appTheme.colors.elevation.level1,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiPro: {
    minWidth: 210,
  },
  kpiInner: {
    alignItems: "center",
    paddingVertical: 10,
  },
  kpiLabel: {
    opacity: 0.8,
    marginBottom: 4,
  },
  kpiValue: {
    fontWeight: "700",
    fontSize: 20,
  },
  kpiUp: { color: "#22c55e" },
  kpiDown: { color: "#ef4444" },

  listCard: {
    borderRadius: 20,
    backgroundColor: appTheme.colors.elevation.level1,
    paddingBottom: 8,
  },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  empty: {
    opacity: 0.7,
    marginVertical: 12,
  },

  dialogCompact: {
    maxWidth: 520,
    width: "95%",
    alignSelf: "center",
    borderRadius: 20,
  },
  catSelectBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  kpisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    gap: 12,
    marginTop: 8,
  },


  dialog: {
    alignSelf: "center",
    width: "92%",
    maxWidth: 560,
    borderRadius: 20,
    backgroundColor: appTheme.colors.elevation.level1,
  },
  
});
