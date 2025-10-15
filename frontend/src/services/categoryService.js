import api from "./api";

// Serviços relacionados com categorias

// Implementar cache para categorias
let cacheCategorias = null;

// Obter todas as categorias com tratamento de erros e cache
export const getAllCategories = async () => {
  if (cacheCategorias) {
    return cacheCategorias;
  }
  try {
    const resposta = await api.get("/categories/get_all_categories.php");
    if (resposta.data && resposta.data.success) {
      cacheCategorias = resposta.data;
      return resposta.data;
    } else {
      // Retornar feedback se resposta não for bem-sucedida
      return { success: false, message: "Não foi possível obter as categorias." };
    }
  } catch (erro) {
    // Tratamento de erro
    return { success: false, message: "Erro ao comunicar com o servidor. Por favor tente novamente mais tarde." };
  }
};