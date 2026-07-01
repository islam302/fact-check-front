import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

const IS_DEV = import.meta.env.DEV;
const LOGIN_URL = IS_DEV
  ? "https://una-ai-tools-apis.una-oic.org/auth-api/api/auth/token/"
  : "/api/auth/token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedAccessToken = localStorage.getItem('accessToken');

    if (storedUser && storedAccessToken) {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedAccessToken);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Login failed');
    }

    const data = await response.json();

    const userData = {
      username: data.username,
      organization: data.organization,
      email: data.email,
      role: data.role,
    };

    setUser(userData);
    setAccessToken(data.access);

    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', data.access);

    return userData;
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
  };

  const isAuthenticated = !!user && !!accessToken;

  const value = {
    user,
    accessToken,
    login,
    logout,
    isAuthenticated,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
