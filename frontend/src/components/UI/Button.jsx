import PropTypes from "prop-types";
import styled from "styled-components";

// COmponente Butao reutilizável

const StyledButton = styled.button`
  font-family: "Montserrat", sans-serif;
  font-size: 1rem;
  padding: 0.8rem 1.5rem;
  border-radius: var(--border-radius);
  border: none;
  box-shadow: var(--box-shadow);
  cursor: pointer;
  transition: opacity 0.2s;
  margin: 0.5rem;
  &:hover {
    opacity: 0.8;
  }
  /* Só NÃO aplica cor primária se tiver variante Bootstrap (btn-primary, btn-danger, btn-success, btn-warning, btn-info, btn-secondary, btn-dark, btn-light) */
  ${(props) =>
    props.className &&
    /(btn-primary|btn-danger|btn-success|btn-warning|btn-info|btn-secondary|btn-dark|btn-light)/.test(
      props.className,
    )
      ? ""
      : `
    background: var(--primary-color) !important;
    color: var(--white-color) !important;
    border: none !important;
  `}
`;

const Button = (props) => {
  // Permite passar classes Bootstrap e customizadas
  const { className = "", children, ...rest } = props;
  return (
    <StyledButton {...rest} className={className}>
      {children}
    </StyledButton>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  style: PropTypes.object,
};

export default Button;
