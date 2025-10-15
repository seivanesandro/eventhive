import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import { getProfile, login, logout, register } from "../services/authService";

//Provider de autenticação. Gera e fornece o estado de autenticação a toda a aplicação.

const AuthProvider = ({ children }) => {
  //  Estado do utilizador autenticado
  const [user, setUser] = useState(() => {
    // Tentar recuperar o usuário do localStorage durante a inicialização
    const savedUser = localStorage.getItem("authUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  //  Carregar perfil do utilizador ao iniciar a app com useEffect
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        //FIXME: mostrar no console:  tentativa de carregar perfil
        console.log("A carregar perfil do utilizador...");

        const data = await getProfile();

        //FIXME: mostrar no console a resposta do perfil
        console.log("Resposta do perfil:", data);
        if (data.success) {
          setUser(data.user);
          localStorage.setItem("authUser", JSON.stringify(data.user));
        } else {
          //FIXME: messgem de feedback perfil não autenticado
          console.log("Perfil não autenticado:", data.message);
          setUser(null);
          localStorage.removeItem("authUser");
        }
      } catch (error) {
        //FIXME: mostra o erro no console caso aja erro ao carregar perfil
        console.error("Erro ao carregar perfil:", error);

        setUser(null);
        localStorage.removeItem("authUser");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  //  Funções de autenticação
  const handleLogin = async (email, password) => {
    const data = await login(email, password);
    if (data.success) {
      const profile = await getProfile();
      if (profile.success && profile.user) {
        setUser(profile.user);
        localStorage.setItem("authUser", JSON.stringify(profile.user));
      }
    }
    return data;
  };

  // Função de registo
  const handleRegister = async (firstName, lastName, email, password) => {
    return await register(firstName, lastName, email, password);
  };

  // Função de logout
  const handleLogout = async () => {
    await logout();
    setUser(null);
    localStorage.removeItem("authUser");
  };

  // Valor do contexto de autenticação
  const value = {
    user,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    isAdmin: user && user.id_role === 1,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthProvider };
