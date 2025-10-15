import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Container, Tabs, Tab } from "react-bootstrap";
import AuthContext from "../context/AuthContext";
import Spinner from "../components/UI/Spinner";
import api from "../services/api";
import EventCrudPage from "./event_crud_page";
import UsersCrudPage from "./users_crud_page";
import CategoriesCrudPage from "./categories_crud_page";
import ListOrdersPage from "./list_orders_page";
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

const DashboardContainer = styled.div`
  background: var(--white-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem;
  margin-bottom: 2rem;
  animation: ${Show} 1.5s ease-out;
`;

const TabsWrapper = styled.div`
  .nav-tabs {
    border-bottom: 1px solid var(--primary-color);
    background: #fff;

    @media only screen and (${devices.mobileG}) {
      overflow-x: auto;
      white-space: nowrap;
      flex-wrap: nowrap !important;
      display: flex;
      -webkit-overflow-scrolling: touch;
    }
  }

  .nav-tabs .nav-link {
    font-size: 1rem;
    font-weight: 600;
    color: var(--primary-color);

    @media only screen and (${devices.mobileG}) {
      min-width: 120px;
      text-align: center;
    }
  }

  .tab-content {
    width: 100%;
  }
`;

const DashboardTitle = styled.h1`
  color: var(--primary-color);
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 700;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;

  @media only screen and (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media only screen and (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background-color: ${(props) => props.$bgcolor || "var(--white-color)"};
  color: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  text-align: center;
  box-shadow: var(--box-shadow);
  h3 {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  p {
    font-size: 1rem;
    margin: 0;
    opacity: 0.8;
  }
`;

const AdminDashboardPage = () => {
  // unseCOntqext para obter o utilizador autenticado
  const { user } = useContext(AuthContext);

  //useNavigate para navegação
  const navigate = useNavigate();

  // Estado para controlar a tab ativa
  const [activeTab, setActiveTab] = useState("events");

  // Estado para as estatísticas do dashboard
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalUsers: 0,
    totalSales: 0,
    revenue: 0,
  });

  // Obter estatísticas reais do backend ao montar o componente
  useEffect(() => {
    // Obter estatísticas reais do backend PHP
    const fetchRealStats = async () => {
      try {
        // Chamada a API para obter estatísticas reais
        const response = await api.get("/admin/dashboard_stats.php");
        // Validar resposta e atualizar o estado
        if (response.data && response.data.success) {
          setStats({
            totalEvents: response.data.totalEvents,
            totalUsers: response.data.totalUsers,
            totalSales: response.data.totalSales,
            revenue: response.data.revenue,
          });
        } else {
          // Se a resposta não for válida, mostrar 0
          setStats({
            totalEvents: 0,
            totalUsers: 0,
            totalSales: 0,
            revenue: 0,
          });
        }
      } catch (error) {
        setStats({totalEvents: 0, totalUsers: 0, totalSales: 0, revenue: 0});

        //FIXME: Erro: log do erro ao buscar estatísticas reais do dashboard
        console.error("Erro ao buscar estatísticas reais do dashboard:", error);
      }
    };
    fetchRealStats();
  }, []);

  // Função para formatar preços
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "0,00€";
    try {
      const numPrice = parseFloat(price);
      return numPrice.toFixed(2).replace(".", ",") + "€";
    } catch (error) {
      return "0,00€";
    }
  };

  // Verificar se o utilizador é administrador, role=1
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        try {
          const response = await api.get("/auth/profile.php");
          if (!response.data.success || response.data.user.id_role !== 1) {
            navigate("/login");
          }
        } catch (error) {
          //FIXME: ERRO: log do erro ao verificar permissão de admin
          console.error("Erro ao verificar permissão de admin:", error);
          navigate("/login");
        }
      } else if (user.id_role !== 1) {
        navigate("/login");
      }
    };
    checkAdminAccess();
  }, [user, navigate]);

  // Se o utilizador não for administrador, mostrar mensagem de carregamento (loading)
  if (!user || user.id_role !== 1) {
    return (
      <Container className="AdminDashboardPage">
        <DashboardContainer>
          <div className="text-center py-5">
            <Spinner />
            <p>A verificar permissões...</p>
          </div>
        </DashboardContainer>
      </Container>
    );
  }

  return (
    <>
      <Container className="AdminDashboardPage" fluid>
        <DashboardContainer>
          <DashboardTitle>Painel de Administração</DashboardTitle>

          {/* Cartões de estatísticas */}
          <StatsContainer>
            {/* Total eventos */}
            <StatCard $bgcolor="var(--primary-color)">
              <h3>{stats.totalEvents}</h3>
              <p>Total de Eventos</p>
            </StatCard>

            {/* total de utilizadores */}
            <StatCard $bgcolor="var(--primary-color)">
              <h3>{stats.totalUsers}</h3>
              <p>Total de Utilizadores</p>
            </StatCard>
            <StatCard $bgcolor="var(--primary-color)">
              <h3>{stats.totalSales}</h3>
              <p>Total de Encomendas</p>
            </StatCard>

            {/* Receita total */}
            <StatCard $bgcolor="var(--primary-color)">
              <h3>{formatPrice(stats.revenue)}</h3>
              <p>Receita Total</p>
            </StatCard>
          </StatsContainer>

          {/* Tabs Bootstrap do painel de administração */}
          <TabsWrapper>
            <Tabs
              activeKey={activeTab}
              onSelect={(tab) => setActiveTab(tab)}
              className="mb-4"
            >
              {/* Tab de Eventos */}
              <Tab eventKey="events" title="Eventos">
                <EventCrudPage />
              </Tab>

              {/* Tab de Utilizadores */}
              <Tab eventKey="users" title="Utilizadores">
                <UsersCrudPage />
              </Tab>

              {/* Tab de Categorias */}
              <Tab eventKey="categories" title="Categorias">
                <CategoriesCrudPage />
              </Tab>

              {/* Tab de Encomendas */}
              <Tab eventKey="orders" title="Encomendas">
                <ListOrdersPage />
              </Tab>
            </Tabs>
          </TabsWrapper>
        </DashboardContainer>
      </Container>
    </>
  );
};

export default AdminDashboardPage;
