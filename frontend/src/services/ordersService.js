import api from "./api";
// Serviços de encomendas e compras

//Listar todas as encomendas e respetivos items
export const getAllOrders = async () => {
  const response = await api.get("/admin/orders_list.php");
  return response.data;
};
