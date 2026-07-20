import { createContext, useState, useEffect } from "react";
import authService from "../services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, check if a token exists and validate it against the server
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const currentUser = await authService.getMe();
        setUser(currentUser);
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email, password, rememberMe) => {
    const data = await authService.login(email, password, rememberMe);
    localStorage.setItem("token", data.token);
    setUser({ _id: data._id, name: data.name, email: data.email });
    return data;
  };

  const signup = async (name, email, password) => {
    const data = await authService.signup(name, email, password);
    localStorage.setItem("token", data.token);
    setUser({ _id: data._id, name: data.name, email: data.email });
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignore network errors on logout - we clear local state regardless
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
