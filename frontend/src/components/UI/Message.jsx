import PropTypes from "prop-types";
import styled, { keyframes } from "styled-components";

// Componente mensagem de feedback e reutilizável para erro e sucesso

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

const MessageContainer = styled.div`
  font-family: "Montserrat", sans-serif;
  font-size: 1rem;
  padding: 1rem 1.5rem;
  border-radius: var(--border-radius);
  margin: 1rem auto;
  width: 100%;
  max-width: 600px;
  color: ${({ type }) =>
    type === "success" ? "#155724" : type === "danger" ? "#721c24" : "#0c5460"};
  background: ${({ type }) =>
    type === "success" ? "#d4edda" : type === "danger" ? "#f8d7da" : "#d1ecf1"};
  border: 1px solid
    ${({ type }) =>
      type === "success"
        ? "#c3e6cb"
        : type === "danger"
          ? "#f5c6cb"
          : "#bee5eb"};
  animation: ${Show} 1.2s ease-out;
`;

const Message = ({ children, type }) => {
  // Visualização da mensagem  com style global
  return (
    <MessageContainer
      type={type}
      className={`message-component message-${type} text-center`}
    >
      {children}
    </MessageContainer>
  );
};

Message.propTypes = {
  children: PropTypes.node,
  type: PropTypes.oneOf(["success", "danger", "info"]),
};

export default Message;
