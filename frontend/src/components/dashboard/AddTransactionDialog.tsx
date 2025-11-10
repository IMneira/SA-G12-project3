import React from "react";
import { View } from "react-native";
import {
  Button,
  Dialog,
  HelperText,
  List,
  RadioButton,
  Text,
  TextInput,
} from "react-native-paper";

type Category = { id: number; name: string; owner_id: number };

type Props = {
  visible: boolean;
  onDismiss: () => void;
  styles: any;

  // form state
  desc: string;
  setDesc: (v: string) => void;
  amount: string;
  setAmount: (v: string) => void;
  type: "income" | "expense";
  setType: (v: "income" | "expense") => void;
  catId: number | null;
  setCatId: (id: number) => void;

  categories: Category[];

  // inline create
  newCatName: string;
  setNewCatName: (v: string) => void;
  onCreateCategoryInline: () => Promise<void>;
  creatingCat: boolean;

  onSave: () => Promise<void>;
  saving: boolean;
};

export const AddTransactionDialog: React.FC<Props> = ({
  visible,
  onDismiss,
  styles,
  desc,
  setDesc,
  amount,
  setAmount,
  type,
  setType,
  catId,
  setCatId,
  categories,
  newCatName,
  setNewCatName,
  onCreateCategoryInline,
  creatingCat,
  onSave,
  saving,
}) => {
  const amountIsInvalid =
    amount.trim() === "" || isNaN(Number(amount)) || Number(amount) <= 0;

  return (
    <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialogCompact}>
      <Dialog.Title>Add transaction</Dialog.Title>
      <Dialog.Content>
        <TextInput label="Description" mode="outlined" value={desc} onChangeText={setDesc} style={{ marginBottom: 10 }} />
        <TextInput label="Amount" mode="outlined" value={amount} onChangeText={setAmount} keyboardType="numeric" />
        <HelperText type={amountIsInvalid ? "error" : "info"} visible>
          {amountIsInvalid ? "Enter a positive number." : "Use dot for decimals (e.g., 12.50)."}
        </HelperText>

        <Text style={{ marginTop: 6, marginBottom: 4 }}>Type</Text>
        <RadioButton.Group onValueChange={(v) => setType(v as any)} value={type}>
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
              <TextInput label="New category name" mode="outlined" value={newCatName} onChangeText={setNewCatName} />
              <Button mode="contained-tonal" onPress={onCreateCategoryInline} loading={creatingCat} disabled={creatingCat || !newCatName.trim()}>
                Create category
              </Button>
            </View>
          </>
        ) : (
          <View style={styles.catSelectBox}>
            {categories.map((c) => (
              <List.Item
                key={c.id}
                title={c.name}
                onPress={() => setCatId(c.id)}
                right={() => <RadioButton status={catId === c.id ? "checked" : "unchecked"} />}
              />
            ))}
          </View>
        )}
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>Cancel</Button>
        <Button
          mode="contained"
          onPress={onSave}
          disabled={saving || amountIsInvalid || !desc.trim() || !catId || categories.length === 0}
          loading={saving}
        >
          Save
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};
