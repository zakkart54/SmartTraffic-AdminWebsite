import React, { createContext, useContext, useState, ReactNode } from "react";
import {api} from "../lib/queryClient";
import {API_URL} from "../lib/config";

type AuthContextType = {
    accessToken?: string;
    setAccessToken: (token?: string) => void;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: () => boolean;
  };
  
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessTokenState] = useState<string | undefined>(() =>
    localStorage.getItem("accessToken") || undefined
  );

  const setAccessToken = (token?: string) => {
    setAccessTokenState(token);
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  };

  const login = async (username: string, password: string) => {
    const res = await api.post<any>(`${API_URL}/auth/login`, {
      username,
      password,
    });
    setAccessToken(res.access_token);
  };

  const logout = () => {
    setAccessToken(undefined);
  };

  const isAuthenticated = () => !!accessToken;

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, login, logout, isAuthenticated}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
