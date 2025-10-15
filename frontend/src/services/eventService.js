import api from "./api";
// Serviços relacionados com eventos

//  Obter todos os eventos
export const getAllEvents = async () => {
  //  Enviar pedido GET para get_all_events.php
  const response = await api.get("/events/get_all_events.php");
  return response.data;
};

// Obter eventos por categoria
export const getEventsByCategory = async (categoryId) => {
  const response = await api.get(`/events/get_events_by_category.php?category=${categoryId}`);
  return response.data;
};

//  Obter detalhes de um evento por ID
export const getEventDetails = async (eventId) => {
  const response = await api.get(`/events/get_event_details.php?id=${eventId}`);
  return response.data;
};

// Obter detalhes de um evento por token
export const getEventDetailsByToken = async (eventToken) => {
  // Enviar pedido GET para get_event_by_token.php?token=TOKEN com encoding correto
  const encodedToken = encodeURIComponent(eventToken);
  const response = await api.get(`/events/get_event_by_token.php?token=${encodedToken}`);
  return response.data;
};
