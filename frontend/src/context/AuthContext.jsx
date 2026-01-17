import { createContext, useContext, useState, useEffect } from "react";
import { authApi, tokenService } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = tokenService.getToken();
    const savedUser = tokenService.getUser();

    if (token && savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authApi.login({ username, password });
      const { token, userId, username: userName, role } = response.data;

      tokenService.setToken(token);
      tokenService.setUser({ id: userId, username: userName, role });
      setUser({ id: userId, username: userName, role });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data || "Login failed" };
    }
  };

  const register = async (username, password, height) => {
    try {
      const response = await authApi.register({
        username,
        password,
        height,
      });
      const { token, userId, username: userName, role } = response.data;

      tokenService.setToken(token);
      tokenService.setUser({ id: userId, username: userName, role });
      setUser({ id: userId, username: userName, role });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || "Registration failed",
      };
    }
  };

  const logout = () => {
    tokenService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
