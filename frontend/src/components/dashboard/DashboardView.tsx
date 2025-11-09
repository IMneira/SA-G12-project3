import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Dimensions, ScrollView } from "react-native";
import {
  Text,
  Card,
  Button,
  List,
  Divider,
  Snackbar,
  ActivityIndicator,
  Chip,
  Dialog,
  Portal,
  TextInput,
  RadioButton,
  HelperText,
} from "react-native-paper";
import { dashboardStyles as styles } from "./DashboardView.styles";
import { useAuth } from "../../contexts/AuthContext";
import { PieChart } from "react-native-chart-kit";

type DashboardSummary = {
  total_income: number;
  total_expense: number;
  balance: number;
};

type Category = { id: number; name: string; owner_id: number };

type Transaction = {
  id: number;
  description: string;
  amount: number;
  type: "income" | "expense";
  category_id: number;
  date: string;
  owner_id: number;
  category?: Category;
};

const API = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const screenWidth = Dimensions.get("window").width;

export const DashboardView: React.FC = () => {
  const { token, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const [email, setEmail] = useState<string>("");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Add-transaction dialog
  const [showAdd, setShowAdd] = useState(false);
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState<string>("");
  const [newType, setNewType] = useState<"income" | "expense">("expense");
  const [newCatId, setNewCatId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  // Inline create (only when there are no categories)
  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);

  // Manage categories dialog
  const [showCats, setShowCats] = useState(false);
  const [catNameToAdd, setCatNameToAdd] = useState("");
  const [addingInManager, setAddingInManager] = useState(false);

  const authHeader = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const handleError = (e: any) => {
    const status = e?.response?.status || e?.status;
    if (status === 401) {
      logout();
      return;
    }
    const msg =
      e?.response?.data?.detail ||
      e?.message ||
      (typeof e === "string" ? e : "Unexpected error");
    setError(msg);
    setSnackbarVisible(true);
  };

  const fetchJSON = async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const res = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
        ...authHeader,
      },
    });
    if (!res.ok) {
      if (res.status === 401) {
        logout();
        throw new Error("Unauthorized (401)");
      }
      const txt = await res.text();
      throw new Error(txt || res.statusText);
    }
    return res.json();
  };

  const refreshCategories = useCallback(async () => {
    const cats = await fetchJSON<Category[]>("/categories/");
    setCategories(cats);
    if (!newCatId && cats.length > 0) setNewCatId(cats[0].id);
  }, [newCatId, authHeader]);

  const loadAll = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setEmail("");
      setSummary(null);
      setTxs([]);
      setCategories([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const [me, sum, transactions] = await Promise.all([
        fetchJSON<{ id: number; email: string }>("/users/me"),
        fetchJSON<DashboardSummary>("/dashboard/summary_total"),
        fetchJSON<Transaction[]>("/transactions/?skip=0&limit=5"),
      ]);

      setEmail(me.email);
      setSummary(sum);
      setTxs(transactions);
      await refreshCategories();
    } catch (e) {
      handleError(e);
    } finally {
      setLoading(false);
    }
  }, [token, authHeader, refreshCategories]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const balanceColor = useMemo(
    () => ((summary?.balance ?? 0) >= 0 ? "#22c55e" : "#ef4444"),
    [summary]
  );

  // Show pie only when there is actual data
  const hasData =
    (summary?.total_income ?? 0) > 0 || (summary?.total_expense ?? 0) > 0;

  // Keep the chart tightly sized so it centers inside the card
  const chartSize = Math.min(screenWidth * 0.7, 360);

  const pieData = useMemo(() => {
    const income = summary?.total_income ?? 0;
    const expense = summary?.total_expense ?? 0;
    return [
      {
        name: "Income",
        amount: income,
        color: "#22c55e",
        legendFontColor: "#222",
        legendFontSize: 13,
      },
      {
        name: "Expense",
        amount: expense,
        color: "#ef4444",
        legendFontColor: "#222",
        legendFontSize: 13,
      },
    ];
  }, [summary]);

  // ----- Add Transaction -----
  const amountIsInvalid =
    newAmount.trim() === "" || isNaN(Number(newAmount)) || Number(newAmount) <= 0;

  const resetForm = () => {
    setNewDesc("");
    setNewAmount("");
    setNewType("expense");
    setNewCatId(categories[0]?.id ?? null);
    setNewCatName("");
  };

  const createTransaction = async () => {
    if (!newCatId || amountIsInvalid || !newDesc.trim()) return;
    try {
      setSaving(true);
      const body = {
        description: newDesc.trim(),
        amount: Number(newAmount),
        type: newType,
        category_id: newCatId,
        date: new Date().toISOString(),
      };
      await fetchJSON<Transaction>("/transactions/", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setShowAdd(false);
      resetForm();
      await loadAll(); // refresh KPI + recent list
    } catch (e) {
      handleError(e);
    } finally {
      setSaving(false);
    }
  };

  const createCategoryInline = async () => {
    if (!newCatName.trim()) return;
    try {
      setCreatingCat(true);
      const created = await fetchJSON<Category>("/categories/", {
        method: "POST",
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      await refreshCategories();
      setNewCatId(created.id);
      setNewCatName("");
    } catch (e) {
      handleError(e);
    } finally {
      setCreatingCat(false);
    }
  };

  // ----- Category Manager -----
  const addCategoryFromManager = async () => {
    if (!catNameToAdd.trim()) return;
    try {
      setAddingInManager(true);
      const created = await fetchJSON<Category>("/categories/", {
        method: "POST",
        body: JSON.stringify({ name: catNameToAdd.trim() }),
      });
      await refreshCategories();
      setNewCatId((old) => old ?? created.id);
      setCatNameToAdd("");
    } catch (e) {
      handleError(e);
    } finally {
      setAddingInManager(false);
    }
  };

  if (!token) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text>Please sign in to see your dashboard.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading your dashboard…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, alignItems: "center" }}>
      {/* Header & KPIs */}
      <Card style={[styles.headerCard, { maxWidth: 700, width: "100%" }]}>
        <Card.Content>
          <View
            style={[
              styles.headerRow,
              { justifyContent: "space-between", alignItems: "center" },
            ]}
          >
            <Text variant="headlineMedium" style={styles.title}>
              Financial Dashboard
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text variant="labelLarge">{email}</Text>
              <Chip style={styles.chip} compact>
                {summary ? "Active" : "No data"}
              </Chip>
            </View>
          </View>

          <View
            style={[
              styles.kpisRow,
              { justifyContent: "center", gap: 12, marginTop: 8 },
            ]}
          >
            <Card style={[styles.kpiCard, { minWidth: 180 }]}>
              <Card.Content style={{ alignItems: "center" }}>
                <Text variant="labelLarge">Total Income</Text>
                <Text variant="headlineSmall">
                  $ {(summary?.total_income ?? 0).toFixed(2)}
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.kpiCard, { minWidth: 180 }]}>
              <Card.Content style={{ alignItems: "center" }}>
                <Text variant="labelLarge">Total Expense</Text>
                <Text variant="headlineSmall">
                  $ {(summary?.total_expense ?? 0).toFixed(2)}
                </Text>
              </Card.Content>
            </Card>

            <Card style={[styles.kpiCard, { minWidth: 180 }]}>
              <Card.Content style={{ alignItems: "center" }}>
                <Text variant="labelLarge">Balance</Text>
                <Text variant="headlineSmall" style={{ color: balanceColor }}>
                  $ {(summary?.balance ?? 0).toFixed(2)}
                </Text>
              </Card.Content>
            </Card>
          </View>
        </Card.Content>
      </Card>

      {/* Pie Chart — centered and only when there is data */}
      {hasData && (
        <Card
          style={[
            styles.listCard,
            {
              marginTop: 16,
              maxWidth: 700,
              width: "100%",
              alignItems: "center",
            },
          ]}
        >
          <Card.Title title="Income vs Expense" />
          <Card.Content
            style={{
              alignItems: "center",
              width: "100%",
            }}
          >
            <View
              style={{
                width: chartSize,
                alignSelf: "center",
                alignItems: "center",
              }}
            >
              <PieChart
                data={pieData.map((p) => ({
                  name: p.name,
                  population: p.amount,
                  color: p.color,
                  legendFontColor: p.legendFontColor,
                  legendFontSize: p.legendFontSize,
                }))}
                width={chartSize}         // tight width → perfect centering
                height={220}
                accessor="population"
                backgroundColor="transparent"
                hasLegend
                // No paddingLeft so the chart stays centered in its own box
                center={[0, 0]}          // explicit center
                chartConfig={{
                  color: () => `rgba(0,0,0,1)`,
                  labelColor: () => `rgba(0,0,0,1)`,
                }}
              />
            </View>
            <Text style={{ marginTop: 8 }}>
              {`Income: $${(summary?.total_income ?? 0).toFixed(
                2
              )} • Expense: $${(summary?.total_expense ?? 0).toFixed(2)}`}
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Recent Transactions + Actions */}
      <Card
        style={[styles.listCard, { marginTop: 16, maxWidth: 700, width: "100%" }]}
      >
        <Card.Title
          title="Recent transactions"
          right={() => (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button onPress={loadAll}>Refresh</Button>
              <Button mode="contained" onPress={() => setShowAdd(true)}>
                Add
              </Button>
              <Button mode="contained-tonal" onPress={() => setShowCats(true)}>
                Manage categories
              </Button>
            </View>
          )}
        />
        <Card.Content>
          {txs.length === 0 ? (
            <Text style={[styles.empty, { textAlign: "center" }]}>
              No transactions yet.
            </Text>
          ) : (
            <View>
              {txs.map((t, idx) => (
                <View key={t.id}>
                  <List.Item
                    title={t.description}
                    description={`${new Date(t.date).toLocaleString()} • ${
                      t.category?.name ?? `cat#${t.category_id}`
                    }`}
                    right={() => (
                      <Text
                        style={{
                          color: t.type === "income" ? "#22c55e" : "#ef4444",
                          fontWeight: "700",
                        }}
                      >
                        {t.type === "income" ? "+" : "-"}$ {t.amount.toFixed(2)}
                      </Text>
                    )}
                  />
                  {idx < txs.length - 1 && <Divider />}
                </View>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Add Transaction Dialog — compact */}
      <Portal>
        <Dialog
          visible={showAdd}
          onDismiss={() => setShowAdd(false)}
          style={{ maxWidth: 520, width: "95%", alignSelf: "center" }}
        >
          <Dialog.Title>Add transaction</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Description"
              mode="outlined"
              value={newDesc}
              onChangeText={setNewDesc}
              style={{ marginBottom: 10 }}
            />
            <TextInput
              label="Amount"
              mode="outlined"
              value={newAmount}
              onChangeText={setNewAmount}
              keyboardType="numeric"
            />
            <HelperText type={amountIsInvalid ? "error" : "info"} visible>
              {amountIsInvalid
                ? "Enter a positive number."
                : "Use dot for decimals (e.g., 12.50)."}
            </HelperText>

            <Text style={{ marginTop: 6, marginBottom: 4 }}>Type</Text>
            <RadioButton.Group
              onValueChange={(v) => setNewType(v as "income" | "expense")}
              value={newType}
            >
              <View style={{ flexDirection: "row", gap: 16 }}>
                <RadioButton.Item label="Expense" value="expense" />
                <RadioButton.Item label="Income" value="income" />
              </View>
            </RadioButton.Group>

            <Text style={{ marginTop: 6, marginBottom: 4 }}>Category</Text>

            {categories.length === 0 ? (
              <>
                <HelperText type="info" visible>
                  You have no categories yet. Create one to start tracking transactions.
                </HelperText>
                <View style={{ gap: 8 }}>
                  <TextInput
                    label="New category name"
                    mode="outlined"
                    value={newCatName}
                    onChangeText={setNewCatName}
                  />
                  <Button
                    mode="contained-tonal"
                    onPress={createCategoryInline}
                    loading={creatingCat}
                    disabled={creatingCat || !newCatName.trim()}
                  >
                    Create category
                  </Button>
                </View>
              </>
            ) : (
              <View style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 8 }}>
                {categories.map((c) => (
                  <List.Item
                    key={c.id}
                    title={c.name}
                    onPress={() => setNewCatId(c.id)}
                    right={() =>
                      newCatId === c.id ? (
                        <RadioButton status="checked" />
                      ) : (
                        <RadioButton status="unchecked" />
                      )
                    }
                  />
                ))}
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAdd(false)}>Cancel</Button>
            <Button
              mode="contained"
              onPress={createTransaction}
              disabled={
                saving ||
                amountIsInvalid ||
                !newDesc.trim() ||
                !newCatId ||
                categories.length === 0
              }
              loading={saving}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Manage Categories Dialog — add multiple categories */}
        <Dialog
          visible={showCats}
          onDismiss={() => setShowCats(false)}
          style={{ maxWidth: 520, width: "95%", alignSelf: "center" }}
        >
          <Dialog.Title>Manage categories</Dialog.Title>
          <Dialog.Content>
            {categories.length === 0 ? (
              <Text style={{ marginBottom: 8 }}>No categories yet.</Text>
            ) : (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              >
                {categories.map((c, i) => (
                  <View key={c.id}>
                    <List.Item title={c.name} />
                    {i < categories.length - 1 && <Divider />}
                  </View>
                ))}
              </View>
            )}

            <TextInput
              label="New category name"
              mode="outlined"
              value={catNameToAdd}
              onChangeText={setCatNameToAdd}
            />
            <HelperText type="info" visible>
              Add as many categories as you need.
            </HelperText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCats(false)}>Close</Button>
            <Button
              mode="contained"
              onPress={addCategoryFromManager}
              disabled={addingInManager || !catNameToAdd.trim()}
              loading={addingInManager}
            >
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{ label: "Dismiss", onPress: () => setSnackbarVisible(false) }}
      >
        {error}
      </Snackbar>
    </ScrollView>
  );
};
