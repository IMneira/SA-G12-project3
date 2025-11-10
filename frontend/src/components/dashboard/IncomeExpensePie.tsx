import React, { useMemo } from "react";
import { View, Dimensions } from "react-native";
import { Card, Text } from "react-native-paper";
import { PieChart } from "react-native-chart-kit";

type Props = {
  income: number;
  expense: number;
  styles: any;
};

const screenWidth = Dimensions.get("window").width;
const stacked = screenWidth < 780;
const chartWidth = Math.min(Math.max(screenWidth * 0.38, 240), 360);
const chartHeight = 220;

export const IncomeExpensePie: React.FC<Props> = ({ income, expense, styles }) => {
  const total = Math.max(income + expense, 0.0001);
  const incomePct = Math.round((income / total) * 100);
  const expensePct = Math.round((expense / total) * 100);

  const data = useMemo(
    () => [
      { name: "Income", population: income, color: "#22c55e", legendFontColor: "#111", legendFontSize: 12 },
      { name: "Expense", population: expense, color: "#ef4444", legendFontColor: "#111", legendFontSize: 12 },
    ],
    [income, expense]
  );

  return (
    <Card style={[styles.chartCard]}>
      <Card.Title title="Income vs Expense" />
      <Card.Content>
        <View style={{
          flexDirection: Dimensions.get("window").width < 780 ? "column" : "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
        }}>
          <View style={{ width: 300, alignItems: "center" }}>
            <PieChart
              data={data}
              width={300}
              height={200}
              accessor="population"
              backgroundColor="transparent"
              hasLegend={false}
              center={[0,0]}
              chartConfig={{ color: () => `rgba(0,0,0,1)`, labelColor: () => `rgba(0,0,0,1)` }}
            />
          </View>

          <View style={styles.legendBox}>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: "#22c55e" }]} />
              <Text numberOfLines={1} ellipsizeMode="tail">{`${incomePct}% Income`}</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: "#ef4444" }]} />
              <Text numberOfLines={1} ellipsizeMode="tail">{`${expensePct}% Expense`}</Text>
            </View>
          </View>
        </View>

        <Text style={{ textAlign: "center", marginTop: 6 }} numberOfLines={1} ellipsizeMode="tail">
          {`Income: ${income.toLocaleString()} US$ • Expense: ${expense.toLocaleString()} US$`}
        </Text>
      </Card.Content>
    </Card>
  );
};
