import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { ActivityIndicator, Snackbar, Text } from "react-native-paper";
import { dashboardStyles as styles } from "./DashboardView.styles";
import { useAuth } from "../../contexts/AuthContext";

import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { KPISummary } from "../../components/dashboard/KPISummary";
import { IncomeExpensePie } from "../../components/dashboard/IncomeExpensePie";
import { CategoryExpensePie } from "../../components/dashboard/CategoryExpensePie";
import { RecentTransactions } from "../../components/dashboard/RecentTransactions";
import { AddTransactionDialog } from "../../components/dashboard/AddTransactionDialog";
import { ManageCategoriesDialog } from "../../components/dashboard/ManageCategoriesDialog";

type DashboardSummary = { total_income: number; total_expense: number; balance: number };
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

export const DashboardView: React.FC = () => {
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snack, setSnack] = useState(false);

  const [email, setEmail] = useState("");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [txRecent, setTxRecent] = useState<Transaction[]>([]);
  const [txAll, setTxAll] = useState<Transaction[]>([]);
  const [cats, setCats] = useState<Category[]>([]);

  // dialogs
  const [showAdd, setShowAdd] = useState(false);
  const [showCats, setShowCats] = useState(false);

  // add form
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [ttype, setTtype] = useState<"income" | "expense">("expense");
  const [catId, setCatId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);

  // manage categories
  const [catNameToAdd, setCatNameToAdd] = useState("");
  const [addingInManager, setAddingInManager] = useState(false);

  const authHeader = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const fail = (e: any) => {
    const msg = e?.message || "Unexpected error";
    setError(msg);
    setSnack(true);
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
    if (!res.ok) throw new Error((await res.text()) || res.statusText);
    return res.json();
  };

  const refreshCategories = useCallback(async () => {
    const cs = await fetchJSON<Category[]>("/categories/");
    setCats(cs);
    if (!catId && cs.length) setCatId(cs[0].id);
  }, [catId]);

  const loadAll = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [me, sum, recent, all] = await Promise.all([
        fetchJSON<{ id: number; email: string }>("/users/me"),
        fetchJSON<DashboardSummary>("/dashboard/summary_total"),
        fetchJSON<Transaction[]>("/transactions/?skip=0&limit=5"),
        fetchJSON<Transaction[]>("/transactions/?skip=0&limit=500"),
      ]);
      setEmail(me.email);
      setSummary(sum);
      setTxRecent(recent);
      setTxAll(all);
      await refreshCategories();
    } catch (e) {
      fail(e);
    } finally {
      setLoading(false);
    }
  }, [token, refreshCategories]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const balanceColor = useMemo(
    () => ((summary?.balance ?? 0) >= 0 ? "#22c55e" : "#ef4444"),
    [summary]
  );

  const catSlices = useMemo(() => {
    const idToName = new Map<number, string>();
    cats.forEach((c) => idToName.set(c.id, c.name));
    const sums = new Map<number, number>();
    for (const t of txAll) {
      if (t.type !== "expense") continue;
      const amt = Math.abs(Number(t.amount) || 0);
      if (amt <= 0) continue;

      if (!idToName.has(t.category_id)) {
        idToName.set(
          t.category_id,
          t.category?.name ?? `cat#${t.category_id}`
        );
      }
      sums.set(t.category_id, (sums.get(t.category_id) ?? 0) + amt);
    }

    const entries = Array.from(sums.entries()).map(([id, total]) => ({
      name: idToName.get(id) ?? `cat#${id}`,
      total,
    }));

    const grand = entries.reduce((s, e) => s + e.total, 0);
    if (grand <= 0) return [];

    const palette = [
      "#7c3aed",
      "#06b6d4",
      "#f59e0b",
      "#10b981",
      "#ef4444",
      "#8b5cf6",
      "#22c55e",
      "#ec4899",
      "#14b8a6",
      "#6366f1",
    ];

    return entries
      .sort((a, b) => b.total - a.total)
      .map((e, i) => ({
        name: e.name,
        population: e.total,
        color: palette[i % palette.length],
        legendFontColor: "#111",
        legendFontSize: 12,
        pct: Math.round((e.total / grand) * 100),
      }));
  }, [txAll, cats]);

  const saveTx = async () => {
    if (!catId || !desc.trim() || !amount.trim()) return;
    try {
      setSaving(true);
      await fetchJSON<Transaction>("/transactions/", {
        method: "POST",
        body: JSON.stringify({
          description: desc.trim(),
          amount: Number(amount),
          type: ttype,
          category_id: catId,
          date: new Date().toISOString(),
        }),
      });
      setShowAdd(false);
      setDesc("");
      setAmount("");
      setTtype("expense");
      await loadAll();
    } catch (e) {
      fail(e);
    } finally {
      setSaving(false);
    }
  };

  const createCatInline = async () => {
    if (!newCatName.trim()) return;
    try {
      setCreatingCat(true);
      const created = await fetchJSON<Category>("/categories/", {
        method: "POST",
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      await refreshCategories();
      setCatId(created.id);
      setNewCatName("");
    } catch (e) {
      fail(e);
    } finally {
      setCreatingCat(false);
    }
  };

  const addCatFromManager = async () => {
    if (!catNameToAdd.trim()) return;
    try {
      setAddingInManager(true);
      const created = await fetchJSON<Category>("/categories/", {
        method: "POST",
        body: JSON.stringify({ name: catNameToAdd.trim() }),
      });
      await refreshCategories();
      setCatId((old) => old ?? created.id);
      setCatNameToAdd("");
    } catch (e) {
      fail(e);
    } finally {
      setAddingInManager(false);
    }
  };

  if (!token) {
    return (
      <View
        style={[styles.container, { justifyContent: "center", alignItems: "center" }]}
      >
        <Text>Please sign in to see your dashboard.</Text>
      </View>
    );
  }
  if (loading) {
    return (
      <View
        style={[styles.container, { justifyContent: "center", alignItems: "center" }]}
      >
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, alignItems: "center" }}>
      {/* Header with title + email + chip */}
      <DashboardHeader email={email} styles={styles} />

      {/* KPIs */}
      <KPISummary
        totalIncome={summary?.total_income ?? 0}
        totalExpense={summary?.total_expense ?? 0}
        balance={summary?.balance ?? 0}
        balanceColor={balanceColor}
        styles={styles}
      />

      {/* Charts: side-by-side on wide screens, stacked on narrow */}
      <View
        style={{
          width: "100%",
          maxWidth: 980,
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 16,
          justifyContent: "center",
          marginTop: 8,
        }}
      >
        <View style={{ flexBasis: 460, flexGrow: 1 }}>
          <IncomeExpensePie
            income={summary?.total_income ?? 0}
            expense={summary?.total_expense ?? 0}
            styles={styles}
          />
        </View>
        <View style={{ flexBasis: 460, flexGrow: 1 }}>
          <CategoryExpensePie slices={catSlices} styles={styles} />
        </View>
      </View>

      {/* Recent list */}
      <RecentTransactions
        items={txRecent}
        onRefresh={loadAll}
        onAdd={() => setShowAdd(true)}
        onManageCategories={() => setShowCats(true)}
        styles={styles}
      />

      {/* Dialogs */}
      <AddTransactionDialog
        visible={showAdd}
        onDismiss={() => setShowAdd(false)}
        styles={styles}
        desc={desc}
        setDesc={setDesc}
        amount={amount}
        setAmount={setAmount}
        type={ttype}
        setType={setTtype}
        catId={catId as any}
        setCatId={(id) => setCatId(id)}
        categories={cats}
        newCatName={newCatName}
        setNewCatName={setNewCatName}
        onCreateCategoryInline={createCatInline}
        creatingCat={creatingCat}
        onSave={saveTx}
        saving={saving}
      />

      <ManageCategoriesDialog
        visible={showCats}
        onDismiss={() => setShowCats(false)}
        styles={styles}
        categories={cats}
        newName={catNameToAdd}
        setNewName={setCatNameToAdd}
        onAdd={addCatFromManager}
        adding={addingInManager}
      />

      <Snackbar visible={snack} onDismiss={() => setSnack(false)} duration={3000}>
        {error}
      </Snackbar>
    </ScrollView>
  );
};
