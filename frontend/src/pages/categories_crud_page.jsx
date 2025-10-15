import { useEffect, useState, useRef, useContext } from "react";
import styled from "styled-components";
import { Modal, Form } from "react-bootstrap";
import { FaPencilAlt, FaTrash, FaPlus } from "react-icons/fa";
import Button from "../components/UI/Button";
import Message from "../components/UI/Message";
import Spinner from "../components/UI/Spinner";
import ReusableTable from "../components/UI/ReusableTable";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const ActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
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

const CategoriesCrudPage = () => {
  // Contexto de autenticação para verificar permissões
  const { user } = useContext(AuthContext);

  // Navegação para redirecionar se não for admin
  const navigate = useNavigate();

  // Estado para categorias e loading/error messages
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);
  const [categoryMessage, setCategoryMessage] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ id: null, name: "" });
  const [categoryErrors, setCategoryErrors] = useState({});
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Referência para o input do nome da categoria
  const categoryNameRef = useRef(null);

  // Função para buscar categorias
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const response = await api.get("/admin/categories_crud.php");
      if (response.data.success) {
        setCategories(
          (response.data.categories || []).sort(
            (a, b) => a.id_category - b.id_category,
          ),
        );
      } else {
        setCategoriesError(
          response.data.message || "Erro ao carregar categorias",
        );
        setCategoryMessage({
          type: "danger",
          text: response.data.message || "Erro ao carregar categorias",
        });
        setTimeout(() => setCategoryMessage(null), 3000);
      }
    } catch (error) {
      setCategoriesError("Erro ao comunicar com o servidor");
      setCategoryMessage({
        type: "danger",
        text: "Erro ao comunicar com o servidor",
      });
      setTimeout(() => setCategoryMessage(null), 3000);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Carregar categorias SEM depender do estado do user
  useEffect(() => {
    fetchCategories();
  }, []);

  // Proteção de acesso (admins)
  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      navigate("/login");
    } else if (user.id_role !== 1) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Se o user for undefined, não renderizar nada
  if (user === undefined) {
    return (
      <div className="text-center py-5">
        <Spinner />
        <p>A verificar permissões...</p>
      </div>
    );
  }

  // Se o user não for admin, mostrar mensagem de acesso restrito
  if (!user || user.id_role !== 1) {
    return (
      <div className="text-center py-5">
        <Message type="danger">Acesso restrito a administradores.</Message>
      </div>
    );
  }

  // Função para validar o formulário de categoria
  const validateCategoryForm = () => {
    const errors = {};
    if (!categoryForm.name || !categoryForm.name.trim()) {
      errors.name = "Nome é obrigatório";
    }
    return errors;
  };

  //  Funções para manipular o formulário de categoria
  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm((prev) => ({ ...prev, [name]: value }));
  };

  // Função para abrir o modal de adicionar categoria
  const handleAddCategory = () => {
    setCategoryForm({ id: null, name: "" });
    setCategoryErrors({});
    setShowCategoryModal(true);
    setTimeout(() => categoryNameRef.current?.focus(), 100);
  };

  // Função para editar uma categoria
  const handleEditCategory = (category) => {
    setCategoryForm({ id: category.id_category, name: category.name });
    setCategoryErrors({});
    setShowCategoryModal(true);
    setTimeout(() => categoryNameRef.current?.focus(), 100);
  };

  // Função para submeter o formulário de categoria
  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    const formErrors = validateCategoryForm();
    if (Object.keys(formErrors).length > 0) {
      setCategoryErrors(formErrors);
      return;
    }
    try {
      setCategorySubmitting(true);
      let response;
      if (categoryForm.id) {
        response = await api.put("/admin/categories_crud.php", {
          id_category: categoryForm.id,
          name: categoryForm.name,
        });
      } else {
        response = await api.post("/admin/categories_crud.php", {
          name: categoryForm.name,
        });
      }
      if (response.data.success) {
        setShowCategoryModal(false);
        fetchCategories();
        setDeleteMessage({
          type: "success",
          text: response.data.message || "Categoria guardada com sucesso.",
        });
        setTimeout(() => setDeleteMessage(null), 3000);
      } else {
        setCategoryErrors({
          submit: response.data.message || "Erro ao guardar categoria",
        });
      }
    } catch (error) {
      setCategoryErrors({ submit: "Erro ao comunicar com o servidor" });
    } finally {
      setCategorySubmitting(false);
    }
  };

  // Função para confirmar a eliminação de uma categoria
  const confirmDelete = (id) => {
    setCategoryToDelete(id);
    setShowConfirmModal(true);
  };

  // Função para eliminar uma categoria
  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setDeleteLoading(true);
      setDeleteMessage(null);
      const response = await api.delete("/admin/categories_crud.php", {
        data: { id_category: categoryToDelete },
      });
      if (response.data.success) {
        setDeleteMessage({
          type: "success",
          text: response.data.message || "Categoria eliminada com sucesso.",
        });
        setTimeout(() => setDeleteMessage(null), 3000);
        fetchCategories();
      } else {
        setDeleteMessage({
          type: "danger",
          text: response.data.message || "Erro ao eliminar categoria.",
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
      setCategoryToDelete(null);
    }
  };

  // objecto para as colunas da tabela
  const columns = [
    { key: "id_category", label: "ID" },
    { key: "name", label: "Nome" },
  ];

  // Função para renderizar ações de cada categoria
  const actions = (category) => (
    <>
      <ActionIcon
        color="var(--primary-color)"
        onClick={() => handleEditCategory(category)}
        title="Editar"
      >
        <FaPencilAlt />
      </ActionIcon>
      <ActionIcon
        color="var(--danger-color)"
        onClick={() => confirmDelete(category.id_category)}
        title="Eliminar"
      >
        <FaTrash />
      </ActionIcon>
    </>
  );

  return (
    <>
      <div className="CategoriesCrudPage">
        {/* Componente de ações para adicionar nova categoria */}
        <ActionsContainer>
          <h4>Gestão de Categorias</h4>
          <Button onClick={handleAddCategory}>
            <FaPlus style={{ marginRight: "8px" }} /> Adicionar Categoria
          </Button>
        </ActionsContainer>

        {/* Mensagem de sucesso ou erro */}
        {categoryMessage && (
          <Message type={categoryMessage.type}>{categoryMessage.text}</Message>
        )}
        {deleteMessage && (
          <Message type={deleteMessage.type}>{deleteMessage.text}</Message>
        )}

        {/* Componente tabela para listar categorias */}
        <ReusableTable
          columns={columns}
          data={categories}
          actions={actions}
          loading={categoriesLoading}
          error={categoriesError}
          emptyMessage="Nenhuma categoria encontrada"
        />

        {/* Modal de Adicionar ou Editar Categoria */}
        <Modal
          show={showCategoryModal}
          onHide={() => setShowCategoryModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {categoryForm.id ? "Editar Categoria" : "Adicionar Categoria"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmitCategory}>
              <Form.Group className="mb-3">
                <Form.Label>Nome *</Form.Label>
                <Form.Control
                  ref={categoryNameRef}
                  type="text"
                  name="name"
                  value={categoryForm.name}
                  onChange={handleCategoryFormChange}
                  isInvalid={!!categoryErrors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {categoryErrors.name}
                </Form.Control.Feedback>
              </Form.Group>
              {categoryErrors.submit && (
                <Message type="danger">{categoryErrors.submit}</Message>
              )}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowCategoryModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitCategory}
              disabled={categorySubmitting}
            >
              {categorySubmitting ? <Spinner size="sm" /> : "Guardar"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de Confirmação de Eliminação */}
        <Modal
          show={showConfirmModal}
          onHide={() => setShowConfirmModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirmar Eliminação</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Tem a certeza que pretende eliminar esta categoria?</p>
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

export default CategoriesCrudPage;
