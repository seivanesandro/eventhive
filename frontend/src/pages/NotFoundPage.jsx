import styled, { keyframes } from "styled-components";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import Button from "../components/UI/Button";
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

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
`;

// Styled-component para o container da página 404
const NotFoundContainer = styled.div`
  max-width: 800px;
  margin: 5rem auto;
  padding: 3rem;
  background: var(--white-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  text-align: center;
  animation: ${ScaleAndSmooth} 1.2s ease-out;

  @media only screen and (${devices.mobile}) {
    margin: 2rem auto;
    padding: 1.5rem;
  }
`;

const ErrorTitle = styled.h1`
  font-size: 8rem;
  font-weight: 900;
  color: var(--primary-color);
  margin-bottom: 1rem;
  animation: ${bounce} 2s ease infinite;

  @media only screen and (${devices.tablet}) {
    font-size: 6rem;
  }

  @media only screen and (${devices.mobile}) {
    font-size: 4rem;
  }
`;

const ErrorSubtitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: var(--secondary-color);
  margin-bottom: 2rem;

  @media only screen and (${devices.tablet}) {
    font-size: 1.5rem;
  }
`;

const ErrorMessage = styled.p`
  font-size: 1.2rem;
  color: var(--text-color);
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  @media only screen and (${devices.mobile}) {
    font-size: 1rem;
  }
`;

const IllustrationContainer = styled.div`
  margin: 2rem 0;

  img {
    max-width: 100%;
    height: auto;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;

  @media only screen and (${devices.mobile}) {
    flex-direction: column;
    align-items: center;
  }
`;

const NotFoundPage = () => {
  return (
    <>
      <Container className="NotFoundPage">
        <NotFoundContainer>
          <ErrorTitle>404</ErrorTitle>
          <ErrorSubtitle>Página Não Encontrada</ErrorSubtitle>

          {/* Mensagem de erro */}
          <ErrorMessage>
            Ops! Parece que tentou acessar uma página que não existe ou foi
            removida.
          </ErrorMessage>

          {/* Ilustração de erro 404 */}
          <IllustrationContainer>
            <img
              src="/images/404-illustration.svg"
              alt="Ilustração de erro 404"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://via.placeholder.com/400x200?text=Evento+Não+Encontrado";
              }}
            />
          </IllustrationContainer>

          {/* mensagem de erro */}
          <ErrorMessage>
            Não se preocupe! Você pode voltar para a página inicial ou explorar
            outros eventos disponíveis.
          </ErrorMessage>

          {/* Botões de navegação */}
          <ButtonsContainer>
            <Link to="/">
              <Button>Voltar para a Página Inicial</Button>
            </Link>
            <Link to="/events">
              <Button outline>Explorar Eventos</Button>
            </Link>
          </ButtonsContainer>
        </NotFoundContainer>
      </Container>
    </>
  );
};

export default NotFoundPage;
