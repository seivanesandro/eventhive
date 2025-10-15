import styled, { keyframes } from "styled-components";
// Componente Spinner reutilizavel

// Animação do spinner
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

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

// Styled-component para spinner
const StyledSpinner = styled.div`
  display: inline-block;
  width: 3rem;
  height: 3rem;
  border: 5px dotted var(--primary-color);
  border-top: 4px solid transparent;
  border-radius: 50%;
  animation:
    ${spin} 1s linear infinite,
    ${Show} 1.2s ease-out;
  margin: 1rem auto;
`;

const Spinner = () => {
  // Visualização do spinner estilizado globalmente
  return <StyledSpinner className="spinner-component" />;
};

export default Spinner;
