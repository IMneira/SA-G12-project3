import React from "react";
import { View, Dimensions } from "react-native";
import { Card, Text } from "react-native-paper";
import { PieChart } from "react-native-chart-kit";

type Props = {
  income: number;
  expense: number;
  styles: any;
};

const screenWidth = Dimensions.get("window").width;
const chartSize = Math.min(screenWidth * 0.72, 360);
const fmt = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);

export const IncomeExpensePie: React.FC<Props> = ({ income, expense, styles }) => {
  const total = income + expense;
  if (total <= 0) return null;

  const incomePct = Math.round((income / total) * 100);
  const expensePct = 100 - incomePct;

  const data = [
    { name: "Income", population: income, color: "#22c55e", legendFontColor: "#111", legendFontSize: 13 },
    { name: "Expense", population: expense, color: "#ef4444", legendFontColor: "#111", legendFontSize: 13 },
  ];

  return (
    <Card style={[styles.listCard, styles.cardMax, { alignItems: "center" }]}>
      <Card.Title title="Income vs Expense" />
      <Card.Content style={{ width: "100%" }}>
        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 16 }}>
          <View style={{ width: chartSize, alignItems: "center" }}>
            <PieChart
              data={data}
              width={chartSize}
              height={220}
              accessor="population"
              backgroundColor="transparent"
              hasLegend={false}
              center={[0, 0]}
              chartConfig={{
                color: () => `rgba(0,0,0,1)`,
                labelColor: () => `rgba(0,0,0,1)`,
              }}
            />
          </View>

          <View style={{ gap: 10 }}>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: "#22c55e" }]} />
              <Text>{`${incomePct}% Income`}</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: "#ef4444" }]} />
              <Text>{`${expensePct}% Expense`}</Text>
            </View>
          </View>
        </View>
        <Text style={{ marginTop: 10, textAlign: "center" }}>
          {`Income: ${fmt(income)} • Expense: ${fmt(expense)}`}
        </Text>
      </Card.Content>
    </Card>
  );
};
