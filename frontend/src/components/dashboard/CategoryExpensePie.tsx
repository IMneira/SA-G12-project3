import React, { useMemo } from "react";
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
  title?: string;
  maxLegendItems?: number;
};

const screenWidth = Dimensions.get("window").width;
const stacked = screenWidth < 780;                          // si es angosto, apilamos
const chartWidth = Math.min(Math.max(screenWidth * 0.38, 240), 360);
const chartHeight = 220;

export const CategoryExpensePie: React.FC<Props> = ({
  slices,
  styles,
  title = "Expense by Category (%)",
  maxLegendItems = 8,
}) => {
  if (!slices || slices.length === 0) return null;

  const { chartData, legendItems } = useMemo(() => {
    const sorted = [...slices].sort((a, b) => b.population - a.population);
    const top = sorted.slice(0, maxLegendItems);
    const rest = sorted.slice(maxLegendItems);
    if (rest.length) {
      const restTotal = rest.reduce((s, x) => s + x.population, 0);
      const restPct = rest.reduce((s, x) => s + x.pct, 0);
      top.push({
        name: "Others",
        population: restTotal,
        color: "#9CA3AF",
        legendFontColor: "#111",
        legendFontSize: 12,
        pct: Math.round(restPct),
      });
    }
    return {
      chartData: top.map((s) => ({
        name: s.name,
        population: s.population,
        color: s.color,
        legendFontColor: s.legendFontColor,
        legendFontSize: s.legendFontSize,
      })),
      legendItems: top,
    };
  }, [slices, maxLegendItems]);

  return (
    <Card style={[styles.chartCard]}>
        <Card.Title title="Expense by Category (%)" />
        <Card.Content>
            <View style={{
            flexDirection: Dimensions.get("window").width < 780 ? "column" : "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
            }}>
            <View style={{ width: 300, alignItems: "center" }}>
                <PieChart
                data={chartData}
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
                {legendItems.map((s, i) => (
                <View key={`${s.name}-${i}`} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                    <Text numberOfLines={1} ellipsizeMode="tail">
                    {`${s.pct}% ${s.name}`}
                    </Text>
                </View>
                ))}
            </View>
            </View>
        </Card.Content>
        </Card>
  );
};
