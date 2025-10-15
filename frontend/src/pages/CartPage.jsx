import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Container, Table, Button as BsButton } from "react-bootstrap";
import { FaTrash, FaShoppingCart, FaArrowLeft } from "react-icons/fa";
import CartContext from "../context/CartContext";
import AuthContext from "../context/AuthContext";
import Button from "../components/UI/Button";
import Message from "../components/UI/Message";
import Spinner from "../components/UI/Spinner";
import { devices } from "../assets/utils/constantes";
import api from "../services/api";

const ScaleAndSmooth = keyframes`
    0% {
    transform: scale(0);
    opacity: 0;
  }
  50%{
    transform: scale(1.1);
    opacity: 1;
  }

  100% {
    transform: scale(1);
  }
`;

// Styled-component para o container do carrinho
const CartContainer = styled.div`
  max-width: 800px;
  margin: 3rem auto;
  padding: 2rem;
  background: var(--white-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  animation: ${ScaleAndSmooth} 1s ease-out;
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

const EmptyCart = styled.div`
  text-align: center;
  padding: 2rem;

  .icon {
    font-size: 4rem;
    color: var(--primary-color);
    margin-bottom: 1rem;
    opacity: 0.6;
  }

  p {
    font-size: 1.2rem;
    color: var(--text-color);
    margin-bottom: 1.5rem;
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;

  @media only screen and (${devices.tablet}) {
    flex-direction: column-reverse;
    gap: 1rem;
  }
`;

const OrderSummary = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--background-color);
  border-radius: var(--border-radius);

  h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
    font-size: 1.4rem;
    font-weight: 600;
  }

  .total {
    font-weight: 700;
    font-size: 1.2rem;
    color: var(--primary-color);
  }
`;

const CartPage = () => {
  // unseContext para acessar o contexto do carrinho
  const { cart, removeFromCart, clearCart } = useContext(CartContext);

  // AuthContext para verificar se o utilizador está autenticado
  const { isAuthenticated, loading } = useContext(AuthContext);

  // useNavigate() para redirecionar o utilizador
  const navigate = useNavigate();

  // useStates()  para controlar o estado do checkout, sucesso e erro
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  // useNavigate() para o redirecionamento do utilizador para a pagina login se não estiver autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate, loading]);

  // função para calcular o total do carrinho
  const calculateTotal = () => {
    return cart
      .reduce((acc, item) => acc + Number(item.price) * item.quantity, 0)
      .toFixed(2);
  };

  // função para a remoção de item do carrinho
  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  // função para continuar a comprar
  const handleContinueShopping = () => {
    navigate("/events");
  };

  // funçao para finalizar a compra
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      setIsCheckingOut(true);
      setCheckoutError(null);

      // Prepara os dados para o checkout
      const items = cart.map((item) => ({
        id_ticket: item.id,
        quantity: item.quantity,
      }));

      // Envia o pedido para o endpoint de checkout
      const response = await api.post("/cart/checkout.php", { items });

      if (response.data.success) {
        setCheckoutSuccess(true);
        clearCart();

        // Pré-carrega o histórico de compras do utilizador
        try {
          await api.get("/user/purchase_history.php");
        } catch (err) {
          //FIXME: ERRO: logo do erro ao pré-carregar o histórico de compras
          console.error("Erro ao pré-carregar o histórico de compras:", err);
        }

        // Redirecionar para a página de perfil após checkout bem-sucedido
        setTimeout(() => {
          navigate("/profile", { state: { activeTab: "purchases" } });
        }, 3000);
      } else {
        setCheckoutError(
          response.data.message ||
            "Erro ao finalizar compra. Por favor, tente novamente.",
        );
      }
    } catch (error) {
      setCheckoutError(
        "Erro ao comunicar com o servidor. Por favor, tente novamente mais tarde.",
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <Container className="Cart-page">
        <CartContainer className="cart-container">
          <PageTitle className="cart-title">Meu Carrinho</PageTitle>

          {/* Mensagens de feedback */}
          {checkoutError && (
            <Message type="danger" className="cart-message-error">
              {checkoutError}
            </Message>
          )}
          {checkoutSuccess && (
            <Message type="success" className="cart-message-success">
              Compra finalizada com sucesso! Redirecionando para o seu perfil...
            </Message>
          )}

          {/* Conteúdo do carrinho */}
          {!checkoutSuccess && (
            <>
              {cart.length === 0 ? (
                <EmptyCart className="empty-cart-container">
                  <div className="icon icon-cart">
                    <FaShoppingCart />
                  </div>
                  <p className="empty-cart">O seu carrinho está vazio.</p>
                  <Button
                    onClick={handleContinueShopping}
                    className="cart-explore-events-btn"
                  >
                    Explorar Eventos
                  </Button>
                </EmptyCart>
              ) : (
                <>
                  <Table responsive striped className="cart-table">
                    <thead>
                      <tr>
                        <th>Evento</th>
                        <th>Tipo de Bilhete</th>
                        <th>Preço</th>
                        <th>Quantidade</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.id}>
                          <td>{item.eventTitle}</td>
                          <td>{item.ticketType}</td>
                          <td>{Number(item.price).toFixed(2)}€</td>
                          <td>{item.quantity}</td>
                          <td>
                            {(Number(item.price) * item.quantity).toFixed(2)}€
                          </td>
                          <td>
                            <BsButton
                              $variant="danger"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              className="cart-remove-item-btn"
                            >
                              <FaTrash />
                            </BsButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  {/* Resumo do pedido */}
                  <OrderSummary className="cart-order-summary">
                    <h3>Resumo do Pedido</h3>
                    <p className="d-flex justify-content-between">
                      <span>Subtotal:</span>
                      <span>{calculateTotal()}€</span>
                    </p>
                    <p className="d-flex justify-content-between total">
                      <span>Total:</span>
                      <span>{calculateTotal()}€</span>
                    </p>
                  </OrderSummary>

                  {/* Botões de ação do carrinho */}
                  <ActionButtonsContainer className="cart-action-buttons">
                    <Button
                      onClick={handleContinueShopping}
                      className="cart-continue-shopping-btn"
                    >
                      <FaArrowLeft /> Continuar a Comprar
                    </Button>
                    <Button
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                      className="cart-checkout-btn"
                    >
                      {isCheckingOut ? <Spinner /> : "Finalizar Compra"}
                    </Button>
                  </ActionButtonsContainer>
                </>
              )}
            </>
          )}
        </CartContainer>
      </Container>
    </>
  );
};

export default CartPage;
