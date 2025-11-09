import axios from "axios";


const baseURL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8000";


export const api = axios.create({
    baseURL,
    timeout: 15000,
});


export function setAuthToken(token?: string) {
    if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common["Authorization"];
    }
}