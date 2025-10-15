import React, { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import CartContext from "../../context/CartContext";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { FaUserCircle, FaShoppingCart, FaSignOutAlt } from "react-icons/fa";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Badge from "react-bootstrap/Badge";
import Button from "../UI/Button";
import logo from "../../assets/images/logo-nobg1.png";
import { devices } from "../../assets/utils/constantes";

// Componente de react-bootstrap  - Navbar responsivo

const StyledNavbar = styled(Navbar)`
  .navbar-toggler {
    margin: 0 0.3rem 0 0;
    padding: 0.2rem 0.5rem;
    box-shadow: none;
  }
  .navbar-toggler > span,
  .navbar-toggler-icon,
  .navbar-toggler > .navbar-toggler-icon {
    margin: 0 !important;
    vertical-align: middle;
  }
  background-color: var(--white-color) !important;
  box-shadow: var(--box-shadow);

  .navbar-brand {
    color: var(--primary-color) !important;
    font-weight: 700;
    font-family: "Montserrat", sans-serif;
  }

  .nav-link {
    color: var(--text-color) !important;
    font-weight: 500;
    position: relative;
    font-family: "Montserrat", sans-serif;

    &:hover,
    &.active {
      color: var(--primary-color) !important;
    }

    &::after {
      content: "";
      position: absolute;
      width: 0;
      height: 2px;
      bottom: 0;
      left: 0;
      background-color: var(--primary-color);
      transition: width 0.3s ease;
    }

    &:hover::after,
    &.active::after {
      width: 100%;
    }
  }

  @media only screen and (${devices.tablet}) {
    .navbar-collapse {
      margin-top: 1rem;
    }
  }
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  svg {
    font-size: 1.2rem;
    color: var(--text-color);
    cursor: pointer;
    transition: color 0.3s ease;
    font-family: "Montserrat", sans-serif;

    &:hover {
      color: var(--primary-color);
    }
  }
`;

const CartBadge = styled(Badge)`
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--primary-color);
  font-size: 0.6rem;
  font-family: "Montserrat", sans-serif;
`;

const NavButton = styled(Button)`
  margin: 0 0.3rem;
  padding: 0.5rem 1.2rem;
  font-size: 0.9rem;
`;

const AppNavbar = () => {
  // Obter estado de autenticação do contexto
  const { isAuthenticated, logout } = useContext(AuthContext);

  // Obter itens do carrinho do contexto
  const { cartItems } = useContext(CartContext);

  // Obter a localização atual
  const location = useLocation();

  // Função para manipular o logout
  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  // Quantidade total de itens no carrinho
  const cartItemCount =
    cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  // Visualização do menu principal
  return (
    <>
      <StyledNavbar expand="md" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img
              src={logo}
              alt="logo"
              style={{ width: "60px", height: "60px" }}
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarScroll" />
          <Navbar.Collapse id="navbarScroll">
            <Nav className="me-auto my-2 my-md-0">
              <Nav.Link
                as={Link}
                to="/"
                className={location.pathname === "/" ? "active" : ""}
              >
                Home
              </Nav.Link>
              <Nav.Link
                as={Link}
                to="/events"
                className={location.pathname === "/events" ? "active" : ""}
              >
                Eventos
              </Nav.Link>
            </Nav>

            {/* Ações do utilizador */}
            <UserActions>
              {isAuthenticated && (
                <div className="position-relative">
                  <Link to="/cart">
                    <FaShoppingCart title="Carrinho" />
                    {cartItemCount > 0 && (
                      <CartBadge pill>{cartItemCount}</CartBadge>
                    )}
                  </Link>
                </div>
              )}

              {/* Link para o perfil do utilizador */}
              {isAuthenticated ? (
                <div className="d-flex align-items-center">
                  <Link to="/profile" className="me-3">
                    <FaUserCircle title="Perfil" size={20} />
                  </Link>
                  {/* Removido o link para Admin - agora só existe no perfil */}
                  <Link to="#" onClick={handleLogout} title="Terminar Sessão">
                    <FaSignOutAlt size={18} />
                  </Link>
                </div>
              ) : (
                <div className="d-flex">
                  <NavButton as={Link} to="/login" className="me-2" size="sm">
                    Login
                  </NavButton>
                  <NavButton as={Link} to="/register" size="sm">
                    Registar
                  </NavButton>
                </div>
              )}
            </UserActions>
          </Navbar.Collapse>
        </Container>
      </StyledNavbar>
    </>
  );
};

AppNavbar.propTypes = {};

export default AppNavbar;
