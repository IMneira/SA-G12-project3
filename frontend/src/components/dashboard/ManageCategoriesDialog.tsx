import React from "react";
import { View } from "react-native";
import { Button, Dialog, Divider, List, Text, TextInput } from "react-native-paper";

type Category = { id: number; name: string; owner_id: number };

type Props = {
  visible: boolean;
  onDismiss: () => void;
  styles: any;

  categories: Category[];
  newName: string;
  setNewName: (v: string) => void;
  onAdd: () => Promise<void>;
  adding: boolean;
};

export const ManageCategoriesDialog: React.FC<Props> = ({
  visible,
  onDismiss,
  styles,
  categories,
  newName,
  setNewName,
  onAdd,
  adding,
}) => (
  <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialogCompact}>
    <Dialog.Title>Manage categories</Dialog.Title>
    <Dialog.Content>
      {categories.length === 0 ? (
        <Text style={{ marginBottom: 8 }}>No categories yet.</Text>
      ) : (
        <View style={styles.catSelectBox}>
          {categories.map((c, i) => (
            <View key={c.id}>
              <List.Item title={c.name} />
              {i < categories.length - 1 && <Divider />}
            </View>
          ))}
        </View>
      )}
      <TextInput label="New category name" mode="outlined" value={newName} onChangeText={setNewName} />
    </Dialog.Content>
    <Dialog.Actions>
      <Button onPress={onDismiss}>Close</Button>
      <Button mode="contained" onPress={onAdd} disabled={adding || !newName.trim()} loading={adding}>
        Add
      </Button>
    </Dialog.Actions>
  </Dialog>
);
