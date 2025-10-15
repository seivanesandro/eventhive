import { useEffect, useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import styled from "styled-components";
import { Modal, Form, Row, Col } from "react-bootstrap";
import { FaPencilAlt, FaUserTimes, FaPlus } from "react-icons/fa";
import Button from "../components/UI/Button";
import Message from "../components/UI/Message";
import Spinner from "../components/UI/Spinner";
import ReusableTable from "../components/UI/ReusableTable";
import api from "../services/api";

const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${(props) =>
    props.$status === "ativo" ? "var(--success-color)" : "var(--danger-color)"};
  color: var(--primary-color) !important;
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

const UsersCrudPage = () => {
  // Contexto de autenticação para obter o utilizador atual
  const { user } = useContext(AuthContext);

  // useNavigate para redirecionamento
  const navigate = useNavigate();

  // Proteção de acesso: apenas utilizadores admins
  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      navigate("/login");
    } else if (user.id_role !== 1) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Estados para gestão de utilizadores
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [userMessage, setUserMessage] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState({
    id: null,
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    id_role: 2,
  });
  const [userErrors, setUserErrors] = useState({});
  const [userSubmitting, setUserSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  // Referência para o input do nome do utilizador
  const userFirstNameRef = useRef(null);

  // fetch para buscar utilizadores do backend
  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const response = await api.get("/admin/users_crud.php");
      if (response.data.success) {
        setUsers(
          (response.data.users || []).sort((a, b) => a.id_user - b.id_user),
        );
      } else {
        setUsersError(response.data.message || "Erro ao carregar utilizadores");
        setUserMessage({
          type: "danger",
          text: response.data.message || "Erro ao carregar utilizadores",
        });
        setTimeout(() => setUserMessage(null), 3000);
      }
    } catch (error) {
      setUsersError("Erro ao comunicar com o servidor");
      setUserMessage({
        type: "danger",
        text: "Erro ao comunicar com o servidor",
      });
      setTimeout(() => setUserMessage(null), 3000);
    } finally {
      setUsersLoading(false);
    }
  };

  // useEffect para buscar utilizadores ao abrir a página
  useEffect(() => {
    fetchUsers();
  }, []);

  // Validação do formulário de utilizador
  const validateUserForm = () => {
    const errors = {};
    if (!userForm.first_name.trim()) errors.first_name = "Nome é obrigatório";
    if (!userForm.last_name.trim()) errors.last_name = "Apelido é obrigatório";
    if (!userForm.email.trim()) errors.email = "Email é obrigatório";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(userForm.email))
      errors.email = "Email inválido";
    if (!userForm.id) {
      if (!userForm.password || userForm.password.length < 6)
        errors.password = "Password obrigatória (mín. 6)";
    }
    return errors;
  };

  // Funções para gerir o formulário de utilizador
  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  // Abrir modal para adicionar utilizador
  const handleAddUser = () => {
    setUserForm({
      id: null,
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      id_role: 2,
    });
    setUserErrors({});
    setShowUserModal(true);
    setTimeout(() => userFirstNameRef.current?.focus(), 100);
  };

  // Abrir modal para editar utilizador
  const handleEditUser = (user) => {
    setUserForm({
      id: user.id_user,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      password: "",
      id_role: user.id_role,
    });
    setUserErrors({});
    setShowUserModal(true);
    setTimeout(() => userFirstNameRef.current?.focus(), 100);
  };

  // Função para submeter o formulário de utilizador
  const handleSubmitUser = async (e) => {
    e.preventDefault();
    const formErrors = validateUserForm();
    if (Object.keys(formErrors).length > 0) {
      setUserErrors(formErrors);
      return;
    }
    try {
      setUserSubmitting(true);
      let response;
      if (userForm.id) {
        const updateData = {
          id_user: userForm.id,
          first_name: userForm.first_name.trim(),
          last_name: userForm.last_name.trim(),
          email: userForm.email.trim(),
          id_role: parseInt(userForm.id_role),
        };
        if (userForm.password.trim()) updateData.password = userForm.password;
        response = await api.put("/admin/users_crud.php", updateData);
      } else {
        response = await api.post("/admin/users_crud.php", {
          first_name: userForm.first_name.trim(),
          last_name: userForm.last_name.trim(),
          email: userForm.email.trim(),
          password: userForm.password,
          id_role: parseInt(userForm.id_role),
        });
      }
      if (response.data.success) {
        setShowUserModal(false);
        fetchUsers();
        setDeleteMessage({
          type: "success",
          text: response.data.message || "Utilizador guardado com sucesso.",
        });
        setTimeout(() => setDeleteMessage(null), 3000);
      } else {
        setUserErrors({
          submit: response.data.message || "Erro ao guardar utilizador",
        });
      }
    } catch (error) {
      setUserErrors({ submit: "Erro ao comunicar com o servidor" });
    } finally {
      setUserSubmitting(false);
    }
  };

  // Função para confirmar a desativação de um utilizador
  const confirmDelete = (id) => {
    setUserToDelete(id);
    setShowConfirmModal(true);
  };

  // Função para desativar um utilizador (soft delete)
  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      setDeleteLoading(true);
      setDeleteMessage(null);
      const response = await api.delete("/admin/users_crud.php", {
        data: { id_user: userToDelete },
      });
      if (response.data.success) {
        setDeleteMessage({
          type: "success",
          text: response.data.message || "Utilizador desativado com sucesso.",
        });
        setTimeout(() => setDeleteMessage(null), 3000);
        fetchUsers();
      } else {
        setDeleteMessage({
          type: "danger",
          text: response.data.message || "Erro ao desativar utilizador.",
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
      setUserToDelete(null);
    }
  };

  // objecto para definir as colunas da tabela de utilizadores
  const columns = [
    { key: "id_user", label: "ID" },
    {
      key: "name",
      label: "Nome",
      render: (row) => `${row.first_name} ${row.last_name}`,
    },
    { key: "email", label: "Email" },
    {
      key: "id_role",
      label: "Papel",
      render: (row) => (row.id_role === 1 ? "Admin" : "Utilizador"),
    },
    {
      key: "active",
      label: "Status",
      render: (row) => (
        <StatusBadge $status={row.active === 1 ? "ativo" : "inativo"}>
          {row.active === 1 ? "Ativo" : "Inativo"}
        </StatusBadge>
      ),
    },
  ];

  // Função para definir as ações de cada linha da tabela
  const actions = (user) => (
    <>
      {user.active === 1 ? (
        // Se o utilizador estiver ativo (1): mostra os ícones normais e clicáveis
        <>
          <ActionIcon
            color="var(--primary-color)"
            onClick={() => handleEditUser(user)}
            title="Editar"
          >
            <FaPencilAlt />
          </ActionIcon>
          <ActionIcon
            color="var(--danger-color)"
            onClick={() => confirmDelete(user.id_user)}
            title="Desativar"
          >
            <FaUserTimes />
          </ActionIcon>
        </>
      ) : (
        // Se o utilizador estiver inativo (0): mostra os ícones desabilitados
        <>
          <ActionIcon
            color="#999"
            style={{ cursor: "not-allowed", opacity: 0.5 }}
            title="Editar (indisponível para utilizadores inativos)"
          >
            <FaPencilAlt />
          </ActionIcon>
          <ActionIcon
            color="#999"
            style={{ cursor: "not-allowed", opacity: 0.5 }}
            title="Desativar (indisponível para utilizadores inativos)"
          >
            <FaUserTimes />
          </ActionIcon>
        </>
      )}
    </>
  );

  // Se utilizador ainda não carregou, renderiza o spinner
  if (user === undefined) {
    return (
      <div className="text-center py-5">
        <Spinner />
        <p>A verificar permissões...</p>
      </div>
    );
  }
  // Se utilizador não for admin, renderiza mensagem de acesso restrito
  if (!user || user.id_role !== 1) {
    return (
      <div className="text-center py-5">
        <Message type="danger">Acesso restrito a administradores.</Message>
      </div>
    );
  }

  return (
    <>
      <div className="UsersCrudPage">
        {/*  Título da página */}
        <ActionsContainer>
          <h4>Gestão de Utilizadores</h4>
          {/* butao de acçao para criar utilizador */}
          <Button onClick={handleAddUser}>
            <FaPlus style={{ marginRight: "8px" }} /> Adicionar Utilizador
          </Button>
        </ActionsContainer>

        {/* Mensagens de feedback */}
        {userMessage && (
          <Message type={userMessage.type}>{userMessage.text}</Message>
        )}
        {deleteMessage && (
          <Message type={deleteMessage.type}>{deleteMessage.text}</Message>
        )}

        {/* Tabela de utilizadores com ações */}
        <ReusableTable
          columns={columns}
          data={users}
          actions={actions}
          loading={usersLoading}
          error={usersError}
          emptyMessage="Nenhum utilizador encontrado"
        />

        {/* Modal de Adicionar ou Editar Utilizador */}
        <Modal
          show={showUserModal}
          onHide={() => setShowUserModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {userForm.id ? "Editar Utilizador" : "Adicionar Utilizador"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Formulario de preenchimento */}
            <Form onSubmit={handleSubmitUser}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nome *</Form.Label>
                    <Form.Control
                      ref={userFirstNameRef}
                      type="text"
                      name="first_name"
                      value={userForm.first_name}
                      onChange={handleUserFormChange}
                      isInvalid={!!userErrors.first_name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {userErrors.first_name}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Apelido *</Form.Label>
                    <Form.Control
                      type="text"
                      name="last_name"
                      value={userForm.last_name}
                      onChange={handleUserFormChange}
                      isInvalid={!!userErrors.last_name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {userErrors.last_name}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={userForm.email}
                      onChange={handleUserFormChange}
                      isInvalid={!!userErrors.email}
                    />
                    <Form.Control.Feedback type="invalid">
                      {userErrors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Password {!userForm.id && "*"}</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={userForm.password}
                      onChange={handleUserFormChange}
                      isInvalid={!!userErrors.password}
                      placeholder={
                        userForm.id
                          ? "Deixar em branco para não alterar"
                          : "Mínimo 6 caracteres"
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {userErrors.password}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Papel</Form.Label>
                <Form.Select
                  name="id_role"
                  value={userForm.id_role}
                  onChange={handleUserFormChange}
                >
                  <option value={2}>Utilizador</option>
                  <option value={1}>Administrador</option>
                </Form.Select>
              </Form.Group>
              {userErrors.submit && (
                <Message type="danger">{userErrors.submit}</Message>
              )}
            </Form>
          </Modal.Body>

          {/* Botões de ação do modal */}
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowUserModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitUser}
              disabled={userSubmitting}
            >
              {userSubmitting ? <Spinner size="sm" /> : "Guardar"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de Confirmação de Eliminação */}
        <Modal
          show={showConfirmModal}
          onHide={() => setShowConfirmModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirmar Desativação</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Tem a certeza que pretende desativar este utilizador? (O
              utilizador será desativado, não eliminado permanentemente)
            </p>
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
              {deleteLoading ? <Spinner size="sm" /> : "Desativar"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default UsersCrudPage;
