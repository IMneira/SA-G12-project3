import { api } from "./client";


export type User = { id: number; email: string };
export type DashboardSummary = {
    total_income: number;
    total_expense: number;
    balance: number;
};

export type Category = { id: number; name: string; owner_id: number };
export type Transaction = {
    id: number;
    description: string;
    amount: number;
    type: "income" | "expense";
    category_id: number;
    date: string;
    owner_id: number;
    category?: Category;
};


export async function getMe() {
const { data } = await api.get<User>("/users/me");
return data;
}


export async function getSummaryTotal() {
    const { data } = await api.get<DashboardSummary>("/dashboard/summary_total");
    return data;
}


export async function getRecentTransactions(limit = 5) {
    const { data } = await api.get<Transaction[]>("/transactions/", {
    params: { skip: 0, limit },
    });
    return data;
}


export async function getCategories() {
    const { data } = await api.get<Category[]>("/categories/");
    return data;
}