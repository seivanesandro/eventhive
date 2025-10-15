import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  Container,
  Row,
  Col,
  ListGroup,
  Badge,
  Form,
  InputGroup,
} from "react-bootstrap";
import CartContext from "../context/CartContext";
import AuthContext from "../context/AuthContext";
import Button from "../components/UI/Button";
import Message from "../components/UI/Message";
import Spinner from "../components/UI/Spinner";
import { getEventDetailsByToken } from "../services/eventService";
import api from "../services/api";
import { devices } from "../assets/utils/constantes";

const Show = keyframes`
    0%{
        opacity:0;
    }
    50%{
        opacity:0.5;
    }

    100%{
        opacity:1;
    }
`;

const EventDetailContainer = styled.div`
  background: var(--white-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem;
  margin-bottom: 2rem;
  animation: ${Show} 1.2s ease-out;
`;

const EventTitle = styled.h2`
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-weight: 700;

  @media only screen and (${devices.tablet}) {
    font-size: 1.8rem;
  }
`;

const EventImage = styled.img`
  width: 100%;
  height: 350px;
  object-fit: cover;
  border-radius: var(--border-radius);
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  @media only screen and (${devices.tablet}) {
    height: 250px;
  }
`;

const EventDescription = styled.p`
  margin-bottom: 1.5rem;
  line-height: 1.6;
  color: var(--text-color);
`;

const EventInfo = styled.div`
  margin-bottom: 1.5rem;
`;

const TicketsContainer = styled.div`
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;

  .list-group-item {
    padding: 1rem;
    border: 1px solid #eee;
    margin-bottom: 0.5rem;
    border-radius: var(--border-radius);
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #f9f9f9;
    }
  }

  .ticket-info {
    flex: 1;
  }
`;

const TicketsTitle = styled.h3`
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-weight: 600;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  width: 120px;

  .input-group {
    display: flex;
    flex-direction: row;
    width: 100%;
  }

  .form-control {
    text-align: center;
    padding: 0.25rem 0.5rem;
    height: auto;
    width: 40px;
    border-radius: 0;
  }

  .button-component {
    padding: 0.25rem 0.5rem;
    height: 31px;
    width: 31px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    font-size: 0.9rem;
  }

  .form-control {
    height: 38px;
    padding: 0;
    font-size: 0.875rem;
    text-align: center;
    width: 40px;
    flex: 0 0 auto;
    border-radius: 0;
    margin: 0;
    border-left: none;
    border-right: none;
    box-shadow: none;
    appearance: textfield;
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  .btn {
    padding: 0;
    font-size: 1rem;
    line-height: 1;
    height: 38px;
    width: 40px;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    background-color: var(--white-color);
    color: var(--primary-color);
    border: 1px solid #ced4da;
    font-weight: bold;

    &:disabled {
      opacity: 0.5;
      color: #6c757d;
    }
  }

  .btn:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .btn:last-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
`;

const TotalPrice = styled.div`
  margin-top: 0.5rem;
  font-weight: 600;
  color: var(--primary-color);
`;

const EventDetailPage = () => {
  //  Extrair o token do evento da URL
  const { id: encodedEventToken } = useParams();

  // Decodificar o token da URL se estiver encoded
  const eventToken = decodeURIComponent(encodedEventToken || "");
  
  // useNavigate() para redirecionar o utilizador
  const navigate = useNavigate();

  // useState() para controlo do evento, loading e erros
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [ticketQuantities, setTicketQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  // useContext() para obter o acesso ao carrinho e a autenticação
  const { addToCart } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);

  // useEffect para carregar detalhes do evento e validar token com redirecionamento 404
  useEffect(() => {
    // Carregar detalhes do evento usando o token com validação 404
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        
        if (!eventToken || eventToken.length < 2) {
          // Token inválido - redirecionar para página 404
          navigate('/404');
          return;
        }
        
        const response = await getEventDetailsByToken(eventToken);
        
        if (response.success && response.event) {
          if (response.event.status !== "ativo") {
            setError("Evento não está ativo.");
            setEvent(null);
            setTickets([]);
            return;
          }
          setEvent(response.event);
          const ticketsData = response.tickets || [];
          setTickets(ticketsData);
          const initialQuantities = {};
          ticketsData.forEach((ticket) => {
            initialQuantities[ticket.id_ticket] = 1;
          });
          setTicketQuantities(initialQuantities);
        } else {
          // Evento não encontrado - redirecionar para página 404
          navigate('/404');
          return;
        }
      } catch (error) {
        //FIXME: Erro de comunicação - redirecionar para página 404
        console.error('Erro ao carregar detalhes do evento:', error);
        navigate('/404');
        return;
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, [eventToken, navigate]);

  // função para formatar a data do evento para exibição
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // função para atualizar a quantidade de bilhetes selecionada para um determinado tipo de bilhete no evento
  const handleQuantityChange = (ticketId, value) => {
    const quantity = parseInt(value);
    if (isNaN(quantity) || quantity < 1) return;

    // obter o bilhete para validar disponibilidade
    const ticket = tickets.find((t) => t.id_ticket === ticketId);
    if (ticket && quantity > ticket.quantity_available) return;

    setTicketQuantities({
      ...ticketQuantities,
      [ticketId]: quantity,
    });
  };

  // função para adicionar bilhete ao carrinho
  const handleAddToCart = async (ticket) => {
    // validar se o utilizador esta autenticado  senao reencaminhar para a pagina login
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Verificar se a quantidade é válida
    const quantity = ticketQuantities[ticket.id_ticket] || 1;

    // Verificar disponibilidade do bilhete
    if (quantity > ticket.quantity_available) {
      setError(`Apenas ${ticket.quantity_available} bilhetes disponíveis.`);
      return;
    }

    try {
      // Adicionar ao carrinho do backend
      await api.post("/cart/add_to_cart.php", {
        ticket_id: ticket.id_ticket,
        quantity: quantity,
      });

      // Adicionar ao carrinho local
      const cartItem = {
        id: ticket.id_ticket,
        eventId: event.id_event,
        eventTitle: event.title,
        ticketType: ticket.ticket_type,
        price: ticket.price,
        quantity: quantity,
      };

      addToCart(cartItem);
      setAddedToCart(true);

      // função para limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    } catch (error) {
      setError("Erro ao adicionar ao carrinho. Tente novamente.");

      //FIXME: ERRO: log do erro ao adicionar ao carrinho
      console.error("Erro ao adicionar ao carrinho:", error);
    }
  };

  // função para Calcular preço total baseado na quantidade
  const calculateTotal = (price, ticketId) => {
    const quantity = ticketQuantities[ticketId] || 1;
    return (price * quantity).toFixed(2);
  };

  //FIXME: log para mostrar tickets recebidos
  console.log("Tickets recebidos:", tickets);

  // Filtrar tickets duplicados por id_ticket
  const uniqueTickets = tickets.filter(
    (ticket, index, self) =>
      index === self.findIndex((t) => t.id_ticket === ticket.id_ticket),
  );

  return (
    <>
      <Container className="event-detail-container">
        {loading ? (
          <LoadingContainer className="event-detail-container-loading">
            <Spinner />
          </LoadingContainer>
        ) : error ? (
          <Message type="danger" className="event-detail-error-message">
            {error}
          </Message>
        ) : event ? (
          <EventDetailContainer className="Event-Detail">
            <Row>
              <Col lg={8} className="mx-auto">
                {/* Butão para voltar a pagina eventos */}
                <div className="mb-4">
                  <Button
                    onClick={() => navigate(-1)}
                    className="event-detail-btn"
                  >
                    <i className="fas fa-arrow-left mr-2"></i> Voltar
                  </Button>
                </div>

                {/*imagem do evento */}
                {event.image_url && (
                  <EventImage
                    src={
                      event.image_url && !/^https?:\/\//i.test(event.image_url)
                        ? `http://localhost${event.image_url}`
                        : event.image_url
                    }
                    alt={event.title}
                    className="event-details-image-url"
                  />
                )}

                <EventTitle className="event-detail-title">
                  {event.title}
                </EventTitle>
                {/* informaçao sobre o evento  */}
                <EventInfo className="event-detail-info">
                  <ListGroup
                    $variant="flush"
                    className="event-detail-list-group"
                  >
                    <ListGroup.Item className="event-detail-list-item">
                      <strong>Data:</strong> {formatEventDate(event.event_date)}
                    </ListGroup.Item>
                    <ListGroup.Item className="event-detail-list-item">
                      <strong>Local:</strong> {event.location}
                    </ListGroup.Item>
                    <ListGroup.Item className="event-detail-list-item">
                      <strong>Categoria:</strong>{" "}
                      <Badge bg="primary">
                        <span>{event.category_name}</span>
                      </Badge>
                    </ListGroup.Item>
                  </ListGroup>
                </EventInfo>

                {/* Descrição do evento */}
                <EventDescription className="event-details-description">
                  {event.description}
                </EventDescription>
                {/* container de visualizaçao de tickets */}
                <TicketsContainer className="event-detail-tickets-container">
                  <TicketsTitle className="event-detail-title">
                    Bilhetes Disponíveis
                  </TicketsTitle>

                  {/* Mensagem de sucesso ao adicionar ao carrinho */}
                  {addedToCart && (
                    <Message
                      type="success"
                      className="event-detail-added-message"
                    >
                      Bilhete adicionado ao carrinho com sucesso!
                    </Message>
                  )}

                  {/* container de controlo de bilhetes */}
                  {uniqueTickets.length > 0 ? (
                    <ListGroup className="event-detail-tickets-list">
                      {uniqueTickets.map((ticket) => (
                        <ListGroup.Item
                          key={ticket.id_ticket}
                          className="d-flex justify-content-between align-items-start"
                        >
                          <div className="event-details-ticket-info">
                            <strong>{ticket.ticket_type}</strong>
                            <p className="mb-0 event-details-ticket-price">
                              Preço unitário:{" "}
                              {parseFloat(ticket.price).toFixed(2)}€
                            </p>
                            <small className="event-details-ticket-quantity-available">
                              Disponíveis: {ticket.quantity_available}
                            </small>

                            {/* quantidade de control e componentes bootstrap butao de adicionar, diminuir e input numerico, total price, butao de adicionar ao carrinho ou de esgotado */}
                            <div className="d-flex align-items-center mt-2">
                              <QuantityControl className="event-details-quantity-control">
                                <InputGroup size="sm" className="flex-nowrap">
                                  <Button
                                    onClick={() =>
                                      handleQuantityChange(
                                        ticket.id_ticket,
                                        Math.max(
                                          1,
                                          (ticketQuantities[ticket.id_ticket] ||
                                            1) - 1,
                                        ),
                                      )
                                    }
                                    disabled={ticket.quantity_available <= 0}
                                    aria-label="Diminuir quantidade"
                                    className="quantity-btn-decrease"
                                    style={{
                                      fontSize: "0.9rem",
                                      padding: "0.3rem 0.5rem",
                                      margin: "0",
                                    }}
                                  >
                                    －
                                  </Button>
                                  <Form.Control
                                    type="number"
                                    value={
                                      ticketQuantities[ticket.id_ticket] || 1
                                    }
                                    min="1"
                                    max={ticket.quantity_available}
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        ticket.id_ticket,
                                        parseInt(e.target.value) || 1,
                                      )
                                    }
                                    disabled={ticket.quantity_available <= 0}
                                    aria-label="Quantidade"
                                    className="text-center px-1 quantity-input"
                                    style={{ width: "40px", height: "31px" }}
                                  />
                                  <Button
                                    onClick={() =>
                                      handleQuantityChange(
                                        ticket.id_ticket,
                                        Math.min(
                                          ticket.quantity_available,
                                          (ticketQuantities[ticket.id_ticket] ||
                                            1) + 1,
                                        ),
                                      )
                                    }
                                    disabled={
                                      ticket.quantity_available <= 0 ||
                                      (ticketQuantities[ticket.id_ticket] ||
                                        1) >= ticket.quantity_available
                                    }
                                    aria-label="Aumentar quantidade"
                                    className="quantity-btn-increase"
                                    style={{
                                      fontSize: "0.9rem",
                                      padding: "0.3rem 0.5rem",
                                      margin: "0",
                                    }}
                                  >
                                    ＋
                                  </Button>
                                </InputGroup>
                              </QuantityControl>
                            </div>

                            {/* preço total */}
                            <TotalPrice className="event-details-total-price">
                              Total:{" "}
                              {calculateTotal(ticket.price, ticket.id_ticket)}€
                            </TotalPrice>
                          </div>

                          <Button
                            size="sm"
                            className="align-self-center ms-2 btn event-details-btn-add-to-cart"
                            onClick={() => handleAddToCart(ticket)}
                            disabled={ticket.quantity_available <= 0}
                          >
                            {ticket.quantity_available <= 0
                              ? "Esgotado"
                              : "Adicionar ao Carrinho"}
                          </Button>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <Message type="event-detail-no-tickets">
                      Não existem bilhetes disponíveis para este evento.
                    </Message>
                  )}
                </TicketsContainer>
              </Col>
            </Row>
          </EventDetailContainer>
        ) : (
          <Message type="danger">Evento não encontrado.</Message>
        )}
      </Container>
    </>
  );
};

export default EventDetailPage;
