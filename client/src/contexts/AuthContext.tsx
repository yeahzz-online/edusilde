import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import api from '../lib/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedAccess = localStorage.getItem('accessToken');
        const storedRefresh = localStorage.getItem('refreshToken');

        if (storedUser && storedAccess && storedRefresh) {
            setUser(JSON.parse(storedUser));
            setAccessToken(storedAccess);
            setRefreshToken(storedRefresh);
        }
        setLoading(false);
    }, []);

    const login = (userData: User, access: string, refresh: string) => {
        setUser(userData);
        setAccessToken(access);
        setRefreshToken(refresh);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
    };

    const logout = () => {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    };

    const isAuthenticated = !!accessToken;

    return (
        <AuthContext.Provider value={{ user, accessToken, refreshToken, login, logout, isAuthenticated }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
