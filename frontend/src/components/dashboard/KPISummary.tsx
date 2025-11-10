import React from "react";
import { View } from "react-native";
import { Card, Text } from "react-native-paper";

type Props = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  balanceColor: string;
  styles: any; // reuse your dashboardStyles
};

const fmt = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);

export const KPISummary: React.FC<Props> = ({
  totalIncome,
  totalExpense,
  balance,
  balanceColor,
  styles,
}) => (
  <Card style={[styles.headerCard, styles.cardMax]}>
    <Card.Content>
      <View style={[styles.kpisRow, { justifyContent: "center", gap: 14, marginTop: 8, flexWrap: "wrap" }]}>
        <Card style={[styles.kpiCard, styles.kpiPro]}>
          <Card.Content style={styles.kpiInner}>
            <Text style={styles.kpiLabel}>Total Income</Text>
            <Text style={[styles.kpiValue, styles.kpiUp]}>{fmt(totalIncome)}</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.kpiCard, styles.kpiPro]}>
          <Card.Content style={styles.kpiInner}>
            <Text style={styles.kpiLabel}>Total Expense</Text>
            <Text style={[styles.kpiValue, styles.kpiDown]}>{fmt(totalExpense)}</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.kpiCard, styles.kpiPro]}>
          <Card.Content style={styles.kpiInner}>
            <Text style={styles.kpiLabel}>Balance</Text>
            <Text style={[styles.kpiValue, { color: balanceColor }]}>{fmt(balance)}</Text>
          </Card.Content>
        </Card>
      </View>
    </Card.Content>
  </Card>
);
