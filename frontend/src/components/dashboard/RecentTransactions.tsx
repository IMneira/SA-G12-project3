import React from "react";
import { View } from "react-native";
import { Button, Card, Divider, List, Text } from "react-native-paper";

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

type Props = {
  items: Transaction[];
  onRefresh: () => void;
  onAdd: () => void;
  onManageCategories: () => void;
  styles: any;
};

const fmt = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);

export const RecentTransactions: React.FC<Props> = ({
  items,
  onRefresh,
  onAdd,
  onManageCategories,
  styles,
}) => (
  <Card style={[styles.listCard, styles.cardMax, { marginTop: 16 }]}>
    <Card.Title
      title="Recent transactions"
      right={() => (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button onPress={onRefresh}>Refresh</Button>
          <Button mode="contained" onPress={onAdd}>Add</Button>
          <Button mode="contained-tonal" onPress={onManageCategories}>Manage categories</Button>
        </View>
      )}
    />
    <Card.Content>
      {items.length === 0 ? (
        <Text style={[styles.empty, { textAlign: "center" }]}>No transactions yet.</Text>
      ) : (
        <View>
          {items.map((t, idx) => (
            <View key={t.id}>
              <List.Item
                title={t.description}
                description={`${new Date(t.date).toLocaleString()} • ${t.category?.name ?? `cat#${t.category_id}`}`}
                right={() => (
                  <Text style={{ color: t.type === "income" ? "#22c55e" : "#ef4444", fontWeight: "700" }}>
                    {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                  </Text>
                )}
              />
              {idx < items.length - 1 && <Divider />}
            </View>
          ))}
        </View>
      )}
    </Card.Content>
  </Card>
);
