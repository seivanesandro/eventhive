import { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Form, FormGroup, FormLabel, FormControl } from "react-bootstrap";
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

// Styled-component para o container da página de login
const LoginContainer = styled.div`
  max-width: 450px;
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

const LoginPage = () => {
  // useState() para os dados do formulário e validação
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // useState() para controlo dos estados de erros, loading e mensagens
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [apiSuccess, setApiSuccess] = useState(null);

  // useRef() para os inputs com focus em caso de erro
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  //  useContext() para obter a função de login do contexto de autenticação e useNavigate() para redirecionamento
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Validação para email com regex (aceita apenas caracteres . _ - e não números)
  // Validação do email com regex (aceita letras, números e caracteres . _ - antes do @)
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Validação para a password (mínimo 6 caracteres, 1 maiúscula, 1 número, 1 caractere especial)
  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/;
    return passwordRegex.test(password);
  };

  // funçao para manipular mudanças de input para atualizar o estado e validar em tempo real
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validação do email
    if (name === "email") {
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
    }

    // Validação da password
    if (name === "password") {
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
    }
  };

  // Funçao para a submissão do formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpar mensagens anteriores
    setApiError(null);
    setApiSuccess(null);

    // Validar todos os campos
    const newErrors = {};

    // se o email estiver vazio ou invalido, adicionar erros com focus
    if (!formData.email) {
      newErrors.email = "O email é obrigatório";
      emailRef.current.focus();
    } else if (!validateEmail(formData.email)) {
      newErrors.email =
        "Email inválido. Use apenas letras e os caracteres especiais . _ -";
      emailRef.current.focus();
    }

    // se a password estiver vazia ou invalida, adicionar erros com focus
    if (!formData.password) {
      newErrors.password = "A password é obrigatória";
      passwordRef.current.focus();
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        "A password deve ter pelo menos 6 caracteres, 1 maiúscula, 1 número e 1 caractere especial";
      passwordRef.current.focus();
    }

    // Se houver erros, não submeter
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submeter os dados do formulário
    try {
      setIsSubmitting(true);
      const response = await login(formData.email, formData.password);

      if (response.success) {
        setApiSuccess("Login efetuado com sucesso! A redirecionar...");
        // Redirecionar após login bem-sucedido para o home page
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setApiError(
          response.message ||
            "Erro ao efetuar login. Verifique as suas credenciais.",
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
    <LoginContainer className="login-page-container">
      <PageTitle className="login-page-title">Iniciar Sessão</PageTitle>

      {/* messagens de erro do backend*/}
      {apiError && <Message type="danger">{apiError}</Message>}
      {apiSuccess && <Message type="success">{apiSuccess}</Message>}

      <Form onSubmit={handleSubmit} noValidate className="login-form">
        {/* inputa email */}
        <FormGroup className="login-form-group form-group mb-3">
          <FormLabel htmlFor="email" className="login-form-label">
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
            className="login-form-control form-control"
          />
          {errors.email && (
            <Form.Control.Feedback
              type="invalid"
              className="login-form-feedback invalid-feedback"
            >
              {errors.email}
            </Form.Control.Feedback>
          )}
        </FormGroup>

        {/* inputa password */}
        <FormGroup className="login-form-group form-group mb-3">
          <FormLabel htmlFor="password" className="login-form-label">
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
            className="login-form-control form-control"
          />
          {errors.password && (
            <Form.Control.Feedback type="invalid">
              {errors.password}
            </Form.Control.Feedback>
          )}
        </FormGroup>

        <SubmitContainer className="d-flex justify-content-center mt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner /> : "Entrar"}
          </Button>
        </SubmitContainer>
      </Form>
    </LoginContainer>
  );
};

export default LoginPage;
