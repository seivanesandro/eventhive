import React from "react";
import styled, { keyframes } from "styled-components";
import { devices } from "../../assets/utils/constantes";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const Scale = keyframes`
    0% {
    transform: scale(0);
  }

  100% {
    transform: scale(1);
  }
`;

const ResponsiveTitle = styled.h2`
  margin-bottom: 0.8rem;
  color: var(--primary-color);
  font-size: 1.8rem;
  font-weight: 700;
  @media only screen and (${devices.tablet}) {
    font-size: 1.6rem;
  }
  @media only screen and (${devices.mobileG}) {
    font-size: 1.4rem;
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  background: var(--white-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  margin-bottom: 2rem;
  overflow: hidden;
  min-height: 220px;
  position: relative;
  animation: ${Scale} 1.2s ease-out;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }

  /* Desde fourk até tablet, manter a informação à direita e imagem à esquerda */
  @media only screen and (${devices.fourk}) {
    flex-direction: row;
  }

  @media only screen and (${devices.portatilL}) {
    flex-direction: row;
  }

  @media only screen and (${devices.portatil}) {
    flex-direction: row;
  }

  @media only screen and (${devices.portatilS}) {
    flex-direction: row;
  }

  /* A partir do tablet, mudar para layout vertical com imagem em cima */
  @media only screen and (${devices.tablet}) {
    flex-direction: column-reverse;
    min-height: 400px;
    background: var(--secondary-color);
    color: var(--white-color);
  }

  @media only screen and (${devices.iphone14}) {
    flex-direction: column-reverse;
    background: var(--secondary-color);
    color: var(--white-color);
  }

  @media only screen and (${devices.mobileG}) {
    flex-direction: column-reverse;
    background: var(--secondary-color);
    color: var(--white-color);
  }
`;

const ImageContainer = styled.div`
  flex: 1;
  min-height: 220px;
  background: ${({ $imageurl }) =>
    $imageurl
      ? `url(${$imageurl}) center/cover no-repeat`
      : "var(--background-color)"};
  position: relative;

  @media only screen and (${devices.tablet}) {
    min-height: 200px;
    width: 100%;
    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.4);
    }
  }
`;

const InfoContainer = styled.div`
  flex: 2;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media only screen and (${devices.tablet}) {
    padding: 1.2rem;
    color: var(--white-color);

    p,
    span {
      color: var(--white-color);
    }
  }
`;

const EventDescription = styled.p`
  margin-bottom: 1rem;
  color: var(--text-color);
  font-size: 1rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;

  @media only screen and (${devices.tablet}) {
    -webkit-line-clamp: 2;
  }
`;

const EventDate = styled.h3`
  color: var(--primary-color);
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const EventLocation = styled.p`
  font-size: 0.9rem;
  margin-bottom: 1rem;
  color: var(--text-color);
`;

const ViewDetailsButton = styled(Link)`
  display: inline-block;
  padding: 0.7rem 1.5rem;
  background-color: var(--primary-color);
  color: var(--white-color);
  text-decoration: none;
  font-weight: 600;
  border-radius: var(--border-radius);
  transition: all 0.3s;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: var(--accent-color);
    transform: translateY(-2px);
  }
`;

const EventCard = (props) => {

  // Destruturação das props ou uso de valores padrão
  const event = props.event || {};

  // Usar token se existir, senão usar token simples como fallback
  const eventToken = event.token || btoa(event.id_event || "0");
  // Destruturação das props ou uso de valores padrão
  const title = props.title || event.title;

  // Destruturação das props ou uso de valores padrão
  const description = props.description || event.description;

  // Destruturação das props ou uso de valores padrão
  const event_date = props.event_date || event.event_date;

  // Destruturação das props ou uso de valores padrão
  const location = props.location || event.location;

  // Verifica se image_url foi passado como prop, caso contrário usa o do evento
  let image_url = props.image_url || event.image_url;

  //  Se image_url existe e não começa com http, prefixar com http://localhost
  if (image_url && !/^https?:\/\//i.test(image_url)) {
    image_url = `http://localhost${image_url}`;
  }

  // Formatar a data para exibição
  const formattedDate = new Date(event_date).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // URL de fallback para imagens que não carregam
  const fallbackImageUrl =
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80";

  // Verificar se a imagem contém "maratona" no URL e substituir com a alternativa
  const imageUrlToUse =
    image_url && image_url.toLowerCase().includes("maratona")
      ? "https://images.unsplash.com/photo-1594882645126-14020914d58d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1185&q=80"
      : image_url || fallbackImageUrl;

  return (
    <>
      <CardContainer>
        <ImageContainer $imageurl={imageUrlToUse} />
        <InfoContainer>
          <div>
            <ResponsiveTitle>{title}</ResponsiveTitle>
            <EventDescription>{description}</EventDescription>
            <EventDate>{formattedDate}</EventDate>
            <EventLocation>{location}</EventLocation>
          </div>
          {/* Botão desativado se o evento estiver terminado */}
          {props.buttonText === "Evento Terminado" ? (
            <ViewDetailsButton
              as="span"
              style={{
                background: "#ccc",
                color: "#fff",
                cursor: "not-allowed",
                pointerEvents: "none",
                opacity: 0.7,
              }}
              tabIndex={-1}
              aria-disabled="true"
            >
              Evento Terminado
            </ViewDetailsButton>
          ) : (
            // Usar token seguro na URL do botão de detalhes com encoding correto
            <ViewDetailsButton to={`/event/${encodeURIComponent(eventToken)}`}>
              Ver Detalhes
            </ViewDetailsButton>
          )}
        </InfoContainer>
      </CardContainer>
    </>
  );
};

// PropTypes para validação das props recebidas
EventCard.propTypes = {
  event: PropTypes.shape({
    id_event: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    token: PropTypes.string.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    event_date: PropTypes.string,
    location: PropTypes.string,
    image_url: PropTypes.string,
  }),
};

export default EventCard;
