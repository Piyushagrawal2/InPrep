"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI } from "@/lib/api";

interface User {
    id: string;
    email: string;
    name: string;
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, name: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem("inprep_token");
        if (savedToken) {
            setToken(savedToken);
            authAPI
                .getMe(savedToken)
                .then((userData) => {
                    setUser(userData);
                })
                .catch(() => {
                    localStorage.removeItem("inprep_token");
                    setToken(null);
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const data = await authAPI.login({ email, password });
        setToken(data.access_token);
        setUser(data.user);
        localStorage.setItem("inprep_token", data.access_token);
    };

    const register = async (email: string, name: string, password: string) => {
        const data = await authAPI.register({ email, name, password });
        setToken(data.access_token);
        setUser(data.user);
        localStorage.setItem("inprep_token", data.access_token);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("inprep_token");
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}
