import { useState, useContext, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  Container,
  Row,
  Col,
  Form,
  Card,
  Table,
  Tab,
  Tabs,
} from "react-bootstrap";
import AuthContext from "../context/AuthContext";
import Button from "../components/UI/Button";
import Message from "../components/UI/Message";
import Spinner from "../components/UI/Spinner";
import api from "../services/api";
import { devices } from "../assets/utils/constantes";

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

const ProfileTabsWrapper = styled.div`
  .nav-tabs {
    @media only screen and (${devices.mobileG}) {
      overflow-x: auto;
      white-space: nowrap;
      flex-wrap: nowrap !important;
      display: flex;
      -webkit-overflow-scrolling: touch;
    }
  }
`;

// Styled-component para o container da página de perfil
const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 3rem auto;
  padding: 2rem;
  background: var(--white-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  animation: ${ScaleAndSmooth} 1.2s ease-out;
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

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;

  @media only screen and (${devices.tablet}) {
    flex-direction: column;
    text-align: center;
  }
`;

const ProfileAvatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: var(--white-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-right: 2rem;

  @media only screen and (${devices.tablet}) {
    margin-right: 0;
    margin-bottom: 1rem;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;

  h3 {
    color: var(--primary-color);
    margin-bottom: 0.5rem;
  }

  p {
    margin-bottom: 0.3rem;
    color: var(--text-color);
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  gap: 1rem;

  @media only screen and (${devices.tablet}) {
    flex-direction: column;
  }

  .btn-admin {
    background-color: var(--secondary-color);
    border-color: var(--secondary-color);

    &:hover {
      background-color: var(--secondary-dark-color);
      border-color: var(--secondary-dark-color);
    }
  }
`;

const ProfilePage = () => {
  // acesso ao contexto de autenticação com o useContext(), useNavigate para navegação
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // useLocation para obter o estado da navegação
  const location = useLocation();

  // useState() para controlar a Tab ativa, histórico de compras, estados de carregamento e erros
  const getInitialTab = () => {
    if (location.state?.activeTab) return location.state.activeTab;
    const storedTab = localStorage.getItem("profileActiveTab");
    if (storedTab) return storedTab;
    return "info";
  };
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  // useState() para controlo e alteração de password
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useRef() para os inputs
  const currentPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  //  useEffet() para redirecionamento do utilizador para a pagina login caso não esteja autenticado
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, navigate, loading]);

  // useCallback() para buscar o histórico de compras do utilizador e atualizar o estado de loading e erro
  const fetchPurchaseHistory = useCallback(async () => {
    if (!user) return;

    try {
      setHistoryLoading(true);
      const response = await api.get("/user/purchase_history.php");
      if (response.data.success) {
        setPurchaseHistory(response.data.history || []);

        //FIXME:  Se o histórico estiver vazio, mostrar mensagem no console do browser
        console.log("Histórico de compras carregado:", response.data.history);
      } else {
        setHistoryError("Não foi possível carregar o histórico de compras.");
      }
    } catch (error) {
      setHistoryError("Erro ao comunicar com o servidor.");

      // FIXME: ERRO: mensagem de erro no console
      console.error("Erro ao carregar histórico de compras:", error);
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  // useEffect() para buscar o histórico de compras quando a tab ativa for "historico de compras"
  useEffect(() => {
    localStorage.setItem("profileActiveTab", activeTab);
    if (activeTab === "purchases") {
      const timer = setTimeout(() => {
        fetchPurchaseHistory();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeTab, fetchPurchaseHistory]);

  // Validação da password com regex -> (mínimo 6 caracteres, 1 maiúscula, 1 número, 1 caractere especial)
  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;
    return passwordRegex.test(password);
  };

  // funçao para a alteração de password
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));

    // Validação da password actual
    switch (name) {
      case "currentPassword":
        if (!value) {
          setPasswordErrors((prev) => ({
            ...prev,
            currentPassword: "A password atual é obrigatória",
          }));
        } else {
          setPasswordErrors((prev) => ({ ...prev, currentPassword: null }));
        }
        break;

      // Validação da nova password
      case "newPassword":
        if (!value) {
          setPasswordErrors((prev) => ({
            ...prev,
            newPassword: "A nova password é obrigatória",
          }));
        } else if (!validatePassword(value)) {
          setPasswordErrors((prev) => ({
            ...prev,
            newPassword:
              "A password deve ter pelo menos 6 caracteres, 1 maiúscula, 1 número e 1 caractere especial",
          }));
        } else {
          setPasswordErrors((prev) => ({ ...prev, newPassword: null }));
        }

        // Se a confirmação de password já estiver preenchida, validar estao iguais
        if (
          passwordForm.confirmPassword &&
          value !== passwordForm.confirmPassword
        ) {
          setPasswordErrors((prev) => ({
            ...prev,
            confirmPassword: "As passwords não coincidem",
          }));
        } else if (passwordForm.confirmPassword) {
          setPasswordErrors((prev) => ({ ...prev, confirmPassword: null }));
        }
        break;
      // Validação da confirmação de password
      case "confirmPassword":
        if (!value) {
          setPasswordErrors((prev) => ({
            ...prev,
            confirmPassword: "A confirmação da password é obrigatória",
          }));
        } else if (value !== passwordForm.newPassword) {
          setPasswordErrors((prev) => ({
            ...prev,
            confirmPassword: "As passwords não coincidem",
          }));
        } else {
          setPasswordErrors((prev) => ({ ...prev, confirmPassword: null }));
        }
        break;

      default:
        break;
    }
  };

  // Funçao para a submissão do formulário de alteraçao da password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Limpar mensagens anteriores
    setPasswordError(null);
    setPasswordSuccess(null);

    // Validar todos os campos da password
    const newErrors = {};

    // Se a password atual estiver vazia, adicionar erro com focus
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = "A password atual é obrigatória";
      currentPasswordRef.current.focus();
    }

    // Se a nova password estiver vazia ou inválida, adicionar erros com focus
    if (!passwordForm.newPassword) {
      newErrors.newPassword = "A nova password é obrigatória";
      newPasswordRef.current.focus();
    } else if (!validatePassword(passwordForm.newPassword)) {
      newErrors.newPassword =
        "A password deve ter pelo menos 6 caracteres, 1 maiúscula, 1 número e 1 caractere especial";
      newPasswordRef.current.focus();
    }

    // Se a confirmação da password estiver vazia ou não coincidir com a nova password, adicionar erros com focus
    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = "A confirmação da password é obrigatória";
      confirmPasswordRef.current.focus();
    } else if (passwordForm.confirmPassword !== passwordForm.newPassword) {
      newErrors.confirmPassword = "As passwords não coincidem";
      confirmPasswordRef.current.focus();
    }

    // Se houver erros, não submeter
    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    // Submeter formulário em caso de sucesso
    try {
      setIsSubmitting(true);
      // Enviar os campos com os nomes esperados pelo backend
      const response = await api.post("/auth/change_password.php", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      // Verificar resposta da API
      if (response.data.success) {
        setPasswordSuccess("Password alterada com sucesso!");
        // Limpar formulário
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setPasswordError(
          response.data.message ||
            "Erro ao alterar password. Verifique se a password atual está correta.",
        );
      }
    } catch (error) {
      setPasswordError(
        "Erro ao comunicar com o servidor. Tente novamente mais tarde.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // funçaão para logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // função para Obter as iniciais do utilizador para o avatar
  const getUserInitials = () => {
    if (!user) return "";
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  };

  // Função para formatar a data do histórico de compras
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // validar se o utilizador está autenticado, mostrar loading (spinner)
  if (!user) {
    return (
      <Container>
        <ProfileContainer>
          <div className="text-center">
            <Spinner />
            <p>A carregar perfil...</p>
          </div>
        </ProfileContainer>
      </Container>
    );
  }

  return (
    <>
      <Container className="profile-page-container">
        <ProfileContainer className="profile-main-container">
          <PageTitle className="profile-title">Meu Perfil</PageTitle>

          {/* header do perfil com avatar e informações do utilizador */}
          <ProfileHeader className="profile-header">
            <ProfileAvatar className="profile-avatar">
              {getUserInitials()}
            </ProfileAvatar>
            <ProfileInfo className="profile-info">
              <h3 className="profile-name">
                {user.first_name} {user.last_name}
              </h3>
              <p className="profile-email">
                <strong>Email:</strong> {user.email}
              </p>
              <p className="profile-role">
                <strong>Tipo de conta:</strong>{" "}
                {user.id_role === 1 ? "Administrador" : "Cliente"}
              </p>
            </ProfileInfo>
          </ProfileHeader>

          {/* Tabs para informações do perfil, histórico de compras e alteração de password */}
          <ProfileTabsWrapper>
            <Tabs
              activeKey={activeTab}
              onSelect={(key) => {
                setActiveTab(key);
              }}
              className="profile-tabs mb-4"
            >
              {/* Tab de informações do perfil */}
              <Tab
                eventKey="info"
                title="Informações"
                tabClassName="custom-tabs-color"
                className="profile-tab-info"
              >
                {/*card para informaçoes do utilizador */}
                <Card className="profile-info-card">
                  <Card.Body className="profile-info-card-body">
                    <h4 className="profile-section-title mb-3">
                      Informações da Conta
                    </h4>
                    <Row className="profile-info-row">
                      <Col
                        md={6}
                        className="profile-info-col profile-info-col-left"
                      >
                        <p className="profile-info-item">
                          <strong>Nome:</strong> {user.first_name}
                        </p>
                        <p className="profile-info-item">
                          <strong>Apelido:</strong> {user.last_name}
                        </p>
                      </Col>
                      <Col
                        md={6}
                        className="profile-info-col profile-info-col-right"
                      >
                        <p className="profile-info-item">
                          <strong>Email:</strong> {user.email}
                        </p>
                        <p className="profile-info-item">
                          <strong>Tipo de conta:</strong>{" "}
                          {user.id_role === 1 ? "Administrador" : "Cliente"}
                        </p>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Tab>

              {/* Tab com uma tabela para apenas mostrar o histórico de compras */}
              <Tab
                eventKey="purchases"
                title="Histórico de Compras"
                tabClassName="custom-tabs-color"
                className="profile-tab-purchases"
              >
                {historyLoading ? (
                  <div className="profile-purchases-loading text-center py-4">
                    <Spinner />
                  </div>
                ) : historyError ? (
                  <Message type="danger" className="profile-purchases-error">
                    {historyError}
                  </Message>
                ) : purchaseHistory.length > 0 ? (
                  <Table responsive striped className="profile-purchases-table">
                    <thead className="profile-purchases-thead">
                      <tr className="profile-purchases-trow">
                        <th className="profile-purchases-th">
                          Nº de Encomenda
                        </th>
                        <th className="profile-purchases-th">Data</th>
                        <th className="profile-purchases-th">Evento</th>
                        <th className="profile-purchases-th">Bilhetes</th>
                        <th className="profile-purchases-th">Total</th>
                      </tr>
                    </thead>
                    <tbody className="profile-purchases-tbody">
                      {purchaseHistory.map((purchase) => (
                        <tr
                          key={`${purchase.id_order}-${purchase.id_ticket}`}
                          className="profile-purchases-trow-item"
                        >
                          <td className="profile-purchases-td">
                            #{purchase.id_order}
                          </td>
                          <td className="profile-purchases-td">
                            {formatDate(purchase.order_date)}
                          </td>
                          <td className="profile-purchases-td">
                            {purchase.event_title}
                          </td>
                          <td className="profile-purchases-td">
                            {purchase.quantity}
                          </td>
                          <td className="profile-purchases-td">
                            {parseFloat(purchase.total_price).toFixed(2)}€
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="profile-purchases-empty text-center py-4">
                    <p className="profile-purchases-empty-text">
                      Ainda não efetuou nenhuma compra.
                    </p>
                  </div>
                )}
              </Tab>

              {/* Tab para alteração de password */}
              <Tab
                eventKey="password"
                title="Alterar Password"
                tabClassName="custom-tabs-color"
                className="profile-tab-password"
              >
                {/* card para alteração de password */}
                <Card className="profile-password-card">
                  <Card.Body className="profile-password-card-body">
                    <h4 className="profile-section-title mb-3">
                      Alterar Password
                    </h4>

                    {/* Mensagens de feedback (erro ou sucesso) */}
                    {passwordError && (
                      <Message type="danger" className="profile-password-error">
                        {passwordError}
                      </Message>
                    )}
                    {passwordSuccess && (
                      <Message
                        type="success"
                        className="profile-password-success"
                      >
                        {passwordSuccess}
                      </Message>
                    )}

                    {/* Formulário para alteração de password */}
                    <Form
                      onSubmit={handlePasswordSubmit}
                      noValidate
                      className="profile-password-form"
                    >
                      {/* input para inserir a actual password */}
                      <Form.Group className="mb-3 profile-password-group">
                        <Form.Label className="profile-password-label">
                          Password Atual
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          isInvalid={!!passwordErrors.currentPassword}
                          ref={currentPasswordRef}
                          className="profile-password-input"
                        />
                        {/* feedback do erro caso a actual password esteja invalida */}
                        {passwordErrors.currentPassword && (
                          <Form.Control.Feedback
                            type="invalid"
                            className="profile-password-feedback"
                          >
                            {passwordErrors.currentPassword}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>

                      {/* input para inserir a nova password */}
                      <Form.Group className="mb-3 profile-password-group">
                        <Form.Label className="profile-password-label">
                          Nova Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          isInvalid={!!passwordErrors.newPassword}
                          ref={newPasswordRef}
                          className="profile-password-input"
                        />
                        {/* feedback do erro caso a nova password esteja invalida */}
                        {passwordErrors.newPassword && (
                          <Form.Control.Feedback
                            type="invalid"
                            className="profile-password-feedback"
                          >
                            {passwordErrors.newPassword}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>

                      {/* input para inserir a confirmação da nova password */}
                      <Form.Group className="mb-3 profile-password-group">
                        <Form.Label className="profile-password-label">
                          Confirmar Nova Password
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          isInvalid={!!passwordErrors.confirmPassword}
                          ref={confirmPasswordRef}
                          className="profile-password-input"
                        />
                        {/* feedback do erro caso a confirmação da nova password esteja invalida */}
                        {passwordErrors.confirmPassword && (
                          <Form.Control.Feedback
                            type="invalid"
                            className="profile-password-feedback"
                          >
                            {passwordErrors.confirmPassword}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>

                      {/* Butão para submeter a alteração de password */}
                      <div className="d-flex justify-content-center profile-password-submit-container">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="profile-password-submit-btn"
                        >
                          {isSubmitting ? <Spinner /> : "Alterar Password"}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab>
            </Tabs>
          </ProfileTabsWrapper>

          {/* Butões de ação */}
          <ButtonsContainer className="profile-buttons-container">
            {/* butao para ir para a pagina dos eventos ()qualquer utilizador ver este butao */}
            <Button
              onClick={() => navigate("/events")}
              className="profile-events-btn"
            >
              Ver Eventos
            </Button>

            {/* Botão para o painel de administração, apenas utilizadores admin podem ver este botão, cor Bootstrap primária */}
            {user.id_role === 1 && (
              <Button
                onClick={() => navigate("/admin")}
                className="btn btn-primary profile-admin-btn"
                $variant="primary"
              >
                Painel de Administração
              </Button>
            )}

            {/* Botão para terminar sessão, cor Bootstrap danger */}
            <Button
              onClick={handleLogout}
              className="btn btn-danger profile-logout-btn"
              $variant="danger"
            >
              Terminar Sessão
            </Button>
          </ButtonsContainer>
        </ProfileContainer>
      </Container>
    </>
  );
};

export default ProfilePage;
