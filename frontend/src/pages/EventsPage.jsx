import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Container, Row, Col, Form, InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import EventCard from "../components/events/EventCard";
import Message from "../components/UI/Message";
import Spinner from "../components/UI/Spinner";
import { getAllEvents, getEventsByCategory } from "../services/eventService";
import { getAllCategories } from "../services/categoryService";
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

const EventsContainer = styled.div`
  padding: 2rem;
  background: var(--white-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  margin-bottom: 2rem;
  animation: ${Show} 1.2s ease-out;
`;

const PageTitle = styled.h2`
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 700;

  @media only screen and (${devices.tablet}) {
    font-size: 1.8rem;
  }
`;

const FiltersContainer = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--background-color);
  border-radius: var(--border-radius);
`;

const NoEventsMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-color);
  font-weight: 500;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const EventsPage = () => {
  // Hook para obter informações da localização atual e navegação
  const location = useLocation();
  const navigate = useNavigate();
  
  // estados para controlo de eventos, carregamento e erros
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Estados para categorias dinâmicas da base de dados
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  // useEffect para processar ID da categoria da URL e carregar eventos filtrados
  useEffect(() => {
    const processCategory = async () => {
      const urlParams = new URLSearchParams(location.search);
      const categoryId = urlParams.get('category');
      
      try {
        setLoading(true);
        setError(null);
        
        let eventsResponse;
        
        if (categoryId) {
          // FIXME: mostra o ID da categoria no console
          console.log(`Processando categoria com ID: ${categoryId}`);
          setSelectedCategory(categoryId);
          
          // Usar o novo endpoint para obter eventos por categoria
          eventsResponse = await getEventsByCategory(categoryId);

          //FIXME: Log detalhado da resposta dos eventos
          console.log(`Obtendo eventos para categoria ${categoryId}:`, eventsResponse);
        } else {
          setSelectedCategory("");
          
          // Se não houver categoria selecionada, obter todos os eventos
          eventsResponse = await getAllEvents();
        }
        
        // Processar resposta dos eventos - filtrar apenas eventos ativos
        if (eventsResponse.success) {
          const onlyActive = eventsResponse.events.filter((event) => event.status === 'ativo');

          //FIXME: Log detalhado dos eventos ativos
          console.log(`Obtidos ${eventsResponse.events.length} eventos, ${onlyActive.length} ativos`);

          const eventsByCategory = {};
          onlyActive.forEach(event => {
            const catId = event.id_category || 'sem_categoria';
            if (!eventsByCategory[catId]) {
              eventsByCategory[catId] = [];
            }
            eventsByCategory[catId].push(event.title);
          });
          
          // FIXME: Log detalhado de eventos activos por categoria
          console.log('Eventos ativos por categoria:', eventsByCategory);
          
          setEvents(onlyActive);
          setFilteredEvents(onlyActive);
        } else {
          setError(
            "Não foi possível carregar os eventos. Por favor, tente novamente mais tarde.",
          );
        }
      } catch (error) {
        // FIXME: ERRO: log detalhado do erro
        console.error("Erro ao obter eventos:", error);
        setError(
          "Erro ao comunicar com o servidor. Por favor, tente novamente mais tarde.",
        );
      } finally {
        setLoading(false);
      }
    };

    processCategory();
  }, [location.search]);

  // useEffect separado para obter categorias do backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);

        // Obter categorias
        const categoriesResponse = await getAllCategories();

        // Obter eventos para filtrar categorias com eventos
        const eventsResponse = await getAllEvents();
        let idsCategoriasComEvento = [];
        if (eventsResponse.success) {
          idsCategoriasComEvento = Array.from(new Set((eventsResponse.events || []).map(ev => ev.id_category)));
        }

        // Processar resposta das categorias
        if (categoriesResponse.success) {
          // Filtrar categorias para mostrar só as que têm eventos
          const categoriasFiltradas = categoriesResponse.data.filter(cat => idsCategoriasComEvento.includes(cat.id_category));
          setCategories(categoriasFiltradas);
        } else {
          setCategoriesError("Erro ao carregar categorias");
          setCategories([]);
        }
      } catch (error) {

        // FIXME: ERRO: log detalhado da requesiçao de categorias 
        console.error("Erro na requisição de categorias:", error);
        setCategoriesError("Erro ao carregar categorias");
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // useEffect para filtragem de eventos em tempo real quando os critérios mudam
  useEffect(() => {
    if (!events.length) return;

    let result = [...events];

    // Filtrar por termo de pesquisa
    if (searchTerm) {
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.category_name && event.category_name.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    setFilteredEvents(result);
  }, [searchTerm, events]);

  // Função para gerir alterações no campo de pesquisa
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // função para gerir alterações na seleção de categoria
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    
    // Atualizar a URL quando o utilizador seleciona uma categoria
    if (categoryId) {
      navigate(`/events?category=${categoryId}`);
    } else {
      navigate('/events');
    }
  };

  return (
    <>
      <Container className="events-page-container">
        <EventsContainer className="events-main-container">
          <PageTitle className="events-title">Descubra Eventos</PageTitle>

          {/* secção Filtros */}
          <FiltersContainer className="events-filters-container">
            <Row className="events-filters-row">
              <Col md={8} className="events-search-col">
                {/* formulario de pesquisa e componente select em bootstrap */}
                <Form.Group className="mb-3 events-search-group">
                  {/* input de pesquisa */}
                  <InputGroup className="events-search-input-group">
                    <InputGroup.Text
                      style={{ height: "38px" }}
                      className="events-search-icon"
                    >
                      <FaSearch />
                    </InputGroup.Text>

                    <Form.Control
                      type="text"
                      placeholder="Pesquisar eventos por título, descrição, local ou categoria..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      style={{ height: "38px" }}
                      className="events-search-input"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={4} className="events-category-col">
                {/* select com as categorias dinâmicas da base de dados */}
                <Form.Group className="mb-3 events-category-group">
                  <Form.Select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="events-category-select"
                    disabled={categoriesLoading}
                  >
                    <option value="" className="events-category-option">
                      {categoriesLoading ? "A carregar categorias..." : "Todas as categorias"}
                    </option>
                    {categories.map((category) => (
                      <option
                        key={category.id_category}
                        value={category.id_category}
                        className="events-category-option"
                      >
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                  
                  {/* Mostrar erro das categorias se existir */}
                  {categoriesError && (
                    <div className="text-danger small mt-1">
                      {categoriesError}
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </FiltersContainer>

          {/* se existir um erro renderiza o componente message, mas só se não for ausência de eventos */}
          {error && !selectedCategory && (
            <Message type="danger" className="events-error-message">
              {error}
            </Message>
          )}

          {/* faz o loading enquanto nao houver eventos ou mensagem de "Não existem eventos associados a esta categoria." caso não haja eventos */}
          {loading ? (
            <LoadingContainer className="events-loading-container">
              <Spinner className="events-spinner" />
            </LoadingContainer>
          ) : (
            <div className="events-list-container">
              {/* Lista de eventos */}
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <EventCard
                    key={event.id_event}
                    event={event}
                    className="event-card-item"
                  />
                ))
              ) : selectedCategory ? (
                <NoEventsMessage className="events-no-events-message">
                  Não existem eventos associados a esta categoria.
                </NoEventsMessage>
              ) : (
                <NoEventsMessage className="events-no-events-message">
                  Nenhum evento encontrado com os filtros selecionados.
                </NoEventsMessage>
              )}
            </div>
          )}
        </EventsContainer>
      </Container>
    </>
  );
};

export default EventsPage;
