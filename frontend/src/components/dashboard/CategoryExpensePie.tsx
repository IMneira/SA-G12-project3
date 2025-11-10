import React from "react";
import { View, Dimensions } from "react-native";
import { Card, Text } from "react-native-paper";
import { PieChart } from "react-native-chart-kit";

type Slice = {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
  pct: number;
};

type Props = {
  slices: Slice[];
  styles: any;
};

const screenWidth = Dimensions.get("window").width;
const chartSize = Math.min(screenWidth * 0.72, 360);

export const CategoryExpensePie: React.FC<Props> = ({ slices, styles }) => {
  if (!slices || slices.length === 0) return null;

  return (
    <Card style={[styles.listCard, styles.cardMax, { alignItems: "center", marginTop: 16 }]}>
      <Card.Title title="Expense by Category (%)" />
      <Card.Content style={{ width: "100%" }}>
        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 16 }}>
          <View style={{ width: chartSize, alignItems: "center" }}>
            <PieChart
              data={slices.map(s => ({
                name: s.name,
                population: s.population,
                color: s.color,
                legendFontColor: s.legendFontColor,
                legendFontSize: s.legendFontSize,
              }))}
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

          <View style={{ gap: 8, maxWidth: 220 }}>
            {slices.map((s, i) => (
              <View key={`${s.name}-${i}`} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                <Text numberOfLines={1}>{`${s.pct}% ${s.name}`}</Text>
              </View>
            ))}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};
