import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
export const api = axios.create({ baseURL:BASE_URL, headers:{"Content-Type":"application/json"} });
api.interceptors.request.use((config) => { const t=localStorage.getItem("vantage_token"); if(t) config.headers.Authorization=`Bearer ${t}`; return config; });
api.interceptors.response.use((res)=>res, (err)=>{ if(err.response?.status===401){ localStorage.removeItem("vantage_token"); localStorage.removeItem("vantage_user"); window.location.href="/login"; } return Promise.reject(err); });
