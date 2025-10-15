import { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import {
  Form,
  FormGroup,
  FormLabel,
  FormControl,
  Row,
  Col,
} from "react-bootstrap";
import AuthContext from "../context/AuthContext";
import Button from "../components/UI/Button";
import Message from "../components/UI/Message";
import Spinner from "../components/UI/Spinner";

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

// Styled-component para o container da página de registo
const RegisterContainer = styled.div`
  max-width: 600px;
  margin: 3rem auto;
  padding: 2.5rem;
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
`;

const SubmitContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
`;

const RegisterPage = () => {
  // useState() para armazenar os dados do formulário
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // useState() para armazenar erros, estado de submissão e mensagens de API
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [apiSuccess, setApiSuccess] = useState(null);

  // useRef() para focar nos inputs após validação
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  //  useContext() para obter a função de login do contexto de autenticação e useNavigate() para redirecionamento
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  // Validação do email com regex (aceita letras, números e caracteres . _ - antes do @)
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Validação da password (mínimo 6 caracteres, 1 maiúscula, 1 número, 1 caractere especial)
  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;
    return passwordRegex.test(password);
  };

  // Funçao para manipular de alteração dos inputs com validação em tempo real
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validação em tempo real para cada campo
    switch (name) {
      case "firstName":
        if (!value) {
          setErrors((prev) => ({ ...prev, firstName: "O nome é obrigatório" }));
        } else {
          setErrors((prev) => ({ ...prev, firstName: null }));
        }
        break;

      case "lastName":
        if (!value) {
          setErrors((prev) => ({
            ...prev,
            lastName: "O apelido é obrigatório",
          }));
        } else {
          setErrors((prev) => ({ ...prev, lastName: null }));
        }
        break;

      case "email":
        if (!value) {
          setErrors((prev) => ({ ...prev, email: "O email é obrigatório" }));
        } else if (!validateEmail(value)) {
          setErrors((prev) => ({
            ...prev,
            email:
              "Email inválido. Use apenas letras e os caracteres especiais . _ -",
          }));
        } else {
          setErrors((prev) => ({ ...prev, email: null }));
        }
        break;

      case "password":
        if (!value) {
          setErrors((prev) => ({
            ...prev,
            password: "A password é obrigatória",
          }));
        } else if (!validatePassword(value)) {
          setErrors((prev) => ({
            ...prev,
            password:
              "A password deve ter pelo menos 6 caracteres, 1 maiúscula, 1 número e 1 caractere especial",
          }));
        } else {
          setErrors((prev) => ({ ...prev, password: null }));
        }

        // validaçao para verificar a confirmação da password
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: "As passwords não coincidem",
          }));
        } else if (formData.confirmPassword) {
          setErrors((prev) => ({ ...prev, confirmPassword: null }));
        }
        break;

      case "confirmPassword":
        if (!value) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: "A confirmação da password é obrigatória",
          }));
        } else if (value !== formData.password) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: "As passwords não coincidem",
          }));
        } else {
          setErrors((prev) => ({ ...prev, confirmPassword: null }));
        }
        break;

      default:
        break;
    }
  };

  // funçao para a submissão do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpar mensagens anteriores
    setApiError(null);
    setApiSuccess(null);

    // Valida todos os campos
    const newErrors = {};

    if (!formData.firstName) {
      newErrors.firstName = "O nome é obrigatório";
      firstNameRef.current.focus();
    }

    if (!formData.lastName) {
      newErrors.lastName = "O apelido é obrigatório";
      lastNameRef.current.focus();
    }

    if (!formData.email) {
      newErrors.email = "O email é obrigatório";
      emailRef.current.focus();
    } else if (!validateEmail(formData.email)) {
      newErrors.email =
        "Email inválido. Use apenas letras e os caracteres especiais . _ -";
      emailRef.current.focus();
    }

    if (!formData.password) {
      newErrors.password = "A password é obrigatória";
      passwordRef.current.focus();
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        "A password deve ter pelo menos 6 caracteres, 1 maiúscula, 1 número e 1 caractere especial";
      passwordRef.current.focus();
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "A confirmação da password é obrigatória";
      confirmPasswordRef.current.focus();
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "As passwords não coincidem";
      confirmPasswordRef.current.focus();
    }

    // Se houver erros e os dados estiverem invalidos, o formulário não é submetido
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submeter formulário com dados validados
    try {
      setIsSubmitting(true);
      const response = await register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
      );

      if (response.success) {
        setApiSuccess(
          "Registo efetuado com sucesso! Pode agora iniciar sessão.",
        );
        // Redirecionar para a pagina loginPage.jsx após registo bem-sucedido
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setApiError(
          response.message ||
            "Erro ao efetuar registo. Verifique os dados introduzidos.",
        );
      }
    } catch (error) {
      setApiError(
        "Erro ao comunicar com o servidor. Tente novamente mais tarde.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RegisterContainer className="register-page-container">
      <PageTitle className="register-page-title">Criar Conta</PageTitle>

      {/* Mensagens de feedback do backend */}
      {apiError && <Message type="danger">{apiError}</Message>}
      {apiSuccess && <Message type="success">{apiSuccess}</Message>}

      {/* Formulário de registo */}
      <Form onSubmit={handleSubmit} noValidate className="register-form">
        <Row className="register-form-row">
          <Col md={6} className="register-form-col">
            {/* Input para o nome */}
            <FormGroup className="register-form-group mb-3">
              <FormLabel htmlFor="firstName" className="register-form-label">
                Nome
              </FormLabel>
              <FormControl
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Introduza o seu nome"
                value={formData.firstName}
                onChange={handleChange}
                isInvalid={!!errors.firstName}
                ref={firstNameRef}
                className="register-form-control form-control"
              />
              {/* erros container para o nome */}
              {errors.firstName && (
                <Form.Control.Feedback
                  type="invalid"
                  className="register-form-feedback invalid-feedback"
                >
                  {errors.firstName}
                </Form.Control.Feedback>
              )}
            </FormGroup>
          </Col>

          <Col md={6} className="register-form-col">
            {/* Input para o last name */}
            <FormGroup className="register-form-group mb-3">
              <FormLabel htmlFor="lastName" className="register-form-label">
                Apelido
              </FormLabel>
              <FormControl
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Introduza o seu apelido"
                value={formData.lastName}
                onChange={handleChange}
                isInvalid={!!errors.lastName}
                ref={lastNameRef}
                className="register-form-control form-control"
              />
              {/* erros container para lastname */}
              {errors.lastName && (
                <Form.Control.Feedback
                  type="invalid"
                  className="register-form-feedback invalid-feedback"
                >
                  {errors.lastName}
                </Form.Control.Feedback>
              )}
            </FormGroup>
          </Col>
        </Row>

        {/* Input para o email */}
        <FormGroup className="register-form-group mb-3">
          <FormLabel htmlFor="email" className="register-form-label">
            Email
          </FormLabel>
          <FormControl
            type="email"
            id="email"
            name="email"
            placeholder="Introduza o seu email"
            value={formData.email}
            onChange={handleChange}
            isInvalid={!!errors.email}
            ref={emailRef}
            className="register-form-control form-control"
          />
          {/* erros container para o email */}
          {errors.email && (
            <Form.Control.Feedback
              type="invalid"
              className="register-form-feedback invalid-feedback"
            >
              {errors.email}
            </Form.Control.Feedback>
          )}
        </FormGroup>

        {/* Input para a password */}
        <FormGroup className="register-form-group mb-3">
          <FormLabel htmlFor="password" className="register-form-label">
            Password
          </FormLabel>
          <FormControl
            type="password"
            id="password"
            name="password"
            placeholder="Introduza a sua password"
            value={formData.password}
            onChange={handleChange}
            isInvalid={!!errors.password}
            ref={passwordRef}
            className="register-form-control form-control"
          />
          {/* erros container para a password */}
          {errors.password && (
            <Form.Control.Feedback
              type="invalid"
              className="register-form-feedback invalid-feedback"
            >
              {errors.password}
            </Form.Control.Feedback>
          )}
        </FormGroup>

        {/* Input para a confirmação da password */}
        <FormGroup className="register-form-group mb-3">
          <FormLabel htmlFor="confirmPassword" className="register-form-label">
            Confirmar Password
          </FormLabel>
          <FormControl
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirme a sua password"
            value={formData.confirmPassword}
            onChange={handleChange}
            isInvalid={!!errors.confirmPassword}
            ref={confirmPasswordRef}
            className="register-form-control form-control"
          />
          {/* erros container para a confirmação da password */}
          {errors.confirmPassword && (
            <Form.Control.Feedback
              type="invalid"
              className="register-form-feedback invalid-feedback"
            >
              {errors.confirmPassword}
            </Form.Control.Feedback>
          )}
        </FormGroup>

        {/* Nota estatica para o utilizador sobre a password */}
        <div
          className="register-password-note"
          style={{
            fontSize: "0.8rem",
            marginBottom: "0.3rem",
          }}
        >
          Minimo menos 6 caract. 1 maiús. 1 num. e 1 caract. especial. especial
        </div>

        {/* Botão de submissão do formulário */}
        <SubmitContainer className="register-submit-container">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="register-submit-button"
          >
            {isSubmitting ? <Spinner /> : "Registar"}
          </Button>
        </SubmitContainer>
      </Form>
    </RegisterContainer>
  );
};

export default RegisterPage;
