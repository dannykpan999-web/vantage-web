import { create } from "zustand";
import type { User } from "../types";
interface AuthState { user:User|null; token:string|null; isAuthenticated:boolean; setAuth:(user:User,token:string)=>void; updateUser:(patch:Partial<User>)=>void; logout:()=>void; }
export const useAuthStore = create<AuthState>((set) => ({
  user: (() => { try { const u=localStorage.getItem("vantage_user"); return u?JSON.parse(u):null; } catch { return null; } })(),
  token: localStorage.getItem("vantage_token"),
  isAuthenticated: !!localStorage.getItem("vantage_token"),
  setAuth: (user,token) => { localStorage.setItem("vantage_token",token); localStorage.setItem("vantage_user",JSON.stringify(user)); set({user,token,isAuthenticated:true}); },
  updateUser: (patch) => set(s => { const updated = s.user ? {...s.user,...patch} : s.user; if(updated) localStorage.setItem("vantage_user",JSON.stringify(updated)); return {user:updated}; }),
  logout: () => { localStorage.removeItem("vantage_token"); localStorage.removeItem("vantage_user"); set({user:null,token:null,isAuthenticated:false}); },
}));
