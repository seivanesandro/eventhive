import { useEffect, useState, useRef, useCallback, useContext } from "react";
import styled from "styled-components";
import { Modal, Form, Row, Col } from "react-bootstrap";
import { FaPencilAlt, FaTrash, FaPlus } from "react-icons/fa";
import Button from "../components/UI/Button";
import Message from "../components/UI/Message";
import Spinner from "../components/UI/Spinner";
import ReusableTable from "../components/UI/ReusableTable";
import api from "../services/api";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Styled Components reutilizados
const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const CategoryLabel = styled.span`
  background: var(--primary-color);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;
`;

const ActionIcon = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.color || "var(--primary-color)"};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  padding: 0.5rem;
  margin: 0 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
  i {
    font-size: 1rem;
  }
`;

const EventCrudPage = () => {
  // Contexto de autenticação
  const { user } = useContext(AuthContext);
  // Navegação
  const navigate = useNavigate();

  // Proteção de acesso
  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      navigate("/login");
    } else if (user.id_role !== 1) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Estados para eventos e categorias
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState(null);
  const [eventMessage, setEventMessage] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    id_event: null,
    title: "",
    description: "",
    event_date: "",
    location: "",
    id_category: "",
    image: null,
    image_url: "",
    image_preview: null,
  });
  const [eventErrors, setEventErrors] = useState({});
  const [eventSubmitting, setEventSubmitting] = useState(false);
  const [ticketsForm, setTicketsForm] = useState([
    { ticket_type: "", price: "", quantity_available: "" },
  ]);

  // Referência para o título do evento
  const eventTitleRef = useRef(null);

  // funçao callback para obter categorias
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get("/admin/categories_crud.php");
      if (response.data.success) {
        setCategories(
          (response.data.categories || []).sort(
            (a, b) => a.id_category - b.id_category,
          ),
        );
      }
    } catch {}
  }, []);

  // função callback para obter eventos
  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const response = await api.get("/admin/events_crud.php");
      if (response.data.success) {
        setEvents(
          (response.data.events || []).sort((a, b) => a.id_event - b.id_event),
        );
      } else {
        setEventsError(response.data.message || "Erro ao carregar eventos");
        setEventMessage({
          type: "danger",
          text: response.data.message || "Erro ao carregar eventos",
        });
        setTimeout(() => setEventMessage(null), 3000);
      }
    } catch (error) {
      setEventsError("Erro ao comunicar com o servidor");
      setEventMessage({
        type: "danger",
        text: "Erro ao comunicar com o servidor",
      });
      setTimeout(() => setEventMessage(null), 3000);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  // obter eventos e categorias ao montar o componente
  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, [fetchEvents, fetchCategories]);

  // Função para lidar com alterações nos bilhetes
  const handleTicketChange = (index, field, value) => {
    setTicketsForm((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  // Função para adicionar e remover bilhetes
  const handleAddTicket = () => {
    setTicketsForm((prev) => [
      ...prev,
      { ticket_type: "", price: "", quantity_available: "" },
    ]);
  };

  // Função para remover bilhetes
  const handleRemoveTicket = (index) => {
    setTicketsForm((prev) => prev.filter((_, i) => i !== index));
  };

  // Validação do formulário de evento
  const validateEventForm = (form) => {
    const errors = {};
    if (!form.title?.trim()) errors.title = "Título é obrigatório";
    if (!form.description?.trim())
      errors.description = "Descrição é obrigatória";
    if (!form.event_date) errors.event_date = "Data é obrigatória";
    if (!form.location?.trim()) errors.location = "Localização é obrigatória";
    if (!form.id_category || form.id_category === "")
      errors.id_category = "Categoria é obrigatória";
    return errors;
  };

  // Manipuladores de eventos do formulário
  const handleEventFormChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0] || null;
      setEventForm((prev) => ({
        ...prev,
        [name]: file,
        image_preview: file ? URL.createObjectURL(file) : null,
      }));
    } else {
      setEventForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Função para adicionar um novo evento
  const handleAddEvent = () => {
    if (categories.length === 0) fetchCategories();
    setEventForm({
      id_event: null,
      title: "",
      description: "",
      event_date: "",
      location: "",
      id_category: "",
      image: null,
    });
    setEventErrors({});
    setTicketsForm([{ ticket_type: "", price: "", quantity_available: "" }]);
    setShowEventModal(true);
    setTimeout(() => eventTitleRef.current?.focus(), 100);
  };

  // Função para editar um evento
  const handleEditEvent = (event) => {
    if (categories.length === 0) fetchCategories();
    setEventForm({
      id_event: event.id_event,
      title: event.title,
      description: event.description,
      event_date: event.event_date ? event.event_date.slice(0, 16) : "",
      location: event.location,
      id_category: event.id_category?.toString() || "",
      image: null,
      image_url: event.image_url || "",
      image_preview: null,
    });
    if (
      event.tickets &&
      Array.isArray(event.tickets) &&
      event.tickets.length > 0
    ) {
      setTicketsForm(
        event.tickets.map((t) => ({
          ticket_type: t.ticket_type || "",
          price: t.price || "",
          quantity_available:
            t.quantity_available !== undefined
              ? t.quantity_available
              : t.quantity || "",
        })),
      );
    } else {
      setTicketsForm([{ ticket_type: "", price: "", quantity_available: "" }]);
    }
    setEventErrors({});
    setShowEventModal(true);
    setTimeout(() => eventTitleRef.current?.focus(), 100);
  };

  //  Função para submeter o formulário de evento
  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    const formErrors = validateEventForm(eventForm);
    if (Object.keys(formErrors).length > 0) {
      setEventErrors(formErrors);
      return;
    }
    try {
      setEventSubmitting(true);
      const formData = new FormData();
      formData.append("title", eventForm.title?.trim() || "");
      formData.append("description", eventForm.description?.trim() || "");
      formData.append("event_date", eventForm.event_date || "");
      formData.append("location", eventForm.location?.trim() || "");
      formData.append("id_category", eventForm.id_category || "");
      if (eventForm.image) formData.append("image", eventForm.image);
      formData.append(
        "tickets",
        JSON.stringify(
          ticketsForm.filter(
            (t) => t.ticket_type && t.price && t.quantity_available,
          ),
        ),
      );
      let response;
      if (eventForm.id_event) {
        formData.append("id_event", eventForm.id_event);
        formData.append("_method", "PUT");
        response = await api.post("/admin/events_crud.php", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/admin/events_crud.php", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      if (response.data.success) {
        setShowEventModal(false);
        fetchEvents();
        setEventMessage({
          type: "success",
          text: response.data.message || "Evento guardado com sucesso.",
        });
        setTimeout(() => setEventMessage(null), 3000);
      } else {
        setEventErrors({
          submit: response.data.message || "Erro ao guardar evento",
        });
      }
    } catch (error) {
      setEventErrors({ submit: "Erro ao comunicar com o servidor" });
    } finally {
      setEventSubmitting(false);
    }
  };

  // Função para confirmar a eliminação de um evento
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);

  // Função para confirmar a eliminação de um evento
  const confirmDelete = (id) => {
    setEventToDelete(id);
    setShowConfirmModal(true);
  };

  // Função para eliminar um evento
  const handleDelete = async () => {
    if (!eventToDelete) return;
    try {
      setDeleteLoading(true);
      setDeleteMessage(null);
      const response = await api.delete("/admin/events_crud.php", {
        data: { id_event: eventToDelete },
      });
      if (response.data.success) {
        setDeleteMessage({
          type: "success",
          text: response.data.message || "Evento eliminado com sucesso.",
        });
        setTimeout(() => setDeleteMessage(null), 3000);
        fetchEvents();
      } else {
        setDeleteMessage({
          type: "danger",
          text: response.data.message || "Erro ao eliminar evento.",
        });
        setTimeout(() => setDeleteMessage(null), 3000);
      }
      setShowConfirmModal(false);
    } catch {
      setDeleteMessage({
        type: "danger",
        text: "Erro ao comunicar com o servidor.",
      });
      setTimeout(() => setDeleteMessage(null), 3000);
      setShowConfirmModal(false);
    } finally {
      setDeleteLoading(false);
      setEventToDelete(null);
    }
  };

  // Função para formatar datas
  const formatDate = (dateString) => {
    if (!dateString) return "Data inválida";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Data inválida";
      return date.toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Data inválida";
    }
  };

  // Definição das colunas da tabela
  const columns = [
    { key: "id_event", label: "ID" },
    { key: "title", label: "Título" },
    {
      key: "event_date",
      label: "Data",
      render: (row) => formatDate(row.event_date),
    },
    { key: "location", label: "Localização" },
    {
      key: "category_name",
      label: "Categoria",
      render: (row) => (
        <CategoryLabel>{row.category_name || "Sem categoria"}</CategoryLabel>
      ),
    },
    {
      key: "tickets_sold",
      label: "Bilhetes Vendidos",
      render: (row) => row.tickets_sold ?? 0,
    },
    { key: "status", label: "Status" },
  ];

  // Função para renderizar acções de cada linha
  const actions = (event) => {
    const tickets = event.tickets || [];
    const allTicketsSoldOut =
      tickets.length > 0 &&
      tickets.every((t) => Number(t.quantity_available) === 0);
    const disabledEdit =
      event.status === "terminado" ||
      allTicketsSoldOut ||
      event.has_tickets_sold;
    const disabledDelete = event.status === "terminado";
    return (
      <>
        <ActionIcon
          color="var(--primary-color)"
          onClick={disabledEdit ? undefined : () => handleEditEvent(event)}
          title={
            disabledEdit
              ? event.has_tickets_sold
                ? "Não é possível editar: já existem bilhetes comprados para este evento."
                : "Evento terminado ou bilhetes esgotados"
              : "Editar"
          }
          disabled={disabledEdit}
          aria-disabled={disabledEdit}
        >
          <FaPencilAlt style={{ opacity: disabledEdit ? 0.4 : 1 }} />
        </ActionIcon>
        <ActionIcon
          color="var(--danger-color)"
          onClick={
            disabledDelete ? undefined : () => confirmDelete(event.id_event)
          }
          title={disabledDelete ? "Evento terminado" : "Eliminar evento"}
          disabled={disabledDelete}
          aria-disabled={disabledDelete}
        >
          <FaTrash style={{ opacity: disabledDelete ? 0.4 : 1 }} />
        </ActionIcon>
      </>
    );
  };

  // SE não houver utilizador, mostra mensagem de loading
  if (user === undefined) {
    return (
      <div className="text-center py-5">
        <Spinner />
        <p>A verificar permissões...</p>
      </div>
    );
  }
  // Se o utilizador não for admin, redireciona para pagina login
  if (!user || user.id_role !== 1) {
    return (
      <div className="text-center py-5">
        <Message type="danger">Acesso restrito a administradores.</Message>
      </div>
    );
  }

  return (
    <>
      {/* eventos crud page - pagina de admin dashboard */}
      <div className="EventCrudPage">
        <ActionsContainer>
          <h4>Gestão de Eventos</h4>
          <Button onClick={handleAddEvent}>
            <FaPlus style={{ marginRight: "8px" }} /> Adicionar Evento
          </Button>
        </ActionsContainer>
        {/*/ Mensagem de sucesso ou erro */}
        {eventMessage && (
          <Message type={eventMessage.type}>{eventMessage.text}</Message>
        )}
        {deleteMessage && (
          <Message type={deleteMessage.type}>{deleteMessage.text}</Message>
        )}
        {/* Component tabela  */}
        <ReusableTable
          columns={columns}
          data={events}
          actions={actions}
          loading={eventsLoading}
          error={eventsError}
          emptyMessage="Nenhum evento encontrado"
        />

        {/* Modal de Adicionar ou Editar Evento */}
        <Modal
          show={showEventModal}
          onHide={() => setShowEventModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {eventForm.id_event ? "Editar Evento" : "Adicionar Evento"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Formulário de Evento */}
            <Form onSubmit={handleSubmitEvent}>
              <div
                style={{
                  border: "1px solid #eee",
                  borderRadius: 8,
                  padding: 16,
                  marginBottom: 24,
                }}
              >
                <h5>Bilhetes do Evento</h5>
                {ticketsForm.map((ticket, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: 8,
                      marginBottom: 8,
                      alignItems: "center",
                    }}
                  >
                    <Form.Control
                      type="text"
                      placeholder="Tipo de Bilhete"
                      value={ticket.ticket_type}
                      onChange={(e) =>
                        handleTicketChange(idx, "ticket_type", e.target.value)
                      }
                      style={{ maxWidth: 160 }}
                    />
                    <Form.Control
                      type="number"
                      placeholder="Preço (€)"
                      value={ticket.price}
                      onChange={(e) =>
                        handleTicketChange(idx, "price", e.target.value)
                      }
                      min="0"
                      step="0.01"
                      style={{ maxWidth: 120 }}
                    />
                    <Form.Control
                      type="number"
                      placeholder="Quantidade"
                      value={ticket.quantity_available}
                      onChange={(e) =>
                        handleTicketChange(
                          idx,
                          "quantity_available",
                          e.target.value,
                        )
                      }
                      min="0"
                      step="1"
                      style={{ maxWidth: 100 }}
                    />
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => handleRemoveTicket(idx)}
                      disabled={ticketsForm.length === 1}
                      style={{ padding: "0.2rem 0.6rem" }}
                    >
                      X
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddTicket}
                  style={{ marginTop: 8 }}
                >
                  + Adicionar Bilhete
                </Button>
              </div>
              <Form.Group className="mb-3">
                <Form.Label>Título</Form.Label>
                <Form.Control
                  ref={eventTitleRef}
                  type="text"
                  name="title"
                  value={eventForm.title}
                  onChange={handleEventFormChange}
                  isInvalid={!!eventErrors.title}
                />
                <Form.Control.Feedback type="invalid">
                  {eventErrors.title}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Descrição</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={eventForm.description}
                  onChange={handleEventFormChange}
                  isInvalid={!!eventErrors.description}
                />
                <Form.Control.Feedback type="invalid">
                  {eventErrors.description}
                </Form.Control.Feedback>
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Data e Hora</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="event_date"
                      value={eventForm.event_date}
                      onChange={handleEventFormChange}
                      isInvalid={!!eventErrors.event_date}
                    />
                    <Form.Control.Feedback type="invalid">
                      {eventErrors.event_date}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Localização</Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      value={eventForm.location}
                      onChange={handleEventFormChange}
                      isInvalid={!!eventErrors.location}
                    />
                    <Form.Control.Feedback type="invalid">
                      {eventErrors.location}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Categoria</Form.Label>
                    <Form.Select
                      name="id_category"
                      value={eventForm.id_category}
                      onChange={handleEventFormChange}
                      isInvalid={!!eventErrors.id_category}
                    >
                      <option value="">Selecionar categoria</option>
                      {categories.map((category) => (
                        <option
                          key={category.id_category}
                          value={category.id_category}
                        >
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {eventErrors.id_category}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Imagem do Evento</Form.Label>
                <Form.Control
                  type="file"
                  name="image"
                  onChange={handleEventFormChange}
                  accept="image/*"
                />
                {eventForm.image_preview && (
                  <div style={{ marginTop: 8 }}>
                    <img
                      src={eventForm.image_preview}
                      alt="Preview do evento"
                      style={{ maxWidth: 200, maxHeight: 120, borderRadius: 8 }}
                    />
                  </div>
                )}
                <Form.Text className="text-muted">
                  A edição da imagem é opcional. Se não escolheres uma nova, a
                  imagem atual será mantida.
                </Form.Text>
              </Form.Group>
              {eventErrors.submit && (
                <Message type="danger">{eventErrors.submit}</Message>
              )}
            </Form>
          </Modal.Body>

          {/* butoes de acçao do modal  */}
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowEventModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitEvent}
              disabled={eventSubmitting}
            >
              {eventSubmitting ? <Spinner size="sm" /> : "Guardar"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de Confirmação de delete */}
        <Modal
          show={showConfirmModal}
          onHide={() => setShowConfirmModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirmar Eliminação</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Tem a certeza que pretende eliminar este evento?</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? <Spinner size="sm" /> : "Eliminar"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default EventCrudPage;
