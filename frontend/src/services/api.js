import axios from "axios";
//Configuração central do axios para comunicação com o backend PHP

//  Obter a base URL da API a partir do .env ou usar a default
const apiBaseUrl =
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost/EventHive/backend/api";

// Criar instância do axios com configurações
const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, // Permitir envio de cookies para autenticação de sessão PHP
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => {
    console.log(
      "✅ Resposta da API bem-sucedida:",
      response.config.url,
      response.status,
    );
    return response;
  },
  (error) => {
    // Logs de erros detalhados
    console.error("❌ Erro na requisição detalhado:");
    console.error("URL:", error.config?.url);
    console.error("Método:", error.config?.method);
    console.error("Status:", error.response?.status);
    console.error("Mensagem:", error.message);

    if (error.response) {
      // FIXME: ERRO:  O servidor respondeu com um código de erro
      console.error("Dados da resposta:", error.response.data);
      console.error("Headers da resposta:", error.response.headers);
    } else if (error.request) {
      //FIXME:  ERRO: A requisição foi feita mas não houve resposta
      console.error("Nenhuma resposta do servidor:", error.request);
    } else {
      //FIXME:  ERRO: Algo aconteceu na configuração da requisição
      console.error("Erro de configuração:", error.message);
    }

    //FIXME: Se o erro for de timeout, logar especificamente
    if (error.code === "ECONNABORTED") {
      console.error("⏰ Timeout na requisição");
    }

    return Promise.reject(error);
  },
);

export default api;
