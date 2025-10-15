import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Container, Row, Col, Carousel } from "react-bootstrap";
import Button from "../components/UI/Button";
import Spinner from "../components/UI/Spinner";
import Message from "../components/UI/Message";
import EventCard from "../components/events/EventCard";
import { getAllEvents } from "../services/eventService";
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

const Scale = keyframes`
    0% {
    transform: scale(0);
  }

  100% {
    transform: scale(1);
  }
`;

const HomePageContainer = styled.div`
  animation: ${Show} 1.2s ease-out;
`;

// Styled-component para o hero da página
const Hero = styled.div`
  background:
    linear-gradient(rgba(106, 17, 203, 0.7), rgba(37, 117, 252, 0.7)),
    url("/images/hero-bg.jpg");
  background-size: cover;
  background-position: center;
  color: var(--white-color);
  padding: 6rem 0;
  text-align: center;
  margin-bottom: 3rem;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);

  @media only screen and (${devices.tablet}) {
    padding: 4rem 0;
  }

  @media only screen and (${devices.mobile}) {
    padding: 3rem 0;
  }
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

  @media only screen and (${devices.tablet}) {
    font-size: 2.5rem;
  }

  @media only screen and (${devices.mobile}) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2.5rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);

  @media only screen and (${devices.tablet}) {
    font-size: 1.2rem;
  }

  @media only screen and (${devices.mobile}) {
    font-size: 1rem;
  }
`;

const SectionTitle = styled.h2`
  color: var(--primary-color);
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 700;

  @media only screen and (${devices.tablet}) {
    font-size: 1.8rem;
  }
`;

const CategoryCard = styled.div`
  background-color: var(--white-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  height: 100%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  animation: ${Scale} 1s ease-out;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(
      90deg,
      var(--primary-color),
      var(--secondary-color)
    );
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s ease;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }

  &:hover::before {
    transform: scaleX(1);
  }

  h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
    font-weight: 600;
    font-size: 1.4rem;
  }

  p {
    color: var(--text-color);
    margin-bottom: 1.5rem;
  }

  .icon {
    font-size: 2.5rem;
    color: var(--primary-color);
    margin-bottom: 1.2rem;
  }
`;

const FeaturedSection = styled.section`
  padding: 4rem 0;

  h2 {
    color: var(--primary-color);
    text-align: center;
    margin-bottom: 2.5rem;
    font-weight: 700;
    position: relative;
    padding-bottom: 15px;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 3px;
      background: linear-gradient(
        90deg,
        var(--primary-color),
        var(--secondary-color)
      );
    }
  }
`;

const CategoriesSection = styled.section`
  padding: 4rem 0;
  background-color: var(--light-bg-color);
  border-radius: var(--border-radius);
  margin-bottom: 3rem;

  h2 {
    color: var(--primary-color);
    text-align: center;
    margin-bottom: 2.5rem;
    font-weight: 700;
    position: relative;
    padding-bottom: 15px;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 3px;
      background: linear-gradient(
        90deg,
        var(--primary-color),
        var(--secondary-color)
      );
    }
  }
`;

const TestimonialsSection = styled.section`
  padding: 3rem 0;
  background-color: var(--white-color);
  border-radius: var(--border-radius);
  margin-bottom: 3rem;
`;

const TestimonialCard = styled.div`
  background-color: var(--light-bg-color);
  border-radius: var(--border-radius);
  padding: 2rem;
  margin: 1rem;
  text-align: center;

  .quote {
    font-size: 1.2rem;
    font-style: italic;
    margin-bottom: 1.5rem;
    color: var(--text-color);
  }

  .author {
    font-weight: 700;
    color: var(--primary-color);
  }

  .rating {
    color: var(--warning-color);
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
`;

const StyledCarousel = styled(Carousel)`
  .carousel-indicators button {
    background-color: var(--primary-color);
  }

  .carousel-control-prev-icon,
  .carousel-control-next-icon {
    background-color: var(--primary-color);
    border-radius: 50%;
    padding: 1rem;
  }
`;

const EventsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;

  @media only screen and (${devices.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media only screen and (${devices.mobileG}) {
    grid-template-columns: 1fr;
  }
`;

const ViewMoreContainer = styled.div`
  text-align: center;
  margin-top: 2rem;
`;

const HomePage = () => {
  // Estado para eventos em destaque, categorias, loading e error
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect() para Obter eventos em destaque e categorias
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obter eventos usando o serviço atualizado
        const eventsResponse = await getAllEvents();

        if (eventsResponse.success) {
          // Filtrar apenas eventos com status 'ativo' ou 'terminado'
          const onlyValid = (eventsResponse.events || []).filter(
            (ev) => ev.status === "ativo" || ev.status === "terminado",
          );
          // Separar ativos e terminados
          const ativos = onlyValid.filter((ev) => ev.status === "ativo");
          const terminados = onlyValid.filter(
            (ev) => ev.status === "terminado",
          );
          // Juntar até 6, ativos primeiro
          const destaque = [...ativos, ...terminados].slice(0, 6);
          setFeaturedEvents(destaque);
        } else {
          setError("Erro ao carregar eventos em destaque");
        }

        // Obter categorias com tokens SHA256
        const categoriesResponse = await getAllCategories();

        if (categoriesResponse.success) {
          // Definir categorias com dados da API incluindo tokens SHA256
          setCategories(categoriesResponse.data);
        } else {
          // Fallback para categorias estáticas se API falhar
          console.warn(
            "Falha ao carregar categorias da API, usando dados estáticos",
          );
          setCategories([
            {
              id_category: 1,
              name: "Música",
              description:
                "Concertos, festivais e todos os eventos relacionados com música ao vivo.",
            },
            {
              id_category: 2,
              name: "Desporto",
              description:
                "Eventos desportivos, maratonas, jogos e competições.",
            },
            {
              id_category: 3,
              name: "Teatro",
              description:
                "Peças teatrais, espetáculos e performances artísticas.",
            },
            {
              id_category: 4,
              name: "Cinema",
              description:
                "Estreias de filmes, festivais de cinema e sessões especiais.",
            },
            {
              id_category: 5,
              name: "Arte",
              description:
                "Exposições, galerias e eventos culturais, workshops.",
            },
            {
              id_category: 6,
              name: "Gastronomia",
              description:
                "Eventos gastronómicos, feiras e festivais de comida.",
            },
          ]);
        }
      } catch (error) {
        // FIXME: ERRO: erro ao buscar eventos em destaque e categorias
        console.error("Erro na requisição:", error);

        // Definir erro de comunicação com o servidor
        setError("Erro ao comunicar com o servidor. Verifique a conexão com o backend.");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Renderiza ícones relacionados com base no nome da categoria
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();

    if (
      name.includes("music") ||
      name.includes("música") ||
      name.includes("concert")
    ) {
      return "fa-music";
    } else if (name.includes("sport") || name.includes("desporto")) {
      return "fa-futbol";
    } else if (name.includes("theater") || name.includes("teatro")) {
      return "fa-theater-masks";
    } else if (
      name.includes("cinema") ||
      name.includes("film") ||
      name.includes("filme")
    ) {
      return "fa-film";
    } else if (name.includes("art") || name.includes("arte")) {
      return "fa-paint-brush";
    } else if (
      name.includes("gastro") ||
      name.includes("food") ||
      name.includes("alimentação")
    ) {
      return "fa-utensils";
    } else {
      return "fa-calendar-alt";
    }
  };

  // Objecto para o testemunhos
  const testimonials = [
    {
      id: 1,
      quote:
        "EventHive tornou a compra de bilhetes para concertos muito mais fácil. Recomendo a todos!",
    },
  ];

  // Renderiza estrelas de avaliação
  const renderStars = (rating) => {
    const stars = [];

    for (let i = 1; i <= 5; i++) {
    }

    return stars;
  };

  return (
    <>
      <HomePageContainer className="Home-Page">
        {/* secçao Hero */}
        <Hero className="home-hero">
          <Container className="home-hero-container">
            <HeroTitle className="home-hero-title">
              Descubra Eventos Incríveis
            </HeroTitle>
            <HeroSubtitle className="home-hero-subtitle">
              A plataforma perfeita para encontrar e comprar bilhetes para os
              melhores eventos em Portugal.
            </HeroSubtitle>
            <Link to="/events" className="home-hero-link">
              <Button className="home-hero-button">Explorar Eventos</Button>
            </Link>
          </Container>
        </Hero>

        {/* secçao Eventos*/}
        <Container className="home-featured-events-container">
          {/* secçao Eventos em Destaque */}
          <FeaturedSection className="home-featured-section">
            <SectionTitle className="home-featured-section-title">
              Eventos em Destaque
            </SectionTitle>

            {loading ? (
              <div className="home-spinner-container text-center py-5">
                <Spinner />
              </div>
            ) : error ? (
              <div className="home-error-message text-center py-4">
                <Message type="danger">{error}</Message>
                <ViewMoreContainer
                  style={{ marginTop: "1rem" }}
                  className="home-view-more-container"
                >
                  <Link to="/events" className="home-link">
                    <Button className="home-button">
                      Ver Todos os Eventos
                    </Button>
                  </Link>
                </ViewMoreContainer>
              </div>
            ) : featuredEvents.length > 0 ? (
              <>
                <EventsContainer className="home-events-grid">
                  {featuredEvents.map((event) => (
                    <EventCard
                      key={event.id_event}
                      event={event}
                      className="home-event-card"
                      buttonText={
                        event.status === "terminado"
                          ? "Evento Terminado"
                          : undefined
                      }
                    />
                  ))}
                </EventsContainer>

                <ViewMoreContainer className="home-view-more-container">
                  <Link to="/events" className="home-link">
                    <Button className="home-button">
                      Ver Todos os Eventos
                    </Button>
                  </Link>
                </ViewMoreContainer>
              </>
            ) : (
              <div className="home-empty-message text-center py-4">
                <p>Nenhum evento em destaque disponível no momento.</p>
              </div>
            )}
          </FeaturedSection>

          {/* Secção para explorar por Categorias */}
          <CategoriesSection className="home-categories-section">
            <SectionTitle className="home-categories-title">
              Explore por Categoria
            </SectionTitle>

            {loading ? (
              <div className="home-spinner-container text-center py-5">
                <Spinner />
              </div>
            ) : categories.length > 0 ? (
              <Row>
                {categories.slice(0, 6).map((category) => (
                  <Col
                    key={category.id_category}
                    md={6}
                    lg={4}
                    className="mb-4 d-flex"
                  >
                    <CategoryCard className="home-category-card w-100">
                      <div className="home-category-icon">
                        <i
                          className={`fas ${getCategoryIcon(category.name)}`}
                          style={{
                            fontSize: "1.5rem",
                            color: "var(--primary-color)",
                          }}
                        ></i>
                      </div>
                      <h3>{category.name}</h3>
                      <p>
                        {category.description
                          ? category.description.substring(0, 100) + "..."
                          : "Categoria sem descrição disponível."}
                      </p>
                      {/* Utilizar o ID da categoria diretamente na URL para simplicidade */}
                      <Link
                        to={`/events?category=${category.id_category}`}
                        className="home-link"
                      >
                        <Button className="home-button">Explorar</Button>
                      </Link>
                    </CategoryCard>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="home-empty-message text-center py-4">
                <p>Nenhuma categoria disponível no momento.</p>
              </div>
            )}
          </CategoriesSection>

          {/* Seção de testimonials */}
          <TestimonialsSection className="home-testimonials-section">
            <SectionTitle className="home-testimonials-title">
              O Que Dizem os Nossos Clientes
            </SectionTitle>

            <StyledCarousel className="home-testimonials-carousel">
              {testimonials.map((testimonial) => (
                <Carousel.Item key={testimonial.id}>
                  <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                      <TestimonialCard className="home-testimonial-card">
                        <div className="home-testimonial-rating rating">
                          {renderStars(testimonial.rating)}
                        </div>
                        <p className="home-testimonial-quote quote">
                          "{testimonial.quote}"
                        </p>
                        <p className="home-testimonial-author author">
                          — {testimonial.author}
                        </p>
                      </TestimonialCard>
                    </Col>
                  </Row>
                </Carousel.Item>
              ))}
            </StyledCarousel>
          </TestimonialsSection>

          {/* secçion para explorar todos os eventos */}
          <div className="home-explore-all-section text-center py-5">
            <SectionTitle className="home-explore-all-title mb-4">
              Pronto para encontrar o seu próximo evento?
            </SectionTitle>
            <Link to="/events" className="home-link">
              <Button className="home-button" size="lg">
                Explorar Todos os Eventos
              </Button>
            </Link>
          </div>
        </Container>
      </HomePageContainer>
    </>
  );
};

export default HomePage;
