import api from "./api";
// Serviços de autenticação (login, registo, logout, perfil)

//  Login do utilizador
export const login = async (email, password) => {
  //  Enviar pedido POST para login.php
  const response = await api.post("/auth/login.php", { email, password });
  return response.data;
};

// Registo de novo utilizador
export const register = async (firstName, lastName, email, password) => {
  //  Enviar pedido POST para register.php
  const response = await api.post("/auth/register.php", {
    first_name: firstName,
    last_name: lastName,
    email,
    password,
  });
  return response.data;
};

//  Logout do utilizador
export const logout = async () => {
  //  Enviar pedido POST para logout.php
  const response = await api.post("/auth/logout.php");
  return response.data;
};

//  Obter perfil do utilizador autenticado
export const getProfile = async () => {
  //  Enviar pedido GET para profile.php
  const response = await api.get("/auth/profile.php");
  return response.data;
};
