import React from "react";
import { View } from "react-native";
import { Card, Chip, Text } from "react-native-paper";

type Props = {
  email: string;
  styles: any;
};

export const DashboardHeader: React.FC<Props> = ({ email, styles }) => (
  <Card style={[styles.headerCard, styles.cardMax]}>
    <Card.Content>
      <View style={[styles.headerRow, { alignItems: "center" }]}>
        <Text variant="headlineMedium" style={styles.title}>
          Financial Dashboard
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text variant="labelLarge">{email}</Text>
          <Chip compact>Active</Chip>
        </View>
      </View>
    </Card.Content>
  </Card>
);
