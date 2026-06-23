"use client";

import { handleWhoami } from "@/lib/actions/auth-action";
import { createContext, ReactNode, useContext, useState, useTransition } from "react";

export type AuthUser = {
    id?: string;
    name?: string;
    email?: string;
    image?: string;
    role?: string;
};

type AuthContextValue = {
    user: AuthUser | null;
    setUser: (user: AuthUser | null) => void;
    refreshUser: () => Promise<void>;
    isRefreshing: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
    children,
    initialUser = null,
}: {
    children: ReactNode;
    initialUser?: AuthUser | null;
}) {
    const [user, setUser] = useState<AuthUser | null>(initialUser);
    const [isPending, startTransition] = useTransition();

    const refreshUser = async () => {
        startTransition(async () => {
            const result = await handleWhoami();
            if (result.success) {
                const data = result.data as { user?: AuthUser } | undefined;
                setUser(data?.user || null);
            }
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                refreshUser,
                isRefreshing: isPending,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}
