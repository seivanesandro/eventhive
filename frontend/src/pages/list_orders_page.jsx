import { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import ReusableTable from "../components/UI/ReusableTable";
import Message from "../components/UI/Message";
import Spinner from "../components/UI/Spinner";
import { getAllOrders } from "../services/ordersService";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const PageContainer = styled.div`
  background: var(--white-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ListOrdersPage = () => {
  // Contexto de autenticação para verificar permissões
  const { user } = useContext(AuthContext);

  // Navegação para redirecionar usuários
  const navigate = useNavigate();

  // Estado para armazenar encomendas e mensagens
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [orderMessage, setOrderMessage] = useState(null);

  // Proteção de acesso (admin)
  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      navigate("/login");
    } else if (user.id_role !== 1) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Função para obter todas as encomendas
  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = await getAllOrders();
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setOrdersError(data.message || "Erro ao carregar encomendas");
        setOrderMessage({
          type: "danger",
          text: data.message || "Erro ao carregar encomendas",
        });
        setTimeout(() => setOrderMessage(null), 3000);
      }
    } catch (error) {
      setOrdersError("Erro ao comunicar com o servidor");
      setOrderMessage({
        type: "danger",
        text: "Erro ao comunicar com o servidor",
      });
      setTimeout(() => setOrderMessage(null), 3000);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Obter encomendas ao montar o componente
  useEffect(() => {
    fetchOrders();
  }, []);

  // Formatar data e preço para exibição
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

  // Formatar preço para exibição
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "0,00€";
    try {
      const numPrice = parseFloat(price);
      return numPrice.toFixed(2).replace(".", ",") + "€";
    } catch {
      return "0,00€";
    }
  };

  // Objecto com as colunas da tabela
  const columns = [
    { key: "id_order", label: "ID" },
    {
      key: "user",
      label: "Utilizador",
      render: (order) =>
        order.user ? `${order.user.first_name} ${order.user.last_name}` : "-",
    },
    {
      key: "items",
      label: "Evento(s)",
      render: (order) =>
        order.items?.map((item, i) => (
          <div key={i}>
            {item.event_title}
            {i < order.items.length - 1 && <br />}
          </div>
        )),
    },
    {
      key: "items_qty",
      label: "Quantidade",
      render: (order) =>
        order.items?.reduce(
          (total, item) => total + parseInt(item.quantity),
          0,
        ),
    },
    {
      key: "total_price",
      label: "Total",
      render: (order) => formatPrice(order.total_price),
    },
    {
      key: "order_date",
      label: "Data",
      render: (order) => formatDate(order.order_date),
    },
  ];

  // Renderização do componente Spinner enquanto verifica se o utilizador é admin
  if (!user || user.id_role !== 1) {
    return (
      <PageContainer>
        <div className="text-center py-5">
          <Spinner />
          <p>A verificar permissões...</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <>
      <PageContainer>
        <h2>Histórico de Encomendas</h2>
        <ActionsContainer />
        {orderMessage && (
          <Message type={orderMessage.type}>{orderMessage.text}</Message>
        )}

        {/* Componente Tabela Renderizada */}
        <ReusableTable
          columns={columns}
          data={orders}
          loading={ordersLoading}
          error={ordersError}
          emptyMessage="Nenhuma encomenda encontrada"
        />
      </PageContainer>
    </>
  );
};

export default ListOrdersPage;
